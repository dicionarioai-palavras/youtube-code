import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Composition,Img,staticFile,registerRoot,delayRender,continueRender,useCurrentFrame} from 'remotion';

// S08 + S09 — mansão, apartamento, comparação e pesquisa. 1920x1080, 24 fps, 68,0 s.
// t=0 = 133,06 s na transcrição do Premiere (v5) = 2:15,286 na linha do tempo. "Pensa" entra em t=1,00.
// Todos os cues = início da palavra na transcrição (t = tempo_transcrição - 133,06), com ~0,1 s de antecipação.
const C={night:'#1A1D24',paper:'#F7F0E3',terra:'#C46D45',ocre:'#DB9B5B',blue:'#8F9DA3'};
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(x:number)=>{const t=clamp(x);return t*t*(3-2*t);};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const L=(t:number,a:number,b:number)=>clamp((t-a)/(b-a));
const E=(t:number,a:number,b:number)=>ease((t-a)/(b-a));
const FPS=24,DUR=1632;
const BEBAS='PalBebas',INTER='PalInter';

// ---------- câmera: zoom/pan de velocidade constante entre chaves [t, escala, foco x, foco y] (foco normalizado 0..1) ----------
type K=[number,number,number,number];
const camAt=(t:number,keys:K[])=>{
 if(t<=keys[0][0]) return {s:keys[0][1],x:keys[0][2],y:keys[0][3]};
 for(let i=0;i<keys.length-1;i++){const a=keys[i],b=keys[i+1];
  if(t<=b[0]){const u=(t-a[0])/(b[0]-a[0]);return {s:Math.exp(lerp(Math.log(a[1]),Math.log(b[1]),u)),x:lerp(a[2],b[2],u),y:lerp(a[3],b[3],u)};}}
 const k=keys[keys.length-1];return {s:k[1],x:k[2],y:k[3]};
};
const Cam:React.FC<{src:string;W:number;H:number;keys:K[];t:number;rot?:number;kick?:number;filter?:string;over?:(S:number)=>React.ReactNode}>=({src,W,H,keys,t,rot=0,kick=0,filter,over})=>{
 const c=camAt(t,keys);
 const base=Math.max(1920/W,1080/H);
 const S=base*c.s*(1+kick);
 const fx=Math.min(Math.max(c.x*W,960/S),W-960/S), fy=Math.min(Math.max(c.y*H,540/S),H-540/S);
 return <AbsoluteFill style={{overflow:'hidden',transform:`rotate(${rot}deg) scale(${rot?1.04:1})`,filter}}>
  <div style={{position:'absolute',left:0,top:0,width:W,height:H,transformOrigin:'0 0',transform:`translate(${960-fx*S}px,${540-fy*S}px) scale(${S})`}}>
   <Img src={staticFile(src)} style={{width:W,height:H,display:'block'}}/>
   {over&&over(S)}
  </div>
 </AbsoluteFill>;
};

// ---------- peças gráficas ----------
const tagStyle=(k:number):React.CSSProperties=>({position:'absolute',fontFamily:INTER,fontSize:34*k,letterSpacing:6*k,color:C.paper,background:'rgba(26,29,36,.78)',padding:`${10*k}px ${18*k}px`,borderLeft:`${6*k}px solid ${C.terra}`,whiteSpace:'nowrap',lineHeight:1.15});
const Tag:React.FC<{x:number;y:number;text:string;op:number;k?:number}>=({x,y,text,op,k=1})=> op<=0?null:<div style={{...tagStyle(k),left:x,top:y,opacity:op,transform:`translateX(${(1-op)*-24*k}px)`}}>{text}</div>;
const Leader:React.FC<{x1:number;y1:number;x2:number;y2:number;p:number;op?:number;k?:number}>=({x1,y1,x2,y2,p,op=1,k=1})=> p<=0?null:
 <svg style={{position:'absolute',left:0,top:0,overflow:'visible',opacity:op}} width="1" height="1"><line x1={x1} y1={y1} x2={lerp(x1,x2,p)} y2={lerp(y1,y2,p)} stroke={C.terra} strokeWidth={4*k}/><circle cx={lerp(x1,x2,p)} cy={lerp(y1,y2,p)} r={8*k} fill={C.terra}/></svg>;
const Big:React.FC<{x:number;y:number;text:string;size:number;color?:string;op:number;chars?:number}>=({x,y,text,size,color=C.paper,op,chars})=> op<=0?null:
 <div style={{position:'absolute',left:x,top:y,fontFamily:BEBAS,fontSize:size,lineHeight:1,color,opacity:op,whiteSpace:'nowrap'}}>{chars===undefined?text:text.slice(0,chars)}</div>;
