import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/untypedClient";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export type Course = {
  id: string;
  title: string;
  description?: string;
  duration?: string;
  level?: string;
  modules: number;
  progress: number;
  students_count: number;
  created_at: string;
  updated_at: string;
};

export const useCourses = () => {
  const queryClient = useQueryClient();
  const { madrasaName } = useAuth();

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ["courses", madrasaName],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("courses")
        .select("*")
        .order("created_at", { ascending: false});
      if (error) throw error;
      return data as Course[];
    },
    enabled: !!madrasaName,
  });

  const addCourse = useMutation({
    mutationFn: async (course: Omit<Course, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase.from("courses").insert(course).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course added successfully");
    },
    onError: (error) => {
      toast.error(`Failed to add course: ${error.message}`);
    },
  });

  const updateCourse = useMutation({
    mutationFn: async ({ id, ...course }: Partial<Course> & { id: string }) => {
      const { data, error } = await supabase.from("courses").update(course).eq("id", id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update course: ${error.message}`);
    },
  });

  const deleteCourse = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("courses").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["courses"] });
      toast.success("Course deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete course: ${error.message}`);
    },
  });

  return {
    courses,
    isLoading,
    addCourse: addCourse.mutate,
    updateCourse: updateCourse.mutate,
    deleteCourse: deleteCourse.mutate,
  };
};
