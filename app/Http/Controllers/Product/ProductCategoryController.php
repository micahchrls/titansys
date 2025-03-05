<?php

namespace App\Http\Controllers\Product;

use App\Http\Controllers\Controller;
use App\Models\Product\ProductCategory;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class ProductCategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $search = $request->input('search');
            if ($search) {
                $search = urldecode($search);
            }
            
            // Start with a base query
            $query = ProductCategory::with('children');
            
            if ($search) {
                // If searching, we need to find:
                // 1. Parent categories that match the search
                // 2. Parent categories that have children matching the search
                
                // First, get IDs of all categories matching the search (both parents and children)
                $matchingCategoryIds = ProductCategory::where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%")
                    ->pluck('id')
                    ->toArray();
                
                // Then, get parent IDs of any matching subcategories
                $parentIdsOfMatchingSubcategories = ProductCategory::whereIn('id', $matchingCategoryIds)
                    ->whereNotNull('parent_id')
                    ->pluck('parent_id')
                    ->toArray();
                
                // Combine all IDs that should be included in results
                $allRelevantParentIds = array_merge(
                    // Parent categories that directly match the search
                    ProductCategory::whereIn('id', $matchingCategoryIds)
                        ->whereNull('parent_id')
                        ->pluck('id')
                        ->toArray(),
                    // Parent categories of matching subcategories
                    $parentIdsOfMatchingSubcategories
                );
                
                // Get all these parent categories with their children
                $query->whereIn('id', $allRelevantParentIds);
            } else {
                // If not searching, only get parent categories
                $query->whereNull('parent_id');
            }

            $categories = $query->latest()->paginate(10);

            return Inertia::render('categories', [
                'categories' => $categories,
                'filters' => request()->only(['search'])
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching categories: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to fetch categories.');
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
                'description' => 'nullable|string',
                'parent_id' => 'nullable|exists:product_categories,id'
            ])->validate();

            ProductCategory::create($validated);

            return redirect()->back();
        } catch (\Exception $e) {
            Log::error('Error storing category: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to store category.');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProductCategory $productCategory)
    {
        try {
            $validated = Validator::make($request->all(), [
                'name' => 'required|string|max:255',
                'description' => 'nullable|string'
            ])->validate();

            $productCategory->name = $validated['name'];
            $productCategory->description = $validated['description'];

            if ($productCategory->isDirty()) {
                $productCategory->save();
                return redirect()->back();
            } else {
                return redirect()->back();
            }
        } catch (\Exception $e) {
            Log::error('Error updating category: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to update category.');
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductCategory $productCategory)
    {
        try {
            $productCategory->delete();
            return redirect()->back();
        } catch (\Exception $e) {
            Log::error('Error deleting category: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete category.');
        }
    }
}
