import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/untypedClient";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export type Teacher = {
  id: string;
  name: string;
  qualification: string;
  subject: string;
  contact: string;
  email: string;
  specialization?: string;
  classes_count: number;
  students_count: number;
  created_at: string;
  updated_at: string;
};

export const useTeachers = () => {
  const queryClient = useQueryClient();
  const { madrasaName } = useAuth();

  const { data: teachers = [], isLoading } = useQuery({
    queryKey: ["teachers", madrasaName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("teachers")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Teacher[];
    },
    enabled: !!madrasaName,
  });

  const addTeacher = useMutation({
    mutationFn: async (teacher: Omit<Teacher, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("teachers").insert(teacher).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("Teacher added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add teacher: ${error.message}`);
    },
  });

  const updateTeacher = useMutation({
    mutationFn: async ({ id, ...teacher }: Partial<Teacher> & { id: string }) => {
      const { data, error } = await supabase.from("teachers").update(teacher).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("Teacher updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update teacher: ${error.message}`);
    },
  });

  const deleteTeacher = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("teachers").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
      toast.success("Teacher deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete teacher: ${error.message}`);
    },
  });

  return {
    teachers,
    isLoading,
    addTeacher: addTeacher.mutate,
    updateTeacher: updateTeacher.mutate,
    deleteTeacher: deleteTeacher.mutate,
  };
};
