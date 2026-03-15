import cron from 'node-cron';
import { executeMonthlyReset } from './google-sheets.js';

// Run on the 1st of every month at midnight (0 0 1 * *)
cron.schedule('0 0 1 * *', async () => {
  console.log('Running monthly reset cron job...');
  try {
    await executeMonthlyReset();
  } catch (error) {
    console.error('Error during monthly reset cron job:', error);
  }
});
