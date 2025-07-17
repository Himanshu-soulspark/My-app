
/* ================================================= */
/* === Shubhzone App Script (Code 2) - FINAL v2 === */
/* ================================================= */

// Firebase कॉन्फ़िगरेशन
const firebaseConfig = {
  apiKey: "AIzaSyDuvWTMJL5edNG6cheez5pmwI2KlLCwtjw",
  authDomain: "shubhzone-4a6b0.firebaseapp.com",
  databaseURL: "https://shubhzone-4a6b0-default-rtdb.firebaseio.com",
  projectId: "shubhzone-4a6b0",
  storageBucket: "shubhzone-4a6b0.appspot.com",
  messagingSenderId: "439309269785",
  appId: "1:439309269785:web:08a1256812648daafea388",
  measurementId: "G-5S0VFF21SB"
};

// Firebase को केवल एक बार शुरू करें
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Firebase सेवाओं को इनिशियलाइज़ करें
const auth = firebase.auth();
const db = firebase.firestore();
const storage = firebase.storage();
const analytics = firebase.analytics();


// =================================================
// === Ad Logic - START (अंतिम और स्थिर संस्करण) ===
// =================================================

const adsterraAds = {
    directLink: 'https://www.profitableratecpm.com/tq7jxrf5v?key=6c0e753b930c66f90b622d51e426e9d8',
    socialBar: '//pl27114870.profitableratecpm.com/9b/9b/d0/9b9bd0548874dd7f16f6f50929864be9.js'
};

const monetagAds = {
    interstitial: { scriptUrl: `https://groleegni.net/401/9572500` },
    popunder: { zoneId: 9578563, scriptUrl: '//madurird.com/tag.min.js' },
};

// विज्ञापनों का सही और अंतिम क्रम
const userActionAds = ['popunder', 'interstitial', 'socialBar', 'directLink'];

// यह फंक्शन क्लिक होने पर विज्ञापन दिखाने की कोशिश करेगा
function handleUserInteractionForAds() {
    if (appState.isAdActive || document.querySelector('.modal-overlay.active, .comments-modal-overlay.active')) {
        return;
    }

    const now = Date.now();
    
    // पहला विज्ञापन (Pop-under) बिना कूलडाउन के दिखाने के लिए विशेष नियम
    if (appState.lastUserActionAdTimestamp === 0) {
         // यह ऐप में पहला विज्ञापन होगा, इसलिए इसे तुरंत दिखाएं
    } else if (now - appState.lastUserActionAdTimestamp < 90000) { // सख्त 90 सेकंड का कूलडाउन
        console.log(`User action ad suppressed due to 90-second cooldown. Time left: ${((90000 - (now - appState.lastUserActionAdTimestamp))/1000).toFixed(1)}s`);
        return;
    }

    const adTypeToShow = userActionAds[appState.userActionAdIndex];
    console.log(`User interaction is triggering ad: ${adTypeToShow}`);
    
    appState.isAdActive = true;
    appState.lastUserActionAdTimestamp = now; // टाइमर तुरंत रीसेट करें

    try {
        switch (adTypeToShow) {
            case 'popunder':
                const script = document.createElement('script');
                script.src = monetagAds.popunder.scriptUrl;
                script.dataset.zone = monetagAds.popunder.zoneId;
                script.async = true;
                document.body.appendChild(script);
                setTimeout(() => { if (document.body.contains(script)) document.body.removeChild(script); }, 15000);
                break;
            case 'interstitial':
                injectTemporaryScriptAd(monetagAds.interstitial.scriptUrl);
                break;
            case 'socialBar':
                injectTemporaryScriptAd(adsterraAds.socialBar);
                break;
            case 'directLink':
                window.open(adsterraAds.directLink, '_blank');
                break;
        }
        // अगले विज्ञापन के लिए इंडेक्स अपडेट करें
        appState.userActionAdIndex = (appState.userActionAdIndex + 1) % userActionAds.length;

    } catch (error) {
        console.error(`Error showing ${adTypeToShow} ad on user action:`, error);
    } finally {
        setTimeout(() => { appState.isAdActive = false; }, 2000);
    }
}


// यह सिर्फ स्क्रिप्ट-आधारित विज्ञापनों को इंजेक्ट करता है
function injectTemporaryScriptAd(scriptSrc) {
    const adHost = document.createElement('div');
    adHost.style.display = 'none';
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = scriptSrc;
    script.async = true;
    adHost.appendChild(script);
    document.body.appendChild(adHost);
    setTimeout(() => {
        if (document.body.contains(adHost)) document.body.removeChild(adHost);
    }, 25000);
}

// यह फंक्शन 'initializeAdTimers is not defined' एरर को ठीक करने के लिए है।
function initializeAdTimers() {
    // विज्ञापन दिखाने का लॉजिक उपयोगकर्ता के क्लिक पर आधारित है,
    // इसलिए यहां अलग से टाइमर की जरूरत नहीं है। यह सिर्फ एरर को ठीक करता है।
    console.log("Ad timer system initialized. Ads will show on user interaction after a 90-second cooldown.");
}
// =================================================
// === Ad Logic - END ===
// =================================================


// =================================================
// === TOP-PRIORITY AD LOGIC - START ===
// =================================================
let priorityAdPlayer = null;
let countdownInterval = null;

async function fetchActivePriorityAd() {
    try {
        const adRef = db.collection('advertisements').where('isPriority', '==', true).limit(1);
        const snapshot = await adRef.get();
        if (snapshot.empty) {
            console.log("No active priority ad found.");
            return null;
        }
        const adDoc = snapshot.docs[0];
        console.log("Active priority ad fetched:", adDoc.id);
        return { id: adDoc.id, ...adDoc.data() };
    } catch (error) {
        console.error("Error fetching priority ad:", error);
        return null;
    }
}

function showPriorityAd() {
    const now = Date.now();
    if (now - appState.lastPriorityAdShownTimestamp < 90000) {
        console.log("Priority ad suppressed due to its own cooldown.");
        return;
    }

    if (appState.isAdActive) {
        console.log("Priority ad suppressed due to another active ad.");
        return;
    }
    if (!appState.priorityAd.data) {
        console.log("Cannot show priority ad: No data available.");
        return;
    }
    const overlay = document.getElementById('admin-priority-ad-overlay');
    const timerEl = document.getElementById('ad-timer');
    const closeBtn = document.getElementById('ad-close-btn');
    const contentContainer = document.getElementById('ad-content-container');
    if (!overlay || !timerEl || !closeBtn || !contentContainer) {
        console.error("Priority ad HTML elements not found.");
        return;
    }
    if (activePlayerId && players[activePlayerId] && typeof players[activePlayerId].pauseVideo === 'function') {
        pauseActivePlayer();
    }
    
    appState.lastPriorityAdShownTimestamp = now;
    overlay.style.display = 'flex';
    closeBtn.style.display = 'none';
    timerEl.style.display = 'block';
    contentContainer.innerHTML = '';
    const ad = appState.priorityAd.data;
    if (ad.type === 'video' && ad.content) {
        priorityAdPlayer = new YT.Player('ad-content-container', {
            height: '100%', width: '100%', videoId: ad.content,
            playerVars: { 'autoplay': 1, 'controls': 0, 'rel': 0, 'showinfo': 0, 'mute': 0, 'origin': window.location.origin },
            events: { 'onReady': () => { startAdTimer(); } }
        });
    } else if (ad.type === 'image' && ad.content) {
        const img = document.createElement('img');
        img.src = ad.content;
        Object.assign(img.style, { width: '100%', height: '100%', objectFit: 'contain' });
        contentContainer.appendChild(img);
        startAdTimer();
    } else {
        console.error("Invalid priority ad data:", ad);
        hidePriorityAd();
    }
}

function startAdTimer() {
    const ad = appState.priorityAd.data;
    const timerEl = document.getElementById('ad-timer');
    const closeBtn = document.getElementById('ad-close-btn');
    let timeLeft = (ad.type === 'video') ? 30 : 5;
    timerEl.textContent = timeLeft;
    if (countdownInterval) clearInterval(countdownInterval);
    countdownInterval = setInterval(() => {
        timeLeft -= 1;
        timerEl.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(countdownInterval);
            timerEl.style.display = 'none';
            closeBtn.style.display = 'block';
            if (priorityAdPlayer && typeof priorityAdPlayer.stopVideo === 'function') {
                priorityAdPlayer.stopVideo();
            }
        }
    }, 1000);
}

function hidePriorityAd() {
    const overlay = document.getElementById('admin-priority-ad-overlay');
    const contentContainer = document.getElementById('ad-content-container');
    if (overlay) overlay.style.display = 'none';
    if (contentContainer) contentContainer.innerHTML = '';
    if (priorityAdPlayer && typeof priorityAdPlayer.destroy === 'function') {
        priorityAdPlayer.destroy();
        priorityAdPlayer = null;
    }
    if (countdownInterval) {
        clearInterval(countdownInterval);
        countdownInterval = null;
    }
}
// =================================================
// === TOP-PRIORITY AD LOGIC - END ===
// =================================================

// =================================================
// === नया विज्ञापन सिस्टम (NEW AD SYSTEM) - START ===
// =================================================

async function showStartupAdvertisement() {
    return new Promise(async (resolve) => {
        const now = new Date().getTime();

        const seventeenMinutesInMillis = 17 * 60 * 1000;
        const lastAdInfo = JSON.parse(localStorage.getItem('startupAdInfo')) || { timestamp: 0, index: -1 };

        if (now - lastAdInfo.timestamp < seventeenMinutesInMillis && lastAdInfo.timestamp !== 0) {
            console.log("Startup Ad: 17 मिनट पूरे नहीं हुए हैं। विज्ञापन नहीं दिखाया जाएगा।");
            resolve();
            return;
        }

        const userState = appState.currentUser.state;
        if (!userState) {
            console.log("Startup Ad: उपयोगकर्ता की 'state' जानकारी उपलब्ध नहीं है। विज्ञापन नहीं दिखाया जाएगा।");
            resolve();
            return;
        }
        
        if (appState.isAdActive) {
            console.log("Startup Ad: कोई और विज्ञापन पहले से ही सक्रिय है।");
            resolve();
            return;
        }

        try {
            console.log(`Startup Ad: '${userState}' के लिए विज्ञापन फ़ेच किए जा रहे हैं।`);
            const snapshot = await db.collection('advertisements')
                                     .where('location', '==', userState)
                                     .get();

            if (snapshot.empty) {
                console.log(`Startup Ad: '${userState}' के लिए Firestore में कोई विज्ञापन नहीं मिला।`);
                resolve();
                return;
            }

            appState.isAdActive = true; 
            const ads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            let nextAdIndex = (lastAdInfo.index + 1) % ads.length;
            const adToShow = ads[nextAdIndex];

            console.log(`Startup Ad: विज्ञापन दिखाया जा रहा है - ID: ${adToShow.id}, Index: ${nextAdIndex}`);
            
            await displayFullScreenAd(adToShow, () => {
                localStorage.setItem('startupAdInfo', JSON.stringify({ timestamp: now, index: nextAdIndex }));
                appState.isAdActive = false;
                resolve();
            });

        } catch (error) {
            console.error("Startup Ad: विज्ञापन फ़ेच करने या दिखाने में त्रुटि:", error);
            appState.isAdActive = false;
            resolve();
        }
    });
}


async function displayFullScreenAd(adData, onCloseCallback) {
    const overlay = document.createElement('div');
    overlay.id = 'startup-ad-overlay';
    Object.assign(overlay.style, {
        position: 'fixed', top: '0', left: '0', width: '100%', height: '100%',
        backgroundColor: 'rgba(0,0,0,0.95)', zIndex: '99999', display: 'flex',
        justifyContent: 'center', alignItems: 'center', flexDirection: 'column'
    });

    const adCard = document.createElement('div');
    adCard.id = 'startup-ad-card';
    Object.assign(adCard.style, {
        width: '100%', maxWidth: '420px', aspectRatio: '9 / 16',
        backgroundColor: '#000', borderRadius: '12px', position: 'relative',
        display: 'flex', flexDirection: 'column', overflow: 'hidden',
        border: '2px solid var(--primary-neon)'
    });

    const adContent = document.createElement('div');
    Object.assign(adContent.style, { flexGrow: '1', width: '100%', height: '100%' });

    let adPlayer = null;

    if (adData.type === 'video' && adData.videoId) {
        const playerDivId = `ad_player_${Date.now()}`;
        const playerDiv = document.createElement('div');
        playerDiv.id = playerDivId;
        adContent.appendChild(playerDiv);
        adPlayer = new YT.Player(playerDivId, {
            videoId: adData.videoId,
            width: '100%', height: '100%',
            playerVars: { 'autoplay': 1, 'controls': 0, 'rel': 0, 'showinfo': 0, 'mute': 0 },
            events: { 'onReady': (event) => event.target.playVideo() }
        });
    } else if (adData.type === 'image' && adData.content) {
        const img = document.createElement('img');
        
        const imageUrlMatch = adData.content.match(/src="([^"]+)"/);
        const finalUrl = imageUrlMatch ? imageUrlMatch[1] : '';

        if (finalUrl) {
            img.src = finalUrl;
            img.onerror = () => {
                console.error("विज्ञापन इमेज लोड करने में विफल:", finalUrl);
                img.style.display = 'none';
                adContent.innerHTML = '<p style="color:white;text-align:center;padding:20px;">Image failed to load.</p>';
            };
            Object.assign(img.style, { width: '100%', height: '100%', objectFit: 'cover' });
            adContent.appendChild(img);
        } else {
            console.error("विज्ञापन इमेज का URL HTML कंटेंट में नहीं मिला:", adData.content);
            adContent.innerHTML = '<p style="color:white;text-align:center;padding:20px;">Invalid ad content.</p>';
        }
    } else {
        console.error("Startup Ad: विज्ञापन डेटा अमान्य है।");
        onCloseCallback();
        return;
    }

    const topBar = document.createElement('div');
    Object.assign(topBar.style, {
        position: 'absolute', top: '0', left: '0', width: '100%',
        padding: '10px', display: 'flex', justifyContent: 'space-between',
        alignItems: 'center', background: 'linear-gradient(to bottom, rgba(0,0,0,0.7), transparent)', pointerEvents: 'none'
    });
    const adsLabel = document.createElement('span');
    adsLabel.textContent = 'Ads';
    Object.assign(adsLabel.style, { color: '#fff', fontWeight: 'bold', fontSize: '1.2em' });
    
    const timer = document.createElement('span');
    timer.id = 'startup-ad-timer';
    Object.assign(timer.style, {
        color: '#fff', backgroundColor: 'rgba(0,0,0,0.5)', borderRadius: '15px',
        padding: '5px 10px', fontSize: '1em',
        border: '1px solid #fff'
    });
    topBar.appendChild(adsLabel);
    topBar.appendChild(timer);

    const bottomBar = document.createElement('div');
    Object.assign(bottomBar.style, {
        width: '100%', padding: '10px', textAlign: 'center',
        background: 'linear-gradient(to top, rgba(0,0,0,0.7), transparent)',
        color: '#fff', position: 'absolute', bottom: '0', left: '0', pointerEvents: 'none'
    });
    const adLink = document.createElement('a');
    const destinationHref = (adData.link && !adData.link.startsWith('http')) ? `//${adData.link}` : adData.link || '#';
    adLink.href = destinationHref;
    adLink.target = '_blank';
    adLink.textContent = adData.destinationUrl || adData.link || 'Visit Site';
    Object.assign(adLink.style, { color: 'var(--primary-neon)', textDecoration: 'underline', pointerEvents: 'auto' });
    bottomBar.appendChild(adLink);

    adCard.appendChild(adContent);
    adCard.appendChild(topBar);
    adCard.appendChild(bottomBar);
    overlay.appendChild(adCard);
    document.body.appendChild(overlay);

    startAdCountdown(adData, overlay, timer, adPlayer, onCloseCallback);
}


function startAdCountdown(adData, overlay, timerElement, adPlayer, onCloseCallback) {
    const duration = adData.type === 'video' ? 30 : 5;
    let timeLeft = duration;
    timerElement.textContent = timeLeft;

    const interval = setInterval(() => {
        timeLeft--;
        timerElement.textContent = timeLeft;
        if (timeLeft <= 0) {
            clearInterval(interval);
            if (adPlayer && typeof adPlayer.stopVideo === 'function') {
                adPlayer.stopVideo();
            }
            timerElement.style.display = 'none';

            const closeBtn = document.createElement('span');
            closeBtn.innerHTML = '&times;';
            Object.assign(closeBtn.style, {
                position: 'absolute', top: '10px', right: '10px', fontSize: '2em',
                color: '#fff', cursor: 'pointer', zIndex: '100',
                width: '40px', height: '40px', lineHeight: '40px', textAlign: 'center',
                background: 'rgba(0,0,0,0.5)', borderRadius: '50%', pointerEvents: 'auto'
            });
            
            closeBtn.onclick = () => {
                handleAdClosure(adData.id, overlay);
                onCloseCallback();
            };
            
            const topBar = overlay.querySelector('div[style*="justify-content: space-between"]');
            topBar.appendChild(closeBtn);
        }
    }, 1000);
}


async function handleAdClosure(adId, overlay) {
    console.log(`Startup Ad: विज्ञापन बंद किया गया - ID: ${adId}`);

    try {
        const adStatRef = db.collection('advertisementStats').doc(adId);
        await adStatRef.set({
            closedCount: firebase.firestore.FieldValue.increment(1)
        }, { merge: true });
        console.log(`Startup Ad: '${adId}' के लिए क्लोज काउंट सफलतापूर्वक बढ़ाया गया।`);
    } catch (error) {
        console.error("Startup Ad: विज्ञापन का स्टैट्स अपडेट करने में त्रुटि:", error);
    }

    if (overlay && document.body.contains(overlay)) {
        document.body.removeChild(overlay);
    }
}
// =================================================
// === नया विज्ञापन सिस्टम (NEW AD SYSTEM) - END ===
// =================================================


// =================================================
// === Helper Functions - START ===
// =================================================
function injectAdScript(container, optionsScriptContent, invokeScriptSrc) {
    if (!container) return;
    container.innerHTML = '';
    const adOptionsScript = document.createElement('script');
    adOptionsScript.type = 'text/javascript';
    adOptionsScript.text = optionsScriptContent;
    const adInvokeScript = document.createElement('script');
    adInvokeScript.type = 'text/javascript';
    adInvokeScript.src = invokeScriptSrc;
    adInvokeScript.async = true;
    container.appendChild(adOptionsScript);
    container.appendChild(adInvokeScript);
}

