
const express = require('express');
const router = express.Router();
const db = require('../db');

router.get('/usage', async (req, res) => {
  const userId = req.user.id; 
  const user = await db.User.findByPk(userId);

  const used = user.storage_used;
  const total = user.storage_limit;
  const percentage = Math.round((used / total) * 100);

  res.json({ used, total, percentage });
});

module.exports = router;
