<?php

namespace App\Http\Controllers;

use App\Models\Product\Brand;
use Illuminate\Http\Request;
use Inertia\Inertia;

class BrandController extends Controller
{
    public function index()
    {
        $brands = Brand::withCount('products')
            ->orderBy('brand_name')
            ->paginate(10);
            
        return Inertia::render('brands', [
            'brands' => $brands
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'brand_name' => 'required|string|max:255|unique:brands,brand_name',
            'description' => 'nullable|string'
        ]);

        Brand::create($validated);

        return redirect()->back()->with('success', 'Brand created successfully.');
    }

    public function update(Request $request, Brand $brand)
    {
        $validated = $request->validate([
            'brand_name' => 'required|string|max:255|unique:brands,brand_name,' . $brand->brand_id . ',brand_id',
            'description' => 'nullable|string'
        ]);

        $brand->update($validated);

        return redirect()->back()->with('success', 'Brand updated successfully.');
    }

    public function destroy(Brand $brand)
    {
        if ($brand->products()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete brand with associated products.');
        }

        $brand->delete();
        return redirect()->back()->with('success', 'Brand deleted successfully.');
    }
}