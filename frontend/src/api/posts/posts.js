const API_URL = "http://localhost:3000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Authorization": token ? `Bearer ${token}` : "",
  };
};

const postsApi = {
  async getPosts(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      if (params.page) queryParams.append("page", params.page);
      if (params.limit) queryParams.append("limit", params.limit);
      if (params.topic) queryParams.append("topic", params.topic);
      if (params.authorId) queryParams.append("authorId", params.authorId);
      if (params.search) queryParams.append("search", params.search);
      if (params.subscriptions) queryParams.append("subscriptions", params.subscriptions);

      const response = await fetch(`${API_URL}/posts?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, message: error.error };
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: error.message || "Ошибка подключения к серверу" };
    }
  },

  async getPost(id) {
    try {
      // Отдельного endpoint для получения одного поста нет в API
      // Используем getPosts с authorId и search или получаем из списка
      const response = await fetch(`${API_URL}/posts`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, message: error.error };
      }

      const result = await response.json();
      const post = result.data.find((p) => p.id === parseInt(id));
      return { success: true, data: post || null };
    } catch (error) {
      return { success: false, message: error.message || "Ошибка подключения к серверу" };
    }
  },

  async createPost(formData) {
    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, message: error.error };
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: error.message || "Ошибка подключения к серверу" };
    }
  },

  async updatePost(id, formData) {
    try {
      const response = await fetch(`${API_URL}/posts/${id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, message: error.error };
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: error.message || "Ошибка подключения к серверу" };
    }
  },

  async deletePost(id) {
    try {
      const response = await fetch(`${API_URL}/posts/${id}`, {
        method: "DELETE",
        headers: {
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, message: error.error };
      }

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || "Ошибка подключения к серверу" };
    }
  },

  // Likes
  async getLikes(postId) {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/likes`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, message: error.error };
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: error.message || "Ошибка подключения к серверу" };
    }
  },

  async toggleLike(postId) {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/likes`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, message: error.error };
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: error.message || "Ошибка подключения к серверу" };
    }
  },

  async removeLike(postId) {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/likes`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, message: error.error };
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: error.message || "Ошибка подключения к серверу" };
    }
  },

  // Comments
  async getComments(postId) {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, message: error.error };
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: error.message || "Ошибка подключения к серверу" };
    }
  },

  async addComment(postId, text) {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({ text }),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, message: error.error };
      }

      const result = await response.json();
      return { success: true, data: result };
    } catch (error) {
      return { success: false, message: error.message || "Ошибка подключения к серверу" };
    }
  },

  async deleteComment(postId, commentId) {
    try {
      const response = await fetch(`${API_URL}/posts/${postId}/comments/${commentId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const error = await response.json();
        return { success: false, message: error.error };
      }

      return { success: true };
    } catch (error) {
      return { success: false, message: error.message || "Ошибка подключения к серверу" };
    }
  },
};

export default postsApi;
