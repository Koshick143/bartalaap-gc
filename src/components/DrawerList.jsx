import React, { useState, useEffect } from 'react';
import { auth, firestore } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import Button from '@mui/material/Button';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';

export default function DrawerList({ onSignOut }) {
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
      if (user) {
        const usersCollection = collection(firestore, 'users');
        const q = query(usersCollection, where('online', '==', true));
        const usersSnapshot = await getDocs(q);
        const usersList = usersSnapshot.docs.map(doc => doc.data());
        setChatUsers(usersList);
      }
    };

    fetchChatUsers();
  }, [user, open]); // Re-fetch users when the drawer opens

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
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
          <Button variant="contained" color="primary" onClick={onSignOut}>
            Sign Out
          </Button>
        </Box>
      )}
      <Box sx={{ padding: 2 }}>
        <Typography variant="h6">Online</Typography>
        <List>
          {chatUsers.map((chatUser, index) => (
            <ListItem key={index}>
              <ListItemAvatar>
                <Avatar src={chatUser.photoURL} alt={chatUser.displayName} />
              </ListItemAvatar>
              <ListItemText primary={chatUser.displayName} />
            </ListItem>
          ))}
        </List>
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
