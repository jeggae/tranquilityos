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

// Get all quotations
router.get('/', (req, res) => {
  const businessId = req.user.businessId;
  const query = `
    SELECT q.*, c.name as customer_name 
    FROM quotations q 
    LEFT JOIN customers c ON q.customer_id = c.id 
    WHERE q.business_id = ? 
    ORDER BY q.created_at DESC
  `;
  db.all(query, [businessId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch quotations' });
    res.json(rows);
  });
});

// Create new quotation & items
router.post('/', (req, res) => {
  const businessId = req.user.businessId;
  const { customer_id, title, items, subtotal, tax_rate, tax_amount, total, notes } = req.body;

  if (!customer_id || !items || items.length === 0) {
    return res.status(400).json({ error: 'Customer ID and at least one item are required' });
  }

  // Insert Header
  const insertQuote = `INSERT INTO quotations 
    (business_id, customer_id, title, subtotal, tax_rate, tax_amount, total, notes) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
    
  db.run(insertQuote, [businessId, customer_id, title, subtotal, tax_rate, tax_amount, total, notes], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to create quotation header' });
    
    const quotationId = this.lastID;
    
    // Insert Line Items using Promise mapping pseudo-bulk insert
    const insertItem = `INSERT INTO quotation_items (quotation_id, description, quantity, unit_price, total_price) VALUES (?, ?, ?, ?, ?)`;
    
    let itemsProcessed = 0;
    
    items.forEach(item => {
      db.run(insertItem, [quotationId, item.description, item.quantity, item.unit_price, item.total_price], function(itemErr) {
        // Logging error silently for local MVP
        if(itemErr) console.error(itemErr);
        itemsProcessed++;
        
        if (itemsProcessed === items.length) {
          res.status(201).json({ id: quotationId, message: 'Quotation created successfully' });
        }
      });
    });
  });
});

export default router;