function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function copyToClipboard(text, event) {
    navigator.clipboard.writeText(text).then(() => {
        const copyBtn = event.target.closest('button');
        if (copyBtn) {
            copyBtn.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                copyBtn.innerHTML = '<i class="fas fa-copy"></i>';
            }, 1500);
        }
    }).catch(err => {
        console.error('Failed to copy text: ', err);
        alert('Failed to copy.');
    });
}

async function generateAndSaveReferralCode(uid, name) {
    const safeName = (name || 'user').replace(/[^a-zA-Z0-9]/g, '').toUpperCase().substring(0, 5);
    const randomPart = Math.random().toString(36).substring(2, 7).toUpperCase();
    const referralCode = `${safeName}${randomPart}`;
    try {
        await db.collection('users').doc(uid).update({ referralCode: referralCode });
        return referralCode;
    } catch (error) {
        console.error("Error saving referral code:", error);
        return "COULD_NOT_GENERATE";
    }
}

function escapeHTML(str) {
    if (typeof str !== 'string') return '';
    const div = document.createElement('div');
    div.appendChild(document.createTextNode(str));
    return div.innerHTML;
}

function formatNumber(num) {
    if (num === null || num === undefined) return 0;
    if (num >= 10000000) return (num / 10000000).toFixed(1).replace(/\.0$/, '') + 'Cr';
    if (num >= 100000) return (num / 100000).toFixed(1).replace(/\.0$/, '') + 'L';
    if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
    return num;
}
// =================================================
// === Helper Functions - END ===
// =================================================

// ऐप का ग्लोबल स्टेट
let appState = {
    currentUser: {
        uid: null, username: "new_user", avatar: "https://via.placeholder.com/120/222/FFFFFF?text=+",
        email: "", name: "", mobile: "", address: "", hobby: "", state: "", country: "",
        referralCode: null, likedVideos: [], diamondedCreators: [], diamonds: 0,
        totalWatchTimeSeconds: 0,
        creatorTotalWatchTimeSeconds: 0, 
        creatorDailyWatchTime: {},
        friends: [], 
    },
    currentScreen: 'splash-screen',
    navigationStack: ['splash-screen'],
    currentScreenPayload: null,
    allVideos: [], userShortVideos: [], userLongVideos: [], viewingHistory: [],
    uploadDetails: { category: null, audience: 'all', lengthType: 'short' },
    activeComments: { videoId: null, videoOwnerUid: null },
    activeChat: { chatId: null, friendId: null, friendName: null, friendAvatar: null },
    creatorPagePlayers: {
        short: null,
        long: null,
        fullscreenAdTimer: null,
        pausedAdTimer: null
    },
    isAdActive: false, 
    lastPriorityAdShownTimestamp: 0,
    lastUserActionAdTimestamp: 0,
    userActionAdIndex: 0, 
    
    appTimeTrackerInterval: null, watchTimeInterval: null,
    priorityAd: { data: null, timerInterval: null },
    videoWatchTrackers: {},
};

let isYouTubeApiReady = false;
let players = {};
let videoObserver;
let fullVideoList = [];
let activePlayerId = null;
let userHasInteracted = false;
let hasShownAudioPopup = false;
let hapticFeedbackEnabled = true;
let lastScreenBeforeAd = null;

const appContainer = document.getElementById('app-container');
const screens = document.querySelectorAll('.screen');
const navItems = document.querySelectorAll('.nav-item');
const profileImageInput = document.getElementById('profile-image-input');
const profileImagePreview = document.getElementById('profile-image-preview');
const uploadDetailsModal = document.getElementById('upload-details-modal');
const modalVideoTitle = document.getElementById('modal-video-title');
const modalVideoDescription = document.getElementById('modal-video-description');
const modalVideoHashtags = document.getElementById('modal-video-hashtags');
const modalVideoUrlInput = document.getElementById('modal-video-url');
const selectedCategoryText = document.getElementById('selected-category-text');
const categoryOptionsContainer = document.getElementById('category-options');
const commentsToggleInput = document.getElementById('comments-toggle-input');
const audienceOptions = document.querySelectorAll('.audience-option');
const categorySelectorDisplay = document.querySelector('.category-selector-display');
const videoSwiper = document.getElementById('video-swiper');
const homeStaticMessageContainer = document.getElementById('home-static-message-container');
const saveContinueBtn = document.getElementById('save-continue-btn');
const modalTitle = document.getElementById('modal-title');
const modalSaveButton = document.getElementById('modal-save-button');
const editingVideoIdInput = document.getElementById('editing-video-id');
const commentsModal = document.getElementById('comments-modal');
const commentsList = document.getElementById('comments-list');
const commentInput = document.getElementById('comment-input');
const sendCommentBtn = document.getElementById('send-comment-btn');
const descriptionModal = document.getElementById('description-modal');
const descriptionContent = document.getElementById('description-content');
const closeDescriptionBtn = document.getElementById('close-description-btn');

const categories = [ "Entertainment", "Comedy", "Music", "Dance", "Education", "Travel", "Food", "DIY", "Sports", "Gaming", "News", "Lifestyle" ];
const earnsureContent = {
    en: `<div class="earnsure-section"><h4>🙌 Welcome to Shubhzone!</h4><p>This isn’t just an app — it’s a family. A place where your creativity, hard work, and time are truly valued.</p></div><div class="earnsure-section"><h4>📢 No Monetization Barriers Here!</h4><ul><li>✅ No need for thousands of subscribers</li><li>✅ No view-count pressure</li><li>✅ No complicated conditions</li></ul><p>Just a simple, transparent ad-revenue sharing system that works for real creators.</p></div><div class="earnsure-section"><h4>💸 How does earning work?</h4><p>📊 Shubhzone shares its total Ad Revenue like this:</p><ul><li>👉 40% goes to Creators</li><li>👉 20% goes to Viewers</li></ul><p>👁 Your income is based on your watch time and views.</p><p>📅 The earnings are updated weekly, so you’re always in the loop!</p><p>📉 Yes, the income amount may vary… But ☑️ your payment is 100% guaranteed.</p></div><div class="earnsure-section"><h4>📝 How to Request Your Payment?</h4><ol><li>Go to the Menu and open Payment System</li><li>Fill in your correct payment details</li><li>Click on Request</li><li>And ⏱️ receive your payment within 2 days!</li></ol><p>📂 You’ll also see a full breakdown of your earnings in the Payment Section.</p><p>⚠️ If you enter incorrect details, the app will not be responsible for failed transfers.</p></div><div class="earnsure-section"><h4>💵 When Does Payout Start?</h4><p>As soon as your total earnings reach ₹9000 (around $110 USD), ✅ your payout calculation starts. After that, you can request a payout anytime you want — no waiting.</p></div><div class="earnsure-section"><h4>🎯 Double Income Strategy — YouTube + Shubhzone = Double Profit!</h4><p>If you already upload videos on YouTube, you can bring your viewers to Shubhzone too:</p><ul><li>📍 They earn here as viewers (20% of ad revenue)</li><li>📍 And you earn twice — 👉 From YouTube 👉 And from Shubhzone</li></ul><p>🔁 Same content, double earning – smart move, right?</p></div><div class="earnsure-section"><h4>💬 A Final Note…</h4><p>🙏 If your only goal is to "just make money," then honestly — this platform may not be for you.</p><p>Shubhzone is for true creators, for people who want to grow with a supportive platform. We are building this space not with ads, but with trust and creativity.</p><p>💡 We’ll never let your effort go to waste. Your earning starts from your very first video — no delays.</p></div><div class="earnsure-section"><h4>💖 Shubhzone is not just an app,</h4><p>It’s a movement — to empower creators like YOU.</p></div><div class="earnsure-section"><h4>🎁 Let’s grow this family together.</h4><p>✌️ Your growth = Our success. And we are always here to support you. ✨</p></div><div class="earnsure-section"><h4>📌 So why wait? Let’s begin this journey — with trust, with vision, with Shubhzone! 💫</h4></div>`,
    hi: `<div class="earnsure-section"><h4>🙌 Shubhzone में आपका स्वागत है!</h4><p>यह कोई आम App नहीं, बल्कि एक परिवार है — जहाँ हर creator की मेहनत, क्रिएटिविटी और समय की क़ीमत समझी जाती है।</p></div><div class="earnsure-section"><h4>📢 कोई Monetization Barrier नहीं!</h4><ul><li>✅ ना सब्सक्राइबर की ज़रूरत</li><li>✅ ना हज़ारों views का बोझ</li><li>✅ ना किसी तरह की शर्तें</li></ul><p>बस एकदम साफ-सुथरा और भरोसेमंद सिस्टम जो काम करता है सिर्फ Ad Revenue Sharing पर।</p></div><div class="earnsure-section"><h4>💸 कमाई का सिस्टम:</h4><p>📊 Shubhzone अपने कुल Ad Revenue का:</p><ul><li>👉 40% Creators को देता है</li><li>👉 20% Viewers को देता है</li></ul><p>👁 आपकी कमाई पूरी तरह आपके Watch Time और Views पर निर्भर करती है।</p><p>📅 और अच्छी बात ये है कि कमाई हर हफ्ते Update होती है।</p><p>📉 हाँ, Amount थोड़ा कम हो सकता है... लेकिन ☑️ आपका पैसा मिलना 100% Confirm है!</p></div><div class="earnsure-section"><h4>📝 पेमेंट कैसे मिलेगा?</h4><ol><li>App के Menu में जाएं और Payment System खोलें</li><li>अपनी सही Payment Details भरें</li><li>Request Submit करें</li><li>और ⏱️ 2 दिनों के अंदर पैसा आपके अकाउंट में पहुँच जाएगा!</li></ol><p>📂 आपकी Earnings का पूरा Calculation आपको Payment Section में दिखाई देगा।</p><p>⚠️ अगर आपने जानकारी गलत भरी है तो उसके लिए App ज़िम्मेदार नहीं होगा।</p></div><div class="earnsure-section"><h4>🤑 शुरुआत कब से?</h4><p>💵 जैसे ही आपकी कुल कमाई ₹9000 (लगभग $110 USD) पहुँचती है, आपका payout process शुरू हो जाता है। उसके बाद आप कभी भी पैसा निकाल सकते हैं, कोई रुकावट नहीं।</p></div><div class="earnsure-section"><h4>🎯 अब बात करें डबल कमाई की — YouTube + Shubhzone = Double Benefit!</h4><p>अगर आप पहले से YouTube पर वीडियो बनाते हैं, तो आप अपने ही यूज़र्स को Shubhzone पर ला सकते हैं:</p><ul><li>📍 इससे उन्हें भी फायदा होगा (20% Viewer Earning)</li><li>📍 और आपको डबल कमाई मिलेगी — 👉 YouTube से भी 👉 And from Shubhzone</li></ul><p>🔁 एक ही कंटेंट से दो जगह से कमाई — समझदारी का सौदा!</p></div><div class="earnsure-section"><h4>💬 एक आख़िरी बात…</h4><p>🙏 अगर आप सिर्फ पैसा कमाने की सोचकर इस प्लेटफॉर्म पर आ रहे हैं, तो शायद यह जगह आपके लिए नहीं बनी है।</p><p>🔗 हम यहाँ creators को आगे बढ़ाने, उनकी creativity को सम्मान देने, और एक safe और सच्‍चा माहौल देने के लिए हैं।</p><p>💡 हम आपकी मेहनत को कभी ज़ाया नहीं जाने देंगे। यहाँ कमाई की शुरुआत आपके पहले ही वीडियो से हो जाती है।</p></div><div class="earnsure-section"><h4>💖 Shubhzone एक App नहीं,</h4><p>एक Movement है — हमारे और आपके सपनों को उड़ान देने के लिए।</p></div><div class="earnsure-section"><h4>🎁 आइए, साथ मिलकर इस परिवार को बड़ा बनाएं।</h4><p>✌️ आपकी growth = हमारी सफलता। 💬 कोई सवाल हो तो हम हमेशा आपके साथ हैं।</p></div><div class="earnsure-section"><h4>📌 सो क्यों इंतज़ार करें? आइए इस सफ़र की शुरुआत करें — भरोसे के साथ, विज़न के साथ, शुभज़ोन के साथ! ✨</h4></div>`
};
let currentEarnsureLanguage = 'en';

function activateScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.toggle('active', screen.id === screenId);
    });
    appState.currentScreen = screenId;
}

function navigateTo(nextScreenId, payload = null, scrollPosition = 0) {
    
    if (appState.currentScreen === nextScreenId && !payload) return;
    if (appState.navigationStack[appState.navigationStack.length - 1] !== nextScreenId) {
        appState.navigationStack.push(nextScreenId);
    }
    
    if (appState.currentScreen === 'home-screen') {
        if (activePlayerId && players[activePlayerId]) pauseActivePlayer();
    }
    if (appState.currentScreen === 'creator-diamond-page-screen') {
        stopCreatorPageAdCycle();
        if (appState.creatorPagePlayers.short) appState.creatorPagePlayers.short.destroy();
        if (appState.creatorPagePlayers.long) appState.creatorPagePlayers.long.destroy();
        appState.creatorPagePlayers = { short: null, long: null, fullscreenAdTimer: null, pausedAdTimer: null };
    }
    activePlayerId = null;
    
    activateScreen(nextScreenId);
    appState.currentScreenPayload = payload;

    if (nextScreenId === 'profile-screen') loadUserVideosFromFirebase();
    if (nextScreenId === 'long-video-screen') setupLongVideoScreen();
    if (nextScreenId === 'history-screen') initializeHistoryScreen();
    if (nextScreenId === 'your-zone-screen') populateYourZoneScreen();
    if (nextScreenId === 'home-screen') setTimeout(setupVideoObserver, 100);
    if (nextScreenId === 'earnsure-screen') initializeEarnsureScreen();
    if (nextScreenId === 'diamond-members-screen') populateDiamondMembersScreen();
    if (nextScreenId === 'creator-diamond-page-screen' && payload && payload.creatorId) initializeCreatorDiamondPage(payload.creatorId, payload.startWith, payload.videoId);
    if (nextScreenId === 'advertisement-screen') initializeAdvertisementPage();
    
    if (nextScreenId === 'payment-screen') initializePaymentScreen();
    if (nextScreenId === 'track-payment-screen') initializeTrackPaymentScreen();
    if (nextScreenId === 'report-screen') initializeReportScreen();
    if (nextScreenId === 'friends-screen') {
        populateAddFriendsList();
        populateFriendRequestsList();
        populateMembersList(); 
    }
}

function navigateBack() {
    if (appState.navigationStack.length <= 1) return;
    appState.navigationStack.pop();
    const previousScreenId = appState.navigationStack[appState.navigationStack.length - 1];

    if (appState.currentScreen === 'home-screen') {
        // No action needed
    }
    if (appState.currentScreen === 'creator-diamond-page-screen') {
        stopCreatorPageAdCycle();
        if (appState.creatorPagePlayers.short) appState.creatorPagePlayers.short.destroy();
        if (appState.creatorPagePlayers.long) appState.creatorPagePlayers.long.destroy();
        appState.creatorPagePlayers = { short: null, long: null, fullscreenAdTimer: null, pausedAdTimer: null };
    }
    
    activateScreen(previousScreenId);

    if (previousScreenId === 'profile-screen') loadUserVideosFromFirebase();
    if (previousScreenId === 'long-video-screen') setupLongVideoScreen();
}

async function checkUserProfileAndProceed(user) {
    if (!user) return;
    appState.currentUser.uid = user.uid;
    const userRef = db.collection('users').doc(user.uid);
    const doc = await userRef.get();
    if (doc.exists) {
        let userData = doc.data();
        if (!userData.referralCode) {
            userData.referralCode = await generateAndSaveReferralCode(user.uid, userData.name);
        }
        userData.likedVideos = userData.likedVideos || [];
        userData.diamondedCreators = userData.diamondedCreators || [];
        userData.diamonds = userData.diamonds || 0;
        userData.totalWatchTimeSeconds = userData.totalWatchTimeSeconds || 0;
        userData.creatorTotalWatchTimeSeconds = userData.creatorTotalWatchTimeSeconds || 0;
        userData.creatorDailyWatchTime = userData.creatorDailyWatchTime || {};
        userData.friends = userData.friends || []; 
        appState.currentUser = { ...appState.currentUser, ...userData };
        updateProfileUI();
        if (userData.name && userData.state) {
            await startAppLogic();
        } else {
            navigateTo('information-screen');
        }
    } else {
        const initialData = {
            uid: user.uid, name: '', email: user.email || '',
            avatar: user.photoURL || 'https://via.placeholder.com/120/222/FFFFFF?text=+',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            diamonds: 0, likedVideos: [], diamondedCreators: [], totalWatchTimeSeconds: 0,
            creatorTotalWatchTimeSeconds: 0,
            creatorDailyWatchTime: {},
            friends: [],
        };
        await userRef.set(initialData);
        appState.currentUser = { ...appState.currentUser, ...initialData };
        updateProfileUI();
        navigateTo('information-screen');
    }
}

let appInitializationComplete = false;
function initializeApp() {
    if (appInitializationComplete) return;
    appInitializationComplete = true;

    lastScreenBeforeAd = sessionStorage.getItem('lastScreenBeforeAd');
    const lastScrollPosition = sessionStorage.getItem('lastScrollPositionBeforeAd');
    if (lastScreenBeforeAd) {
        appState.navigationStack = ['splash-screen', lastScreenBeforeAd];
    }
    auth.onAuthStateChanged(user => {
        if (user) {
            checkUserProfileAndProceed(user);
        } else {
            auth.signInAnonymously().catch(error => console.error("Anonymous sign-in failed:", error));
        }
    });
    activateScreen('splash-screen');
    startAppTimeTracker();
}


async function loadUserVideosFromFirebase() {
    if (!appState.currentUser.uid) return;
    try {
        const videosRef = db.collection('videos').where('uploaderUid', '==', appState.currentUser.uid).orderBy('createdAt', 'desc');
        const snapshot = await videosRef.get();
        const allUserVideos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        appState.userShortVideos = allUserVideos.filter(v => v.videoLengthType !== 'long');
        appState.userLongVideos = allUserVideos.filter(v => v.videoLengthType === 'long');
        renderUserProfileVideos();
    } catch (error) {
        console.error("Error loading user videos:", error);
    }
}

