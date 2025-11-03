import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer } from "lucide-react";
import { useState, useMemo } from "react";
import { useStudents } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { useEducationReports } from "@/hooks/useEducationReports";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, parseISO } from "date-fns";

interface EducationReportRegisterProps {
  selectedDate: Date;
}

export function EducationReportRegister({ selectedDate }: EducationReportRegisterProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const { students } = useStudents();
  const { classes } = useClasses();
  const { reports } = useEducationReports();
  
  // Get all days in the selected month
  const monthDays = useMemo(() => {
    const start = startOfMonth(selectedDate);
    const end = endOfMonth(selectedDate);
    return eachDayOfInterval({ start, end });
  }, [selectedDate]);

  // Filter students by selected class
  const filteredStudents = useMemo(() => {
    if (selectedClassId === "all") {
      return students;
    }
    return students.filter(s => s.class_id === selectedClassId);
  }, [students, selectedClassId]);

  // Get report for a specific student and date
  const getReport = (studentId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return reports.find(
      r => r.student_id === studentId && r.date === dateStr
    );
  };

  // Format report data for display
  const formatReportData = (studentId: string, date: Date) => {
    const report = getReport(studentId, date);
    if (!report) return { display: "-", color: "" };

    const parts = [];
    
    // Sabak
    if (report.sabak?.para_no) {
      parts.push(`س:${report.sabak.para_no}`);
    }
    
    // Sabqi
    if (report.sabqi?.recited) {
      parts.push(`ق:${report.sabqi.amount || '✓'}`);
    }
    
    // Manzil
    if (report.manzil?.number) {
      parts.push(`م:${report.manzil.number}`);
    }

    return {
      display: parts.length > 0 ? parts.join(' ') : "✓",
      color: "text-green-600 dark:text-green-400"
    };
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <Card className="w-full overflow-hidden">
      <CardHeader className="bg-primary text-primary-foreground print:bg-primary print:text-primary-foreground">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:flex-row">
          <div className="text-right w-full sm:w-auto">
            <CardTitle className="text-2xl font-bold" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>
              تعلیمی رپورٹ رجسٹر
            </CardTitle>
            <p className="text-sm opacity-90 mt-1">
              {format(selectedDate, 'MMMM yyyy')} - ماہ
            </p>
          </div>
          <div className="flex gap-2 print:hidden w-full sm:w-auto">
            <Select value={selectedClassId} onValueChange={setSelectedClassId}>
              <SelectTrigger className="w-[200px] bg-background text-foreground">
                <SelectValue placeholder="Select Class" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">تمام کلاسیں</SelectItem>
                {classes.map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handlePrint} variant="outline" size="icon">
              <Printer className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table className="border-collapse" dir="rtl">
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="text-right border font-bold min-w-[60px] print:text-xs" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>
                  نمبر
                </TableHead>
                <TableHead className="text-right border font-bold min-w-[150px] print:text-xs" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>
                  نام طالب علم
                </TableHead>
                <TableHead className="text-right border font-bold min-w-[120px] print:text-xs" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>
                  والد کا نام
                </TableHead>
                {monthDays.map((day) => (
                  <TableHead 
                    key={day.toISOString()} 
                    className="text-center border font-bold min-w-[80px] print:min-w-[60px] print:text-xs"
                  >
                    <div className="flex flex-col items-center">
                      <span className="text-xs">{format(day, 'EEE')}</span>
                      <span className="font-bold">{format(day, 'd')}</span>
                    </div>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStudents.length === 0 ? (
                <TableRow>
                  <TableCell 
                    colSpan={monthDays.length + 3} 
                    className="text-center py-8 text-muted-foreground"
                    style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}
                  >
                    کوئی طالب علم نہیں ملا
                  </TableCell>
                </TableRow>
              ) : (
                filteredStudents.map((student, index) => (
                  <TableRow key={student.id} className="hover:bg-muted/30">
                    <TableCell className="text-right border font-medium print:text-xs">
                      {index + 1}
                    </TableCell>
                    <TableCell className="text-right border print:text-xs" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>
                      {student.name}
                    </TableCell>
                    <TableCell className="text-right border text-sm text-muted-foreground print:text-xs" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>
                      {student.father_name}
                    </TableCell>
                    {monthDays.map((day) => {
                      const data = formatReportData(student.id, day);
                      return (
                        <TableCell 
                          key={day.toISOString()} 
                          className={`text-center border text-xs print:text-xs ${data.color}`}
                        >
                          {data.display}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {/* Legend */}
        <div className="p-4 bg-muted/30 border-t print:p-2">
          <div className="flex flex-wrap gap-4 justify-center text-sm print:text-xs" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>
            <div className="flex items-center gap-2">
              <span className="font-bold">س:</span>
              <span>سبق (Sabak - Para Number)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">ق:</span>
              <span>سبقی (Sabqi - Recitation)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">م:</span>
              <span>منزل (Manzil - Number)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-green-600">✓</span>
              <span>رپورٹ موجود ہے (Report Available)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">-</span>
              <span>رپورٹ نہیں (No Report)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
