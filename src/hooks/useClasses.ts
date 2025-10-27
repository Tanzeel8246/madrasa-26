import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/untypedClient";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export type Class = {
  id: string;
  name: string;
  section?: string;
  teacher_id?: string;
  year?: string;
  schedule?: string;
  duration?: string;
  room?: string;
  level?: string;
  students_count: number;
  created_at: string;
  updated_at: string;
};

export const useClasses = () => {
  const queryClient = useQueryClient();
  const { madrasaName } = useAuth();

  const { data: classes = [], isLoading } = useQuery({
    queryKey: ["classes", madrasaName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("classes")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Class[];
    },
    enabled: !!madrasaName,
  });

  const addClass = useMutation({
    mutationFn: async (classData: Omit<Class, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("classes").insert(classData).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Class added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add class: ${error.message}`);
    },
  });

  const updateClass = useMutation({
    mutationFn: async ({ id, ...classData }: Partial<Class> & { id: string }) => {
      const { data, error } = await supabase.from("classes").update(classData).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Class updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update class: ${error.message}`);
    },
  });

  const deleteClass = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("classes").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      toast.success("Class deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete class: ${error.message}`);
    },
  });

  return {
    classes,
    isLoading,
    addClass: addClass.mutate,
    updateClass: updateClass.mutate,
    deleteClass: deleteClass.mutate,
  };
};
