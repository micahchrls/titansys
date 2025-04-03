<?php

use App\Http\Controllers\DashboardController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

use App\Http\Controllers\Product\ProductBrandController;
use App\Http\Controllers\Product\ProductCategoryController;
use App\Http\Controllers\Product\ProductController;
use App\Http\Controllers\SupplierController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\InventoryController;
use App\Http\Controllers\Store\StoreController;
use App\Http\Controllers\Sale\SaleController;

Route::get('/', function () {
    return redirect()->route('login');
})->name('home');

Route::middleware(['auth'])->group(function () {
    // Route::get('dashboard', function () {
    //     return Inertia::render('dashboard');
    // })->name('dashboard');

    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/sales-chart-data', [DashboardController::class, 'getSalesChartDataEndpoint'])->name('dashboard.sales-chart-data');
    Route::get('/dashboard/low-stock-items', [DashboardController::class, 'getLowStockItemsEndpoint'])->name('dashboard.low-stock-items');
    Route::get('/dashboard/recent-sale-transactions', [DashboardController::class, 'getRecentSaleTransactionsEndpoint'])->name('dashboard.recent-sale-transactions');

    Route::get('/sales', [SaleController::class, 'index'])->name('sales.index');
    Route::post('/sales', [SaleController::class, 'store'])->name('sales.store');
    Route::get('/sales/create', [SaleController::class, 'create'])->name('sales.create');
    Route::get('/sales/{sale}', [SaleController::class, 'show'])->name('sales.show');
    Route::put('/sales/{sale}', [SaleController::class, 'update'])->name('sales.update');
    Route::delete('/sales/{sale}', [SaleController::class, 'destroy'])->name('sales.destroy');

    Route::get('/stores', [StoreController::class, 'index'])->name('stores.index');
    Route::post('/stores', [StoreController::class, 'store'])->name('stores.store');
    Route::put('/stores/{store}', [StoreController::class, 'update'])->name('stores.update');
    Route::delete('/stores/{store}', [StoreController::class, 'destroy'])->name('stores.destroy');

    Route::get('/products/create', [ProductController::class, 'create'])->name('products.create');
    Route::get('/products/edit/{product}', [ProductController::class, 'edit'])->name('products.edit');

    Route::get('/inventories', [InventoryController::class, 'index'])->name('inventories.index');
    Route::post('/inventories', [InventoryController::class, 'store'])->name('inventories.store');
    Route::delete('/inventories/{inventory}', [InventoryController::class, 'destroy'])->name('inventories.destroy');
    Route::get('/inventories/{inventory}', [InventoryController::class, 'show'])->name('inventories.show');
    Route::put('/inventories/{inventory}', [InventoryController::class, 'update'])->name('inventories.update');
    Route::post('/inventories/{inventory}/stock-in', [InventoryController::class, 'stockIn'])->name('inventories.stock-in');
    Route::post('/inventories/{inventory}/stock-out', [InventoryController::class, 'stockOut'])->name('inventories.stock-out');

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
