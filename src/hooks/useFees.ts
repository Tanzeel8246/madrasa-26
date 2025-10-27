import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/untypedClient";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export interface Fee {
  id: string;
  student_id: string;
  amount: number;
  due_date: string;
  status: string;
  fee_type: string;
  academic_year: string;
  payment_screenshot_url?: string;
  created_at: string;
  updated_at: string;
  created_by: string | null;
}

export const useFees = () => {
  const queryClient = useQueryClient();
  const { madrasaName } = useAuth();

  const { data: fees, isLoading } = useQuery({
    queryKey: ["fees", madrasaName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fees")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Fee[];
    },
    enabled: !!madrasaName,
  });

  const createFee = useMutation({
    mutationFn: async (newFee: Omit<Fee, "id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("fees")
        .insert([{ ...newFee, created_by: user?.id }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      toast.success("Fee created successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to create fee: ${error.message}`);
    },
  });

  const updateFee = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Fee> & { id: string }) => {
      const { data, error } = await supabase
        .from("fees")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      toast.success("Fee updated successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to update fee: ${error.message}`);
    },
  });

  const deleteFee = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("fees").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["fees"] });
      toast.success("Fee deleted successfully");
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete fee: ${error.message}`);
    },
  });

  return {
    fees,
    isLoading,
    createFee,
    updateFee,
    deleteFee,
  };
};
