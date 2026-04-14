import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image, RefreshControl } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import API from '../config/api';

export default function HomeScreen({ navigation }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPosts = async () => {
    try {
      const { data } = await API.get('/posts?limit=15');
      setPosts(data.posts);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPosts();
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.card}
      onPress={() => navigation.navigate('PostDetail', { slug: item.slug })}
    >
      {item.coverImage ? (
        <Image source={{ uri: item.coverImage }} style={styles.image} />
      ) : null}
      <View style={styles.content}>
        <Text style={styles.category}>{item.category?.name || 'Uncategorized'}</Text>
        <Text style={styles.title} numberOfLines={2}>{item.title}</Text>
        <Text style={styles.excerpt} numberOfLines={2}>{item.excerpt}</Text>
        <View style={styles.meta}>
          <Text style={styles.metaText}>{new Date(item.createdAt).toLocaleDateString()}</Text>
          <Text style={styles.metaText}>{item.views} views</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Image 
          source={require('../../assets/icon.png')} 
          style={styles.logo} 
        />
        <Text style={styles.headerTitle}>NovaByte</Text>
      </View>
      {loading ? (
        <ActivityIndicator size="large" color="#6366f1" style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => item._id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 50 }}>No posts available.</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    paddingHorizontal: 16, 
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  logo: { width: 32, height: 32, borderRadius: 8, marginRight: 10 },
  headerTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a2e' },
  list: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 12, overflow: 'hidden', marginBottom: 20, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  image: { width: '100%', height: 200, resizeMode: 'cover' },
  content: { padding: 16 },
  category: { fontSize: 12, color: '#6366f1', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 8 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 8 },
  excerpt: { fontSize: 14, color: '#666', marginBottom: 12, lineHeight: 20 },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { fontSize: 12, color: '#999' }
});