const Plate:React.FC<{text:string;t:number;a:number;b:number;size?:number;bottom?:number}>=({text,t,a,b,size=104,bottom=64})=>{
 const op=E(t,a,a+.18)*(1-E(t,b-.18,b)); if(op<=0) return null;
 return <div style={{position:'absolute',left:100,bottom,fontFamily:BEBAS,fontSize:size,lineHeight:1,color:C.paper,background:'rgba(26,29,36,.93)',padding:'16px 38px 12px 32px',borderLeft:`10px solid ${C.terra}`,opacity:op,whiteSpace:'nowrap'}}>
  {text.split('').map((ch,i)=>{const ai=ease((t-a-i*.018)/.12);return <span key={i} style={{opacity:ai,display:'inline-block',whiteSpace:'pre',transform:`translateY(${(1-ai)*14}px)`}}>{ch}</span>;})}</div>;
};
const Gauge:React.FC<{x:number;y:number;w:number;v:number;op:number;label?:boolean}>=({x,y,w,v,op,label=true})=> op<=0?null:
 <div style={{position:'absolute',left:x,top:y,opacity:op}}>
  {label&&<div style={{fontFamily:INTER,fontSize:24,letterSpacing:9,color:C.terra,marginBottom:12}}>INCÔMODO</div>}
  <div style={{width:w,height:10,background:'rgba(247,240,227,.22)',borderRadius:5}}><div style={{width:w*clamp(v),height:10,background:C.terra,borderRadius:5}}/></div>
 </div>;
const Bust:React.FC<{x:number;y:number;k:number;color:string;op?:number;fill?:boolean}>=({x,y,k,color,op=1,fill=true})=>
 <g opacity={op} transform={`translate(${x},${y}) scale(${k})`}><circle cx="0" cy="-30" r="30" fill={fill?color:'none'} stroke={color} strokeWidth={fill?0:5}/><path d="M-62 46Q-62 4 0 4Q62 4 62 46Z" fill={fill?color:'none'} stroke={color} strokeWidth={fill?0:5}/></g>;

// recorte retangular com foco/zoom (usado na comparação)
const Crop:React.FC<{src:string;W:number;H:number;fx:number;fy:number;z:number;x:number;y:number;w:number;h:number;r?:number;op?:number;glow?:number}>=({src,W,H,fx,fy,z,x,y,w,h,r=12,op=1,glow=0})=>{
 const sc=Math.max(w/W,h/H)*z;
 const left=Math.min(0,Math.max(w-W*sc,w/2-fx*W*sc)), top=Math.min(0,Math.max(h-H*sc,h/2-fy*H*sc));
 return <div style={{position:'absolute',left:x,top:y,width:w,height:h,borderRadius:r,overflow:'hidden',opacity:op,boxShadow:`0 0 0 ${3+glow*5}px ${glow>0?C.terra:'rgba(247,240,227,.35)'},0 30px 80px rgba(0,0,0,.5)`}}>
  <Img src={staticFile(src)} style={{position:'absolute',left,top,width:W*sc,height:H*sc,maxWidth:'none'}}/>
 </div>;
};

