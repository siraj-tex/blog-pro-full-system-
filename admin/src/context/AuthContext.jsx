import { useState, useEffect } from 'react';
import { AuthContext } from './AuthContextObject';
import { auth } from '../config/firebase';
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import API from '../config/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [dbUser, setDbUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          // Sync/register user in MongoDB
          const { data } = await API.post('/auth/register', {
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
          });
          setDbUser(data.user);
        } catch (error) {
          console.error('Error syncing user:', error);
        }
      } else {
        setUser(null);
        setDbUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = (email, password) => {
    return signInWithEmailAndPassword(auth, email, password);
  };

  const logout = () => {
    return signOut(auth);
  };

  const value = {
    user,
    dbUser,
    loading,
    login,
    logout,
    isAdmin: dbUser?.isAdmin || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}
