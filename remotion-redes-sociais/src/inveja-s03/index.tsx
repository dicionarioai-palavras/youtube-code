import React, {useEffect, useState} from 'react';
import {AbsoluteFill, Composition, Img, interpolate, registerRoot, staticFile, useCurrentFrame, delayRender, continueRender} from 'remotion';
import {COR} from '../estilo';

const FPS=24;
const ease=(x:number)=>{const p=Math.max(0,Math.min(1,x));return p*p*(3-2*p);};
const ramp=(f:number,a:number,b:number)=>ease((f-a)/(b-a));
const within=(f:number,a:number,b:number)=>ramp(f,a,a+8)*(1-ramp(f,b-8,b));
const ink=COR.grafite, paper=COR.osso, accent=COR.terracota;
const media={clean:'inveja-s03/mesa-limpa.png',wide:'inveja-s03/mesa-calculadora.png',macro:'inveja-s03/calculadora-macro.jpg'};
const fonts=`@font-face{font-family:S03Bebas;src:url("${staticFile('fonts/BebasNeue.woff2')}")}@font-face{font-family:S03Inter;src:url("${staticFile('fonts/Inter-500.woff2')}")}`;

const Photo:React.FC<{file:string;f:number;start:number;end:number;from:number;to:number;origin:string;opacity?:number}>=({file,f,start,end,from,to,origin,opacity=1})=>{
 const p=Math.max(0,Math.min(1,(f-start)/(end-start)));
 return <AbsoluteFill style={{opacity,overflow:'hidden'}}><Img src={staticFile(file)} style={{width:'100%',height:'100%',objectFit:'cover',transform:`scale(${from+(to-from)*p}) translate3d(${-3*p}px,${-2*p}px,0)`,transformOrigin:origin}}/></AbsoluteFill>;
};
const Tiny:React.FC<{children:React.ReactNode;style?:React.CSSProperties}>=({children,style})=><div style={{fontFamily:'S03Inter',fontSize:24,letterSpacing:4,color:paper,...style}}>{children}</div>;
const Stage:React.FC<{f:number;from:number;to:number;label:string;main:string;support?:string;correction?:boolean}>=({f,from,to,label,main,support,correction})=>{
 const o=within(f,from,to), y=16*(1-ramp(f,from,from+12));
 return <div style={{position:'absolute',right:115,top:294,width:690,opacity:o,transform:`translateY(${y}px)`}}>
 <div style={{width:54,height:4,background:accent,marginBottom:25}}/>
 <Tiny>{label}</Tiny>
 <div style={{fontFamily:'S03Bebas',fontSize:correction?154:116,lineHeight:1.02,letterSpacing:1,color:paper,marginTop:22,whiteSpace:'pre-line'}}>{main}</div>
 {support&&<div style={{fontFamily:'S03Inter',fontSize:28,color:paper,opacity:.75,marginTop:20}}>{support}</div>}
 </div>;
};
const Film:React.FC=()=>{
 const f=useCurrentFrame();
 const [handle]=useState(()=>delayRender('Fontes Palavras'));
 useEffect(()=>{Promise.all([document.fonts.load('24px S03Inter'),document.fonts.load('100px S03Bebas')]).then(()=>continueRender(handle));},[handle]);
 const open=1-ramp(f,45,58), wideIn=ramp(f,126,138), macroIn=ramp(f,163,175), lastIn=ramp(f,350,365);
 return <AbsoluteFill style={{backgroundColor:ink,overflow:'hidden'}}>
 <style>{fonts}</style>
 <Photo file={media.clean} f={f} start={0} end={138} from={1.025} to={1.068} origin="42% 48%"/>
 <Photo file={media.wide} f={f} start={126} end={175} from={1.015} to={1.075} origin="63% 55%" opacity={wideIn}/>
 <Photo file={media.macro} f={f} start={163} end={365} from={1.018} to={1.078} origin="39% 47%" opacity={macroIn}/>
 <Photo file={media.wide} f={f} start={350} end={480} from={1.075} to={1.13} origin="65% 54%" opacity={lastIn}/>
 <AbsoluteFill style={{background:'linear-gradient(90deg,rgba(18,20,23,0.02) 20%,rgba(18,20,23,0.15) 48%,rgba(18,20,23,0.84) 100%)',opacity:Math.max(open*.8,macroIn*(1-lastIn))}}/>
 <AbsoluteFill style={{background:'radial-gradient(ellipse at 56% 46%,transparent 20%,rgba(18,20,23,0.20) 100%)',opacity:.6}}/>
 <div style={{position:'absolute',right:160,top:246,width:590,opacity:open}}>
 <Tiny>SALÁRIO</Tiny>
 <div style={{height:285,display:'flex',alignItems:'flex-end',gap:82,paddingLeft:35,marginTop:14}}>
 {[{h:117,t:'SEU',c:COR.azulCinza},{h:218,t:'DELE',c:accent}].map((v,i)=><div key={v.t} style={{position:'relative',width:116,height:285,display:'flex',alignItems:'flex-end'}}>
 <div style={{height:v.h*(.90+.10*ramp(f,0,12+i*3)),width:116,background:v.c,borderRadius:2}}/>
 <div style={{position:'absolute',top:301,left:0,fontFamily:'S03Inter',fontSize:21,letterSpacing:2,color:paper}}>{v.t}</div>
 </div>)}
 </div>
 <div style={{fontFamily:'S03Bebas',fontSize:76,color:paper,marginTop:66}}>QUASE 2×</div>
 </div>
 <div style={{position:'absolute',left:110,top:166,opacity:within(f,137,174),color:ink}}>
 <div style={{height:4,width:42,background:accent,marginBottom:16}}/><div style={{fontFamily:'S03Bebas',fontSize:58}}>SALÁRIO</div>
 </div>
 <Stage f={f} from={173} to={216} label="IDADE" main={'MESMA\nIDADE'}/>
 <div style={{position:'absolute',right:115,top:385,width:690,opacity:within(f,213,238)}}>
 <Tiny>IDADE</Tiny><div style={{width:218,height:3,background:paper,opacity:.6,marginTop:45}}/><div style={{width:4,height:45,background:accent,position:'absolute',left:226,top:64,opacity:.4+.6*Math.abs(Math.sin(f*.13))}}/>
 </div>
 <Stage f={f} from={238} to={282} label="ELE" main="−2 ANOS" support="MAIS NOVO" correction/>
 <Stage f={f} from={283} to={352} label="TEMPO DE CARREIRA" main={'COMEÇOU\nDEPOIS'}/>
 <AbsoluteFill style={{background:'linear-gradient(180deg,rgba(15,18,22,0.02),rgba(15,18,22,0.23))',opacity:lastIn}}/>
 </AbsoluteFill>;
};
const Root:React.FC=()=> <Composition id="inveja-s03-20s" component={Film} durationInFrames={480} fps={FPS} width={1920} height={1080}/>;
registerRoot(Root);
