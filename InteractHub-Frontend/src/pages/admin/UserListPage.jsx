import { useEffect, useState } from 'react';
import { getUsers, setUserActive } from '../../api/adminApi';

const Avatar = ({ name, avatarUrl }) => (
    avatarUrl
        ? <img src={avatarUrl} alt={name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
        : <div style={{
            width: 36, height: 36, borderRadius: '50%',
            background: '#312e81', color: '#c4b5fd',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: 15,
          }}>
            {name?.[0]?.toUpperCase() || '?'}
          </div>
);

const UserListPage = () => {
    const [users, setUsers]       = useState([]);
    const [filter, setFilter]     = useState('all');
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');
    const [search, setSearch]     = useState('');

    const fetchUsers = async (f) => {
        setLoading(true);
        setError('');
        try {
            const isActive = f === 'all' ? undefined : f === 'active';
            const res = await getUsers(isActive);
            setUsers(res.data.data);
        } catch {
            setError('Không thể tải danh sách người dùng.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchUsers(filter); }, [filter]);

    const handleToggleActive = async (userId, currentActive) => {
        const action = currentActive ? 'khoá' : 'mở khoá';
        if (!window.confirm(`Bạn có chắc muốn ${action} tài khoản này?`)) return;
        try {
            await setUserActive(userId, !currentActive);
            setUsers(prev => prev.map(u =>
                u.id === userId ? { ...u, isActive: !currentActive } : u
            ));
        } catch {
            alert('Thao tác thất bại, thử lại.');
        }
    };

    const filtered = users.filter(u =>
        u.displayName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ padding: 32, background: '#111827', minHeight: '100vh' }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: '#f9fafb' }}>
                Quản lý người dùng
            </h1>

            {/* Toolbar */}
            <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
                {/* Filter tabs */}
                <div style={{ display: 'flex', gap: 8 }}>
                    {[['all', 'Tất cả'], ['active', 'Đang hoạt động'], ['locked', 'Đã khoá']].map(([val, label]) => (
                        <button key={val} onClick={() => setFilter(val)} style={{
                            padding: '7px 16px', borderRadius: 20, border: 'none', cursor: 'pointer',
                            fontWeight: 600, fontSize: 13,
                            background: filter === val ? '#7c3aed' : '#1f2937',
                            color:      filter === val ? '#fff'    : '#d1d5db',
                        }}>
                            {label}
                        </button>
                    ))}
                </div>

                {/* Search */}
                <input
                    type="text"
                    placeholder="Tìm theo tên hoặc email..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                        padding: '7px 14px', borderRadius: 8, border: '1px solid #374151',
                        fontSize: 14, minWidth: 240, marginLeft: 'auto',
                        background: '#111827', color: '#f9fafb',
                    }}
                />
            </div>

            {loading && <p style={{ color: '#9ca3af' }}>Đang tải...</p>}
            {error   && <p style={{ color: '#f87171' }}>{error}</p>}

            {!loading && !error && (
                <div style={{ background: '#1f2937', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ background: '#111827', borderBottom: '1px solid #374151' }}>
                                {['Người dùng', 'Email', 'Role', 'Bài viết', 'Bị báo cáo', 'Trạng thái', 'Hành động'].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#d1d5db', whiteSpace: 'nowrap' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={7} style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>
                                        Không có người dùng nào.
                                    </td>
                                </tr>
                            )}
                            {filtered.map(u => (
                                <tr key={u.id} style={{ borderBottom: '1px solid #374151' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#111827'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>

                                    {/* Người dùng */}
                                    <td style={{ padding: '12px 16px' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <Avatar name={u.displayName} avatarUrl={u.avatarUrl} />
                                            <div>
                                                <p style={{ margin: 0, fontWeight: 600, color: '#f9fafb' }}>{u.displayName}</p>
                                                <p style={{ margin: 0, fontSize: 12, color: '#9ca3af' }}>@{u.userName}</p>
                                            </div>
                                        </div>
                                    </td>

                                    <td style={{ padding: '12px 16px', color: '#9ca3af' }}>{u.email}</td>

                                    {/* Role */}
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{
                                            padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                                            background: u.role === 'Admin' ? '#312e81' : '#374151',
                                            color:      u.role === 'Admin' ? '#c4b5fd' : '#d1d5db',
                                        }}>
                                            {u.role}
                                        </span>
                                    </td>

                                    <td style={{ padding: '12px 16px', textAlign: 'center', color: '#e5e7eb' }}>{u.postsCount}</td>

                                    {/* Bị báo cáo */}
                                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                                        <span style={{
                                            color: u.reportsCount > 0 ? '#f87171' : '#6b7280',
                                            fontWeight: u.reportsCount > 0 ? 700 : 400,
                                        }}>
                                            {u.reportsCount}
                                        </span>
                                    </td>

                                    {/* Trạng thái */}
                                    <td style={{ padding: '12px 16px' }}>
                                        <span style={{
                                            padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
                                            background: u.isActive ? '#064e3b' : '#7f1d1d',
                                            color:      u.isActive ? '#6ee7b7' : '#fca5a5',
                                        }}>
                                            {u.isActive ? 'Hoạt động' : 'Đã khoá'}
                                        </span>
                                    </td>

                                    {/* Hành động */}
                                    <td style={{ padding: '12px 16px' }}>
                                        {u.role !== 'Admin' && (
                                            <button onClick={() => handleToggleActive(u.id, u.isActive)} style={{
                                                padding: '5px 14px', borderRadius: 6, fontSize: 13, cursor: 'pointer',
                                                border: `1px solid ${u.isActive ? '#f87171' : '#34d399'}`,
                                                background: 'transparent',
                                                color:      u.isActive ? '#f87171' : '#34d399',
                                                fontWeight: 600,
                                            }}>
                                                {u.isActive ? 'Khoá' : 'Mở khoá'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserListPage;