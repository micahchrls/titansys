import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const data = [
  { category: 'Engine Parts', sales: 245, revenue: 52400 },
  { category: 'Brake System', sales: 188, revenue: 32600 },
  { category: 'Electrical', sales: 156, revenue: 28900 },
  { category: 'Suspension', sales: 142, revenue: 25700 },
  { category: 'Filters', sales: 125, revenue: 12500 },
  { category: 'Body Parts', sales: 98, revenue: 19600 },
];

export function CategorySales() {
  return (
    <Card className="col-span-full lg:col-span-2">
      <CardHeader>
        <CardTitle>Sales by Category</CardTitle>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" angle={-45} textAnchor="end" height={70} />
            <YAxis yAxisId="left" orientation="left" stroke="#82ca9d" />
            <YAxis yAxisId="right" orientation="right" stroke="#8884d8" />
            <Tooltip />
            <Bar yAxisId="left" dataKey="sales" fill="#82ca9d" name="Units Sold" />
            <Bar yAxisId="right" dataKey="revenue" fill="#8884d8" name="Revenue ($)" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
