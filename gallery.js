const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
$$('video[data-auto]').forEach(v=>{if(reduce){v.controls=true;return}const d=+(v.dataset.delay||0);const go=()=>setTimeout(()=>v.play().catch(()=>{}),d);if(v.readyState>=2)go();else v.addEventListener('loadeddata',go,{once:true});v.load()});
const grid=$('#grid');const tiles=$$('.t',grid);let filter='all',job=null,shown=[];
function target(){const w=innerWidth;return w<480?180:w<900?220:300}
function layout(){
  shown=tiles.filter(t=>{const ok=job?t.dataset.j===job:(filter==='all'||t.dataset.g===filter||(filter==='w'&&t.dataset.k==='w'));t.hidden=!ok;return ok});
  grid.classList.add('js');$$('.row',grid).forEach(r=>{while(r.firstChild)grid.appendChild(r.firstChild);r.remove()});
  const W=grid.clientWidth,H=target(),gap=6;const ar=t=>{const i=t.firstChild;return i.width/i.height};
  const rows=[];let cur=[],s=0;
  shown.forEach(t=>{cur.push(t);s+=ar(t);if(s*H+gap*(cur.length-1)>=W){rows.push(cur);cur=[];s=0}});
  if(cur.length){if(rows.length&&s*H<W*.75)rows[rows.length-1]=rows[rows.length-1].concat(cur);else rows.push(cur)}
  rows.forEach((r,i)=>{const sum=r.reduce((a,t)=>a+ar(t),0);let h=(W-gap*(r.length-1))/sum;if(i===rows.length-1&&sum*H<W*.75)h=Math.min(h,H);
    const row=document.createElement('div');row.className='row';r.forEach(t=>{t.style.width=(ar(t)*h)+'px';t.style.height=h+'px';row.appendChild(t)});grid.appendChild(row)});
  $$('.t[hidden]',grid).forEach(t=>grid.appendChild(t));
}
let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(layout,120)});
const jc=$('.jobchip');
$$('.f:not(.jobchip)').forEach(b=>b.addEventListener('click',()=>{filter=b.dataset.f;job=null;jc.hidden=true;$$('.f:not(.jobchip)').forEach(o=>o.setAttribute('aria-pressed',String(o===b)));layout()}));
jc.addEventListener('click',()=>{job=null;jc.hidden=true;$('.f[data-f="all"]').click()});
$$('.see').forEach(b=>b.addEventListener('click',()=>{job=b.dataset.job;filter='all';$$('.f:not(.jobchip)').forEach(o=>o.setAttribute('aria-pressed','false'));jc.textContent=b.closest('.pj').querySelector('h3').textContent;jc.setAttribute('aria-label','Showing '+jc.textContent+'. Show all photos');jc.hidden=false;layout();$('.gal').scrollIntoView({behavior:reduce?'auto':'smooth'})}));
layout();
const lb=$('#lb');let cur=0;
function show(){const t=shown[cur],i=t.firstChild;$('#lbi').src=t.getAttribute('href');$('#lbi').alt=i.alt;$('#lbc').textContent=i.alt;$('#lbn').textContent=(cur+1)+' / '+shown.length}
function open(t){cur=shown.indexOf(t);show();lb.hidden=false;document.body.style.overflow='hidden';$('.cl',lb).focus()}
function close(){lb.hidden=true;document.body.style.overflow=''}
function step(d){cur=(cur+d+shown.length)%shown.length;show()}
tiles.forEach(t=>t.addEventListener('click',e=>{e.preventDefault();open(t)}));
$('.cl',lb).onclick=close;$('.pv',lb).onclick=()=>step(-1);$('.nx',lb).onclick=()=>step(1);
lb.addEventListener('click',e=>{if(e.target===lb)close()});
addEventListener('keydown',e=>{if(lb.hidden)return;if(e.key==='Escape')close();if(e.key==='ArrowLeft')step(-1);if(e.key==='ArrowRight')step(1)});
let tx=null;lb.addEventListener('touchstart',e=>{tx=e.touches[0].clientX},{passive:true});lb.addEventListener('touchend',e=>{if(tx===null)return;const dx=e.changedTouches[0].clientX-tx;if(Math.abs(dx)>40)step(dx<0?1:-1);tx=null});

const hj=location.hash.match(/^#job=([a-z]+)/);if(hj){const b=document.querySelector('.see[data-job="'+hj[1]+'"]');if(b)setTimeout(()=>b.click(),50)}
