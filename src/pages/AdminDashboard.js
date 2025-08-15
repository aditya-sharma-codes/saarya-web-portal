import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  addDoc,
  getDocs,
  orderBy,
  query,
  deleteDoc,
  doc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
  TextField,
  Paper,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle
} from "@mui/material";
import { Delete, Edit } from "@mui/icons-material";

export default function AdminDashboard() {
  const [notices, setNotices] = useState([]);
  const [newNotice, setNewNotice] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");
  const [openEdit, setOpenEdit] = useState(false);
  const navigate = useNavigate();

  const getNotices = async () => {
    const q = query(collection(db, "notices"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    setNotices(snapshot.docs.map(docItem => ({ id: docItem.id, ...docItem.data() })));
  };

  useEffect(() => {
    getNotices();
  }, []);

  const addNotice = async () => {
    if (newNotice.trim()) {
      await addDoc(collection(db, "notices"), {
        text: newNotice,
        createdAt: serverTimestamp()
      });
      setNewNotice("");
      getNotices();
    }
  };

  const deleteNotice = async (id) => {
    await deleteDoc(doc(db, "notices", id));
    getNotices();
  };

  const handleEditOpen = (id, text) => {
    setEditId(id);
    setEditText(text);
    setOpenEdit(true);
  };

  const handleEditSave = async () => {
    if (editText.trim()) {
      await updateDoc(doc(db, "notices", editId), { text: editText });
      setOpenEdit(false);
      getNotices();
    }
  };

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
            Admin Dashboard
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
            Add New Notice
          </Typography>
          <Box sx={{ display: "flex", gap: 2, mb: 3 }}>
            <TextField
              label="Enter notice"
              value={newNotice}
              onChange={(e) => setNewNotice(e.target.value)}
              variant="outlined"
              fullWidth
            />
            <Button
              variant="contained"
              onClick={addNotice}
              sx={{
                background: "linear-gradient(90deg, #4facfe, #00f2fe)",
                "&:hover": { background: "linear-gradient(90deg, #00f2fe, #4facfe)" }
              }}
            >
              Add
            </Button>
          </Box>

          <Typography variant="h6" gutterBottom>
            All Notices
          </Typography>
          <List>
            {notices.length > 0 ? (
              notices.map((n) => (
                <React.Fragment key={n.id}>
                  <ListItem
                    secondaryAction={
                      <>
                        <IconButton color="primary" onClick={() => handleEditOpen(n.id, n.text)}>
                          <Edit />
                        </IconButton>
                        <IconButton color="error" onClick={() => deleteNotice(n.id)}>
                          <Delete />
                        </IconButton>
                      </>
                    }
                  >
                    <ListItemText
                      primary={n.text}
                      secondary={
                        n.createdAt?.toDate
                          ? new Date(n.createdAt.toDate()).toLocaleString()
                          : "Loading..."
                      }
                    />
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))
            ) : (
              <Typography color="text.secondary">No notices found</Typography>
            )}
          </List>
        </Paper>
      </Container>

      {/* Edit Dialog */}
      <Dialog open={openEdit} onClose={() => setOpenEdit(false)}>
        <DialogTitle>Edit Notice</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            variant="outlined"
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEdit(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleEditSave}
            sx={{
              background: "linear-gradient(90deg, #4facfe, #00f2fe)",
              "&:hover": { background: "linear-gradient(90deg, #00f2fe, #4facfe)" }
            }}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
