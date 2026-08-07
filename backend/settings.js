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

// Fetch business settings details
router.get('/business', (req, res) => {
  const businessId = req.user.businessId;
  db.get('SELECT business_name, industry, currency, logo_url FROM businesses WHERE id = ?', [businessId], (err, row) => {
    if (err) return res.status(500).json({ error: 'Failed to fetch business settings' });
    if (!row) return res.status(404).json({ error: 'Business settings unallocated' });
    res.json(row);
  });
});

// Update the master business logos and branding variables
router.put('/business', (req, res) => {
    const businessId = req.user.businessId;
    const { business_name, industry, logo_url } = req.body;
    
    if(!business_name) return res.status(400).json({error: "Primary business name remains mandated for invoice security."});

    db.run(`UPDATE businesses SET business_name = ?, industry = ?, logo_url = ? WHERE id = ?`,
           [business_name, industry, logo_url || null, businessId], 
           function(err) {
               if(err) return res.status(500).json({error: 'Failed branding upload execution.'});
               res.json({message: "Business configurations saved completely!"});
           });
});

export default router;
