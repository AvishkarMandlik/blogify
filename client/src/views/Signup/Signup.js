import React, { useState } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { Modal, Button } from 'react-bootstrap';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaRedo } from 'react-icons/fa';
import 'bootstrap/dist/css/bootstrap.min.css';
import './Signup.css';

function Signup() {
  const [username, setuserName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [showPassword, setShowPassword] = useState(false);
  const [agree, setAgree] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [resendDisabled, setResendDisabled] = useState(false);

  async function signupUser() {
    if (!agree) {
      Swal.fire({ icon: 'warning', title: 'Please accept the Terms & Conditions' });
      return;
    }

    try {
      const response = await axios.post('/signup', { username, email, password, role });
      if (response.data.success) {
        setShowOtpModal(true);
        Swal.fire({ icon: 'success', title: 'OTP Sent!', text: 'Check your email for the OTP.' });
      } else {
        Swal.fire({ icon: 'error', title: 'Signup Failed', text: response.data.message });
        resetForm();
      }
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Server Error', text: 'Something went wrong. Try again.' });
    }
  }

  async function verifyOtp() {
    try {
      const res = await axios.post('/verify-otp', { email, otp });
      if (res.data.success) {
        Swal.fire({ icon: 'success', title: 'Verified!', text: res.data.message });
        setShowOtpModal(false);
        resetForm();
        window.location.href = '/login';
      } else {
        setOtpError(res.data.message);
      }
    } catch (err) {
      setOtpError('Server error. Please try again.');
    }
  }

  async function resendOtp() {
    try {
      setResendDisabled(true);
      const res = await axios.post('/resend-otp', { email });
      if (res.data.success) {
        Swal.fire({ icon: 'info', title: 'OTP Resent', text: res.data.message });
        setOtpError('');
      } else {
        setOtpError(res.data.message);
      }
      setTimeout(() => setResendDisabled(false), 10000);
    } catch {
      setOtpError('Failed to resend OTP. Try again.');
      setTimeout(() => setResendDisabled(false), 10000);
    }
  }

  function resetForm() {
    setuserName('');
    setEmail('');
    setPassword('');
    setRole('user');
    setAgree(false);
    setOtp('');
    setOtpError('');
  }

  return (
    <div className="signup-page d-flex align-items-center justify-content-center bg-black text-white">
      <div className="container-fluid">
        <div className="row justify-content-center shadow-lg rounded-3xl overflow-hidden">
          <div className="col-md-6 bg-indigo-700 text-white d-flex flex-column justify-content-center p-5">
            <h1 className="display-5 fw-bold mb-3">Welcome to Blogify 🚀</h1>
            <p className="fs-5 mb-4">
              Share your stories, explore ideas, and connect with readers. Blogify makes blogging fun and interactive!
            </p>
            <ul className="ps-3">
              <li className="mb-2">❤️ Like and save blogs</li>
              <li className="mb-2">📝 Create & manage your posts</li>
              <li className="mb-2">🗣️ Engage with other bloggers</li>
            </ul>
          </div>

          <div className="col-md-6 d-flex align-items-center justify-content-center p-4">
            <div className="signup-card w-100 p-4 shadow">
              <h3 className="text-center text-dark fw-bold mb-4">Signup</h3>
              <form className="text-dark">
                <div className="mb-3 input-group">
                  <span className="input-group-text"><FaUser /></span>
                  <input type="text" className="form-control" placeholder="Enter your username" required value={username} onChange={(e) => setuserName(e.target.value)} />
                </div>
                <div className="mb-3 input-group">
                  <span className="input-group-text"><FaEnvelope /></span>
                  <input type="email" className="form-control" placeholder="Enter your email" required value={email} onChange={(e) => setEmail(e.target.value)} />
                </div>
                <div className="mb-3 input-group">
                  <span className="input-group-text"><FaLock /></span>
                  <input type={showPassword ? 'text' : 'password'} className="form-control" placeholder="Enter your password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  <span className="input-group-text" style={{ cursor: 'pointer' }} onClick={() => setShowPassword(!showPassword)}>
                    {showPassword ? <FaEyeSlash /> : <FaEye />}
                  </span>
                </div>
                <div className="form-check mb-3">
                  <input type="checkbox" className="form-check-input" id="terms" checked={agree} onChange={() => setAgree(!agree)} />
                  <label htmlFor="terms" className="form-check-label">I accept all terms & conditions</label>
                </div>
                <button type="button" className="btn btn-dark w-100" onClick={signupUser}>Register Now</button>
                <div className="text-center mt-3">
                  Already have an account? <Link to="/" className="text-primary fw-bold">Login now</Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* OTP Modal */}
      <Modal show={showOtpModal} onHide={() => setShowOtpModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>OTP Verification</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-muted">Enter the 4-digit OTP sent to your email.</p>
          <input
            type="text"
            className="form-control mb-2"
            maxLength={4}
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
          />
          {otpError && <p className="text-danger small">{otpError}</p>}
          <div className="d-flex justify-content-between align-items-center">
            <Button variant="primary" onClick={verifyOtp}>Verify</Button>
            <Button variant="outline-secondary" onClick={resendOtp} disabled={resendDisabled}>
              <FaRedo className="me-1" /> Resend OTP
            </Button>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Signup;