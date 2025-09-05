import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, PieChart, LineChart as LineIcon, BarChart as BarIcon, Calculator, ArrowUpIcon } from "lucide-react";
import Papa from "papaparse";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart as RechartsePie,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { formatCurrency } from "@/lib/utils";

interface ExpenseData {
  date: string;
  amount: number;
  category: string;
  paid_by: string;
  type: 'expense' | 'income';
}

interface ChartData {
  categories: {
    name: string;
    value: number;
    percentage: number;
    color: string;
  }[];
  monthly: {
    month: string;
    expenses: number;
    income: number;
  }[];
  contributions: {
    name: string;
    paid: number;
    owed: number;
    net: number;
  }[];
  settlements: {
    from: string;
    to: string;
    amount: number;
  }[];
}

const MOCK_DATA: ChartData = {
  categories: [
    { name: "Food & Dining", value: 456.78, percentage: 35.2, color: "#3B82F6" },
    { name: "Transportation", value: 234.50, percentage: 18.1, color: "#8B5CF6" },
    { name: "Accommodation", value: 189.25, percentage: 14.6, color: "#10B981" },
    { name: "Entertainment", value: 167.89, percentage: 12.9, color: "#F59E0B" },
    { name: "Shopping", value: 123.45, percentage: 9.5, color: "#EF4444" },
    { name: "Other", value: 125.67, percentage: 9.7, color: "#6B7280" }
  ],
  monthly: [
    { month: "Oct", expenses: 234.50, income: 145.20 },
    { month: "Nov", expenses: 456.78, income: 289.30 },
    { month: "Dec", expenses: 678.90, income: 445.60 },
    { month: "Jan", expenses: 345.67, income: 234.50 },
    { month: "Feb", expenses: 567.89, income: 378.90 },
    { month: "Mar", expenses: 432.10, income: 295.40 }
  ],
  contributions: [
   { name: "You", paid: 567.89, owed: 445.60, net: 122.29 },
    { name: "Sarah", paid: 234.50, owed: 298.75, net: -64.25 },
    { name: "Mike", paid: 189.25, owed: 267.30, net: -78.05 },
    { name: "Jane", paid: 345.67, owed: 324.45, net: 21.22 },
    { name: "Alex", paid: 298.75, owed: 234.50, net: 64.25 }
  ],
  settlements: [
    { from: "Bob", to: "Alice", amount: 2350 },
    { from: "Charlie", to: "Alice", amount: 1150 },
    { from: "David", to: "Eve", amount: 850 },
    { from: "Bob", to: "Eve", amount: 650 }
  ]
};

