import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useState } from "react";
import styles from "./Login.module.css";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const { register: fpRegister, handleSubmit: fpHandleSubmit, formState: { errors: fpErrors } } = useForm();
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    const result = await login(data.email, data.password);

    if (!result.success) {
      toast.error(result.message || "Неверный пароль или почта", {
        position: "top-center",
        theme: "colored",
      });
    } else {
      toast.success("Вход выполнен!", {
        position: "top-center",
        theme: "colored",
      });
      navigate("/profile");
    }
  };

  const onForgotPasswordSubmit = async (data) => {
    toast.info("Функция восстановления пароля будет добавлена позже", {
      position: "top-center",
      theme: "colored",
    });
    setForgotPasswordOpen(false);
  };

  return (
    <div className={styles.loginPage}>
      <div className={styles.loginBackground}>
        <div className={styles.blob}></div>
        <div className={styles.blob}></div>
        <div className={styles.blob}></div>
      </div>

      <div className={styles.loginContainer}>
        <div className={styles.loginContent}>
          <div className={styles.loginCard}>
            <div className={styles.loginHeader}>
              <div className={styles.logoWrapper}>
                <svg className={styles.logo} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M24 14v20M16 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h1 className={styles.loginTitle}>BlogSystem</h1>
              <p className={styles.loginSubtitle}>Добро пожаловать обратно!</p>
            </div>

            <form className={styles.loginForm} onSubmit={handleSubmit(onSubmit)}>
              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                  {...register("email", { required: "Email обязателен" })}
                />
                {errors.email && <span className={styles.error}>{errors.email.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password" className={styles.label}>Пароль</label>
                <input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className={`${styles.input} ${errors.password ? styles.inputError : ""}`}
                  {...register("password", { required: "Пароль обязателен" })}
                />
                {errors.password && <span className={styles.error}>{errors.password.message}</span>}
              </div>

              <div className={styles.formFooter}>
                <a className={styles.forgotLink} onClick={() => setForgotPasswordOpen(true)}>
                  Забыли пароль?
                </a>
              </div>

              <button type="submit" className={styles.loginButton}>
                Войти
              </button>

              <button type="button" className={styles.guestButton} onClick={() => navigate("/profile")}>
                Войти как гость
              </button>

              <p className={styles.registerText}>
                Нет аккаунта? <Link to="/register" className={styles.link}>Зарегистрироваться</Link>
              </p>
            </form>
          </div>
        </div>

        <div className={styles.loginVisual}>
          <svg className={styles.visualIcon} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="40" y="30" width="120" height="140" rx="12" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
            <circle cx="100" cy="70" r="20" fill="rgba(255,255,255,0.2)"/>
            <rect x="60" y="100" width="80" height="8" rx="4" fill="rgba(255,255,255,0.3)"/>
            <rect x="60" y="120" width="60" height="8" rx="4" fill="rgba(255,255,255,0.2)"/>
            <rect x="60" y="140" width="70" height="8" rx="4" fill="rgba(255,255,255,0.2)"/>
          </svg>
          <h2 className={styles.visualTitle}>Платформа для блогеров</h2>
          <p className={styles.visualText}>
            Создавайте контент, делитесь историями и находите свою аудиторию в современном пространстве для творчества
          </p>
          <div className={styles.visualFeatures}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✦</span>
              <span>Публикация постов</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✦</span>
              <span>Подписка на авторов</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✦</span>
              <span>Комментарии и лайки</span>
            </div>
          </div>
        </div>
      </div>

      {forgotPasswordOpen && (
        <div className={styles.modalOverlay} onClick={() => setForgotPasswordOpen(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 className={styles.modalTitle}>Восстановление пароля</h3>
            <p className={styles.modalText}>Введите ваш email, и мы отправим ссылку для сброса пароля</p>
            <form onSubmit={fpHandleSubmit(onForgotPasswordSubmit)}>
              <div className={styles.formGroup}>
                <label htmlFor="fp-email" className={styles.label}>Email</label>
                <input
                  id="fp-email"
                  type="email"
                  placeholder="your@email.com"
                  className={`${styles.input} ${fpErrors.email ? styles.inputError : ""}`}
                  {...fpRegister("email", { required: "Email обязателен" })}
                />
                {fpErrors.email && <span className={styles.error}>{fpErrors.email.message}</span>}
              </div>
              <div className={styles.modalButtons}>
                <button type="submit" className={styles.modalButtonPrimary}>
                  Отправить ссылку
                </button>
                <button type="button" className={styles.modalButtonSecondary} onClick={() => setForgotPasswordOpen(false)}>
                  Отмена
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
}