async function refreshAndRenderFeed() {
    const videosRef = db.collection('videos').orderBy('createdAt', 'desc').limit(50);
    const snapshot = await videosRef.get();
    const loadedVideos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    fullVideoList = [...loadedVideos];
    
    let shortVideos = fullVideoList.filter(v => v.videoLengthType !== 'long');
    
    shortVideos = shuffleArray(shortVideos);
    appState.allVideos = shortVideos;
    const displayItems = shortVideos; 

    document.querySelectorAll('.category-chip').forEach(chip => chip.classList.remove('active'));
    const allChip = document.querySelector('.category-scroller .category-chip:first-child');
    if (allChip) allChip.classList.add('active');
    
    renderVideoSwiper(displayItems); 
}


navItems.forEach(item => {
    item.classList.add('haptic-trigger');
    item.addEventListener('click', () => {
        const targetNav = item.getAttribute('data-nav');
        const targetScreen = `${targetNav}-screen`;
        if (appState.currentScreen !== targetScreen) {
            navigateTo(targetScreen);
            document.querySelectorAll('.bottom-nav').forEach(navBar => {
                 navBar.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
                 const currentItem = navBar.querySelector(`.nav-item[data-nav="${targetNav}"]`);
                 if(currentItem) currentItem.classList.add('active');
            });
        }
    });
});


profileImageInput.addEventListener('change', function() {
    if (this.files[0]) {
        const reader = new FileReader();
        reader.onload = e => profileImagePreview.src = e.target.result;
        reader.readAsDataURL(this.files[0]);
    }
});

function checkCustom(select, inputId) { document.getElementById(inputId).style.display = select.value === 'custom' ? 'block' : 'none'; }

async function saveAndContinue() {
    saveContinueBtn.disabled = true;
    saveContinueBtn.textContent = 'Saving...';
    
    const name = document.getElementById('info-name').value.trim();
    const stateValue = document.getElementById('info-state').value;
    const customState = document.getElementById('custom-state-input').value.trim();
    const state = stateValue === 'custom' ? customState : stateValue;

    if (!name || !state) {
        alert('Please enter your name and select your state.');
        saveContinueBtn.disabled = false;
        saveContinueBtn.textContent = 'Continue';
        return;
    }

    const userData = {
        name,
        mobile: document.getElementById('info-mobile').value.trim(),
        email: document.getElementById('info-email').value.trim(),
        address: document.getElementById('info-address').value.trim(),
        hobby: document.getElementById('info-hobby').value.trim(),
        state: state,
        country: document.getElementById('info-country').value === 'custom' ? document.getElementById('custom-country-input').value.trim() : document.getElementById('info-country').value
    };

    const file = profileImageInput.files[0];
    if (file) {
        try {
            const storageRef = storage.ref(`avatars/${appState.currentUser.uid}/${Date.now()}_${file.name}`);
            const snapshot = await storageRef.put(file);
            userData.avatar = await snapshot.ref.getDownloadURL();
        } catch (error) {
            console.error("Avatar upload error:", error);
            alert("Failed to upload profile picture.");
            saveContinueBtn.disabled = false;
            saveContinueBtn.textContent = 'Continue';
            return;
        }
    }

    try {
        await db.collection('users').doc(appState.currentUser.uid).set(userData, { merge: true });
        
        appState.currentUser = { ...appState.currentUser, ...userData };
        updateProfileUI();
        
        await startAppLogic();
        
    } catch (error) {
        console.error("Profile save error:", error);
        alert("Failed to save profile.");
        saveContinueBtn.disabled = false;
        saveContinueBtn.textContent = 'Continue';
    }
}


function updateProfileUI() {
    const profileHeaderAvatar = document.getElementById('profile-header-avatar');
    if (profileHeaderAvatar) profileHeaderAvatar.src = appState.currentUser.avatar || "https://via.placeholder.com/50/222/FFFFFF?text=+";
    
    const yourZoneAvatar = document.getElementById('your-zone-header-avatar');
    if (yourZoneAvatar) yourZoneAvatar.src = appState.currentUser.avatar || "https://via.placeholder.com/40";
    
    profileImagePreview.src = appState.currentUser.avatar || "https://via.placeholder.com/120/222/FFFFFF?text=+";
    document.getElementById('info-name').value = appState.currentUser.name || '';
    document.getElementById('info-mobile').value = appState.currentUser.mobile || '';
    document.getElementById('info-email').value = appState.currentUser.email || '';
    document.getElementById('info-address').value = appState.currentUser.address || '';
    document.getElementById('info-hobby').value = appState.currentUser.hobby || '';
    document.getElementById('info-state').value = appState.currentUser.state || '';
    document.getElementById('info-country').value = appState.currentUser.country || 'India';
}

function openUploadDetailsModal(lengthType = 'short', videoData = null) {
    appState.uploadDetails.lengthType = lengthType;
    if (videoData) {
        modalTitle.textContent = "Edit Video Details";
        modalSaveButton.textContent = "Save Changes";
        editingVideoIdInput.value = videoData.id;
        modalVideoTitle.value = videoData.title || '';
        modalVideoDescription.value = videoData.description || '';
        modalVideoHashtags.value = videoData.hashtags || '';
        modalVideoUrlInput.value = videoData.videoUrl || '';
        modalVideoUrlInput.disabled = true;
        selectCategory(videoData.category || categories[0]);
        selectAudience(videoData.audience || 'all');
        commentsToggleInput.checked = videoData.commentsEnabled !== false;
    } else {
        modalTitle.textContent = `Upload ${lengthType === 'long' ? 'Long' : 'Short'} Video`;
        modalSaveButton.textContent = "Upload Video";
        editingVideoIdInput.value = "";
        modalVideoTitle.value = '';
        modalVideoDescription.value = '';
        modalVideoHashtags.value = '';
        modalVideoUrlInput.value = '';
        modalVideoUrlInput.disabled = false;
        selectCategory(categories[0]);
        selectAudience('all');
        commentsToggleInput.checked = true;
    }
    uploadDetailsModal.classList.add('active');
}


function closeUploadDetailsModal() {
    uploadDetailsModal.classList.remove('active');
}

function toggleCategoryOptions() { categorySelectorDisplay.classList.toggle('open'); }

function selectCategory(category) {
    appState.uploadDetails.category = category;
    selectedCategoryText.textContent = category;
    categorySelectorDisplay.classList.remove('open');
}

function selectAudience(audienceType) {
    appState.uploadDetails.audience = audienceType;
    audienceOptions.forEach(option => option.classList.remove('selected'));
    const selectedOption = document.querySelector(`.audience-option[data-audience="${audienceType}"]`);
    if (selectedOption) {
        selectedOption.classList.add('selected');
    } else {
        document.querySelector(`.audience-option[data-audience="all"]`).classList.add('selected');
        appState.uploadDetails.audience = 'all';
    }
}

async function handleSave() {
    const videoId = editingVideoIdInput.value;
    if (videoId) {
        await saveVideoEdits(videoId);
    } else {
        await saveNewVideo();
    }
}

async function saveVideoEdits(videoId) {
    modalSaveButton.disabled = true;
    modalSaveButton.textContent = 'Saving...';
    const title = modalVideoTitle.value.trim();
    const category = appState.uploadDetails.category;
    if (!title || !category) {
        alert("Please fill in Title and select a Category.");
        modalSaveButton.disabled = false;
        modalSaveButton.textContent = 'Save Changes';
        return;
    }
    const updatedData = {
        title,
        description: modalVideoDescription.value.trim(),
        hashtags: modalVideoHashtags.value.trim(),
        category: category,
        audience: appState.uploadDetails.audience || 'all',
        commentsEnabled: commentsToggleInput.checked
    };
    try {
        await db.collection("videos").doc(videoId).update(updatedData);
        alert("Video updated!");
        closeUploadDetailsModal();
        await refreshAndRenderFeed();
        if (appState.currentScreen === 'profile-screen') {
            loadUserVideosFromFirebase();
        }
    } catch (error) {
        console.error("Error saving video edits:", error);
        alert("Failed to save changes. Error: " + error.message);
    } finally {
        modalSaveButton.disabled = false;
        modalSaveButton.textContent = 'Save Changes';
    }
}

async function saveNewVideo() {
    modalSaveButton.disabled = true;
    modalSaveButton.textContent = 'Uploading...';
    const videoUrlValue = modalVideoUrlInput.value.trim();
    const title = modalVideoTitle.value.trim();
    const category = appState.uploadDetails.category;
    const lengthType = appState.uploadDetails.lengthType;

    if (!videoUrlValue || !title || !category) {
        alert("Please fill Title, YouTube Video ID, and select a Category.");
        modalSaveButton.disabled = false;
        modalSaveButton.textContent = 'Upload Video';
        return;
    }
    const youtubeIdRegex = /^[a-zA-Z0-9_-]{11}$/;
    if (!youtubeIdRegex.test(videoUrlValue)) {
         alert("Please enter a valid YouTube Video ID (the 11-character code from the URL).");
         modalSaveButton.disabled = false;
         modalSaveButton.textContent = 'Upload Video';
         return;
    }
    const videoData = {
        uploaderUid: auth.currentUser.uid,
        uploaderUsername: appState.currentUser.name || appState.currentUser.username || 'Anonymous',
        uploaderAvatar: appState.currentUser.avatar || "https://via.placeholder.com/40",
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        title,
        description: modalVideoDescription.value.trim(),
        hashtags: modalVideoHashtags.value.trim(),
        videoUrl: videoUrlValue,
        thumbnailUrl: `https://img.youtube.com/vi/${videoUrlValue}/hqdefault.jpg`,
        videoType: 'youtube',
        videoLengthType: lengthType,
        category,
        audience: appState.uploadDetails.audience || 'all',
        commentsEnabled: commentsToggleInput.checked,
        likes: 0,
        diamonds: 0,
        commentCount: 0,
        customViewCount: 0,
    };
    try {
        await db.collection("videos").add(videoData);
        alert("Video uploaded!");
        closeUploadDetailsModal();
        await refreshAndRenderFeed();
        if (lengthType === 'long') {
             navigateTo('long-video-screen');
        } else {
             navigateTo('home-screen');
        }
    } catch (error) {
        console.error("Error uploading video:", error);
        alert("Upload failed. Error: " + error.message);
    } finally {
        modalSaveButton.disabled = false;
        modalSaveButton.textContent = 'Upload Video';
    }
}

function renderCategories() {
    if (categoryOptionsContainer) {
        categoryOptionsContainer.innerHTML = categories.map(cat => `<div class="category-option haptic-trigger" onclick="selectCategory('${cat}')">${cat}</div>`).join('');
        selectCategory(categories[0]);
    }
}

function renderVideoSwiper(itemsToRender) {
    if (!videoSwiper) return;
    videoSwiper.innerHTML = '';
    players = {};
    if (videoObserver) videoObserver.disconnect();
    if (!itemsToRender || itemsToRender.length === 0) {
        if (homeStaticMessageContainer) {
            videoSwiper.appendChild(homeStaticMessageContainer);
            homeStaticMessageContainer.style.display = 'flex';
        }
    } else {
        if (homeStaticMessageContainer) homeStaticMessageContainer.style.display = 'none';
        itemsToRender.forEach((video) => {
            const slide = document.createElement('div');
            slide.className = 'video-slide';
            slide.dataset.videoId = video.id;
            slide.dataset.uploaderUid = video.uploaderUid;
            slide.dataset.videoType = video.videoType || 'youtube';
            slide.addEventListener('click', (e) => {
                if (e.target.closest('.video-actions-overlay') || e.target.closest('.uploader-info')) return;
                togglePlayPause(video.id);
            });
            slide.addEventListener('dblclick', (e) => {
                if (!e.target.closest('.video-actions-overlay') && !e.target.closest('.uploader-info')) {
                    toggleLikeAction(video.id, e.target.closest('.video-slide'));
                }
            });

            const playerHtml = `<div class="player-container" id="player-${video.id}"></div>`;
            const thumbnailUrl = video.thumbnailUrl || 'https://via.placeholder.com/420x740/000000/FFFFFF?text=Video';
            
            const isLiked = appState.currentUser.likedVideos.includes(video.id);
            const isDiamondGiven = appState.currentUser.diamondedCreators.includes(video.uploaderUid);
            const diamondIconClass = isDiamondGiven ? 'fas' : 'far';
            const diamondIconColor = isDiamondGiven ? 'var(--primary-neon)' : 'var(--text-primary)';

            slide.innerHTML = `
                <div class="video-preloader" style="background-image: url('${thumbnailUrl}');"><div class="loader"></div></div>
                ${playerHtml}
                <i class="fas fa-heart like-heart-popup"></i>
                <div class="video-meta-overlay">
                    <div class="uploader-info"><img src="${escapeHTML(video.uploaderAvatar) || 'https://via.placeholder.com/40'}" class="uploader-avatar"><span class="uploader-name">${escapeHTML(video.uploaderUsername) || 'User'}</span></div>
                    <p class="video-title">${escapeHTML(video.title) || 'Untitled Video'}</p>
                </div>
                <div class="video-actions-overlay">
                    <div class="action-icon-container" data-action="view">
                        <i class="fas fa-eye icon"></i>
                        <span class="count">${formatNumber(video.customViewCount || 0)}</span>
                    </div>
                    <div class="action-icon-container haptic-trigger" data-action="like" onclick="toggleLikeAction('${video.id}', this.closest('.video-slide'))">
                        <i class="${isLiked ? 'fas' : 'far'} fa-heart icon ${isLiked ? 'liked' : ''}"></i>
                        <span class="count">${formatNumber(video.likes || 0)}</span>
                    </div>
                    <div class="action-icon-container haptic-trigger" data-action="diamond" onclick="handleDiamondAction(event, '${video.id}', '${video.uploaderUid}')">
                        <i class="${diamondIconClass} fa-gem icon" style="color: ${diamondIconColor};"></i>
                        <span class="count">${formatNumber(video.diamonds || 0)}</span>
                    </div>
                    <div class="action-icon-container haptic-trigger ${!video.commentsEnabled ? 'disabled' : ''}" data-action="comment" onclick="${video.commentsEnabled ? `openCommentsModal('${video.id}', '${video.uploaderUid}')` : ''}">
                        <i class="fas fa-comment-dots icon"></i>
                        <span class="count">${formatNumber(video.commentCount || 0)}</span>
                    </div>
                </div>`;
            videoSwiper.appendChild(slide);
        });
        if (isYouTubeApiReady) initializePlayers();
    }
}

function onYouTubeIframeAPIReady() {
    isYouTubeApiReady = true;
    if (window.pendingAppStartResolve) {
        window.pendingAppStartResolve();
        delete window.pendingAppStartResolve;
    }
    if (appState.currentScreen === 'home-screen' && appState.allVideos.length > 0) {
         initializePlayers();
    }
}

function initializePlayers() {
    const visibleSlides = Array.from(videoSwiper.querySelectorAll('.video-slide'));
    visibleSlides.forEach((slide) => {
        const videoId = slide.dataset.videoId;
        const videoData = fullVideoList.find(v => v.id === videoId);

        if (players[videoId] || !videoData) return;

        const playerId = `player-${videoId}`;
        const playerElement = document.getElementById(playerId);

        if (!playerElement || playerElement.tagName === 'IFRAME') return;

        players[videoId] = new YT.Player(playerId, {
            height: '100%', width: '100%', videoId: videoData.videoUrl,
            playerVars: {
                'autoplay': 0, 'controls': 0, 'mute': 1, 'rel': 0, 'showinfo': 0,
                'modestbranding': 1, 'loop': 1, 'playlist': videoData.videoUrl,
                'fs': 0, 'iv_load_policy': 3, 'origin': window.location.origin
            },
            events: {
                'onReady': onPlayerReady,
                'onStateChange': onPlayerStateChange
            }
        });
    });
    setupVideoObserver();
}

function onPlayerReady(event) {
    const iframe = event.target.getIframe();
    const slide = iframe.closest('.video-slide');
    if (!slide) return;
    const videoId = slide.dataset.videoId;
    const preloader = slide.querySelector('.video-preloader');
    if(preloader) preloader.style.display = 'none';

     if (videoId === activePlayerId || (!activePlayerId && isElementVisible(slide, videoSwiper))) {
         playActivePlayer(videoId);
     }
}

function onPlayerStateChange(event) {
    const iframe = event.target.getIframe();
    if (!iframe) return;
    
    const creatorPlayerView = iframe.closest('.creator-page-view');
    if (creatorPlayerView) {
        handleCreatorPlayerStateChange(event);
        return;
    }

    const slide = iframe.closest('.video-slide');
    if (!slide) return;

    const videoId = slide.dataset.videoId;
    const preloader = slide.querySelector('.video-preloader');
    if (event.data !== YT.PlayerState.UNSTARTED && preloader) {
        preloader.style.display = 'none';
    }
    if (event.data === YT.PlayerState.PLAYING) {
        addVideoToHistory(videoId);
        startWatchTimeTracker();
        startVideoViewTracker(videoId, 'short');
        if (userHasInteracted) {
             if (typeof event.target.unMute === 'function' && event.target.isMuted()) {
                event.target.unMute();
             }
             if (typeof event.target.isMuted === 'function' && event.target.isMuted() && !hasShownAudioPopup) {
                 document.getElementById('audio-issue-popup').classList.add('active');
                 hasShownAudioPopup = true;
             }
        }
    } else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) {
        stopWatchTimeTracker();
        stopVideoViewTracker(videoId);
    }
}

function addVideoToHistory(videoId) {
    if (!videoId) return;
    const existingIndex = appState.viewingHistory.indexOf(videoId);
    if (existingIndex > -1) {
        appState.viewingHistory.splice(existingIndex, 1);
    }
    appState.viewingHistory.unshift(videoId);
    if (appState.viewingHistory.length > 100) {
        appState.viewingHistory.pop();
    }
}


function isElementVisible(el, container) {
    if (!el || !container) return false;
    const containerRect = container.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    const threshold = 0.75;
    return (
        elRect.top + elRect.height * threshold >= containerRect.top &&
        elRect.bottom - elRect.height * threshold <= containerRect.bottom
    );
}

function togglePlayPause(videoId) {
    const player = players[videoId];
    if (!player || typeof player.getPlayerState !== 'function') return;

    const state = player.getPlayerState();
    if (state === YT.PlayerState.PLAYING || state === YT.PlayerState.BUFFERING) {
        player.pauseVideo();
    } else {
        if (activePlayerId && activePlayerId !== videoId) {
            pauseActivePlayer();
        }
        playActivePlayer(videoId);
    }
}


function playActivePlayer(videoId) {
    if (!videoId) return;
    const player = players[videoId];
    if (!player || typeof player.playVideo !== 'function') return;

    if (!player.getIframe() || !document.body.contains(player.getIframe())) {
        console.warn(`Player for video ${videoId} is not in the DOM. Aborting play.`);
        return;
    }

    activePlayerId = videoId;
    addVideoToHistory(videoId);

    player.playVideo();

    if (userHasInteracted && typeof player.unMute === 'function') {
         player.unMute();
    }
}

