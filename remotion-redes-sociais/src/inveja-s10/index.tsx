import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Composition,Img,staticFile,registerRoot,delayRender,continueRender,useCurrentFrame} from 'remotion';

// S10 — A ferramenta e a dignidade (CTA 1). 1920x1080, 24 fps, 31,2 s. t=0 = 201,015 s na transcrição = 3:23,241 na linha do tempo (offset +2,226 s).
const C={night:'#1A1D24',paper:'#F7F0E3',terra:'#C46D45',ocre:'#DB9B5B',blue:'#8F9DA3'};
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(x:number)=>{const t=clamp(x);return t*t*(3-2*t);};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const L=(t:number,a:number,b:number)=>clamp((t-a)/(b-a));
const E=(t:number,a:number,b:number)=>ease((t-a)/(b-a));
const FPS=24,DUR=749;
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

// logo principal da Palavras (ícone + nome) em plaquinha, com entrada em mola; ai=true acrescenta "AI"
const LogoPlate:React.FC<{t:number;a:number;b:number;x:number;y:number;h?:number;ai?:boolean}>=({t,a,b,x,y,h=96,ai=false})=>{
 if(t<a||t>b+.4) return null; const u=back((t-a)/.5);const out=E(t,b,b+.3);
 return <div style={{position:'absolute',left:x,top:y,display:'flex',alignItems:'center',gap:h*.3,background:'rgba(26,29,36,.94)',padding:`${h*.2}px ${h*.4}px`,borderLeft:`${Math.max(8,h*.09)}px solid ${C.terra}`,opacity:clamp((t-a)/.12)*(1-out),transform:`translateY(${(1-u)*60}px) scale(${.8+.2*u})`,transformOrigin:'0 100%'}}>
  <Img src={staticFile('marca/palavras-logo-osso.svg')} style={{height:h,width:h*4,display:'block'}}/>
  {ai&&<div style={{fontFamily:BEBAS,fontSize:h*.95,lineHeight:1,color:C.terra,transform:`skewX(0deg) scale(${back((t-a-.3)/.4)})`}}>AI</div>}</div>;
};

