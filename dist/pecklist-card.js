/* PeckList card 0.1.0 - MIT - https://github.com/KillSwitchIO/pecklist-card */
var q=globalThis,G=q.ShadowRoot&&(q.ShadyCSS===void 0||q.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,X=Symbol(),wt=new WeakMap,O=class{constructor(s,t,e){if(this._$cssResult$=!0,e!==X)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=s,this.t=t}get styleSheet(){let s=this.o,t=this.t;if(G&&s===void 0){let e=t!==void 0&&t.length===1;e&&(s=wt.get(t)),s===void 0&&((this.o=s=new CSSStyleSheet).replaceSync(this.cssText),e&&wt.set(t,s))}return s}toString(){return this.cssText}},kt=o=>new O(typeof o=="string"?o:o+"",void 0,X),tt=(o,...s)=>{let t=o.length===1?o[0]:s.reduce((e,n,i)=>e+(a=>{if(a._$cssResult$===!0)return a.cssText;if(typeof a=="number")return a;throw Error("Value passed to 'css' function must be a 'css' function result: "+a+". Use 'unsafeCSS' to pass non-literal values, but take care to ensure page security.")})(n)+o[i+1],o[0]);return new O(t,o,X)},At=(o,s)=>{if(G)o.adoptedStyleSheets=s.map(t=>t instanceof CSSStyleSheet?t:t.styleSheet);else for(let t of s){let e=document.createElement("style"),n=q.litNonce;n!==void 0&&e.setAttribute("nonce",n),e.textContent=t.cssText,o.appendChild(e)}},et=G?o=>o:o=>o instanceof CSSStyleSheet?(s=>{let t="";for(let e of s.cssRules)t+=e.cssText;return kt(t)})(o):o;var{is:ee,defineProperty:se,getOwnPropertyDescriptor:ne,getOwnPropertyNames:ie,getOwnPropertySymbols:ae,getPrototypeOf:oe}=Object,K=globalThis,St=K.trustedTypes,re=St?St.emptyScript:"",le=K.reactiveElementPolyfillSupport,U=(o,s)=>o,st={toAttribute(o,s){switch(s){case Boolean:o=o?re:null;break;case Object:case Array:o=o==null?o:JSON.stringify(o)}return o},fromAttribute(o,s){let t=o;switch(s){case Boolean:t=o!==null;break;case Number:t=o===null?null:Number(o);break;case Object:case Array:try{t=JSON.parse(o)}catch{t=null}}return t}},Ct=(o,s)=>!ee(o,s),Et={attribute:!0,type:String,converter:st,reflect:!1,useDefault:!1,hasChanged:Ct};Symbol.metadata??=Symbol("metadata"),K.litPropertyMetadata??=new WeakMap;var x=class extends HTMLElement{static addInitializer(s){this._$Ei(),(this.l??=[]).push(s)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(s,t=Et){if(t.state&&(t.attribute=!1),this._$Ei(),this.prototype.hasOwnProperty(s)&&((t=Object.create(t)).wrapped=!0),this.elementProperties.set(s,t),!t.noAccessor){let e=Symbol(),n=this.getPropertyDescriptor(s,e,t);n!==void 0&&se(this.prototype,s,n)}}static getPropertyDescriptor(s,t,e){let{get:n,set:i}=ne(this.prototype,s)??{get(){return this[t]},set(a){this[t]=a}};return{get:n,set(a){let l=n?.call(this);i?.call(this,a),this.requestUpdate(s,l,e)},configurable:!0,enumerable:!0}}static getPropertyOptions(s){return this.elementProperties.get(s)??Et}static _$Ei(){if(this.hasOwnProperty(U("elementProperties")))return;let s=oe(this);s.finalize(),s.l!==void 0&&(this.l=[...s.l]),this.elementProperties=new Map(s.elementProperties)}static finalize(){if(this.hasOwnProperty(U("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(U("properties"))){let t=this.properties,e=[...ie(t),...ae(t)];for(let n of e)this.createProperty(n,t[n])}let s=this[Symbol.metadata];if(s!==null){let t=litPropertyMetadata.get(s);if(t!==void 0)for(let[e,n]of t)this.elementProperties.set(e,n)}this._$Eh=new Map;for(let[t,e]of this.elementProperties){let n=this._$Eu(t,e);n!==void 0&&this._$Eh.set(n,t)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(s){let t=[];if(Array.isArray(s)){let e=new Set(s.flat(1/0).reverse());for(let n of e)t.unshift(et(n))}else s!==void 0&&t.push(et(s));return t}static _$Eu(s,t){let e=t.attribute;return e===!1?void 0:typeof e=="string"?e:typeof s=="string"?s.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){this._$ES=new Promise(s=>this.enableUpdating=s),this._$AL=new Map,this._$E_(),this.requestUpdate(),this.constructor.l?.forEach(s=>s(this))}addController(s){(this._$EO??=new Set).add(s),this.renderRoot!==void 0&&this.isConnected&&s.hostConnected?.()}removeController(s){this._$EO?.delete(s)}_$E_(){let s=new Map,t=this.constructor.elementProperties;for(let e of t.keys())this.hasOwnProperty(e)&&(s.set(e,this[e]),delete this[e]);s.size>0&&(this._$Ep=s)}createRenderRoot(){let s=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return At(s,this.constructor.elementStyles),s}connectedCallback(){this.renderRoot??=this.createRenderRoot(),this.enableUpdating(!0),this._$EO?.forEach(s=>s.hostConnected?.())}enableUpdating(s){}disconnectedCallback(){this._$EO?.forEach(s=>s.hostDisconnected?.())}attributeChangedCallback(s,t,e){this._$AK(s,e)}_$ET(s,t){let e=this.constructor.elementProperties.get(s),n=this.constructor._$Eu(s,e);if(n!==void 0&&e.reflect===!0){let i=(e.converter?.toAttribute!==void 0?e.converter:st).toAttribute(t,e.type);this._$Em=s,i==null?this.removeAttribute(n):this.setAttribute(n,i),this._$Em=null}}_$AK(s,t){let e=this.constructor,n=e._$Eh.get(s);if(n!==void 0&&this._$Em!==n){let i=e.getPropertyOptions(n),a=typeof i.converter=="function"?{fromAttribute:i.converter}:i.converter?.fromAttribute!==void 0?i.converter:st;this._$Em=n;let l=a.fromAttribute(t,i.type);this[n]=l??this._$Ej?.get(n)??l,this._$Em=null}}requestUpdate(s,t,e,n=!1,i){if(s!==void 0){let a=this.constructor;if(n===!1&&(i=this[s]),e??=a.getPropertyOptions(s),!((e.hasChanged??Ct)(i,t)||e.useDefault&&e.reflect&&i===this._$Ej?.get(s)&&!this.hasAttribute(a._$Eu(s,e))))return;this.C(s,t,e)}this.isUpdatePending===!1&&(this._$ES=this._$EP())}C(s,t,{useDefault:e,reflect:n,wrapped:i},a){e&&!(this._$Ej??=new Map).has(s)&&(this._$Ej.set(s,a??t??this[s]),i!==!0||a!==void 0)||(this._$AL.has(s)||(this.hasUpdated||e||(t=void 0),this._$AL.set(s,t)),n===!0&&this._$Em!==s&&(this._$Eq??=new Set).add(s))}async _$EP(){this.isUpdatePending=!0;try{await this._$ES}catch(t){Promise.reject(t)}let s=this.scheduleUpdate();return s!=null&&await s,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??=this.createRenderRoot(),this._$Ep){for(let[n,i]of this._$Ep)this[n]=i;this._$Ep=void 0}let e=this.constructor.elementProperties;if(e.size>0)for(let[n,i]of e){let{wrapped:a}=i,l=this[n];a!==!0||this._$AL.has(n)||l===void 0||this.C(n,void 0,i,l)}}let s=!1,t=this._$AL;try{s=this.shouldUpdate(t),s?(this.willUpdate(t),this._$EO?.forEach(e=>e.hostUpdate?.()),this.update(t)):this._$EM()}catch(e){throw s=!1,this._$EM(),e}s&&this._$AE(t)}willUpdate(s){}_$AE(s){this._$EO?.forEach(t=>t.hostUpdated?.()),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(s)),this.updated(s)}_$EM(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(s){return!0}update(s){this._$Eq&&=this._$Eq.forEach(t=>this._$ET(t,this[t])),this._$EM()}updated(s){}firstUpdated(s){}};x.elementStyles=[],x.shadowRootOptions={mode:"open"},x[U("elementProperties")]=new Map,x[U("finalized")]=new Map,le?.({ReactiveElement:x}),(K.reactiveElementVersions??=[]).push("2.1.2");var ct=globalThis,It=o=>o,Z=ct.trustedTypes,Tt=Z?Z.createPolicy("lit-html",{createHTML:o=>o}):void 0,Ht="$lit$",A=`lit$${Math.random().toFixed(9).slice(2)}$`,zt="?"+A,ce=`<${zt}>`,T=document,j=()=>T.createComment(""),W=o=>o===null||typeof o!="object"&&typeof o!="function",dt=Array.isArray,de=o=>dt(o)||typeof o?.[Symbol.iterator]=="function",nt=`[ 	
\f\r]`,N=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Rt=/-->/g,Pt=/>/g,C=RegExp(`>|${nt}(?:([^\\s"'>=/]+)(${nt}*=${nt}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Mt=/'/g,Dt=/"/g,Ot=/^(?:script|style|textarea|title)$/i,pt=o=>(s,...t)=>({_$litType$:o,strings:s,values:t}),h=pt(1),Ut=pt(2),Ee=pt(3),R=Symbol.for("lit-noChange"),u=Symbol.for("lit-nothing"),Lt=new WeakMap,I=T.createTreeWalker(T,129);function Nt(o,s){if(!dt(o)||!o.hasOwnProperty("raw"))throw Error("invalid template strings array");return Tt!==void 0?Tt.createHTML(s):s}var pe=(o,s)=>{let t=o.length-1,e=[],n,i=s===2?"<svg>":s===3?"<math>":"",a=N;for(let l=0;l<t;l++){let r=o[l],c,d,p=-1,m=0;for(;m<r.length&&(a.lastIndex=m,d=a.exec(r),d!==null);)m=a.lastIndex,a===N?d[1]==="!--"?a=Rt:d[1]!==void 0?a=Pt:d[2]!==void 0?(Ot.test(d[2])&&(n=RegExp("</"+d[2],"g")),a=C):d[3]!==void 0&&(a=C):a===C?d[0]===">"?(a=n??N,p=-1):d[1]===void 0?p=-2:(p=a.lastIndex-d[2].length,c=d[1],a=d[3]===void 0?C:d[3]==='"'?Dt:Mt):a===Dt||a===Mt?a=C:a===Rt||a===Pt?a=N:(a=C,n=void 0);let y=a===C&&o[l+1].startsWith("/>")?" ":"";i+=a===N?r+ce:p>=0?(e.push(c),r.slice(0,p)+Ht+r.slice(p)+A+y):r+A+(p===-2?l:y)}return[Nt(o,i+(o[t]||"<?>")+(s===2?"</svg>":s===3?"</math>":"")),e]},B=class o{constructor({strings:s,_$litType$:t},e){let n;this.parts=[];let i=0,a=0,l=s.length-1,r=this.parts,[c,d]=pe(s,t);if(this.el=o.createElement(c,e),I.currentNode=this.el.content,t===2||t===3){let p=this.el.content.firstChild;p.replaceWith(...p.childNodes)}for(;(n=I.nextNode())!==null&&r.length<l;){if(n.nodeType===1){if(n.hasAttributes())for(let p of n.getAttributeNames())if(p.endsWith(Ht)){let m=d[a++],y=n.getAttribute(p).split(A),g=/([.?@])?(.*)/.exec(m);r.push({type:1,index:i,name:g[2],strings:y,ctor:g[1]==="."?at:g[1]==="?"?ot:g[1]==="@"?rt:M}),n.removeAttribute(p)}else p.startsWith(A)&&(r.push({type:6,index:i}),n.removeAttribute(p));if(Ot.test(n.tagName)){let p=n.textContent.split(A),m=p.length-1;if(m>0){n.textContent=Z?Z.emptyScript:"";for(let y=0;y<m;y++)n.append(p[y],j()),I.nextNode(),r.push({type:2,index:++i});n.append(p[m],j())}}}else if(n.nodeType===8)if(n.data===zt)r.push({type:2,index:i});else{let p=-1;for(;(p=n.data.indexOf(A,p+1))!==-1;)r.push({type:7,index:i}),p+=A.length-1}i++}}static createElement(s,t){let e=T.createElement("template");return e.innerHTML=s,e}};function P(o,s,t=o,e){if(s===R)return s;let n=e!==void 0?t._$Co?.[e]:t._$Cl,i=W(s)?void 0:s._$litDirective$;return n?.constructor!==i&&(n?._$AO?.(!1),i===void 0?n=void 0:(n=new i(o),n._$AT(o,t,e)),e!==void 0?(t._$Co??=[])[e]=n:t._$Cl=n),n!==void 0&&(s=P(o,n._$AS(o,s.values),n,e)),s}var it=class{constructor(s,t){this._$AV=[],this._$AN=void 0,this._$AD=s,this._$AM=t}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(s){let{el:{content:t},parts:e}=this._$AD,n=(s?.creationScope??T).importNode(t,!0);I.currentNode=n;let i=I.nextNode(),a=0,l=0,r=e[0];for(;r!==void 0;){if(a===r.index){let c;r.type===2?c=new V(i,i.nextSibling,this,s):r.type===1?c=new r.ctor(i,r.name,r.strings,this,s):r.type===6&&(c=new lt(i,this,s)),this._$AV.push(c),r=e[++l]}a!==r?.index&&(i=I.nextNode(),a++)}return I.currentNode=T,n}p(s){let t=0;for(let e of this._$AV)e!==void 0&&(e.strings!==void 0?(e._$AI(s,e,t),t+=e.strings.length-2):e._$AI(s[t])),t++}},V=class o{get _$AU(){return this._$AM?._$AU??this._$Cv}constructor(s,t,e,n){this.type=2,this._$AH=u,this._$AN=void 0,this._$AA=s,this._$AB=t,this._$AM=e,this.options=n,this._$Cv=n?.isConnected??!0}get parentNode(){let s=this._$AA.parentNode,t=this._$AM;return t!==void 0&&s?.nodeType===11&&(s=t.parentNode),s}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(s,t=this){s=P(this,s,t),W(s)?s===u||s==null||s===""?(this._$AH!==u&&this._$AR(),this._$AH=u):s!==this._$AH&&s!==R&&this._(s):s._$litType$!==void 0?this.$(s):s.nodeType!==void 0?this.T(s):de(s)?this.k(s):this._(s)}O(s){return this._$AA.parentNode.insertBefore(s,this._$AB)}T(s){this._$AH!==s&&(this._$AR(),this._$AH=this.O(s))}_(s){this._$AH!==u&&W(this._$AH)?this._$AA.nextSibling.data=s:this.T(T.createTextNode(s)),this._$AH=s}$(s){let{values:t,_$litType$:e}=s,n=typeof e=="number"?this._$AC(s):(e.el===void 0&&(e.el=B.createElement(Nt(e.h,e.h[0]),this.options)),e);if(this._$AH?._$AD===n)this._$AH.p(t);else{let i=new it(n,this),a=i.u(this.options);i.p(t),this.T(a),this._$AH=i}}_$AC(s){let t=Lt.get(s.strings);return t===void 0&&Lt.set(s.strings,t=new B(s)),t}k(s){dt(this._$AH)||(this._$AH=[],this._$AR());let t=this._$AH,e,n=0;for(let i of s)n===t.length?t.push(e=new o(this.O(j()),this.O(j()),this,this.options)):e=t[n],e._$AI(i),n++;n<t.length&&(this._$AR(e&&e._$AB.nextSibling,n),t.length=n)}_$AR(s=this._$AA.nextSibling,t){for(this._$AP?.(!1,!0,t);s!==this._$AB;){let e=It(s).nextSibling;It(s).remove(),s=e}}setConnected(s){this._$AM===void 0&&(this._$Cv=s,this._$AP?.(s))}},M=class{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(s,t,e,n,i){this.type=1,this._$AH=u,this._$AN=void 0,this.element=s,this.name=t,this._$AM=n,this.options=i,e.length>2||e[0]!==""||e[1]!==""?(this._$AH=Array(e.length-1).fill(new String),this.strings=e):this._$AH=u}_$AI(s,t=this,e,n){let i=this.strings,a=!1;if(i===void 0)s=P(this,s,t,0),a=!W(s)||s!==this._$AH&&s!==R,a&&(this._$AH=s);else{let l=s,r,c;for(s=i[0],r=0;r<i.length-1;r++)c=P(this,l[e+r],t,r),c===R&&(c=this._$AH[r]),a||=!W(c)||c!==this._$AH[r],c===u?s=u:s!==u&&(s+=(c??"")+i[r+1]),this._$AH[r]=c}a&&!n&&this.j(s)}j(s){s===u?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,s??"")}},at=class extends M{constructor(){super(...arguments),this.type=3}j(s){this.element[this.name]=s===u?void 0:s}},ot=class extends M{constructor(){super(...arguments),this.type=4}j(s){this.element.toggleAttribute(this.name,!!s&&s!==u)}},rt=class extends M{constructor(s,t,e,n,i){super(s,t,e,n,i),this.type=5}_$AI(s,t=this){if((s=P(this,s,t,0)??u)===R)return;let e=this._$AH,n=s===u&&e!==u||s.capture!==e.capture||s.once!==e.once||s.passive!==e.passive,i=s!==u&&(e===u||n);n&&this.element.removeEventListener(this.name,this,e),i&&this.element.addEventListener(this.name,this,s),this._$AH=s}handleEvent(s){typeof this._$AH=="function"?this._$AH.call(this.options?.host??this.element,s):this._$AH.handleEvent(s)}},lt=class{constructor(s,t,e){this.element=s,this.type=6,this._$AN=void 0,this._$AM=t,this.options=e}get _$AU(){return this._$AM._$AU}_$AI(s){P(this,s)}};var he=ct.litHtmlPolyfillSupport;he?.(B,V),(ct.litHtmlVersions??=[]).push("3.3.3");var jt=(o,s,t)=>{let e=t?.renderBefore??s,n=e._$litPart$;if(n===void 0){let i=t?.renderBefore??null;e._$litPart$=n=new V(s.insertBefore(j(),i),i,void 0,t??{})}return n._$AI(o),n};var ht=globalThis,b=class extends x{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){let s=super.createRenderRoot();return this.renderOptions.renderBefore??=s.firstChild,s}update(s){let t=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(s),this._$Do=jt(t,this.renderRoot,this.renderOptions)}connectedCallback(){super.connectedCallback(),this._$Do?.setConnected(!0)}disconnectedCallback(){super.disconnectedCallback(),this._$Do?.setConnected(!1)}render(){return R}};b._$litElement$=!0,b.finalized=!0,ht.litElementHydrateSupport?.({LitElement:b});var ue=ht.litElementPolyfillSupport;ue?.({LitElement:b});(ht.litElementVersions??=[]).push("4.2.2");var _={view:"glance",scope:"all",sort:"date",density:"comfortable",colors:"theme",max_items:5,days:7,range:"month"},Wt=["#4C8BF5","#E0679A","#E3A23B","#3BA99C","#9A6FE0","#7BA23F","#D9776B","#5E6AD2"];function Bt(o,s,t={}){return s.map(e=>{let n=o.findIndex(a=>a.entry_id===e),i=o[n];return i?{entryId:e,name:i.name||i.username||i.title,color:t[e]??Wt[n%Wt.length]}:null}).filter(e=>e!==null)}function J(o,s=new Date){try{return new Intl.DateTimeFormat("en-CA",{timeZone:o,year:"numeric",month:"2-digit",day:"2-digit"}).format(s)}catch{return new Intl.DateTimeFormat("en-CA",{year:"numeric",month:"2-digit",day:"2-digit"}).format(s)}}function D(o){let[s,t,e]=o.split("-").map(Number);return new Date(Date.UTC(s??1970,(t??1)-1,e??1))}function Vt(o){return o.toISOString().slice(0,10)}function S(o,s){let t=D(o);return t.setUTCDate(t.getUTCDate()+s),Vt(t)}function Y(o,s){let t=D(o.slice(0,7)+"-01");return t.setUTCMonth(t.getUTCMonth()+s),Vt(t)}function ge(o){return D(o).getUTCDay()}function me(o,s){return Math.round((D(s).getTime()-D(o).getTime())/864e5)}function v(o,s,t){return new Intl.DateTimeFormat(s,{...t,timeZone:"UTC"}).format(D(o))}function L(o,s,t){let e=me(s,o);if(e>=-1&&e<=1){let n=new Intl.RelativeTimeFormat(t,{numeric:"auto"}).format(e,"day");return n.charAt(0).toUpperCase()+n.slice(1)}return e>1&&e<7?v(o,t,{weekday:"long"}):v(o,t,{month:"short",day:"numeric",...o.slice(0,4)===s.slice(0,4)?{}:{year:"numeric"}})}function ut(o,s){let[t,e]=o.split(":").map(Number);return new Intl.DateTimeFormat(s,{hour:"numeric",minute:"2-digit",timeZone:"UTC"}).format(new Date(Date.UTC(2e3,0,1,t??0,e??0)))}function Ft(o){let s=o.due?.at??null,t=s?"due":o.schedule?.start?"schedule":null,e=s??o.schedule?.start??null;return!e||!/^\d{4}-\d{2}-\d{2}/u.test(e)?{day:null,time:null,field:null}:{day:e.slice(0,10),time:e.length>=16?e.slice(11,16):null,field:t}}function gt(o,s,t){let{field:e}=Ft(o);if(!s)return e?{[e]:null}:{};let n=t?`${s}T${t}`:s;return e==="due"?{due:{at:n,allDay:!t}}:{schedule:{start:n,end:null,allDay:!t}}}function fe(o){let s=(l,r)=>l.task.title.localeCompare(r.task.title,void 0,{sensitivity:"base"}),t=(l,r)=>(l.day??"9999").localeCompare(r.day??"9999")||(l.time??"").localeCompare(r.time??""),e=(l,r)=>r.task.priority-l.task.priority,a=o==="priority"?[e,t,s]:o==="title"?[s,t]:o==="created"?[(l,r)=>(r.task.createdAt??"").localeCompare(l.task.createdAt??""),s]:o==="manual"?[(l,r)=>{let c=l.task.order??"\uFFFF",d=r.task.order??"\uFFFF";return c<d?-1:c>d?1:0},t,s]:[t,e,s];return(l,r)=>{if(l.open!==r.open)return l.open?-1:1;for(let c of a){let d=c(l,r);if(d)return d}return l.task.id.localeCompare(r.task.id)}}function H(o,s,t=null){let e=new Map,n=new Set(s.lists??[]),i=(s.tags??[]).map(d=>d.toLowerCase()),a=s.scope??_.scope;for(let d of o){let p=new Map(d.lists.map(y=>[y.id,y])),m=`user:${d.account.user_id}`;for(let y of d.tasks){let g=p.get(y.listId??"")??null;if(!g||n.size&&!n.has(g.id)||a==="own"&&g.role!=="owner"||a==="assigned"&&!y.assignees.includes(m)||i.length&&!y.tags.some($t=>i.some(xt=>$t.toLowerCase()===xt||$t.toLowerCase().startsWith(xt+"/"))))continue;let f=y.status==="open";if(!f&&!s.show_completed)continue;let F=d.account.can_write&&(g.role==="owner"||g.role==="editor"),z=e.get(y.id);if(z){z.seenBy.push(d.account.entry_id),!z.canWrite&&F&&(z.entryId=d.account.entry_id,z.canWrite=!0);continue}let{day:Xt,time:te}=Ft(y);e.set(y.id,{task:y,entryId:d.account.entry_id,seenBy:[d.account.entry_id],owners:[],others:[],list:g,day:Xt,time:te,open:f,canWrite:F})}}let l=new Map(o.map(d=>[`user:${d.account.user_id}`,d.account.entry_id])),r=new Map(o.flatMap(d=>(d.people??[]).map(p=>[p.id,p.name])));for(let d of e.values()){let p=d.task.assignees.map(m=>l.get(m)).filter(m=>!!m);d.owners=p.length?p:d.seenBy,d.others=d.task.assignees.filter(m=>!l.has(m)).map(m=>r.get(m)).filter(m=>!!m)}return(t?[...e.values()].filter(d=>d.owners.includes(t)):[...e.values()]).sort(fe(s.sort??_.sort))}function Q(o,s,t,e){let n=o.filter(p=>p.open),i=S(s,t),a=n.filter(p=>p.day!==null&&p.day<s),l=n.filter(p=>p.day===s),r=n.filter(p=>p.day!==null&&p.day>s&&p.day<=i),c=[...a,...l,...r],d=n.filter(p=>p.day===null);return{overdue:a,today:l,upcoming:r,next:[...c,...d].slice(0,Math.max(0,e))}}function qt(o,s){return o.filter(t=>t.open&&t.day!==null&&t.day<s)}function Gt(o,s,t=7){return Array.from({length:t},(e,n)=>{let i=S(s,n);return{day:i,items:o.filter(a=>a.day===i)}})}var mt=["glance","list","agenda","heatmap","week","next","board","shopping","tiles"];function ft(o){let s=new Set(o.map(e=>e.task.id)),t=new Map;for(let e of o){let n=e.task.parentId;n&&s.has(n)&&t.set(n,[...t.get(n)??[],e])}return o.filter(e=>!(e.task.parentId&&s.has(e.task.parentId))).map(e=>({item:e,subtasks:t.get(e.task.id)??[]}))}function Kt(o,s,t){let e=new Map(t.map(a=>[a.id,a.name])),n=[],i=new Set;for(let a of s){if(i.has(a.id))continue;i.add(a.id);let l=o.filter(d=>d.list?.id===a.id);if(!l.length)continue;let r=new Map;for(let d of l){let p=d.task.sectionId&&e.has(d.task.sectionId)?d.task.sectionId:"";r.set(p,[...r.get(p)??[],d])}let c=[...r.keys()].sort((d,p)=>d===""?-1:p===""?1:(e.get(d)??"").localeCompare(e.get(p)??""));for(let d of c)n.push({key:`${a.id}/${d}`,label:d?`${a.name} \xB7 ${e.get(d)}`:a.name,color:a.color,rows:ft(r.get(d)??[])})}return n}function Zt(o,s,t,e){let n=[],i=o.filter(a=>a.open&&a.day!==null&&a.day<s);i.length&&n.push({key:"late",label:"Overdue",late:!0,rows:i.map(a=>({item:a,subtasks:[]}))});for(let a=0;a<=t;a++){let l=S(s,a),r=o.filter(p=>p.day===l).map(p=>({item:p,subtasks:[]}));if(!r.length&&a>0)continue;let c=L(l,s,e),d=v(l,e,{month:"short",day:"numeric"});n.push({key:l,label:a<2?`${c} \xB7 ${d}`:`${v(l,e,{weekday:"long"})} \xB7 ${d}`,rows:r})}return n}function ye(o){return o<=0?0:o===1?1:o<=3?2:o<=5?3:4}function yt(o,s,t,e){let n=new Map;for(let c of o)c.day&&n.set(c.day,(n.get(c.day)??0)+1);let i=s==="year"?`${t.slice(0,4)}-01-01`:`${t.slice(0,7)}-01`,a=s==="year"?`${t.slice(0,4)}-12-31`:S(Y(i,1),-1),l=S(i,-((ge(i)-e+7)%7)),r=[];for(;l<=a;){let c=[];for(let d=0;d<7;d++){let p=n.get(l)??0;c.push({day:l,count:p,level:ye(p),inRange:l>=i&&l<=a}),l=S(l,1)}r.push(c)}return r}function Jt(o,s){let e=["sunday","monday","tuesday","wednesday","thursday","friday","saturday"].indexOf(o??"");if(e>=0)return e;try{let n=new Intl.Locale(s),i=n.getWeekInfo?.()??n.weekInfo;if(i)return i.firstDay%7}catch{}return 0}function Yt(o){let s=new Set;for(let t of o.split(/[,\s]+/u)){let e=t.replace(/^#/u,"").trim();e&&s.add(e)}return[...s]}var _e={view:"View",title:"Title",entries:"People",scope:"Which tasks",lists:"Lists",tags:"Tags",sort:"Sort by",density:"Spacing",colors:"Colors",show_completed:"Show completed tasks",quick_add:"Show the add box",kiosk:"Wall tablet layout",max_items:"Tasks to list",days:"Days ahead",range:"Range",height:"Height in pixels (0 grows to fit)",navigation_path:"Open on tap"},ve={entries:"Leave empty to show the signed-in person their own tasks, or everyone when accounts are not matched to people.",scope:'"Their own lists" leaves out lists shared with them. "Assigned to them" shows only tasks they are assigned.',lists:"Leave empty for every list.",tags:"Leave empty for every tag. A tag also matches the tags under it.",kiosk:"Large touch targets, and adding goes through Assist voice instead of a keyboard."};function w(o,s,t=!1,e=!1){return{name:o,selector:{select:{options:s,multiple:t,custom_value:e,mode:t?"list":"dropdown"}}}}function be(o,s,t,e){let n=o.view??_.view,i=(a,l,r)=>({name:a,selector:{number:{min:l,max:r,step:1,mode:"box"}}});return[w("view",[{value:"glance",label:"At a glance"},{value:"list",label:"List"},{value:"agenda",label:"Agenda"},{value:"heatmap",label:"Busy-day heatmap"},{value:"week",label:"Week strip"},{value:"next",label:"Next up"},{value:"board",label:"Family board"},{value:"shopping",label:"Shopping list"},{value:"tiles",label:"Person tiles"}]),{name:"title",selector:{text:{}}},...n==="glance"?[i("max_items",0,50),i("days",1,60)]:[],...n==="agenda"?[i("days",1,60)]:[],...n==="tiles"?[{name:"navigation_path",selector:{navigation:{}}}]:[],...n==="heatmap"?[w("range",[{value:"month",label:"Month"},{value:"year",label:"Year"}])]:[],...s.length>1?[w("entries",s,!0)]:[],w("scope",[{value:"all",label:"Everything they can see"},{value:"own",label:"Their own lists"},{value:"assigned",label:"Assigned to them"}]),...t.length?[w("lists",t,!0)]:[],...e.length?[w("tags",e,!0,!0)]:[],w("sort",[{value:"date",label:"Date"},{value:"priority",label:"Priority"},{value:"title",label:"Title"},{value:"created",label:"Newest first"},{value:"manual",label:"As in PeckList"}]),w("density",[{value:"comfortable",label:"Comfortable"},{value:"compact",label:"Compact"}]),w("colors",[{value:"theme",label:"Follow the Home Assistant theme"},{value:"pecklist",label:"PeckList colors (Forest)"}]),{name:"show_completed",selector:{boolean:{}}},{name:"quick_add",selector:{boolean:{}}},{name:"kiosk",selector:{boolean:{}}},i("height",0,2e3)]}function $e(o){let s={type:o.type};for(let[t,e]of Object.entries(o))t==="type"||e===void 0||e===null||e===""||e===!1||Array.isArray(e)&&!e.length||t in _&&_[t]===e||t==="height"&&!e||(s[t]=e);return s}var _t=class extends b{constructor(){super();this._loading=!1;this._accounts=null,this._snapshots=[]}static{this.properties={hass:{attribute:!1},_config:{state:!0},_accounts:{state:!0},_snapshots:{state:!0}}}setConfig(t){this._config=t}updated(){this.hass&&!this._accounts&&!this._loading&&this._load(this.hass)}async _load(t){this._loading=!0;try{let e=await t.callWS({type:"pecklist/accounts"}),n=[];for(let i of e.accounts)await new Promise(a=>{let l,r=!1,c=()=>{r=!0,l?.(),a()};t.connection.subscribeMessage(d=>{r||n.push(d),c()},{type:"pecklist/subscribe",entry_id:i.entry_id}).then(d=>{l=d,r&&d()},c)});this._snapshots=n,this._accounts=e}catch{this._accounts={version:0,accounts:[],mine:null}}}render(){if(!this.hass||!this._config)return u;let t=new Set(this._config.entries??[]),e=this._snapshots.filter(r=>!t.size||t.has(r.account.entry_id)),n=e.length>1,i=new Map,a=new Set;for(let r of e){for(let c of r.lists)i.has(c.id)||i.set(c.id,n&&!c.shared?`${c.name} (${r.account.username})`:c.name);for(let c of r.tags)a.add(c.name)}for(let r of this._config.lists??[])i.has(r)||i.set(r,r);for(let r of this._config.tags??[])a.add(r);let l=(this._accounts?.accounts??[]).map(r=>({value:r.entry_id,label:r.username||r.title}));return h`
			<ha-form
				.hass=${this.hass}
				.data=${{..._,...this._config}}
				.schema=${be(this._config,l,[...i].map(([r,c])=>({value:r,label:c})),[...a].sort().map(r=>({value:r,label:r})))}
				.computeLabel=${r=>_e[r.name]??r.name}
				.computeHelper=${r=>ve[r.name]??""}
				@value-changed=${this._changed}
			></ha-form>
		`}_changed(t){t.stopPropagation();let e=$e({...t.detail.value,type:this._config?.type??"custom:pecklist-card"});this._config=e,this.dispatchEvent(new CustomEvent("config-changed",{detail:{config:e},bubbles:!0,composed:!0}))}};customElements.get("pecklist-card-editor")||customElements.define("pecklist-card-editor",_t);var Qt=tt`
	:host {
		--pl-accent: var(--primary-color, #5a8a4e);
		--pl-high: var(--error-color, #d9776b);
		--pl-medium: var(--warning-color, #e3b068);
		--pl-low: var(--info-color, #8daa9b);
		--pl-none: var(--secondary-text-color, #8a8f98);
		--pl-late: var(--error-color, #d9776b);
		--pl-text: var(--primary-text-color, #1b1d1f);
		--pl-muted: var(--secondary-text-color, #6b7078);
		--pl-line: var(--divider-color, rgba(127, 127, 127, 0.25));
		--pl-surface: var(--card-background-color, #fff);
		--pl-row: 8px;
		--pl-check: 22px;
		--pl-font: 14px;
		display: block;
		height: 100%;
	}
	:host([colors='pecklist']) {
		--pl-accent: #5a8a4e;
		--pl-high: #d9776b;
		--pl-medium: #e3b068;
		--pl-low: #8daa9b;
		--pl-none: #b8bcc4;
		--pl-late: #d9776b;
	}
	:host([density='compact']) {
		--pl-row: 3px;
		--pl-check: 18px;
		--pl-font: 13px;
	}
	:host([kiosk]) {
		--pl-row: 14px;
		--pl-check: 34px;
		--pl-font: 19px;
	}
	ha-card {
		container-type: inline-size;
		display: flex;
		flex-direction: column;
		height: 100%;
		color: var(--pl-text);
		font-size: var(--pl-font);
		overflow: hidden;
	}
	button {
		font: inherit;
		color: inherit;
		background: none;
		border: 0;
		padding: 0;
		margin: 0;
		cursor: pointer;
	}
	button:focus-visible,
	input:focus-visible,
	textarea:focus-visible,
	select:focus-visible {
		outline: 2px solid var(--pl-accent);
		outline-offset: 2px;
	}
	svg {
		width: 1.25em;
		height: 1.25em;
		fill: currentColor;
		flex: none;
	}

	header {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 14px 16px 6px;
	}
	h2 {
		flex: 1;
		min-width: 0;
		margin: 0;
		font-size: 1.25em;
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.state {
		color: var(--pl-muted);
		font-size: 0.85em;
	}
	.people {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px;
		padding: 10px 12px 6px;
	}
	header + .people {
		padding-top: 2px;
	}
	.chip {
		--who: var(--pl-accent);
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 32px;
		padding: 0 12px;
		border: 1px solid var(--pl-line);
		border-radius: 999px;
		font-size: 0.9em;
		color: var(--pl-text);
		white-space: nowrap;
	}
	.chip b {
		font-weight: 500;
		color: var(--pl-muted);
	}
	.chip .dot {
		background: var(--who);
	}
	:host([kiosk]) .chip {
		min-height: 48px;
		padding: 0 18px;
	}
	.chip[aria-pressed='true'] {
		border-color: var(--who);
		background: color-mix(in srgb, var(--who) 18%, transparent);
		box-shadow: inset 0 0 0 1px var(--who);
	}
	.chip[aria-pressed='true'] b {
		color: inherit;
	}
	.people .grow {
		flex: 1;
	}
	.chip.plus {
		justify-content: center;
		width: 32px;
		padding: 0;
		color: var(--pl-muted);
	}
	:host([kiosk]) .chip.plus {
		width: 48px;
	}
	.chip.plus[aria-expanded='true'] {
		border-color: var(--pl-accent);
		color: var(--pl-accent);
	}
	.who {
		display: flex;
		flex-direction: column;
		align-self: stretch;
		width: 4px;
		margin: 1px -4px 1px 0;
		border-radius: 2px;
		overflow: hidden;
		flex: none;
	}
	.who i {
		flex: 1;
	}

	.add {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 4px 16px 8px;
		padding: 0 10px;
		border: 1px solid var(--pl-line);
		border-radius: 10px;
		color: var(--pl-muted);
	}
	.add[hidden],
	.add select[hidden] {
		display: none;
	}
	.add:focus-within {
		border-color: var(--pl-accent);
	}
	.add input {
		flex: 1;
		min-width: 0;
		padding: 9px 0;
		font: inherit;
		color: var(--pl-text);
		background: none;
		border: 0;
		outline: 0;
	}
	.add select {
		max-width: 40%;
		font: inherit;
		color: var(--pl-muted);
		background: none;
		border: 0;
	}
	.voice {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 12px;
		margin: 6px 16px 10px;
		padding: 16px;
		border-radius: 16px;
		background: var(--pl-accent);
		color: var(--text-primary-color, #fff);
		font-size: 1.1em;
		font-weight: 500;
	}

	.body {
		flex: 1;
		min-height: 0;
		overflow-y: auto;
		padding: 0 8px 10px;
	}
	.empty,
	.problem {
		padding: 18px 8px;
		text-align: center;
		color: var(--pl-muted);
	}
	.problem {
		color: var(--pl-late);
	}

	.counts {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		padding: 4px 8px 10px;
	}
	.count {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 10px 4px;
		border-radius: 12px;
		background: color-mix(in srgb, var(--pl-accent) 10%, transparent);
	}
	.count[aria-pressed='true'] {
		box-shadow: inset 0 0 0 2px var(--pl-accent);
	}
	.count b {
		font-size: 1.9em;
		font-weight: 500;
		line-height: 1.1;
	}
	.count span {
		color: var(--pl-muted);
		font-size: 0.85em;
	}
	.count.late b {
		color: var(--pl-late);
	}
	.count.late.none b {
		color: inherit;
	}

	h3 {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 10px 8px 2px;
		font-size: 0.85em;
		font-weight: 600;
		letter-spacing: 0.02em;
		color: var(--pl-muted);
	}
	h3.late {
		color: var(--pl-late);
	}
	.dot {
		width: 0.7em;
		height: 0.7em;
		border-radius: 50%;
		background: var(--pl-accent);
		flex: none;
	}
	.none-today {
		padding: 2px 8px 6px;
		color: var(--pl-muted);
		font-size: 0.9em;
	}

	ul {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	ul ul {
		margin-left: calc(var(--pl-check) + 10px);
	}
	.row {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		padding: var(--pl-row) 8px;
		border-radius: 8px;
	}
	.row:hover {
		background: color-mix(in srgb, var(--pl-text) 5%, transparent);
	}
	.check {
		display: grid;
		place-items: center;
		width: var(--pl-check);
		height: var(--pl-check);
		margin-top: 1px;
		border: 2px solid var(--pl-none);
		border-radius: 50%;
		flex: none;
		color: transparent;
	}
	.check.p1 {
		border-color: var(--pl-low);
	}
	.check.p2 {
		border-color: var(--pl-medium);
	}
	.check.p3 {
		border-color: var(--pl-high);
	}
	.check svg {
		width: 70%;
		height: 70%;
	}
	.check.closed {
		background: var(--pl-none);
		border-color: var(--pl-none);
		color: var(--pl-surface);
	}
	.check:disabled {
		cursor: default;
		opacity: 0.6;
	}
	.what {
		flex: 1;
		min-width: 0;
		text-align: left;
	}
	.what:disabled {
		cursor: default;
	}
	.name {
		display: block;
		overflow-wrap: anywhere;
	}
	.closed + .what .name {
		color: var(--pl-muted);
		text-decoration: line-through;
	}
	.meta {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 2px 10px;
		margin-top: 1px;
		color: var(--pl-muted);
		font-size: 0.85em;
	}
	.meta .late {
		color: var(--pl-late);
	}
	.meta span {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}
	.meta svg {
		width: 1em;
		height: 1em;
	}

	/* Dense rows: one line each, the date at the right, so a section cell shows more tasks. */
	:host([density='compact']) .what {
		display: flex;
		align-items: baseline;
		gap: 10px;
	}
	:host([density='compact']) .name {
		flex: 1;
		min-width: 0;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	:host([density='compact']) .meta {
		flex: none;
		flex-wrap: nowrap;
		margin: 0;
	}
	:host([density='compact']) .meta .tag {
		display: none;
	}
	:host([density='compact']) .counts {
		gap: 6px;
		padding-bottom: 6px;
	}
	:host([density='compact']) .count {
		flex-direction: row;
		justify-content: center;
		align-items: baseline;
		gap: 6px;
		padding: 5px 4px;
	}
	:host([density='compact']) .count b {
		font-size: 1.3em;
	}
	:host([density='compact']) h3 {
		margin-top: 6px;
	}
	.groups section {
		break-inside: avoid;
	}
	/* A narrow cell (a third of a phone, a small section): the list's name gives way to the task. */
	@container (max-width: 330px) {
		:host([density='compact']) .meta .in {
			display: none;
		}
		header {
			padding: 10px 12px 4px;
		}
	}
	/* A wide cell (a card across two or three sections): groups side by side. */
	@container (min-width: 680px) {
		.groups {
			columns: 2;
			column-gap: 16px;
		}
	}
	@container (min-width: 1040px) {
		.groups {
			columns: 3;
		}
	}

	/* Week strip */
	.week {
		display: grid;
		grid-template-columns: repeat(7, 1fr);
		gap: 4px;
		padding: 2px 8px 6px;
	}
	.wday {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 1px;
		min-width: 0;
		padding: 6px 0 5px;
		border-radius: 10px;
		background: color-mix(in srgb, var(--pl-text) 5%, transparent);
	}
	.wday .wd {
		color: var(--pl-muted);
		font-size: 0.75em;
	}
	.wday b {
		font-size: 1.15em;
		font-weight: 500;
	}
	.wday.today b {
		color: var(--pl-accent);
	}
	.wday[aria-pressed='true'] {
		box-shadow: inset 0 0 0 2px var(--pl-accent);
	}
	.dots {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 2px;
		height: 8px;
	}
	.dots i {
		width: 6px;
		height: 6px;
		border-radius: 50%;
	}
	.dots em {
		font-style: normal;
		font-size: 0.65em;
		color: var(--pl-muted);
	}
	:host([kiosk]) .wday {
		padding: 12px 0 10px;
	}

	/* Next up */
	.hero {
		display: flex;
		flex-direction: column;
		gap: 8px;
		padding: 10px 8px 6px;
	}
	.hero-when {
		display: flex;
		flex-wrap: wrap;
		gap: 2px 12px;
		color: var(--pl-muted);
		font-size: 0.9em;
	}
	.hero-when span {
		display: inline-flex;
		align-items: center;
		gap: 5px;
	}
	.hero-when .late,
	.tile .late {
		color: var(--pl-late);
	}
	.hero-title {
		font-size: 1.5em;
		font-weight: 500;
		line-height: 1.2;
		text-align: left;
		overflow-wrap: anywhere;
	}
	.hero-title.done {
		color: var(--pl-muted);
		font-size: 1.15em;
	}
	.hero-actions {
		display: flex;
		gap: 8px;
		margin-top: 2px;
	}
	.hero-actions .btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		flex: 1;
		min-height: 44px;
		border: 1px solid var(--pl-line);
	}
	.hero-actions .btn.primary {
		flex: 2;
		border-color: var(--pl-accent);
	}
	.hero-more {
		color: var(--pl-muted);
		font-size: 0.85em;
	}
	:host([kiosk]) .hero-title {
		font-size: 1.8em;
	}
	:host([kiosk]) .hero-actions .btn {
		min-height: 64px;
	}

	/* Family board */
	.board {
		display: grid;
		grid-auto-flow: column;
		grid-auto-columns: minmax(170px, 1fr);
		gap: 8px;
		overflow-x: auto;
		padding-bottom: 4px;
	}
	.col {
		min-width: 0;
		border-top: 3px solid var(--who);
		border-radius: 4px 4px 0 0;
	}
	/* A column is narrow: the title gets the line, the date goes under it, whatever the spacing. */
	:host([density='compact']) .col .what {
		display: block;
	}
	:host([density='compact']) .col .name {
		white-space: normal;
	}
	.col .meta .tag {
		display: none;
	}
	.col h3 {
		color: var(--pl-text);
		font-size: 0.95em;
		margin-top: 8px;
	}
	.col h3 .dot {
		background: var(--who);
	}
	.col h3 b {
		font-weight: 500;
		color: var(--pl-muted);
	}

	/* Shopping list */
	:host([view='shopping']) {
		--pl-check: 26px;
		--pl-row: 9px;
	}
	:host([view='shopping']) .name {
		font-size: 1.1em;
	}
	:host([view='shopping']) .meta {
		display: none;
	}
	h3 .grow {
		flex: 1;
	}
	.clear {
		padding: 4px 12px;
		border: 1px solid var(--pl-line);
		border-radius: 999px;
		color: var(--pl-text);
		font-weight: 500;
	}

	/* Person tiles */
	:host([view='tiles']) .body {
		padding: 0;
		overflow: hidden;
	}
	.tiles {
		display: flex;
		height: 100%;
		min-height: 52px;
	}
	.tile {
		display: grid;
		grid-template-columns: auto 1fr;
		grid-template-rows: auto auto;
		align-items: center;
		align-content: center;
		column-gap: 10px;
		flex: 1;
		min-width: 0;
		padding: 6px 14px;
		text-align: left;
		border-left: 1px solid var(--pl-line);
	}
	.tile:first-child {
		border-left: 0;
	}
	.tile:disabled {
		cursor: default;
	}
	.tile .dot {
		grid-row: 1 / 3;
		width: 12px;
		height: 12px;
		background: var(--who);
	}
	.tile-name {
		font-weight: 500;
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.tile-counts {
		color: var(--pl-muted);
		font-size: 0.85em;
		white-space: nowrap;
	}
	.tile-counts b {
		font-weight: 600;
		color: var(--pl-text);
	}
	.tile-counts b.late {
		color: var(--pl-late);
		margin-left: 6px;
	}

	.nav {
		display: flex;
		align-items: center;
		gap: 4px;
		padding: 2px 8px 6px;
	}
	.nav strong {
		flex: 1;
		font-weight: 500;
	}
	.nav button {
		display: grid;
		place-items: center;
		width: 2.2em;
		height: 2.2em;
		border-radius: 50%;
	}
	.nav button:hover {
		background: color-mix(in srgb, var(--pl-text) 8%, transparent);
	}
	.heat {
		display: grid;
		gap: 3px;
		padding: 0 8px 8px;
	}
	.heat {
		grid-template-columns: repeat(7, 1fr);
	}
	.year {
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(104px, 1fr));
		gap: 12px 14px;
		padding: 0 8px 8px;
	}
	.month-name {
		margin-bottom: 3px;
		color: var(--pl-muted);
		font-size: 0.8em;
	}
	.heat.small {
		gap: 2px;
		padding: 0;
	}
	.heat .wd {
		text-align: center;
		color: var(--pl-muted);
		font-size: 0.75em;
	}
	.cell {
		display: grid;
		place-items: center;
		aspect-ratio: 1;
		min-width: 0;
		border-radius: 6px;
		background: color-mix(in srgb, var(--pl-accent) calc(var(--level) * 22%), color-mix(in srgb, var(--pl-text) 6%, transparent));
		font-size: 0.85em;
	}
	.heat.small .cell {
		border-radius: 3px;
		font-size: 0;
	}
	:host([kiosk]) .heat.small .cell {
		border-radius: 5px;
	}
	.cell.l3,
	.cell.l4 {
		color: var(--text-primary-color, #fff);
	}
	.cell.out {
		visibility: hidden;
	}
	.cell.today {
		box-shadow: inset 0 0 0 2px var(--pl-text);
	}
	.cell[aria-pressed='true'] {
		box-shadow: inset 0 0 0 2px var(--pl-accent), 0 0 0 1px var(--pl-accent);
	}
	.legend {
		display: flex;
		align-items: center;
		justify-content: flex-end;
		gap: 3px;
		padding: 0 8px 4px;
		color: var(--pl-muted);
		font-size: 0.75em;
	}
	.legend i {
		width: 1em;
		height: 1em;
		border-radius: 3px;
		background: color-mix(in srgb, var(--pl-accent) calc(var(--level) * 22%), color-mix(in srgb, var(--pl-text) 6%, transparent));
	}

	.scrim {
		position: fixed;
		inset: 0;
		z-index: 8;
		display: grid;
		place-items: center;
		padding: 16px;
		background: rgba(0, 0, 0, 0.45);
	}
	.scrim form {
		display: flex;
		flex-direction: column;
		gap: 12px;
		width: min(440px, 100%);
		max-height: 100%;
		overflow-y: auto;
		box-sizing: border-box;
		padding: 18px;
		border-radius: 16px;
		background: var(--pl-surface);
		color: var(--pl-text);
		font-size: 14px;
		box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
	}
	label {
		display: flex;
		flex-direction: column;
		gap: 4px;
		color: var(--pl-muted);
		font-size: 0.85em;
	}
	.scrim input,
	.scrim textarea {
		padding: 9px 10px;
		border: 1px solid var(--pl-line);
		border-radius: 8px;
		font: inherit;
		font-size: 14px;
		color: var(--pl-text);
		background: none;
		color-scheme: light dark;
	}
	.scrim textarea {
		min-height: 4.5em;
		resize: vertical;
	}
	.two {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
	}
	.prio {
		display: grid;
		grid-template-columns: repeat(4, 1fr);
		gap: 6px;
	}
	.prio button {
		padding: 7px 0;
		border: 1px solid var(--pl-line);
		border-radius: 8px;
		color: var(--pl-text);
	}
	.prio button[aria-pressed='true'] {
		border-color: var(--pl-accent);
		box-shadow: inset 0 0 0 1px var(--pl-accent);
	}
	.assign {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
	}
	.actions {
		display: flex;
		gap: 8px;
		margin-top: 4px;
	}
	.actions .grow {
		flex: 1;
	}
	.btn {
		padding: 9px 16px;
		border-radius: 8px;
		font-weight: 500;
	}
	.btn.primary {
		background: var(--pl-accent);
		color: var(--text-primary-color, #fff);
	}
	.btn.danger {
		color: var(--pl-late);
	}
	.btn:disabled {
		opacity: 0.5;
		cursor: default;
	}
	.error {
		color: var(--pl-late);
		font-size: 0.9em;
	}
`,$={check:"M9 16.17 4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",plus:"M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6z",mic:"M12 14a3 3 0 0 0 3-3V5a3 3 0 0 0-6 0v6a3 3 0 0 0 3 3m5-3a5 5 0 0 1-10 0H5a7 7 0 0 0 6 6.92V21h2v-3.08A7 7 0 0 0 19 11z",left:"M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z",right:"M10 6 8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z",repeat:"M7 7h10v3l4-4-4-4v3H5v6h2zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2z",today:"M19 4h-1V2h-2v2H8V2H6v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2m0 16H5V9h14zM7 11h5v5H7z"};var xe=["None","Low","Medium","High"];function k(o){return h`<svg viewBox="0 0 24 24" aria-hidden="true">${Ut`<path d=${o}></path>`}</svg>`}function E(o){return o&&typeof o=="object"&&"message"in o?String(o.message):String(o)}var vt=class extends b{constructor(){super();this._unsubscribe=[];this._generation=0;this._wanted="";this._config={type:"custom:pecklist-card"},this._accounts=null,this._snapshots=new Map,this._problem="",this._person=null,this._pending=new Set,this._draft=null,this._anchor=null,this._selected=null,this._filter=null,this._adding=!1,this._addOpen=!1,this._addError="",this._today=J(void 0)}static{this.styles=Qt}static{this.properties={_config:{state:!0},_accounts:{state:!0},_snapshots:{state:!0},_problem:{state:!0},_person:{state:!0},_pending:{state:!0},_draft:{state:!0},_anchor:{state:!0},_selected:{state:!0},_filter:{state:!0},_adding:{state:!0},_addOpen:{state:!0},_addError:{state:!0},_today:{state:!0}}}static getConfigElement(){return document.createElement("pecklist-card-editor")}static getStubConfig(){return{type:"custom:pecklist-card",view:"glance",quick_add:!0}}setConfig(t){if(!t||typeof t!="object")throw new Error("Invalid configuration");if(t.view&&!mt.includes(t.view))throw new Error(`Unknown view "${t.view}": use ${mt.join(", ")}`);this.setAttribute("view",t.view??_.view),this._config=t,this.toggleAttribute("kiosk",!!t.kiosk),this.setAttribute("density",t.density??_.density),this.setAttribute("colors",t.colors??_.colors),this._filter=null,this._connect()}set hass(t){let e=!this._hass;this._hass=t;let n=J(t.config?.time_zone);n!==this._today&&(this._today=n),e&&this._connect()}getCardSize(){let t=this._config.view;return t==="heatmap"?7:t==="tiles"?1:t==="next"?3:5}getGridOptions(){let t=this._config.view;return t==="tiles"?{columns:12,min_columns:3,rows:1,min_rows:1}:t==="next"?{columns:12,min_columns:6,rows:3,min_rows:2}:t==="week"?{columns:12,min_columns:9,rows:4,min_rows:2}:{columns:12,min_columns:6,rows:this._config.height?Math.ceil(this._config.height/56)+1:6,min_rows:3}}connectedCallback(){super.connectedCallback(),this._connect(),this._clock=setInterval(()=>{let t=J(this._hass?.config?.time_zone);t!==this._today&&(this._today=t)},6e4)}disconnectedCallback(){super.disconnectedCallback(),clearInterval(this._clock),this._drop()}_drop(){this._generation++,this._wanted="";for(let t of this._unsubscribe)t();this._unsubscribe=[]}async _connect(){let t=this._hass;if(!t||!this.isConnected)return;try{this._accounts??=await t.callWS({type:"pecklist/accounts"})}catch(r){this._problem=r?.code==="unknown_command"?"The PeckList integration is not set up. Add it under Settings > Devices & services.":`PeckList: ${E(r)}`;return}let e=this._accounts.accounts,n=(this._config.entries??[]).filter(r=>e.some(c=>c.entry_id===r)),i=n.length?n:this._accounts.mine?[this._accounts.mine]:e.map(r=>r.entry_id),a=i.join(",");if(a===this._wanted)return;this._drop(),this._wanted=a;let l=this._generation;this._problem=e.length?"":"No PeckList account is connected. Add one under Settings > Devices & services.",this._snapshots=new Map([...this._snapshots].filter(([r])=>i.includes(r)));for(let r of i)try{let c=await t.connection.subscribeMessage(d=>{l===this._generation&&(this._snapshots=new Map(this._snapshots).set(r,d),this._pending.size&&(this._pending=new Set))},{type:"pecklist/subscribe",entry_id:r});l===this._generation?this._unsubscribe.push(c):c()}catch(c){l===this._generation&&(this._problem=`PeckList: ${E(c)}`)}}get _language(){return this._hass?.locale?.language??this._hass?.language??"en"}_shown(){return this._wanted.split(",").map(t=>this._snapshots.get(t)).filter(t=>!!t)}_people(){let t=this._wanted.split(",").filter(e=>this._snapshots.has(e));return Bt(this._accounts?.accounts??[],t,this._config.person_colors)}async _send(t,e,n){if(!this._hass)throw new Error("Not connected");return this._hass.callWS({type:`pecklist/task/${t}`,entry_id:e.entryId,...n})}async _toggle(t){if(!(!t.canWrite||this._pending.has(t.task.id))){this._pending=new Set(this._pending).add(t.task.id);try{await this._send(t.open?"complete":"reopen",t,{task_id:t.task.id})}catch(e){this._pending=new Set([...this._pending].filter(n=>n!==t.task.id)),this._problem=E(e),setTimeout(()=>this._problem="",6e3)}}}async _add(t){t.preventDefault();let e=t.currentTarget,n=e.querySelector("input"),i=n.value.trim(),a=e.querySelector("select")?.value??this._addTargets()[0]?.value;if(!i||!a||this._adding)return;let[l,r]=a.split("/");this._adding=!0,this._addError="";try{await this._send("quick_add",{entryId:l??""},{text:i,...r?{list_id:r}:{}}),n.value=""}catch(c){this._addError=E(c)}finally{this._adding=!1,n.focus()}}_addTargets(){let t=new Set(this._config.lists??[]),e=this._shown().filter(i=>i.account.can_write&&(!this._person||i.account.entry_id===this._person)),n=[];for(let i of e){let a=e.length>1?`${i.account.username}: `:"",l=i.lists.filter(r=>(!t.size||t.has(r.id))&&(r.role==="owner"||r.role==="editor"));!t.size&&i.lists.some(r=>r.isInbox)&&n.push({value:`${i.account.entry_id}/`,label:`${a}Default list`});for(let r of l)n.push({value:`${i.account.entry_id}/${r.id}`,label:a+r.name})}return n}_assist(){this.dispatchEvent(new CustomEvent("hass-action",{bubbles:!0,composed:!0,detail:{config:{tap_action:{action:"assist",start_listening:!0}},action:"tap"}}))}_edit(t){t.canWrite&&(this._draft={item:t,title:t.task.title,day:t.day??"",time:t.time??"",priority:t.task.priority,tags:t.task.tags.join(", "),notes:t.task.notes??"",assignees:t.list?.shared&&this._assignable(t).length>1?[...t.task.assignees]:null,saving:!1,error:""})}_assignable(t){return(this._snapshots.get(t.entryId)?.people??[]).filter(e=>e.assignable)}_set(t){this._draft&&(this._draft={...this._draft,...t})}async _save(t){t.preventDefault();let e=this._draft;if(!e||e.saving)return;let{task:n}=e.item,i={},a=e.title.trim();if(!a)return this._set({error:"A task needs a title."});a!==n.title&&(i.title=a),e.notes!==(n.notes??"")&&(i.notes=e.notes),e.priority!==n.priority&&(i.priority=e.priority);let l=Yt(e.tags);l.join(`
`)!==n.tags.join(`
`)&&(i.tags=l),e.assignees&&[...e.assignees].sort().join()!==[...n.assignees].sort().join()&&(i.assignees=e.assignees);let r=e.day?e.time:"";if((e.day!==(e.item.day??"")||r!==(e.item.time??""))&&Object.assign(i,gt(n,e.day||null,r||null)),!Object.keys(i).length){this._draft=null;return}this._set({saving:!0,error:""});try{await this._send("update",e.item,{task_id:n.id,changes:i}),this._draft=null}catch(c){this._set({saving:!1,error:E(c)})}}async _delete(){let t=this._draft;if(!(!t||t.saving)){this._set({saving:!0,error:""});try{await this._send("delete",t.item,{task_id:t.item.task.id}),this._draft=null}catch(e){this._set({saving:!1,error:E(e)})}}}render(){let t=this._config,e=t.view??_.view,n=this._people(),i=this._shown(),a=!this._problem&&!!this._wanted&&this._snapshots.size===0,l=i.some(g=>!g.connected),r=n.some(g=>g.entryId===this._person)?this._person:null,c=n.length>1?H(i,t):[],d=H(i,t,r),p=g=>c.filter(f=>f.open&&f.owners.includes(g)).length,m=!!t.quick_add&&!t.kiosk&&(t.density??_.density)==="compact"&&this._addTargets().length>0,y=t.height?`max-height:${t.height}px`:"";return h`
			<ha-card>
				${t.title||l?h`<header>
							<h2>${t.title??""}</h2>
							${l?h`<span class="state">Server unreachable</span>`:u}
						</header>`:u}
				${n.length>1&&e!=="board"&&e!=="tiles"||m&&e!=="tiles"?h`<div class="people" role="group" aria-label=${n.length>1?"People":"Actions"}>
							${n.length>1?h`<button class="chip" aria-pressed=${r===null} @click=${()=>this._person=null}>
										All <b>${c.filter(g=>g.open).length}</b>
									</button>`:u}
							${(n.length>1?n:[]).map(g=>h`<button
										class="chip"
										style="--who:${g.color}"
										aria-pressed=${r===g.entryId}
										@click=${()=>this._person=r===g.entryId?null:g.entryId}
									>
										<i class="dot"></i>${g.name} <b>${p(g.entryId)}</b>
									</button>`)}
							${m?h`<span class="grow"></span
										><button
											class="chip plus"
											aria-label="Add a task"
											title="Add a task"
											aria-expanded=${this._addOpen}
											@click=${this._toggleAdd}
										>
											${k($.plus)}
										</button>`:u}
						</div>`:u}
				${e==="tiles"?u:this._renderAdd(m&&!this._addOpen)}
				<div class="body" style=${y}>
					${this._problem?h`<div class="problem" role="alert">${this._problem}</div>`:u}
					${a?h`<div class="empty">Loading…</div>`:this._renderView(e,d,i,r)}
				</div>
				${this._draft?this._renderDialog(this._draft):u}
			</ha-card>
		`}async _toggleAdd(){this._addOpen=!this._addOpen,this._addError="",await this.updateComplete,this._addOpen&&this.renderRoot.querySelector(".add input")?.focus()}_renderAdd(t=!1){if(!this._config.quick_add)return u;let e=this._addTargets();return e.length?this._config.kiosk?h`<button class="voice" @click=${this._assist}>${k($.mic)} Add a task</button>`:h`
			<form class="add" ?hidden=${t} @submit=${this._add}>
				${k($.plus)}
				<input
					type="text"
					maxlength="1000"
					enterkeyhint="done"
					aria-label="Add a task"
					placeholder="Add a task: tomorrow 9am #tag !high"
					?disabled=${this._adding}
				/>
				<select aria-label="List" ?hidden=${e.length<2}>
					${e.map(n=>h`<option value=${n.value}>${n.label}</option>`)}
				</select>
			</form>
			${this._addError?h`<div class="problem" role="alert">${this._addError}</div>`:u}
		`:u}_renderView(t,e,n,i){let a=this._config;switch(t){case"list":return this._renderList(e,n);case"agenda":return this._renderGroups(Zt(e,this._today,a.days??_.days,this._language),!0,!1);case"heatmap":return this._renderHeatmap(e);case"week":return this._renderWeek(e);case"next":return this._renderNext(e);case"board":return this._renderBoard(n);case"shopping":return this._renderShopping(n,i);case"tiles":return this._renderTiles(n);default:return this._renderGlance(e)}}_renderWeek(t){let e=this._language,n=this._today,i=Gt(t,n,7),a=i.some(p=>p.day===this._selected)?this._selected:n,l=this._person?[]:this._people(),r=p=>(l.length>1?l.find(m=>p.owners.includes(m.entryId))?.color:void 0)??"var(--pl-accent)",c=a===n?qt(t,n):[],d=i.find(p=>p.day===a)?.items??[];return h`
			<div class="week" role="group" aria-label="Days">
				${i.map(p=>{let m=p.items.filter(y=>y.open);return h`<button
						class="wday ${p.day===n?"today":""}"
						aria-pressed=${p.day===a}
						aria-label=${`${v(p.day,e,{weekday:"long",month:"long",day:"numeric"})}: ${m.length} ${m.length===1?"task":"tasks"}`}
						@click=${()=>this._selected=p.day}
					>
						<span class="wd">${v(p.day,e,{weekday:"short"})}</span>
						<b>${Number(p.day.slice(8))}</b>
						<span class="dots">
							${m.slice(0,4).map(y=>h`<i style="background:${r(y)}"></i>`)}
							${m.length>4?h`<em>+${m.length-4}</em>`:u}
						</span>
					</button>`})}
			</div>
			${c.length?h`<h3 class="late">Overdue</h3>
						<ul>
							${c.map(p=>this._renderRow({item:p,subtasks:[]},!0))}
						</ul>`:u}
			<h3>${L(a,n,e)} · ${v(a,e,{month:"short",day:"numeric"})}</h3>
			${d.length?h`<ul>
						${d.map(p=>this._renderRow({item:p,subtasks:[]},!0,!1))}
					</ul>`:h`<div class="none-today">Nothing planned.</div>`}
		`}_renderNext(t){let e=this._today,n=Q(t,e,this._config.days??_.days,1),i=n.next.find(d=>!this._pending.has(d.task.id))??n.next[0];if(!i)return h`<div class="hero"><div class="hero-title done">All clear. Nothing open.</div></div>`;let a=i.day!==null&&i.day<e,l=n.overdue.length+n.today.length-(i.day!==null&&i.day<=e?1:0),r=i.day?L(i.day,e,this._language)+(i.time?`, ${ut(i.time,this._language)}`:""):"No date",c=this._pending.has(i.task.id);return h`
			<div class="hero">
				<div class="hero-when">
					<span class=${a?"late":""}>${r}</span>
					${i.list?h`<span><i class="dot" style=${i.list.color?`background:${i.list.color}`:""}></i>${i.list.name}</span>`:u}
					${i.others.map(d=>h`<span>@${d}</span>`)}
				</div>
				<button class="hero-title" ?disabled=${!i.canWrite} @click=${()=>this._edit(i)}>${i.task.title}</button>
				<div class="hero-actions">
					<button class="btn primary" ?disabled=${!i.canWrite||c} @click=${()=>this._toggle(i)}>${k($.check)} Done</button>
					<button class="btn" ?disabled=${!i.canWrite||c} @click=${()=>this._postpone(i)}>Tomorrow</button>
				</div>
				${l>0?h`<div class="hero-more">${l} more due</div>`:u}
			</div>
		`}async _postpone(t){if(!(!t.canWrite||this._pending.has(t.task.id))){this._pending=new Set(this._pending).add(t.task.id);try{await this._send("update",t,{task_id:t.task.id,changes:gt(t.task,S(this._today,1),t.time)})}catch(e){this._pending=new Set([...this._pending].filter(n=>n!==t.task.id)),this._problem=E(e),setTimeout(()=>this._problem="",6e3)}}}_renderBoard(t){let e=this._people();return h`<div class="board">
			${e.map(n=>{let i=H(t,this._config,e.length>1?n.entryId:null);return h`<section class="col" style="--who:${n.color}">
					<h3><i class="dot"></i>${n.name} <b>${i.filter(a=>a.open).length}</b></h3>
					${i.length?h`<ul>
								${i.map(a=>this._renderRow({item:a,subtasks:[]},!1,!0,!1))}
							</ul>`:h`<div class="none-today">Nothing open.</div>`}
				</section>`})}
		</div>`}_renderShopping(t,e){let n=H(t,{...this._config,show_completed:!0,sort:this._config.sort??"manual"},e),i=n.filter(r=>r.open),a=n.filter(r=>!r.open),l=a.filter(r=>r.canWrite);return h`
			${i.length?this._renderList(i,t):h`<div class="empty">${a.length?"Everything is ticked off.":"Nothing on the list."}</div>`}
			${a.length?h`<h3 class="got">
							Done
							<span class="grow"></span>
							${l.length?h`<button class="clear" @click=${()=>this._clear(l)}>Clear ${l.length}</button>`:u}
						</h3>
						<ul>
							${a.map(r=>this._renderRow({item:r,subtasks:[]},!1))}
						</ul>`:u}
		`}async _clear(t){this._pending=new Set([...this._pending,...t.map(e=>e.task.id)]);try{for(let e of t)await this._send("delete",e,{task_id:e.task.id})}catch(e){this._problem=E(e),setTimeout(()=>this._problem="",6e3)}finally{this._pending=new Set}}_renderTiles(t){let e=this._people(),n=this._config.navigation_path;return h`<div class="tiles">
			${e.map(i=>{let a=Q(H(t,this._config,e.length>1?i.entryId:null),this._today,this._config.days??_.days,0),l=`${i.name}: ${a.today.length} today, ${a.overdue.length} overdue`;return h`<button class="tile" style="--who:${i.color}" aria-label=${l} ?disabled=${!n} @click=${this._navigate}>
					<i class="dot"></i>
					<span class="tile-name">${i.name}</span>
					<span class="tile-counts">
						<b>${a.today.length}</b> today
						${a.overdue.length?h`<b class="late">${a.overdue.length}</b> <span class="late">late</span>`:u}
					</span>
				</button>`})}
		</div>`}_navigate(){let t=this._config.navigation_path;t&&(history.pushState(null,"",t),window.dispatchEvent(new CustomEvent("location-changed",{bubbles:!0,composed:!0,detail:{replace:!1}})))}_renderGlance(t){let e=this._config,n=Q(t,this._today,e.days??_.days,e.max_items??_.max_items),i=this._filter,a=i?n[i]:n.next,l=(r,c)=>h`
			<button
				class="count ${r==="overdue"?"late":""} ${n[r].length?"":"none"}"
				aria-pressed=${i===r}
				@click=${()=>this._filter=i===r?null:r}
			>
				<b>${n[r].length}</b> <span>${c}</span>
			</button>
		`;return h`
			<div class="counts">${l("overdue","Overdue")} ${l("today","Today")} ${l("upcoming","Upcoming")}</div>
			${a.length?h`<ul>
						${a.map(r=>this._renderRow({item:r,subtasks:[]},!0))}
					</ul>`:h`<div class="empty">${i?"Nothing here.":"All clear. Nothing open."}</div>`}
		`}_renderList(t,e){let n=this._people(),i=e.flatMap(c=>{let d=n.find(p=>p.entryId===c.account.entry_id)?.name??c.account.username;return c.lists.map(p=>({list:p,who:d}))}),a=i.map(({list:c,who:d})=>i.some(p=>p.list.id!==c.id&&p.list.name===c.name)?{...c,name:`${c.name} (${d})`}:c),l=Kt(t,a,e.flatMap(c=>c.sections));if(l.length===1&&!l[0].key.split("/")[1]&&this._config.lists?.length===1)return h`<ul>
				${l[0].rows.map(c=>this._renderRow(c,!1))}
			</ul>`;let r=this._config.lists?.length===1;return this._renderGroups(r?l.map(c=>({...c,label:c.label.split(" \xB7 ").pop()??c.label})):l,!1)}_renderGroups(t,e,n=!0){return t.some(i=>i.rows.length)?h`<div class="groups">
			${t.map(i=>h`<section>
				<h3 class=${i.late?"late":""}>
					${i.color!==void 0?h`<i class="dot" style=${i.color?`background:${i.color}`:""}></i>`:u}
					${i.label}
				</h3>
				${i.rows.length?h`<ul>
							${i.rows.map(a=>this._renderRow(a,e,n))}
						</ul>`:h`<div class="none-today">Nothing planned.</div>`}
				</section>`)}
		</div>`:h`<div class="empty">Nothing to do here.</div>`}_renderRow(t,e,n=!0,i=!0){let{item:a}=t,{task:l}=a,r=this._pending.has(l.id),c=a.open===r,d=a.open&&a.day!==null&&a.day<this._today,p=this._person||!i?[]:this._people(),m=p.length>1?p.filter(g=>a.owners.includes(g.entryId)):[],y=[a.day&&(n||d)?L(a.day,this._today,this._language):"",a.day&&a.time?ut(a.time,this._language):""].filter(Boolean).join(", ");return h`
			<li>
				<div class="row">
					${m.length?h`<span class="who" role="img" aria-label=${m.map(g=>g.name).join(", ")} title=${m.map(g=>g.name).join(", ")}>
								${m.map(g=>h`<i style="background:${g.color}"></i>`)}
							</span>`:u}
					<button
						class="check p${l.priority} ${c?"closed":""}"
						role="checkbox"
						aria-checked=${c}
						aria-label=${`${c?"Reopen":"Complete"} ${l.title}`}
						?disabled=${!a.canWrite}
						@click=${()=>this._toggle(a)}
					>
						${k($.check)}
					</button>
					<button class="what" ?disabled=${!a.canWrite} @click=${()=>this._edit(a)}>
						<span class="name">${l.title}</span>
						<span class="meta">
							${y?h`<span class=${d?"late":""}>${y}</span>`:u}
							${l.recurrence?h`<span title="Repeats">${k($.repeat)}</span>`:u}
							${e&&a.list?h`<span class="in"><i class="dot" style=${a.list.color?`background:${a.list.color}`:""}></i>${a.list.name}</span>`:u}
							${a.others.map(g=>h`<span class="to">@${g}</span>`)}
							${l.tags.map(g=>h`<span class="tag">#${g}</span>`)}
						</span>
					</button>
				</div>
				${t.subtasks.length?h`<ul>
							${ft(t.subtasks).map(g=>this._renderRow(g,!1))}
						</ul>`:u}
			</li>
		`}_renderHeatmap(t){let e=this._config.range??_.range,n=this._anchor??this._today,i=this._language,a=Jt(this._hass?.locale?.first_weekday,i),l=yt(t,"month",n,a),r=this._selected??this._today,c=f=>{this._anchor=e==="year"?Y(n,12*f):Y(n,f)},d=e==="year"?n.slice(0,4):v(n.slice(0,7)+"-01",i,{month:"long",year:"numeric"}),p=l[0]?.map(f=>v(f.day,i,{weekday:"narrow"}))??[],m=f=>h`
				<button
					class="cell l${f.level} ${f.inRange?"":"out"} ${f.day===this._today?"today":""}"
					style="--level:${f.level}"
					aria-pressed=${f.day===r}
					aria-label=${`${v(f.day,i,{weekday:"long",month:"long",day:"numeric"})}: ${f.count} ${f.count===1?"task":"tasks"}`}
					title=${`${v(f.day,i,{month:"short",day:"numeric"})}: ${f.count}`}
					tabindex=${f.inRange?0:-1}
					@click=${()=>this._selected=f.day}
				>
					${Number(f.day.slice(8))}
				</button>
			`,y=e==="year"?Array.from({length:12},(f,F)=>`${n.slice(0,4)}-${String(F+1).padStart(2,"0")}-01`):[],g=t.filter(f=>f.day===r);return h`
			<div class="nav">
				<strong>${d}</strong>
				<button aria-label="Today" title="Today" @click=${()=>(this._anchor=null,this._selected=null)}>${k($.today)}</button>
				<button aria-label="Earlier" @click=${()=>c(-1)}>${k($.left)}</button>
				<button aria-label="Later" @click=${()=>c(1)}>${k($.right)}</button>
			</div>
			${e==="year"?h`<div class="year">
						${y.map(f=>h`
								<div>
									<div class="month-name">${v(f,i,{month:"short"})}</div>
									<div class="heat small">${yt(t,"month",f,a).flat().map(m)}</div>
								</div>
							`)}
					</div>`:h`<div class="heat">${p.map(f=>h`<span class="wd">${f}</span>`)} ${l.flat().map(m)}</div>`}
			<div class="legend">
				Less ${[0,1,2,3,4].map(f=>h`<i style="--level:${f}"></i>`)} More
			</div>
			<h3>${L(r,this._today,i)} · ${v(r,i,{month:"short",day:"numeric"})}</h3>
			${g.length?h`<ul>
						${g.map(f=>this._renderRow({item:f,subtasks:[]},!0,!1))}
					</ul>`:h`<div class="none-today">Nothing planned.</div>`}
		`}_renderDialog(t){let e=()=>this._draft=null;return h`
			<div
				class="scrim"
				@click=${n=>n.target===n.currentTarget&&e()}
				@keydown=${n=>n.key==="Escape"&&e()}
			>
				<form role="dialog" aria-modal="true" aria-label="Edit task" @submit=${this._save}>
					<label>
						Title
						<input
							type="text"
							maxlength="2000"
							.value=${t.title}
							@input=${n=>this._set({title:n.target.value})}
						/>
					</label>
					<div class="two">
						<label>
							Date
							<input type="date" .value=${t.day} @input=${n=>this._set({day:n.target.value})} />
						</label>
						<label>
							Time
							<input
								type="time"
								.value=${t.time}
								?disabled=${!t.day}
								@input=${n=>this._set({time:n.target.value})}
							/>
						</label>
					</div>
					<label id="prio">Priority</label>
					<div class="prio" role="group" aria-labelledby="prio">
						${xe.map((n,i)=>h`<button type="button" aria-pressed=${t.priority===i} @click=${()=>this._set({priority:i})}>
									${n}
								</button>`)}
					</div>
					${t.assignees?h`<label id="assign">Assigned to</label>
								<div class="assign" role="group" aria-labelledby="assign">
									${this._assignable(t.item).map(n=>h`<button
												type="button"
												class="chip"
												aria-pressed=${t.assignees.includes(n.id)}
												@click=${()=>this._set({assignees:t.assignees.includes(n.id)?t.assignees.filter(i=>i!==n.id):[...t.assignees,n.id]})}
											>
												${n.me?"Me":n.name}
											</button>`)}
								</div>`:u}
					<label>
						Tags
						<input
							type="text"
							placeholder="home, yard/front"
							.value=${t.tags}
							@input=${n=>this._set({tags:n.target.value})}
						/>
					</label>
					<label>
						Notes
						<textarea .value=${t.notes} @input=${n=>this._set({notes:n.target.value})}></textarea>
					</label>
					${t.error?h`<div class="error" role="alert">${t.error}</div>`:u}
					<div class="actions">
						<button type="button" class="btn danger" ?disabled=${t.saving} @click=${this._delete}>Delete</button>
						<span class="grow"></span>
						<button type="button" class="btn" @click=${e}>Cancel</button>
						<button type="submit" class="btn primary" ?disabled=${t.saving}>Save</button>
					</div>
				</form>
			</div>
		`}};customElements.get("pecklist-card")||customElements.define("pecklist-card",vt);var bt=window;bt.customCards??=[];bt.customCards.some(o=>o.type==="pecklist-card")||bt.customCards.push({type:"pecklist-card",name:"PeckList",description:"Tasks from PeckList: at a glance, lists, an agenda or a busy-day heatmap.",preview:!0,documentationURL:"https://github.com/KillSwitchIO/pecklist-card"});export{vt as PeckListCard};
