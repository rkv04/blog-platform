import { useState, useEffect } from "react";
import styles from "./AddPostModal.module.css";
import topicsApi from "../api/topics/topics";

export default function AddPostModal({ onClose, onAddPost, topics: providedTopics }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [topic, setTopic] = useState("");
  const [image, setImage] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [topics, setTopics] = useState(providedTopics || []);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!providedTopics || providedTopics.length === 0) {
      loadTopics();
    } else {
      setTopics(providedTopics);
    }
  }, [providedTopics]);

  const loadTopics = async () => {
    const result = await topicsApi.getTopics();
    if (result.success) {
      setTopics(result.data);
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
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

    if (!title.trim()) {
      newErrors.title = "Заголовок обязателен";
    }
    if (!text.trim()) {
      newErrors.text = "Текст обязателен";
    }
    if (!topic) {
      newErrors.topic = "Тематика обязательна";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSubmitting(true);
    
    // Создаем FormData для отправки на сервер
    const formData = new FormData();
    formData.append("title", title);
    formData.append("text", text);
    formData.append("topic", parseInt(topic));
    if (image) {
      formData.append("image", image);
    }

    const success = await onAddPost({
      title,
      text,
      topic: parseInt(topic),
      image,
    });

    setSubmitting(false);
    
    if (success !== false) {
      onClose();
    }
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2>Новый пост</h2>
          <button className={styles.closeButton} onClick={onClose}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="title" className={styles.label}>
              Заголовок <span className={styles.required}>*</span>
            </label>
            <input
              id="title"
              type="text"
              placeholder="Введите заголовок поста"
              className={`${styles.input} ${errors.title ? styles.inputError : ""}`}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
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
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            >
              <option value="">Выберите тематику</option>
              {topics.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
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
              rows={6}
              className={`${styles.textarea} ${errors.text ? styles.inputError : ""}`}
              value={text}
              onChange={(e) => setText(e.target.value)}
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

          <div className={styles.modalActions}>
            <button
              type="button"
              className={styles.cancelButton}
              onClick={onClose}
              disabled={submitting}
            >
              Отмена
            </button>
            <button type="submit" className={styles.submitButton} disabled={submitting}>
              {submitting ? "Публикация..." : "Опубликовать"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
