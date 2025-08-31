import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export interface Group {
  id: string;
  name: string;
  description: string | null;
  invite_code: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface GroupMember {
  id: string;
  group_id: string;
  user_id: string;
  role: string;
  joined_at: string;
  profile?: {
    full_name: string | null;
    email: string | null;
  };
}

export interface GroupWithMembers extends Group {
  members: GroupMember[];
  member_count: number;
  total_expenses: number;
  user_balance: number;
}

export function useGroups() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['groups', user?.id],
    queryFn: async (): Promise<GroupWithMembers[]> => {
      if (!user) {
        console.log('No user found, returning empty array');
        return [];
      }
      
      console.log('Fetching groups for user:', user.id);
      
      try {
        // Use a single query with a join to avoid multiple database calls
        const { data: groupData, error: queryError } = await supabase
          .from('group_members')
          .select(`
            group_id,
            groups!inner (
              id,
              name,
              description,
              invite_code,
              created_by,
              created_at,
              updated_at
            )
          `)
          .eq('user_id', user.id);

        if (queryError) {
          console.error('Error fetching groups with join:', queryError);
          throw new Error(`Failed to fetch groups: ${queryError.message}`);
        }
        
        console.log('Group data fetched:', groupData);
        
        if (!groupData || groupData.length === 0) {
          console.log('No groups found, returning empty array');
          return [];
        }

        // Transform the joined data into our expected format
        const groups: GroupWithMembers[] = groupData.map(item => ({
          ...item.groups,
          members: [], // We'll populate this later
          member_count: 1, // At least the current user
          total_expenses: 0, // We'll calculate this later
          user_balance: 0 // We'll calculate this later
        }));

        // Sort groups by creation date (newest first)
        const sortedGroups = groups.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        console.log('Transformed and sorted groups:', sortedGroups);
        return sortedGroups;
        
      } catch (error) {
        console.error('Error in useGroups:', error);
        if (error instanceof Error) {
          throw new Error(`Failed to load groups: ${error.message}`);
        } else {
          throw new Error('Failed to load groups. Please try again.');
        }
      }
    },
    enabled: !!user,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useCreateGroup() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (groupData: { name: string; description?: string }) => {
      if (!user) throw new Error('No user');
      
      console.log('Creating group with data:', groupData);
      
      try {
        // Generate unique invite code
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let inviteCode = '';
        for (let i = 0; i < 8; i++) {
          inviteCode += chars.charAt(Math.floor(Math.random() * chars.length));
        }

        console.log('Generated invite code:', inviteCode);

        // Create the group
        const { data: group, error: groupError } = await supabase
          .from('groups')
          .insert({
            name: groupData.name,
            description: groupData.description || null,
            invite_code: inviteCode,
            created_by: user.id
          })
          .select()
          .single();

        if (groupError) {
          console.error('Error creating group:', groupError);
          throw new Error(`Failed to create group: ${groupError.message}`);
        }

        console.log('Group created successfully:', group);

        // Add the creator as a group member with admin role
        const { error: memberError } = await supabase
          .from('group_members')
          .insert({
            group_id: group.id,
            user_id: user.id,
            role: 'admin'
          });

        if (memberError) {
          console.error('Error adding user to group:', memberError);
          // If adding member fails, we should clean up the group
          await supabase.from('groups').delete().eq('id', group.id);
          throw new Error(`Failed to add you to the group: ${memberError.message}`);
        }

        console.log('User added to group successfully');
        return group;
        
      } catch (error) {
        console.error('Error in useCreateGroup:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error) => {
      console.error('Create group mutation failed:', error);
    },
  });
}

export function useJoinGroup() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (inviteCode: string) => {
      if (!user) throw new Error('No user');
      
      console.log('Joining group with invite code:', inviteCode);
      
      try {
        // Check if group exists
        const { data: group, error: groupError } = await supabase
          .from('groups')
          .select('id, name, invite_code')
          .eq('invite_code', inviteCode.toUpperCase())
          .single();

        if (groupError) {
          console.error('Error finding group:', groupError);
          throw new Error('Group not found. Please check the invite code.');
        }

        if (!group) {
          throw new Error('Group not found. Please check the invite code.');
        }

        console.log('Group found:', group);

        // Check if user is already a member
        const { data: existingMember, error: memberCheckError } = await supabase
          .from('group_members')
          .select('id')
          .eq('group_id', group.id)
          .eq('user_id', user.id)
          .single();

        if (memberCheckError && memberCheckError.code !== 'PGRST116') {
          // PGRST116 is "not found" which is expected if user is not a member
          console.error('Error checking existing membership:', memberCheckError);
          throw new Error(`Failed to check membership: ${memberCheckError.message}`);
        }

        if (existingMember) {
          throw new Error(`You're already a member of "${group.name}"`);
        }

        console.log('User is not a member, adding to group');

        // Add user to group
        const { error: memberError } = await supabase
          .from('group_members')
          .insert({
            group_id: group.id,
            user_id: user.id,
            role: 'member'
          });

        if (memberError) {
          console.error('Error adding user to group:', memberError);
          throw new Error(`Failed to join group: ${memberError.message}`);
        }

        console.log('Successfully joined group');
        return group;
        
      } catch (error) {
        console.error('Error in useJoinGroup:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groups'] });
    },
    onError: (error) => {
      console.error('Join group mutation failed:', error);
    },
  });
}
