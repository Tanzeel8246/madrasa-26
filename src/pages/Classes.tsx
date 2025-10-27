import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, BookOpen, Calendar, Edit, Trash2 } from "lucide-react";
import { useClasses, Class } from "@/hooks/useClasses";
import { useTeachers } from "@/hooks/useTeachers";
import { ClassDialog } from "@/components/Classes/ClassDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";

const getLevelColor = (level: string) => {
  switch (level) {
    case "Beginner":
      return "bg-green-500/10 text-green-700 dark:text-green-400";
    case "Intermediate":
      return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
    case "Advanced":
      return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
    default:
      return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
  }
};

export default function Classes() {
  const { isAdmin } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [classToDelete, setClassToDelete] = useState<string | null>(null);

  const { classes, isLoading, addClass, updateClass, deleteClass } = useClasses();
  const { teachers } = useTeachers();

  const handleAddClick = () => {
    setEditingClass(undefined);
    setDialogOpen(true);
  };

  const handleEditClick = (classData: Class) => {
    setEditingClass(classData);
    setDialogOpen(true);
  };

  const handleSave = (classData: Omit<Class, "id" | "created_at" | "updated_at">) => {
    if (editingClass) {
      updateClass({ id: editingClass.id, ...classData });
    } else {
      addClass(classData);
    }
  };

  const handleDeleteClick = (id: string) => {
    setClassToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (classToDelete) {
      deleteClass(classToDelete);
      setDeleteDialogOpen(false);
      setClassToDelete(null);
    }
  };

  const getTeacherName = (teacherId?: string) => {
    const teacher = teachers.find((t) => t.id === teacherId);
    return teacher ? teacher.name : "No teacher assigned";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Classes</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage madrasa classes and schedules</p>
        </div>
        <Button onClick={handleAddClick} className="w-full sm:w-auto">
          <BookOpen className="mr-2 h-4 w-4" />
          Add New Class
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading classes...</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
          {classes.map((classItem) => (
            <Card key={classItem.id} className="hover:shadow-lg transition-shadow sm:hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle>{classItem.name}</CardTitle>
                    <CardDescription>Taught by {getTeacherName(classItem.teacher_id)}</CardDescription>
                  </div>
                  {classItem.level && <Badge className={getLevelColor(classItem.level)}>{classItem.level}</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {classItem.schedule && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>{classItem.schedule}</span>
                    </div>
                  )}
                  {classItem.duration && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-4 w-4" />
                      <span>{classItem.duration}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{classItem.students_count} students enrolled</span>
                  </div>
                  {classItem.room && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <BookOpen className="h-4 w-4" />
                      <span>{classItem.room}</span>
                    </div>
                  )}
                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(classItem)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(classItem.id)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <ClassDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        classData={editingClass}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the class.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
