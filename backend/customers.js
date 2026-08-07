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

// Get all customers for business
router.get('/', (req, res) => {
  const businessId = req.user.businessId;
  db.all('SELECT * FROM customers WHERE business_id = ? ORDER BY created_at DESC', [businessId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Create new customer
router.post('/', (req, res) => {
  const businessId = req.user.businessId;
  const { name, company_name, phone, email, address, client_type } = req.body;

  if (!name) return res.status(400).json({ error: 'Customer name is required' });

  const query = `INSERT INTO customers (business_id, name, company_name, phone, email, address, client_type) 
                 VALUES (?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [businessId, name, company_name, phone, email, address, client_type], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to create customer' });
    res.status(201).json({ id: this.lastID, message: 'Customer created successfully' });
  });
});

// Update customer details
router.put('/:id', (req, res) => {
  const businessId = req.user.businessId;
  const customerId = req.params.id;
  const { name, company_name, phone, email, address, client_type } = req.body;

  const query = `UPDATE customers SET name = ?, company_name = ?, phone = ?, email = ?, address = ?, client_type = ? 
                 WHERE id = ? AND business_id = ?`;

  db.run(query, [name, company_name, phone, email, address, client_type, customerId, businessId], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to update customer' });
    if (this.changes === 0) return res.status(404).json({ error: 'Customer not found or unauthorized' });
    res.json({ message: 'Customer updated successfully' });
  });
});

export default router;
