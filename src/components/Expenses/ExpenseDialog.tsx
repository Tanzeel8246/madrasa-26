import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Expense } from "@/hooks/useExpenses";

const expenseSchema = z.object({
  expense_type: z.string().min(1, "خرچ کی قسم درکار ہے"),
  category: z.string().optional(),
  amount: z.string().min(1, "رقم درکار ہے"),
  date: z.string().min(1, "تاریخ درکار ہے"),
  recipient_name: z.string().min(1, "وصول کنندہ کا نام درکار ہے"),
  recipient_contact: z.string().optional(),
  description: z.string().optional(),
  receipt_number: z.string().optional(),
  payment_method: z.string().optional(),
});

type ExpenseFormData = z.infer<typeof expenseSchema>;

interface ExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: Omit<Expense, "id" | "created_at" | "updated_at" | "madrasa_name" | "created_by">) => void;
  initialData?: Expense;
}

export function ExpenseDialog({ open, onOpenChange, onSubmit, initialData }: ExpenseDialogProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch,
  } = useForm<ExpenseFormData>({
    resolver: zodResolver(expenseSchema),
    defaultValues: initialData ? {
      expense_type: initialData.expense_type,
      category: initialData.category || "",
      amount: initialData.amount.toString(),
      date: initialData.date,
      recipient_name: initialData.recipient_name,
      recipient_contact: initialData.recipient_contact || "",
      description: initialData.description || "",
      receipt_number: initialData.receipt_number || "",
      payment_method: initialData.payment_method || "",
    } : {
      date: new Date().toISOString().split('T')[0],
    },
  });

  const expense_type = watch("expense_type");
  const payment_method = watch("payment_method");

  const handleFormSubmit = (data: ExpenseFormData) => {
    onSubmit({
      expense_type: data.expense_type,
      category: data.category,
      amount: parseFloat(data.amount),
      date: data.date,
      recipient_name: data.recipient_name,
      recipient_contact: data.recipient_contact,
      description: data.description,
      receipt_number: data.receipt_number,
      payment_method: data.payment_method,
    });
    reset();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{initialData ? "خرچہ میں ترمیم" : "نیا خرچہ شامل کریں"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="expense_type">خرچ کی قسم *</Label>
              <Select
                value={expense_type}
                onValueChange={(value) => setValue("expense_type", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="قسم منتخب کریں" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="تنخواہیں">تنخواہیں</SelectItem>
                  <SelectItem value="بجلی بل">بجلی بل</SelectItem>
                  <SelectItem value="پانی بل">پانی بل</SelectItem>
                  <SelectItem value="گیس بل">گیس بل</SelectItem>
                  <SelectItem value="انٹرنیٹ بل">انٹرنیٹ بل</SelectItem>
                  <SelectItem value="تعمیرات">تعمیرات</SelectItem>
                  <SelectItem value="مرمت">مرمت</SelectItem>
                  <SelectItem value="صفائی">صفائی</SelectItem>
                  <SelectItem value="کھانا">کھانا</SelectItem>
                  <SelectItem value="کتابیں">کتابیں</SelectItem>
                  <SelectItem value="سٹیشنری">سٹیشنری</SelectItem>
                  <SelectItem value="دیگر">دیگر</SelectItem>
                </SelectContent>
              </Select>
              {errors.expense_type && (
                <p className="text-sm text-destructive">{errors.expense_type.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category">زمرہ</Label>
              <Input {...register("category")} placeholder="زمرہ درج کریں" />
            </div>

            <div>
              <Label htmlFor="amount">رقم *</Label>
              <Input
                type="number"
                step="0.01"
                {...register("amount")}
                placeholder="رقم درج کریں"
              />
              {errors.amount && (
                <p className="text-sm text-destructive">{errors.amount.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="date">تاریخ *</Label>
              <Input type="date" {...register("date")} />
              {errors.date && (
                <p className="text-sm text-destructive">{errors.date.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="recipient_name">وصول کنندہ کا نام *</Label>
              <Input {...register("recipient_name")} placeholder="نام درج کریں" />
              {errors.recipient_name && (
                <p className="text-sm text-destructive">{errors.recipient_name.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="recipient_contact">رابطہ نمبر</Label>
              <Input {...register("recipient_contact")} placeholder="رابطہ نمبر" />
            </div>

            <div>
              <Label htmlFor="payment_method">ادائیگی کا طریقہ</Label>
              <Select
                value={payment_method}
                onValueChange={(value) => setValue("payment_method", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="طریقہ منتخب کریں" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="نقد">نقد</SelectItem>
                  <SelectItem value="بینک ٹرانسفر">بینک ٹرانسفر</SelectItem>
                  <SelectItem value="چیک">چیک</SelectItem>
                  <SelectItem value="آن لائن">آن لائن</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="receipt_number">رسید نمبر</Label>
              <Input {...register("receipt_number")} placeholder="رسید نمبر" />
            </div>
          </div>

          <div>
            <Label htmlFor="description">تفصیل</Label>
            <Textarea
              {...register("description")}
              placeholder="تفصیل درج کریں"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              منسوخ
            </Button>
            <Button type="submit">{initialData ? "اپ ڈیٹ کریں" : "شامل کریں"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
