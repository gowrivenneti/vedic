import React, { useState, useEffect } from "react";
import "./Profile.css";
import { collection, query, where, getDocs, doc, setDoc, getDoc } from "firebase/firestore";
import { db, auth } from "../firebase"; 
import { useNavigate } from "react-router-dom";

const ProfilePage = () => {
  const [player, setPlayer] = useState({
    name: "",
    email: "",
    phone: "",
    city: "",
  });

  const [sessions, setSessions] = useState({
    created: [],
    joined: [],
    past: [],
  });

  const [activeTab, setActiveTab] = useState("created");
  const navigate = useNavigate();

  // Load player profile on mount
  useEffect(() => {
    const fetchPlayer = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setPlayer(docSnap.data());
      }
    };

    fetchPlayer();
  }, []);

  // Load sessions on mount
  useEffect(() => {
    const fetchSessions = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const userId = user.uid;

      try {
        const sessionsRef = collection(db, "sessions");

        // Sessions created by me
        const createdQuery = query(sessionsRef, where("createdBy", "==", userId));
        const createdSnapshot = await getDocs(createdQuery);
        const createdSessions = createdSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Sessions joined (but not created by me)
        const joinedQuery = query(sessionsRef, where("joinedBy", "array-contains", userId));
        const joinedSnapshot = await getDocs(joinedQuery);
        const joinedSessions = joinedSnapshot.docs
          .filter((doc) => doc.data().createdBy !== userId)
          .map((doc) => ({ id: doc.id, ...doc.data() }));

        // Past sessions (completed or date in past)
        const now = new Date();
        const pastSessions = createdSessions
          .concat(joinedSessions)
          .filter((s) => s.status === "completed" || new Date(s.date) < now);

        setSessions({
          created: createdSessions,
          joined: joinedSessions,
          past: pastSessions,
        });
      } catch (error) {
        console.error("Error fetching sessions:", error);
      }
    };

    fetchSessions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPlayer((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return alert("You must be logged in");

    try {
      await setDoc(doc(db, "users", user.uid), player, { merge: true });
      alert("Profile details saved ✅");
    } catch (error) {
      console.error("Error saving profile:", error);
      alert("Failed to save profile");
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
    navigate("/login");
  };

  const renderSessions = () => {
    if (sessions[activeTab].length === 0) {
      return <p className="no-sessions">No sessions available.</p>;
    }

    return sessions[activeTab].map((session) => (
      <div key={session.id} className="session-card">
        <h3>
          {session.title}
          {session.status === "open" && <span className="spots">Spots Available</span>}
          {session.status === "full" && <span className="full">Full</span>}
        </h3>
        <p>{session.sport}</p>
        <div className="session-info">
          <span>📅 {session.date}</span>
          <span>📍 {session.location}</span>
          <span>👥 {session.players.length}</span>
        </div>
        <div className="session-actions">
          <button>Edit</button>
          <button>View</button>
        </div>
      </div>
    ));
  };

  return (
    <div className="profile-page">
      {/* Navbar */}
      <nav className="navbar">
        <div className="logo">SportsScheduler
          <img src="https://i.postimg.cc/8k48NwNr/unnamed-removebg-preview.png" alt="Logo" height="50px" width="50px" />
          </div>
        <div className="nav-links">
          <button onClick={() => navigate("/dashboard")}>Dashboard</button>
        </div>
      </nav>

      {/* Profile Card */}
      <div className="profile-card">
        <div className="avatar">👤</div>
        <div className="profile-fields">
          <label>
            Name:
            <input type="text" name="name" value={player.name} onChange={handleChange} />
          </label>
          <label>
            Email:
            <input type="email" name="email" value={player.email} onChange={handleChange} />
          </label>
          <label>
            Phone:
            <input type="text" name="phone" value={player.phone} onChange={handleChange} />
          </label>
          <label>
            City:
            <input type="text" name="city" value={player.city} onChange={handleChange} />
          </label>
          <div className="profile-buttons">
            <button className="save-btn" onClick={handleSave}>
              Save Profile
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* My Sessions Section */}
      <div className="sessions-section">
        <h2 className="section-title">Session Details</h2>
        <p className="section-caption">Manage your created and joined sessions</p>

        {/* Tabs */}
        <div className="tabs">
          <button
            className={`tab ${activeTab === "created" ? "active" : ""}`}
            onClick={() => setActiveTab("created")}
          >
            Created by Me ({sessions.created.length})
          </button>
          <button
            className={`tab ${activeTab === "joined" ? "active" : ""}`}
            onClick={() => setActiveTab("joined")}
          >
            Joined ({sessions.joined.length})
          </button>
          <button
            className={`tab ${activeTab === "past" ? "active" : ""}`}
            onClick={() => setActiveTab("past")}
          >
            Past Sessions ({sessions.past.length})
          </button>
        </div>

        {/* Sessions List */}
        {renderSessions()}
      </div>
    </div>
  );
};

export default ProfilePage;
