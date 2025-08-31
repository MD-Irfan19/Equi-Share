import { NavLink, useLocation } from "react-router-dom";
import { 
  Home, 
  Users, 
  Plus, 
  List, 
  BarChart3, 
  FileText,
  Calculator,
  TrendingUp,
  User 
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigation = [
  {
    title: "Overview",
    items: [
      { title: "Dashboard", url: "/dashboard", icon: Home },
      { title: "My Groups", url: "/dashboard/groups", icon: Users },
      { title: "New Group", url: "/dashboard/groups/new", icon: Plus },
      { title: "My Account", url: "/dashboard/account", icon: User },
    ]
  },
  {
    title: "Expenses",
    items: [
      { title: "Add Expense", url: "/dashboard/expenses/new", icon: Plus },
      { title: "All Expenses", url: "/dashboard/expenses", icon: List },
      { title: "Settlements", url: "/dashboard/settlements", icon: Calculator },
    ]
  },
  {
    title: "Analytics",
    items: [
      { title: "Insights", url: "/dashboard/analytics", icon: BarChart3 },
      { title: "Reports", url: "/dashboard/reports", icon: FileText },
    ]
  }
];

export function AppSidebar() {
  const { state } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isActive = (path: string) => currentPath === path;

  return (
    <Sidebar className="border-r border-sidebar-border bg-sidebar">
      <SidebarContent>
        {navigation.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs uppercase font-medium">
              {section.title}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild className={isActive(item.url) ? "bg-sidebar-accent text-sidebar-accent-foreground" : ""}>
                      <NavLink to={item.url} className="flex items-center space-x-3 px-3 py-2 rounded-md transition-colors">
                        <item.icon className="h-4 w-4" />
                        {state === "expanded" && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        
        {/* Quick Stats in collapsed mode */}
        {state === "expanded" && (
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs uppercase font-medium">
              Quick Stats
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <div className="px-3 py-2 space-y-2">
                <div className="bg-success/10 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <TrendingUp className="h-4 w-4 text-success" />
                    <span className="text-sm font-medium">You're Owed</span>
                  </div>
                  <p className="text-lg font-bold text-success">₹245.50</p>
                </div>
                <div className="bg-warning/10 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <Calculator className="h-4 w-4 text-warning" />
                    <span className="text-sm font-medium">You Owe</span>
                  </div>
                  <p className="text-lg font-bold text-warning">₹89.25</p>
                </div>
              </div>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}