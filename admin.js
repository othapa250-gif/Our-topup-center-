function adminLogin(); {

    if (sessionStorage.getItem("adminLoggedIn") == "true") {
        return;
    }

    let password = prompt("🔒 Enter Admin Password");

    if (password === "Aman12@.") {
        sessionStorage.setItem("adminLoggedIn", "true");
    } else {
        alert("❌ Wrong Password");
        window.location.href = "index.html";
    }

}
    



db.collection("orders").onSnapshot((snapshot) => {

    let pendingHtml = "";
let completedHtml = "";
let cancelledHtml = "";

    let total = 0;
    let pending = 0;
    let completed = 0;
    let cancelled = 0;

    snapshot.forEach((doc) => {

        total++;

        const order = doc.data();

        if (order.status == "Pending") pending++;
        if (order.status == "Completed") completed++;
        if (order.status == "Cancelled") cancelled++;

        let card = `
<div class="card">

<h3>🎮 ${order.game}</h3>

<p><b>Order ID:</b> ${order.orderId}</p>

<p><b>UID:</b> ${order.uid}</p>

<p><b>Package:</b> ${order.package}</p>

<p><b>Payment:</b> ${order.payment}</p>

<p><b>Status:</b> ${order.status}</p>

<button onclick="updateStatus('${doc.id}','Completed')">✅ Complete</button>

<button onclick="updateStatus('${doc.id}','Cancelled')">❌ Cancel</button>

<button onclick="updateStatus('${doc.id}','Pending')">🟡 Pending</button>

</div>
`;

if(order.status=="Pending"){
    pendingHtml += card;
}

else if(order.status=="Completed"){
    completedHtml += card;
}

else if(order.status=="Cancelled"){
    cancelledHtml += card;
}

    });


    
 document.getElementById("pendingList").innerHTML = pendingHtml;
document.getElementById("completedList").innerHTML = completedHtml;
document.getElementById("cancelledList").innerHTML = cancelledHtml; 
  document.getElementById("totalOrders").innerHTML = total;
    document.getElementById("pendingOrders").innerHTML = pending;
    document.getElementById("completedOrders").innerHTML = completed;
    document.getElementById("cancelledOrders").innerHTML = cancelled;

});

function updateStatus(id, status){

    db.collection("orders").doc(id).update({
        status: status
    });

}