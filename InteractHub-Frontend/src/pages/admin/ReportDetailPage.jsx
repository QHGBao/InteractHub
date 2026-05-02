import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { deletePost, getReportDetail, resolveReport } from '../../api/adminApi';

const Field = ({ label, value }) => (
    <div style={{ marginBottom: 12 }}>
        <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
            {label}
        </span>
        <p style={{ margin: '4px 0 0', color: '#e5e7eb', fontSize: 14 }}>{value || '—'}</p>
    </div>
);

const ReportDetailPage = () => {
    const { reportId } = useParams();
    const navigate     = useNavigate();
    const [report, setReport]       = useState(null);
    const [loading, setLoading]     = useState(true);
    const [actionNote, setActionNote] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [error, setError]         = useState('');

    useEffect(() => {
        getReportDetail(reportId)
            .then(res => setReport(res.data.data))
            .catch(() => setError('Không thể tải chi tiết báo cáo.'))
            .finally(() => setLoading(false));
    }, [reportId]);

    const handleResolve = async (status) => {
        setSubmitting(true);
        try {
            await resolveReport(reportId, { status, adminNote: actionNote });
            navigate('/admin/reports');
        } catch {
            setError('Xử lý thất bại, thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleDeletePost = async () => {
        if (!window.confirm('Xoá bài viết này và đóng tất cả báo cáo liên quan?')) return;
        setSubmitting(true);
        try {
            await deletePost(report.postId);
            navigate('/admin/reports');
        } catch {
            setError('Xoá bài viết thất bại, thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) return <p style={{ padding: 32, color: '#9ca3af' }}>Đang tải...</p>;
    if (error)   return <p style={{ padding: 32, color: '#f87171' }}>{error}</p>;
    if (!report) return null;

    const isPending = report.status === 'Pending';

    return (
        <div style={{ padding: 32, maxWidth: 800, background: '#111827', minHeight: '100vh' }}>
            {/* Back */}
            <button onClick={() => navigate('/admin/reports')} style={{
                background: 'none', border: 'none', color: '#a78bfa',
                cursor: 'pointer', fontSize: 14, marginBottom: 20, padding: 0,
            }}>
                ← Quay lại danh sách
            </button>

            <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 24, color: '#f9fafb' }}>
                Chi tiết báo cáo
            </h1>

            {/* Nội dung bài viết */}
            <section style={{
                background: '#1f2937', borderRadius: 10, padding: 24,
                boxShadow: '0 1px 4px rgba(0,0,0,0.4)', marginBottom: 20,
            }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#d1d5db' }}>
                    Bài viết bị báo cáo
                </h2>
                <Field label="Tác giả"    value={report.postAuthorName} />
                <Field label="Nội dung"   value={report.postContent} />
                {report.postImageUrl && (
                    <div style={{ marginTop: 12 }}>
                        <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase' }}>Ảnh đính kèm</span>
                        <img src={report.postImageUrl} alt="post" style={{ display: 'block', marginTop: 8, maxWidth: '100%', borderRadius: 8 }} />
                    </div>
                )}
            </section>

            {/* Thông tin báo cáo */}
            <section style={{
                background: '#1f2937', borderRadius: 10, padding: 24,
                boxShadow: '0 1px 4px rgba(0,0,0,0.4)', marginBottom: 20,
            }}>
                <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#d1d5db' }}>
                    Thông tin báo cáo
                </h2>
                <Field label="Người báo cáo" value={report.reporterName} />
                <Field label="Lý do"          value={report.reason} />
                <Field label="Trạng thái"     value={report.status} />
                <Field label="Ghi chú Admin"  value={report.adminNote} />
                <Field label="Thời gian"      value={new Date(report.createdAt).toLocaleString('vi-VN')} />
            </section>

            {/* Hành động */}
            {isPending && (
                <section style={{
                    background: '#1f2937', borderRadius: 10, padding: 24,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.4)',
                }}>
                    <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#d1d5db' }}>
                        Xử lý báo cáo
                    </h2>

                    <textarea
                        placeholder="Ghi chú của Admin (tuỳ chọn)..."
                        value={actionNote}
                        onChange={e => setActionNote(e.target.value)}
                        rows={3}
                        style={{
                            width: '100%', padding: '10px 14px', borderRadius: 8,
                            border: '1px solid #374151', fontSize: 14, resize: 'vertical',
                            marginBottom: 16, boxSizing: 'border-box',
                            background: '#111827', color: '#f9fafb',
                        }}
                    />

                    {error && <p style={{ color: '#f87171', marginBottom: 12, fontSize: 14 }}>{error}</p>}

                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <button onClick={handleDeletePost} disabled={submitting} style={{
                            padding: '9px 20px', borderRadius: 8, border: 'none',
                            background: '#dc2626', color: '#fff', fontWeight: 600,
                            cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 14,
                            opacity: submitting ? 0.6 : 1,
                        }}>
                            Xoá bài viết vi phạm
                        </button>

                        <button onClick={() => handleResolve('Reviewed')} disabled={submitting} style={{
                            padding: '9px 20px', borderRadius: 8, border: 'none',
                            background: '#059669', color: '#fff', fontWeight: 600,
                            cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 14,
                            opacity: submitting ? 0.6 : 1,
                        }}>
                            Đã xem xét (giữ bài)
                        </button>

                        <button onClick={() => handleResolve('Dismissed')} disabled={submitting} style={{
                            padding: '9px 20px', borderRadius: 8, border: '1px solid #374151',
                            background: '#111827', color: '#d1d5db', fontWeight: 600,
                            cursor: submitting ? 'not-allowed' : 'pointer', fontSize: 14,
                            opacity: submitting ? 0.6 : 1,
                        }}>
                            Bác bỏ báo cáo
                        </button>
                    </div>
                </section>
            )}
        </div>
    );
};

export default ReportDetailPage;