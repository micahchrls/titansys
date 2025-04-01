import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { usePage } from '@inertiajs/react';
import axios from 'axios';
import { RefreshCw, TrendingUp } from 'lucide-react';
import { useState } from 'react';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { toast } from 'sonner';

interface SalesChartDataItem {
    name: string;
    sales: number;
    orders: number;
    profit: number;
}

interface PageProps {
    salesChartData: SalesChartDataItem[];
}

export function SalesChart() {
    const { salesChartData } = usePage<{ salesChartData: SalesChartDataItem[] }>().props;
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [chartData, setChartData] = useState<SalesChartDataItem[]>(salesChartData || []);

    const refreshData = async (): Promise<void> => {
        setIsRefreshing(true);
        try {
            const response = await axios.get<SalesChartDataItem[]>(route('dashboard.sales-chart-data'));
            setChartData(response.data);
            toast.success('Sales chart data refreshed');
        } catch (error) {
            toast.error('Failed to refresh sales data');
            console.error('Error refreshing sales chart data:', error);
        } finally {
            setIsRefreshing(false);
        }
    };

    const formatCurrency = (value: number): string => {
        return new Intl.NumberFormat('en-PH', {
            style: 'currency',
            currency: 'PHP',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(value);
    };

    // Calculate total sales, orders and profit
    const totalSales = chartData.reduce((sum, item) => sum + item.sales, 0);
    const totalOrders = chartData.reduce((sum, item) => sum + item.orders, 0);
    const totalProfit = chartData.reduce((sum, item) => sum + item.profit, 0);

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="rounded-md border bg-white p-3 shadow-md dark:bg-gray-800">
                    <p className="text-sm font-bold">{label}</p>
                    <div className="mt-2 space-y-1.5">
                        <p className="flex items-center text-xs">
                            <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-[#8884d8]"></span>
                            <span className="mr-1 font-semibold">Sales:</span> {formatCurrency(payload[0].value)}
                        </p>
                        <p className="flex items-center text-xs">
                            <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-[#82ca9d]"></span>
                            <span className="mr-1 font-semibold">Profit:</span> {formatCurrency(payload[1].value)}
                        </p>
                        <p className="flex items-center text-xs">
                            <span className="mr-1.5 inline-block h-2.5 w-2.5 rounded-full bg-[#ffc658]"></span>
                            <span className="mr-1 font-semibold">Orders:</span> {payload[2].value}
                        </p>
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="col-span-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div>
                    <div className="flex items-center space-x-2">
                        <TrendingUp className="text-muted-foreground h-5 w-5" />
                        <CardTitle className="text-xl font-semibold tracking-tight">Sales Overview</CardTitle>
                    </div>
                    <CardDescription className="mt-1.5">Performance over the last 6 months</CardDescription>
                </div>
                <Button
                    size="sm"
                    variant="outline"
                    onClick={refreshData}
                    disabled={isRefreshing}
                    className="h-8 gap-1"
                    aria-label="Refresh sales chart data"
                >
                    <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
                    <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                </Button>
            </CardHeader>
            <CardContent className="p-0">
                <div className="grid grid-cols-3 gap-4 border-b px-6 py-3">
                    <div className="flex flex-col">
                        <span className="text-muted-foreground text-sm">Total Sales</span>
                        <span className="text-2xl font-semibold">{formatCurrency(totalSales)}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-muted-foreground text-sm">Total Orders</span>
                        <span className="text-2xl font-semibold">{totalOrders}</span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-muted-foreground text-sm">Total Profit</span>
                        <span className="text-2xl font-semibold">{formatCurrency(totalProfit)}</span>
                    </div>
                </div>
                <div className="h-[350px] px-2 pt-4 pb-2">
                    {isRefreshing ? (
                        <div className="flex h-full w-full items-center justify-center">
                            <div className="w-full space-y-4 px-4">
                                <Skeleton className="h-[320px] w-full" />
                            </div>
                        </div>
                    ) : chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 10 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                                <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={{ stroke: '#e5e7eb' }} />
                                <YAxis
                                    yAxisId="left"
                                    tickFormatter={(value) => `₱${value.toLocaleString()}`}
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickCount={5}
                                />
                                <YAxis
                                    yAxisId="right"
                                    orientation="right"
                                    domain={[0, 'auto']}
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    tickCount={5}
                                />
                                <Tooltip content={<CustomTooltip />} />
                                <Legend verticalAlign="top" height={36} iconType="circle" iconSize={8} wrapperStyle={{ fontSize: '12px' }} />
                                <Line
                                    yAxisId="left"
                                    type="monotone"
                                    dataKey="sales"
                                    stroke="#8884d8"
                                    name="Sales"
                                    strokeWidth={2}
                                    activeDot={{ r: 6 }}
                                    dot={{ r: 4 }}
                                />
                                <Line yAxisId="left" type="monotone" dataKey="profit" stroke="#82ca9d" name="Profit" strokeWidth={2} dot={{ r: 4 }} />
                                <Line
                                    yAxisId="right"
                                    type="monotone"
                                    dataKey="orders"
                                    stroke="#ffc658"
                                    name="Orders"
                                    strokeWidth={2}
                                    dot={{ r: 4 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex h-full items-center justify-center">
                            <p className="text-muted-foreground">No sales data available</p>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
