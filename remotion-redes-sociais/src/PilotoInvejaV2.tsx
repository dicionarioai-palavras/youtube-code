import React from 'react';
import {AbsoluteFill,Composition,Img,registerRoot,staticFile,useCurrentFrame} from 'remotion';
type Props={kind:string;frames:number};
const media=(s:string)=>staticFile('piloto-inveja-v2/'+s);
const ramp=(f:number,a:number,b:number)=>{const t=Math.max(0,Math.min(1,(f-a)/(b-a)));return t*t*(3-2*t)};
const Still:React.FC<{file:string;zoom:number;origin?:string}>=({file,zoom,origin='50% 50%'})=><Img src={media(file)} style={{width:'100%',height:'100%',objectFit:'cover',transform:`scale(${zoom})`,transformOrigin:origin}}/>;
const Scene:React.FC<Props>=({kind,frames})=>{
 const f=useCurrentFrame(),t=f/30,p=f/frames;const label={fontFamily:'Inter,Arial',fontWeight:500,letterSpacing:2,color:'#f4efdc'};
 return <AbsoluteFill style={{background:'#17333c',overflow:'hidden'}}>
 <style>{`@font-face{font-family:Inter;src:url('${staticFile('fonts/Inter-400.woff2')}')} @font-face{font-family:Display;src:url('${staticFile('fonts/BebasNeue.woff2')}')}`}</style>
 {kind==='base'&&<Still file="restaurante-realista.png" zoom={1+p*.045}/>}
 {kind==='smile'&&<Still file="sorriso-realista.png" zoom={1.02+p*.025} origin="40% 45%"/>}
 {kind==='salary'&&<><Still file={t<5.91?'restaurante-realista.png':'sorriso-realista.png'} zoom={1+p*.045}/>{t>4.39&&t<5.91&&<AbsoluteFill style={{background:'linear-gradient(90deg,rgba(9,27,33,.88),rgba(9,27,33,0) 78%)',justifyContent:'center',paddingLeft:140}}><div style={{...label,fontSize:28}}>QUASE O DOBRO</div><div style={{fontFamily:'Display,Arial',fontSize:250,color:'#f2cb79',lineHeight:1,transform:`translateY(${30*(1-ramp(f,132,147))}px)`,opacity:ramp(f,132,142)}}>2×</div></AbsoluteFill>}</>}
 {kind==='calculator'&&<>
  <AbsoluteFill style={{background:'radial-gradient(ellipse at 68% 35%,#385a62,#11232c 78%)'}}/>
  <div style={{position:'absolute',right:190,top:130,width:425,height:700,padding:34,borderRadius:30,background:'linear-gradient(135deg,#87918c,#273b40 18%,#13262b 80%,#45616a)',border:'2px solid #5b7175',boxShadow:'-30px 45px 80px #06151a,8px -5px 22px #cfab6b55',transform:`rotate(-8deg) translateY(${-8*p}px)`}}>
   <div style={{height:120,marginBottom:34,borderRadius:10,background:'linear-gradient(145deg,#bec8a7,#6d8270)',boxShadow:'inset 0 5px 13px #122619aa',color:'#263e32',fontFamily:'monospace',fontSize:68,textAlign:'right',padding:'14px 20px'}}>{t>1.6?'…':'0'}</div>
   <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:17}}>{['7','8','9','÷','4','5','6','×','1','2','3','−','0','.','=','+'].map((n,i)=><div key={i} style={{height:86,borderRadius:8,background:i%4===3?'linear-gradient(#c9a46d,#8c683d)':'linear-gradient(#7b8988,#3d5358)',boxShadow:'0 7px 2px #0b1b22',color:'#e5e7d8',fontFamily:'Inter,Arial',fontSize:34,display:'flex',alignItems:'center',justifyContent:'center'}}>{n}</div>)}</div>
  </div>
  <div style={{position:'absolute',left:150,top:290,...label,fontSize:29,opacity:ramp(f,22,35)}}>POR DENTRO</div>
  <div style={{position:'absolute',left:145,top:335,fontFamily:'Display,Arial',fontSize:142,lineHeight:1.05,color:'#f2cd84',opacity:ramp(f,48,61),transform:`translateY(${24*(1-ramp(f,48,68))}px)`}}>A CONTA<br/>COMEÇA.</div>
  <div style={{position:'absolute',left:150,bottom:230,width:620*ramp(f,48,75),height:3,background:'#e6b263'}}/>
 </>}
 {kind==='woman'&&<Still file="atriz-chave-casa.png" zoom={1+p*.035} origin="58% 46%"/>}
 </AbsoluteFill>;
};
const Root=()=> <Composition id="PilotoInvejaV2" component={Scene} durationInFrames={150} fps={30} width={1920} height={1080} defaultProps={{kind:'base',frames:150}} calculateMetadata={({props})=>({durationInFrames:props.frames})}/>;
registerRoot(Root);
