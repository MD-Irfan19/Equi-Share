import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowRight, Users, Calculator, TrendingUp, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';
import { LearnMoreModal } from '@/components/LearnMoreModal';
import { useState } from 'react';

const Index = () => {
  const { user, loading } = useAuth();
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-subtle">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }
  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Header */}
      <header className="border-b bg-card shadow-soft">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-lg gradient-hero flex items-center justify-center">
                <Users className="h-4 w-4 text-white" />
              </div>
              <span className="text-xl font-bold text-foreground">EquiShare</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link to="/auth">
                <Button variant="ghost">Login</Button>
              </Link>
              <Link to="/auth">
                <Button className="gradient-hero text-white border-0 hover:opacity-90">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl font-bold text-foreground mb-6">
            EquiShare
          </h1>
          <p className="text-2xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Where Every Share is Fair
          </p>
          <p className="text-lg text-muted-foreground mb-12 max-w-3xl mx-auto">
            Simplify group expenses with smart splitting, minimal settlements, and beautiful insights. 
            Perfect for trips, roommates, and shared experiences.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/auth">
              <Button size="lg" className="gradient-hero text-white border-0 hover:opacity-90 text-lg px-8 py-3">
                Start Sharing Fairly <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
            <Button 
              size="lg" 
              variant="outline" 
              className="text-lg px-8 py-3"
              onClick={() => setIsLearnMoreOpen(true)}
            >
              Learn More
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6 bg-background">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Everything you need for group expenses
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              From simple splitting to smart settlements, EquiShare handles it all
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="p-6 shadow-soft border-0 gradient-card">
              <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Easy Groups</h3>
              <p className="text-muted-foreground">Create groups instantly with shareable codes. Add friends and start tracking expenses right away.</p>
            </Card>

            <Card className="p-6 shadow-soft border-0 gradient-card">
              <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center mb-4">
                <Calculator className="h-6 w-6 text-accent" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Smart Splitting</h3>
              <p className="text-muted-foreground">Automatic expense splitting with custom categories. Handle unequal splits with ease.</p>
            </Card>

            <Card className="p-6 shadow-soft border-0 gradient-card">
              <div className="h-12 w-12 rounded-lg bg-success/10 flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Smart Settlements</h3>
              <p className="text-muted-foreground">Minimize transactions with intelligent settlement suggestions. Pay less, settle faster.</p>
            </Card>

            <Card className="p-6 shadow-soft border-0 gradient-card">
              <div className="h-12 w-12 rounded-lg bg-warning/10 flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-warning" />
              </div>
              <h3 className="text-xl font-semibold text-foreground mb-2">Beautiful Insights</h3>
              <p className="text-muted-foreground">Visualize spending patterns with charts and reports. Export data whenever you need.</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-12 px-6">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="h-6 w-6 rounded gradient-hero flex items-center justify-center">
              <Users className="h-3 w-3 text-white" />
            </div>
            <span className="font-semibold text-foreground">EquiShare</span>
          </div>
          <p className="text-muted-foreground">© 2024 EquiShare. Making group expenses fair and simple.</p>
        </div>
      </footer>

      {/* Learn More Modal */}
      <LearnMoreModal open={isLearnMoreOpen} onOpenChange={setIsLearnMoreOpen} />
    </div>
  );
};

export default Index;