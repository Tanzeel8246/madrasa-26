import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/untypedClient";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface Notification {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  data?: {
    pending_role_id?: string;
    role?: string;
    email?: string;
  };
  read: boolean;
  created_at: string;
  updated_at: string;
}

export const useNotifications = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const { data: notifications, isLoading } = useQuery({
    queryKey: ["notifications", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Notification[];
    },
    enabled: !!user?.id,
  });

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  const markAsRead = useMutation({
    mutationFn: async (notificationId: string) => {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notificationId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const acceptRoleInvitation = useMutation({
    mutationFn: async ({ pendingRoleId, role }: { pendingRoleId: string; role: string }) => {
      if (!user?.id) throw new Error("User not found");

      // Create user role
      const { error: roleError } = await supabase
        .from("user_roles")
        .insert({ user_id: user.id, role });

      if (roleError) throw roleError;

      // Update pending role status
      const { error: updateError } = await supabase
        .from("pending_user_roles")
        .update({ status: "accepted" })
        .eq("id", pendingRoleId);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["user_roles"] });
      toast.success("رول کامیابی سے قبول کر لیا گیا");
    },
    onError: (error: Error) => {
      toast.error(`رول قبول کرنے میں ناکامی: ${error.message}`);
    },
  });

  const rejectRoleInvitation = useMutation({
    mutationFn: async (pendingRoleId: string) => {
      // Update pending role status
      const { error } = await supabase
        .from("pending_user_roles")
        .update({ status: "rejected" })
        .eq("id", pendingRoleId);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["pending_user_roles"] });
      toast.success("رول رد کر دیا گیا");
    },
    onError: (error: Error) => {
      toast.error(`رول رد کرنے میں ناکامی: ${error.message}`);
    },
  });

  return {
    notifications: notifications || [],
    unreadCount,
    isLoading,
    markAsRead,
    acceptRoleInvitation,
    rejectRoleInvitation,
  };
};
