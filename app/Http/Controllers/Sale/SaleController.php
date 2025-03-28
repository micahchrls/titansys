<?php

namespace App\Http\Controllers\Sale;

use App\Http\Controllers\Controller;
use App\Http\Resources\SaleResource;
use App\Models\Sale\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Auth;
use App\Models\Sale\SaleItem;
use App\Models\Sale\SaleLog;
use App\Models\Inventory;
use App\Models\Stock\StockMovement;
use App\Models\Stock\StockLog;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use App\Models\Product\Product;
use App\Http\Resources\SaleProductResource;
use App\Models\Product\ProductCategory;

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
                    $q->where('sale_code', 'like', "%{$search}%");
                });
            }
    
            $sales = $query->latest()->paginate(10);

            $sales = SaleResource::collection($sales)->response()->getData(true);

            // Check if this is a partial reload request
            $only = $request->header('X-Inertia-Partial-Data');
            $only = $only ? explode(',', $only) : [];

            $data = [];

            // Prepare stats data
            $statsData = [];
            
            if (empty($only) || in_array('stats', $only)) {
                $statsData = [
                    'total_revenue' => $this->getTotalRevenue(),
                    'total_orders' => $this->getTotalOrders(),
                    'average_order_value' => $this->getAverageOrderValue(),
                    'sales_trend' => $this->getSalesTrend(),
                ];
            }

            $data = array_merge($data, [
                'sales' => $sales,
                'filters' => $request->only(['search']),
                'stats' => $statsData
            ]);

            return Inertia::render('sales', $data);
        } catch (\Exception $e) {
            Log::error('Error fetching sales: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to fetch sales.');
        }
    }

    public function create()
    {
        try {
            // Get products with available inventory
            $products = Product::with(['productCategory', 'productBrand', 'productImage', 'inventory'])
                ->whereHas('inventory', function($query) {
                    $query->where('quantity', '>', 0);
                })
                ->get();

            // Transform products using SaleProductResource
            $products = SaleProductResource::collection($products);
            
            return Inertia::render('sales/create', [
                'products' => $products,
                'categories' => ProductCategory::orderBy('name', 'asc')->get()
            ]);
        } catch (\Exception $e) {
            Log::error('Error loading sale create page: ' . $e->getMessage());
            return redirect()->back()->with('error', 'Failed to load sale creation page.');
        }
    }

    public function store(Request $request)
    {
        try {
            $validated = $request->validate([
                'items' => 'required|array|min:1',
                'items.*.store_id' => 'required|exists:stores,id',
                'items.*.item_id' => 'required|exists:products,id',
                'items.*.quantity' => 'required|integer|min:1',
                'total_price' => 'required|numeric|min:0',
            ]);

            // Begin transaction
            DB::beginTransaction();
            
            // Create the sale record
            $sale = Sale::create([
                'store_id' => $validated['items'][0]['store_id'], // Using first item's store
                'user_id' => Auth::id(),
                'total_price' => $validated['total_price'],
                'status' => 'completed',
            ]);
            
            // Create sale items
            foreach ($validated['items'] as $item) {
                // Get product details
                $product = Product::findOrFail($item['item_id']);
                
                // Create sale item
                $saleItem = new SaleItem([
                    'product_id' => $item['item_id'],
                    'quantity' => $item['quantity'],
                    'unit_price' => $product->price ?? 0
                ]);
                
                $sale->items()->save($saleItem);
                
                // Update inventory
                $inventory = Inventory::where('product_id', $item['item_id'])
                    ->where('store_id', $item['store_id'])
                    ->first();
                
                if ($inventory) {
                    $inventory->quantity -= $item['quantity'];
                    $inventory->save();
                }

                // Record Stock Movement
                StockMovement::create([
                    'inventory_id' => $inventory->id,
                    'quantity' => $item['quantity'],
                    'movement_type' => 'out',
                ]);

                // Log the stock action
                StockLog::create([
                    'user_id' => Auth::id(),
                    'store_id' => $item['store_id'],
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
                'description' => 'Sale created with ' . count($validated['items']) . ' items'
            ]);
            
            DB::commit();
            
            return redirect()->route('sales.index')->with('success', 'Order completed successfully.');
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error creating order: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to create order'], 500);
        }
    }
    
    /**
     * Display the specified resource.
     */
    public function show(Sale $sale)
    {
        try {
            return $sale;
            // $sale = Sale::with('items', 'log')->findOrFail($sale->id);
            // return Inertia::render('sales.show', [
            //     'sale' => $sale
            // ]);
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

    /**
     * Calculate total revenue from sales
     * 
     * @return array
     */
    private function getTotalRevenue(): array
    {
        try {
            // Get current month's revenue
            $currentMonthRevenue = Sale::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('total_price');
                
            // Get previous month's revenue for comparison
            $lastMonthRevenue = Sale::whereMonth('created_at', now()->subMonth()->month)
                ->whereYear('created_at', now()->subMonth()->year)
                ->sum('total_price');
                
            $change = $lastMonthRevenue > 0 
                ? round((($currentMonthRevenue - $lastMonthRevenue) / $lastMonthRevenue) * 100, 1)
                : 0;
                
            return [
                'value' => round($currentMonthRevenue, 2),
                'change_percentage' => $change,
                'trend' => $change >= 0 ? 'up' : 'down'
            ];
        } catch (\Exception $e) {
            Log::error('Error calculating total revenue: ' . $e->getMessage());
            return [
                'value' => 0,
                'change_percentage' => 0,
                'trend' => 'none'
            ];
        }
    }
    
    /**
     * Get total number of orders/sales
     * 
     * @return array
     */
    private function getTotalOrders(): array
    {
        try {
            // Count current month's orders
            $currentMonthOrders = Sale::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();
                
            // Count previous month's orders
            $lastMonthOrders = Sale::whereMonth('created_at', now()->subMonth()->month)
                ->whereYear('created_at', now()->subMonth()->year)
                ->count();
                
            $change = $lastMonthOrders > 0 
                ? round((($currentMonthOrders - $lastMonthOrders) / $lastMonthOrders) * 100, 1)
                : 0;
                
            return [
                'value' => $currentMonthOrders,
                'change_percentage' => $change,
                'trend' => $change >= 0 ? 'up' : 'down'
            ];
        } catch (\Exception $e) {
            Log::error('Error calculating total orders: ' . $e->getMessage());
            return [
                'value' => 0,
                'change_percentage' => 0,
                'trend' => 'none'
            ];
        }
    }
    
    /**
     * Calculate average order value
     * 
     * @return array
     */
    private function getAverageOrderValue(): array
    {
        try {
            // Calculate current month's average order value
            $currentMonthSales = Sale::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->get();
                
            $currentMonthAverage = $currentMonthSales->count() > 0
                ? $currentMonthSales->sum('total_price') / $currentMonthSales->count()
                : 0;
                
            // Calculate previous month's average order value
            $lastMonthSales = Sale::whereMonth('created_at', now()->subMonth()->month)
                ->whereYear('created_at', now()->subMonth()->year)
                ->get();
                
            $lastMonthAverage = $lastMonthSales->count() > 0
                ? $lastMonthSales->sum('total_price') / $lastMonthSales->count()
                : 0;
                
            $change = $lastMonthAverage > 0 
                ? round((($currentMonthAverage - $lastMonthAverage) / $lastMonthAverage) * 100, 1)
                : 0;
                
            return [
                'value' => round($currentMonthAverage, 2),
                'change_percentage' => $change,
                'trend' => $change >= 0 ? 'up' : 'down'
            ];
        } catch (\Exception $e) {
            Log::error('Error calculating average order value: ' . $e->getMessage());
            return [
                'value' => 0,
                'change_percentage' => 0,
                'trend' => 'none'
            ];
        }
    }
    
    /**
     * Get the sales trend data for current month.
     *
     * @return array
     */
    private function getSalesTrend()
    {
        try {
            // Get current month's total sales
            $currentMonthSales = Sale::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->sum('total_price');

            // Get previous month's total sales
            $previousMonthSales = Sale::whereMonth('created_at', now()->subMonth()->month)
                ->whereYear('created_at', now()->subMonth()->year)
                ->sum('total_price');

            // Calculate change percentage
            $changePercentage = 0;
            if ($previousMonthSales > 0) {
                $changePercentage = round((($currentMonthSales - $previousMonthSales) / $previousMonthSales) * 100, 2);
            }

            // Determine trend direction
            $trend = 'none';
            if ($changePercentage > 0) {
                $trend = 'up';
            } elseif ($changePercentage < 0) {
                $trend = 'down';
            }

            return [
                'value' => round($currentMonthSales, 2),
                'change_percentage' => $changePercentage,
                'trend' => $trend
            ];
        } catch (\Exception $e) {
            \Log::error('Error calculating sales trend: ' . $e->getMessage());
            return [
                'value' => 0,
                'change_percentage' => 0,
                'trend' => 'none'
            ];
        }
    }
}
