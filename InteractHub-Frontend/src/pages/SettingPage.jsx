import { useState } from "react";
import { useApp } from "../context/AppContext";
import { useAuth } from "../context/AuthContext";
import Icon from "../components/Shared/Icon";

export default function SettingsPage() {

  const app = useApp();
  const { user, logout } = useAuth();

  const [toggles, setToggles] = useState({
    email: true,
    push: true,
    friend: true,
    post: false,
    dark: true,
    private: false,
  });

  const toggle = (k) =>
    setToggles((p) => ({ ...p, [k]: !p[k] }));

  const sections = [
    {
      title:'Tài khoản',
      items:[
        {
          key:'displayname',
          label:'Tên hiển thị',
          desc:'Tên hiển thị trên hồ sơ của bạn',
          type:'input',
          val:user?.displayName
        },
        {
          key:'email',
          label:'Email',
          desc:'Địa chỉ email đăng nhập',
          type:'input',
          val:user?.email
        },
        {
          key:'bio',
          label:'Bio',
          desc:'Giới thiệu ngắn về bản thân',
          type:'textarea',
          val:user?.bio
        },
      ]
    },
    {
      title:'Thông báo',
      items:[
        { key:'email', label:'Thông báo email', desc:'Nhận thông báo qua email' },
        { key:'push', label:'Push notification', desc:'Thông báo đẩy trên thiết bị' },
        { key:'friend', label:'Lời mời kết bạn', desc:'Thông báo khi có lời mời kết bạn' },
        { key:'post', label:'Bài viết mới', desc:'Thông báo khi bạn bè đăng bài' },
      ]
    },
    {
      title:'Quyền riêng tư',
      items:[
        { key:'private', label:'Tài khoản riêng tư', desc:'Chỉ bạn bè mới xem được hồ sơ' },
      ]
    },
    {
      title:'Giao diện',
      items:[
        { key:'dark', label:'Chế độ tối', desc:'Sử dụng giao diện tối' },
      ]
    },
  ];

  function saveSettings() {
    // sau này gọi API
    app.toast("Đã lưu cài đặt!", "success");
  }

  function handleLogout() {
    logout();
    app.toast("Đã đăng xuất", "success");
  }

  return (
    <div className="page" style={{maxWidth:680}}>

      <h1 style={{
        fontFamily:'var(--font-head)',
        fontSize:22,
        fontWeight:700,
        marginBottom:24
      }}>
        Cài đặt
      </h1>

      {sections.map(sec=>(
        <div key={sec.title} className="card" style={{padding:'0 20px',marginBottom:16}}>

          <div style={{
            padding:'16px 0 8px',
            fontFamily:'var(--font-head)',
            fontSize:14,
            fontWeight:700,
            color:'var(--accent2)'
          }}>
            {sec.title}
          </div>

          {sec.items.map(item=>(
            <div key={item.key} className="settings-row">

              <div>
                <div className="settings-label">
                  {item.label}
                </div>

                <div className="settings-desc">
                  {item.desc}
                </div>
              </div>

              {item.type==='input' ? (

                <input
                  className="input"
                  defaultValue={item.val}
                  style={{width:200}}
                />

              ) : item.type==='textarea' ? (

                <textarea
                  className="input"
                  defaultValue={item.val}
                  style={{width:200,minHeight:60,resize:'none'}}
                />

              ) : (

                <div
                  className={`toggle ${toggles[item.key]?'on':''}`}
                  onClick={()=>toggle(item.key)}
                />

              )}

            </div>
          ))}

        </div>
      ))}

      <div style={{display:'flex',gap:10}}>

        <button
          className="btn btn-primary"
          onClick={saveSettings}
        >
          Lưu thay đổi
        </button>

        <button
          className="btn btn-danger btn-sm"
          style={{marginLeft:'auto'}}
          onClick={handleLogout}
        >
          <Icon name="logout" size={14}/> Đăng xuất
        </button>

      </div>

    </div>
  );
}