const TELEGRAM_BOT_TOKEN = "8905929751:AAGLfc7ujprKvTfrrsxmuBQxBsI8d-ZgntM";
const TELEGRAM_CHAT_ID = "6249332654";

const SUPABASE_URL = "https://kxswfgheuihgndtlvzqf.supabase.co";
const SUPABASE_KEY = "sb_publishable_1u_jlW3DDNGVRVe2He6dnQ_QYiiyWTJ";
const STORAGE_BUCKET = "payment";
const TABLE = "Order";



const supabaseClient =
    typeof supabase !== "undefined" && typeof supabase.createClient === "function"
        ? supabase.createClient(SUPABASE_URL, SUPABASE_KEY)
        : null;

const payment = document.getElementById("payment");
const qrBox = document.getElementById("qrBox");
const qrImage = document.getElementById("qrImage");
const uid = document.getElementById("uid");
const submitOrder = document.getElementById("submitOrder");
const message = document.getElementById("message");
const paymentProof = document.getElementById("paymentProof");
const packages = document.querySelectorAll(".package");

let selectedPackage = "";

function showMessage(text, color) {
    if (message) {
        message.innerHTML = text;
        message.style.color = color;
    }
}

if (payment && qrBox && qrImage) {
    payment.addEventListener("change", function () {
        if (this.value === "eSewa") {
            qrImage.src = "images/esewa.jpeg";
            qrBox.style.display = "block";
        } else if (this.value === "Khalti") {
            qrImage.src = "images/khalti.jpeg";
            qrBox.style.display = "block";
        } else {
            qrBox.style.display = "none";
        }
    });
}

if (packages.length) {
    packages.forEach(function (card) {
        card.addEventListener("click", function () {
            packages.forEach(function (c) {
                c.classList.remove("selected");
            });

            this.classList.add("selected");
            selectedPackage = this.dataset.package;
        });
    });
}

if (submitOrder && uid && payment && paymentProof) {
    submitOrder.addEventListener("click", async function () {
        if (!supabaseClient) {
            showMessage("❌ Supabase library not loaded", "red");
            return;
        }

        try {
            const uidValue = uid.value.trim();

            if (uidValue === "") {
                showMessage("❌ Please enter UID", "red");
                return;
            }

            if (selectedPackage === "") {
                showMessage("❌ Select a package", "red");
                return;
            }

            if (payment.value === "Select Payment Method") {
                showMessage("❌ Select payment", "red");
                return;
            }

            const file = paymentProof.files[0];

            if (!file) {
                showMessage("❌ Upload payment screenshot", "red");
                return;
            }

            submitOrder.disabled = true;
            showMessage("⏳ Uploading screenshot...", "yellow");

            const fileName = `${Date.now()}_${file.name}`.replace(/\s+/g, "_");

            const { error: uploadError } = await supabaseClient.storage
                .from(STORAGE_BUCKET)
                .upload(fileName, file, {
                    contentType: file.type,
                    upsert: false
                });

            if (uploadError) throw uploadError;

            const { data: publicData } = supabaseClient.storage
                .from(STORAGE_BUCKET)
                .getPublicUrl(fileName);

            const screenshotUrl = publicData.publicUrl;

            showMessage("⏳ Saving order...", "yellow");

            const orderId = "OTC" + Date.now();

          let customerID = localStorage.getItem("CustomerID");

if (!customerID) {
    customerID = crypto.randomUUID();
    localStorage.setItem("CustomerID", customerID);
}

            const { error: insertError } = await supabaseClient
                .from(TABLE)
                .insert(
                    [
                        {
                            Game: "Free Fire",
                            Uid: uidValue,
                            Package: selectedPackage,
                            Payment: payment.value,
                            Screenshot: screenshotUrl,
                            Status: "Pending",
                            orderid: orderId,
                          CustomerID: customerID,
                        }
                    ],
                    { returning: "minimal" }
                );

            if (insertError) throw insertError;

await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
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
    })
});
          localStorage.setItem("lastUID", uidValue);
            showMessage("✅ Order Submitted Successfully!", "lime");

            uid.value = "";
            payment.selectedIndex = 0;
            paymentProof.value = "";
            if (qrBox) qrBox.style.display = "none";

            packages.forEach(function (c) {
                c.classList.remove("selected");
            });

            selectedPackage = "";
        } catch (err) {
            showMessage("❌ " + (err?.message || String(err)), "red");
        } finally {
            submitOrder.disabled = false;
        }
    });
}
        