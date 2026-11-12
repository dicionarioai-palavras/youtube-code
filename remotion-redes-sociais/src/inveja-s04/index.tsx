import React from 'react';
import {AbsoluteFill,Composition,Img,registerRoot,staticFile,useCurrentFrame} from 'remotion';
import {COR} from '../estilo';
const FPS=24, DURATION=216, SCENE_START=46.487;
const VALE=50.447, ENTRY_FRAME=Math.ceil((VALE-SCENE_START)*FPS);
const smooth=(v:number)=>{const p=Math.min(1,Math.max(0,v));return p*p*(3-2*p);};
const Film:React.FC=()=>{
 const f=useCurrentFrame();
 const zoom=1.012+0.058*(f/(DURATION-1));
 const entry=smooth((f-ENTRY_FRAME+1)/7);
 const settle=smooth((f-194)/14);
 const sceneSrc=staticFile('inveja-s04/relogio.png');
 return <AbsoluteFill style={{background:'#111315',overflow:'hidden'}}>
 <svg width="0" height="0" aria-hidden><defs>
 <clipPath id="coxinha-silhouette-s04" clipPathUnits="objectBoundingBox"><path d="M .512 .140 C .535 .138 .540 .180 .551 .216 C .573 .279 .611 .364 .639 .451 C .660 .515 .670 .574 .666 .647 C .661 .721 .644 .785 .603 .827 C .566 .862 .516 .878 .467 .875 C .414 .874 .367 .851 .338 .812 C .311 .778 .314 .739 .316 .688 C .317 .627 .332 .556 .356 .493 C .377 .434 .408 .363 .439 .295 C .462 .248 .481 .208 .491 .174 C .497 .150 .499 .141 .512 .140 Z"/></clipPath>
 <filter id="white-key-s04" x="-5%" y="-5%" width="110%" height="110%" colorInterpolationFilters="sRGB">
 <feColorMatrix in="SourceGraphic" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 -6 0 5.4" result="keyed"/>
 <feComposite in="keyed" in2="SourceAlpha" operator="in"/>
 </filter></defs></svg>
 <AbsoluteFill style={{transform:`scale(${zoom})`,transformOrigin:'54% 25%',overflow:'hidden'}}>
 <Img src={sceneSrc} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover'}}/>
 <AbsoluteFill style={{overflow:'hidden',clipPath:'polygon(0 42%, 40% 42%, 50% 65%, 50% 100%, 0 100%)'}}>
 <Img src={sceneSrc} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',filter:'blur(3px)'}}/>
 </AbsoluteFill>
 <AbsoluteFill style={{overflow:'hidden',clipPath:'polygon(67% 0,100% 0,100% 100%,58% 100%,57% 68%,65% 44%)'}}>
 <Img src={sceneSrc} style={{position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'cover',filter:'blur(3px)'}}/>
 </AbsoluteFill>
 <div style={{position:'absolute',left:690,top:500,width:900,height:400,opacity:entry,transform:`translateY(${(1-entry)*8+settle*3}px)`}}>
 <Img src={staticFile('inveja-s04/vale.png')} style={{position:'absolute',left:0,top:0,width:520,height:'auto',clipPath:'inset(2px)',filter:'url(#white-key-s04) drop-shadow(0 4px 5px rgba(26,27,32,.20))',transform:`rotate(${-.4+.4*settle}deg)`}}/>
 <Img src={staticFile('inveja-s04/coxinha.png')} style={{position:'absolute',left:260,top:-24,width:580,height:'auto',clipPath:'url(#coxinha-silhouette-s04)',filter:'url(#white-key-s04) drop-shadow(0 3px 4px rgba(26,27,32,.14))'}}/>
 <div style={{position:'absolute',left:76,top:325,width:540,height:1,background:COR.terracota,opacity:.35*settle,transformOrigin:'center'}}/>
 </div>
 </AbsoluteFill>
 </AbsoluteFill>;
};
const Root:React.FC=()=> <Composition id="inveja-s04-9s" component={Film} width={1920} height={1080} fps={FPS} durationInFrames={DURATION}/>;
registerRoot(Root);
