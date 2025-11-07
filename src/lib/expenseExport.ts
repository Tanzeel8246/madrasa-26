import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Expense } from "@/hooks/useExpenses";

export const exportExpensesToPDF = (expenses: Expense[], madrasaName: string, logoUrl: string | null) => {
  const doc = new jsPDF();
  
  // Add logo if available
  if (logoUrl) {
    try {
      doc.addImage(logoUrl, 'PNG', 15, 10, 30, 30);
    } catch (error) {
      console.error('Error adding logo:', error);
    }
  }

  // Add title
  doc.setFontSize(18);
  doc.text(madrasaName, 105, 25, { align: 'center' });
  doc.setFontSize(14);
  doc.text('Expense Register / خرچ رجسٹر', 105, 35, { align: 'center' });

  // Add date
  doc.setFontSize(10);
  doc.text(`Date: ${new Date().toLocaleDateString('en-US')}`, 15, 50);

  // Calculate total
  const total = expenses.reduce((sum, expense) => sum + Number(expense.amount), 0);

  // Add summary
  doc.text(`Total Expenses / کل خرچہ: Rs. ${total.toLocaleString('en-US')}`, 15, 60);

  // Prepare table data
  const tableData = expenses.map((expense, index) => [
    (index + 1).toString(),
    new Date(expense.date).toLocaleDateString('en-US'),
    expense.expense_type,
    expense.recipient_name,
    `Rs. ${Number(expense.amount).toLocaleString('en-US')}`,
    expense.payment_method || '-',
    expense.receipt_number || '-',
    expense.description || '-',
  ]);

  // Add table
  autoTable(doc, {
    head: [['#', 'Date', 'Type', 'Recipient', 'Amount', 'Payment', 'Receipt', 'Description']],
    body: tableData,
    startY: 70,
    styles: {
      font: 'helvetica',
      fontSize: 8,
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { top: 70 },
  });

  // Add footer
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.getWidth() / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    );
  }

  // Save the PDF
  doc.save(`expense-register-${new Date().toISOString().split('T')[0]}.pdf`);
};
