import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import { FaUser, FaLock, FaEye, FaEyeSlash } from 'react-icons/fa';
import { getUserProfile } from '../../util/getUserProfile';
import 'bootstrap/dist/css/bootstrap.min.css';

function Login() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [step, setStep] = useState(1);

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

  const handleForgotPassword = async () => {
    try {
      const res = await axios.post('/send-reset-otp', { email: forgotEmail });
      if (res.data.success) {
        Swal.fire('OTP Sent', 'Check your email for the OTP.', 'success');
        setStep(2);
      } else {
        Swal.fire('Error', res.data.message, 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Something went wrong. Try again.', 'error');
    }
  };

  const verifyResetOtp = async () => {
    try {
      const res = await axios.post('/verify-reset-otp', { email: forgotEmail, otp, newPassword });
      if (res.data.success) {
        Swal.fire('Password Reset', 'You can now login with your new password.', 'success');
        setShowForgotModal(false);
        setStep(1);
        setForgotEmail('');
        setOtp('');
        setNewPassword('');
      } else {
        Swal.fire('Error', res.data.message, 'error');
      }
    } catch (err) {
      Swal.fire('Error', 'Failed to reset password.', 'error');
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
              Login to <strong>Blogify</strong> and continue your blogging journey.
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
                <div className="mb-3 input-group">
                  <span className="input-group-text"><FaUser /></span>
                  <input type="text" className="form-control" placeholder="Enter your email or username" required value={login} onChange={(e) => setLogin(e.target.value)} />
                </div>
                <div className="mb-3 input-group">
                  <span className="input-group-text"><FaLock /></span>
                  <input type={showPassword ? 'text' : 'password'} className="form-control" placeholder="Enter your password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  <span className="input-group-text" style={{ cursor: 'pointer' }} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                <div className="d-flex justify-content-between">
                  <button type="button" className="btn btn-link p-0" onClick={() => setShowForgotModal(true)}>Forgot Password?</button>
                </div>
                <button type="button" className="btn btn-dark w-100" onClick={loginUser}>Login Now</button>
                <div className="text-center mt-3">
                  Not a member? <Link to="/Signup" className="text-primary fw-bold">Signup now</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      <Modal show={showForgotModal} onHide={() => setShowForgotModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Reset Password</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {step === 1 && (
            <>
              <p>Enter your registered email to receive OTP:</p>
              <input type="email" className="form-control mb-2" value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="Enter your email" />
              <Button variant="primary" className='bg-dark' onClick={handleForgotPassword}>Send OTP</Button>
            </>
          )}
          {step === 2 && (
            <>
              <p>Enter the OTP sent to your email and your new password:</p>
              <input type="number" className="form-control mb-2 " maxLength={4} placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} />
              <input type="password" className="form-control mb-2" placeholder="New Password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
              <Button variant="dark" onClick={verifyResetOtp}>Reset Password</Button>
            </>
          )}
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Login;
