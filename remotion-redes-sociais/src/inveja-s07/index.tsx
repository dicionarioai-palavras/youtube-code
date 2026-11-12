import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Composition,Img,staticFile,registerRoot,delayRender,continueRender,useCurrentFrame} from 'remotion';

// S07 — O olho dentro da palavra.
// t=0 é o "A" de "A palavra..." (101,25 s na transcrição do Premiere da narração v5; 1:43,75 na linha do tempo com a abertura de 2,5 s).
// Termina em "...qualquer pessoa" (133,70 s na v5 = 2:16,20 na linha do tempo). Duração: 32,45 s.
// Cada cue = início da palavra na transcrição menos ~0,10 s de antecipação, para a animação "pousar" na palavra.
const C={night:'#1A1D24',paper:'#F7F0E3',terra:'#C46D45',blue:'#8F9DA3'};
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const ease=(x:number)=>{const t=clamp(x);return t*t*(3-2*t);};
const lerp=(a:number,b:number,t:number)=>a+(b-a)*t;
const FPS=24, DUR=779, TEND=DUR/FPS;

// ---- cues (s, relativos ao "A" de "A palavra") ----
const K={
 invejaIn:.72,        // "inveja" (0,80)
 latim:1.82,          // "latim" (1.92)
 dock:[1.55,.9],
 toInvidia:2.42,      // "invidia" (2.52)
 invidiaFlash:4.18,   // "E invidia é ligada" (4.28)
 toInvidere:5.90,     // "invidere" (6.00)
 glossStart:8.0,      // "olhar com hostilidade" (8.08–10.2)
 glossStep:.10,
 latimOut:10.3,
 rectIn:10.38,        // "dentro" (10.48)
 inDim:12.0,          // "tem outra palavra" (12.04)
 rectSlide:12.5,      // "outra palavra"
 videre:14.0,         // "videre" (14.08)
 inGone:15.5,         // "significa" (15.60)
 toVer:16.38,         // "ver" (16.48)
 caption:17.5,        // "Ou seja" (17.60)
 inveja2:18.58,       // "a inveja" (18.68)
 barDraw:19.02,       // "começa" (19.12)
 barToIris:19.55,     // "no seu olhar" (olhar 20.12)
 dot:20.05,
 groupOut:20.75,      // fim de "olhar"
 portugues:22.35,     // "português" (22.45)
 gordo:[23.83,24.71], // "olho gordo" (23.93)
 grande:[24.71,25.95],// "olho grande" (24.81)
 botar:[25.95,28.75], // "botar olho" (26.05)
 thing:27.20,         // "em alguma coisa" (27.29)
 thingOut:28.90,
 barOut:28.75,
 olharPulse:29.80,    // "olhar" (29.80)
 dots:30.06,          // "não vai" (30.16)
 pick:31.55,          // "pessoa" (31.60)
};

// ---------- foto (3072x4096) com zoom constante no olho ----------
const SW=3072,SH=4096,INX=.5125,INY=.52,IRIS=225;
const LY=560;
const sc=(t:number)=>.62*Math.exp(Math.log(1.85)/TEND*t);
const anc=(t:number)=>({x:lerp(1340,1290,t/TEND),y:LY});

// ---------- medição tipográfica ----------
let ctx:any=null;const bw:Record<string,number>={};let FONT_OK=false;
const mw=(ch:string,F:number)=>{
 if(!FONT_OK) return .4*F;
 if(bw[ch]===undefined){ if(!ctx) ctx=document.createElement('canvas').getContext('2d'); ctx.font='200px PalBebas'; bw[ch]=ctx.measureText(ch).width/200; }
 return bw[ch]*F+4*F/270;
};

// ---------- fatias da palavra: INVEJA→INVIDIA→INVIDERE→VIDERE→VER ----------
type Slot={s:[string,number][];app?:number;van?:number};
const SLOTS:Slot[]=[
 {s:[['I',0]],van:K.inGone},
 {s:[['N',0]],van:K.inGone},
 {s:[['V',0]]},
 {s:[['E',0],['I',K.toInvidia]],van:K.toVer},
 {s:[['J',0],['D',K.toInvidia+.10]],van:K.toVer+.05},
 {s:[['A',0],['I',K.toInvidia+.20],['E',K.toInvidere]]},
 {s:[['A',K.toInvidia+.30],['R',K.toInvidere+.10]],app:K.toInvidia+.30},
 {s:[['E',K.toInvidere+.20]],app:K.toInvidere+.20,van:K.toVer+.10},
];
const TR=.30;
const slotInfo=(sl:Slot,t:number,F:number)=>{
 let k=0;for(let i=0;i<sl.s.length;i++) if(t>=sl.s[i][1]) k=i;
 const cur=sl.s[k][0];let prev=cur,p=1;
 if(k>0){prev=sl.s[k-1][0];p=ease((t-sl.s[k][1])/TR);}
 const pres=(sl.app!==undefined?ease((t-sl.app)/.35):1)*(sl.van!==undefined?1-ease((t-sl.van)/.5):1);
 const w=lerp(mw(prev,F),mw(cur,F),p)*pres;
 const lastChange=k>0?sl.s[k][1]:-99;
 return {cur,prev,p,pres,w,lastChange};
};

