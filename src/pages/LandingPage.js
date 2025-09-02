import React, { useState } from "react";
import "../App.css";

import {
  Box,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  TextField,
  Container,
  Paper,
  Snackbar,
  Alert,
} from "@mui/material";
import { motion } from "framer-motion";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    plan: "",
  });
  const [snack, setSnack] = useState({ open: false, msg: "", type: "success" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "connectionRequests"), {
        ...formData,
        status: "Pending",
        createdAt: serverTimestamp(),
      });
      setFormData({ name: "", email: "", phone: "", address: "", plan: "" });
      setSnack({ open: true, msg: "Request submitted successfully!", type: "success" });
    } catch (err) {
      setSnack({ open: true, msg: err.message, type: "error" });
    }
  };

  return (
    <Box sx={{ backgroundColor: "#f9f9f9" }}>
      {/* Hero Section with Motion Gradient */}
      <Box
        className="aurora-bg"
        sx={{
          position: "relative",
          color: "white",
          textAlign: "center",
          p: 6,
          overflow: "hidden",
        }}
      >
        {/* Animated background */}
        <motion.div
          className="aurora-gradient"
          initial={{ backgroundPosition: "0% 50%" }}
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
        />
        <Container sx={{ position: "relative", zIndex: 2 }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1 }}
          >
            <Typography
              variant="h2"
              fontWeight="bold"
              gutterBottom
              sx={{ textShadow: "0px 4px 20px rgba(0,0,0,0.5)" }}
            >
              SAARYA Cable Network
            </Typography>
            <Typography
              variant="h5"
              gutterBottom
              sx={{
                mb: 4,
                opacity: 0.9,
                textShadow: "0px 2px 15px rgba(0,0,0,0.3)",
              }}
            >
              Fast. Reliable. Affordable Internet & Cable Services
            </Typography>
            <Box mt={4}>
              <Button
                variant="contained"
                size="large"
                sx={{
                  mr: 2,
                  borderRadius: 3,
                  background: "white",
                  color: "#764ba2",
                  fontWeight: "bold",
                  boxShadow: "0px 4px 15px rgba(0,0,0,0.2)",
                  "&:hover": { background: "#f5f5f5" },
                }}
                onClick={() => navigate("/login")}
              >
                Login
              </Button>
              <Button
                variant="outlined"
                size="large"
                sx={{
                  borderRadius: 3,
                  color: "white",
                  borderColor: "white",
                  fontWeight: "bold",
                  "&:hover": { background: "rgba(255,255,255,0.1)" },
                }}
                onClick={() =>
                  document.getElementById("connection-form").scrollIntoView({ behavior: "smooth" })
                }
              >
                Request New Connection
              </Button>
            </Box>
          </motion.div>
        </Container>
      </Box>

      {/* About Us */}
      <Container sx={{ py: 8 }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
            About Us
          </Typography>
          <Typography
            variant="body1"
            align="center"
            maxWidth="md"
            mx="auto"
            color="text.secondary"
          >
            SAARYA Cable Network has been serving customers with high-speed internet and
            premium cable TV services. Our mission is to provide seamless connectivity
            and entertainment at the most affordable prices.
          </Typography>
        </motion.div>
      </Container>

      {/* Plans & Pricing */}
      <Container sx={{ py: 8 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
          Plans & Pricing
        </Typography>
        <Grid container spacing={4} justifyContent="center">
          {[
            { name: "Basic", price: "₹399/month", speed: "30 Mbps", benefits: "Good for browsing" },
            { name: "Standard", price: "₹699/month", speed: "75 Mbps", benefits: "Streaming + Work" },
            { name: "Premium", price: "₹999/month", speed: "150 Mbps", benefits: "Heavy usage" },
          ].map((plan, idx) => (
            <Grid item xs={12} md={4} key={idx}>
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: idx * 0.2 }}
                whileHover={{ scale: 1.05 }}
              >
                <Card
                  elevation={4}
                  sx={{
                    textAlign: "center",
                    p: 2,
                    borderRadius: 4,
                    transition: "box-shadow 0.3s ease",
                    "&:hover": {
                      boxShadow: "0px 8px 25px rgba(0,0,0,0.3)",
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h5" fontWeight="bold">
                      {plan.name}
                    </Typography>
                    <Typography variant="h6" color="primary">
                      {plan.price}
                    </Typography>
                    <Typography>{plan.speed}</Typography>
                    <Typography color="text.secondary">{plan.benefits}</Typography>
                  </CardContent>
                </Card>
              </motion.div>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Request New Connection Form */}
      <Container id="connection-form" sx={{ py: 8 }}>
        <Paper elevation={6} sx={{ p: 4, borderRadius: 4 }}>
          <Typography variant="h4" fontWeight="bold" gutterBottom align="center">
            Request New Connection
          </Typography>
          <Box component="form" onSubmit={handleSubmit}>
            <Grid container spacing={2}>
              {["name", "email", "phone", "address", "plan"].map((field, idx) => (
                <Grid item xs={12} md={field === "address" ? 12 : 6} key={idx}>
                  <TextField
                    fullWidth
                    label={field.charAt(0).toUpperCase() + field.slice(1)}
                    name={field}
                    value={formData[field]}
                    onChange={handleChange}
                    required
                  />
                </Grid>
              ))}
            </Grid>
            <Box textAlign="center" mt={3}>
              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  borderRadius: 3,
                  background: "linear-gradient(90deg, #667eea, #764ba2)",
                  fontWeight: "bold",
                  "&:hover": {
                    background: "linear-gradient(90deg, #764ba2, #667eea)",
                  },
                }}
              >
                Submit Request
              </Button>
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Snackbar */}
      <Snackbar
        open={snack.open}
        autoHideDuration={3000}
        onClose={() => setSnack({ ...snack, open: false })}
      >
        <Alert
          severity={snack.type}
          onClose={() => setSnack({ ...snack, open: false })}
          sx={{ width: "100%" }}
        >
          {snack.msg}
        </Alert>
      </Snackbar>

      {/* Footer */}
      <Box sx={{ background: "#333", color: "white", p: 3, textAlign: "center" }}>
        <Typography variant="body2">
          © 2025 SAARYA Cable Network. All Rights Reserved.
        </Typography>
      </Box>
    </Box>
  );
}
