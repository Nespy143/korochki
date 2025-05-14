import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
const { ObjectId } = mongoose.Types;

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Подключение к MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/korochki-est');

// Модели
const User = mongoose.model('User', {
  login: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true }
});

const Application = mongoose.model('Application', {
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  courseName: { type: String, required: true },
  startDate: { type: Date, required: true },
  paymentMethod: { type: String, enum: ['cash', 'bank'], required: true },
  status: { type: String, enum: ['new', 'in_progress', 'completed'], default: 'new' },
  feedback: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Роуты
app.post('/api/register', async (req, res) => {
  try {
    const { login, password, fullName, phone, email } = req.body;
    
    // Валидация
    if (!/^[а-яА-ЯёЁ\s]{6,}$/.test(login)) {
      return res.status(400).json({ message: 'Логин должен содержать только кириллицу и быть не менее 6 символов' });
    }
    
    if (password.length < 6) {
      return res.status(400).json({ message: 'Пароль должен быть не менее 6 символов' });
    }
    
    if (!/^[а-яА-ЯёЁ\s]+$/.test(fullName)) {
      return res.status(400).json({ message: 'ФИО должно содержать только кириллицу и пробелы' });
    }
    
    if (!/^\+7\(\d{3}\)-\d{3}-\d{2}-\d{2}$/.test(phone)) {
      return res.status(400).json({ message: 'Телефон должен быть в формате +7(XXX)-XXX-XX-XX' });
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: 'Неверный формат email' });
    }
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ login, password: hashedPassword, fullName, phone, email });
    await user.save();
    
    res.status(201).json({ message: 'Пользователь успешно зарегистрирован' });
  } catch (error) {
    if (error.code === 11000) {
      res.status(400).json({ message: 'Пользователь с таким логином уже существует' });
    } else {
      res.status(500).json({ message: 'Ошибка сервера' });
    }
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { login, password } = req.body;
    
    if (login === 'admin' && password === 'education') {
      return res.json({ token: 'admin-token', isAdmin: true });
    }
    
    const user = await User.findOne({ login });
    if (!user) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Неверный логин или пароль' });
    }
    
    res.json({ 
      token: `user-token-${user._id}`,
      userId: user._id,  // Явно возвращаем userId
      isAdmin: false 
    });
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.post('/api/applications', async (req, res) => {
  try {
    const { userId, courseName, startDate, paymentMethod } = req.body;
    
    if (!courseName || !startDate || !paymentMethod) {
      return res.status(400).json({ message: 'Все поля обязательны для заполнения' });
    }
    
    const application = new Application({
      userId,
      courseName,
      startDate: new Date(startDate),
      paymentMethod,
      status: 'new'
    });
    
    await application.save();
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.get('/api/applications/user/:userId', async (req, res) => {
  try {
    const applications = await Application.find({ 
      userId: new ObjectId(req.params.userId) 
    }).sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.put('/api/applications/:id/feedback', async (req, res) => {
  try {
    const { feedback } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { feedback },
      { new: true }
    );
    
    if (!application) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }
    
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

// Админские роуты
app.get('/api/admin/applications', async (req, res) => {
  try {
    const applications = await Application.find().populate('userId', 'fullName email phone').sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

app.put('/api/admin/applications/:id/status', async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('userId', 'fullName email phone');
    
    if (!application) {
      return res.status(404).json({ message: 'Заявка не найдена' });
    }
    
    res.json(application);
  } catch (error) {
    res.status(500).json({ message: 'Ошибка сервера' });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Сервер запущен на порту ${PORT}`));