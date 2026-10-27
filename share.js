'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=u=>{try{const x=new URL(u);return ['https:','http:'].includes(x.protocol)?x.href:null}catch{return null}};
const BASE='https://hweyjynxbwhjrtmkoxmr.supabase.co';
async function load(){const output=$('#result');output.textContent='正在載入行程…';try{
 const key=new URL(location.href).searchParams.get('key');const token=new URLSearchParams(location.hash.slice(1)).get('token');
 if(!key?.startsWith('sb_publishable_')||!/^[0-9a-f]{64}$/.test(token||''))throw Error('分享連結不完整');
 const response=await fetch(BASE+'/rest/v1/rpc/read_travel_share',{method:'POST',headers:{'apikey':key,'Authorization':'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({p_token:token}),cache:'no-store'});
 const result=await response.json();if(!response.ok)throw Error(result.message||'無法讀取分享資料');if(!result?.trip)throw Error('分享連結已失效或不存在');
 const trip=result.trip,items=result.items||[],preps=result.preps||[],packing=result.packing||[];
 const groups=new Map();for(const item of items){const date=item.date||'未指定日期';if(!groups.has(date))groups.set(date,[]);groups.get(date).push(item)}
 let html='<section class="card"><h2>'+esc(trip.name)+'</h2><p>'+esc(trip.start)+' ～ '+esc(trip.end)+'　'+esc(trip.region||'')+'</p><p class="muted">行程 '+items.length+' 筆・行前準備 '+preps.length+' 筆・行李清單 '+packing.length+' 筆</p></section>';
 for(const date of [...groups.keys()].sort()){html+='<section class="card"><div class="day">'+esc(date)+'</div>';for(const x of groups.get(date).sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'))){html+='<div class="entry"><div class="muted">'+esc(x.time||'時間未定')+'　'+esc(x.kind||'')+'</div><h3>'+esc(x.title||'')+'</h3>';if(x.from||x.to)html+='<p>'+esc([x.from,x.to].filter(Boolean).join(' → '))+'</p>';if(x.detail)html+='<p>'+esc(x.detail)+'</p>';if(x.amount)html+='<p>花費：'+esc(x.currency||'')+' '+esc(x.amount)+'</p>';const url=safeUrl(x.url);if(url)html+='<p><a target="_blank" rel="noopener noreferrer" href="'+esc(url)+'">相關連結</a></p>';html+='</div>'}html+='</section>'}
 if(preps.length){html+='<section class="card"><h2>行前準備</h2>';for(const x of preps)html+='<div class="entry"><b>'+esc(x.name)+'</b><p>'+esc(x.note||'')+'</p><p class="muted">'+esc(x.doneDate?'已完成 '+x.doneDate:'尚未完成')+'</p></div>';html+='</section>'}
 if(packing.length){html+='<section class="card"><h2>行李清單</h2>';for(const x of packing)html+='<p>'+(x.done?'☑ ':'☐ ')+esc(x.name)+'</p>';html+='</section>'}
 output.innerHTML=html;
 }catch(e){output.textContent='無法載入：'+e.message}}
$('#reload').onclick=load;load();
