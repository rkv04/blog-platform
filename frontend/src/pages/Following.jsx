import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./Following.module.css";
import usersApi from "../api/users/users";
import { useAuth } from "../contexts/AuthContext";

export default function Following() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [following, setFollowing] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadFollowing();
    }
  }, [isAuthenticated, user?.id]);

  const loadFollowing = async () => {
    setLoading(true);
    const result = await usersApi.getFollowing(user.id);
    if (result.success) {
      setFollowing(result.data);
    } else {
      toast.error("Ошибка загрузки подписок");
    }
    setLoading(false);
  };

  const handleUnsubscribe = async (authorId) => {
    const result = await usersApi.unsubscribe(authorId);
    if (result.success) {
      setFollowing(following.filter((a) => a.id !== authorId));
      toast.success("Вы отписались от автора");
    } else {
      toast.error(result.message);
    }
  };

  const getAvatarInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (isLoading || !isAuthenticated) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className={styles.followingPage}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate("/profile")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Назад
        </button>
        <h1 className={styles.pageTitle}>Подписки</h1>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.followingList}>
          {loading ? (
            <div className={styles.loadingList}>
              <div className={styles.spinner}></div>
              <p>Загрузка подписок...</p>
            </div>
          ) : following.length === 0 ? (
            <div className={styles.emptyState}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
              </svg>
              <h2>Вы пока ни на кого не подписаны</h2>
              <p>Найдите интересных авторов и подпишитесь на них, чтобы видеть их посты в ленте</p>
              <button onClick={() => navigate("/profile")}>Перейти к ленте</button>
            </div>
          ) : (
            following.map((author) => (
              <div key={author.id} className={styles.authorCard}>
                <Link to={`/users/${author.id}`} className={styles.authorLink}>
                  <div className={styles.authorAvatar}>
                    {getAvatarInitials(author.name)}
                  </div>
                  <div className={styles.authorInfo}>
                    <span className={styles.authorName}>{author.name}</span>
                    <span className={styles.authorId}>ID: {author.id}</span>
                  </div>
                </Link>
                <button
                  className={styles.unsubscribeButton}
                  onClick={() => handleUnsubscribe(author.id)}
                >
                  Отписаться
                </button>
              </div>
            ))
          )}
        </div>
      </main>

      <ToastContainer />
    </div>
  );
}
