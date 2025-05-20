const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const taskRoutes = require('./routes/tasks');

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
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Маршруты
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);

// Подключение к MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));