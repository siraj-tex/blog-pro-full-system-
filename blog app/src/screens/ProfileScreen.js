import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen({ navigation }) {
  const { user, dbUser, logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.headerTitle}>Profile</Text>
      
      {user ? (
        <View style={styles.content}>
          <View style={styles.avatarContainer}>
            {dbUser?.photoURL ? (
              <Image source={{ uri: dbUser.photoURL }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>{dbUser?.displayName?.charAt(0) || user.email.charAt(0)}</Text>
              </View>
            )}
          </View>
          <Text style={styles.name}>{dbUser?.displayName || 'User'}</Text>
          <Text style={styles.email}>{user.email}</Text>
          
          <TouchableOpacity style={[styles.btn, styles.logoutBtn]} onPress={handleLogout}>
            <Text style={styles.logoutBtnText}>Log Out</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.contentCentered}>
          <Text style={styles.promptText}>Sign in to comment and like posts</Text>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}>
            <Text style={styles.btnText}>Log In</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.btn, styles.outlineBtn]} onPress={() => navigation.navigate('Signup')}>
            <Text style={styles.outlineBtnText}>Create Account</Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  headerTitle: { fontSize: 24, fontWeight: 'bold', padding: 16, color: '#333' },
  content: { padding: 24, alignItems: 'center' },
  contentCentered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  avatarContainer: { marginBottom: 16 },
  avatar: { width: 100, height: 100, borderRadius: 50 },
  avatarPlaceholder: { backgroundColor: '#6366f1', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 40, fontWeight: 'bold' },
  name: { fontSize: 22, fontWeight: 'bold', color: '#333', marginBottom: 4 },
  email: { fontSize: 16, color: '#666', marginBottom: 32 },
  promptText: { fontSize: 16, color: '#666', marginBottom: 24, textAlign: 'center' },
  btn: { backgroundColor: '#6366f1', width: '100%', padding: 16, borderRadius: 12, alignItems: 'center', marginBottom: 12 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  outlineBtn: { backgroundColor: 'transparent', borderWidth: 2, borderColor: '#6366f1' },
  outlineBtnText: { color: '#6366f1', fontSize: 16, fontWeight: 'bold' },
  logoutBtn: { backgroundColor: '#fee2e2' },
  logoutBtnText: { color: '#ef4444', fontSize: 16, fontWeight: 'bold' }
});