function pauseActivePlayer() {
    if (!activePlayerId) return;
    const player = players[activePlayerId];
    if (!player || typeof player.pauseVideo !== 'function') return;

    if (player.getPlayerState() === YT.PlayerState.PLAYING || player.getPlayerState() === YT.PlayerState.BUFFERING) {
         player.pauseVideo();
    }
}

function setupVideoObserver() {
    if (videoObserver) videoObserver.disconnect();
    if (!videoSwiper) return;

    const options = {
        root: videoSwiper,
        threshold: 0.75
    };

    const handleIntersection = (entries) => {
        entries.forEach(entry => {
            const videoId = entry.target.dataset.videoId;
            if (!videoId || !players[videoId]) return;

            if (entry.isIntersecting) {
                if (activePlayerId && activePlayerId !== videoId) {
                    pauseActivePlayer();
                }
                playActivePlayer(videoId);
            } else {
                if (videoId === activePlayerId) {
                    pauseActivePlayer();
                    activePlayerId = null;
                }
            }
        });
    };

    videoObserver = new IntersectionObserver(handleIntersection, options);

    const allSlides = document.querySelectorAll('.video-slide');
    if (allSlides.length > 0) {
        allSlides.forEach(slide => videoObserver.observe(slide));

        setTimeout(() => {
            if (!activePlayerId) {
                const firstVideoSlide = document.querySelector('.video-slide');
                if (firstVideoSlide && isElementVisible(firstVideoSlide, videoSwiper)) {
                    const firstVideoId = firstVideoSlide.dataset.videoId;
                    if(firstVideoId) {
                        playActivePlayer(firstVideoId);
                    }
                }
            }
        }, 500);
    }
}

async function openCommentsModal(videoId, videoOwnerUid) {
    appState.activeComments = { videoId, videoOwnerUid };
    commentsModal.classList.add('active');
    commentsList.innerHTML = '<li style="text-align:center; color: var(--text-secondary);">Loading comments...</li>';
    try {
        const commentsRef = db.collection('videos').doc(videoId).collection('comments').orderBy('createdAt', 'asc');
        const snapshot = await commentsRef.get();
        if (snapshot.empty) {
            commentsList.innerHTML = '<li style="text-align:center; color: var(--text-secondary);">Be the first to comment!</li>';
        } else {
            commentsList.innerHTML = snapshot.docs.map(doc => {
                const comment = { id: doc.id, ...doc.data() };
                const canDelete = appState.currentUser.uid === comment.uploaderUid || appState.currentUser.uid === videoOwnerUid;
                const timestamp = comment.createdAt ? formatTimeAgo(comment.createdAt.toDate()) : '';
                return `<li class="comment-item">
                            <img src="${escapeHTML(comment.uploaderAvatar) || 'https://via.placeholder.com/35'}" alt="avatar" class="avatar">
                            <div class="comment-body">
                                <div class="username">${escapeHTML(comment.uploaderUsername) || 'Anonymous'} <span class="timestamp">${timestamp}</span></div>
                                <div class="text">${escapeHTML(comment.text)}</div>
                            </div>
                            ${canDelete ? `<i class="fas fa-trash delete-comment-btn haptic-trigger" onclick="deleteComment('${videoId}', '${comment.id}')"></i>` : ''}
                        </li>`;
            }).join('');
             commentsList.scrollTop = commentsList.scrollHeight;
        }
         sendCommentBtn.disabled = false;
         commentInput.disabled = false;
    } catch (error) {
        console.error("Error loading comments:", error);
        commentsList.innerHTML = '<li style="text-align:center; color: var(--error-red);">Could not load comments.</li>';
        sendCommentBtn.disabled = true;
        commentInput.disabled = true;
    }
}

