const express = require('express');
const fs = require('fs').promises; // Use promises-based file system methods
const uniqid = require('uniqid');
const path = require('path');

const app = express();
const PORT = 3000;
const FILE_PATH = path.resolve(__dirname, './todos.json');
const PUBLIC_DIR = path.resolve(__dirname, './public');

app.use(express.json()); // Replaces body-parser

// Ensure the JSON file exists, if not, create it
const initializeFile = async () => {
  try {
    await fs.access(FILE_PATH);
  } catch (error) {
    await fs.writeFile(FILE_PATH, JSON.stringify([]));
  }
};

// Function to read data from file
const readDataFromFile = async () => {
  try {
    const data = await fs.readFile(FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    throw new Error('Error reading data from file');
  }
};

// Function to write data to file with pretty format
const writeDataToFile = async (data) => {
  try {
    await fs.writeFile(FILE_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    throw new Error('Error writing data to file');
  }
};

// Serve static files from the public directory
app.use(express.static(PUBLIC_DIR));

// Serve index.html at /app
app.get('/app', (req, res) => {
  res.sendFile(path.join(PUBLIC_DIR, 'index.html'));
});

// Create a new todo item
app.post('/todos', async (req, res) => {
  try {
    const todos = await readDataFromFile();
    const newTodo = { id: uniqid(), ...req.body };
    todos.push(newTodo);
    await writeDataToFile(todos);
    res.status(201).json(newTodo);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all todo items
app.get('/todos', async (req, res) => {
  try {
    const todos = await readDataFromFile();
    res.json(todos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get a single todo item by ID
app.get('/todos/:id', async (req, res) => {
  try {
    const todos = await readDataFromFile();
    const todo = todos.find(t => t.id === req.params.id);
    if (todo) {
      res.json(todo);
    } else {
      res.status(404).send('Todo not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a todo item by ID
app.put('/todos/:id', async (req, res) => {
  try {
    let todos = await readDataFromFile();
    const index = todos.findIndex(t => t.id === req.params.id);
    if (index !== -1) {  
      todos[index] = { ...todos[index], ...req.body };
      await writeDataToFile(todos);
      res.json(todos[index]);
    } else {
      res.status(404).send('Todo not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a todo item by ID
app.delete('/todos/:id', async (req, res) => {
  try {
    let todos = await readDataFromFile();
    const index = todos.findIndex(t => t.id === req.params.id);
    if (index !== -1) {
      const [deletedTodo] = todos.splice(index, 1);
      await writeDataToFile(todos);
      res.json(deletedTodo);
    } else {
      res.status(404).send('Todo not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Initialize the file and start the server
initializeFile().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}).catch(error => {
  console.error('Error initializing file:', error.message);
});
