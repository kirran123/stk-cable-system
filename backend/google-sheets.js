import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import dotenv from 'dotenv';
dotenv.config();

// Define credentials
const serviceAccountAuth = new JWT({
  email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
  key: process.env.GOOGLE_PRIVATE_KEY ? process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n') : '',
  scopes: [
    'https://www.googleapis.com/auth/spreadsheets',
  ],
});

// Sheet ID from your URL
const doc = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID, serviceAccountAuth);

// Optional separate Sheet ID for history
const historyDoc = process.env.GOOGLE_HISTORY_SHEET_ID
  ? new GoogleSpreadsheet(process.env.GOOGLE_HISTORY_SHEET_ID, serviceAccountAuth)
  : doc;

let isInitialized = false;
let isHistoryInitialized = false;

// Initialize the main sheet
const initSheet = async () => {
  if (!isInitialized) {
    try {
      await doc.loadInfo();
      isInitialized = true;
    } catch (e) {
      console.error('Failed to load Google Sheet info. Check credentials and sheet ID:', e.message);
    }
  }
  return doc.sheetsByIndex[0]; // Assuming data is in the first sheet
};

// Initialize the history sheet (creates it if it doesn't exist)
const initHistorySheet = async () => {
  if (!isHistoryInitialized) {
    await historyDoc.loadInfo();
    isHistoryInitialized = true;
  }

  const sheets = historyDoc.sheetsByIndex;
  const targetId = '1992088625';
  let historySheet = sheets.find(s => s.sheetId.toString() === targetId) || sheets.find(s => s.title.toLowerCase().includes('history'));

  if (!historySheet) {
    historySheet = await historyDoc.addSheet({ sheetId: 1992088625, title: 'Payment History', headerValues: ['customerId', 'customerName', 'date', 'amount'] });
  } else {
    try {
      await historySheet.loadHeaderRow();
    } catch (e) {
      await historySheet.setHeaderRow(['customerId', 'customerName', 'date', 'amount']);
    }
  }
  return historySheet;
};

// Log entry to history sheet
export const logHistoryEntry = async (customerId, customerName, amount) => {
  try {
    const historySheet = await initHistorySheet();
    const dateStr = new Date().toISOString().split('T')[0];
    await historySheet.addRow({
      customerId,
      customerName,
      date: dateStr,
      amount
    });
  } catch (e) {
    console.error("Failed to log history:", e);
  }
};

// 1. Get all customers
export const getCustomers = async () => {
  try {
    const sheet = await initSheet();
    if (!sheet) return [];

    try {
      await sheet.loadHeaderRow();
    } catch (e) {
      // If error, it means headers are not set or sheet is completely empty
      await sheet.setHeaderRow(['id', 'name', 'place', 'phone', 'boxNumber', 'provider', 'status', 'totalAmount', 'monthlyPayment', 'paid']);
    }

    // Fetch unformatted values to avoid commas and scientific notation losing precision
    const response = await sheet._spreadsheet.sheetsApi.get(`values/${sheet.encodedA1SheetName}`, {
      searchParams: {
        valueRenderOption: 'UNFORMATTED_VALUE',
      }
    });

    const data = await response.json();
    if (!data.values || data.values.length <= 1) return [];

    const headers = data.values[0];
    const rawRows = data.values.slice(1);

    return rawRows.map(rowRaw => {
      // Helper to match row raw array back by header index correctly
      const getVal = (key) => {
        const idx = headers.indexOf(key);
        if (idx === -1 || rowRaw[idx] === undefined || rowRaw[idx] === null) return '';
        const val = rowRaw[idx];
        // Ensure that everything becomes string unless floats are parsed later
        return String(val).trim();
      };

      return {
        id: getVal('id'),
        name: getVal('name'),
        place: getVal('place'),
        phone: getVal('phone'),
        boxNumber: getVal('boxNumber'),
        provider: getVal('provider'),
        status: getVal('status'),
        totalAmount: parseFloat(getVal('totalAmount') || 0),
        monthlyPayment: parseFloat(getVal('monthlyPayment') || 0),
        paid: getVal('paid')
      };
    });
  } catch (error) {
    console.error('Error in getCustomers:', error);
    throw error;
  }
};

// 2. Add customer
export const addCustomer = async (customerData) => {
  try {
    const sheet = await initSheet();
    if (!sheet) throw new Error('Sheet not initialized');

    const rows = await sheet.getRows();
    let nextId = 1;
    if (rows.length > 0) {
      const maxId = Math.max(...rows.map(r => {
        const parsed = parseInt(r.get('id'), 10);
        // Ignore huge timestamp IDs from earlier versions
        return (isNaN(parsed) || parsed > 1000000000) ? 0 : parsed;
      }));
      nextId = maxId + 1;
    }

    const newCustomer = {
      id: nextId.toString(),
      name: customerData.name || '',
      place: customerData.place || '',
      phone: customerData.phone || '',
      boxNumber: customerData.boxNumber || '',
      provider: customerData.provider || 'tccl',
      status: customerData.status || 'Active',
      totalAmount: customerData.totalAmount || 0,
      monthlyPayment: customerData.monthlyPayment || 0,
      paid: customerData.paid || 'Not Paid'
    };

    await sheet.addRow(newCustomer);
    return newCustomer;
  } catch (error) {
    console.error('Error in addCustomer:', error);
    throw error;
  }
};

