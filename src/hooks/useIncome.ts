import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/untypedClient";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export type Income = {
  id: string;
  donor_name: string;
  donor_contact?: string;
  amount: number;
  income_type: string;
  frequency: string;
  date: string;
  receipt_number?: string;
  notes?: string;
  madrasa_name?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
};

export const useIncome = () => {
  const queryClient = useQueryClient();
  const { madrasaName } = useAuth();

  const { data: incomes = [], isLoading } = useQuery({
    queryKey: ["income", madrasaName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("income")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as Income[];
    },
    enabled: !!madrasaName,
  });

  const addIncome = useMutation({
    mutationFn: async (income: Omit<Income, "id" | "created_at" | "updated_at" | "madrasa_name" | "created_by">) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("income")
        .insert({ ...income, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
      toast.success("آمد کامیابی سے شامل ہو گئی");
    },
    onError: (error) => {
      toast.error(`آمد شامل کرنے میں خرابی: ${error.message}`);
    },
  });

  const updateIncome = useMutation({
    mutationFn: async ({ id, ...income }: Partial<Income> & { id: string }) => {
      const { data, error } = await supabase
        .from("income")
        .update(income)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
      toast.success("آمد کامیابی سے اپ ڈیٹ ہو گئی");
    },
    onError: (error) => {
      toast.error(`آمد اپ ڈیٹ کرنے میں خرابی: ${error.message}`);
    },
  });

  const deleteIncome = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("income").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["income"] });
      toast.success("آمد کامیابی سے ڈیلیٹ ہو گئی");
    },
    onError: (error) => {
      toast.error(`آمد ڈیلیٹ کرنے میں خرابی: ${error.message}`);
    },
  });

  return {
    incomes,
    isLoading,
    addIncome: addIncome.mutate,
    updateIncome: updateIncome.mutate,
    deleteIncome: deleteIncome.mutate,
  };
};
