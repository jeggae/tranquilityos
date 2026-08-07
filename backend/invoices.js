import express from 'express';
import jwt from 'jsonwebtoken';
import db from './database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tranquilityos_fallback_secret_key';

const authenticate = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ error: 'Invalid token' });
    req.user = decoded;
    next();
  });
};

router.use(authenticate);

// Get all invoices with customer mapping
router.get('/', (req, res) => {
  const businessId = req.user.businessId;
  const query = `
    SELECT i.*, c.name as customer_name 
    FROM invoices i 
    LEFT JOIN customers c ON i.customer_id = c.id 
    WHERE i.business_id = ? 
    ORDER BY i.created_at DESC
  `;
  db.all(query, [businessId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch invoices' });
    res.json(rows);
  });
});

// Create new invoice & line-items
router.post('/', (req, res) => {
  const businessId = req.user.businessId;
  const { customer_id, job_id, title, items, subtotal, tax_rate, tax_amount, total, due_date } = req.body;

  if (!customer_id || !items || items.length === 0) {
    return res.status(400).json({ error: 'Customer ID and at least one item are required' });
  }

  // Insert Header
  const insertInvoice = `INSERT INTO invoices 
    (business_id, customer_id, job_id, title, subtotal, tax_rate, tax_amount, total, due_date) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    
  db.run(insertInvoice, [businessId, customer_id, job_id || null, title, subtotal, tax_rate, tax_amount, total, due_date], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to create invoice header' });
    
    const invoiceId = this.lastID;
    
    const insertItem = `INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)`;
    let itemsProcessed = 0;
    
    items.forEach(item => {
      db.run(insertItem, [invoiceId, item.description, item.quantity, item.unit_price, item.total_price], function(itemErr) {
        if(itemErr) console.error(itemErr);
        itemsProcessed++;
        
        if (itemsProcessed === items.length) {
          res.status(201).json({ id: invoiceId, message: 'Invoice created successfully' });
        }
      });
    });
  });
});

// Post a Payment to an Invoice
router.put('/:id/payment', (req, res) => {
  const businessId = req.user.businessId;
  const invoiceId = req.params.id;
  const { block_payment } = req.body;

  db.get('SELECT * FROM invoices WHERE id = ? AND business_id = ?', [invoiceId, businessId], (err, invoice) => {
       if (err || !invoice) return res.status(404).json({ error: 'Invoice not found' });
       
       const newAmountPaid = invoice.amount_paid + block_payment;
       let newStatus = 'Partial';
       if (newAmountPaid >= invoice.total) { // Utilizing precise floating checks may be needed for production
            newStatus = 'Paid';
       }

       db.run('UPDATE invoices SET amount_paid = ?, status = ? WHERE id = ?', 
           [newAmountPaid, newStatus, invoiceId], 
           function(updateErr) {
               if(updateErr) return res.status(500).json({error: 'Failed to process payment update'});
               res.json({ message: 'Payment recorded', new_status: newStatus, amount_paid: newAmountPaid });
           }
       );
  });
});

export default router;
