const { getPool } = require('./utils/db');
const { sign } = require('./utils/jwt');
export default async function handler(req, res) {
  const pool = getPool();
  if (req.method === 'POST') {
    const body = req.body || {};
    const action = body.action || req.query.action;
    if (action === 'register') {
      const { phone, name, password } = body;
      if (!phone) return res.status(400).json({ error: 'phone required' });
      const conn = await pool.getConnection();
      try {
        await conn.query('INSERT INTO users (phone, name, password_hash) VALUES (?, ?, ?)', [phone, name||null, password||'']);
        const [rows] = await conn.query('SELECT id, phone, name FROM users WHERE phone=?', [phone]);
        const user = rows[0];
        const token = sign({ sub: user.id, role: 'user' });
        res.json({ ok: true, user, token });
      } catch(err){ if (err && err.code==='ER_DUP_ENTRY') return res.status(400).json({ error:'user exists' }); console.error(err); res.status(500).json({ error: 'db error' }); } finally { conn.release(); }
    } else if (action === 'login') {
      const { phone } = body;
      if (!phone) return res.status(400).json({ error:'phone required' });
      const conn = await pool.getConnection();
      try {
        const [rows] = await conn.query('SELECT id, phone, name FROM users WHERE phone=? LIMIT 1', [phone]);
        if (!rows.length) return res.status(404).json({ error:'user not found' });
        const user = rows[0];
        const token = sign({ sub: user.id, role: 'user' });
        res.json({ ok:true, user, token });
      } catch(err){ console.error(err); res.status(500).json({ error:'db error' }); } finally { conn.release(); }
    } else {
      res.status(400).json({ error: 'action required (register|login)' });
    }
  } else {
    res.status(405).json({ error: 'method not allowed' });
  }
}