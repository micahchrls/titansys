<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('inventory', function () {
        return Inertia::render('inventory');
    })->name('inventory');

    Route::get('sales', function () {
        return Inertia::render('sales');
    })->name('sales');

    Route::get('stores', function () {
        return Inertia::render('stores');
    })->name('stores');
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
