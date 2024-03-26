const express = require('express');
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

const app = express();
const PORT = process.env.PORT || 3000;
const dbPath = path.join(__dirname, 'db.json');

// Middleware to handle JSON request body
app.use(express.json());

// Route to serve notes.html
app.get('/notes', (req, res) => {
  res.sendFile(path.join(__dirname, 'notes.html'));
});

// Route to serve index.html for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Route to get all notes
app.get('/api/notes', (req, res) => {
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading notes data:', err);
      res.status(500).json({ error: 'Failed to read notes data' });
      return;
    }
    const notes = JSON.parse(data);
    res.json(notes);
  });
});

// Route to create a new note
app.post('/api/notes', (req, res) => {
  const newNote = req.body;
  newNote.id = uuidv4(); // Generate unique ID for the note
  fs.readFile(dbPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading notes data:', err);
      res.status(500).json({ error: 'Failed to read notes data' });
      return;
    }
    const notes = JSON.parse(data);
    notes.push(newNote);
    fs.writeFile(dbPath, JSON.stringify(notes, null, 2), (err) => {
      if (err) {
        console.error('Error writing notes data:', err);
        res.status(500).json({ error: 'Failed to write notes data' });
        return;
      }
      res.status(201).json(newNote);
    });
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