function formatTimeAgo(date) {
    const now = new Date();
    const seconds = Math.round((now - date) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.round(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.round(hours / 24);
    if (days < 30) return `${days}d ago`;
    const months = Math.round(days / 30.4);
    if (months < 12) return `${months}mo ago`;
    const years = Math.round(days / 365);
    return `${years}y ago`;
}

function closeCommentsModal() {
    commentsModal.classList.remove('active');
    appState.activeComments = { videoId: null, videoOwnerUid: null };
    commentInput.value = '';
}

async function postComment() {
    const { videoId, videoOwnerUid } = appState.activeComments;
    const text = commentInput.value.trim();
    if (!text || !videoId || !appState.currentUser.uid) return;

    sendCommentBtn.disabled = true;
    const newComment = {
        text: text,
        uploaderUid: appState.currentUser.uid,
        uploaderUsername: appState.currentUser.name || appState.currentUser.username || 'Anonymous',
        uploaderAvatar: appState.currentUser.avatar || "https://via.placeholder.com/35",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    const videoRef = db.collection('videos').doc(videoId);
    const commentCollectionRef = videoRef.collection('comments');
    try {
        const batch = db.batch();
        const newCommentRef = commentCollectionRef.doc();
        batch.set(newCommentRef, newComment);
        batch.update(videoRef, { commentCount: firebase.firestore.FieldValue.increment(1) });
        await batch.commit();
        commentInput.value = '';
        await openCommentsModal(videoId, videoOwnerUid);
         const videoSlide = document.querySelector(`.video-slide[data-video-id='${videoId}']`);
         if (videoSlide) {
              const countElement = videoSlide.querySelector('.action-icon-container[data-action="comment"] .count');
              if (countElement) {
                  countElement.textContent = formatNumber(parseInt(countElement.textContent.replace(/\D/g,'')) + 1);
              }
         }
    } catch (error) {
        console.error("Error posting comment: ", error);
        alert("Could not post comment.");
    } finally {
        sendCommentBtn.disabled = false;
    }
}

async function deleteComment(videoId, commentId) {
    if (!confirm("Are you sure you want to delete this comment?")) return;

    const commentRef = db.collection('videos').doc(videoId).collection('comments').doc(commentId);
    const videoRef = db.collection('videos').doc(videoId);
    try {
         const batch = db.batch();
         batch.delete(commentRef);
         batch.update(videoRef, { commentCount: firebase.firestore.FieldValue.increment(-1) });
         await batch.commit();
        await openCommentsModal(videoId, appState.activeComments.videoOwnerUid);
         const videoSlide = document.querySelector(`.video-slide[data-video-id='${videoId}']`);
         if (videoSlide) {
              const countElement = videoSlide.querySelector('.action-icon-container[data-action="comment"] .count');
              if (countElement) {
                   const currentCount = parseInt(countElement.textContent.replace(/\D/g,''));
                   countElement.textContent = formatNumber(Math.max(0, currentCount - 1));
              }
         }
    } catch (error) {
        console.error(`Error deleting comment ${commentId}:`, error);
        alert("Could not delete comment.");
    }
}

async function toggleLikeAction(videoId, slideElement) {
    if (!appState.currentUser || !appState.currentUser.uid) return;
    if (!slideElement) slideElement = document.querySelector(`.video-slide[data-video-id='${videoId}']`);
    if (!slideElement) return;

    const likedVideos = appState.currentUser.likedVideos || [];
    const isLiked = likedVideos.includes(videoId);
    const videoRef = db.collection('videos').doc(videoId);
    const userRef = db.collection('users').doc(appState.currentUser.uid);
    
    const likeIcon = slideElement.querySelector('.action-icon-container[data-action="like"] .icon');
    const likeCountElement = slideElement.querySelector('.action-icon-container[data-action="like"] .count');
    let currentLikes = parseInt(likeCountElement.textContent.replace(/[^\d]/g, '') * (likeCountElement.textContent.includes('K') ? 1000 : likeCountElement.textContent.includes('L') ? 100000 : 1)) || 0;

    try {
        if (isLiked) {
            const index = likedVideos.indexOf(videoId);
            if (index > -1) likedVideos.splice(index, 1);
            likeIcon.classList.remove('fas', 'liked');
            likeIcon.classList.add('far');
            likeCountElement.textContent = formatNumber(Math.max(0, currentLikes - 1));
            await videoRef.update({ likes: firebase.firestore.FieldValue.increment(-1) });
            await userRef.update({ likedVideos: firebase.firestore.FieldValue.arrayRemove(videoId) });
        } else {
            likedVideos.push(videoId);
            likeIcon.classList.remove('far');
            likeIcon.classList.add('fas', 'liked');
            likeCountElement.textContent = formatNumber(currentLikes + 1);
            const heartPopup = slideElement.querySelector('.like-heart-popup');
            if (heartPopup) {
                heartPopup.style.animation = 'none';
                void heartPopup.offsetWidth;
                heartPopup.style.animation = 'scale-and-fade 1s ease-out';
            }
            await videoRef.update({ likes: firebase.firestore.FieldValue.increment(1) });
            await userRef.update({ likedVideos: firebase.firestore.FieldValue.arrayUnion(videoId) });
        }
    } catch (error) {
        console.error("Error updating like status:", error);
        refreshAndRenderFeed();
    }
}

async function handleDiamondAction(event, videoId, uploaderUid) {
    event.stopPropagation();
    
    if (!appState.currentUser || !appState.currentUser.uid) {
        alert("You must be logged in to give a diamond.");
        return;
    }
    if (appState.currentUser.uid === uploaderUid) {
        alert("You cannot give a diamond to yourself.");
        return;
    }

    const diamondButton = event.currentTarget;
    diamondButton.style.pointerEvents = 'none'; 

    const wasDiamondGiven = appState.currentUser.diamondedCreators.includes(uploaderUid);
    const increment = wasDiamondGiven ? -1 : 1;
    
    appState.currentUser.diamondedCreators = wasDiamondGiven
        ? appState.currentUser.diamondedCreators.filter(id => id !== uploaderUid)
        : [...appState.currentUser.diamondedCreators, uploaderUid];

    let newDiamondCount = 0;
    fullVideoList.forEach(video => {
        if (video.uploaderUid === uploaderUid) {
            video.diamonds = Math.max(0, (video.diamonds || 0) + increment);
            newDiamondCount = video.diamonds;
        }
    });

    document.querySelectorAll(`[data-uploader-uid="${uploaderUid}"]`).forEach(slide => {
        const icon = slide.querySelector('[data-action="diamond"] .icon');
        const count = slide.querySelector('[data-action="diamond"] .count');
        const videoData = fullVideoList.find(v => v.id === slide.dataset.videoId);
        if (icon && count && videoData) {
            icon.classList.toggle('fas', !wasDiamondGiven);
            icon.classList.toggle('far', wasDiamondGiven);
            icon.style.color = !wasDiamondGiven ? 'var(--primary-neon)' : 'var(--text-primary)';
            count.textContent = formatNumber(videoData.diamonds);
        }
    });
     
    document.querySelectorAll(`.long-video-card`).forEach(card => {
        const video = fullVideoList.find(v => v.id === card.dataset.videoId);
        if(video && video.uploaderUid === uploaderUid) {
            const icon = card.querySelector('.diamond-icon');
            const uploaderSpan = card.querySelector('.long-video-uploader');
            if (icon && uploaderSpan) {
                icon.classList.toggle('fas', !wasDiamondGiven);
                icon.classList.toggle('far', wasDiamondGiven);
                icon.style.color = !wasDiamondGiven ? 'var(--primary-neon)' : 'var(--text-primary)';
                uploaderSpan.textContent = `${escapeHTML(video.uploaderUsername)} • ${formatNumber(video.diamonds)} diamonds`;
            }
        }
    });

    const videosQuery = db.collection('videos').where('uploaderUid', '==', uploaderUid);
    const userRef = db.collection('users').doc(appState.currentUser.uid);
    const creatorRef = db.collection('users').doc(uploaderUid);

    try {
        const videoSnapshot = await videosQuery.get();
        const batch = db.batch();

        videoSnapshot.forEach(doc => {
            batch.update(doc.ref, { diamonds: firebase.firestore.FieldValue.increment(increment) });
        });

        batch.update(creatorRef, { diamonds: firebase.firestore.FieldValue.increment(increment) });

        if (wasDiamondGiven) {
            batch.update(userRef, { diamondedCreators: firebase.firestore.FieldValue.arrayRemove(uploaderUid) });
        } else {
            batch.update(userRef, { diamondedCreators: firebase.firestore.FieldValue.arrayUnion(uploaderUid) });
        }
        
        await batch.commit();
        
    } catch (error) {
        console.error("Global diamond update failed:", error);
        alert("Action failed. Please check your internet connection and try again.");
        await refreshAndRenderFeed();
    } finally {
        diamondButton.style.pointerEvents = 'auto';
    }
}


function logoutUser() {
    if (confirm("Are you sure you want to log out?")) {
        auth.signOut().then(() => {
            window.location.reload();
        }).catch(error => {
            console.error("Logout failed:", error);
            alert("Logout failed.");
        });
    }
}

function renderCategoriesInBar() {
    const scroller = document.getElementById('category-scroller');
    if (!scroller) return;
    scroller.innerHTML = '';
    const allChip = document.createElement('div');
    allChip.className = 'category-chip active haptic-trigger';
    allChip.textContent = 'All';
    allChip.onclick = () => filterVideosByCategory('All', allChip);
    scroller.appendChild(allChip);
    categories.forEach(category => {
        const chip = document.createElement('div');
        chip.className = 'category-chip haptic-trigger';
        chip.textContent = category;
        chip.onclick = () => filterVideosByCategory(category, chip);
        scroller.appendChild(chip);
    });
}

function filterVideosByCategory(category, element) {
    document.querySelectorAll('#category-scroller .category-chip').forEach(chip => chip.classList.remove('active'));
    if (element) element.classList.add('active');

    if (activePlayerId) {
         pauseActivePlayer();
         activePlayerId = null;
    }

    let filtered = fullVideoList.filter(v => v.videoLengthType !== 'long');
    if (category !== 'All') {
        filtered = filtered.filter(video => video.category === category);
    }
    
    const displayItems = shuffleArray(filtered);
    appState.allVideos = displayItems;

    renderVideoSwiper(displayItems);

    setTimeout(initializePlayers, 100);
}


function renderUserProfileVideos() {
    renderUserProfileShortGrid();
    renderUserProfileLongGrid();

    const shortGrid = document.getElementById('user-short-video-grid');
    const longGrid = document.getElementById('user-long-video-grid');
    if(shortGrid) shortGrid.style.display = 'grid';
    if(longGrid) longGrid.style.display = 'none';

    const shortBtn = document.getElementById('profile-show-shorts-btn');
    const longBtn = document.getElementById('profile-show-longs-btn');
    if(shortBtn) shortBtn.classList.add('active');
    if(longBtn) longBtn.classList.remove('active');
}

function renderUserProfileShortGrid() {
    const grid = document.getElementById('user-short-video-grid');
    if (!grid) return;
    grid.innerHTML = '';
    if (appState.userShortVideos.length === 0) {
        grid.innerHTML = '<p class="static-message" style="color: var(--text-secondary); grid-column: 1 / -1;">You have not uploaded any short videos yet.</p>';
    } else {
        appState.userShortVideos.forEach(video => {
            const videoCard = document.createElement('div');
            videoCard.className = 'user-video-item-short';
            videoCard.dataset.videoId = video.id;
            const thumbnailUrl = video.thumbnailUrl || 'https://via.placeholder.com/120x160/333/fff?text=Video';
            videoCard.innerHTML = `
                <img src="${escapeHTML(thumbnailUrl)}" alt="Video Thumbnail" class="thumbnail haptic-trigger" onclick="playVideoFromProfile('${video.id}')">
                <div class="user-video-actions">
                    <button class="user-video-action-btn edit haptic-trigger" onclick="editVideoDetails('${video.id}')"><i class="fas fa-edit"></i> Edit</button>
                    <button class="user-video-action-btn delete haptic-trigger" onclick="deleteVideo('${video.id}')"><i class="fas fa-trash-alt"></i> Delete</button>
                </div>
            `;
            grid.appendChild(videoCard);
        });
    }
}

function renderUserProfileLongGrid() {
    const grid = document.getElementById('user-long-video-grid');
    if (!grid) return;
    grid.innerHTML = '';
    if (appState.userLongVideos.length === 0) {
        grid.innerHTML = '<p class="static-message" style="color: var(--text-secondary); grid-column: 1 / -1;">You have not uploaded any long videos yet.</p>';
    } else {
        appState.userLongVideos.forEach(video => {
            const videoCard = document.createElement('div');
            videoCard.className = 'user-video-item-long';
            videoCard.dataset.videoId = video.id;
            const thumbnailUrl = video.thumbnailUrl || 'https://via.placeholder.com/320x180/333/fff?text=Video';
            videoCard.innerHTML = `
                <img src="${escapeHTML(thumbnailUrl)}" alt="Video Thumbnail" class="thumbnail haptic-trigger" onclick="playVideoFromProfile('${video.id}')">
                <div class="user-video-actions">
                    <button class="user-video-action-btn edit haptic-trigger" onclick="editVideoDetails('${video.id}')"><i class="fas fa-edit"></i> Edit</button>
                    <button class="user-video-action-btn delete haptic-trigger" onclick="deleteVideo('${video.id}')"><i class="fas fa-trash-alt"></i> Delete</button>
                </div>
            `;
            grid.appendChild(videoCard);
        });
    }
}


function playVideoFromProfile(videoId) {
    const videoToPlay = fullVideoList.find(v => v.id === videoId);
    if (!videoToPlay) {
         alert("Video not found.");
         return;
    }
    if (videoToPlay.videoLengthType === 'long') {
        navigateTo('creator-diamond-page-screen', { 
            creatorId: videoToPlay.uploaderUid, 
            startWith: 'long', 
            videoId: videoToPlay.id 
        });
    } else {
        navigateTo('creator-diamond-page-screen', { 
            creatorId: videoToPlay.uploaderUid, 
            startWith: 'short', 
            videoId: videoToPlay.id 
        });
    }
}


async function editVideoDetails(videoId) {
    try {
        const videoDoc = await db.collection('videos').doc(videoId).get();
        if (videoDoc.exists) {
            const videoData = { id: videoDoc.id, ...videoDoc.data() };
            openUploadDetailsModal(videoData.videoLengthType || 'short', videoData);
        } else {
            alert("Video not found.");
        }
    } catch (error) {
        console.error("Error fetching video for edit:", error);
        alert("Could not load video details for editing.");
    }
}

async function deleteVideo(videoId) {
    if (!confirm("Are you sure you want to delete this video? This cannot be undone.")) {
        return;
    }
    try {
        await db.collection('videos').doc(videoId).delete();
        alert("Video deleted!");
        loadUserVideosFromFirebase();
        refreshAndRenderFeed();
    } catch (error) {
        console.error("Error deleting video:", error);
        alert("Failed to delete video.");
    }
}

function showAudioIssuePopup() {
    if (!hasShownAudioPopup) {
        document.getElementById('audio-issue-popup').classList.add('active');
        hasShownAudioPopup = true;
    }
}

function closeAudioIssuePopup() {
    document.getElementById('audio-issue-popup').classList.remove('active');
}

let appStartLogicHasRun = false;
const startAppLogic = async () => {
    if (appStartLogicHasRun && appState.currentScreen !== 'splash-screen' && appState.currentScreen !== 'information-screen') {
        return;
    }
    appStartLogicHasRun = true;

    const getStartedBtn = document.getElementById('get-started-btn');
    const loadingContainer = document.getElementById('loading-container');
    if (getStartedBtn) getStartedBtn.style.display = 'none';
    if (loadingContainer) loadingContainer.style.display = 'flex';

    await showStartupAdvertisement();

    renderCategories();
    renderCategoriesInBar();
    await refreshAndRenderFeed();
    
    const activeAd = await fetchActivePriorityAd();
    if (activeAd) {
        appState.priorityAd.data = activeAd;
        showPriorityAd();
        appState.priorityAd.timerInterval = setInterval(showPriorityAd, 30 * 60 * 1000);
    }
    
    const lastScrollPosition = parseInt(sessionStorage.getItem('lastScrollPositionBeforeAd') || '0', 10);
    const lastScreen = lastScreenBeforeAd || 'home-screen';
    
    navigateTo(lastScreen, null, lastScrollPosition);
    
    sessionStorage.removeItem('lastScreenBeforeAd');
    sessionStorage.removeItem('lastScrollPositionBeforeAd');
    
    // विज्ञापन टाइमर शुरू करें
    initializeAdTimers();
};

function setupLongVideoScreen() {
    populateLongVideoCategories();
    populateLongVideoCarousel();
    populateLongVideoGrid();
    populateLongVideoSearchResults([]);
}

function populateLongVideoCategories() {
    const scroller = document.getElementById('long-video-category-scroller');
    if (!scroller) return;
    scroller.innerHTML = '';
    const allChip = document.createElement('div');
    allChip.className = 'category-chip active haptic-trigger';
    allChip.textContent = 'All';
    allChip.onclick = () => filterLongVideosByCategory('All', allChip);
    scroller.appendChild(allChip);
    categories.forEach(category => {
        const chip = document.createElement('div');
        chip.className = 'category-chip haptic-trigger';
        chip.textContent = category;
        chip.onclick = () => filterLongVideosByCategory(category, chip);
        scroller.appendChild(chip);
    });
}

function filterLongVideosByCategory(category, element) {
    document.querySelectorAll('#long-video-category-scroller .category-chip').forEach(chip => chip.classList.remove('active'));
    if (element) element.classList.add('active');
    populateLongVideoGrid(category);
}

function populateLongVideoCarousel() {
    const wrapper = document.getElementById('long-video-carousel-wrapper');
    if (!wrapper) return;
    wrapper.innerHTML = '';

    let carouselVideos = fullVideoList.filter(v => v.videoLengthType === 'long');
    if (carouselVideos.length > 0 && carouselVideos.length < 10) { 
        carouselVideos = [...carouselVideos, ...carouselVideos, ...carouselVideos];
    }
    
    if (carouselVideos.length === 0) {
        const placeholderCard = document.createElement('div');
        placeholderCard.className = 'carousel-card placeholder';
        placeholderCard.innerHTML = `<i class="fas fa-film"></i><span>No long videos found</span>`;
        wrapper.appendChild(placeholderCard);
        wrapper.classList.remove('looping');
    } else {
        carouselVideos.forEach(video => {
            const card = document.createElement('div');
            card.className = 'carousel-card haptic-trigger';
            card.style.backgroundImage = `url(${escapeHTML(video.thumbnailUrl) || 'https://via.placeholder.com/320x180/111/fff?text=Video'})`;
            card.onclick = () => playVideoFromProfile(video.id);
            wrapper.appendChild(card);
        });
        if (carouselVideos.length > 3) {
            wrapper.classList.add('looping');
        } else {
            wrapper.classList.remove('looping');
        }
    }
}

function populateLongVideoGrid(category = 'All') {
    const grid = document.getElementById('long-video-grid');
    if (!grid) return;
    grid.innerHTML = '';

    let longVideos = fullVideoList.filter(v => v.videoLengthType === 'long');

    if (category !== 'All') {
        longVideos = longVideos.filter(v => v.category === category);
    }

    if (longVideos.length === 0) {
        for (let i = 0; i < 3; i++) {
             const card = document.createElement('div');
             card.className = 'long-video-card placeholder';
             card.innerHTML = `
                <div class="long-video-thumbnail"><i class="fas fa-video-slash"></i></div>
                <div class="long-video-info-container">
                    <span class="long-video-name">Upload a long video...</span>
                </div>
             `;
             grid.appendChild(card);
        }
    } else {
        longVideos.forEach(video => {
            const card = createLongVideoCard(video);
            grid.appendChild(card);
        });
    }
}

function performLongVideoSearch() {
    const input = document.getElementById('long-video-search-input');
    const query = input.value.trim().toLowerCase();
    const longVideos = fullVideoList.filter(v => v.videoLengthType === 'long');
    let results = [];
    if (query) {
        results = longVideos.filter(v => v.title && v.title.toLowerCase().includes(query));
    }
    populateLongVideoSearchResults(results);
}

function populateLongVideoSearchResults(videos) {
    const container = document.getElementById('long-video-search-results');
    const grid = document.getElementById('long-video-search-results-grid');
    if (!container || !grid) return;

    grid.innerHTML = '';
    if (videos.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    videos.forEach(video => {
        const card = createLongVideoCard(video);
        grid.appendChild(card);
    });
}

function createLongVideoCard(video) {
    const card = document.createElement('div');
    card.className = 'long-video-card';
    card.dataset.videoId = video.id; 
    card.dataset.uploaderUid = video.uploaderUid; 
    card.setAttribute('onclick', `playVideoFromProfile('${video.id}')`);
    const isDiamondGiven = (appState.currentUser.diamondedCreators || []).includes(video.uploaderUid);
    const diamondIconClass = isDiamondGiven ? 'fas' : 'far';
    const diamondIconColor = isDiamondGiven ? 'var(--primary-neon)' : 'var(--text-primary)';
    card.innerHTML = `
        <div class="long-video-thumbnail" style="background-image: url(${escapeHTML(video.thumbnailUrl)})">
            <div class="long-video-view-count"><i class="fas fa-eye"></i> ${formatNumber(video.customViewCount || 0)}</div>
            <div class="long-video-menu haptic-trigger" onclick="showLongVideoMenu(event, '${video.id}')"><i class="fas fa-ellipsis-v"></i></div>
            <i class="fas fa-play play-icon-overlay"></i>
        </div>
        <div class="long-video-info-container">
            <div class="action-icon-container" data-action="diamond" style="cursor: pointer;" onclick="handleDiamondAction(event, '${video.id}', '${video.uploaderUid}')">
                <i class="${diamondIconClass} fa-gem diamond-icon" style="color: ${diamondIconColor}; font-size: 2em;"></i>
            </div>
            <div class="long-video-details">
                <span class="long-video-name">${escapeHTML(video.title)}</span>
                <span class="long-video-uploader">${escapeHTML(video.uploaderUsername)} • ${formatNumber(video.diamonds || 0)} diamonds</span>
            </div>
        </div>
    `;
    return card;
}

function showLongVideoMenu(event, videoId) {
    event.stopPropagation();
    if (confirm("Show video description?")) {
        showVideoDescription(event, videoId);
    }
}

function showVideoDescription(event, videoId) {
    event.stopPropagation();
    const video = fullVideoList.find(v => v.id === videoId);
    if (video) {
        const descriptionText = video.description || "No description available.";
        descriptionContent.innerHTML = escapeHTML(descriptionText).replace(/\n/g, '<br>');
        descriptionModal.classList.add('active');
    } else {
        alert("Could not find video details.");
    }
}

function closeDescriptionModal() {
    descriptionModal.classList.remove('active');
}

function initializeHistoryScreen() {
    renderHistoryShortsScroller();
    renderHistoryLongVideoList();
}

function renderHistoryShortsScroller() {
    const scroller = document.getElementById('history-shorts-scroller');
    if (!scroller) return;
    scroller.innerHTML = '';
    const historyVideos = appState.viewingHistory
        .map(id => fullVideoList.find(v => v.id === id && v.videoLengthType !== 'long'))
        .filter(Boolean);

    if (historyVideos.length === 0) {
        scroller.innerHTML = '<p class="static-message" style="color: var(--text-secondary);">No short video history.</p>';
        return;
    }

    historyVideos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'history-short-card haptic-trigger';
        card.style.backgroundImage = `url(${escapeHTML(video.thumbnailUrl)})`;
        card.onclick = () => playVideoFromProfile(video.id);
        scroller.appendChild(card);
    });
}

function renderHistoryLongVideoList() {
    const list = document.getElementById('history-long-video-list');
    if (!list) return;
    list.innerHTML = '';
     const historyVideos = appState.viewingHistory
        .map(id => fullVideoList.find(v => v.id === id && v.videoLengthType === 'long'))
        .filter(Boolean);

    if (historyVideos.length === 0) {
        list.innerHTML = '<p class="static-message" style="color: var(--text-secondary);">No long video history.</p>';
        return;
    }

    historyVideos.forEach(video => {
        const item = document.createElement('div');
        item.className = 'history-list-item haptic-trigger';
        item.innerHTML = `
            <img src="${escapeHTML(video.thumbnailUrl)}" alt="thumbnail" class="history-item-thumbnail" onclick="playVideoFromProfile('${video.id}')">
            <div class="history-item-info" onclick="playVideoFromProfile('${video.id}')">
                <span class="history-item-title">${escapeHTML(video.title)}</span>
                <span class="history-item-uploader">${escapeHTML(video.uploaderUsername)}</span>
            </div>
            <div class="history-item-menu haptic-trigger" onclick="showHistoryItemMenu(event, '${video.id}')">
                <i class="fas fa-ellipsis-v"></i>
            </div>
        `;
        list.appendChild(item);
    });
}

function showHistoryDate() { alert("Date picker functionality will be added soon."); }

function showHistoryItemMenu(event, videoId) {
    event.stopPropagation();
    if (confirm(`Remove this video from your history?\n\nID: ${videoId}`)) {
        deleteFromHistory(videoId);
    }
}

function deleteFromHistory(videoId) {
    const index = appState.viewingHistory.indexOf(videoId);
    if (index > -1) {
        appState.viewingHistory.splice(index, 1);
        initializeHistoryScreen();
    }
}

function stopFullscreenAdLoop() {
    if (appState.longVideoPlayer && appState.longVideoPlayer.fullscreenAdTimer) {
        clearInterval(appState.longVideoPlayer.fullscreenAdTimer);
        appState.longVideoPlayer.fullscreenAdTimer = null;
    }
    document.getElementById('fullscreen-ad-overlay')?.remove();
}


function injectEarnsureAd(targetElementId) {
    const adContainer = document.getElementById(targetElementId);
    if (!adContainer) {
        console.warn(`Ad container with ID '${targetElementId}' not found.`);
        return;
    }
    const options = `atOptions = {'key' : '5cf688a48641e2cfd0aac4e4d4019604','format' : 'iframe','height' : 250,'width' : 300,'params' : {}};`;
    const src = "//www.highperformanceformat.com/5cf688a48641e2cfd0aac4e4d4019604/invoke.js";
    injectAdScript(adContainer, options, src);
}

function populateEarnsureContent(lang) {
    const earnsureContentDiv = document.getElementById('earnsure-text-content');
    if (earnsureContentDiv) {
        earnsureContentDiv.innerHTML = earnsureContent[lang];
        currentEarnsureLanguage = lang;
    }
}

function initializeEarnsureScreen() {
    const contentArea = document.querySelector('#earnsure-screen .earnsure-content-area');
    if(contentArea && !document.getElementById('earnsure-text-content')) {
        const adContainer = document.createElement('div');
        adContainer.className = 'earnsure-ad-container';
        adContainer.id = 'earnsure-top-ad-container';
        adContainer.innerHTML = '<div>Ad Placeholder</div>';
        const textContent = document.createElement('div');
        textContent.className = 'earnsure-text-content';
        textContent.id = 'earnsure-text-content';
        contentArea.innerHTML = '';
        contentArea.appendChild(adContainer);
        contentArea.appendChild(textContent);
    }
    injectEarnsureAd('earnsure-top-ad-container');
    populateEarnsureContent(currentEarnsureLanguage);
    const languageToggle = document.getElementById('earnsure-language-toggle');
    if (languageToggle) {
        let enButton = languageToggle.querySelector('[data-lang="en"]');
        let hiButton = languageToggle.querySelector('[data-lang="hi"]');
        if (!enButton) {
            enButton = document.createElement('button');
            enButton.classList.add('haptic-trigger');
            enButton.setAttribute('data-lang', 'en');
            enButton.textContent = 'EN';
            languageToggle.appendChild(enButton);
        }
        if (!hiButton) {
            hiButton = document.createElement('button');
            hiButton.classList.add('haptic-trigger');
            hiButton.setAttribute('data-lang', 'hi');
            hiButton.textContent = 'HI';
            languageToggle.appendChild(hiButton);
        }
        enButton.classList.toggle('active', currentEarnsureLanguage === 'en');
        hiButton.classList.toggle('active', currentEarnsureLanguage === 'hi');
        enButton.onclick = () => {
            populateEarnsureContent('en');
            enButton.classList.add('active');
            hiButton.classList.remove('active');
        };
        hiButton.onclick = () => {
            populateEarnsureContent('hi');
            hiButton.classList.add('active');
            enButton.classList.remove('active');
        };
    }
}

function populateYourZoneScreen() {
    const content = document.getElementById('your-zone-content');
    if (!content) {
        console.error("'your-zone-content' element not found in HTML.");
        return;
    }
    const { uid, referralCode, avatar, name, email } = appState.currentUser;
    content.innerHTML = `
        <div class="your-zone-header">
            <img src="${escapeHTML(avatar)}" alt="Avatar" class="your-zone-avatar">
            <h3 class="your-zone-name">${escapeHTML(name)}</h3>
            <p class="your-zone-email">${escapeHTML(email)}</p>
        </div>
        <div class="your-zone-card">
            <label>Your Unique ID</label>
            <div class="input-with-button">
                <input type="text" value="${escapeHTML(uid)}" readonly>
                <button class="copy-btn haptic-trigger" onclick="copyToClipboard('${escapeHTML(uid)}', event)"><i class="fas fa-copy"></i></button>
            </div>
        </div>
        <div class="your-zone-card">
            <label>Your Referral Code</label>
            <div class="input-with-button">
                <input type="text" value="${escapeHTML(referralCode || 'N/A')}" readonly>
                <button class="copy-btn haptic-trigger" onclick="copyToClipboard('${escapeHTML(referralCode)}', event)"><i class="fas fa-copy"></i></button>
            </div>
        </div>
        <button class="your-zone-action-btn edit haptic-trigger" onclick="navigateTo('information-screen')">
            <i class="fas fa-user-edit"></i> Edit Profile
        </button>
        <button class="your-zone-action-btn logout haptic-trigger" onclick="logoutUser()">
            <i class="fas fa-sign-out-alt"></i> Log Out
        </button>
    `;
}

async function populateLeaderboard() {
    console.log("Leaderboard is disabled.");
    const content = document.getElementById('leaderboard-content');
    if(content) {
        content.innerHTML = '<p class="static-message">Leaderboard is currently unavailable.</p>';
    }
    return;
}

async function sendFriendRequest(receiverId, buttonElement) {
    if (!appState.currentUser.uid || !receiverId) return;

    buttonElement.disabled = true;
    buttonElement.textContent = '...';

    const requestData = {
        senderId: appState.currentUser.uid,
        senderName: appState.currentUser.name,
        senderAvatar: appState.currentUser.avatar,
        receiverId: receiverId,
        status: 'pending',
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };

    try {
        const existingRequest = await db.collection('friendRequests')
            .where('senderId', '==', appState.currentUser.uid)
            .where('receiverId', '==', receiverId)
            .get();

        if (!existingRequest.empty) {
            alert("You have already sent a friend request to this user.");
            buttonElement.textContent = 'Requested';
            buttonElement.classList.add('requested');
            return;
        }

        await db.collection('friendRequests').add(requestData);
        buttonElement.textContent = 'Requested';
        buttonElement.classList.add('requested');
    } catch (error) {
        console.error("Error sending friend request:", error);
        alert("Failed to send friend request.");
        buttonElement.disabled = false;
        buttonElement.textContent = 'Add Friend';
    }
}

async function populateFriendRequestsList() {
    const requestsContent = document.getElementById('requests-content');
    if (!requestsContent) return;
    requestsContent.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';

    try {
        const requestsSnapshot = await db.collection('friendRequests')
            .where('receiverId', '==', appState.currentUser.uid)
            .where('status', '==', 'pending')
            .orderBy('createdAt', 'desc')
            .get();

        if (requestsSnapshot.empty) {
            requestsContent.innerHTML = '<p class="static-message">No new friend requests.</p>';
            return;
        }

        const requestsHtml = requestsSnapshot.docs.map(doc => {
            const request = { id: doc.id, ...doc.data() };
            return `
                <div class="holographic-card" id="request-${request.id}">
                    <div class="profile-pic"><img src="${escapeHTML(request.senderAvatar) || 'https://via.placeholder.com/60'}" alt="avatar"></div>
                    <div class="info">
                        <div class="name">${escapeHTML(request.senderName) || 'User'}</div>
                        <div class="subtext">Wants to be your friend</div>
                    </div>
                    <div class="request-actions">
                        <button class="accept-button haptic-trigger" onclick="acceptFriendRequest(event, '${request.id}', '${request.senderId}')">Accept</button>
                        <button class="reject-button haptic-trigger" onclick="rejectFriendRequest(event, '${request.id}')">Reject</button>
                    </div>
                </div>
            `;
        }).join('');

        requestsContent.innerHTML = requestsHtml;

    } catch (error) {
        console.error("Error fetching friend requests:", error);
        requestsContent.innerHTML = `<p class="static-message" style="color: var(--error-red);">Could not load requests. Please check your Firestore Indexes.</p><p style="font-size: 0.8em; color: var(--text-secondary);">${error.message}</p>`;
    }
}

async function acceptFriendRequest(event, requestId, senderId) {
    const actionDiv = event.target.closest('.request-actions');
    actionDiv.innerHTML = '<div class="loader" style="width: 20px; height: 20px;"></div>';

    const batch = db.batch();
    
    const requestRef = db.collection('friendRequests').doc(requestId);
    batch.update(requestRef, { status: 'accepted' });

    const currentUserRef = db.collection('users').doc(appState.currentUser.uid);
    batch.update(currentUserRef, { friends: firebase.firestore.FieldValue.arrayUnion(senderId) });
    
    const senderUserRef = db.collection('users').doc(senderId);
    batch.update(senderUserRef, { friends: firebase.firestore.FieldValue.arrayUnion(appState.currentUser.uid) });

    try {
        await batch.commit();
        
        if (!appState.currentUser.friends.includes(senderId)) {
            appState.currentUser.friends.push(senderId);
        }

        alert("Friend request accepted!");
        const requestCard = document.getElementById(`request-${requestId}`);
        if (requestCard) requestCard.remove();
        populateMembersList();
    } catch (error) {
        console.error("Error accepting friend request:", error);
        alert("Failed to accept request. Please check your internet connection and Firestore rules.");
        actionDiv.innerHTML = `<button class="accept-button haptic-trigger" onclick="acceptFriendRequest(event, '${requestId}', '${senderId}')">Accept</button>
                               <button class="reject-button haptic-trigger" onclick="rejectFriendRequest(event, '${requestId}')">Reject</button>`;
    }
}

async function rejectFriendRequest(event, requestId) {
    const actionDiv = event.target.closest('.request-actions');
    actionDiv.innerHTML = '<div class="loader" style="width: 20px; height: 20px;"></div>';

    try {
        await db.collection('friendRequests').doc(requestId).delete();
        const requestCard = document.getElementById(`request-${requestId}`);
        if (requestCard) requestCard.remove();
    } catch (error) {
        console.error("Error rejecting friend request:", error);
        alert("Failed to reject request.");
        actionDiv.innerHTML = `<button class="accept-button haptic-trigger" onclick="acceptFriendRequest(event, '${requestId}', '${senderId}')">Accept</button>
                               <button class="reject-button haptic-trigger" onclick="rejectFriendRequest(event, '${requestId}')">Reject</button>`;
    }
}

async function populateMembersList() {
    const membersContent = document.getElementById('members-content');
    if (!membersContent) return;
    membersContent.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';

    const friendIds = appState.currentUser.friends || [];

    if (friendIds.length === 0) {
        membersContent.innerHTML = '<p class="static-message">You have no friends yet. Add some from the "Add" tab!</p>';
        return;
    }

    try {
        const friendPromises = friendIds.map(id => db.collection('users').doc(id).get());
        const friendDocs = await Promise.all(friendPromises);

        const friendsHtml = friendDocs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(friend => friend.name) 
            .map(friend => `
                <div class="holographic-card" onclick="startChat('${friend.id}', '${escapeHTML(friend.name)}', '${escapeHTML(friend.avatar)}')">
                    <div class="profile-pic"><img src="${escapeHTML(friend.avatar) || 'https://via.placeholder.com/60'}" alt="avatar"></div>
                    <div class="info">
                        <div class="name">${escapeHTML(friend.name)}</div>
                        <div class="subtext">Tap to chat</div>
                    </div>
                </div>
            `).join('');
        
        membersContent.innerHTML = friendsHtml || '<p class="static-message">Could not load friends list.</p>';

    } catch (error) {
        console.error("Error fetching members:", error);
        membersContent.innerHTML = '<p class="static-message" style="color: var(--error-red);">Could not load your friends.</p>';
    }
}

async function populateAddFriendsList() {
    const addContent = document.querySelector('#friends-screen #add-content');
    if (!addContent) return;
    addContent.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';

    try {
        const usersSnapshot = await db.collection('users').get();
        if (usersSnapshot.empty) {
            addContent.innerHTML = '<p class="static-message">No other users found.</p>';
            return;
        }
        
        const currentUserFriends = appState.currentUser.friends || [];
        const sentRequestsSnapshot = await db.collection('friendRequests').where('senderId', '==', appState.currentUser.uid).get();
        const requestedIds = sentRequestsSnapshot.docs.map(doc => doc.data().receiverId);

        const usersHtml = usersSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(user => 
                user.id !== appState.currentUser.uid && 
                !currentUserFriends.includes(user.id)
            )
            .map(user => {
                const isRequested = requestedIds.includes(user.id);
                const buttonHtml = isRequested 
                    ? `<button class="add-button requested" disabled>Requested</button>`
                    : `<button class="add-button haptic-trigger" onclick="sendFriendRequest('${user.id}', this)">Add Friend</button>`;

                return `
                <div class="holographic-card">
                    <div class="profile-pic"><img src="${escapeHTML(user.avatar) || 'https://via.placeholder.com/60'}" alt="avatar"></div>
                    <div class="info">
                        <div class="name">${escapeHTML(user.name) || 'User'}</div>
                    </div>
                    ${buttonHtml}
                </div>`;
            }).join('');

        addContent.innerHTML = usersHtml || '<p class="static-message">No other users to add.</p>';
    } catch (error) {
        console.error("Error fetching users for Add Friends:", error);
        addContent.innerHTML = '<p class="static-message" style="color: var(--error-red);">Could not load user list.</p>';
    }
}

async function startChat(friendId, friendName, friendAvatar) {
    const chatScreen = document.getElementById('chat-screen-overlay');
    if (!chatScreen) return;
    
    document.getElementById('chat-username').textContent = friendName;
    document.getElementById('chat-user-profile-pic').src = friendAvatar || 'https://via.placeholder.com/50';

    const uids = [appState.currentUser.uid, friendId].sort();
    const chatId = uids.join('_');
    
    appState.activeChat = { chatId, friendId, friendName, friendAvatar };

    try {
        const chatRef = db.collection('chats').doc(chatId);
        
        await chatRef.set({
            members: uids
        }, { merge: true });

        chatScreen.classList.add('active');
        loadChatMessages(chatId);

    } catch (error) {
        console.error("Error starting chat:", error);
        alert("Could not start chat. Please check your internet connection or try again.");
    }
}

async function sendMessage() {
    const { chatId } = appState.activeChat;
    const inputField = document.querySelector('#chat-screen-overlay .input-field');
    const text = inputField.value.trim();

    if (!text || !chatId) return;

    const messageData = {
        text: text,
        senderId: appState.currentUser.uid,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    inputField.value = '';

    try {
        await db.collection('chats').doc(chatId).collection('messages').add(messageData);
    } catch (error) {
        console.error("Error sending message:", error);
        alert("Message could not be sent.");
        inputField.value = text;
    }
}

function loadChatMessages(chatId) {
    const messagesContainer = document.getElementById('chat-messages');
    messagesContainer.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';
    
    db.collection('chats').doc(chatId).collection('messages').orderBy('createdAt', 'asc')
      .onSnapshot(snapshot => {
          if (snapshot.empty) {
              messagesContainer.innerHTML = '<p class="static-message">No messages yet. Say hi!</p>';
              return;
          }
          const messagesHtml = snapshot.docs.map(doc => {
              const msg = doc.data();
              const bubbleClass = msg.senderId === appState.currentUser.uid ? 'sender' : 'receiver';
              return `<div class="message-bubble ${bubbleClass}">${escapeHTML(msg.text)}</div>`;
          }).join('');

          messagesContainer.innerHTML = messagesHtml;
          messagesContainer.scrollTop = messagesContainer.scrollHeight; 
      }, error => {
          console.error("Error loading chat messages:", error);
          messagesContainer.innerHTML = '<p class="static-message" style="color: var(--error-red);">Could not load chat. Check security rules.</p>';
      });
}

function initializeMessagingInterface() {
    const friendsScreen = document.getElementById('friends-screen');
    if (!friendsScreen) return;
    
    friendsScreen.querySelectorAll('.tab-button').forEach(button => {
        button.classList.add('haptic-trigger');
        button.addEventListener('click', () => {
             friendsScreen.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
             friendsScreen.querySelectorAll('.tab-content').forEach(content => content.classList.add('hidden'));
             button.classList.add('active');
             const contentToShow = friendsScreen.querySelector('#' + button.dataset.tab + '-content');
             if (contentToShow) contentToShow.classList.remove('hidden');

             if (button.dataset.tab === 'add') populateAddFriendsList();
             if (button.dataset.tab === 'requests') populateFriendRequestsList();
             if (button.dataset.tab === 'members') populateMembersList();
        });
    });

    const chatScreenOverlay = document.getElementById('chat-screen-overlay');
    chatScreenOverlay.querySelector('.back-arrow')?.addEventListener('click', () => {
        chatScreenOverlay.classList.remove('active');
        const { chatId } = appState.activeChat;
        if (chatId) {
            const unsubscribe = db.collection('chats').doc(chatId).collection('messages').onSnapshot(() => {});
            if (unsubscribe) unsubscribe();
        }
        appState.activeChat = {};
    });

    const sendButton = document.getElementById('send-button');
    const messageInput = document.querySelector('#chat-screen-overlay .input-field');

    sendButton?.addEventListener('click', sendMessage);
    messageInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    messageInput?.addEventListener('input', (e) => {
        if (e.target.value.trim().length > 0) {
            sendButton.classList.add('active');
        } else {
            sendButton.classList.remove('active');
        }
    });

}

function provideHapticFeedback() { if (hapticFeedbackEnabled && navigator.vibrate) navigator.vibrate(50); }
function loadHapticPreference() {
    hapticFeedbackEnabled = (localStorage.getItem('hapticFeedbackEnabled') !== 'false');
    const hapticToggleInput = document.getElementById('haptic-toggle-input');
    if (hapticToggleInput) hapticToggleInput.checked = hapticFeedbackEnabled;
}
function saveHapticPreference(enabled) {
    localStorage.setItem('hapticFeedbackEnabled', enabled);
    hapticFeedbackEnabled = enabled;
}

function toggleProfileVideoView(viewType) {
    const shortGrid = document.getElementById('user-short-video-grid');
    const longGrid = document.getElementById('user-long-video-grid');
    const shortBtn = document.getElementById('profile-show-shorts-btn');
    const longBtn = document.getElementById('profile-show-longs-btn');

    if (viewType === 'short') {
        if(shortGrid) shortGrid.style.display = 'grid';
        if(longGrid) longGrid.style.display = 'none';
        if(shortBtn) shortBtn.classList.add('active');
        if(longBtn) longBtn.classList.remove('active');
    } else {
        if(shortGrid) shortGrid.style.display = 'none';
        if(longGrid) longGrid.style.display = 'grid';
        if(shortBtn) shortBtn.classList.remove('active');
        if(longBtn) longBtn.classList.add('active');
    }
}

// =======================================================
// === DIAMOND MEMBERS & CREATOR PAGE LOGIC - START ===
// =======================================================

async function populateDiamondMembersScreen() {
    const content = document.getElementById('diamond-members-content');
    if (!content) return;
    content.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';

    const creatorIds = appState.currentUser.diamondedCreators || [];

    if (creatorIds.length === 0) {
        content.innerHTML = '<p class="static-message">You have not given a diamond to any creator yet.</p>';
        return;
    }

    try {
        const creatorPromises = creatorIds.map(id => db.collection('users').doc(id).get());
        const creatorDocs = await Promise.all(creatorPromises);
        
        const creators = creatorDocs.map(doc => ({ id: doc.id, ...doc.data() })).filter(c => c.name);

        if (creators.length === 0) {
            content.innerHTML = '<p class="static-message">Could not load creator profiles.</p>';
            return;
        }

        const listHtml = creators.map(creator => `
            <div class="diamond-member-item">
                <img src="${escapeHTML(creator.avatar) || 'https://via.placeholder.com/50'}" alt="avatar" class="avatar">
                <span class="name">${escapeHTML(creator.name)}</span>
                <button class="open-btn haptic-trigger" onclick="navigateTo('creator-diamond-page-screen', { creatorId: '${creator.id}' })">Open</button>
                <button class="user-video-action-btn delete haptic-trigger" style="margin-left: auto;" onclick="deactivateDiamond('${creator.id}')">
                    <i class="fas fa-gem" style="color: var(--primary-neon);"></i> Deactivate
                </button>
            </div>
        `).join('');
        
        content.innerHTML = `<div class="diamond-member-list">${listHtml}</div>`;

    } catch (error) {
        console.error("Error loading diamond members:", error);
        content.innerHTML = '<p class="static-message" style="color: var(--error-red);">Error loading your diamond members.</p>';
    }
}

async function deactivateDiamond(creatorId) {
    if (!confirm("Are you sure you want to remove the diamond from this creator?")) return;

    const userRef = db.collection('users').doc(appState.currentUser.uid);
    const creatorRef = db.collection('users').doc(creatorId);

    try {
        const batch = db.batch();
        batch.update(userRef, { diamondedCreators: firebase.firestore.FieldValue.arrayRemove(creatorId) });
        batch.update(creatorRef, { diamonds: firebase.firestore.FieldValue.increment(-1) });
        await batch.commit();

        const index = appState.currentUser.diamondedCreators.indexOf(creatorId);
        if (index > -1) {
            appState.currentUser.diamondedCreators.splice(index, 1);
        }
        
        alert("Diamond deactivated.");
        populateDiamondMembersScreen();
        
    } catch (error) {
        console.error("Error deactivating diamond:", error);
        alert("Failed to deactivate diamond.");
    }
}


async function initializeCreatorDiamondPage(creatorId, startWith = 'short', videoId = null) {
    if (fullVideoList.length === 0) await refreshAndRenderFeed();
    const shortView = document.getElementById('creator-page-short-view');
    const longView = document.getElementById('creator-page-long-view');
    if (!shortView || !longView) return;
    shortView.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';
    longView.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';

    const tabs = document.querySelectorAll('#creator-page-tabs .creator-page-tab-btn');
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.creator-page-view').forEach(v => v.classList.remove('active'));
            const activeView = document.getElementById(`creator-page-${tab.dataset.type}-view`);
            if (activeView) activeView.classList.add('active');
            
            const otherType = tab.dataset.type === 'short' ? 'long' : 'short';
            if(appState.creatorPagePlayers[otherType] && typeof appState.creatorPagePlayers[otherType].pauseVideo === 'function') {
                appState.creatorPagePlayers[otherType].pauseVideo();
            }
            if(appState.creatorPagePlayers[tab.dataset.type] && typeof appState.creatorPagePlayers[tab.dataset.type].playVideo === 'function') {
                appState.creatorPagePlayers[tab.dataset.type].playVideo();
            }
        };
    });
    
    const videos = fullVideoList.filter(v => v.uploaderUid === creatorId && v.audience !== '18plus');
    const shortVideos = videos.filter(v => v.videoLengthType !== 'long');
    const longVideos = videos.filter(v => v.videoLengthType === 'long');

    renderCreatorVideoView(shortView, shortVideos, 'short', creatorId, videoId && startWith === 'short' ? videoId : null);
    renderCreatorVideoView(longView, longVideos, 'long', creatorId, videoId && startWith === 'long' ? videoId : null);
    
    document.querySelectorAll('.creator-page-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.creator-page-tab-btn').forEach(t => t.classList.remove('active'));
    document.getElementById(`creator-page-${startWith}-view`).classList.add('active');
    document.querySelector(`.creator-page-tab-btn[data-type="${startWith}"]`).classList.add('active');
}

