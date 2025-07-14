# Blogify - Full Stack Blogging Platform

**Blogify** is a fully responsive full-stack blogging web application developed using **React.js**, **Node.js**, **Express.js**, and the **MongoDB Native Driver**. This platform allows users to register, login, and interact with blog content by creating, editing, liking, saving, and commenting on blog posts. It delivers a clean, modern UI with intuitive UX and supports role-based access, including Admin capabilities.

---

## 🚀 Tech Stack

### 🧩 Frontend:

* **React.js** (Functional Components with Hooks)
* **React Router DOM** for routing
* **Bootstrap** for responsive UI design
* **Axios** for RESTful API communication
* **React Icons** (Font Awesome, Feather Icons)
* **sessionStorage** to store user session details
* **localStorage** to securely store JWT tokens

### 🛠️ Backend:

* **Node.js** with **Express.js**
* **MongoDB** (Native MongoDB Driver)
* **bcryptjs** for password hashing
* **jsonwebtoken** for secure token-based authentication
* **dotenv** for environment variable management
* **cors** and **body-parser** middleware
* **nodemailer** and **SMTP** for OTP-based authentication

---

## 🔐 Authentication & OTP Workflow

* **JWT-based login/signup** storing the token in `localStorage`
* On login, **user profile** is fetched and stored in `sessionStorage`
* **Passwords** are securely hashed using **bcryptjs**
* All protected routes verify JWT token with **middleware**
* On signup and login reset, OTP is sent via **SMTP (NodeMailer)** to user email for verification
* OTP is time-bound and verified before completing the action (Signup, Login, Reset Password)

---

## ✨ AI-Generated Blog Summaries

* Integrates **Generative AI API** (custom endpoint)
* Each blog post supports a **"Generate Summary"** feature via **"Summarize"** button
* The API generates **highly relevant summaries** for each blog post
* Summaries are **dynamic** and **real-time**
* Enhances readability and engagement for long blogs

---

## 📂 Key Features

### 👤 User Functionalities:

* Register / Login with role-based support (User/Admin)
* OTP Verification for Signup, Login and Forgot Password
* Create, update, and delete personal blog posts
* Like / Unlike and Save / Unsave blogs
* Add, edit, and delete comments
* View latest comment previews directly on the blog cards
* Filter blogs by category
* Search blogs by title (case-insensitive, partial match)
* AI-based blog summary generation with one click

### 🧑‍💼 Dashboard Features:

* Interactive blog cards with like/save/comment functionality
* Dynamic comment toggle section directly below blog card
* Inline forms (no modal popups) for seamless editing
* Tab views for: **Saved Blogs**, **Liked Blogs**, and **Admin Blogs** (if role = admin)
* Mobile-first responsive layout
* Floating "Create Blog" button with hover animation

### 🛡️ Admin Capabilities:

* View all registered users
* View blog statistics: total blogs, total users, most liked blogs
* Edit and delete any blog
* Promote/demote users to Admin via secure password confirmation
* Delete users (hard or soft delete as per config)
* Role-based admin dashboard access (visible only if `role = admin`)

---

## ⚙️ How It Works

1. **Signup/Login** with email, password and OTP verification
2. **JWT token** is stored in `localStorage` for authentication
3. On success, user profile is fetched and stored in `sessionStorage`
4. **Homepage** lists all blogs
5. Users can create/edit/delete blogs
6. **Admins** can manage users, blogs, and roles 
7. Blog interactions like **like/save/comment** are dynamically handled
8. **Generative AI** API provides summaries on-demand
9. **Admin dashboard** fetches all data and supports edit/delete actions

---

## 📬 Email Functionality (SMTP)

* **OTP Generation** on Signup, Login (optional), and Forgot Password
* Emails are sent using **NodeMailer** configured with **SMTP (Gmail or any provider)**
* OTP is time-sensitive and validated against expiry in backend

---

## 🖼️ UI/UX Highlights

* Fully responsive (mobile, tablet, desktop)
* Blog cards styled using Bootstrap Grid and react icons
* Smooth UI transitions and animations
* Real-time comment toggle and inline interaction
* Quick create blog button
* Admin panel with filtered views and user management
* AI-generated blog summaries on-demand
* Secure password hashing and token-based authentication

---


## 🙌 Contributions

Pull requests are welcome. For major changes, open an issue first to discuss what you would like to change.


## 💬 Let's Connect

* LinkedIn: [Avishkar Mandlik](https://www.linkedin.com/in/avishkar-mandlik-baa357259/)
* GitHub: [AvishkarMandlik](https://github.com/AvishkarMandlik)
* Email: [mandlikavi121@gmail.com](mailto:mandlikavi121@gmail.com)