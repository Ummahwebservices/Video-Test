// Rashad Mahmood reel: deterministic render(t) driving every element from the timeline below.
const W=1920,H=1080,DUR=47.5;
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const cl=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const P=(t,a,b)=>cl((t-a)/(b-a));
const E={
  outExpo:x=>x>=1?1:1-Math.pow(2,-10*x),
  inExpo:x=>x<=0?0:Math.pow(2,10*x-10),
  inOutExpo:x=>x<=0?0:x>=1?1:x<.5?Math.pow(2,20*x-10)/2:(2-Math.pow(2,-20*x+10))/2,
  outCubic:x=>1-Math.pow(1-x,3),
  inOutCubic:x=>x<.5?4*x*x*x:1-Math.pow(-2*x+2,3)/2,
  outBack:(x,s=2.2)=>1+(s+1)*Math.pow(x-1,3)+s*Math.pow(x-1,2),
};

/* scene cue points (seconds) */
// Timings are set for reading: text holds roughly 1s + 1s per 3 words once it has settled.
const T={s2:5.5,s3:11.6,s4:30.05,s5:42.85};
const STAT={first:T.s3+.15,dur:3.6};            // 5 impact stats
const SLOT=[6.7,7.7,8.7,9.7];                   // approach word changes
const FOCUS=760, STEP=1.9, MOVE=.85;            // journey: camera stops on each job
const moveStart=k=>T.s4+.6+(k-1)*STEP;          // k = 1..6

/* ---------- build helpers ---------- */
const splitAll=root=>$$('.split',root).forEach(el=>{
  const txt=el.textContent; el.textContent='';
  [...txt].forEach(c=>{const s=document.createElement('span');s.className='ch';s.textContent=c===' '?' ':c;el.appendChild(s)});
});
const clearTypes=root=>$$('.type',root).forEach(el=>{el.textContent=''});
splitAll(document); clearTypes(document);
const typeIn=(el,x)=>{const t=el.dataset.text;const n=Math.round(t.length*cl(x));
  el.textContent=t.slice(0,n)+(x>0&&x<1?'▍':'');};
// letters rise: dir=1 from below, -1 from above
function rise(el,t,start,{stagger=.045,dur=.9,dir=1,ease=E.outExpo,out=null,outDur=.5,outDir=-1,outStagger=.025}={}){
  $$('.ch',el).forEach((c,i)=>{
    const x=ease(P(t,start+i*stagger,start+i*stagger+dur));
    let y=(1-x)*dir*105, r=(1-x)*dir*8;
    if(out!==null){const o=E.inExpo(P(t,out+i*outStagger,out+i*outStagger+outDur));y+=o*outDir*110;}
    c.style.transform=`translateY(${y}%) rotate(${r}deg)`;
  });
}
const show=(el,on)=>{el.style.display=on?'':'none'};

