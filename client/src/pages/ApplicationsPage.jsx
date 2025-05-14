import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';
import { useAuth } from '../context/AuthContext';
import styles from './ApplicationsPage.module.css';

export default function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [feedback, setFeedback] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    if (user?.token) {
      const userId = user.token.split('-')[2];
      api.get(`/applications/user/${userId}`)
        .then(response => setApplications(response.data))
        .catch(error => console.error('Error fetching applications:', error));
    }
  }, [user]);

  const handleFeedbackSubmit = async (appId) => {
    try {
      await api.put(`/applications/${appId}/feedback`, { feedback });
      setApplications(applications.map(app => 
        app._id === appId ? { ...app, feedback } : app
      ));
      setFeedback('');
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusClass = (status) => {
    switch(status) {
      case 'new': return styles.statusNew;
      case 'in_progress': return styles.statusInProgress;
      case 'completed': return styles.statusCompleted;
      default: return '';
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Мои заявки</h1>
      
      <Link 
        to="/applications/new" 
        className={styles.createButton}
      >
        Создать новую заявку
      </Link>
      
      {applications.length === 0 ? (
        <p className={styles.emptyMessage}>У вас пока нет заявок</p>
      ) : (
        <div className={styles.applicationsList}>
          {applications.map(app => (
            <div key={app._id} className={styles.applicationCard}>
              <div className={styles.cardHeader}>
                <h2 className={styles.courseName}>{app.courseName}</h2>
                <span className={`${styles.statusBadge} ${getStatusClass(app.status)}`}>
                  {app.status === 'new' ? 'Новая' : 
                   app.status === 'in_progress' ? 'Идет обучение' : 'Обучение завершено'}
                </span>
              </div>
              
              <p className={styles.detail}>
                Дата начала: {new Date(app.startDate).toLocaleDateString()}
              </p>
              <p className={styles.detail}>
                Способ оплаты: {app.paymentMethod === 'cash' ? 'Наличные' : 'Банковский перевод'}
              </p>
              
              {app.feedback ? (
                <div className={styles.feedbackContainer}>
                  <p className={styles.feedbackTitle}>Ваш отзыв:</p>
                  <p>{app.feedback}</p>
                </div>
              ) : app.status === 'completed' ? (
                <div className={styles.feedbackForm}>
                  <textarea
                    value={feedback}
                    onChange={(e) => setFeedback(e.target.value)}
                    placeholder="Оставьте отзыв о курсе"
                    className={styles.feedbackTextarea}
                    rows="3"
                  />
                  <button
                    onClick={() => handleFeedbackSubmit(app._id)}
                    className={styles.submitButton}
                  >
                    Отправить отзыв
                  </button>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}