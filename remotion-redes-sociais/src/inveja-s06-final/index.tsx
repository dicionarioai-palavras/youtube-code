import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Composition,Img,staticFile,registerRoot,delayRender,continueRender,useCurrentFrame} from 'remotion';
const C={night:'#1A1D24',paper:'#F7F0E3',terra:'#C46D45',blue:'#8F9DA3'};
const goddess='M650 604 Q680 600 696 640 L711 701 724 764 740 784 744 741 758 711 769 641 783 637 796 701 817 730 821 783 810 825 807 894 819 925 836 952 830 965 804 950 791 936 781 985 791 1062 779 1163 773 1270 778 1375 768 1413 777 1434 766 1455 708 1470 567 1469 480 1448 469 1422 473 1382 485 1321 493 1210 503 1138 516 1105 502 1088 488 1085 485 1044 491 1006 499 957 506 903 520 849 536 801 562 774 577 739 586 674 603 633 Q624 604 650 604 Z';
const Statue=()=> <svg viewBox="455 590 390 890" style={{position:'absolute',left:1280,top:100,width:245,height:560,filter:'drop-shadow(0 10px 14px #10111788)'}}><defs><clipPath id="statue"><path clipRule="evenodd" fillRule="evenodd" d={goddess+' M514 1103 L552 1103 L526 1225 L509 1335 L497 1383 L489 1383 L504 1210 Z'}/></clipPath></defs><image href={staticFile('inveja-s06/fortuna.jpg')} width="1221" height="2048" clipPath="url(#statue)"/></svg>;
const Money=()=> <svg viewBox="25 725 1090 910" style={{position:'absolute',left:1270,top:650,width:280,height:234,filter:'drop-shadow(0 7px 10px #10111788)'}}><defs><filter id="green" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 6 -12 6 0 1.4" result="key"/><feComposite in="key" in2="SourceAlpha" operator="in"/></filter></defs><image href={staticFile('inveja-s06/dinheiro.jpg')} width="1152" height="2048" filter="url(#green)"/></svg>;

const ease=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};
const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const Cat:React.FC<{time:number}>=({time:t})=>{
 const leave=clamp((t-2.35)/1.36);
 const x=t<1.3?-650+870*(1-Math.pow(1-t/1.3,1.5)):t<2.35?220:220-870*leave;
 const walking=t<1.3||t>=2.35;
 const phase=(x/190)*Math.PI*2;
 const turn=ease((t-2.05)/.30);const facing=Math.cos(turn*Math.PI);
 const bob=walking?Math.sin(phase*2)*2:0;
 const swing=walking?Math.sin(phase)*11:0;
 const ref=staticFile('inveja-s06/gato-referencia-luiz.png');
 const pic=<image href={ref} width="612" height="433" filter="url(#cat-key)"/>;
 return <svg viewBox="12 0 590 433" style={{position:'absolute',left:x,top:605,width:640,height:470,overflow:'visible'}}>
 <defs>
 <filter id="cat-key" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -.333333 -.333333 -.333333 0 1" result="key"/><feComposite in="key" in2="SourceAlpha" operator="in"/></filter>
 <clipPath id="cat-trunk"><path d="M190 0H612V278L568 278 557 300 464 300Q400 307 340 340L285 340 277 327 215 345 175 318 175 270 190 260Z"/></clipPath>
 <clipPath id="cat-tail"><path d="M0 80H210L236 225 190 275H0Z"/></clipPath>
 <clipPath id="hind-far"><path d="M180 275L285 285 283 349 235 429H160Z"/></clipPath>
 <clipPath id="hind-near"><path d="M280 307H355L415 433H277L257 362Z"/></clipPath>
 <clipPath id="front-far"><path d="M506 269H582V433H530L507 334Z"/></clipPath>
 <clipPath id="front-near"><path d="M451 278H513L541 433H482L455 339Z"/></clipPath>
 </defs>
 <g transform={`translate(306,${bob}) scale(${facing},1) translate(-306,0)`}>
 {!walking&&t<2.05?pic:<>
 <g transform={`rotate(${-swing},233,295)`}><g clipPath="url(#hind-far)">{pic}</g></g>
 <g transform={`rotate(${swing},535,280)`}><g clipPath="url(#front-far)">{pic}</g></g>
 <g transform={`rotate(${Math.sin(t*3)*2.2},221,216)`}><g clipPath="url(#cat-tail)">{pic}</g></g>
 <g clipPath="url(#cat-trunk)">{pic}</g>
 <g transform={`rotate(${swing},310,315)`}><g clipPath="url(#hind-near)">{pic}</g></g>
 <g transform={`rotate(${-swing},480,281)`}><g clipPath="url(#front-near)">{pic}</g></g>
 </>}
 </g></svg>;
};
const Film:React.FC=()=>{
 const f=useCurrentFrame(),t=f/24;
 const [handle]=useState(()=>delayRender('Fontes Palavras'));useEffect(()=>{Promise.all([document.fonts.load('270px PalBebas'),document.fonts.load('24px PalInter')]).then(()=>continueRender(handle));},[handle]);
 const hotelEnd=3.70,compareStart=7.495,wordStart=13.995;
 const hotel=t<hotelEnd;
 const stat=ease((t-.135)/.25)*(1-ease((t-2.95)/.35));
 const money=ease((t-.855)/.22)*(1-ease((t-2.95)/.35));
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
 <Cat time={t}/>
 <AbsoluteFill style={{opacity:stat,transform:`translateY(${(1-stat)*12}px)`}}><div style={{position:'absolute',left:1220,top:65,width:400,height:870,background:'#24394F',borderLeft:'4px solid #8F9DA355',boxShadow:'0 12px 40px #11182744'}}/><Statue/></AbsoluteFill>
 <AbsoluteFill style={{opacity:money,transform:`translateY(${(1-money)*10}px)`}}><Money/></AbsoluteFill>
 </>:<>
 <AbsoluteFill style={{opacity:photoExit}}><Img src={staticFile('inveja-s06/almoco.png')} style={{width:'100%',height:'100%',objectFit:'cover',transform:`scale(${1.12+.11*clamp((t-hotelEnd)/(wordStart-hotelEnd))})`,transformOrigin:'50% 60%',filter:`blur(${7*compare}px)`}}/><AbsoluteFill style={{background:C.night,opacity:.30+.56*compare}}/></AbsoluteFill>
 <svg style={{position:'absolute',inset:0,opacity:(1-compare)*ease((t-4.0)/.45)*(1-ease((t-6.7)/.5))}} width="1920" height="1080"><path d="M1175 600Q1280 500 1390 590" fill="none" stroke={C.terra} strokeWidth="5" opacity=".85" pathLength="1" strokeDasharray="1" strokeDashoffset={1-ease((t-4.0)/.8)}/><path d="M1373 574L1390 590 1369 596" fill="none" stroke={C.terra} strokeWidth="5" opacity={ease((t-4.6)/.2)}/></svg>
 <svg style={{position:'absolute',inset:0,opacity:graph}} width="1920" height="1080"><path d="M425 810H1510" stroke={C.blue} strokeWidth="2" opacity=".4"/>{[y1,y2].map((y,i)=><g key={i}><path d={`M${540+i*640} 765V${y}`} stroke={i?C.terra:C.paper} strokeWidth="8" strokeLinecap="round"/><circle cx={540+i*640} cy={y} r="27" fill={i?C.terra:C.paper}/></g>)}<g opacity={difference}><path d={`M540 ${y1}H1180`} stroke={C.blue} strokeWidth="2" strokeDasharray="9 15" opacity=".5"/><path d={`M1260 ${y2}V${y1}M1243 ${y2}H1277M1243 ${y1}H1277`} stroke={C.terra} strokeWidth="5"/><path d="M464 882H615" stroke={C.terra} strokeWidth="5"/></g></svg>
 </>}
 {t>=wordStart&&<div style={{position:'absolute',left:420,top:370,width:1080,height:340}}><div style={{fontFamily:'PalBebas',fontSize:270,letterSpacing:4,lineHeight:1,display:'flex',alignItems:'baseline'}}>{'INVEJA'.split('').map((letter,i)=>{const a=ease((t-15.235-i*.055)/.20);return <span key={i} style={{display:'inline-block',opacity:a,transform:`translateY(${(1-a)*26}px) rotate(${(1-a)*-6}deg) scale(${.94+.06*a})`,color:a<.98?C.terra:C.paper}}>{letter}</span>;})}</div><div style={{height:7,width:620*ease((t-15.65)/.60),background:C.terra,marginTop:25}}/><div style={{position:'absolute',left:622,top:254,width:10,height:10,borderRadius:10,background:C.terra,opacity:ease((t-16.35)/.30)}}/></div>}
 </AbsoluteFill>;
};
registerRoot(()=> <Composition id="inveja-s06-final" component={Film} width={1920} height={1080} fps={24} durationInFrames={453}/>);
