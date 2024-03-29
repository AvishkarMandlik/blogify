import React, { useState,useEffect } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2';
import { Link } from 'react-router-dom';
import { currentUser } from '../../util/currentUser';
import './Login.css'
function Login() {

    const [login, setLogin] = useState('')
    const [password, setPassword] = useState('')

    useEffect(() => {
        if (currentUser) {
            window.location.href = "/"
        }
    }, [])

    async function loginUser() {
        let postData = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (emailRegex.test(login)) {
            postData = {
                email: login,
                password: password
            };
        } else {
            postData = {
                username: login,
                password: password
            };
        }
        const response = await axios.post('/login', postData)
        if (response.data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Login Successful!',
                text: response.data.message,
                confirmButtonText: 'Great!'
              });
              localStorage.setItem('currentUser', JSON.stringify(response.data.data));
              window.location.href = "/"
        }
        else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: response.data.message,
                confirmButtonText: 'Try Again!'
              });
            setLogin("")
            setPassword("")
            localStorage.removeItem('currentUser');
         }
    }

    return (
        <div className="main">
        <div className="login-container">
        <div className="forms">
        <link rel="stylesheet" href="https://unicons.iconscout.com/release/v4.0.0/css/line.css"></link>
            <div className="loginform login">
                <span className="title">Login</span>
                <form action="#">
                    <div className="input-field">
                        <input type="text" placeholder="Enter your email or username" required value={login} onChange={(e) => setLogin(e.target.value)}/>
                        <i className="uil uil-user"></i>
                    </div>

                    <div className="input-field">
                        <input type="password" className="password" placeholder="Enter your password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        <i className="uil uil-lock icon"></i>
                        <i className="uil uil-eye-slash showHidePw"></i>
                    </div>

                    <div className="checkbox-text">
                        <div className="checkbox-content">
                            <input type="checkbox" id="logCheck"/>
                            <label htmlFor="logCheck" className="text">Remember me</label>
                        </div>
                        <Link to="#" className="text">Forgot password?</Link>
                    </div>
                    <div className="input-field button">
                        <input type="button" value="Login Now" onClick={loginUser}/>
                    </div>
                </form>

                <div className="login-signup">
                    <span className="text">Not a member?
                       <Link to='./../Signup' className="text signup-link">Signup now</Link>
                    </span>
                </div>
            </div>
        </div>
    </div>
    </div>
    )
}

export default Login