if(!self.define){let e,s={};const i=(i,r)=>(i=new URL(i+".js",r).href,s[i]||new Promise((s=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=s,document.head.appendChild(e)}else e=i,importScripts(i),s()})).then((()=>{let e=s[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e})));self.define=(r,n)=>{const l=e||("document"in self?document.currentScript.src:"")||location.href;if(s[l])return;let t={};const o=e=>i(e,l),u={module:{uri:l},exports:t,require:o};s[l]=Promise.all(r.map((e=>u[e]||o(e)))).then((e=>(n(...e),t)))}}define(["./workbox-3e911b1d"],(function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"assets/Homepage-T6cWPxqJ.js",revision:null},{url:"assets/index-C0sRYjFE.js",revision:null},{url:"assets/index-CJcyyY_e.css",revision:null},{url:"assets/LightboxImage-BOrFrxww.css",revision:null},{url:"assets/LightboxImage-SiUKCyWQ.js",revision:null},{url:"assets/Login-CVYRkF1X.js",revision:null},{url:"assets/Register-Ckn44Y6q.js",revision:null},{url:"assets/Todopage-BK9lNsRD.js",revision:null},{url:"assets/TodosList-CETfI2Rf.js",revision:null},{url:"index.html",revision:"91a3ce5cb6f673e4e346fd2b2d38ed80"},{url:"registerSW.js",revision:"1872c500de691dce40960bb85481de07"},{url:"vite.svg",revision:"8e3a10e157f75ada21ab742c022d5430"},{url:"vite.svg",revision:"8e3a10e157f75ada21ab742c022d5430"},{url:"manifest.webmanifest",revision:"38686771ed8efa72527828c09953ec3f"}],{}),e.cleanupOutdatedCaches(),e.registerRoute(new e.NavigationRoute(e.createHandlerBoundToURL("index.html")))}));
