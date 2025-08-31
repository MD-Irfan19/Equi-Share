import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useCreateGroup, useJoinGroup } from '@/hooks/useGroups';
import { Copy, Users, Plus, LogIn, ArrowLeft } from 'lucide-react';

export default function GroupCreateJoin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const createGroupMutation = useCreateGroup();
  const joinGroupMutation = useJoinGroup();
  
  const [createdGroupCode, setCreatedGroupCode] = useState<string | null>(null);
  
  const [createForm, setCreateForm] = useState({
    name: '',
    description: ''
  });
  
  const [joinForm, setJoinForm] = useState({
    code: ''
  });

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const group = await createGroupMutation.mutateAsync({
        name: createForm.name,
        description: createForm.description
      });

      setCreatedGroupCode(group.invite_code);
      setCreateForm({ name: '', description: '' });
      
      toast({
        title: "Group created successfully!",
        description: `Your group "${createForm.name}" has been created with code: ${group.invite_code}`
      });

      // Navigate to the group dashboard after a short delay
      setTimeout(() => {
        navigate(`/dashboard/groups/${group.id}`);
      }, 2000);

    } catch (error: any) {
      toast({
        title: "Error creating group",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const handleJoinGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    try {
      const group = await joinGroupMutation.mutateAsync(joinForm.code.toUpperCase());

      toast({
        title: "Successfully joined group!",
        description: `You've joined "${group.name}"`
      });
      
      // Navigate to the group dashboard
      navigate(`/dashboard/groups/${group.id}`);

    } catch (error: any) {
      toast({
        title: "Error joining group",
        description: error.message,
        variant: "destructive"
      });
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: "Group code has been copied to your clipboard"
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Could not copy to clipboard",
        variant: "destructive"
      });
    }
  };



  return (
    <div className="min-h-screen bg-gradient-subtle p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header with back button */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate('/dashboard/groups')}
            className="p-2"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-3xl font-bold text-foreground mb-2">Groups</h1>
            <p className="text-muted-foreground">Create a new group or join an existing one</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Create Group Card */}
          <Card className="shadow-medium border-0 bg-card">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                <Plus className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl">Create Group</CardTitle>
              <CardDescription>
                Start a new expense group and invite your friends
              </CardDescription>
            </CardHeader>
            <CardContent>
              {createdGroupCode ? (
                <div className="space-y-4 text-center">
                  <div className="p-4 bg-success/10 border border-success/20 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-2">Group Code</p>
                    <div className="flex items-center justify-center gap-2">
                      <code className="text-2xl font-mono font-bold text-success bg-success/5 px-4 py-2 rounded">
                        {createdGroupCode}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => copyToClipboard(createdGroupCode)}
                        className="text-success hover:text-success hover:bg-success/10"
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Share this code with others to let them join your group
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    onClick={() => setCreatedGroupCode(null)}
                    className="w-full"
                  >
                    Create Another Group
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleCreateGroup} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="groupName">Group Name *</Label>
                    <Input
                      id="groupName"
                      value={createForm.name}
                      onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                      placeholder="e.g. Weekend Trip, Office Lunch"
                      required
                      disabled={createGroupMutation.isPending}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="groupDescription">Description (Optional)</Label>
                    <Textarea
                      id="groupDescription"
                      value={createForm.description}
                      onChange={(e) => setCreateForm({...createForm, description: e.target.value})}
                      placeholder="Brief description of the group..."
                      rows={3}
                      disabled={createGroupMutation.isPending}
                    />
                  </div>

                  <Button type="submit" disabled={createGroupMutation.isPending || !createForm.name.trim()} className="w-full">
                    {createGroupMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />
                        Creating Group...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4 mr-2" />
                        Create Group
                      </>
                    )}
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>

          {/* Join Group Card */}
          <Card className="shadow-medium border-0 bg-card">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center">
                <LogIn className="w-8 h-8 text-accent" />
              </div>
              <CardTitle className="text-2xl">Join Group</CardTitle>
              <CardDescription>
                Enter a group code to join an existing expense group
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleJoinGroup} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="groupCode">Group Code *</Label>
                  <Input
                    id="groupCode"
                    value={joinForm.code}
                    onChange={(e) => setJoinForm({code: e.target.value.toUpperCase()})}
                    placeholder="Enter 8-character code"
                    maxLength={8}
                    className="text-center font-mono text-lg tracking-widest"
                    required
                    disabled={joinGroupMutation.isPending}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ask a group member for the invite code
                  </p>
                </div>

                                  <Button type="submit" disabled={joinGroupMutation.isPending || !joinForm.code.trim()} className="w-full">
                    {joinGroupMutation.isPending ? (
                      <>
                        <div className="w-4 h-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent mr-2" />
                        Joining Group...
                      </>
                    ) : (
                      <>
                        <LogIn className="w-4 h-4 mr-2" />
                        Join Group
                      </>
                    )}
                  </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}