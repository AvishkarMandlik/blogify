import React, { useState, useEffect } from 'react'
import { currentUser } from '../../util/currentUser';
import Swal from 'sweetalert2';

import axios from 'axios'
import './Signup.css'
import { Link } from 'react-router-dom';
function Signup() {
    const [username, setuserName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [role, setRole] = useState('user')

    useEffect(() => {
        if(currentUser){
            window.location.href="/"
        }
    },[])

    async function signupUser() {
        const response = await axios.post('/signup', {
            username: username,
            email: email,
            password: password,
            role: role
        })
        console.log(response.data)
        if (response.data.success) {
            Swal.fire({
                icon: 'success',
                title: 'Signup Successful!',
                text: response.data.message,
                confirmButtonText: 'Great!',
              });
              localStorage.setItem('currentUser', JSON.stringify(response.data.data));
              window.location.href = '/'
        }
        else {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: response.data.message,
                confirmButtonText: 'OK'
              });
            setuserName('')
            setEmail('')
            setPassword('')
            setRole('')
        }
    }

    return (
        <div className="main">
        <div className="Signup-container">
        <div className="signupforms">
        <link rel="stylesheet" href="https://unicons.iconscout.com/release/v4.0.0/css/line.css"></link>
            <div className="signupform login">
                <span className="title">Signup</span>
                <form>
                    <div className="input-field">
                        <input type="text" placeholder="Enter your username" required value={username} onChange={(e) => setuserName(e.target.value)}/>
                        <i className="uil uil-user"></i>
                    </div>

                    <div className="input-field">
                        <input type="text" placeholder="Enter your email" required value={email} onChange={(e) => setEmail(e.target.value)}/>
                        <i className="uil uil-envelope"></i>
                    </div>

                    <div className="input-field">
                        <input type="password" className="password" placeholder="Enter your password" required value={password} onChange={(e) => setPassword(e.target.value)} />
                        <i className="uil uil-lock icon"></i>
                        <i className="uil uil-eye-slash showHidePw"></i>
                    </div>

                    <div className="checkbox-text">
                        <div className="checkbox-content">
                            <input type="checkbox" id="signCheck"/>
                            <label htmlFor="signCheck" className="text">I accept all terms & conditions</label>
                        </div>
                    </div>
                    <div className="input-field button">
                        <input type="button" value="Register Now" onClick={signupUser}/>
                    </div>
                </form>

                <div className="signup-login">
                    <span className="text">Already have an account?
                       <Link to='./../Login' className="text signup-link">Login now</Link>
                    </span>
                </div>
            </div>
        </div>
    </div>
    </div>
    )
}

export default Signup