// 3. Update customer
export const updateCustomer = async (id, updateData) => {
  try {
    const sheet = await initSheet();
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') && r.get('id').toString() === id.toString());

    if (row) {
      if (updateData.name !== undefined) row.assign({ name: updateData.name });
      if (updateData.place !== undefined) row.assign({ place: updateData.place });
      if (updateData.phone !== undefined) row.assign({ phone: updateData.phone });
      if (updateData.boxNumber !== undefined) row.assign({ boxNumber: updateData.boxNumber });
      if (updateData.provider !== undefined) row.assign({ provider: updateData.provider });
      if (updateData.status !== undefined) row.assign({ status: updateData.status });

      if (updateData.totalAmount !== undefined) row.assign({ totalAmount: updateData.totalAmount });

      // Handle custom history logic if payments change
      if (updateData.paid !== undefined || updateData.monthlyPayment !== undefined) {
        // Only log history when monthlyPayment is explicitly given (meaning the Tick button was clicked)
        // rather than just toggling the 'Paid' status string.
        if (updateData.monthlyPayment !== undefined) {
          const newPayment = parseFloat(updateData.monthlyPayment);
          if (newPayment > 0) {
            await logHistoryEntry(id, row.get('name'), newPayment);
          }
          row.assign({ monthlyPayment: updateData.monthlyPayment });
        }

        if (updateData.paid !== undefined) {
          row.assign({ paid: updateData.paid });
        }
      }

      await row.save();
      return { id, ...updateData };
    }
    throw new Error('Customer not found');
  } catch (error) {
    console.error('Error in updateCustomer:', error);
    throw error;
  }
};

// 3.5. Get customer history
export const getCustomerHistory = async (id) => {
  try {
    const historySheet = await initHistorySheet();
    const response = await historySheet._spreadsheet.sheetsApi.get(`values/${historySheet.encodedA1SheetName}`, {
      searchParams: {
        valueRenderOption: 'UNFORMATTED_VALUE',
      }
    });

    const data = await response.json();
    if (!data.values || data.values.length <= 1) return [];

    const headers = data.values[0];
    const customerIdIndex = headers.indexOf('customerId');
    const dateIndex = headers.indexOf('date');
    const amountIndex = headers.indexOf('amount');

    const result = [];
    for (let i = 1; i < data.values.length; i++) {
       const rowRaw = data.values[i];
       const rowCustomerId = rowRaw[customerIdIndex] !== undefined ? String(rowRaw[customerIdIndex]).trim() : '';
       if (rowCustomerId === String(id)) {
          const dateVal = rowRaw[dateIndex] !== undefined ? String(rowRaw[dateIndex]).trim() : '';
          const amountVal = rowRaw[amountIndex] !== undefined ? parseFloat(rowRaw[amountIndex]) : 0;
          
          // Google Sheets might return date as serial number if it's stored as Date object.
          // In the logHistoryEntry method, we log date as a string (YYYY-MM-DD), so it usually stays a string.
          // But just to be safe: if dateVal is just a JS number representing days, we keep it as is,
          // though typically it was pushed as a string `dateStr`.

          result.push({
             date: dateVal,
             amount: isNaN(amountVal) ? 0 : amountVal
          });
       }
    }
    return result;
  } catch (e) {
    console.error("Error fetching history for customer", id, e);
    return [];
  }
};

// 4. Delete customer
export const deleteCustomer = async (id) => {
  try {
    const sheet = await initSheet();
    const rows = await sheet.getRows();
    const row = rows.find(r => r.get('id') && r.get('id').toString() === id.toString());
    if (row) {
      await row.delete();
      return true;
    }
    throw new Error('Customer not found');
  } catch (error) {
    console.error('Error in deleteCustomer:', error);
    throw error;
  }
};

// Internal function for Cron Job
export const executeMonthlyReset = async () => {
  try {
    const sheet = await initSheet();
    if (!sheet) return;

    const rows = await sheet.getRows();
    const dateStr = new Date().toISOString().split('T')[0];

    for (const row of rows) {
      let currentMonthly = parseFloat(row.get('monthlyPayment') || 0);

      if (currentMonthly > 0) {
        // Add to history sheet
        try {
          await logHistoryEntry(row.get('id'), row.get('name'), currentMonthly);
        } catch (e) { }

        row.assign({
          monthlyPayment: 0,
          paid: 'Not Paid'
        });

        await row.save();
        // small delay to avoid rate limiting
        await new Promise(r => setTimeout(r, 200));
      }
    }
    console.log(`Monthly reset executed successfully for ${rows.length} records.`);
  } catch (e) {
    console.error('Error in executeMonthlyReset:', e);
  }
}
