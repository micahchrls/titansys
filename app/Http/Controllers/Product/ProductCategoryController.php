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
            $parentCategories = [];
            
            // Only load parent categories if we're displaying the create form
            if ($request->has('showCreateForm')) {
                $parentCategories = ProductCategory::whereNull('parent_id')->get();
            }

            return Inertia::render('categories', [
                'categories' => $categories,
                'filters' => request()->only(['search']),
                'parentCategories' => $parentCategories
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching categories: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to fetch categories.');
        }
    }
    
    /**
     * Get all categories for API use (used in dropdowns)
     */
    public function getCategories()
    {
        try {
            $categories = ProductCategory::with('children')->whereNull('parent_id')->get();
            return response()->json($categories);
        } catch (\Exception $e) {
            Log::error('Error fetching categories for API: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to fetch categories'], 500);
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

            // Check for circular references
            if (!empty($validated['parent_id'])) {
                $parentId = $validated['parent_id'];
                $parent = ProductCategory::find($parentId);
                
                // Ensure the parent exists
                if (!$parent) {
                    return redirect()->back()->with('error', 'Parent category not found.');
                }
            }

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
                'description' => 'nullable|string',
                'parent_id' => 'nullable|exists:product_categories,id'
            ])->validate();

            // Check for circular references if parent_id is provided
            if (isset($validated['parent_id']) && $validated['parent_id'] !== null) {
                // Cannot set parent to self
                if ($validated['parent_id'] == $productCategory->id) {
                    return redirect()->back()->with('error', 'A category cannot be its own parent.');
                }
                
                // Cannot set parent to any of its descendants
                $descendantIds = $this->getAllDescendantIds($productCategory->id);
                if (in_array($validated['parent_id'], $descendantIds)) {
                    return redirect()->back()->with('error', 'Cannot set a descendant as parent (circular reference).');
                }
            }

            $productCategory->name = $validated['name'];
            $productCategory->description = $validated['description'];
            
            // Only update parent_id if it's provided in the request
            if (isset($validated['parent_id'])) {
                $productCategory->parent_id = $validated['parent_id'];
            }

            if ($productCategory->isDirty()) {
                $productCategory->save();
            }
            
            return redirect()->back();
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
            // Delete all subcategories recursively
            $this->deleteSubcategories($productCategory);
            
            // Then delete the category itself
            $productCategory->delete();
            return redirect()->back();
        } catch (\Exception $e) {
            Log::error('Error deleting category: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete category.');
        }
    }
    
    /**
     * Recursively delete subcategories
     */
    private function deleteSubcategories(ProductCategory $category)
    {
        // Get all direct children
        $children = ProductCategory::where('parent_id', $category->id)->get();
        
        foreach ($children as $child) {
            // Recursively delete this child's children
            $this->deleteSubcategories($child);
            
            // Delete the child
            $child->delete();
        }
    }
    
    /**
     * Get all descendant IDs for a category
     */
    private function getAllDescendantIds($categoryId)
    {
        $descendantIds = [];
        $children = ProductCategory::where('parent_id', $categoryId)->get();
        
        foreach ($children as $child) {
            $descendantIds[] = $child->id;
            $descendantIds = array_merge($descendantIds, $this->getAllDescendantIds($child->id));
        }
        
        return $descendantIds;
    }
}
