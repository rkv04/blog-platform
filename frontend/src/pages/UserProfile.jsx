import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./UserProfile.module.css";
import postsApi from "../api/posts/posts";
import usersApi from "../api/users/users";
import { useAuth } from "../contexts/AuthContext";

export default function UserProfile() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser, isAuthenticated } = useAuth();
  const [userPosts, setUserPosts] = useState([]);
  const [author, setAuthor] = useState(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserProfile();
  }, [id]);

  const loadUserProfile = async () => {
    setLoading(true);
    
    // Загружаем посты автора
    const postsResult = await postsApi.getPosts({ authorId: id });
    if (postsResult.success && postsResult.data.data.length > 0) {
      // Получаем информацию об авторе из первого поста
      const firstPost = postsResult.data.data[0];
      setAuthor(firstPost.author);
      setUserPosts(postsResult.data.data);

      // Проверяем подписку
      if (isAuthenticated && currentUser?.id !== firstPost.author.id) {
        const followingResult = await usersApi.getFollowing(currentUser.id);
        if (followingResult.success) {
          const subscribed = followingResult.data.some((a) => a.id === firstPost.author.id);
          setIsSubscribed(subscribed);
        }
      }
    } else {
      toast.error("Пользователь не найден или у него нет постов");
    }
    setLoading(false);
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.error("Необходимо войти для подписки");
      navigate("/login");
      return;
    }

    let result;
    if (isSubscribed) {
      result = await usersApi.unsubscribe(author.id);
    } else {
      result = await usersApi.subscribe(author.id);
    }

    if (result.success) {
      setIsSubscribed(!isSubscribed);
      toast.success(isSubscribed ? "Вы отписались от автора" : "Вы подписались на автора");
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

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!author) {
    return (
      <div className={styles.notFound}>
        <h1>Пользователь не найден</h1>
        <button onClick={() => navigate("/profile")}>Вернуться к ленте</button>
      </div>
    );
  }

  const isOwnProfile = currentUser?.id === author.id;

  return (
    <div className={styles.userProfilePage}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate("/profile")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Назад
        </button>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>{getAvatarInitials(author.name)}</div>
          <div className={styles.info}>
            <h1 className={styles.name}>{author.name}</h1>
            <p className={styles.email}>{author.email}</p>
            {!isOwnProfile && (
              <button
                className={`${styles.subscribeButton} ${isSubscribed ? styles.subscribed : ""}`}
                onClick={handleSubscribe}
              >
                {isSubscribed ? "Отписаться" : "Подписаться"}
              </button>
            )}
          </div>
        </div>

        <section className={styles.postsSection}>
          <h2 className={styles.sectionTitle}>Посты ({userPosts.length})</h2>
          
          {userPosts.length === 0 ? (
            <div className={styles.emptyState}>
              <p>У этого автора пока нет постов</p>
            </div>
          ) : (
            <div className={styles.postsList}>
              {userPosts.map((post) => (
                <Link key={post.id} to={`/posts/${post.id}`} className={styles.postCard}>
                  <div className={styles.postContent}>
                    <h3 className={styles.postTitle}>{post.title}</h3>
                    <p className={styles.postExcerpt}>
                      {post.text.substring(0, 150)}{post.text.length > 150 ? "..." : ""}
                    </p>
                    <span className={styles.postTopic}>{post.topic?.name || "Без темы"}</span>
                  </div>
                  {post.imageUrl && (
                    <div className={styles.postImage}>
                      <img src={`http://localhost:3000${post.imageUrl}`} alt={post.title} />
                    </div>
                  )}
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      <ToastContainer />
    </div>
  );
}
