import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Registration from "./Registration";

function Login() {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password: pass }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        alert("Login successful");
        navigate("/home");
      } else {
        alert(data.message || "Login failed");
      }
    } catch (error) {
      alert("An error occurred");
    }
  };

  return (
    <>
      <div className="auth-container">
        <h1><b>EventHub</b></h1>
        <h2>Welcome Back!</h2>
        <p className="subtitle">Sign in to discover and manage exciting events</p>

        <label>Email Address:</label>
        <input type="email" name="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter Email address" /><br />

        <label>Password:</label>
        <input
          type="password"
          name="password"
          onChange={(e) => setPass(e.target.value)}
          placeholder="Enter Password"
        /><br />

        <button className="eventhub-btn" onClick={handleLogin}>
          Sign in to EventHub
        </button>

        <p className="bottom-text">
          Don’t have an account? <Link to="/Registration">Sign Up</Link>
        </p>
      </div>

      <style>{`
        body {
          background: linear-gradient(135deg, #F3E8FF 0%, #EDE9FE 100%);
          font-family: 'Poppins', sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
        }

        .auth-container {
          background: #ffffff;
          padding: 50px 60px;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
          text-align: center;
          width: 420px;
          transition: all 0.3s ease;
        }

        .auth-container:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 45px rgba(139, 92, 246, 0.25);
        }

        h1 {
          color: #8B5CF6;
          font-size: 40px;
          margin-bottom: 8px;
          letter-spacing: 1px;
        }

        h2 {
          color: #7C3AED;
          font-size: 22px;
          margin-top: 0;
          margin-bottom: 5px;
        }

        .subtitle {
          color: #A78BFA;
          font-size: 15px;
          margin-bottom: 30px;
        }

        label {
          display: block;
          text-align: left;
          margin-left: 35px;
          font-weight: 600;
          color: #4C1D95;
          font-size: 15px;
        }

        input {
          display: block;
          margin: 10px auto 20px;
          padding: 12px 18px;
          border: 1px solid #EDE9FE;
          border-radius: 25px;
          width: 80%;
          font-size: 15px;
          outline: none;
          background: #fff;
          transition: all 0.3s ease;
        }

        input:focus {
          border-color: #8B5CF6;
          box-shadow: 0 0 6px rgba(139, 92, 246, 0.3);
        }

        .eventhub-btn {
          padding: 12px 32px;
          border: none;
          border-radius: 30px;
          background: linear-gradient(90deg, #8B5CF6, #A78BFA);
          color: white;
          font-size: 16px;
          letter-spacing: 0.5px;
          cursor: pointer;
          font-weight: 600;
          transition: all 0.3s ease;
          margin-top: 10px;
        }

        .eventhub-btn:hover {
          transform: scale(1.05);
          box-shadow: 0 5px 18px rgba(139, 92, 246, 0.4);
        }

        .bottom-text {
          margin-top: 20px;
          font-size: 14px;
          color: #6B7280;
        }

        a {
          color: #8B5CF6;
          text-decoration: none;
          font-weight: 600;
        }

        a:hover {
          text-decoration: underline;
        }

        @media (max-width: 600px) {
          .auth-container {
            width: 90%;
            padding: 35px 20px;
          }

          h1 {
            font-size: 32px;
          }

          h2 {
            font-size: 18px;
          }
        }
      `}</style>
    </>
  );
}

export default Login;
