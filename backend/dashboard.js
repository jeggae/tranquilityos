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

// Get Dashboard Metrics
router.get('/metrics', (req, res) => {
  const businessId = req.user.businessId;

  const metrics = {
    totalLeads: 0,
    newLeads: 0,
    activeJobs: 0, // Placeholder
    revenueThisMonth: 0 // Placeholder
  };

  db.get('SELECT COUNT(*) as count FROM leads WHERE business_id = ?', [businessId], (err, row) => {
    if (!err && row) metrics.totalLeads = row.count;

    db.get('SELECT COUNT(*) as count FROM leads WHERE business_id = ? AND status = "New"', [businessId], (err, row) => {
      if (!err && row) metrics.newLeads = row.count;

      res.json(metrics);
    });
  });
});

export default router;
