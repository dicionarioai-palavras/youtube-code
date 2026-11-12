import React from 'react';
import {AbsoluteFill,Composition,Img,Video as OffthreadVideo,registerRoot,staticFile,useCurrentFrame} from 'remotion';
type Props={kind:string;frames:number;clean?:boolean};
const src=(s:string)=>staticFile('piloto-inveja-v1/'+s);
const ease=(f:number,a:number,b:number)=>{const t=Math.max(0,Math.min(1,(f-a)/(b-a)));return t*t*(3-2*t)};
const Still:React.FC<{file:string;scale?:number;origin?:string}>=({file,scale=1,origin='50% 50%'})=><Img src={src(file)} style={{width:'100%',height:'100%',objectFit:'cover',transform:`scale(${scale})`,transformOrigin:origin}}/>;
const Scene:React.FC<Props>=({kind,frames,clean=false})=>{
 const f=useCurrentFrame();const t=f/30;const p=f/frames;
 const label:React.CSSProperties={fontFamily:'Inter,Arial,sans-serif',fontWeight:500,letterSpacing:2,color:'#f4efdc'};
 const zoom=1+p*.045;
 return <AbsoluteFill style={{background:kind==='distance-overlay'?'transparent':'#18313a',overflow:'hidden'}}>
  <style>{`@font-face{font-family:Inter;src:url('${staticFile('fonts/Inter-400.woff2')}')} @font-face{font-family:Display;src:url('${staticFile('fonts/BebasNeue.woff2')}')}`}</style>
  {kind==='base'&&<Still file="restaurante-base.png" scale={zoom}/>}
  {kind==='smile'&&<Still file="sorriso-referencia.png" scale={1.025+p*.025} origin="35% 45%"/>}
  {kind==='salary'&&<><Still file={t<5.91?'restaurante-base.png':'sorriso-referencia.png'} scale={zoom}/>{!clean&&t>4.39&&t<5.91&&<AbsoluteFill style={{background:'linear-gradient(90deg,rgba(9,27,33,.88),rgba(9,27,33,0) 78%)',justifyContent:'center',paddingLeft:140}}><div style={{...label,fontSize:28}}>QUASE O DOBRO</div><div style={{fontFamily:'Display,Arial',fontSize:250,color:'#f2cb79',lineHeight:1,transform:`translateY(${30*(1-ease(f,132,147))}px)`,opacity:ease(f,132,142)}}>2×</div></AbsoluteFill>}</>}
  {kind==='calculator'&&<><Still file="calculadora-mental.png" scale={zoom}/>{!clean&&<><div style={{position:'absolute',left:150,top:290,...label,fontSize:29,opacity:ease(f,22,35)}}>POR DENTRO</div><div style={{position:'absolute',left:145,top:335,fontFamily:'Display,Arial',fontSize:142,lineHeight:1.05,color:'#f2cd84',opacity:ease(f,48,61),transform:`translateY(${24*(1-ease(f,48,68))}px)`}}>A CONTA<br/>COMEÇA.</div><div style={{position:'absolute',left:150,bottom:230,width:620*ease(f,48,75),height:3,background:'#e6b263'}}/></>}</>}
  {(kind==='distance-overlay'||kind==='distance')&&<>
   {kind==='distance'&&<OffthreadVideo muted src={src('mesa-distancia.mp4')} style={{width:'100%',height:'100%',objectFit:'cover'}}/>}
   <AbsoluteFill style={{background:'linear-gradient(0deg,rgba(10,24,31,.72),transparent 47%)',opacity:ease(f,90,140)}}/>
   <div style={{position:'absolute',left:340,bottom:150,width:1240,overflow:'hidden',clipPath:`inset(0 ${100*(1-ease(f,95,180))}% 0 0)`}}><svg width="1240" height="100" viewBox="0 0 1240 100"><path d="M0 75H1240M1 58V91M1239 58V91" stroke="#f2d28c" strokeWidth="3"/>{Array.from({length:41},(_,i)=><path key={i} d={`M${i*31} 75v-${i%5===0?42:19}`} stroke="#f2d28c" strokeWidth="2" opacity={ease(f,286+i*.15,300+i*.15)}/>)}</svg></div>
   <div style={{position:'absolute',bottom:95,left:0,right:0,textAlign:'center',...label,fontSize:24,opacity:ease(f,118,145)*(1-ease(f,270,290))}}>A MESMA MESA. OUTRA DISTÂNCIA.</div>
  </>}
  {kind==='camera'&&<OffthreadVideo muted src={src('camera.mp4')} style={{width:'100%',height:'100%',objectFit:'cover',transform:'scale(1.07)',transformOrigin:'48% 55%'}}/>}
  {kind==='house'&&<><Still file="pixabay-casa.jpg" scale={1.08+p*.025}/>{!clean&&<AbsoluteFill style={{boxShadow:'inset 0 0 200px rgba(11,24,32,.25)'}}/>}</>}
  {kind==='travel'&&<><OffthreadVideo muted startFrom={60} src={src('pixabay-santorini.mp4')} style={{width:'100%',height:'100%',objectFit:'cover'}}/>{!clean&&<div style={{position:'absolute',left:130,top:120,borderLeft:'3px solid #f3e6cf',paddingLeft:24,...label,fontSize:32,opacity:ease(f,0,9)}}>GRÉCIA</div>}</>}
 </AbsoluteFill>;
};
const Root=()=> <Composition id="PilotoInveja" component={Scene} durationInFrames={150} fps={30} width={1920} height={1080} defaultProps={{kind:'base',frames:150}} calculateMetadata={({props})=>({durationInFrames:props.frames})}/>;
registerRoot(Root);
