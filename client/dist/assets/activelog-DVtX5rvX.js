import{r,j as e,a,n as ue,m as pe}from"./index-CVZjuLi7.js";import"./FileSaver.min-bESbsLFu.js";function xe({title:i,titleId:m,...t},y){return r.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true",ref:y,"aria-labelledby":m},t),i?r.createElement("title",{id:m},i):null,r.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5"}))}const le=r.forwardRef(xe);function be({title:i,titleId:m,...t},y){return r.createElement("svg",Object.assign({xmlns:"http://www.w3.org/2000/svg",fill:"none",viewBox:"0 0 24 24",strokeWidth:1.5,stroke:"currentColor","aria-hidden":"true",ref:y,"aria-labelledby":m},t),i?r.createElement("title",{id:m},i):null,r.createElement("path",{strokeLinecap:"round",strokeLinejoin:"round",d:"M12 6.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 12.75a.75.75 0 110-1.5.75.75 0 010 1.5zM12 18.75a.75.75 0 110-1.5.75.75 0 010 1.5z"}))}const Ne=r.forwardRef(be),je=["Người dùng","Hành động","Loại thực thể","Địa chỉ IP","Thời gian","Tùy chọn"];function we(){const[i,m]=r.useState([]),[t,y]=r.useState(1),[h,ve]=r.useState(10),[g,se]=r.useState(0),[w,re]=r.useState(""),[V,ne]=r.useState(""),[l,D]=r.useState(null),[te,E]=r.useState(!1),[de,S]=r.useState(!0),[A,ie]=r.useState("");r.useEffect(()=>{(async()=>{S(!0);try{const n=await pe.post("/activelog",{sort:{updatedAt:-1},limitItem:10,page:t,startDate:w,endDate:V,entityType:A});m(n.data),se(n.totalItem)}catch(n){console.error("Error fetching logs:",n)}finally{S(!1)}})()},[t,w,V,A]);const k=s=>{y(s)},ce=s=>{D(s),E(!0)},L=()=>{E(!1),D(null)},oe=s=>{switch(s){case"DEPARTMENT":return e.jsx(a.Chip,{value:s,color:"indigo",className:"rounded-full text-center"});case"EMPLOYEE":return e.jsx(a.Chip,{value:s,color:"blue",className:"rounded-full text-center"});case"employees":return e.jsx(a.Chip,{value:s,color:"blue",className:"rounded-full text-center"});default:return e.jsx(a.Chip,{value:s,color:"orange",className:"rounded-full text-center"})}},me=()=>l?l.entityType==="DEPARTMENT"?he():l.entityType==="EMPLOYEE"||l.entityType==="employees"||l.entityType==="ADMIN"?ge():ye():null,he=()=>{var s,n,d,c,o,u,p,x,b,N,j,v,f,T;return e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x",children:[e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"flex items-center mb-5",children:[e.jsx("div",{className:"bg-green-500 w-3 h-3 rounded-md mr-2"}),e.jsx(a.Typography,{variant:"h6",color:"blue-gray",children:"Giá trị mới"})]}),e.jsxs("div",{className:"grid grid-cols-1 gap-4",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Tên phòng ban"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-green-50 p-2 rounded-md",children:((s=l.newValues)==null?void 0:s.name)||"N/A"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Mô tả"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-green-50 p-2 rounded-md",children:((n=l.newValues)==null?void 0:n.description)||"N/A"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Người quản lý"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-green-50 p-2 rounded-md",children:(d=l.newValues)!=null&&d.managerId?(o=(c=l.newValues)==null?void 0:c.managerId)==null?void 0:o.fullName:""})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Phòng"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-green-50 p-2 rounded-md",children:(u=l.newValues)!=null&&u.roomNumber?(p=l.newValues)==null?void 0:p.roomNumber:"N/A"})]})]})]}),e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"flex items-center mb-5",children:[e.jsx("div",{className:"bg-red-500 w-3 h-3 rounded-full mr-2"}),e.jsx(a.Typography,{variant:"h6",color:"blue-gray",children:"Giá trị cũ"})]}),e.jsxs("div",{className:"grid grid-cols-1 gap-4",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Tên phòng ban"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-red-50 p-2 rounded-md",children:((x=l.oldValues)==null?void 0:x.name)||"N/A"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Mô tả"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-red-50 p-2 rounded-md",children:((b=l.oldValues)==null?void 0:b.description)||"N/A"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Người quản lý"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-red-50 p-2 rounded-md",children:(N=l.oldValues)!=null&&N.managerId?(v=(j=l.newValues)==null?void 0:j.managerId)==null?void 0:v.fullName:"N/A"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Phòng"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-red-50 p-2 rounded-md",children:(f=l.oldValues)!=null&&f.roomNumber?(T=l.oldValues)==null?void 0:T.roomNumber:"N/A"})]})]})]})]})},ge=()=>{var s,n,d,c,o,u,p,x,b,N,j,v,f,T,I,C,M,P,B,O,F,R,z,G,U,H,Y,$,q,W,X,_,K,J,Q,Z,ee,ae;return e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x",children:[e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"flex items-center mb-5",children:[e.jsx("div",{className:"bg-green-500 w-3 h-3 rounded-full mr-2"}),e.jsx(a.Typography,{variant:"h6",color:"blue-gray",children:"Giá trị mới"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Username"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-green-50 p-2 rounded-md",children:((n=(s=l.newValues)==null?void 0:s.userId)==null?void 0:n.username)||"N/A"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Tên"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-green-50 p-2 rounded-md",children:((d=l.newValues)==null?void 0:d.fullName)||"N/A"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Giới tính"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-green-50 p-2 rounded-md",children:((c=l.newValues)==null?void 0:c.gender)||"N/A"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Email"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-green-50 p-2 rounded-md",children:((u=(o=l.newValues)==null?void 0:o.userId)==null?void 0:u.email)||"N/A"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Số điện thoại"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-green-50 p-2 rounded-md",children:((p=l.newValues)==null?void 0:p.phoneNumber)||"N/A"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Địa chỉ"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-green-50 p-2 rounded-md",children:((x=l.newValues)==null?void 0:x.address)||"N/A"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Ngày sinh"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-green-50 p-2 rounded-md",children:(b=l.newValues)!=null&&b.dateOfBirth?new Date(l.newValues.dateOfBirth).toLocaleDateString():"N/A"})]}),((j=(N=l.newValues)==null?void 0:N.userId)==null?void 0:j.role)!=="ADMIN"&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Lương cơ bản"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-green-50 p-2 rounded-md",children:(v=l.newValues)!=null&&v.baseSalary?((f=l.newValues)==null?void 0:f.baseSalary).toLocaleString("vi-VN",{style:"currency",currency:"VND"}):"N/A"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Phòng ban"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-green-50 p-2 rounded-md",children:((I=(T=l.newValues)==null?void 0:T.departmentId)==null?void 0:I.name)||"N/A"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Vị trí"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-green-50 p-2 rounded-md",children:((M=(C=l.newValues)==null?void 0:C.position)==null?void 0:M.name)||"N/A"})]})]})]}),((P=l.newValues)==null?void 0:P.avatarUrl)&&e.jsxs("div",{className:"mt-6",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700 mb-2",children:"Ảnh đại diện"}),e.jsx("div",{className:"bg-green-50 p-2 rounded-md inline-block",children:e.jsx("img",{className:"w-24 h-24 object-cover rounded-md border border-green-200",src:(B=l.newValues)==null?void 0:B.avatarUrl,alt:"Ảnh đại diện mới"})})]})]}),l.oldValues?e.jsxs("div",{className:"p-6",children:[e.jsxs("div",{className:"flex items-center mb-5",children:[e.jsx("div",{className:"bg-red-500 w-3 h-3 rounded-full mr-2"}),e.jsx(a.Typography,{variant:"h6",color:"blue-gray",children:"Giá trị cũ"})]}),e.jsxs("div",{className:"grid grid-cols-1 md:grid-cols-2 gap-4",children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Username"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-red-50 p-2 rounded-md",children:((F=(O=l.oldValues)==null?void 0:O.userId)==null?void 0:F.username)||"N/A"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Tên người dùng"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-red-50 p-2 rounded-md",children:((R=l.oldValues)==null?void 0:R.fullName)||"N/A"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Giới tính"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-red-50 p-2 rounded-md",children:((z=l.oldValues)==null?void 0:z.gender)||"N/A"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Email"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-red-50 p-2 rounded-md",children:((U=(G=l.oldValues)==null?void 0:G.userId)==null?void 0:U.email)||"N/A"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Số điện thoại"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-red-50 p-2 rounded-md",children:((H=l.oldValues)==null?void 0:H.phoneNumber)||"N/A"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Địa chỉ"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-red-50 p-2 rounded-md",children:((Y=l.oldValues)==null?void 0:Y.address)||"N/A"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Ngày sinh"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-red-50 p-2 rounded-md",children:($=l.oldValues)!=null&&$.dateOfBirth?new Date(l.oldValues.dateOfBirth).toLocaleDateString():"N/A"})]}),((W=(q=l.oldValues)==null?void 0:q.userId)==null?void 0:W.role)!=="ADMIN"&&e.jsxs(e.Fragment,{children:[e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Lương cơ bản"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-red-50 p-2 rounded-md",children:(X=l.oldValues)!=null&&X.baseSalary?((_=l.oldValues)==null?void 0:_.baseSalary).toLocaleString("vi-VN",{style:"currency",currency:"VND"}):"N/A"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Phòng ban"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-red-50 p-2 rounded-md",children:((J=(K=l.oldValues)==null?void 0:K.departmentId)==null?void 0:J.name)||"N/A"})]}),e.jsxs("div",{className:"space-y-1",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700",children:"Vị trí"}),e.jsx(a.Typography,{variant:"small",className:"block text-blue-gray-600 bg-red-50 p-2 rounded-md",children:((Z=(Q=l.oldValues)==null?void 0:Q.position)==null?void 0:Z.name)||"N/A"})]})]})]}),((ee=l.oldValues)==null?void 0:ee.avatarUrl)&&e.jsxs("div",{className:"mt-6",children:[e.jsx(a.Typography,{variant:"small",className:"font-semibold text-blue-gray-700 mb-2",children:"Ảnh đại diện"}),e.jsx("div",{className:"bg-red-50 p-2 rounded-md inline-block",children:e.jsx("img",{className:"w-24 h-24 object-cover rounded-md border border-red-200",src:(ae=l.oldValues)==null?void 0:ae.avatarUrl,alt:"Ảnh đại diện cũ"})})]})]}):e.jsx("div",{className:"p-6",children:e.jsx(a.Typography,{variant:"h6",color:"blue-gray",children:"Không có giá trị cũ"})})]})},ye=()=>e.jsxs("div",{className:"p-6",children:[e.jsx(a.Typography,{variant:"h6",color:"blue-gray",className:"mb-4",children:"Chi tiết hoạt động không có dữ liệu cụ thể"}),e.jsx(a.Typography,{variant:"paragraph",color:"blue-gray",children:"Xem thông tin cơ bản trong bảng hoạt động."})]});return e.jsxs(a.Card,{className:"h-full w-full",children:[e.jsx(a.CardHeader,{floated:!1,shadow:!1,className:"rounded-none",children:e.jsxs("div",{className:"mb-4 flex flex-col justify-between gap-8 md:flex-row md:items-center",children:[e.jsxs("div",{children:[e.jsx(a.Typography,{variant:"h5",color:"blue-gray",children:"Lịch sử hoạt động"}),e.jsx(a.Typography,{color:"gray",className:"mt-1 font-normal",children:"Xem lịch sử hoạt động"})]}),e.jsxs("div",{className:"flex w-full shrink-0 flex-col md:flex-row md:w-max gap-4",children:[e.jsxs("div",{className:"w-full md:w-30",children:[e.jsx(a.Typography,{variant:"small",color:"blue-gray",className:"mb-1 font-medium",children:"Loại thực thể"}),e.jsx("div",{className:"relative",children:e.jsxs("select",{value:A,onChange:s=>ie(s.target.value),className:"w-full h-10 px-3 border border-blue-gray-200 rounded-md focus:outline-none focus:border-blue-500",children:[e.jsx("option",{value:"",children:"Tất cả"}),e.jsx("option",{value:"DEPARTMENT",children:"Phòng ban"}),e.jsx("option",{value:"EMPLOYEE",children:"Nhân viên"})]})})]}),e.jsxs("div",{className:"flex flex-col md:flex-row gap-2 w-full",children:[e.jsxs("div",{className:"w-full md:w-48 mr-3",children:[e.jsx(a.Typography,{variant:"small",color:"blue-gray",className:"mb-1 font-medium",children:"From Date"}),e.jsxs("div",{className:"relative",children:[e.jsx(a.Input,{type:"date",value:w,onChange:s=>re(s.target.value),className:"pr-10 focus:ring-blue-500"}),e.jsx(le,{className:"h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-gray-300"})]})]}),e.jsxs("div",{className:"w-full md:w-48 mr-3",children:[e.jsx(a.Typography,{variant:"small",color:"blue-gray",className:"mb-1 font-medium",children:"To Date"}),e.jsxs("div",{className:"relative",children:[e.jsx(a.Input,{type:"date",value:V,onChange:s=>ne(s.target.value),className:"pr-10 focus:ring-blue-500"}),e.jsx(le,{className:"h-5 w-5 absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-gray-300"})]})]})]})]})]})}),e.jsx(a.CardBody,{className:"overflow-scroll px-0",children:de?e.jsxs("div",{className:"flex justify-center items-center py-10",children:[e.jsx(a.Spinner,{className:"h-12 w-12",color:"blue"}),e.jsx(a.Typography,{color:"blue-gray",className:"ml-2 font-medium",children:"Đang tải dữ liệu..."})]}):e.jsxs(e.Fragment,{children:[e.jsxs("table",{className:"w-full min-w-max table-auto text-left",children:[e.jsx("thead",{children:e.jsx("tr",{children:je.map(s=>e.jsx("th",{className:"border-b border-blue-gray-100 bg-blue-gray-50 p-4",children:e.jsx(a.Typography,{variant:"small",color:"blue-gray",className:"font-normal leading-none opacity-70",children:s})},s))})}),e.jsx("tbody",{children:i.map((s,n)=>{var c,o;const d="p-4 border-b border-blue-gray-50";return e.jsxs("tr",{className:"hover:bg-blue-gray-50/50",children:[e.jsx("td",{className:d,children:e.jsx(a.Typography,{variant:"small",color:"blue-gray",className:"font-normal",children:((o=(c=s.userId)==null?void 0:c.employeeId)==null?void 0:o.fullName)||"N/A"})}),e.jsx("td",{className:d,children:e.jsx(a.Typography,{variant:"small",color:"blue-gray",className:"font-normal",children:s.action})}),e.jsx("td",{className:d,children:oe(s.entityType)}),e.jsx("td",{className:d,children:e.jsx(a.Typography,{variant:"small",color:"blue-gray",className:"font-normal",children:s.ipAddress})}),e.jsx("td",{className:d,children:e.jsx(a.Typography,{variant:"small",color:"blue-gray",className:"font-normal",children:new Date(s.createdAt).toLocaleString()})}),e.jsx("td",{className:d,children:e.jsx(a.IconButton,{variant:"text",color:"blue-gray",className:"rounded-full",onClick:()=>ce(s),children:e.jsx(Ne,{className:"h-5 w-5"})})})]},n)})})]}),e.jsxs("div",{className:"flex items-center justify-between p-4",children:[e.jsxs(a.Typography,{variant:"small",color:"blue-gray",className:"font-normal",children:["Showing ",i.length>0?(t-1)*h+1:0," to ",Math.min(t*h,g)," of ",g," entries"]}),e.jsxs("div",{className:"flex gap-2",children:[e.jsx(a.Button,{variant:"outlined",color:"blue-gray",size:"sm",disabled:t===1,onClick:()=>k(t-1),children:"Previous"}),Array.from({length:Math.ceil(g/h)||1},(s,n)=>e.jsx(a.Button,{variant:t===n+1?"filled":"text",color:"blue-gray",size:"sm",onClick:()=>k(n+1),children:n+1},n+1)).slice(Math.max(0,t-3),Math.min(t+2,Math.ceil(g/h))),e.jsx(a.Button,{variant:"outlined",color:"blue-gray",size:"sm",disabled:t===Math.ceil(g/h)||Math.ceil(g/h)===0,onClick:()=>k(t+1),children:"Next"})]})]})]})}),e.jsxs(a.Dialog,{open:te,handler:L,size:"xl",className:"bg-white overflow-hidden",children:[e.jsxs(a.DialogHeader,{className:"flex justify-between items-center bg-blue-gray-50 px-6 py-4",children:[e.jsxs("div",{children:[e.jsx(a.Typography,{variant:"h5",color:"blue-gray",children:"Chi tiết hoạt động"}),l&&e.jsxs(a.Typography,{variant:"small",color:"blue-gray",className:"font-normal mt-1",children:[l.action," - ",l.entityType," - ",new Date(l.createdAt).toLocaleString()]})]}),e.jsx(a.IconButton,{variant:"text",color:"blue-gray",onClick:L,children:e.jsx(ue,{className:"h-5 w-5"})})]}),e.jsx(a.DialogBody,{className:"p-0",children:l?me():e.jsx("div",{className:"flex justify-center items-center h-64",children:e.jsx(a.Spinner,{color:"blue",className:"h-12 w-12"})})})]})]})}export{we as ActiveLogTable,we as default};
