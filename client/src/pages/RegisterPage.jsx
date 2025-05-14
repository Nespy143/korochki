import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import styles from './RegisterPage.module.css';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    login: '',
    password: '',
    fullName: '',
    phone: '',
    email: ''
  });
  const [errors, setErrors] = useState({});
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const newErrors = {};
    
    if (!/^[а-яА-ЯёЁ\s]{6,}$/.test(formData.login)) {
      newErrors.login = 'Логин должен содержать только кириллицу и быть не менее 6 символов';
    }
    
    if (formData.password.length < 6) {
      newErrors.password = 'Пароль должен быть не менее 6 символов';
    }
    
    if (!/^[а-яА-ЯёЁ\s]+$/.test(formData.fullName)) {
      newErrors.fullName = 'ФИО должно содержать только кириллицу и пробелы';
    }
    
    if (!/^\+7\(\d{3}\)-\d{3}-\d{2}-\d{2}$/.test(formData.phone)) {
      newErrors.phone = 'Телефон должен быть в формате +7(XXX)-XXX-XX-XX';
    }
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Неверный формат email';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    try {
      await api.post('/register', formData);
      setMessage('Регистрация прошла успешно! Теперь вы можете войти.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Ошибка регистрации');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Регистрация</h1>
      {message && (
        <div className={`${styles.message} ${
          message.includes('успешно') ? styles.messageSuccess : styles.messageError
        }`}>
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="login">Логин</label>
          <input
            type="text"
            id="login"
            name="login"
            value={formData.login}
            onChange={handleChange}
            className={styles.input}
            required
          />
          {errors.login && <span className={styles.error}>{errors.login}</span>}
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="password">Пароль</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={styles.input}
            required
          />
          {errors.password && <span className={styles.error}>{errors.password}</span>}
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="fullName">ФИО</label>
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className={styles.input}
            required
          />
          {errors.fullName && <span className={styles.error}>{errors.fullName}</span>}
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="phone">Телефон</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+7(XXX)-XXX-XX-XX"
            className={styles.input}
            required
          />
          {errors.phone && <span className={styles.error}>{errors.phone}</span>}
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={styles.input}
            required
          />
          {errors.email && <span className={styles.error}>{errors.email}</span>}
        </div>
        
        <button type="submit" className={styles.submitButton}>
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
}