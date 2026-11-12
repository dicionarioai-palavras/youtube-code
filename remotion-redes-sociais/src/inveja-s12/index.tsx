import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Composition,Img,staticFile,registerRoot,delayRender,continueRender,useCurrentFrame} from 'remotion';

// S12+S13+S14 — t=0 = 310,114 s na linha do tempo do Premiere (5:10,11357). 1920x1080, 24 fps, 74,2 s.
const C={night:'#1A1D24',paper:'#F7F0E3',terra:'#C46D45',ocre:'#DB9B5B',blue:'#8F9DA3'};
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(x:number)=>{const t=clamp(x);return t*t*(3-2*t);};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const L=(t:number,a:number,b:number)=>clamp((t-a)/(b-a));
const E=(t:number,a:number,b:number)=>ease((t-a)/(b-a));
const FPS=24,DUR=1781;
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

// ---------- helpers da cena ----------
const Fonts=()=>{const [handle]=useState(()=>delayRender('Fontes'));useEffect(()=>{Promise.all([document.fonts.load('200px PalBebas'),document.fonts.load('30px PalInter')]).then(()=>continueRender(handle));},[handle]);
 return <style>{`@font-face{font-family:PalBebas;src:url('${staticFile('fonts/BebasNeue.woff2')}')}@font-face{font-family:PalInter;src:url('${staticFile('fonts/Inter-500.woff2')}')}`}</style>;};
const Gauge:React.FC<{x:number;y:number;w:number;v:number;op:number;note?:string}>=({x,y,w,v,op,note})=> op<=0?null:
 <div style={{position:'absolute',left:x,top:y,opacity:op,background:'rgba(26,29,36,.86)',padding:'16px 24px 20px 22px',borderLeft:`8px solid ${C.terra}`}}>
  <div style={{fontFamily:INTER,fontSize:26,letterSpacing:9,color:C.terra,marginBottom:12,display:'flex',justifyContent:'space-between',width:w}}><span>INCÔMODO</span>{note&&<span style={{color:C.paper,letterSpacing:4}}>{note}</span>}</div>
  <div style={{width:w,height:14,background:'rgba(247,240,227,.25)',borderRadius:7}}><div style={{width:w*clamp(v),height:14,background:C.terra,borderRadius:7}}/></div>
 </div>;
const GK:[number,number][]=[[0,.03],[10.8,.03],[11.2,.12],[18,.25],[19.6,.4],[20.6,.22],[26,.2],[30,.2],[31,.65],[33,.7],[35,.7],[40,.78],[45,.75],[50,.7],[53.5,.8],[64,.85],[65.8,.85],[68,.9],[71.2,.97],[74.2,1]];
const gv=(t:number)=>{for(let i=0;i<GK.length-1;i++){const a=GK[i],b=GK[i+1];if(t<=b[0]) return lerp(a[1],b[1],ease((t-a[0])/(b[0]-a[0])));}return 1;};
const kf=(t:number,keys:[number,number][])=>{if(t<=keys[0][0]) return keys[0][1];for(let i=0;i<keys.length-1;i++){const a=keys[i],b=keys[i+1];if(t<=b[0]) return lerp(a[1],b[1],ease((t-a[0])/(b[0]-a[0])));}return keys[keys.length-1][1];};
const sc=(t:number,a:number,b:number,f=.3)=>E(t,a,a+f)*(1-E(t,b-f,b));
const Shade:React.FC=()=> <AbsoluteFill style={{background:'linear-gradient(0deg,rgba(26,29,36,.8) 0%,rgba(26,29,36,0) 38%),linear-gradient(180deg,rgba(26,29,36,.55) 0%,rgba(26,29,36,0) 24%)'}}/>;
const TC1=10.89,TC2=40.59,DURS=DUR/FPS;
const WipeBar:React.FC<{t:number;tc:number;color:string}>=({t,tc,color})=>{
 const u=(t-(tc-.4))/.8; if(u<0||u>1) return null;
 return <div style={{position:'absolute',left:lerp(-2700,1920,u)-60,top:-100,width:2760,height:1280,background:color,transform:'skewX(-12deg)',boxShadow:'0 0 80px rgba(0,0,0,.25)'}}/>;
};

