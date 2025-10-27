import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Class } from "@/hooks/useClasses";
import { useTeachers } from "@/hooks/useTeachers";
import { classSchema } from "@/lib/validations";
import { toast } from "sonner";

interface ClassDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (classData: Omit<Class, "id" | "created_at" | "updated_at">) => void;
  classData?: Class;
}

export function ClassDialog({ open, onOpenChange, onSave, classData }: ClassDialogProps) {
  const { teachers } = useTeachers();
  const [formData, setFormData] = useState({
    name: "",
    teacher_id: "",
    schedule: "",
    duration: "",
    room: "",
    level: "",
    students_count: 0,
  });

  useEffect(() => {
    if (classData) {
      setFormData({
        name: classData.name,
        teacher_id: classData.teacher_id || "",
        schedule: classData.schedule || "",
        duration: classData.duration || "",
        room: classData.room || "",
        level: classData.level || "",
        students_count: classData.students_count,
      });
    } else {
      setFormData({
        name: "",
        teacher_id: "",
        schedule: "",
        duration: "",
        room: "",
        level: "",
        students_count: 0,
      });
    }
  }, [classData, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    try {
      const validatedData = classSchema.parse({
        name: formData.name,
        teacher_id: formData.teacher_id || null,
        schedule: formData.schedule || '',
        duration: formData.duration || '',
        room: formData.room || '',
        level: formData.level || '',
        students_count: formData.students_count,
      });
      
      onSave({
        name: validatedData.name,
        teacher_id: validatedData.teacher_id || undefined,
        schedule: validatedData.schedule || undefined,
        duration: validatedData.duration || undefined,
        room: validatedData.room || undefined,
        level: validatedData.level || undefined,
        students_count: validatedData.students_count,
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
          <DialogTitle className="text-lg">{classData ? "Edit Class / کلاس میں ترمیم" : "Add New Class / نیا کلاس شامل کریں"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Basic Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">Basic Information / بنیادی معلومات</h3>
            <div>
              <Label htmlFor="name" className="text-sm">Class Name / کلاس کا نام *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="mt-1.5"
                placeholder="e.g., Quran Recitation - Level 1"
              />
            </div>
            <div>
              <Label htmlFor="teacher" className="text-sm">Teacher / استاد</Label>
              <Select value={formData.teacher_id} onValueChange={(value) => setFormData({ ...formData, teacher_id: value })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select a teacher / استاد منتخب کریں" />
                </SelectTrigger>
                <SelectContent>
                  {teachers.map((teacher) => (
                    <SelectItem key={teacher.id} value={teacher.id}>
                      {teacher.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="level" className="text-sm">Level / سطح</Label>
              <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue placeholder="Select level / سطح منتخب کریں" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Beginner">Beginner / ابتدائی</SelectItem>
                  <SelectItem value="Intermediate">Intermediate / درمیانہ</SelectItem>
                  <SelectItem value="Advanced">Advanced / جدید</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Schedule & Location */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b pb-2">Schedule & Location / شیڈول اور مقام</h3>
            <div>
              <Label htmlFor="schedule" className="text-sm">Schedule / شیڈول</Label>
              <Input
                id="schedule"
                value={formData.schedule}
                onChange={(e) => setFormData({ ...formData, schedule: e.target.value })}
                className="mt-1.5"
                placeholder="e.g., Mon, Wed, Fri - 9:00 AM"
              />
            </div>
            <div>
              <Label htmlFor="duration" className="text-sm">Duration / دورانیہ</Label>
              <Input
                id="duration"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="mt-1.5"
                placeholder="e.g., 1 hour / 1 گھنٹہ"
              />
            </div>
            <div>
              <Label htmlFor="room" className="text-sm">Room / کمرہ</Label>
              <Input
                id="room"
                value={formData.room}
                onChange={(e) => setFormData({ ...formData, room: e.target.value })}
                className="mt-1.5"
                placeholder="e.g., Room 101"
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
