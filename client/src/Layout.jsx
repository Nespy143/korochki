import { Link, Outlet } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Logo from './assets/Logo.png';
import styles from './Layout.module.css';

export default function Layout() {
  const { user, logout } = useAuth();

  return (
    <div className={styles.container}>
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <Link to="/" className={styles.logoContainer}>
            <img src={Logo} alt="Логотип Корочки.есть" className={styles.logo} />
            <span className={styles.logoText}>Корочки.есть</span>
          </Link>
          
          <div className={styles.navLinks}>
            {!user ? (
              <>
                <Link to="/login" className={styles.navLink}>Вход</Link>
                <Link to="/register" className={styles.navLink}>Регистрация</Link>
              </>
            ) : (
              <>
                {user.isAdmin ? (
                  <Link to="/admin" className={styles.navLink}>Панель администратора</Link>
                ) : (
                  <>
                    <Link to="/applications" className={styles.navLink}>Мои заявки</Link>
                    <Link to="/applications/new" className={styles.navLink}>Новая заявка</Link>
                  </>
                )}
                <button 
                  onClick={logout} 
                  className={styles.navLink}
                  style={{background: 'none', border: 'none', color: 'inherit', cursor: 'pointer'}}
                >
                  Выход
                </button>
              </>
            )}
          </div>
        </div>
      </nav>

      <main className={styles.mainContent}>
        <Outlet />
      </main>
    </div>
  );
}