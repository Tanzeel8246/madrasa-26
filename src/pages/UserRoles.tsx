import { useState } from "react";
import { Search, Plus, Shield, Mail, Phone, AtSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles, UserRole } from "@/hooks/useUserRoles";
import { usePendingUserRoles } from "@/hooks/usePendingUserRoles";
import { UserRoleDialog } from "@/components/UserRoles/UserRoleDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const getRoleBadge = (role: string) => {
  switch (role) {
    case "admin":
      return <Badge className="bg-purple-500/10 text-purple-700 dark:text-purple-400">Admin</Badge>;
    case "teacher":
      return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400">Teacher</Badge>;
    case "manager":
      return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">Manager</Badge>;
    case "student":
      return <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">Student</Badge>;
    case "parent":
      return <Badge className="bg-pink-500/10 text-pink-700 dark:text-pink-400">Parent</Badge>;
    default:
      return null;
  }
};

export default function UserRoles() {
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [roleToDelete, setRoleToDelete] = useState<{ id: string; type: "active" | "pending" } | null>(null);

  const { userRoles, isLoading, createUserRole, deleteUserRole } = useUserRoles();
  const { pendingRoles, isLoading: isPendingLoading, createPendingRole, deletePendingRole } = usePendingUserRoles();

  const filteredRoles = userRoles?.filter((role) =>
    (role.profile?.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.role.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  const filteredPendingRoles = pendingRoles?.filter((role) =>
    role.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    role.role.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleDelete = async () => {
    if (roleToDelete) {
      if (roleToDelete.type === "active") {
        await deleteUserRole.mutateAsync(roleToDelete.id);
      } else {
        await deletePendingRole.mutateAsync(roleToDelete.id);
      }
      setDeleteDialogOpen(false);
      setRoleToDelete(null);
    }
  };

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground" />
              <h2 className="text-2xl font-bold">Access Denied</h2>
              <p className="text-muted-foreground">
                Only administrators can manage user roles.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">User Roles</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage user permissions and roles</p>
        </div>
        <Button onClick={() => setDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Assign Role
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-lg md:text-xl">User Roles Management</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="active">Active Users ({userRoles?.length || 0})</TabsTrigger>
              <TabsTrigger value="pending">Pending Invites ({pendingRoles?.length || 0})</TabsTrigger>
            </TabsList>
            
            <TabsContent value="active">
              {isLoading ? (
                <div className="text-center py-8">Loading roles...</div>
              ) : filteredRoles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No active user roles found.
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6 sm:mx-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">User Name</TableHead>
                        <TableHead className="min-w-[100px]">Role</TableHead>
                        <TableHead className="min-w-[120px]">Created At</TableHead>
                        <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredRoles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">
                            {role.profile?.full_name || 'Unknown User'}
                          </TableCell>
                          <TableCell>{getRoleBadge(role.role)}</TableCell>
                          <TableCell className="text-sm">{new Date(role.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setRoleToDelete({ id: role.id, type: "active" });
                                setDeleteDialogOpen(true);
                              }}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>

            <TabsContent value="pending">
              {isPendingLoading ? (
                <div className="text-center py-8">Loading pending invites...</div>
              ) : filteredPendingRoles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Mail className="h-12 w-12 mx-auto mb-2 text-muted-foreground" />
                  <p>No pending role assignments found.</p>
                  <p className="text-sm mt-1">Assign roles to email addresses before users sign up.</p>
                </div>
              ) : (
                <div className="overflow-x-auto -mx-6 sm:mx-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="min-w-[150px]">Name</TableHead>
                        <TableHead className="min-w-[180px]">Email</TableHead>
                        <TableHead className="min-w-[120px]">Contact</TableHead>
                        <TableHead className="min-w-[100px]">Role</TableHead>
                        <TableHead className="min-w-[120px]">Created At</TableHead>
                        <TableHead className="text-right min-w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPendingRoles.map((role) => (
                        <TableRow key={role.id}>
                          <TableCell className="font-medium">
                            {role.full_name || 'N/A'}
                          </TableCell>
                          <TableCell className="truncate max-w-[180px]">
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              {role.email}
                            </div>
                          </TableCell>
                          <TableCell className="text-sm">
                            {role.contact_number ? (
                              <div className="flex items-center gap-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                {role.contact_number}
                              </div>
                            ) : (
                              'N/A'
                            )}
                          </TableCell>
                          <TableCell>{getRoleBadge(role.role)}</TableCell>
                          <TableCell className="text-sm">{new Date(role.created_at).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setRoleToDelete({ id: role.id, type: "pending" });
                                setDeleteDialogOpen(true);
                              }}
                            >
                              Remove
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      <UserRoleDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onSave={async (data) => {
          if (data.assignmentType === "email" && data.email) {
            await createPendingRole.mutateAsync({ email: data.email, role: data.role });
          } else if (data.assignmentType === "user_id" && data.user_id) {
            await createUserRole.mutateAsync({ user_id: data.user_id, role: data.role });
          }
          setDialogOpen(false);
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              {roleToDelete?.type === "pending" 
                ? "This will remove the pending role assignment. The email will not be assigned this role when they sign up."
                : "This will remove the role from the user. They will lose associated permissions."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Remove Role</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
