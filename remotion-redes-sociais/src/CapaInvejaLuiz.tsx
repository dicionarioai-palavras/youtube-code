import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {useFontes} from './componentes/Fontes';
export const CapaInvejaLuiz: React.FC = () => { useFontes(); return <AbsoluteFill style={{background:'#090909'}}><Img src={staticFile('clips/inveja-luiz-o-olho-volta/capa-frame.jpg')} style={{width:'100%',height:'100%',objectFit:'cover',filter:'saturate(0.82) contrast(1.04) brightness(0.97)'}}/><div style={{position:'absolute',left:104,right:90,top:340,fontFamily:'Barlow Condensed',fontWeight:800,fontSize:154,lineHeight:.93,color:'#fff',letterSpacing:1,textShadow:'0 6px 26px rgba(0,0,0,.95)'}}>O OLHO<br/>VOLTA?</div></AbsoluteFill>; };

