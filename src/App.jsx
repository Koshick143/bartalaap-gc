import React, { useEffect, useState, useRef } from 'react';
import { auth, firestore } from './firebase';
import { signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { collection, addDoc, serverTimestamp, orderBy, query, onSnapshot } from 'firebase/firestore';
import DrawerList from './components/DrawerList';
import SendButton from './components/SendButton';

import '../src/App.css';

export default function App() {
  
  const [user, setUser] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      setUser(user);
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

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
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

  return (
    <div className='main-con'>
      <header className='flex '>

        <div className='flex brand' >
          <img src="/logo2.0 (1).svg" id='logo' alt="" />
          <div>
          <h1 className='h-20 bg-red'>Bartalaap</h1>
          <p id='respo'> The Group Chat</p>
          </div>
         
        </div>
        
        {user ?  <DrawerList/>: <button className='sign-in' onClick={signInWithGoogle}>Sign In</button>}
       
      </header>

      <main >
        {user ? (<>
          <div className='display ' style={{ overflowY: 'auto' }}>
            {messages.map(({id, text, uid, displayName, photoURL}) =>(
              <div key={id} className={`message flex  ${uid === auth.currentUser.uid ? 'sent': 'recived' }`}>
                <img id='avatar' className='p-10'  src={photoURL} alt="Avatar" />
                <div>
                  <p className="sender ">{displayName}</p>
                  <p className="message-text">{text}</p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
          <form className='flex' onSubmit={sendMessage}>
            <div id='in-box'>
            <input value={message} onChange={(e) => setMessage(e.target.value)} placeholder='Enter message' />
            <SendButton  />
            </div>
           
          </form>
        </>): <h2 className='welcome'>Aaha olop Bartalaap koru</h2>}
      </main>
    </div>
  );
}



