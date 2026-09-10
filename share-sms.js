import { adminClient, checkApiKey, json } from './_supabase.js';
export default async function handler(req,res){
  if(req.method!=='POST') return json(res,405,{ok:false,error:'POST required'});
  const auth=checkApiKey(req); if(!auth.ok) return json(res,auth.status,{ok:false,error:auth.error});
  const b=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
  const device_id=String(b.device_id||'').trim(); const text=String(b.message_text||'').trim(); const label=String(b.employee_label||'').slice(0,120);
  if(!device_id||!text) return json(res,422,{ok:false,error:'device_id and explicitly selected message_text are required'});
  const db=adminClient();
  const {data:d,error:de}=await db.from('devices').select('sms_consent').eq('device_id',device_id).maybeSingle();
  if(de) return json(res,500,{ok:false,error:de.message});
  if(!d || d.sms_consent!==true) return json(res,403,{ok:false,error:'SMS consent is not enabled for this device'});
  const {error}=await db.from('selected_sms_share').insert({device_id,employee_label:label,message_text:text});
  if(error) return json(res,500,{ok:false,error:error.message});
  return json(res,200,{ok:true});
}