const Film:React.FC=()=>{
 const f=useCurrentFrame(),t=f/FPS;
 const [handle]=useState(()=>delayRender('Fontes'));
 useEffect(()=>{Promise.all([document.fonts.load('200px PalBebas'),document.fonts.load('30px PalInter')]).then(()=>continueRender(handle));},[handle]);

 // ======== gauge global (INCÔMODO) ========
 let gv=0;
 if(t>=15.84) gv=lerp(0,.72,E(t,15.84,16.6)); if(t>=25.2) gv=lerp(.72,1,E(t,25.2,26.4));
 const gOp=E(t,7.4,7.9)*(1-E(t,26.7,27.0));

 // ======== CENA 1 — mansão 1,00–9,95 ========
 const sMansao=E(t,.9,1.3);
 const mkeys:K[]=[[1,1.0,.45,.62],[3.04,1.12,.46,.56],[4.9,1.26,.50,.52],[6.6,1.4,.52,.47],[9.95,1.7,.50,.44]];
 const gray=E(t,7.6,9.0);
 const youX=lerp(-90,2010,L(t,3.0,7.7));
 const windowsM:[number,number,number,number][]=[[485,850,75,235],[595,865,60,230],[695,880,55,225],[780,885,60,235],[225,865,70,235],[130,885,60,120]];

 // ======== CENA 2 — apartamento 9,70–17,45 ========
 const sApto=E(t,9.65,10.05);
 const kick=Math.max(0,1-(t-15.84)/.45)*(t>=15.84?1:0)*.07;
 const shake=t>=15.84&&t<16.9?Math.sin((t-15.84)*60)*(1-L(t,15.84,16.9))*7:0;
 const akeys:K[]=[[9.7,1.0,.50,.34],[11.7,1.22,.56,.50],[13.1,1.5,.60,.47],[15.2,1.85,.62,.47],[17.45,2.35,.62,.47]];
 const aptWin:[number,number,number,number][]=[[618,930,112,58],[777,926,74,62]];

 // ======== CENA 3 — garagem / cabeça 17,15–27,0 ========
 const sComp=E(t,17.15,17.5);
 const grow=E(t,22.16,25.6), toGar=E(t,19.96,21.0), enter=E(t,17.28,17.95), toBub=E(t,25.2,26.1);
 const r0={x:lerp(1980,1380,enter),y:260,w:340,h:520};
 const gar={x:262,y:598,w:158,h:242}, fin={x:570,y:110,w:780,h:780};
 const rA={x:lerp(r0.x,gar.x,toGar),y:lerp(r0.y,gar.y,toGar),w:lerp(r0.w,gar.w,toGar),h:lerp(r0.h,gar.h,toGar)};
 const aptR={x:lerp(rA.x,fin.x,grow),y:lerp(rA.y,fin.y,grow),w:lerp(rA.w,fin.w,grow),h:lerp(rA.h,fin.h,grow)};
 const mans={x:lerp(90,60,grow),y:lerp(150,770,grow),w:lerp(1180,300,grow),h:lerp(740,190,grow)};
 const pulseM=Math.max(0,1-Math.abs(t-21.3)/.35);

 // ======== CENA 4 — almoço 26,8–35,1 ========
 const sAlm=E(t,26.8,27.15);
 const alkeys:K[]=[[26.9,1.0,.50,.50],[29.0,1.2,.55,.42],[34.95,1.95,.63,.30]];

 // ======== CENA 5 — refrigerante 34,8–41,9 ========
 const sRef=E(t,34.8,35.15);
 const rkeys:K[]=[[34.89,1.0,.5,.5],[36.4,1.45,.60,.32],[37.2,1.9,.55,.38],[41.9,2.3,.50,.42]];
 const wob=t>=37.9?Math.sin((t-37.9)*5.5)*1.5*E(t,37.9,38.7):0;

 // ======== CENA 6 — calculadora 41,55–48,1 ========
 const sCalc=E(t,41.55,41.95);
 const calcOp=E(t,42.6,43.1);
 const keysOn=Math.floor(clamp((t-43.15)/.9)*9);

 // ======== CENA 7 — Palavras 47,4–68 ========
 const sPal=E(t,47.4,47.9);
 const fi=Math.max(1,Math.min(487,Math.floor((t-47.7)*24)+1));
 const pkeys:K[]=[[47.7,1.0,.5,.5],[48.4,1.0,.5,.5],[49.0,2.3,.29,.2],[50.0,2.3,.29,.2],[50.5,1.0,.5,.5],[50.95,2.0,.43,.78],[52.3,2.0,.43,.78],[52.9,2.0,.47,.41],[54.1,2.0,.47,.41],[58.0,1.1,.5,.5]];
 const pc=camAt(t,pkeys);
 const ps=pc.s;
 const pfx=Math.min(Math.max(pc.x*1920,960/ps),1920-960/ps);
 const lo=31+540/ps,hi=1048-540/ps;
 const pfy=lo>hi?540:Math.min(Math.max(31+pc.y*1017,lo),hi);
 const darken=E(t,54.3,58.6);
 const ramp=E(t,50.0,50.3)*(1-E(t,50.8,51.1));
 const ul=(x0:number,x1:number,y:number,a:number,b:number,h=22)=>{const p=E(t,a,b);return p<=0?null:<><div style={{position:'absolute',left:x0-4,top:y-h-4,width:(x1-x0+8)*p,height:h,background:'rgba(196,109,69,.28)'}}/><div style={{position:'absolute',left:x0-4,top:y,width:(x1-x0+8)*p,height:6,background:C.terra,borderRadius:3}}/></>;};

 // diagrama de comparação
 const YOU={x:520,y:540};
 const homes=[[1180,230],[1250,430],[1200,640],[1220,840]];
 const ta=[54.2,55.3,56.4,57.0];
 const names=['MESMA PROFISSÃO','AMIGO DE INFÂNCIA','VIZINHO','AMIGA DA ESCOLA\nQUE CASOU'];
 const m=lerp(1,.8,E(t,62.88,64.8))*lerp(1,.40,E(t,64.88,65.9))*lerp(1,.5,E(t,66.4,67.6));
 const lineW=lerp(3,9,E(t,59.2,60.6));
 const lineC=E(t,59.2,60.6);
 const diag=E(t,54.3,55.0);
 const chipsOp=1-E(t,64.7,65.0);
 const nodeAt=(i:number)=>{const px=lerp(YOU.x,homes[i][0],m),py=lerp(YOU.y,homes[i][1],m);
  const mg=i===3?E(t,65.5,66.2):0;return {x:lerp(px,YOU.x+40,mg),y:lerp(py,YOU.y,mg)};};
 const ringP=(t0:number)=>{const q=(t-t0)/1.1;return q<0||q>1?null:{r:110+q*330,o:.8*(1-q)};};
 const rings=[61.5,61.95,62.4].map(ringP).filter(Boolean) as {r:number;o:number}[];

 return <AbsoluteFill style={{background:C.night,overflow:'hidden'}}>
 <style>{`@font-face{font-family:PalBebas;src:url('${staticFile('fonts/BebasNeue.woff2')}')}@font-face{font-family:PalInter;src:url('${staticFile('fonts/Inter-500.woff2')}')}`}</style>

 {/* 1 — mansão */}
 {t>=.9&&t<10.4&&<AbsoluteFill style={{opacity:sMansao}}>
  <Cam src="img/mansao.jpg" W={1125} H={2000} keys={mkeys} t={t} filter={`grayscale(${gray*.85}) brightness(${1-.25*gray})`} over={(S)=>
   <>{windowsM.map((w,i)=>{const a=E(t,5.84+i*.12,5.84+i*.12+.25)*(1-E(t,7.0,7.4));return a<=0?null:<div key={i} style={{position:'absolute',left:w[0],top:w[1],width:w[2],height:w[3],border:`${5/S}px solid ${C.terra}`,background:'rgba(196,109,69,.2)',opacity:a}}/>;})}</>}/>
  <AbsoluteFill style={{background:'linear-gradient(90deg,rgba(26,29,36,.80) 0%,rgba(26,29,36,.35) 40%,rgba(26,29,36,0) 65%)'}}/>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 50%,rgba(26,29,36,0) 50%,rgba(26,29,36,.5) 100%)'}}/>
  {/* 50 milhões */}
  {(()=>{const op=E(t,1.96,2.1)*(1-E(t,3.5,3.85));return op>0&&<div style={{position:'absolute',left:130,top:190,opacity:op}}>
   <div style={{fontFamily:BEBAS,fontSize:300,lineHeight:1,color:C.paper}}>{Math.round(50*E(t,1.98,2.7))}</div>
   <div style={{fontFamily:INTER,fontSize:42,letterSpacing:16,color:C.terra,opacity:E(t,2.45,2.65)}}>MILHÕES</div>
   <div style={{height:6,width:260*E(t,2.5,3.0),background:C.terra,marginTop:18}}/></div>;})()}
  {/* você passa */}
  {(()=>{const op=E(t,3.0,3.2)*(1-E(t,7.5,7.8));const y=900+Math.sin(t*5)*4;return op>0&&<svg style={{position:'absolute',inset:0,opacity:op}} width="1920" height="1080">
   <defs><linearGradient id="tr" x1="0" x2="1"><stop offset="0" stopColor={C.terra} stopOpacity="0"/><stop offset="1" stopColor={C.terra} stopOpacity=".9"/></linearGradient></defs>
   <rect x={youX-420} y={y-3} width={420} height={6} fill="url(#tr)"/><circle cx={youX} cy={y} r={16} fill={C.terra}/>
   <text x={youX} y={y-34} textAnchor="middle" fontFamily={INTER} fontSize="28" letterSpacing="8" fill={C.paper}>VOCÊ</text></svg>;})()}
  {/* piscina */}
  {(()=>{const op=E(t,4.8,5.05)*(1-E(t,6.0,6.3));return op>0&&<div style={{position:'absolute',left:1420,top:230,opacity:op}}>
   <svg width="300" height="190" viewBox="0 0 300 190"><rect x="6" y="20" width="288" height="130" rx="22" fill="rgba(26,29,36,.55)" stroke={C.terra} strokeWidth="5"/>
   {[0,1,2].map(i=><path key={i} d={`M36 ${70+i*28}q27 -22 54 0t54 0t54 0t54 0`} fill="none" stroke={C.paper} strokeWidth="5" strokeLinecap="round" strokeDasharray="1" pathLength={1} strokeDashoffset={1-E(t,4.85+i*.12,5.4+i*.12)}/>)}</svg>
   <div style={{fontFamily:INTER,fontSize:34,letterSpacing:10,color:C.paper,marginTop:10}}>PISCINA</div></div>;})()}
  <Tag x={130} y={200} text="QUARTOS" op={E(t,5.84,6.05)*(1-E(t,7.0,7.4))}/>
  {/* nada */}
  <Big x={130} y={640} text="NADA." size={230} color={C.paper} op={E(t,8.64,8.9)*(1-E(t,9.55,9.95))*.95}/>
 </AbsoluteFill>}

 {/* 2 — apartamento */}
 {t>=9.65&&t<17.9&&<AbsoluteFill style={{opacity:sApto,transform:`translate(${shake}px,${shake*.6}px)`}}>
  <Cam src="img/apto.jpg" W={1333} H={2000} keys={akeys} t={t} kick={kick} over={(S)=>
   <>{aptWin.map((w,i)=>{const a=E(t,13.1+i*.15,13.5+i*.15);return a<=0?null:<div key={i} style={{position:'absolute',left:w[0],top:w[1],width:w[2],height:w[3],border:`${6/S}px solid ${C.terra}`,background:'rgba(196,109,69,.22)',opacity:a}}/>;})}</>}/>
  <AbsoluteFill style={{background:'linear-gradient(90deg,rgba(26,29,36,.82) 0%,rgba(26,29,36,.3) 38%,rgba(26,29,36,0) 62%)'}}/>
  <AbsoluteFill style={{background:`radial-gradient(ellipse at 55% 50%,rgba(26,29,36,0) ${50-18*E(t,15.84,16.8)}%,rgba(26,29,36,${.5+.35*E(t,15.84,16.8)}) 100%)`}}/>
  <Tag x={130} y={160} text="SEU PRIMO" op={E(t,10.9,11.1)*(1-E(t,12.2,12.5))}/>
  <Tag x={130} y={160} text="COMPRANDO UM APARTAMENTO" op={E(t,11.7,11.9)*(1-E(t,13.0,13.3))}/>
  <Big x={130} y={230} text="DOIS QUARTOS" size={170} color={C.paper} op={E(t,13.16,13.4)*(1-E(t,17.1,17.4))}/>
  <Big x={130} y={600} text="AÍ…" size={200} color={C.paper} op={E(t,15.2,15.4)*(1-E(t,15.84,16.0))}/>
  <Big x={130} y={600} text="INCOMODA" size={200} color={C.terra} op={E(t,15.84,16.0)*(1-E(t,17.1,17.4))}/>
 </AbsoluteFill>}

 {/* 3 — garagem e cabeça */}
 {t>=17.15&&t<27.4&&<AbsoluteFill style={{opacity:sComp,background:C.night}}>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 45%,#262b36 0%,#1A1D24 70%)'}}/>
  <Crop src="img/mansao.jpg" W={1125} H={2000} fx={.45} fy={.52} z={lerp(1,1.18,L(t,17.2,26))} x={mans.x} y={mans.y} w={mans.w} h={mans.h} op={lerp(1,.35,grow)} glow={pulseM}/>
  <Tag x={90} y={92} text="MANSÃO" op={E(t,17.3,17.5)*(1-E(t,22.0,22.4))}/>
  {/* garagem */}
  {(()=>{const op=E(t,20.3,20.6)*(1-E(t,22.0,22.6));return op>0&&<><svg style={{position:'absolute',inset:0,opacity:op}} width="1920" height="1080"><rect x="140" y="570" width="400" height="290" rx="8" fill="rgba(26,29,36,.35)" stroke={C.terra} strokeWidth="5" strokeDasharray="22 14"/></svg>
   <Tag x={140} y={515} text="GARAGEM" op={op}/></>;})()}
  <Crop src="img/apto.jpg" W={1333} H={2000} fx={.6} fy={.5} z={lerp(1,1.4,L(t,17.3,26))} x={aptR.x} y={aptR.y} w={aptR.w} h={aptR.h} r={lerp(12,390,toBub)} glow={Math.max(E(t,18.68,18.9)*(1-E(t,19.9,20.1)),E(t,25.0,25.3))}/>
  <Big x={1360} y={96} text="DOIS QUARTOS" size={100} op={E(t,17.28,17.5)*(1-E(t,19.7,20.0))}/>
  {/* check */}
  {(()=>{const op=E(t,21.0,21.2)*(1-E(t,22.0,22.4));return op>0&&<svg style={{position:'absolute',left:400,top:572,opacity:op}} width="70" height="60"><path d="M8 32L26 50L62 8" fill="none" stroke={C.terra} strokeWidth="9" strokeLinecap="round" strokeLinejoin="round"/></svg>;})()}
  {/* balão de pensamento */}
  {(()=>{const op=E(t,25.5,25.9);return op>0&&<><svg style={{position:'absolute',inset:0,opacity:op}} width="1920" height="1080"><circle cx="520" cy="960" r="26" fill="none" stroke={C.paper} strokeWidth="5"/><circle cx="450" cy="1022" r="14" fill="none" stroke={C.paper} strokeWidth="5"/></svg>
   <div style={{position:'absolute',left:1430,top:500,fontFamily:BEBAS,fontSize:92,color:C.paper,letterSpacing:3,opacity:op}}>{'NA SUA CABEÇA'.slice(0,Math.floor((t-25.5)/.05))}</div></>;})()}
 </AbsoluteFill>}

 {/* 4 — almoço */}
 {t>=26.8&&t<35.4&&<AbsoluteFill style={{opacity:sAlm}}>
  <Cam src="img/almoco.jpg" W={1920} H={1080} keys={alkeys} t={t} over={(S)=>{const k=1/S;return <>
   <Tag x={150} y={120} k={k} text="VOCÊ" op={E(t,27.9,28.1)*(1-E(t,29.0,29.3))}/>
   <Leader x1={330} y1={120+30*k*0+40} x2={330} y2={330} p={E(t,28.0,28.4)*(1-E(t,29.0,29.3))} k={k}/>
   <Tag x={1400} y={90} k={k} text="ESSE CARA" op={E(t,29.1,29.3)*(1-E(t,30.3,30.6))}/>
   <Leader x1={1480} y1={130} x2={1230} y2={300} p={E(t,29.2,29.6)*(1-E(t,30.3,30.6))} k={k}/>
   <Tag x={1480} y={140} k={k} text="IDADE" op={E(t,31.2,31.4)}/>
   <Leader x1={1480} y1={165} x2={1335} y2={235} p={E(t,31.3,31.7)} k={k}/>
   <Tag x={1500} y={300} k={k} text="EMPREGO" op={E(t,32.4,32.6)}/>
   <Leader x1={1500} y1={325} x2={1390} y2={440} p={E(t,32.5,32.9)} k={k}/>
   <Tag x={1470} y={470} k={k} text="ESCOLHAS" op={E(t,33.4,33.6)}/>
   <Leader x1={1470} y1={495} x2={1210} y2={520} p={E(t,33.5,33.9)} k={k}/></>;}}/>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 60% 40%,rgba(26,29,36,0) 45%,rgba(26,29,36,.55) 100%)'}}/>
  <Big x={110} y={700} text="POR QUE?" size={250} color={C.paper} op={E(t,26.93,27.1)*(1-E(t,27.7,28.0))}/>
 </AbsoluteFill>}

 {/* 5 — refrigerante */}
 {t>=34.8&&t<42.2&&<AbsoluteFill style={{opacity:sRef}}>
  <Cam src="img/refri.jpg" W={2000} H={1150} keys={rkeys} t={t} rot={wob} filter={`contrast(${1+.12*E(t,40.0,41.0)}) saturate(${1-.25*E(t,40.0,41.0)})`} over={(S)=>{const k=1/S;return <>
   <Tag x={1250} y={150} k={k} text="REFRIGERANTE" op={E(t,36.45,36.65)*(1-E(t,37.7,38.0))}/>
   <Leader x1={1260} y1={190} x2={1150} y2={255} p={E(t,36.55,36.95)*(1-E(t,37.7,38.0))} k={k}/>
   <Tag x={560} y={640} k={k} text="COM O DENTE" op={E(t,37.2,37.4)*(1-E(t,38.6,38.9))}/>
   <Leader x1={740} y1={640} x2={860} y2={545} p={E(t,37.3,37.7)*(1-E(t,38.6,38.9))} k={k}/></>;}}/>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 50%,rgba(26,29,36,0) 45%,rgba(26,29,36,.65) 100%)'}}/>
 </AbsoluteFill>}

 {/* 6 — a conta */}
 {t>=41.55&&t<48.4&&<AbsoluteFill style={{opacity:sCalc}}>
  <Cam src="img/refri.jpg" W={2000} H={1150} keys={[[41.55,2.3,.5,.42],[48.4,2.6,.5,.42]]} t={t} filter="blur(16px) brightness(.5)"/>
  <AbsoluteFill style={{background:'rgba(26,29,36,.72)'}}/>
  {calcOp>0&&<div style={{position:'absolute',left:210,top:210,width:1500,height:360,borderRadius:34,background:'rgba(26,29,36,.92)',border:`5px solid ${C.terra}`,opacity:calcOp,transform:`scale(${.96+.04*calcOp})`,boxShadow:'0 30px 90px rgba(0,0,0,.55)'}}>
   <Big x={90} y={70} text="ELE" size={190} op={E(t,43.3,43.5)}/>
   <Big x={560} y={70} text="−" size={190} color={C.terra} op={E(t,43.65,43.85)}/>
   <Big x={730} y={70} text="EU" size={190} op={E(t,43.85,44.05)}/>
   <Big x={1070} y={70} text="=" size={190} color={C.terra} op={E(t,45.9,46.1)}/>
   <Big x={1250} y={40} text="?" size={260} color={C.terra} op={E(t,47.0,47.25)} />
   <div style={{position:'absolute',left:92,top:272,fontFamily:INTER,fontSize:34,letterSpacing:7,color:C.paper,opacity:E(t,44.95,45.15)}}>CONSEGUIU <span style={{color:C.terra}}>✓</span></div>
   <div style={{position:'absolute',left:732,top:272,fontFamily:INTER,fontSize:34,letterSpacing:7,color:C.paper,opacity:E(t,46.75,46.95)}}>NÃO <span style={{color:C.terra}}>✗</span></div>
  </div>}
  {calcOp>0&&<svg style={{position:'absolute',left:720,top:640,opacity:calcOp}} width="480" height="360">{Array.from({length:9}).map((_,i)=>{const cx=70+(i%3)*170,cy=60+Math.floor(i/3)*110,on=i<keysOn&&i>=keysOn-1;return <g key={i}><circle cx={cx} cy={cy} r="42" fill={on?C.terra:'rgba(247,240,227,.08)'} stroke={on?C.terra:'rgba(247,240,227,.4)'} strokeWidth="4"/></g>;})}</svg>}
 </AbsoluteFill>}

 {/* 7 — Palavras interativo */}
 {t>=47.4&&<AbsoluteFill style={{opacity:sPal,background:C.night}}>
  <AbsoluteFill style={{filter:`blur(${ramp*5+darken*5}px)`}}>
   <div style={{position:'absolute',left:0,top:0,width:1920,height:1080,transformOrigin:'0 0',transform:`translate(${960-pfx*ps}px,${540-pfy*ps}px) scale(${ps})`}}>
    <Img src={staticFile(`pesq/p${String(fi).padStart(4,'0')}.jpg`)} style={{position:'absolute',left:0,top:31,width:1920,height:1017}}/>
    <div style={{position:'absolute',left:0,top:31,width:1920,height:1017}}>
     {ul(531,597,141,49.0,49.4)}
     {ul(732,900,893,50.98,51.6)}
     {ul(823,1019,403,52.5,53.2)}
    </div>
   </div>
  </AbsoluteFill>
  <AbsoluteFill style={{background:C.night,opacity:darken*.94}}/>
  <Plate t={t} a={47.98} b={49.42} text="AS PESQUISAS SOBRE INVEJA"/>
  <Plate t={t} a={49.42} b={50.75} text="ENCONTRARAM EXATAMENTE ISSO"/>
  <Plate t={t} a={50.75} b={52.0} text="A COMPARAÇÃO PESA MAIS"/>
  <Plate t={t} a={52.0} b={54.15} text="QUANDO O OUTRO PARECE COM VOCÊ"/>

  {/* comparação */}
  {diag>0&&<AbsoluteFill style={{opacity:diag}}>
   <svg style={{position:'absolute',inset:0}} width="1920" height="1080">
    {rings.map((r,i)=><circle key={i} cx={YOU.x} cy={YOU.y} r={r.r} fill="none" stroke={C.terra} strokeWidth="4" opacity={r.o}/>)}
    {homes.map((h,i)=>{const n=nodeAt(i);const p=E(t,ta[i]+.3,ta[i]+.8);if(p<=0) return null;
     const x2=lerp(YOU.x,n.x,p),y2=lerp(YOU.y,n.y,p);const col=lineC>.5?C.terra:'rgba(247,240,227,.65)';
     return <g key={i}><line x1={YOU.x} y1={YOU.y} x2={x2} y2={y2} stroke={col} strokeWidth={lineW} strokeLinecap="round"/>
      <text x={(YOU.x+x2)/2} y={(YOU.y+y2)/2-16} textAnchor="middle" fontFamily={BEBAS} fontSize="54" fill={col} opacity={p>.9?1:0}>=</text></g>;})}
    <Bust x={YOU.x} y={YOU.y+20} k={1.7} color={C.terra} op={E(t,54.35,54.8)}/>
    {homes.map((h,i)=>{const n=nodeAt(i);const a=E(t,ta[i],ta[i]+.4);return a<=0?null:<Bust key={i} x={n.x} y={n.y+14} k={1.0} color={C.paper} op={a}/>;})}
    {E(t,58.38,58.8)>0&&(()=>{const n=nodeAt(3);const a=E(t,58.38,58.8)*chipsOp;return <g opacity={a} transform={`translate(${n.x+58},${n.y-34})`}><circle cx="0" cy="0" r="17" fill="none" stroke={C.ocre} strokeWidth="5"/><circle cx="22" cy="0" r="17" fill="none" stroke={C.ocre} strokeWidth="5"/></g>;})()}
   </svg>
   <div style={{position:'absolute',left:YOU.x-70,top:YOU.y+100,width:140,textAlign:'center',fontFamily:INTER,fontSize:32,letterSpacing:8,color:C.paper,opacity:E(t,54.4,54.8)}}>VOCÊ</div>
   {homes.map((h,i)=>{const n=nodeAt(i);const a=E(t,ta[i]+.1,ta[i]+.5)*chipsOp;return a<=0?null:<div key={i} style={{position:'absolute',left:n.x+(i===3?96:62),top:n.y-(i===3?58:26),fontFamily:INTER,fontSize:30,letterSpacing:5,color:C.paper,background:'rgba(26,29,36,.8)',padding:'8px 16px',borderLeft:`6px solid ${C.terra}`,whiteSpace:'pre',lineHeight:1.2,opacity:a}}>{names[i]}</div>;})}
   {E(t,62.2,62.5)>0&&<div style={{position:'absolute',left:YOU.x-170,top:YOU.y-250,width:340,textAlign:'center',fontFamily:BEBAS,fontSize:70,letterSpacing:4,color:C.terra,opacity:E(t,62.2,62.5)*(1-E(t,63.9,64.3))}}>SUA VIDA</div>}
   {E(t,65.0,65.2)>0&&<div style={{position:'absolute',left:0,top:130,width:1920,textAlign:'center',fontFamily:BEBAS,fontSize:230,letterSpacing:6,color:C.paper,opacity:E(t,65.0,65.2)*(1-E(t,67.3,67.9)*.0)}}>PODIA SER <span style={{color:C.terra}}>EU</span></div>}
  </AbsoluteFill>}
  <Plate t={t} a={59.0} b={61.3} text="PESA MAIS AINDA"/>
  <Plate t={t} a={61.3} b={62.88} text="QUANDO É IMPORTANTE NA SUA VIDA"/>
  <Plate t={t} a={62.88} b={64.8} text="QUANTO MAIS FÁCIL FOR PENSAR"/>
  <Plate t={t} a={64.88} b={65.9} text="PODIA SER EU"/>
  <Plate t={t} a={65.95} b={68.0} text="MAIS PERTO O INCÔMODO CHEGA"/>
  <Gauge x={1300} y={1010} w={520} v={lerp(.25,1,E(t,66.4,67.9))} op={E(t,66.3,66.7)}/>
 </AbsoluteFill>}

 {/* gauge global S08 */}
 <Gauge x={120} y={980} w={560} v={gv} op={gOp}/>
 </AbsoluteFill>;
};
registerRoot(()=> <Composition id="inveja-s08" component={Film} width={1920} height={1080} fps={FPS} durationInFrames={DUR}/>);
