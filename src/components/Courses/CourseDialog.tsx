import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Course } from "@/hooks/useCourses";
import { courseSchema } from "@/lib/validations";
import { toast } from "sonner";

interface CourseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (course: Omit<Course, "id" | "created_at" | "updated_at">) => void;
  course?: Course;
}

export function CourseDialog({ open, onOpenChange, onSave, course }: CourseDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    duration: "",
    level: "",
    modules: "0",
    progress: "0",
    students_count: 0,
  });

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title,
        description: course.description || "",
        duration: course.duration || "",
        level: course.level || "",
        modules: course.modules.toString(),
        progress: course.progress.toString(),
        students_count: course.students_count,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        duration: "",
        level: "",
        modules: "0",
        progress: "0",
        students_count: 0,
      });
    }
  }, [course, open]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form data
    try {
      const validatedData = courseSchema.parse({
        title: formData.title,
        description: formData.description || '',
        level: formData.level || '',
        duration: formData.duration || '',
        modules: parseInt(formData.modules),
        progress: parseInt(formData.progress),
        students_count: formData.students_count,
      });
      
      onSave({
        title: validatedData.title,
        description: validatedData.description || undefined,
        level: validatedData.level || undefined,
        duration: validatedData.duration || undefined,
        modules: validatedData.modules,
        progress: validatedData.progress,
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
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{course ? "Edit Course" : "Add New Course"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Course Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="duration">Duration</Label>
            <Input
              id="duration"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              placeholder="e.g., 6 months"
            />
          </div>
          <div>
            <Label htmlFor="level">Level</Label>
            <Select value={formData.level} onValueChange={(value) => setFormData({ ...formData, level: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beginner">Beginner</SelectItem>
                <SelectItem value="Intermediate">Intermediate</SelectItem>
                <SelectItem value="Advanced">Advanced</SelectItem>
                <SelectItem value="All Levels">All Levels</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="modules">Number of Modules</Label>
            <Input
              id="modules"
              type="number"
              value={formData.modules}
              onChange={(e) => setFormData({ ...formData, modules: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="progress">Progress (%)</Label>
            <Input
              id="progress"
              type="number"
              min="0"
              max="100"
              value={formData.progress}
              onChange={(e) => setFormData({ ...formData, progress: e.target.value })}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
