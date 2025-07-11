import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { getUserProfile } from '../../util/getUserProfile';
import 'bootstrap/dist/css/bootstrap.min.css';

function Login() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      window.location.href = "/home";
    }
  }, []);

  const loginUser = async () => {
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(login);
    const postData = isEmail ? { email: login, password } : { username: login, password };

    try {
      const response = await axios.post('/login', postData);

      if (response.data.success) {
        const { token } = response.data.data;
        localStorage.setItem("token", token);
        const user = await getUserProfile();

        if (!user) throw new Error("Failed to fetch user data");

        Swal.fire({
          icon: 'success',
          title: 'Login Successful!',
          text: `Welcome, ${user.username}!`,
          confirmButtonText: 'Continue',
        }).then(() => {
          window.location.href = "/home";
        });
      } else {
        throw new Error(response.data.message);
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: err.message || 'Login failed',
      });
      setLogin('');
      setPassword('');
      localStorage.removeItem("token");
    }
  };

  return (
    <div className="signup-page d-flex align-items-center justify-content-center bg-black text-white">
      <div className="container-fluid">
        <div className="row justify-content-center shadow-lg rounded-3xl overflow-hidden">
          {/* Left Side Info */}
          <div className="col-md-6 bg-indigo-700 text-white d-flex flex-column justify-content-center p-5">
            <h1 className="display-5 fw-bold mb-3">Welcome Back 👋</h1>
            <p className="fs-5 mb-4">
              Login to <strong>Blogify</strong> and continue your blogging journey. Share, engage, and explore the latest blogs with ease.
            </p>
            <ul className="ps-3">
              <li className="mb-2">🔐 Secure account login</li>
              <li className="mb-2">📚 Access saved & liked blogs</li>
              <li className="mb-2">⚙️ Manage your posts easily</li>
            </ul>
          </div>

          {/* Right Side Form */}
          <div className="col-md-6 d-flex align-items-center justify-content-center p-4">
            <div className="signup-card w-100 p-4 shadow">
              <h3 className="text-center text-dark fw-bold mb-4">Login</h3>

              <form className="text-dark">
                {/* Username or Email */}
                <div className="mb-3 input-group">
                  <span className="input-group-text"><FaUser /></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your email or username"
                    required
                    value={login}
                    onChange={(e) => setLogin(e.target.value)}
                  />
                </div>

                {/* Password */}
                <div className="mb-3 input-group">
                  <span className="input-group-text"><FaLock /></span>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    className="form-control"
                    placeholder="Enter your password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <span
                    className="input-group-text"
                    style={{ cursor: 'pointer' }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>

                {/* Submit */}
                <button
                  type="button"
                  className="btn btn-dark w-100"
                  onClick={loginUser}
                >
                  Login Now
                </button>

                {/* Redirect */}
                <div className="text-center mt-3">
                  Not a member?{' '}
                  <Link to="/Signup" className="text-primary fw-bold">
                    Signup now
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
