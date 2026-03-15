import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getCustomers, addCustomer, updateCustomer, deleteCustomer, executeMonthlyReset, getCustomerHistory } from './google-sheets.js';
import './cron-job.js'; // Initialize cron job

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes

// Get all customers
app.get('/api/customers', async (req, res) => {
  try {
    const customers = await getCustomers();
    res.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ error: 'Failed to fetch customers' });
  }
});

// Add new customer
app.post('/api/customers', async (req, res) => {
  try {
    const newCustomer = await addCustomer(req.body);
    res.status(201).json(newCustomer);
  } catch (error) {
    console.error('Error adding customer:', error);
    res.status(500).json({ error: 'Failed to add customer' });
  }
});

// Update customer
app.put('/api/customers/:id', async (req, res) => {
  try {
    const updatedCustomer = await updateCustomer(req.params.id, req.body);
    res.json(updatedCustomer);
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ error: 'Failed to update customer' });
  }
});

// Delete customer
app.delete('/api/customers/:id', async (req, res) => {
  try {
    await deleteCustomer(req.params.id);
    res.json({ message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ error: 'Failed to delete customer' });
  }
});

// Get customer history
app.get('/api/customers/:id/history', async (req, res) => {
  try {
    const history = await getCustomerHistory(req.params.id);
    res.json(history);
  } catch (error) {
    console.error('Error fetching customer history:', error);
    res.status(500).json({ error: 'Failed to fetch customer history' });
  }
});

// Trigger Manual Monthly Reset
app.post('/api/trigger-monthly-reset', async (req, res) => {
  try {
    await executeMonthlyReset();
    res.json({ message: 'Monthly reset completed successfully' });
  } catch (error) {
    console.error('Error triggering monthly reset:', error);
    res.status(500).json({ error: 'Failed to trigger monthly reset' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
