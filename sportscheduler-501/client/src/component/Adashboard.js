import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, getDocs, deleteDoc, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import "./Adashboard.css";

const Adashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Sports
  const [sportName, setSportName] = useState("");
  const [numPlayers, setNumPlayers] = useState("");
  const [sportsList, setSportsList] = useState([]);

  // Sessions
  const [sessions, setSessions] = useState([]);

  // User role
  const [isAdmin, setIsAdmin] = useState(false);

  const auth = getAuth();

  // --- Check if user is admin ---
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (user) {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setIsAdmin(userDoc.data().role === "admin");
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // --- Fetch sports ---
  const fetchSports = async () => {
    const snapshot = await getDocs(collection(db, "sports"));
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setSportsList(list);
  };

  useEffect(() => {
    fetchSports();
  }, []);

  // --- Fetch sessions ---
  const fetchSessions = async () => {
    const snapshot = await getDocs(collection(db, "sessions"));
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setSessions(list);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  // --- Add sport ---
  const handleAddSport = async () => {
    if (!sportName || !numPlayers) {
      alert("Please fill all fields");
      return;
    }
    try {
      await addDoc(collection(db, "sports"), {
        name: sportName,
        playersRequired: Number(numPlayers),
      });
      setSportName("");
      setNumPlayers("");
      fetchSports();
    } catch (err) {
      console.error(err);
      alert("Failed to add sport");
    }
  };

  // --- Delete sport ---
  const handleDeleteSport = async (id) => {
    if (window.confirm("Are you sure you want to delete this sport?")) {
      await deleteDoc(doc(db, "sports", id));
      fetchSports();
    }
  };

  // --- Delete session ---
  const handleDeleteSession = async (session) => {
    if (window.confirm("Are you sure you want to delete this session?")) {
      await deleteDoc(doc(db, "sessions", session.id));
      fetchSessions();
    }
  };

  return (
    <div className="admin-dashboard-container">
      {/* Hero Section */}
      <div className="dashboard-hero">
        <div className="overlay">
          <h1>Admin Dashboard</h1>
          <p>Manage sports, sessions, and monitor activity.</p>
          <div className="dashboard-buttons">
            <button
              className={activeTab === "overview" ? "active" : ""}
              onClick={() => setActiveTab("overview")}
            >
              Overview
            </button>
            <button
              className={activeTab === "createSport" ? "active" : ""}
              onClick={() => setActiveTab("createSport")}
            >
              Create Sport
            </button>
            <button
              className={activeTab === "availableSessions" ? "active" : ""}
              onClick={() => setActiveTab("availableSessions")}
            >
              Available Sessions
            </button>
          </div>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === "overview" && (
        <div className="overview-section">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Sports</h3>
              <p>{sportsList.length}</p>
            </div>
            <div className="stat-card">
              <h3>Total Sessions</h3>
              <p>{sessions.length}</p>
            </div>
          </div>
        </div>
      )}

      {/* Create Sport Tab */}
      {activeTab === "createSport" && (
        <div className="create-sport-section">
          <div className="card">
            <h2>Add New Sport</h2>
            <input
              type="text"
              placeholder="Sport Name"
              value={sportName}
              onChange={(e) => setSportName(e.target.value)}
            />
            <input
              type="number"
              placeholder="Number of Players Required"
              value={numPlayers}
              onChange={(e) => setNumPlayers(e.target.value)}
            />
            <button onClick={handleAddSport}>Add Sport</button>
          </div>

          <div className="card sports-list-card">
            <h2>Sports List</h2>
            <table className="sports-table">
              <thead>
                <tr>
                  <th>Sport</th>
                  <th>Players Required</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {sportsList.map((sport) => (
                  <tr key={sport.id}>
                    <td>{sport.name}</td>
                    <td>{sport.playersRequired}</td>
                    <td>
                      <button
                        className="delete-btn"
                        onClick={() => handleDeleteSport(sport.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Available Sessions Tab */}
      {activeTab === "availableSessions" && (
        <div className="available-sessions-container">
          <h2>Available Sessions</h2>
          <div className="sessions-grid">
            {sessions.map((session) => (
              <div key={session.id} className="session-card">
                <h3>{session.title}</h3>
                <p><strong>Sport:</strong> {session.sport}</p>
                <p><strong>Description:</strong> {session.description}</p>
                <p><strong>Date:</strong> {session.date} <strong>Time:</strong> {session.time}</p>
                <p><strong>Location:</strong> {session.location}</p>
                <p>
                  <strong>Players:</strong> {(session.joinedPlayers?.length || 0)} / {session.playersRequired || 0}
                </p>

                {/* Delete button: shown for admin or session creator */}
                {auth.currentUser && (isAdmin || session.createdBy === auth.currentUser.uid) && (
                  <button className="delete-btn" onClick={() => handleDeleteSession(session)}>
                    Delete
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Adashboard;
