import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/untypedClient";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export type Attendance = {
  id: string;
  date: string;
  class_id?: string;
  student_id?: string;
  status: string;
  time?: string;
  noted_by?: string;
  created_at: string;
};

export const useAttendance = (selectedDate?: string) => {
  const queryClient = useQueryClient();
  const { madrasaName } = useAuth();

  const { data: attendance = [], isLoading } = useQuery({
    queryKey: ["attendance", selectedDate, madrasaName],
    queryFn: async () => {
      let query = supabase
        .from("attendance")
        .select("*")
        .order("created_at", { ascending: false });
      
      if (selectedDate) {
        query = query.eq("date", selectedDate);
      }
      
      const { data, error } = await query;
      if (error) throw error;
      return data as Attendance[];
    },
    enabled: !!madrasaName,
  });

  const markAttendance = useMutation({
    mutationFn: async (attendanceData: Omit<Attendance, "id" | "created_at">) => {
      const { data, error } = await supabase
        .from("attendance")
        .insert(attendanceData)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Attendance marked successfully");
    },
    onError: (error) => {
      toast.error(`Failed to mark attendance: ${error.message}`);
    },
  });

  const updateAttendance = useMutation({
    mutationFn: async ({ id, ...attendanceData }: Partial<Attendance> & { id: string }) => {
      const { data, error } = await supabase
        .from("attendance")
        .update(attendanceData)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Attendance updated successfully");
    },
    onError: (error) => {
      toast.error(`Failed to update attendance: ${error.message}`);
    },
  });

  const deleteAttendance = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("attendance").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Attendance deleted successfully");
    },
    onError: (error) => {
      toast.error(`Failed to delete attendance: ${error.message}`);
    },
  });

  return {
    attendance,
    isLoading,
    markAttendance: markAttendance.mutate,
    updateAttendance: updateAttendance.mutate,
    deleteAttendance: deleteAttendance.mutate,
  };
};
