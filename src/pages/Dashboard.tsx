import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  TrendingUp, 
  Calculator, 
  Users,
  DollarSign,
  Activity
} from "lucide-react";
import { Link } from "react-router-dom";
import { formatCurrency } from "@/lib/utils";

const Dashboard = () => {
  // Mock data for demonstration
  const stats = [
    {
      title: "Total Balance",
      value: "₹156.25",
      description: "Net amount you're owed",
      icon: DollarSign,
      color: "text-success",
      bgColor: "bg-success/10"
    },
    {
      title: "Active Groups",
      value: "4",
      description: "Groups with recent activity",
      icon: Users,
      color: "text-primary",
      bgColor: "bg-primary/10"
    },
    {
      title: "This Month",
      value: "₹1,234.56",
      description: "Total expenses tracked",
      icon: Activity,
      color: "text-accent",
      bgColor: "bg-accent/10"
    },
    {
      title: "Pending Settlements",
      value: "3",
      description: "Transactions to settle",
      icon: Calculator,
      color: "text-warning",
      bgColor: "bg-warning/10"
    }
  ];

  const recentExpenses = [
    {
      id: 1,
      description: "Dinner at Luigi's",
      amount: 89.50,
      paidBy: "You",
      group: "Weekend Trip",
      date: "2024-01-20",
      category: "Food"
    },
    {
      id: 2,
      description: "Uber to Airport",
      amount: 45.30,
      paidBy: "Sarah",
      group: "Weekend Trip",
      date: "2024-01-19",
      category: "Transport"
    },
    {
      id: 3,
      description: "Grocery Shopping",
      amount: 127.89,
      paidBy: "Mike",
      group: "Apartment",
      date: "2024-01-18",
      category: "Food"
    }
  ];

  const activeGroups = [
    { id: 1, name: "Weekend Trip", members: 4, balance: 23.45 },
    { id: 2, name: "Apartment", members: 3, balance: -15.20 },
    { id: 3, name: "Office Lunch", members: 6, balance: 8.75 },
    { id: 4, name: "Vacation 2024", members: 8, balance: 156.80 }
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your expense overview.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/dashboard/groups/new">
            <Button variant="outline" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              New Group
            </Button>
          </Link>
          <Link to="/dashboard/expenses/new">
            <Button className="gradient-hero text-white border-0 hover:opacity-90 flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Add Expense
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index} className="shadow-soft border-0 gradient-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`h-8 w-8 rounded-lg ${stat.bgColor} flex items-center justify-center`}>
                <stat.icon className={`h-4 w-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        
        {/* Recent Expenses */}
        <Card className="lg:col-span-2 shadow-medium border-0 gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Recent Expenses
              <Link to="/dashboard/expenses">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentExpenses.map((expense) => (
                <div key={expense.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <TrendingUp className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{expense.description}</p>
                        <p className="text-sm text-muted-foreground">
                          {expense.group} • Paid by {expense.paidBy}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-foreground">{formatCurrency(expense.amount)}</p>
                    <p className="text-xs text-muted-foreground">{expense.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Active Groups */}
        <Card className="shadow-medium border-0 gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Active Groups
              <Link to="/dashboard/groups">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeGroups.map((group) => (
                <div key={group.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50">
                  <div>
                    <p className="font-medium text-foreground">{group.name}</p>
                    <p className="text-sm text-muted-foreground">{group.members} members</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${group.balance >= 0 ? 'text-success' : 'text-warning'}`}>
                      {formatCurrency(Math.abs(group.balance))}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {group.balance >= 0 ? 'owed' : 'owe'}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;