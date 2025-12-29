const API_BASE = "http://localhost:5000/api";

// Helper for making API requests
async function apiRequest(endpoint, options = {}) {
  const config = {
    ...options,
    credentials: "include", // Important for session cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  };

  if (options.body && typeof options.body === "object") {
    config.body = JSON.stringify(options.body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await response.json();

  if (!response.ok) {
    throw { status: response.status, ...data };
  }

  return data;
}

/* ========================= AUTH API ========================= */

export const authAPI = {
  // Check email availability
  checkEmail: (email) =>
    apiRequest("/auth/check-email", {
      method: "POST",
      body: { email },
    }),

  // Register (step 1: send OTP)
  register: (data) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: data,
    }),

  // Verify OTP (creates account for signup)
  verifyOtp: (otp) =>
    apiRequest("/auth/verify-otp", {
      method: "POST",
      body: { otp },
    }),

  // Resend OTP
  resendOtp: () =>
    apiRequest("/auth/resend-otp", {
      method: "POST",
    }),

  // Login
  login: (email, password) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: { email, password },
    }),

  // Logout
  logout: () =>
    apiRequest("/auth/logout", {
      method: "POST",
    }),

  // Get current user
  me: () => apiRequest("/auth/me"),

  // Forgot password
  forgotPassword: (email) =>
    apiRequest("/auth/forgot-password", {
      method: "POST",
      body: { email },
    }),

  // Reset password
  resetPassword: (password) =>
    apiRequest("/auth/reset-password", {
      method: "POST",
      body: { password },
    }),

  // Check OTP session
  checkOtpSession: () => apiRequest("/auth/otp-session"),

  // Check OAuth session
  checkOAuthSession: () => apiRequest("/auth/oauth-session"),

  // Complete OAuth profile
  completeOAuthProfile: (data) =>
    apiRequest("/auth/oauth/complete", {
      method: "POST",
      body: data,
    }),

  // Google OAuth redirect URL
  googleAuthUrl: `${API_BASE}/auth/google`,
};

/* ========================= SONGS API ========================= */

export const songsAPI = {
  // Get all songs
  getAll: () => apiRequest("/songs"),

  // Get song by ID
  getById: (id) => apiRequest(`/songs/${id}`),

  // Get popular songs
  getPopular: (limit = 10) => apiRequest(`/songs/popular?limit=${limit}`),

  // Get songs by category
  getByCategory: (category) => apiRequest(`/songs/category/${category}`),

  // Get songs by artist
  getByArtist: (artistId) => apiRequest(`/songs/artist/${artistId}`),

  // Play song (record to history)
  play: (id) =>
    apiRequest(`/songs/${id}/play`, {
      method: "POST",
    }),
};

/* ========================= ARTISTS API ========================= */

export const artistsAPI = {
  // Get all artists
  getAll: () => apiRequest("/artists"),

  // Get artist by ID (includes songs)
  getById: (id) => apiRequest(`/artists/${id}`),

  // Get all categories
  getCategories: () => apiRequest("/artists/categories"),

  // Get artists by category
  getByCategory: (category) => apiRequest(`/artists/category/${category}`),

  // Get related artists
  getRelated: (id, limit = 5) =>
    apiRequest(`/artists/${id}/related?limit=${limit}`),
};

/* ========================= LIBRARY API ========================= */

export const libraryAPI = {
  // Get user's library
  get: () => apiRequest("/library"),

  // Get play history
  getHistory: (limit = 50) => apiRequest(`/library/history?limit=${limit}`),

  // Check if song is in library
  check: (songId) => apiRequest(`/library/check/${songId}`),

  // Add song to library
  add: (songId) =>
    apiRequest(`/library/${songId}`, {
      method: "POST",
    }),

  // Remove song from library
  remove: (songId) =>
    apiRequest(`/library/${songId}`, {
      method: "DELETE",
    }),
};

/* ========================= SEARCH API ========================= */

export const searchAPI = {
  // Global search
  search: (query, limit = 20) =>
    apiRequest(`/search?q=${encodeURIComponent(query)}&limit=${limit}`),

  // Search songs only
  searchSongs: (query, limit = 20) =>
    apiRequest(`/search/songs?q=${encodeURIComponent(query)}&limit=${limit}`),

  // Search artists only
  searchArtists: (query, limit = 20) =>
    apiRequest(`/search/artists?q=${encodeURIComponent(query)}&limit=${limit}`),

  // Autocomplete
  autocomplete: (query, limit = 10) =>
    apiRequest(
      `/search/autocomplete?q=${encodeURIComponent(query)}&limit=${limit}`
    ),
};

/* ========================= ADMIN API ========================= */

export const adminAPI = {
  // Dashboard stats
  getStats: () => apiRequest("/admin/stats"),

  // Song management
  songs: {
    add: (data) =>
      apiRequest("/admin/songs", {
        method: "POST",
        body: data,
      }),
    update: (id, data) =>
      apiRequest(`/admin/songs/${id}`, {
        method: "PUT",
        body: data,
      }),
    delete: (id) =>
      apiRequest(`/admin/songs/${id}`, {
        method: "DELETE",
      }),
  },

  // Artist management
  artists: {
    add: (data) =>
      apiRequest("/admin/artists", {
        method: "POST",
        body: data,
      }),
    update: (id, data) =>
      apiRequest(`/admin/artists/${id}`, {
        method: "PUT",
        body: data,
      }),
    delete: (id) =>
      apiRequest(`/admin/artists/${id}`, {
        method: "DELETE",
      }),
  },

  // User management
  users: {
    getAll: () => apiRequest("/admin/users"),
    getById: (id) => apiRequest(`/admin/users/${id}`),
    updateRole: (id, role) =>
      apiRequest(`/admin/users/${id}/role`, {
        method: "PUT",
        body: { role },
      }),
    delete: (id) =>
      apiRequest(`/admin/users/${id}`, {
        method: "DELETE",
      }),
    createAdmin: (data) =>
      apiRequest("/admin/users/admin", {
        method: "POST",
        body: data,
      }),
  },
};

export default {
  auth: authAPI,
  songs: songsAPI,
  artists: artistsAPI,
  library: libraryAPI,
  search: searchAPI,
  admin: adminAPI,
};
