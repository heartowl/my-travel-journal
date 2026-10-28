'use strict';
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const safeUrl=u=>{try{const x=new URL(u);return ['https:','http:'].includes(x.protocol)?x.href:null}catch{return null}};
const BASE='https://hweyjynxbwhjrtmkoxmr.supabase.co';
let data={trips:[],items:[],preps:[],packing:[]},tripId='',tab='timeline',day='',prepTab='tasks';
const kindName=k=>({spot:'景點',transport:'交通',hotel:'住宿',food:'餐飲',other:'其他',expense:'單純支出'})[k]||'行程';
const money=n=>Number(n||0).toLocaleString('zh-TW',{maximumFractionDigits:2});
function days(t){let out=[];let a=new Date(t.start+'T12:00:00'),b=new Date(t.end+'T12:00:00');if(!Number.isFinite(a.getTime())||!Number.isFinite(b.getTime()))return out;for(let d=new Date(a);d<=b&&out.length<90;d.setDate(d.getDate()+1))out.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);return out}
const dateLabel=d=>d?`${Number(d.slice(5,7))}/${Number(d.slice(8,10))}`:'';
function selector(){return `<section class="card"><label for="tripSelect">選擇旅程</label><select id="tripSelect">${data.trips.map(t=>`<option value="${esc(t.id)}" ${t.id===tripId?'selected':''}>${esc(t.name)} · ${esc(t.start||'')}</option>`).join('')}</select></section>`}
function trip(){return data.trips.find(x=>x.id===tripId)}
function entry(x){const u=safeUrl(x.url);return `<article class="entry"><div class="muted">${esc(x.time||'未定時間')} · ${esc(kindName(x.kind))}</div><h3>${esc(x.title)}</h3>${x.from||x.to?`<p>${esc(x.from||'')} → ${esc(x.to||'')}</p>`:''}${x.detail?`<p>${esc(x.detail)}</p>`:''}${x.amount!==''&&Number(x.amount)>0?`<p>${esc(x.currency||'TWD')} ${money(x.amount)}</p>`:''}${u?`<p><a href="${esc(u)}" target="_blank" rel="noopener noreferrer">開啟相關連結</a></p>`:''}</article>`}
function render(){const out=$('#result');if(!data.trips.length){out.innerHTML='<section class="card">目前尚無已同步的旅程。</section>';return}if(!trip()){tripId=data.trips[0].id;day=''}const t=trip();let html=selector();
if(tab==='trips'){html+=`<section class="card"><h2>所有旅程</h2>${data.trips.map(x=>`<button class="trip-row" data-trip="${esc(x.id)}"><strong>${esc(x.name)}</strong><small>${esc(x.start)} ～ ${esc(x.end)} · ${esc(x.region||'')}</small></button>`).join('')}</section>`}
else if(tab==='expenses'){const es=[...data.items.filter(x=>x.tripId===tripId&&Number(x.amount)>0).map(x=>({...x,source:'item'})),...data.preps.filter(x=>x.tripId===tripId&&x.includeExpense!==false&&Number(x.amount)>0).map(x=>({title:x.name,date:x.doneDate||x.planDate||'',amount:x.amount,currency:x.currency||'TWD',source:'prep',paid:!!x.doneDate}))].sort((a,b)=>(b.date||'').localeCompare(a.date||''));const totals={};for(const x of es){const c=x.currency||'TWD';totals[c]=(totals[c]||0)+Number(x.amount)}html+=`<section class="card"><h2>旅行花費</h2><p class="muted">各幣別分開統計，不換算匯率</p>${Object.entries(totals).map(([c,v])=>`<p class="total"><strong>${esc(c)} ${money(v)}</strong></p>`).join('')||'<p>尚無花費</p>'}${es.map(x=>`<div class="expense"><div><strong>${esc(x.title)}</strong><small>${esc(x.date)} · ${x.source==='prep'?'行前準備':kindName(x.kind||'')} ${x.paid?'· 已付款':''}</small></div><strong>${esc(x.currency||'TWD')} ${money(x.amount)}</strong></div>`).join('')}</section>`}
else {const ds=days(t);if(!ds.includes(day))day=ds[0]||'';html+=`<div class="switch"><button data-view="timeline" class="${tab==='timeline'?'active':''}">行程</button><button data-view="prep" class="${tab==='prep'?'active':''}">行前準備</button></div>`;
if(tab==='prep'){html+=`<div class="switch"><button data-prep="tasks" class="${prepTab==='tasks'?'active':''}">準備事項</button><button data-prep="packing" class="${prepTab==='packing'?'active':''}">行李清單</button></div><section class="card"><h2>${prepTab==='tasks'?'行前準備':'行李清單'}</h2>`;if(prepTab==='tasks')html+=data.preps.filter(x=>x.tripId===tripId).map(x=>`<div class="entry"><strong>${esc(x.name)}</strong>${x.note?`<p>${esc(x.note)}</p>`:''}<p class="muted">${esc(x.doneDate?'已完成 '+x.doneDate:'尚未完成')}</p>${Number(x.amount)>0?`<p>${esc(x.currency||'TWD')} ${money(x.amount)}</p>`:''}</div>`).join('')||'<p>尚無準備事項</p>';else html+=data.packing.filter(x=>x.tripId===tripId).map(x=>`<p>${x.done?'☑':'☐'} ${esc(x.name)}</p>`).join('')||'<p>尚無行李項目</p>';html+='</section>'}
else {const es=data.items.filter(x=>x.tripId===tripId&&x.date===day&&x.kind!=='expense').sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99')||(a.order||0)-(b.order||0));html+=`<section class="card"><p class="muted">${esc(t.name)} · ${esc(t.region||'')}</p><h2>${esc(dateLabel(day))} 行程</h2><div class="days">${ds.map((d,i)=>`<button data-day="${esc(d)}" class="${day===d?'active':''}"><small>Day ${i+1}</small>${dateLabel(d)}</button>`).join('')}</div>${es.map(entry).join('')||'<p>這一天尚無行程</p>'}</section>`}}
out.innerHTML=html;
// 日期列在重新繪製後，將目前選取日期移到可見區域；不改變整頁捲動位置。
const activeDayButton=out.querySelector('.days button.active');
if(activeDayButton){
  const strip=activeDayButton.closest('.days');
  const target=activeDayButton.offsetLeft-strip.offsetLeft-(strip.clientWidth-activeDayButton.offsetWidth)/2;
  strip.scrollLeft=Math.max(0,target);
}
$('#tripSelect').onchange=e=>{tripId=e.target.value;day='';render()};document.querySelectorAll('[data-trip]').forEach(b=>b.onclick=()=>{tripId=b.dataset.trip;tab='timeline';day='';render()});document.querySelectorAll('[data-day]').forEach(b=>b.onclick=()=>{day=b.dataset.day;render()});document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{tab=b.dataset.view;render()});document.querySelectorAll('[data-prep]').forEach(b=>b.onclick=()=>{prepTab=b.dataset.prep;render()});document.querySelectorAll('[data-tab]').forEach(b=>b.classList.toggle('active',b.dataset.tab===tab||(tab==='prep'&&b.dataset.tab==='timeline')))}
// 唯讀頁面每 30 秒檢查一次；只在內容改變時重繪，避免打斷親友操作。
// 分頁回到前景時立即檢查；背景時不輪詢。連線失敗保留上次成功畫面。
let shareBusy=false,shareSignature='',shareLastSuccess=false;
async function load(silent=false){
  if(shareBusy||document.hidden&&silent)return;
  shareBusy=true;
  const out=$('#result'),status=$('#shareStatus');
  if(!silent&&!shareLastSuccess)out.textContent='正在載入旅行手帳…';
  if(status)status.textContent=silent?'正在檢查更新…':'正在取得最新資料…';
  try{
    const u=new URL(location.href),key=u.searchParams.get('key'),token=new URLSearchParams(u.hash.slice(1)).get('token');
    if(!key?.startsWith('sb_publishable_')||!/^[0-9a-f]{64}$/.test(token||''))throw Error('分享連結不完整');
    const r=await fetch(BASE+'/rest/v1/rpc/read_journal_share',{method:'POST',headers:{apikey:key,Authorization:'Bearer '+key,'Content-Type':'application/json'},body:JSON.stringify({p_token:token}),cache:'no-store'});
    const v=await r.json();if(!r.ok)throw Error(v.message||'無法讀取分享資料');
    if(!Array.isArray(v?.trips))throw Error('整本分享連結已失效或不存在');
    const next={trips:v.trips.sort((a,b)=>(b.start||'').localeCompare(a.start||'')),items:v.items||[],preps:v.preps||[],packing:v.packing||[]};
    const signature=JSON.stringify(next);
    if(signature!==shareSignature){data=next;shareSignature=signature;render()}
    shareLastSuccess=true;
    if(status)status.textContent='已取得最新資料 · 每 30 秒自動檢查';
  }catch(e){
    if(!shareLastSuccess)out.textContent='無法載入：'+e.message;
    if(status)status.textContent='更新失敗，保留上次畫面；請確認網路或分享連結是否有效';
  }finally{shareBusy=false}
}
document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{tab=b.dataset.tab;render()});

document.addEventListener('visibilitychange',()=>{if(!document.hidden)load(true)});
window.addEventListener('online',()=>load(true));
setInterval(()=>{if(!document.hidden)load(true)},30000);
load();
