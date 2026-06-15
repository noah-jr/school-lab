import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
});

// Interceptor de erros global
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err?.response?.data?.erro ?? err.message ?? "Erro desconhecido";
    console.error("[API Error]", msg);
    return Promise.reject(new Error(msg));
  }
);

export default api;
