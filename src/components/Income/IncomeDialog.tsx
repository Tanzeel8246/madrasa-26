import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Income } from "@/hooks/useIncome";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const incomeSchema = z.object({
  donor_name: z.string().trim().min(1, "دہندہ کا نام درکار ہے").max(100),
  donor_contact: z.string().trim().max(20).optional(),
  amount: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, {
    message: "رقم صحیح نہیں ہے",
  }),
  income_type: z.string().min(1, "آمد کی قسم منتخب کریں"),
  frequency: z.string().min(1, "تعدد منتخب کریں"),
  date: z.date(),
  receipt_number: z.string().trim().max(50).optional(),
  notes: z.string().trim().max(500).optional(),
});

type IncomeFormData = z.infer<typeof incomeSchema>;

interface IncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Income, "id" | "created_at" | "updated_at" | "madrasa_name" | "created_by">) => void;
  income?: Income;
}

export const IncomeDialog = ({
  open,
  onOpenChange,
  onSubmit,
  income,
}: IncomeDialogProps) => {
  const form = useForm<IncomeFormData>({
    resolver: zodResolver(incomeSchema),
    defaultValues: {
      donor_name: income?.donor_name || "",
      donor_contact: income?.donor_contact || "",
      amount: income?.amount?.toString() || "",
      income_type: income?.income_type || "",
      frequency: income?.frequency || "",
      date: income?.date ? new Date(income.date) : new Date(),
      receipt_number: income?.receipt_number || "",
      notes: income?.notes || "",
    },
  });

  const handleSubmit = (data: IncomeFormData) => {
    const submitData = {
      donor_name: data.donor_name,
      donor_contact: data.donor_contact,
      amount: Number(data.amount),
      income_type: data.income_type,
      frequency: data.frequency,
      date: format(data.date, "yyyy-MM-dd"),
      receipt_number: data.receipt_number,
      notes: data.notes,
    };
    onSubmit(submitData);
    form.reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle>
            {income ? "آمد میں ترمیم" : "نئی آمد شامل کریں"}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="donor_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>دہندہ کا نام *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="نام درج کریں" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="donor_contact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رابطہ نمبر</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="03001234567" />
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
                    <FormLabel>رقم *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        step="0.01"
                        placeholder="رقم درج کریں"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="income_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>آمد کی قسم *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="قسم منتخب کریں" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="زکوٰۃ">زکوٰۃ</SelectItem>
                        <SelectItem value="صدقات">صدقات</SelectItem>
                        <SelectItem value="فطرانہ">فطرانہ</SelectItem>
                        <SelectItem value="عطیات">عطیات</SelectItem>
                        <SelectItem value="چندہ">چندہ</SelectItem>
                        <SelectItem value="دیگر">دیگر</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="frequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تعدد *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="تعدد منتخب کریں" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="ایک وقتی">ایک وقتی</SelectItem>
                        <SelectItem value="ماہانہ">ماہانہ</SelectItem>
                        <SelectItem value="سالانہ">سالانہ</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تاریخ *</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="ml-2 h-4 w-4" />
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>تاریخ منتخب کریں</span>
                            )}
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="receipt_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>رسید نمبر</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="رسید نمبر درج کریں" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>نوٹس</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="اضافی معلومات درج کریں"
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                منسوخ
              </Button>
              <Button type="submit">
                {income ? "اپ ڈیٹ کریں" : "شامل کریں"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
