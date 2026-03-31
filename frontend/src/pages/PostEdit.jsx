import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import styles from "./PostEdit.module.css";
import postsApi from "../api/posts/posts";
import topicsApi from "../api/topics/topics";

export default function PostEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [topics, setTopics] = useState([]);
  const [formData, setFormData] = useState({
    title: "",
    text: "",
    topic: "",
    image: null,
    existingImage: null,
  });
  const [errors, setErrors] = useState({});
  const [previewImage, setPreviewImage] = useState(null);

  useEffect(() => {
    loadPostData();
    loadTopics();
  }, [id]);

  const loadTopics = async () => {
    const result = await topicsApi.getTopics();
    if (result.success) {
      setTopics(result.data);
    }
  };

  const loadPostData = async () => {
    setLoading(true);
    const postsResult = await postsApi.getPosts();
    if (postsResult.success) {
      const post = postsResult.data.data.find((p) => p.id === parseInt(id));
      if (post) {
        setFormData({
          title: post.title,
          text: post.text,
          topic: post.topic?.id?.toString() || "",
          image: null,
          existingImage: post.imageUrl,
        });
        if (post.imageUrl) {
          setPreviewImage(`http://localhost:3000${post.imageUrl}`);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, image: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Заголовок обязателен";
    }
    if (!formData.text.trim()) {
      newErrors.text = "Текст обязателен";
    }
    if (!formData.topic) {
      newErrors.topic = "Тематика обязательна";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    const data = new FormData();
    data.append("title", formData.title);
    data.append("text", formData.text);
    data.append("topic", parseInt(formData.topic));
    if (formData.image) {
      data.append("image", formData.image);
    }

    const result = await postsApi.updatePost(id, data);
    setSaving(false);

    if (result.success) {
      toast.success("Пост обновлен");
      navigate(`/posts/${id}`);
    } else {
      toast.error(result.message || "Ошибка обновления");
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Загрузка...</p>
      </div>
    );
  }

  return (
    <div className={styles.editPage}>
      <header className={styles.header}>
        <button className={styles.backButton} onClick={() => navigate(`/posts/${id}`)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Назад
        </button>
        <h1 className={styles.pageTitle}>Редактировать пост</h1>
      </header>

      <main className={styles.mainContent}>
        <form className={styles.editForm} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              Заголовок <span className={styles.required}>*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="Введите заголовок поста"
              className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            />
            {errors.title && <span className={styles.error}>{errors.title}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="topic" className={styles.label}>
              Тематика <span className={styles.required}>*</span>
            </label>
            <select
              id="topic"
              className={`${styles.select} ${errors.topic ? styles.inputError : ""}`}
              value={formData.topic}
              onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
            >
              <option value="">Выберите тематику</option>
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
            {errors.topic && <span className={styles.error}>{errors.topic}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="text" className={styles.label}>
              Текст <span className={styles.required}>*</span>
            </label>
            <textarea
              id="text"
              placeholder="О чем ваш пост?"
              rows={10}
              className={`${styles.textarea} ${errors.text ? styles.inputError : ""}`}
              value={formData.text}
              onChange={(e) => setFormData({ ...formData, text: e.target.value })}
            />
            {errors.text && <span className={styles.error}>{errors.text}</span>}
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="image" className={styles.label}>Изображение</label>
            {previewImage && (
              <div className={styles.imagePreview}>
                <img src={previewImage} alt="Preview" />
              </div>
            )}
            <input
              id="image"
              type="file"
              accept="image/*"
              className={styles.fileInput}
              onChange={handleImageChange}
            />
            <p className={styles.fileHint}>JPG, JPEG, PNG, WEBP, GIF. Макс. 5 МБ</p>
          </div>

          <div className={styles.formActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={() => navigate(`/posts/${id}`)}
            >
              Отмена
            </button>
            <button type="submit" className={styles.submitButton} disabled={saving}>
              {saving ? "Сохранение..." : "Сохранить"}
            </button>
          </div>
        </form>
      </main>

      <ToastContainer />
    </div>
  );
}
