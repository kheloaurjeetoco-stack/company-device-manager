import { adminClient, checkApiKey, json } from './_supabase.js';
export default async function handler(req,res){
  if(req.method!=='POST') return json(res,405,{ok:false,error:'POST required'});
  const auth=checkApiKey(req); if(!auth.ok) return json(res,auth.status,{ok:false,error:auth.error});
  const b=typeof req.body==='string'?JSON.parse(req.body||'{}'):(req.body||{});
  const device_id=String(b.device_id||'').trim();
  if(!device_id || device_id.length>128) return json(res,422,{ok:false,error:'device_id required'});
  const row={device_id,employee_label:String(b.employee_label||'').slice(0,120),model:String(b.model||'').slice(0,160),manufacturer:String(b.manufacturer||'').slice(0,120),android_version:String(b.android_version||'').slice(0,80),battery:Math.max(0,Math.min(100,Number.parseInt(b.battery??0)||0)),online:true,sim_count:b.sim_count==null?null:Math.max(0,Math.min(10,Number.parseInt(b.sim_count)||0)),carrier:String(b.carrier||'').slice(0,160),sms_consent:Boolean(b.sms_consent),last_seen:new Date().toISOString(),updated_at:new Date().toISOString()};
  const {error}=await adminClient().from('devices').upsert(row,{onConflict:'device_id'});
  if(error) return json(res,500,{ok:false,error:error.message});
  return json(res,200,{ok:true,server_time:new Date().toISOString()});
}
