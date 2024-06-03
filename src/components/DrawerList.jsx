import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, getDocs } from 'firebase/firestore';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

export default function DrawerList() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [chatUsers, setChatUsers] = useState([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setUser(user);
    });

    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    const fetchChatUsers = async () => {
      const usersCollection = collection(firestore, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const usersList = usersSnapshot.docs.map(doc => doc.data());
      setChatUsers(usersList);
    };

    if (user) {
      fetchChatUsers();
    }
  }, [user]);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const handleSignOut = () => {
    signOut(auth);
    setOpen(false);
  };

  const drawerContent = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      {user && (
        <Box sx={{ padding: 2, textAlign: 'center' }}>
          <ListItem>
            <ListItemAvatar>
              <Avatar src={user.photoURL} alt={user.displayName} />
            </ListItemAvatar>
            <ListItemText primary={user.displayName} />
          </ListItem>
          <Button variant="contained" color="primary" onClick={handleSignOut}>
            Sign Out
          </Button>
        </Box>
      )}
      <Box sx={{ padding: 2 }}>
        <Typography variant="h6">Chats</Typography>
        {chatUsers.map((chatUser, index) => (
          <ListItem key={index}>
            <ListItemAvatar>
              <Avatar src={chatUser.photoURL} alt={chatUser.displayName} />
            </ListItemAvatar>
            <ListItemText primary={chatUser.displayName} />
          </ListItem>
        ))}
      </Box>
    </Box>
  );

  return (
    <div>
      <Button onClick={toggleDrawer(true)}>Menu</Button>
      <Drawer anchor="right" open={open} onClose={toggleDrawer(false)}>
        {drawerContent}
      </Drawer>
    </div>
  );
}
