import React from "react";
import { Link } from "react-router-dom";
import { auth } from "../firebase";

const Navbar = () => {
  const handleLogout = () => {
    auth.signOut();
  };

  return (
    <nav
      style={{
        background: "#BADFD7",
        color: "#fff",
        padding: "12px 20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", gap: "20px" }}>
        <Link
          to="/create-session"
          style={{ color: "white", textDecoration: "none" }}
        >
          Create Session
        </Link>
        <Link
          to="/available-sessions"
          style={{ color: "white", textDecoration: "none" }}
        >
          Available Sessions
        </Link>
      </div>

      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <Link to="/profile" style={{ color: "white", textDecoration: "none" }}>
          Profile
        </Link>
      </div>
    </nav>
  );
};

export default Navbar;
