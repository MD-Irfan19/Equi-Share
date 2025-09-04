import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { User } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

export interface Expense {
  id: string;
  group_id: string;
  paid_by: string;
  amount: number;
  description: string;
  category: string;
  expense_date: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseSplit {
  id: string;
  expense_id: string;
  user_id: string;
  amount: number;
  created_at: string;
}

export interface ExpenseWithDetails extends Expense {
  splits: ExpenseSplit[];
  paid_by_name: string;
  group_name: string;
  paid_by_avatar: string | null;
}

// Hook to fetch expenses for a user (across all groups or for a specific group)
export function useExpenses(groupId?: string) {
  const { user } = useAuth();
  
  return useQuery({
    queryKey: ['expenses', user?.id, groupId],
    queryFn: async (): Promise<ExpenseWithDetails[]> => {
      if (!user) {
        console.log('No user found, returning empty array');
        return [];
      }
      
      try {
        // First get all groups the user is a member of
        const { data: memberGroups, error: memberError } = await supabase
          .from('group_members')
          .select('group_id')
          .eq('user_id', user.id);
          
        if (memberError) {
          console.error('Error fetching member groups:', memberError);
          throw new Error(`Failed to fetch groups: ${memberError.message}`);
        }
        
        if (!memberGroups || memberGroups.length === 0) {
          return [];
        }
        
        const groupIds = memberGroups.map(g => g.group_id);
        
        // Query expenses
        let query = supabase
          .from('expenses')
          .select(`
            *,
            groups:group_id(name),
            profiles:paid_by(full_name, email, avatar_url)
          `);
          
        // Filter by specific group if provided
        if (groupId) {
          query = query.eq('group_id', groupId);
        } else {
          query = query.in('group_id', groupIds);
        }
        
        const { data: expenses, error: expensesError } = await query
          .order('created_at', { ascending: false });
          
        if (expensesError) {
          console.error('Error fetching expenses:', expensesError);
          throw new Error(`Failed to fetch expenses: ${expensesError.message}`);
        }
        
        if (!expenses || expenses.length === 0) {
          return [];
        }
        
        // Get all expense splits
        const expenseIds = expenses.map(e => e.id);
        const { data: splits, error: splitsError } = await supabase
          .from('expense_splits')
          .select('*')
          .in('expense_id', expenseIds);
          
        if (splitsError) {
          console.error('Error fetching expense splits:', splitsError);
          throw new Error(`Failed to fetch expense splits: ${splitsError.message}`);
        }
        
        // Transform the data
        const expensesWithDetails: ExpenseWithDetails[] = expenses.map(expense => ({
          ...expense,
          splits: splits?.filter(s => s.expense_id === expense.id) || [],
          paid_by_name: (expense.profiles as { full_name?: string; email?: string })?.full_name || (expense.profiles as { full_name?: string; email?: string })?.email || 'Unknown',
          group_name: expense.groups?.name || 'Unknown Group',
          paid_by_avatar: (expense.profiles as { avatar_url?: string | null })?.avatar_url || null
        }));
        
        return expensesWithDetails;
        
      } catch (error) {
        console.error('Error in useExpenses:', error);
        if (error instanceof Error) {
          throw new Error(`Failed to load expenses: ${error.message}`);
        } else {
          throw new Error('Failed to load expenses. Please try again.');
        }
      }
    },
    enabled: !!user,
    retry: 2,
    retryDelay: 1000,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Hook to create a new expense with splits
export function useCreateExpense() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: {
      group_id: string;
      amount: number;
      description: string;
      category: string; // This will be cast to the proper enum type
      expense_date: Date;
      split_type: 'equal' | 'custom';
      custom_splits?: { user_id: string; amount: number }[];
    }) => {
      if (!user) throw new Error('No user');
      
      console.log('Creating expense with data:', data);
      
      try {
        // Start a transaction
        const { data: expense, error: expenseError } = await supabase
          .from('expenses')
          .insert({
            group_id: data.group_id,
            paid_by: user.id,
            amount: data.amount,
            description: data.description,
            category: data.category as Database["public"]["Enums"]["expense_category"],
            expense_date: data.expense_date.toISOString().split('T')[0],
          })
          .select()
          .single();

        if (expenseError) {
          console.error('Error creating expense:', expenseError);
          throw new Error(`Failed to create expense: ${expenseError.message}`);
        }

        console.log('Expense created successfully:', expense);

        // Get group members for splitting
        const { data: members, error: membersError } = await supabase
          .from('group_members')
          .select('user_id')
          .eq('group_id', data.group_id);

        if (membersError) {
          console.error('Error fetching group members:', membersError);
          // Clean up the expense if we can't create splits
          await supabase.from('expenses').delete().eq('id', expense.id);
          throw new Error(`Failed to fetch group members: ${membersError.message}`);
        }

        // Create splits based on split type
        let splits = [];
        
        if (data.split_type === 'equal') {
          // Equal split among all members
          const memberCount = members?.length || 1;
          const splitAmount = parseFloat((data.amount / memberCount).toFixed(2));
          
          splits = members?.map(member => ({
            expense_id: expense.id,
            user_id: member.user_id,
            amount: splitAmount
          })) || [];
        } else if (data.split_type === 'custom' && data.custom_splits) {
          // Custom split as specified
          splits = data.custom_splits.map(split => ({
            expense_id: expense.id,
            user_id: split.user_id,
            amount: split.amount
          }));
        }

        // Insert all splits
        if (splits.length > 0) {
          const { error: splitsError } = await supabase
            .from('expense_splits')
            .insert(splits);

          if (splitsError) {
            console.error('Error creating expense splits:', splitsError);
            // Clean up the expense if splits fail
            await supabase.from('expenses').delete().eq('id', expense.id);
            throw new Error(`Failed to create expense splits: ${splitsError.message}`);
          }
        }

        return expense;
        
      } catch (error) {
        console.error('Error in useCreateExpense:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses'] });
      queryClient.invalidateQueries({ queryKey: ['groups'] }); // Also refresh groups to update balances
    },
    onError: (error) => {
      console.error('Create expense mutation failed:', error);
    },
  });
}