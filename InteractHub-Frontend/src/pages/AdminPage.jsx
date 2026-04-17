import { useState, useEffect } from "react";
import { useApp } from "../context/AppContext";
import Avatar from "../components/Shared/Avatar";
import Icon from "../components/Shared/Icon";
import { getUsers, getPosts } from "../services/adminService";

export default function AdminPage() {
  const app = useApp();
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [tab, setTab] = useState("overview");

  const [reportStatus, setReportStatus] = useState({});

  const reports = [
    { id: 1, reporter: "Trần Thị Lan", target: "Bài viết #142", reason: "Nội dung không phù hợp", time: "1 giờ trước", status: "pending" },
    { id: 2, reporter: "Lê Văn Đức", target: "Người dùng @spam123", reason: "Tài khoản spam", time: "3 giờ trước", status: "pending" },
    { id: 3, reporter: "Phạm Thu Hằng", target: "Bài viết #98", reason: "Vi phạm bản quyền", time: "1 ngày trước", status: "resolved" },
  ];

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [u, p] = await Promise.all([
        getUsers(),
        getPosts()
      ]);

      setUsers(u.data);
      setPosts(p.data);

    } catch (err) {
      app.toast("Không tải được dữ liệu admin", "error");
    }
  }


  return (
    <div className="page">
      <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:24}}>
        <h1 style={{fontFamily:'var(--font-head)',fontSize:22,fontWeight:700}}>Admin Dashboard</h1>
        <span className="badge badge-purple"><Icon name="shield" size={11}/> Admin</span>
      </div>

      <div className="stat-grid">
        {[['👥','Tổng người dùng','1,247','+12 hôm nay','badge-green'],['📝','Tổng bài viết','8,432','+87 hôm nay','badge-green'],['🚨','Báo cáo chờ','3','Cần xử lý','badge-red'],['⚡','Online ngay','89','Realtime','badge-purple']].map(([icon,label,val,sub,cls])=>(
          <div key={label} className="card stat-card">
            <div style={{fontSize:24,marginBottom:8}}>{icon}</div>
            <div className="stat-value">{val}</div>
            <div className="stat-label">{label}</div>
            <div className={`stat-change badge ${cls}`} style={{marginTop:8,display:'inline-flex'}}>{sub}</div>
          </div>
        ))}
      </div>

      <div className="tab-bar" style={{maxWidth:480,marginBottom:20}}>
        {[['overview','Tổng quan'],['users','Người dùng'],['reports','Báo cáo'],['content','Nội dung']].map(([k,v])=>(
          <div key={k} className={`tab-btn ${tab===k?'active':''}`} onClick={()=>setTab(k)}>{v}</div>
        ))}
      </div>

      {tab==='overview' && (
        <div className="grid-2">
          <div className="card" style={{padding:20}}>
            <div className="widget-title">Hoạt động gần đây</div>
            {[['👤','Người dùng mới đăng ký','Nguyễn Văn A','2 phút trước'],['📝','Bài viết mới','Trần Thị Lan đăng bài','5 phút trước'],['🚨','Báo cáo mới','Nội dung vi phạm #142','12 phút trước'],['💬','Bình luận','Hoàng Bảo Long bình luận','18 phút trước']].map(([icon,title,sub,time])=>(
              <div key={title} style={{display:'flex',gap:12,padding:'10px 0',borderBottom:'1px solid var(--border)'}}>
                <span style={{fontSize:20}}>{icon}</span>
                <div style={{flex:1}}>
                  <div style={{fontSize:13,fontWeight:500}}>{title}</div>
                  <div style={{fontSize:12,color:'var(--text3)'}}>{sub}</div>
                </div>
                <div style={{fontSize:11,color:'var(--text3)'}}>{time}</div>
              </div>
            ))}
          </div>
          <div className="card" style={{padding:20}}>
            <div className="widget-title">Thống kê tuần này</div>
            {[['Người dùng mới',78,100],['Bài viết tạo',342,500],['Lượt thích',1247,2000],['Bình luận',456,800]].map(([label,val,max])=>(
              <div key={label} style={{marginBottom:14}}>
                <div style={{display:'flex',justifyContent:'space-between',marginBottom:6}}>
                  <span style={{fontSize:13}}>{label}</span>
                  <span style={{fontSize:13,fontWeight:600,color:'var(--accent2)'}}>{val}</span>
                </div>
                <div className="progress"><div className="progress-fill" style={{width:`${val/max*100}%`}}/></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab==='users' && (
        <div className="card" style={{overflow:'hidden'}}>
          <table className="table">
            <thead>
              <tr><th>Người dùng</th><th>Email</th><th>Vai trò</th><th>Tham gia</th><th>Trạng thái</th><th></th></tr>
            </thead>
            <tbody>
              {users.map(u=>(
                <tr key={u.id}>
                  <td><div style={{display:'flex',gap:10,alignItems:'center'}}><Avatar user={u} size="sm"/><div><div style={{fontWeight:600,color:'var(--text)'}}>{u.DisplayName}</div><div style={{fontSize:11}}>@{u.UserName}</div></div></div></td>
                  <td>{u.UserName}@interacthub.io</td>
                  <td><span className={`badge ${u.role==='Admin'?'badge-purple':'badge-gray'}`}>{u.role}</span></td>
                  <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                  <td><span className="badge badge-green">Active</span></td>
                  <td><button className="btn btn-ghost btn-xs" onClick={()=>app.toast(`Đã ban ${u.DisplayName}`,'success')}>Ban</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==='reports' && (
        <div className="card" style={{overflow:'hidden'}}>
          <table className="table">
            <thead>
              <tr><th>Người báo cáo</th><th>Đối tượng</th><th>Lý do</th><th>Thời gian</th><th>Trạng thái</th><th>Hành động</th></tr>
            </thead>
            <tbody>
              {reports.map(r=>(
                <tr key={r.id}>
                  <td style={{color:'var(--text)',fontWeight:500}}>{r.reporter}</td>
                  <td>{r.target}</td>
                  <td>{r.reason}</td>
                  <td>{r.time}</td>
                  <td><span className={`badge ${reportStatus[r.id]==='resolved'||r.status==='resolved'?'badge-green':'badge-red'}`}>{reportStatus[r.id]==='resolved'||r.status==='resolved'?'Đã xử lý':'Chờ xử lý'}</span></td>
                  <td>
                    {(reportStatus[r.id]!=='resolved'&&r.status!=='resolved') && (
                      <button className="btn btn-success btn-xs" onClick={()=>{setReportStatus(p=>({...p,[r.id]:'resolved'}));app.toast('Đã xử lý báo cáo!','success')}}>Xử lý</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab==='content' && (
        <div className="card" style={{overflow:'hidden'}}>
          <table className="table">
            <thead><tr><th>Bài viết</th><th>Tác giả</th><th>Lượt thích</th><th>Bình luận</th><th>Hành động</th></tr></thead>
            <tbody>
              {posts.map(p=>(
                <tr key={p.id}>
                  <td style={{maxWidth:240,color:'var(--text)'}}><div style={{overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{p.content}</div></td>
                  <td>{p.author.displayName}</td>
                  <td>{p.likesCount}</td>
                  <td>{p.commentsCount}</td>
                  <td><button className="btn btn-danger btn-xs" onClick={()=>app.toast('Đã xóa bài viết!','success')}><Icon name="trash" size={12}/></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}