const Film:React.FC=()=>{
 const f=useCurrentFrame(),t=f/FPS;
 const [ready,setReady]=useState(false);
 const [handle]=useState(()=>delayRender('Fontes Palavras'));
 useEffect(()=>{Promise.all([document.fonts.load('270px PalBebas'),document.fonts.load('24px PalInter')]).then(()=>{FONT_OK=true;setReady(true);continueRender(handle);});},[handle]);

 const s=sc(t),a=anc(t);
 const imgW=SW*s,imgH=SH*s;
 const dim=lerp(.88,.30,ease(t/4.5));
 const irisR=IRIS*s;

 // ---- grupo da palavra ----
 const d=ease((t-K.dock[0])/K.dock[1]);
 const F0=lerp(270,216,d), L=lerp(420,180,d), U=lerp(665,560,d);
 const top0=U-F0-25*(F0/270);
 const e=ease((t-K.caption)/.65);
 const F=t<K.caption?F0:lerp(216,84,e);
 const top=t<K.caption?top0:lerp(top0,205,e);
 const groupOp=1-ease((t-K.groupOut)/.4);

 let x=L;const lay=SLOTS.map((sl,i)=>{const inf=slotInfo(sl,t,F);const o={...inf,x};x+=inf.w;return o;});
 const wordW=x-L;
 const inDim=lerp(1,.28,ease((t-K.inDim)/.4));

 // retângulo "dentro de invidere tem outra palavra"
 const firstV=lay[2].x, firstAll=lay[0].x;
 const rectL=lerp(firstAll,firstV,ease((t-K.rectSlide)/.9))-22*(F/216);
 const lastIdx=lay.reduce((m,o,i)=>o.pres>.05?i:m,0);
 const rectR=lay[lastIdx].x+lay[lastIdx].w+22*(F/216);
 const rectOp=ease((t-K.rectIn)/.2)*(1-ease((t-K.caption)/.4));
 const rectDraw=ease((t-K.rectIn)/.8);
 const rectTop=top+.10*F, rectH=.88*F;

 const latimOp=ease((t-K.latim)/.3)*(1-ease((t-K.latimOut)/.4));
 const glossFull='OLHAR COM HOSTILIDADE';
 const glossN=Math.max(0,Math.min(glossFull.length,Math.floor((t-K.glossStart)/K.glossStep)));
 const glossOp=1-ease((t-K.latimOut)/.4);
 const ulOp=1-ease((t-K.rectIn-.1)/.35);
 const ulW=wordW*ease((t-1.0)/.6);

 // INVEJA (segunda vez)
 const invF=216,invTop=U-invF-25*(invF/270);
 const invLetters='INVEJA'.split('');
 let ix=180;const invPos=invLetters.map(ch=>{const o=ix;ix+=mw(ch,invF);return o;});
 const invW=ix-180;

 // linha do olhar
 const barDraw=ease((t-K.barDraw)/.5)*invW;
 const toIris=ease((t-K.barToIris)/.65);
 const barEnd=lerp(180+invW,a.x,toIris);
 const barLen=t<K.barToIris?barDraw:barEnd-180;
 const barOp=t<K.dot+.4?1:lerp(1,.5,ease((t-(K.dot+.4))/.5));
 const barFade=1-ease((t-K.barOut)/.4);
 const dotOp=ease((t-K.dot)/.2)*(1-ease((t-K.barOut)/.4));

 const pulse=(t0:number)=>{const q=(t-t0)/.8;return q<0||q>1?null:{r:irisR*(1+.7*q),o:.9*(1-q)};};
 const pulses=[K.dot,23.93,24.81,26.05,K.olharPulse].map(pulse).filter(Boolean) as {r:number;o:number}[];

 const EXP:[string,number,number][]=[['OLHO GORDO',K.gordo[0],K.gordo[1]],['OLHO GRANDE',K.grande[0],K.grande[1]],['BOTAR OLHO',K.botar[0],K.botar[1]]];
 const EF=190;
 const portN=Math.max(0,Math.min(9,Math.floor((t-K.portugues)/.07)));
 const portOp=ease((t-K.portugues)/.2)*(1-ease((t-K.barOut)/.4));

 // "alguma coisa" / "qualquer pessoa"
 const thing=ease((t-K.thing)/.5)*(1-ease((t-K.thingOut)/.35));
 const thingX=lerp(a.x,1700,ease((t-K.thing)/.7));
 const DOTS:[number,number][]=[[1520,250],[1700,330],[1810,450],[1760,690],[1690,800],[1560,890],[1480,380],[1470,740]];
 const CHOSEN:[number,number]=[1810,560];
 const dotsIn=(i:number)=>ease((t-(K.dots+i*.07))/.3);
 const picked=t>=K.pick;
 const dimOthers=1-.8*ease((t-K.pick)/.3);
 const shootX=lerp(a.x,2010,ease((t-K.pick)/.45));
 const chosenX=lerp(CHOSEN[0],1895,ease((t-K.pick-.05)/.45));
 const stub=ease((t-K.olharPulse)/.4);

 return <AbsoluteFill style={{background:C.night,overflow:'hidden'}}>
 <style>{`@font-face{font-family:PalBebas;src:url('${staticFile('fonts/BebasNeue.woff2')}')}@font-face{font-family:PalInter;src:url('${staticFile('fonts/Inter-500.woff2')}')}`}</style>

 <AbsoluteFill style={{WebkitMaskImage:'linear-gradient(90deg,rgba(0,0,0,0) 0px,rgba(0,0,0,0) 200px,rgba(0,0,0,1) 760px)'}}>
  <Img src={staticFile('olho.jpg')} style={{position:'absolute',left:a.x-INX*imgW,top:a.y-INY*imgH,width:imgW,height:imgH,filter:'saturate(.92)'}}/>
 </AbsoluteFill>
 <AbsoluteFill style={{background:C.night,opacity:dim}}/>
 <AbsoluteFill style={{background:'linear-gradient(90deg,rgba(26,29,36,.94) 0%,rgba(26,29,36,.78) 30%,rgba(26,29,36,0) 62%)'}}/>
 <AbsoluteFill style={{background:'radial-gradient(ellipse at 66% 52%,rgba(26,29,36,0) 42%,rgba(26,29,36,.55) 100%)'}}/>

 {ready&&<>
 {ulOp>0&&ulW>0&&<div style={{position:'absolute',left:L,top:U,width:ulW,height:7,background:C.terra,opacity:ulOp}}/>}
 {latimOp>0&&<div style={{position:'absolute',left:L+2,top:top-58,fontFamily:'PalInter',fontSize:30,letterSpacing:8,color:C.terra,opacity:latimOp}}>LATIM</div>}
 <div style={{position:'absolute',left:0,top:0,opacity:groupOp}}>
  {lay.map((o,i)=>{
   if(o.pres<.01) return null;
   const rev=i<6?ease((t-K.invejaIn-i*.055)/.2):1;
   if(rev<=0) return null;
   const inVid=i>=2;
   const vidT=K.videre+(i-2)*.06;
   const hlRecent=1-ease((t-o.lastChange-.3)/1.2);
   const flash=(t>=K.invidiaFlash&&t<K.invidiaFlash+1)?1-ease((t-K.invidiaFlash-.3)/.7):0;
   const toVid=inVid?ease((t-vidT)/.25):0;
   const revHi=rev<.98?1:0;
   const mix=Math.max(toVid,t>=K.videre?0:hlRecent*(o.lastChange>0?1:0),flash,revHi);
   const col=mix>.5?C.terra:C.paper;
   const opIn=(i<2?inDim:1)*o.pres*rev;
   return <div key={i} style={{position:'absolute',left:o.x,top:top+(1-rev)*26,fontFamily:'PalBebas',fontSize:F,lineHeight:1,height:F,opacity:opIn,whiteSpace:'nowrap',transform:`rotate(${(1-rev)*-6}deg)`}}>
    {o.p<1&&<span style={{position:'absolute',left:0,top:0,color:col,opacity:1-o.p,transform:`translateY(${-o.p*.35*F}px)`}}>{o.prev}</span>}
    <span style={{position:'absolute',left:0,top:0,color:col,opacity:o.p<1?o.p:1,transform:`translateY(${(1-o.p)*.35*F}px)`}}>{o.cur}</span>
   </div>;
  })}
  {rectOp>0&&<svg style={{position:'absolute',inset:0,opacity:rectOp}} width="1920" height="1080"><rect x={rectL} y={rectTop} width={rectR-rectL} height={rectH} rx="10" fill="none" stroke={C.terra} strokeWidth="4" pathLength={1} strokeDasharray="1" strokeDashoffset={1-rectDraw}/></svg>}
  {glossN>0&&<div style={{position:'absolute',left:L+2,top:U+34,fontFamily:'PalInter',fontSize:40,letterSpacing:6,whiteSpace:'nowrap',color:C.paper,opacity:glossOp}}>{glossFull.slice(0,glossN)}</div>}
 </div>
 {t>=K.inveja2-.02&&<div style={{position:'absolute',left:180,top:invTop,fontFamily:'PalBebas',fontSize:invF,lineHeight:1,height:invF,opacity:groupOp}}>
  {invLetters.map((ch,i)=>{const ai=ease((t-K.inveja2-i*.055)/.2);return <span key={i} style={{position:'absolute',left:invPos[i]-180,top:0,opacity:ai,transform:`translateY(${(1-ai)*26}px) rotate(${(1-ai)*-6}deg)`,color:ai<.98?C.terra:C.paper}}>{ch}</span>;})}
 </div>}
 {portOp>0&&<div style={{position:'absolute',left:182,top:LY-EF-22-58,fontFamily:'PalInter',fontSize:30,letterSpacing:8,color:C.terra,opacity:portOp}}>{'PORTUGUÊS'.slice(0,portN)}</div>}
 {EXP.map(([txt,t0,t1],k)=>{
  const on=t>=t0&&t<t1+.3; if(!on) return null;
  const out=1-ease((t-t1)/.2);
  return <div key={k} style={{position:'absolute',left:180,top:LY-EF-22,fontFamily:'PalBebas',fontSize:EF,lineHeight:1,height:EF,display:'flex',whiteSpace:'pre',opacity:out*barFade}}>
   {txt.split('').map((ch,i)=>{const ai=ease((t-t0-i*.03)/.15);return <span key={i} style={{display:'inline-block',opacity:ai,transform:`translateY(${(1-ai)*22}px)`,color:C.paper}}>{ch}</span>;})}
  </div>;
 })}

 <svg style={{position:'absolute',inset:0}} width="1920" height="1080">
  {t>=K.barDraw&&barFade>0&&<rect x={180} y={LY} width={Math.max(0,barLen)} height={7} fill={C.terra} opacity={barOp*barFade*groupOp0(t)}/>}
  {dotOp>0&&<circle cx={a.x} cy={a.y} r={11} fill={C.terra} opacity={dotOp}/>}
  {pulses.map((p,i)=><circle key={i} cx={a.x} cy={a.y} r={p.r} fill="none" stroke={C.terra} strokeWidth="4" opacity={p.o}/>)}
  {thing>0&&<><line x1={a.x} y1={a.y} x2={thingX} y2={a.y} stroke={C.terra} strokeWidth="5" opacity={thing}/><circle cx={1700} cy={a.y} r={22} fill="none" stroke={C.paper} strokeWidth="4" opacity={thing*ease((t-K.thing-.1)/.3)}/></>}
  {DOTS.map(([dx,dy],i)=><circle key={i} cx={dx} cy={dy} r={19} fill="none" stroke={C.paper} strokeWidth="4" opacity={dotsIn(i)*.9*dimOthers}/>)}
  {t>=K.dots&&<circle cx={chosenX} cy={CHOSEN[1]} r={picked?20:19} fill={picked?C.terra:'none'} stroke={picked?C.terra:C.paper} strokeWidth="4" opacity={dotsIn(7.5)*.95}/>}
  {stub>0&&!picked&&<line x1={a.x} y1={a.y} x2={lerp(a.x,a.x+170,stub)} y2={a.y} stroke={C.terra} strokeWidth="4" opacity=".55"/>}
  {picked&&<line x1={a.x} y1={a.y} x2={Math.min(shootX,2010)} y2={a.y} stroke={C.terra} strokeWidth="5"/>}
 </svg>
 </>}
 </AbsoluteFill>;
};
const groupOp0=(_t:number)=>1;
registerRoot(()=> <Composition id="inveja-s07" component={Film} width={1920} height={1080} fps={FPS} durationInFrames={DUR}/>);
