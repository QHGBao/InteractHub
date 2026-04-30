import { useState } from "react";
import PostCard from "./PostCard";

export default function PhotosTab({ posts }) {
    const [selectedPost, setSelectedPost] = useState(null);

    const photoPosts = posts.filter(p => p.imageUrl || p.ImageUrl);

    if (photoPosts.length === 0) {
        return (
            <div className="card" style={{ padding: 24, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>🖼️</div>
                <div style={{ color: "var(--text3)", fontSize: 14 }}>Chưa có ảnh nào</div>
            </div>
        );
    }

    return (
        <>
            {/* Grid ảnh */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 4,
                marginBottom: 16
            }}>
                {photoPosts.map((p, i) => (
                    <div
                        key={p.id || p.Id || i}
                        onClick={() => setSelectedPost(p)}
                        style={{
                            aspectRatio: "1",
                            overflow: "hidden",
                            cursor: "pointer",
                            borderRadius: 4,
                            position: "relative"
                        }}
                    >
                        <img
                            src={p.imageUrl || p.ImageUrl}
                            alt=""
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                                transition: "transform 0.2s"
                            }}
                            onMouseEnter={e => e.target.style.transform = "scale(1.05)"}
                            onMouseLeave={e => e.target.style.transform = "scale(1)"}
                        />
                    </div>
                ))}
            </div>

            {/* Modal */}
            {selectedPost && (
                <div
                    onClick={() => setSelectedPost(null)}
                    style={{
                        position: "fixed",
                        inset: 0,
                        background: "rgba(0,0,0,0.95)",
                        zIndex: 1000,
                        display: "flex"
                    }}
                >
                    {/* Ảnh */}
                    <div
                        style={{
                            flex: 2,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: "#000"
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <img
                            src={selectedPost.imageUrl || selectedPost.ImageUrl}
                            alt=""
                            style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "contain"
                            }}
                        />
                    </div>

                    {/* Sidebar */}
                    <div
                        style={{
                            width: 380,
                            background: "var(--bg2)",
                            overflowY: "auto",
                            borderLeft: "1px solid rgba(255,255,255,0.1)"
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <PostCard
                            post={{
                                ...selectedPost,
                                id: selectedPost.id || selectedPost.Id,
                                imageUrl: null,
                                content: selectedPost.content || selectedPost.Content,
                                likesCount: selectedPost.likesCount || selectedPost.LikesCount || 0,
                                commentsCount: selectedPost.commentsCount || selectedPost.CommentsCount || 0,
                                createdAt: selectedPost.createdAt,
                                author: selectedPost.author
                            }}
                        />
                    </div>

                    {/* Nút đóng */}
                    <button
                        onClick={() => setSelectedPost(null)}
                        style={{
                            position: "fixed", // 🔥 đổi từ absolute → fixed
                            top: 20,
                            left: 20,
                            width: 44,
                            height: 44,
                            borderRadius: "50%",
                            background: "rgba(0,0,0,0.6)",
                            color: "#fff",
                            fontSize: 22,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            cursor: "pointer",
                            border: "none",
                            zIndex: 2000 // 🔥 đảm bảo luôn nổi trên cùng
                        }}
                    >
                        ✕
                    </button>
                </div>
            )}
        </>
    );
}