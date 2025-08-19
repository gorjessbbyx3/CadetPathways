
const { Pool } = require('pg');

// PostgreSQL connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://localhost:5432/school_crm',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.connect()
  .then(client => {
    console.log('✅ Connected to PostgreSQL database');
    client.release();
  })
  .catch(err => {
    console.error('❌ Database connection error:', err);
  });

// Helper functions
const query = (text, params) => pool.query(text, params);

const createUser = async (name, email, hashedPassword, role = 'student') => {
  const result = await query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
    [name, email, hashedPassword, role]
  );
  return result.rows[0];
};

const findUserByEmail = async (email) => {
  const result = await query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
};

const findUserById = async (id) => {
  const result = await query('SELECT * FROM users WHERE id = $1', [id]);
  return result.rows[0];
};

const storeOTP = async (email, otp, expiresAt) => {
  await query(
    'INSERT INTO otp_storage (email, otp, expires_at) VALUES ($1, $2, $3)',
    [email, otp, expiresAt]
  );
};

const verifyOTP = async (email, otp) => {
  const result = await query(
    'SELECT * FROM otp_storage WHERE email = $1 AND otp = $2 AND expires_at > NOW()',
    [email, otp]
  );
  
  if (result.rows.length > 0) {
    // Delete used OTP
    await query('DELETE FROM otp_storage WHERE email = $1', [email]);
    return true;
  }
  return false;
};

module.exports = {
  pool,
  query,
  createUser,
  findUserByEmail,
  findUserById,
  storeOTP,
  verifyOTP
};
