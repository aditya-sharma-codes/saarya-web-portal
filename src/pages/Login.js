import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../firebase";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  MenuItem,
  Paper,
  Alert,
  Avatar
} from "@mui/material";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("user");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        setError("No role found. Contact admin.");
        return;
      }

      const data = userDoc.data();
      if (role === "admin" && data.role === "admin") {
        navigate("/dashboard");

      } else if (role === "user" && data.role === "user") {
        navigate("/user-dashboard");
      } else {
        setError("Role mismatch! Please use correct login role.");
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 4,
            background: "white",
            textAlign: "center"
          }}
        >
          <Avatar
            src="/logo192.png" // Replace with your logo path
            alt="SAARYA Logo"
            sx={{
              width: 70,
              height: 70,
              mx: "auto",
              mb: 2
            }}
          />
          <Typography variant="h5" gutterBottom sx={{ fontWeight: "bold", color: "#333" }}>
            SAARYA Cable Network
          </Typography>
          <Typography variant="body2" sx={{ mb: 3, color: "#666" }}>
            Sign in to continue
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleLogin}>
            <TextField
              select
              label="Select Role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              fullWidth
              margin="normal"
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&.Mui-focused fieldset": { borderColor: "#4facfe" }
                }
              }}
            >
              <MenuItem value="user">User Login</MenuItem>
              <MenuItem value="admin">Admin Login</MenuItem>
            </TextField>

            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              margin="normal"
              required
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&.Mui-focused fieldset": { borderColor: "#4facfe" }
                }
              }}
            />

            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              fullWidth
              margin="normal"
              required
              variant="outlined"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "&.Mui-focused fieldset": { borderColor: "#4facfe" }
                }
              }}
            />

            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 3,
                py: 1.2,
                borderRadius: "12px",
                fontWeight: "bold",
                fontSize: "1rem",
                background: "linear-gradient(90deg, #4facfe, #00f2fe)",
                "&:hover": {
                  background: "linear-gradient(90deg, #00f2fe, #4facfe)"
                }
              }}
            >
              Login
            </Button>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}
