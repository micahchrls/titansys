<?php

namespace App\Http\Controllers;

use App\Models\Product\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoryController extends Controller
{
    public function index()
    {
        $categories = Category::with('parent')
            ->withCount('products')
            ->orderBy('category_name')
            ->paginate(10);

        $parentCategories = Category::whereNull('parent_category_id')
            ->orderBy('category_name')
            ->get(['category_id', 'category_name']);
            
        return Inertia::render('categories', [
            'categories' => $categories,
            'parentCategories' => $parentCategories
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'category_name' => 'required|string|max:255|unique:categories,category_name',
            'parent_category_id' => 'nullable|exists:categories,category_id'
        ]);

        // Prevent circular references in category hierarchy
        if ($validated['parent_category_id']) {
            $parent = Category::find($validated['parent_category_id']);
            if ($parent && $parent->parent_category_id) {
                return redirect()->back()->with('error', 'Only one level of category nesting is allowed.');
            }
        }

        Category::create($validated);

        return redirect()->back()->with('success', 'Category created successfully.');
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'category_name' => 'required|string|max:255|unique:categories,category_name,' . $category->category_id . ',category_id',
            'parent_category_id' => 'nullable|exists:categories,category_id'
        ]);

        // Prevent setting own child as parent
        if ($validated['parent_category_id'] && 
            $category->children()->pluck('category_id')->contains($validated['parent_category_id'])) {
            return redirect()->back()->with('error', 'Cannot set a child category as parent.');
        }

        // Prevent circular references
        if ($validated['parent_category_id']) {
            $parent = Category::find($validated['parent_category_id']);
            if ($parent && $parent->parent_category_id) {
                return redirect()->back()->with('error', 'Only one level of category nesting is allowed.');
            }
        }

        $category->update($validated);

        return redirect()->back()->with('success', 'Category updated successfully.');
    }

    public function destroy(Category $category)
    {
        // Check for child categories
        if ($category->children()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete category with child categories.');
        }

        // Check for associated products
        if ($category->products()->exists()) {
            return redirect()->back()->with('error', 'Cannot delete category with associated products.');
        }

        $category->delete();
        return redirect()->back()->with('success', 'Category deleted successfully.');
    }
}