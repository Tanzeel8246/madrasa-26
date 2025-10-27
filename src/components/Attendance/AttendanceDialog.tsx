import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Attendance } from "@/hooks/useAttendance";
import { Student } from "@/hooks/useStudents";
import { Class } from "@/hooks/useClasses";
import { toast } from "sonner";

interface AttendanceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (attendance: Omit<Attendance, "id" | "created_at">) => void;
  attendance?: Attendance;
  students: Student[];
  classes: Class[];
}

export function AttendanceDialog({
  open,
  onOpenChange,
  onSave,
  attendance,
  students,
  classes,
}: AttendanceDialogProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    class_id: "",
    student_id: "",
    status: "present",
    time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
  });

  useEffect(() => {
    if (attendance) {
      setFormData({
        date: attendance.date,
        class_id: attendance.class_id || "",
        student_id: attendance.student_id || "",
        status: attendance.status,
        time: attendance.time || "",
      });
    } else {
      setFormData({
        date: new Date().toISOString().split('T')[0],
        class_id: "",
        student_id: "",
        status: "present",
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {attendance ? "Edit Attendance / حاضری میں ترمیم" : "Mark Attendance / حاضری نشان زد کریں"}
          </DialogTitle>
        </DialogHeader>
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
                {students.map((student) => (
                  <SelectItem key={student.id} value={student.id}>
                    {student.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Label htmlFor="time">Time / وقت</Label>
            <Input
              id="time"
              type="time"
              value={formData.time}
              onChange={(e) => setFormData({ ...formData, time: e.target.value })}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel / منسوخ
            </Button>
            <Button type="submit">Save / محفوظ کریں</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
