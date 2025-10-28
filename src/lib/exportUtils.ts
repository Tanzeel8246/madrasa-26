import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

interface ExportStudentsData {
  students: any[];
  madrasaName: string;
  classes?: any[];
}

export const exportStudentListToPDF = ({ students, madrasaName, classes }: ExportStudentsData): void => {
  const doc = new jsPDF();
  
  // Helper function to get class name
  const getClassName = (classId?: string) => {
    if (!classId || !classes) return 'N/A';
    const classData = classes.find(c => c.id === classId);
    return classData ? classData.name : 'N/A';
  };

  // Add header with madrasa name
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(madrasaName, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Students List', doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.getWidth() / 2, 38, { align: 'center' });
  
  // Prepare table data
  const tableData = students.map((student, index) => [
    (index + 1).toString(),
    student.name || 'N/A',
    student.father_name || 'N/A',
    getClassName(student.class_id),
    student.age?.toString() || 'N/A',
    student.contact || 'N/A',
    student.status || 'N/A',
    student.admission_date ? new Date(student.admission_date).toLocaleDateString() : 'N/A'
  ]);

  // Add table
  autoTable(doc, {
    startY: 45,
    head: [['#', 'Name', "Father's Name", 'Class', 'Age', 'Contact', 'Status', 'Admission Date']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [45, 90, 74], // Primary color
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 30 },
      2: { cellWidth: 30 },
      3: { cellWidth: 25 },
      4: { cellWidth: 15, halign: 'center' },
      5: { cellWidth: 25 },
      6: { cellWidth: 20, halign: 'center' },
      7: { cellWidth: 25, halign: 'center' }
    },
    didDrawPage: (data) => {
      // Footer
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
  });

  // Save the PDF
  const fileName = `students-list-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};

interface ExportTeachersData {
  teachers: any[];
  madrasaName: string;
}

export const exportTeacherListToPDF = ({ teachers, madrasaName }: ExportTeachersData): void => {
  const doc = new jsPDF();
  
  // Add header
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(madrasaName, doc.internal.pageSize.getWidth() / 2, 20, { align: 'center' });
  
  doc.setFontSize(14);
  doc.setFont('helvetica', 'normal');
  doc.text('Teachers List', doc.internal.pageSize.getWidth() / 2, 30, { align: 'center' });
  
  doc.setFontSize(10);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.getWidth() / 2, 38, { align: 'center' });
  
  // Prepare table data
  const tableData = teachers.map((teacher, index) => [
    (index + 1).toString(),
    teacher.name || 'N/A',
    teacher.email || 'N/A',
    teacher.contact || 'N/A',
    teacher.qualification || 'N/A',
    teacher.subject || 'N/A',
    teacher.specialization || 'N/A'
  ]);

  // Add table
  autoTable(doc, {
    startY: 45,
    head: [['#', 'Name', 'Email', 'Contact', 'Qualification', 'Subject', 'Specialization']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [45, 90, 74],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold',
      halign: 'center'
    },
    bodyStyles: {
      fontSize: 9,
      cellPadding: 3
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { cellWidth: 10, halign: 'center' },
      1: { cellWidth: 30 },
      2: { cellWidth: 35 },
      3: { cellWidth: 25 },
      4: { cellWidth: 30 },
      5: { cellWidth: 30 },
      6: { cellWidth: 30 }
    },
    didDrawPage: (data) => {
      const pageCount = doc.getNumberOfPages();
      doc.setFontSize(8);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: 'center' }
      );
    }
  });

  const fileName = `teachers-list-${new Date().toISOString().split('T')[0]}.pdf`;
  doc.save(fileName);
};