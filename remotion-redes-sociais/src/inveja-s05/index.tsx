import React,{useEffect,useState} from 'react';
import {AbsoluteFill,Composition,Img,staticFile,registerRoot,delayRender,continueRender,useCurrentFrame} from 'remotion';
import {COR} from '../estilo';
const t=COR.terracota, p=COR.osso, b=COR.azulCinza;
type Props={stage:number};
const stages=[{shade:.12,zoom:1.072},{shade:.17,zoom:1.078},{shade:.24,zoom:1.085},{shade:.30,zoom:1.092},{shade:.43,zoom:1.100},{shade:.53,zoom:1.108},{shade:.58,zoom:1.113},{shade:.65,zoom:1.120},{shade:.70,zoom:1.126},{shade:.76,zoom:1.132},{shade:.79,zoom:1.137},{shade:.82,zoom:1.142}];
const Note:React.FC<{x:number;y:number;s?:number;faint?:boolean}>=({x,y,s=1,faint=false})=><g transform={`translate(${x},${y}) scale(${s})`} opacity={faint?.32:1}><rect width="245" height="146" rx="13" fill={t}/><path d="M22 30H151M22 52H118M22 115H156" stroke={p} strokeWidth="5" opacity=".75"/><circle cx="193" cy="80" r="24" fill="none" stroke={p} strokeWidth="5"/><path d="M188 65V95M198 65V95" stroke={p} strokeWidth="3"/></g>;
const House:React.FC<{x:number;y:number;s?:number;faint?:boolean}>=({x,y,s=1,faint=false})=><g transform={`translate(${x},${y}) scale(${s})`} opacity={faint?.32:1}><path d="M5 79L105 4L205 79M30 66V186H180V66" fill="none" stroke={t} strokeWidth="13" strokeLinejoin="round" strokeLinecap="round"/><path d="M89 186V118H131V186M54 96H76V124H54Z" fill="none" stroke={p} strokeWidth="6" strokeLinejoin="round"/></g>;
const Equals:React.FC<{x:number;y:number}>=({x,y})=><g transform={`translate(${x},${y})`} stroke={p} strokeWidth="9" strokeLinecap="round"><path d="M0 0H65M0 30H65"/></g>;
const Persons:React.FC<{gap?:number;ghost?:boolean}>=({gap=390,ghost=false})=><g>
 {[100,100+gap].map((x,i)=><g key={x} transform={`translate(${x},30)`}><circle r="24" fill={i?t:p}/><path d="M-48 93Q-48 35 0 35Q48 35 48 93" stroke={i?t:p} fill="none" strokeWidth="10" strokeLinecap="round"/></g>)}
 {ghost&&<path d="M145 102H445" stroke={b} strokeDasharray="10 13" strokeWidth="4" opacity=".55"/>}
 </g>;
