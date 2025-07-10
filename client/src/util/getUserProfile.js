// utils/getUserProfile.js
import axios from "axios";

export const getUserProfile = async () => {
  const token = localStorage.getItem("token");
  if (!token) return null;

  let userId;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const isExpired = payload.exp * 1000 < Date.now();
    if (isExpired) {
      console.warn("Token expired.");
      localStorage.clear();
      return null;
    }
    userId = payload.id;
  } catch (err) {
    console.error("❌ Invalid JWT token:", err.message);
    return null;
  }

  try {
    const res = await axios.get(`/userProfile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        userId: userId 
      }
  });

     if (res.data.success) {
      const user = res.data.data;
      sessionStorage.setItem("currentUser", JSON.stringify(user)); // ✅ Store in session
      return user;
    }
  return null ;
  } catch (error) {
    console.error("❌ getUserProfile error:", error.message);
    return null;
  }
};
