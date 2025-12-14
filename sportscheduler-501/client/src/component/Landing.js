
// Dashboard.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "./Landing.css";

const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">🏀 SportScheduler</div>
        <div className="nav-links">
          <button onClick={() => navigate("/login")}>Login</button>
          <button onClick={() => navigate("/signup")}>Signup</button>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="hero-section">
        <div className="hero-content">
          <h1>Organize, Play, and Win!</h1>
          <p>
            Join, play, and grow your game — discover new sports, organize matches, and stay active with your team anytime, anywhere.
          </p>
          <button className="get-started" onClick={() => navigate("/signup")}>
            Get Started
          </button>
        </div>
      </header>

      {/* Sports Section */}
      <section className="sports-section">
        <h2>Why Choose SportScheduler?</h2>
        <div className="features">
          <div className="feature-card">
            <h3>⚽ Easy Scheduling</h3>
            <p>Set up matches, practices, or events in just a few clicks.</p>
          </div>
          <div className="feature-card">
            <h3>🏆 Track Progress</h3>
            <p>View stats, completed sessions, and your performance.</p>
          </div>
          <div className="feature-card">
            <h3>🤝 Team Collaboration</h3>
            <p>Invite teammates and manage player participation easily.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© {new Date().getFullYear()} SportScheduler. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
