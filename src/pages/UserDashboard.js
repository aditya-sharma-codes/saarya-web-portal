import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, onSnapshot } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function UserDashboard() {
  const [notices, setNotices] = useState([]);
  const navigate = useNavigate();

  // Fetch notices in real-time
  useEffect(() => {
    const unsub = onSnapshot(collection(db, "notices"), (snapshot) => {
      setNotices(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsub(); // cleanup
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h1>User Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>

      <h3>Service Notices</h3>
      {notices.length === 0 ? (
        <p>No notices yet.</p>
      ) : (
        <ul>
          {notices.map((n, index) => (
            <li key={index}>{n.text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
