import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Composition,Img,staticFile,registerRoot,delayRender,continueRender,useCurrentFrame,OffthreadVideo,Sequence} from 'remotion';

// S15–S18 — t=0 = 383,45 s na linha do Premiere (6:23,45). 1920x1080, 24 fps, 157,705 s.
const C={night:'#1A1D24',paper:'#F7F0E3',terra:'#C46D45',ocre:'#DB9B5B',blue:'#8F9DA3',sage:'#9AA68B',plum:'#3A2230',plum2:'#24141B'};
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(x:number)=>{const t=clamp(x);return t*t*(3-2*t);};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const L=(t:number,a:number,b:number)=>clamp((t-a)/(b-a));
const E=(t:number,a:number,b:number)=>ease((t-a)/(b-a));
const FPS=24,DUR=1956;
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
const CW=3000,CH=2000;
const Person:React.FC<{x:number;y:number;s?:number;col:string;op?:number}>=({x,y,s=1.8,col,op=1})=> op<=0?null:
 <g transform={`translate(${x},${y}) scale(${s})`} opacity={op}><circle cx="0" cy="-92" r="24" fill={col}/><path d="M-48 0Q-48 -56 0 -56Q48 -56 48 0" stroke={col} fill="none" strokeWidth="10" strokeLinecap="round"/></g>;
const RulerSeg:React.FC<{x1:number;x2:number;y:number;op:number;col?:string}>=({x1,x2,y,op,col=C.terra})=>{
 if(op<=0||x2-x1<30) return null; const n=Math.floor((x2-x1)/21);
 return <g opacity={op}><rect x={x1} y={y} width={x2-x1} height="44" rx="3" fill={col}/>{Array.from({length:n+1},(_,i)=><path key={i} d={`M${x1+10+i*21} ${y+4}v${i%5===0?30:17}`} stroke={C.paper} strokeWidth={i%5===0?3:2}/>)}</g>;
};
const Halo:React.FC<{x:number;y:number;r:number;op:number;t:number}>=({x,y,r,op,t})=> op<=0?null:
 <g opacity={op}>{[0,1].map(i=><circle key={i} cx={x} cy={y} r={r*(1+((t*.6+i*.5)%1))} fill="none" stroke={C.ocre} strokeWidth="4" opacity={1-((t*.6+i*.5)%1)}/>)}<circle cx={x} cy={y} r={r*.5} fill={C.ocre} opacity=".5"/></g>;
const Plate2:React.FC<{text:string;x:number;y:number;size:number;op:number;center?:boolean}>=({text,x,y,size,op,center=false})=> op<=0?null:
 <div style={{position:'absolute',left:center?0:x,right:center?0:undefined,top:y+(1-op)*18,textAlign:'center',opacity:op}}>
  <span style={{display:'inline-block',fontFamily:BEBAS,fontSize:size,lineHeight:1,color:C.paper,background:'rgba(26,29,36,.92)',padding:`${size*.12}px ${size*.4}px ${size*.08}px ${size*.3}px`,borderLeft:`${Math.max(8,size*.09)}px solid ${C.terra}`,whiteSpace:'nowrap'}}>{text}</span></div>;
