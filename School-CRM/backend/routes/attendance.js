
const express = require('express');
const router = express.Router();

router.get('/summary', (req, res) => {
  res.json({ message: 'Attendance endpoint working' });
});

module.exports = router;