function renderCreatorVideoView(container, videos, type, creatorId, startVideoId = null) {
    container.innerHTML = '';
    if (videos.length === 0) {
        container.innerHTML = `<p class="static-message">This creator has no ${type} videos.</p>`;
        return;
    }
    
    let firstVideo = videos[0];
    if (startVideoId) {
        const foundVideo = videos.find(v => v.id === startVideoId);
        if (foundVideo) firstVideo = foundVideo;
    }
    
    const videoListHtml = videos.map((v, index) => {
        const thumbClass = (type === 'long') ? 'side-video-thumb-long' : 'side-video-thumb-short';
        return `<img src="${v.thumbnailUrl}" class="side-video-thumb haptic-trigger ${thumbClass}" onclick="playCreatorVideo('${type}', ${index}, '${creatorId}')">`;
    }).join('');

    container.innerHTML = `
        <div class="creator-video-viewer">
            <div class="main-video-card-wrapper">
                <div class="main-video-card">
                    <div id="creator-page-player-${type}"></div>
                    <div id="creator-paused-ad-container-${type}" class="paused-ad-container"></div>
                </div>
                <div id="creator-long-banner-ad-container" style="display: ${type === 'long' ? 'flex' : 'none'};"></div>
            </div>
            <div class="side-video-list-scroller">${videoListHtml}</div>
        </div>
    `;
    
    if (videos.length > 0 && isYouTubeApiReady) {
        initializeCreatorPagePlayer(firstVideo.videoUrl, `creator-page-player-${type}`, type);
    }
    
    if (type === 'long') {
        const adContainer = document.getElementById('creator-long-banner-ad-container');
        if (adContainer) {
            const options = `atOptions = {'key' : '5cf688a48641e2cfd0aac4e4d4019604', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {}};`;
            const src = "//www.highperformanceformat.com/5cf688a48641e2cfd0aac4e4d4019604/invoke.js";
            injectAdScript(adContainer, options, src);
        }
    }
}

function initializeCreatorPagePlayer(videoId, containerId, type) {
    if (appState.creatorPagePlayers[type]) {
        appState.creatorPagePlayers[type].destroy();
    }

    appState.creatorPagePlayers[type] = new YT.Player(containerId, {
        height: '100%',
        width: '100%',
        videoId: videoId,
        playerVars: {
            'autoplay': 1,
            'controls': 1, 
            'rel': 0,
            'showinfo': 0,
            'mute': 0,
            'modestbranding': 1,
            'fs': 1,
            'origin': window.location.origin
        },
        events: {
            'onReady': (event) => { 
                event.target.playVideo(); 
                const iframe = event.target.getIframe();
                iframe.addEventListener('fullscreenchange', () => handleFullscreenChange(type));
            },
            'onStateChange': onPlayerStateChange
        }
    });
}

function playCreatorVideo(type, videoIndex, creatorId) {
    const videos = fullVideoList.filter(v => 
        v.uploaderUid === creatorId && 
        v.audience !== '18plus' &&
        (type === 'long' ? v.videoLengthType === 'long' : v.videoLengthType !== 'long')
    );
    
    if (videos[videoIndex]) {
        const videoToPlay = videos[videoIndex];
        const player = appState.creatorPagePlayers[type];
        if (player && typeof player.loadVideoById === 'function') {
            player.loadVideoById(videoToPlay.videoUrl);
        }
    }
}

