import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";
import { CalendarIcon, Check, X, Clock, AlertCircle } from "lucide-react";
import { useAttendance } from "@/hooks/useAttendance";
import { useStudents } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { AttendanceDialog } from "@/components/Attendance/AttendanceDialog";
import { useAuth } from "@/contexts/AuthContext";

const getStatusColor = (status: string) => {
  switch (status) {
    case "present":
      return "bg-green-500/10 text-green-700 dark:text-green-400";
    case "absent":
      return "bg-red-500/10 text-red-700 dark:text-red-400";
    case "late":
      return "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400";
    case "excused":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
    default:
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "present":
      return <Check className="h-4 w-4" />;
    case "absent":
      return <X className="h-4 w-4" />;
    case "late":
      return <Clock className="h-4 w-4" />;
    case "excused":
      return <AlertCircle className="h-4 w-4" />;
    default:
      return null;
  }
};

export default function Attendance() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [dialogOpen, setDialogOpen] = useState(false);
  const { isAdmin } = useAuth();
  
  const selectedDateString = date?.toISOString().split('T')[0];
  const { attendance, isLoading, markAttendance } = useAttendance(selectedDateString);
  const { students } = useStudents();
  const { classes } = useClasses();

  const getStudentName = (studentId?: string) => {
    if (!studentId) return "N/A";
    const student = students.find(s => s.id === studentId);
    return student?.name || "Unknown";
  };

  const getClassName = (classId?: string) => {
    if (!classId) return "No Class";
    const cls = classes.find(c => c.id === classId);
    return cls?.name || "Unknown";
  };

  const handleSave = (attendanceData: any) => {
    markAttendance(attendanceData);
  };

  const statusCounts = {
    present: attendance.filter(a => a.status === "present").length,
    absent: attendance.filter(a => a.status === "absent").length,
    late: attendance.filter(a => a.status === "late").length,
    excused: attendance.filter(a => a.status === "excused").length,
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-foreground">Attendance / حاضری</h1>
            <p className="text-muted-foreground text-sm md:text-base">Track and manage student attendance / طلباء کی حاضری کا نظم کریں</p>
          </div>
          {isAdmin && (
            <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto">
              <CalendarIcon className="mr-2 h-4 w-4" />
              Mark Attendance
            </Button>
          )}
        </div>

        <div className="grid gap-6 lg:grid-cols-3 xl:grid-cols-[2fr_1fr]">
          <Card className="order-2 lg:order-1">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Attendance Records</CardTitle>
              <CardDescription>
                {date?.toLocaleDateString("en-US", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading attendance...</p>
              ) : attendance.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No attendance records for this date</p>
              ) : (
                <div className="space-y-4">
                  {attendance.map((record) => (
                    <div
                      key={record.id}
                      className="flex items-center justify-between rounded-lg border p-4"
                    >
                      <div className="space-y-1">
                        <p className="font-medium">{getStudentName(record.student_id)}</p>
                        <p className="text-sm text-muted-foreground">{getClassName(record.class_id)}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        {record.time && (
                          <span className="text-sm text-muted-foreground">{record.time}</span>
                        )}
                        <Badge className={getStatusColor(record.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(record.status)}
                            {record.status.charAt(0).toUpperCase() + record.status.slice(1)}
                          </span>
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="order-1 lg:order-2">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Select Date</CardTitle>
              <CardDescription className="text-sm">View attendance for a specific date</CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={date}
                onSelect={setDate}
                className="rounded-md border mx-auto"
              />
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-green-500" />
                    Present
                  </span>
                  <span className="font-medium">{statusCounts.present}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-red-500" />
                    Absent
                  </span>
                  <span className="font-medium">{statusCounts.absent}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-yellow-500" />
                    Late
                  </span>
                  <span className="font-medium">{statusCounts.late}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full bg-blue-500" />
                    Excused
                  </span>
                  <span className="font-medium">{statusCounts.excused}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <AttendanceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        students={students}
        classes={classes}
      />
    </>
  );
}