/* ---------- Scene 3 data ---------- */
const stats=[
  {co:'Tesco',l1:'saved with AI',l2:'layout simulation',sub:'regression models · AI platform MVP',
   fmt:x=>`<b>£</b>${Math.round(3*x)}<b>M</b>`,bar:x=>x},
  {co:'Cube',l1:'less manual',l2:'categorisation work',sub:'RAG-based LLM · 95% accuracy',
   fmt:x=>`${Math.round(70*x)}<b>%</b>`,bar:x=>.7*x},
  {co:'ICBC Standard Bank',l1:'rule change cycle,',l2:'down from a month',sub:'self-serve simulation · £250K saved a year',
   fmt:x=>{const v=Math.round(30-29*x);return `${v}<b> day${v>1?'s':''}</b>`},bar:x=>1-x*(29/30)},
  {co:'Tesco',l1:'legacy connections',l2:'replaced by one API',sub:'API + webhooks · ~£20K saved per feed',
   fmt:x=>`${Math.round(2000*x).toLocaleString('en-GB')}`,bar:x=>x},
  {co:'Opus 2',l1:'AmLaw Top 50 firms',l2:'co-building our MCP',sub:'API · MCP · Integrations · now',
   fmt:x=>`${Math.round(3*x)}<b>/50</b>`,bar:x=>.06*x},
];
const s3=$('#s3');
stats.forEach((s,i)=>{
  const d=document.createElement('div');d.className='stat';d.style.cssText='position:absolute;inset:0';
  d.innerHTML=`
   <div class="mask" style="left:150px;top:300px;height:400px;padding:0 20px;width:960px"><div class="num" style="display:inline-block;font-size:400px;line-height:400px;font-weight:900;letter-spacing:-.06em;font-variant-numeric:tabular-nums"></div></div>
   <div class="abs bartrack" style="left:170px;top:740px;width:820px;height:4px;background:rgba(242,238,229,.14)"><div class="barfill" style="height:100%;background:var(--signal);transform-origin:0 50%"></div></div>
   <div class="mask mono" style="left:1130px;top:360px;font-size:24px;color:var(--signal)"><span class="type" data-text="0${i+1} — ${s.co}"></span></div>
   <div class="mask" style="left:1120px;top:420px;height:84px;padding:0 10px"><span class="split" style="font-size:68px;line-height:84px;font-weight:700;letter-spacing:-.035em;display:block">${s.l1}</span></div>
   <div class="mask" style="left:1120px;top:504px;height:96px;padding:0 10px"><span class="split serif" style="font-size:80px;line-height:96px;display:block">${s.l2}</span></div>
   <div class="mask mono" style="left:1130px;top:650px;font-size:24px;color:var(--mute)"><span class="type" data-text="${s.sub}"></span></div>`;
  s3.appendChild(d);
});
splitAll(s3); clearTypes(s3);
const st3=document.createElement('style');st3.textContent='.num b{color:var(--signal);font-weight:900}';document.head.appendChild(st3);
const statEls=$$('.stat');

/* ---------- Scene 4 data ---------- */
const nodes=[
  ['2015','Virgin Money','with RBS & Commerzbank'],
  ['2018','Deutsche Bank','Product Owner, AVP'],
  ['2021','Global Relay','Technical Product Manager'],
  ['2022','Tesco','Senior PM · Data & AI platforms'],
  ['2024','ICBC Standard Bank','Principal Product Manager'],
  ['2025','Cube','Lead Technical PM · AI Tools'],
  ['2026','Opus 2','Principal PM · API, MCP & Integrations'],
];
const NX=i=>300+i*700, LY=678, HEAD=1060;
const world=$('#world');
nodes.forEach((n,i)=>{
  const g=document.createElement('div');g.className='node';
  g.innerHTML=`
   <div class="abs ring" style="left:${NX(i)-18}px;top:${LY-16}px;width:36px;height:36px;border-radius:50%;border:3px solid var(--paper);background:var(--ink)"></div>
   <div class="abs core" style="left:${NX(i)-9}px;top:${LY-7}px;width:18px;height:18px;border-radius:50%;background:var(--signal)"></div>
   <div class="abs stem" style="left:${NX(i)-1}px;top:${LY-150}px;width:2px;height:130px;background:rgba(242,238,229,.35);transform-origin:50% 100%"></div>
   <div class="mask mono" style="left:${NX(i)+18}px;top:${LY-160}px;font-size:24px;color:var(--signal)"><span class="type" data-text="${n[0]}"></span></div>
   <div class="mask" style="left:${NX(i)+10}px;top:${LY-128}px;height:84px;padding:0 10px"><span class="split" style="font-size:64px;line-height:84px;font-weight:700;letter-spacing:-.035em;display:block">${n[1]}</span></div>
   <div class="mask" style="left:${NX(i)+12}px;top:${LY+36}px;height:52px;padding:0 10px"><span class="split serif" style="font-size:42px;line-height:52px;display:block;color:var(--mute)">${n[2]}</span></div>`;
  world.appendChild(g);
});
splitAll(world); clearTypes(world);
const nodeEls=$$('.node');
$('#yearcol').innerHTML=nodes.map(n=>`<div>${n[0]}</div>`).join('');
$('#tickerin').textContent=('Agentic AI · RAG · MCP · APIs & integrations · Product strategy · Data platforms · RegTech · Discovery · Kanban · SAFe PO/PM · ').repeat(5);

