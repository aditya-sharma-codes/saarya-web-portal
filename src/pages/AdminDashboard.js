import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState("");
  const navigate = useNavigate();

  const getNotices = async () => {
    const snapshot = await getDocs(collection(db, "notices"));
    setNotices(snapshot.docs.map(doc => doc.data()));
  };

  useEffect(() => {
    getNotices();
  }, []);

  const addNotice = async () => {
    if (newNotice.trim()) {
      await addDoc(collection(db, "notices"), { text: newNotice, createdAt: Date.now() });
      setNewNotice("");
      getNotices();
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h1>Admin Dashboard</h1>
      <button onClick={handleLogout}>Logout</button>
      <div>
        <input
          type="text"
          placeholder="Enter notice"
          value={newNotice}
          onChange={(e) => setNewNotice(e.target.value)}
        />
        <button onClick={addNotice}>Add Notice</button>
      </div>
      <h3>All Notices</h3>
      <ul>
        {notices.map((n, index) => (
          <li key={index}>{n.text}</li>
        ))}
      </ul>
    </div>
  );
}
