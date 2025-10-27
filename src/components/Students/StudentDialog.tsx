import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Student } from "@/hooks/useStudents";
import { useClasses } from "@/hooks/useClasses";
import { studentSchema } from "@/lib/validations";
import { toast } from "sonner";

interface StudentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (student: Omit<Student, "id" | "created_at" | "updated_at">) => void;
  student?: Student;
}

export function StudentDialog({ open, onOpenChange, onSave, student }: StudentDialogProps) {
  const { classes } = useClasses();
  const [formData, setFormData] = useState({
    name: "",
    father_name: "",
    class_id: "",
    admission_date: new Date().toISOString().split('T')[0],
    contact: "",
    age: "",
    grade: "",
    status: "active",
  });

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name,
        father_name: student.father_name,
        class_id: student.class_id || "",
        admission_date: student.admission_date,
        contact: student.contact || "",
        age: student.age?.toString() || "",
        grade: student.grade || "",
        status: student.status,
      });
    } else {
      setFormData({
        name: "",
        father_name: "",
        class_id: "",
        admission_date: new Date().toISOString().split('T')[0],
        contact: "",
        age: "",
        grade: "",
        status: "active",
      });
    }
  }, [student, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = studentSchema.parse({
        name: formData.name,
        father_name: formData.father_name,
        class_id: formData.class_id || null,
        admission_date: formData.admission_date,
        contact: formData.contact || '',
        age: formData.age ? parseInt(formData.age) : null,
        grade: formData.grade || '',
        status: formData.status,
      });
      
      onSave({
        name: validatedData.name,
        father_name: validatedData.father_name,
        class_id: validatedData.class_id || undefined,
        admission_date: validatedData.admission_date,
        contact: validatedData.contact || undefined,
        age: validatedData.age || undefined,
        grade: validatedData.grade || undefined,
        status: validatedData.status,
      });
      onOpenChange(false);
    } catch (error: any) {
      const firstError = error.errors?.[0];
      toast.error(firstError?.message || "Invalid form data");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg">{student ? "Edit Student / طالب علم میں ترمیم" : "Add New Student / نیا طالب علم شامل کریں"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">Personal Information / ذاتی معلومات</h3>
            <div>
              <Label htmlFor="name" className="text-sm">Name / نام *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mt-1.5"
                placeholder="Student full name"
              />
            </div>
            <div>
              <Label htmlFor="father_name" className="text-sm">Father's Name / والد کا نام *</Label>
              <Input
                id="father_name"
                value={formData.father_name}
                onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                required
                className="mt-1.5"
                placeholder="Father's full name"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="age" className="text-sm">Age / عمر</Label>
                <Input
                  id="age"
                  type="number"
                  value={formData.age}
                  onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                  className="mt-1.5"
                  placeholder="e.g., 10"
                  min="1"
                  max="99"
                />
              </div>
              <div>
                <Label htmlFor="grade" className="text-sm">Grade / درجہ</Label>
                <Input
                  id="grade"
                  value={formData.grade}
                  onChange={(e) => setFormData({ ...formData, grade: e.target.value })}
                  className="mt-1.5"
                  placeholder="e.g., 5th"
                />
              </div>
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">Academic Information / تعلیمی معلومات</h3>
            <div>
              <Label htmlFor="class_id" className="text-sm">Class / کلاس</Label>
              <Select value={formData.class_id || undefined} onValueChange={(value) => setFormData({ ...formData, class_id: value })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select class / کلاس منتخب کریں" />
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
              <Label htmlFor="admission_date" className="text-sm">Admission Date / داخلے کی تاریخ *</Label>
              <Input
                id="admission_date"
                type="date"
                value={formData.admission_date}
                onChange={(e) => setFormData({ ...formData, admission_date: e.target.value })}
                required
                className="mt-1.5"
              />
            </div>
            <div>
              <Label htmlFor="status" className="text-sm">Status / حیثیت</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active / فعال</SelectItem>
                  <SelectItem value="inactive">Inactive / غیر فعال</SelectItem>
                  <SelectItem value="graduated">Graduated / فارغ التحصیل</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">Contact Information / رابطہ کی معلومات</h3>
            <div>
              <Label htmlFor="contact" className="text-sm">Contact / رابطہ</Label>
              <Input
                id="contact"
                value={formData.contact}
                onChange={(e) => setFormData({ ...formData, contact: e.target.value })}
                className="mt-1.5"
                placeholder="+92 300 1234567"
              />
            </div>
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-2 justify-end pt-2 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancel / منسوخ
            </Button>
            <Button type="submit" className="w-full sm:w-auto">Save / محفوظ کریں</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}