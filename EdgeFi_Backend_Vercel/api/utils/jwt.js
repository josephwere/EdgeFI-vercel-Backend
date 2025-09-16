const jwt = require('jsonwebtoken');
const SECRET = process.env.JWT_SECRET || 'change_this_secret';
function sign(payload, opts) { return jwt.sign(payload, SECRET, Object.assign({ expiresIn: '7d' }, opts)); }
function verify(token) { try { return jwt.verify(token, SECRET); } catch(e) { return null; } }
module.exports = { sign, verify };