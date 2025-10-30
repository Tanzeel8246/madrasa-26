import { useState } from "react";
import { Search, Plus, DollarSign, Calendar, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/contexts/AuthContext";
import { useFees, Fee } from "@/hooks/useFees";
import { FeeDialog } from "@/components/Fees/FeeDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

const getStatusBadge = (status: string) => {
  switch (status) {
    case "paid":
      return <Badge className="bg-green-500/10 text-green-700 dark:text-green-400">Paid</Badge>;
    case "pending":
      return <Badge className="bg-yellow-500/10 text-yellow-700 dark:text-yellow-400">Pending</Badge>;
    case "overdue":
      return <Badge className="bg-red-500/10 text-red-700 dark:text-red-400">Overdue</Badge>;
    case "partial":
      return <Badge className="bg-blue-500/10 text-blue-700 dark:text-blue-400">Partial</Badge>;
    default:
      return null;
  }
};

export default function Fees() {
  const { isAdmin } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingFee, setEditingFee] = useState<Fee | undefined>();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [feeToDelete, setFeeToDelete] = useState<string | null>(null);

  const { fees, isLoading, createFee, updateFee, deleteFee } = useFees();

  const filteredFees = fees?.filter((fee) =>
    fee.fee_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    fee.academic_year.includes(searchQuery)
  ) || [];

  const handleEdit = (fee: Fee) => {
    setEditingFee(fee);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (feeToDelete) {
      await deleteFee.mutateAsync(feeToDelete);
      setDeleteDialogOpen(false);
      setFeeToDelete(null);
    }
  };

  const canManageFees = isAdmin;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 md:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">Fee Management</h1>
          <p className="text-muted-foreground text-xs sm:text-sm md:text-base">Manage student fees and payments</p>
        </div>
        {canManageFees && (
          <Button onClick={() => { setEditingFee(undefined); setDialogOpen(true); }} className="w-full sm:w-auto">
            <Plus className="mr-2 h-4 w-4" /> Add Fee
          </Button>
        )}
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <CardTitle className="text-base sm:text-lg md:text-xl">All Fees</CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search fees..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 sm:p-6">
          {isLoading ? (
            <div className="text-center py-8 text-sm">Loading fees...</div>
          ) : filteredFees.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No fees found. Add your first fee to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table className="min-w-[640px]">
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs sm:text-sm">Fee Type</TableHead>
                    <TableHead className="text-xs sm:text-sm">Academic Year</TableHead>
                    <TableHead className="text-xs sm:text-sm">Amount</TableHead>
                    <TableHead className="text-xs sm:text-sm">Due Date</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    {canManageFees && <TableHead className="text-right text-xs sm:text-sm">Actions</TableHead>}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFees.map((fee) => (
                    <TableRow key={fee.id}>
                      <TableCell className="font-medium text-xs sm:text-sm">{fee.fee_type}</TableCell>
                      <TableCell className="text-xs sm:text-sm">{fee.academic_year}</TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <div className="flex items-center">
                          <DollarSign className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                          {fee.amount}
                        </div>
                      </TableCell>
                      <TableCell className="text-xs sm:text-sm">
                        <div className="flex items-center whitespace-nowrap">
                          <Calendar className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                          {new Date(fee.due_date).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(fee.status)}</TableCell>
                      {canManageFees && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(fee)}
                              className="text-xs px-2 h-7"
                            >
                              Edit
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setFeeToDelete(fee.id);
                                setDeleteDialogOpen(true);
                              }}
                              className="text-xs px-2 h-7"
                            >
                              Delete
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <FeeDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        fee={editingFee}
        onSave={async (data) => {
          if (editingFee) {
            await updateFee.mutateAsync({ id: editingFee.id, ...data });
          } else {
            await createFee.mutateAsync(data);
          }
          setDialogOpen(false);
          setEditingFee(undefined);
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the fee record.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