const Demo = () => {
  const [chartData, setChartData] = useState<ChartData>(MOCK_DATA);
  const [isLoading, setIsLoading] = useState(false);

  const processCSVData = (data: ExpenseData[]) => {
    const totalExpenses = data.reduce((sum, row) => sum + (row.type === 'expense' ? row.amount : 0), 0);
    
    // Category processing
    const categoryMap = new Map<string, number>();
    data.forEach(row => {
      if (row.type === 'expense') {
        const current = categoryMap.get(row.category) || 0;
        categoryMap.set(row.category, current + row.amount);
      }
    });

    // Monthly processing
    const monthlyMap = new Map<string, { expenses: number; income: number }>();
    data.forEach(row => {
      const month = new Date(row.date).toLocaleString('default', { month: 'short' });
      const current = monthlyMap.get(month) || { expenses: 0, income: 0 };
      if (row.type === 'expense') {
        current.expenses += row.amount;
      } else {
        current.income += row.amount;
      }
      monthlyMap.set(month, current);
    });

    // Contributions processing
    const personMap = new Map<string, { paid: number; owed: number }>();
    data.forEach(row => {
      if (row.type === 'expense') {
        const current = personMap.get(row.paid_by) || { paid: 0, owed: 0 };
        current.paid += row.amount;
        personMap.set(row.paid_by, current);
      }
    });

    const averageOwed = totalExpenses / personMap.size;
    personMap.forEach((value) => {
      value.owed = averageOwed;
    });

    // Update chart data
    setChartData({
      categories: Array.from(categoryMap.entries()).map(([name, value], index) => ({
        name,
        value,
        percentage: Number(((value / totalExpenses) * 100).toFixed(1)),
        color: MOCK_DATA.categories[index % MOCK_DATA.categories.length].color
      })),
      monthly: Array.from(monthlyMap.entries())
        .sort((a, b) => {
          const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
          return months.indexOf(a[0]) - months.indexOf(b[0]);
        })
        .map(([month, data]) => ({
          month,
          expenses: data.expenses,
          income: data.income
        })),
      contributions: Array.from(personMap.entries()).map(([name, data]) => ({
        name,
        paid: data.paid,
        owed: data.owed,
        net: data.paid - data.owed
      })),
      settlements: calculateSettlements(Array.from(personMap.entries()))
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsLoading(true);
      Papa.parse<ExpenseData>(file, {
        header: true,
        complete: (results) => {
          processCSVData(results.data);
          setIsLoading(false);
        }
      });
    }
  };

  // Add helper function for settlements
  const calculateSettlements = (entries: [string, { paid: number; owed: number }][]) => {
    const balances = entries.map(([name, data]) => ({
      name,
      balance: data.paid - data.owed
    })).sort((a, b) => a.balance - b.balance);

    const settlements = [];
    let i = 0, j = balances.length - 1;
    
    while (i < j) {
      const amount = Math.min(Math.abs(balances[i].balance), balances[j].balance);
      if (amount > 0) {
        settlements.push({
          from: balances[i].name,
          to: balances[j].name,
          amount: Math.round(amount)
        });
      }
      balances[i].balance += amount;
      balances[j].balance -= amount;
      
      if (Math.abs(balances[i].balance) < 0.01) i++;
      if (Math.abs(balances[j].balance) < 0.01) j--;
    }
    
    return settlements;
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background/95 border rounded-lg shadow-sm p-2 text-sm">
          <p className="font-medium">{data.name}</p>
          <p className="font-semibold">{formatCurrency(data.value)}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">EquiShare Demo</h1>
          <p className="text-muted-foreground">Upload your expenses to see insights & settlements</p>
        </div>
      </div>

      {/* Upload Section */}
      <Card className="border-dashed border-2 shadow-medium gradient-card">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center gap-4">
            <Upload className={`h-8 w-8 ${isLoading ? 'animate-bounce' : ''} text-primary`} />
            <p className="text-sm text-muted-foreground text-center">
              Upload your expense CSV file (date, amount, category, paid_by)
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="hidden"
              id="csv-upload"
            />
            <label htmlFor="csv-upload">
              <Button variant="outline" className="cursor-pointer">
                {isLoading ? 'Processing...' : 'Upload CSV'}
              </Button>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Expense Categories */}
        <Card className="shadow-medium border-0 gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5 text-primary" />
              Expenses by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[400px] relative">
            <div className="flex items-center justify-between h-full">
              <div className="w-[55%] h-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsePie>
                    <Pie
                      data={chartData.categories}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={80}
                      outerRadius={110}
                      paddingAngle={2}
                    >
                      {chartData.categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={CustomTooltip}
                      cursor={false}
                    />
                  </RechartsePie>
                </ResponsiveContainer>
              </div>
              <div className="w-[45%] space-y-3 pr-4">
                {chartData.categories.map((entry, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: entry.color }}
                      />
                      <span className="text-sm font-medium">{entry.name}</span>
                    </div>
                    <div className="text-sm text-right">
                      <div className="font-semibold">{formatCurrency(entry.value)}</div>
                      <div className="text-muted-foreground text-xs">
                        {entry.percentage}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend */}
        <Card className="shadow-medium border-0 gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LineIcon className="h-5 w-5 text-primary" />
              Monthly Spending Trend
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart 
                data={chartData.monthly}
                margin={{ top: 10, right: 10, left: 10, bottom: 10 }}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))"
                  horizontal={true}
                  vertical={false}
                />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                  tickFormatter={(value) => `₹${value/1000}k`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                  }}
                  formatter={(value: number) => [formatCurrency(value), ""]}
                  labelStyle={{ fontWeight: 500 }}
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#3B82F6" }}
                  activeDot={{ r: 6 }}
                  name="Expenses"
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10B981"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#10B981" }}
                  activeDot={{ r: 6 }}
                  name="Income"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Individual Contributions */}
      <Card className="shadow-medium border-0 gradient-card">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarIcon className="h-5 w-5 text-emerald-500" />
            Individual Contributions
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData.contributions}
                margin={{ top: 20, right: 25, left: 15, bottom: 20 }}
                barGap={8}
              >
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke="hsl(var(--border))"
                  vertical={false}
                  opacity={0.5}
                />
                <XAxis 
                  dataKey="name" 
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                  tick={{ fill: 'hsl(var(--foreground))', fontSize: 13 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  dx={-8}
                  tick={{ 
                    fill: 'hsl(var(--muted-foreground))',
                    fontSize: 12
                  }}
                  tickFormatter={(value) => `₹${value.toFixed(2)}`}
                  width={80}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--background))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "0.5rem",
                    padding: "8px 12px",
                  }}
                  formatter={(value: number) => [formatCurrency(value), ""]}
                  labelStyle={{ 
                    fontWeight: 600,
                    marginBottom: "4px"
                  }}
                />
                <Bar 
                  dataKey="paid" 
                  fill="#3B82F6" 
                  name="Paid"
                  radius={[4, 4, 0, 0]}
                />
                <Bar 
                  dataKey="owed" 
                  fill="#8B5CF6" 
                  name="Owed"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-center flex-wrap gap-4 mt-2">
            {chartData.contributions.map((member, index) => (
              <div
                key={index}
                className={`px-4 py-2 rounded-full text-[0.95rem] font-semibold flex items-center gap-1.5 min-w-fit
                  ${member.net >= 0 
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                    : 'bg-orange-50 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'
                  }`}
              >
                {member.name}
                {member.net >= 0 ? (
                  <span className="inline-flex items-center">
                    <ArrowUpIcon className="h-4 w-4 mr-0.5" />
                    +{formatCurrency(member.net)}
                  </span>
                ) : (
                  formatCurrency(member.net)
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Settlements */}
      <Card className="shadow-medium border-0 gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5 text-primary" />
            Smart Settlements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {chartData.settlements.map((settlement, index) => (
              <div key={index} className="flex justify-between items-center p-4 bg-background/50 rounded-lg">
                <div className="flex items-center gap-2">
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    {settlement.from[0]}
                  </div>
                  <span className="font-medium">{settlement.from} → {settlement.to}</span>
                </div>
                <span className="font-bold">{formatCurrency(settlement.amount)}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Demo;
