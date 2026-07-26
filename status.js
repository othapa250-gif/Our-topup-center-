function adminLogin() {

    let password = prompt("🔒 Enter Admin Password");

    if (password !== "Aman12@.") {
        alert("❌ Wrong Password");
        window.location.href = "index.html";
        return;
    }

}

window.onload = function () {

    adminLogin();

  

      
    const page = window.location.pathname.split("/").pop();

let status = "Pending";

if (page == "completed.html") {
    status = "Completed";
}
else if (page == "cancelled.html") {
    status = "Cancelled";
}

db.collection("orders")
.where("status", "==", status)

    
    .onSnapshot((snapshot) => {

        let html = "";

        snapshot.forEach((doc) => {

            const order = doc.data();

            html += `
            <div class="card">

                <h3>🎮 ${order.game}</h3>

                <p><b>Order ID:</b> ${order.orderId}</p>

                <p><b>UID:</b> ${order.uid}</p>

                <p><b>Package:</b> ${order.package}</p>

                <p><b>Payment:</b> ${order.payment}</p>

              
                

        ${page == "pending.html" ? `
<button onclick="updateStatus('${doc.id}','Completed')">✅ Complete</button>
<button onclick="updateStatus('${doc.id}','Cancelled')">❌ Cancel</button>
` : ""}

${page == "completed.html" ? `
<button onclick="updateStatus('${doc.id}','Pending')">🟡 Pending</button>
<button onclick="updateStatus('${doc.id}','Cancelled')">❌ Cancel</button>
` : ""}

${page == "cancelled.html" ? `
<button onclick="updateStatus('${doc.id}','Pending')">🟡 Pending</button>
<button onclick="updateStatus('${doc.id}','Completed')">✅ Complete</button>
` : ""}
            
        

            </div>
            `;

        });

        document.getElementById("ordersList").innerHTML = html;

    });

};

function updateStatus(id, status){

    db.collection("orders").doc(id).update({
        status: status
    });

}