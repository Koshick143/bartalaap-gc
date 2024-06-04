import React, { useEffect, useState, useRef } from 'react';
import { auth, firestore } from './firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, orderBy, query, onSnapshot, doc, setDoc } from 'firebase/firestore';
import DrawerList from './components/DrawerList';
import SendIcon from '@mui/icons-material/Send';
import '../src/App.css';

export default function App() {
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        await setUserOnline(user);
        setUser(user);
      } else {
        if (user) {
          await setUserOffline(user.uid);
        }
        setUser(null);
      }
    });

    const q = query(collection(firestore, 'messages'), orderBy('createdAt'));
    const unsubscribeFirestore = onSnapshot(q, snapshot => {
      const messagesData = [];
      snapshot.forEach(doc => messagesData.push({ ...doc.data(), id: doc.id }));
      setMessages(messagesData);
      scrollToBottom();
    });

    return () => {
      unsubscribeAuth();
      unsubscribeFirestore();
    };
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const signInWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    await setUserOnline(result.user);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (message.trim() === "") return;

    const currentUser = auth.currentUser;
    const { uid, photoURL, displayName } = currentUser;

    await addDoc(collection(firestore, 'messages'), {
      text: message,
      createdAt: serverTimestamp(),
      uid,
      displayName,
      photoURL
    });
    setMessage('');
  };

  const setUserOnline = async (user) => {
    const userRef = doc(firestore, 'users', user.uid);
    await setDoc(userRef, {
      displayName: user.displayName || 'Anonymous',
      photoURL: user.photoURL || 'default-avatar-url', // Provide a default avatar URL if needed
      online: true,
      lastSeen: serverTimestamp(),
    }, { merge: true });
  };

  const setUserOffline = async (userId) => {
    const userRef = doc(firestore, 'users', userId);
    await setDoc(userRef, {
      online: false,
      lastSeen: serverTimestamp(),
    }, { merge: true });
  };

  const handleSignOut = async () => {
    if (user) {
      await setUserOffline(user.uid);
    }
    await signOut(auth);
    setUser(null);
  };

  return (
    <div className='main-con'>
      <header className='flex '>
        <div className='flex brand'>
          <img src="/logo2.0 (1).svg" id='logo' alt="" />
          <div>
            <h1 className='h-20 bg-red'>Bartalaap</h1>
            <p id='respo'>The Group Chat</p>
          </div>
        </div>
        {user ? <DrawerList onSignOut={handleSignOut} /> : <button className='sign-in' onClick={signInWithGoogle}>Sign In</button>}
      </header>
      <main>
        {user ? (<>
          <div className='display' style={{ overflowY: 'auto' }}>
            {messages.map(({ id, text, uid, displayName, photoURL }) => (
              <div key={id} className={`message flex ${uid === auth.currentUser.uid ? 'sent' : 'received'}`}>
                <img id='avatar' className='p-10' src={photoURL} alt="Avatar" />
                <div>
                  <p className="sender">{displayName}</p>
                  <p className="message-text">{text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form className='flex' onSubmit={sendMessage}>
            <div id='in-box'>
              <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder='Enter message' />
              <button id='send-btn' type='submit'><SendIcon /></button>
            </div>
          </form>
        </>) : <h2 className='welcome'>Aaha olop Bartalaap koru</h2>}
      </main>
    </div>
  );
}
