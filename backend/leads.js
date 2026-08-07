import express from 'express';
import jwt from 'jsonwebtoken';
import db from './database.js';

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'tranquilityos_fallback_secret_key';

// Middleware to authenticate
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

// Get all leads for business
router.get('/', (req, res) => {
  const businessId = req.user.businessId;
  db.all('SELECT * FROM leads WHERE business_id = ? ORDER BY created_at DESC', [businessId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Database error' });
    res.json(rows);
  });
});

// Create new lead
router.post('/', (req, res) => {
  const businessId = req.user.businessId;
  const { lead_name, company_name, phone, email, address, service_requested, lead_source, estimated_value } = req.body;

  if (!lead_name) return res.status(400).json({ error: 'Lead name is required' });

  const query = `INSERT INTO leads (business_id, lead_name, company_name, phone, email, address, service_requested, lead_source, estimated_value) 
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  
  db.run(query, [businessId, lead_name, company_name, phone, email, address, service_requested, lead_source, estimated_value], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to create lead' });
    res.status(201).json({ id: this.lastID, message: 'Lead created successfully' });
  });
});

// Update lead status
router.put('/:id', (req, res) => {
  const businessId = req.user.businessId;
  const leadId = req.params.id;
  const { status } = req.body;

  db.run('UPDATE leads SET status = ? WHERE id = ? AND business_id = ?', [status, leadId, businessId], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to update lead' });
    if (this.changes === 0) return res.status(404).json({ error: 'Lead not found or unauthorized' });
    res.json({ message: 'Lead updated successfully' });
  });
});

// Delete lead
router.delete('/:id', (req, res) => {
  const businessId = req.user.businessId;
  const leadId = req.params.id;

  db.run('DELETE FROM leads WHERE id = ? AND business_id = ?', [leadId, businessId], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to delete lead' });
    if (this.changes === 0) return res.status(404).json({ error: 'Lead not found or unauthorized' });
    res.json({ message: 'Lead deleted successfully' });
  });
});

// Convert Lead to Customer
router.post('/:id/convert', (req, res) => {
  const businessId = req.user.businessId;
  const leadId = req.params.id;

  // 1. Fetch the lead
  db.get('SELECT * FROM leads WHERE id = ? AND business_id = ?', [leadId, businessId], (err, lead) => {
    if (err || !lead) return res.status(404).json({ error: 'Lead not found' });
    if (lead.status === 'Converted') return res.status(400).json({ error: 'Lead already converted' });

    // 2. Insert into customers
    const insertCustomer = `INSERT INTO customers (business_id, name, company_name, phone, email, address) VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.run(insertCustomer, [businessId, lead.lead_name, lead.company_name, lead.phone, lead.email, lead.address], function(err) {
      if (err) return res.status(500).json({ error: 'Failed to create customer from lead' });
      
      const newCustomerId = this.lastID;

      // 3. Update lead status to Converted and map customer_id
      // We wrap this inside the insert callback to simulate a pseudo transaction 
      // Note: error handling inside sqlite block should actually rollback but we do best effort for MVP.
      db.run('UPDATE leads SET status = "Converted", customer_id = ? WHERE id = ?', [newCustomerId, leadId], (updateErr) => {
        if (updateErr) return res.status(500).json({ error: 'Customer generated but lead mapping failed' });
        res.json({ message: 'Lead successfully converted to Customer', customer_id: newCustomerId });
      });
    });
  });
});

export default router;
