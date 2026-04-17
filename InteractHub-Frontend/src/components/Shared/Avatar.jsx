const AvatarColors = [
  '#7c6af7','#4ade80','#f87171',
  '#fbbf24','#60a5fa','#f472b6','#34d399'
];

function Avatar({ user, size='md' }) {
  if (!user) return null;

  const cls =
    size === 'sm' ? 'ava ava-sm' :
    size === 'lg' ? 'ava ava-lg' :
    size === 'xl' ? 'ava ava-xl' :
    'ava';

  const name = (user.name || '?').trim();

  const color =
    AvatarColors[
      name.charCodeAt(0) % AvatarColors.length
    ];

  const text = name.slice(0,2).toUpperCase();

  return (
    <div
      className={cls}
      style={{
        background: color + '22',
        border: `1.5px solid ${color}44`,
        color
      }}
    >
      {text}
    </div>
  );
}
export default Avatar;