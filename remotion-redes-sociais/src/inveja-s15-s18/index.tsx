import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Composition,Img,staticFile,registerRoot,delayRender,continueRender,useCurrentFrame,OffthreadVideo,Sequence} from 'remotion';

// S15–S18 — t=0 = 383,45 s na linha do Premiere (6:23,45). 1920x1080, 24 fps, 157,705 s.
const C={night:'#1A1D24',paper:'#F7F0E3',terra:'#C46D45',ocre:'#DB9B5B',blue:'#8F9DA3',sage:'#9AA68B',plum:'#3A2230',plum2:'#24141B'};
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(x:number)=>{const t=clamp(x);return t*t*(3-2*t);};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const L=(t:number,a:number,b:number)=>clamp((t-a)/(b-a));
const E=(t:number,a:number,b:number)=>ease((t-a)/(b-a));
const FPS=24,DUR=3785;
const BEBAS='PalBebas',INTER='PalInter';
const sc=(t:number,a:number,b:number,f=.3)=>E(t,a,a+f)*(1-E(t,b-f,b));
const kf=(t:number,keys:[number,number][])=>{if(t<=keys[0][0]) return keys[0][1];for(let i=0;i<keys.length-1;i++){const a=keys[i],b=keys[i+1];if(t<=b[0]) return lerp(a[1],b[1],ease((t-a[0])/(b[0]-a[0])));}return keys[keys.length-1][1];};
// ---------- câmera: zoom/pan de velocidade constante entre chaves [t, escala, foco x, foco y] (foco normalizado 0..1) ----------
type K=[number,number,number,number];
const camAt=(t:number,keys:K[])=>{
 if(t<=keys[0][0]) return {s:keys[0][1],x:keys[0][2],y:keys[0][3]};
 for(let i=0;i<keys.length-1;i++){const a=keys[i],b=keys[i+1];
  if(t<=b[0]){const u=(t-a[0])/(b[0]-a[0]);return {s:Math.exp(lerp(Math.log(a[1]),Math.log(b[1]),u)),x:lerp(a[2],b[2],u),y:lerp(a[3],b[3],u)};}}
 const k=keys[keys.length-1];return {s:k[1],x:k[2],y:k[3]};
};
const Cam:React.FC<{src:string;W:number;H:number;keys:K[];t:number;rot?:number;kick?:number;sway?:number;filter?:string;over?:(S:number)=>React.ReactNode}>=({src,W,H,keys,t,rot=0,kick=0,sway=0,filter,over})=>{
 const c=camAt(t,keys);
 const base=Math.max(1920/W,1080/H);
 const S=base*c.s*(1+kick);
 const fx=Math.min(Math.max(c.x*W,960/S),W-960/S), fy=Math.min(Math.max(c.y*H,540/S),H-540/S);
 return <AbsoluteFill style={{overflow:'hidden',transform:`translate(${sway*(Math.sin(t*1.9)*9+Math.sin(t*4.3)*3)}px,${sway*(Math.cos(t*1.5)*7+Math.sin(t*3.7)*2.5)}px) rotate(${rot+sway*Math.sin(t*1.1)*.4}deg) scale(${(rot||sway)?1.05:1})`,filter}}>
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

const Fonts=()=>{const [handle]=useState(()=>delayRender('Fontes'));useEffect(()=>{Promise.all([document.fonts.load('200px PalBebas'),document.fonts.load('30px PalInter')]).then(()=>continueRender(handle));},[handle]);
 return <style>{`@font-face{font-family:PalBebas;src:url('${staticFile('fonts/BebasNeue.woff2')}')}@font-face{font-family:PalInter;src:url('${staticFile('fonts/Inter-500.woff2')}')}`}</style>;};
const Gauge:React.FC<{x:number;y:number;w:number;v:number;op:number;note?:string}>=({x,y,w,v,op,note})=> op<=0?null:
 <div style={{position:'absolute',left:x,top:y,opacity:op,background:'rgba(26,29,36,.86)',padding:'16px 24px 20px 22px',borderLeft:`8px solid ${C.terra}`}}>
  <div style={{fontFamily:INTER,fontSize:26,letterSpacing:9,color:C.terra,marginBottom:12,display:'flex',justifyContent:'space-between',width:w}}><span>INCÔMODO</span>{note&&<span style={{color:C.paper,letterSpacing:4}}>{note}</span>}</div>
  <div style={{width:w,height:14,background:'rgba(247,240,227,.25)',borderRadius:7}}><div style={{width:w*clamp(v),height:14,background:C.terra,borderRadius:7}}/></div>
 </div>;
const wipeX=(t:number,tc:number,d=.8)=>{const u=(t-(tc-d/2))/d;return u<=0?-9999:u>=1?9999:lerp(-260,2180,ease(u));};
const Wipe:React.FC<{t:number;tc:number;d?:number;color?:string}>=({t,tc,d=.6,color=C.terra})=>{
 const u=(t-(tc-d/2))/d; if(u<=0||u>=1) return null; const x=wipeX(t,tc,d);
 return <div style={{position:'absolute',left:x-150,top:-60,width:300,height:1200,background:color,transform:'skewX(-12deg)',boxShadow:'0 0 60px rgba(0,0,0,.35)'}}/>;
};
const Rev:React.FC<{t:number;tc:number;d?:number;off?:number;children:React.ReactNode}>=({t,tc,d=.6,off,children})=>{
 const x=wipeX(t,tc,d); if(x<=-9999) return null; if(off!==undefined&&t>off) return null;
 const cp=x>=9999?undefined:`polygon(0 0,${x+115}px 0,${x-115}px 1080px,0 1080px)`;
 return <AbsoluteFill style={{clipPath:cp}}>{children}</AbsoluteFill>;
};
const Out:React.FC<{t:number;tc:number;d?:number;children:React.ReactNode}>=({t,tc,d=.6,children})=>{
 const x=wipeX(t,tc,d); if(x>=9999) return null;
 const cp=x<=-9999?undefined:`polygon(${x+115}px 0,1920px 0,1920px 1080px,${x-115}px 1080px)`;
 return <AbsoluteFill style={{clipPath:cp}}>{children}</AbsoluteFill>;
};
const Vig:React.FC<{op:number}>=({op})=> op<=0?null:<AbsoluteFill style={{opacity:op,background:'radial-gradient(70% 70% at 50% 55%,rgba(26,29,36,0) 40%,rgba(26,29,36,.85) 100%)'}}/>;
const Wash:React.FC<{op:number;a?:string;b?:string}>=({op,a='rgba(196,109,69,.8)',b='rgba(219,155,91,.5)'})=> op<=0?null:<AbsoluteFill style={{opacity:op,background:`linear-gradient(135deg,${a},${b})`,mixBlendMode:'multiply'}}/>;
const punch=(t:number,tc:number)=>t>=tc?Math.exp(-(t-tc)*7)*.06:0;

// ---------- câmera livre (imagem retrato inteira, sem recorte) ----------
const CamF:React.FC<{src:string;W:number;H:number;keys:K[];t:number;sway?:number;filter?:string;bgf?:string;over?:(S:number)=>React.ReactNode}>=({src,W,H,keys,t,sway=1,filter,bgf='blur(40px) brightness(.75) saturate(.5)',over})=>{
 const c=camAt(t,keys); const S=(1080/H)*c.s; const fx=c.x*W,fy=c.y*H;
 return <AbsoluteFill style={{overflow:'hidden',background:C.night}}>
  <Img src={staticFile(src)} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',filter:bgf,transform:'scale(1.25)'}}/>
  <AbsoluteFill style={{transform:`translate(${sway*(Math.sin(t*1.9)*7+Math.sin(t*4.3)*2)}px,${sway*(Math.cos(t*1.5)*5)}px)`,filter}}>
   <div style={{position:'absolute',left:0,top:0,width:W,height:H,transformOrigin:'0 0',transform:`translate(${960-fx*S}px,${540-fy*S}px) scale(${S})`}}>
    <Img src={staticFile(src)} style={{width:W,height:H,display:'block'}}/>
    {over&&over(S)}
   </div></AbsoluteFill></AbsoluteFill>;
};
const POLY='polygon(36% 28.5%,42% 27%,60% 27%,68% 29.5%,75% 35%,80% 39%,85% 46%,85% 52%,84% 56%,83% 62%,82% 68%,80% 72%,77% 75%,72% 77%,65% 79%,58% 80%,45% 80%,35% 79.5%,30% 78%,24% 75%,20% 70%,17% 62%,17.5% 52%,19% 46%,22% 41%,26% 36%,30% 32%,36% 28.5%)';
const MW=2000,MH=2666;
// conteúdo dentro do vidro do espelho
const Glass:React.FC<{src?:string;op?:number;fil?:string;pos?:string;dx?:number;tint?:string}>=({src,op=1,fil,pos='50% 40%',dx=0,tint})=>
 <div style={{position:'absolute',left:0,top:0,width:MW,height:MH,clipPath:POLY,opacity:op}}>
  {src&&<Img src={staticFile(src)} style={{position:'absolute',left:MW*.15+dx,top:MH*.25,width:MW*.72,height:MH*.58,objectFit:'cover',objectPosition:pos,filter:fil}}/>}
  {tint&&<div style={{position:'absolute',inset:0,background:tint}}/>}
 </div>;
const Crack:React.FC<{p:number}>=({p})=> p<=0?null:
 <svg style={{position:'absolute',left:0,top:0,width:MW,height:MH,clipPath:POLY}} viewBox={`0 0 ${MW} ${MH}`}>
  {[[1000,1000,1180,1250,1120,1500,1260,1760],[1000,1000,860,1210,930,1440,820,1700],[1000,1000,1240,900,1420,980,1560,880],[1180,1250,1400,1330,1540,1500],[930,1440,720,1480,600,1620],[1000,1000,800,880,640,900,540,780]].map((pts,i)=>{
   const pp:string[]=[];for(let k=0;k<pts.length;k+=2) pp.push(`${pts[k]},${pts[k+1]}`);
   const len=2000; return <polyline key={i} points={pp.join(' ')} fill="none" stroke="rgba(247,240,227,.85)" strokeWidth={5} strokeLinejoin="bevel" strokeDasharray={len} strokeDashoffset={len*(1-clamp(p*1.3-i*.08))}/>;})}
 </svg>;

// cena com transição por varredura (entra em a, fica até b)
const Sc:React.FC<{t:number;a:number;b:number;d?:number;children:React.ReactNode}>=({t,a,b,d=.5,children})=>{
 if(t<a-d/2||t>b+.35) return null;
 if(d<=0) return t>=a?<AbsoluteFill>{children}</AbsoluteFill>:null;
 const x=wipeX(t,a,d); const cp=x>=9999?undefined:`polygon(0 0,${x+115}px 0,${x-115}px 1080px,0 1080px)`;
 return <AbsoluteFill style={{clipPath:cp}}>{children}</AbsoluteFill>;
};
const Shade:React.FC=()=> <AbsoluteFill style={{background:'linear-gradient(0deg,rgba(26,29,36,.7) 0%,rgba(26,29,36,0) 35%),linear-gradient(180deg,rgba(26,29,36,.45) 0%,rgba(26,29,36,0) 22%)'}}/>;
// vídeo com câmera
const Vid:React.FC<{src:string;from:number;dur:number;t:number;keys:K[];filter?:string}>=({src,from,dur,t,keys,filter})=>{
 const c=camAt(t,keys); const s=c.s; const fx=Math.min(Math.max(c.x*1920,960/s),1920-960/s),fy=Math.min(Math.max(c.y*1080,540/s),1080-540/s);
 return <Sequence from={Math.round(from*FPS)} durationInFrames={Math.round(dur*FPS)}><AbsoluteFill style={{overflow:'hidden',filter}}>
  <div style={{position:'absolute',left:0,top:0,width:1920,height:1080,transformOrigin:'0 0',transform:`translate(${960-fx*s}px,${540-fy*s}px) scale(${s})`}}>
   <OffthreadVideo src={staticFile(src)} muted style={{width:1920,height:1080,objectFit:'cover'}}/></div></AbsoluteFill></Sequence>;
};
// holofote: escurece tudo menos um círculo (contexto continua visível)
const Spot:React.FC<{x:number;y:number;r:number;op:number;dim?:number;ring?:boolean}>=({x,y,r,op,dim=.62,ring=true})=> op<=0?null:
 <AbsoluteFill><div style={{position:'absolute',inset:0,opacity:op,background:`radial-gradient(circle at ${x}px ${y}px,rgba(14,16,20,0) ${r*.82}px,rgba(14,16,20,${dim}) ${r}px)`}}/>
 {ring&&<div style={{position:'absolute',left:x-r*.9,top:y-r*.9,width:r*1.8,height:r*1.8,borderRadius:'50%',border:`5px solid ${C.ocre}`,opacity:op*.8,boxShadow:`0 0 60px rgba(219,155,91,.55)`}}/>}</AbsoluteFill>;
const Hyp:React.FC<{text:string;t:number;a:number;b:number;x:number;y:number}>=({text,t,a,b,x,y})=>{
 const o=E(t,a,a+.3)*(1-E(t,b+.45,b+.9)); if(o<=0) return null; const st=E(t,b,b+.4);
 return <div style={{position:'absolute',left:x,top:y,opacity:o,transform:`translateX(${(1-E(t,a,a+.35))*60}px)`}}>
  <div style={{position:'relative',display:'inline-block',fontFamily:BEBAS,fontSize:132,lineHeight:1,color:C.paper,background:'rgba(26,29,36,.9)',padding:'14px 38px 8px 30px',borderLeft:`10px solid ${C.terra}`,opacity:1-.35*st}}>{text}
   <div style={{position:'absolute',left:10,top:'54%',height:8,width:`${st*100}%`,background:C.terra}}/></div></div>;
};
const Juros:React.FC<{t:number;a:number;big:number;b:number}>=({t,a,big,b})=>{
 if(t<a||t>b+.4) return null; const g=E(t,big,big+.6); const o=E(t,a,a+.4)*(1-E(t,b,b+.4));
 const size=lerp(64,170,g), x=lerp(1500,170,g), y=lerp(80,780,g);
 return <div style={{position:'absolute',left:x,top:y,opacity:o,fontFamily:BEBAS,fontSize:size,lineHeight:1,color:C.paper,background:'rgba(26,29,36,.9)',padding:`${size*.1}px ${size*.3}px ${size*.06}px ${size*.22}px`,borderLeft:`${Math.max(6,size*.07)}px solid ${C.terra}`}}>JUROS</div>;
};
const Hyps:React.FC<{t:number}>=({t})=> <>
 <Hyp text="EMPRESA?" t={t} a={67.06} b={70.9} x={1180} y={90}/>
 <Hyp text="AJUDA?" t={t} a={74.38} b={76.9} x={1180} y={90}/>
 <Hyp text="FINANCIAMENTO?" t={t} a={78.8} b={84.0} x={1000} y={90}/>
</>;
const Notif:React.FC<{t:number;a:number;b:number}>=({t,a,b})=>{
 const u=E(t,a,a+.4)*(1-E(t,b-.4,b)); if(u<=0) return null;
 return <div style={{position:'absolute',left:560,top:30-(1-u)*170,width:800,height:128,borderRadius:34,background:'rgba(44,46,54,.96)',display:'flex',alignItems:'center',gap:22,padding:'0 28px',boxShadow:'0 24px 50px rgba(0,0,0,.5)',fontFamily:INTER,color:C.paper}}>
  <div style={{width:84,height:84,borderRadius:20,overflow:'hidden',background:'linear-gradient(180deg,#9DB0BC,#DDE4E8)',position:'relative'}}>
   <svg width="84" height="84" viewBox="0 0 84 84"><path d="M0 84 L26 38 L40 58 L56 28 L84 84Z" fill="#3B4A57"/><path d="M50 40 L56 28 L62 40 L58 38 L54 40Z" fill="#F7F0E3"/></svg></div>
  <div style={{lineHeight:1.25}}><div style={{fontSize:30}}>um.amigo publicou um reel</div><div style={{fontSize:25,opacity:.65}}>agora numa montanha · agora</div></div></div>;
};
const GKS:[number,number][]=[[0,0],[23.5,.04],[24.4,.3],[31,.58],[39,.78],[39.6,.78]];
const gaugeAt=(t:number)=>{ if(t<60) return kf(t,GKS); if(t<130) return kf(t,[[105.5,.82],[110,.9],[121.6,.96]]); return kf(t,[[148.5,.5],[153,.5],[157.7,.5]]);};
const gOp=(t:number)=>Math.max(sc(t,24.1,39.6,.4),sc(t,105.4,121.9,.4),sc(t,148.8,158,.4));

// ---------- foco (coordenadas normalizadas) ----------
const AW=1920,AH=1280;
const Main:React.FC=()=>{
 const f=useCurrentFrame(); const t=f/FPS;
 const cool='saturate(.55) contrast(1.06) brightness(.92)';
 const warm='saturate(1.1) contrast(1.05) sepia(.14)';
 // retrospecto no vidro (0–7.7)
 const retro1:[number,string,string][]=[[2.35,'img/amiga.jpg','50% 28%'],[2.75,'img/selfie.jpg','50% 30%'],[3.15,'img/santorini.jpg','50% 50%'],[3.55,'img/chave.jpg','50% 50%'],[3.95,'img/pousada.jpg','50% 50%'],[4.3,'img/candle.jpg','50% 50%']];
 const retro2:[number,string,string][]=[[33.2,'img/laptop.jpg','50% 40%'],[34.45,'img/maos.jpg','50% 50%'],[35.85,'img/tenis.jpg','50% 55%'],[37.5,'img/maos.jpg','50% 50%']];
 const fl=(arr:[number,string,string][],end:number)=>{let cur=-1;arr.forEach((r,i)=>{if(t>=r[0]&&t<(arr[i+1]?arr[i+1][0]:end)) cur=i;});return cur;};
 const r1=fl(retro1,4.7), r2=fl(retro2,39.5);
 const mirrorGlass=(tt:number)=>{
  const flick=(arr:[number,string,string][],i:number)=> i<0?null:<Glass src={arr[i][1]} pos={arr[i][2]} fil="saturate(.7) contrast(1.15) brightness(.9)" dx={(Math.random()*0)+Math.sin(tt*70)*10}/>;
  return flick;
 };
 const mir=(extra:React.ReactNode,keys:K[],filter?:string)=> <CamF src="img/espelho.jpg" W={MW} H={MH} keys={keys} t={t} sway={1} filter={filter} over={()=>extra}/>;
 const crackP=E(t,18.5,19.2);
 // espelho A (0–21.2)
 const glassA=<>
  {r1>=0&&<Glass src={retro1[r1][1]} pos={retro1[r1][2]} fil="saturate(.7) contrast(1.15) brightness(.9)" dx={Math.sin(t*70)*12} tint="rgba(143,157,163,.25)"/>}
  {t>=4.81&&t<7.7&&<Glass src="img/celular.jpg" pos="61% 62%" op={E(t,4.81,5.3)*(1-E(t,7.2,7.7))} fil="contrast(1.05) saturate(.8)"/>}
  {t>=7.7&&<Glass tint={`rgba(36,20,27,${lerp(0,.62,E(t,7.7,12.8))})`}/>}
  <Crack p={crackP}/>
 </>;
 const keysA:K[]=[[0,1.3,.5,.54],[4.7,1.5,.5,.54],[7.7,1.65,.5,.55],[16,1.8,.5,.55],[18.4,2.0,.5,.56],[21.3,2.2,.5,.57]];
 const dark=sc(t,15.2,21.4,.8);
 const glassC=<>
  {r2>=0&&<Glass src={retro2[r2][1]} pos={retro2[r2][2]} fil="saturate(.7) contrast(1.15) brightness(.9)" dx={Math.sin(t*70)*12} tint="rgba(143,157,163,.2)"/>}
  {t>=33.2&&t<39.6&&r2<0&&<Glass tint="rgba(36,20,27,.4)"/>}
 </>;
 // câmeras
 const arKeys:K[]=[[39.57,1.0,.62,.3],[45.3,1.25,.74,.24],[46.75,1.25,.74,.24],[48.9,1.45,.58,.3],[50.3,1.5,.55,.3]];
 const arPos=(ix:number,iy:number)=>scr(arKeys,AW,AH,t,ix*AW,iy*AH);
 const spot=E(t,46.75,48.95); const bp=arPos(.51,.31);
 const prKeys:K[]=[[50.2,1.0,.55,.3],[52.4,1.5,.66,.25]];
 const chKeys:K[]=[[52.4,1.0,.5,.5],[54.6,1.2,.45,.45]];
 const chT:K[]=[[54.59,1.0,.25,.35],[58.6,1.35,.55,.36]];
 const co1:K[]=[[58.8,1.0,.55,.62],[60.8,1.5,.62,.5]];
 const ch2:K[]=[[68.95,1.1,.3,.35],[74.34,1.6,.62,.36]];
 const co2:K[]=[[89.4,1.0,.5,.7],[93,1.15,.44,.55],[97.5,1.35,.3,.7]];
 const seK:K[]=[[97.5,1.1,.43,.57],[100.6,1.6,.5,.4]];
 const faK:K[]=[[100.57,1.0,.38,.7],[103.0,1.15,.45,.5],[105.05,1.5,.745,.25]];
 const pr2:K[]=[[105.05,1.0,.5,.4],[109.8,1.15,.52,.3]];
 const pr3:K[]=[[109.86,1.15,.52,.3],[113.9,2.1,.38,.25]];
 const peK:K[]=[[113.9,1.0,.5,.4],[117.6,1.6,.5,.34]];
 const coK:K[]=[[117.65,1.0,.77,.61],[121.5,1.6,.74,.58]];
 const caiK:K[]=[[121.5,1.0,.52,.4],[129.2,1.35,.52,.47]];
 const cmK:K[]=[[129.3,1.0,.5,.55],[133.9,1.25,.5,.55],[135.7,1.5,.15,.55]];
 const cnK:K[]=[[135.7,1.0,.5,.45],[141.4,1.35,.5,.43]];
 const maK:K[]=[[141.4,1.0,.5,.5],[146.6,1.25,.45,.55]];
 const cm2K:K[]=[[146.6,1.6,.86,.55],[148.9,1.4,.86,.55]];
 const cn2K:K[]=[[148.9,1.0,.5,.45],[154.1,1.8,.5,.43]];
 const cm3K:K[]=[[154.1,1.4,.5,.6],[157.7,1.0,.5,.55]];
 const cnP=scr(cn2K,2752,1536,t,.5*2752,.43*1536);

 return <AbsoluteFill style={{background:C.night}}>
  <Fonts/>
  {/* ---------- S15 ---------- */}
  <Sc t={t} a={0} b={21.2} d={0}>
   {mir(glassA,keysA,cool)}<Vig op={.5+.4*dark}/><Wash op={.35} a="rgba(143,157,163,.9)" b="rgba(90,104,120,.6)"/>
   <AbsoluteFill style={{opacity:t>=r1&&r1>=0?0:0}}/>
   {r1>=0&&<AbsoluteFill style={{background:'#fff',opacity:Math.exp(-((t-retro1[r1][0])*18))*.35}}/>}
   {t<1&&<AbsoluteFill style={{background:C.night,opacity:1-E(t,0,.9)}}/>}
  </Sc>
  <Sc t={t} a={21.2} b={33.0} d={.6}>
   <Cam src="img/celular.jpg" W={2000} H={3000} keys={[[21.2,1.0,.6,.62],[28,1.5,.61,.64],[33,2.2,.61,.66]]} t={t} sway={1} kick={punch(t,21.3)} filter="saturate(.7) contrast(1.05) brightness(.9)"/>
   <Vig op={.55}/><Wash op={.25} a="rgba(143,157,163,.9)" b="rgba(90,104,120,.5)"/>
   <Card src="img/espelho.jpg" W={MW} H={MH} x={80} y={420} w={330} h={470} op={E(t,21.8,22.4)*(1-E(t,32.4,33))} rot={-3} fx={.5} fy={.54} z={1.7}/>
   <Notif t={t} a={24.4} b={28.1}/>
  </Sc>
  <Sc t={t} a={33.0} b={39.55} d={.6}>
   {mir(glassC,[[33,1.7,.5,.55],[39.5,2.0,.5,.55]],cool)}<Vig op={.7}/><Wash op={.3} a="rgba(143,157,163,.9)" b="rgba(90,104,120,.6)"/>
  </Sc>
  {/* defesa — homem arrogante */}
  <Sc t={t} a={39.55} b={50.2} d={.6}>
   <Cam src="img/arrogante.jpg" W={AW} H={AH} keys={arKeys} t={t} sway={1.3} kick={punch(t,39.65)} rot={Math.sin(t*.7)*.8} filter={warm}/>
   <Shade/><Wash op={.32}/><Vig op={.45}/>
   <AbsoluteFill style={{opacity:.35*sc(t,40,45.3,.8),background:'radial-gradient(40% 50% at 70% 35%,rgba(219,155,91,.9),rgba(219,155,91,0))',mixBlendMode:'screen'}}/>
   <Spot x={bp.x} y={bp.y} r={lerp(1200,300,spot)} op={E(t,46.5,47.2)*(1-E(t,49.8,50.2))}/>
  </Sc>
  {/* ---------- S16 ---------- */}
  <Sc t={t} a={50.2} b={52.4} d={.5}>
   <Cam src="img/primo.jpg" W={2400} H={1792} keys={prKeys} t={t} sway={1} filter={warm} over={S=><div style={{position:'absolute',left:.68*2400-170,top:.13*1792-190,width:340,height:420,borderRadius:'50%',border:`${7/S}px solid ${C.ocre}`,boxShadow:'0 0 60px rgba(219,155,91,.6)',opacity:E(t,51,51.5)}}/>}/>
   <Shade/><Wash op={.2}/><Vig op={.4}/>
  </Sc>
  <Sc t={t} a={52.4} b={54.6} d={.4}>
   <Cam src="img/chave.jpg" W={2400} H={1601} keys={chKeys} t={t} sway={1} filter={warm}/><Shade/><Wash op={.2}/><Vig op={.45}/>
  </Sc>
  <Sc t={t} a={54.59} b={58.8} d={.5}>
   <Cam src="img/churrasco.jpg" W={3000} H={2002} keys={chT} t={t} sway={1} kick={punch(t,54.65)} filter={warm}/><Shade/><Wash op={.25}/><Vig op={.4}/>
  </Sc>
  <Sc t={t} a={58.8} b={60.9} d={.5}>
   <Cam src="img/corolla.jpg" W={2000} H={3000} keys={co1} t={t} sway={1} kick={punch(t,58.9)} filter="saturate(.95) contrast(1.08)" over={S=><div style={{position:'absolute',left:.70*2000,top:.545*3000,width:.17*2000,height:.045*3000,background:'#F7F0E3',transform:'rotate(-4deg)'}}/>}/><Shade/><Vig op={.4}/>
   <AbsoluteFill style={{mixBlendMode:'screen',opacity:.55,background:`linear-gradient(105deg,rgba(255,255,255,0) ${lerp(-30,130,L(t,59.0,60.0))-12}%,rgba(255,255,255,.95) ${lerp(-30,130,L(t,59.0,60.0))}%,rgba(255,255,255,0) ${lerp(-30,130,L(t,59.0,60.0))+12}%)`}}/>
  </Sc>
  <Sc t={t} a={60.9} b={68.95} d={.4}>
   <Vid src="vid/fofoca.mp4" from={60.9} dur={8.05} t={t} keys={[[60.9,1.0,.5,.5],[68.9,1.25,.55,.45]]} filter="saturate(.9) contrast(1.05)"/><Shade/><Vig op={.4}/>
  </Sc>
  <Sc t={t} a={68.95} b={74.34} d={.4}>
   <Cam src="img/churrasco.jpg" W={3000} H={2002} keys={ch2} t={t} sway={1} filter={warm}/><Shade/><Wash op={.18}/><Vig op={.4}/>
  </Sc>
  <Sc t={t} a={74.34} b={89.4} d={.4}>
   <Vid src="vid/vai.mp4" from={74.34} dur={15.05} t={t} keys={[[74.34,1.0,.5,.5],[82,1.2,.55,.45],[89.4,1.45,.5,.45]]} filter="saturate(.9) contrast(1.05)"/><Shade/><Vig op={.4}/>
  </Sc>
  <Sc t={t} a={89.4} b={97.5} d={.5}>
   <Cam src="img/corolla.jpg" W={2000} H={3000} keys={co2} t={t} sway={1} filter="saturate(.85) contrast(1.06)" over={S=><div style={{position:'absolute',left:.70*2000,top:.545*3000,width:.17*2000,height:.045*3000,background:'#F7F0E3',transform:'rotate(-4deg)'}}/>}/><Shade/><Vig op={.4}/>
  </Sc>
  {/* ---------- S17 ---------- */}
  <Sc t={t} a={97.5} b={100.57} d={.5}>
   <Cam src="img/selic.jpg" W={2752} H={1536} keys={seK} t={t} sway={1} kick={punch(t,97.6)} filter={warm}/><Shade/><Vig op={.45}/>
  </Sc>
  <Sc t={t} a={100.57} b={105.05} d={.5}>
   <Cam src="img/farofa.jpg" W={2752} H={1536} keys={faK} t={t} sway={.8} filter={`saturate(${lerp(1,.8,E(t,103,104))}) contrast(1.05) sepia(.1)`} over={S=><Img src={staticFile('img/fantasma.png')} style={{position:'absolute',left:.745*2752-215,top:.205*1536-275,width:480,opacity:E(t,103.0,103.35),filter:'drop-shadow(0 0 30px rgba(247,240,227,.6))'}}/>}/>
   <Shade/><Vig op={.4}/>
  </Sc>
  <Sc t={t} a={105.05} b={109.86} d={.5}>
   <Cam src="img/primo.jpg" W={2400} H={1792} keys={pr2} t={t} sway={.8} filter={`saturate(.95) sepia(.1)`} over={S=><LineP S={S} t={t} a={106.5} b={109.8} tail={false}/>}/>
   <Shade/><Vig op={.4}/>
  </Sc>
  <Sc t={t} a={109.86} b={113.9} d={.4}>
   <Cam src="img/primo.jpg" W={2400} H={1792} keys={pr3} t={t} sway={1} filter="saturate(.7) contrast(1.05)" over={S=><LineP S={S} t={t} a={109.9} b={113.5} tail={true}/>}/>
   <Shade/><Vig op={.6}/><Wash op={.2} a="rgba(143,157,163,.9)" b="rgba(90,104,120,.6)"/>
  </Sc>
  {/* ---------- S18 ---------- */}
  <Sc t={t} a={113.9} b={117.6} d={.5}>
   <Cam src="img/pergunta.jpg" W={1920} H={1280} keys={peK} t={t} sway={1} kick={punch(t,114)} filter="saturate(.9)"/><Shade/><Vig op={.45}/>
  </Sc>
  <Sc t={t} a={117.65} b={121.5} d={.5}>
   <Cam src="img/correr.jpg" W={1800} H={2700} keys={coK} t={t} sway={1} filter={warm}/><Shade/><Vig op={.4}/>
  </Sc>
  <Sc t={t} a={121.5} b={129.25} d={.5}>
   <Cam src="img/caindo.jpg" W={1900} H={2375} keys={caiK} t={t} sway={1} rot={Math.sin(t*.4)*1.2} filter={`saturate(${lerp(.9,.6,E(t,124,129))})`}/><Shade/><Vig op={.5}/>
   <Wash op={.35*E(t,126,128.5)} a="rgba(58,34,48,.95)" b="rgba(36,20,27,.8)"/>
  </Sc>
  <Sc t={t} a={129.3} b={135.7} d={.5}>
   <Cam src="img/caminhos.jpg" W={3000} H={2000} keys={cmK} t={t} sway={.8} filter="contrast(1.05)" over={S=><Paths S={S} t={t} a={130.3} dur={2.6} hold={true}/>}/><Vig op={.4}/>
  </Sc>
  <Sc t={t} a={135.7} b={141.4} d={.5}>
   <Cam src="img/concurso.jpg" W={2752} H={1536} keys={cnK} t={t} sway={1} filter={warm}/><Shade/><Wash op={.18}/><Vig op={.4}/>
   <Result t={t} a={136.6} b={141.2}/>
  </Sc>
  <Sc t={t} a={141.4} b={146.6} d={.5}>
   <Cam src="img/maos.jpg" W={2400} H={1600} keys={maK} t={t} sway={1} filter={warm}/><Shade/><Wash op={.3} a="rgba(219,155,91,.8)" b="rgba(196,109,69,.5)"/><Vig op={.4}/>
  </Sc>
  <Sc t={t} a={146.6} b={148.9} d={.5}>
   <Cam src="img/caminhos.jpg" W={3000} H={2000} keys={cm2K} t={t} sway={.8} filter="contrast(1.05)" over={S=><Paths S={S} t={t} a={0} dur={.01} hold={true}/>}/><Vig op={.45}/>
  </Sc>
  <Sc t={t} a={148.9} b={154.1} d={.5}>
   <Cam src="img/concurso.jpg" W={2752} H={1536} keys={cn2K} t={t} sway={1} filter={warm}/><Shade/><Wash op={.18}/><Vig op={.4}/>
   <Result t={t} a={149.0} b={152.0}/>
   <Spot x={cnP.x} y={cnP.y} r={lerp(1100,300,E(t,150.2,153))} op={E(t,150,150.6)*(1-E(t,153.7,154.1))} dim={.7}/>
  </Sc>
  <Sc t={t} a={154.1} b={157.8} d={.5}>
   <Cam src="img/caminhos.jpg" W={3000} H={2000} keys={cm3K} t={t} sway={.8} filter="contrast(1.05)" over={S=><Paths S={S} t={t} a={0} dur={.01} hold={true}/>}/><Vig op={.45}/>
  </Sc>

  <Wipe t={t} tc={21.2} d={.6} color={C.blue}/><Wipe t={t} tc={33.0} d={.6} color={C.blue}/><Wipe t={t} tc={39.55} d={.6} color={C.terra}/>
  <Wipe t={t} tc={50.2} d={.5} color={C.ocre}/><Wipe t={t} tc={54.59} d={.5} color={C.terra}/><Wipe t={t} tc={74.34} d={.4} color={C.blue}/>
  <Wipe t={t} tc={97.5} d={.5} color={C.ocre}/><Wipe t={t} tc={113.9} d={.5} color={C.blue}/><Wipe t={t} tc={129.3} d={.5} color={C.plum}/>
  <LineS t={t}/>
  <Hyps t={t}/>
  <Juros t={t} a={84.64} big={97.5} b={100.57}/>
  <Juros t={t} a={200} big={200} b={201}/>
  {t>=89.4&&t<97.5&&<Juros t={t} a={89.4} big={999} b={97.5}/>}
  <Gauge x={1500} y={50} w={330} v={gaugeAt(t)} op={gOp(t)}/>
 </AbsoluteFill>;
};

// linha de comparação ao lado de quem observa (coordenadas da imagem do primo, 2400x1792)
const LineP:React.FC<{S:number;t:number;a:number;b:number;tail:boolean}>=({S,t,a,b,tail})=>{
 const p=E(t,a,b); if(p<=0) return null;
 const x0=.3*2400,y0=.27*1792; const x1=lerp(x0,tail?.9*2400:.55*2400,p);
 const ticks=[0,1,2,3,4,5,6,7,8].map(i=>x0+i*130).filter(x=>x<=x1);
 return <svg style={{position:'absolute',left:0,top:0,overflow:'visible'}} width="1" height="1">
  <line x1={x0} y1={y0} x2={x1} y2={y0} stroke={C.terra} strokeWidth={7/S}/>
  <circle cx={x0} cy={y0} r={14/S} fill={C.terra}/>
  {ticks.map((x,i)=><line key={i} x1={x} y1={y0-26/S} x2={x} y2={y0+26/S} stroke={C.terra} strokeWidth={5/S}/>)}
  <circle cx={x1} cy={y0} r={11/S} fill={C.paper}/>
 </svg>;
};
// linha em tela cheia que atravessa S18 e converge no ponto de origem
const LineS:React.FC<{t:number}>=({t})=>{
 if(t<113.9||t>129.8) return null;
 const p=E(t,114.0,129.3); const x=lerp(0,960,p); const o=1-E(t,129,129.8);
 return <svg style={{position:'absolute',left:0,top:0,opacity:o}} width="1920" height="1080"><line x1={0} y1={1010} x2={x} y2={1010} stroke={C.terra} strokeWidth={6}/><circle cx={x} cy={1010} r={12} fill={C.paper}/></svg>;
};
// um ponto de origem que abre dois caminhos (cores iguais)
const Paths:React.FC<{S:number;t:number;a:number;dur:number;hold:boolean}>=({S,t,a,dur,hold})=>{
 const p=hold&&dur<.1?1:E(t,a,a+dur); const W=3000,H=2000; const ox=.5*W,oy=.84*H;
 const dl=ox*0; const L1:[number,number]=[.14*W,.62*H],R1:[number,number]=[.86*W,.62*H];
 const path=(tx:number,ty:number)=>`M${ox} ${oy} C ${ox+(tx-ox)*.1} ${oy-420}, ${tx} ${ty+420}, ${tx} ${ty}`;
 const len=1600;
 return <svg style={{position:'absolute',left:0,top:0,overflow:'visible'}} width="1" height="1">
  <path d={path(L1[0],L1[1])} fill="none" stroke={C.paper} strokeWidth={9/S*1.5} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len*(1-p)} opacity={.9}/>
  <path d={path(R1[0],R1[1])} fill="none" stroke={C.paper} strokeWidth={9/S*1.5} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len*(1-p)} opacity={.9}/>
  <circle cx={ox} cy={oy} r={22/S*1.5} fill={C.paper}/>
  <circle cx={ox} cy={oy} r={(34+16*Math.sin(t*5))/S*1.5} fill="none" stroke={C.paper} strokeWidth={4/S*1.5} opacity={.6}/>
 </svg>;
};
// tela ficcional de aprovação (sem nomes)
const Result:React.FC<{t:number;a:number;b:number}>=({t,a,b})=>{
 const o=sc(t,a,b,.4); if(o<=0) return null;
 return <div style={{position:'absolute',right:110,top:150,width:560,opacity:o,transform:`translateY(${(1-E(t,a,a+.5))*40}px)`,background:'rgba(247,240,227,.96)',borderRadius:22,padding:'26px 34px 30px',boxShadow:'0 30px 70px rgba(0,0,0,.5)',fontFamily:INTER,color:C.night}}>
  <div style={{display:'flex',gap:8,marginBottom:16}}>{[0,1,2].map(i=><div key={i} style={{width:12,height:12,borderRadius:6,background:'rgba(26,29,36,.3)'}}/>)}</div>
  <div style={{fontFamily:BEBAS,fontSize:84,lineHeight:1,color:C.night}}>APROVADO</div>
  <div style={{height:12,width:`${70*E(t,a+.3,a+.9)}%`,background:C.night,opacity:.15,borderRadius:6,marginTop:16}}/>
  <div style={{height:12,width:`${46*E(t,a+.4,a+1)}%`,background:C.night,opacity:.15,borderRadius:6,marginTop:12}}/>
  <div style={{position:'absolute',right:30,top:26,width:60,height:60,borderRadius:30,background:C.sage,display:'flex',alignItems:'center',justifyContent:'center',color:C.paper,fontSize:36}}>✓</div>
 </div>;
};

const Overlay:React.FC=()=>{const f=useCurrentFrame();const t=66+f/FPS;return <AbsoluteFill><Fonts/><Hyps t={t}/><Juros t={t} a={84.64} big={999} b={100.6}/></AbsoluteFill>;};
const Root:React.FC=()=> <>
 <Composition id="inveja-s15" component={Main} durationInFrames={DUR} fps={FPS} width={1920} height={1080}/>
 <Composition id="inveja-s16-overlay" component={Overlay} durationInFrames={Math.round(35*FPS)} fps={FPS} width={1920} height={1080}/>
</>;
registerRoot(Root);
