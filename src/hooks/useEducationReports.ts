import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/untypedClient";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export type EducationReport = {
  id: string;
  student_id: string;
  father_name: string;
  class_id?: string;
  date: string;
  sabak: {
    para_no?: number;
    amount?: string;
  };
  sabqi: {
    recited?: boolean;
    amount?: string;
    heard_by?: string;
  };
  manzil: {
    number?: string;
    heard_by?: string;
  };
  remarks?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
};

export const useEducationReports = () => {
  const queryClient = useQueryClient();
  const { madrasaName } = useAuth();

  const { data: reports = [], isLoading } = useQuery({
    queryKey: ["education_reports", madrasaName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("education_reports")
        .select("*")
        .order("date", { ascending: false });
      if (error) throw error;
      return data as EducationReport[];
    },
    enabled: !!madrasaName,
  });

  const addReport = useMutation({
    mutationFn: async (report: Omit<EducationReport, "id" | "created_at" | "updated_at">) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { data, error } = await supabase
        .from("education_reports")
        .insert({ ...report, created_by: user?.id })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education_reports"] });
      toast.success("Report added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add report: ${error.message}`);
    },
  });

  const updateReport = useMutation({
    mutationFn: async ({ id, ...report }: Partial<EducationReport> & { id: string }) => {
      const { data, error } = await supabase
        .from("education_reports")
        .update(report)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education_reports"] });
      toast.success("Report updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update report: ${error.message}`);
    },
  });

  const deleteReport = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("education_reports").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["education_reports"] });
      toast.success("Report deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete report: ${error.message}`);
    },
  });

  return {
    reports,
    isLoading,
    addReport: addReport.mutate,
    updateReport: updateReport.mutate,
    deleteReport: deleteReport.mutate,
  };
};