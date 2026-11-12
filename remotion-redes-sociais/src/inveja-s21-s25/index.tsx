import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Composition,Img,staticFile,registerRoot,delayRender,continueRender,useCurrentFrame,OffthreadVideo,Sequence} from 'remotion';

// S21–S25 — t=0 = 623,096 s (10:23,096) no Premiere. 1920x1080, 24 fps.
const C={night:'#1A1D24',paper:'#F7F0E3',terra:'#C46D45',ocre:'#DB9B5B',blue:'#8F9DA3',sage:'#9AA68B',plum:'#3A2230',plum2:'#24141B'};
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(x:number)=>{const t=clamp(x);return t*t*(3-2*t);};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const L=(t:number,a:number,b:number)=>clamp((t-a)/(b-a));
const E=(t:number,a:number,b:number)=>ease((t-a)/(b-a));
const FPS=24,DUR=4786;
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

// =====================================================================
//  S21–S25 — Bloco 3 inteiro + CTA 2  (clip t = Premiere − 623,096)
// =====================================================================
const Tag2:React.FC<{text:string;x:number;y:number;t:number;a:number;b:number;size?:number}>=({text,x,y,t,a,b,size=54})=>{
 const o=E(t,a,a+.25)*(1-E(t,b-.25,b)); if(o<=0) return null;
 return <div style={{position:'absolute',left:x,top:y,opacity:o,transform:`translateY(${(1-o)*12}px)`}}>
  <div style={{width:48,height:5,background:C.terra,marginBottom:12}}/>
  <div style={{fontFamily:BEBAS,fontSize:size,lineHeight:1,color:C.paper,textShadow:'0 4px 24px rgba(0,0,0,.65)',letterSpacing:1}}>{text}</div></div>;
};
// vídeo com câmera e ponto de início (start em s do arquivo)
const Vid2:React.FC<{src:string;from:number;dur:number;start:number;t:number;keys:K[];filter?:string}>=({src,from,dur,start,t,keys,filter})=>{
 const c=camAt(t,keys); const s=c.s; const fx=Math.min(Math.max(c.x*1920,960/s),1920-960/s),fy=Math.min(Math.max(c.y*1080,540/s),1080-540/s);
 return <Sequence from={Math.round(from*FPS)} durationInFrames={Math.max(1,Math.round(dur*FPS))}><AbsoluteFill style={{overflow:'hidden',filter}}>
  <div style={{position:'absolute',left:0,top:0,width:1920,height:1080,transformOrigin:'0 0',transform:`translate(${960-fx*s}px,${540-fy*s}px) scale(${s})`}}>
   <OffthreadVideo src={staticFile(src)} startFrom={Math.round(start*FPS)} muted style={{width:1920,height:1080,objectFit:'cover'}}/></div></AbsoluteFill></Sequence>;
};
const PostCard:React.FC<{t:number;a:number;b:number}>=({t,a,b})=>{
 const o=E(t,a,a+.45)*(1-E(t,b-.3,b)); if(o<=0) return null; const k=lerp(.97,1.05,L(t,a,b)); const heart=E(t,a+1.1,a+1.4);
 return <div style={{position:'absolute',left:630,top:44,width:660,opacity:o,transform:`scale(${k}) translateY(${(1-E(t,a,a+.5))*40}px)`,transformOrigin:'50% 40%',background:'#23262E',borderRadius:22,overflow:'hidden',boxShadow:'0 50px 110px rgba(0,0,0,.65)'}}>
  <div style={{height:84,display:'flex',alignItems:'center',gap:18,padding:'0 24px'}}>
   <div style={{width:50,height:50,borderRadius:25,background:C.sage}}/>
   <div><div style={{width:170,height:14,borderRadius:7,background:'rgba(247,240,227,.7)'}}/><div style={{width:110,height:11,borderRadius:6,background:'rgba(247,240,227,.3)',marginTop:9}}/></div></div>
  <Img src={staticFile('img/runner.jpg')} style={{width:660,height:825,objectFit:'cover',display:'block'}}/>
  <div style={{height:84,display:'flex',alignItems:'center',gap:26,padding:'0 24px'}}>
   <svg width="46" height="42" viewBox="0 0 24 22"><path d="M12 21C5 15 1 11.5 1 7a5.5 5.5 0 0 1 11-1 5.5 5.5 0 0 1 11 1c0 4.500-4 8-11 14Z" fill={C.terra} fillOpacity={heart} stroke={heart>.5?C.terra:C.paper} strokeWidth="1.6" transform={`scale(${1+.18*Math.sin(heart*Math.PI)})`} style={{transformOrigin:'12px 11px'}}/></svg>
   <div style={{width:130,height:12,borderRadius:6,background:'rgba(247,240,227,.3)'}}/></div></div>;
};
// cartão do cenário de etimologia sobre o olho
const Ety:React.FC<{t:number;a:number;b:number;mode:'invidere'|'videre'}>=({t,a,b,mode})=>{
 const o=E(t,a,a+.3)*(1-E(t,b-.35,b)); if(o<=0) return null;
 if(mode==='invidere'){
  const sub=E(t,a+1.0,a+1.5);
  return <div style={{position:'absolute',left:110,top:380,opacity:o}}>
   <div style={{fontFamily:INTER,fontSize:26,letterSpacing:10,color:C.terra,marginBottom:14}}>LATIM</div>
   <div style={{fontFamily:BEBAS,fontSize:190,lineHeight:1,color:C.paper,textShadow:'0 6px 40px rgba(0,0,0,.6)'}}>INVIDERE</div>
   <div style={{height:6,width:E(t,a+.3,a+.9)*560,background:C.terra,margin:'8px 0 18px'}}/>
   <div style={{fontFamily:INTER,fontSize:34,letterSpacing:8,color:C.paper,opacity:sub,transform:`translateY(${(1-sub)*10}px)`}}>OLHAR COM HOSTILIDADE</div></div>;
 }
 // videre → ver : "IN" apaga, caixa fecha em VIDERE, vira VER
 const inFade=E(t,a+.15,a+.55); const toVer=E(t,a+.95,a+1.35);
 return <div style={{position:'absolute',left:110,top:410,opacity:o}}>
  <div style={{position:'relative',display:'inline-block',fontFamily:BEBAS,fontSize:190,lineHeight:1,padding:'6px 20px 0 14px',border:`4px solid ${C.terra}`,borderRadius:8,background:'rgba(26,29,36,.55)'}}>
   <span style={{color:C.paper,opacity:1-toVer*1,display:toVer>.5?'none':'inline'}}><span style={{opacity:1-inFade,display:inFade>.95?'none':'inline'}}>IN</span><span style={{color:lerp(0,1,1)?C.terra:C.paper}}>VIDERE</span></span>
   <span style={{color:C.terra,opacity:toVer,display:toVer>.5?'inline':'none'}}>VER</span></div></div>;
};
// linha que sai do olho e volta (cor terracota, como no S07)
const EyeLine:React.FC<{t:number;a:number;b:number;c:number;x0:number;y0:number;x1:number;y1:number}>=({t,a,b,c,x0,y0,x1,y1})=>{
 // sai de a até b, volta de b até c
 const out=E(t,a,b); const back=E(t,b+.15,c); const p=out*(1-back); if(p<=.001) return null;
 const tipX=lerp(x0,x1,out*(1-back*0)), tipY=lerp(y0,y1,out);
 const sx=lerp(x0,tipX,back), sy=lerp(y0,tipY,back);
 return <svg style={{position:'absolute',left:0,top:0}} width="1920" height="1080"><line x1={back>0?lerp(x0,tipX,back):x0} y1={back>0?lerp(y0,tipY,back):y0} x2={tipX} y2={tipY} stroke={C.terra} strokeWidth="6"/>
  <circle cx={back>0?x0:tipX} cy={back>0?y0:tipY} r="12" fill={C.terra}/>{back<=0&&<circle cx={tipX} cy={tipY} r={24+6*Math.sin(t*8)} fill="none" stroke={C.terra} strokeWidth="3" opacity=".6"/>}</svg>;
};
const Display:React.FC<{t:number;a:number;b:number;digits:string;fade?:[number,number]}>=({t,a,b,digits,fade})=>{
 // texto sobre o visor da calculadora (coordenadas da imagem mesa 1920x1080)
 const n=Math.floor(clamp((t-a)/(b-a))*digits.length); const f=fade?1-E(t,fade[0],fade[1]):1;
 return <div style={{position:'absolute',left:966,top:452,width:316,height:72,transform:'rotate(-.8deg)',display:'flex',alignItems:'center',justifyContent:'flex-end',paddingRight:16,fontFamily:'monospace',fontSize:46,whiteSpace:'nowrap',fontWeight:700,color:'#c4f5de',textShadow:'0 0 10px rgba(150,240,200,.5)',letterSpacing:2,opacity:f,overflow:'hidden'}}>{digits.slice(0,n)}{(Math.floor(t*2.2)%2===0&&t>=a&&t<(fade?fade[1]:b+3))?'▌':''}</div>;
};
const MesaCam:React.FC<{t:number;keys:K[];over?:(S:number)=>React.ReactNode;filter?:string}>=({t,keys,over,filter})=>
 <Cam src="img/mesa.png" W={1920} H={1080} keys={keys} t={t} sway={.5} filter={filter} over={over}/>;

