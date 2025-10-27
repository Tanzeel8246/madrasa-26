import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/untypedClient";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export type Student = {
  id: string;
  name: string;
  father_name: string;
  class_id?: string;
  admission_date: string;
  contact?: string;
  photo_url?: string;
  age?: number;
  grade?: string;
  status: string;
  created_at: string;
  updated_at: string;
};

export const useStudents = () => {
  const queryClient = useQueryClient();
  const { madrasaName } = useAuth();

  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students", madrasaName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("students")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Student[];
    },
    enabled: !!madrasaName,
  });

  const addStudent = useMutation({
    mutationFn: async (student: Omit<Student, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("students").insert(student).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add student: ${error.message}`);
    },
  });

  const updateStudent = useMutation({
    mutationFn: async ({ id, ...student }: Partial<Student> & { id: string }) => {
      const { data, error } = await supabase.from("students").update(student).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update student: ${error.message}`);
    },
  });

  const deleteStudent = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("students").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
      toast.success("Student deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete student: ${error.message}`);
    },
  });

  return {
    students,
    isLoading,
    addStudent: addStudent.mutate,
    updateStudent: updateStudent.mutate,
    deleteStudent: deleteStudent.mutate,
  };
};