function toggleCreatorVideoList() {
    const activeView = document.querySelector('.creator-page-view.active');
    if (activeView) {
        const viewer = activeView.querySelector('.creator-video-viewer');
        if (viewer) {
            viewer.classList.toggle('show-side-list');
        }
    }
}

function toggleFullscreenMode() {
    const activeView = document.querySelector('.creator-page-view.active');
    if (!activeView) return;
    const type = activeView.id.includes('long') ? 'long' : 'short';
    const player = appState.creatorPagePlayers[type];
    if (player) {
        const iframe = player.getIframe();
        if (iframe.requestFullscreen) {
            iframe.requestFullscreen();
        } else if (iframe.mozRequestFullScreen) {
            iframe.mozRequestFullScreen();
        } else if (iframe.webkitRequestFullscreen) {
            iframe.webkitRequestFullscreen();
        } else if (iframe.msRequestFullscreen) {
            iframe.msRequestFullscreen();
        }
    }
}


function handleCreatorPlayerStateChange(event) {
    const player = event.target;
    const playerState = event.data;
    const videoData = player.getVideoData();
    const videoUrl = videoData.video_id;

    const currentVideo = fullVideoList.find(v => v.videoUrl === videoUrl);
    if (!currentVideo) return;
    const dbVideoId = currentVideo.id;

    const activeView = document.querySelector('.creator-page-view.active');
    if (!activeView) return;
    const type = activeView.id.includes('long') ? 'long' : 'short';

    const pausedAdContainer = document.getElementById(`creator-paused-ad-container-${type}`);

    if (playerState === YT.PlayerState.PLAYING) {
        if (pausedAdContainer) pausedAdContainer.style.display = 'none';
        if (document.fullscreenElement) {
            startFullscreenAdLoop();
        }
        startVideoViewTracker(dbVideoId, type);
    } else if (playerState === YT.PlayerState.PAUSED) {
        stopFullscreenAdLoop();
        stopVideoViewTracker(dbVideoId);
    } else {
        stopFullscreenAdLoop();
        stopVideoViewTracker(dbVideoId);
    }
}

function handleFullscreenChange(type) {
    const player = appState.creatorPagePlayers[type];
    if (document.fullscreenElement) {
        if (player && typeof player.getPlayerState === 'function' && player.getPlayerState() === YT.PlayerState.PLAYING) {
            startFullscreenAdLoop();
        }
    } else {
        stopFullscreenAdLoop();
        const pausedAdContainer = document.getElementById(`creator-paused-ad-container-${type}`);
        if(pausedAdContainer) pausedAdContainer.style.display = 'none';
    }
}

function startFullscreenAdLoop() {
    stopFullscreenAdLoop();
    appState.creatorPagePlayers.fullscreenAdTimer = setInterval(() => {
        const player = appState.creatorPagePlayers.long;
        if (document.fullscreenElement && player && player.getPlayerState() === YT.PlayerState.PLAYING) {
            const adOverlay = document.createElement('div');
            adOverlay.className = 'fullscreen-timed-ad';
            
            const adContent = document.createElement('div');
            adContent.className = 'ad-content';
            
            const closeBtn = document.createElement('button');
            closeBtn.className = 'close-ad-btn';
            closeBtn.innerHTML = '×';
            closeBtn.onclick = () => adOverlay.remove();
            
            adContent.appendChild(closeBtn);
            adOverlay.appendChild(adContent);
            document.body.appendChild(adOverlay);
            
            const options = `atOptions = {'key' : '5cf688a48641e2cfd0aac4e4d4019604', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {}};`;
            const src = "//www.highperformanceformat.com/5cf688a48641e2cfd0aac4e4d4019604/invoke.js";
            injectAdScript(adContent, options, src);

            setTimeout(() => {
                if(adOverlay && document.body.contains(adOverlay)) adOverlay.remove();
            }, 1500);
        } else {
            stopFullscreenAdLoop();
        }
    }, 30000);
}

function stopFullscreenAdLoop() {
    if (appState.creatorPagePlayers.fullscreenAdTimer) {
        clearInterval(appState.creatorPagePlayers.fullscreenAdTimer);
        appState.creatorPagePlayers.fullscreenAdTimer = null;
    }
    const existingAd = document.querySelector('.fullscreen-timed-ad');
    if (existingAd) existingAd.remove();
}


function stopCreatorPageAdCycle() {
    stopFullscreenAdLoop();
    const pausedAd = document.getElementById('creator-paused-ad-container-long');
    if (pausedAd) {
        pausedAd.style.display = 'none';
        pausedAd.innerHTML = '';
    }
    const bannerAd = document.getElementById('creator-long-banner-ad-container');
    if(bannerAd) {
        bannerAd.innerHTML = '';
    }
}


// =======================================================
// === PAYMENT & TRACKING LOGIC - START ===
// =======================================================

function initializePaymentScreen() {
    const content = document.getElementById('payment-content');
    if (!content) return;
    const user = appState.currentUser;

    content.innerHTML = `
        <div class="form-group"><label>Unique ID</label><input type="text" value="${escapeHTML(user.uid)}" readonly></div>
        <div class="form-group"><label>Name</label><input type="text" id="payment-name" value="${escapeHTML(user.name)}" readonly></div>
        <div class="form-group"><label for="payment-method">Payment Method</label><select id="payment-method" onchange="togglePaymentDetails()"><option value="">--Select Method--</option><option value="upi">UPI</option><option value="bank">Bank Transfer</option></select></div>
        <div id="upi-details" class="payment-details" style="display:none;"><div class="form-group"><label for="upi-id">UPI ID</label><input type="text" id="upi-id" placeholder="yourname@okhdfcbank"></div></div>
        <div id="bank-details" class="payment-details" style="display:none;"><div class="form-group"><label for="bank-account-number">Account Number</label><input type="text" id="bank-account-number" placeholder="Enter Account Number"></div><div class="form-group"><label for="bank-ifsc-code">IFSC Code</label><input type="text" id="bank-ifsc-code" placeholder="Enter IFSC Code"></div></div>
        <div class="form-group"><label for="payment-address">Address</label><textarea id="payment-address" rows="3" placeholder="Enter your full address">${escapeHTML(user.address)}</textarea></div>
        <div class="form-group"><label for="payment-aadhar">Aadhar Number</label><input type="text" id="payment-aadhar" placeholder="Enter your Aadhar number"></div>
        <button class="continue-btn haptic-trigger" onclick="navigateTo('track-payment-screen')" style="background-color: var(--success-green); margin-bottom: 10px;">Track Payment</button>
        <button class="continue-btn haptic-trigger" onclick="handlePaymentRequest(event)">Request Payment</button>
    `;
}

function togglePaymentDetails() {
    const method = document.getElementById('payment-method').value;
    document.getElementById('upi-details').style.display = (method === 'upi') ? 'block' : 'none';
    document.getElementById('bank-details').style.display = (method === 'bank') ? 'block' : 'none';
}

async function handlePaymentRequest(event) {
    const user = appState.currentUser;
    const method = document.getElementById('payment-method').value;
    
    if(!method) {
        alert("Please select a payment method.");
        return;
    }

    let paymentDetails = {};
    if (method === 'upi') {
        const upiId = document.getElementById('upi-id').value.trim();
        if (!upiId) { alert("Please enter your UPI ID."); return; }
        paymentDetails.upiId = upiId;
    } else if (method === 'bank') {
        const accNum = document.getElementById('bank-account-number').value.trim();
        const ifsc = document.getElementById('bank-ifsc-code').value.trim();
        if (!accNum || !ifsc) { alert("Please enter bank account details."); return; }
        paymentDetails.accountNumber = accNum;
        paymentDetails.ifscCode = ifsc;
    }

    const address = document.getElementById('payment-address').value.trim();
    const aadhar = document.getElementById('payment-aadhar').value.trim();

    if (!address || !aadhar) {
        alert("Please fill in your address and Aadhar number.");
        return;
    }

    if(!confirm("This will submit your payment request to the admin. After submitting, your tracking data will be reset. Continue?")) {
        return;
    }
    
    const button = event.target;
    button.disabled = true;
    button.textContent = "Submitting...";

    const totalAppTimeSeconds = parseInt(localStorage.getItem('totalAppTimeSeconds') || '0', 10);
    const creatorWatchTime = user.creatorTotalWatchTimeSeconds || 0;
    const dailyCreatorWatchTime = user.creatorDailyWatchTime || {};

    const requestData = {
        requesterUid: user.uid,
        requesterName: user.name,
        paymentMethod: method,
        paymentDetails: paymentDetails,
        address: address,
        aadhar: aadhar,
        appTimeSeconds: totalAppTimeSeconds,
        totalCreatorWatchTimeSeconds: creatorWatchTime,
        dailyCreatorWatchTime: dailyCreatorWatchTime,
        status: "pending",
        requestedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        await db.collection("paymentRequests").add(requestData);
        await resetTrackingData();
        alert("Payment request submitted successfully! Your tracking data has been reset.");
        navigateTo('home-screen'); 
    } catch(error) {
        console.error("Error submitting payment request:", error);
        alert("Failed to submit request. Please try again.");
    } finally {
        button.disabled = false;
        button.textContent = "Request Payment";
    }
}

function initializeTrackPaymentScreen() {
    const content = document.getElementById('track-payment-content');
    if (!content) return;

    const totalAppTimeSeconds = parseInt(localStorage.getItem('totalAppTimeSeconds') || '0', 10);
    const creatorWatchTime = appState.currentUser.creatorTotalWatchTimeSeconds || 0;
    const dailyWatchData = appState.currentUser.creatorDailyWatchTime || {};

    const dailyBreakdownHtml = Object.entries(dailyWatchData)
        .sort((a, b) => new Date(b[0]) - new Date(a[0]))
        .map(([date, seconds]) => `<li><strong>${date}:</strong> ${formatSecondsToHMS(seconds)}</li>`)
        .join('');

    content.innerHTML = `
        <div class="earnsure-section">
            <h4>📊 Your Activity</h4>
            <p>This data helps calculate your earnings. It will be reset after each payment request.</p>
        </div>
        <div class="earnsure-section">
            <h4>🕒 Time Spent on App</h4>
            <p style="font-size: 1.5em; color: var(--primary-neon); font-weight: bold;">${formatSecondsToHMS(totalAppTimeSeconds)}</p>
        </div>
        <div class="earnsure-section">
            <h4>📺 Total Video Watch Time (Creator)</h4>
            <p>Total time others have watched your videos.</p>
            <p style="font-size: 1.5em; color: var(--primary-neon); font-weight: bold;">${formatSecondsToHMS(creatorWatchTime)}</p>
        </div>
        <div class="earnsure-section">
            <h4>🗓️ Daily Watch Time Breakdown</h4>
            ${dailyBreakdownHtml ? `<ul>${dailyBreakdownHtml}</ul>` : '<p>No daily watch time recorded yet.</p>'}
        </div>
    `;
}


function startAppTimeTracker() {
    if (appState.appTimeTrackerInterval) clearInterval(appState.appTimeTrackerInterval);
    appState.appTimeTrackerInterval = setInterval(() => {
        let totalSeconds = parseInt(localStorage.getItem('totalAppTimeSeconds') || '0', 10);
        totalSeconds += 5;
        localStorage.setItem('totalAppTimeSeconds', totalSeconds);
    }, 5000);
}

async function updateCreatorWatchTime(creatorId, watchedSeconds) {
    if (!creatorId || !watchedSeconds) return;
    try {
        const creatorRef = db.collection('users').doc(creatorId);
        const today = new Date().toISOString().slice(0, 10);
        const dailyWatchTimeKey = `creatorDailyWatchTime.${today}`;

        await creatorRef.update({ 
            creatorTotalWatchTimeSeconds: firebase.firestore.FieldValue.increment(watchedSeconds),
            [dailyWatchTimeKey]: firebase.firestore.FieldValue.increment(watchedSeconds)
        });

    } catch (error) {
        if (error.code !== 'not-found') {
            console.error("Could not update creator watch time in Firestore:", error);
        }
    }
}

function startWatchTimeTracker() {
    if (appState.watchTimeInterval) clearInterval(appState.watchTimeInterval);
    
    let secondsSinceLastUpdate = 0;
    const videoData = fullVideoList.find(v => v.id === activePlayerId);
    const creatorId = videoData ? videoData.uploaderUid : null;

    appState.watchTimeInterval = setInterval(async () => {
        appState.currentUser.totalWatchTimeSeconds += 1;
        
        if (creatorId && creatorId !== appState.currentUser.uid) {
            secondsSinceLastUpdate += 1;
        }

        if (secondsSinceLastUpdate >= 15) {
            await updateCreatorWatchTime(creatorId, secondsSinceLastUpdate);
            secondsSinceLastUpdate = 0;
        }
    }, 1000);
}

async function stopWatchTimeTracker() {
    if (appState.watchTimeInterval) {
        clearInterval(appState.watchTimeInterval);
        appState.watchTimeInterval = null;
        
        const userRef = db.collection('users').doc(appState.currentUser.uid);
        try {
            await userRef.update({ totalWatchTimeSeconds: appState.currentUser.totalWatchTimeSeconds });
        } catch(e) {
            console.error("Could not do final update for user watch time:", e)
        }
    }
}


async function resetTrackingData() {
    try {
        localStorage.setItem('totalAppTimeSeconds', '0');
        const userRef = db.collection('users').doc(appState.currentUser.uid);
        await userRef.update({ 
            totalWatchTimeSeconds: 0, 
            creatorTotalWatchTimeSeconds: 0,
            creatorDailyWatchTime: {}
        });
        appState.currentUser.totalWatchTimeSeconds = 0;
        appState.currentUser.creatorTotalWatchTimeSeconds = 0;
        appState.currentUser.creatorDailyWatchTime = {};
    } catch (error) {
        console.error("Failed to reset tracking data:", error);
    }
}


function formatSecondsToHMS(secs) {
    if (isNaN(secs) || secs < 0) {
        return "0s";
    }
    const d = Math.floor(secs / (3600*24));
    secs  -= d*3600*24;
    const h = Math.floor(secs / 3600);
    secs  -= h*3600;
    const m = Math.floor(secs / 60);
    secs  -= m*60;
    secs = Math.round(secs);

    let parts = [];
    if (d > 0) parts.push(d + "d");
    if (h > 0) parts.push(h + "h");
    if (m > 0) parts.push(m + "m");
    if (secs > 0 || parts.length === 0) parts.push(secs + "s");
    
    return parts.join(' ');
}

