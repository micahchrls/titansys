<?php

namespace App\Console\Commands;

use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\File;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Config;

class DatabaseBackup extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'app:database-backup {--keep=30 : Number of days to keep backups}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Create a compressed backup of the Postgres database';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting database backup...');
        
        try {
            // Ensure backup directory exists
            $backupDir = 'database-backup';
            if (!Storage::exists($backupDir)) {
                Storage::makeDirectory($backupDir);
                $this->info('Created backup directory: ' . $backupDir);
            }
            
            // Set backup filename and path
            $filename = now()->format('Y-m-d-H-i-s') . '.sql.gz';
            $backupPath = Storage::path($backupDir . '/' . $filename);
            
            // Get database configuration
            $host = Config::get('database.connections.pgsql.host');
            $port = Config::get('database.connections.pgsql.port');
            $database = Config::get('database.connections.pgsql.database');
            $username = Config::get('database.connections.pgsql.username');
            $password = Config::get('database.connections.pgsql.password');
            
            // Build the pg_dump command for Windows
            if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
                $command = sprintf(
                    'SET PGPASSWORD=%s && pg_dump -h %s -p %s -U %s -d %s -F p | gzip > %s',
                    escapeshellarg($password),
                    escapeshellarg($host),
                    escapeshellarg($port),
                    escapeshellarg($username),
                    escapeshellarg($database),
                    escapeshellarg($backupPath)
                );
            } else {
                // For non-Windows environments
                // Create temporary file for password
                $tempEnv = tempnam(sys_get_temp_dir(), 'pg_backup');
                file_put_contents($tempEnv, 'PGPASSWORD=' . $password);
                
                $command = sprintf(
                    'set -o allexport && source %s && set +o allexport && pg_dump -h %s -p %s -U %s -d %s -F p | gzip > %s',
                    $tempEnv,
                    escapeshellarg($host),
                    escapeshellarg($port),
                    escapeshellarg($username),
                    escapeshellarg($database),
                    escapeshellarg($backupPath)
                );
                
                // Cleanup temp file after use
                if (file_exists($tempEnv)) {
                    unlink($tempEnv);
                }
            }
            
            $this->info('Executing backup command...');
            $output = [];
            $returnVar = null;
            exec($command . ' 2>&1', $output, $returnVar);
            
            // Check for PostgreSQL errors in the output first
            $errorPattern = '/(pg_dump:.*error|FATAL|ERROR|failed|authentication)/i';
            $errorMessages = [];
            
            foreach ($output as $line) {
                $this->line($line); // Output each line for visibility
                if (preg_match($errorPattern, $line)) {
                    $errorMessages[] = $line;
                }
            }
            
            // If we found any error messages, throw an exception
            if (!empty($errorMessages)) {
                throw new \Exception('Database backup failed: ' . implode("\n", $errorMessages));
            }
            
            // Also check return code as a fallback
            if ($returnVar !== 0) {
                throw new \Exception('Database backup failed with return code: ' . $returnVar);
            }
            
            // Check if the file was created successfully
            if (!file_exists($backupPath) || filesize($backupPath) == 0) {
                throw new \Exception('Backup file was not created or is empty');
            }
            
            $this->info('Database backup completed successfully: ' . $filename);
            $this->info('Backup size: ' . $this->formatBytes(filesize($backupPath)));
            
            // Clean up old backups
            $this->cleanOldBackups((int)$this->option('keep'));
            
            return Command::SUCCESS;
            
        } catch (\Exception $e) {
            $this->error('Database backup failed: ' . $e->getMessage());
            Log::error('Database backup failed: ' . $e->getMessage());
            
            return Command::FAILURE;
        }
    }
    
    /**
     * Clean up old backups based on retention days
     *
     * @param int $days
     * @return void
     */
    protected function cleanOldBackups(int $days): void
    {
        if ($days <= 0) {
            return;
        }
        
        $this->info('Cleaning up backups older than ' . $days . ' days');
        
        $cutoffDate = now()->subDays($days);
        $backupDir = 'database-backup';
        $files = Storage::files($backupDir);
        $deletedCount = 0;
        
        foreach ($files as $file) {
            // Extract date from filename (format: Y-m-d-H-i-s.sql.gz)
            preg_match('/(\d{4}-\d{2}-\d{2})-\d{2}-\d{2}-\d{2}\.sql\.gz$/', $file, $matches);
            
            if (isset($matches[1])) {
                $fileDate = \Carbon\Carbon::createFromFormat('Y-m-d', $matches[1]);
                
                if ($fileDate->lt($cutoffDate)) {
                    Storage::delete($file);
                    $deletedCount++;
                }
            }
        }
        
        if ($deletedCount > 0) {
            $this->info("Deleted {$deletedCount} old backup files");
        } else {
            $this->info('No old backup files to delete');
        }
    }
    
    /**
     * Format bytes to human-readable format
     *
     * @param int $bytes
     * @param int $precision
     * @return string
     */
    protected function formatBytes($bytes, $precision = 2): string
    {
        $units = ['B', 'KB', 'MB', 'GB', 'TB'];
        
        $bytes = max($bytes, 0);
        $pow = floor(($bytes ? log($bytes) : 0) / log(1024));
        $pow = min($pow, count($units) - 1);
        
        $bytes /= (1 << (10 * $pow));
        
        return round($bytes, $precision) . ' ' . $units[$pow];
    }
}