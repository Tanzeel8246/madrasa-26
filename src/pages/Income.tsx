import { useState } from "react";
import { useIncome, Income } from "@/hooks/useIncome";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IncomeDialog } from "@/components/Income/IncomeDialog";
import { Plus, Pencil, Trash2, Download, Filter } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { exportIncomeToPDF } from "@/lib/incomeExport";

const IncomePage = () => {
  const { incomes, isLoading, addIncome, updateIncome, deleteIncome } = useIncome();
  const { userRole, madrasaName } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedIncome, setSelectedIncome] = useState<Income | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [incomeToDelete, setIncomeToDelete] = useState<string | null>(null);
  
  // Filters
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const canManage = userRole === "admin" || userRole === "teacher";

  const handleEdit = (income: Income) => {
    setSelectedIncome(income);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setIncomeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (incomeToDelete) {
      deleteIncome(incomeToDelete);
      setDeleteDialogOpen(false);
      setIncomeToDelete(null);
    }
  };

  const handleDialogClose = (open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setSelectedIncome(undefined);
    }
  };

  const handleSubmit = (data: Omit<Income, "id" | "created_at" | "updated_at" | "madrasa_name" | "created_by">) => {
    if (selectedIncome) {
      updateIncome({ ...data, id: selectedIncome.id });
    } else {
      addIncome(data);
    }
  };

  // Filter incomes
  const filteredIncomes = incomes.filter((income) => {
    const matchesType = typeFilter === "all" || income.income_type === typeFilter;
    const matchesSearch =
      searchQuery === "" ||
      income.donor_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      income.donor_contact?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDateFrom = dateFrom === "" || new Date(income.date) >= new Date(dateFrom);
    const matchesDateTo = dateTo === "" || new Date(income.date) <= new Date(dateTo);

    return matchesType && matchesSearch && matchesDateFrom && matchesDateTo;
  });

  // Calculate total
  const totalAmount = filteredIncomes.reduce((sum, income) => sum + Number(income.amount), 0);

  const handleExport = () => {
    exportIncomeToPDF({
      incomes: filteredIncomes,
      madrasaName: madrasaName || "مدرسہ",
      typeFilter,
      dateFrom,
      dateTo,
    });
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8" dir="rtl">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>آمد رجسٹر</CardTitle>
              <CardDescription>زکوٰۃ، صدقات، فطرانہ اور عطیات کی تفصیلات</CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleExport} variant="outline" size="sm">
                <Download className="ml-2 h-4 w-4" />
                ایکسپورٹ
              </Button>
              {canManage && (
                <Button onClick={() => setDialogOpen(true)}>
                  <Plus className="ml-2 h-4 w-4" />
                  نئی آمد
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filters */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-2 block">تلاش</label>
              <Input
                placeholder="نام یا رابطہ تلاش کریں"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">آمد کی قسم</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">تمام</SelectItem>
                  <SelectItem value="زکوٰۃ">زکوٰۃ</SelectItem>
                  <SelectItem value="صدقات">صدقات</SelectItem>
                  <SelectItem value="فطرانہ">فطرانہ</SelectItem>
                  <SelectItem value="عطیات">عطیات</SelectItem>
                  <SelectItem value="چندہ">چندہ</SelectItem>
                  <SelectItem value="دیگر">دیگر</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">تاریخ سے</label>
              <Input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">تاریخ تک</label>
              <Input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
            </div>
          </div>

          {/* Summary */}
          <div className="bg-primary/10 p-4 rounded-lg mb-6">
            <div className="flex justify-between items-center">
              <span className="text-lg font-semibold">کل آمد:</span>
              <span className="text-2xl font-bold text-primary">
                {totalAmount.toLocaleString()} روپے
              </span>
            </div>
            <div className="text-sm text-muted-foreground mt-2">
              کل ریکارڈز: {filteredIncomes.length}
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-right">تاریخ</TableHead>
                  <TableHead className="text-right">دہندہ کا نام</TableHead>
                  <TableHead className="text-right">رابطہ</TableHead>
                  <TableHead className="text-right">آمد کی قسم</TableHead>
                  <TableHead className="text-right">تعدد</TableHead>
                  <TableHead className="text-right">رقم</TableHead>
                  <TableHead className="text-right">رسید نمبر</TableHead>
                  {canManage && <TableHead className="text-right">اقدامات</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncomes.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={canManage ? 8 : 7} className="text-center">
                      کوئی ریکارڈ نہیں ملا
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredIncomes.map((income) => (
                    <TableRow key={income.id}>
                      <TableCell>{format(new Date(income.date), "dd/MM/yyyy")}</TableCell>
                      <TableCell className="font-medium">{income.donor_name}</TableCell>
                      <TableCell>{income.donor_contact || "-"}</TableCell>
                      <TableCell>
                        <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-primary/10 text-primary">
                          {income.income_type}
                        </span>
                      </TableCell>
                      <TableCell>{income.frequency}</TableCell>
                      <TableCell className="font-semibold">
                        {Number(income.amount).toLocaleString()} روپے
                      </TableCell>
                      <TableCell>{income.receipt_number || "-"}</TableCell>
                      {canManage && (
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(income)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(income.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <IncomeDialog
        open={dialogOpen}
        onOpenChange={handleDialogClose}
        onSubmit={handleSubmit}
        income={selectedIncome}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent dir="rtl">
          <AlertDialogHeader>
            <AlertDialogTitle>کیا آپ واقعی ڈیلیٹ کرنا چاہتے ہیں؟</AlertDialogTitle>
            <AlertDialogDescription>
              یہ عمل واپس نہیں ہو سکتا۔ یہ ریکارڈ مستقل طور پر ڈیلیٹ ہو جائے گا۔
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>منسوخ</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>ڈیلیٹ کریں</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default IncomePage;
