<?php

use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

/*
|--------------------------------------------------------------------------
| Schedule Commands
|--------------------------------------------------------------------------
|
| Here you can define all of your scheduled tasks for Laravel 12.
| Each task is executed based on the schedule you define.
|
*/

Schedule::command('app:database-backup')
    ->daily()
    ->at('02:00')
    ->description('Create daily PostgreSQL database backup')
    ->appendOutputTo(storage_path('logs/database-backup.log'));
