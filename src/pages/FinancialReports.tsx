import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Layout } from '@/components/Layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Download, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { exportFinancialReport } from '@/lib/financialReportExport';
import { useAuth } from '@/contexts/AuthContext';

const FinancialReports = () => {
  const { user } = useAuth();
  const [reportType, setReportType] = useState<'monthly' | 'annual'>('monthly');
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

  const { data: incomeData = [] } = useQuery({
    queryKey: ['income', reportType, selectedMonth, selectedYear],
    queryFn: async () => {
      let query = supabase
        .from('income')
        .select('*')
        .order('date', { ascending: false });

      if (reportType === 'monthly') {
        const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];
        query = query.gte('date', startDate).lte('date', endDate);
      } else {
        const startDate = `${selectedYear}-01-01`;
        const endDate = `${selectedYear}-12-31`;
        query = query.gte('date', startDate).lte('date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const { data: expenseData = [] } = useQuery({
    queryKey: ['expenses', reportType, selectedMonth, selectedYear],
    queryFn: async () => {
      let query = supabase
        .from('expenses')
        .select('*')
        .order('date', { ascending: false });

      if (reportType === 'monthly') {
        const startDate = new Date(selectedYear, selectedMonth - 1, 1).toISOString().split('T')[0];
        const endDate = new Date(selectedYear, selectedMonth, 0).toISOString().split('T')[0];
        query = query.gte('date', startDate).lte('date', endDate);
      } else {
        const startDate = `${selectedYear}-01-01`;
        const endDate = `${selectedYear}-12-31`;
        query = query.gte('date', startDate).lte('date', endDate);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data || [];
    },
  });

  const totalIncome = incomeData.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalExpenses = expenseData.reduce((sum, item) => sum + Number(item.amount), 0);
  const netBalance = totalIncome - totalExpenses;

  const handleExport = () => {
    exportFinancialReport(
      incomeData,
      expenseData,
      reportType,
      selectedMonth,
      selectedYear
    );
  };

  const months = [
    { value: 1, label: 'جنوری' },
    { value: 2, label: 'فروری' },
    { value: 3, label: 'مارچ' },
    { value: 4, label: 'اپریل' },
    { value: 5, label: 'مئی' },
    { value: 6, label: 'جون' },
    { value: 7, label: 'جولائی' },
    { value: 8, label: 'اگست' },
    { value: 9, label: 'ستمبر' },
    { value: 10, label: 'اکتوبر' },
    { value: 11, label: 'نومبر' },
    { value: 12, label: 'دسمبر' },
  ];

  const years = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() - i);

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">مالیاتی رپورٹس</h1>
            <p className="text-muted-foreground">آمدن اور خرچ کا خلاصہ</p>
          </div>
          <Button onClick={handleExport}>
            <Download className="ml-2 h-4 w-4" />
            PDF ڈاؤن لوڈ کریں
          </Button>
        </div>

        <div className="flex flex-wrap gap-4">
          <Select value={reportType} onValueChange={(value: any) => setReportType(value)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">ماہانہ رپورٹ</SelectItem>
              <SelectItem value="annual">سالانہ رپورٹ</SelectItem>
            </SelectContent>
          </Select>

          {reportType === 'monthly' && (
            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(Number(value))}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value.toString()}>
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(Number(value))}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {years.map((year) => (
                <SelectItem key={year} value={year.toString()}>
                  {year}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">کل آمدن</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {totalIncome.toLocaleString('ur-PK')} روپے
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">کل اخراجات</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {totalExpenses.toLocaleString('ur-PK')} روپے
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">خالص بیلنس</CardTitle>
              <DollarSign className="h-4 w-4" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${netBalance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netBalance.toLocaleString('ur-PK')} روپے
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>آمدن کی تفصیل</CardTitle>
              <CardDescription>
                {reportType === 'monthly' 
                  ? `${months[selectedMonth - 1].label} ${selectedYear}` 
                  : `سال ${selectedYear}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incomeData.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">کوئی آمدن نہیں ملی</p>
                ) : (
                  incomeData.map((item) => (
                    <div key={item.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{item.donor_name}</p>
                        <p className="text-sm text-muted-foreground">{item.income_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleDateString('ur-PK')}
                        </p>
                      </div>
                      <p className="font-bold text-green-600">
                        {Number(item.amount).toLocaleString('ur-PK')} روپے
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>اخراجات کی تفصیل</CardTitle>
              <CardDescription>
                {reportType === 'monthly' 
                  ? `${months[selectedMonth - 1].label} ${selectedYear}` 
                  : `سال ${selectedYear}`}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {expenseData.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">کوئی اخراجات نہیں ملے</p>
                ) : (
                  expenseData.map((item) => (
                    <div key={item.id} className="flex justify-between items-center border-b pb-2">
                      <div>
                        <p className="font-medium">{item.recipient_name}</p>
                        <p className="text-sm text-muted-foreground">{item.expense_type}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(item.date).toLocaleDateString('ur-PK')}
                        </p>
                      </div>
                      <p className="font-bold text-red-600">
                        {Number(item.amount).toLocaleString('ur-PK')} روپے
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default FinancialReports;
