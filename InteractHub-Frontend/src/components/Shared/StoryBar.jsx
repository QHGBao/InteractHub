import Avatar from "./Avatar";

export default function StoryBar({ stories = [], onViewStory }) {

  return (
    <div className="story-bar" style={{ display: "flex", gap: 12, marginBottom: 16 }}>

      {/* ADD STORY */}
      <div
        className="story-item"
        onClick={() => alert("Tạo story")}
      >
        <div className="story-ring add">
          <div className="story-inner">+</div>
        </div>
        <span>Thêm</span>
      </div>

      {/* LIST STORY */}
      {stories.map((s) => (
        <div
          key={s.id}
          className="story-item"
          onClick={() => onViewStory(s)}
        >
          <div className="story-ring">

            {/* 👇 HIỂN THỊ ẢNH STORY */}
            <div className="story-inner">
              {s.imageUrl ? (
                <img
                  src={s.imageUrl}
                  alt=""
                  style={{
                    width: 60,
                    height: 60,
                    objectFit: "cover",
                    borderRadius: "50%"
                  }}
                />
              ) : (
                <Avatar user={s.author || s.user} />
              )}
            </div>

          </div>

          <span className="story-name">
            {s.author?.displayName?.split(" ").pop() ||
             s.author?.name ||
             "User"}
          </span>
        </div>
      ))}

    </div>
  );
}