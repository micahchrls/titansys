<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        User::create([
            'first_name' => 'John',
            'last_name'=> 'Doe',
            'username' => 'johndoe',
            'email' => 'jd@example.com',
            'password' => Hash::make('password'),
            'role' => 'admin'
        ]);
    }
}
