<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\StoreController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BrandController;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    // Public authenticated routes
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('inventory', function () {
        return Inertia::render('inventory');
    })->name('inventory');

    Route::get('sales', function () {
        return Inertia::render('sales');
    })->name('sales');

    // Admin routes group with prefix
    Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
        // Store Management Routes
        Route::resource('stores', StoreController::class);
        
        // Category Management Routes
        Route::resource('categories', CategoryController::class);
        
        // Brand Management Routes
        Route::resource('brands', BrandController::class);
        
        // User Management Routes
        Route::resource('users', UserController::class);
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
