const API_URL = "http://localhost:3000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("accessToken");
  return {
    "Authorization": token ? `Bearer ${token}` : "",
  };
};

const usersApi = {
  async subscribe(userId) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/subscribe`, {
        method: "POST",
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

  async unsubscribe(userId) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/subscribe`, {
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

  async getFollowing(userId) {
    try {
      const response = await fetch(`${API_URL}/users/${userId}/following`, {
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

  async getFollowers(userId) {
    try {
      // Endpoint не описан явно в API, предполагаемая реализация
      const response = await fetch(`${API_URL}/users/${userId}/followers`, {
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

  async getUserProfile(userId) {
    try {
      // Получаем посты пользователя для профиля
      const response = await fetch(`${API_URL}/posts?authorId=${userId}`, {
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
};

export default usersApi;
