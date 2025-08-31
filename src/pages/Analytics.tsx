import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from "recharts";
import { 
  TrendingUp, 
  PieChart as PieIcon, 
  BarChart3,
  Calendar,
  Users
} from "lucide-react";
import { useState } from "react";
import { formatCurrency } from "@/lib/utils";

const Analytics = () => {
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [timeRange, setTimeRange] = useState("30days");

  // Mock data
  const groups = [
    { id: "all", name: "All Groups" },
    { id: "1", name: "Weekend Trip" },
    { id: "2", name: "Apartment" },
    { id: "3", name: "Office Lunch" }
  ];

  const categoryData = [
    { name: "Food & Dining", value: 456.78, percentage: 35.2, color: "#3B82F6" },
    { name: "Transportation", value: 234.50, percentage: 18.1, color: "#8B5CF6" },
    { name: "Accommodation", value: 189.25, percentage: 14.6, color: "#10B981" },
    { name: "Entertainment", value: 167.89, percentage: 12.9, color: "#F59E0B" },
    { name: "Shopping", value: 123.45, percentage: 9.5, color: "#EF4444" },
    { name: "Other", value: 125.67, percentage: 9.7, color: "#6B7280" }
  ];

  const monthlyTrend = [
    { month: "Oct", expenses: 234.50, income: 145.20 },
    { month: "Nov", expenses: 456.78, income: 289.30 },
    { month: "Dec", expenses: 678.90, income: 445.60 },
    { month: "Jan", expenses: 345.67, income: 234.50 },
    { month: "Feb", expenses: 567.89, income: 378.90 },
    { month: "Mar", expenses: 432.10, income: 295.40 }
  ];

  const memberContributions = [
    { name: "You", paid: 567.89, owed: 445.60, net: 122.29 },
    { name: "Sarah", paid: 234.50, owed: 298.75, net: -64.25 },
    { name: "Mike", paid: 189.25, owed: 267.30, net: -78.05 },
    { name: "Jane", paid: 345.67, owed: 324.45, net: 21.22 },
    { name: "Alex", paid: 298.75, owed: 234.50, net: 64.25 }
  ];

  const totalExpenses = categoryData.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Analytics</h1>
          <p className="text-muted-foreground">Insights into your spending patterns and group dynamics</p>
        </div>
        
        {/* Filters */}
        <div className="flex gap-3">
          <Select value={selectedGroup} onValueChange={setSelectedGroup}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {groups.map((group) => (
                <SelectItem key={group.id} value={group.id}>
                  {group.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">7 Days</SelectItem>
              <SelectItem value="30days">30 Days</SelectItem>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="shadow-soft border-0 gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
            <BarChart3 className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalExpenses)}</div>
            <p className="text-xs text-muted-foreground">+12.5% from last month</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-0 gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Groups</CardTitle>
            <Users className="h-4 w-4 text-accent" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">4</div>
            <p className="text-xs text-muted-foreground">2 new this month</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-0 gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average per Person</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{formatCurrency(totalExpenses / 5)}</div>
            <p className="text-xs text-muted-foreground">Across all groups</p>
          </CardContent>
        </Card>

        <Card className="shadow-soft border-0 gradient-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Net Balance</CardTitle>
            <PieIcon className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">+₹156.25</div>
            <p className="text-xs text-muted-foreground">You're owed</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid lg:grid-cols-2 gap-6">
        
        {/* Category Breakdown - Pie Chart */}
        <Card className="shadow-medium border-0 gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieIcon className="h-5 w-5 text-primary" />
              Expenses by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid lg:grid-cols-2 gap-4">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={40}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`₹${value.toFixed(2)}`, "Amount"]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              <div className="space-y-2">
                {categoryData.map((category, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <span>{category.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(category.value)}</div>
                      <div className="text-muted-foreground">{category.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Monthly Trend - Line Chart */}
        <Card className="shadow-medium border-0 gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-accent" />
              Monthly Spending Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis 
                    dataKey="month" 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="hsl(var(--muted-foreground))"
                    fontSize={12}
                  />
                  <Tooltip 
                    formatter={(value: number, name: string) => [`₹${value.toFixed(2)}`, name === "expenses" ? "Expenses" : "Your Share"]}
                    labelStyle={{ color: "hsl(var(--foreground))" }}
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--background))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "6px"
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="expenses" 
                    stroke="#3B82F6" 
                    strokeWidth={2}
                    dot={{ fill: "#3B82F6", strokeWidth: 2 }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="income" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: "#10B981", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Member Contributions - Bar Chart */}
      <Card className="shadow-medium border-0 gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-success" />
            Individual Contributions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={memberContributions}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis 
                  dataKey="name" 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <YAxis 
                  stroke="hsl(var(--muted-foreground))"
                  fontSize={12}
                />
                <Tooltip 
                  formatter={(value: number, name: string) => [
                    `₹${value}`,
                    name === "paid" ? "Paid" : name === "owed" ? "Share" : "Net"
                  ]}
                  labelStyle={{ color: "hsl(var(--foreground))" }}
                  contentStyle={{ 
                    backgroundColor: "hsl(var(--background))", 
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "6px"
                  }}
                />
                <Bar dataKey="paid" fill="#3B82F6" radius={[2, 2, 0, 0]} />
                <Bar dataKey="owed" fill="#8B5CF6" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          {/* Net balances summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {memberContributions.map((member, index) => (
              <div key={index} className="text-center p-3 bg-background/50 rounded-lg">
                <p className="font-medium text-sm">{member.name}</p>
                <Badge 
                  variant={member.net >= 0 ? "default" : "secondary"}
                  className={member.net >= 0 ? "bg-success text-success-foreground" : "bg-warning text-warning-foreground"}
                >
                  {member.net >= 0 ? "+" : ""}{formatCurrency(Math.abs(member.net))}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;