const Rule:React.FC<{faint?:boolean}>=({faint=false})=><g opacity={faint?.25:1}><rect x="77" y="172" width="540" height="55" rx="3" fill={t}/>{Array.from({length:25},(_,i)=><path key={i} d={`M${92+i*21} 176v${i%5===0?30:17}`} stroke={p} strokeWidth={i%5===0?3:2}/>)}</g>;
const Art:React.FC<{stage:number;seconds:number;start:number}>=({stage:s,seconds,start})=>{
const show=(offset=0,duration=.55)=>ease((seconds-start-offset)/duration);
const gap=250+140*ease((seconds-10.81)/1.75);
const end=100+gap-51;

if(s===0)return null;
if(s===1)return <g><g opacity={show()} transform={`translate(0,${(1-show())*12})`}><Note x={42} y={44} s={.95}/></g><g opacity={show(.18)} transform={`translate(0,${(1-show(.18))*12})`}><House x={399} y={15} s={.92}/></g><path d="M24 247H643" stroke={p} strokeWidth="3" opacity=".55"/><path d="M56 266H229M408 266H578" stroke={t} strokeWidth="5" opacity=".65"/></g>;
if(s===2)return <g><Note x={15} y={30} s={.82} faint/><g opacity={show(.15)}><Equals x={290} y={90}/></g><g opacity={show(.26)} transform={`translate(${(1-show(.26))*-22},0)`}><Note x={427} y={30} s={.82}/></g></g>;
if(s===3)return <g><House x={20} y={18} s={1.04} faint/><g opacity={show(.15)}><Equals x={290} y={105}/></g><g opacity={show(.26)} transform={`translate(${(1-show(.26))*-22},0)`}><House x={440} y={18} s={1.04}/></g></g>;
if(s===4)return <g><path d="M-7 263V46Q-7-4 46-4H657Q710-4 710 46V263" fill="none" stroke={b} strokeWidth="3" strokeDasharray="9 15" opacity=".48"/><Persons gap={gap}/><path d="M152 154H300" stroke={t} strokeWidth="4"/><circle cx="349" cy="154" r="5" fill={p}/></g>;
if(s===5)return <g><Persons gap={gap}/><path d={`M152 145H${end}`} stroke={t} strokeWidth="5"/><path d={`M152 133V157M${end} 133V157`} stroke={p} strokeWidth="4"/></g>;
if(s===6)return <g><Persons gap={gap} ghost/><path d="M151 151H439" stroke={t} strokeWidth="5" opacity=".9"/><path d="M153 172H439" stroke={b} strokeDasharray="3 15" strokeWidth="3" opacity=".4"/></g>;
if(s===7)return <g><Persons gap={gap}/><defs><clipPath id="reveal-rule"><rect x="77" y="170" width={540*ease((seconds-17.46)/.55)} height="70"/></clipPath></defs><g clipPath="url(#reveal-rule)"><Rule/></g></g>;
if(s===8)return <g><path d="M122 30H527Q565 30 565 68V186Q565 224 527 224H290L229 271V224H122Q84 224 84 186V68Q84 30 122 30Z" fill="none" stroke={t} strokeWidth="8" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1-show(0,.70)}/><text opacity={show(.28)} x="171" y="163" fontFamily="S05Bebas" fontSize="125" fill={p}>“</text><path d="M266 128H457" stroke={p} strokeWidth="4" opacity=".38"/></g>;
if(s===9)return <g><defs><clipPath id="plateClip"><ellipse cx="352" cy="153" rx="154" ry="112"/></clipPath></defs><ellipse cx="352" cy="153" rx="170" ry="126" fill="none" stroke={t} strokeWidth="10"/><ellipse cx="352" cy="153" rx="139" ry="98" fill="none" stroke={p} strokeWidth="3" opacity=".6"/><g clipPath="url(#plateClip)"><path d="M346 17Q212 116 362 288H538V17Z" fill={COR.noite} opacity={.72*ease((seconds-22.16)/.90)} transform={`translate(${(1-ease((seconds-22.16)/.90))*300},0)`}/></g><path d="M123 57V254M100 55V99M123 55V99M146 55V99M100 99Q123 135 146 99M577 53V254M577 53Q615 86 577 138" fill="none" stroke={p} strokeWidth="7" strokeLinecap="round"/><path d="M229 275H475" stroke={t} strokeWidth="3" opacity=".45"/></g>;
if(s===10)return <g opacity={1-.40*show(0,1.3)} transform={`translate(${show(0,1.3)*12},0) scale(${1-.035*show(0,1.3)})`}><path d="M155 33Q100 33 100 100V195Q100 255 155 255M547 33Q602 33 602 100V195Q602 255 547 255" stroke={t} fill="none" strokeWidth="7" opacity=".65"/><path d="M220 163H484" stroke={p} strokeWidth="3" opacity=".27"/></g>;
return <g><Rule faint/><text opacity={ease((seconds-26.09)/.24)} x="311" y="150" fontFamily="S05Bebas" fontSize="208" fill={p}>?</text><path opacity={ease((seconds-26.09)/.30)} d="M310 259H408" stroke={t} strokeWidth="8" strokeLinecap="round"/></g>;
};
const FPS=24,DURATION=648;
const ease=(x:number)=>{const v=Math.max(0,Math.min(1,x));return v*v*(3-2*v);};
const phases=[
 {stage:1,start:0,end:3.61},{stage:2,start:3.61,end:5.53},{stage:3,start:5.53,end:7.65},
 {stage:4,start:7.65,end:10.81},{stage:5,start:10.81,end:13.38},{stage:6,start:13.38,end:15.50},
 {stage:7,start:15.50,end:18.36},{stage:8,start:18.36,end:20.40},{stage:9,start:20.40,end:24.13},
 {stage:10,start:24.13,end:25.73},{stage:11,start:25.73,end:27.25}
];
const AnimatedFilm:React.FC=()=>{
 const frame=useCurrentFrame(),seconds=frame/FPS,progress=frame/(DURATION-1);
 const [handle]=useState(()=>delayRender('fontePalavras'));
 useEffect(()=>{document.fonts.load('125px S05Bebas').then(()=>continueRender(handle));},[handle]);
 return <AbsoluteFill style={{background:COR.noite,overflow:'hidden'}}>
 <style>{`@font-face{font-family:S05Bebas;src:url("${staticFile('fonts/BebasNeue.woff2')}")}`}</style>
 <AbsoluteFill style={{transform:`translate(${-60*progress}px,${90*progress}px) scale(${1.072+.428*progress})`,transformOrigin:'54% 25%'}}>
 <Img src={staticFile('inveja-s05/relogio.png')} style={{width:'100%',height:'100%',objectFit:'cover'}}/>
 </AbsoluteFill>
 <AbsoluteFill style={{background:COR.noite,opacity:.12+.70*progress}}/>
 <AbsoluteFill style={{background:b,opacity:.035+.085*progress,mixBlendMode:'color'}}/>
 {phases.map((phase)=>{
  if(seconds<phase.start||seconds>phase.end+.22)return null;
  const enter=ease((seconds-phase.start)/.30);
  const exit=phase.stage===11?1:1-ease((seconds-phase.end)/.22);
  const settle=ease((seconds-phase.start)/.65);
  return <svg key={phase.stage} width="860" height="385" viewBox="-50 -35 820 365" style={{position:'absolute',left:610,top:545,opacity:enter*exit,transform:`translateY(${(1-settle)*7}px) scale(${.988+.012*settle})`,transformOrigin:'50% 50%',filter:'drop-shadow(0 6px 10px rgba(0,0,0,.18))'}}>
  <Art stage={phase.stage} seconds={seconds} start={phase.start}/>
  </svg>
 })}
 </AbsoluteFill>;
};
const Root:React.FC=()=> <Composition id="inveja-s05-27s" component={AnimatedFilm} width={1920} height={1080} fps={FPS} durationInFrames={DURATION}/>;
registerRoot(Root);
