import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getReports } from '../../api/adminApi';

const STATUS_TABS = ['Pending', 'Reviewed', 'Dismissed'];

const REASON_LABEL = {
    Spam: 'Spam',
    HateSpeech: 'Ngôn từ thù ghét',
    Violence: 'Bạo lực',
    Nudity: 'Nội dung nhạy cảm',
    FakeNews: 'Tin giả',
    Other: 'Khác',
};

const StatusBadge = ({ status }) => {
    const colors = {
        Pending:   { bg: '#78350f', color: '#fcd34d' },
        Reviewed:  { bg: '#064e3b', color: '#6ee7b7' },
        Dismissed: { bg: '#374151', color: '#d1d5db' },
    };
    const s = colors[status] || colors.Dismissed;
    return (
        <span style={{
            background: s.bg, color: s.color,
            padding: '2px 10px', borderRadius: 12, fontSize: 12, fontWeight: 600,
        }}>
            {status}
        </span>
    );
};

const ReportListPage = () => {
    const [activeTab, setActiveTab] = useState('Pending');
    const [reports, setReports]     = useState([]);
    const [loading, setLoading]     = useState(false);
    const [error, setError]         = useState('');
    const navigate = useNavigate();

    const fetchReports = async (status) => {
        setLoading(true);
        setError('');
        try {
            const res = await getReports(status);
            setReports(res.data.data);
        } catch {
            setError('Không thể tải danh sách báo cáo.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchReports(activeTab); }, [activeTab]);

    return (
        <div style={{ padding: 32, background: '#111827', minHeight: '100vh' }}>
            <h1 style={{ fontSize: 22, fontWeight: 700, marginBottom: 24, color: '#f9fafb' }}>
                Báo cáo bài viết
            </h1>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                {STATUS_TABS.map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} style={{
                        padding: '7px 20px', borderRadius: 20, border: 'none', cursor: 'pointer',
                        fontWeight: 600, fontSize: 13,
                        background: activeTab === tab ? '#7c3aed' : '#1f2937',
                        color:      activeTab === tab ? '#fff'    : '#d1d5db',
                    }}>
                        {tab}
                    </button>
                ))}
            </div>

            {/* Table */}
            {loading && <p style={{ color: '#9ca3af' }}>Đang tải...</p>}
            {error   && <p style={{ color: '#f87171' }}>{error}</p>}

            {!loading && !error && (
                <div style={{ background: '#1f2937', borderRadius: 10, overflow: 'hidden', boxShadow: '0 1px 4px rgba(0,0,0,0.4)' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
                        <thead>
                            <tr style={{ background: '#111827', borderBottom: '1px solid #374151' }}>
                                {['Người báo cáo', 'Lý do', 'Nội dung bài viết', 'Thời gian', 'Trạng thái', ''].map(h => (
                                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontWeight: 600, color: '#d1d5db', whiteSpace: 'nowrap' }}>
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {reports.length === 0 && (
                                <tr>
                                    <td colSpan={6} style={{ padding: 32, textAlign: 'center', color: '#6b7280' }}>
                                        Không có báo cáo nào.
                                    </td>
                                </tr>
                            )}
                            {reports.map(r => (
                                <tr key={r.id} style={{ borderBottom: '1px solid #374151' }}
                                    onMouseEnter={e => e.currentTarget.style.background = '#111827'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                                    <td style={{ padding: '12px 16px', fontWeight: 500, color: '#f3f4f6' }}>
                                        {r.reporterName}
                                    </td>
                                    <td style={{ padding: '12px 16px', color: '#9ca3af' }}>
                                        {REASON_LABEL[r.reason] || r.reason}
                                    </td>
                                    <td style={{ padding: '12px 16px', maxWidth: 300, color: '#d1d5db' }}>
                                        <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                                            {r.postContent}
                                        </span>
                                    </td>
                                    <td style={{ padding: '12px 16px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                                        {new Date(r.createdAt).toLocaleDateString('vi-VN')}
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <StatusBadge status={r.status} />
                                    </td>
                                    <td style={{ padding: '12px 16px' }}>
                                        <button onClick={() => navigate(`/admin/reports/${r.id}`)} style={{
                                            padding: '5px 14px', borderRadius: 6, border: '1px solid #a78bfa',
                                            background: 'transparent', color: '#a78bfa', cursor: 'pointer', fontSize: 13,
                                        }}>
                                            Xem chi tiết
                                        </button>
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

export default ReportListPage;