const Main:React.FC=()=>{
 const f=useCurrentFrame(); const t=f/FPS;
 // ---- ciclos do arquivo (abriu/fechou três vezes) ----
 const cyc=[8.87,10.32,11.77];
 const dk:K[]=[[8.87,1.0,.5,.5],[13.25,1.06,.5,.5]];
 const nClose=cyc.filter(c=>t>=c+1.2).length;
 // régua / distância na cena do arquivo+livro
 const rk=E(t,29.1,30.4);
 return <AbsoluteFill style={{background:C.night}}>
  <Fonts/>
  {/* ================= S21 ================= */}
  {/* 0 – 3.4  "falava de quem está na frente" */}
  <Sc t={t} a={0} b={3.5} d={0}>
   <CamF src="img/correr.jpg" W={1800} H={2700} keys={[[0,1.0,.5,.45],[3.5,1.18,.5,.38]]} t={t} sway={1} filter="saturate(.85) contrast(1.05)"/><Vig op={.55}/>
   <Tag2 text="NA FRENTE" x={140} y={170} t={t} a={.5} b={3.2}/>
  </Sc>
  {/* 3.4 – 5.7  "o olho volta" */}
  <Sc t={t} a={3.5} b={5.75} d={.4}>
   <Cam src="img/olho.jpg" filter="hue-rotate(-8deg) saturate(.82) contrast(1.06)" W={1843} H={2304} keys={[[3.5,1.15,.5,.46],[5.75,1.75,.5,.46]]} t={t} sway={.8} filter="contrast(1.06) saturate(1.0)"/>
   <AbsoluteFill style={{background:'linear-gradient(90deg,rgba(26,29,36,.8),rgba(26,29,36,0) 55%)'}}/><Vig op={.5}/>
   <EyeLine t={t} a={3.6} b={4.2} c={5.4} x0={1060} y0={460} x1={1780} y1={430}/>
  </Sc>
  {/* 5.7 – 8.85  post da corrida */}
  <Sc t={t} a={5.75} b={8.85} d={.4}>
   <GBL src="img/maratona.jpg" op={1} bl={22} br={.38}/><Vig op={.6}/>
   <PostCard t={t} a={5.8} b={8.85}/>
   <Tag2 text="MEIA MARATONA" x={1340} y={470} t={t} a={6.4} b={8.7} size={60}/>
  </Sc>
  {/* 8.87 – 13.25  arquivo abriu e fechou três vezes */}
  <Sc t={t} a={8.87} b={13.27} d={.35}>
   <AbsoluteFill style={{background:'#1c2a3b'}}/>
   {cyc.map((c,i)=><React.Fragment key={i}>
     <Vid2 src="vid/arquivo.mp4" from={c} dur={.8} start={2.7} t={t} keys={dk}/>
     <Vid2 src="vid/arquivo.mp4" from={c+.8} dur={.65} start={6.9} t={t} keys={dk}/>
   </React.Fragment>)}
   <Vig op={.35}/>
   <div style={{position:'absolute',left:120,bottom:120,display:'flex',gap:20,alignItems:'center'}}>
    {[0,1,2].map(i=><div key={i} style={{width:34,height:34,borderRadius:17,border:`4px solid ${C.terra}`,background:i<nClose?C.terra:'transparent'}}/>)}
   </div>
   <Tag2 text="ARQUIVO" x={120} y={760} t={t} a={9.0} b={13.1} size={50}/>
  </Sc>
  {/* 13.27 – 16.3  salário no almoço */}
  <Sc t={t} a={13.27} b={16.35} d={.35}>
   <Vid2 src="vid/barba.mp4" from={13.27} dur={3.1} start={3.0} t={t} keys={[[13.27,1.0,.6,.5],[16.35,1.14,.6,.5]]} filter="saturate(.9) contrast(1.05)"/>
   <Shade/><Vig op={.4}/>
   <Tag2 text="SALÁRIO" x={140} y={160} t={t} a={13.5} b={16.2}/>
  </Sc>
  {/* 16.3 – 21.7  livro do conhecido passa batido */}
  <Sc t={t} a={16.35} b={21.75} d={.45}>
   <Cam src="img/livro.jpg" W={2400} H={1600} keys={[[16.35,1.0,.5,.5],[21.75,1.22,.45,.55]]} t={t} sway={1} filter={`saturate(${lerp(1,.35,L(t,19.2,21.4))}) contrast(1.05) brightness(${lerp(1,.8,L(t,19.2,21.4))})`}/>
   <Shade/><Vig op={.5}/>
   <Tag2 text="LIVRO DE UM CONHECIDO" x={140} y={150} t={t} a={16.7} b={21.5} size={58}/>
  </Sc>
  {/* 21.7 – 35.2  o livro dele traz o seu junto / sua régua */}
  <Sc t={t} a={21.75} b={35.3} d={.5}>
   {(()=>{
     const zoom=lerp(1,1.28,E(t,29.1,35)); const joined=E(t,26.2,27.4);
     const fileOp=E(t,22.1,22.8); const fileBright=1-.45*(1-fileOp);
     const open=E(t,30.2,30.7);
     return <AbsoluteFill style={{background:C.night}}>
      <GBL src="img/livro.jpg" op={.8} bl={26} br={.3}/><Vig op={.7}/>
      <AbsoluteFill style={{transform:`scale(${zoom})`,transformOrigin:'1130px 480px'}}>
       <Card src="img/livro.jpg" W={2400} H={1600} x={130} y={250} w={640} h={480} op={E(t,21.8,22.4)} rot={-2.5} fx={.5} fy={.5}/>
       <Card src="img/arq_closed.png" W={1920} H={1080} x={880} y={190} w={880} h={495} op={fileOp} rot={1.2}/>
       {open>0&&<Card src="img/arq_open.png" W={1920} H={1080} x={880} y={190} w={880} h={495} op={open} rot={1.2}/>}
       <svg width="1920" height="1080" style={{position:'absolute',left:0,top:0}}>
        {joined>0&&<path d={`M770 520C 820 520 840 470 880 440`} stroke={C.terra} strokeWidth="6" fill="none" strokeDasharray="400" strokeDashoffset={400*(1-joined)}/>}
        {joined>0&&<circle cx="770" cy="520" r="10" fill={C.terra}/>}
        <RulerSeg x1={880} x2={880+880*rk} y={760} op={rk} col={C.terra}/>
        {t>=31.4&&<rect x={880+880*.52} y={724} width="10" height="116" fill={C.ocre} opacity={E(t,31.4,32)}/>}
       </svg>
      </AbsoluteFill>
      <Tag2 text="6 ANOS" x={930} y={90} t={t} a={23.3} b={26} size={64}/>
      <Tag2 text="SUA RÉGUA" x={930} y={900} t={t} a={31.2} b={34.6} size={64}/>
     </AbsoluteFill>;})()}
  </Sc>
  {/* 35.3 – 44.8  ressalvas — mesa calma, sem símbolos */}
  <Sc t={t} a={35.35} b={45.3} d={.6}>
   <MesaCam t={t} keys={[[35.35,1.0,.45,.5],[45.3,1.16,.55,.52]]} filter="saturate(.75) contrast(1.02) brightness(.92)"/>
   <Wash op={.18} a="rgba(143,157,163,.6)" b="rgba(143,157,163,.2)"/><Vig op={.55}/>
  </Sc>

  {/* ================= S22 ================= */}
  <Sc t={t} a={45.3} b={53.4} d={.5}>
   <CamF src="img/corolla.jpg" W={2000} H={3000} keys={[[45.3,1.0,.5,.55],[53.4,1.12,.5,.55]]} t={t} sway={.9} filter="saturate(.95) contrast(1.05)"/>
   <Vig op={.5}/>
   <Card src="img/dinheiro.jpg" W={1920} H={1280} x={110} y={130} w={500} h={340} op={sc(t,46.5,48.1,.3)} rot={-4}/>
   <Card src="img/liberdade.jpg" W={1920} H={1280} x={1310} y={170} w={500} h={340} op={sc(t,48.2,49.8,.3)} rot={4}/>
   <Card src="img/avanco.jpg" W={1350} H={2400} x={1370} y={440} w={380} h={540} op={sc(t,49.9,51.3,.3)} rot={-3}/>
   <Tag2 text="SÓ UM CARRO" x={140} y={820} t={t} a={51.6} b={53.2} size={66}/>
  </Sc>
  <Sc t={t} a={53.4} b={59.6} d={.5}>
   <Cam src="img/primo.jpg" W={2400} H={1792} keys={[[53.4,1.0,.5,.5],[59.6,1.3,.5,.45]]} t={t} sway={1} filter="saturate(.9) contrast(1.05) brightness(.92)"/>
   <Shade/><Vig op={.55}/>
   <Tag2 text="OUTRA POSSIBILIDADE" x={140} y={150} t={t} a={53.7} b={55.8} size={56}/>
  </Sc>
  <Sc t={t} a={59.6} b={62.85} d={.35}>
   <Cam src="img/primo.jpg" W={2400} H={1792} keys={[[59.6,1.3,.5,.45],[62.85,1.1,.5,.5]]} t={t} sway={.6} filter={`blur(${lerp(0,9,E(t,59.8,60.6))}px) saturate(.15) brightness(.55) contrast(1.1)`}/>
   <Vig op={.8}/>
   <Tag2 text="UM DESCONHECIDO" x={140} y={150} t={t} a={60.2} b={62.7} size={56}/>
  </Sc>
  <Sc t={t} a={62.85} b={68.95} d={.5}>
   <Cam src="img/sala.jpg" W={2400} H={1600} keys={[[62.85,1.0,.5,.5],[68.95,1.2,.55,.55]]} t={t} sway={1} filter="contrast(1.05)"/>
   <Vig op={.55}/>
   <Wash op={.22} a="rgba(219,155,91,.7)" b="rgba(196,109,69,.3)"/>
   {(()=>{const o=sc(t,64.0,68.9,.35); return o>0&&<>
    <Card src="img/bone.jpg" W={1599} H={2400} x={1180} y={90} w={520} h={780} op={sc(t,65.6,67.55,.3)} rot={3} fx={.5} fy={.34} z={1.1}/>
    <Card src="img/kombi.jpg" W={1350} H={2400} x={1180} y={90} w={520} h={780} op={sc(t,67.55,68.95,.3)} rot={-2} fx={.5} fy={.5} z={1.0}/></>;})()}
   <Tag2 text="TETO SOLAR" x={140} y={820} t={t} a={67.9} b={68.9} size={66}/>
  </Sc>
  <Sc t={t} a={68.95} b={72.1} d={.45}>
   <CamF src="img/corolla.jpg" W={2000} H={3000} keys={[[68.95,1.0,.5,.5],[72.1,1.15,.5,.5]]} t={t} sway={.7} filter="saturate(.9) contrast(1.05)"/><Vig op={.55}/>
  </Sc>
  <Sc t={t} a={72.1} b={77.1} d={.45}>
   <CamF src="img/avanco.jpg" W={1350} H={2400} keys={[[72.1,1.0,.5,.45],[77.1,1.18,.5,.62]]} t={t} sway={.8} filter="contrast(1.05) brightness(.9)"/><Vig op={.6}/>
   <Wash op={.18} a="rgba(143,157,163,.7)" b="rgba(26,29,36,.4)"/>
  </Sc>
  <Sc t={t} a={77.1} b={80.0} d={.35}>
   {(()=>{const sl=E(t,77.4,79.9); return <AbsoluteFill style={{background:C.night}}>
    <GBL src="img/corolla.jpg" op={1-sl*.0} bl={30} br={.28}/>
    <div style={{position:'absolute',left:0,top:0,width:1920,height:1080,overflow:'hidden'}}>
     <Img src={staticFile('img/corolla.jpg')} style={{position:'absolute',height:1080,left:960-360+sl*1500,top:0,filter:'saturate(.9) contrast(1.05)'}}/></div>
    <Vig op={.7}/></AbsoluteFill>;})()}
  </Sc>
  <Sc t={t} a={80.0} b={81.15} d={.4}>
   <Cam src="img/maos.jpg" W={2400} H={1600} keys={[[80,1.0,.5,.5],[81.15,1.1,.5,.52]]} t={t} sway={.7} filter="saturate(.7) brightness(.8)"/><Vig op={.75}/>
  </Sc>

  {/* ================= S23 ================= */}
  <Sc t={t} a={81.1} b={86.6} d={.5}>
   <Vid2 src="vid/almoco.mp4" from={81.1} dur={5.5} start={.2} t={t} keys={[[81.1,1.0,.5,.5],[86.6,1.1,.4,.5]]}/>
   <Vig op={.45}/>
  </Sc>
  <Sc t={t} a={86.6} b={93.3} d={.5}>
   <MesaCam t={t} keys={[[86.6,1.0,.5,.5],[88.0,2.6,.62,.5],[93.3,3.4,.63,.46]]} filter="contrast(1.05)"
    over={(S)=><>
     <Display t={t} a={90.6} b={93.2} digits="1 4 7 2 5 "/></>}/>
   <Vig op={.45}/>
   <Tag2 text="IDADE" x={140} y={150} t={t} a={86.9} b={88.3} size={64}/>
   <Tag2 text="CARGO" x={140} y={150} t={t} a={88.3} b={89.6} size={64}/>
   <Tag2 text="TEMPO DE CARREIRA" x={140} y={150} t={t} a={89.6} b={91.4} size={64}/>
  </Sc>
  <Sc t={t} a={93.3} b={95.6} d={.35}>
   <Vid2 src="vid/barba.mp4" from={93.3} dur={2.4} start={8.5} t={t} keys={[[93.3,1.0,.6,.5],[95.6,1.1,.6,.5]]} filter="saturate(.9)"/>
   <Vig op={.4}/>
  </Sc>
  <Sc t={t} a={95.6} b={102.3} d={.5}>
   <Vid2 src="vid/almoco.mp4" from={95.6} dur={6.7} start={.2} t={t} keys={[[95.6,1.0,.5,.5],[102.3,1.7,.22,.42]]} filter={`saturate(${lerp(1,.6,L(t,96,101))}) brightness(${lerp(1,.8,L(t,96,101))})`}/>
   <Vig op={.55}/>
  </Sc>
  <Sc t={t} a={102.3} b={107.9} d={.5}>
   <Cam src="img/olho.jpg" filter="hue-rotate(-8deg) saturate(.82) contrast(1.06)" W={1843} H={2304} keys={[[102.3,1.5,.5,.46],[107.9,1.9,.5,.46]]} t={t} sway={.8}/>
   <AbsoluteFill style={{background:'linear-gradient(90deg,rgba(26,29,36,.7),rgba(26,29,36,0) 60%)'}}/><Vig op={.55}/>
   <EyeLine t={t} a={102.6} b={105.0} c={106.0} x0={1060} y0={460} x1={1840} y1={400}/>
  </Sc>
  <Sc t={t} a={107.9} b={114.5} d={.5}>
   <CamF src="img/tenis.jpg" W={1600} H={2397} keys={[[107.9,1.0,.5,.55],[114.5,1.3,.5,.62]]} t={t} sway={1} filter="saturate(1) contrast(1.05)"/><Vig op={.5}/>
  </Sc>
  <Sc t={t} a={114.5} b={120.3} d={.5}>
   <Cam src="img/caminhos.jpg" W={3000} H={2000} keys={[[114.5,1.0,.5,.55],[120.3,1.12,.5,.5]]} t={t} sway={1} filter="saturate(.7) brightness(.78) contrast(1.05)"/>
   <Vig op={.7}/>
  </Sc>
  <Sc t={t} a={120.3} b={125.3} d={.6}>
   <MesaCam t={t} keys={[[120.3,2.8,.63,.47],[125.3,3.3,.63,.46]]} filter={`brightness(${lerp(.9,.35,E(t,122.5,125))}) saturate(${lerp(.9,.4,E(t,122.5,125))})`}
    over={()=><Display t={t} a={90} b={90} digits="" />}/>
   <Vig op={.8}/>
  </Sc>

  {/* ================= S24 ================= */}
  <Sc t={t} a={125.3} b={129.6} d={.5}>
   <Vid2 src="vid/barba.mp4" from={125.3} dur={4.4} start={2.0} t={t} keys={[[125.3,1.0,.6,.5],[129.6,1.08,.6,.5]]}/>
   <Vig op={.35}/><Wash op={.1}/>
  </Sc>
  <Sc t={t} a={129.6} b={135.75} d={.4}>
   <Vid2 src="vid/barba.mp4" from={129.6} dur={6.2} start={6.4} t={t} keys={[[129.6,1.0,.6,.5],[135.75,1.16,.62,.5]]} filter={`saturate(${lerp(1,.75,L(t,132,135.5))})`}/>
   <Vig op={.4}/>
  </Sc>
  <Sc t={t} a={135.75} b={140.4} d={.4}>
   <Cam src="img/olho.jpg" filter="hue-rotate(-8deg) saturate(.82) contrast(1.06)" W={1843} H={2304} keys={[[135.75,1.3,.55,.46],[140.4,1.55,.55,.46]]} t={t} sway={.8}/>
   <AbsoluteFill style={{background:'linear-gradient(90deg,rgba(26,29,36,.88),rgba(26,29,36,.1) 70%)'}}/><Vig op={.5}/>
   <Ety t={t} a={136.9} b={140.4} mode="invidere"/>
  </Sc>
  <Sc t={t} a={140.4} b={144.3} d={.4}>
   <CamF src="img/correr.jpg" W={1800} H={2700} keys={[[140.4,1.0,.5,.4],[144.3,1.15,.5,.34]]} t={t} sway={1} filter="saturate(.85)"/><Vig op={.55}/>
  </Sc>
  <Sc t={t} a={144.3} b={146.3} d={.2}>
   <Vid2 src="vid/barba.mp4" from={144.3} dur={2.0} start={11} t={t} keys={[[144.3,1.0,.6,.5],[146.3,1.1,.6,.5]]}/>
   <Shade/><Vig op={.45}/><Tag2 text="SALÁRIO" x={140} y={160} t={t} a={144.4} b={146.3}/>
  </Sc>
  <Sc t={t} a={146.3} b={148.2} d={.2}>
   <CamF src="img/corolla.jpg" W={2000} H={3000} keys={[[146.3,1.0,.5,.55],[148.2,1.1,.5,.55]]} t={t} sway={.6}/><Vig op={.5}/>
   <Tag2 text="COROLLA" x={140} y={160} t={t} a={146.4} b={148.2}/>
  </Sc>
  <Sc t={t} a={148.2} b={150.4} d={.2}>
   <Cam src="img/maratona.jpg" W={3000} H={2000} keys={[[148.2,1.0,.5,.5],[150.4,1.12,.45,.5]]} t={t} sway={.8}/><Shade/><Vig op={.45}/>
   <Tag2 text="MEIA MARATONA" x={140} y={160} t={t} a={148.3} b={150.4}/>
  </Sc>
  <Sc t={t} a={150.4} b={155.9} d={.5}>
   <Cam src="img/olho.jpg" filter="hue-rotate(-8deg) saturate(.82) contrast(1.06)" W={1843} H={2304} keys={[[150.4,1.5,.5,.46],[155.9,1.5,.5,.46]]} t={t} sway={.8}/>
   <AbsoluteFill style={{background:'linear-gradient(90deg,rgba(26,29,36,.7),rgba(26,29,36,0) 60%)'}}/><Vig op={.55}/>
   <EyeLine t={t} a={150.7} b={153.6} c={155.7} x0={1060} y0={460} x1={1840} y1={420}/>
  </Sc>
  <Sc t={t} a={155.9} b={158.3} d={.5}>
   <Vid2 src="vid/luiz.mp4" from={155.9} dur={2.4} start={.6} t={t} keys={[[155.9,1.3,.46,.47],[158.3,1.75,.46,.45]]} filter="saturate(.78) contrast(1.06) brightness(.88)"/>
   <Wash op={.16} a="rgba(143,157,163,.7)" b="rgba(58,34,48,.45)"/>
   <Vig op={.6}/>
  </Sc>
  <Sc t={t} a={158.3} b={161.8} d={.35}>
   <Cam src="img/olho.jpg" filter="hue-rotate(-8deg) saturate(.82) contrast(1.06)" W={1843} H={2304} keys={[[158.3,1.3,.55,.46],[161.8,1.5,.55,.46]]} t={t} sway={.8}/>
   <AbsoluteFill style={{background:'linear-gradient(90deg,rgba(26,29,36,.88),rgba(26,29,36,.1) 70%)'}}/><Vig op={.5}/>
   <Ety t={t} a={158.4} b={161.8} mode="videre"/>
  </Sc>
  <Sc t={t} a={161.8} b={179.9} d={.8}>
   <MesaCam t={t} keys={[[161.8,3.0,.63,.47],[166,2.2,.6,.48],[171,1.5,.55,.5],[176,1.1,.52,.5],[179.9,1.0,.5,.5]]}
    filter={`brightness(${lerp(.85,1,E(t,170,176))}) contrast(1.04)`}
    over={()=><Display t={t} a={163.4} b={168.6} digits="1 4 7 2 5 " fade={[172.2,175.2]}/>}/>
   <Vig op={.5}/>
  </Sc>

  {/* ================= S25 (CTA 2) ================= */}
  {(()=>{
   const c0=179.85, mv=E(t,185.9,188.4);  // a captura encolhe até o lugar final
   const bx=lerp(0,90,mv), by=lerp(0,100,mv), bw=lerp(1920,1230,mv), bh=lerp(1080,595,mv);
   const typed=Math.min(15.4,8+ (t-c0)*1.0);
   const br=E(t,188.4,189.4);
   return <Sc t={t} a={179.9} b={199.9} d={.6}>
    <AbsoluteFill style={{background:C.night}}/>
    <AbsoluteFill style={{opacity:mv}}><GBL src="img/runner.jpg" op={0} bl={0}/>
     <div style={{position:'absolute',inset:0,background:'radial-gradient(60% 70% at 25% 40%,rgba(58,34,48,.55),rgba(26,29,36,1))'}}/></AbsoluteFill>
    <div style={{position:'absolute',left:bx,top:by,width:bw,height:bh,overflow:'hidden',borderRadius:lerp(0,14,mv),boxShadow:mv>0?'0 40px 100px rgba(0,0,0,.6)':'none'}}>
     <div style={{position:'absolute',left:0,top:0,width:1912,height:924,transformOrigin:'0 0',transform:`scale(${bw/1912},${bh/924})`}}>
      <Sequence from={Math.round(c0*FPS)}><OffthreadVideo src={staticFile('vid/blog.mp4')} startFrom={Math.round(6.5*FPS)} playbackRate={1.08} muted style={{width:1912,height:924}}/></Sequence></div></div>
    {/* identidade e endereço (zona esquerda/inferior; direita livre p/ elementos finais) */}
    <div style={{position:'absolute',left:90,top:745,opacity:br,transform:`translateY(${(1-br)*20}px)`}}>
     <Img src={staticFile('img/palavras-logo-osso.svg')} style={{height:110,display:'block'}}/>
     <div style={{fontFamily:BEBAS,fontSize:92,color:C.paper,marginTop:26,lineHeight:1}}>PALAVRAS.CO<span style={{color:C.terra}}>/BLOG</span></div>
     <div style={{height:5,width:420*br,background:C.terra,marginTop:14}}/></div>
   </Sc>;})()}
  <Wipe t={t} tc={3.5} d={.4} color={C.ocre}/><Wipe t={t} tc={5.75} d={.4} color={C.terra}/><Wipe t={t} tc={21.75} d={.5} color={C.plum}/><Wipe t={t} tc={45.3} d={.5} color={C.plum}/><Wipe t={t} tc={81.1} d={.5} color={C.plum}/><Wipe t={t} tc={125.3} d={.5} color={C.plum}/>
 </AbsoluteFill>;
};
const Root:React.FC=()=> <Composition id="inveja-s21" component={Main} durationInFrames={DUR} fps={FPS} width={1920} height={1080}/>;
registerRoot(Root);
