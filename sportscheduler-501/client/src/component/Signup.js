import React, { useState } from 'react';
import { FaUser, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaShieldAlt } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import { auth, db } from '../firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import './Signup.css';

export default function Signup() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'player',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      // Create user
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      // Update Firebase Auth profile with displayName
      await updateProfile(user, {
        displayName: formData.name,
      });

      // Store in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        createdAt: serverTimestamp(),
      });

      setSuccess("Account created successfully! Redirecting...");

      // Redirect based on role
      setTimeout(() => {
        if (formData.role === "admin") {
          navigate("/adashboard");
        } else {
          navigate("/dashboard");
        }
      }, 1500);

    } catch (err) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-card">
        <FaShieldAlt className="signup-icon" />
        <h2 className="signup-title">Create Account</h2>
        <p className="signup-subtitle">Join SportScheduler and start organizing games</p>

        {success && <div className="success-msg">{success}</div>}
        {error && <div className="error-msg">{error}</div>}

        <form className="signup-form" onSubmit={handleSubmit}>
          <div className="input-group">
            <FaUser className="input-icon" />
            <input
              type="text"
              name="name"
              placeholder="Enter your full name"
              value={formData.name || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <FaEnvelope className="input-icon" />
            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email || ""}
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group password-group">
            <FaLock className="input-icon" />
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Enter your password"
              value={formData.password || ""}
              onChange={handleChange}
              required
            />
            <span className="eye-icon" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>

          <label className="dropdown-label">Account Type</label>
          <select
            name="role"
            value={formData.role || "player"}
            onChange={handleChange}
            className="input-group"
          >
            <option value="player">Player</option>
            <option value="admin">Administrator</option>
          </select>

          <button type="submit" className="signup-btn" disabled={loading}>
            {loading ? 'Processing...' : 'Create Account'}
          </button>
        </form>

        <div className="signin-link">
          Already have an account?{" "}
          <Link to="/login" className="signin-link-text">
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
