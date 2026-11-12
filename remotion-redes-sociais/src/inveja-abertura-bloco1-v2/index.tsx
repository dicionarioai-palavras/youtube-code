import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Composition,Img,Audio,staticFile,registerRoot,delayRender,continueRender,useCurrentFrame} from 'remotion';
const C={night:'#1A1D24',paper:'#F7F0E3',terra:'#C46D45'};
const ease=(x:number)=>{const t=Math.max(0,Math.min(1,x));return t*t*(3-2*t);};
const Title:React.FC=()=>{
 const t=useCurrentFrame()/24;
 const [handle]=useState(()=>delayRender('Bebas Palavras'));useEffect(()=>{Promise.all([document.fonts.load('220px PalBebas'),document.fonts.load('40px PalInter')]).then(()=>continueRender(handle));},[handle]);
 const eye=ease((t-1.0)/1.30);const height=2+25*eye;
 const letters='O OLHO'.split('');
 return <AbsoluteFill style={{background:C.night,overflow:'hidden'}}>
 <style>{`@font-face{font-family:PalBebas;src:url('${staticFile('fonts/BebasNeue.woff2')}')}@font-face{font-family:PalInter;src:url('${staticFile('fonts/Inter-500.woff2')}')}`}</style>
 <Audio src={staticFile('abertura-bloco1/toques-originais.wav')}/>
 <div style={{position:'absolute',left:420,top:292,opacity:1}}>
 <div style={{fontFamily:'PalBebas',fontSize:220,lineHeight:1,color:C.paper,display:'flex',alignItems:'baseline'}}>{letters.map((letter,i)=>{
 const on=t>=.05+i*.18;
 return <span key={i} style={{position:'relative',display:'inline-block',minWidth:letter===' '?38:undefined,visibility:on?'visible':'hidden'}}>{letter}
 {i===5&&<svg width="58" height="38" viewBox="0 0 58 38" style={{position:'absolute',left:14,top:102,opacity:ease((t-.95)/.25)}}>
 <defs><clipPath id="eye-aperture"><path d={`M3 19Q29 ${19-height} 55 19Q29 ${19+height} 3 19Z`}/></clipPath></defs>
 <path d={`M3 19Q29 ${19-height} 55 19Q29 ${19+height} 3 19Z`} fill="none" stroke={C.terra} strokeWidth="2.3"/>
 <g clipPath="url(#eye-aperture)"><ellipse cx={28+3*ease((t-1.70)/.60)} cy="19" rx="5" ry="9" fill={C.terra} opacity={.80*eye}/></g>
 </svg>}
 </span>;
 })}</div>
 <div style={{fontFamily:'PalInter',fontSize:37,letterSpacing:5,color:C.paper,marginTop:23,lineHeight:1.25}}>{'DENTRO DA PALAVRA'.split('').map((letter,i)=><span key={i} style={{visibility:t>=1.10+i*.08?'visible':'hidden'}}>{letter}</span>)}</div>
 <div style={{marginTop:36,height:5,width:620*ease((t-1.10)/1.30),background:C.terra}}/>
 </div>
 </AbsoluteFill>;
};
registerRoot(()=> <Composition id="abertura-olho-palavra" component={Title} width={1920} height={1080} fps={24} durationInFrames={60}/>);
