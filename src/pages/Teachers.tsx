import { useState } from "react";
import { Plus, Search, Mail, BookOpen, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTeachers, Teacher } from "@/hooks/useTeachers";
import { TeacherDialog } from "@/components/Teachers/TeacherDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";

export default function Teachers() {
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [teacherToDelete, setTeacherToDelete] = useState<string | null>(null);
  
  const { teachers, isLoading, addTeacher, updateTeacher, deleteTeacher } = useTeachers();

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddClick = () => {
    setEditingTeacher(undefined);
    setDialogOpen(true);
  };

  const handleEditClick = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setDialogOpen(true);
  };

  const handleSave = (teacherData: Omit<Teacher, "id" | "created_at" | "updated_at">) => {
    if (editingTeacher) {
      updateTeacher({ id: editingTeacher.id, ...teacherData });
    } else {
      addTeacher(teacherData);
    }
  };

  const handleDeleteClick = (id: string) => {
    setTeacherToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (teacherToDelete) {
      deleteTeacher(teacherToDelete);
      setDeleteDialogOpen(false);
      setTeacherToDelete(null);
    }
  };
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Teachers</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Manage your madrasa instructors</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={handleAddClick} disabled={!isAdmin}>
          <Plus className="h-4 w-4" />
          Add Teacher
        </Button>
      </div>

      {/* Search Bar */}
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search teachers..."
                className="pl-10 bg-muted/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline">Filter</Button>
              <Button variant="outline">Export</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Teachers Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading teachers...</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-2">
          {filteredTeachers.map((teacher) => (
          <Card key={teacher.id} className="shadow-elevated hover:shadow-elevated transition-all duration-300 sm:hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary text-xl font-bold text-primary-foreground shadow-soft">
                    {teacher.name.split(" ").slice(1, 3).map((n) => n[0]).join("")}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg text-foreground">{teacher.name}</h3>
                    <Badge variant="secondary" className="mt-1">
                      {teacher.specialization}
                    </Badge>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-2 gap-4 rounded-lg bg-muted/50 p-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Classes</p>
                    <p className="text-2xl font-bold text-foreground">{teacher.classes_count}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Students</p>
                    <p className="text-2xl font-bold text-foreground">{teacher.students_count}</p>
                  </div>
                </div>

                {/* Contact */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground border-t border-border pt-4">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{teacher.email}</span>
                </div>

                {/* Actions */}
                {isAdmin && (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => handleEditClick(teacher)}>
                      <Edit className="h-4 w-4 mr-1" />
                      Edit
                    </Button>
                    <Button size="sm" variant="destructive" onClick={() => handleDeleteClick(teacher.id)}>
                      <Trash2 className="h-4 w-4 mr-1" />
                      Delete
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
            </Card>
          ))}
        </div>
      )}

      <TeacherDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        teacher={editingTeacher}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the teacher record.
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
