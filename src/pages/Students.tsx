import { useState } from "react";
import { Plus, Search, User, Phone, Edit, Trash2, Download, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useStudents, Student } from "@/hooks/useStudents";
import { StudentDialog } from "@/components/Students/StudentDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { useAuth } from "@/contexts/AuthContext";
import { exportStudentListToPDF } from "@/lib/exportUtils";
import { useClasses } from "@/hooks/useClasses";
import { toast } from "sonner";

export default function Students() {
  const { isAdmin, madrasaName } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  
  const { students, isLoading, addStudent, updateStudent, deleteStudent } = useStudents();
  const { classes } = useClasses();

  const filteredStudents = students.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleExport = () => {
    if (filteredStudents.length === 0) {
      toast.error('No students to export');
      return;
    }
    
    exportStudentListToPDF({
      students: filteredStudents,
      madrasaName: madrasaName || 'Madrasa',
      classes
    });
    
    toast.success('Student list exported successfully!');
  };

  const handleAddClick = () => {
    setEditingStudent(undefined);
    setDialogOpen(true);
  };

  const handleEditClick = (student: Student) => {
    setEditingStudent(student);
    setDialogOpen(true);
  };

  const handleSave = (studentData: Omit<Student, "id" | "created_at" | "updated_at">) => {
    if (editingStudent) {
      updateStudent({ id: editingStudent.id, ...studentData });
    } else {
      addStudent(studentData);
    }
  };

  const handleDeleteClick = (id: string) => {
    setStudentToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (studentToDelete) {
      deleteStudent(studentToDelete);
      setDeleteDialogOpen(false);
      setStudentToDelete(null);
    }
  };

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    toast.success('آئی ڈی کاپی ہو گئی');
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground">Students</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Manage your madrasa students</p>
        </div>
        <Button className="gap-2 w-full sm:w-auto" onClick={handleAddClick} disabled={!isAdmin}>
          <Plus className="h-4 w-4" />
          Add Student
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="shadow-soft">
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search students..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 bg-muted/50"
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Students Grid */}
      {isLoading ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Loading students...</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredStudents.length > 0 ? (
            filteredStudents.map((student) => (
              <Card key={student.id} className="shadow-elevated hover:shadow-elevated transition-all duration-300 sm:hover:-translate-y-1">
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-primary text-lg font-bold text-primary-foreground shadow-soft">
                        {student.name.split(" ").map((n) => n[0]).join("")}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg text-foreground">{student.name}</h3>
                        <p className="text-sm text-muted-foreground">{student.grade || "No grade"}</p>
                      </div>
                      <Badge variant={student.status === "active" ? "default" : "secondary"}>
                        {student.status}
                      </Badge>
                    </div>

                    {/* Contact Info */}
                    <div className="space-y-2 rounded-lg bg-muted/50 p-3">
                      <div className="flex items-center gap-2 text-sm">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <span className="text-foreground truncate">{student.father_name}</span>
                      </div>
                      {student.contact && (
                        <div className="flex items-center gap-2 text-sm">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-foreground">{student.contact}</span>
                        </div>
                      )}
                      {isAdmin && (
                        <div className="flex items-center gap-2 text-sm border-t border-border pt-2 mt-2">
                          <Badge variant="outline" className="font-mono text-xs">ID</Badge>
                          <span className="text-xs text-muted-foreground truncate flex-1">{student.id}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => handleCopyId(student.id)}
                          >
                            {copiedId === student.id ? (
                              <Check className="h-3 w-3 text-green-600" />
                            ) : (
                              <Copy className="h-3 w-3" />
                            )}
                          </Button>
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    {isAdmin && (
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="flex-1" onClick={() => handleEditClick(student)}>
                          <Edit className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Edit</span>
                        </Button>
                        <Button size="sm" variant="destructive" className="flex-1" onClick={() => handleDeleteClick(student.id)}>
                          <Trash2 className="h-4 w-4 mr-1" />
                          <span className="hidden sm:inline">Delete</span>
                        </Button>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="col-span-full text-center py-12">
              <p className="text-muted-foreground">No students found matching your search.</p>
            </div>
          )}
        </div>
      )}

      <StudentDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        student={editingStudent}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the student record.
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
