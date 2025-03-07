<?php

namespace App\Http\Controllers;

use App\Http\Resources\InventoryResource;
use App\Models\Inventory;
use App\Models\Product\Product;
use App\Models\Product\ProductCategory;
use App\Models\Product\ProductImage;
use App\Models\StockLog;
use App\Models\StockMovement;
use App\Models\StockTransaction;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class InventoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $query = Inventory::with('product');

            if ($request->has('search')) {
                $search = $request->input('search');
                $query->whereHas('product', function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                        ->orWhere('sku', 'like', "%{$search}%");
                });
            }

            $inventories = $query->latest()->paginate(10);
            $inventories = InventoryResource::collection($inventories)->response()->getData(true);

            Log::info($inventories);
            return Inertia::render('inventories', [
                'inventories' => $inventories,
                'filters' => $request->only(['search'])
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching inventory: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to fetch inventory.');
        }
    }

    /**
     * Generate a unique SKU for a product.
     * 
     * @param string $productName The name of the product
     * @param int $categoryId The category ID of the product
     * @return string The generated SKU
     */
    private function generateSku(string $productName, int $categoryId): string
    {
        // Get category prefix (first 2 letters)
        $category = ProductCategory::find($categoryId);
        $categoryPrefix = substr(strtoupper($category->name), 0, 2);
        
        // Get first 3 letters of product name
        $namePrefix = substr(strtoupper(preg_replace('/[^A-Za-z0-9]/', '', $productName)), 0, 3);
        
        // Get random alphanumeric suffix (4 characters)
        $randomSuffix = strtoupper(substr(md5(uniqid(mt_rand(), true)), 0, 4));
        
        // Combine all parts to create SKU
        $sku = $categoryPrefix . '-' . $namePrefix . '-' . $randomSuffix;
        
        // Check if SKU already exists and regenerate if needed
        if (Product::where('sku', $sku)->exists()) {
            return $this->generateSku($productName, $categoryId);
        }
        
        return $sku;
    }


    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validated = Validator::make($request->all(), [
                'product_name' => 'required|string|max:255',
                'description' => 'nullable|string',
                'price' => 'required|numeric|min:0',
                'size' => 'nullable|string|max:100',
                'product_category_id' => 'required|exists:product_categories,id',
                'product_brand_id' => 'required|exists:product_brands,id',
                'supplier_id' => 'required|exists:suppliers,id',
                'quantity' => 'required|numeric|min:0',
                'reorder_level' => 'required|numeric|min:0',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            ])->validate();

            return \DB::transaction(function () use ($validated, $request) {
                $user = auth()->user();
                $storeId = $request->input('store_id', 1); // Get store ID from request or use default
                
                // Generate SKU and create product
                $sku = $this->generateSku($validated['product_name'], $validated['product_category_id']);
                $product = $this->createProduct($validated, $sku);
                
                // Handle image upload if provided
                if ($request->hasFile('image')) {
                    $this->handleProductImage($product->id, $request->file('image'));
                }
                
                // Create inventory record
                $inventory = $this->createInventory($product->id, $validated);
                
                // Record stock movement and transaction
                $this->recordStockChanges($inventory->id, $user->id, $storeId, $validated['quantity'], $product);
                
                return redirect()->route('inventories.index')->with('success', 'Product added to inventory successfully.');
            });
        } catch (\Exception $e) {
            Log::error('Error creating inventory: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to create inventory: ' . $e->getMessage());
        }
    }
    
    /**
     * Create a new product record
     */
    private function createProduct(array $data, string $sku): Product
    {
        return Product::create([
            'name' => $data['product_name'],
            'sku' => $sku,
            'description' => $data['description'] ?? null,
            'price' => $data['price'],
            'size' => $data['size'] ?? null,
            'product_category_id' => $data['product_category_id'],
            'product_brand_id' => $data['product_brand_id'],
            'supplier_id' => $data['supplier_id'],
        ]);
    }
    
    /**
     * Create a new inventory record
     */
    private function createInventory(int $productId, array $data): Inventory
    {
        return Inventory::create([
            'product_id' => $productId,
            'quantity' => $data['quantity'],
            'reorder_level' => $data['reorder_level'],
            'last_restocked' => now(),
        ]);
    }
    
    /**
     * Record all stock-related changes
     */
    private function recordStockChanges(int $inventoryId, int $userId, int $storeId, int $quantity, Product $product): void
    {
        // Record stock movement
        StockMovement::create([
            'inventory_id' => $inventoryId,
            'quantity' => $quantity,
            'movement_type' => 'in',
        ]);
        
        // Record stock transaction
        StockTransaction::create([
            'store_id' => $storeId,
            'user_id' => $userId,
            'transaction_type' => 'add',
            'transaction_date' => now(),
            'transaction_amount' => $quantity,
        ]);

        // Log the stock action
        StockLog::create([
            'user_id' => $userId,
            'store_id' => $storeId,
            'action_type' => 'add',
            'description' => "Added new product to inventory: {$product->name} (SKU: {$product->sku})",
        ]);
    }

    /**
     * Handle product image upload and creation
     */
    private function handleProductImage(int $productId, $image, bool $isPrimary = true): ProductImage
    {
        return ProductImage::uploadImage($productId, $image, $isPrimary);
    }
    

    /**
     * Display the specified resource.
     */
    public function show(Inventory $inventory)
    {
        try {
            $inventory = InventoryResource::make($inventory)->response()->getData(true);
            return Inertia::render('inventory', [
                'inventory' => $inventory
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching inventory: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to fetch inventory.');
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Inventory $inventory)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Inventory $inventory)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Inventory $inventory)
    {
        //
    }
}
