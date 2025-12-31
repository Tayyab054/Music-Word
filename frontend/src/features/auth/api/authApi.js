import { apiClient } from "../../../api/apiClient";

export const authApi = {
  login: (identifier, password) =>
    apiClient.post("/api/auth/login", { email: identifier, password }),

  register: (data) => apiClient.post("/api/auth/register", data),

  logout: () => apiClient.post("/api/auth/logout"),

  me: () => apiClient.get("/api/auth/me"),

  verifyOtp: (otp) => apiClient.post("/api/auth/verify-otp", { otp }),

  resendOtp: () => apiClient.post("/api/auth/resend-otp"),

  forgotPassword: (email) =>
    apiClient.post("/api/auth/forgot-password", { email }),

  resetPassword: (password) =>
    apiClient.post("/api/auth/reset-password", { password }),

  checkOtpSession: async () => {
    const response = await apiClient.get("/api/auth/otp-session");
    return response.data;
  },

  checkEmail: (email) => apiClient.post("/api/auth/check-email", { email }),

  googleAuthUrl: `${apiClient.defaults.baseURL}/api/auth/google`,
};
