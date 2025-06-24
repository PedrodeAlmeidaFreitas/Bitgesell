const express = require('express');
const fs = require('fs');
const path = require('path');
const { mean } = require('../utils/stats');
const router = express.Router();
const DATA_PATH = path.join(__dirname, '../../data/items.json');

let cachedStats = null;
let lastMtime = null;

function calculateStats(items) {
  return {
    total: items.length,
    averagePrice: mean(items.map(i => i.price))
  };
}

function updateCache() {
  fs.readFile(DATA_PATH, (err, raw) => {
    if (err) {
      cachedStats = null;
      return;
    }
    try {
      const items = JSON.parse(raw);
      cachedStats = calculateStats(items);
    } catch {
      cachedStats = null;
    }
  });
}

// Initial cache
updateCache();

// Watch for file changes
fs.watchFile(DATA_PATH, (curr, prev) => {
  if (curr.mtime !== prev.mtime) {
    updateCache();
  }
});

// GET /api/stats
router.get('/', (req, res, next) => {
  if (!cachedStats) {
    // fallback: recalc if cache is empty
    fs.readFile(DATA_PATH, (err, raw) => {
      if (err) return next(err);
      try {
        const items = JSON.parse(raw);
        const stats = calculateStats(items);
        cachedStats = stats;
        res.json(stats);
      } catch (e) {
        next(e);
      }
    });
  } else {
    res.json(cachedStats);
  }
});

module.exports = router;