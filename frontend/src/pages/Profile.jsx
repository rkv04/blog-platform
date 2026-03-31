import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./Profile.module.css";
import AddPostModal from "./AddPostModal";
import postsApi from "../api/posts/posts";
import topicsApi from "../api/topics/topics";
import { useAuth } from "../contexts/AuthContext";

export default function Profile() {
  const { user, isAuthenticated, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, isLoading, navigate]);

  useEffect(() => {
    if (isAuthenticated) {
      loadTopics();
      loadPosts();
    }
  }, [isAuthenticated, selectedTopic, currentPage]);

  const loadTopics = async () => {
    const result = await topicsApi.getTopics();
    if (result.success) {
      setTopics(result.data);
    }
  };

  const loadPosts = async () => {
    setLoading(true);
    const params = {
      page: currentPage,
      limit,
      topic: selectedTopic,
      search: searchQuery || undefined,
    };

    const result = await postsApi.getPosts(params);
    if (result.success) {
      setPosts(result.data.data);
      setTotalPages(result.data.meta?.totalPages || 1);
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
      loadPosts();
      return true;
    } else {
      toast.error(result.message || "Ошибка создания поста");
      return false;
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleTopicFilter = (topicId) => {
    setSelectedTopic(selectedTopic === topicId ? null : topicId);
    setCurrentPage(1);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    setCurrentPage(1);
    loadPosts();
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
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
    <div className={styles.profilePage}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}>
            <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="2" fill="none" />
              <path d="M24 14v20M16 20h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <span>BlogSystem</span>
          </div>
        </div>
        <div className={styles.headerRight}>
          <button className={styles.addPostButton} onClick={() => setIsModalOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>Новый пост</span>
          </button>
          <div className={styles.userMenu}>
            <Link to="/my-profile" className={styles.userName}>
              <div className={styles.userAvatar}>{user && getAvatarInitials(user.name)}</div>
              <span>{user?.name}</span>
            </Link>
            <button className={styles.logoutButton} onClick={handleLogout}>
              Выйти
            </button>
          </div>
        </div>
      </header>

      <div className={styles.mainLayout}>
        <aside className={styles.sidebar}>
          <div className={styles.sidebarSection}>
            <h3>Поиск</h3>
            <form className={styles.searchForm} onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="Поиск постов..."
                className={styles.searchInput}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit" className={styles.searchButton}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="8" />
                  <path d="M21 21l-4.35-4.35" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </form>
          </div>

          <div className={styles.sidebarSection}>
            <h3>Тематики</h3>
            <nav className={styles.topicsList}>
              <button
                className={`${styles.topicItem} ${selectedTopic === null ? styles.active : ""}`}
                onClick={() => handleTopicFilter(null)}
              >
                Все
              </button>
              {topics.map((topic) => (
                <button
                  key={topic.id}
                  className={`${styles.topicItem} ${selectedTopic === topic.id ? styles.active : ""}`}
                  onClick={() => handleTopicFilter(topic.id)}
                >
                  {topic.name}
                </button>
              ))}
            </nav>
          </div>

          <div className={styles.sidebarSection}>
            <h3>Навигация</h3>
            <nav className={styles.navList}>
              <Link to="/my-profile" className={styles.navItem}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                Мой профиль
              </Link>
              <Link to="/following" className={styles.navItem}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
                </svg>
                Подписки
              </Link>
            </nav>
          </div>
        </aside>

        <main className={styles.feedContent}>
          <div className={styles.postsList}>
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
                <p>Постов пока нет</p>
                <button onClick={() => setIsModalOpen(true)}>Создать первый пост</button>
              </div>
            ) : (
              posts.map((post) => (
                <article key={post.id} className={styles.postCard}>
                  <Link to={`/posts/${post.id}`} className={styles.postLink}>
                    <div className={styles.postHeader}>
                      <div className={styles.postAuthor}>
                        <div className={styles.postAvatar}>
                          {getAvatarInitials(post.author.name)}
                        </div>
                        <div className={styles.postAuthorInfo}>
                          <span className={styles.postAuthorName}>{post.author.name}</span>
                          <span className={styles.postTopic}>{post.topic?.name || "Без темы"}</span>
                        </div>
                      </div>
                    </div>
                    {post.imageUrl && (
                      <div className={styles.postImage}>
                        <img src={`http://localhost:3000${post.imageUrl}`} alt={post.title} />
                      </div>
                    )}
                    <div className={styles.postContent}>
                      <h2 className={styles.postTitle}>{post.title}</h2>
                      <p className={styles.postExcerpt}>
                        {post.text.substring(0, 200)}{post.text.length > 200 ? "..." : ""}
                      </p>
                    </div>
                  </Link>
                  <div className={styles.postActions}>
                    <Link to={`/posts/${post.id}`} className={styles.actionButton}>
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                      </svg>
                      <span>Подробнее</span>
                    </Link>
                  </div>
                </article>
              ))
            )}
          </div>

          {totalPages > 1 && (
            <div className={styles.pagination}>
              <button
                className={styles.pageButton}
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
              >
                Назад
              </button>
              <span className={styles.pageInfo}>
                Страница {currentPage} из {totalPages}
              </span>
              <button
                className={styles.pageButton}
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Вперед
              </button>
            </div>
          )}
        </main>
      </div>

      {isModalOpen && (
        <AddPostModal
          onClose={() => setIsModalOpen(false)}
          onAddPost={handleAddPost}
          topics={topics}
        />
      )}

      <ToastContainer />
    </div>
  );
}
