import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X, CheckCircle, Users, Calculator, BarChart3, AlertCircle, FileText, Clock, Heart, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface LearnMoreModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const LearnMoreModal = ({ open, onOpenChange }: LearnMoreModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-card border-0 shadow-large">
        <DialogHeader className="relative pb-6">
          <DialogTitle className="text-2xl font-bold text-foreground text-center">
            Learn More
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-8">
          {/* What is EquiShare Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">What is EquiShare?</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed ml-11">
              A free platform to manage group expenses. It automatically splits costs, tracks balances, and suggests the easiest way to settle up.
            </p>
          </div>

          {/* Key Features Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-accent/10 flex items-center justify-center">
                <BarChart3 className="h-4 w-4 text-accent" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Key Features</h3>
            </div>
            <div className="space-y-3 ml-11">
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                <span className="text-muted-foreground">Create or join groups easily</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                <span className="text-muted-foreground">Add and track shared expenses</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                <span className="text-muted-foreground">Automatic splitting & smart settlements</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                <span className="text-muted-foreground">Dashboards with charts & insights</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                <span className="text-muted-foreground">Overspending alerts & budget tracking</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckCircle className="h-5 w-5 text-success flex-shrink-0" />
                <span className="text-muted-foreground">Downloadable reports (CSV/PDF)</span>
              </div>
            </div>
          </div>

          {/* Why Use EquiShare Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-success/10 flex items-center justify-center">
                <Heart className="h-4 w-4 text-success" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Why Use EquiShare?</h3>
            </div>
            <div className="space-y-3 ml-11">
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <span className="text-muted-foreground">No more awkward money conversations</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <span className="text-muted-foreground">Saves time with instant splits</span>
              </div>
              <div className="flex items-start gap-3">
                <div className="h-2 w-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                <span className="text-muted-foreground">Clear, transparent, and fair for everyone</span>
              </div>
            </div>
          </div>

          {/* Quick Example Section */}
          <div className="bg-primary-light rounded-lg p-6 border border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <div className="h-8 w-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Calculator className="h-4 w-4 text-primary" />
              </div>
              <h4 className="font-semibold text-foreground">Quick Example</h4>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              <strong className="text-foreground">Alice pays ₹1000 for dinner.</strong> EquiShare instantly splits it among 4 friends → each owes ₹250. Instead of 3 separate payments, Smart Settlement suggests just one transaction to settle everything.
            </p>
          </div>

          {/* Footer CTA */}
          <div className="pt-4 border-t">
            <Link to="/demo" className="block">
              <Button 
                size="lg" 
                className="w-full bg-primary text-primary-foreground hover:bg-primary-hover shadow-glow"
                onClick={() => onOpenChange(false)}
              >
                View Demo
              </Button>
            </Link>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};