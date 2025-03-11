<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Product\ProductBrandController;
use App\Http\Controllers\Product\ProductCategoryController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\InventoryController;



Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', function () {
        return Inertia::render('dashboard');
    })->name('dashboard');

    Route::get('sales', function () {
        return Inertia::render('sales');
    })->name('sales');

    Route::get('stores', function () {
        return Inertia::render('stores');
    })->name('stores');

    Route::get('/inventories', [InventoryController::class, 'index'])->name('inventories.index');
    Route::post('/inventories', [InventoryController::class, 'store'])->name('inventories.store');
    Route::delete('/inventories/{inventory}', [InventoryController::class, 'destroy'])->name('inventories.destroy');

    // Supplier routes here
    Route::get('/suppliers', [SupplierController::class, 'index'])->name('suppliers.index');
    Route::post('/suppliers', [SupplierController::class, 'store'])->name('suppliers.store');
    Route::put('/suppliers/{supplier}', [SupplierController::class, 'update'])->name('suppliers.update');
    Route::delete('/suppliers/{supplier}', [SupplierController::class, 'destroy'])->name('suppliers.destroy');
    Route::get('/suppliers/create', [SupplierController::class, 'create'])->name('suppliers.create');
    Route::get('/suppliers/edit/{supplier}', [SupplierController::class, 'edit'])->name('suppliers.edit');

    // Brand routes here
    Route::get('/brands', [ProductBrandController::class, 'index'])->name('brands.index');
    Route::post('/brands', [ProductBrandController::class, 'store'])->name('brands.store');
    Route::put('/brands/{brand}', [ProductBrandController::class, 'update'])->name('brands.update');
    Route::delete('/brands/{brand}', [ProductBrandController::class, 'destroy'])->name('brands.destroy');
    Route::get('/brands/create', [ProductBrandController::class, 'create'])->name('brands.create');
    Route::get('/brands/edit/{brand}', [ProductBrandController::class, 'edit'])->name('brands.edit');

    // Category routes
    Route::get('/categories', [ProductCategoryController::class, 'index'])->name('categories.index');
    Route::post('/categories', [ProductCategoryController::class, 'store'])->name('categories.store');
    Route::put('/categories/{productCategory}', [ProductCategoryController::class, 'update'])->name('categories.update');
    Route::delete('/categories/{productCategory}', [ProductCategoryController::class, 'destroy'])->name('categories.destroy');

    Route::get('/users', [UserController::class, 'index'])->name('users.index');
    Route::post('/users', [UserController::class, 'store'])->name('users.store');
    Route::put('/users/{user}', [UserController::class, 'update'])->name('users.update');
    Route::delete('/users/{user}', [UserController::class, 'destroy'])->name('users.destroy');
    Route::get('/users/create', [UserController::class, 'create'])->name('users.create');
    Route::get('/users/edit/{user}', [UserController::class, 'edit'])->name('users.edit');

});

require __DIR__ . '/settings.php';
require __DIR__ . '/auth.php';