// ---------- celular / feed ----------
type Post={img:string;W:number;H:number;fx:number;fy:number;h:string;loc?:string;likes:string;cap:string;time:string;col:string};
const POSTS:Post[]=[
 {img:'img/selfie.jpg',W:1601,H:2400,fx:.5,fy:.4,h:'um.amigo',likes:'Curtido por pessoas que você segue',cap:'nós dois',time:'HÁ 2 HORAS',col:'#C46D45'},
 {img:'img/candle.jpg',W:2400,H:1602,fx:.5,fy:.5,h:'um.amigo',likes:'Curtido por pessoas que você segue',cap:'jantar',time:'HÁ 1 DIA',col:'#C46D45'},
 {img:'img/pousada.jpg',W:2400,H:1600,fx:.5,fy:.5,h:'um.amigo',loc:'Serra',likes:'Curtido por pessoas que você segue',cap:'meu porto seguro',time:'HÁ 3 DIAS',col:'#C46D45'},
 {img:'img/santorini.jpg',W:2400,H:1350,fx:.5,fy:.5,h:'ex.colega',loc:'Grécia',likes:'Curtido por pessoas que você segue',cap:'dias assim',time:'HÁ 5 HORAS',col:'#8F9DA3'},
 {img:'img/chave.jpg',W:2400,H:1601,fx:.5,fy:.5,h:'menina.da.escola',likes:'Curtido por pessoas que você segue',cap:'casa nova',time:'HÁ 1 HORA',col:'#9AA68B'},
];
const POSTH=834;
const Ic:React.FC<{d:string;s?:number;fill?:string;col?:string}>=({d,s=34,fill='none',col='#F7F0E3'})=> <svg width={s} height={s} viewBox="0 0 24 24" fill={fill} stroke={col} strokeWidth="1.8" strokeLinejoin="round" strokeLinecap="round"><path d={d}/></svg>;
const HEART='M12 21C5 16 2 12.500 2 8.800 2 6 4.100 4 6.700 4c1.900 0 3.700 1 5.300 3 1.600-2 3.400-3 5.300-3C19.900 4 22 6 22 8.800 22 12.500 19 16 12 21z';
const CMT='M21 11.500a8.500 8.500 0 0 1-12.300 7.600L3 21l1.900-5.500A8.500 8.500 0 1 1 21 11.500z';
const PLN='M22 3 2 10.500l7.500 3L12 21z M22 3 9.500 13.500';
const BKM='M6 3h12v18l-6-4.500L6 21z';
const Avatar:React.FC<{col:string;l:string;s?:number}>=({col,l,s=44})=> <div style={{width:s,height:s,borderRadius:s,background:`linear-gradient(135deg,${C.ocre},${C.terra})`,display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{width:s-7,height:s-7,borderRadius:s,background:col,border:'3px solid #14161B',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:BEBAS,fontSize:s*.5,color:C.paper}}>{l}</div></div>;
const PostView:React.FC<{p:Post;cc?:number;heart?:number;dash?:boolean;sel?:boolean}>=({p,cc,heart=-1,dash=false,sel=false})=>{
 const liked=heart>=0; const hp=heart>=0&&heart<.9?back(heart/.35):0; const ho=heart>=0&&heart<.9?(heart<.5?1:1-(heart-.5)/.4):0;
 const cap=cc===undefined?p.cap:p.cap.slice(0,cc);
 return <div style={{position:'relative',height:POSTH,width:504,background:'#14161B',color:C.paper,fontFamily:INTER}}>
  <div style={{height:70,display:'flex',alignItems:'center',padding:'0 16px',gap:12}}>
   <Avatar col={p.col} l={p.h[0].toUpperCase()}/>
   <div style={{flex:1,lineHeight:1.15}}><div style={{fontSize:21}}>{p.h}</div>{p.loc&&<div style={{fontSize:16,opacity:.75}}>{p.loc}</div>}</div>
   <div style={{fontSize:28,letterSpacing:2}}>···</div>
  </div>
  <div style={{position:'relative',width:504,height:540,overflow:'hidden'}}>
   <Img src={staticFile(p.img)} style={{width:504,height:540,objectFit:'cover',objectPosition:`${p.fx*100}% ${p.fy*100}%`,display:'block'}}/>
   {ho>0&&<div style={{position:'absolute',left:0,top:0,width:504,height:540,display:'flex',alignItems:'center',justifyContent:'center',opacity:ho}}><div style={{transform:`scale(${hp*1.1})`,filter:'drop-shadow(0 8px 20px rgba(0,0,0,.45))'}}><Ic d={HEART} s={150} fill="#F7F0E3" col="#F7F0E3"/></div></div>}
  </div>
  <div style={{height:52,display:'flex',alignItems:'center',padding:'0 16px',gap:20}}>
   <Ic d={HEART} fill={liked?'#E5484D':'none'} col={liked?'#E5484D':C.paper}/><Ic d={CMT}/><Ic d={PLN}/><div style={{flex:1}}/><Ic d={BKM}/>
  </div>
  <div style={{padding:'0 16px',fontSize:17,opacity:.9,height:28}}>{p.likes}</div>
  <div style={{padding:'0 16px',fontSize:20,lineHeight:1.3,height:64,background:sel?'rgba(196,109,69,.0)':'none'}}>
   {dash?<span style={{display:'inline-block',width:300,height:26,border:'2px dashed rgba(247,240,227,.5)',borderRadius:6,verticalAlign:'middle'}}/>:<><b style={{fontWeight:700}}>{p.h}</b> <span style={{background:sel?'rgba(219,155,91,.45)':'none',padding:'0 3px'}}>{cap}</span></>}
  </div>
  <div style={{padding:'0 16px',fontSize:14,letterSpacing:1,opacity:.6}}>{p.time}</div>
 </div>;
};
const Phone:React.FC<{x:number;y:number;s?:number;rot?:number;op?:number;ox?:number;oy?:number;pos:number;extra?:(p:number)=>Record<number,any>;cc?:number;heartT?:number;heartIdx?:number;dashIdx?:number;notif?:number;selIdx?:number}>=({x,y,s=1,rot=0,op=1,ox=270,oy=520,pos,cc,heartT=-1,heartIdx=1,dashIdx=-1,notif=-1,selIdx=-1})=>{
 if(op<=0) return null;
 return <div style={{position:'absolute',left:x,top:y,width:540,height:1040,opacity:op,transform:`rotate(${rot}deg) scale(${s})`,transformOrigin:`${ox}px ${oy}px`,filter:'drop-shadow(0 40px 60px rgba(0,0,0,.45))'}}>
  <div style={{position:'absolute',inset:0,borderRadius:68,background:'#0B0C0F',boxShadow:'inset 0 0 0 3px #2A2D34'}}/>
  <div style={{position:'absolute',left:18,top:18,width:504,height:1004,borderRadius:50,overflow:'hidden',background:'#14161B'}}>
   <div style={{position:'absolute',left:0,top:100,width:504,height:POSTH,overflow:'hidden'}}>
    <div style={{transform:`translateY(${-pos*POSTH}px)`}}>
     {POSTS.map((p,i)=><PostView key={i} p={p} cc={i===2?cc:undefined} heart={i===heartIdx?heartT:-1} dash={i===dashIdx} sel={i===selIdx}/>)}
    </div>
   </div>
   <div style={{position:'absolute',left:0,top:0,width:504,height:100,background:'#14161B'}}>
    <div style={{display:'flex',justifyContent:'space-between',padding:'16px 34px 0',fontFamily:INTER,fontSize:20,color:C.paper}}><span>9:41</span><span style={{display:'flex',gap:8,alignItems:'center'}}><span style={{width:26,height:14,border:'2px solid #F7F0E3',borderRadius:4,display:'inline-block',position:'relative'}}><span style={{position:'absolute',left:2,top:2,bottom:2,width:15,background:C.paper}}/></span></span></div>
    <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'12px 18px 0'}}><span style={{fontFamily:BEBAS,fontSize:34,letterSpacing:3,color:C.paper}}>INÍCIO</span><span style={{display:'flex',gap:20}}><Ic d={HEART} s={30}/><Ic d={PLN} s={30}/></span></div>
   </div>
   <div style={{position:'absolute',left:0,top:934,width:504,height:70,background:'#14161B',borderTop:'1px solid rgba(247,240,227,.15)',display:'flex',justifyContent:'space-around',alignItems:'center'}}>
    <Ic d="M3 11 12 3l9 8v10h-6v-6H9v6H3z" s={32}/><Ic d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14z M21 21l-5-5" s={32}/><Ic d="M4 4h16v16H4z M12 8v8 M8 12h8" s={32}/><Ic d="M5 4l14 8-14 8z" s={32}/><div style={{width:30,height:30,borderRadius:15,background:C.ocre}}/>
   </div>
   {notif>=0&&<div style={{position:'absolute',left:14,right:14,top:12+(1-E(notif,0,.35))*-120+E(notif,1.0,1.3)*-120,height:78,borderRadius:24,background:'rgba(44,46,54,.97)',display:'flex',alignItems:'center',gap:14,padding:'0 16px',boxShadow:'0 14px 30px rgba(0,0,0,.45)',fontFamily:INTER,color:C.paper}}>
    <Avatar col="#C46D45" l="U" s={46}/><div style={{lineHeight:1.2}}><div style={{fontSize:18}}>um.amigo publicou uma foto</div><div style={{fontSize:14,opacity:.6}}>agora</div></div></div>}
  </div>
 </div>;
};

