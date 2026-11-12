import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Composition,Img,staticFile,registerRoot,delayRender,continueRender,useCurrentFrame} from 'remotion';

// S11 — O tênis e o livro. 1920x1080, 24 fps, 75,07 s. t=0 = 232,14 s na transcrição = 3:54,367 na linha do tempo (offset +2,226 s).
const C={night:'#1A1D24',paper:'#F7F0E3',terra:'#C46D45',ocre:'#DB9B5B',blue:'#8F9DA3'};
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(x:number)=>{const t=clamp(x);return t*t*(3-2*t);};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const L=(t:number,a:number,b:number)=>clamp((t-a)/(b-a));
const E=(t:number,a:number,b:number)=>ease((t-a)/(b-a));
const FPS=24,DUR=1802,DUR21=240;
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

// recorte em cartão com zoom (para a cena final)
const Card:React.FC<{src:string;W:number;H:number;x:number;y:number;w:number;h:number;op:number;rot?:number;fx?:number;fy?:number;z?:number}>=({src,W,H,x,y,w,h,op,rot=0,fx=.5,fy=.5,z=1})=>{
 if(op<=0) return null;
 const sc=Math.max(w/W,h/H)*z; const left=Math.min(0,Math.max(w-W*sc,w/2-fx*W*sc)),top=Math.min(0,Math.max(h-H*sc,h/2-fy*H*sc));
 return <div style={{position:'absolute',left:x,top:y,width:w,height:h,borderRadius:14,overflow:'hidden',opacity:op,transform:`rotate(${rot}deg)`,boxShadow:'0 0 0 3px rgba(247,240,227,.4),0 40px 90px rgba(0,0,0,.55)'}}>
  <Img src={staticFile(src)} style={{position:'absolute',left,top,width:W*sc,height:H*sc,maxWidth:'none'}}/></div>;
};
const Mark:React.FC<{x:number;y:number;w:number;h:number;p:number;S:number;fill?:string;line?:string}>=({x,y,w,h,p,S,fill='rgba(219,155,91,.38)',line=C.terra})=> p<=0?null:
 <div style={{position:'absolute',left:x,top:y,width:w*p,height:h,background:fill,borderBottom:`${5/S}px solid ${line}`,overflow:'hidden'}}/>;

const back=(u:number)=>{const x=clamp(u);return 1+2.70158*Math.pow(x-1,3)+1.70158*Math.pow(x-1,2);};
// palavra cinética em itálico: letras entram com overshoot, giro e deslocamento; saem em cascata
const KW:React.FC<{text:string;t:number;a:number;b:number;x:number;y:number;size:number;color?:string;font?:string;italic?:boolean;stag?:number;plate?:boolean;align?:'left'|'center'}>=({text,t,a,b,x,y,size,color=C.paper,font=INTER,italic=false,stag=.035,plate=true,align='left'})=>{
 if(t<a||t>b+.4) return null;
 const out=E(t,b,b+.3);
 return <div style={{position:'absolute',left:align==='center'?0:x,right:align==='center'?0:undefined,top:y,textAlign:align,opacity:1-out,whiteSpace:'pre'}}>
  <span style={{display:'inline-block',fontFamily:font,fontSize:size,lineHeight:1.1,color,fontStyle:italic?'italic':'normal',background:plate?'rgba(26,29,36,.92)':'transparent',padding:plate?`${size*.12}px ${size*.4}px ${size*.1}px ${size*.3}px`:0,borderLeft:plate?`${Math.max(6,size*.09)}px solid ${C.terra}`:'none',transform:`skewX(${font===BEBAS&&italic?-10:0}deg)`}}>
   {text.split('').map((ch,i)=>{const u=back((t-a-i*stag)/.38);const o=clamp((t-a-i*stag)/.12);return <span key={i} style={{display:'inline-block',whiteSpace:'pre',opacity:o,transform:`translateY(${(1-u)*size*.7}px) rotate(${(1-u)*(i%2?9:-9)}deg) scale(${.6+.4*u})`}}>{ch}</span>;})}
  </span></div>;
};
const Ripple:React.FC<{x:number;y:number;t:number;a:number;color?:string;r?:number}>=({x,y,t,a,color=C.terra,r=90})=>{
 const u=(t-a)/.7; if(u<0||u>1) return null;
 return <div style={{position:'absolute',left:x-r,top:y-r,width:r*2,height:r*2,borderRadius:r,border:`6px solid ${color}`,opacity:1-u,transform:`scale(${.2+.8*ease(u)})`}}/>;
};
const Dots:React.FC<{x:number;y:number;t:number;a:number;b:number}>=({x,y,t,a,b})=>{
 if(t<a||t>b) return null; const o=E(t,a,a+.2)*(1-E(t,b-.2,b));
 return <div style={{position:'absolute',left:x,top:y,display:'flex',gap:12,opacity:o,background:'rgba(26,29,36,.9)',padding:'16px 22px',borderRadius:40,borderLeft:`6px solid ${C.terra}`}}>
  {[0,1,2].map(i=><div key={i} style={{width:16,height:16,borderRadius:8,background:C.paper,transform:`translateY(${-Math.abs(Math.sin((t-a)*6-i*.7))*14}px)`}}/>)}</div>;
};
// posição na tela de um ponto da imagem, seguindo a câmera
const scr=(keys:K[],W:number,H:number,t:number,ix:number,iy:number)=>{
 const c=camAt(t,keys);const base=Math.max(1920/W,1080/H);const S=base*c.s;
 const fx=Math.min(Math.max(c.x*W,960/S),W-960/S),fy=Math.min(Math.max(c.y*H,540/S),H-540/S);
 return {x:960+(ix-fx)*S,y:540+(iy-fy)*S};
};
// cursor que viaja entre alvos [t, x_img, y_img]
const Cursor:React.FC<{t:number;keys:K[];W:number;H:number;path:[number,number,number][];op:number}>=({t,keys,W,H,path,op})=>{
 if(op<=0) return null;
 let i=0;while(i<path.length-2&&t>path[i+1][0]) i++;
 const a=path[i],b=path[i+1];const u=ease((t-a[0])/(b[0]-a[0]));
 const pa=scr(keys,W,H,t,a[1],a[2]),pb=scr(keys,W,H,t,b[1],b[2]);
 const x=lerp(pa.x,pb.x,u),y=lerp(pa.y,pb.y,u)+Math.sin(t*9)*1.5;
 return <svg style={{position:'absolute',left:x,top:y,opacity:op,filter:'drop-shadow(0 6px 10px rgba(0,0,0,.5))'}} width="54" height="64" viewBox="0 0 54 64"><path d="M4 4L4 50L16 39L24 58L33 54L25 36L42 36Z" fill={C.paper} stroke={C.night} strokeWidth="4" strokeLinejoin="round"/></svg>;
};

