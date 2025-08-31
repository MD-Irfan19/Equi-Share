-- Re-enable RLS with the most robust and non-recursive policies
-- This migration ensures proper access control without infinite recursion issues

-- IMPORTANT: It's highly recommended to run '20250828143229_disable_rls_temporarily.sql'
-- first to ensure RLS is fully disabled and all old policies are dropped before applying this.

-- Begin a transaction for atomic policy updates
BEGIN;

-- Drop all existing RLS policies by name (previous and potentially lingering ones)
DROP POLICY IF EXISTS "profiles_own_only" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual read access" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual insert access" ON public.profiles;
DROP POLICY IF EXISTS "Allow individual update access" ON public.profiles;

DROP POLICY IF EXISTS "groups_access" ON public.groups;
DROP POLICY IF EXISTS "groups_select_member_or_creator" ON public.groups;
DROP POLICY IF EXISTS "groups_insert_creator_only" ON public.groups;
DROP POLICY IF EXISTS "groups_update_admin_or_creator" ON public.groups;
DROP POLICY IF EXISTS "groups_delete_admin_or_creator" ON public.groups;
DROP POLICY IF EXISTS "Allow group members to view groups" ON public.groups;
DROP POLICY IF EXISTS "Allow authenticated users to create groups" ON public.groups;
DROP POLICY IF EXISTS "Allow group admins to update groups" ON public.groups;

DROP POLICY IF EXISTS "group_members_own" ON public.group_members;
DROP POLICY IF EXISTS "group_members_select_own" ON public.group_members;
DROP POLICY IF EXISTS "group_members_insert_own" ON public.group_members;
DROP POLICY IF EXISTS "group_members_delete_own" ON public.group_members;
DROP POLICY IF EXISTS "Allow group members to view other members" ON public.group_members;
DROP POLICY IF EXISTS "Allow authenticated users to join groups" ON public.group_members;

DROP POLICY IF EXISTS "expenses_access" ON public.expenses;
DROP POLICY IF EXISTS "expenses_access_group_member" ON public.expenses;
DROP POLICY IF EXISTS "Allow group members to view expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow group members to create expenses" ON public.expenses;
DROP POLICY IF EXISTS "Allow group members to update expenses" ON public.expenses;

DROP POLICY IF EXISTS "expense_splits_access" ON public.expense_splits;
DROP POLICY IF EXISTS "expense_splits_access_group_member" ON public.expense_splits;
DROP POLICY IF EXISTS "Allow group members to view expense splits" ON public.expense_splits;
DROP POLICY IF EXISTS "Allow group members to create expense splits" ON public.expense_splits;

DROP POLICY IF EXISTS "settlements_access" ON public.settlements;
DROP POLICY IF EXISTS "settlements_access_group_member" ON public.settlements;
DROP POLICY IF EXISTS "Allow group members to view settlements" ON public.settlements;
DROP POLICY IF EXISTS "Allow group members to create settlements" ON public.settlements;

-- Ensure RLS is enabled for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expense_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles (Simplest: Users can only access their own profile)
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for group_members (CRITICAL: Users can ONLY see/modify their OWN membership records)
-- This is the minimalist policy to avoid recursion on group_members itself.
CREATE POLICY "group_members_select_own" ON public.group_members FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "group_members_insert_own" ON public.group_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "group_members_update_own" ON public.group_members FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "group_members_delete_own" ON public.group_members FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for groups (Users can access groups they are a member of or created)
CREATE POLICY "groups_select_member_or_creator" ON public.groups FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = groups.id AND user_id = auth.uid()) OR (auth.uid() = created_by)
);
CREATE POLICY "groups_insert_creator_only" ON public.groups FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY "groups_update_admin_or_creator" ON public.groups FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = groups.id AND user_id = auth.uid() AND role = 'admin') OR (auth.uid() = created_by)
);

-- RLS Policies for expenses (Users can access expenses in groups they belong to)
CREATE POLICY "expenses_access_group_member" ON public.expenses FOR ALL USING (
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = expenses.group_id AND user_id = auth.uid())
);

-- RLS Policies for expense_splits (Users can access splits for expenses in groups they belong to)
CREATE POLICY "expense_splits_access_group_member" ON public.expense_splits FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.expenses e
    JOIN public.group_members gm ON e.group_id = gm.group_id
    WHERE e.id = expense_splits.expense_id AND gm.user_id = auth.uid()
  )
);

-- RLS Policies for settlements (Users can access settlements in groups they belong to)
CREATE POLICY "settlements_access_group_member" ON public.settlements FOR ALL USING (
  EXISTS (SELECT 1 FROM public.group_members WHERE group_id = settlements.group_id AND user_id = auth.uid())
);

COMMIT;
