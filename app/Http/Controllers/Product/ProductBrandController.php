<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Models\Product\ProductBrand;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ProductBrandController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = ProductBrand::query();

            if ($request->has('search')) {
                $search = $request->input('search');
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('description', 'like', "%{$search}%");
                });
            }

            $brands = $query->latest()->paginate(10);

            return Inertia::render('brands', [
                'brands' => $brands,
                'filters' => $request->only(['search'])
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching brands: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to fetch brands.');
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string'
            ])->validate();

            ProductBrand::create($validated);

            return redirect()->back();
        } catch (\Exception $e) {
            Log::error('Error creating brand: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Failed to create brand.']);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProductBrand $brand)
    {
        try {
            $validated = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string'
            ])->validate();

            $brand->name = $validated['name'];
            $brand->description = $validated['description'];

            if ($brand->isDirty()) {
                $brand->save();
                return redirect()->back();
            } else {
                return redirect()->back();
            }

        } catch (\Exception $e) {
            Log::error('Error updating brand: ' . $e->getMessage());
            return response()->json(['message' => 'Failed to update brand'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductBrand $brand)
    {
        try {
            $brand->delete();
            return redirect()->back();
        } catch (\Exception $e) {
            Log::error('Error deleting brand: ' . $e->getMessage());
            return redirect()->back()->withErrors(['error' => 'Failed to delete brand.']);
        }
    }
}
