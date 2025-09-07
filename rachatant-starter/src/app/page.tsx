'use client';
import { useState } from 'react';

export default function LoginPage() {
  const [internalCode, setInternalCode] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [me, setMe] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/kiosk-login', {
        method: 'POST',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ internal_code: internalCode, pin }),
      });
      const json = await res.json();
      if (!json.ok) throw new Error(json.error || 'LOGIN_FAILED');
      setMe(json.user);
    } catch (err:any) {
      setError(err.message);
      setMe(null);
    } finally {
      setLoading(false);
    }
  };

  if (me) {
    return (
      <main style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{padding:24,borderRadius:16,boxShadow:'0 8px 24px rgba(0,0,0,0.1)'}}>
          <h1 style={{fontSize:20,fontWeight:700,marginBottom:8}}>ยินดีต้อนรับ</h1>
          <p style={{marginBottom:16}}>{me.name || 'ผู้ใช้'} (บทบาท: {me.role})</p>
          <a href="/dashboard" style={{textDecoration:'underline'}}>ไปแดชบอร์ด</a>
        </div>
      </main>
    );
  }

  return (
    <main style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'linear-gradient(135deg,#0ea5e9,#06b6d4)'}}>
      <form onSubmit={onSubmit} style={{background:'#fff',padding:24,borderRadius:16,boxShadow:'0 8px 24px rgba(0,0,0,0.15)',width:320}}>
        <h1 style={{fontSize:18,fontWeight:700,marginBottom:16}}>เข้าสู่ระบบ (Kiosk)</h1>
        <label style={{display:'block',fontSize:13,marginBottom:4}}>รหัสภายใน</label>
        <input
          style={{width:'100%',border:'1px solid #ddd',borderRadius:8,padding:'10px 12px',marginBottom:12}}
          value={internalCode}
          onChange={e=>setInternalCode(e.target.value)}
          placeholder="เช่น INM-1001"
        />
        <label style={{display:'block',fontSize:13,marginBottom:4}}>PIN</label>
        <input
          type="password"
          style={{width:'100%',border:'1px solid #ddd',borderRadius:8,padding:'10px 12px',marginBottom:16}}
          value={pin}
          onChange={e=>setPin(e.target.value)}
          placeholder="6 หลัก"
        />
        <button
          disabled={loading}
          style={{width:'100%',padding:'10px 12px',borderRadius:10,background:'#0369a1',color:'#fff',opacity:loading?0.6:1}}
        >
          {loading ? 'กำลังตรวจสอบ...' : 'เข้าสู่ระบบ'}
        </button>
        {error && <p style={{color:'#dc2626',fontSize:13,marginTop:12}}>{error}</p>}
      </form>
    </main>
  );
}
