import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Attendance } from "@/hooks/useAttendance";
import { Student } from "@/hooks/useStudents";
import { Class } from "@/hooks/useClasses";
import { toast } from "sonner";

interface AttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (attendance: Omit<Attendance, "id" | "created_at">) => void;
  onBulkSave?: (attendanceRecords: Omit<Attendance, "id" | "created_at">[]) => void;
  attendance?: Attendance;
  students: Student[];
  classes: Class[];
  existingAttendance: Attendance[];
}

export function AttendanceDialog({
  open,
  onOpenChange,
  onSave,
  onBulkSave,
  attendance,
  students,
  classes,
  existingAttendance,
}: AttendanceDialogProps) {
  const [mode, setMode] = useState<"single" | "bulk">("single");
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    class_id: "",
    student_id: "",
    status: "present",
    time: "صبح",
  });
  const [bulkFormData, setBulkFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    status: "present",
    time: "صبح",
    selectedStudents: [] as string[],
  });

  useEffect(() => {
    if (attendance) {
      setMode("single");
      setFormData({
        date: attendance.date,
        class_id: attendance.class_id || "",
        student_id: attendance.student_id || "",
        status: attendance.status,
        time: attendance.time || "",
      });
    } else {
      setMode("single");
      setFormData({
        date: new Date().toISOString().split('T')[0],
        class_id: "",
        student_id: "",
        status: "present",
        time: "صبح",
      });
      setBulkFormData({
        date: new Date().toISOString().split('T')[0],
        status: "present",
        time: "صبح",
        selectedStudents: [],
      });
    }
  }, [attendance, open]);

  const handleStudentChange = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setFormData({
        ...formData,
        student_id: studentId,
        class_id: student.class_id || "",
      });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.student_id) {
      toast.error("Please select a student");
      return;
    }

    onSave({
      date: formData.date,
      class_id: formData.class_id || undefined,
      student_id: formData.student_id || undefined,
      status: formData.status,
      time: formData.time || undefined,
    });
    onOpenChange(false);
  };

  const handleBulkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (bulkFormData.selectedStudents.length === 0) {
      toast.error("Please select at least one student");
      return;
    }

    if (!onBulkSave) {
      toast.error("Bulk save function not available");
      return;
    }

    const attendanceRecords = bulkFormData.selectedStudents.map(studentId => {
      const student = students.find(s => s.id === studentId);
      return {
        date: bulkFormData.date,
        class_id: student?.class_id || undefined,
        student_id: studentId,
        status: bulkFormData.status,
        time: bulkFormData.time || undefined,
      };
    });

    onBulkSave(attendanceRecords);
    onOpenChange(false);
  };

  const toggleStudentSelection = (studentId: string) => {
    setBulkFormData(prev => ({
      ...prev,
      selectedStudents: prev.selectedStudents.includes(studentId)
        ? prev.selectedStudents.filter(id => id !== studentId)
        : [...prev.selectedStudents, studentId],
    }));
  };

  const selectAllStudents = () => {
    setBulkFormData(prev => ({
      ...prev,
      selectedStudents: students.map(s => s.id),
    }));
  };

  const deselectAllStudents = () => {
    setBulkFormData(prev => ({
      ...prev,
      selectedStudents: [],
    }));
  };

  // Filter students who already have attendance for selected date and time
  const getAvailableStudents = (date: string, time: string) => {
    return students.filter(student => {
      const hasAttendance = existingAttendance.some(
        att => att.student_id === student.id && att.date === date && att.time === time
      );
      return !hasAttendance;
    });
  };

  const availableStudentsForSingle = getAvailableStudents(formData.date, formData.time);
  const availableStudentsForBulk = getAvailableStudents(bulkFormData.date, bulkFormData.time);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {attendance ? "Edit Attendance / حاضری میں ترمیم" : "Mark Attendance / حاضری نشان زد کریں"}
          </DialogTitle>
        </DialogHeader>
        
        <Tabs value={mode} onValueChange={(value) => setMode(value as "single" | "bulk")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="single">Single / انفرادی</TabsTrigger>
            <TabsTrigger value="bulk">Bulk / اجتماعی</TabsTrigger>
          </TabsList>
          
          <TabsContent value="single">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="date">Date / تاریخ *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="student_id">Student / طالب علم *</Label>
                <Select value={formData.student_id} onValueChange={handleStudentChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select student" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableStudentsForSingle.map((student) => (
                      <SelectItem key={student.id} value={student.id}>
                        {student.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {availableStudentsForSingle.length === 0 && (
                  <p className="text-xs text-muted-foreground mt-1">
                    All students have attendance marked for this time
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="class_id">Class / کلاس</Label>
                <Select value={formData.class_id || undefined} onValueChange={(value) => setFormData({ ...formData, class_id: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select class" />
                  </SelectTrigger>
                  <SelectContent>
                    {classes.map((cls) => (
                      <SelectItem key={cls.id} value={cls.id}>
                        {cls.name} {cls.section ? `- ${cls.section}` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Status / حالت *</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present / حاضر</SelectItem>
                    <SelectItem value="absent">Absent / غائب</SelectItem>
                    <SelectItem value="late">Late / تاخیر</SelectItem>
                    <SelectItem value="excused">Excused / معذور</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="time">Time / وقت *</Label>
                <Select value={formData.time} onValueChange={(value) => setFormData({ ...formData, time: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="صبح">صبح (Morning)</SelectItem>
                    <SelectItem value="دوپہر">دوپہر (Afternoon)</SelectItem>
                    <SelectItem value="شام">شام (Evening)</SelectItem>
                    <SelectItem value="رات">رات (Night)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel / منسوخ
                </Button>
                <Button type="submit">Save / محفوظ کریں</Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="bulk">
            <form onSubmit={handleBulkSubmit} className="space-y-4">
              <div>
                <Label htmlFor="bulk-date">Date / تاریخ *</Label>
                <Input
                  id="bulk-date"
                  type="date"
                  value={bulkFormData.date}
                  onChange={(e) => setBulkFormData({ ...bulkFormData, date: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="bulk-status">Status / حالت *</Label>
                <Select value={bulkFormData.status} onValueChange={(value) => setBulkFormData({ ...bulkFormData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="present">Present / حاضر</SelectItem>
                    <SelectItem value="absent">Absent / غائب</SelectItem>
                    <SelectItem value="late">Late / تاخیر</SelectItem>
                    <SelectItem value="excused">Excused / معذور</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="bulk-time">Time / وقت *</Label>
                <Select value={bulkFormData.time} onValueChange={(value) => setBulkFormData({ ...bulkFormData, time: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="صبح">صبح (Morning)</SelectItem>
                    <SelectItem value="دوپہر">دوپہر (Afternoon)</SelectItem>
                    <SelectItem value="شام">شام (Evening)</SelectItem>
                    <SelectItem value="رات">رات (Night)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label>Select Students / طلبہ منتخب کریں *</Label>
                  <div className="flex gap-2">
                    <Button type="button" size="sm" variant="outline" onClick={selectAllStudents}>
                      Select All / سب منتخب کریں
                    </Button>
                    <Button type="button" size="sm" variant="outline" onClick={deselectAllStudents}>
                      Deselect All / سب ہٹائیں
                    </Button>
                  </div>
                </div>
                <div className="border rounded-lg p-4 max-h-64 overflow-y-auto space-y-2">
                  {availableStudentsForBulk.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      All students have attendance marked for this date and time
                    </p>
                  ) : (
                    availableStudentsForBulk.map((student) => (
                      <div key={student.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`student-${student.id}`}
                          checked={bulkFormData.selectedStudents.includes(student.id)}
                          onCheckedChange={() => toggleStudentSelection(student.id)}
                        />
                        <label
                          htmlFor={`student-${student.id}`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                        >
                          {student.name}
                        </label>
                      </div>
                    ))
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {bulkFormData.selectedStudents.length} student(s) selected
                </p>
              </div>
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel / منسوخ
                </Button>
                <Button type="submit">
                  Mark {bulkFormData.selectedStudents.length} Student(s) / محفوظ کریں
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
