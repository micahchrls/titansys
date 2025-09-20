<?php

namespace App\Http\Controllers;

use App\Http\Resources\InventoryResource;
use App\Http\Resources\InventoryShowResource;
use App\Models\Inventory;
use App\Models\Product\Product;
use App\Models\Product\ProductCategory;
use App\Models\Product\ProductBrand;
use App\Models\Product\ProductImage;
use App\Models\Store\Store;
use App\Models\Stock\StockLog;
use App\Models\Stock\StockMovement;
use App\Models\Stock\StockTransaction;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;

class InventoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            // Start measuring query execution time
            $startTime = microtime(true);

            // Extract all filter parameters at once to avoid multiple calls
            $search = $request->input('search');
            $brandId = $request->input('brand');
            $categoryId = $request->input('category'); 
            $status = $request->input('status');

            // Build base query with optimized join instead of multiple whereHas
            $query = Inventory::query()
                ->select('inventories.*')
                ->join('products', 'inventories.product_id', '=', 'products.id');
            // Apply search filter - optimize by using indexed columns
            if ($search) {
                $query->where(function ($q) use ($search) {
                    $q->whereRaw('LOWER(products.part_number) LIKE ?', ['%' . strtolower($search) . '%'])
                      ->orWhereRaw('LOWER(products.sku) LIKE ?', ['%' . strtolower($search) . '%'])
                      ->orWhereRaw('LOWER(products.description) LIKE ?', ['%' . strtolower($search) . '%'])
                      ->orWhereRaw('LOWER(products.vehicle) LIKE ?', ['%' . strtolower($search) . '%']);
                });
            }

            // Apply brand filter with optimized join approach
            if ($brandId && $brandId !== 'all') {
                $query->where('products.product_brand_id', $brandId);
            }

            // Apply category filter with optimized join approach
            if ($categoryId && $categoryId !== 'all') {
                $query->where('products.product_category_id', $categoryId);
            }

            // Apply status filter with optimized conditions
            if ($status && $status !== 'all') {
                switch ($status) {
                    case 'in-stock':
                        $query->whereRaw('inventories.quantity > inventories.reorder_level');
                        break;
                    case 'low-stock':
                        $query->whereRaw('inventories.quantity > 0 AND inventories.quantity <= inventories.reorder_level');
                        break;
                    case 'out-of-stock':
                        $query->where('inventories.quantity', '<=', 0);
                        break;
                }
            }

            // Remove duplicates that might arise from joins
            $query->distinct();

            // Get the count before pagination for accurate totals
            $totalCount = $query->count();

            // Only load necessary relationships with explicit field selection
            $query = $query->with([
                'product' => function ($q) {
                    $q->select('id', 'part_number', 'sku', 'vehicle', 'description', 'code', 'size', 'product_category_id', 'product_brand_id', 'supplier_id');
                },
                'product.productCategory:id,name',
                'product.productBrand:id,name',
                'product.supplier:id,name',
                'store:id,name'
            ]);

            // Apply sorting on indexed column for better performance
            $query->orderBy('inventories.created_at', 'desc');

            // Get paginated results - the join approach may require groupBy to avoid duplicates
            $inventories = $query->paginate(10);
            
            // Check if we can use a simpler resource that doesn't transform as much data
            $inventoriesData = InventoryResource::collection($inventories)->response()->getData(true);

            // Only get filter data if this is a full page load (not a partial reload)
            $only = $request->header('X-Inertia-Partial-Data');
            $only = $only ? explode(',', $only) : [];

            $data = [];

            // Only include the requested data for partial reloads
            if (empty($only) || in_array('low_stock_alerts', $only)) {
                $data['low_stock_alerts'] = $this->getLowStockAlerts();
            }

            if (empty($only) || in_array('inventory_value_summary', $only)) {
                $data['inventory_value_summary'] = $this->getInventoryValueSummary();
            }

            // Fetch filter data efficiently with minimal columns
            if (empty($only) || in_array('categories', $only)) {
                $data['categories'] = ProductCategory::select('id', 'name')->orderBy('name')->get();
            }

            if (empty($only) || in_array('brands', $only)) {
                $data['brands'] = ProductBrand::select('id', 'name')->orderBy('name')->get();
            }

            if (empty($only) || in_array('suppliers', $only)) {
                $data['suppliers'] = Supplier::select('id', 'name')->orderBy('name')->get();
            }

            if (empty($only) || in_array('stores', $only)) {
                $data['stores'] = Store::select('id', 'name')->orderBy('name')->get();
            }

            // Track query execution time
            $executionTime = microtime(true) - $startTime;
            Log::info("Inventory listing query executed in {$executionTime} seconds");

            // Add the inventory data and filter parameters to the response
            $data = array_merge($data, [
                'inventories' => $inventoriesData,
                'filters' => $request->only(['search', 'brand', 'category', 'status']),
            ]);

            // Add optional filter data only if needed
            if (!isset($data['categories'])) $data['categories'] ??= ProductCategory::select('id', 'name')->orderBy('name')->get();
            if (!isset($data['brands'])) $data['brands'] ??= ProductBrand::select('id', 'name')->orderBy('name')->get();
            if (!isset($data['suppliers'])) $data['suppliers'] ??= Supplier::select('id', 'name')->orderBy('name')->get();
            if (!isset($data['stores'])) $data['stores'] ??= Store::select('id', 'name')->orderBy('name')->get();

            return Inertia::render('inventories', $data);
        } catch (\Exception $e) {
            Log::error('Error fetching inventory: ' . $e->getMessage());
            Log::error($e->getTraceAsString());
            return redirect()->back()->with('error', 'Failed to load inventory data.');
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

            // Grab raw request content and parse if needed
            $rawContent = $request->getContent();
            Log::info('Raw request content:', [
                'content_type' => $request->header('Content-Type'),
                'raw_length' => strlen($rawContent),
                'raw_content_preview' => substr($rawContent, 0, 500) // Log first 500 chars
            ]);

            // If it's a multipart form, let's access post data differently
            if (strpos($request->header('Content-Type'), 'multipart/form-data') !== false) {
                Log::info('Multipart form data detected, checking POST data');
                Log::info('POST data:', $_POST);
            }

            $validated = Validator::make($request->all(), [
                'part_number' => 'required|string|max:255',
                'vehicle' => 'required|string|max:255',
                'description' => 'nullable|string',
                'code' => 'required|string|max:255',
                'size' => 'nullable|string|max:100',
                'sku' => 'nullable|string|max:100|unique:products,sku',
                'auto_generate_sku' => 'nullable',
                'product_category_id' => 'required|exists:product_categories,id',
                'product_brand_id' => 'required|exists:product_brands,id',
                'supplier_id' => 'required|exists:suppliers,id',
                'store_id' => 'required|exists:stores,id',
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
                $storeId = $validated['store_id']; // Get store ID from request

                // Check if SKU is provided or should be auto-generated
                $sku = null;
                // Convert string 'false' to boolean false, and use true as default
                $autoGenerateSku = filter_var($request->input('auto_generate_sku', true), FILTER_VALIDATE_BOOLEAN);
                
                if (!empty($request->sku) && !$autoGenerateSku) {
                    // Use the provided SKU
                    $sku = $request->sku;
                    Log::info('Using provided SKU', ['sku' => $sku]);
                } else {
                    // Auto-generate SKU
                    $sku = $this->generateSku($validated['part_number'], $validated['product_category_id']);
                    Log::info('Generated SKU', ['sku' => $sku]);
                }

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
            'part_number' => $data['part_number'],
            'sku' => $sku,
            'vehicle' => $data['vehicle'],
            'description' => $data['description'] ?? null,
            'code' => $data['code'],
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
            'store_id' => $data['store_id'],
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
            'inventory_id' => $inventoryId,
            'action_type' => 'add',
            'description' => "Added new product to inventory: {$product->part_number} (SKU: {$product->sku})",
        ]);
    }

    /**
     * Handle product image upload and creation
     */
    private function handleProductImage(int $productId, $image): ProductImage
    {
        try {
            return ProductImage::uploadImage($productId, $image);
        } catch (\Exception $e) {
            Log::error('Error in handleProductImage: ' . $e->getMessage(), [
                'product_id' => $productId,
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine()
            ]);
            throw $e;
        }
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
            // Debug the request data
            Log::info('Update request received', [
                'request_data' => $request->all(),
                'inventory_id' => $inventory->id,
                'inventory' => $inventory,
                'method' => $request->method(),
                'url' => $request->url(),
                'headers' => $request->headers->all()
            ]);

            // Grab raw request content and parse if needed
            $rawContent = $request->getContent();
            Log::info('Raw request content:', [
                'content_type' => $request->header('Content-Type'),
                'raw_length' => strlen($rawContent),
                'raw_content_preview' => substr($rawContent, 0, 500) // Log first 500 chars
            ]);

            // If it's a multipart form, let's access post data differently
            if (strpos($request->header('Content-Type'), 'multipart/form-data') !== false) {
                Log::info('Multipart form data detected, checking POST data');
                Log::info('POST data:', $_POST);
            }

            // Match the validation rules to the fields sent from the front-end
            $validator = Validator::make($request->all(), [
                'part_number' => 'required|string|max:255',
                'vehicle' => 'required|string|max:255',
                'description' => 'nullable|string',
                'code' => 'required|string|max:255',
                'size' => 'nullable|string|max:100',
                'product_sku' => 'sometimes|string|max:100',
                'product_category_id' => 'required|integer|exists:product_categories,id',
                'product_brand_id' => 'required|integer|exists:product_brands,id',
                'supplier_id' => 'required|integer|exists:suppliers,id',
                'store_id' => 'required|integer|exists:stores,id',
                'reorder_level' => 'required|integer|min:0',
                'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
                'product_image_id' => 'nullable|integer',
                'product_image_path' => 'nullable|string',
                'remove_image' => 'nullable|boolean',
            ]);

            if ($validator->fails()) {
                Log::error('Validation failed', [
                    'errors' => $validator->errors(),
                    'request_data' => $request->all()
                ]);

                // For AJAX requests, return a JSON response with validation errors
                if ($request->expectsJson() || $request->ajax()) {
                    return response()->json([
                        'success' => false,
                        'errors' => $validator->errors()
                    ], 422);
                }

                return redirect()->back()->withErrors($validator)->withInput();
            }

            Log::info('Validation passed for inventory update', [
                'inventory_id' => $inventory->id,
                'user_id' => $request->user()->id,
                'validated_data' => json_encode($validator->validated(), JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE),
                'has_file' => $request->hasFile('image') ? 'Yes' : 'No'
            ]);

            // Start a database transaction
            DB::beginTransaction();

            try {
                // Extract all data from request manually to ensure it's available
                $partNumber = $request->input('part_number');
                $vehicle = $request->input('vehicle');
                $description = $request->input('description');
                $code = $request->input('code');
                $size = $request->input('size');
                $productCategoryId = $request->input('product_category_id');
                $productBrandId = $request->input('product_brand_id');
                $supplierId = $request->input('supplier_id');
                $storeId = $request->input('store_id');
                $reorderLevel = $request->input('reorder_level');

                Log::info('Extracted data from request:', [
                    'part_number' => $partNumber,
                    'vehicle' => $vehicle,
                    'code' => $code,
                    'product_category_id' => $productCategoryId,
                    'product_brand_id' => $productBrandId,
                    'supplier_id' => $supplierId,
                    'store_id' => $storeId,
                    'reorder_level' => $reorderLevel,
                ]);

                // Update product details
                $inventory->product->update([
                    'part_number' => $partNumber,
                    'vehicle' => $vehicle,
                    'description' => $description,
                    'code' => $code,
                    'size' => $size,
                    'product_category_id' => $productCategoryId,
                    'product_brand_id' => $productBrandId,
                    'supplier_id' => $supplierId,
                ]);

                // Update inventory details - note we're not updating quantity here
                // as that should be done through inventory movement functionality
                $inventory->update([
                    'store_id' => $storeId,
                    'reorder_level' => $reorderLevel,
                ]);

                // Handle image upload if provided
                if ($request->hasFile('image')) {
                    // Log image details
                    $image = $request->file('image');
                    Log::info('Processing image upload', [
                        'original_name' => $image->getClientOriginalName(),
                        'mime_type' => $image->getMimeType(),
                        'size' => $image->getSize(),
                        'product_id' => $inventory->product->id
                    ]);

                    try {
                        // Delete existing primary image if it exists
                        $existingImages = $inventory->product->images;
                        if ($existingImages && count($existingImages) > 0) {
                            foreach ($existingImages as $image) {
                                Log::info('Deleting existing image', [
                                    'image_id' => $image->id,
                                    'file_path' => $image->file_path
                                ]);
                                $image->delete();
                            }
                        }

                        // Upload new image
                        $productImage = $this->handleProductImage($inventory->product->id, $request->file('image'));
                        Log::info('Product image updated successfully', [
                            'product_id' => $inventory->product->id,
                            'image_id' => $productImage->id,
                            'file_path' => $productImage->file_path
                        ]);
                    } catch (\Exception $e) {
                        Log::error('Error handling product image: ' . $e->getMessage(), [
                            'exception' => get_class($e),
                            'file' => $e->getFile(),
                            'line' => $e->getLine()
                        ]);
                        // Continue with the update even if image upload fails
                    }
                } else if ($request->boolean('remove_image')) {
                    // If remove_image flag is set, delete all images without replacing them
                    Log::info('Removing product images', [
                        'product_id' => $inventory->product->id
                    ]);

                    $existingImages = $inventory->product->images;
                    if ($existingImages && count($existingImages) > 0) {
                        foreach ($existingImages as $image) {
                            Log::info('Deleting image', [
                                'image_id' => $image->id,
                                'file_path' => $image->file_path
                            ]);
                            $image->delete();
                        }
                    }
                } else if ($request->has('product_image_id') && $request->has('product_image_path')) {
                    // If no new image but existing image info is provided, keep the existing image
                    Log::info('Keeping existing product image', [
                        'product_image_id' => $request->input('product_image_id'),
                        'product_image_path' => $request->input('product_image_path')
                    ]);
                } else {
                    Log::info('No image file or image info provided in the request');
                }

                // Record the update in stock logs
                $inventory->stockLogs()->create([
                    'user_id' => $request->user()->id,
                    'inventory_id' => $inventory->id,
                    'store_id' => $inventory->store_id,
                    'action_type' => 'update',
                    'description' => "Updated inventory for product: {$inventory->product->part_number} (SKU: {$inventory->product->sku})",
                ]);

                DB::commit();

                // For AJAX requests, return a JSON response
                if ($request->expectsJson() || $request->ajax()) {
                    // Reload the inventory with all necessary relationships
                    $inventory->load([
                        'product',
                        'product.images',
                        'product.productCategory',
                        'product.productBrand',
                        'product.supplier',
                        'store'
                    ]);

                    // Use the resource to format the inventory data
                    $inventoryResource = new InventoryResource($inventory);

                    return response()->json([
                        'success' => true,
                        'message' => 'Inventory updated successfully.',
                        'inventory' => $inventoryResource
                    ]);
                }

                return redirect()->back()->with('success', 'Inventory updated successfully.');
            } catch (\Exception $e) {
                DB::rollBack();
                Log::error('Error in transaction: ' . $e->getMessage(), [
                    'exception' => get_class($e),
                    'file' => $e->getFile(),
                    'line' => $e->getLine(),
                    'trace' => $e->getTraceAsString()
                ]);

                // For AJAX requests, return a JSON response with error details
                if ($request->expectsJson() || $request->ajax()) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Failed to update inventory: ' . $e->getMessage()
                    ], 500);
                }

                throw $e;
            }
        } catch (\Exception $e) {
            Log::error('Error updating inventory: ' . $e->getMessage(), [
                'exception' => get_class($e),
                'file' => $e->getFile(),
                'line' => $e->getLine(),
                'trace' => $e->getTraceAsString()
            ]);

            // For AJAX requests, return a JSON response with error details
            if ($request->expectsJson() || $request->ajax()) {
                return response()->json([
                    'success' => false,
                    'message' => 'Failed to update inventory: ' . $e->getMessage()
                ], 500);
            }

            return redirect()->back()->with('error', 'Failed to update inventory: ' . $e->getMessage());
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Inventory $inventory)
    {
        try {
            DB::beginTransaction();

            // Record the deletion in stock logs
            $inventory->stockLogs()->create([
                'user_id' => request()->user()->id,
                'inventory_id' => $inventory->id,
                'store_id' => $inventory->store_id,
                'action_type' => 'remove',
                'description' => "Removed product from inventory: {$inventory->product->part_number} (SKU: {$inventory->product->sku})",
            ]);

            // Record stock movement
            StockMovement::create([
                'inventory_id' => $inventory->id,
                'quantity' => $inventory->quantity,
                'movement_type' => 'out',
            ]);

            // Get product reference before deleting inventory
            $product = $inventory->product;

            // Delete the inventory record
            $inventory->delete();

            // Delete the product and its related data
            if ($product) {
                // Delete product images if any
                if ($product->images) {
                    foreach ($product->images as $image) {
                        Storage::disk('public')->delete($image->file_path);
                        $image->delete();
                    }
                }

                $product->delete();
            }

            DB::commit();
            return redirect()->route('inventories.index')->with('success', 'Inventory and product deleted successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error deleting inventory: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete inventory and product.');
        }
    }


    /**
     * Process stock in transaction
     * 
     * @param Inventory $inventory
     * @param int $quantity
     * @param string $referenceType
     * @param string|null $referenceNumber
     * @param string|null $notes
     * @return bool
     */
    public function stockIn(Request $request, Inventory $inventory)
    {
        try {

            $validated = $request->validate([
                'quantity' => 'required|numeric|min:0',
            ]);

            DB::beginTransaction();

            // Update inventory quantity
            $inventory->quantity += $validated['quantity'];
            $inventory->save();

            // Record stock movement
            StockMovement::create([
                'inventory_id' => $inventory->id,
                'quantity' => $validated['quantity'],
                'movement_type' => 'in',
            ]);

            // Log the action
            $inventory->stockLogs()->create([
                'user_id' => request()->user()->id,
                'store_id' => $inventory->store_id,
                'action_type' => 'stock_in',
                'description' => "Added {$validated['quantity']} units to inventory: {$inventory->product->part_number} (SKU: {$inventory->product->sku})"
            ]);

            DB::commit();
            return redirect()->route('inventories.show', $inventory->id)->with('success', 'Stock in successful');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error processing stock in: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to add stock. Please try again.');
        }
    }

    /**
     * Process stock out transaction
     * 
     * @param Inventory $inventory
     * @param int $quantity
     * @param string $referenceType
     * @param string|null $referenceNumber
     * @param string|null $notes
     * @return bool
     */
    public function stockOut(Request $request, Inventory $inventory)
    {
        try {

            $validated = $request->validate([
                'quantity' => 'required|numeric|min:0',
            ]);

            DB::beginTransaction();

            // Update inventory quantity
            $inventory->quantity -= $validated['quantity'];
            $inventory->save();

            // Record stock movement
            StockMovement::create([
                'inventory_id' => $inventory->id,
                'quantity' => $validated['quantity'],
                'movement_type' => 'out',
            ]);

            // Log the action
            $inventory->stockLogs()->create([
                'user_id' => request()->user()->id,
                'store_id' => $inventory->store_id,
                'action_type' => 'stock_out',
                'description' => "Removed {$validated['quantity']} units from inventory: {$inventory->product->part_number} (SKU: {$inventory->product->sku})"
            ]);

            DB::commit();
            return redirect()->route('inventories.show', $inventory->id)->with('success', 'Stock out successful');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error processing stock in: ' . $e->getMessage());
            return false;
        }
    }

    private function getLowStockAlerts()
    {
        // Get items below reorder level
        $lowStockItems = Inventory::with(['product', 'store'])
            ->whereRaw('quantity <= reorder_level')
            ->orderBy('quantity', 'asc')
            ->get();

        // Count items by severity
        $criticalCount = $lowStockItems->where('quantity', '<=', DB::raw('reorder_level / 2'))->count();
        $warningCount = $lowStockItems->count() - $criticalCount;

        // Get items that were low stock 14 days ago but still low stock now
        $twoWeeksAgo = now()->subDays(14);
        $persistentLowStock = StockLog::where('action_type', 'low_stock_alert')
            ->where('created_at', '<=', $twoWeeksAgo)
            ->pluck('inventory_id')
            ->intersect($lowStockItems->pluck('id'))
            ->count();

        // Get previous week's low stock count for trend calculation
        $lastWeekCount = Inventory::whereRaw('quantity <= reorder_level')
            ->where('updated_at', '<=', now()->subDays(7))
            ->count();

        $change = $lowStockItems->count() - $lastWeekCount;

        return [
            'count' => $lowStockItems->count(),
            'critical_count' => $criticalCount,
            'warning_count' => $warningCount,
            'persistent_count' => $persistentLowStock,
            'change' => $change,
            'trend' => $change <= 0 ? 'down' : 'up'
        ];
    }

    private function getInventoryValueSummary()
    {
        // Count total categories
        $categoriesCount = ProductCategory::count();
        $lastWeekCategoriesCount = ProductCategory::where('created_at', '<=', now()->subDays(7))->count();
        $categoriesChange = $categoriesCount - $lastWeekCategoriesCount;
        $categoriesChangePercentage = $lastWeekCategoriesCount > 0
            ? round(($categoriesChange / $lastWeekCategoriesCount) * 100, 1)
            : 0;

        // Count total products
        $productsCount = Product::count();
        $lastWeekProductsCount = Product::where('created_at', '<=', now()->subDays(7))->count();
        $productsChange = $productsCount - $lastWeekProductsCount;
        $productsChangePercentage = $lastWeekProductsCount > 0
            ? round(($productsChange / $lastWeekProductsCount) * 100, 1)
            : 0;

        // Get top selling products (last 30 days)
        $topSellingCount = StockMovement::where('movement_type', 'out')
            ->where('created_at', '>=', now()->subDays(30))
            ->distinct('inventory_id')
            ->count();
        $previousTopSellingCount = StockMovement::where('movement_type', 'out')
            ->whereBetween('created_at', [now()->subDays(60), now()->subDays(30)])
            ->distinct('inventory_id')
            ->count();
        $topSellingChange = $topSellingCount - $previousTopSellingCount;

        return [
            'categories' => [
                'count' => $categoriesCount,
                'change_percentage' => $categoriesChangePercentage,
                'trend' => $categoriesChange >= 0 ? 'up' : 'down'
            ],
            'products' => [
                'count' => $productsCount,
                'change_percentage' => $productsChangePercentage,
                'trend' => $productsChange >= 0 ? 'up' : 'down'
            ],
            'top_selling' => [
                'count' => $topSellingCount,
                'change' => $topSellingChange,
                'trend' => $topSellingChange >= 0 ? 'up' : 'down'
            ]
        ];
    }

    private function getMovingPartsData()
    {
        // Get fastest moving parts (highest number of stock-out movements)
        $fastestMoving = StockMovement::where('movement_type', 'out')
            ->where('created_at', '>=', now()->subDays(30))
            ->selectRaw('inventory_id, SUM(quantity) as total_out')
            ->groupBy('inventory_id')
            ->orderBy('total_out', 'desc')
            ->take(5)
            ->with(['inventory.product', 'inventory.store'])
            ->get()
            ->map(function ($movement) {
                $turnoverRate = $movement->total_out / max(1, $movement->inventory->quantity);
                return [
                    'id' => $movement->inventory_id,
                    'product_name' => $movement->inventory->product->part_number,
                    'product_sku' => $movement->inventory->product->sku,
                    'quantity_sold' => $movement->total_out,
                    'current_stock' => $movement->inventory->quantity,
                    'turnover_rate' => round($turnoverRate, 2),
                    'store_name' => $movement->inventory->store->name
                ];
            });

        // Get slowest moving parts (inventory with oldest last stock-out date or no stock-out)
        $slowestMoving = Inventory::with(['product', 'store', 'stockMovements' => function ($query) {
            $query->where('movement_type', 'out')
                ->orderBy('created_at', 'desc');
        }])
            ->whereRaw('quantity > reorder_level') // Only consider items not in low stock
            ->orderBy('updated_at', 'asc')
            ->take(5)
            ->get()
            ->map(function ($inventory) {
                $lastMovement = $inventory->stockMovements->first();
                $daysInInventory = $lastMovement
                    ? now()->diffInDays($lastMovement->created_at)
                    : now()->diffInDays($inventory->created_at);

                return [
                    'id' => $inventory->id,
                    'product_name' => $inventory->product->part_number,
                    'product_sku' => $inventory->product->sku,
                    'current_stock' => $inventory->quantity,
                    'days_in_inventory' => $daysInInventory,
                    'last_movement_date' => $lastMovement ? $lastMovement->created_at->format('Y-m-d') : null,
                    'store_name' => $inventory->store->name
                ];
            });

        return [
            'fastest_moving' => $fastestMoving,
            'slowest_moving' => $slowestMoving
        ];
    }

    private function getRecentStockMovements()
    {
        return StockMovement::with(['inventory.product', 'inventory.store', 'user'])
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($movement) {
                return [
                    'id' => $movement->id,
                    'inventory_id' => $movement->inventory_id,
                    'product_name' => $movement->inventory->product->part_number,
                    'product_sku' => $movement->inventory->product->sku,
                    'quantity' => $movement->quantity,
                    'movement_type' => $movement->movement_type,
                    'timestamp' => $movement->created_at->format('Y-m-d H:i:s'),
                    'user_name' => $movement->user ? $movement->user->name : 'System',
                    'store_name' => $movement->inventory->store->name
                ];
            });
    }

 
}
