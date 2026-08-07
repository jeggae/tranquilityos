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

// Get all jobs with nested customer data
router.get('/', (req, res) => {
  const businessId = req.user.businessId;
  const query = `
    SELECT j.*, c.name as customer_name, c.phone, c.address 
    FROM jobs j 
    LEFT JOIN customers c ON j.customer_id = c.id 
    WHERE j.business_id = ? 
    ORDER BY j.scheduled_date ASC
  `;
  db.all(query, [businessId], (err, rows) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch jobs' });
    res.json(rows);
  });
});

// Create new job
router.post('/', (req, res) => {
  const businessId = req.user.businessId;
  const { customer_id, quotation_id, title, description, scheduled_date } = req.body;

  if (!customer_id || !title) {
    return res.status(400).json({ error: 'Customer ID and Job Title are required' });
  }

  const query = `INSERT INTO jobs 
    (business_id, customer_id, quotation_id, title, description, scheduled_date) 
    VALUES (?, ?, ?, ?, ?, ?)`;
    
  db.run(query, [businessId, customer_id, quotation_id || null, title, description, scheduled_date || null], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to create job' });
    res.status(201).json({ id: this.lastID, message: 'Job scheduled successfully' });
  });
});

// Update job status
router.put('/:id/status', (req, res) => {
  const businessId = req.user.businessId;
  const jobId = req.params.id;
  const { status } = req.body;

  db.run('UPDATE jobs SET status = ? WHERE id = ? AND business_id = ?', [status, jobId, businessId], function(err) {
    if (err) return res.status(500).json({ error: 'Failed to update job status' });
    if (this.changes === 0) return res.status(404).json({ error: 'Job not found or unauthorized' });
    res.json({ message: 'Job status updated' });
  });
});

export default router;
