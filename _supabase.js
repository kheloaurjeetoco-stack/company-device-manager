import { createClient } from '@supabase/supabase-js';

export function adminClient(){
  return createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, {auth:{autoRefreshToken:false,persistSession:false}});
}
export function checkApiKey(req){
  const expected=process.env.API_KEY;
  if(!expected) return {ok:false,status:500,error:'API_KEY is not configured'};
  const got=req.headers['x-api-key'] || req.query?.api_key;
  if(got!==expected) return {ok:false,status:401,error:'Invalid API key'};
  return {ok:true};
}
export function json(res,status,body){res.status(status).json(body);}
