import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const data = [
  { name: 'Jan', sales: 4000, orders: 240, profit: 2400 },
  { name: 'Feb', sales: 3000, orders: 198, profit: 1800 },
  { name: 'Mar', sales: 5000, orders: 300, profit: 3000 },
  { name: 'Apr', sales: 2780, orders: 208, profit: 1668 },
  { name: 'May', sales: 1890, orders: 167, profit: 1134 },
  { name: 'Jun', sales: 2390, orders: 198, profit: 1434 },
  { name: 'Jul', sales: 3490, orders: 267, profit: 2094 },
];

export function SalesChart() {
  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="text-xl font-semibold tracking-tight">Sales Overview</CardTitle>
      </CardHeader>
      <CardContent className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart 
            data={data}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis yAxisId="left" />
            <YAxis yAxisId="right" orientation="right" />
            <Tooltip />
            <Legend />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="sales" 
              stroke="#8884d8" 
              name="Sales ($)"
              strokeWidth={2}
            />
            <Line 
              yAxisId="left"
              type="monotone" 
              dataKey="profit" 
              stroke="#82ca9d" 
              name="Profit ($)"
              strokeWidth={2}
            />
            <Line 
              yAxisId="right"
              type="monotone" 
              dataKey="orders" 
              stroke="#ffc658" 
              name="Orders"
              strokeWidth={2}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
