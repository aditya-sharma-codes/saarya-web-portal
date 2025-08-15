import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider
} from "@mui/material";

export default function UserDashboard() {
  const [notices, setNotices] = useState([]);
  const navigate = useNavigate();

  const getNotices = async () => {
    const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    setNotices(snapshot.docs.map(doc => doc.data()));
  };

  useEffect(() => {
    getNotices();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  return (
    <Box sx={{ backgroundColor: "#f4f6f8", minHeight: "100vh" }}>
      {/* Header */}
      <AppBar position="static" sx={{ background: "linear-gradient(90deg, #4facfe, #00f2fe)" }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            User Dashboard
          </Typography>
          <Button color="inherit" onClick={handleLogout}>
            Logout
          </Button>
        </Toolbar>
      </AppBar>

      {/* Content */}
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Paper sx={{ p: 3, borderRadius: 3, boxShadow: 3 }}>
          <Typography variant="h6" gutterBottom>
            Latest Notices
          </Typography>
          <List>
            {notices.length > 0 ? (
              notices.map((n, index) => (
                <React.Fragment key={index}>
                  <ListItem>
                    <ListItemText primary={n.text} />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))
            ) : (
              <Typography color="text.secondary">No notices available</Typography>
            )}
          </List>
        </Paper>
      </Container>
    </Box>
  );
}
