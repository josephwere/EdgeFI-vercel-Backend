const { getPool } = require('./utils/db');
export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error:'method not allowed' });
  const { phone, planId, amount_cents, hotspot_id } = req.body || {};
  if (!phone || !amount_cents) return res.status(400).json({ error:'phone and amount_cents required' });
  const pool = getPool(); const conn = await pool.getConnection();
  try {
    const [r] = await conn.query('INSERT INTO payments (external_id, provider, amount_cents, status, phone, plan_id, hotspot_id) VALUES (?, ?, ?, ?, ?, ?, ?)', [null, 'mpesa', amount_cents, 'pending', phone, planId||null, hotspot_id||null]);
    const paymentId = r.insertId;
    const checkoutId = 'MOCK_'+paymentId+'_'+Date.now();
    await conn.query('UPDATE payments SET external_id=? WHERE id=?', [checkoutId, paymentId]);
    res.json({ ok:true, paymentId, checkoutId, message:'STK push simulated. Replace with Daraja call in production.' });
  } catch(err){ console.error(err); res.status(500).json({ error:'db error' }); } finally { conn.release(); }
}