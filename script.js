// ==============================
// TELEGRAM
// ==============================
const TELEGRAM_BOT_TOKEN = "8905929751:AAGLfc7ujprKvTfrrsxmuBQxBsI8d-ZgntM";
const TELEGRAM_CHAT_ID = "6249332654";

// ==============================
// SUPABASE
// ==============================
const SUPABASE_URL = "https://kxswfgheuihgndtlvzqf.supabase.co";
const SUPABASE_KEY = "sb_publishable_1u_jlW3DDNGVRVe2He6dnQ_QYiiyWTJ";
const STORAGE_BUCKET = "payment";
const TABLE = "Order";

const supabaseClient =
typeof supabase !== "undefined" &&
typeof supabase.createClient === "function"
? supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
: null;

// ==============================
// ELEMENTS
// ==============================
const payment = document.getElementById("payment");
const qrBox = document.getElementById("qrBox");
const qrImage = document.getElementById("qrImage");
const downloadQR = document.getElementById("downloadQR");

const uid = document.getElementById("uid");
const submitOrder = document.getElementById("submitOrder");
const message = document.getElementById("message");
const paymentProof = document.getElementById("paymentProof");

const packages = document.querySelectorAll(".package");

let selectedPackage = "";

// ==============================
// MESSAGE
// ==============================
function showMessage(text,color){

if(message){

message.innerHTML=text;
message.style.color=color;

}

}

// ==============================
// PAYMENT QR
// ==============================
if(payment){

payment.addEventListener("change",function(){

if(this.value==="eSewa"){

qrImage.src="images/esewa.jpeg";

if(downloadQR)
downloadQR.href="images/esewa.jpeg";

qrBox.style.display="block";

}

else if(this.value==="Khalti"){

qrImage.src="images/khalti.jpeg";

if(downloadQR)
downloadQR.href="images/khalti.jpeg";

qrBox.style.display="block";

}

else if(this.value==="Bank"){

qrImage.src="images/bank.jpeg";

if(downloadQR)
downloadQR.href="images/bank.jpeg";

qrBox.style.display="block";

}

else{

qrBox.style.display="none";

}

});

}

// ==============================
// PACKAGE
// ==============================
packages.forEach(card=>{

card.addEventListener("click",()=>{

packages.forEach(c=>c.classList.remove("selected"));

card.classList.add("selected");

selectedPackage=card.dataset.package;

});

});
// ==============================
// SUBMIT ORDER
// ==============================

if(submitOrder){

submitOrder.addEventListener("click",async()=>{

if(!supabaseClient){

showMessage("❌ Supabase not loaded","red");

return;

}

const uidValue=uid.value.trim();

if(uidValue===""){

showMessage("❌ Enter UID","red");

return;

}

if(selectedPackage===""){

showMessage("❌ Select a package","red");

return;

}

if(payment.value==="Select Payment Method"){

showMessage("❌ Select payment method","red");

return;

}

const file=paymentProof.files[0];

if(!file){

showMessage("❌ Upload payment screenshot","red");

return;

}

submitOrder.disabled=true;

showMessage("⏳ Uploading Screenshot...","yellow");

const fileName=`${Date.now()}_${file.name}`.replace(/\s+/g,"_");

try{

const { error: uploadError } = await supabaseClient.storage
.from(STORAGE_BUCKET)
.upload(fileName,file,{
contentType:file.type,
upsert:false
});

if(uploadError) throw uploadError;

const { data: publicData } =
supabaseClient.storage
.from(STORAGE_BUCKET)
.getPublicUrl(fileName);

const screenshotUrl = publicData.publicUrl;

showMessage("⏳ Saving Order...","yellow");

const orderId = "OTC"+Date.now();

let customerID = localStorage.getItem("CustomerID");

if(!customerID){

customerID = crypto.randomUUID();

localStorage.setItem("CustomerID",customerID);

}
  const { error: insertError } = await supabaseClient
.from(TABLE)
.insert([
{
Game:"Free Fire",
Uid:uidValue,
Package:selectedPackage,
Payment:payment.value,
Screenshot:screenshotUrl,
Status:"Pending",
orderid:orderId,
CustomerID:customerID
}
]);

if(insertError) throw insertError;

showMessage("📤 Sending Telegram...","yellow");

  let telegramSuccess = false;

try{

const controller = new AbortController();

const timeout = setTimeout(()=>{
controller.abort();
},5000);

const response = await fetch(
`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
chat_id:TELEGRAM_CHAT_ID,
text:
`🛒 New Free Fire Order

🎮 Game: Free Fire
🆔 UID: ${uidValue}
💎 Package: ${selectedPackage}
💳 Payment: ${payment.value}
📦 Status: Pending
🆔 Order ID: ${orderId}

📷 Screenshot:
${screenshotUrl}`
}),
signal:controller.signal
}
);

clearTimeout(timeout);

if(response.ok){

telegramSuccess=true;

}

}catch(err){

console.log("Telegram Failed",err);

}
  localStorage.setItem("lastUID", uidValue);

showMessage("✅ Order Submitted Successfully!", "lime");

uid.value = "";
payment.selectedIndex = 0;
paymentProof.value = "";

if(qrBox){
    qrBox.style.display = "none";
}

packages.forEach(card=>{
    card.classList.remove("selected");
});

selectedPackage = "";

submitOrder.disabled = false;

}catch(err){

console.error(err);

showMessage("❌ " + (err.message || "Unknown Error"), "red");

submitOrder.disabled = false;

}



});

}