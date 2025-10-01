import React, { useEffect, useState, useRef } from "react";
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
  IconButton,
} from "@mui/material";
import { motion } from "framer-motion";
import ChatIcon from "@mui/icons-material/Chat";
import CloseIcon from "@mui/icons-material/Close";

export default function UserDashboard() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  const [openTicket, setOpenTicket] = useState(false);
  const [ticketDesc, setTicketDesc] = useState("");

  const [chatOpen, setChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    { from: "bot", text: "Hi! 👋 I'm your assistant. Ask me about plans, billing, or usage." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [botTyping, setBotTyping] = useState(false);
  const chatEndRef = useRef(null);

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

  const handleChatSend = () => {
    if (!chatInput.trim()) return;
    const newMessage = { from: "user", text: chatInput };
    setChatMessages((prev) => [...prev, newMessage]);

    let reply = "Sorry, I didn’t understand that. 🙏";
    const lower = chatInput.toLowerCase();

    // FAQ Responses
    if (lower.includes("plan") || lower.includes("price")) {
      reply = "📦 Our internet plans:\n• Basic: ₹399/month, 30 Mbps\n• Standard: ₹599/month, 75 Mbps\n• Premium: ₹999/month, 150 Mbps 🚀";
    } else if (lower.includes("bill") || lower.includes("payment")) {
      reply = "💳 Your last bill was ₹500, due on 1st Aug. You can pay via UPI, Card, or NetBanking.";
    } else if (lower.includes("usage") || lower.includes("data")) {
      reply = `📊 You’ve used ${monthUsage} GB of ${planLimit} GB this month. Today’s usage: ${todayUsage} GB.`;
    } else if (lower.includes("complaint") || lower.includes("support")) {
      reply = "🛠 You can raise a complaint under 'Quick Actions' → 'Raise Complaint'. Our team will assist you soon.";
    } else if (lower.includes("logout")) {
      reply = "🔒 To logout, click the Logout button on the top of your dashboard.";
    }

    // Smart Recommendation
    else if (lower.includes("recommend") || lower.includes("best plan") || lower.includes("suggest")) {
      if (monthUsage > 80) {
        reply = "⚡ Based on your high usage, we recommend the *Premium Plan* (₹999/month, 150 Mbps, 200GB FUP).";
      } else if (monthUsage > 40) {
        reply = "✅ You’d do well with our *Standard Plan* (₹599/month, 75 Mbps, 100GB FUP).";
      } else {
        reply = "👌 Our *Basic Plan* (₹399/month, 30 Mbps, 50GB FUP) should be perfect for your needs.";
      }
    }

    // Small Talk
    else if (["hi", "hello", "hey"].some((g) => lower.includes(g))) {
      reply = "👋 Hello! How can I help you today? (Ask about plans, bills, usage, or recommendations)";
    } else if (lower.includes("thank")) {
      reply = "🙏 You’re welcome! Happy to assist.";
    }

    // Typing simulation
    setBotTyping(true);
    setTimeout(() => {
      setChatMessages((prev) => [...prev, { from: "bot", text: reply }]);
      setBotTyping(false);
    }, 1200);

    setChatInput("");
  };

  useEffect(() => {
    getNotices();
    getUserData();
  }, []);

  // Auto scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, botTyping]);

  const cardVariant = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  const MotionCard = ({ children }) => (
    <motion.div
      variants={cardVariant}
      initial={false}
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
          "&:hover": { boxShadow: "0px 10px 30px rgba(0,0,0,0.25)" },
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
          <Typography variant="subtitle1" sx={{ opacity: 0.9, mb: 2 }}>
            Manage your account, track usage, pay bills & stay connected 🚀
          </Typography>
          <Button
            variant="contained"
            onClick={handleLogout}
            sx={{
              background: "white",
              color: "#4facfe",
              fontWeight: "bold",
              "&:hover": { background: "#f5f5f5" }
            }}
          >
            Logout
          </Button>
        </Paper>
      </motion.div>

      {/* Content Grid */}
      <Grid container spacing={4}>
        {/* Notices */}
        <Grid item xs={12} md={6}>
          <MotionCard>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: "#4facfe" }}>
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
              <Typography color="text.secondary">No notices available</Typography>
            )}
          </MotionCard>
        </Grid>

        {/* Billing */}
        <Grid item xs={12} md={6}>
          <MotionCard>
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: "#4facfe" }}>
              💳 Billing
            </Typography>
            <Typography variant="body1" sx={{ mb: 2 }}>
              Current Bill: <strong style={{ color: "#333", fontSize: "1.1rem" }}>₹500</strong> (Demo)
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
                "&:hover": { background: "linear-gradient(90deg, #00f2fe, #4facfe)" }
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
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: "#4facfe" }}>
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
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: "#4facfe" }}>
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
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: "#4facfe" }}>
              📑 Payment History
            </Typography>
            <List>
              {paymentHistory.map((p, idx) => (
                <React.Fragment key={idx}>
                  <ListItem>
                    <ListItemText primary={`${p.date} - ${p.amount}`} secondary={`Mode: ${p.mode}`} />
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
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: "#4facfe" }}>
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
            <Typography variant="h6" fontWeight="bold" gutterBottom sx={{ color: "#4facfe" }}>
              ⚡ Quick Actions
            </Typography>
            <Stack spacing={2}>
              <Button variant="outlined" fullWidth onClick={() => setOpenTicket(true)}>
                Raise Complaint
              </Button>
              <Button variant="outlined" fullWidth onClick={() => alert("Upgrade Feature Coming!")}>
                Upgrade Plan
              </Button>
              <Button variant="outlined" fullWidth onClick={() => alert("Invoice Download Coming!")}>
                Download Invoice
              </Button>
            </Stack>
          </MotionCard>
        </Grid>
      </Grid>

      {/* Raise Complaint Dialog */}
      <Dialog open={openTicket} onClose={() => setOpenTicket(false)}>
        <DialogTitle>Raise a Complaint</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            label="Describe your issue"
            multiline
            rows={4}
            value={ticketDesc}
            onChange={(e) => setTicketDesc(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenTicket(false)}>Cancel</Button>
          <Button onClick={handleRaiseTicket} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Chatbot */}
      <Box
        sx={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 1000,
        }}
      >
        {chatOpen ? (
          <Paper
            elevation={6}
            sx={{
              width: 300,
              height: 400,
              p: 2,
              borderRadius: 3,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="h6">💬 Chatbot</Typography>
              <IconButton size="small" onClick={() => setChatOpen(false)}>
                <CloseIcon />
              </IconButton>
            </Box>
            <Box
              sx={{
                flex: 1,
                overflowY: "auto",
                mb: 1,
              }}
            >
              {chatMessages.map((msg, idx) => (
                <Box
                  key={idx}
                  sx={{
                    textAlign: msg.from === "user" ? "right" : "left",
                    mb: 1,
                  }}
                >
                  <Typography
                    sx={{
                      display: "inline-block",
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      background:
                        msg.from === "user"
                          ? "linear-gradient(90deg, #4facfe, #00f2fe)"
                          : "#f0f0f0",
                      color: msg.from === "user" ? "white" : "black",
                      fontSize: "0.9rem",
                    }}
                  >
                    {msg.text}
                  </Typography>
                </Box>
              ))}
              {botTyping && (
                <Box sx={{ textAlign: "left", mb: 1 }}>
                  <Typography
                    sx={{
                      display: "inline-block",
                      px: 1.5,
                      py: 1,
                      borderRadius: 2,
                      background: "#f0f0f0",
                      color: "black",
                      fontSize: "0.9rem",
                      fontStyle: "italic",
                    }}
                  >
                    Typing...
                  </Typography>
                </Box>
              )}
              <div ref={chatEndRef} />
            </Box>
            <Box sx={{ display: "flex", gap: 1 }}>
              <TextField
                fullWidth
                size="small"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask something..."
              />
              <Button variant="contained" onClick={handleChatSend}>
                Send
              </Button>
            </Box>
          </Paper>
        ) : (
          <IconButton
            onClick={() => setChatOpen(true)}
            sx={{
              background: "linear-gradient(90deg, #4facfe, #00f2fe)",
              color: "white",
              width: 60,
              height: 60,
              "&:hover": { opacity: 0.9 },
            }}
          >
            <ChatIcon />
          </IconButton>
        )}
      </Box>
    </Box>
  );
}
