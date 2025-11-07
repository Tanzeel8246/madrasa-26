import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Search, Download, Edit, Trash2 } from "lucide-react";
import { useExpenses } from "@/hooks/useExpenses";
import { ExpenseDialog } from "@/components/Expenses/ExpenseDialog";
import { exportExpensesToPDF } from "@/lib/expenseExport";
import type { Expense } from "@/hooks/useExpenses";
import { useAuth } from "@/contexts/AuthContext";

export default function Expenses() {
  const { expenses, isLoading, addExpense, updateExpense, deleteExpense } = useExpenses();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | undefined>();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [filterPaymentMethod, setFilterPaymentMethod] = useState<string>("all");
  const { madrasaName, logoUrl } = useAuth();

  const filteredExpenses = expenses.filter((expense) => {
    const matchesSearch =
      expense.recipient_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.expense_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (expense.description?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);

    const matchesType = filterType === "all" || expense.expense_type === filterType;
    const matchesPaymentMethod = filterPaymentMethod === "all" || expense.payment_method === filterPaymentMethod;

    return matchesSearch && matchesType && matchesPaymentMethod;
  });

  const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("کیا آپ واقعی اس خرچے کو ڈیلیٹ کرنا چاہتے ہیں؟")) {
      deleteExpense(id);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingExpense(undefined);
  };

  const handleExport = () => {
    exportExpensesToPDF(filteredExpenses, madrasaName || "مدرسہ", logoUrl);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">خرچ رجسٹر</h1>
          <p className="text-muted-foreground">اخراجات کا مکمل ریکارڈ</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={handleExport} variant="outline">
            <Download className="ml-2 h-4 w-4" />
            پی ڈی ایف
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="ml-2 h-4 w-4" />
            نیا خرچہ
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="تلاش کریں..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pr-9"
            />
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger>
              <SelectValue placeholder="قسم کے لحاظ سے فلٹر" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">تمام</SelectItem>
              <SelectItem value="تنخواہیں">تنخواہیں</SelectItem>
              <SelectItem value="بجلی بل">بجلی بل</SelectItem>
              <SelectItem value="پانی بل">پانی بل</SelectItem>
              <SelectItem value="گیس بل">گیس بل</SelectItem>
              <SelectItem value="تعمیرات">تعمیرات</SelectItem>
              <SelectItem value="کھانا">کھانا</SelectItem>
              <SelectItem value="دیگر">دیگر</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterPaymentMethod} onValueChange={setFilterPaymentMethod}>
            <SelectTrigger>
              <SelectValue placeholder="ادائیگی کے طریقے سے فلٹر" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">تمام</SelectItem>
              <SelectItem value="نقد">نقد</SelectItem>
              <SelectItem value="بینک ٹرانسفر">بینک ٹرانسفر</SelectItem>
              <SelectItem value="چیک">چیک</SelectItem>
              <SelectItem value="آن لائن">آن لائن</SelectItem>
            </SelectContent>
          </Select>

          <div className="flex items-center justify-center bg-primary/10 rounded-lg p-3">
            <div className="text-center">
              <p className="text-sm text-muted-foreground">کل خرچہ</p>
              <p className="text-2xl font-bold text-primary">
                {totalExpenses.toLocaleString('ur-PK')} روپے
              </p>
            </div>
          </div>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-right">تاریخ</TableHead>
              <TableHead className="text-right">خرچ کی قسم</TableHead>
              <TableHead className="text-right">وصول کنندہ</TableHead>
              <TableHead className="text-right">رقم</TableHead>
              <TableHead className="text-right">ادائیگی کا طریقہ</TableHead>
              <TableHead className="text-right">رسید نمبر</TableHead>
              <TableHead className="text-right">تفصیل</TableHead>
              <TableHead className="text-right">عمل</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  لوڈ ہو رہا ہے...
                </TableCell>
              </TableRow>
            ) : filteredExpenses.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center">
                  کوئی ڈیٹا نہیں ملا
                </TableCell>
              </TableRow>
            ) : (
              filteredExpenses.map((expense) => (
                <TableRow key={expense.id}>
                  <TableCell>{new Date(expense.date).toLocaleDateString('ur-PK')}</TableCell>
                  <TableCell>{expense.expense_type}</TableCell>
                  <TableCell>{expense.recipient_name}</TableCell>
                  <TableCell className="font-medium">
                    {Number(expense.amount).toLocaleString('ur-PK')} روپے
                  </TableCell>
                  <TableCell>{expense.payment_method || '-'}</TableCell>
                  <TableCell>{expense.receipt_number || '-'}</TableCell>
                  <TableCell className="max-w-xs truncate">
                    {expense.description || '-'}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(expense)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(expense.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <ExpenseDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={(data) => {
          if (editingExpense) {
            updateExpense({ ...data, id: editingExpense.id });
          } else {
            addExpense(data);
          }
        }}
        initialData={editingExpense}
      />
    </div>
  );
}
