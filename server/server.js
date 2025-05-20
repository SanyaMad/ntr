const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Task = require('./models/Task');
const auth = require('./middleware/auth');

dotenv.config();

// Проверка переменных окружения
const requiredEnv = ['MONGO_URI', 'JWT_SECRET', 'CLIENT_URL'];
requiredEnv.forEach(env => {
  if (!process.env[env]) {
    console.error(`Missing environment variable: ${env}`);
    process.exit(1);
  }
});

const app = express();

// Настройка CORS
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:3000' }));
app.use(express.json());

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

// Маршруты аутентификации
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  try {
    let user = await User.findOne({ username });
    if (user) return res.status(400).json({ msg: 'User already exists' });

    user = new User({ username, password });
    const salt = await bcrypt.genSalt(12);
    user.password = await bcrypt.hash(password, salt);
    await user.save();

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Маршруты задач
app.get('/api/tasks', auth, async (req, res) => {
  try {
    const tasks = await Task.find({ user: req.user.id });
    res.json(tasks);
  } catch (err) {
    console.error('Error fetching tasks:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

app.post('/api/tasks', auth, async (req, res) => {
  const { title, description } = req.body;
  try {
    if (!title) return res.status(400).json({ msg: 'Title is required' });
    const newTask = new Task({
      title,
      description: description || '',
      user: req.user.id
    });
    const task = await newTask.save();
    res.json(task);
  } catch (err) {
    console.error('Error creating task:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

app.put('/api/tasks/:id', auth, async (req, res) => {
  const { title, description, completed } = req.body;
  try {
    let task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to update this task' });
    }
    task = await Task.findByIdAndUpdate(
      req.params.id,
      { $set: { title, description, completed } },
      { new: true }
    );
    res.json(task);
  } catch (err) {
    console.error('Error updating task:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

app.delete('/api/tasks/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ msg: 'Task not found' });
    if (task.user.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Not authorized to delete this task' });
    }
    await task.deleteOne();
    res.json({ msg: 'Task removed' });
  } catch (err) {
    console.error('Error deleting task:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));