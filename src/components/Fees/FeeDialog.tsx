import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Fee } from "@/hooks/useFees";
import { useStudents } from "@/hooks/useStudents";
import { supabase } from "@/integrations/supabase/untypedClient";
import { toast } from "sonner";
import { Upload } from "lucide-react";

const feeFormSchema = z.object({
  student_id: z.string().min(1, "Student is required"),
  amount: z.string().min(1, "Amount is required"),
  due_date: z.string().min(1, "Due date is required"),
  status: z.string().min(1, "Status is required"),
  fee_type: z.string().min(1, "Fee type is required"),
  academic_year: z.string().min(1, "Academic year is required"),
  payment_screenshot_url: z.string().optional(),
});

type FeeFormValues = z.infer<typeof feeFormSchema>;

interface FeeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  fee?: Fee;
  onSave: (data: any) => Promise<void>;
}

export function FeeDialog({ open, onOpenChange, fee, onSave }: FeeDialogProps) {
  const { students } = useStudents();
  const [uploading, setUploading] = useState(false);
  const [screenshotUrl, setScreenshotUrl] = useState<string | undefined>(fee?.payment_screenshot_url);
  
  const form = useForm<FeeFormValues>({
    resolver: zodResolver(feeFormSchema),
    defaultValues: {
      student_id: "",
      amount: "",
      due_date: new Date().toISOString().split('T')[0],
      status: "pending",
      fee_type: "",
      academic_year: "",
      payment_screenshot_url: "",
    },
  });

  useEffect(() => {
    if (fee) {
      form.reset({
        student_id: fee.student_id,
        amount: fee.amount.toString(),
        due_date: fee.due_date,
        status: fee.status,
        fee_type: fee.fee_type,
        academic_year: fee.academic_year,
        payment_screenshot_url: fee.payment_screenshot_url || "",
      });
      setScreenshotUrl(fee.payment_screenshot_url);
    } else {
      form.reset({
        student_id: "",
        amount: "",
        due_date: new Date().toISOString().split('T')[0],
        status: "pending",
        fee_type: "",
        academic_year: "",
        payment_screenshot_url: "",
      });
      setScreenshotUrl(undefined);
    }
  }, [fee, form]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setUploading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError, data } = await supabase.storage
        .from('fee-payments')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('fee-payments')
        .getPublicUrl(fileName);

      setScreenshotUrl(publicUrl);
      form.setValue('payment_screenshot_url', publicUrl);
      toast.success('Screenshot uploaded successfully');
    } catch (error: any) {
      toast.error(`Failed to upload screenshot: ${error.message}`);
    } finally {
      setUploading(false);
    }
  };

  const handleStudentChange = (studentId: string) => {
    const student = students?.find(s => s.id === studentId);
    if (student) {
      form.setValue('student_id', studentId);
      // Could auto-populate other fields here if needed
    }
  };

  const onSubmit = async (data: FeeFormValues) => {
    await onSave({
      ...data,
      amount: parseFloat(data.amount),
    });
    form.reset();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{fee ? "Edit Fee" : "Add New Fee"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="student_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Student / طالب علم</FormLabel>
                  <Select onValueChange={handleStudentChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select student" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {students?.map((student) => (
                        <SelectItem key={student.id} value={student.id}>
                          {student.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="fee_type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Fee Type</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., Tuition, Books, Exam" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="academic_year"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Academic Year</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., 2024-2025" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="0.00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="due_date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Due Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="overdue">Overdue</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="payment_screenshot_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Payment Screenshot (Optional)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={handleFileUpload}
                          disabled={uploading}
                          className="flex-1"
                        />
                        {uploading && (
                          <Upload className="h-4 w-4 animate-spin" />
                        )}
                      </div>
                      {screenshotUrl && (
                        <div className="relative">
                          <img 
                            src={screenshotUrl} 
                            alt="Payment screenshot" 
                            className="w-full h-32 object-cover rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {fee ? "Update" : "Create"} Fee
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
