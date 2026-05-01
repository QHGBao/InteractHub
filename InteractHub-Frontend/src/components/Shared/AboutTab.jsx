import { useState } from "react";
import { updateProfile } from "../../api/userApi";
import { useApp } from "../../context/AppContext";

export default function AboutTab({ user, isOwn, onUpdate }) {
    const { toast } = useApp();
    const [editing, setEditing] = useState(false);
    const [bio, setBio] = useState(user.bio || "");
    const [school, setSchool] = useState(user.school || "");
    const [gender, setGender] = useState(user.gender || "");
    const [links, setLinks] = useState(() => {
        try { return JSON.parse(user.socialLinks || "[]"); }
        catch { return []; }
    });
    const [saving, setSaving] = useState(false);

    function handleAddLink() {
        if (links.length >= 5) return;
        setLinks([...links, ""]);
    }
    function handleLinkChange(i, val) {
        const updated = [...links];
        updated[i] = val;
        setLinks(updated);
    }
    function handleRemoveLink(i) {
        setLinks(links.filter((_, idx) => idx !== i));
    }
    async function handleSave() {
        try {
            setSaving(true);
            const cleanLinks = links.filter(l => l.trim() !== "");
            await updateProfile({ bio, school, gender, socialLinks: JSON.stringify(cleanLinks) });
            toast("Đã lưu thông tin!", "success");
            setEditing(false);
            onUpdate && onUpdate();
        } catch (err) {
            console.error(err);
            toast("Lưu thất bại", "error");
        } finally {
            setSaving(false);
        }
    }

    const displayLinks = (() => {
        try { return JSON.parse(user.socialLinks || "[]"); }
        catch { return []; }
    })();

    const genderLabel = user.gender === "male" ? "Nam"
        : user.gender === "female" ? "Nữ"
        : user.gender === "other" ? "Khác" : null;

    function LinkItem({ href, children }) {
        return (
            <a href={href} target="_blank" rel="noopener noreferrer"
                style={{ fontSize: 14, color: "var(--accent)", textDecoration: "none", wordBreak: "break-all" }}>
                {children}
            </a>
        );
    }

    return (
        <div className="card" style={{ padding: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <h3 style={{ fontFamily: "var(--font-head)", fontSize: 16, fontWeight: 700 }}>Giới thiệu</h3>
                {isOwn && !editing && (
                    <button className="btn btn-ghost btn-sm" onClick={() => setEditing(true)}>
                        Chinh sua
                    </button>
                )}
            </div>

            {editing ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                        <label style={{ fontSize: 13, color: "var(--text3)", marginBottom: 6, display: "block" }}>Tieu su</label>
                        <textarea value={bio} onChange={e => setBio(e.target.value)} maxLength={300} rows={3}
                            placeholder="Viet gi do ve ban than..."
                            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg3)", color: "var(--text)", fontSize: 14, resize: "vertical" }}
                        />
                        <div style={{ fontSize: 11, color: "var(--text3)", textAlign: "right" }}>{bio.length}/300</div>
                    </div>

                    <div>
                        <label style={{ fontSize: 13, color: "var(--text3)", marginBottom: 6, display: "block" }}>Truong hoc</label>
                        <input type="text" value={school} onChange={e => setSchool(e.target.value)} maxLength={200}
                            placeholder="Ten truong..."
                            style={{ width: "100%", padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg3)", color: "var(--text)", fontSize: 14 }}
                        />
                    </div>

                    <div>
                        <label style={{ fontSize: 13, color: "var(--text3)", marginBottom: 6, display: "block" }}>Gioi tinh</label>
                        <select value={gender} onChange={e => setGender(e.target.value)}
                            style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg3)", color: "var(--text)", fontSize: 14, width: "100%" }}>
                            <option value="">-- Chon gioi tinh --</option>
                            <option value="male">Nam</option>
                            <option value="female">Nu</option>
                            <option value="other">Khac</option>
                        </select>
                    </div>

                    <div>
                        <label style={{ fontSize: 13, color: "var(--text3)", marginBottom: 6, display: "block" }}>Lien ket ({links.length}/5)</label>
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {links.map((link, i) => (
                                <div key={i} style={{ display: "flex", gap: 8 }}>
                                    <input type="url" value={link} onChange={e => handleLinkChange(i, e.target.value)}
                                        placeholder="https://..."
                                        style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--bg3)", color: "var(--text)", fontSize: 14 }}
                                    />
                                    <button className="btn btn-danger btn-sm" onClick={() => handleRemoveLink(i)}>X</button>
                                </div>
                            ))}
                            {links.length < 5 && (
                                <button className="btn btn-ghost btn-sm" onClick={handleAddLink} style={{ alignSelf: "flex-start" }}>
                                    + Them lien ket
                                </button>
                            )}
                        </div>
                    </div>

                    <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setEditing(false)}>Huy</button>
                        <button className="btn btn-primary btn-sm" onClick={handleSave} disabled={saving}>
                            {saving ? "Dang luu..." : "Luu"}
                        </button>
                    </div>
                </div>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    <div>
                        <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 4 }}>Tieu su</div>
                        <div style={{ fontSize: 14, color: "var(--text2)", lineHeight: 1.7 }}>
                            {user.bio || "Chua co tieu su"}
                        </div>
                    </div>

                    {user.school && (
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span>🎓</span>
                            <span style={{ fontSize: 14 }}>{user.school}</span>
                        </div>
                    )}

                    {genderLabel && (
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <span>👤</span>
                            <span style={{ fontSize: 14 }}>{genderLabel}</span>
                        </div>
                    )}

                    {displayLinks.length > 0 && (
                        <div>
                            <div style={{ fontSize: 13, color: "var(--text3)", marginBottom: 8 }}>Lien ket</div>
                            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                                {displayLinks.map((link, i) => (
                                    <LinkItem key={i} href={link}>{link}</LinkItem>
                                ))}
                            </div>
                        </div>
                    )}

                    {!user.bio && !user.school && !genderLabel && displayLinks.length === 0 && (
                        <div style={{ color: "var(--text3)", fontSize: 14 }}>Chua co thong tin gioi thieu</div>
                    )}
                </div>
            )}
        </div>
    );
}