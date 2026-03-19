import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Transaction } from '../app/transactions';
import { Platform, Alert } from 'react-native';

const generateHTML = (content: string, title: string) => `
<!DOCTYPE html>
<html>
  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0, user-scalable=no" />
    <style>
      body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 20px; color: #333; }
      .header { text-align: center; border-bottom: 2px solid #ff3f6c; padding-bottom: 15px; margin-bottom: 25px; }
      .brand { color: #ff3f6c; font-size: 28px; font-weight: bold; margin: 0; }
      .title { font-size: 18px; color: #666; margin-top: 5px; }
      table { width: 100%; border-collapse: collapse; margin-top: 20px; }
      th, td { text-align: left; padding: 12px; border-bottom: 1px solid #eee; }
      th { background-color: #f9f9f9; font-weight: bold; color: #555; }
      .amount { text-align: right; font-weight: bold; }
      .total-row { background-color: #fff0f3; font-weight: bold; }
      .footer { margin-top: 40px; text-align: center; font-size: 12px; color: #888; border-top: 1px solid #eaeaea; padding-top: 20px; }
    </style>
  </head>
  <body>
    <div class="header">
      <h1 class="brand">Myntra</h1>
      <div class="title">${title}</div>
      <div style="font-size: 12px; color: #999; margin-top: 5px;">Generated on: ${new Date().toLocaleString('en-IN')}</div>
    </div>
    
    ${content}
    
    <div class="footer">
      This is a digitally generated document. For support, please contact customer care.<br>
      © ${new Date().getFullYear()} Myntra Clone Training Project
    </div>
  </body>
</html>
`;

export const exportReceipt = async (transaction: Transaction) => {
  try {
    const formattedAmount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(transaction.amount);
    const date = new Date(transaction.date).toLocaleString('en-IN');
    
    const content = `
      <div style="background: #f9f9f9; padding: 20px; border-radius: 8px;">
        <h2 style="margin-top: 0; color: #333; font-size: 20px;">Transaction Details</h2>
        <table style="margin-top: 0;">
          <tr><td style="width: 150px; color: #666;">Transaction ID</td><td style="font-weight: bold;">${transaction.id}</td></tr>
          <tr><td style="color: #666;">Date & Time</td><td>${date}</td></tr>
          <tr><td style="color: #666;">Payment Mode</td><td>${transaction.mode}</td></tr>
          <tr><td style="color: #666;">Status</td><td style="color: #4CAF50; font-weight: bold;">${transaction.status}</td></tr>
          <tr class="total-row"><td>Total Amount</td><td class="amount">${formattedAmount}</td></tr>
        </table>
      </div>
    `;

    const html = generateHTML(content, "Payment Receipt");
    const { uri } = await Print.printToFileAsync({ html });
    
    if (Platform.OS === 'ios') {
       await Sharing.shareAsync(uri, { UTI: '.pdf', mimeType: 'application/pdf' });
    } else {
       await Sharing.shareAsync(uri, { mimeType: 'application/pdf', dialogTitle: 'Download Receipt' });
    }

  } catch (error) {
    console.error('Failed to generate receipt', error);
    Alert.alert("Error", "Could not generate PDF receipt.");
  }
};

export const exportStatement = async (transactions: Transaction[]) => {
  if (transactions.length === 0) {
    Alert.alert("No Data", "There are no transactions in the current view to export.");
    return;
  }
  
  try {
    let tableRows = '';
    let totalValue = 0;
    
    transactions.forEach(t => {
      const date = new Date(t.date).toLocaleDateString('en-IN');
      const amount = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(t.amount);
      const color = t.status === 'Success' ? '#4CAF50' : t.status === 'Failed' ? '#F44336' : '#FF9800';
      
      if(t.status === 'Success') totalValue += t.amount;
      
      tableRows += `
        <tr>
          <td><div style="font-weight:bold">${t.id}</div><div style="font-size:12px;color:#888">${date}</div></td>
          <td>${t.type}</td>
          <td>${t.mode}</td>
          <td style="color:${color}">${t.status}</td>
          <td class="amount">${amount}</td>
        </tr>
      `;
    });

    const formattedTotal = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(totalValue);

    const content = `
      <h3>Account Statement</h3>
      <table>
        <thead>
          <tr>
            <th>Transaction ID / Date</th>
            <th>Type</th>
            <th>Payment Mode</th>
            <th>Status</th>
            <th class="amount">Amount</th>
          </tr>
        </thead>
        <tbody>
          ${tableRows}
          <tr class="total-row">
            <td colspan="4" style="text-align: right;">Total Successful Payments:</td>
            <td class="amount">${formattedTotal}</td>
          </tr>
        </tbody>
      </table>
    `;

    const html = generateHTML(content, "Transaction Statement");
    const { uri } = await Print.printToFileAsync({ html });
    
    await Sharing.shareAsync(uri, { dialogTitle: 'Download Account Statement' });
    
  } catch (error) {
    console.error('Failed to generate statement', error);
    Alert.alert("Error", "Could not generate PDF statement.");
  }
};
