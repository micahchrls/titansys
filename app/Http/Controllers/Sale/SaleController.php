<?php

namespace App\Http\Controllers\Sale;

use App\Models\Sale\Sale;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Auth;
use App\Models\Sale\SaleItem;
use App\Models\Sale\SaleLog;
use App\Http\Resources\SaleResource;
use App\Models\Inventory;
use App\Models\Stock\StockMovement;
use App\Models\Stock\StockLog;

class SaleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
{
    try {
        $query = Sale::query();

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('id', 'like', "%{$search}%")
                  ->orWhere('sale_code', 'like', "%{$search}%");
            });
        }

        $sales = $query->latest()->paginate(10);
        $sales = SaleResource::collection($sales)->response()->getData(true);

        return Inertia::render('sales', [
            'sales' => $sales,
            'filters' => $request->only(['search'])
        ]);
    } catch (\Exception $e) {
        Log::error('Error fetching sales: ' . $e->getMessage());
        return redirect()->back()->with('error', 'Failed to fetch sales.');
    }
}
    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validator = Validator::make($request->all(), [
                'store_id' => 'required|exists:stores,id',
                'total_price' => 'required|numeric|min:0',
                'items' => 'required|array|min:1',
                'items.*.product_id' => 'required|exists:products,id',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.unit_price' => 'required|numeric|min:0',
            ]);

            if ($validator->fails()) {
                return redirect()->back()->withErrors($validator)->withInput();
            }

            // Begin transaction
            DB::beginTransaction();
            
            // Check inventory availability for all items before proceeding
            foreach ($request->items as $item) {
                $inventory = Inventory::where('product_id', $item['product_id'])
                    ->where('store_id', $request->store_id)
                    ->first();
                
                if (!$inventory) {
                    DB::rollBack();
                    return redirect()->back()->with('error', 'Product not found in inventory.')->withInput();
                }
                
                if ($inventory->quantity < $item['quantity']) {
                    $productName = $inventory->product->name;
                    $availableQty = $inventory->quantity;
                    DB::rollBack();
                    return redirect()->back()->with('error', "Insufficient stock for product '{$productName}'. Available: {$availableQty}.")->withInput();
                }
            }
            
            // Create the sale
            $sale = Sale::create([
                'store_id' => $request->store_id,
                'user_id' => Auth::id(),
                'total_price' => $request->total_price,
                'status' => true
            ]);
            
            // Create sale items and update inventory
            foreach ($request->items as $item) {
                // Create sale item
                $saleItem = new SaleItem([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price']
                ]);
                $sale->items()->save($saleItem);
                
                // Update inventory (decrease quantity)
                $inventory = Inventory::where('product_id', $item['product_id'])
                    ->where('store_id', $request->store_id)
                    ->first();
                
                $inventory->quantity -= $item['quantity'];
                $inventory->save();
                
                // Record stock movement
                StockMovement::create([
                    'inventory_id' => $inventory->id,
                    'quantity' => $item['quantity'],
                    'movement_type' => 'out',
                ]);
                
                // Log the stock action
                StockLog::create([
                    'user_id' => Auth::id(),
                    'store_id' => $request->store_id,
                    'inventory_id' => $inventory->id,
                    'action_type' => 'stock_out',
                    'description' => "Removed {$item['quantity']} units from inventory due to sale transaction"
                ]);
            }
            
            // Create sale log
            SaleLog::create([
                'sale_id' => $sale->id,
                'user_id' => Auth::id(),
                'action_type' => 'create',
                'description' => 'Sale created with ' . count($request->items) . ' items'
            ]);
            
            DB::commit();

            return redirect()->route('sales.index')->with('success', 'Sale created successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error storing sale: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return redirect()->back()->with('error', 'Failed to store sale.')->withInput();
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Sale $sale)
    {
        try {
            $sale = Sale::with('items', 'log')->findOrFail($sale->id);
            return Inertia::render('Sales/Show', [
                'sale' => $sale
            ]);
        } catch (\Exception $e) {
            Log::error('Error showing sale: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to show sale.');
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Sale $sale)
    {
        try {
            $validator = Validator::make($request->all(), [
                'store_id' => 'required|exists:stores,id',
                'total_price' => 'required|numeric|min:0',
                'items' => 'required|array|min:1',
                'items.*.product_id' => 'required|exists:products,id',
                'items.*.quantity' => 'required|integer|min:1',
                'items.*.unit_price' => 'required|numeric|min:0',
            ]);

            if ($validator->fails()) {
                return redirect()->back()->withErrors($validator)->withInput();
            }

            // Begin transaction
            DB::beginTransaction();
            
            // Update the sale
            $sale->update([
                'store_id' => $request->store_id,
                'total_price' => $request->total_price,
                'status' => true
            ]);
            
            // Delete existing sale items and create new ones
            $sale->items()->delete();
            
            // Create new sale items
            foreach ($request->items as $item) {
                $saleItem = new SaleItem([
                    'product_id' => $item['product_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['unit_price']
                ]);
                $sale->items()->save($saleItem);
            }
            
            // Create sale log
            SaleLog::create([
                'sale_id' => $sale->id,
                'user_id' => Auth::id(),
                'action_type' => 'update',
                'description' => 'Sale updated with ' . count($request->items) . ' items'
            ]);
            
            DB::commit();

            return redirect()->route('sales.index')->with('success', 'Sale updated successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error updating sale: ' . $e->getMessage(), [
                'trace' => $e->getTraceAsString(),
                'request_data' => $request->all()
            ]);
            return redirect()->back()->with('error', 'Failed to update sale.')->withInput();
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Sale $sale)
    {
        try {
            $sale->delete();
            return redirect()->route('sales.index')->with('success', 'Sale deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Error deleting sale: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to delete sale.');
        }
    }
}
