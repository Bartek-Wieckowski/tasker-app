import{p as t,ae as u,n as y,q as f,j as e,L as g,k as C,R as N}from"./index-C0sRYjFE.js";import{u as k,i as c,d as i,L as v}from"./LightboxImage-SiUKCyWQ.js";/**
 * @license lucide-react v0.358.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const L=t("CircleChevronLeft",[["circle",{cx:"12",cy:"12",r:"10",key:"1mglay"}],["path",{d:"m14 16-4-4 4-4",key:"ojs7w8"}]]);/**
 * @license lucide-react v0.358.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const b=t("CopyCheck",[["path",{d:"m12 15 2 2 4-4",key:"2c609p"}],["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]);/**
 * @license lucide-react v0.358.0 - ISC
 *
 * This source code is licensed under the ISC license.
 * See the LICENSE file in the root directory of this source tree.
 */const T=t("CopyX",[["line",{x1:"12",x2:"18",y1:"12",y2:"18",key:"1rg63v"}],["line",{x1:"12",x2:"18",y1:"18",y2:"12",key:"ebkxgr"}],["rect",{width:"14",height:"14",x:"8",y:"8",rx:"2",ry:"2",key:"17jyea"}],["path",{d:"M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2",key:"zix9uf"}]]),A=()=>{const{id:o}=u(),{selectedDate:a,currentUser:r}=y(),{isLoading:n,isError:d,todo:s}=k(o,a,r),[x,l]=f.useState(!1),m=()=>{l(!1)};if(n||!s)return e.jsx(g,{});if(d)return e.jsx("h1",{children:"Item don't exist!"});const h=c(s==null?void 0:s.createdAt),p=s.updatedAt&&c(s==null?void 0:s.updatedAt),j=[{src:s==null?void 0:s.imageUrl}];return e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsx("nav",{children:e.jsx(C,{to:N.home,children:e.jsx(L,{})})}),e.jsxs("div",{className:"max-5xl w-full border border-slate-200 p-3 rounded-md shadow",children:[e.jsxs("div",{className:"flex flex-col sm:flex-row  items-start sm:items-center justify-between mb-4",children:[e.jsxs("div",{className:"text-sm text-slate-700",children:[e.jsx("span",{children:"Create todo: "}),e.jsx("span",{className:"font-semibold italic",children:i(h)})]}),e.jsxs("div",{className:"text-sm text-slate-700",children:[e.jsx("span",{children:"Current date todo: "}),e.jsx("span",{className:"font-semibold italic",children:a})]}),s.updatedAt&&e.jsxs("div",{className:"text-sm text-slate-700",children:[e.jsx("span",{children:"Last update todo: "}),e.jsx("span",{className:"font-semibold italic",children:i(p)})]})]}),e.jsxs("div",{className:"flex flex-col gap-4",children:[e.jsxs("div",{className:"text-sm text-slate-700 flex item-center gap-3",children:[e.jsx("span",{children:"Todo status: "}),e.jsx("span",{children:s.isCompleted?e.jsx(b,{className:"text-teal-400"}):e.jsx(T,{className:"text-rose-400"})})]}),e.jsxs("div",{className:"text-sm text-slate-700",children:[e.jsx("span",{children:"Todo title: "}),e.jsx("span",{className:"font-semibold italic",children:s.todo})]}),s.todoMoreContent&&e.jsxs("div",{className:"text-sm text-slate-700",children:[e.jsx("span",{children:"Todo more content: "}),e.jsx("span",{className:"font-semibold italic",children:s.todoMoreContent})]}),e.jsxs("div",{className:"mx-auto",children:[s.imageUrl&&e.jsx("img",{src:s.imageUrl,alt:s.todo,onClick:()=>l(!0),className:"block cursor-zoom-in"}),s.imageUrl&&e.jsx(v,{open:x,onClose:m,slides:j})]})]})]})]})};export{A as default};
