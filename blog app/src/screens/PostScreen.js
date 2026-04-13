import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Image, ActivityIndicator, TouchableOpacity, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import RenderHtml from 'react-native-render-html';
import { useWindowDimensions } from 'react-native';
import API from '../config/api';
import { useAuth } from '../context/AuthContext';

export default function PostScreen({ route, navigation }) {
  const { slug } = route.params;
  const { width } = useWindowDimensions();
  const { user } = useAuth();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchPostData();
  }, [slug]);

  const fetchPostData = async () => {
    try {
      const [postRes, commentsRes] = await Promise.all([
        API.get(`/posts/${slug}`),
        // we'll get post data first to get its ID for comments
      ]);
      const postData = postRes.data.post;
      setPost(postData);
      
      if (postData) {
        const cRes = await API.get(`/comments/post/${postData._id}`);
        setComments(cRes.data.comments);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleComment = async () => {
    if (!commentText.trim()) return;
    setSubmitting(true);
    try {
      const { data } = await API.post(`/comments/${post._id}`, { content: commentText });
      setComments([data.comment, ...comments]);
      setCommentText('');
    } catch (e) {
      console.error(e);
      alert('Failed to add comment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#6366f1" />
      </SafeAreaView>
    );
  }

  if (!post) {
    return (
      <SafeAreaView style={styles.centerContainer}>
        <Text>Post not found.</Text>
      </SafeAreaView>
    );
  }

  const tagsStyles = {
    p: { fontSize: 16, lineHeight: 24, color: '#333', marginBottom: 16 },
    h1: { fontSize: 24, fontWeight: 'bold', marginVertical: 12 },
    h2: { fontSize: 20, fontWeight: 'bold', marginVertical: 12 },
    a: { color: '#6366f1' },
    img: { marginVertical: 16 }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {post.coverImage ? (
          <Image source={{ uri: post.coverImage }} style={styles.coverImage} />
        ) : null}
        
        <View style={styles.content}>
          <Text style={styles.category}>{post.category?.name}</Text>
          <Text style={styles.title}>{post.title}</Text>
          
          <View style={styles.authorSection}>
            {post.author?.photoURL ? (
              <Image source={{ uri: post.author.photoURL }} style={styles.authorAvatar} />
            ) : (
              <View style={[styles.authorAvatar, styles.avatarPlaceholder]}>
                <Text style={styles.avatarText}>{post.author?.displayName?.charAt(0) || 'A'}</Text>
              </View>
            )}
            <View>
              <Text style={styles.authorName}>{post.author?.displayName || 'Author'}</Text>
              <Text style={styles.postMeta}>{new Date(post.createdAt).toLocaleDateString()} · {post.views} views</Text>
            </View>
          </View>

          <RenderHtml
            contentWidth={width - 32}
            source={{ html: post.content }}
            tagsStyles={tagsStyles}
          />
        </View>

        <View style={styles.commentsSection}>
          <Text style={styles.commentsHeader}>Comments ({comments.length})</Text>
          
          {user ? (
            <View style={styles.commentForm}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                value={commentText}
                onChangeText={setCommentText}
                multiline
              />
              <TouchableOpacity 
                style={[styles.commentBtn, !commentText.trim() && styles.disabledBtn]} 
                onPress={handleComment}
                disabled={!commentText.trim() || submitting}
              >
                <Text style={styles.commentBtnText}>{submitting ? 'Posting...' : 'Post'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.loginPrompt}>
              <Text style={styles.loginPromptText}>Sign in to add a comment</Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={styles.loginLink}>Log In</Text>
              </TouchableOpacity>
            </View>
          )}

          {comments.map((comment) => (
            <View key={comment._id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                {comment.user?.photoURL ? (
                  <Image source={{ uri: comment.user.photoURL }} style={styles.commentAvatar} />
                ) : (
                  <View style={[styles.commentAvatar, styles.avatarPlaceholder]}>
                    <Text style={styles.avatarText}>{comment.user?.displayName?.charAt(0) || 'U'}</Text>
                  </View>
                )}
                <View>
                  <Text style={styles.commentAuthor}>{comment.user?.displayName || 'User'}</Text>
                  <Text style={styles.commentMeta}>{new Date(comment.createdAt).toLocaleDateString()}</Text>
                </View>
              </View>
              <Text style={styles.commentText}>{comment.content}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  centerContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  coverImage: { width: '100%', height: 250, resizeMode: 'cover' },
  content: { padding: 16 },
  category: { fontSize: 14, color: '#6366f1', textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 8 },
  title: { fontSize: 26, fontWeight: 'bold', color: '#1a1a2e', marginBottom: 16 },
  authorSection: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: '#eee' },
  authorAvatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  avatarPlaceholder: { backgroundColor: '#e2e8f0', justifyContent: 'center', alignItems: 'center' },
  avatarText: { fontSize: 20, color: '#64748b', fontWeight: 'bold' },
  authorName: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  postMeta: { fontSize: 13, color: '#888', marginTop: 2 },
  
  commentsSection: { padding: 16, backgroundColor: '#f8f9fa', flex: 1 },
  commentsHeader: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, color: '#333' },
  commentForm: { marginBottom: 24 },
  commentInput: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#ddd', borderRadius: 8, padding: 12, minHeight: 80, textAlignVertical: 'top', marginBottom: 12 },
  commentBtn: { backgroundColor: '#6366f1', padding: 12, borderRadius: 8, alignItems: 'center' },
  disabledBtn: { backgroundColor: '#a5a6f6' },
  commentBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  loginPrompt: { backgroundColor: '#e0e7ff', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 24 },
  loginPromptText: { color: '#4f46e5', marginBottom: 8 },
  loginLink: { color: '#4338ca', fontWeight: 'bold', fontSize: 16 },
  
  commentCard: { backgroundColor: '#fff', padding: 16, borderRadius: 8, marginBottom: 16, elevation: 1, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2 },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  commentAvatar: { width: 36, height: 36, borderRadius: 18, marginRight: 10 },
  commentAuthor: { fontSize: 14, fontWeight: 'bold', color: '#333' },
  commentMeta: { fontSize: 12, color: '#999' },
  commentText: { fontSize: 14, color: '#444', lineHeight: 20 }
});