const Film:React.FC=()=>{
 const f=useCurrentFrame(),t=f/FPS;
 const [handle]=useState(()=>delayRender('Fontes'));
 useEffect(()=>{Promise.all([document.fonts.load('200px PalBebas'),document.fonts.load('30px PalInter')]).then(()=>continueRender(handle));},[handle]);
 const pad=(n:number,k:number)=>String(Math.max(1,Math.min(k,n))).padStart(4,'0');

 // ---- cena 1: palavras.co — busca "inveja" e verbete (gravação real) ----
 const s1=E(t,0.0,.35)*(1-E(t,6.55,6.8)); // some quando entra a linha do tempo
 let srcFrame:string;
 if(t<2.95){const src=8+(t-.6)*(4.6/2.35);srcFrame=`pesq/a${pad(Math.floor((Math.max(src,8)-8)*24)+1,120)}.jpg`;}
 else {const src=12.6+(t-2.95)*1.4;srcFrame=`pesq/b${pad(Math.floor((Math.min(src,19)-12.5)*24)+1,156)}.jpg`;}
 const k1:K[]=[[0,1.0,.5,.5],[1.2,1.0,.5,.5],[2.0,2.1,.17,.06],[2.95,2.1,.17,.06],[3.6,1,.5,.5],[6.6,1.08,.5,.5]];
 // ---- cena 2: linha do tempo + videre ----
 const s2=E(t,6.3,6.8)*(1-E(t,10.2,10.5));
 const k2:K[]=[[6.3,1,.5,.5],[8.0,1,.5,.5],[9.0,2.4,.5,.36],[10.5,2.7,.54,.355]];
 // ---- cena 3: Palavras AI ----
 const s3=E(t,10.2,10.6)*(1-E(t,17.9,18.3));
 const k3:K[]=[[10.2,1,.5,.5],[11.3,1.5,.30,.30],[12.4,1.5,.30,.30],[12.9,2.1,.60,.46],[14.3,2.12,.60,.46],[17.0,2.3,.60,.46],[18.3,2.3,.60,.46]];
 const s4=E(t,17.8,18.3)*(1-E(t,20.0,20.4));
 const k4:K[]=[[17.8,1.0,.5,.5],[20.4,1.15,.45,.55]];
 // pausa: o trecho riscado fica borrado enquanto ele diz "dignidade"
 const blur=E(t,16.15,16.4)*(1-E(t,17.0,17.3));
 // ---- cena 5: "os dois" -> endereço ----
 const s5=E(t,20.0,20.5);
 const cardA=E(t,20.55,21.0), cardB=E(t,22.35,22.8);
 const merge=E(t,24.6,25.2);
 const addr='palavras',addrN=Math.floor((t-24.84)/.1);
 const coOp=E(t,26.0,26.3);
 const eyeP=E(t,29.4,30.0);

 return <AbsoluteFill style={{background:C.night,overflow:'hidden'}}>
 <style>{`@font-face{font-family:PalBebas;src:url('${staticFile('fonts/BebasNeue.woff2')}')}@font-face{font-family:PalInter;src:url('${staticFile('fonts/Inter-500.woff2')}')}`}</style>

 {t>=.0&&t<6.9&&<AbsoluteFill style={{opacity:s1}}>
  <Cam src={srcFrame} W={1920} H={1017} keys={k1} t={t}/>
  <Ripple x={560} y={135} t={t} a={1.15}/><Ripple x={560} y={135} t={t} a={1.4} r={60}/>
  <LogoPlate t={t} a={2.1} b={3.3} x={130} y={830} h={104}/>
  <KW text="o dicionário" t={t} a={3.0} b={4.2} x={130} y={850} size={96}/>
  <KW text="definições" t={t} a={4.34} b={5.4} x={130} y={850} size={110}/>
  <KW text="a história de cada palavra" t={t} a={5.5} b={6.7} x={130} y={850} size={84}/>
 </AbsoluteFill>}

 {t>=6.3&&t<10.6&&<AbsoluteFill style={{opacity:s2}}>
  <Cam src="img/tl.jpg" W={1918} H={1016} keys={k2} t={t} over={(S)=><>
   <Mark x={225} y={100} w={330} h={44} p={E(t,7.0,7.45)} S={S}/>
   <Mark x={1015} y={350} w={82} h={30} p={E(t,9.2,9.55)} S={S}/>
   <Mark x={990} y={318} w={105} h={30} p={E(t,9.7,10.0)} S={S} fill="rgba(196,109,69,.38)"/></>}/>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 50%,rgba(26,29,36,0) 55%,rgba(26,29,36,.45) 100%)'}}/>
  <Ripple x={260} y={130} t={t} a={7.0} r={70}/>
  <KW text="linha do tempo" t={t} a={7.2} b={8.3} x={130} y={860} size={120} font={BEBAS} stag={.045}/>
  <KW text="origem" t={t} a={8.0} b={8.45} x={130} y={860} size={110}/>
  {(()=>{const nodes=[['INVEJA',8.55],['INVIDIA',8.9],['INVIDERE',9.1],['VIDERE',9.27]];const out=1-E(t,10.1,10.4);
   return <div style={{position:'absolute',left:110,top:850,display:'flex',alignItems:'center',gap:18,opacity:out}}>{nodes.map(([n,a],k)=>{const u=back((t-(a as number))/.4);const last=k===3;const pulse=last?1+.06*Math.sin((t-9.27)*10)*E(t,9.27,9.6):1;
    return <React.Fragment key={k}>{k>0&&<div style={{fontFamily:BEBAS,fontSize:70,color:C.terra,opacity:clamp((t-(a as number))/.15),transform:`translateX(${(1-u)*-20}px)`}}>←</div>}
     <div style={{opacity:clamp((t-(a as number))/.12),transform:`translateY(${(1-u)*50}px) scale(${pulse}) skewX(${k>0?-10:0}deg)`,fontFamily:BEBAS,fontSize:last?118:84,color:last?C.terra:C.paper,background:'rgba(26,29,36,.94)',padding:'6px 22px 2px',borderBottom:`8px solid ${last?C.terra:'rgba(247,240,227,.35)'}`}}>{n}</div></React.Fragment>;})}
    {t>9.6&&<span style={{fontFamily:INTER,fontStyle:'italic',fontSize:64,color:C.paper,opacity:E(t,9.6,9.85),background:'rgba(26,29,36,.92)',padding:'4px 20px',transform:`translateX(${(1-back((t-9.6)/.45))*-40}px)`}}>(ver)</span>}</div>;})()}
 </AbsoluteFill>}

 {t>=10.2&&t<18.4&&<AbsoluteFill style={{opacity:s3}}>
  <Cam src="img/ai1.jpg" W={1280} H={720} keys={k3} t={t} over={(S)=><>
   <Mark x={500} y={218} w={168} h={26} p={E(t,11.7,12.2)} S={S}/>
   <Mark x={702} y={327} w={162} h={26} p={E(t,12.85,13.4)} S={S} fill="rgba(196,109,69,.3)"/>
   {blur>0&&<div style={{position:'absolute',left:415,top:318,width:740,height:46,backdropFilter:`blur(${blur*9}px)`,background:`rgba(26,29,36,${blur*.35})`,borderRadius:6}}/>}</>}/>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 50%,rgba(26,29,36,0) 50%,rgba(26,29,36,.55) 100%)'}}/>
  <Cursor t={t} keys={k3} W={1280} H={720} op={(1-E(t,16.0,16.25))*(E(t,10.9,11.1))} path={[[10.9,700,150],[11.65,520,231],[12.55,520,231],[12.95,770,340],[16.0,780,342],[16.1,780,342]]}/>
  {(()=>{const p=scr(k3,1280,720,t,584,231);return <Ripple x={p.x} y={p.y} t={t} a={11.7}/>;})()}
  {(()=>{const p=scr(k3,1280,720,t,780,340);return <><Ripple x={p.x} y={p.y} t={t} a={12.95}/><Ripple x={p.x} y={p.y} t={t} a={13.2} r={50}/></>;})()}
  <LogoPlate t={t} a={11.1} b={12.6} x={130} y={830} h={104} ai/>
  <KW text="uns erros meus" t={t} a={12.6} b={14.2} x={130} y={850} size={100}/>
  {(()=>{const p=scr(k3,1280,720,t,690,200);return <KW text="ele?" t={t} a={11.75} b={12.8} x={p.x} y={p.y-70} size={96} font={BEBAS} stag={.06} italic/>;})()}
  <KW text="estilisticamente pior" t={t} a={13.05} b={14.3} x={110} y={150} size={72} color={C.terra} italic/>
  {(()=>{const p=scr(k3,1280,720,t,790,342);const pr=E(t,14.3,14.5)*(1-E(t,16.1,16.3));const z=1+.18*Math.sin((t-14.3)*5);
   return pr>0?<div style={{position:'absolute',left:p.x-210,top:p.y-62,width:420,height:124,borderRadius:62,border:`5px solid ${C.terra}`,opacity:pr*.9,transform:`scale(${z})`}}/>:null;})()}
  <Dots x={1330} y={380} t={t} a={14.45} b={16.2}/>
 </AbsoluteFill>}

 {t>=17.8&&t<20.5&&<AbsoluteFill style={{opacity:s4}}>
  <Cam src="img/ai2.jpg" W={1280} H={720} keys={k4} t={t}/>
  <AbsoluteFill style={{background:'linear-gradient(90deg,rgba(26,29,36,0) 45%,rgba(26,29,36,.92) 75%)'}}/>
  {[['01','"ELE" AMBÍGUO','mim e ele',18.3],['02','APONTA × DEDO','encosta o dedo nela',18.85],['03','ANÁFORA','talvez seja… talvez seja…',19.4]].map(([n,s,sub,a],i)=>{const o=E(t,a as number,(a as number)+.25);const u=back((t-(a as number))/.5);return o<=0?null:
   <div key={i} style={{position:'absolute',left:1440,top:290+i*165,opacity:o,transform:`translateX(${(1-u)*160}px) rotate(${(1-u)*4}deg)`,display:'flex',alignItems:'center',gap:22}}>
    <div style={{position:'absolute',left:118,top:96,fontFamily:INTER,fontStyle:'italic',fontSize:26,color:C.ocre,opacity:E(t,(a as number)+.3,(a as number)+.55),whiteSpace:'nowrap'}}>{sub as string}</div>
    <svg style={{position:'absolute',left:-70,top:14}} width="56" height="56" viewBox="0 0 56 56"><circle cx="28" cy="28" r="24" fill="none" stroke={C.terra} strokeWidth="5" pathLength={1} strokeDasharray="1" strokeDashoffset={1-E(t,(a as number)+.2,(a as number)+.5)}/><path d="M15 29L25 39L42 18" fill="none" stroke={C.paper} strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1-E(t,(a as number)+.45,(a as number)+.7)}/></svg>
    <div style={{fontFamily:BEBAS,fontSize:90,color:C.terra,lineHeight:1}}>{n}</div>
    <div style={{fontFamily:INTER,fontSize:28,letterSpacing:3,whiteSpace:'nowrap',color:C.paper,background:'rgba(26,29,36,.85)',padding:'10px 16px',borderLeft:`6px solid ${C.terra}`}}>{s}</div></div>;})}
 </AbsoluteFill>}

 {t>=20.0&&<AbsoluteFill style={{opacity:s5}}>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 45%,#262b36 0%,#1A1D24 70%)'}}/>
  {/* dois cartões reais, que se aproximam e dão lugar ao endereço */}
  <Card src="img/top.jpg" W={1920} H={1017} x={lerp(70,640,merge)} y={lerp(300,300,merge)} w={lerp(830,640,merge)} h={lerp(470,360,merge)} op={cardA*(1-merge)} rot={lerp(-2,0,merge)+Math.sin(t*2.2)*.8}/>
  <Card src="img/ai3.jpg" W={1280} H={720} x={lerp(1020,640,merge)} y={lerp(300,300,merge)} w={lerp(830,640,merge)} h={lerp(470,360,merge)} op={cardB*(1-merge)} rot={lerp(2,0,merge)-Math.sin(t*2.2)*.8}/>
  <Tag x={70} y={235} text="DICIONÁRIO" op={cardA*(1-merge)}/>
  <LogoPlate t={t} a={22.4} b={24.5} x={1020} y={205} h={52} ai/>
  <KW text="investigar uma palavra" t={t} a={20.7} b={24.5} x={70} y={800} size={50} plate={false} color={C.ocre}/>
  <KW text="tirar uma dúvida de português" t={t} a={22.5} b={24.5} x={1020} y={800} size={50} plate={false} color={C.ocre}/>
  <div style={{position:'absolute',left:925,top:460+Math.sin(t*6)*6,fontFamily:BEBAS,fontSize:170,lineHeight:1,color:C.terra,opacity:E(t,23.5,23.8)*(1-merge),transform:`scale(${back((t-23.5)/.5)}) rotate(${(1-back((t-23.5)/.5))*90}deg)`}}>+</div>
  {/* endereço */}
  {t>=24.84&&(()=>{const h=300,lw=h*4,u=back((t-24.84)/.6);const wipe=E(t,24.84,25.6);const cu=back((t-26.0)/.5);const total=lw+400;
   return <div style={{position:'absolute',left:960-total/2+100,top:430,display:'flex',alignItems:'flex-end'}}>
    <div style={{width:lw,height:h,clipPath:`inset(0 ${(1-wipe)*100}% 0 0)`,transform:`scale(${.85+.15*u})`,transformOrigin:'0 100%'}}><Img src={staticFile('marca/palavras-logo-osso.svg')} style={{width:lw,height:h,display:'block'}}/></div>
    <div style={{fontFamily:BEBAS,fontSize:190,lineHeight:1,color:C.terra,marginBottom:h*.283-26,marginLeft:-6,opacity:coOp,transform:`translateX(${(1-cu)*200}px) rotate(${(1-cu)*-8}deg)`}}>.co</div></div>;})()}
  {(()=>{const u=E(t,28.2,28.9);return u>0&&<div style={{position:'absolute',left:560,top:735,width:800*u,height:8,background:C.terra}}/>;})()}
  <KW text="a conta é grátis" t={t} a={26.55} b={99} x={0} y={780} size={64} color={C.terra} plate={false} align="center" stag={.04}/>
  <Ripple x={960} y={600} t={t} a={26.3} r={260}/>
  {/* olho (bons olhos) */}
  {eyeP>0&&<div style={{position:'absolute',left:810,top:110,width:300,height:300,borderRadius:150,overflow:'hidden',opacity:eyeP,transform:`scale(${(.6+.4*eyeP)*1}) scaleY(${1-.92*Math.max(Math.max(0,1-Math.abs(t-29.95)/.12),Math.max(0,1-Math.abs(t-30.6)/.12))})`,boxShadow:`0 0 0 6px ${C.terra}`}}>
   <Img src={staticFile('img/olho.jpg')} style={{position:'absolute',left:-282,top:-482,width:900,maxWidth:'none',transform:`scale(${1+.15*L(t,29.4,31.2)})`,transformOrigin:'48% 52.7%'}}/></div>}
  <KW text="de preferência" t={t} a={30.3} b={99} x={0} y={905} size={52} color={C.paper} plate={false} align="center" stag={.045} italic/>
 </AbsoluteFill>}
 </AbsoluteFill>;
};
registerRoot(()=> <Composition id="inveja-s10" component={Film} width={1920} height={1080} fps={FPS} durationInFrames={DUR}/>);
