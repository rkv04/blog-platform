const API_URL = "http://localhost:3000/api";

const authenticationController = {
  async login(data) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.error === "INVALID_CREDENTIALS" ? "Неверный пароль или почта" : error.error,
        };
      }
      
      const result = await response.json();
      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("user", JSON.stringify(result.user));
      return {
        success: true,
        data: { accessToken: result.accessToken, user: result.user },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Ошибка подключения к серверу",
      };
    }
  },

  async register(data) {
    try {
      const response = await fetch(`${API_URL}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
          passwordConfirm: data.confirm,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.error === "EMAIL_ALREADY_TAKEN" ? "Email уже занят" : error.error,
        };
      }
      
      const result = await response.json();
      localStorage.setItem("accessToken", result.accessToken);
      localStorage.setItem("user", JSON.stringify(result.user));
      return {
        success: true,
        data: { accessToken: result.accessToken, user: result.user },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Ошибка подключения к серверу",
      };
    }
  },

  async refresh() {
    try {
      const response = await fetch(`${API_URL}/auth/refresh`, {
        method: "POST",
        credentials: "include",
      });
      
      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.error || "Не удалось обновить токен",
        };
      }
      
      const result = await response.json();
      localStorage.setItem("accessToken", result.accessToken);
      return {
        success: true,
        data: { accessToken: result.accessToken },
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Ошибка подключения к серверу",
      };
    }
  },

  async logout() {
    try {
      const response = await fetch(`${API_URL}/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      
      if (!response.ok) {
        const error = await response.json();
        return {
          success: false,
          message: error.error || "Ошибка при выходе",
        };
      }
      
      return { success: true };
    } catch (error) {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
      return {
        success: false,
        message: error.message || "Ошибка подключения к серверу",
      };
    }
  },

  async forgotPassword(email) {
    try {
      // Endpoint не описан в API, заглушка
      return {
        success: true,
        message: "Ссылка для сброса отправлена",
      };
    } catch (error) {
      return {
        success: false,
        message: error.message || "Ошибка подключения к серверу",
      };
    }
  },

  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    if (!userStr) return null;
    try {
      return JSON.parse(userStr);
    } catch {
      return null;
    }
  },
};

export default authenticationController;
