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
      const { data, error } = await supabase
        .from("user_roles")
        .select(`
          *,
          profile:user_id (
            full_name,
            madrasa_name
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as UserRole[];
    },
    enabled: !!madrasaName,
  });

  const createUserRole = useMutation({
    mutationFn: async (newRole: { user_id: string; role: string }) => {
      const { data, error } = await supabase
        .from("user_roles")
        .insert([newRole])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user_roles"] });
      toast.success("Role assigned successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to assign role: ${error.message}`);
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
