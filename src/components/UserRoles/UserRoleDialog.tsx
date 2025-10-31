import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const userRoleFormSchema = z.object({
  assignmentType: z.enum(["user_id", "email"]),
  user_id: z.string().optional(),
  email: z.string().email("یہ ای میل درست نہیں ہے").optional(),
  role: z.string().min(1, "رول منتخب کریں"),
}).superRefine((data, ctx) => {
  if (data.assignmentType === "user_id") {
    if (!data.user_id || data.user_id.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "یوزر ID درج کریں",
        path: ["user_id"],
      });
    }
  } else if (data.assignmentType === "email") {
    if (!data.email || data.email.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ای میل درج کریں",
        path: ["email"],
      });
    }
  }
});

type UserRoleFormValues = z.infer<typeof userRoleFormSchema>;

interface UserRoleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: UserRoleFormValues) => Promise<void>;
}

export function UserRoleDialog({ open, onOpenChange, onSave }: UserRoleDialogProps) {
  const form = useForm<UserRoleFormValues>({
    resolver: zodResolver(userRoleFormSchema),
    defaultValues: {
      assignmentType: "email",
      user_id: "",
      email: "",
      role: "teacher",
    },
  });

  const assignmentType = form.watch("assignmentType");

  const onSubmit = async (data: UserRoleFormValues) => {
    console.log('Form submitted with data:', data);
    try {
      await onSave(data);
      form.reset();
    } catch (error) {
      console.error('Error in form submission:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Assign User Role</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="assignmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Assignment Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="email">Assign by Email (before signup)</SelectItem>
                      <SelectItem value="user_id">Assign by User ID (existing user)</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {assignmentType === "user_id" ? (
              <FormField
                control={form.control}
                name="user_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>User ID</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter user ID" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter email address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="manager">Manager</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="parent">Parent</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Assign Role</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
