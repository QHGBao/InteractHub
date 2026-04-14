const Avatar = ({ src, name, size = 'md' }) => {
  const sizeMap = { sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-xl' };
  const initials = name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  if (src) return <img src={src} alt={name} className={`${sizeMap[size]} rounded-full object-cover`} />;

  return (
    <div className={`${sizeMap[size]} rounded-full bg-blue-500 flex items-center justify-center text-white font-medium`}>
      {initials}
    </div>
  );
};
export default Avatar;