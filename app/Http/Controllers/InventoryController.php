<?php

namespace App\Http\Controllers;

use App\Http\Resources\InventoryResource;
use App\Http\Resources\InventoryShowResource;
use App\Models\Inventory;
use App\Models\Product\Product;
use App\Models\Product\ProductCategory;
use App\Models\Product\ProductBrand;
use App\Models\Product\ProductImage;
use App\Models\Stock\StockLog;
use App\Models\Stock\StockMovement;
use App\Models\Stock\StockTransaction;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use App\Models\Store\Store;

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

            // Get categories, brands, and suppliers for the form
            $categories = ProductCategory::orderBy('name')->get();
            $brands = ProductBrand::orderBy('name')->get();
            $suppliers = Supplier::orderBy('name')->get();
            $stores = Store::orderBy('name')->get();
            
            return Inertia::render('inventories', [
                'inventories' => $inventories,
                'filters' => $request->only(['search']),
                'categories' => $categories,
                'brands' => $brands,
                'suppliers' => $suppliers,
                'stores' => $stores
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
            Log::info('Starting inventory creation process', ['request_data' => $request->all()]);
            
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

            Log::info('Validation passed', ['validated_data' => $validated]);
            
            // Start a database transaction
            DB::beginTransaction();
            Log::info('Transaction started');
            
            try {
                $user = $request->user();
                $storeId = $request->input('store_id', 1); // Get store ID from request or use default
                
                // Generate SKU and create product
                $sku = $this->generateSku($validated['product_name'], $validated['product_category_id']);
                Log::info('Generated SKU', ['sku' => $sku]);
                
                $product = $this->createProduct($validated, $sku);
                Log::info('Product created', ['product_id' => $product->id, 'product' => $product->toArray()]);
                
                // Handle image upload if provided
                if ($request->hasFile('image')) {
                    $productImage = $this->handleProductImage($product->id, $request->file('image'));
                    Log::info('Product image uploaded', ['image_id' => $productImage->id]);
                }
                
                // Create inventory record
                $inventory = $this->createInventory($product->id, $validated);
                Log::info('Inventory created', ['inventory_id' => $inventory->id, 'inventory' => $inventory->toArray()]);
                
                // Record stock movement and transaction
                $this->recordStockChanges($inventory->id, $user->id, $storeId, $validated['quantity'], $product);
                Log::info('Stock changes recorded');
                
                // Commit the transaction
                DB::commit();
                Log::info('Transaction committed successfully');
                
                return redirect()->route('inventories.index')->with('success', 'Product added to inventory successfully.');
            } catch (\Exception $e) {
                // Rollback the transaction if anything fails
                DB::rollBack();
                Log::error('Error in transaction: ' . $e->getMessage(), [
                    'exception' => get_class($e),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }
        } catch (\Exception $e) {
            Log::error('Error creating inventory: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
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
            $inventory = InventoryShowResource::make($inventory)->response()->getData(true);
            return Inertia::render('inventories/show', [
                'inventory' => $inventory,
                'brands' => ProductBrand::orderBy('name')->get(),
                'categories' => ProductCategory::orderBy('name')->get(),
                'suppliers' => Supplier::orderBy('name')->get(),
                'stores' => Store::orderBy('name')->get()
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching inventory: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to fetch inventory.');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Inventory $inventory)
    {
        try {
            Log::info('Update request received', [
                'request_data' => $request->all(),
                'inventory_id' => $inventory->id,
                'inventory' => $inventory->toArray(),
                'method' => $request->method(),
                'url' => $request->url(),
                'headers' => $request->header()
            ]);
            
            $validator = Validator::make($request->all(), [
                'product_name' => 'required|string|max:255',
                'product_sku' => 'required|string|max:100',
                'product_description' => 'nullable|string',
                'product_price' => 'required|numeric|min:0',
                'product_size' => 'nullable|string|max:100',
                'product_category_id' => 'required|integer|exists:product_categories,id',
                'product_brand_id' => 'required|integer|exists:product_brands,id',
                'supplier_id' => 'required|integer|exists:suppliers,id',
                'store_id' => 'required|integer|exists:stores,id',
                'quantity' => 'required|integer|min:0',
                'reorder_level' => 'required|integer|min:0',
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed', ['errors' => $validator->errors()]);
                return redirect()->back()->withErrors($validator)->withInput();
            }
            Log::info('Validation passed for inventory update', [
                'inventory_id' => $inventory->id,
                'user_id' => $request->user()->id,
                'validated_data' => json_encode($validator->validated(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)
            ]);


            // Start a database transaction
            DB::beginTransaction();
            
            try {
                // Update product details
                $inventory->product->update([
                    'name' => $request->product_name,
                    'sku' => $request->product_sku,
                    'description' => $request->product_description,
                    'price' => $request->product_price,
                    'size' => $request->product_size,
                    'product_category_id' => $request->product_category_id,
                    'product_brand_id' => $request->product_brand_id,
                    'supplier_id' => $request->supplier_id,
                ]);
                
                // Update inventory details
                $inventory->update([
                    'store_id' => $request->store_id,
                    'quantity' => $request->quantity,
                    'reorder_level' => $request->reorder_level,
                    'last_restocked' => $request->has('restocked') ? now() : $inventory->last_restocked,
                ]);

                // Record the update in stock logs
                $inventory->stockLogs()->create([
                    'user_id' => $request->user()->id,
                    'inventory_id' => $inventory->id,
                    'store_id' => $inventory->store_id,
                    'action_type' => 'update',
                    'description' => "Updated inventory for product: {$inventory->product->name} (SKU: {$inventory->product->sku})",
                ]);
                
                DB::commit();
                
                return redirect()->back()->with('success', 'Inventory updated successfully.');
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error in transaction: ' . $e->getMessage(), [
                    'exception' => get_class($e),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ]);
                throw $e;
            }
        } catch (\Exception $e) {
            Log::error('Error updating inventory: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);
            return redirect()->back()->with('error', 'Failed to update inventory: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Inventory $inventory)
    {
        try {
            // Record the deletion in stock logs
            $inventory->stockLogs()->create([
                'user_id' => request()->user()->id,
                'inventory_id' => $inventory->id,
                'store_id' => $inventory->store_id,
                'action_type' => 'remove',
                'description' => "Removed product from inventory: {$inventory->product->name} (SKU: {$inventory->product->sku})",
            ]);

            // Record stock movement
            StockMovement::create([
                'inventory_id' => $inventory->id,
                'quantity' => $inventory->quantity,
                'movement_type' => 'out',
            ]);
            
            $inventory->delete();
            return redirect()->route('inventories.index')->with('success', 'Inventory deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Error deleting inventory: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete inventory.');
        }
    }
}
