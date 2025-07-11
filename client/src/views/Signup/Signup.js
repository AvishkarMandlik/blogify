import React, { useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Signup.css';

function Signup() {
  const [username, setuserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);

  async function signupUser() {
    if (!agree) {
      Swal.fire({
        icon: 'warning',
        title: 'Please accept the Terms & Conditions',
        confirmButtonText: 'OK',
      });
      return;
    }

    const response = await axios.post('/signup', {
      username,
      email,
      password,
      role,
    });

    if (response.data.success) {
      Swal.fire({
        icon: 'success',
        title: 'Signup Successful!',
        text: response.data.message,
        confirmButtonText: 'Great!',
      });
      window.location.href = '/Login';
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: response.data.message,
        confirmButtonText: 'OK',
      });
      setuserName('');
      setEmail('');
      setPassword('');
      setRole('');
      setAgree(false);
    }
  }

  return (
    <div className="signup-page d-flex align-items-center justify-content-center bg-black text-white">
      <div className="container-fluid">
        <div className="row justify-content-center shadow-lg rounded-3xl overflow-hidden">
          {/* Left Side Info */}
          <div className="col-md-6 bg-indigo-700 text-white d-flex flex-column justify-content-center p-5">
            <h1 className="display-5 fw-bold mb-3">Welcome to Blogify 🚀</h1>
            <p className="fs-5 mb-4">
              Share your stories, explore ideas, and connect with readers. Blogify makes blogging fun and interactive with likes, comments, and more!
            </p>
            <ul className="ps-3">
              <li className="mb-2">❤️ Like and save blogs</li>
              <li className="mb-2">📝 Create & manage your posts</li>
              <li className="mb-2">🗣️ Engage with other bloggers</li>
            </ul>
          </div>

          {/* Right Side Form */}
          <div className="col-md-6 d-flex align-items-center justify-content-center p-4">
            <div className="signup-card w-100 p-4 shadow">
              <h3 className="text-center text-dark fw-bold mb-4">Signup</h3>

              <form className="text-dark">
                {/* Username */}
                <div className="mb-3 input-group">
                  <span className="input-group-text"><FaUser /></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter your username"
                    required
                    value={username}
                    onChange={(e) => setuserName(e.target.value)}
                  />
                </div>

                {/* Email */}
                <div className="mb-3 input-group">
                  <span className="input-group-text"><FaEnvelope /></span>
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Enter your email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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

                {/* Terms Checkbox */}
                <div className="form-check mb-3">
                  <input
                    type="checkbox"
                    className="form-check-input"
                    id="terms"
                    checked={agree}
                    onChange={() => setAgree(!agree)}
                  />
                  <label htmlFor="terms" className="form-check-label">
                    I accept all terms & conditions
                  </label>
                </div>

                {/* Submit */}
                <button
                  type="button"
                  className="btn btn-dark w-100"
                  onClick={signupUser}
                >
                  Register Now
                </button>

                {/* Redirect */}
                <div className="text-center mt-3">
                  Already have an account?{' '}
                  <Link to="/" className="text-primary fw-bold">
                    Login now
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

export default Signup;
