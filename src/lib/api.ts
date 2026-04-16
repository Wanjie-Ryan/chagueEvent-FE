// SURGICAL: Central API configuration using native fetch
const API_URL = "http://localhost:3005/api";

const api = {
  async request(endpoint: string, options: RequestInit = {}) {
    const token = localStorage.getItem("token");
    const headers = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw { response: { data } };
    }

    return { data };
  },

  get(endpoint: string, options: RequestInit = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  },

  post(endpoint: string, body: any, options: RequestInit = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(body),
    });
  },

  put(endpoint: string, body: any, options: RequestInit = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(body),
    });
  },

  patch(endpoint: string, body: any, options: RequestInit = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(body),
    });
  },

  delete(endpoint: string, options: RequestInit = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  },
};

export default api;
