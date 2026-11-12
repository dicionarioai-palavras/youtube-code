import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Composition,Img,staticFile,registerRoot,delayRender,continueRender} from 'remotion';
const C={night:'#1A1D24',paper:'#F7F0E3',terra:'#C46D45',blue:'#8F9DA3'};
const goddess='M650 604 Q680 600 696 640 L711 701 724 764 740 784 744 741 758 711 769 641 783 637 796 701 817 730 821 783 810 825 807 894 819 925 836 952 830 965 804 950 791 936 781 985 791 1062 779 1163 773 1270 778 1375 768 1413 777 1434 766 1455 708 1470 567 1469 480 1448 469 1422 473 1382 485 1321 493 1210 503 1138 516 1105 502 1088 488 1085 485 1044 491 1006 499 957 506 903 520 849 536 801 562 774 577 739 586 674 603 633 Q624 604 650 604 Z';
const Statue=()=> <svg viewBox="455 590 390 890" style={{position:'absolute',left:1280,top:100,width:245,height:560,filter:'drop-shadow(0 10px 14px #10111788)'}}><defs><clipPath id="statue"><path clipRule="evenodd" fillRule="evenodd" d={goddess+' M514 1103 L552 1103 L526 1225 L509 1335 L497 1383 L489 1383 L504 1210 Z'}/></clipPath></defs><image href={staticFile('inveja-s06/fortuna.jpg')} width="1221" height="2048" clipPath="url(#statue)"/></svg>;
const Money=()=> <svg viewBox="25 725 1090 910" style={{position:'absolute',left:1270,top:650,width:280,height:234,filter:'drop-shadow(0 7px 10px #10111788)'}}><defs><filter id="green" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 6 -12 6 0 1.4" result="key"/><feComposite in="key" in2="SourceAlpha" operator="in"/></filter></defs><image href={staticFile('inveja-s06/dinheiro.jpg')} width="1152" height="2048" filter="url(#green)"/></svg>;
// Silhueta baseada diretamente na primeira referencia de Luiz.
// Quadros de aprovacao: a articulacao da caminhada sera feita na animacao final.
const Cat:React.FC<{time:number}>=({time})=>{
 const x=time<1.3?-520+time*600:time<2.1?260:260-(time-2.1)*650;
 return <svg viewBox="12 0 590 433" style={{position:'absolute',left:x,top:605,width:640,height:470,overflow:'visible'}}>
 <defs><filter id="cat-reference-key" colorInterpolationFilters="sRGB"><feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -.333333 -.333333 -.333333 0 1" result="key"/><feComposite in="key" in2="SourceAlpha" operator="in"/></filter></defs>
 <g transform={time>=2.1?'translate(612,0) scale(-1,1)':undefined}><image href={staticFile('inveja-s06/gato-referencia-luiz.png')} width="612" height="433" filter="url(#cat-reference-key)"/></g>
 </svg>;
};
const snapshots=[.4,1.20,2.20,3.50,5.30,9.20,12.40,15.40,18.10];
const Board:React.FC<{stage:number}>=({stage})=>{
 const [handle]=useState(()=>delayRender('Fontes'));useEffect(()=>{Promise.all([document.fonts.load('150px PalBebas'),document.fonts.load('24px PalInter')]).then(()=>continueRender(handle));},[handle]);
 const s=Math.max(0,Math.min(8,stage));const time=snapshots[s];const hotel=s<=3;const lunch=s===4;const compare=s===5||s===6;const word=s>=7;
 const prog=Math.min(time/3.65,1);const zoom=1.072+.428*prog;
 return <AbsoluteFill style={{background:C.night,overflow:'hidden'}}>
 <style>{`@font-face{font-family:PalBebas;src:url('${staticFile('fonts/BebasNeue.woff2')}')}@font-face{font-family:PalInter;src:url('${staticFile('fonts/Inter-500.woff2')}')}`}</style>
 {hotel&&<><AbsoluteFill style={{transform:`scale(${zoom})`,transformOrigin:'51% 55%'}}><Img src={staticFile('inveja-s06/copacabana.jpg')} style={{width:'100%',height:'100%',objectFit:'cover',objectPosition:'50% 55%'}}/></AbsoluteFill><AbsoluteFill style={{background:C.night,opacity:.17}}/><AbsoluteFill style={{background:'linear-gradient(0deg,#1A1D2477,transparent 55%)'}}/><Cat time={time}/>{s>=1&&s<=2&&<><div style={{position:'absolute',left:1220,top:65,width:400,height:870,background:'#24394F',borderLeft:'4px solid #8F9DA355',boxShadow:'0 12px 40px #11182744'}}/><Statue/></>}{s===2&&<Money/>}</>}
 {lunch&&<><Img src={staticFile('inveja-s06/almoco.png')} style={{width:'100%',height:'100%',objectFit:'cover',transform:'scale(1.16)',transformOrigin:'50% 60%'}}/><AbsoluteFill style={{background:C.night,opacity:.30}}/><svg style={{position:'absolute',inset:0}} width="1920" height="1080"><path d="M1175 600Q1280 500 1390 590" fill="none" stroke={C.terra} strokeWidth="5" opacity=".85"/><path d="M1373 574L1390 590 1369 596" fill="none" stroke={C.terra} strokeWidth="5"/></svg></>}
 {compare&&<><Img src={staticFile('inveja-s06/almoco.png')} style={{width:'100%',height:'100%',objectFit:'cover',transform:'scale(1.23)',filter:'blur(7px)'}}/><AbsoluteFill style={{background:C.night,opacity:.86}}/><svg style={{position:'absolute',inset:0}} width="1920" height="1080" viewBox="0 0 1920 1080"><path d="M425 810H1510" stroke={C.blue} strokeWidth="2" opacity=".4"/>{[0,1].map(i=><g key={i}><path d={`M${540+i*640} 765V${s===5?460: i?350:570}`} stroke={i?C.terra:C.paper} strokeWidth="8" strokeLinecap="round"/><circle cx={540+i*640} cy={s===5?460:i?350:570} r="27" fill={i?C.terra:C.paper}/></g>)}{s===6&&<><path d="M540 570H1180" stroke={C.blue} strokeWidth="2" strokeDasharray="9 15" opacity=".5"/><path d="M1260 350V570M1243 350H1277M1243 570H1277" stroke={C.terra} strokeWidth="5"/><path d="M464 882H615" stroke={C.terra} strokeWidth="5"/></>}</svg></>}
 {word&&<><div style={{position:'absolute',left:420,top:370,width:1080,height:340}}><div style={{fontFamily:'PalBebas',fontSize:270,letterSpacing:4,color:C.paper,lineHeight:1,display:'flex',alignItems:'baseline'}}>{'INVEJA'.split('').map((letter,i)=><span key={i} style={{display:'inline-block',opacity:s===7?(i<3?1:i===3?.7:0):1,transform:s===7&&i===3?'translateY(18px) rotate(-5deg) scale(.94)':'none',color:s===7&&i===3?C.terra:C.paper}}>{letter}</span>)}</div><div style={{height:7,width:s===7?140:620,background:C.terra,marginTop:25}}/>{s===8&&<div style={{position:'absolute',left:622,top:254,width:10,height:10,borderRadius:10,background:C.terra}}/>}</div></>}
 </AbsoluteFill>;
};
registerRoot(()=> <Composition id="inveja-s06-aprovacao" component={Board} width={1920} height={1080} fps={24} durationInFrames={1} defaultProps={{stage:0}}/>);




