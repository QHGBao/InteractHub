import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {

  const { register } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);

  const [form, setForm] = useState({
    displayName: "",
    email: "",
    userName: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const pwStrength = (pw) => {
    let s = 0;
    if(pw.length>=8)s++;
    if(/[A-Z]/.test(pw))s++;
    if(/[0-9]/.test(pw))s++;
    if(/[^A-Za-z0-9]/.test(pw))s++;
    return s;
  };

  const strength = pwStrength(form.password);
  const strengthLabel = ['','Yếu','Trung bình','Khá','Mạnh'][strength];
  const strengthColor = ['','var(--danger)','var(--warning)','#60a5fa','var(--accent3)'][strength];

  function validate1() {
    const e = {};

    if(!form.displayName.trim())
      e.displayName='Vui lòng nhập họ tên';

    if(!form.email.match(/^[^@]+@[^@]+\.[^@]+$/))
      e.email='Email không hợp lệ';

    if(!form.userName.trim())
      e.userName='Vui lòng nhập username';

    setErrors(e);
    return Object.keys(e).length===0;
  }

  function validate2() {

    const e = {};

    if(strength<2)
      e.password='Mật khẩu quá yếu';

    if(form.password!==form.confirmPassword)
      e.confirmPassword='Mật khẩu không khớp';

    setErrors(e);

    return Object.keys(e).length===0;
  }

  async function handleSubmit() {

    if(!validate2()) return;

    setLoading(true);

    try{

      await register({
        displayName: form.displayName,
        email: form.email,
        userName: form.userName,
        password: form.password
      });

      navigate("/");

    }catch(err){

      setErrors({
        api: err.response?.data?.message || "Đăng ký thất bại"
      });

    }

    setLoading(false);
  }

  return (
    <div className="auth-page">

      <div className="auth-card" style={{maxWidth:460}}>

        <div className="auth-logo">InteractHub</div>

        <div className="auth-subtitle">
          Tạo tài khoản mới — Bước {step}/2
        </div>

        {/* Progress bar */}
        <div style={{display:'flex',gap:8,marginBottom:24}}>
          {[1,2].map(i=>(
            <div
              key={i}
              style={{
                flex:1,
                height:3,
                borderRadius:2,
                background:i<=step?'var(--accent)':'var(--bg4)',
                transition:'background .3s'
              }}
            />
          ))}
        </div>

        {step===1 && (
          <>
            {[['displayName','Họ và tên','Nguyễn Văn A'],
              ['email','Email','you@example.com'],
              ['userName','Username','nguyenvana']
            ].map(([k,l,ph])=>(

              <div key={k} className="input-group" style={{marginBottom:14}}>

                <label className="input-label">{l}</label>

                <input
                  className="input"
                  placeholder={ph}
                  value={form[k]}
                  onChange={e=>setForm(p=>({...p,[k]:e.target.value}))}
                  style={{borderColor:errors[k]?'var(--danger)':undefined}}
                />

                {errors[k] &&
                  <span style={{fontSize:11,color:'var(--danger)'}}>
                    {errors[k]}
                  </span>
                }

              </div>
            ))}

            <button
              className="btn btn-primary"
              style={{width:'100%',justifyContent:'center',padding:12}}
              onClick={()=>validate1()&&setStep(2)}
            >
              Tiếp theo →
            </button>

          </>
        )}

        {step===2 && (
          <>

            <div className="input-group" style={{marginBottom:14}}>

              <label className="input-label">Mật khẩu</label>

              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.password}
                onChange={e=>setForm(p=>({...p,password:e.target.value}))}
                style={{borderColor:errors.password?'var(--danger)':undefined}}
              />

              {form.password && (
                <div style={{marginTop:6}}>

                  <div style={{display:'flex',gap:4,marginBottom:4}}>
                    {[1,2,3,4].map(i=>(
                      <div
                        key={i}
                        style={{
                          flex:1,
                          height:3,
                          borderRadius:2,
                          background:i<=strength?strengthColor:'var(--bg4)',
                          transition:'background .3s'
                        }}
                      />
                    ))}
                  </div>

                  <span style={{fontSize:11,color:strengthColor}}>
                    {strengthLabel}
                  </span>

                </div>
              )}

              {errors.password &&
                <span style={{fontSize:11,color:'var(--danger)'}}>
                  {errors.password}
                </span>
              }

            </div>

            <div className="input-group" style={{marginBottom:24}}>

              <label className="input-label">Xác nhận mật khẩu</label>

              <input
                className="input"
                type="password"
                placeholder="••••••••"
                value={form.confirmPassword}
                onChange={e=>setForm(p=>({...p,confirmPassword:e.target.value}))}
                style={{borderColor:errors.confirmPassword?'var(--danger)':undefined}}
              />

              {errors.confirmPassword &&
                <span style={{fontSize:11,color:'var(--danger)'}}>
                  {errors.confirmPassword}
                </span>
              }

            </div>

            {errors.api && (
              <div style={{color:'var(--danger)',marginBottom:12}}>
                {errors.api}
              </div>
            )}

            <div style={{display:'flex',gap:10}}>

              <button
                className="btn btn-ghost"
                onClick={()=>setStep(1)}
              >
                ← Quay lại
              </button>

              <button
                className="btn btn-primary"
                style={{flex:1,justifyContent:'center'}}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading?'⏳ Đang tạo...':'🚀 Tạo tài khoản'}
              </button>

            </div>

          </>
        )}

      </div>
    </div>
  );
}