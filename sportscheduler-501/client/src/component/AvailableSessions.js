import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaSearch, FaUsers, FaCalendarAlt, FaClock } from "react-icons/fa";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import "./AvailableSessions.css";

const AvailableSessions = () => {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedSport, setSelectedSport] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

  // Fetch sessions from Firestore
  const fetchSessions = async () => {
    const q = query(collection(db, "sessions"));
    const querySnapshot = await getDocs(q);
    const sessionsData = [];
    querySnapshot.forEach((docSnap) => {
      sessionsData.push({ id: docSnap.id, ...docSnap.data() });
    });
    setSessions(sessionsData);
    setFilteredSessions(sessionsData);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // Handle search and filters
  useEffect(() => {
    let filtered = [...sessions];

    if (searchText) {
      filtered = filtered.filter((s) =>
        s.title.toLowerCase().includes(searchText.toLowerCase())
      );
    }

    if (selectedSport !== "All") {
      filtered = filtered.filter((s) => s.sport === selectedSport);
    }

    if (selectedStatus !== "All") {
      filtered = filtered.filter((s) => s.status === selectedStatus.toLowerCase());
    }

    setFilteredSessions(filtered);
  }, [searchText, selectedSport, selectedStatus, sessions]);

  // Join session
  const handleJoinSession = async (sessionId, joinedPlayers) => {
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in to join a session");

    if (joinedPlayers.includes(user.uid)) {
      return alert("You already joined this session!");
    }

    try {
      const sessionRef = doc(db, "sessions", sessionId);
      await updateDoc(sessionRef, {
        joinedPlayers: [...joinedPlayers, user.uid],
      });

      alert("You have successfully joined the session!");
      fetchSessions(); // refresh sessions
    } catch (err) {
      console.error("Error joining session:", err);
      alert("Failed to join session");
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">SportsScheduler</div>
        <div className="nav-links">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/create-session")}>Create Session</button>
          <button onClick={() => navigate("/profile")}>Profile</button>
        </div>
      </nav>

      {/* Page Title */}
      <div className="available-header">
        <h1>Available Sessions</h1>
        <p>Browse and join available sports sessions</p>
      </div>

      {/* Filters Row */}
      <div className="filters-row">
        <div className="search-bar">
          <FaSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by session title"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
          />
        </div>

        <div className="filter-dropdown">
          <select
            value={selectedSport}
            onChange={(e) => setSelectedSport(e.target.value)}
          >
            <option>All</option>
            <option>Football</option>
            <option>Basketball</option>
            <option>Cricket</option>
            <option>Volleyball</option>
            <option>Tennis</option>
            <option>Kabaddi</option>
          </select>
        </div>

        <div className="filter-dropdown">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option>All</option>
            <option>Open</option>
            <option>Full</option>
            <option>Cancelled</option>
          </select>
        </div>
      </div>

      {/* Sessions Grid */}
      <div className="sessions-grid">
  {filteredSessions.length > 0 ? (
    filteredSessions.map((session) => {
      const players = session.players || []; // default empty array
      const joinedPlayers = session.joinedPlayers || []; // default empty array

      return (
        <div key={session.id} className="session-card">
          <h3>{session.title}</h3>
          <p><strong>Sport:</strong> {session.sport}</p>
          <p><strong>Description:</strong> {session.description}</p>
          <p>
            <FaCalendarAlt /> {session.date} <FaClock /> {session.time}
          </p>
          <p><strong>Location:</strong> {session.location}</p>
          <p>
            <FaUsers /> Players: {players.length + (session.additionalPlayers || 0)}
          </p>
          <p>
            <strong>Joined Players:</strong>{" "}
            {joinedPlayers.length > 0 ? joinedPlayers.join(", ") : "None"}
          </p>
          <button
            onClick={() => handleJoinSession(session.id, joinedPlayers)}
            disabled={joinedPlayers.includes(auth.currentUser?.uid)}
          >
            {joinedPlayers.includes(auth.currentUser?.uid) ? "Joined" : "Join"}
          </button>
        </div>
      );
    })
  ) : (
    <p>No sessions available</p>
  )}
</div>

    </div>
  );
};

export default AvailableSessions;
