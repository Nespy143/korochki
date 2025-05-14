import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import styles from './NewApplicationPage.module.css';

export default function NewApplicationPage() {
  const [courseName, setCourseName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [error, setError] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  const courses = [
    "Основы алгоритмизации и программирования",
    "Основы веб-дизайна",
    "Основы проектирования баз данных"
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!courseName || !startDate) {
      setError('Все поля обязательны для заполнения');
      return;
    }
    
    try {
      await api.post('/applications', {
        userId: user.userId,
        courseName,
        startDate,
        paymentMethod
      });
      navigate('/applications');
    } catch (error) {
      setError(error.response?.data?.message || 'Ошибка создания заявки');
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Новая заявка на обучение</h1>
      {error && <div className={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="courseName">Название курса</label>
          <select
            id="courseName"
            value={courseName}
            onChange={(e) => setCourseName(e.target.value)}
            className={styles.select}
            required
          >
            <option value="">Выберите курс</option>
            {courses.map(course => (
              <option key={course} value={course}>{course}</option>
            ))}
          </select>
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label} htmlFor="startDate">Желаемая дата начала</label>
          <input
            type="date"
            id="startDate"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={styles.dateInput}
            required
            min={new Date().toISOString().split('T')[0]}
          />
        </div>
        
        <div className={styles.formGroup}>
          <label className={styles.label}>Способ оплаты</label>
          <div className={styles.paymentOptions}>
            <label className={styles.paymentOption}>
              <input
                type="radio"
                name="paymentMethod"
                value="cash"
                checked={paymentMethod === 'cash'}
                onChange={() => setPaymentMethod('cash')}
                className={styles.radio}
              />
              Наличные
            </label>
            <label className={styles.paymentOption}>
              <input
                type="radio"
                name="paymentMethod"
                value="bank"
                checked={paymentMethod === 'bank'}
                onChange={() => setPaymentMethod('bank')}
                className={styles.radio}
              />
              Банковский перевод
            </label>
          </div>
        </div>
        
        <button type="submit" className={styles.submitButton}>
          Отправить заявку
        </button>
      </form>
    </div>
  );
}