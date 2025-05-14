import { useState, useEffect } from 'react';
import api from '../api';
import styles from './AdminPage.module.css';

export default function AdminPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/applications')
      .then(response => {
        setApplications(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  const updateStatus = async (appId, status) => {
    try {
      const response = await api.put(`/admin/applications/${appId}/status`, { status });
      setApplications(applications.map(app => 
        app._id === appId ? response.data : app
      ));
    } catch (error) {
      console.error(error);
    }
  };

  if (loading) return <div className={styles.loading}>Загрузка...</div>;

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Панель администратора</h1>
      
      {applications.length === 0 ? (
        <p className={styles.emptyMessage}>Нет заявок</p>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th className={styles.th}>ФИО</th>
                <th className={styles.th}>Курс</th>
                <th className={styles.th}>Дата начала</th>
                <th className={styles.th}>Способ оплаты</th>
                <th className={styles.th}>Статус</th>
                <th className={styles.th}>Отзыв</th>
                <th className={styles.th}>Действия</th>
              </tr>
            </thead>
            <tbody>
              {applications.map(app => (
                <tr key={app._id} className={styles.tr}>
                  <td className={styles.td}>
                    <div className={styles.userInfo}>
                      <div>{app.userId.fullName}</div>
                      <div className={styles.userDetail}>{app.userId.email}</div>
                      <div className={styles.userDetail}>{app.userId.phone}</div>
                    </div>
                  </td>
                  <td className={styles.td}>{app.courseName}</td>
                  <td className={styles.td}>{new Date(app.startDate).toLocaleDateString()}</td>
                  <td className={styles.td}>
                    {app.paymentMethod === 'cash' ? 'Наличные' : 'Банковский перевод'}
                  </td>
                  <td className={styles.td}>
                    <select
                      value={app.status}
                      onChange={(e) => updateStatus(app._id, e.target.value)}
                      className={styles.statusSelect}
                    >
                      <option value="new">Новая</option>
                      <option value="in_progress">Идет обучение</option>
                      <option value="completed">Обучение завершено</option>
                    </select>
                  </td>
                  <td className={styles.td}>
                    {app.feedback || '-'}
                  </td>
                  <td className={styles.td}>
                    <button
                      onClick={() => updateStatus(app._id, 'completed')}
                      disabled={app.status === 'completed'}
                      className={`${styles.actionButton} ${styles.completeButton}`}
                    >
                      Завершить
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}