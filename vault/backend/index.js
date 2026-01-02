// Simple mock API for document lookups. Replace with on-chain indexing in production.
const express = require('express');
const app = express();
const port = process.env.PORT || 4001;

// simple in-memory store (demo only)
const store = {};

app.get('/api/document/:hash', (req, res) => {
  const h = req.params.hash;
  if (store[h]) {
    res.json({ found: true, ...store[h] });
  } else {
    res.json({ found: false });
  }
});

app.post('/api/document/:hash', express.json(), (req, res) => {
  const h = req.params.hash;
  store[h] = req.body;
  res.json({ ok: true });
});

app.listen(port, () => console.log(`Mock backend listening ${port}`));