// ---------- peças próprias do S11 ----------
const Gauge:React.FC<{x:number;y:number;w:number;v:number;op:number;label?:boolean;note?:string}>=({x,y,w,v,op,label=true,note})=> op<=0?null:
 <div style={{position:'absolute',left:x,top:y,opacity:op,background:'rgba(26,29,36,.82)',padding:'16px 24px 20px 22px',borderLeft:`8px solid ${C.terra}`}}>
  {label&&<div style={{fontFamily:INTER,fontSize:26,letterSpacing:9,color:C.terra,marginBottom:12,display:'flex',justifyContent:'space-between',width:w}}><span>INCÔMODO</span>{note&&<span style={{color:C.paper,letterSpacing:4}}>{note}</span>}</div>}
  <div style={{width:w,height:14,background:'rgba(247,240,227,.25)',borderRadius:7}}><div style={{width:w*clamp(v),height:14,background:C.terra,borderRadius:7}}/></div>
 </div>;
const gKeys:[number,number][]=[[0,.03],[5.8,.03],[9.6,.05],[10.8,.30],[14.6,.34],[18.8,.50],[20.2,.78],[28.4,.84],[29.4,.96],[37,.9],[41,.97],[47,.72],[56,.78],[60,.92],[66.2,.9],[67.2,1],[75.1,1]];
const gv=(t:number)=>{for(let i=0;i<gKeys.length-1;i++){const a=gKeys[i],b=gKeys[i+1];if(t<=b[0]) return lerp(a[1],b[1],ease((t-a[0])/(b[0]-a[0])));}return 1;};
const sc=(t:number,a:number,b:number,f=.3)=>E(t,a,a+f)*(1-E(t,b-f,b));
const Bg:React.FC<{kind?:number}>=({kind=0})=> <AbsoluteFill style={{background:kind===0?'radial-gradient(120% 120% at 30% 20%,#2A3A4C 0%,#1D2733 45%,#141A22 100%)':'radial-gradient(120% 120% at 70% 80%,#2C3B4B 0%,#1C2530 50%,#141A22 100%)'}}/>;
const Shade:React.FC<{top?:boolean}>=({top=true})=> <AbsoluteFill style={{background:`linear-gradient(${top?'180deg':'0deg'},rgba(26,29,36,.7) 0%,rgba(26,29,36,0) 30%),linear-gradient(0deg,rgba(26,29,36,.78) 0%,rgba(26,29,36,0) 34%)`}}/>;
const Strike:React.FC<{x:number;y:number;w:number;p:number;h?:number}>=({x,y,w,p,h=14})=> p<=0?null:<div style={{position:'absolute',left:x,top:y,width:w*p,height:h,background:C.terra,transform:'rotate(-2deg)',transformOrigin:'0 50%'}}/>;
const Bubble:React.FC<{text:string;t:number;a:number;b:number;x:number;y:number}>=({text,t,a,b,x,y})=>{
 if(t<a||t>b+.3) return null; const u=back((t-a)/.4), o=E(t,a,a+.1)*(1-E(t,b,b+.3));
 return <div style={{position:'absolute',left:x,top:y,opacity:o,transform:`scale(${.5+.5*u}) translateY(${(1-u)*40}px)`,transformOrigin:'0 100%',fontFamily:INTER,fontStyle:'italic',fontSize:54,color:C.night,background:C.paper,padding:'20px 38px 22px',borderRadius:'38px 38px 38px 8px',boxShadow:'0 18px 50px rgba(0,0,0,.45)',whiteSpace:'nowrap'}}>{text}</div>;
};
// ---- área de trabalho (ARQUIVO01) ----
const DIcon:React.FC<{kind:string;x:number;y:number;label:string;op?:number}>=({kind,x,y,label,op=1})=>{
 const fill=kind==='folder'?C.ocre:kind==='sheet'?'#6F8F7A':kind==='trash'?'none':C.paper;
 return <div style={{position:'absolute',left:x-70,top:y,width:140,textAlign:'center',opacity:.85*op}}>
  <svg width="84" height="84" viewBox="0 0 84 84" style={{display:'block',margin:'0 auto'}}>
   {kind==='folder'&&<path d="M6 20h26l8 9h38v42H6Z" fill={fill}/>}
   {kind==='sheet'&&<g><rect x="16" y="6" width="52" height="72" rx="5" fill={fill}/><path d="M26 28h32M26 40h32M26 52h32M42 24v36" stroke="#2B3A4A" strokeWidth="3"/></g>}
   {kind==='text'&&<g><rect x="16" y="6" width="52" height="72" rx="5" fill={fill}/><path d="M26 24h32M26 36h32M26 48h22" stroke="#2B3A4A" strokeWidth="4"/></g>}
   {kind==='trash'&&<g stroke={C.paper} strokeWidth="5" fill="none"><path d="M20 24h44l-5 52H25Z"/><path d="M14 24h56M34 24v-8h16v8"/></g>}
  </svg>
  <div style={{fontFamily:INTER,fontSize:22,color:C.paper,marginTop:8,textShadow:'0 2px 6px rgba(0,0,0,.7)'}}>{label}</div></div>;
};
const NAME='livro_final_agora_vai_versão_8.docx';
const SEG:[number,string][]=[[50.9,'livro'],[51.55,'_final'],[52.3,'_agora'],[52.8,'_vai'],[53.2,'_versão'],[53.75,'_8'],[54.9,'.docx']];
const typed=(t:number)=>{let s='';for(const [a,w] of SEG){const n=Math.floor(clamp((t-a)/.32)*w.length+(t>=a?.0001:0));if(t>=a) s+=w.slice(0,Math.max(1,Math.min(w.length,Math.ceil(clamp((t-a)/.30)*w.length))));}return s;};
const FX=960,FY=420; // ícone do arquivo
const Win:React.FC<{p:number;t:number}>=({p,t})=>{
 if(p<=0) return null;
 const W=1300,H=780, x0=FX-W/2, y0=FY+60-H/2-40;
 const s=.12+.88*p, tx=(FX-960)*(1-p), ty=(FY+40-540)*(1-p);
 return <div style={{position:'absolute',left:x0,top:y0,width:W,height:H,opacity:clamp(p*3),transform:`translate(${tx}px,${ty}px) scale(${s})`,transformOrigin:'50% 50%',borderRadius:12,overflow:'hidden',background:'#E6E3DC',boxShadow:'0 40px 120px rgba(0,0,0,.6),0 0 0 2px rgba(247,240,227,.25)'}}>
  <div style={{height:46,background:C.night,display:'flex',alignItems:'center',padding:'0 18px',fontFamily:INTER,fontSize:20,color:C.paper,justifyContent:'space-between'}}><span>{NAME}</span><span style={{letterSpacing:14,color:C.blue}}>— ▢ ✕</span></div>
  <div style={{height:64,background:'#2A3441',display:'flex',alignItems:'center',gap:34,padding:'0 26px',fontFamily:INTER,fontSize:20,color:C.blue}}><span style={{color:C.paper,borderBottom:`3px solid ${C.terra}`,paddingBottom:4}}>Página inicial</span><span>Inserir</span><span>Layout</span><span>Revisão</span></div>
  <div style={{position:'absolute',left:0,right:0,top:110,bottom:36,display:'flex',justifyContent:'center'}}>
   <div style={{marginTop:24,width:700,height:640,background:'#FBF8F2',padding:'56px 64px',boxShadow:'0 6px 30px rgba(0,0,0,.25)'}}>
    <div style={{fontFamily:BEBAS,fontSize:66,color:C.night,lineHeight:1}}>CAPÍTULO 1</div>
    <div style={{marginTop:30}}>{[100,96,100,88,100,94,62].map((w,i)=><div key={i} style={{height:11,width:`${w}%`,background:'#B9B4AA',marginBottom:20,borderRadius:3}}/>)}</div>
    <div style={{height:11,width:'41%',background:'#B9B4AA',borderRadius:3,display:'inline-block'}}/><span style={{display:'inline-block',width:3,height:28,marginLeft:6,verticalAlign:'middle',background:Math.floor(t*2)%2?C.night:'transparent'}}/>
   </div></div>
  <div style={{position:'absolute',left:0,right:0,bottom:0,height:36,background:'#2A3441',fontFamily:INTER,fontSize:18,color:C.blue,padding:'6px 22px'}}>Página 1 de 87</div>
 </div>;
};
const DeskScene:React.FC<{t:number;cam:K[];iconIn:number;typedOn:boolean;sel:[number,number]|null;cursor:[number,number,number][];clicks:number[];win?:[number,number,number,number]}>=({t,cam,iconIn,typedOn,sel,cursor,clicks,win})=>{
 const c=camAt(t,cam); const s=c.s,fx=c.x*1920,fy=c.y*1080;
 const label=typedOn?typed(t):NAME;
 const selOp=sel?E(t,sel[0],sel[0]+.06)*(1-E(t,sel[1],sel[1]+.25)):0;
 const ip=back((t-iconIn)/.5);
 let wp=0; if(win){wp=t<win[1]?back((t-win[0])/(win[1]-win[0])):1-E(t,win[2],win[3]); if(t<win[0]) wp=0; if(wp>1) wp=1+(wp-1)*.3;}
 // cursor
 let cx=0,cy=0,cop=0;
 if(cursor.length>1&&t>=cursor[0][0]&&t<=cursor[cursor.length-1][0]+.3){let i=0;while(i<cursor.length-2&&t>cursor[i+1][0]) i++;const a=cursor[i],b=cursor[i+1];const u=ease((t-a[0])/(b[0]-a[0]));cx=lerp(a[1],b[1],u);cy=lerp(a[2],b[2],u)+Math.sin(t*9)*1.2;cop=E(t,cursor[0][0],cursor[0][0]+.2)*(1-E(t,cursor[cursor.length-1][0],cursor[cursor.length-1][0]+.3));}
 return <AbsoluteFill style={{overflow:'hidden'}}>
  <AbsoluteFill style={{transformOrigin:'0 0',transform:`translate(${960-fx*s}px,${540-fy*s}px) scale(${s})`}}>
   <div style={{position:'absolute',left:-400,top:-400,width:2720,height:1880,background:'radial-gradient(90% 90% at 25% 15%,#34506B 0%,#243446 42%,#151C26 100%)'}}/>
   <div style={{position:'absolute',left:960-480,top:-200,width:960,height:960,borderRadius:480,background:'radial-gradient(circle,rgba(143,157,163,.16),rgba(143,157,163,0) 70%)'}}/>
   <DIcon kind="trash" x={90} y={170} label="Lixeira"/>
   <DIcon kind="folder" x={90} y={320} label="Fotos"/>
   <DIcon kind="sheet" x={90} y={470} label="Contas.xlsx"/>
   <DIcon kind="text" x={90} y={620} label="Notas.txt"/>
   <DIcon kind="folder" x={90} y={770} label="Projetos"/>
   <DIcon kind="folder" x={1830} y={40} label="Downloads"/>
   <DIcon kind="text" x={1830} y={190} label="Lista.txt"/>
   {/* arquivo */}
   {ip>0&&<div style={{position:'absolute',left:FX-380,top:FY-14,width:760,height:260,opacity:clamp(ip)}}>
    <div style={{position:'absolute',left:0,top:0,width:760,height:240,borderRadius:10,background:`rgba(143,157,163,${.26*selOp})`,boxShadow:`0 0 0 2px rgba(247,240,227,${.45*selOp})`}}/>
    <svg width="130" height="150" viewBox="0 0 130 150" style={{position:'absolute',left:315,top:6,transform:`scale(${.5+.5*Math.min(1,ip)})`,transformOrigin:'50% 100%'}}>
     <path d="M8 4h82l32 32v110H8Z" fill={C.paper}/><path d="M90 4v32h32Z" fill="#D8CFBC"/><rect x="8" y="88" width="114" height="36" fill={C.terra}/><text x="65" y="114" textAnchor="middle" fontFamily={INTER} fontSize="26" fill={C.paper} letterSpacing="3">DOCX</text>
     <path d="M26 26h44M26 44h58M26 62h50" stroke="#B9B4AA" strokeWidth="5"/></svg>
    <div style={{position:'absolute',left:0,right:0,top:168,textAlign:'center'}}><span style={{display:'inline-block',fontFamily:INTER,fontSize:36,color:C.paper,textShadow:'0 2px 8px rgba(0,0,0,.75)',padding:'6px 16px',background:`rgba(143,157,163,${.45*selOp})`,borderRadius:6,minHeight:50,minWidth:6}}>{label}</span></div>
   </div>}
   <Win p={wp} t={t}/>
   {cop>0&&<svg style={{position:'absolute',left:cx,top:cy,opacity:cop,filter:'drop-shadow(0 6px 10px rgba(0,0,0,.5))',transform:`scale(${1/Math.sqrt(s)})`,transformOrigin:'0 0'}} width="54" height="64" viewBox="0 0 54 64"><path d="M4 4L4 50L16 39L24 58L33 54L25 36L42 36Z" fill={C.paper} stroke={C.night} strokeWidth="4" strokeLinejoin="round"/></svg>}
   {clicks.map((a,i)=>{const u=(t-a)/.55;if(u<0||u>1) return null;const p=cursor.reduce((m,q)=>Math.abs(q[0]-a)<Math.abs(m[0]-a)?q:m,cursor[0]);return <div key={'c'+i} style={{position:'absolute',left:p[1]-60,top:p[2]-60,width:120,height:120,borderRadius:60,border:`${6/s}px solid ${C.terra}`,opacity:1-u,transform:`scale(${.2+.8*ease(u)})`}}/>;})}
  </AbsoluteFill>
  <div style={{position:'absolute',left:0,right:0,bottom:0,height:60,background:'rgba(20,26,34,.92)',borderTop:'2px solid rgba(143,157,163,.25)',display:'flex',alignItems:'center',padding:'0 28px',justifyContent:'space-between'}}>
   <div style={{display:'flex',gap:22}}>{[0,1,2,3].map(i=><div key={i} style={{width:28,height:28,borderRadius:7,background:i===0?C.paper:'rgba(143,157,163,.45)'}}/>)}</div>
   <div style={{fontFamily:INTER,fontSize:20,color:C.blue,textAlign:'right',lineHeight:1.15}}>09:41<br/>28/10</div></div>
 </AbsoluteFill>;
};

