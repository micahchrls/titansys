<?php

namespace App\Http\Controllers;

use App\Models\Product\ProductBrand;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductBrandController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            if (auth()->check()) {
                $brands = ProductBrand::all();
                return Inertia::render('Products/Brands/Index', [
                    'brands' => $brands,
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Error fetching product brands: ' . $e->getMessage());
            return response()->json(['error' => 'An error occurred while fetching product brands'], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     */
    public function show(ProductBrand $productBrand)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ProductBrand $productBrand)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProductBrand $productBrand)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductBrand $productBrand)
    {
        //
    }
}
