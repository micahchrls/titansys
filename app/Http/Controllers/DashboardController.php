<?php

namespace App\Http\Controllers;

use App\Models\Sale\Sale;
use App\Models\Inventory;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Illuminate\Http\Request;

class DashboardController extends Controller
{

    public function index()
    {
        return Inertia::render('Dashboard', [
            'recentSales' => $this->getRecentSales(),
            'totalRevenue' => $this->getTotalRevenue(),
            'totalSales' => $this->getTotalSales(),
            'lowStockItems' => $this->getLowStockItems(),
            'totalInventoryValue' => $this->getTotalInventoryValue(),
            'salesChartData' => $this->getSalesChartData(),
            'recentSaleTransactions' => $this->getRecentSaleTransactions()
        ]);
    }

    private function getRecentSales()
    {
        try {
            $sales = Sale::with([
                'items.product.productBrand',
                'items.product.productCategory',
                'items.product.productImage',
            ])
                ->latest()
                ->paginate(5);

            // Log sale data for debugging
            Log::info('Recent sales retrieved', ['count' => $sales->count()]);

            return $sales->map(function ($sale) {
                $saleData = [
                    'sale_code' => $sale->sale_code,
                    'store_name' => $sale->store->name,
                    'processed_by' => $sale->user->first_name . ' ' . $sale->user->last_name,
                    'items_count' => $sale->items->count(),
                    'total_price' => "₱ " . $sale->total_price,
                    'status' => $sale->status,
                    'created_at' => $sale->created_at,
                ];
                Log::debug('Sale data mapped', ['sale_data' => json_encode($saleData, JSON_PRETTY_PRINT)]);
                return $saleData;
            });
        } catch (\Throwable $th) {
            Log::error('Error fetching recent sales: ' . $th->getMessage());
            return [];
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
                'title' => 'Total Revenue',
                'value' => '₱' . number_format(round($currentMonthRevenue, 2), 2),
                'description' => $change == 0 ? 'Same as last month' :
                    sprintf(
                        '%s%.1f%% from last month',
                        $change > 0 ? '+' : '',
                        abs($change)
                    ),
                'trend' => $change >= 0 ? 'up' : 'down'
            ];
        } catch (\Exception $e) {
            Log::error('Error calculating total revenue: ' . $e->getMessage());
            return [
                'title' => 'Total Revenue',
                'value' => '₱0.00',
                'description' => 'No data available',
                'trend' => 'none'
            ];
        }
    }

    private function getTotalSales(): array
    {
        try {
            // Get current month's sales count
            $currentMonthSales = Sale::whereMonth('created_at', now()->month)
                ->whereYear('created_at', now()->year)
                ->count();

            // Get previous month's sales count
            $lastMonthSales = Sale::whereMonth('created_at', now()->subMonth()->month)
                ->whereYear('created_at', now()->subMonth()->year)
                ->count();

            $change = $lastMonthSales > 0
                ? round((($currentMonthSales - $lastMonthSales) / $lastMonthSales) * 100, 1)
                : 0;

            return [
                'title' => 'Total Sales',
                'value' => (string)$currentMonthSales,
                'description' => $change == 0 ? 'Same as last month' :
                    sprintf(
                        '%s%.1f%% from last month',
                        $change > 0 ? '+' : '',
                        abs($change)
                    ),
                'trend' => $change >= 0 ? 'up' : 'down'
            ];
        } catch (\Exception $e) {
            Log::error('Error calculating total sales: ' . $e->getMessage());
            return [
                'title' => 'Total Sales',
                'value' => '0',
                'description' => 'No data available',
                'trend' => 'none'
            ];
        }
    }

    /**
     * Get low stock items for the dashboard
     * 
     * @return array
     */
    private function getLowStockItems(): array
    {
        try {
            // Get items below reorder level
            $lowStockItems = Inventory::with(['product'])
                ->whereRaw('quantity <= reorder_level')
                ->orderBy('quantity', 'asc')
                ->get();

            // Get previous week's low stock count for trend calculation
            $lastWeekCount = Inventory::whereRaw('quantity <= reorder_level')
                ->where('updated_at', '<=', now()->subDays(7))
                ->count();

            $currentCount = $lowStockItems->count();
            $change = $currentCount - $lastWeekCount;

            // Get top 5 items for detailed display
            $topItems = $lowStockItems->take(5)->map(function ($item) {
                $status = $item->quantity <= ($item->reorder_level / 2) ? 'Critical' : 'Low';

                return [
                    'name' => $item->product->name,
                    'sku' => $item->product->sku,
                    'currentStock' => $item->quantity,
                    'minRequired' => $item->reorder_level,
                    'status' => $status
                ];
            })->toArray();

            return [
                'title' => 'Low Stock Items',
                'value' => (string)$currentCount,
                'items' => $topItems,
                'description' => $change == 0 ? 'Same as last week' :
                    sprintf(
                        '%s%d items from last week',
                        $change > 0 ? '+' : '',
                        $change
                    ),
                'trend' => $change >= 0 ? 'up' : 'down'
            ];
        } catch (\Exception $e) {
            Log::error('Error fetching low stock items: ' . $e->getMessage());
            return [
                'title' => 'Low Stock Items',
                'value' => '0',
                'items' => [],
                'description' => 'No data available',
                'trend' => 'none'
            ];
        }
    }

    private function getTotalInventoryValue()
    {
        try {
            // Calculate current total inventory value
            $currentValue = Inventory::join('products', 'inventories.product_id', '=', 'products.id')
                ->selectRaw('SUM(inventories.quantity * products.price) as total_value')
                ->first()
                ->total_value;

            // Calculate value from last month for comparison
            $lastMonthValue = Inventory::join('products', 'inventories.product_id', '=', 'products.id')
                ->where('inventories.updated_at', '<=', now()->subMonth())
                ->selectRaw('SUM(inventories.quantity * products.price) as total_value')
                ->first()
                ->total_value ?? 0;

            // Calculate percentage change
            $percentChange = $lastMonthValue > 0
                ? round((($currentValue - $lastMonthValue) / $lastMonthValue) * 100, 1)
                : 0;

            // Format the current value with commas
            $formattedValue = number_format($currentValue, 0, '.', ',');

            return [
                'title' => 'Total Inventory Value',
                'value' => $formattedValue,
                'description' => sprintf(
                    '%s%s%% from last month',
                    $percentChange >= 0 ? '+' : '',
                    $percentChange
                ),
                'trend' => $percentChange >= 0 ? 'up' : 'down'
            ];
        } catch (\Exception $e) {
            Log::error('Error calculating inventory value: ' . $e->getMessage());
            return [
                'title' => 'Total Inventory Value',
                'value' => '0',
                'description' => 'No data available',
                'trend' => 'none'
            ];
        }
    }

    /**
     * Get data for the sales chart
     * 
     * @return array
     */
    private function getSalesChartData(): array
    {
        try {
            $months = [];
            $salesData = [];
            
            // Get sales data for the last 6 months
            for ($i = 5; $i >= 0; $i--) {
                $month = now()->subMonths($i);
                $monthName = $month->format('M');
                $year = $month->format('Y');
                
                // Get sales amount for this month
                $sales = Sale::whereMonth('created_at', $month->month)
                    ->whereYear('created_at', $month->year)
                    ->sum('total_price');
                
                // Get order count for this month
                $orders = Sale::whereMonth('created_at', $month->month)
                    ->whereYear('created_at', $month->year)
                    ->count();
                
                // Calculate approximate profit (for example, 40% of sales)
                $profit = $sales * 0.4;
                
                $salesData[] = [
                    'name' => $monthName,
                    'sales' => round($sales, 2),
                    'orders' => $orders,
                    'profit' => round($profit, 2)
                ];
            }
            
            return $salesData;
        } catch (\Exception $e) {
            Log::error('Error generating sales chart data: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get recent sale transactions for the dashboard
     * 
     * @return array
     */
    private function getRecentSaleTransactions(): array
    {
        try {
            // Get the latest 5 sale transactions using the same approach as getRecentSales()
            $sales = Sale::with([
                'items.product.productBrand',
                'items.product.productCategory',
                'items.product.productImage',
                'store',
                'user'
            ])
                ->latest()
                ->limit(5)
                ->get();
            
            // Log for debugging
            Log::info('Recent sale transactions retrieved', ['count' => $sales->count()]);
            
            return $sales->map(function ($sale) {
                $statusMap = [
                    'completed' => 'Completed',
                    'processing' => 'Processing',
                    'pending' => 'Pending',
                    'cancelled' => 'Cancelled'
                ];
                
                // Default to 'Completed' if status is not recognized
                $status = $statusMap[strtolower($sale->status)] ?? 'Completed';
                
                $saleData = [
                    'id' => $sale->sale_code,
                    'customer' => $sale->store ? $sale->store->name : 'Unknown Store',
                    'items' => $sale->items->count(),
                    'total' => '₱' . number_format($sale->total_price, 2),
                    'status' => $status,
                    'date' => $sale->created_at->format('Y-m-d')
                ];
                
                Log::debug('Sale transaction data mapped', ['sale_data' => json_encode($saleData, JSON_PRETTY_PRINT)]);
                return $saleData;
            })->toArray();
        } catch (\Exception $e) {
            Log::error('Error fetching recent sale transactions: ' . $e->getMessage());
            return [];
        }
    }

    /**
     * Get recent sale transactions for AJAX refresh
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getRecentSaleTransactionsEndpoint()
    {
        return response()->json($this->getRecentSaleTransactions());
    }

    /**
     * Get low stock alerts data for AJAX refresh
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getLowStockItemsEndpoint()
    {
        return response()->json($this->getLowStockItems());
    }

    /**
     * Get sales chart data for AJAX refresh
     * 
     * @return \Illuminate\Http\JsonResponse
     */
    public function getSalesChartDataEndpoint()
    {
        return response()->json($this->getSalesChartData());
    }
}
