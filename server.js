

// ज़रूरी लाइब्रेरीज को इम्पोर्ट करना
const express = require('express');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

// --- सुरक्षित शुरुआत ---
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET || !process.env.FIREBASE_SERVICE_ACCOUNT_JSON || !process.env.RAZORPAY_WEBHOOK_SECRET) {
console.error("FATAL ERROR: One or more environment variables are missing.");
process.exit(1);
}

// --- Firebase और Razorpay का सेटअप ---
let db, razorpay;
try {
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
admin.initializeApp({
credential: admin.credential.cert(serviceAccount),
databaseURL: "https://conceptra-c1000-default-rtdb.firebaseio.com"
});
db = admin.database();
razorpay = new Razorpay({
key_id: process.env.RAZORPAY_KEY_ID,
key_secret: process.env.RAZORPAY_KEY_SECRET,
});
console.log("✅ Firebase and Razorpay initialized successfully for LIVE mode.");
} catch (error) {
console.error("❌ SETUP FAILED:", error.message);
process.exit(1);
}

const app = express();

// =====================================================================================
// ==================== सिर्फ यही एक ज़रूरी बदलाव किया गया है ===========================
// =====================================================================================
// CORS को सबसे खुली सेटिंग पर सेट करना ताकि ब्राउज़र जवाब को ब्लॉक न करे
app.use(cors());
// =====================================================================================
// =====================================================================================

// ===================================================================
// ==================== सिर्फ एक LIVE PLAN ID की ज़रूरत है ==================
// ===================================================================
const MAIN_PLAN_ID = 'plan_RFqNX97VOfwJwl'; // सिर्फ आपकी ₹500 वाली Live Plan ID
// ===================================================================

// WEBHOOK का रास्ता - यह 100% सुरक्षित और सही तरीका है
app.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
const signature = req.headers['x-razorpay-signature'];

code
Code
download
content_copy
expand_less
try {
    const shasum = crypto.createHmac('sha256', secret);
    shasum.update(req.body); 
    const digest = shasum.digest('hex');

    if (digest !== signature) {
        console.warn(`❌ SECURITY ALERT: Webhook verification failed. Request rejected.`);
        return res.status(400).json({ error: 'Invalid signature.' });
    }
    
    const body = JSON.parse(req.body.toString());
    console.log('✅ Webhook Verified. Processing event:', body.event);
    
    if (body.event === 'subscription.activated') {
        const subscriptionEntity = body.payload.subscription.entity;
        const subscriptionId = subscriptionEntity.id;
        const customerId = subscriptionEntity.customer_id;

        if(subscriptionId && customerId) {
            console.log(`✅ VICTORY! LIVE Subscription ${subscriptionId} for customer ${customerId} is now active.`);
            
            const ref = db.ref('active_subscriptions/' + subscriptionId);
            await ref.set({
                subscriptionId: subscriptionId,
                customerId: customerId,
                status: 'active',
                planId: MAIN_PLAN_ID,
                activatedAt: new Date().toISOString()
            });
            console.log("✅✅✅ LIVE: Firebase record created.");
        }
    }
    
    res.json({ status: 'ok' });

} catch (error) {
    console.error("❌ LIVE: Webhook processing error:", error.message, error.stack);
    res.status(500).send('Webhook error.');
}

});

// बाकी रास्तों के लिए JSON Parser
app.use(express.json());

// === सर्वर को चेक करने के लिए टेस्ट रास्ता (इसे न हटाएँ) ===
app.get('/health', (req, res) => {
console.log("✅ Health check endpoint was hit successfully!");
res.json({ status: 'ok', message: 'Server is running perfectly!' });
});

// ============================================================================
// ==================== यहाँ नया कोड जोड़ा गया है ==============================
// ============================================================================
// === मूवी लिंक पाने के लिए नया API एंडपॉइंट ===
app.get('/api/get-movie-link', (req, res) => {
// Render के Environment Variables से 'MOVIE_LINK' को पढ़ना
const movieLinkFromEnv = process.env.MOVIE_LINK;

code
Code
download
content_copy
expand_less
if (movieLinkFromEnv) {
    // अगर लिंक मौजूद है, तो उसे JSON फॉर्मेट में वापस भेजना
    res.json({ movieLink: movieLinkFromEnv });
} else {
    // अगर MOVIE_LINK सेट नहीं है, तो सर्वर पर एक एरर लॉग करना
    console.error('❌ CONFIGURATION ERROR: The MOVIE_LINK environment variable is not set.');
    // और क्लाइंट को एक साफ एरर भेजना
    res.status(404).json({ error: 'Movie link is not configured on the server.' });
}

});
// ============================================================================
// ======================= नया कोड यहाँ खत्म होता है ==========================
// ============================================================================

// === सब्सक्रिप्शन बनाने का सबसे सही और फाइनल तरीका ===
app.post('/create-subscription', async (req, res) => {
try {
console.log("LIVE: Creating a new customer...");
const customer = await razorpay.customers.create({
name: 'Shubhzone User',
email: user_${Date.now()}@shubhzone.shop
});
console.log(LIVE: Customer created: ${customer.id});

code
Code
download
content_copy
expand_less
const startTimeInFuture = Math.floor(Date.now() / 1000) + 3600;

    console.log(`LIVE: Creating a ₹500 subscription for customer ${customer.id} with a ₹5 activation fee...`);
    
    const subscription = await razorpay.subscriptions.create({
        plan_id: MAIN_PLAN_ID,
        customer_id: customer.id,
        total_count: 48,
        start_at: startTimeInFuture,
        addons: [
            {
                item: {
                    name: "Activation Fee",
                    amount: 500, // 500 पैसे = ₹5
                    currency: "INR"
                }
            }
        ],
        customer_notify: 1,
    });
    
    console.log("LIVE: Subscription created successfully:", subscription.id);
    
    res.json({
        subscription_id: subscription.id,
        key_id: process.env.RAZORPAY_KEY_ID
    });

} catch (error) {
    console.error("❌ LIVE: Error during subscription creation:", error);
    res.status(500).json({ error: 'Failed to create subscription.' });
}

});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
console.log(🚀 Your server is LIVE and running on port ${PORT});
});
