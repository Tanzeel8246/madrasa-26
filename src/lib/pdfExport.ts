import jsPDF from "jspdf";
import autoTable from 'jspdf-autotable';
import { EducationReport } from "@/hooks/useEducationReports";
import { Student } from "@/hooks/useStudents";
import { Class } from "@/hooks/useClasses";
import { Teacher } from "@/hooks/useTeachers";

interface ExportData {
  reports: EducationReport[];
  students: Student[];
  classes: Class[];
  teachers: Teacher[];
  dateFilter?: string;
}

export const exportEducationReportsToPDF = async ({ reports, students, classes, teachers, dateFilter }: ExportData) => {
  const doc = new jsPDF('l', 'mm', 'a4'); // Landscape for better table layout
  
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 10;

  const getStudentName = (studentId: string) => {
    const student = students.find(s => s.id === studentId);
    return student?.name || "Unknown";
  };

  const getClassName = (classId?: string) => {
    if (!classId) return "N/A";
    const cls = classes.find(c => c.id === classId);
    return cls?.name || "N/A";
  };

  const getTeacherName = (teacherId?: string) => {
    if (!teacherId) return "N/A";
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher?.name || "N/A";
  };

  const getPeriodText = () => {
    switch (dateFilter) {
      case "week": return "Weekly Report / ہفتہ وار رپورٹ";
      case "month": return "Monthly Report / ماہانہ رپورٹ";
      case "quarter": return "Quarterly Report / سہ ماہی رپورٹ";
      case "half": return "Semi-Annual Report / شش ماہی رپورٹ";
      case "year": return "Annual Report / سالانہ رپورٹ";
      default: return "Learning Report / تعلیمی رپورٹ";
    }
  };

  // Header
  doc.setFontSize(16);
  doc.text(getPeriodText(), pageWidth / 2, 15, { align: "center" });
  
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, pageWidth / 2, 22, { align: "center" });

  // Group reports by student
  const reportsByStudent = reports.reduce((acc, report) => {
    if (!acc[report.student_id]) {
      acc[report.student_id] = [];
    }
    acc[report.student_id].push(report);
    return acc;
  }, {} as Record<string, EducationReport[]>);

  let startY = 30;

  // Generate student-wise tables
  Object.entries(reportsByStudent).forEach(([studentId, studentReports], index) => {
    const student = students.find(s => s.id === studentId);
    const sortedReports = [...studentReports].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Student Info Header
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(`Student: ${student?.name || 'Unknown'} | Father: ${sortedReports[0]?.father_name || 'N/A'} | Class: ${getClassName(sortedReports[0]?.class_id)}`, margin, startY);
    
    startY += 7;

    // Table data
    const tableData = sortedReports.map(report => {
      const sabakText = report.sabak?.para_no 
        ? `P${report.sabak.para_no} ${report.sabak.amount || ''}`.trim()
        : 'N/A';
      
      const sabqiText = report.sabqi?.recited 
        ? `${report.sabqi.amount || 'N/A'}`
        : 'No';
      
      const manzilText = report.manzil?.number 
        ? `${report.manzil.number} Para${parseInt(report.manzil.number) > 1 ? 's' : ''}`
        : 'N/A';

      const heardBy = report.sabqi?.heard_by || report.manzil?.heard_by || 'N/A';
      
      return [
        new Date(report.date).toLocaleDateString('en-GB'),
        sabakText,
        sabqiText,
        manzilText,
        heardBy,
        report.remarks || '-'
      ];
    });

    // Draw table
    autoTable(doc, {
      startY: startY,
      head: [['Date', 'Sabak', 'Sabqi', 'Manzil', 'Heard By', 'Remarks']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [66, 66, 66],
        textColor: 255,
        fontSize: 9,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 8,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 25, halign: 'center' },
        1: { cellWidth: 35 },
        2: { cellWidth: 30 },
        3: { cellWidth: 35 },
        4: { cellWidth: 40 },
        5: { cellWidth: 'auto' }
      },
      margin: { left: margin, right: margin },
      didDrawPage: function(data) {
        // Footer
        doc.setFontSize(7);
        doc.text(
          `Imam Tools Suite - Page ${doc.getCurrentPageInfo().pageNumber}`,
          pageWidth / 2,
          doc.internal.pageSize.getHeight() - 5,
          { align: "center" }
        );
      }
    });

    // @ts-ignore - autoTable adds finalY property
    startY = doc.lastAutoTable.finalY + 10;

    // Check if we need a new page
    if (startY > doc.internal.pageSize.getHeight() - 40 && index < Object.keys(reportsByStudent).length - 1) {
      doc.addPage();
      startY = 20;
    }
  });

  // Save the PDF
  const fileName = `Learning_Reports_${dateFilter || 'All'}_${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};