const Fonts=()=>{const [handle]=useState(()=>delayRender('Fontes'));useEffect(()=>{Promise.all([document.fonts.load('200px PalBebas'),document.fonts.load('30px PalInter')]).then(()=>continueRender(handle));},[handle]);
 return <style>{`@font-face{font-family:PalBebas;src:url('${staticFile('fonts/BebasNeue.woff2')}')}@font-face{font-family:PalInter;src:url('${staticFile('fonts/Inter-500.woff2')}')}`}</style>;};

const Film:React.FC=()=>{
 const f=useCurrentFrame(),t=f/FPS;
 // ---- A: atleta olímpico ----
 const kA:K[]=[[0,1.0,.45,.45],[7.2,1.22,.40,.42]];
 const oA=1-E(t,6.9,7.2);
 // ---- B: amiga ----
 const kB:K[]=[[6.9,1.0,.40,.60],[15.9,1.35,.33,.58]];
 const oB=E(t,6.9,7.2)*(1-E(t,15.6,15.9));
 // ---- C: tênis ----
 const kC:K[]=[[15.6,1.0,.55,.40],[16.5,1.0,.55,.42],[17.6,1.75,.63,.50],[19.0,1.85,.63,.50],[20.0,1.4,.62,.50],[23.2,1.2,.60,.50],[30.2,1.0,.55,.46]];
 const oC=E(t,15.6,15.9)*(1-E(t,29.9,30.2));
 const sh=scr(kC,1600,2397,t,1001,1198), dr=scr(kC,1600,2397,t,1110,983);
 // ---- F: livro ----
 const kF:K[]=[[42.6,1.0,.45,.55],[44.6,1.35,.55,.62],[47.9,1.5,.52,.66]];
 const oF=E(t,42.6,42.9)*(1-E(t,47.7,48.0));
 // ---- G: área de trabalho ----
 const kD:K[]=[[47.7,1,.5,.5],[49.4,1,.5,.5],[50.8,1.45,.5,.47],[56.4,1.75,.5,.45],[58.0,2.0,.5,.44],[61.2,2.05,.5,.44]];
 const oD=E(t,47.7,48.0)*(1-E(t,60.9,61.2));
 const gOp=1-E(t,74.7,75.0)*0;
 const gnote=t<6?'TANTO FAZ':undefined;
 return <AbsoluteFill style={{background:C.night}}>
  <Fonts/>
  {/* A */}
  {oA>0&&<AbsoluteFill style={{opacity:oA}}><Cam src="img/elite.jpg" W={2400} H={1600} keys={kA} t={t}/><Shade/>
   <Tag x={100} y={170} text="OUTRO EXEMPLO" op={E(t,1.0,1.25)*(1-E(t,2.2,2.5))} k={1.1}/>
   <Plate text="UM ATLETA OLÍMPICO" t={t} a={2.3} b={4.1} size={96}/>
   <Plate text="CORRE UMA MARATONA" t={t} a={3.4} b={6.9} size={96} bottom={200}/>
   <div style={{position:'absolute',left:1260,top:760,background:'rgba(26,29,36,.9)',borderLeft:`10px solid ${C.terra}`,padding:'10px 30px 4px 26px',opacity:E(t,4.0,4.3)*(1-E(t,6.7,6.95))}}><Big x={0} y={0} text="42,195 KM" size={130} color={C.terra} op={1} chars={Math.floor((t-4.0)*18)}/><div style={{height:130,width:430}}/></div>
   <KW text="PRA VOCÊ, TANTO FAZ." t={t} a={4.95} b={6.7} x={100} y={0} size={0} plate={false}/>
  </AbsoluteFill>}
  {/* B */}
  {oB>0&&<AbsoluteFill style={{opacity:oB}}><Cam src="img/amador.jpg" W={1125} H={2000} keys={kB} t={t}/><Shade/>
   <Plate text="AGORA, UMA AMIGA SUA" t={t} a={7.2} b={9.3} size={96}/>
   <Plate text="TERMINA A PRIMEIRA MEIA MARATONA" t={t} a={9.1} b={11.3} size={84}/>
   <Tag x={1330} y={200} text="MEIA MARATONA · 21 KM" op={E(t,9.7,9.95)*(1-E(t,11.2,11.5))} k={.95}/>
   <Bubble text="Parabéns, amiga!" t={t} a={11.6} b={13.0} x={1060} y={250}/>
   <Bubble text="Correu muito!" t={t} a={13.1} b={14.2} x={1060} y={250}/>
   <Bubble text="Tamo junto!" t={t} a={14.3} b={15.7} x={1060} y={250}/>
  </AbsoluteFill>}
  {/* C */}
  {oC>0&&<AbsoluteFill style={{opacity:oC}}>
   <Cam src="img/tenis.jpg" W={1600} H={2397} keys={kC} t={t} filter={`brightness(${1-.25*E(t,20,21)})`}/><Shade/>
   <Plate text="DEPOIS, OLHA PRO TÊNIS" t={t} a={15.8} b={17.8} size={90}/>
   <Leader x1={sh.x} y1={sh.y-40} x2={sh.x-330} y2={sh.y-250} p={E(t,16.5,16.9)*(1-E(t,19.0,19.2))} op={1-E(t,19.0,19.3)}/>
   <Tag x={sh.x-760} y={sh.y-300} text="TÊNIS LARGADO" op={E(t,16.55,16.85)*(1-E(t,19.0,19.3))} k={1.1}/>
      <Tag x={1250} y={250} text="PERTO DA PORTA" op={E(t,17.55,17.85)*(1-E(t,19.0,19.3))} k={1.1}/>
   <KW text="“Tamo junto!”" t={t} a={18.95} b={20.55} x={100} y={170} size={96} font={INTER} italic/>
   <div style={{opacity:1-E(t,20.55,20.85)}}><Strike x={100} y={232} w={620} p={E(t,19.95,20.2)}/></div>
   <KW text="NADA!" t={t} a={20.0} b={21.9} x={100} y={270} size={260} font={BEBAS} color={C.terra} italic plate={false}/>
   <Plate text="“AGORA EU QUERO UM TÊNIS MELHOR QUE O DELA”" t={t} a={20.8} b={23.1} size={78}/>
   <Plate text="E JÁ PENSA: MELHORAR O JOELHO" t={t} a={23.2} b={25.5} size={90}/>
   <Plate text="PRA CORRER A PRÓXIMA MEIA MARATONA" t={t} a={25.0} b={28.0} size={84} bottom={190}/>
   <KW text="E A COBRANÇA COMEÇA." t={t} a={28.1} b={29.8} x={0} y={380} size={170} font={BEBAS} color={C.terra} align="center"/>
  </AbsoluteFill>}
  {/* D: talvez seja */}
  {(()=>{const o=E(t,29.9,30.2)*(1-E(t,36.9,37.2));if(o<=0) return null;
   return <AbsoluteFill style={{opacity:o}}><Bg/>
    {[['TALVEZ SEJA',29.95,'VONTADE',30.95,260],['TALVEZ SEJA',31.55,'FRUSTRAÇÃO',32.3,470],['TALVEZ SEJA',33.15,'UM PROJETO',34.15,680]].map(([l,la,w,wa,y]:any,i)=>
     <React.Fragment key={i}><Big x={200} y={y-58} text={l} size={52} color={C.terra} op={E(t,la,la+.2)} /><KW text={w} t={t} a={wa} b={99} x={200} y={y} size={150} font={BEBAS} plate={false}/></React.Fragment>)}
    <KW text="ADIANDO" t={t} a={35.75} b={36.8} x={900} y={680} size={150} font={BEBAS} color={C.terra} italic plate={false}/>
    <Strike x={200} y={770} w={640} p={E(t,35.9,36.3)} h={10}/>
   </AbsoluteFill>;})()}
  {/* E: inveja encosta o dedo */}
  {(()=>{const o=E(t,37.0,37.3)*(1-E(t,42.8,43.1));if(o<=0) return null;
   const fing=E(t,39.9,40.7); const yb=lerp(700,935,fing);
   return <AbsoluteFill style={{opacity:o}}><Bg kind={1}/>
    <KW text="A INVEJA NEM SEMPRE" t={t} a={37.1} b={99} x={0} y={110} size={130} font={BEBAS} plate={false} align="center"/>
    <KW text="ABRE A FERIDA." t={t} a={38.2} b={99} x={0} y={250} size={130} font={BEBAS} plate={false} align="center" color={C.terra}/>
    <Strike x={650} y={325} w={620} p={E(t,38.9,39.2)} h={12}/>
    <KW text="ÀS VEZES ELA SÓ" t={t} a={39.1} b={99} x={0} y={470} size={110} font={INTER} italic plate={false} align="center"/>
    <KW text="ENCOSTA O DEDO NELA." t={t} a={40.55} b={99} x={0} y={610} size={110} font={BEBAS} plate={false} align="center" color={C.terra}/>
    <svg style={{position:'absolute',left:0,top:0,opacity:E(t,39.8,40.0)}} width="1920" height="1080"><line x1="1250" y1="945" x2="1750" y2="945" stroke={C.paper} strokeWidth="6" opacity=".6"/>
     <rect x={1470} y={yb-330} width="60" height="330" rx="30" fill={C.paper}/></svg>
    <Ripple x={1500} y={945} t={t} a={40.7} r={110}/>
   </AbsoluteFill>;})()}
  {/* F: livro */}
  {oF>0&&<AbsoluteFill style={{opacity:oF}}><Cam src="img/maos.jpg" W={2400} H={1600} keys={kF} t={t}/><Shade/>
   <Plate text="A MESMA COISA ACONTECE" t={t} a={42.85} b={44.5} size={96}/>
   <Plate text="QUANDO ALGUÉM PUBLICA O LIVRO" t={t} a={44.5} b={46.5} size={96}/>
   <Plate text="QUE VOCÊ NUNCA TERMINOU" t={t} a={45.7} b={47.9} size={96} bottom={200}/>
   <Big x={1250} y={170} text="" size={10} op={0}/>
  </AbsoluteFill>}
  {/* G/H: área de trabalho */}
  {oD>0&&<AbsoluteFill style={{opacity:oD}}>
   <DeskScene t={t} cam={kD} iconIn={49.55} typedOn sel={[58.0,60.6]} cursor={[[56.7,1550,760],[57.9,FX+8,FY+60],[58.15,FX+8,FY+60],[59.2,1300,640],[60.5,1550,820]]} clicks={[58.0]}/>
   <Tag x={1240} y={90} text="ÁREA DE TRABALHO" op={E(t,47.9,48.15)*(1-E(t,49.5,49.8))} k={1.05}/>
   <Ripple x={960} y={540} t={t} a={49.9} r={150}/>
   <Plate text="VOCÊ NEM PRECISA ABRIR" t={t} a={56.75} b={58.4} size={90}/>
   <Plate text="SÓ O NOME JÁ DIZ TUDO" t={t} a={58.45} b={60.9} size={110}/>
  </AbsoluteFill>}
  {/* I: perguntas */}
  {(()=>{const o=E(t,60.9,61.2)*(1-E(t,67.6,67.9));if(o<=0) return null;
   const q1=1-E(t,64.9,65.25);
   return <AbsoluteFill style={{opacity:o}}><Bg/>
    <div style={{opacity:q1}}>
     <KW text="SE A CONQUISTA DO OUTRO" t={t} a={61.5} b={99} x={0} y={330} size={140} font={BEBAS} plate={false} align="center"/>
     <KW text="NÃO TIROU NADA DE VOCÊ…" t={t} a={62.9} b={99} x={0} y={500} size={140} font={BEBAS} plate={false} align="center" color={C.blue}/></div>
    <KW text="POR QUE PARECE" t={t} a={65.3} b={99} x={0} y={330} size={170} font={BEBAS} plate={false} align="center"/>
    <KW text="QUE TIROU?" t={t} a={66.4} b={99} x={0} y={520} size={230} font={BEBAS} plate={false} align="center" color={C.terra} italic/>
   </AbsoluteFill>;})()}
  {/* J: bifurcação */}
  {(()=>{const o=E(t,67.6,67.9);if(o<=0) return null;
   const lp=E(t,70.1,70.8), rp=E(t,72.6,73.3);
   return <AbsoluteFill style={{opacity:o}}><Bg kind={1}/>
    <KW text="E ESSE INCÔMODO…" t={t} a={67.95} b={99} x={0} y={170} size={140} font={BEBAS} plate={false} align="center"/>
    <svg style={{position:'absolute',left:0,top:0}} width="1920" height="1080">
     <path d="M960 330 C 960 380 500 370 500 420" stroke={C.terra} strokeWidth="6" fill="none" strokeDasharray="500" strokeDashoffset={500*(1-lp)}/>
     <path d="M960 330 C 960 380 1360 370 1360 420" stroke={C.terra} strokeWidth="6" fill="none" strokeDasharray="500" strokeDashoffset={500*(1-rp)}/></svg>
    <Card src="img/elite.jpg" W={2400} H={1600} x={120} y={430} w={760} h={480} op={lp} fx={.5} fy={.45} z={1.25}/>
    <Card src="img/tenis.jpg" W={1600} H={2397} x={920} y={430} w={880} h={480} op={rp} fx={.62} fy={.5} z={1.6}/>
    <Tag x={150} y={940} text="FAZ CORRER ATRÁS" op={lp} k={1.15}/>
    <Tag x={950} y={940} text="QUER QUE O OUTRO PERCA" op={rp} k={1.15}/>
   </AbsoluteFill>;})()}
  {/* medidor global */}
  <Gauge x={80} y={60} w={520} v={gv(t)} op={E(t,.3,.7)*(1-E(t,60.9,61.2))*1+E(t,60.9,61.2)*.0+ (t>61.2?1:0)*0} note={gnote}/>
  <Gauge x={80} y={60} w={520} v={gv(t)} op={t>=61.2?1:0}/>
 </AbsoluteFill>;
};

const Film21:React.FC=()=>{
 const f=useCurrentFrame(),t=f/FPS;
 const kD:K[]=[[0,1,.5,.5],[1.6,1.4,.5,.47],[2.8,1.4,.5,.47],[3.5,1.0,.5,.5],[7.0,1.0,.5,.5],[7.6,1.35,.5,.47],[10,1.4,.5,.47]];
 return <AbsoluteFill style={{background:C.night}}><Fonts/>
  <DeskScene t={t} cam={kD} iconIn={-1} typedOn={false} sel={[2.1,7.6]} cursor={[[0.6,1550,760],[1.9,FX+8,FY+60],[2.7,FX+8,FY+60],[3.6,1450,700],[6.9,1450,700],[8.0,1560,820]]} clicks={[2.1,2.65,2.8]} win={[2.85,3.4,7.0,7.5]}/>
 </AbsoluteFill>;
};
registerRoot(()=> <><Composition id="inveja-s11" component={Film} width={1920} height={1080} fps={FPS} durationInFrames={DUR}/><Composition id="inveja-s11-arquivo" component={Film21} width={1920} height={1080} fps={FPS} durationInFrames={DUR21}/></>);
