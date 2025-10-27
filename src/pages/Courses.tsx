import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Users, Award, Edit, Trash2 } from "lucide-react";
import { useCourses, Course } from "@/hooks/useCourses";
import { CourseDialog } from "@/components/Courses/CourseDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";

const getLevelColor = (level: string) => {
  if (level.includes("Beginner")) return "bg-green-500/10 text-green-700 dark:text-green-400";
  if (level.includes("Intermediate")) return "bg-blue-500/10 text-blue-700 dark:text-blue-400";
  if (level.includes("Advanced")) return "bg-purple-500/10 text-purple-700 dark:text-purple-400";
  return "bg-gray-500/10 text-gray-700 dark:text-gray-400";
};

export default function Courses() {
  const { isAdmin } = useAuth();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [courseToDelete, setCourseToDelete] = useState<string | null>(null);

  const { courses, isLoading, addCourse, updateCourse, deleteCourse } = useCourses();

  const handleAddClick = () => {
    setEditingCourse(undefined);
    setDialogOpen(true);
  };

  const handleEditClick = (course: Course) => {
    setEditingCourse(course);
    setDialogOpen(true);
  };

  const handleSave = (courseData: Omit<Course, "id" | "created_at" | "updated_at">) => {
    if (editingCourse) {
      updateCourse({ id: editingCourse.id, ...courseData });
    } else {
      addCourse(courseData);
    }
  };

  const handleDeleteClick = (id: string) => {
    setCourseToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (courseToDelete) {
      deleteCourse(courseToDelete);
      setDeleteDialogOpen(false);
      setCourseToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Courses</h1>
          <p className="text-muted-foreground text-sm md:text-base">Browse and manage madrasa courses</p>
        </div>
        <Button onClick={handleAddClick} className="w-full sm:w-auto">
          <BookOpen className="mr-2 h-4 w-4" />
          Add New Course
        </Button>
      </div>

      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading courses...</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow sm:hover:-translate-y-1">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-lg">{course.title}</CardTitle>
                    <CardDescription>{course.description || "No description"}</CardDescription>
                  </div>
                  {course.level && <Badge className={getLevelColor(course.level)}>{course.level}</Badge>}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Course Progress</span>
                      <span className="font-medium">{course.progress}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-sm">
                    {course.duration && (
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        <span>{course.duration}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Users className="h-4 w-4" />
                      <span>{course.students_count} students</span>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground col-span-2">
                      <Award className="h-4 w-4" />
                      <span>{course.modules} modules</span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditClick(course)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(course.id)}>
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

      <CourseDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        course={editingCourse}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the course.
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
