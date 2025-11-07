import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { Income } from "@/hooks/useIncome";
import { format } from "date-fns";

interface ExportIncomeData {
  incomes: Income[];
  madrasaName: string;
  typeFilter?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const exportIncomeToPDF = ({
  incomes,
  madrasaName,
  typeFilter,
  dateFrom,
  dateTo,
}: ExportIncomeData): void => {
  const doc = new jsPDF();

  // Header
  doc.setFontSize(18);
  doc.text(madrasaName, doc.internal.pageSize.getWidth() / 2, 15, {
    align: "center",
  });

  doc.setFontSize(14);
  doc.text("Income Register / آمد رجسٹر", doc.internal.pageSize.getWidth() / 2, 25, {
    align: "center",
  });

  // Filter info
  let filterText = "";
  if (typeFilter && typeFilter !== "all") {
    filterText += `Type: ${typeFilter}  `;
  }
  if (dateFrom) {
    filterText += `From: ${format(new Date(dateFrom), "dd/MM/yyyy")}  `;
  }
  if (dateTo) {
    filterText += `To: ${format(new Date(dateTo), "dd/MM/yyyy")}`;
  }

  if (filterText) {
    doc.setFontSize(10);
    doc.text(filterText, doc.internal.pageSize.getWidth() / 2, 32, {
      align: "center",
    });
  }

  doc.setFontSize(10);
  doc.text(
    `Generated: ${format(new Date(), "dd/MM/yyyy HH:mm")}`,
    doc.internal.pageSize.getWidth() / 2,
    filterText ? 38 : 32,
    { align: "center" }
  );

  // Prepare table data
  const tableData = incomes.map((income) => [
    format(new Date(income.date), "dd/MM/yyyy"),
    income.donor_name,
    income.donor_contact || "-",
    income.income_type,
    income.frequency,
    `Rs. ${Number(income.amount).toLocaleString()}`,
    income.receipt_number || "-",
  ]);

  // Calculate total
  const totalAmount = incomes.reduce((sum, income) => sum + Number(income.amount), 0);

  // Add table
  autoTable(doc, {
    startY: filterText ? 42 : 36,
    head: [
      ["Date", "Donor Name", "Contact", "Type", "Frequency", "Amount", "Receipt #"],
    ],
    body: tableData,
    foot: [
      [
        { content: "Total:", colSpan: 5, styles: { halign: "right", fontStyle: "bold" } },
        {
          content: `Rs. ${totalAmount.toLocaleString()}`,
          colSpan: 2,
          styles: { fontStyle: "bold", fillColor: [240, 240, 240] },
        },
      ],
    ],
    theme: "grid",
    headStyles: {
      fillColor: [59, 130, 246],
      textColor: 255,
      fontStyle: "bold",
    },
    footStyles: {
      fillColor: [255, 255, 255],
      textColor: [0, 0, 0],
    },
    styles: {
      font: "helvetica",
      fontSize: 9,
    },
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 35 },
      2: { cellWidth: 28 },
      3: { cellWidth: 25 },
      4: { cellWidth: 25 },
      5: { cellWidth: 30, halign: "right" },
      6: { cellWidth: 22 },
    },
    didDrawPage: (data) => {
      // Footer
      const pageCount = doc.getNumberOfPages();
      const pageNumber = doc.getCurrentPageInfo().pageNumber;
      doc.setFontSize(8);
      doc.text(
        `Page ${pageNumber} of ${pageCount}`,
        doc.internal.pageSize.getWidth() / 2,
        doc.internal.pageSize.getHeight() - 10,
        { align: "center" }
      );
    },
  });

  // Save PDF
  const fileName = `income-register-${format(new Date(), "yyyy-MM-dd")}.pdf`;
  doc.save(fileName);
};
