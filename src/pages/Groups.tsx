import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Users, 
  Search,
  Copy,
  ExternalLink,
  Calendar,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useGroups } from "@/hooks/useGroups";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils"; // Import the utility

const Groups = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const { data: groups = [], isLoading, error } = useGroups();
  const { toast } = useToast();

  const filteredGroups = groups.filter(group =>
    group.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (group.description && group.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const copyGroupCode = async (code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      toast({
        title: "Copied to clipboard",
        description: "Group code has been copied"
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading groups...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">Error Loading Groups</h1>
          <p className="text-muted-foreground mb-6">
            {error instanceof Error ? error.message : "Failed to load groups"}
          </p>
          <div className="mb-4 p-4 bg-muted rounded-lg text-left">
            <p className="text-sm font-mono">Error details:</p>
            <p className="text-xs text-muted-foreground">{error.toString()}</p>
          </div>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">My Groups</h1>
          <p className="text-muted-foreground">Manage your expense groups and track balances</p>
        </div>
        <Link to="/dashboard/groups/new">
          <Button className="gradient-hero text-white border-0 hover:opacity-90 flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Create Group
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <Card className="shadow-soft border-0 gradient-card">
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search groups..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Groups Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredGroups.map((group) => (
          <Card key={group.id} className="shadow-medium border-0 gradient-card hover:shadow-large transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Users className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{group.name}</CardTitle>
                    <p className="text-sm text-muted-foreground">{group.description || "No description"}</p>
                  </div>
                </div>
                <Badge variant="default" className="bg-success text-success-foreground">
                  active
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Group ID */}
              <div className="flex items-center justify-between p-2 bg-background/50 rounded-lg">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground">Group ID</span>
                  <span className="text-sm font-mono">{group.invite_code}</span>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyGroupCode(group.invite_code)}
                  className="h-6 px-2"
                  title="Copy Group ID for others to join"
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>

              {/* Members */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  {group.member_count} members
                </p>
                <div className="flex flex-wrap gap-1">
                  {group.members.slice(0, 3).map((member, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {member.profile?.full_name || member.profile?.email || 'Unknown User'}
                    </Badge>
                  ))}
                  {group.members.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{group.members.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground">Total Expenses</p>
                  <p className="font-semibold flex items-center gap-1">
                    {formatCurrency(group.total_expenses)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Your Balance</p>
                  <p className={`font-semibold ${group.user_balance >= 0 ? 'text-success' : 'text-warning'}`}>
                    {formatCurrency(group.user_balance)}
                  </p>
                </div>
              </div>

              {/* Last Activity */}
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {new Date(group.created_at).toLocaleDateString()}
                </div>
                <Link to={`/dashboard/groups/${group.id}`}>
                  <Button size="sm" variant="ghost" className="h-6 px-2 text-xs">
                    View <ExternalLink className="h-3 w-3 ml-1" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredGroups.length === 0 && !isLoading && (
        <Card className="shadow-medium border-0 gradient-card">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Users className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">No groups found</h3>
            <p className="text-muted-foreground mb-6">
              {searchTerm ? "Try adjusting your search terms" : "Create your first group to start tracking expenses"}
            </p>
            <Link to="/dashboard/groups/new">
              <Button className="gradient-hero text-white border-0 hover:opacity-90">
                Create Your First Group
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Groups;