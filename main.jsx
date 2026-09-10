import React,{useEffect,useState} from 'react';
import {createRoot} from 'react-dom/client';
import {BrowserRouter,useNavigate,useLocation} from 'react-router-dom';
import {createClient} from '@supabase/supabase-js';
import './style.css';

const supabase=createClient(import.meta.env.VITE_SUPABASE_URL,import.meta.env.VITE_SUPABASE_ANON_KEY);
const site=import.meta.env.VITE_SITE_NAME||'Company Device Manager';

function Login(){
 const nav=useNavigate(); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [err,setErr]=useState(''); const [busy,setBusy]=useState(false);
 async function go(e){e.preventDefault();setBusy(true);setErr('');const {error}=await supabase.auth.signInWithPassword({email,password});setBusy(false);if(error)setErr(error.message);else nav('/admin');}
 return <div className="center"><form className="box" onSubmit={go}><h1>{site}</h1><p className="muted">Admin login</p>{err&&<div className="error">{err}</div>}<input type="email" placeholder="Admin email" value={email} onChange={e=>setEmail(e.target.value)} required/><input type="password" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} required/><button disabled={busy}>{busy?'Signing in…':'Login'}</button></form></div>
}
function Admin(){
 const nav=useNavigate(); const [session,setSession]=useState(null); const [devices,setDevices]=useState([]); const [sms,setSms]=useState([]); const [loading,setLoading]=useState(true);
 useEffect(()=>{supabase.auth.getSession().then(({data})=>{if(!data.session)nav('/login');else setSession(data.session)});},[]);
 async function load(){setLoading(true);const [a,b]=await Promise.all([supabase.from('devices').select('*').order('updated_at',{ascending:false}),supabase.from('selected_sms_share').select('*').order('shared_at',{ascending:false}).limit(100)]);setDevices(a.data||[]);setSms(b.data||[]);setLoading(false);}
 useEffect(()=>{if(session)load();},[session]);
 useEffect(()=>{const t=setInterval(load,10000);return()=>clearInterval(t)},[session]);
 async function logout(){await supabase.auth.signOut();nav('/login')}
 const live=devices.filter(d=>d.last_seen&&Date.now()-new Date(d.last_seen).getTime()<90000).length; const consent=devices.filter(d=>d.sms_consent).length;
 if(!session)return null;
 return <div><header><div><b>{site}</b><span className="muted"> Admin Dashboard</span></div><button className="secondary" onClick={logout}>Logout</button></header><main><div className="cards"><Card t="Total Devices" n={devices.length}/><Card t="Online (90 sec)" n={live}/><Card t="SMS Consent Enabled" n={consent}/></div><section className="panel"><h2>Devices</h2>{loading?<p>Loading…</p>:<Table rows={devices}/>}</section><section className="panel"><h2>Employee-selected SMS shares</h2><p className="note">Only messages explicitly selected and shared by the employee app are shown. No hidden OTP/PIN/password collection.</p><div className="table"><table><thead><tr><th>Time</th><th>Employee</th><th>Device</th><th>Message</th></tr></thead><tbody>{sms.map(s=><tr key={s.id}><td>{new Date(s.shared_at).toLocaleString()}</td><td>{s.employee_label}</td><td>{s.device_id}</td><td>{s.message_text}</td></tr>)}</tbody></table></div></section></main></div>
}
function Card({t,n}){return <div className="card"><div>{t}</div><strong>{n}</strong></div>}
function Table({rows}){return <div className="table"><table><thead><tr><th>Employee</th><th>Device</th><th>Model</th><th>Android</th><th>Battery</th><th>SIM</th><th>Carrier</th><th>Consent</th><th>Status</th><th>Last Seen</th></tr></thead><tbody>{rows.map(d=>{const online=d.last_seen&&Date.now()-new Date(d.last_seen).getTime()<90000;return <tr key={d.id}><td>{d.employee_label}</td><td>{d.device_id}</td><td>{d.manufacturer} {d.model}</td><td>{d.android_version}</td><td>{d.battery}%</td><td>{d.sim_count??'—'}</td><td>{d.carrier}</td><td>{d.sms_consent?'Allowed':'Denied'}</td><td className={online?'live':'off'}>{online?'ONLINE':'OFFLINE'}</td><td>{d.last_seen?new Date(d.last_seen).toLocaleString():'—'}</td></tr>})}</tbody></table></div>}
function Employee(){const [device,setDevice]=useState('');const [label,setLabel]=useState('');const [out,setOut]=useState('');const [busy,setBusy]=useState(false);async function send(allowed){if(!device.trim()){setOut('Device ID required');return}setBusy(true);setOut('');try{const r=await fetch('/api/sms-consent',{method:'POST',headers:{'Content-Type':'application/json','x-api-key':prompt('Enter app API key')},body:JSON.stringify({device_id:device,employee_label:label,allowed})});const j=await r.json();setOut(j.ok?(allowed?'SMS sharing allowed.':'SMS sharing denied.'):(j.error||'Error'));}catch(e){setOut('Network error')}setBusy(false)}return <div className="center"><div className="box"><h1>SMS Sharing Consent</h1><div className="note">SMS sharing must be voluntary and visible. The companion Android app should share only messages the employee explicitly selects. This system does not support hidden OTP/PIN/password collection.</div><input placeholder="Device ID" value={device} onChange={e=>setDevice(e.target.value)}/><input placeholder="Employee name/label" value={label} onChange={e=>setLabel(e.target.value)}/><div className="row"><button disabled={busy} onClick={()=>send(true)}>Allow SMS Sharing</button><button className="secondary" disabled={busy} onClick={()=>send(false)}>Deny</button></div>{out&&<p>{out}</p>}</div></div>}
function App(){const loc=useLocation(); if(loc.pathname==='/employee')return <Employee/>; if(loc.pathname==='/admin')return <Admin/>; return <Login/>}
createRoot(document.getElementById('root')).render(<BrowserRouter><App/></BrowserRouter>);
