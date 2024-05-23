import axios from "axios";

const API_URL = "http://localhost:8005"; // 스프링 서버 주소

// Axios 인스턴스 생성
const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

const AuthService = {
  login: async (data) => {
    try {
      const response = await axiosInstance.post("/auth/login", data);
      if (response.data.token) {
        localStorage.setItem("accessToken", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        console.log("Token received:", response.data.token);
      } else {
        console.error("No access token received");
      }
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized: Invalid credentials");
      } else {
        console.error("Login failed:", error.message);
      }
      throw new Error("Login failed");
    }
  },

  signup: async (data) => {
    try {
      const response = await axiosInstance.post("/auth/join", data);
      return response.data;
    } catch (error) {
      console.error("Signup failed:", error.message);
      throw new Error("Signup failed");
    }
  },

  fetchUserData: async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("No access token found");
      }
      const response = await axiosInstance.get("/members/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      if (error.response && error.response.status === 401) {
        console.error("Unauthorized: Access token may be invalid or expired");
      } else {
        console.error("Failed to fetch user data:", error.message);
      }
      throw new Error("Failed to fetch user data");
    }
  },

  updateProfile: async (data) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("No access token found");
      }
      const response = await axiosInstance.put("/members/update", data, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      return response.data;
    } catch (error) {
      console.error("Profile update failed:", error.message);
      throw new Error("Profile update failed");
    }
  },

  logout: async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("No access token found");
      }
      await axiosInstance.post(
        "/auth/logout",
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Failed to logout:", error.message);
      throw new Error("Failed to logout");
    }
  },

  deleteAccount: async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        throw new Error("No access token found");
      }
      await axiosInstance.delete("/members/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("user");
    } catch (error) {
      console.error("Failed to delete account:", error.message);
      throw new Error("Failed to delete account");
    }
  },
};

export default AuthService;
