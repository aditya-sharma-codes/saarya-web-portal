import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  addDoc,
} from "firebase/firestore";
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  CircularProgress,
  Avatar,
  Paper,
  LinearProgress,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  TextField,
  DialogActions,
} from "@mui/material";
import { motion } from "framer-motion";

export default function UserDashboard() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  const [openTicket, setOpenTicket] = useState(false);
  const [ticketDesc, setTicketDesc] = useState("");

  const navigate = useNavigate();

  // Demo values
  const todayUsage = 1.5; // GB
  const monthUsage = 85; // GB
  const planLimit = 100; // GB
  const daysRemaining = 12;
  const serviceStatus = "Active";

  const paymentHistory = [
    { date: "01 Aug 2025", amount: "₹500", mode: "UPI" },
    { date: "01 Jul 2025", amount: "₹500", mode: "Card" },
    { date: "01 Jun 2025", amount: "₹500", mode: "Cash" },
  ];

  const getNotices = async () => {
    const snapshot = await getDocs(collection(db, "notices"));
    setNotices(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    setLoading(false);
  };

  const getUserData = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    }
  };

  const handleRaiseTicket = async () => {
    if (!ticketDesc.trim()) return;
    await addDoc(collection(db, "tickets"), {
      user: userData?.name || auth.currentUser?.email,
      issue: ticketDesc,
      status: "Pending",
      createdAt: new Date(),
    });
    setTicketDesc("");
    setOpenTicket(false);
    alert("Ticket submitted successfully!");
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  useEffect(() => {
    getNotices();
    getUserData();
  }, []);

  const cardVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const MotionCard = ({ children }) => (
    <motion.div
      variants={cardVariant}
      initial="hidden"
      animate="visible"
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
            boxShadow: "0px 10px 30px rgba(0,0,0,0.25)",
          },
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
        background: "linear-gradient(135deg, #eef2f3 0%, #cfd9df 100%)",
        p: { xs: 2, md: 4 }
      }}
    >
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.8 } }}
      >
        <Paper
          elevation={6}
          sx={{
            p: 4,
            mb: 5,
            borderRadius: 4,
            textAlign: "center",
            background: "linear-gradient(135deg, #4facfe, #00f2fe)",
            color: "white",
            boxShadow: "0px 8px 20px rgba(0,0,0,0.2)"
          }}
        >
          <Avatar
            sx={{
              bgcolor: "white",
              color: "#4facfe",
              width: 90,
              height: 90,
              fontSize: "2.5rem",
              mx: "auto",
              mb: 2,
              fontWeight: "bold",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.2)"
            }}
          >
            {auth.currentUser?.email[0].toUpperCase()}
          </Avatar>
          <Typography variant="h4" fontWeight="bold">
            Welcome, {userData?.name || auth.currentUser?.email}
          </Typography>
          <Typography variant="subtitle1" sx={{ opacity: 0.9 }}>
            Manage your account, track usage, pay bills & stay connected 🚀
          </Typography>
        </Paper>
      </motion.div>

      {/* Content Grid */}
      <Grid container spacing={4}>
        {/* Notices */}
        <Grid item xs={12} md={6}>
          <MotionCard>
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              sx={{ color: "#4facfe" }}
            >
              📢 Latest Notices
            </Typography>
            {loading ? (
              <Box display="flex" justifyContent="center" py={3}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Refreshing...</Typography>
              </Box>
            ) : notices.length > 0 ? (
              <List>
                {notices.map((n) => (
                  <React.Fragment key={n.id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={<Typography fontWeight="500">{n.text}</Typography>}
                        secondary={
                          n.createdAt?.toDate
                            ? new Date(n.createdAt.toDate()).toLocaleString()
                            : ""
                        }
                      />
                    </ListItem>
                    <Divider />
                  </React.Fragment>
                ))}
              </List>
            ) : (
              <Typography color="text.secondary">
                No notices available
              </Typography>
            )}
          </MotionCard>
        </Grid>

        {/* Billing */}
        <Grid item xs={12} md={6}>
          <MotionCard>
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              sx={{ color: "#4facfe" }}
            >
              💳 Billing
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Current Bill:{" "}
              <strong style={{ color: "#333", fontSize: "1.1rem" }}>₹500</strong>{" "}
              (Demo)
            </Typography>
            <Button
              variant="contained"
              fullWidth
              sx={{
                background: "linear-gradient(90deg, #4facfe, #00f2fe)",
                borderRadius: "12px",
                py: 1.3,
                fontWeight: "bold",
                textTransform: "none",
                fontSize: "1rem",
                boxShadow: "0px 4px 10px rgba(0,0,0,0.2)",
                "&:hover": {
                  background: "linear-gradient(90deg, #00f2fe, #4facfe)"
                }
              }}
              onClick={() => alert("Payment Gateway Integration Pending")}
            >
              Pay Now
            </Button>
          </MotionCard>
        </Grid>

        {/* Data Usage */}
        <Grid item xs={12} md={6}>
          <MotionCard>
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              sx={{ color: "#4facfe" }}
            >
              📊 Data Usage
            </Typography>
            <Typography variant="body1">
              Today’s Usage: <strong>{todayUsage} GB</strong>
            </Typography>
            <Typography variant="body1">
              This Month: <strong>{monthUsage} GB / {planLimit} GB</strong>
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(monthUsage / planLimit) * 100}
              sx={{
                height: 12,
                borderRadius: 5,
                mt: 2,
                mb: 2,
                "& .MuiLinearProgress-bar": {
                  background: "linear-gradient(90deg, #4facfe, #00f2fe)"
                }
              }}
            />
            <Typography variant="body1" color="text.secondary">
              Remaining Days in Cycle: <strong>{daysRemaining}</strong>
            </Typography>
          </MotionCard>
        </Grid>

        {/* Service Status */}
        <Grid item xs={12} md={6}>
          <MotionCard>
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              sx={{ color: "#4facfe" }}
            >
              📡 Service Status
            </Typography>
            <Typography
              variant="body1"
              sx={{
                color: serviceStatus === "Active" ? "green" : "red",
                fontWeight: "bold",
                fontSize: "1.1rem"
              }}
            >
              {serviceStatus}
            </Typography>
          </MotionCard>
        </Grid>

        {/* Payment History */}
        <Grid item xs={12}>
          <MotionCard>
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              sx={{ color: "#4facfe" }}
            >
              📑 Payment History
            </Typography>
            <List>
              {paymentHistory.map((p, idx) => (
                <React.Fragment key={idx}>
                  <ListItem>
                    <ListItemText
                      primary={`${p.date} - ${p.amount}`}
                      secondary={`Mode: ${p.mode}`}
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          </MotionCard>
        </Grid>

        {/* Profile */}
        <Grid item xs={12} md={6}>
          <MotionCard>
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              sx={{ color: "#4facfe" }}
            >
              👤 Profile
            </Typography>
            <Typography>Email: {auth.currentUser?.email}</Typography>
            <Typography>Role: {userData?.role || "User"}</Typography>
            <Typography>Plan: {userData?.plan || "Basic Plan"}</Typography>
            <Typography>Speed: {userData?.speed || "50 Mbps"}</Typography>
            <Typography>Validity: {userData?.validity || "30 Days"}</Typography>
          </MotionCard>
        </Grid>

        {/* Quick Actions */}
        <Grid item xs={12} md={6}>
          <MotionCard>
            <Typography
              variant="h6"
              fontWeight="bold"
              gutterBottom
              sx={{ color: "#4facfe" }}
            >
              ⚡ Quick Actions
            </Typography>
            <Stack spacing={2}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => alert("Recharge Soon!")}
              >
                Recharge Now
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => alert("Upgrade Feature Coming!")}
              >
                Upgrade Plan
              </Button>
              <Button
                variant="outlined"
                fullWidth
                onClick={() => alert("Support Ticket Raised!")}
              >
                Raise Complaint
              </Button>
            </Stack>
          </MotionCard>
        </Grid>
      </Grid>
    </Box>
  );
}
