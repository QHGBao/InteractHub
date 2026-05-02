import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useApp } from "../context/AppContext";
import StoryBar from "../components/Shared/StoryBar";
import CreatePost from "../components/Shared/CreatePost";
import PostCard from "../components/Shared/PostCard";
import Avatar from "../components/Shared/Avatar";
import { postApi } from "../api/postApi";
import { getTrending } from "../services/hashtagService";
import { getSuggestions } from "../services/friendService";
import { getFeedStories } from "../services/storyService";

export default function HomePage() {
  const { user: currentUser } = useAuth();
  const { toast } = useApp();

  const [posts, setPosts] = useState([]);
  const [trending, setTrending] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [storyViewer, setStoryViewer] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPage, setTotalPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [stories, setStories] = useState([]);

  useEffect(() => {
    loadData();
  }, [page]);

  async function loadData() {
    try {
      setLoading(true);
      const [postsData, trendingData, suggestionData, storiesData] =
        await Promise.all([
          postApi.getPosts(page, 30),
          getTrending(),
          getSuggestions(),
          getFeedStories(),
        ]);
      setPosts(postsData.posts || []);
      setTotalPage(postsData.totalPages || 1);
      setStories(storiesData || []);
      setTrending(trendingData.data || []);
      setSuggestions(suggestionData.data || []);
    } catch (err) {
      console.error(err);
      toast("Không tải được dữ liệu", "error");
    } finally {
      setLoading(false);
    }
  }

  function handleSharePost(newPost) {
    setPosts((prev) => [newPost, ...prev.slice(0, 29)]);
    toast("Đã chia sẻ bài viết!", "success");
  }
  
  async function handlePost(text, imageUrl = null) {
    try {
      const newPost = await postApi.createPost({ content: text, imageUrl });
      setPosts((prev) => [newPost, ...prev.slice(0, 29)]);
      toast("Đã đăng bài viết!", "success");
      loadData();
    } catch (err) {
      console.error(err);
      toast("Đăng bài thất bại", "error");
    }
  }

  function handlePostUpdate(updatedPost) {
    setPosts((prev) =>
      prev.map((p) => (p.id === updatedPost.id ? { ...p, ...updatedPost } : p))
    );
  }

  function handleDeletePost(postId) {
    setPosts((prev) => prev.filter((p) => p.id !== postId));
    loadData();
  }

  const trendingMax =
    trending.length > 0
      ? Math.max(...trending.map((t) => t.postCount ?? t.count ?? 0))
      : 1;

  return (
    <div className="page">

      {/* ── Story Viewer Modal ── */}
      {storyViewer && (
        <div className="story-viewer" onClick={() => setStoryViewer(null)}>
          {/* Progress bars */}
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: 3,
                  borderRadius: 2,
                  background: i === 1 ? "#fff" : "rgba(255,255,255,.3)",
                }}
              />
            ))}
          </div>

          {/* Author info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 16,
            }}
          >
            <Avatar user={storyViewer.author || storyViewer} />
            <div>
              <div style={{ fontWeight: 600 }}>
                {storyViewer.author?.displayName ||
                  storyViewer.author?.name ||
                  storyViewer.name}
              </div>
              <div style={{ fontSize: 12, color: "rgba(255,255,255,.6)" }}>
                2 giờ trước
              </div>
            </div>
          </div>

          {/* Story card */}
          <div
            style={{
              width: 360,
              maxWidth: "90vw",
              aspectRatio: "9/16",
              maxHeight: "65vh",
              borderRadius: 20,
              background: "linear-gradient(135deg,#2d1b6e,#1a3a5c)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
            }}
          >
            <Avatar user={storyViewer.author || storyViewer} size="xl" />
            <div style={{ fontSize: 16, fontWeight: 600 }}>
              {storyViewer.author?.displayName ||
                storyViewer.author?.name ||
                storyViewer.name}
            </div>
            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,.7)",
                textAlign: "center",
                padding: "0 24px",
              }}
            >
              {storyViewer.author?.bio || storyViewer.bio || ""}
            </div>
          </div>

          <div style={{ marginTop: 16, color: "rgba(255,255,255,.5)", fontSize: 13 }}>
            Nhấn để đóng
          </div>
        </div>
      )}

      {/* ── Main Layout ── */}
      <div className="feed-layout">

        {/* Left: Feed */}
        <div>
          <StoryBar stories={stories} onViewStory={setStoryViewer} onReload={loadData}/>
          <CreatePost currentUser={currentUser} onPost={handlePost} />

          {loading && (
            <div style={{ textAlign: "center", padding: "24px 0", color: "var(--text3)" }}>
              Đang tải...
            </div>
          )}

          {Array.isArray(posts) &&
            posts.map((p) => (
              <PostCard
                key={p.id}
                post={p}
                onUpdate={handlePostUpdate}
                onDelete={handleDeletePost}
                onShare={handleSharePost}
              />
            ))}

          {/* Pagination */}
          {totalPage > 1 && (
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                marginTop: 16,
              }}
            >
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn btn-sm"
              >
                Trước
              </button>
              <span style={{ padding: "0 12px", lineHeight: "32px" }}>
                Trang {page} / {totalPage}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPage, p + 1))}
                disabled={page === totalPage}
                className="btn btn-sm"
              >
                Sau
              </button>
            </div>
          )}
        </div>

        {/* Right: Widgets */}
        <div className="right-col">

          {/* ── Trending Widget ── */}
          <div className="card widget" style={{ marginBottom: 12 }}>
            <div className="widget-title">📈 Trending</div>

            {Array.isArray(trending) &&
              trending.map((t, i) => {
                const count = t.postCount ?? t.count ?? 0;
                const pct = Math.round((count / trendingMax) * 100);
                const isTop = i < 3;
                return (
                  <div key={t.id ?? i} className="trend-item">
                    {/* Rank */}
                    <div
                      className="trend-rank"
                      style={{
                        color: isTop ? "var(--color-warning, #f59e0b)" : "var(--text3)",
                      }}
                    >
                      #{i + 1}
                    </div>

                    {/* Tag info */}
                    <div className="trend-info" style={{ flex: 1 }}>
                      <div className="trend-tag">#{t.name ?? t.tag}</div>
                      <div className="trend-count">
                        {count.toLocaleString("vi-VN")} bài viết
                      </div>
                      {/* Progress bar */}
                      <div
                        style={{
                          marginTop: 5,
                          height: 3,
                          borderRadius: 2,
                          background: "var(--border-color, rgba(0,0,0,.08))",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            borderRadius: 2,
                            background: isTop
                              ? "var(--color-warning, #f59e0b)"
                              : "var(--primary, #6366f1)",
                            transition: "width 0.4s ease",
                          }}
                        />
                      </div>
                    </div>

                    {/* Arrow indicator */}
                    <span
                      style={{
                        fontSize: 11,
                        marginLeft: 6,
                        color: isTop
                          ? "var(--color-success, #22c55e)"
                          : "var(--text3)",
                      }}
                    >
                      {isTop ? "▲" : "→"}
                    </span>
                  </div>
                );
              })}
          </div>

        </div>
      </div>
    </div>
  );
}