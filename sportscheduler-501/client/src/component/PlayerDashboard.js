import React, { useState, useEffect } from "react";
import { FaCalendarAlt, FaClock, FaUserPlus, FaUsers, FaSearch } from "react-icons/fa";
import { db, auth } from "../firebase";
import { useNavigate } from "react-router-dom";

import {
  collection,
  addDoc,
  getDocs,
  updateDoc,
  doc,
  serverTimestamp,
  arrayUnion,
  query,
} from "firebase/firestore";
import "./PlayerDashboard.css";

const PlayerDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("welcome");

  // --- Create Session State ---
  const [sessionTitle, setSessionTitle] = useState("");
  const [sport, setSport] = useState("Football");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [venue, setVenue] = useState("");
  const [players, setPlayers] = useState([{ name: "" }]);
  const [additionalPlayers, setAdditionalPlayers] = useState(0);

  const sessionSummary = {
    date: date || "No date set",
    time: time || "No time set",
    location: venue || "No location set",
    confirmedPlayers: players.filter((p) => p.name).length,
    sportInfo: `${sport} requires ${
      sport === "Football" || sport === "Cricket"
        ? 22
        : sport === "Basketball"
        ? 10
        : sport === "Volleyball"
        ? 11
        : sport === "Tennis"
        ? 2
        : sport === "Kabaddi"
        ? 11
        : "N/A"
    } players`,
  };

  const handlePlayerChange = (index, value) => {
    const newPlayers = [...players];
    newPlayers[index].name = value;
    setPlayers(newPlayers);
  };

  const addPlayer = () => setPlayers([...players, { name: "" }]);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in to create a session");

    try {
      await addDoc(collection(db, "sessions"), {
        title: sessionTitle,
        sport,
        description,
        date,
        time,
        location: venue,
        players,
        additionalPlayers,
        createdAt: serverTimestamp(),
        createdBy: user.uid,
        status: "open",
        joinedPlayers: [],
      });

      alert("Session created successfully!");

      // Reset form
      setSessionTitle("");
      setSport("Football");
      setDescription("");
      setDate("");
      setTime("");
      setVenue("");
      setPlayers([{ name: "" }]);
      setAdditionalPlayers(0);
    } catch (err) {
      console.error("Error creating session: ", err);
      alert("Failed to create session");
    }
  };

  // --- Available Sessions State ---
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [selectedSport, setSelectedSport] = useState("All");
  const [selectedStatus, setSelectedStatus] = useState("All");

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

  useEffect(() => {
    let filtered = [...sessions];
    if (searchText) {
      filtered = filtered.filter((s) =>
        (s.title || "").toLowerCase().includes(searchText.toLowerCase())
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

  const handleJoinSession = async (session) => {
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in to join a session");

    const maxPlayers = (session.players?.length || 0) + (session.additionalPlayers || 0);
    const slotsLeft = maxPlayers - (session.joinedPlayers?.length || 0);
    if (slotsLeft <= 0) return alert("Session is full!");

    try {
      const sessionRef = doc(db, "sessions", session.id);
      await updateDoc(sessionRef, {
        joinedPlayers: arrayUnion({
          uid: user.uid,
          name: user.displayName || "Anonymous",
        }),
      });
      alert("Successfully joined session!");
      fetchSessions();
    } catch (err) {
      console.error("Error joining session:", err);
      alert("Failed to join session. Check Firestore rules.");
    }
  };

  return (
    <div>
      {/* Navbar */}
      <nav className="navbar">
        <div className="nav-links">
          <button onClick={() => navigate("/profile")}>Profile</button>
        </div>
        <div className="logo">SportsScheduler
          <img src="https://i.postimg.cc/8k48NwNr/unnamed-removebg-preview.png" alt="Logo" height="50px" width="50px" />
          </div>

      </nav>

      <div className="dashboard-container">
        {activeTab === "welcome" && (
          <div className="welcome-section">
            <h1>Welcome to the Sports Scheduler</h1>
            <p>
              As a player, you can create sessions, join available sessions, and manage
              your profile. 

              <pre>Stay active and join games with your community!</pre>
            </p>
            <div className="dashboard-buttons">
              <button onClick={() => setActiveTab("create")}>Create Session</button>
              <button onClick={() => setActiveTab("available")}>Available Sessions</button>
            </div>
          </div>
        )}

        {activeTab === "create" && (
          <div className="create-session-card">
            <h2>Create Session</h2>
            <form onSubmit={handleCreateSession}>
              <label>Session Title</label>
              <input
                type="text"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
                placeholder="Enter session title" required
              />

              <label>Sport</label>
              <select value={sport} onChange={(e) => setSport(e.target.value)} required>
                <option>Football</option>
                <option>Basketball</option>
                <option>Cricket</option>
                <option>Volleyball</option>
                <option>Tennis</option>
                <option>Kabaddi</option>
              </select>

              <label>Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Brief description" required
              />

              <label>Date</label>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} required />

              <label>Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required/>

              <label>Venue</label>
              <input type="text" value={venue} onChange={(e) => setVenue(e.target.value)} required/>

              <div>
                <label>Players</label>
                {players.map((p, i) => (
                  <div key={i}>
                    <input
                      type="text"
                      value={p.name}
                      onChange={(e) => handlePlayerChange(i, e.target.value)}
                      placeholder="Enter player name"
                    />
                    {i === players.length - 1 && (
                      <button type="button" onClick={addPlayer}>
                        <FaUserPlus />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <label>Additional Players Needed</label>
              <input
                type="number"
                value={additionalPlayers}
                onChange={(e) => setAdditionalPlayers(Number(e.target.value))}
              />

              <h4>Session Summary</h4>
              <div className="session-summary">
              <p>
                <FaCalendarAlt /> Date: {sessionSummary.date} <FaClock /> Time: {sessionSummary.time}
              </p>
              <p>Location: {sessionSummary.location}</p>
              <p>
                <FaUsers /> Confirmed Players: {sessionSummary.confirmedPlayers}
              </p>
              <p>{sessionSummary.sportInfo}</p>
              </div>

              <button type="submit">Create Session</button>
              <button type="button" onClick={() => setActiveTab("welcome")}>
                Back
              </button>
            </form>
          </div>
        )}

        {activeTab === "available" && (
          <div className="available-sessions-container">
            <h2>Available Sessions</h2>

            <div className="filters-row">
              <div className="search-bar">
                <FaSearch />
                <input
                type="text"
                placeholder="Search by session title"
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                />
              </div>

              <select value={selectedSport} onChange={(e) => setSelectedSport(e.target.value)}>
                <option>All</option>
                <option>Football</option>
                <option>Basketball</option>
                <option>Cricket</option>
                <option>Volleyball</option>
                <option>Tennis</option>
                <option>Kabaddi</option>
              </select>

              <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                <option>All</option>
                <option>Open</option>
                <option>Full</option>
                <option>Cancelled</option>
              </select>
            </div>

            <div
              className="sessions-grid"
              style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px", marginTop: "20px" }}
            >
              {filteredSessions
                .filter((session) => session.createdBy !== auth.currentUser.uid)
                .map((session) => {
                  const players = session.players || [];
                  const joinedPlayers = session.joinedPlayers || [];
                  const maxPlayers = players.length + (session.additionalPlayers || 0);
                  const slotsLeft = maxPlayers - joinedPlayers.length;

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
                        <FaUsers /> Players: {joinedPlayers.length} / {maxPlayers}
                      </p>
                      <p>
                        <strong>Joined Players:</strong>{" "}
                        {joinedPlayers.length > 0
                          ? joinedPlayers.map((p) => p.name || "Anonymous").join(", ")
                          : "None"}
                      </p>
                      <button
                        onClick={() => handleJoinSession(session)}
                        disabled={
                          joinedPlayers.some((p) => p.uid === auth.currentUser?.uid) ||
                          slotsLeft <= 0
                        }
                      >
                        {joinedPlayers.some((p) => p.uid === auth.currentUser?.uid)
                          ? "Joined"
                          : slotsLeft <= 0
                          ? "Full"
                          : "Join"}
                      </button>
                      <p>Slots available: {slotsLeft}</p>
                    </div>
                  );
                })}
            </div>

            <button style={{ marginTop: "20px" }} onClick={() => setActiveTab("welcome")}>
              Back
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerDashboard;
