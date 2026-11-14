const ORIGIN='https://www.dbengroup.com';
const rates=new Map();
const json=(obj,status=200)=>new Response(JSON.stringify(obj),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const decode=s=>s.replaceAll('&amp;','&').replaceAll('&quot;','"').replaceAll('&#039;',"'");
async function newsletter(request){
 if(request.method!=='POST')return json({success:false,message:'Method not allowed.'},405);
 if(request.headers.get('Origin')!==new URL(request.url).origin)return json({success:false,message:'Please submit from this website.'},403);
 let body;try{let t=await request.text();if(t.length>1000)throw Error();body=JSON.parse(t)}catch{return json({success:false,message:'Invalid form data.'},400)}
 if(!/^\S+@\S+\.\S+$/.test(body.email||'')||body.email.length>180)return json({success:false,message:'Please enter a valid email address.'},400);
 let key='newsletter:'+(request.headers.get('CF-Connecting-IP')||'local'),entry=rates.get(key)||{time:Date.now(),count:0};if(Date.now()-entry.time>60000)entry={time:Date.now(),count:0};if(entry.count>=5)return json({success:false,message:'Please wait one minute before trying again.'},429);entry.count++;rates.set(key,entry);
 try{let page=await fetch(ORIGIN+'/ajax/newsletter/popup',{headers:{'X-Requested-With':'XMLHttpRequest','Accept':'application/json'},signal:AbortSignal.timeout(15000)}),data=await page.json(),html=data.data?.html||'',token=html.match(/name=["']_token["'][^>]*value=["']([^"']+)/)?.[1];if(!token)throw Error();let cookie=(page.headers.getSetCookie?.()||[page.headers.get('set-cookie')||'']).map(x=>x.split(';')[0]).filter(Boolean).join('; ');let result=await fetch(ORIGIN+'/newsletter/subscribe',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Accept':'application/json','X-Requested-With':'XMLHttpRequest','Cookie':cookie,'X-CSRF-TOKEN':token,'Origin':ORIGIN,'Referer':ORIGIN+'/'},body:new URLSearchParams({_token:token,email:body.email}).toString(),signal:AbortSignal.timeout(20000)}),out=await result.json();if(result.ok&&out.error===false)return json({success:true,message:out.message||'You have subscribed to DBEN Group’s newsletter.'});throw Error()}catch{return json({success:false,message:'DBEN’s newsletter service could not confirm your subscription. Please subscribe on the original DBEN website.'},502)}
}
async function enquiry(request){
 if(request.method!=='POST')return json({success:false,message:'Method not allowed.'},405);
 let url=new URL(request.url);if(request.headers.get('Origin')!==url.origin)return json({success:false,message:'Please submit from this website.'},403);
 if(Number(request.headers.get('Content-Length')||0)>15000)return json({success:false,message:'Message is too long.'},413);
 let body;try{let text=await request.text();if(text.length>15000)throw Error();body=JSON.parse(text)}catch{return json({success:false,message:'Invalid form data.'},400)}
 if(body.website)return json({success:false,message:'Unable to process this request.'},400);
 let source=body.source,contact=source==='/contact-us';if(!contact&&!/^\/(properties|projects)\/[a-z0-9-]+$/.test(source||''))return json({success:false,message:'Unknown enquiry source.'},400);
 if(!PAGES[source])return json({success:false,message:'Unknown listing.'},400);
 if(!body.name?.trim()||!/^\S+@\S+\.\S+$/.test(body.email||'')||!body.content?.trim()||(!contact&&!body.phone?.trim())||(contact&&(!body.subject?.trim()||body.agree_terms_and_policy!=='1')))return json({success:false,message:'Please complete all required fields and consent where requested.'},400);
 for(let [k,v]of Object.entries(body))if(typeof v!=='string'||v.length>(k==='content'?5000:300))return json({success:false,message:'A form field is too long.'},400);
 let ip=request.headers.get('CF-Connecting-IP')||'local',now=Date.now(),entry=rates.get(ip)||{time:now,count:0};if(now-entry.time>60000)entry={time:now,count:0};if(entry.count>=5)return json({success:false,message:'Please wait one minute before trying again.'},429);entry.count++;rates.set(ip,entry);if(rates.size>3000)rates.clear();
 try{
  let page=await fetch(ORIGIN+source,{signal:AbortSignal.timeout(15000)});if(!page.ok)throw Error('DBEN’s enquiry service is unavailable.');let html=await page.text();let action=contact?'/contact/send':'/send-consult';let form=[...html.matchAll(/<form\b[^>]*action=["']([^"']+)["'][^>]*>([\s\S]*?)<\/form>/gi)].find(m=>m[1].endsWith(action));if(!form)throw Error('The original enquiry form has changed.');
  let fields=new URLSearchParams();for(let m of form[2].matchAll(/<input\b[^>]*>/gi)){let tag=m[0];let attrs=Object.fromEntries([...tag.matchAll(/([\w\[\]-]+)=["']([^"']*)["']/g)].map(a=>[a[1],decode(a[2])]));if(attrs.type==='hidden'&&attrs.name)fields.set(attrs.name,attrs.value||'')}
  let token=fields.get('_token');if(!token)throw Error('Unable to initialise the original enquiry session.');
  const allowed=contact?['name','email','address','phone','subject','content','agree_terms_and_policy']:['name','email','phone','content','consult_custom_fields[1]'];for(let k of allowed)if(body[k])fields.set(k,body[k]);
  // The original consult form includes a readonly listing name in a text field.
  if(!contact){let tag=form[2].match(/<input\b[^>]*name=["']data_name["'][^>]*>/i)?.[0];let value=tag?.match(/value=["']([^"']*)["']/)?.[1];if(value)fields.set('data_name',decode(value))}
  let setCookies=page.headers.getSetCookie? page.headers.getSetCookie():[page.headers.get('set-cookie')||''];let cookie=setCookies.map(x=>x.split(';')[0]).filter(Boolean).join('; ');
  let result=await fetch(ORIGIN+action,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded','Accept':'application/json','X-Requested-With':'XMLHttpRequest','X-CSRF-TOKEN':token,'Cookie':cookie,'Referer':ORIGIN+source,'Origin':ORIGIN},body:fields.toString(),signal:AbortSignal.timeout(20000),redirect:'manual'});
  let data;try{data=await result.json()}catch{throw Error('DBEN’s service did not confirm delivery.')}
  if(result.ok&&data.error===false)return json({success:true,message:data.message||'Your enquiry has been sent to DBEN Group.'});
  return json({success:false,message:'DBEN’s service could not accept this enquiry. Please use the original form or call the team.'},502);
 }catch(error){return json({success:false,message:error.name==='TimeoutError'?'DBEN’s enquiry service timed out.':error.message||'Unable to connect to DBEN Group.'},502)}
}
export default {async fetch(request,env,ctx){let u=new URL(request.url),path=u.pathname; if(path==='/api/enquiry')return enquiry(request);if(path==='/api/newsletter')return newsletter(request);if(!['GET','HEAD'].includes(request.method))return new Response('Method not allowed',{status:405});
 const redirect={'//cookie-policy':'/cookie-policy','/dben_estate':'/social-media-link-tree'};if(redirect[path])return Response.redirect(u.origin+redirect[path],301);
 if(['/login','/password/request','/account/properties'].includes(path))return Response.redirect(ORIGIN+path,302);
 if(path.startsWith('/feed/'))return Response.redirect(ORIGIN+path,302);
 const headers={'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin','Permissions-Policy':'camera=(), microphone=(), geolocation=()'};
 if(MEDIA[path]){let f=MEDIA[path];return new Response(request.method==='HEAD'?null:Uint8Array.from(atob(f.data),c=>c.charCodeAt(0)),{headers:{...headers,'Content-Type':f.type,'Cache-Control':'public,max-age=31536000,immutable'}})}
 if(FILES[path]){let f=FILES[path];return new Response(request.method==='HEAD'?null:f.text,{headers:{...headers,'Content-Type':f.type,'Cache-Control':'public,max-age=3600'}})}
 if(path==='/robots.txt')return new Response('User-agent: *\nAllow: /\nSitemap: '+u.origin+'/sitemap.xml\n',{headers:{'Content-Type':'text/plain'}});
 if(path.endsWith('.xml'))return new Response('<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+Object.keys(PAGES).filter(p=>p!=='/404'&&p!=='/wishlist').map(p=>'<url><loc>'+u.origin+p+'</loc></url>').join('')+'</urlset>',{headers:{'Content-Type':'application/xml'}});
 if(path.length>1&&path.endsWith('/'))return Response.redirect(u.origin+path.replace(/\/+$/,'')+u.search,301);
 let html=PAGES[path]||PAGES['/404'];return new Response(request.method==='HEAD'?null:html,{status:PAGES[path]?200:404,headers:{...headers,'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'}})
}};
