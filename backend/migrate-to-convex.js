import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';
import { syncAddCustomer, syncAddHistoryEntry } from './convex-sync.js';
import { getCustomers } from './google-sheets.js';

dotenv.config();

const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
  ],
});

const sheetId = process.env.GOOGLE_SHEET_ID || '1jsSEgXEh0lF8_Nbhzdn7jJPBCgMneH4ScnTdmQ0OBVg';
const doc = new GoogleSpreadsheet(sheetId, serviceAccountAuth);

async function migrate() {
  console.log("Starting Migration from Google Sheets to Convex...");

  // 1. Migrate Customers
  try {
    const customers = await getCustomers();
    console.log(`Fetched ${customers.length} customers from Google Sheets Details tab.`);

    let customerCount = 0;
    for (const c of customers) {
      await syncAddCustomer(c);
      customerCount++;
    }
    console.log(`Successfully processed ${customerCount} customers into Convex sync pipeline.`);
  } catch (err) {
    console.error("Error migrating customers:", err);
  }

  // 2. Migrate Payment History
  try {
    await doc.loadInfo();
    const sheets = doc.sheetsByIndex;
    const historySheet = sheets.find(s => s.title.toLowerCase().includes('history')) || sheets[1];

    if (historySheet) {
      await historySheet.loadHeaderRow();
      const rows = await historySheet.getRows();
      console.log(`Fetched ${rows.length} history records from Google Sheets History tab.`);

      let historyCount = 0;
      for (const row of rows) {
        const customerId = row.get('customerId');
        const customerName = row.get('customerName');
        const amount = row.get('amount');
        if (customerId && amount) {
          await syncAddHistoryEntry(customerId, customerName, amount);
          historyCount++;
        }
      }
      console.log(`Successfully processed ${historyCount} history records into Convex sync pipeline.`);
    } else {
      console.log("No History tab found in Google Sheet.");
    }
  } catch (err) {
    console.error("Error migrating history:", err);
  }

  console.log("Migration process completed!");
}

migrate();