// =======================================================
// === ADVERTISER DASHBOARD LOGIC - START ===
// =======================================================
const advertiserFunctions = {
    planData: [ { name: 'Basic', cost: 100, impressions: { banner: 1000, image_5s: 500, video: 100 } }, { name: 'Starter', cost: 250, impressions: { banner: 3000, image_5s: 1500, video: 300 } }, { name: 'Lite', cost: 500, impressions: { banner: 6000, image_5s: 3000, video: 700 } }, { name: 'Bronze', cost: 1000, impressions: { banner: 12000, image_5s: 6000, video: 1500 } }, { name: 'Silver', cost: 2000, impressions: { banner: 25000, image_5s: 12000, video: 3000 } }, { name: 'Gold', cost: 3000, impressions: { banner: 40000, image_5s: 20000, video: 5000 } }, { name: 'Platinum', cost: 5000, impressions: { banner: 75000, image_5s: 38000, video: 9000 } }, { name: 'Diamond', cost: 7500, impressions: { banner: 115000, image_5s: 60000, video: 13000 } }, { name: 'Titanium', cost: 9000, impressions: { banner: 150000, image_5s: 80000, video: 16000 } }, { name: 'Dymond Elite', cost: 10000, impressions: { banner: 175000, image_5s: 100000, video: 20000 } } ],
    showSection(sectionId) { document.querySelectorAll('#advertisement-screen .section').forEach(sec => sec.classList.remove('active')); const section = document.getElementById(sectionId); if (section) section.classList.add('active'); },
    populatePlans() { const container = document.getElementById('planContainer'); if (!container) return; container.innerHTML = ''; this.planData.forEach((plan, index) => { const planElement = document.createElement('div'); planElement.className = 'plan'; planElement.onclick = () => this.selectPlan(index, planElement); planElement.innerHTML = `<div class="plan-header"><div class="plan-name">${plan.name}</div><div class="plan-price"><span>₹</span>${plan.cost.toLocaleString('en-IN')}</div></div><ul class="impression-details"><li><span class="icon">🖼️</span><span class="label">Banner Ad</span><span class="value">${plan.impressions.banner.toLocaleString('en-IN')}</span></li><li><span class="icon">✨</span><span class="label">Image Ad (5s)</span><span class="value">${plan.impressions.image_5s.toLocaleString('en-IN')}</span></li><li><span class="icon">▶️</span><span class="label">Video Ad</span><span class="value">${plan.impressions.video.toLocaleString('en-IN')}</span></li></ul>`; container.appendChild(planElement); }); },
    selectPlan(planIndex, element) { document.querySelectorAll('#advertisement-screen .plan').forEach(p => p.classList.remove('selected')); element.classList.add('selected'); document.getElementById('selectedPlanData').value = JSON.stringify(this.planData[planIndex]); },
    goToForm() { const selectedPlanData = document.getElementById('selectedPlanData').value; if (!selectedPlanData) { alert('Please select a plan to continue.'); return; } const userProfile = JSON.parse(localStorage.getItem('advertiserProfile')); document.getElementById('adv-contactWhatsapp').value = userProfile.whatsapp; this.updateImpressionDisclaimer(); this.showSection('adFormSection'); },
    updateImpressionDisclaimer() { const planString = document.getElementById('selectedPlanData').value; const disclaimerEl = document.getElementById('impressionDisclaimer'); if (!planString || !disclaimerEl) return; const plan = JSON.parse(planString); const adType = document.getElementById('adv-adType').value; const finalImpressions = plan.impressions[adType]; disclaimerEl.innerHTML = `You will receive approximately <strong>${finalImpressions.toLocaleString('en-IN')}</strong> impressions for this Ad Type.`; },
    processRegistration() { const name = document.getElementById('adv-name').value.trim(); const whatsapp = document.getElementById('adv-whatsapp').value.trim(); if (!name || !whatsapp) { alert('Please fill in your name and WhatsApp number.'); return; } const profile = { name: name, businessName: document.getElementById('adv-businessName').value.trim(), whatsapp: whatsapp, campaigns: [] }; localStorage.setItem('advertiserProfile', JSON.stringify(profile)); this.showSection('planSection'); },
    async submitAdRequest() { 
        const adTitle = document.getElementById('adv-adTitle').value.trim();
        const adLink = document.getElementById('adv-adLink').value.trim();
        const contactWhatsapp = document.getElementById('adv-contactWhatsapp').value.trim();
        if (!adTitle || !adLink || !contactWhatsapp) {
            alert('Please fill out all ad details.');
            return;
        }
        const plan = JSON.parse(document.getElementById('selectedPlanData').value);
        const adType = document.getElementById('adv-adType').value;
        const finalImpressions = plan.impressions[adType];
        const userProfile = JSON.parse(localStorage.getItem('advertiserProfile'));

        const newCampaignRequest = {
            advertiserName: userProfile.name,
            advertiserBusiness: userProfile.businessName,
            advertiserWhatsapp: userProfile.whatsapp,
            planName: plan.name,
            planCost: plan.cost,
            title: adTitle,
            description: document.getElementById('adv-adDesc').value.trim(),
            cta: document.getElementById('adv-cta').value,
            link: adLink,
            adType: adType,
            contactWhatsapp: contactWhatsapp,
            targetImpressions: finalImpressions,
            submittedAt: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'pending'
        };

        try {
            await db.collection('advertiserCampaignRequests').add(newCampaignRequest);

            userProfile.campaigns.push(newCampaignRequest); 
            localStorage.setItem('advertiserProfile', JSON.stringify(userProfile));
            
            this.sendWhatsAppNotification(userProfile, newCampaignRequest); 
            document.getElementById('adSubmissionForm').reset();
            alert('Request Submitted! Your request has been sent for approval.');
            this.showDashboard(userProfile);

        } catch (error) {
            console.error("Error submitting ad request to Firebase:", error);
            alert("There was an error submitting your request. Please try again.");
        }
    },
    showDashboard(profile) { document.getElementById('welcomeMessage').innerText = `Welcome back, ${profile.name}!`; const container = document.getElementById('campaignListContainer'); container.innerHTML = ''; if (profile.campaigns && profile.campaigns.length > 0) { profile.campaigns.forEach((campaign, index) => { const card = document.createElement('div'); card.className = 'campaign-item-card'; card.onclick = () => this.showCampaignDetails(index); card.innerHTML = `<div><h5>${campaign.title}</h5><p>${campaign.planName} Plan - ${Number(campaign.targetImpressions || campaign.finalImpressions).toLocaleString('en-IN')} Impressions</p></div><div class="arrow">›</div>`; container.appendChild(card); }); } else { container.innerHTML = `<p style="text-align:center; color: var(--text-secondary);">You have no active campaigns. Click 'Add New Plan' to get started.</p>`; } this.showSection('dashboardSection'); },
    showCampaignDetails(index) { const profile = JSON.parse(localStorage.getItem('advertiserProfile')); const campaign = profile.campaigns[index]; const adTypeMap = { 'banner': 'Banner Ad', 'image_5s': '5-Sec Image Ad', 'video': 'Video Ad' }; document.getElementById('detailCampaignTitle').innerText = campaign.title; document.getElementById('detailCampaignPlan').innerText = `${campaign.planName} Plan - ₹${Number(campaign.planCost).toLocaleString('en-IN')}`; document.getElementById('detailAdType').innerText = adTypeMap[campaign.adType]; const maxImpressions = Number(campaign.targetImpressions || campaign.finalImpressions); const impressions = Math.floor(Math.random() * (maxImpressions * 0.4) + (maxImpressions * 0.1)); const clicks = Math.floor(impressions * (Math.random() * (0.05 - 0.01) + 0.01)); const ctr = impressions > 0 ? ((clicks / impressions) * 100).toFixed(2) : "0.00"; document.getElementById('detailFinalImpressions').innerText = impressions.toLocaleString('en-IN'); document.getElementById('detailClickCount').innerText = `${clicks} (${ctr}%)`; const locations = ['Mumbai, MH', 'Delhi, DL', 'Bengaluru, KA', 'Pune, MH', 'Hyderabad, TS', 'Chennai, TN']; document.getElementById('detailGeoData').innerHTML = [...locations].sort(() => 0.5 - Math.random()).slice(0, 4).join('<br>'); this.showSection('campaignDetailSection'); },
    createNewAd() { this.showSection('planSection'); },
    goBackToDashboard() { 
        const userProfile = JSON.parse(localStorage.getItem('advertiserProfile'));
        if (userProfile) {
            this.showDashboard(userProfile);
        } else {
            this.showSection('registrationSection');
        }
    },
    resetUser() { if (confirm('Are you sure you want to reset? This will clear your profile.')) { localStorage.removeItem('advertiserProfile'); this.showSection('registrationSection'); } },
    sendWhatsAppNotification(profile, campaign) { 
        const adminWhatsAppNumber = "7390928912"; 
        const adTypeMap = { 'banner': 'Banner Ad', 'image_5s': '5-Sec Image Ad', 'video': 'Video Ad' }; const message = `*🔥 New Ad Campaign Request*\n*👤 User Info:*\nName: ${profile.name}\nBusiness: ${profile.businessName || 'N/A'}\nProfile WA: ${profile.whatsapp}\n*📞 Campaign Contact WA:*\n${campaign.contactWhatsapp}\n*📦 Campaign Details:*\nPlan: *${campaign.planName}* (₹${Number(campaign.planCost).toLocaleString('en-IN')})\nAd Type: *${adTypeMap[campaign.adType]}*\nTarget Impressions: *${Number(campaign.targetImpressions || campaign.finalImpressions).toLocaleString('en-IN')}*\n*📢 Ad Content:*\nTitle: ${campaign.title}\nLink: ${campaign.link}\nRequest needs manual approval.`; const whatsappUrl = `https://wa.me/${adminWhatsAppNumber}?text=${encodeURIComponent(message.trim())}`; console.log("Admin Notification URL:", whatsappUrl); window.open(whatsappUrl, '_blank'); },
    applyCode() { const code = document.getElementById('uniqueCodeInput').value.trim(); if (!code) { alert('Please enter your unique ID.'); return; } const userProfile = JSON.parse(localStorage.getItem('advertiserProfile')); if (userProfile && userProfile.name) { this.showDashboard(userProfile); } else { alert('Invalid Unique ID. Please register if you are a new user.'); this.showSection('registrationSection'); } }
};

function initializeAdPerformanceTracker() {
    const container = document.querySelector('#advertisement-screen .container');
    if (!container) return;

    if (document.getElementById('adPerformanceSection')) return;

    const performanceSection = document.createElement('div');
    performanceSection.id = 'adPerformanceSection';
    performanceSection.className = 'section';
    
    performanceSection.innerHTML = `
        <div class="card">
            <h2>Track Ad Performance</h2>
            <h3>Enter your Ad ID (Password) to see its performance stats.</h3>
            <div class="form-group">
                <label for="ad-performance-id">Ad ID (Password)</label>
                <input type="text" id="ad-performance-id" placeholder="Enter the unique Ad ID">
            </div>
            <button class="btn" onclick="fetchAdStats()">Get Performance Stats</button>
            <div id="ad-performance-results" style="margin-top: 20px;"></div>
        </div>
    `;

    const dashboardSection = document.getElementById('dashboardSection');
    if (dashboardSection) {
        dashboardSection.insertAdjacentElement('afterend', performanceSection);
    } else {
        container.appendChild(performanceSection);
    }

    const dashboardCard = dashboardSection.querySelector('.card');
    if (dashboardCard && !document.getElementById('track-perf-btn')) {
        const trackButton = document.createElement('button');
        trackButton.id = 'track-perf-btn';
        trackButton.className = 'btn btn-secondary';
        trackButton.textContent = 'Track Ad Performance';
        trackButton.onclick = () => advertiserFunctions.showSection('adPerformanceSection');
        dashboardCard.insertAdjacentElement('beforebegin', trackButton);
    }
}

async function fetchAdStats() {
    const adId = document.getElementById('ad-performance-id').value.trim();
    const resultsContainer = document.getElementById('ad-performance-results');
    if (!adId) {
        alert('Please enter an Ad ID.');
        return;
    }

    resultsContainer.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';

    try {
        const statDoc = await db.collection('advertisementStats').doc(adId).get();

        if (!statDoc.exists) {
            resultsContainer.innerHTML = '<p class="static-message">No performance data found for this Ad ID. Data will appear here after users start interacting with your ad.</p>';
            return;
        }

        const stats = statDoc.data();
        const closedCount = stats.closedCount || 0;
        
        let resultsHtml = `<h4 style="margin-bottom: 10px;">Performance for Ad: ${adId}</h4>`;
        resultsHtml += `<p style="font-size: 1.2em;">Total Times Closed by User: <strong style="color: var(--primary-neon);">${closedCount}</strong></p>`;
        
        resultsContainer.innerHTML = resultsHtml;

    } catch (error) {
        console.error("Error fetching ad stats:", error);
        resultsContainer.innerHTML = `<p class="static-message" style="color: var(--error-red);">Error fetching data. Reason: ${error.message}. Please check Firestore Rules.</p>`;
    }
}


function initializeAdvertisementPage() {
    advertiserFunctions.populatePlans();
    const userProfile = JSON.parse(localStorage.getItem('advertiserProfile'));
    
    initializeAdPerformanceTracker(); 

    if (userProfile && userProfile.name) {
        advertiserFunctions.showDashboard(userProfile);
    } else {
        advertiserFunctions.showSection('registrationSection');
    }
}
// =======================================================
// === ADVERTISER DASHBOARD LOGIC - END ===
// =======================================================

// =======================================================
// === REPORT & VIEW COUNT LOGIC - START ===
// =======================================================
function initializeReportScreen() {
    const screen = document.getElementById('report-screen');
    if (!screen) return;
    screen.innerHTML = `
        <div class="screen-header">
            <div class="header-icon-left haptic-trigger" onclick="navigateBack()"><i class="fas fa-arrow-left"></i></div>
            <span class="header-title">Submit a Report</span>
        </div>
        <div id="report-content">
            <div class="form-group">
                <label for="report-text">Describe your issue</label>
                <textarea id="report-text" rows="10" placeholder="Please provide as much detail as possible..."></textarea>
            </div>
            <button class="continue-btn haptic-trigger" onclick="submitReport()">Submit Report</button>
        </div>
    `;
}

async function submitReport() {
    const reportText = document.getElementById('report-text').value.trim();
    if (!reportText) {
        alert("Please describe the issue before submitting.");
        return;
    }
    const button = document.querySelector('#report-content .continue-btn');
    button.disabled = true;
    button.textContent = "Submitting...";

    try {
        await db.collection('reports').add({
            reporterUid: appState.currentUser.uid, 
            reporterName: appState.currentUser.name,
            reportText: reportText,
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            status: 'new'
        });
        alert("Report submitted successfully. We will look into it shortly.");
        navigateBack();
    } catch (error) {
        console.error("Error submitting report:", error);
        alert("Failed to submit report. Please try again. Error: " + error.message);
    } finally {
        button.disabled = false;
        button.textContent = "Submit Report";
    }
}

function startVideoViewTracker(videoId, type) {
    if (appState.videoWatchTrackers[videoId] && appState.videoWatchTrackers[videoId].viewed) {
        return;
    }
    stopVideoViewTracker(videoId);
    appState.videoWatchTrackers[videoId] = { timer: null, watchedSeconds: 0, viewed: false };

    const targetSeconds = type === 'long' ? 120 : 20; 
    
    appState.videoWatchTrackers[videoId].timer = setInterval(() => {
        const tracker = appState.videoWatchTrackers[videoId];
        if (tracker) {
            tracker.watchedSeconds++;
            if (tracker.watchedSeconds >= targetSeconds && !tracker.viewed) {
                tracker.viewed = true;
                incrementCustomViewCount(videoId);
                stopVideoViewTracker(videoId);
            }
        }
    }, 1000);
}

function stopVideoViewTracker(videoId) {
    if (appState.videoWatchTrackers[videoId] && appState.videoWatchTrackers[videoId].timer) {
        clearInterval(appState.videoWatchTrackers[videoId].timer);
        appState.videoWatchTrackers[videoId].timer = null;
    }
}

async function incrementCustomViewCount(videoId) {
    try {
        const videoRef = db.collection('videos').doc(videoId);
        await videoRef.update({ customViewCount: firebase.firestore.FieldValue.increment(1) });
        console.log(`Custom view counted for video: ${videoId}`);
        
        const videoCard = document.querySelector(`.long-video-card[data-video-id='${videoId}']`) || document.querySelector(`.video-slide[data-video-id='${videoId}']`);
        if (videoCard) {
            const countElement = videoCard.querySelector('[data-action="view"] .count');
            if (countElement) {
                const currentCount = parseInt(countElement.innerText.replace(/[^\d]/g, '')) || 0;
                countElement.innerText = formatNumber(currentCount + 1);
            }
        }
    } catch (error) {
        console.error("Error incrementing custom view count:", error);
    }
}
// =======================================================
// === REPORT & VIEW COUNT LOGIC - END ===
// =======================================================


document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.header-icon-left').forEach(btn => {
        if (!btn.closest('#history-top-bar') && !btn.closest('#creator-diamond-page-screen .screen-header')) {
            btn.onclick = () => navigateBack();
        }
    });
    const creatorBackBtn = document.querySelector('#creator-diamond-page-screen .header-icon-left');
    if (creatorBackBtn) {
        creatorBackBtn.onclick = () => navigateBack();
    }

    document.getElementById('navigate-to-payment-btn')?.addEventListener('click', () => navigateTo('payment-screen'));
    document.getElementById('navigate-to-diamond-btn')?.addEventListener('click', () => navigateTo('diamond-members-screen'));
    document.getElementById('navigate-to-advertisement-btn')?.addEventListener('click', () => navigateTo('advertisement-screen'));
    
    const sidebar = document.getElementById('main-sidebar');
    if (sidebar) {
        const reportButton = document.createElement('button');
        reportButton.id = 'navigate-to-report-btn';
        reportButton.className = 'sidebar-option haptic-trigger';
        reportButton.innerHTML = `<i class="fas fa-flag" style="margin-right: 10px;"></i>Report`;
        reportButton.onclick = () => navigateTo('report-screen');
        const adButton = document.getElementById('navigate-to-advertisement-btn');
        if (adButton && adButton.nextSibling) {
            sidebar.insertBefore(reportButton, adButton.nextSibling);
        } else {
            sidebar.appendChild(reportButton);
        }
    }
    
    document.getElementById('ad-close-btn')?.addEventListener('click', hidePriorityAd);
    initializeApp();
    const getStartedBtn = document.getElementById('get-started-btn');
    if (getStartedBtn) {
        getStartedBtn.classList.add('haptic-trigger');
        getStartedBtn.addEventListener('click', startAppLogic);
    }

    // सभी बटनों पर क्लिक करने पर विज्ञापन ट्रिगर होगा
    if (appContainer) {
        appContainer.addEventListener('click', (event) => { 
            userHasInteracted = true; 
            
            if (event.target.closest('.haptic-trigger')) {
                handleUserInteractionForAds();
                provideHapticFeedback(); 
            }
        });
    }

    initializeMessagingInterface();

    document.getElementById('home-menu-icon')?.addEventListener('click', () => {
        document.getElementById('main-sidebar').classList.add('open');
        document.getElementById('sidebar-overlay').classList.add('open');
    });
    document.getElementById('long-video-menu-icon')?.addEventListener('click', () => {
        document.getElementById('main-sidebar').classList.add('open');
        document.getElementById('sidebar-overlay').classList.add('open');
    });
    document.getElementById('close-sidebar-btn')?.addEventListener('click', () => {
        document.getElementById('main-sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('open');
    });
    document.getElementById('sidebar-overlay')?.addEventListener('click', () => {
        document.getElementById('main-sidebar').classList.remove('open');
        document.getElementById('sidebar-overlay').classList.remove('open');
    });

    document.getElementById('upload-short-video-btn')?.addEventListener('click', () => openUploadDetailsModal('short'));
    document.getElementById('upload-long-video-btn')?.addEventListener('click', () => openUploadDetailsModal('long'));

    const uploadContainerNew = document.querySelector('#upload-screen .upload-container-new');
    if (uploadContainerNew) {
        const earnsureBtn = document.getElementById('earnsure-btn');
        if (earnsureBtn) {
            earnsureBtn.className = 'upload-action-button haptic-trigger';
            earnsureBtn.style.backgroundColor = '#4CAF50';
            earnsureBtn.addEventListener('click', () => {
                navigateTo('earnsure-screen');
            });
        }
        const uploadScreenAdContainer = document.getElementById('upload-screen-ad-container');
        if (uploadScreenAdContainer) {
            injectEarnsureAd('upload-screen-ad-container');
        }
    }

    document.getElementById('category-selector-display')?.addEventListener('click', toggleCategoryOptions);
    document.getElementById('send-comment-btn')?.addEventListener('click', postComment);
    document.getElementById('comment-input')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') postComment(); });
    document.getElementById('audio-issue-ok-btn')?.addEventListener('click', closeAudioIssuePopup);
    document.getElementById('close-description-btn')?.addEventListener('click', closeDescriptionModal);

    document.getElementById('long-video-search-btn')?.addEventListener('click', performLongVideoSearch);
    document.getElementById('long-video-search-input')?.addEventListener('keypress', (e) => { if (e.key === 'Enter') performLongVideoSearch(); });
    document.getElementById('long-video-history-btn')?.addEventListener('click', () => navigateTo('history-screen'));
    document.getElementById('back-from-history-btn')?.addEventListener('click', () => navigateBack());

    document.getElementById('haptic-toggle-input')?.addEventListener('change', (e) => saveHapticPreference(e.target.checked));
    document.getElementById('profile-your-zone-btn')?.addEventListener('click', () => navigateTo('your-zone-screen'));
    document.getElementById('profile-show-shorts-btn')?.addEventListener('click', () => toggleProfileVideoView('short'));
    document.getElementById('profile-show-longs-btn')?.addEventListener('click', () => toggleProfileVideoView('long'));
    
    document.getElementById('more-function-btn')?.addEventListener('click', () => {
        document.getElementById('more-function-menu').classList.toggle('open');
    });
    document.getElementById('rotate-video-btn')?.addEventListener('click', toggleFullscreenMode);
    document.getElementById('more-videos-btn')?.addEventListener('click', toggleCreatorVideoList);


    loadHapticPreference();
    renderCategories();
    renderCategoriesInBar();
});
