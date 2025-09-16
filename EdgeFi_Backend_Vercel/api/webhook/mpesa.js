const { getPool } = require('../utils/db');
export default async function handler(req, res) {
  const body = req.body || {};
  const checkoutId = body.checkoutId || null;
  const amount = body.amount || null;
  const provider_ref = body.provider_ref || null;
  const phone = body.phone || null;
  if (!checkoutId) return res.status(400).json({ error:'no checkout id' });
  const pool = getPool(); const conn = await pool.getConnection();
  try {
    const [rows] = await conn.query('SELECT * FROM payments WHERE external_id=? LIMIT 1', [checkoutId]);
    let payment = rows.length ? rows[0] : null;
    if (!payment && phone) {
      const [r2] = await conn.query('SELECT * FROM payments WHERE phone=? AND status="pending" ORDER BY created_at DESC LIMIT 1', [phone]);
      if (r2.length) payment = r2[0];
    }
    if (!payment) return res.json({ ok:true, note:'no matching payment' });
    await conn.query('UPDATE payments SET status=?, provider_reference=? WHERE id=?', ['completed', provider_ref || checkoutId, payment.id]);
    if (payment.hotspot_id) {
      const [hs] = await conn.query('SELECT partner_id FROM hotspots WHERE id=?', [payment.hotspot_id]);
      const partner_id = hs.length ? hs[0].partner_id : null;
      const amount_cents = payment.amount_cents || (amount ? Math.round(amount*100) : 0);
      const partner_share = Math.floor(amount_cents * 70 / 100);
      const platform_share = amount_cents - partner_share;
      await conn.query('INSERT INTO hotspot_earnings (payment_id, hotspot_id, partner_id, amount_cents, partner_share_cents, platform_share_cents) VALUES (?, ?, ?, ?, ?, ?)', [payment.id, payment.hotspot_id, partner_id, amount_cents, partner_share, platform_share]);
    }
    res.json({ ok:true });
  } catch(err){ console.error(err); res.status(500).json({ error:'db error' }); } finally { conn.release(); }
}