import React ,{useState} from "react";
import Login from "./Login";
import { Link, useNavigate } from "react-router-dom";

function Registration() {

    const navigate = useNavigate();
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [phone, setPhone] = useState('')
    const [pass, setPass] = useState('')
    const [cpass, setCpass] = useState('')

    const handleRegister = async () => {
      if (pass !== cpass) {
          alert("Passwords do not match");
          return;
      }

      if (!name.trim()) {
        alert("Full name is required");
        return;
      }

      const phonePattern = /^[0-9]{10}$/;
      if (!phonePattern.test(phone)) {
        alert("Enter a valid 10-digit phone number");
        return;
      }

      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        alert("Enter a valid email address");
        return;
      }

      try {
        const response = await fetch('http://localhost:5000/api/auth/register', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            full_name: name,
            email,
            phone,
            password: pass,
          }),
        });

        const data = await response.json();

        if (response.ok) {
          localStorage.setItem('token', data.token);
          alert("Registration successful");
          navigate("/");
        } else {
          alert(data.message || "Registration failed");
        }
      } catch (error) {
        alert("An error occurred");
      }
    };

    return(
        <>
        <div className="register-container">
            <h1><b>EventHub</b></h1>
            <h2>Join EventHub</h2>
            <p className="subtitle">Create your account and start exploring</p>

            <div className="form-group">
              <label>Full Name:</label>
              <input type="name" name="name" onChange={(e) => setName(e.target.value)}  placeholder="Enter full name"></input>
            </div>

            <div className="form-group">
              <label>Email:</label>
              <input type="email" name="email" onChange={(e) => setEmail(e.target.value)}  placeholder="Enter your email address"></input>
            </div>

            <div className="form-group">
              <label>Phone Number:</label>
              <input type="number" name="number" onChange={(e) => setPhone(e.target.value)} placeholder="Enter phone number"></input>
            </div>

            <div className="form-group">
              <label>Password:</label>
              <input type="password" name="password" onChange={(e) => setPass(e.target.value)} placeholder="Enter password"></input>
            </div>

            <div className="form-group">
              <label>Confirm Password:</label>
              <input type="password" name="cpassword" onChange={(e) => setCpass(e.target.value)} placeholder="Confirm your password"></input>
            </div>

            <button 
            style={{
              padding: '12px 32px',
              border: 'none',
              borderRadius: '30px',
              background: 'linear-gradient(90deg, #e94057, #f27121)',
              color: 'white',
              fontSize: '16px',
              letterSpacing: '0.5px',
              cursor: 'pointer',
              fontWeight: '600',
              marginTop: '15px',
              transition: 'all 0.3s ease'
            }}
            onClick={handleRegister}>Create My Account</button><br/>
            <p className="signin-text">Already have an account? <Link to= "/">Sign In</Link></p>
        </div>

        {/* 💫 Elegant, balanced styling */}
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

          .register-container {
            background: #ffffff;
            padding: 50px 60px;
            border-radius: 20px;
            box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            text-align: center;
            width: 520px;
            transition: all 0.3s ease;
          }

          .register-container:hover {
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

          .form-group {
            display: flex;
            align-items: center;
            justify-content: space-between;
            margin: 14px 0;
            padding: 0 10px;
          }

          .form-group label {
            flex: 1;
            text-align: left;
            font-weight: 600;
            color: #4C1D95;
            font-size: 15px;
            margin-right: 10px;
          }

          .form-group input {
            flex: 2;
            padding: 12px 16px;
            border: 1px solid #EDE9FE;
            border-radius: 30px;
            font-size: 15px;
            outline: none;
            transition: all 0.3s ease;
          }

          .form-group input:focus {
            border-color: #8B5CF6;
            box-shadow: 0 0 6px rgba(139, 92, 246, 0.4);
          }

          button:hover {
            transform: scale(1.05);
            box-shadow: 0 5px 18px rgba(139, 92, 246, 0.4);
          }

          .signin-text {
            font-size: 14px;
            color: #6B7280;
            margin-top: 20px;
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
            .register-container {
              width: 90%;
              padding: 35px 20px;
            }

            .form-group {
              flex-direction: column;
              align-items: flex-start;
            }

            .form-group input {
              width: 100%;
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

export default Registration;
