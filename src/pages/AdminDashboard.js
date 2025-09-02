import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc
} from "firebase/firestore";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Paper,
  Stack,
  IconButton
} from "@mui/material";
import { motion } from "framer-motion";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";

export default function AdminDashboard() {
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState("");
  const [editNoticeId, setEditNoticeId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Demo data for users, payments, requests
  const users = [
    { name: "Aditya", email: "aditya@test.com", role: "user", plan: "Basic", status: "Active" },
    { name: "Neha", email: "neha@test.com", role: "user", plan: "Premium", status: "Suspended" },
    { name: "Rohan", email: "rohan@test.com", role: "admin", plan: "-", status: "Active" }
  ];

  const connectionRequests = [
    { name: "Suresh", email: "suresh@gmail.com", plan: "Basic Plan", status: "Pending" },
    { name: "Aditi", email: "aditi@gmail.com", plan: "Premium Plan", status: "Approved" }
  ];

  const payments = [
    { user: "Aditya", date: "01 Aug 2025", amount: "₹500", mode: "UPI" },
    { user: "Neha", date: "01 Jul 2025", amount: "₹700", mode: "Card" }
  ];

  // Stats
  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.status === "Active").length,
    pendingRequests: connectionRequests.filter(r => r.status === "Pending").length,
    revenue: payments.reduce((acc, p) => acc + parseInt(p.amount.replace("₹", "")), 0)
  };

  const getNotices = async () => {
    const snapshot = await getDocs(collection(db, "notices"));
    setNotices(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  const addOrUpdateNotice = async () => {
    if (newNotice.trim()) {
      if (editNoticeId) {
        await updateDoc(doc(db, "notices", editNoticeId), { text: newNotice });
        setEditNoticeId(null);
      } else {
        await addDoc(collection(db, "notices"), { text: newNotice, createdAt: new Date() });
      }
      setNewNotice("");
      getNotices();
    }
  };

  const deleteNotice = async (id) => {
    await deleteDoc(doc(db, "notices", id));
    getNotices();
  };

  useEffect(() => {
    getNotices();
  }, []);

  // Motion variant
  const MotionCard = ({ children }) => (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 200, damping: 15 }}
    >
      <Card
        elevation={4}
        sx={{
          borderRadius: 4,
          transition: "box-shadow 0.3s ease",
          "&:hover": {
            boxShadow: "0px 10px 30px rgba(0,0,0,0.25)"
          }
        }}
      >
        <CardContent>{children}</CardContent>
      </Card>
    </motion.div>
  );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #ece9e6 0%, #ffffff 100%)",
        p: { xs: 2, md: 4 }
      }}
    >
      {/* Header */}
      <Paper
        elevation={6}
        sx={{
          p: 4,
          mb: 5,
          borderRadius: 4,
          textAlign: "center",
          background: "linear-gradient(135deg, #667eea, #764ba2)",
          color: "white",
          boxShadow: "0px 8px 20px rgba(0,0,0,0.2)"
        }}
      >
        <Avatar
          sx={{
            bgcolor: "white",
            color: "#667eea",
            width: 90,
            height: 90,
            fontSize: "2.5rem",
            mx: "auto",
            mb: 2,
            fontWeight: "bold"
          }}
        >
          A
        </Avatar>
        <Typography variant="h4" fontWeight="bold">
          Admin Dashboard
        </Typography>
        <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
          Manage users, notices, payments & requests 📊
        </Typography>
      </Paper>

      {/* Stats */}
      <Grid container spacing={4} mb={4}>
        <Grid item xs={12} md={3}>
          <MotionCard>
            <Typography variant="h6">👥 Total Users</Typography>
            <Typography variant="h4" fontWeight="bold">{stats.totalUsers}</Typography>
          </MotionCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <MotionCard>
            <Typography variant="h6">✅ Active Users</Typography>
            <Typography variant="h4" fontWeight="bold">{stats.activeUsers}</Typography>
          </MotionCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <MotionCard>
            <Typography variant="h6">📩 Pending Requests</Typography>
            <Typography variant="h4" fontWeight="bold">{stats.pendingRequests}</Typography>
          </MotionCard>
        </Grid>
        <Grid item xs={12} md={3}>
          <MotionCard>
            <Typography variant="h6">💰 Revenue</Typography>
            <Typography variant="h4" fontWeight="bold">₹{stats.revenue}</Typography>
          </MotionCard>
        </Grid>
      </Grid>

      {/* Main Grid */}
      <Grid container spacing={4}>
        {/* Notices */}
        <Grid item xs={12} md={6}>
          <MotionCard>
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#667eea" }}>
              📢 Manage Notices
            </Typography>
            <Stack direction="row" spacing={2} my={2}>
              <TextField
                fullWidth
                placeholder="Enter notice"
                value={newNotice}
                onChange={(e) => setNewNotice(e.target.value)}
              />
              <Button variant="contained" onClick={addOrUpdateNotice}>
                {editNoticeId ? "Update" : "Add"}
              </Button>
            </Stack>
            <List>
              {notices.map((n) => (
                <React.Fragment key={n.id}>
                  <ListItem
                    secondaryAction={
                      <>
                        <IconButton onClick={() => { setNewNotice(n.text); setEditNoticeId(n.id); }}>
                          <EditIcon />
                        </IconButton>
                        <IconButton onClick={() => deleteNotice(n.id)}>
                          <DeleteIcon />
                        </IconButton>
                      </>
                    }
                  >
                    <ListItemText primary={n.text} />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </MotionCard>
        </Grid>

        {/* Users */}
        <Grid item xs={12} md={6}>
          <MotionCard>
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#667eea" }}>
              👥 Users
            </Typography>
            <List>
              {users.map((u, idx) => (
                <React.Fragment key={idx}>
                  <ListItem>
                    <ListItemText
                      primary={`${u.name} (${u.role})`}
                      secondary={`${u.email} | ${u.plan} | ${u.status}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </MotionCard>
        </Grid>

        {/* Connection Requests */}
        <Grid item xs={12} md={6}>
          <MotionCard>
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#667eea" }}>
              📩 Connection Requests
            </Typography>
            <List>
              {connectionRequests.map((r, idx) => (
                <React.Fragment key={idx}>
                  <ListItem>
                    <ListItemText
                      primary={`${r.name} - ${r.plan}`}
                      secondary={`${r.email} | Status: ${r.status}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </MotionCard>
        </Grid>

        {/* Payments */}
        <Grid item xs={12} md={6}>
          <MotionCard>
            <Typography variant="h6" fontWeight="bold" sx={{ color: "#667eea" }}>
              💳 Payments
            </Typography>
            <List>
              {payments.map((p, idx) => (
                <React.Fragment key={idx}>
                  <ListItem>
                    <ListItemText
                      primary={`${p.user} - ${p.amount}`}
                      secondary={`${p.date} | Mode: ${p.mode}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </MotionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