/* ---------- grain ---------- */
const grain=$('#grain'), gctx=grain.getContext('2d');
let seed=7;const rnd=()=>{seed=(seed*16807)%2147483647;return seed/2147483647};
const gimg=gctx.createImageData(512,512);
for(let i=0;i<gimg.data.length;i+=4){const v=rnd()*255;gimg.data[i]=gimg.data[i+1]=gimg.data[i+2]=v;gimg.data[i+3]=255}
gctx.putImageData(gimg,0,0);
grain.style.width='2320px';grain.style.height='1480px';grain.style.imageRendering='pixelated';

/* ================= RENDER ================= */
function render(t){
  const frame=Math.round(t*60);
  grain.style.transform=`translate(${((frame*137)%200)-100}px,${((frame*71)%200)-100}px)`;
  $('#grid').style.backgroundPosition=`${-t*10}px ${-t*5}px`;
  $('#grid').style.opacity=E.outCubic(P(t,.1,1.5))*(1-P(t,T.s5,T.s5+.3));

  /* ---- Scene 1: intro (0 → 3.95) ---- */
  const s1on=t<T.s2+.2; show($('#s1'),s1on);
  if(s1on){
    const dot=$('#dot');
    const stretch=E.inOutExpo(P(t,.7,1.6));
    dot.style.transform=`scale(${E.outBack(P(t,.1,.65))*(1-stretch*.2)})`;
    dot.style.opacity=1-P(t,.8,1.0);
    const outL=E.inExpo(P(t,4.9,5.4));
    $('#s1line').style.transform=`translateX(${outL*1800}px) scaleX(${Math.max(stretch,.0001)*(1-outL*.6)})`;
    $('#s1line').style.opacity=stretch>0?1:0;
    rise($('#s1top'),t,1.25,{out:4.85,outDir:1});
    rise($('#s1bot'),t,1.45,{dir:-1,out:4.9,outDir:-1});
    typeIn($('#s1lab1 .type'),P(t,2.0,2.7)*(1-P(t,4.8,5.1)));
    typeIn($('#s1lab2 .type'),P(t,2.3,2.8)*(1-P(t,4.85,5.1)));
    $('#s1').style.transform=`scale(${1.06-0.06*E.outCubic(P(t,.9,5.4))})`;
  }

  /* ---- Scene 2: approach (3.95 → 8.0) ---- */
  const s2on=t>T.s2-.05&&t<T.s3+.4; show($('#s2'),s2on);
  if(s2on){
    const masks=$$('#s2 > .mask');
    rise(masks[0],t,T.s2,{stagger:.04,out:T.s3-.65,outDir:-1});
    rise(masks[2],t,T.s2+.25,{stagger:.025,out:T.s3-.58,outDir:-1,outStagger:.012});
    const steps=SLOT;
    let idx=0,vel=0;
    steps.forEach(s=>{const x=P(t,s,s+.45);idx+=E.inOutExpo(x);vel+=Math.sin(Math.PI*x)});
    const slotIn=E.outExpo(P(t,T.s2+.1,T.s2+1.0));
    const slotOut=E.inExpo(P(t,T.s3-.6,T.s3-.2));
    $('#slotcol').style.transform=`translateY(${-idx*190+(1-slotIn)*190-slotOut*190}px)`;
    $('#slotcol').style.filter=`blur(${vel*4}px)`;
    $('#slotline').style.transform=`scaleX(${E.inOutExpo(P(t,SLOT[3]+.5,SLOT[3]+.9))*(1-E.inExpo(P(t,T.s3-.65,T.s3-.35)))})`;
    $('#s2').style.transform=`translateX(${-E.inOutCubic(P(t,T.s2,T.s3))*40}px)`;
  }

  /* ---- Scene 3: impact (8.0 → 16.75) ---- */
  const s3on=t>T.s3-.05&&t<T.s4+.3; show(s3,s3on);
  if(s3on){
    const D=STAT.dur;
    statEls.forEach((el,i)=>{
      const st=STAT.first+i*D, en=st+D;
      const on=t>st-.05&&t<en+.05; show(el,on); if(!on)return;
      const s=stats[i];
      const cnt=E.outExpo(P(t,st,st+1.0));
      const num=$('.num',el);
      num.innerHTML=s.fmt(cnt);
      const fit=Math.min(1,900/num.scrollWidth);
      const inY=(1-E.outExpo(P(t,st,st+.55)))*100, outY=E.inExpo(P(t,en-.3,en))*-100;
      num.style.transformOrigin='0 100%';
      num.style.transform=`translateY(${inY+outY}%) scale(${fit}) skewX(${-(1-E.outExpo(P(t,st,st+.6)))*10}deg)`;
      $('.barfill',el).style.transform=`scaleX(${s.bar(E.inOutExpo(P(t,st+.15,st+1.0)))})`;
      const tr=$('.bartrack',el);
      tr.style.transformOrigin='100% 50%';
      tr.style.transform=`scaleX(${1-E.inExpo(P(t,en-.32,en))})`;
      const sp=$$('.split',el);
      rise(sp[0].parentElement,t,st+.08,{stagger:.014,dur:.7,out:en-.32,outStagger:.004,outDur:.25});
      rise(sp[1].parentElement,t,st+.16,{stagger:.014,dur:.7,out:en-.3,outStagger:.004,outDur:.25});
      const ty=$$('.type',el);
      typeIn(ty[0],P(t,st,st+.4)*(1-P(t,en-.28,en-.1)));
      typeIn(ty[1],P(t,st+.35,st+.85)*(1-P(t,en-.28,en-.1)));
    });
  }

  /* ---- Scene 4: journey (camera steps from job to job) ---- */
  const s4on=t>T.s4-.05&&t<T.s5+.6; show($('#s4'),s4on);
  if(s4on){
    const draw=E.inOutExpo(P(t,T.s4,T.s4+.7));
    $('#tline').style.transform=`scaleX(${draw})`;
    let steps=0;
    for(let k=1;k<nodes.length;k++)steps+=E.inOutCubic(P(t,moveStart(k),moveStart(k)+MOVE));
    const x=FOCUS-NX(0)-steps*(NX(1)-NX(0));
    world.style.transform=`translateX(${x}px)`;
    const head=cl(FOCUS-x,0,NX(nodes.length-1));
    $('#tprog').style.transform=`scaleX(${(head/5200)*draw})`;
    let yi=0;
    nodeEls.forEach((g,i)=>{
      const a=i===0?P(t,T.s4+.3,T.s4+1.0):P(t,moveStart(i)+.45,moveStart(i)+1.15);
      $('.ring',g).style.transform=`scale(${E.outBack(cl(a*1.6))})`;
      $('.core',g).style.transform=`scale(${E.outBack(cl(a*1.6-.3))})`;
      $('.stem',g).style.transform=`scaleY(${E.outExpo(cl(a*1.4-.1))})`;
      $$('.split',g).forEach((sp,k)=>$$('.ch',sp).forEach((c,j)=>{
        const xx=E.outExpo(cl(a*1.5-k*.15-j*.018));c.style.transform=`translateY(${(1-xx)*105}%)`}));
      typeIn($('.type',g),cl(a*2));
      if(i>0)yi+=E.inOutExpo(cl(a*1.5));
    });
    $('#yearcol').style.transform=`translateY(${-yi*330}px)`;
    $('#ghostyear').style.opacity=E.outCubic(P(t,T.s4+.2,T.s4+.9));
    $('#tickerin').style.transform=`translateX(${-(t-T.s4)*140}px)`;
    $('#ticker').style.opacity=E.outCubic(P(t,T.s4+.3,T.s4+1));
  }

  /* ---- Flood: signal wipe into s3, then circle into s5 ---- */
  const fl=$('#flood');
  if(t>T.s3-.45&&t<T.s3+.5){
    const a=E.inOutExpo(P(t,T.s3-.42,T.s3+.02)), b=E.inOutExpo(P(t,T.s3,T.s3+.46));
    fl.style.display='';fl.style.borderRadius='0';fl.style.width=W+'px';fl.style.height=H+'px';
    fl.style.left='0';fl.style.top='0';fl.style.transform='none';
    fl.style.clipPath=`inset(0 ${100-a*100}% 0 ${b*100}%)`;
  } else if(t>T.s5-.15){
    fl.style.display='';fl.style.clipPath='none';fl.style.borderRadius='50%';
    fl.style.width='40px';fl.style.height='40px';
    fl.style.left=(FOCUS-20)+'px';fl.style.top=(LY-20+2)+'px';
    fl.style.transform=`scale(${.45+E.inOutExpo(P(t,T.s5,T.s5+.75))*120})`;
  } else fl.style.display='none';

  /* ---- Scene 5: end card (21.7 → 25) ---- */
  const s5on=t>T.s5+.35; show($('#s5'),s5on);
  if(s5on){
    const b=T.s5+.45;
    $('#s5line').style.transform=`scaleX(${E.inOutExpo(P(t,b,b+.7))})`;
    const ms=$$('#s5 > .mask');
    rise(ms[0],t,b+.15);
    rise(ms[1],t,b+.35,{dir:-1});
    typeIn($('.type',ms[2]),P(t,b+.75,b+1.3));
    typeIn($('.type',ms[3]),P(t,b+.9,b+1.4));
    $$('#s5foot .type').forEach((e,i)=>typeIn(e,P(t,b+1.0+i*.12,b+1.5+i*.12)));
    $('#s5foot').style.borderTopColor=`rgba(11,12,16,${E.outCubic(P(t,b+.9,b+1.4))})`;
    $('#s5').style.transform=`scale(${1.04-.04*E.outCubic(P(t,T.s5+.35,DUR))})`;
  }
  $('#vignette').style.opacity=1-.7*P(t,T.s5,T.s5+.6);

  /* ---- Chrome ---- */
  $('#chrome').style.opacity=E.outCubic(P(t,.7,1.6))*(1-P(t,T.s5+.1,T.s5+.4));
  const sec=E.inOutExpo(P(t,T.s2,T.s2+.45))+E.inOutExpo(P(t,T.s3,T.s3+.45))+E.inOutExpo(P(t,T.s4,T.s4+.45));
  $('#sectcol').style.transform=`translateY(${-sec*28}px)`;
  const ss=Math.floor(t), ff=Math.floor((t%1)*60);
  $('#tc').textContent=`00:00:${String(ss).padStart(2,'0')}:${String(ff).padStart(2,'0')}`;
  $('#bar').style.transform=`scaleX(${t/DUR})`;
}
window.render=render;
window.DUR=DUR;
window.CUES={T,STAT,SLOT,nodes:nodes.map((n,i)=>i===0?T.s4+.3:moveStart(i)+.45),DUR};
// preview mode: plays in real time when opened directly in a browser
if(!location.search.includes('render')){
  let t0=null;const loop=ts=>{if(t0===null)t0=ts;render(((ts-t0)/1000)%(DUR+1));requestAnimationFrame(loop)};
  document.fonts.ready.then(()=>requestAnimationFrame(loop));
}
