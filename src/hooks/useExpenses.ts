import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/untypedClient";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export type Expense = {
  id: string;
  expense_type: string;
  category?: string;
  amount: number;
  date: string;
  recipient_name: string;
  recipient_contact?: string;
  description?: string;
  receipt_number?: string;
  payment_method?: string;
  madrasa_name?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
};

export const useExpenses = () => {
  const queryClient = useQueryClient();
  const { madrasaName } = useAuth();

  const { data: expenses = [], isLoading } = useQuery({
    queryKey: ["expenses", madrasaName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as Expense[];
    },
    enabled: !!madrasaName,
  });

  const addExpense = useMutation({
    mutationFn: async (expense: Omit<Expense, "id" | "created_at" | "updated_at" | "madrasa_name" | "created_by">) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("expenses")
        .insert({ ...expense, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("خرچہ کامیابی سے شامل ہو گیا");
    },
    onError: (error) => {
      toast.error(`خرچہ شامل کرنے میں خرابی: ${error.message}`);
    },
  });

  const updateExpense = useMutation({
    mutationFn: async ({ id, ...expense }: Partial<Expense> & { id: string }) => {
      const { data, error } = await supabase
        .from("expenses")
        .update(expense)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("خرچہ کامیابی سے اپ ڈیٹ ہو گیا");
    },
    onError: (error) => {
      toast.error(`خرچہ اپ ڈیٹ کرنے میں خرابی: ${error.message}`);
    },
  });

  const deleteExpense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("expenses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expenses"] });
      toast.success("خرچہ کامیابی سے ڈیلیٹ ہو گیا");
    },
    onError: (error) => {
      toast.error(`خرچہ ڈیلیٹ کرنے میں خرابی: ${error.message}`);
    },
  });

  return {
    expenses,
    isLoading,
    addExpense: addExpense.mutate,
    updateExpense: updateExpense.mutate,
    deleteExpense: deleteExpense.mutate,
  };
};
