import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Composition,Img,staticFile,registerRoot,delayRender,continueRender,useCurrentFrame} from 'remotion';
const C={night:'#1A1D24',paper:'#F7F0E3',terra:'#C46D45',blue:'#8F9DA3'};
const ease=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const Film:React.FC=()=>{
 const f=useCurrentFrame(),t=f/24;
 const [handle]=useState(()=>delayRender('Fontes Palavras'));useEffect(()=>{Promise.all([document.fonts.load('270px PalBebas'),document.fonts.load('24px PalInter')]).then(()=>continueRender(handle));},[handle]);
 const hotelEnd=3.70,compareStart=7.495,wordStart=13.995;
 const hotel=t<hotelEnd;
 const compare=ease((t-compareStart)/.7);
 const photoExit=1-ease((t-wordStart)/.35);
 const rise=ease((t-8.015)/1.0),difference=ease((t-10.455)/1.45);
 const y1=765-305*rise+110*difference,y2=765-305*rise-110*difference;
 const graph=ease((t-7.8)/.45)*(1-ease((t-wordStart)/.22));
 return <AbsoluteFill style={{background:C.night,overflow:'hidden'}}>
 <style>{`@font-face{font-family:PalBebas;src:url('${staticFile('fonts/BebasNeue.woff2')}')}@font-face{font-family:PalInter;src:url('${staticFile('fonts/Inter-500.woff2')}')}`}</style>
 {hotel?<>
 <AbsoluteFill style={{transform:`scale(${1.072+.428*clamp(t/hotelEnd)})`,transformOrigin:'51% 55%'}}><Img src={staticFile('inveja-s06/copacabana.jpg')} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'50% 55%'}}/></AbsoluteFill>
 <AbsoluteFill style={{background:C.night,opacity:.17}}/><AbsoluteFill style={{background:'linear-gradient(0deg,#1A1D2477,transparent 55%)'}}/>
 </>:<>
 <AbsoluteFill style={{opacity:photoExit}}><Img src={staticFile('inveja-s06/almoco.png')} style={{width:'100%',height:'100%',objectFit:'cover',transform:`scale(${1.12+.11*clamp((t-hotelEnd)/(wordStart-hotelEnd))})`,transformOrigin:'50% 60%',filter:`blur(${7*compare}px)`}}/><AbsoluteFill style={{background:C.night,opacity:.30+.56*compare}}/></AbsoluteFill>
 <svg style={{position:'absolute',inset:0,opacity:(1-compare)*ease((t-4.0)/.45)*(1-ease((t-6.7)/.5))}} width="1920" height="1080"><path d="M1175 600Q1280 500 1390 590" fill="none" stroke={C.terra} strokeWidth="5" opacity=".85" pathLength="1" strokeDasharray="1" strokeDashoffset={1-ease((t-4.0)/.8)}/><path d="M1373 574L1390 590 1369 596" fill="none" stroke={C.terra} strokeWidth="5" opacity={ease((t-4.6)/.2)}/></svg>
 <svg style={{position:'absolute',inset:0,opacity:graph}} width="1920" height="1080"><path d="M425 810H1510" stroke={C.blue} strokeWidth="2" opacity=".4"/>{[y1,y2].map((y,i)=><g key={i}><path d={`M${540+i*640} 765V${y}`} stroke={i?C.terra:C.paper} strokeWidth="8" strokeLinecap="round"/><circle cx={540+i*640} cy={y} r="27" fill={i?C.terra:C.paper}/></g>)}<g opacity={difference}><path d={`M540 ${y1}H1180`} stroke={C.blue} strokeWidth="2" strokeDasharray="9 15" opacity=".5"/><path d={`M1260 ${y2}V${y1}M1243 ${y2}H1277M1243 ${y1}H1277`} stroke={C.terra} strokeWidth="5"/><path d="M464 882H615" stroke={C.terra} strokeWidth="5"/></g></svg>
 </>}
 {t>=wordStart&&<div style={{position:'absolute',left:420,top:370,width:1080,height:340}}><div style={{fontFamily:'PalBebas',fontSize:270,letterSpacing:4,lineHeight:1,display:'flex',alignItems:'baseline'}}>{'INVEJA'.split('').map((letter,i)=>{const a=ease((t-15.235-i*.055)/.20);return <span key={i} style={{display:'inline-block',opacity:a,transform:`translateY(${(1-a)*26}px) rotate(${(1-a)*-6}deg) scale(${.94+.06*a})`,color:a<.98?C.terra:C.paper}}>{letter}</span>;})}</div><div style={{height:7,width:620*ease((t-15.65)/.60),background:C.terra,marginTop:25}}/><div style={{position:'absolute',left:622,top:254,width:10,height:10,borderRadius:10,background:C.terra,opacity:ease((t-16.35)/.30)}}/></div>}
 </AbsoluteFill>;
};
registerRoot(()=> <Composition id="inveja-s06-final" component={Film} width={1920} height={1080} fps={24} durationInFrames={453}/>);

