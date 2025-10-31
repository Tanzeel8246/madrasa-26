import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/untypedClient";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface UserRole {
  id: string;
  user_id: string;
  role: string;
  created_at: string;
  profile?: {
    full_name: string;
    madrasa_name: string;
  };
}

export const useUserRoles = () => {
  const queryClient = useQueryClient();
  const { madrasaName } = useAuth();

  const { data: userRoles, isLoading } = useQuery({
    queryKey: ["user_roles", madrasaName],
    queryFn: async () => {
      console.log('Fetching user roles for madrasa:', madrasaName);
      
      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          *,
          profile:profiles!user_roles_user_id_fkey (
            full_name,
            madrasa_name
          )
        `)
        .order("created_at", { ascending: false });

      console.log('User roles fetched:', data, 'Error:', error);
      
      if (error) {
        console.error('Error fetching user roles:', error);
        throw error;
      }
      return data as UserRole[];
    },
    enabled: !!madrasaName,
  });

  const createUserRole = useMutation({
    mutationFn: async (newRole: { user_id: string; role: string }) => {
      console.log('Creating user role:', newRole);
      
      const { data, error } = await supabase
        .from("user_roles")
        .insert([newRole])
        .select(`
          *,
          profile:profiles!user_roles_user_id_fkey (
            full_name,
            madrasa_name
          )
        `)
        .single();

      console.log('Role created:', data, 'Error:', error);
      
      if (error) {
        console.error('Error creating role:', error);
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_roles"] });
      toast.success("رول کامیابی سے تفویض کر دیا گیا");
    },
    onError: (error: Error) => {
      console.error('Mutation error:', error);
      toast.error(`رول تفویض کرنے میں ناکامی: ${error.message}`);
    },
  });

  const deleteUserRole = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("user_roles").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_roles"] });
      toast.success("Role removed successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to remove role: ${error.message}`);
    },
  });

  return {
    userRoles,
    isLoading,
    createUserRole,
    deleteUserRole,
  };
};
