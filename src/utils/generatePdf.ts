import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

type Transaction = {
  date: string;
  description: string;
  reference: string;
  account: string;
  amount: number;
  status: string;
};

export const generateTransactionPdf = (transactions: Transaction[], formatAmount: (amount: number) => string, formatDisplayDate: (date: string) => string) => {
  const doc = new jsPDF();
  
  // Title
  doc.setFontSize(18);
  doc.text('Transaction History', 14, 22);
  
  // Date
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  
  // Table
  const tableColumn = ['Date', 'Description', 'Reference', 'Account', 'Amount', 'Status'];
  const tableRows: any[] = [];
  
  transactions.forEach(transaction => {
    const transactionData = [
      formatDisplayDate(transaction.date),
      transaction.description,
      transaction.reference,
      transaction.account,
      formatAmount(transaction.amount),
      transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)
    ];
    tableRows.push(transactionData);
  });
  
  (doc as any).autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 40,
    styles: {
      fontSize: 10,
      cellPadding: 2,
      valign: 'middle',
      overflow: 'linebreak',
      tableWidth: 'wrap',
      cellWidth: 'wrap',
    },
    headStyles: {
      fillColor: [41, 128, 185],
      textColor: 255,
      fontStyle: 'bold',
      halign: 'center'
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245]
    },
    columnStyles: {
      0: { cellWidth: 30, halign: 'left' },
      1: { cellWidth: 40, halign: 'left' },
      2: { cellWidth: 35, halign: 'left' },
      3: { cellWidth: 25, halign: 'left' },
      4: { cellWidth: 25, halign: 'right' },
      5: { cellWidth: 20, halign: 'center' }
    },
    margin: { top: 40 }
  });
  
  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width - 20,
      doc.internal.pageSize.height - 10,
      { align: 'right' }
    );
    
    // Add bank name
    doc.setFontSize(12);
    doc.setTextColor(41, 128, 185);
    doc.text(
      'First Choice Banking',
      14,
      doc.internal.pageSize.height - 10
    );
  }
  
  // Save the PDF
  doc.save(`transactions_${new Date().toISOString().split('T')[0]}.pdf`);
};
