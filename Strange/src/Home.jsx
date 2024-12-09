import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { auth, db } from '../src/firebase-config';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { 
  getDatabase, 
  ref, 
  onValue, 
  set, 
  onDisconnect, 
  serverTimestamp,
  query,
  orderByChild,
  equalTo
} from 'firebase/database';

function Home() {
  const [userName, setUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const navigate = useNavigate();
  
  // Get the database instance from Firebase
  const database = getDatabase();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Email verification check
        if (!user.emailVerified) {
          navigate('/verif');
          return;
        }

        try {
          // Fetch user data from Firestore
          const userDocRef = doc(db, 'users', user.uid);
          const userDoc = await getDoc(userDocRef);

          // Determine username
          const username = userDoc.exists() 
            ? userDoc.data().username || user.displayName 
            : user.displayName || 'Anonymous User';

          setUserName(username);

          // Create a more robust online status tracking
          const userStatusRef = ref(database, `status/${user.uid}`);

          // Setup connection monitoring
          const connectedRef = ref(database, '.info/connected');
          onValue(connectedRef, async (snapshot) => {
            if (snapshot.val() === true) {
              // Mark user as online
              await set(userStatusRef, {
                username: username,
                online: true,
                lastSeen: serverTimestamp()
              });

              // Ensure user is marked offline on disconnect
              onDisconnect(userStatusRef).set({
                username: username,
                online: false,
                lastSeen: serverTimestamp()
              });
            }
          });

          // Listen for online users
          const statusRef = ref(database, 'status');
          const unsubscribeStatus = onValue(statusRef, (snapshot) => {
            const onlineUsersList = [];
            snapshot.forEach((childSnapshot) => {
              const userData = childSnapshot.val();
              if (userData.online === true) {
                onlineUsersList.push(userData.username);
              }
            });

            // Remove duplicates and sort
            setOnlineUsers([...new Set(onlineUsersList)]);
          });

          // Cleanup function
          return () => {
            unsubscribeStatus();
            // Optional: Set user as offline when component unmounts
            set(userStatusRef, { 
              username: username,
              online: false,
              lastSeen: serverTimestamp() 
            });
          };

        } catch (error) {
          console.error('Error setting up user status:', error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate('/login');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        // Set user status to offline
        const userStatusRef = ref(database, `status/${user.uid}`);
        await set(userStatusRef, { 
          username: userName,
          online: false,
          lastSeen: serverTimestamp() 
        });

        // Sign out
        await auth.signOut();
        navigate('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div 
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          backgroundColor: '#1a0632',
          color: 'white',
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <div
      style={{
        textAlign: 'center',
        padding: '50px',
        backgroundColor: '#1a0632',
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <h1 style={{ color: '#ff5733', marginBottom: '20px' }}>
        Welcome, <span style={{ color: 'white' }}>{userName}</span>!
      </h1>
      <button
        onClick={handleLogout}
        style={{
          backgroundColor: '#ff5733',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
        }}
      >
        Logout
      </button>

      {/* Online Users List */}
      <div
        style={{
          marginTop: '50px',
          backgroundColor: '#f4f4f4',
          padding: '20px',
          borderRadius: '10px',
          width: '80%',
          maxWidth: '500px',
        }}
      >
        <h2 style={{ color: '#333' }}>Online Users:</h2>
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {onlineUsers.length > 0 ? (
            onlineUsers.map((user, index) => (
              <li 
                key={index} 
                style={{ 
                  marginBottom: '10px', 
                  color: '#ff5733',
                  fontWeight: 'bold'
                }}
              >
                {user}
              </li>
            ))
          ) : (
            <li style={{ color: '#333' }}>No users online</li>
          )}
        </ul>
      </div>
    </div>
  );
}

export default Home;




