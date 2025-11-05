import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const userRoleFormSchema = z.object({
  assignmentType: z.enum(["user_id", "email", "new_member"]),
  user_id: z.string().optional(),
  email: z.string().email("یہ ای میل درست نہیں ہے").optional(),
  full_name: z.string().optional(),
  contact_number: z.string().optional(),
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
  } else if (data.assignmentType === "new_member") {
    if (!data.email || data.email.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "ای میل درج کریں",
        path: ["email"],
      });
    }
    if (!data.full_name || data.full_name.length === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "نام درج کریں",
        path: ["full_name"],
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
      assignmentType: "new_member",
      user_id: "",
      email: "",
      full_name: "",
      contact_number: "",
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
          <DialogTitle>یوزر رول تفویض کریں</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="assignmentType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>تفویض کی قسم</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="new_member">نیا ممبر شامل کریں</SelectItem>
                      <SelectItem value="email">ای میل سے تفویض کریں (سائن اپ سے پہلے)</SelectItem>
                      <SelectItem value="user_id">یوزر آئی ڈی سے تفویض کریں (موجودہ یوزر)</SelectItem>
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
                    <FormLabel>یوزر آئی ڈی</FormLabel>
                    <FormControl>
                      <Input placeholder="یوزر آئی ڈی درج کریں" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ) : assignmentType === "new_member" ? (
              <>
                <FormField
                  control={form.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>مکمل نام</FormLabel>
                      <FormControl>
                        <Input placeholder="نام درج کریں" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ای میل ایڈریس</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="ای میل درج کریں" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="contact_number"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>رابطہ نمبر</FormLabel>
                      <FormControl>
                        <Input type="tel" placeholder="موبائل نمبر درج کریں" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            ) : (
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>ای میل ایڈریس</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="ای میل ایڈریس درج کریں" {...field} />
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
                  <FormLabel>رول</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">ایڈمن</SelectItem>
                      <SelectItem value="teacher">استاد</SelectItem>
                      <SelectItem value="manager">منیجر</SelectItem>
                      <SelectItem value="student">طالب علم</SelectItem>
                      <SelectItem value="parent">والدین</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                منسوخ کریں
              </Button>
              <Button type="submit">رول تفویض کریں</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
