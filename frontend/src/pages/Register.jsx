import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./Register.module.css";
import { useAuth } from "../contexts/AuthContext";

export default function Register() {
  const { register, handleSubmit, formState: { errors }, watch } = useForm();
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const password = watch("password");

  const onSubmit = async (data) => {
    const result = await registerUser(data.name, data.email, data.password, data.confirm);
    if (result.success) {
      toast.success("Вы успешно зарегистрировались!", {
        position: "top-center",
        autoClose: 3000,
        theme: "colored",
        onClose: () => navigate("/profile"),
      });
    } else {
      toast.error(result.message || "Ошибка регистрации", {
        position: "top-center",
        theme: "colored",
      });
    }
  };

  return (
    <div className={styles.registerPage}>
      <div className={styles.registerBackground}>
        <div className={styles.blob}></div>
        <div className={styles.blob}></div>
        <div className={styles.blob}></div>
      </div>

      <div className={styles.registerContainer}>
        <div className={styles.registerVisual}>
          <svg className={styles.visualIcon} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <rect x="40" y="30" width="120" height="140" rx="12" fill="rgba(255,255,255,0.1)" stroke="rgba(255,255,255,0.3)" strokeWidth="2"/>
            <circle cx="100" cy="70" r="20" fill="rgba(255,255,255,0.2)"/>
            <rect x="60" y="100" width="80" height="8" rx="4" fill="rgba(255,255,255,0.3)"/>
            <rect x="60" y="120" width="60" height="8" rx="4" fill="rgba(255,255,255,0.2)"/>
            <rect x="60" y="140" width="70" height="8" rx="4" fill="rgba(255,255,255,0.2)"/>
          </svg>
          <h2 className={styles.visualTitle}>Начните свой путь</h2>
          <p className={styles.visualText}>
            Присоединяйтесь к сообществу блогеров и делитесь своими идеями с миром
          </p>
          <div className={styles.visualFeatures}>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✦</span>
              <span>Бесплатный старт</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✦</span>
              <span>Поддержка 24/7</span>
            </div>
            <div className={styles.feature}>
              <span className={styles.featureIcon}>✦</span>
              <span>Рост аудитории</span>
            </div>
          </div>
        </div>

        <div className={styles.registerContent}>
          <div className={styles.registerCard}>
            <div className={styles.registerHeader}>
              <div className={styles.logoWrapper}>
                <svg className={styles.logo} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="none" />
                  <path d="M24 14v20M16 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </div>
              <h1 className={styles.registerTitle}>BlogSystem</h1>
              <p className={styles.registerSubtitle}>Создайте аккаунт и начните публиковать</p>
            </div>

            <form className={styles.registerForm} onSubmit={handleSubmit(onSubmit)}>
              <div className={styles.formGroup}>
                <label htmlFor="name" className={styles.label}>Имя</label>
                <input
                  id="name"
                  type="text"
                  placeholder="Ваше имя"
                  className={`${styles.input} ${errors.name ? styles.inputError : ""}`}
                  {...register("name", { 
                    required: "Имя обязательно",
                    minLength: { value: 2, message: "Минимум 2 символа" }
                  })}
                />
                {errors.name && <span className={styles.error}>{errors.name.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className={`${styles.input} ${errors.email ? styles.inputError : ""}`}
                  {...register("email", {
                    required: "Email обязателен",
                    pattern: { value: /\S+@\S+\.\S+/, message: "Некорректный email" }
                  })}
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
                  {...register("password", {
                    required: "Пароль обязателен",
                    minLength: { value: 6, message: "Пароль должен быть не менее 6 символов" }
                  })}
                />
                {errors.password && <span className={styles.error}>{errors.password.message}</span>}
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirm" className={styles.label}>Подтвердите пароль</label>
                <input
                  id="confirm"
                  type="password"
                  placeholder="••••••••"
                  className={`${styles.input} ${errors.confirm ? styles.inputError : ""}`}
                  {...register("confirm", {
                    required: "Подтвердите пароль",
                    validate: (value) => value === password || "Пароли не совпадают"
                  })}
                />
                {errors.confirm && <span className={styles.error}>{errors.confirm.message}</span>}
              </div>

              <button type="submit" className={styles.registerButton}>
                Зарегистрироваться
              </button>

              <p className={styles.loginText}>
                Уже есть аккаунт? <Link to="/login" className={styles.link}>Войти</Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
}
