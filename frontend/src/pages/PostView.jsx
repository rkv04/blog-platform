import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./PostView.module.css";
import postsApi from "../api/posts/posts";
import usersApi from "../api/users/users";
import { useAuth } from "../contexts/AuthContext";

export default function PostView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [likes, setLikes] = useState({ count: 0, users: [], liked: false });
  const [loading, setLoading] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    loadPostData();
  }, [id]);

  const loadPostData = async () => {
    setLoading(true);
    
    // Загружаем посты и ищем нужный
    const postsResult = await postsApi.getPosts();
    if (postsResult.success) {
      const foundPost = postsResult.data.data.find((p) => p.id === parseInt(id));
      if (foundPost) {
        setPost(foundPost);
        
        // Загружаем комментарии
        const commentsResult = await postsApi.getComments(id);
        if (commentsResult.success) {
          setComments(commentsResult.data);
        }

        // Загружаем лайки
        const likesResult = await postsApi.getLikes(id);
        if (likesResult.success) {
          const currentUserId = user?.id;
          const isLiked = likesResult.data.users?.some((u) => u.userId === currentUserId);
          setLikes({ ...likesResult.data, liked: !!isLiked });
        }

        // Проверяем подписку
        if (isAuthenticated && user?.id !== foundPost.author.id) {
          const followingResult = await usersApi.getFollowing(user.id);
          if (followingResult.success) {
            const isSub = followingResult.data.some((a) => a.id === foundPost.author.id);
            setIsSubscribed(isSub);
          }
        }
      } else {
        toast.error("Пост не найден");
        navigate("/profile");
      }
    } else {
      toast.error("Ошибка загрузки поста");
    }
    setLoading(false);
  };

  const handleLikeToggle = async () => {
    if (!isAuthenticated) {
      toast.error("Необходимо войти для лайка");
      navigate("/login");
      return;
    }

    let result;
    if (likes.liked) {
      result = await postsApi.removeLike(id);
    } else {
      result = await postsApi.toggleLike(id);
    }

    if (result.success) {
      setLikes((prev) => ({
        ...prev,
        liked: result.data.liked,
        count: prev.count + (result.data.liked ? 1 : -1),
      }));
    } else {
      toast.error(result.message);
    }
  };

  const handleSubscribe = async () => {
    if (!isAuthenticated) {
      toast.error("Необходимо войти для подписки");
      navigate("/login");
      return;
    }

    let result;
    if (isSubscribed) {
      result = await usersApi.unsubscribe(post.author.id);
    } else {
      result = await usersApi.subscribe(post.author.id);
    }

    if (result.success) {
      setIsSubscribed(!isSubscribed);
      toast.success(isSubscribed ? "Вы отписались от автора" : "Вы подписались на автора");
    } else {
      toast.error(result.message);
    }
  };

  const onAddComment = async (data) => {
    if (!isAuthenticated) {
      toast.error("Необходимо войти для комментария");
      navigate("/login");
      return;
    }

    const result = await postsApi.addComment(id, data.text);
    if (result.success) {
      setComments([...comments, result.data]);
      reset();
      toast.success("Комментарий добавлен");
    } else {
      toast.error(result.message);
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!isAuthenticated) {
      toast.error("Необходимо войти");
      navigate("/login");
      return;
    }

    const result = await postsApi.deleteComment(id, commentId);
    if (result.success) {
      setComments(comments.filter((c) => c.id !== commentId));
      toast.success("Комментарий удален");
    } else {
      toast.error(result.message);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Вы уверены, что хотите удалить пост?")) return;

    const result = await postsApi.deletePost(id);
    if (result.success) {
      toast.success("Пост удален");
      navigate("/profile");
    } else {
      toast.error(result.message);
    }
  };

  const handleEditPost = () => {
    navigate(`/posts/${id}/edit`);
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  if (!post) {
    return (
      <div className={styles.notFound}>
        <h1>Пост не найден</h1>
        <button onClick={() => navigate("/profile")}>Вернуться к ленте</button>
      </div>
    );
  }

  const isOwner = user?.id === post.author.id;
  const isAdmin = user?.role === "admin";
  const canEdit = isOwner || isAdmin;
  const canDeleteComment = (comment) => {
    return user?.id === comment.author.id || isAdmin;
  };

  const getAvatarInitials = (name) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={styles.postViewPage}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate("/profile")}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Назад
        </button>
        <div className={styles.headerActions}>
          {canEdit && (
            <>
              <button className={styles.editButton} onClick={handleEditPost}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Редактировать
              </button>
              <button className={styles.deleteButton} onClick={handleDeletePost}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Удалить
              </button>
            </>
          )}
        </div>
      </header>

      <main className={styles.mainContent}>
        <article className={styles.postCard}>
          <div className={styles.postHeader}>
            <Link to={`/users/${post.author.id}`} className={styles.authorLink}>
              <div className={styles.authorAvatar}>
                {getAvatarInitials(post.author.name)}
              </div>
              <div className={styles.authorInfo}>
                <span className={styles.authorName}>{post.author.name}</span>
                <span className={styles.topicName}>{post.topic?.name || "Без темы"}</span>
              </div>
            </Link>
            {!isOwner && isAuthenticated && (
              <button
                className={`${styles.subscribeButton} ${isSubscribed ? styles.subscribed : ""}`}
                onClick={handleSubscribe}
              >
                {isSubscribed ? "Отписаться" : "Подписаться"}
              </button>
            )}
          </div>

          {post.imageUrl && (
            <div className={styles.postImage}>
              <img src={`http://localhost:3000${post.imageUrl}`} alt={post.title} />
            </div>
          )}

          <div className={styles.postContent}>
            <h1 className={styles.postTitle}>{post.title}</h1>
            <p className={styles.postText}>{post.text}</p>
          </div>

          <div className={styles.postActions}>
            <button
              className={`${styles.actionButton} ${styles.likeButton} ${likes.liked ? styles.liked : ""}`}
              onClick={handleLikeToggle}
            >
              <svg viewBox="0 0 24 24" fill={likes.liked ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
              </svg>
              <span>{likes.count}</span>
            </button>
            <button className={styles.actionButton}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
              </svg>
              <span>{comments.length}</span>
            </button>
          </div>
        </article>

        <section className={styles.commentsSection}>
          <h2 className={styles.commentsTitle}>Комментарии ({comments.length})</h2>

          <form className={styles.commentForm} onSubmit={handleSubmit(onAddComment)}>
            <div className={styles.formGroup}>
              <textarea
                placeholder="Напишите комментарий..."
                rows={3}
                className={`${styles.textarea} ${errors.text ? styles.inputError : ""}`}
                {...register("text", { required: "Комментарий не может быть пустым" })}
              />
              {errors.text && <span className={styles.error}>{errors.text.message}</span>}
            </div>
            <button type="submit" className={styles.submitButton}>
              Отправить
            </button>
          </form>

          <div className={styles.commentsList}>
            {comments.length === 0 ? (
              <p className={styles.noComments}>Комментариев пока нет. Будьте первым!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className={styles.commentItem}>
                  <div className={styles.commentAvatar}>
                    {getAvatarInitials(comment.author.name)}
                  </div>
                  <div className={styles.commentContent}>
                    <div className={styles.commentHeader}>
                      <span className={styles.commentAuthor}>{comment.author.name}</span>
                      {canDeleteComment(comment) && (
                        <button
                          className={styles.deleteCommentButton}
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      )}
                    </div>
                    <p className={styles.commentText}>{comment.text}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      <ToastContainer />
    </div>
  );
}
