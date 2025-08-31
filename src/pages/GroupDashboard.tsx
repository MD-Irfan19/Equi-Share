import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Users, Plus, DollarSign, ArrowLeft, Copy } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/utils'; // Import the utility

interface Group {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  created_by: string;
  created_at: string;
}

interface GroupMember {
  id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
  };
}

export default function GroupDashboard() {
  const { groupId } = useParams<{ groupId: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<GroupMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (groupId) {
      fetchGroupData();
    }
  }, [groupId]);

  const fetchGroupData = async () => {
    try {
      setLoading(true);
      
      const { data: groupData, error: groupError } = await supabase
        .from('groups')
        .select('*')
        .eq('id', groupId)
        .single();

      if (groupError) throw groupError;
      setGroup(groupData);

      const { data: membersData, error: membersError } = await supabase
        .from('group_members')
        .select('*')
        .eq('group_id', groupId);

      if (membersError) throw membersError;
      
      // Fetch profile information separately
      const memberIds = membersData?.map(m => m.user_id) || [];
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('user_id, full_name, email')
        .in('user_id', memberIds);

      // Combine member and profile data
      const membersWithProfiles = membersData?.map(member => ({
        ...member,
        profile: profilesData?.find(p => p.user_id === member.user_id)
      })) || [];
      
      setMembers(membersWithProfiles);

    } catch (error: any) {
      toast({
        title: "Error loading group",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const copyInviteCode = async () => {
    if (!group) return;
    
    try {
      await navigator.clipboard.writeText(group.invite_code);
      toast({
        title: "Copied to clipboard",
        description: "Group invite code has been copied"
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="w-8 h-8 animate-spin rounded-full border-2 border-primary border-t-transparent mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading group...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="min-h-screen bg-gradient-subtle p-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-foreground mb-4">Group Not Found</h1>
            <p className="text-muted-foreground mb-6">
              The group you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => navigate('/dashboard/groups')}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Groups
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              onClick={() => navigate('/dashboard/groups')}
              className="p-2"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-foreground">{group.name}</h1>
              <p className="text-muted-foreground">
                {group.description || "No description provided"}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={copyInviteCode}
              className="flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Code
            </Button>
            <Link to={`/dashboard/expenses/new?group=${groupId}`}>
              <Button className="gradient-hero text-white border-0 hover:opacity-90">
                <Plus className="w-4 h-4 mr-2" />
                Add Expense
              </Button>
            </Link>
          </div>
        </div>

        {/* Group Info Card */}
        <Card className="shadow-medium border-0 bg-card mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Group Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-background/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Invite Code</p>
                <div className="flex items-center gap-2">
                  <code className="text-lg font-mono font-bold text-primary bg-primary/5 px-3 py-1 rounded">
                    {group.invite_code}
                  </code>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={copyInviteCode}
                    className="h-8 px-2"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              <div className="p-4 bg-background/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Members</p>
                <p className="text-2xl font-bold text-foreground">{members.length}</p>
              </div>
              <div className="p-4 bg-background/50 rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">Created</p>
                <p className="text-foreground">
                  {new Date(group.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Members List */}
        <Card className="shadow-medium border-0 bg-card mb-8">
          <CardHeader>
            <CardTitle>Group Members</CardTitle>
            <CardDescription>
              People who are part of this expense group
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-3 bg-background/50 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">
                        {member.profile?.full_name || member.profile?.email || 'Unknown User'}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {member.profile?.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={member.role === 'admin' ? 'default' : 'secondary'}>
                      {member.role}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Joined {new Date(member.joined_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to={`/dashboard/expenses?group=${groupId}`}>
            <Card className="shadow-medium border-0 bg-card hover:shadow-large transition-shadow cursor-pointer">
              <CardContent className="pt-6 text-center">
                <DollarSign className="h-4 w-4 text-accent" />
                <p className="font-medium text-foreground">View Expenses</p>
                <p className="text-sm text-muted-foreground">See all group expenses</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to={`/dashboard/expenses/new?group=${groupId}`}>
            <Card className="shadow-medium border-0 bg-card hover:shadow-large transition-shadow cursor-pointer">
              <CardContent className="pt-6 text-center">
                <Plus className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="text-medium text-foreground">Add Expense</p>
                <p className="text-sm text-muted-foreground">Record a new expense</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to={`/dashboard/settlements?group=${groupId}`}>
            <Card className="shadow-medium border-0 bg-card hover:shadow-large transition-shadow cursor-pointer">
              <CardContent className="pt-6 text-center">
                <Users className="w-8 h-8 text-primary mx-auto mb-2" />
                <p className="font-medium text-foreground">Settlements</p>
                <p className="text-sm text-muted-foreground">View balances & settle up</p>
              </CardContent>
            </Card>
          </Link>
          
          <Link to={`/dashboard/analytics?group=${groupId}`}>
            <Card className="shadow-medium border-0 bg-card hover:shadow-large transition-shadow cursor-pointer">
              <CardContent className="pt-6 text-center">
                <DollarSign className="h-4 w-4 text-warning" />
                <p className="font-medium text-foreground">Analytics</p>
                <p className="text-sm text-muted-foreground">Group spending insights</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
