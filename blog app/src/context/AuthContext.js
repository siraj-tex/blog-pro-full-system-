import React, { createContext, useContext, useState, useEffect } from 'react';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from 'firebase/auth';
import API from '../config/api';
import { registerForPushNotificationsAsync } from '../utils/notifications';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          console.log('Registering for push notifications...');
          const pushToken = await registerForPushNotificationsAsync();
          console.log('Push Token obtained:', pushToken);
          
          const { data } = await API.post('/auth/register', {
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            expoPushToken: pushToken,
          });
          console.log('User synced with backend, push token stored.');
          setDbUser(data.user);
        } catch (err) {
          console.error('Error syncing user in RN:', err);
        }
      } else {
        setUser(null);
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
  
  const signup = async (email, password, displayName) => {
    const res = await createUserWithEmailAndPassword(auth, email, password);
    // Profile update isn't directly supported here without an extra firebase auth call in RN,
    // so we handle it gracefully or rely on backend sync
    return res;
  };

  const logout = () => signOut(auth);

  const value = {
    user,
    dbUser,
    loading,
    login,
    signup,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
