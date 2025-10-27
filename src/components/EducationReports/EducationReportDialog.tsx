import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { EducationReport } from "@/hooks/useEducationReports";
import { Student } from "@/hooks/useStudents";
import { Teacher } from "@/hooks/useTeachers";
import { Class } from "@/hooks/useClasses";
import { toast } from "sonner";

interface EducationReportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (report: Omit<EducationReport, "id" | "created_at" | "updated_at">) => void;
  report?: EducationReport;
  students: Student[];
  teachers: Teacher[];
  classes: Class[];
}

export function EducationReportDialog({
  open,
  onOpenChange,
  onSave,
  report,
  students,
  teachers,
  classes,
}: EducationReportDialogProps) {
  const [formData, setFormData] = useState({
    student_id: "",
    father_name: "",
    class_id: "",
    date: new Date().toISOString().split('T')[0],
    sabak_para_no: "",
    sabak_amount_type: "",
    sabak_amount: "",
    sabqi_recited: false,
    sabqi_amount_type: "",
    sabqi_amount: "",
    sabqi_heard_by: "",
    sabqi_heard_by_other: "",
    manzil_number: "",
    manzil_para_numbers: [] as string[],
    manzil_heard_by: "",
    manzil_heard_by_other: "",
    remarks: "",
  });

  useEffect(() => {
    if (report) {
      setFormData({
        student_id: report.student_id,
        father_name: report.father_name,
        class_id: report.class_id || "",
        date: report.date,
        sabak_para_no: report.sabak?.para_no?.toString() || "",
        sabak_amount_type: "",
        sabak_amount: report.sabak?.amount || "",
        sabqi_recited: report.sabqi?.recited || false,
        sabqi_amount_type: "",
        sabqi_amount: report.sabqi?.amount || "",
        sabqi_heard_by: report.sabqi?.heard_by || "",
        sabqi_heard_by_other: "",
        manzil_number: report.manzil?.number || "",
        manzil_para_numbers: [],
        manzil_heard_by: report.manzil?.heard_by || "",
        manzil_heard_by_other: "",
        remarks: report.remarks || "",
      });
    } else {
      setFormData({
        student_id: "",
        father_name: "",
        class_id: "",
        date: new Date().toISOString().split('T')[0],
        sabak_para_no: "",
        sabak_amount_type: "",
        sabak_amount: "",
        sabqi_recited: false,
        sabqi_amount_type: "",
        sabqi_amount: "",
        sabqi_heard_by: "",
        sabqi_heard_by_other: "",
        manzil_number: "",
        manzil_para_numbers: [],
        manzil_heard_by: "",
        manzil_heard_by_other: "",
        remarks: "",
      });
    }
  }, [report, open]);

  const handleStudentChange = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    if (student) {
      setFormData({
        ...formData,
        student_id: studentId,
        father_name: student.father_name,
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

    // Validation for "Other" option
    if (formData.sabqi_heard_by === "other" && !formData.sabqi_heard_by_other) {
      toast.error("Please enter the name for Sabqi heard by");
      return;
    }
    if (formData.manzil_heard_by === "other" && !formData.manzil_heard_by_other) {
      toast.error("Please enter the name for Manzil heard by");
      return;
    }

    const sabakAmount = formData.sabak_amount_type && formData.sabak_amount 
      ? `${formData.sabak_amount} ${formData.sabak_amount_type}`
      : formData.sabak_amount;

    const sabqiAmount = formData.sabqi_amount_type && formData.sabqi_amount
      ? `${formData.sabqi_amount} ${formData.sabqi_amount_type}`
      : formData.sabqi_amount;

    const sabqiHeardBy = formData.sabqi_heard_by === "other" 
      ? formData.sabqi_heard_by_other 
      : formData.sabqi_heard_by;

    const manzilHeardBy = formData.manzil_heard_by === "other"
      ? formData.manzil_heard_by_other
      : formData.manzil_heard_by;

    const manzilNumber = formData.manzil_para_numbers.length > 0
      ? formData.manzil_para_numbers.join(", ")
      : formData.manzil_number;

    onSave({
      student_id: formData.student_id,
      father_name: formData.father_name,
      class_id: formData.class_id || undefined,
      date: formData.date,
      sabak: {
        para_no: formData.sabak_para_no ? parseInt(formData.sabak_para_no) : undefined,
        amount: sabakAmount || undefined,
      },
      sabqi: {
        recited: formData.sabqi_recited,
        amount: sabqiAmount || undefined,
        heard_by: sabqiHeardBy || undefined,
      },
      manzil: {
        number: manzilNumber || undefined,
        heard_by: manzilHeardBy || undefined,
      },
      remarks: formData.remarks || undefined,
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {report ? "Edit Education Report / رپورٹ میں ترمیم" : "Add Education Report / نئی رپورٹ شامل کریں"}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Student Information */}
          <div className="space-y-4">
            <h3 className="font-semibold">Student Information / طالب علم کی معلومات</h3>
            <div className="grid grid-cols-2 gap-4">
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
                <Label htmlFor="father_name">Father's Name / والد کا نام</Label>
                <Input
                  id="father_name"
                  value={formData.father_name}
                  onChange={(e) => setFormData({ ...formData, father_name: e.target.value })}
                  readOnly
                />
              </div>
              <div>
                <Label htmlFor="class_id">Class / کلاس</Label>
                <Select value={formData.class_id} onValueChange={(value) => setFormData({ ...formData, class_id: value })}>
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
                <Label htmlFor="date">Date / تاریخ *</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>

          {/* Sabak Section */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">Sabak / سبق</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="sabak_para_no">Para Number / پارہ نمبر</Label>
                <Select value={formData.sabak_para_no} onValueChange={(value) => setFormData({ ...formData, sabak_para_no: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select para / پارہ منتخب کریں" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
                      <SelectItem key={num} value={num.toString()}>
                        Para {num} / پارہ {num}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sabak_amount_type">Amount Type / مقدار کی قسم</Label>
                  <Select value={formData.sabak_amount_type} onValueChange={(value) => setFormData({ ...formData, sabak_amount_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type / قسم منتخب کریں" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="سطر">Lines / سطر</SelectItem>
                      <SelectItem value="رکوع">Rukoo / رکوع</SelectItem>
                      <SelectItem value="آیات">Verses / آیات</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sabak_amount">Amount / مقدار</Label>
                  <Input
                    id="sabak_amount"
                    value={formData.sabak_amount}
                    onChange={(e) => setFormData({ ...formData, sabak_amount: e.target.value })}
                    placeholder="Enter amount"
                    disabled={!formData.sabak_amount_type}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Sabqi Section */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">Sabqi / سبقی</h3>
            <div className="flex items-center space-x-2 mb-4">
              <Checkbox
                id="sabqi_recited"
                checked={formData.sabqi_recited}
                onCheckedChange={(checked) => setFormData({ ...formData, sabqi_recited: checked as boolean })}
              />
              <Label htmlFor="sabqi_recited">Recited / سنایا</Label>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sabqi_amount_type">Amount Type / مقدار کی قسم</Label>
                  <Select value={formData.sabqi_amount_type} onValueChange={(value) => setFormData({ ...formData, sabqi_amount_type: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type / قسم منتخب کریں" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="سطریں">Lines / سطریں</SelectItem>
                      <SelectItem value="آیات">Verses / آیات</SelectItem>
                      <SelectItem value="رکوع">Rukoo / رکوع</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sabqi_amount">Amount / مقدار</Label>
                  <Input
                    id="sabqi_amount"
                    value={formData.sabqi_amount}
                    onChange={(e) => setFormData({ ...formData, sabqi_amount: e.target.value })}
                    placeholder="Enter amount"
                    disabled={!formData.sabqi_amount_type}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="sabqi_heard_by">Heard By / سننے والا</Label>
                <Select value={formData.sabqi_heard_by} onValueChange={(value) => setFormData({ ...formData, sabqi_heard_by: value, sabqi_heard_by_other: "" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher / استاد منتخب کریں" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">Other / دیگر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.sabqi_heard_by === "other" && (
                <div>
                  <Label htmlFor="sabqi_heard_by_other">Name / نام *</Label>
                  <Input
                    id="sabqi_heard_by_other"
                    value={formData.sabqi_heard_by_other}
                    onChange={(e) => setFormData({ ...formData, sabqi_heard_by_other: e.target.value })}
                    placeholder="Enter name"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Manzil Section */}
          <div className="space-y-4 p-4 border rounded-lg">
            <h3 className="font-semibold">Manzil / منزل</h3>
            <div className="space-y-4">
              <div>
                <Label htmlFor="manzil_number">Number of Paras / پاروں کی تعداد</Label>
                <Select 
                  value={formData.manzil_number} 
                  onValueChange={(value) => setFormData({ ...formData, manzil_number: value, manzil_para_numbers: [] })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select / منتخب کریں" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Para / ایک پارہ</SelectItem>
                    <SelectItem value="2">2 Paras / دو پارے</SelectItem>
                    <SelectItem value="3">3 Paras / تین پارے</SelectItem>
                    <SelectItem value="4">4 Paras / چار پارے</SelectItem>
                    <SelectItem value="5">5 Paras / پانچ پارے</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {formData.manzil_number && (
                <div>
                  <Label>Select Para Numbers / پارے منتخب کریں</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
                      <div key={num} className="flex items-center space-x-2">
                        <Checkbox
                          id={`para-${num}`}
                          checked={formData.manzil_para_numbers.includes(num.toString())}
                          disabled={
                            !formData.manzil_para_numbers.includes(num.toString()) &&
                            formData.manzil_para_numbers.length >= parseInt(formData.manzil_number)
                          }
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData({
                                ...formData,
                                manzil_para_numbers: [...formData.manzil_para_numbers, num.toString()],
                              });
                            } else {
                              setFormData({
                                ...formData,
                                manzil_para_numbers: formData.manzil_para_numbers.filter(p => p !== num.toString()),
                              });
                            }
                          }}
                        />
                        <Label htmlFor={`para-${num}`} className="font-normal cursor-pointer">
                          Para {num} / پارہ {num}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div>
                <Label htmlFor="manzil_heard_by">Heard By / سننے والا</Label>
                <Select value={formData.manzil_heard_by} onValueChange={(value) => setFormData({ ...formData, manzil_heard_by: value, manzil_heard_by_other: "" })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select teacher / استاد منتخب کریں" />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((teacher) => (
                      <SelectItem key={teacher.id} value={teacher.id}>
                        {teacher.name}
                      </SelectItem>
                    ))}
                    <SelectItem value="other">Other / دیگر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {formData.manzil_heard_by === "other" && (
                <div>
                  <Label htmlFor="manzil_heard_by_other">Name / نام *</Label>
                  <Input
                    id="manzil_heard_by_other"
                    value={formData.manzil_heard_by_other}
                    onChange={(e) => setFormData({ ...formData, manzil_heard_by_other: e.target.value })}
                    placeholder="Enter name"
                    required
                  />
                </div>
              )}
            </div>
          </div>

          {/* Remarks */}
          <div>
            <Label htmlFor="remarks">Remarks / تبصرہ</Label>
            <Textarea
              id="remarks"
              value={formData.remarks}
              onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
              rows={3}
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