const GBL:React.FC<{src:string;op:number;bl?:number;br?:number}>=({src,op,bl=14,br=.42})=> op<=0?null:<Img src={staticFile(src)} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',filter:`blur(${bl}px) brightness(${br})`,transform:'scale(1.12)',opacity:op}}/>;
const GBG:React.FC<{t:number}>=({t})=>{
 const mar=E(t,28.8,29.6)*(1-E(t,40.4,41.2))+E(t,66.2,67)*(1-E(t,71.4,72.2));
 const cam=Math.max(0,1-mar);
 return <AbsoluteFill style={{background:C.plum2}}>
  <GBL src="img/caminhos.jpg" op={cam} br={.38}/>
  <GBL src="img/maratona.jpg" op={mar} br={.5}/>
  <AbsoluteFill style={{background:'linear-gradient(135deg,rgba(58,34,48,.5),rgba(36,20,27,.62))'}}/>
  <Vig op={.7}/></AbsoluteFill>;
};
const SilFar:React.FC<{t:number;a:number;b:number}>=({t,a,b})=>{
 const o=E(t,a,a+.5)*(1-E(t,b-.4,b)); if(o<=0) return null; const k=lerp(.94,1.0,L(t,a,b));
 return <AbsoluteFill style={{opacity:o}}>
  <GBL src="img/campeonato.jpg" op={1} bl={10} br={.95}/>
  <AbsoluteFill style={{background:'radial-gradient(60% 70% at 62% 45%,rgba(247,240,227,.85),rgba(219,155,91,.5) 55%,rgba(58,34,48,.55) 100%)',mixBlendMode:'screen'}}/>
  <AbsoluteFill style={{background:'linear-gradient(180deg,rgba(26,29,36,.25),rgba(26,29,36,.55))'}}/>
  <div style={{position:'absolute',left:1090,top:90,transform:`scale(${k}) translateY(${(1-E(t,a,a+.6))*40}px)`,transformOrigin:'50% 100%'}}>
   <Img src={staticFile('img/sil_gisele.png')} style={{position:'absolute',left:0,top:130,height:700,filter:'drop-shadow(0 0 40px rgba(247,240,227,.6))'}}/>
   <Img src={staticFile('img/sil_brad.png')} style={{position:'absolute',left:300,top:230,height:620,filter:'drop-shadow(0 0 40px rgba(247,240,227,.6))',opacity:E(t,a+.9,a+1.4)}}/></div>
  <svg width="1920" height="1080" style={{position:'absolute',left:0,top:0}}>
   <Person x={300} y={900} s={1.7} col={C.paper} op={1}/>
   <path d={`M420 800H${lerp(420,1040,E(t,a+.5,a+1.4))}`} stroke={C.terra} strokeWidth="5" strokeDasharray="10 14" opacity=".9"/>
   <Halo x={1300} y={170} r={34} op={E(t,a+.4,a+1)} t={t}/><Halo x={1560} y={250} r={34} op={E(t,a+1.2,a+1.7)} t={t}/>
  </svg>
 </AbsoluteFill>;
};
const PaperCard:React.FC<{t:number;a:number;b:number;x:number;y:number;w:number;rot?:number;cite?:boolean}>=({t,a,b,x,y,w,rot=-1.2,cite=true})=>{
 const o=E(t,a,a+.5)*(1-E(t,b-.4,b)); if(o<=0) return null; const k=lerp(.96,1.04,L(t,a,b));
 return <div style={{position:'absolute',left:x-w/2,top:y,width:w,opacity:o,transform:`rotate(${rot}deg) scale(${k}) translateY(${(1-E(t,a,a+.5))*40}px)`}}>
  <Img src={staticFile('img/paper.png')} style={{width:w,display:'block',boxShadow:'0 30px 80px rgba(0,0,0,.6)'}}/>
  {t>=a+1.6&&<div style={{position:'absolute',left:w*.2*1.37,top:w*.126,width:w*.115*E(t,a+1.6,a+2.2),height:w*.026,background:'rgba(219,155,91,.6)',mixBlendMode:'multiply'}}/>}
  {cite&&<div style={{marginTop:22,fontFamily:INTER,color:C.paper,fontSize:28,letterSpacing:1,background:'rgba(26,29,36,.9)',padding:'12px 22px',borderLeft:`8px solid ${C.terra}`,display:'inline-block',lineHeight:1.35}}>van de Ven, Zeelenberg &amp; Pieters (2009)<br/><span style={{opacity:.75,fontSize:24}}>Emotion, 9(3), 419–429</span></div>}
 </div>;
};
const Main:React.FC=()=>{
 const f=useCurrentFrame(); const t=f/FPS;
 const cm:K[]=[[0,1.0,.5,.55],[8,1.12,.5,.58],[16.45,1.3,.5,.6]];
 const wp=(ix:number,iy:number)=>scr(cm,CW,CH,t,ix*CW,iy*CH);
 const lw=wp(.14,.62), rw=wp(.86,.62);
 const maK2:K[]=[[16.45,1.0,.5,.5],[19.05,1.25,.45,.55]];
 const cnK2:K[]=[[19,1.0,.5,.45],[25.9,1.9,.5,.43]];
 const cnP=scr(cnK2,2752,1536,t,.5*2752,.43*1536);
 // ---------------- cena gráfica ----------------
 const BY=700;
 const ownX=kf(t,[[0,420],[36.4,420],[40.3,950],[40.9,950],[42.2,420],[66.88,420],[71.4,700],[71.9,700],[76.5,520],[78,520],[80.6,960]]);
 const farK=kf(t,[[0,0],[43.7,0],[47.5,1],[52.8,1],[53.4,0],[71.84,0],[75.8,1]]);
 const nearK=kf(t,[[53.2,0],[54.4,1]]);
 const othX=lerp(1300,1720,farK)*(1-nearK)+780*nearK + (t>71.84?0:0);
 const othX2=t<53.2?lerp(1300,1720,farK):(t<71.84?780:lerp(780,1720,farK));
 const othS=1.8*(t<53.2?lerp(1,.78,farK):(t<71.84?1:lerp(1,.78,farK)));
 const pull=kf(t,[[30.14,0],[32.8,1],[35.25,1],[36.2,0]]);
 const othY=BY+95*pull+(t>57.6&&t<63?60:0);
 const lane=E(t,57.67,58.4)*(1-E(t,62.9,63.3));
 const sting=E(t,61.75,62.0)*(1-E(t,62.2,63));
 const endK=E(t,77.94,81.2); const groupScale=lerp(1,1.5,endK);
 const sprint=sc(t,66.88,71.5,.3);
 const gArr:React.ReactNode[]=[];
 const showStage=t>=25.8;
  const stage=<>
   <GBG t={t}/>
   <AbsoluteFill style={{transform:`scale(${groupScale})`,transformOrigin:`${ownX}px ${BY-60}px`}}>
   <svg width="1920" height="1080" style={{position:'absolute',left:0,top:0}}>
    {/* faixas paralelas (vizinho) */}
    {/* régua / distância */}
    <RulerSeg x1={ownX+70} x2={othX2-70} y={BY+24+(lane>0?80:0)} op={E(t,40.9,41.6)*(1-E(t,43.2,43.9))+E(t,53.9,54.6)*(1-E(t,57.4,57.9))+sc(t,66.5,71.5,.4)*.6+E(t,71.9,72.5)*(1-E(t,76.8,77.6))*.6}/>
    {/* puxão para baixo */}
    {pull>0&&<g opacity={pull}><path d={`M${othX2-60} ${BY-260}V${BY-150+60*pull}M${othX2+60} ${BY-260}V${BY-150+60*pull}`} stroke={C.terra} strokeWidth="5" strokeDasharray="10 12"/></g>}
    {/* rastro de avanço */}
    {(t>36.4&&t<41.5)&&<path d={`M420 ${BY-30}H${ownX}`} stroke={C.paper} strokeWidth="5" opacity={.5}/>}
    {sprint>0&&<g opacity={sprint*.7}>{[0,1,2,3].map(i=><path key={i} d={`M${ownX-60-i*90} ${BY-40-i*14}H${ownX-120-i*90}`} stroke={C.paper} strokeWidth="4"/>)}</g>}
    {/* passos */}
    {[520,620].map((x,i)=>{const o=sc(t,55.0+i*.5,57.3,.2);return o>0?<ellipse key={i} cx={x} cy={BY+8} rx="26" ry="11" fill={C.paper} opacity={o}/>:null;})}
    {/* celebridades: apenas pontos distantes */}
    {[[1650,360],[1780,420]].map(([x,y],i)=><Halo key={i} x={x} y={y} r={26} op={sc(t,48.97+i*.9,52.6,.4)} t={t}/>)}
    <Halo x={othX2} y={BY-190} r={44} op={E(t,43.9,45)*(1-E(t,47.8,48.4))+E(t,72.5,73.5)*(1-E(t,77.2,77.9))} t={t}/>
    <Person x={ownX} y={BY} col={C.paper}/>
    <Person x={othX2} y={othY} s={othS} col={C.terra} op={1-endK}/>
    {endK>0&&<circle cx={ownX} cy={BY-92*1.8} r={lerp(220,60,endK)} fill="none" stroke={C.ocre} strokeWidth="6" opacity={endK}/>}
   </svg></AbsoluteFill>
   <Plate2 text="PARECE MERECIDO?" x={0} y={110} size={150} op={E(t,29.19,29.7)*(1-E(t,40.2,40.8))} center/>
   <Plate2 text="DISTÂNCIA" x={0} y={110} size={150} op={E(t,41.6,42.2)*(1-E(t,47.8,48.4))+E(t,53.6,54.1)*(1-E(t,57.6,58.1))} center/>
   <PaperCard t={t} a={63.08} b={66.6} x={1480} y={640} w={560} rot={-2} cite={false}/>
  </>;
 return <AbsoluteFill style={{background:C.night}}>
  <Fonts/>
  {/* ---------- S19 ---------- */}
  <Sc t={t} a={0} b={16.45} d={0}>
   <Cam src="img/caminhos.jpg" W={CW} H={CH} keys={cm} t={t} sway={.8} filter="contrast(1.05)" over={S=><Paths S={S} t={t} a={0} dur={.01} hold={true}/>}/>
   <AbsoluteFill style={{background:C.night,opacity:.62*sc(t,.5,8.2,.7)}}/>
   <Vig op={.45}/>
   <PaperCard t={t} a={.9} b={8.3} x={960} y={160} w={1100}/>
   <Plate2 text="BENIGNA" x={110} y={150} size={120} op={E(t,9.97,10.4)}/>
   <Plate2 text="MALICIOSA" x={1230} y={150} size={120} op={E(t,11.09,11.5)}/>
  </Sc>
  <Sc t={t} a={16.45} b={19.05} d={.5}>
   <Cam src="img/pergunta.jpg" W={1920} H={1280} keys={[[16.45,1.0,.5,.45],[18.2,1.85,.22,.32]]} t={t} sway={1} filter="saturate(.95) contrast(1.05)"/><Shade/><Vig op={.4}/>
  </Sc>
  <Sc t={t} a={19.05} b={23.4} d={.5}>
   <Cam src="img/pergunta.jpg" W={1920} H={1280} keys={[[19.05,1.5,.5,.4],[20.4,2.1,.81,.26],[23.4,2.4,.81,.26]]} t={t} sway={.7} filter="saturate(.8) contrast(1.1) brightness(.85)"/>
   <AbsoluteFill style={{background:'radial-gradient(60% 70% at 70% 35%,rgba(36,20,27,0) 20%,rgba(36,20,27,.75) 100%)'}}/>
   <Wash op={.35*E(t,19.5,21)} a="rgba(58,34,48,.95)" b="rgba(36,20,27,.8)"/><Vig op={.7}/>
  </Sc>
  <Sc t={t} a={23.4} b={24.58} d={.2}>
   <Cam src="img/tornozelo.jpg" W={1800} H={3195} keys={[[23.4,1.0,.5,.45],[24.55,1.3,.5,.66]]} t={t} sway={1} kick={punch(t,23.96)} filter="saturate(.85) contrast(1.08)"/><Shade/><Vig op={.55}/>
   <AbsoluteFill style={{background:'rgba(196,60,50,.5)',opacity:t>=23.96?Math.exp(-(t-23.96)*8)*.6:0,mixBlendMode:'multiply'}}/>
  </Sc>
  <Sc t={t} a={24.58} b={25.9} d={.2}>
   <Cam src="img/maratona.jpg" W={3000} H={2000} keys={[[24.58,1.0,.5,.5],[25.9,1.15,.4,.5]]} t={t} sway={1} filter="saturate(1.05) contrast(1.05)"/><Shade/><Vig op={.5}/>
  </Sc>
  {/* ---------- S20 ---------- */}
  <Sc t={t} a={25.9} b={53.0} d={.5}>{stage}</Sc>
  <Sc t={t} a={48.55} b={53.0} d={.5}><SilFar t={t} a={48.55} b={53.0}/></Sc>
  <Sc t={t} a={53.0} b={57.6} d={.5}>
   <Cam src="img/fachada.jpg" W={3000} H={2000} keys={[[53.0,1.0,.55,.5],[57.6,1.5,.68,.45]]} t={t} sway={1} filter="saturate(1.05) contrast(1.05)"/><Shade/><Vig op={.45}/>
  </Sc>
  <Sc t={t} a={57.6} b={63.0} d={.5}>
   <Cam src="img/portas.jpg" W={2250} H={3000} keys={[[57.6,1.0,.55,.62],[63.0,1.45,.68,.66]]} t={t} sway={1} filter={`saturate(${lerp(1.05,.45,sting)}) contrast(1.05) sepia(.1)`}/><Shade/><Vig op={.45+.35*sting}/>
   <AbsoluteFill style={{background:C.night,opacity:.5*sting}}/>
  </Sc>
  <Sc t={t} a={63.0} b={82} d={.5}>{stage}</Sc>
  <Wipe t={t} tc={16.45} d={.5} color={C.ocre}/><Wipe t={t} tc={19.05} d={.5} color={C.plum}/><Wipe t={t} tc={25.9} d={.5} color={C.plum}/><Wipe t={t} tc={48.55} d={.5} color={C.ocre}/><Wipe t={t} tc={53.0} d={.5} color={C.ocre}/><Wipe t={t} tc={57.6} d={.5} color={C.terra}/><Wipe t={t} tc={63.0} d={.5} color={C.plum}/>
 </AbsoluteFill>;
};
const Root:React.FC=()=> <Composition id="inveja-s19" component={Main} durationInFrames={DUR} fps={FPS} width={1920} height={1080}/>;
registerRoot(Root);
