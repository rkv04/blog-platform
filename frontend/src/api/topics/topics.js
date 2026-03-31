const API_URL = "http://localhost:3000/api";

const topicsApi = {
  async getTopics() {
    try {
      const response = await fetch(`${API_URL}/topics`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
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

export default topicsApi;
