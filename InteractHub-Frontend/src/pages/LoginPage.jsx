import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Icon from "../components/Shared/Icon";

export default function LoginPage() {

  const { login } = useAuth();
  const navigate = useNavigate();

  const [form,setForm] = useState({
    email:"",
    password:""
  });

  const [error,setError] = useState("");
  const [loading,setLoading] = useState(false);
  const [showPw,setShowPw] = useState(false);

  async function handleSubmit(){

    if(!form.email || !form.password){
      setError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    setLoading(true);
    setError("");

    try{

      await login(form);
      navigate("/");

    }catch(err){

      setError(
        err.response?.data?.message ||
        "Email hoặc mật khẩu không đúng"
      );

      setLoading(false);
    }
  }

  return (
    <div className="auth-page">

      <div className="auth-card">

        <div className="auth-logo">InteractHub</div>

        <div className="auth-subtitle">
          Chào mừng trở lại! Đăng nhập để tiếp tục.
        </div>

        {error && (
          <div style={{
            background:'rgba(248,113,113,.1)',
            border:'1px solid rgba(248,113,113,.3)',
            borderRadius:10,
            padding:'10px 14px',
            fontSize:13,
            color:'var(--danger)',
            marginBottom:16
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* EMAIL */}
        <div className="input-group" style={{marginBottom:14}}>

          <label className="input-label">
            <Icon name="mail" size={12}/> Email
          </label>

          <input
            className="input"
            type="email"
            placeholder="you@interacthub.io"
            value={form.email}
            onChange={e=>setForm(p=>({...p,email:e.target.value}))}
            onKeyDown={e=>e.key==="Enter" && handleSubmit()}
          />

        </div>

        {/* PASSWORD */}
        <div className="input-group" style={{marginBottom:24}}>

          <label className="input-label">
            <Icon name="lock" size={12}/> Mật khẩu
          </label>

          <div style={{position:'relative'}}>

            <input
              className="input"
              type={showPw ? "text":"password"}
              placeholder="••••••••"
              value={form.password}
              onChange={e=>setForm(p=>({...p,password:e.target.value}))}
              onKeyDown={e=>e.key==="Enter" && handleSubmit()}
              style={{paddingRight:40}}
            />

            <button
              onClick={()=>setShowPw(p=>!p)}
              type="button"
              style={{
                position:'absolute',
                right:12,
                top:'50%',
                transform:'translateY(-50%)',
                color:'var(--text3)',
                background:'none',
                border:'none'
              }}
            >
              <Icon name="eye" size={16}/>
            </button>

          </div>

          <div style={{textAlign:'right',marginTop:4}}>
            <span
              style={{
                fontSize:12,
                color:'var(--accent2)',
                cursor:'pointer'
              }}
            >
              Quên mật khẩu?
            </span>
          </div>

        </div>

        {/* LOGIN BUTTON */}
        <button
          className="btn btn-primary"
          style={{width:'100%',justifyContent:'center',padding:'12px'}}
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>

        {/* DIVIDER */}
        <div style={{textAlign:'center',margin:'16px 0',position:'relative'}}>
          <div style={{
            height:1,
            background:'var(--border)',
            position:'absolute',
            top:'50%',
            left:0,
            right:0
          }}/>

          <span style={{
            background:'var(--bg2)',
            padding:'0 12px',
            fontSize:12,
            color:'var(--text3)',
            position:'relative'
          }}>
            hoặc
          </span>
        </div>

        {/* REGISTER */}
        <div className="auth-footer">
          Chưa có tài khoản?

          <span
            className="auth-link"
            onClick={()=>navigate("/register")}
          >
            Đăng ký ngay
          </span>

        </div>

        {/* DEMO */}
        <div style={{
          marginTop:16,
          padding:12,
          background:'var(--bg3)',
          borderRadius:10,
          fontSize:12,
          color:'var(--text3)'
        }}>
          💡 Demo:
          <strong style={{color:'var(--text2)'}}>
            admin@interacthub.io
          </strong>
          /
          <strong style={{color:'var(--text2)'}}>
            admin123
          </strong>
        </div>

      </div>

    </div>
  );
}