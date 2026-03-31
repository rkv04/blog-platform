import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./MyProfile.module.css";
import AddPostModal from "./AddPostModal";
import postsApi from "../api/posts/posts";
import { useAuth } from "../contexts/AuthContext";

export default function MyProfile() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      loadMyPosts();
    }
  }, [isAuthenticated, user?.id]);

  const loadMyPosts = async () => {
    setLoading(true);
    const result = await postsApi.getPosts({ authorId: user.id });
    if (result.success) {
      setPosts(result.data.data);
    } else {
      toast.error("Ошибка загрузки постов");
    }
    setLoading(false);
  };

  const handleAddPost = async (newPost) => {
    const formData = new FormData();
    formData.append("title", newPost.title);
    formData.append("text", newPost.text);
    formData.append("topic", parseInt(newPost.topic));
    if (newPost.image) {
      formData.append("image", newPost.image);
    }

    const result = await postsApi.createPost(formData);
    if (result.success) {
      toast.success("Пост создан");
      loadMyPosts();
      return true;
    } else {
      toast.error(result.message || "Ошибка создания поста");
      return false;
    }
  };

  const handleDeletePost = async (postId, e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!window.confirm("Вы уверены, что хотите удалить пост?")) return;

    const result = await postsApi.deletePost(postId);
    if (result.success) {
      toast.success("Пост удален");
      loadMyPosts();
    } else {
      toast.error(result.message);
    }
  };

  const handleEditPost = (postId, e) => {
    e.preventDefault();
    e.stopPropagation();
    navigate(`/posts/${postId}/edit`);
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
    <div className={styles.myProfilePage}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate("/profile")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          К ленте
        </button>
        <h1 className={styles.pageTitle}>Мой профиль</h1>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.profileHeader}>
          <div className={styles.avatar}>{getAvatarInitials(user.name)}</div>
          <div className={styles.info}>
            <h2 className={styles.name}>{user.name}</h2>
            <p className={styles.email}>{user.email}</p>
            <p className={styles.role}>{user.role === "admin" ? "Администратор" : "Пользователь"}</p>
          </div>
          <button className={styles.addPostButton} onClick={() => setIsModalOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Создать пост
          </button>
        </div>

        <section className={styles.postsSection}>
          <div className={styles.sectionHeader}>
            <h2 className={styles.sectionTitle}>Мои посты ({posts.length})</h2>
          </div>
          
          {loading ? (
            <div className={styles.loadingPosts}>
              <div className={styles.spinner}></div>
              <p>Загрузка постов...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className={styles.emptyState}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                <path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" />
              </svg>
              <h3>У вас пока нет постов</h3>
              <p>Создайте свой первый пост и поделитесь мыслями с миром</p>
              <button onClick={() => setIsModalOpen(true)}>Создать пост</button>
            </div>
          ) : (
            <div className={styles.postsList}>
              {posts.map((post) => (
                <Link key={post.id} to={`/posts/${post.id}`} className={styles.postCard}>
                  <div className={styles.postContent}>
                    <h3 className={styles.postTitle}>{post.title}</h3>
                    <p className={styles.postExcerpt}>
                      {post.text.substring(0, 150)}{post.text.length > 150 ? "..." : ""}
                    </p>
                    <div className={styles.postMeta}>
                      <span className={styles.postTopic}>{post.topic?.name || "Без темы"}</span>
                    </div>
                  </div>
                  {post.imageUrl && (
                    <div className={styles.postImage}>
                      <img src={`http://localhost:3000${post.imageUrl}`} alt={post.title} />
                    </div>
                  )}
                  <div className={styles.postActions}>
                    <button
                      className={styles.actionButton}
                      onClick={(e) => handleEditPost(post.id, e)}
                      title="Редактировать"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      className={styles.deleteButton}
                      onClick={(e) => handleDeletePost(post.id, e)}
                      title="Удалить"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </main>

      {isModalOpen && (
        <AddPostModal
          onClose={() => setIsModalOpen(false)}
          onAddPost={handleAddPost}
        />
      )}

      <ToastContainer />
    </div>
  );
}
