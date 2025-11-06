import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Printer, ChevronLeft, ChevronRight } from "lucide-react";
import { useState, useMemo } from "react";
import { useStudents } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { useAttendance } from "@/hooks/useAttendance";
import { startOfMonth, endOfMonth, eachDayOfInterval, format, setMonth, setYear } from "date-fns";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface AttendanceRegisterProps {
  selectedDate: Date;
}

const getStatusSymbol = (status: string) => {
  switch (status) {
    case "present":
      return "✓";
    case "absent":
      return "✗";
    case "late":
      return "△";
    case "excused":
      return "○";
    default:
      return "-";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "present":
      return "text-green-600 dark:text-green-400";
    case "absent":
      return "text-red-600 dark:text-red-400";
    case "late":
      return "text-yellow-600 dark:text-yellow-400";
    case "excused":
      return "text-blue-600 dark:text-blue-400";
    default:
      return "text-muted-foreground";
  }
};

export function AttendanceRegister({ selectedDate }: AttendanceRegisterProps) {
  const [selectedClassId, setSelectedClassId] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [displayDate, setDisplayDate] = useState<Date>(selectedDate);
  const { students } = useStudents();
  const { classes } = useClasses();
  const { isAdmin } = useAuth();

  // Generate month and year options
  const months = [
    { value: "0", label: "جنوری / January" },
    { value: "1", label: "فروری / February" },
    { value: "2", label: "مارچ / March" },
    { value: "3", label: "اپریل / April" },
    { value: "4", label: "مئی / May" },
    { value: "5", label: "جون / June" },
    { value: "6", label: "جولائی / July" },
    { value: "7", label: "اگست / August" },
    { value: "8", label: "ستمبر / September" },
    { value: "9", label: "اکتوبر / October" },
    { value: "10", label: "نومبر / November" },
    { value: "11", label: "دسمبر / December" },
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - 5 + i);
  
  // Get all days in the selected month
  const monthDays = useMemo(() => {
    const start = startOfMonth(displayDate);
    const end = endOfMonth(displayDate);
    return eachDayOfInterval({ start, end });
  }, [displayDate]);

  // Split days into pages of 10 days each
  const daysPerPage = 10;
  const totalPages = Math.ceil(monthDays.length / daysPerPage);
  const paginatedDays = useMemo(() => {
    const startIndex = (currentPage - 1) * daysPerPage;
    const endIndex = startIndex + daysPerPage;
    return monthDays.slice(startIndex, endIndex);
  }, [monthDays, currentPage]);

  // Fetch attendance for the entire month
  const { attendance, markAttendance } = useAttendance();

  // Filter students by selected class
  const filteredStudents = useMemo(() => {
    if (selectedClassId === "all") {
      return students;
    }
    return students.filter(s => s.class_id === selectedClassId);
  }, [students, selectedClassId]);

  // Get attendance status for a specific student and date
  const getAttendanceStatus = (studentId: string, date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    const record = attendance.find(
      a => a.student_id === studentId && a.date === dateStr
    );
    return record?.status || null;
  };

  // Cycle through attendance statuses
  const cycleAttendanceStatus = (currentStatus: string | null): string => {
    const statusCycle = [null, "present", "absent", "late", "excused"];
    const currentIndex = statusCycle.indexOf(currentStatus);
    const nextIndex = (currentIndex + 1) % statusCycle.length;
    return statusCycle[nextIndex] as string;
  };

  // Handle attendance marking
  const handleMarkAttendance = (studentId: string, date: Date) => {
    if (!isAdmin) {
      toast.error("Only admins can mark attendance");
      return;
    }

    const currentStatus = getAttendanceStatus(studentId, date);
    const newStatus = cycleAttendanceStatus(currentStatus);
    
    if (newStatus === null) {
      // Delete attendance if cycling back to null
      const dateStr = format(date, 'yyyy-MM-dd');
      const record = attendance.find(
        a => a.student_id === studentId && a.date === dateStr
      );
      // For now, just skip - we'd need a delete function
      return;
    }

    const student = students.find(s => s.id === studentId);
    markAttendance({
      date: format(date, 'yyyy-MM-dd'),
      student_id: studentId,
      class_id: student?.class_id,
      status: newStatus,
      time: "صبح",
    });
  };

  const handlePrint = () => {
    // Add print-specific class to body
    document.body.classList.add('printing-register');
    window.print();
    // Remove class after print dialog closes
    setTimeout(() => {
      document.body.classList.remove('printing-register');
    }, 1000);
  };

  const handleMonthChange = (monthValue: string) => {
    const newDate = setMonth(displayDate, parseInt(monthValue));
    setDisplayDate(newDate);
    setCurrentPage(1);
  };

  const handleYearChange = (yearValue: string) => {
    const newDate = setYear(displayDate, parseInt(yearValue));
    setDisplayDate(newDate);
    setCurrentPage(1);
  };

  return (
    <>
      <style>{`
        @media print {
          body.printing-register > *:not(.print-register-container) {
            display: none !important;
          }
          body.printing-register .print-register-container {
            display: block !important;
          }
          .print-register-container {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
      <Card className="w-full overflow-hidden print-register-container">
        <CardHeader className="bg-primary text-primary-foreground print:bg-primary print:text-primary-foreground">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 print:flex-row">
            <div className="text-right w-full sm:w-auto">
              <CardTitle className="text-2xl font-bold" style={{ fontFamily: "'Noto Nastaliq Urdu', serif" }}>
                حاضری رجسٹر
              </CardTitle>
              <p className="text-sm opacity-90 mt-1">
                {format(displayDate, 'MMMM yyyy')} - ماہ (صفحہ {currentPage} از {totalPages})
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 print:hidden w-full sm:w-auto">
              <div className="flex gap-2">
                <Select value={displayDate.getMonth().toString()} onValueChange={handleMonthChange}>
                  <SelectTrigger className="w-[180px] bg-background text-foreground">
                    <SelectValue placeholder="ماہ منتخب کریں" />
                  </SelectTrigger>
                  <SelectContent>
                    {months.map((month) => (
                      <SelectItem key={month.value} value={month.value}>
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={displayDate.getFullYear().toString()} onValueChange={handleYearChange}>
                  <SelectTrigger className="w-[120px] bg-background text-foreground">
                    <SelectValue placeholder="سال" />
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
              <div className="flex gap-2">
                <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                  <SelectTrigger className="w-[180px] bg-background text-foreground">
                    <SelectValue placeholder="کلاس منتخب کریں" />
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
                <div className="flex gap-1">
                  <Button 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    variant="outline" 
                    size="icon"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    variant="outline" 
                    size="icon"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                </div>
                <Button onClick={handlePrint} variant="secondary" size="icon">
                  <Printer className="h-4 w-4" />
                </Button>
              </div>
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
                  کلاس
                </TableHead>
                {paginatedDays.map((day) => (
                  <TableHead 
                    key={day.toISOString()} 
                    className="text-center border font-bold min-w-[50px] print:min-w-[40px] print:text-xs"
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
                    colSpan={paginatedDays.length + 3} 
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
                    <TableCell className="text-right border text-sm text-muted-foreground print:text-xs">
                      {classes.find(c => c.id === student.class_id)?.name || "-"}
                    </TableCell>
                    {paginatedDays.map((day) => {
                      const status = getAttendanceStatus(student.id, day);
                      return (
                        <TableCell 
                          key={day.toISOString()} 
                          className={`text-center border font-bold text-lg print:text-sm ${status ? getStatusColor(status) : ''} ${isAdmin ? 'cursor-pointer hover:bg-muted/50' : ''} print:cursor-default`}
                          onClick={() => handleMarkAttendance(student.id, day)}
                          title={isAdmin ? "Click to mark attendance / حاضری لگانے کے لیے کلک کریں" : ""}
                        >
                          {status ? getStatusSymbol(status) : "-"}
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
              <span className="font-bold text-lg text-green-600">✓</span>
              <span>حاضر (Present)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-red-600">✗</span>
              <span>غیر حاضر (Absent)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-yellow-600">△</span>
              <span>دیر سے (Late)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-blue-600">○</span>
              <span>معذور (Excused)</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
    </>
  );
}
