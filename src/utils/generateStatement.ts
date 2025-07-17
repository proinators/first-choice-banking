// Simple statement generation function
const generateStatement = (account: any, transactions: any[], formatCurrency: (amount: number) => string, formatDate: (date: string) => string) => {
  // Create a new window for the statement
  const win = window.open('', '_blank');
  if (!win) return;

  // Filter transactions for this account (in a real app, this would be done on the server)
  const accountTransactions = transactions;
  
  // Calculate total credits and debits based on transaction type
  const credits = accountTransactions
    .filter((t: any) => t.type === 'credit')
    .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);
    
  const debits = accountTransactions
    .filter((t: any) => t.type === 'debit')
    .reduce((sum: number, t: any) => sum + Math.abs(t.amount), 0);

  // Create HTML content for the statement
  let htmlContent = `
    <html>
      <head>
        <title>Bank Statement - ${account.name} (${account.number})</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 20px; }
          .account-info { margin-bottom: 20px; }
          h1 { color: #1a365d; margin: 0; }
          h2 { color: #2d3748; margin: 10px 0; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .credit { color: green; }
          .debit { color: red; }
          .summary { margin: 20px 0; padding: 15px; background-color: #f8fafc; border-radius: 4px; }
          .footer { margin-top: 30px; font-size: 12px; color: #666; text-align: center; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>First Choice Banking</h1>
          <p>Statement of Account</p>
        </div>
        
        <div class="account-info">
          <h2>${account.name} (${account.type})</h2>
          <p>Account Number: ${account.number}</p>
          <p>Statement Period: ${formatDate(new Date().toISOString())} to ${formatDate(new Date().toISOString())}</p>
          <p>Current Balance: ${formatCurrency(account.balance)}</p>
        </div>
        
        <div class="summary">
          <h3>Summary</h3>
          <p>Opening Balance: ${formatCurrency(account.balance - credits + debits)}</p>
          <p>Total Credits: <span class="credit">${formatCurrency(credits)}</span></p>
          <p>Total Debits: <span class="debit">${formatCurrency(debits)}</span></p>
          <p>Closing Balance: <strong>${formatCurrency(account.balance)}</strong></p>
        </div>
        
        <h3>Transaction Details</h3>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Description</th>
              <th>Reference</th>
              <th>Debit</th>
              <th>Credit</th>
              <th>Balance</th>
            </tr>
          </thead>
          <tbody>
  `;

  // Calculate running balance
  let runningBalance = account.balance - credits + debits;
  
  // Add transaction rows in reverse chronological order
  [...accountTransactions].reverse().forEach((transaction: any) => {
    const isCredit = transaction.type === 'credit';
    if (isCredit) {
      runningBalance -= Math.abs(transaction.amount);
    } else {
      runningBalance += Math.abs(transaction.amount);
    }
    
    htmlContent += `
      <tr>
        <td>${formatDate(transaction.date)}</td>
        <td>${transaction.description}</td>
        <td>${transaction.reference || transaction.id}</td>
        <td class="debit">${!isCredit ? formatCurrency(Math.abs(transaction.amount)) : '-'}</td>
        <td class="credit">${isCredit ? formatCurrency(Math.abs(transaction.amount)) : '-'}</td>
        <td>${formatCurrency(runningBalance)}</td>
      </tr>
    `;
  });

  // Close HTML content
  htmlContent += `
          </tbody>
        </table>
        
        <div class="footer">
          <p>This is an electronic statement. No signature is required.</p>
          <p>For any queries, please contact our customer care at 1800-123-4567 or visit www.firstchoicebanking.com</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
        </div>
      </body>
    </html>
  `;

  // Write the content to the new window
  win.document.write(htmlContent);
  
  // Print the window (which also allows saving as PDF)
  setTimeout(() => {
    win.print();
  }, 100);
};

export default generateStatement;
