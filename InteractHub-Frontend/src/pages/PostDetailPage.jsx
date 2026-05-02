import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import PostCard from '../components/Shared/PostCard';
import { postApi } from '../api/postApi';

export default function PostDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);  // ← 1 object, không phải array
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadPost();
  }, [id]);

  async function loadPost() {
    try {
      setLoading(true);
      const res = await postApi.getPost(id);
      console.log('Post data:', res);
      setPost(res);  // ← res là object trực tiếp, không phải array
    } catch (err) {
      setError('Không tìm thấy bài viết');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return (
    <div className="page">
      <div style={{ textAlign: 'center', padding: 40, color: 'var(--text3)' }}>
        Đang tải...
      </div>
    </div>
  );

  if (error || !post) return (
    <div className="page">
      <div style={{ textAlign: 'center', padding: 40, color: 'var(--danger)' }}>
        {error || 'Không tìm thấy bài viết'}
      </div>
      <div style={{ textAlign: 'center' }}>
        <button className="btn btn-ghost btn-sm" onClick={() => navigate('/')}>
          ← Về trang chủ
        </button>
      </div>
    </div>
  );

  return (
    <div className="page" style={{ maxWidth: 640, margin: '0 auto' }}>
      <button
        className="btn btn-ghost btn-sm"
        onClick={() => navigate(-1)}
        style={{ marginBottom: 16 }}
      >
        ← Quay lại
      </button>

      <PostCard
        post={post}
        onUpdate={(updated) => setPost(prev => ({ ...prev, ...updated }))}
        onDelete={() => navigate('/')}
        onShare={(newPost) => navigate('/')}
      />
    </div>
  );
}