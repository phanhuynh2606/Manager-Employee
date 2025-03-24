import{r as a,e as U,M as J,N as Y,O as Z,J as ve,C as X,a9 as ne,f as k,h as Ce,an as ae,K as be,Q as he,aM as se,o as ye,aN as Se}from"./index-CVZjuLi7.js";import{b as xe,L as Oe,O as $e,M as Pe,a as je,g as Ne,x as ze}from"./index-D3eVkrds.js";import{l as we,m as Ee,P as Te,n as Ie,o as Be,q as ke,T as Re,r as Me,s as _e,v as We,u as Ae,p as oe,W as He}from"./index-BjrRxxmI.js";const Q=a.createContext({}),Le=e=>{const{antCls:o,componentCls:r,iconCls:t,avatarBg:n,avatarColor:l,containerSize:s,containerSizeLG:u,containerSizeSM:d,textFontSize:m,textFontSizeLG:c,textFontSizeSM:C,borderRadius:p,borderRadiusLG:f,borderRadiusSM:h,lineWidth:g,lineType:O}=e,P=(i,$,E)=>({width:i,height:i,borderRadius:"50%",[`&${r}-square`]:{borderRadius:E},[`&${r}-icon`]:{fontSize:$,[`> ${t}`]:{margin:0}}});return{[r]:Object.assign(Object.assign(Object.assign(Object.assign({},Y(e)),{position:"relative",display:"inline-flex",justifyContent:"center",alignItems:"center",overflow:"hidden",color:l,whiteSpace:"nowrap",textAlign:"center",verticalAlign:"middle",background:n,border:`${Z(g)} ${O} transparent`,"&-image":{background:"transparent"},[`${o}-image-img`]:{display:"block"}}),P(s,m,p)),{"&-lg":Object.assign({},P(u,c,f)),"&-sm":Object.assign({},P(d,C,h)),"> img":{display:"block",width:"100%",height:"100%",objectFit:"cover"}})}},Ve=e=>{const{componentCls:o,groupBorderColor:r,groupOverlapping:t,groupSpace:n}=e;return{[`${o}-group`]:{display:"inline-flex",[o]:{borderColor:r},"> *:not(:first-child)":{marginInlineStart:t}},[`${o}-group-popover`]:{[`${o} + ${o}`]:{marginInlineStart:n}}}},Fe=e=>{const{controlHeight:o,controlHeightLG:r,controlHeightSM:t,fontSize:n,fontSizeLG:l,fontSizeXL:s,fontSizeHeading3:u,marginXS:d,marginXXS:m,colorBorderBg:c}=e;return{containerSize:o,containerSizeLG:r,containerSizeSM:t,textFontSize:Math.round((l+s)/2),textFontSizeLG:u,textFontSizeSM:n,groupSpace:m,groupOverlapping:-d,groupBorderColor:c}},le=U("Avatar",e=>{const{colorTextLightSolid:o,colorTextPlaceholder:r}=e,t=J(e,{avatarBg:r,avatarColor:o});return[Le(t),Ve(t)]},Fe);var De=function(e,o){var r={};for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&o.indexOf(t)<0&&(r[t]=e[t]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var n=0,t=Object.getOwnPropertySymbols(e);n<t.length;n++)o.indexOf(t[n])<0&&Object.prototype.propertyIsEnumerable.call(e,t[n])&&(r[t[n]]=e[t[n]]);return r};const Ge=(e,o)=>{const[r,t]=a.useState(1),[n,l]=a.useState(!1),[s,u]=a.useState(!0),d=a.useRef(null),m=a.useRef(null),c=ve(o,d),{getPrefixCls:C,avatar:p}=a.useContext(X),f=a.useContext(Q),h=()=>{if(!m.current||!d.current)return;const S=m.current.offsetWidth,x=d.current.offsetWidth;if(S!==0&&x!==0){const{gap:A=4}=e;A*2<x&&t(x-A*2<S?(x-A*2)/S:1)}};a.useEffect(()=>{l(!0)},[]),a.useEffect(()=>{u(!0),t(1)},[e.src]),a.useEffect(h,[e.gap]);const g=()=>{const{onError:S}=e;(S==null?void 0:S())!==!1&&u(!1)},{prefixCls:O,shape:P,size:i,src:$,srcSet:E,icon:j,className:M,rootClassName:b,alt:V,draggable:H,children:T,crossOrigin:B}=e,z=De(e,["prefixCls","shape","size","src","srcSet","icon","className","rootClassName","alt","draggable","children","crossOrigin"]),v=xe(S=>{var x,A;return(A=(x=i??(f==null?void 0:f.size))!==null&&x!==void 0?x:S)!==null&&A!==void 0?A:"default"}),_=Object.keys(typeof v=="object"?v||{}:{}).some(S=>["xs","sm","md","lg","xl","xxl"].includes(S)),W=Oe(_),L=a.useMemo(()=>{if(typeof v!="object")return{};const S=$e.find(A=>W[A]),x=v[S];return x?{width:x,height:x,fontSize:x&&(j||T)?x/2:18}:{}},[W,v]),y=C("avatar",O),w=ne(y),[F,I,N]=le(y,w),R=k({[`${y}-lg`]:v==="large",[`${y}-sm`]:v==="small"}),D=a.isValidElement($),pe=P||(f==null?void 0:f.shape)||"circle",me=k(y,R,p==null?void 0:p.className,`${y}-${pe}`,{[`${y}-image`]:D||$&&s,[`${y}-icon`]:!!j},N,w,M,b,I),fe=typeof v=="number"?{width:v,height:v,fontSize:j?v/2:18}:{};let G;if(typeof $=="string"&&s)G=a.createElement("img",{src:$,draggable:H,srcSet:E,onError:g,alt:V,crossOrigin:B});else if(D)G=$;else if(j)G=j;else if(n||r!==1){const S=`scale(${r})`,x={msTransform:S,WebkitTransform:S,transform:S};G=a.createElement(Pe,{onResize:h},a.createElement("span",{className:`${y}-string`,ref:m,style:Object.assign({},x)},T))}else G=a.createElement("span",{className:`${y}-string`,style:{opacity:0},ref:m},T);return delete z.onError,delete z.gap,F(a.createElement("span",Object.assign({},z,{style:Object.assign(Object.assign(Object.assign(Object.assign({},fe),L),p==null?void 0:p.style),z.style),className:me,ref:c}),G))},ie=a.forwardRef(Ge),K=e=>e?typeof e=="function"?e():e:null,Xe=e=>{const{componentCls:o,popoverColor:r,titleMinWidth:t,fontWeightStrong:n,innerPadding:l,boxShadowSecondary:s,colorTextHeading:u,borderRadiusLG:d,zIndexPopup:m,titleMarginBottom:c,colorBgElevated:C,popoverBg:p,titleBorderBottom:f,innerContentPadding:h,titlePadding:g}=e;return[{[o]:Object.assign(Object.assign({},Y(e)),{position:"absolute",top:0,left:{_skip_check_:!0,value:0},zIndex:m,fontWeight:"normal",whiteSpace:"normal",textAlign:"start",cursor:"auto",userSelect:"text","--valid-offset-x":"var(--arrow-offset-horizontal, var(--arrow-x))",transformOrigin:["var(--valid-offset-x, 50%)","var(--arrow-y, 50%)"].join(" "),"--antd-arrow-background-color":C,width:"max-content",maxWidth:"100vw","&-rtl":{direction:"rtl"},"&-hidden":{display:"none"},[`${o}-content`]:{position:"relative"},[`${o}-inner`]:{backgroundColor:p,backgroundClip:"padding-box",borderRadius:d,boxShadow:s,padding:l},[`${o}-title`]:{minWidth:t,marginBottom:c,color:u,fontWeight:n,borderBottom:f,padding:g},[`${o}-inner-content`]:{color:r,padding:h}})},Ee(e,"var(--antd-arrow-background-color)"),{[`${o}-pure`]:{position:"relative",maxWidth:"none",margin:e.sizePopupArrow,display:"inline-block",[`${o}-content`]:{display:"inline-block"}}}]},qe=e=>{const{componentCls:o}=e;return{[o]:Te.map(r=>{const t=e[`${r}6`];return{[`&${o}-${r}`]:{"--antd-arrow-background-color":t,[`${o}-inner`]:{backgroundColor:t},[`${o}-arrow`]:{background:"transparent"}}}})}},Ke=e=>{const{lineWidth:o,controlHeight:r,fontHeight:t,padding:n,wireframe:l,zIndexPopupBase:s,borderRadiusLG:u,marginXS:d,lineType:m,colorSplit:c,paddingSM:C}=e,p=r-t,f=p/2,h=p/2-o,g=n;return Object.assign(Object.assign(Object.assign({titleMinWidth:177,zIndexPopup:s+30},Ie(e)),Be({contentRadius:u,limitVerticalRadius:!0})),{innerPadding:l?0:12,titleMarginBottom:l?0:d,titlePadding:l?`${f}px ${g}px ${h}px`:0,titleBorderBottom:l?`${o}px ${m} ${c}`:"none",innerContentPadding:l?`${C}px ${g}px`:0})},ce=U("Popover",e=>{const{colorBgElevated:o,colorText:r}=e,t=J(e,{popoverBg:o,popoverColor:r});return[Xe(t),qe(t),we(t,"zoom-big")]},Ke,{resetStyle:!1,deprecatedTokens:[["width","titleMinWidth"],["minWidth","titleMinWidth"]]});var Qe=function(e,o){var r={};for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&o.indexOf(t)<0&&(r[t]=e[t]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var n=0,t=Object.getOwnPropertySymbols(e);n<t.length;n++)o.indexOf(t[n])<0&&Object.prototype.propertyIsEnumerable.call(e,t[n])&&(r[t[n]]=e[t[n]]);return r};const de=e=>{let{title:o,content:r,prefixCls:t}=e;return!o&&!r?null:a.createElement(a.Fragment,null,o&&a.createElement("div",{className:`${t}-title`},o),r&&a.createElement("div",{className:`${t}-inner-content`},r))},Ue=e=>{const{hashId:o,prefixCls:r,className:t,style:n,placement:l="top",title:s,content:u,children:d}=e,m=K(s),c=K(u),C=k(o,r,`${r}-pure`,`${r}-placement-${l}`,t);return a.createElement("div",{className:C,style:n},a.createElement("div",{className:`${r}-arrow`}),a.createElement(ke,Object.assign({},e,{className:o,prefixCls:r}),d||a.createElement(de,{prefixCls:r,title:m,content:c})))},Je=e=>{const{prefixCls:o,className:r}=e,t=Qe(e,["prefixCls","className"]),{getPrefixCls:n}=a.useContext(X),l=n("popover",o),[s,u,d]=ce(l);return s(a.createElement(Ue,Object.assign({},t,{prefixCls:l,hashId:u,className:k(r,d)})))};var Ye=function(e,o){var r={};for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&o.indexOf(t)<0&&(r[t]=e[t]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var n=0,t=Object.getOwnPropertySymbols(e);n<t.length;n++)o.indexOf(t[n])<0&&Object.prototype.propertyIsEnumerable.call(e,t[n])&&(r[t[n]]=e[t[n]]);return r};const Ze=a.forwardRef((e,o)=>{var r,t;const{prefixCls:n,title:l,content:s,overlayClassName:u,placement:d="top",trigger:m="hover",children:c,mouseEnterDelay:C=.1,mouseLeaveDelay:p=.1,onOpenChange:f,overlayStyle:h={},styles:g,classNames:O}=e,P=Ye(e,["prefixCls","title","content","overlayClassName","placement","trigger","children","mouseEnterDelay","mouseLeaveDelay","onOpenChange","overlayStyle","styles","classNames"]),{getPrefixCls:i,className:$,style:E,classNames:j,styles:M}=Ce("popover"),b=i("popover",n),[V,H,T]=ce(b),B=i(),z=k(u,H,T,$,j.root,O==null?void 0:O.root),v=k(j.body,O==null?void 0:O.body),[_,W]=je(!1,{value:(r=e.open)!==null&&r!==void 0?r:e.visible,defaultValue:(t=e.defaultOpen)!==null&&t!==void 0?t:e.defaultVisible}),L=(N,R)=>{W(N,!0),f==null||f(N,R)},y=N=>{N.keyCode===be.ESC&&L(!1,N)},w=N=>{L(N)},F=K(l),I=K(s);return V(a.createElement(Re,Object.assign({placement:d,trigger:m,mouseEnterDelay:C,mouseLeaveDelay:p},P,{prefixCls:b,classNames:{root:z,body:v},styles:{root:Object.assign(Object.assign(Object.assign(Object.assign({},M.root),E),h),g==null?void 0:g.root),body:Object.assign(Object.assign({},M.body),g==null?void 0:g.body)},ref:o,open:_,onOpenChange:w,overlay:F||I?a.createElement(de,{prefixCls:b,title:F,content:I}):null,transitionName:Ne(B,"zoom-big",P.transitionName),"data-popover-inject":!0}),ae(c,{onKeyDown:N=>{var R,D;a.isValidElement(c)&&((D=c==null?void 0:(R=c.props).onKeyDown)===null||D===void 0||D.call(R,N)),y(N)}})))}),ge=Ze;ge._InternalPanelDoNotUseOrYouWillBeFired=Je;const re=e=>{const{size:o,shape:r}=a.useContext(Q),t=a.useMemo(()=>({size:e.size||o,shape:e.shape||r}),[e.size,e.shape,o,r]);return a.createElement(Q.Provider,{value:t},e.children)},et=e=>{var o,r,t,n;const{getPrefixCls:l,direction:s}=a.useContext(X),{prefixCls:u,className:d,rootClassName:m,style:c,maxCount:C,maxStyle:p,size:f,shape:h,maxPopoverPlacement:g,maxPopoverTrigger:O,children:P,max:i}=e,$=l("avatar",u),E=`${$}-group`,j=ne($),[M,b,V]=le($,j),H=k(E,{[`${E}-rtl`]:s==="rtl"},V,j,d,m,b),T=ze(P).map((v,_)=>ae(v,{key:`avatar-key-${_}`})),B=(i==null?void 0:i.count)||C,z=T.length;if(B&&B<z){const v=T.slice(0,B),_=T.slice(B,z),W=(i==null?void 0:i.style)||p,L=((o=i==null?void 0:i.popover)===null||o===void 0?void 0:o.trigger)||O||"hover",y=((r=i==null?void 0:i.popover)===null||r===void 0?void 0:r.placement)||g||"top",w=Object.assign(Object.assign({content:_},i==null?void 0:i.popover),{classNames:{root:k(`${E}-popover`,(n=(t=i==null?void 0:i.popover)===null||t===void 0?void 0:t.classNames)===null||n===void 0?void 0:n.root)},placement:y,trigger:L});return v.push(a.createElement(ge,Object.assign({key:"avatar-popover-key",destroyTooltipOnHide:!0},w),a.createElement(ie,{style:W},`+${z-B}`))),M(a.createElement(re,{shape:h,size:f},a.createElement("div",{className:H,style:c},v)))}return M(a.createElement(re,{shape:h,size:f},a.createElement("div",{className:H,style:c},T)))},tt=ie;tt.Group=et;const ot=e=>{const{paddingXXS:o,lineWidth:r,tagPaddingHorizontal:t,componentCls:n,calc:l}=e,s=l(t).sub(r).equal(),u=l(o).sub(r).equal();return{[n]:Object.assign(Object.assign({},Y(e)),{display:"inline-block",height:"auto",marginInlineEnd:e.marginXS,paddingInline:s,fontSize:e.tagFontSize,lineHeight:e.tagLineHeight,whiteSpace:"nowrap",background:e.defaultBg,border:`${Z(e.lineWidth)} ${e.lineType} ${e.colorBorder}`,borderRadius:e.borderRadiusSM,opacity:1,transition:`all ${e.motionDurationMid}`,textAlign:"start",position:"relative",[`&${n}-rtl`]:{direction:"rtl"},"&, a, a:hover":{color:e.defaultColor},[`${n}-close-icon`]:{marginInlineStart:u,fontSize:e.tagIconSize,color:e.colorTextDescription,cursor:"pointer",transition:`all ${e.motionDurationMid}`,"&:hover":{color:e.colorTextHeading}},[`&${n}-has-color`]:{borderColor:"transparent",[`&, a, a:hover, ${e.iconCls}-close, ${e.iconCls}-close:hover`]:{color:e.colorTextLightSolid}},"&-checkable":{backgroundColor:"transparent",borderColor:"transparent",cursor:"pointer",[`&:not(${n}-checkable-checked):hover`]:{color:e.colorPrimary,backgroundColor:e.colorFillSecondary},"&:active, &-checked":{color:e.colorTextLightSolid},"&-checked":{backgroundColor:e.colorPrimary,"&:hover":{backgroundColor:e.colorPrimaryHover}},"&:active":{backgroundColor:e.colorPrimaryActive}},"&-hidden":{display:"none"},[`> ${e.iconCls} + span, > span + ${e.iconCls}`]:{marginInlineStart:s}}),[`${n}-borderless`]:{borderColor:"transparent",background:e.tagBorderlessBg}}},ee=e=>{const{lineWidth:o,fontSizeIcon:r,calc:t}=e,n=e.fontSizeSM;return J(e,{tagFontSize:n,tagLineHeight:Z(t(e.lineHeightSM).mul(n).equal()),tagIconSize:t(r).sub(t(o).mul(2)).equal(),tagPaddingHorizontal:8,tagBorderlessBg:e.defaultBg})},te=e=>({defaultBg:new he(e.colorFillQuaternary).onBackground(e.colorBgContainer).toHexString(),defaultColor:e.colorText}),ue=U("Tag",e=>{const o=ee(e);return ot(o)},te);var rt=function(e,o){var r={};for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&o.indexOf(t)<0&&(r[t]=e[t]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var n=0,t=Object.getOwnPropertySymbols(e);n<t.length;n++)o.indexOf(t[n])<0&&Object.prototype.propertyIsEnumerable.call(e,t[n])&&(r[t[n]]=e[t[n]]);return r};const nt=a.forwardRef((e,o)=>{const{prefixCls:r,style:t,className:n,checked:l,onChange:s,onClick:u}=e,d=rt(e,["prefixCls","style","className","checked","onChange","onClick"]),{getPrefixCls:m,tag:c}=a.useContext(X),C=P=>{s==null||s(!l),u==null||u(P)},p=m("tag",r),[f,h,g]=ue(p),O=k(p,`${p}-checkable`,{[`${p}-checkable-checked`]:l},c==null?void 0:c.className,n,h,g);return f(a.createElement("span",Object.assign({},d,{ref:o,style:Object.assign(Object.assign({},t),c==null?void 0:c.style),className:O,onClick:C})))}),at=e=>Me(e,(o,r)=>{let{textColor:t,lightBorderColor:n,lightColor:l,darkColor:s}=r;return{[`${e.componentCls}${e.componentCls}-${o}`]:{color:t,background:l,borderColor:n,"&-inverse":{color:e.colorTextLightSolid,background:s,borderColor:s},[`&${e.componentCls}-borderless`]:{borderColor:"transparent"}}}}),st=se(["Tag","preset"],e=>{const o=ee(e);return at(o)},te);function lt(e){return typeof e!="string"?e:e.charAt(0).toUpperCase()+e.slice(1)}const q=(e,o,r)=>{const t=lt(r);return{[`${e.componentCls}${e.componentCls}-${o}`]:{color:e[`color${r}`],background:e[`color${t}Bg`],borderColor:e[`color${t}Border`],[`&${e.componentCls}-borderless`]:{borderColor:"transparent"}}}},it=se(["Tag","status"],e=>{const o=ee(e);return[q(o,"success","Success"),q(o,"processing","Info"),q(o,"error","Error"),q(o,"warning","Warning")]},te);var ct=function(e,o){var r={};for(var t in e)Object.prototype.hasOwnProperty.call(e,t)&&o.indexOf(t)<0&&(r[t]=e[t]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var n=0,t=Object.getOwnPropertySymbols(e);n<t.length;n++)o.indexOf(t[n])<0&&Object.prototype.propertyIsEnumerable.call(e,t[n])&&(r[t[n]]=e[t[n]]);return r};const dt=a.forwardRef((e,o)=>{const{prefixCls:r,className:t,rootClassName:n,style:l,children:s,icon:u,color:d,onClose:m,bordered:c=!0,visible:C}=e,p=ct(e,["prefixCls","className","rootClassName","style","children","icon","color","onClose","bordered","visible"]),{getPrefixCls:f,direction:h,tag:g}=a.useContext(X),[O,P]=a.useState(!0),i=ye(p,["closeIcon","closable"]);a.useEffect(()=>{C!==void 0&&P(C)},[C]);const $=_e(d),E=We(d),j=$||E,M=Object.assign(Object.assign({backgroundColor:d&&!j?d:void 0},g==null?void 0:g.style),l),b=f("tag",r),[V,H,T]=ue(b),B=k(b,g==null?void 0:g.className,{[`${b}-${d}`]:j,[`${b}-has-color`]:d&&!j,[`${b}-hidden`]:!O,[`${b}-rtl`]:h==="rtl",[`${b}-borderless`]:!c},t,n,H,T),z=w=>{w.stopPropagation(),m==null||m(w),!w.defaultPrevented&&P(!1)},[,v]=Ae(oe(e),oe(g),{closable:!1,closeIconRender:w=>{const F=a.createElement("span",{className:`${b}-close-icon`,onClick:z},w);return Se(w,F,I=>({onClick:N=>{var R;(R=I==null?void 0:I.onClick)===null||R===void 0||R.call(I,N),z(N)},className:k(I==null?void 0:I.className,`${b}-close-icon`)}))}}),_=typeof p.onClick=="function"||s&&s.type==="a",W=u||null,L=W?a.createElement(a.Fragment,null,W,s&&a.createElement("span",null,s)):s,y=a.createElement("span",Object.assign({},i,{ref:o,className:B,style:M}),L,v,$&&a.createElement(st,{key:"preset",prefixCls:b}),E&&a.createElement(it,{key:"status",prefixCls:b}));return V(_?a.createElement(He,{component:"Tag"},y):y)}),gt=dt;gt.CheckableTag=nt;export{tt as A,Je as P,gt as T,ge as a,K as g};
