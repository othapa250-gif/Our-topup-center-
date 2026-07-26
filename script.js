const payment = document.getElementById("payment");
const qrBox = document.getElementById("qrBox");
const qrImage = document.getElementById("qrImage");

if (payment) {
    payment.onchange = function () {

        if (payment.value == "eSewa") {
            qrImage.src = "images/esewa.jpeg";
            qrBox.style.display = "block";
        }

        else if (payment.value == "Khalti") {
            qrImage.src = "images/khalti.jpeg";
            qrBox.style.display = "block";
        }

        else {
            qrBox.style.display = "none";
        }

    };
}

let selectedPackage = "";

const packages = document.querySelectorAll(".package");

packages.forEach(function(card){

    card.onclick = function(){

        packages.forEach(function(c){
            c.classList.remove("selected");
        });

        this.classList.add("selected");

        selectedPackage = this.dataset.package;

    };

});

const submitOrder = document.getElementById("submitOrder");
const uid = document.getElementById("uid");
const paymentMethod = document.getElementById("payment");
const message = document.getElementById("message");

if (submitOrder) {

submitOrder.onclick = function(){

    if(uid.value==""){
        message.innerHTML="❌ Please enter your Free Fire UID";
        message.style.color="red";
        return;
    }

    if(selectedPackage==""){
        message.innerHTML="❌ Please select a diamond package";
        message.style.color="red";
        return;
    }

    if(paymentMethod.value=="Select Payment Method"){
        message.innerHTML="❌ Please select a payment method";
        message.style.color="red";
        return;
    }

    message.innerHTML="⏳ Sending Order...";
    message.style.color="yellow";


      const orderId = "OTC" + Date.now();

db.collection("orders").add({
    orderId: orderId,
        game: "Free Fire",
        uid: uid.value,
        package: selectedPackage,
        payment: paymentMethod.value,
        status: "Pending",
        time: firebase.firestore.FieldValue.serverTimestamp()
    })

    .then(function(){

        message.innerHTML="✅ Order Submitted Successfully!";
        message.style.color="lime";

        uid.value="";
        paymentMethod.selectedIndex=0;
        qrBox.style.display="none";

        packages.forEach(function(c){
            c.classList.remove("selected");
        });

        selectedPackage="";

    })

    .catch(function(error){

        message.innerHTML="❌ "+error.message;
        message.style.color="red";

    });

};

}