const SAL='#9AA68B',PLUM1='#3A2230',PLUM2='#24141B';
const CASAD:Record<string,[number,number]>={casa:[2400,1488],casaescura:[1600,2400]};
const Bar:React.FC<{x:number;y:number;w:number;label:string;op:number;color?:string}>=({x,y,w,label,op,color=C.terra})=> op<=0?null:
 <div style={{position:'absolute',left:x,top:y,opacity:op}}><div style={{fontFamily:INTER,fontSize:26,letterSpacing:6,color:C.paper,marginBottom:8,background:'rgba(26,29,36,.88)',display:'inline-block',padding:'6px 14px',borderLeft:`6px solid ${color}`}}>{label}</div><div style={{height:34,width:w,background:color}}/></div>;

const Main:React.FC<{casa?:string}>=({casa='casa'})=>{
 const f=useCurrentFrame(); const t=f/FPS; const sc0=t<TC1?0:t<TC2?1:2;
 const [CW,CH]=CASAD[casa]; const cy=casa==='casa'?.5:.58;
 const gx=sc0===2?1260:100;
 // posições do feed
 const pos=kf(t,[[0,0],[14.3,0],[15.0,1],[15.9,1],[16.6,2],[40.6,2]]);
 const posA=t<40.6?pos:kf(t,[[40.6,2],[41.6,2],[43.4,3],[44.9,3],[45.9,4],[59.7,4],[60.4,3],[80,3]]);
 const cc=Math.round(L(t,18.56,19.9)*16);
 const heartT=t>15.3?t-15.3:-1;
 const kk=0;
 // fundos
 const bg=sc0===0?<AbsoluteFill style={{background:C.paper}}><div style={{position:'absolute',left:-220,top:560,width:760,height:760,borderRadius:760,background:SAL,opacity:.55}}/><div style={{position:'absolute',left:1500,top:-260,width:620,height:620,borderRadius:620,background:C.ocre,opacity:.35}}/></AbsoluteFill>
  :sc0===1?<AbsoluteFill style={{background:`linear-gradient(135deg,${C.terra},#A4532F)`}}><div style={{position:'absolute',left:-300,top:620,width:900,height:900,borderRadius:900,background:'#D88459',opacity:.35}}/></AbsoluteFill>
  :<AbsoluteFill style={{background:`linear-gradient(135deg,${PLUM1},${PLUM2})`}}><div style={{position:'absolute',left:1050,top:-380,width:900,height:900,borderRadius:900,background:C.terra,opacity:.18}}/></AbsoluteFill>;

 // ---- S12 ----
 const s12=sc0===0&&<>
  <Card src="img/noodles.jpg" W={1600} H={2400} x={1130} y={110} w={560} h={840} op={sc(t,1.6,5.95)} rot={2.5} fy={.55} z={1}/>
  {t>1.6&&t<6&&<div style={{position:'absolute',left:1090,top:90,width:560,height:840,background:C.terra,transform:'rotate(-3deg)',opacity:sc(t,1.6,5.95),zIndex:-1}}/>}
  <KW text="SOLTEIRO." t={t} a={2.11} b={2.75} x={110} y={300} size={230} font={BEBAS} color={C.night} plate={false}/>
  <KW text="TUDO BEM." t={t} a={2.8} b={3.65} x={110} y={300} size={230} font={BEBAS} color={C.terra} plate={false}/>
  <KW text="SEM DRAMA NENHUM" t={t} a={3.71} b={5.9} x={110} y={310} size={150} font={BEBAS} color={C.night} plate={false} stag={.06}/>
  <Tag x={110} y={620} text="PEDE COMIDA" op={sc(t,4.99,6.0,.2)} k={1.1}/>
  <Card src="img/cama.jpg" W={2400} H={1800} x={960} y={190} w={880} h={660} op={sc(t,5.95,9.3)} rot={-2}/>
  <KW text="DORME" t={t} a={6.19} b={6.95} x={110} y={290} size={230} font={BEBAS} color={C.night} plate={false}/>
  <KW text="NA CAMA INTEIRA" t={t} a={6.99} b={8.1} x={110} y={290} size={130} font={BEBAS} color={C.terra} plate={false} stag={.045}/>
  <Tag x={1000} y={880} text="CAMA INTEIRA" op={sc(t,7.23,9.2,.2)}/>
  <KW text="BANHO QUANDO QUER" t={t} a={8.19} b={9.3} x={110} y={290} size={120} font={BEBAS} color={C.night} plate={false} stag={.04}/>
  <Card src="img/boots.jpg" W={1600} H={2400} x={1210} y={90} w={520} h={800} op={sc(t,9.15,10.95)} rot={2} fy={.5}/>
  <KW text="SEGUE A SEMANA" t={t} a={9.39} b={10.9} x={110} y={290} size={150} font={BEBAS} color={C.night} plate={false} stag={.04}/>
  {['S','T','Q','Q','S','S','D'].map((d,i)=>{const o=sc(t,9.5+i*.07,10.95,.2);const on=t>9.6+i*.1;return <div key={i} style={{position:'absolute',left:110+i*105,top:560,width:88,height:88,borderRadius:20,opacity:o,background:on?C.terra:'transparent',border:`4px solid ${C.night}`,color:on?C.paper:C.night,fontFamily:BEBAS,fontSize:56,display:'flex',alignItems:'center',justifyContent:'center'}}>{d}</div>;})}
 </>;

 // ---- S13 ----
 const pOp=sc(t,10.95,20.6,.4);
 const zoom=E(t,18.3,19.3)*(1-E(t,20.1,20.6));
 const phone13=sc0===1&&<Phone x={1180-E(t,10.9,11.6)*0+(1-E(t,10.95,11.6))*500} y={20-zoom*120} s={.98+zoom*.32} rot={-2*(1-zoom)} op={pOp} ox={270} oy={820} pos={posA} cc={cc} heartT={heartT} notif={t>11.1?t-11.1:-1} selIdx={zoom>0?2:-1}/>;
 const house=(a:number,b:number,keys:K[])=><div style={{opacity:E(t,a,a+.6)*(1-E(t,b-.2,b))}}><Cam src={`img/${casa}.jpg`} W={CW} H={CH} keys={keys} t={t}/><Shade/></div>;
 const s13=sc0===1&&<>
  <KW text="UM AMIGO" t={t} a={11.41} b={20.0} x={110} y={230} size={200} font={BEBAS} color={C.paper} plate={false}/>
  <KW text="COMEÇA A NAMORAR" t={t} a={11.97} b={20.0} x={110} y={440} size={140} font={BEBAS} color={C.night} plate={false} stag={.04}/>
  <Tag x={110} y={700} text="1 · FOTO" op={sc(t,14.2,20.2,.2)}/>
  <Tag x={110} y={780} text="2 · JANTAR" op={sc(t,14.56,20.2,.2)}/>
  <Tag x={110} y={860} text="3 · POUSADA" op={sc(t,16.92,20.2,.2)}/>
  {phone13}
  {t>20.3&&house(20.3,40.59,casa==='casa'?[[20.3,1,.5,.5],[28,1.1,.5,.5],[40.6,1.2,.55,.5]]:[[20.3,1,.5,.5],[40.6,1.15,.5,.65]])}
  {t>20.3&&<>
   <Plate text="A SUA CASA CONTINUA IGUAL" t={t} a={22.24} b={23.7}/>
   <Tag x={1180} y={560} text="NA SUA CABEÇA" op={sc(t,23.72,31,.25)}/>
   {t>24.9&&t<31&&<>
    {[0,1,2].map(i=><div key={i} style={{position:'absolute',left:1120-i*70-10,top:470+i*55,width:34-i*8,height:34-i*8,borderRadius:40,background:C.paper,opacity:sc(t,24.8+i*.1,31,.2)}}/>)}
    <div style={{position:'absolute',left:1100,top:70,width:640,height:420,borderRadius:90,overflow:'hidden',border:`8px solid ${C.paper}`,opacity:sc(t,24.9,31,.3),transform:`scale(${.85+.15*E(t,24.9,25.3)})`,boxShadow:'0 30px 70px rgba(0,0,0,.5)'}}><Img src={staticFile('img/pousada.jpg')} style={{width:'100%',height:'100%',objectFit:'cover'}}/></div>
   </>}
   <Tag x={100} y={780} text="CINCO MINUTOS ANTES" op={sc(t,26.53,28,.2)}/>
   <Plate text="NEM SENTIA FALTA DE NADA" t={t} a={28.09} b={30.0}/>
   <Tag x={100} y={780} text="AGORA PARECE…" op={sc(t,30.06,31.3,.2)}/>
   <Plate text="A SUA VIDA PRECISA SE EXPLICAR" t={t} a={31.38} b={33.4}/>
   <KW text="E VOCÊ?" t={t} a={33.46} b={34.7} x={0} y={330} size={340} font={BEBAS} color={C.paper} italic plate={false} align="center"/>
   <Plate text="NINGUÉM TE PERGUNTOU ISSO" t={t} a={34.77} b={36.5}/>
   <Dots x={820} y={420} t={t} a={36.57} b={38.55}/>
   <Plate text="VOCÊ RESPONDE PRA VOCÊ MESMO" t={t} a={38.61} b={40.5}/>
  </>}
 </>;

 // ---- S14 ----
 const lap=sc(t,56.76,59.9,.5);
 const shr=E(t,56.76,57.4)*(1-E(t,59.7,60.3));
 const phone14=sc0===2&&<Phone x={lerp(170,1330,shr)} y={lerp(20,300,shr)} s={lerp(1,.55,shr)} op={(1-E(t,67.5,68.0))} ox={0} oy={0} pos={posA} dashIdx={t>59.75&&t<64?3:-1} heartT={-1}/>;
 const s14=sc0===2&&<>
  {t>56.6&&t<60&&<div style={{opacity:lap}}><Cam src="img/laptop.jpg" W={1928} H={2400} keys={[[56.7,1,.5,.45],[60,1.1,.5,.45]]} t={t} filter="brightness(.5)"/></div>}
  {phone14}
  <KW text="O CELULAR FACILITA" t={t} a={41.13} b={43.0} x={800} y={200} size={140} font={BEBAS} color={C.paper} plate={false}/>
  <Tag x={800} y={440} text="EX-COLEGA · GRÉCIA" op={sc(t,43.89,45.3,.2)}/>
  <Tag x={800} y={440} text="MENINA DA ESCOLA" op={sc(t,45.41,48.6,.2)}/>
  <Tag x={800} y={540} text="CASA NOVA" op={sc(t,47.77,49.4,.2)}/>
  <KW text="A VITRINE FICOU MAIOR" t={t} a={52.88} b={55.8} x={800} y={260} size={130} font={BEBAS} color={C.ocre} plate={false} stag={.04}/>
  <Tag x={800} y={560} text="EMPREGO NOVO" op={sc(t,55.96,56.9,.2)}/>
  <Tag x={100} y={300} text="FORA DA MOLDURA" op={sc(t,56.9,59.7,.2)}/>
  <Plate text="OS MESES MANDANDO CURRÍCULO" t={t} a={58.0} b={59.7} size={92}/>
  <KW text="SANTORINI" t={t} a={59.75} b={61.4} x={800} y={250} size={170} font={BEBAS} color={C.ocre} plate={false}/>
  <Tag x={800} y={500} text="SEM LEGENDA" op={sc(t,60.31,64.6,.2)}/>
  <KW text="VOCÊ VÊ" t={t} a={64.9} b={65.8} x={780} y={330} size={120} font={BEBAS} color={C.paper} plate={false}/>
  <KW text="20 SEGUNDOS" t={t} a={65.83} b={67.8} x={780} y={330} size={120} font={BEBAS} color={C.ocre} plate={false}/>
  <KW text="DA VIDA DE ALGUÉM" t={t} a={66.9} b={67.8} x={780} y={480} size={76} font={BEBAS} color={C.paper} plate={false}/>
  {t>64.8&&<Card src="img/morango.jpg" W={1348} H={2400} x={lerp(1400,1500,E(t,67.87,68.5))} y={lerp(110,570,E(t,67.87,68.5))} w={lerp(430,300,E(t,67.87,68.5))} h={lerp(860,420,E(t,67.87,68.5))} op={E(t,64.8,65.3)} rot={0} fx={.5} fy={.5} z={lerp(2.4,1,E(t,64.95,65.9))}/>}
  {t>67.8&&house(67.87,80,[[67.87,1.1,.5,.5],[74.3,1.2,.5,.5]])}
  {t>67.8&&<Card src="img/morango.jpg" W={1348} H={2400} x={1500} y={570} w={300} h={420} op={E(t,68.3,68.7)} z={1}/>}
  <Tag x={1450} y={510} text="20 SEGUNDOS" op={sc(t,68.5,71.1,.2)} k={.8}/>
  <Plate text="O DIA INTEIRO DA SUA VIDA" t={t} a={68.83} b={71.0}/>
  <Bar x={100} y={300} w={50} label="20 SEGUNDOS" op={E(t,71.17,71.6)}/>
  <Bar x={100} y={400} w={1000*E(t,71.5,72.6)} label="UM DIA INTEIRO" op={E(t,71.3,71.7)} color={C.ocre}/>
  <Plate text="ESSA CONTA NÃO FECHA POSITIVO" t={t} a={71.17} b={80} size={96}/>
 </>;

 return <AbsoluteFill><Fonts/>{bg}{s12}{s13}{s14}
  <Gauge x={gx} y={60} w={520} v={gv(t)} op={sc0===1&&t>20.3&&t<40.59?1:1}/>
  <WipeBar t={t} tc={TC1} color={C.terra}/><WipeBar t={t} tc={TC2} color={C.ocre}/>
 </AbsoluteFill>;
};
registerRoot(()=><>
 <Composition id="inveja-s12" component={Main} durationInFrames={DUR} fps={FPS} width={1920} height={1080} defaultProps={{casa:'casa'}}/>
 <Composition id="inveja-s12-b" component={Main} durationInFrames={DUR} fps={FPS} width={1920} height={1080} defaultProps={{casa:'casaescura'}}/>
</>);
