// utils/currentUser.js
export const currentUser = JSON.parse(sessionStorage.getItem("currentUser")) || null;
