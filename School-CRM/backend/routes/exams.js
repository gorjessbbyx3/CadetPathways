
const express = require('express');
const router = express.Router();

router.get('/upcoming', (req, res) => {
  res.json({ message: 'Exams endpoint working' });
});

module.exports = router;
