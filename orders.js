const searchBtn = document.getElementById("searchBtn");
const searchUid = document.getElementById("searchUid");
const ordersResult = document.getElementById("ordersResult");

searchBtn.onclick = function () {

    const uid = searchUid.value.trim();

    if (uid == "") {
        ordersResult.innerHTML = "<p style='color:red;'>❌ Please enter your UID.</p>";
        return;
    }

    ordersResult.innerHTML = "<p>⏳ Searching...</p>";

    db.collection("orders")
        .where("uid", "==", uid)
        .get()
        .then((snapshot) => {

            if (snapshot.empty) {
                ordersResult.innerHTML = "<p>❌ No orders found.</p>";
                return;
            }

            let html = "";

            snapshot.forEach((doc) => {

                const order = doc.data();

                html += `
                <div class="card">
                    <h3>🎮 ${order.game}
                <p><b>Order ID:</b> ${order.orderId}</p>
                  </h3>
                    <p><b>UID:</b> ${order.uid}</p>
                    <p><b>Package:</b> ${order.package}</p>
                    <p><b>Payment:</b> ${order.payment}</p>
                    <p><b>Status:</b> ${order.status}</p>
                </div>
                `;
            });

            ordersResult.innerHTML = html;

        })
        .catch((error) => {
            ordersResult.innerHTML = "<p style='color:red;'>❌ " + error.message + "</p>";
        });

};