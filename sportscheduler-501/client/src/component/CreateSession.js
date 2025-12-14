import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaCalendarAlt, FaClock, FaUserPlus, FaUsers } from "react-icons/fa";
import { db, auth } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

import "./CreateSession.css";

const CreateSession = () => {
  const navigate = useNavigate();

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

  const handleSubmit = async (e) => {
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
        joinedPlayers: [], // ✅ initialize for Firestore rules
      });

      alert("Session created successfully!");
      navigate("/profile");

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

  return (
    <div>
      <nav className="navbar">
        <div className="logo">
          <h2>SportsScheduler</h2>
        </div>
        <div className="nav-links">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
          <button onClick={() => navigate("/available-sessions")}>Available Sessions</button>
          <button onClick={() => navigate("/profile")}>Profile</button>
        </div>
      </nav>

      <div className="create-session-container">
        <h1 className="create-session-title">Create Session</h1>
        <p className="caption">Set up a new sports session for players to join</p>

        <div className="session-main">
          {/* Left Cards */}
          <div className="cards-left">
            <div className="card">
              <h3 className="card-title">Basic Information</h3>
              <label>Session Title</label>
              <input
                type="text"
                placeholder="e.g., Evening football match"
                value={sessionTitle}
                onChange={(e) => setSessionTitle(e.target.value)}
              />

              <label>Sport</label>
              <select value={sport} onChange={(e) => setSport(e.target.value)}>
                <option>Football</option>
                <option>Basketball</option>
                <option>Cricket</option>
                <option>Volleyball</option>
                <option>Tennis</option>
                <option>Kabaddi</option>
              </select>

              <label>Description</label>
              <textarea
                placeholder="Brief description of the session, skill level, any special requirements."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            <div className="card">
              <h3 className="card-title">Schedule & Location</h3>

              <label>Date</label>
              <div className="input-group">
                <FaCalendarAlt className="input-icon" />
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>

              <label>Time</label>
              <div className="input-group">
                <FaClock className="input-icon" />
                <input type="time" value={time} onChange={(e) => setTime(e.target.value)} />
              </div>

              <label>Venue</label>
              <input
                type="text"
                placeholder="Enter venue/location"
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
              />
            </div>

            <div className="card">
              <h3 className="card-title">Players</h3>
              {players.map((p, i) => (
                <div key={i} className="player-input">
                  <input
                    type="text"
                    placeholder="Enter player name"
                    value={p.name}
                    onChange={(e) => handlePlayerChange(i, e.target.value)}
                  />
                  {i === players.length - 1 && (
                    <button type="button" className="add-player-btn" onClick={addPlayer}>
                      <FaUserPlus />
                    </button>
                  )}
                </div>
              ))}

              <label>Additional Players Needed</label>
              <input
                type="number"
                placeholder="How many more players do you need?"
                value={additionalPlayers}
                onChange={(e) => setAdditionalPlayers(e.target.value)}
              />
            </div>
          </div>

          {/* Right Card: Summary */}
          <div className="card summary-card">
            <h3 className="card-title">Session Summary</h3>
            <p><FaCalendarAlt /> Date: {sessionSummary.date}</p>
            <p><FaClock /> Time: {sessionSummary.time}</p>
            <p>Location: {sessionSummary.location}</p>
            <p><FaUsers /> Confirmed Players: {sessionSummary.confirmedPlayers}</p>
            <p>{sessionSummary.sportInfo}</p>

            <button className="create-session-btn" onClick={handleSubmit}>
              Create Session
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateSession;
