import { useState, useEffect, useCallback } from 'react';
import API from '../config/api';
import { HiOutlineDocumentText, HiOutlineEye, HiOutlineHeart, HiOutlineChatBubbleLeftRight, HiOutlineUsers } from 'react-icons/hi2';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = useCallback(async () => {
    try {
      const { data } = await API.get('/stats');
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  if (loading) {
    return <div className="page-loader"><div className="loader"></div></div>;
  }

  const statCards = [
    { label: 'Total Posts', value: stats?.totalPosts || 0, icon: <HiOutlineDocumentText />, color: '#6366f1' },
    { label: 'Total Views', value: stats?.totalViews || 0, icon: <HiOutlineEye />, color: '#8b5cf6' },
    { label: 'Total Likes', value: stats?.totalLikes || 0, icon: <HiOutlineHeart />, color: '#ec4899' },
    { label: 'Comments', value: stats?.totalComments || 0, icon: <HiOutlineChatBubbleLeftRight />, color: '#14b8a6' },
    { label: 'Users', value: stats?.totalUsers || 0, icon: <HiOutlineUsers />, color: '#f59e0b' },
  ];

  const chartData = stats?.postsPerMonth?.map((item) => ({
    month: item._id,
    posts: item.count,
  })) || [];

  return (
    <div className="dashboard-page">
      <h1 className="page-title">Dashboard</h1>
      
      <div className="stats-grid">
        {statCards.map((card) => (
          <div key={card.label} className="stat-card" style={{ '--accent': card.color }}>
            <div className="stat-icon" style={{ background: `${card.color}20`, color: card.color }}>
              {card.icon}
            </div>
            <div className="stat-info">
              <span className="stat-value">{card.value}</span>
              <span className="stat-label">{card.label}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-card chart-card">
          <h3>Posts Per Month</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d2d3f" />
                <XAxis dataKey="month" stroke="#888" />
                <YAxis stroke="#888" />
                <Tooltip 
                  contentStyle={{ background: '#1e1e2e', border: '1px solid #333', borderRadius: '8px' }}
                  labelStyle={{ color: '#fff' }}
                />
                <Bar dataKey="posts" fill="#6366f1" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="empty-text">No data yet. Start creating posts!</p>
          )}
        </div>

        <div className="dashboard-card">
          <h3>Recent Posts</h3>
          <div className="recent-list">
            {stats?.recentPosts?.length > 0 ? (
              stats.recentPosts.map((post) => (
                <div key={post._id} className="recent-item">
                  <div className="recent-info">
                    <span className="recent-title">{post.title}</span>
                    <span className="recent-meta">
                      {new Date(post.createdAt).toLocaleDateString()} · {post.views} views
                    </span>
                  </div>
                  <span className={`status-badge ${post.status}`}>{post.status}</span>
                </div>
              ))
            ) : (
              <p className="empty-text">No posts yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
