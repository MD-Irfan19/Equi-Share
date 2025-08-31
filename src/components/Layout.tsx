import { Outlet } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

const Layout = () => {
  const { signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gradient-subtle">
        <AppSidebar />
        <div className="flex-1">
          {/* Top bar */}
          <header className="h-14 border-b bg-card shadow-soft flex items-center justify-between px-4">
            <div className="flex items-center space-x-2">
              <SidebarTrigger />
              <div className="ml-4 flex items-center space-x-2">
                <div className="h-6 w-6 rounded gradient-hero flex items-center justify-center">
                  <span className="text-xs font-bold text-white">E</span>
                </div>
                <span className="font-semibold text-foreground">EquiShare</span>
              </div>
            </div>
            <Button variant="ghost" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </header>
          
          {/* Main content */}
          <main className="flex-1 p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Layout;