const SUPABASE_URL="https://kxswfgheuihgndtlvzqf.supabase.co";
const SUPABASE_KEY="sb_publishable_1u_jlW3DDNGVRVe2He6dnQ_QYiiyWTJ";
const TABLE="Order";

const supabaseClient=supabase.createClient(SUPABASE_URL,SUPABASE_KEY);

function adminLogin(){
if(sessionStorage.getItem("adminLoggedIn")==="true") return;

let password=prompt("🔒 Enter Admin Password");

if(password==="Aman12@."){
sessionStorage.setItem("adminLoggedIn","true");
}else{
alert("Wrong Password");
window.location.href="index.html";
}
}

async function loadOrders(){

const page=window.location.pathname.split("/").pop();

let status="Pending";

if(page==="completed.html") status="Completed";
if(page==="cancelled.html") status="Cancelled";

const {data,error}=await supabaseClient
.from(TABLE)
.select("*")
.eq("Status",status)
.order("orderid",{ascending:false});

if(error){
alert(error.message);
console.log(error);
return;
}

let html="";

data.forEach(order=>{

html+=`
<div class="card">

<h3>${order.Game}</h3>

<p><b>Order ID:</b> ${order.orderid}</p>

<p><b>UID:</b> ${order.Uid}</p>

<p><b>Package:</b> ${order.Package}</p>

<p><b>Payment:</b> ${order.Payment}</p>

<p><a href="${order.Screenshot}" target="_blank">Payment Screenshot</a></p>

${page==="pending.html"?`
<button onclick="updateStatus('${order.orderid}','Completed')">✅ Complete</button>
<button onclick="updateStatus('${order.orderid}','Cancelled')">❌ Cancel</button>
`:``}

${page==="completed.html"?`
<button onclick="updateStatus('${order.orderid}','Pending')">🟡 Pending</button>
<button onclick="updateStatus('${order.orderid}','Cancelled')">❌ Cancel</button>
`:``}

${page==="cancelled.html"?`
<button onclick="updateStatus('${order.orderid}','Pending')">🟡 Pending</button>
<button onclick="updateStatus('${order.orderid}','Completed')">✅ Complete</button>
`:``}

</div>
`;

});

document.getElementById("ordersList").innerHTML=html;

}

async function updateStatus(orderid,status){

await supabaseClient
.from(TABLE)
.update({Status:status})
.eq("orderid",orderid);

loadOrders();

}

window.onload=async function(){

adminLogin();

await loadOrders();

};