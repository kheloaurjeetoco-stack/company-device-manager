import { adminClient, checkApiKey, json } from './_supabase.js';
export default async function handler(req,res){
  if(req.method!=='POST') return json(res,405,{ok:false,error:'POST required'});
  const auth=checkApiKey(req); if(!auth.ok) return json(res,auth.status,{ok:false,error:auth.error});
  const b=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
  const device_id=String(b.device_id||'').trim(); const employee_label=String(b.employee_label||'').slice(0,120); const allowed=Boolean(b.allowed);
  if(!device_id) return json(res,422,{ok:false,error:'device_id required'});
  const db=adminClient();
  const {error}=await db.from('devices').upsert({device_id,employee_label,sms_consent:allowed,last_seen:new Date().toISOString(),online:true,updated_at:new Date().toISOString()},{onConflict:'device_id'});
  if(error) return json(res,500,{ok:false,error:error.message});
  return json(res,200,{ok:true,sms_consent:allowed});
}
