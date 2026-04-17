import Avatar from "./Avatar";

export default function StoryBar({ stories = [], onViewStory }) {

  return (
    <div className="story-bar" style={{ marginBottom: 16 }}>
      
      {/* Add Story */}
      <div className="story-item">
        <div className="story-ring add">
          <div className="story-inner" style={{ fontSize: 24, color: "var(--text3)" }}>
            +
          </div>
        </div>
        <span className="story-name">Thêm story</span>
      </div>

      {stories.map((s) => (
        <div
          key={s.id}
          className="story-item"
          onClick={() => onViewStory && onViewStory(s)}
        >
          <div className="story-ring">
            <div className="story-inner">
              <Avatar user={s.author} />
            </div>
          </div>

          <span className="story-name">
            {s.author?.displayName?.split(" ").pop()}
          </span>
        </div>
      ))}
    </div>
  );
}