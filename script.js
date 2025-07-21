
/* ================================================= */
/* === Shubhzone App Script (Code 2) - FINAL v5.5 === */
/* === MODIFIED AS PER USER REQUEST - JULY 2025   === */
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


// =======================================================================
// ★★★ ADVERTISEMENT LOGIC - START (v5.1) ★★★
// =======================================================================

/**
 * एक सामान्य फ़ंक्शन जो दिए गए कंटेनर में विज्ञापन स्क्रिप्ट को इंजेक्ट करता है।
 * @param {HTMLElement} container - वह HTML एलिमेंट जिसमें विज्ञापन डालना है।
 * @param {string} optionsScriptContent - `atOptions` वाला स्क्रिप्ट का टेक्स्ट।
 * @param {string} invokeScriptSrc - `invoke.js` वाली स्क्रिप्ट का URL।
 * @returns {Promise<boolean>} - विज्ञापन लोड होने पर true या विफल होने पर false रिजॉल्व करता है।
 */
function injectAdScript(container, optionsScriptContent, invokeScriptSrc) {
    return new Promise((resolve) => {
        if (!container) {
            console.warn("[AD] Ad container not found. Cannot inject ad.");
            return resolve(false);
        }
        container.innerHTML = ''; // पुराने विज्ञापन को साफ़ करें

        const innerDiv = document.createElement('div');
        container.appendChild(innerDiv);

        const adOptionsScript = document.createElement('script');
        adOptionsScript.type = 'text/javascript';
        adOptionsScript.text = optionsScriptContent;

        const adInvokeScript = document.createElement('script');
        adInvokeScript.type = 'text/javascript';
        adInvokeScript.src = invokeScriptSrc;
        adInvokeScript.async = true;

        adInvokeScript.onload = () => {
            console.log(`[AD] Script loaded successfully from: ${invokeScriptSrc}`);
            setTimeout(() => {
                if(container.innerHTML.length > 20 || container.querySelector('iframe')) {
                   resolve(true);
                }
            }, 500);
        };
        adInvokeScript.onerror = (err) => {
            console.error(`[AD] Script failed to load from: ${invokeScriptSrc}`, err);
            container.innerHTML = '<div style="color: var(--text-secondary); font-size: 0.8em;">Ad failed to load</div>';
            resolve(false);
        };

        container.appendChild(adOptionsScript);
        container.appendChild(adInvokeScript);
    });
}

/**
 * 300x250 बैनर विज्ञापन को इंजेक्ट करता है।
 * @param {HTMLElement} container - विज्ञापन के लिए कंटेनर।
 */
async function showMainBannerAd(container) {
    if (!container) return;
    
    container.style.display = 'flex';
    container.style.justifyContent = 'center';
    container.style.alignItems = 'center';
    
    const bannerOptions = `atOptions = {'key' : '5cf688a48641e2cfd0aac4e4d4019604', 'format' : 'iframe', 'height' : 250, 'width' : 300, 'params' : {}};`;
    const bannerSrc = "//www.highperformanceformat.com/5cf688a48641e2cfd0aac4e4d4019604/invoke.js";
    
    console.log('[AD] Injecting main banner ad into:', container.id || container.className);
    await injectAdScript(container, bannerOptions, bannerSrc);
}


/**
 * ★★★ नया फ़ंक्शन: वीडियो फ़ीड में विज्ञापन स्लाइड इंजेक्ट करता है ★★★
 */
function injectAdSlideScript(containerId) {
    const mainContainer = document.getElementById(containerId);
    if (!mainContainer) {
        console.error(`[AD] Ad slide container #${containerId} not found.`);
        return;
    }
    
    mainContainer.innerHTML = '<div class="loader"></div>';

    const primaryAdContainerId = 'container-f218d914c870fc85f6dd64b9c8c31249';
    const primaryAdDiv = document.createElement('div');
    primaryAdDiv.id = primaryAdContainerId;

    const primaryAdScript = document.createElement('script');
    primaryAdScript.async = true;
    primaryAdScript.setAttribute('data-cfasync', 'false');
    primaryAdScript.src = '//pl27114897.profitableratecpm.com/f218d914c870fc85f6dd64b9c8c31249/invoke.js';
    
    mainContainer.appendChild(primaryAdScript);
    mainContainer.appendChild(primaryAdDiv);

    setTimeout(() => {
        const loadedAdContent = mainContainer.querySelector(`#${primaryAdContainerId}`);
        if (!loadedAdContent || loadedAdContent.innerHTML.trim() === '' || loadedAdContent.offsetHeight < 50) {
            console.warn('[AD] Primary Native Banner failed to load. Injecting fallback banner.');
            mainContainer.innerHTML = '';
            showMainBannerAd(mainContainer);
        } else {
            console.log('[AD] Primary Native Banner loaded successfully.');
        }
    }, 3000);
}


/**
 * ★ बदलाव: लॉन्ग वीडियो प्लेयर पर विज्ञापन का प्रबंधन करता है।
 */
function manageLongVideoPlayerBanner(action) {
    const playerWrapper = document.querySelector('#creator-page-long-view .main-video-card');
    if (!playerWrapper) return;

    let adContainer = document.getElementById('in-player-timed-ad');

    if (!adContainer) {
        adContainer = document.createElement('div');
        adContainer.id = 'in-player-timed-ad';
        const adSlot = document.createElement('div');
        adSlot.style.width = '300px';
        adSlot.style.height = '250px';
        const closeBtn = document.createElement('span');
        closeBtn.innerHTML = '&times;';
        closeBtn.className = 'in-player-ad-close-btn';
        closeBtn.onclick = (e) => {
            e.stopPropagation();
            adContainer.style.display = 'none';
        };
        adContainer.appendChild(adSlot);
        adContainer.appendChild(closeBtn);
        playerWrapper.appendChild(adContainer);
        showMainBannerAd(adSlot);
    }
    
    const isRotated = playerWrapper.closest('.main-video-card-wrapper')?.classList.contains('rotated');

    if (action === 'show' && !isRotated) {
        adContainer.style.display = 'flex';
    } else if (action === 'hide' || isRotated) {
        adContainer.style.display = 'none';
    }
}


/**
 * ★★★ नया: विज्ञापन अनुक्रम से अगला विज्ञापन दिखाता है।
 */
function triggerAdDisplay() {
    const { sequence, currentIndex } = appState.adState.fullscreenAd;
    const adType = sequence[currentIndex];

    console.log(`[AD] Triggering Ad Display. Type: ---> ${adType.toUpperCase()} <---`);

    // बाहरी लिंक पर जाने से पहले localStorage में स्थिति सहेजने की आवश्यकता नहीं है,
    // क्योंकि अब navigateTo फंक्शन यह काम कर रहा है।

    switch (adType) {
        case 'direct':
            console.log("[AD] Attempting to open Direct Link...");
            const newWindow = window.open('https://otieu.com/4/9583472', '_blank');
            if (!newWindow || newWindow.closed || typeof newWindow.closed == 'undefined') {
                console.warn("[AD] Direct Link was blocked by the browser's popup blocker.");
            } else {
                console.log("[AD] Direct Link opened successfully.");
            }
            break;
        
        case 'social':
            console.log("[AD] Injecting Social Bar script...");
            const socialScript = document.createElement('script');
            socialScript.type = 'text/javascript';
            socialScript.src = '//decreaselackadmit.com/9b/9b/d0/9b9bd0548874dd7f16f6f50929864be9.js';
            document.body.appendChild(socialScript);
            break;

        case 'interstitial':
            console.log("[AD] Injecting Interstitial script...");
            const interstitialScript = document.createElement('script');
            interstitialScript.src = 'https://groleegni.net/401/9572500';
            try {
                (document.body || document.documentElement).appendChild(interstitialScript);
            } catch(e) {
                console.error("[AD] Interstitial ad injection failed:", e);
            }
            break;
    }

    appState.adState.fullscreenAd.currentIndex = (currentIndex + 1) % sequence.length;
}


/**
 * ★★★ नया: विज्ञापन अनुरोध पॉपअप दिखाता है।
 */
function showAdRequestPopup() {
    const isAnyModalActive = document.querySelector('.modal-overlay.active, .comments-modal-overlay.active');
    if (isAnyModalActive) {
        console.log("[AD POPUP] Another modal is active. Skipping ad request popup.");
        return;
    }

    let popup = document.getElementById('ad-request-popup');
    if (!popup) {
        popup = document.createElement('div');
        popup.id = 'ad-request-popup';
        popup.className = 'modal-overlay';
        popup.style.zIndex = '9998';
        popup.innerHTML = `
            <div class="modal-content ad-request-content">
                <div class="ad-popup-header"><i class="fas fa-coins popup-icon"></i><h3>Coin Opportunity!</h3></div>
                <p class="ad-popup-description">Watch an ad to support the platform and earn progress towards a <strong>Viewer Coin</strong>.</p>
                <div class="ad-popup-reward-info">Accept <strong>5</strong> ad requests to earn <strong>1 <i class="fas fa-coins"></i></strong></div>
                <div class="ad-popup-warning"><strong style="color: var(--error-red);"><i class="fas fa-exclamation-triangle"></i> Warning:</strong> If you cancel, <strong>5 Viewer Coins</strong> will be deducted.</div>
                <div class="ad-popup-actions">
                    <button id="ad-request-cancel-btn" class="popup-btn cancel-btn haptic-trigger"><i class="fas fa-times"></i> Cancel</button>
                    <button id="ad-request-accept-btn" class="popup-btn accept-btn haptic-trigger"><i class="fas fa-check"></i> Accept</button>
                </div>
            </div>`;
        document.body.appendChild(popup);
        document.getElementById('ad-request-accept-btn').addEventListener('click', handleAcceptAdRequest);
        document.getElementById('ad-request-cancel-btn').addEventListener('click', handleCancelAdRequest);
    }

    const cancelButton = document.getElementById('ad-request-cancel-btn');
    cancelButton.disabled = appState.currentUser.viewerCoins < 5;
    cancelButton.style.cursor = appState.currentUser.viewerCoins < 5 ? 'not-allowed' : 'pointer';
    cancelButton.style.opacity = appState.currentUser.viewerCoins < 5 ? '0.5' : '1';
    cancelButton.title = appState.currentUser.viewerCoins < 5 ? "You need at least 5 coins to cancel." : "";
    
    popup.classList.add('active');
}


/**
 * ★★★ नया: विज्ञापन अनुरोध स्वीकार करने को संभालता है।
 */
async function handleAcceptAdRequest() {
    document.getElementById('ad-request-popup').classList.remove('active');
    triggerAdDisplay();
    appState.currentUser.tempState.acceptedAds += 1;
    console.log(`[COIN] Ad accepted. Count is now: ${appState.currentUser.tempState.acceptedAds}`);

    if (appState.currentUser.tempState.acceptedAds >= 5) {
        console.log('[COIN] 5 ads accepted. Awarding 1 viewer coin.');
        const userRef = db.collection('users').doc(appState.currentUser.uid);
        try {
            await userRef.update({ viewerCoins: firebase.firestore.FieldValue.increment(1) });
            appState.currentUser.viewerCoins += 1;
            appState.currentUser.tempState.acceptedAds = 0;
            alert("Congratulations! You've earned 1 Viewer Coin!");
        } catch (error) {
            console.error("Error awarding viewer coin:", error);
            alert("Could not award coin. Please try again.");
            appState.currentUser.tempState.acceptedAds -= 1;
        }
    }
}

/**
 * ★★★ नया: विज्ञापन अनुरोध रद्द करने को संभालता है।
 */
async function handleCancelAdRequest() {
    document.getElementById('ad-request-popup').classList.remove('active');
    if (appState.currentUser.viewerCoins < 5) {
        alert("You do not have enough coins to cancel.");
        return;
    }

    console.log('[COIN] User chose to cancel. Deducting 5 viewer coins.');
    const userRef = db.collection('users').doc(appState.currentUser.uid);
    try {
        await userRef.update({ viewerCoins: firebase.firestore.FieldValue.increment(-5) });
        appState.currentUser.viewerCoins -= 5;
        alert("5 Viewer Coins have been deducted as a cancellation fee.");
    } catch (error) {
        console.error("Error deducting viewer coins:", error);
        alert("Could not process cancellation fee. Please try again.");
    }
}


/**
 * ★★★ संशोधित: विज्ञापन अनुरोध अंतराल सेट करता है।
 */
function setupAdRequestInterval() {
    if (appState.adState.timers.fullscreenAdLoop) {
        clearInterval(appState.adState.timers.fullscreenAdLoop);
    }
    appState.adState.timers.fullscreenAdLoop = setInterval(showAdRequestPopup, 60000); // 60 सेकंड
}


/**
 * सभी सक्रिय वीडियो-संबंधित विज्ञापन टाइमर्स को साफ़ करता है।
 */
function clearAllAdTimers() {
    const adContainer = document.getElementById('in-player-timed-ad');
    if (adContainer) adContainer.style.display = 'none';
}


// =======================================================================
// ★★★ ADVERTISEMENT LOGIC - END (v5.1) ★★★
// =======================================================================


// ... (Helper Functions, appState, etc. remain the same) ...

// =================================================
// ★★★ Helper Functions - START (यह सेक्शन ज़रूरी है और रहेगा) ★★★
// =================================================

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
    const safeName = (name || 'user').replace(/[^a-zA-Z]/g, '').toLowerCase().substring(0, 4);
    const randomPart = Math.random().toString().substring(2, 6);
    let referralCode = `@${safeName}${randomPart}`;
    while (referralCode.length < 7) {
        referralCode += Math.floor(Math.random() * 10);
    }
    try {
        await db.collection('users').doc(uid).update({ referralCode: referralCode });
        console.log(`Generated Referral Code: ${referralCode}`);
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
// ★★★ Helper Functions - END ★★★
// =================================================

// ऐप का ग्लोबल स्टेट
let appState = {
    currentUser: {
        uid: null, username: "new_user", avatar: "https://via.placeholder.com/120/222/FFFFFF?text=+",
        email: "", name: "", mobile: "", address: "", hobby: "", state: "", country: "",
        referralCode: null, likedVideos: [], 
        friends: [],
        creatorCoins: 0,
        unconvertedCreatorSeconds: 0,
        viewerCoins: 0,
        unconvertedViewerSeconds: 0,
        tempState: { acceptedAds: 0 }
    },
    currentScreen: 'splash-screen',
    navigationStack: ['splash-screen'],
    currentScreenPayload: null,
    allVideos: [], userShortVideos: [], userLongVideos: [], viewingHistory: [],
    uploadDetails: { category: null, audience: 'all', lengthType: 'short' },
    activeComments: { videoId: null, videoOwnerUid: null },
    activeChat: { chatId: null, friendId: null, friendName: null, friendAvatar: null },
    creatorPagePlayers: { short: null, long: null },
    creatorPage: { currentLongVideo: { id: null, uploaderUid: null } },
    adState: {
        timers: { longVideoPlayerBanner: null, fullscreenAdLoop: null },
        fullscreenAd: { sequence: ['direct', 'social', 'interstitial'], currentIndex: 0 },
    },
    appTimeTrackerInterval: null, watchTimeInterval: null,
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

// DOM Elements
const appContainer = document.getElementById('app-container');
const screens = document.querySelectorAll('.screen');
const navItems = document.querySelectorAll('.nav-item');
// ... (अन्य सभी DOM एलिमेंट वेरिएबल्स वैसे ही रहेंगे)
const profileImageInput = document.getElementById('profile-image-input');
const profileImagePreview = document.getElementById('profile-image-preview');
const uploadDetailsModal = document.getElementById('upload-details-modal');
const modalVideoTitle = document.getElementById('modal-video-title');
const modalVideoDescription = document.getElementById('modal-video-description');
const modalVideoHashtags = document.getElementById('modal-video-hashtags');
const modalVideoUrlInput = document.getElementById('modal-video-url');
const modalChannelNameInput = document.getElementById('modal-channel-name');
const modalChannelLinkInput = document.getElementById('modal-channel-link');
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
    hi: `<h4>🌟 आपका अपना वीडियो प्लेटफॉर्म – जहां हर व्यू की क़ीमत है! 🎥💰</h4><hr><p><strong>👀 दर्शकों के लिए (Viewers):</strong></p><p>अगर आप इस ऐप पर वीडियो देखते हैं, तो हर सेकंड का Watch Time रिकॉर्ड होता है। आप जितना ज़्यादा देखेंगे, उतनी ज़्यादा आपकी कमाई (Ad Revenue Share) होगी।</p><p>🎉 अब वीडियो देखना सिर्फ़ मनोरंजन नहीं – कमाई का ज़रिया भी है!</p><hr><p><strong>🎥 क्रिएटर्स के लिए (Creators):</strong></p><p>अगर आप अपना खुद का वीडियो इस प्लेटफ़ॉर्म पर डालते हैं और लोग उसे देखते हैं, तो आपके वीडियो के Watch Time के आधार पर आपको भी कमाई दी जाएगी।</p><p>🛑 <strong>अगर आप किसी और का वीडियो डालते हैं, तो:</strong></p><ul><li>आपको उससे कोई कमाई नहीं मिलेगी।</li><li>लेकिन अगर आप खुद वह वीडियो देखें, तो एक Viewer के रूप में आप कमाई कर सकते हैं।</li></ul><hr><p><strong>🧾 पेमेंट पॉलिसी (Payment Policy):</strong></p><p>🗓️ <strong>हर सोमवार को पेमेंट Apply करें – 24 घंटे का समय!</strong></p><p>अब से, आप हर सोमवार को पूरे दिन (00:00 से 23:59 तक) "Payment Apply" बटन पर क्लिक कर सकते हैं।</p><p>✅ अगर आप सोमवार को अप्लाई नहीं करते, तो उस सप्ताह की कमाई रद्द (forfeit) मानी जाएगी।</p><hr><p><strong>💵 पेमेंट कब मिलेगा?</strong></p><p>पहली बार पेमेंट तब मिलेगा जब आपकी कुल कमाई ₹5000 (लगभग $60 USD) हो जाएगी।</p><p>इसके बाद आप चाहे ₹2 (लगभग $0.02 USD) भी कमाएं, आप उसे कभी भी निकाल सकते हैं।</p><hr><p><strong>💼 ऐप की दो खास विशेषताएं:</strong></p><p>📢 <strong>1. ब्रांड प्रमोशन का मौका</strong></p><p>इस ऐप पर आप अपने ब्रांड, प्रोडक्ट या सर्विस का विज्ञापन कर सकते हैं — वो भी सही टारगेटेड ऑडियंस के सामने।</p><p>📬 <strong>2. सीधे यूज़र से संपर्क करें</strong></p><p>अगर आपको किसी यूज़र से बात करनी है – सुझाव, फीडबैक या काम के लिए – तो आप ऐप के ज़रिए सीधे मैसेज या संपर्क कर सकते हैं।</p><hr><p><strong>✅ वेरिफिकेशन के नियम:</strong></p><p>अगर आप अपने वीडियो से क्रिएटर के रूप में कमाई करना चाहते हैं, तो आपको:</p><ol><li>अपनी कम से कम 5 यूट्यूब वीडियो में ऐप का नाम या लिंक (Shout-out) देना होगा।</li><li>इससे हम यह पुष्टि कर सकेंगे कि चैनल आपका है।</li></ol><hr><p><strong>🔒 ईमानदारी और पारदर्शिता हमारी प्राथमिकता है</strong></p><p>हम चाहते हैं कि हर Viewer और Creator को उनका पूरा हक़ मिले — बिना किसी धोखे और बिना किसी मुश्किल के।</p><blockquote>"कमाई और विश्वास का रिश्ता तभी टिकता है, जब दोनों तरफ से इज्ज़त हो।"</blockquote><hr><p><strong>📩 संपर्क करें:</strong></p><p>कोई सवाल या सहायता चाहिए? ईमेल करें 👉 udbhavscience12@gmail.com</p><hr><h4>🌈 आइए, साथ मिलकर कुछ बड़ा बनाएं।</h4><p>आप देखिए, कमाइए, प्रमोट कीजिए, जुड़िए — यह मंच आपका है। 🚀💖</p>`,
    en: `<h4>🌟 Your Own Video Platform – Where Every View Has Value! 🎥💰</h4><hr><p><strong>👀 For Viewers:</strong></p><p>When you watch videos on this app, every second of your Watch Time is recorded. The more you watch, the more you earn (Ad Revenue Share).</p><p>🎉 Watching videos is no longer just entertainment — it’s also a way to earn!</p><hr><p><strong>🎥 For Creators:</strong></p><p>If you upload your own videos to this platform and people watch them, you earn money based on the watch time of those videos.</p><p>🛑 <strong>But if you upload someone else’s video:</strong></p><ul><li>You won’t earn any revenue from it.</li><li>However, if you watch it yourself, you will still earn as a viewer.</li></ul><hr><p><strong>🧾 Payment Policy:</strong></p><p>🗓️ <strong>Apply for Payment Every Monday – Full 24 Hours!</strong></p><p>You can apply for payment every Monday, anytime between 00:00 and 23:59 (24 hours window).</p><p>✅ If you do not apply on Monday, the earnings for that week will be forfeited.</p><hr><p><strong>💵 When Will You Get Paid?</strong></p><p>Your first payment will be released only when your total earnings reach ₹5000 (approx. $60 USD).</p><p>After that, even if you earn just ₹2 (approx. $0.02 USD), you can withdraw it anytime.</p><hr><p><strong>💼 Two Special Features of This App:</strong></p><p>📢 <strong>1. Promote Your Own Brand</strong></p><p>You can advertise your brand, product, or services directly on this platform — to a real, engaged audience who already loves content.</p><p>📬 <strong>2. Contact Any User Directly</strong></p><p>Need to reach out to a user for collaboration, feedback, or business? The app allows you to directly contact any user via messaging.</p><hr><p><strong>✅ Verification Rules for Creators:</strong></p><p>If you want to earn revenue as a creator, you must:</p><ol><li>Give a shout-out (mention/link to this app) in at least 5 videos on your YouTube channel.</li><li>This helps us verify that the channel is genuinely yours.</li></ol><hr><p><strong>🔒 Honesty & Transparency Come First</strong></p><p>We are committed to giving every viewer and creator their fair share, with zero cheating and zero complications.</p><blockquote>"True earnings and trust grow only when there's respect on both sides."</blockquote><hr><p><strong>📩 Need Help? Contact Us:</strong></p><p>Have questions or suggestions? 📧 Email us at: udbhavscience12@gmail.com</p><hr><h4>🌈 Let’s build something great, together.</h4><p>Watch, Earn, Promote, and Connect — This platform is truly yours. 🚀💖</p>`
};
let currentEarnsureLanguage = 'hi';

function activateScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.toggle('active', screen.id === screenId);
    });
    appState.currentScreen = screenId;
}

// <<< ★★★ बदलाव ★★★ >>>
// इस फंक्शन को स्थायी मेमोरी (`localStorage`) का उपयोग करने के लिए अपडेट किया गया है।
function navigateTo(nextScreenId, payload = null, scrollPosition = 0) {
    if (appState.currentScreen === nextScreenId && !payload) return;

    // हर नेविगेशन पर, वर्तमान स्क्रीन को localStorage में सहेजें।
    // यह बाहरी लिंक से वापस आने पर स्थिति को पुनर्स्थापित करने में मदद करेगा।
    if (nextScreenId !== 'splash-screen' && nextScreenId !== 'information-screen') {
        localStorage.setItem('shubhzone_lastScreen', nextScreenId);
    }
    
    if (appState.navigationStack[appState.navigationStack.length - 1] !== nextScreenId) {
        appState.navigationStack.push(nextScreenId);
    }
    
    // मौजूदा लॉजिक अपरिवर्तित रहता है
    if (appState.currentScreen === 'creator-page-screen' || appState.currentScreen === 'home-screen') clearAllAdTimers();
    if (appState.currentScreen === 'home-screen' && activePlayerId && players[activePlayerId]) pauseActivePlayer();
    if (appState.currentScreen === 'creator-page-screen') {
        if (appState.creatorPagePlayers.short) appState.creatorPagePlayers.short.destroy();
        if (appState.creatorPagePlayers.long) appState.creatorPagePlayers.long.destroy();
        appState.creatorPagePlayers = { short: null, long: null };
    }
    activePlayerId = null;
    
    activateScreen(nextScreenId);
    appState.currentScreenPayload = payload;

    // स्क्रीन के आधार पर विभिन्न फंक्शन को कॉल करना
    if (nextScreenId === 'profile-screen') loadUserVideosFromFirebase();
    if (nextScreenId === 'long-video-screen') setupLongVideoScreen();
    if (nextScreenId === 'history-screen') initializeHistoryScreen();
    if (nextScreenId === 'your-zone-screen') populateYourZoneScreen();
    if (nextScreenId === 'home-screen') setTimeout(() => setupVideoObserver(), 100);
    if (nextScreenId === 'earnsure-screen') initializeEarnsureScreen();
    if (nextScreenId === 'creator-page-screen' && payload && payload.creatorId) initializeCreatorPage(payload.creatorId, payload.startWith, payload.videoId);
    if (nextScreenId === 'advertisement-screen') initializeAdvertisementPage();
    if (nextScreenId === 'credit-screen' && payload && payload.videoId) initializeCreditScreen(payload.videoId);
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
    
    if (appState.currentScreen === 'creator-page-screen') clearAllAdTimers();

    appState.navigationStack.pop();
    const previousScreenId = appState.navigationStack[appState.navigationStack.length - 1];

    if (appState.currentScreen === 'creator-page-screen') {
        if (appState.creatorPagePlayers.short) appState.creatorPagePlayers.short.destroy();
        if (appState.creatorPagePlayers.long) appState.creatorPagePlayers.long.destroy();
        appState.creatorPagePlayers = { short: null, long: null };
        const videoWrapper = document.querySelector('#creator-page-long-view .main-video-card-wrapper');
        if (videoWrapper && videoWrapper.classList.contains('rotated')) {
            videoWrapper.classList.remove('rotated');
        }
    }
    
    navigateTo(previousScreenId); // Use navigateTo to ensure state is saved
}

// <<< ★★★ बदलाव ★★★ >>>
// यह फंक्शन अब `lastScreenToRestore` पैरामीटर लेता है।
async function checkUserProfileAndProceed(user, lastScreenToRestore = null) {
    if (!user) return;
    appState.currentUser.uid = user.uid;
    const userRef = db.collection('users').doc(user.uid);
    const doc = await userRef.get();

    if (doc.exists) {
        let userData = doc.data();
        // ... (मौजूदा userData सेटअप अपरिवर्तित)
        if (!userData.referralCode || !userData.referralCode.startsWith('@')) {
            userData.referralCode = await generateAndSaveReferralCode(user.uid, userData.name);
        }
        userData.likedVideos = userData.likedVideos || [];
        userData.friends = userData.friends || [];
        userData.creatorCoins = userData.creatorCoins || 0;
        userData.unconvertedCreatorSeconds = userData.unconvertedCreatorSeconds || 0;
        userData.viewerCoins = userData.viewerCoins || 0;
        userData.unconvertedViewerSeconds = userData.unconvertedViewerSeconds || 0;
        userData.tempState = { acceptedAds: 0 };
        
        appState.currentUser = { ...appState.currentUser, ...userData };
        const savedHistory = localStorage.getItem('shubhzoneViewingHistory');
        if (savedHistory) {
            appState.viewingHistory = JSON.parse(savedHistory);
        }
        updateProfileUI();
        
        // पुनर्स्थापना का मुख्य लॉजिक
        if (lastScreenToRestore) {
            console.log(`[App Restore] Found last screen in localStorage: ${lastScreenToRestore}. Restoring...`);
            await startAppLogic(lastScreenToRestore);
        } else if (userData.name && userData.state) {
            await startAppLogic(); // सामान्य स्टार्टअप
        } else {
            navigateTo('information-screen');
        }

    } else {
        const initialData = {
            uid: user.uid, name: '', email: user.email || '',
            avatar: user.photoURL || 'https://via.placeholder.com/120/222/FFFFFF?text=+',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            likedVideos: [], friends: [],
            creatorCoins: 0, unconvertedCreatorSeconds: 0,
            viewerCoins: 0, unconvertedViewerSeconds: 0,
            referralCode: await generateAndSaveReferralCode(user.uid, user.displayName || 'user')
        };
        await userRef.set(initialData);
        appState.currentUser = { ...appState.currentUser, ...initialData, tempState: { acceptedAds: 0 } };
        updateProfileUI();
        navigateTo('information-screen');
    }
}

let appInitializationComplete = false;
function initializeApp() {
    if (appInitializationComplete) return;
    appInitializationComplete = true;

    // <<< ★★★ बदलाव ★★★ >>>
    // ऐप शुरू होते ही localStorage को जाँचेगा।
    const lastScreenToRestore = localStorage.getItem('shubhzone_lastScreen');

    auth.onAuthStateChanged(user => {
        if (user) {
            // पुनर्स्थापित करने के लिए स्क्रीन की जानकारी को पास करें।
            checkUserProfileAndProceed(user, lastScreenToRestore);
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
    renderVideoSwiper(shortVideos); 
}

// ... (navItems, profileImageInput, saveAndContinue, etc. functions remain the same) ...

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
        const cloudName = 'dzq7qb6ew';
        const uploadPreset = 'bookswamp_unsigned';
        const url = `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`;
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', uploadPreset);
        try {
            const response = await fetch(url, { method: 'POST', body: formData });
            const data = await response.json();
            if (data.secure_url) userData.avatar = data.secure_url;
            else throw new Error('Image upload failed, no secure_url returned.');
        } catch (error) {
            console.error("Cloudinary avatar upload error:", error);
            alert("Failed to upload profile picture.");
            saveContinueBtn.disabled = false;
            saveContinueBtn.textContent = 'Continue';
            return;
        }
    }

    try {
        await db.collection('users').doc(appState.currentUser.uid).set(userData, { merge: true });
        if (!appState.currentUser.referralCode || !appState.currentUser.referralCode.startsWith('@')) {
            appState.currentUser.referralCode = await generateAndSaveReferralCode(appState.currentUser.uid, name);
        }
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

// ... (बाकी सभी फंक्शन्स जैसे `updateProfileUI`, `openUploadDetailsModal`, `saveNewVideo`, आदि अपरिवर्तित रहेंगे) ...

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
        modalChannelNameInput.value = videoData.channelName || '';
        modalChannelLinkInput.value = videoData.channelLink || '';
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
        modalChannelNameInput.value = '';
        modalChannelLinkInput.value = '';
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
    if (videoId) await saveVideoEdits(videoId);
    else await saveNewVideo();
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
        channelName: modalChannelNameInput.value.trim(),
        channelLink: modalChannelLinkInput.value.trim(),
        category: category,
        audience: appState.uploadDetails.audience || 'all',
        commentsEnabled: commentsToggleInput.checked
    };
    try {
        await db.collection("videos").doc(videoId).update(updatedData);
        alert("Video updated!");
        closeUploadDetailsModal();
        await refreshAndRenderFeed();
        if (appState.currentScreen === 'profile-screen') loadUserVideosFromFirebase();
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

    try {
        const existingVideoSnapshot = await db.collection('videos').where('videoUrl', '==', videoUrlValue).limit(1).get();
        if (!existingVideoSnapshot.empty) {
            alert("This video has already been uploaded. Please upload a different video.");
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
            channelName: modalChannelNameInput.value.trim(),
            channelLink: modalChannelLinkInput.value.trim(),
            videoUrl: videoUrlValue,
            thumbnailUrl: `https://img.youtube.com/vi/${videoUrlValue}/hqdefault.jpg`,
            videoType: 'youtube', videoLengthType: lengthType,
            category, audience: appState.uploadDetails.audience || 'all',
            commentsEnabled: commentsToggleInput.checked,
            likes: 0, commentCount: 0, customViewCount: 0,
        };

        await db.collection("videos").add(videoData);
        alert("Video uploaded!");
        closeUploadDetailsModal();
        await refreshAndRenderFeed();
        navigateTo(lengthType === 'long' ? 'long-video-screen' : 'home-screen');
    } catch (error) {
        console.error("Error uploading video:", error);
        alert("Upload failed. Error: " + error.message);
    } finally {
        modalSaveButton.disabled = false;
        modalSaveButton.textContent = 'Upload Video';
    }
}

// <<< ★★★ बदलाव ★★★ >>>
// यह फंक्शन अब `restoreScreen` पैरामीटर लेता है।
let appStartLogicHasRun = false;
const startAppLogic = async (restoreScreen = null) => {
    if (!restoreScreen && appStartLogicHasRun && appState.currentScreen !== 'splash-screen' && appState.currentScreen !== 'information-screen') {
        return;
    }
    appStartLogicHasRun = true;

    setupAdRequestInterval();

    const getStartedBtn = document.getElementById('get-started-btn');
    const loadingContainer = document.getElementById('loading-container');
    if (getStartedBtn) getStartedBtn.style.display = 'none';
    if (loadingContainer) loadingContainer.style.display = 'flex';
    
    renderCategories();
    renderCategoriesInBar();
    await refreshAndRenderFeed();
    
    // तय करें कि किस स्क्रीन पर जाना है: पुनर्स्थापित स्क्रीन या डिफ़ॉल्ट होम स्क्रीन।
    const screenToNavigate = restoreScreen || 'home-screen';
    
    navigateTo(screenToNavigate);
    
    // <<< यह बहुत महत्वपूर्ण है >>>
    // एक बार स्क्रीन पुनर्स्थापित हो जाने पर, localStorage से कुंजी हटा दें।
    if (restoreScreen) {
        localStorage.removeItem('shubhzone_lastScreen');
    }
};


// ... (बाकी सभी फंक्शन्स जैसे onYouTubeIframeAPIReady, initializePlayers, renderVideoSwiper, etc. अपरिवर्तित रहेंगे) ...
// The rest of the JS code remains exactly the same as you provided in the last turn.
// It is omitted here for brevity, but you should include the full code from the previous response
// from this point onwards.

// ... Paste the rest of your Javascript code here ...

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

    if (videoObserver) {
        videoObserver.disconnect();
    }

    if (!itemsToRender || itemsToRender.length === 0) {
        if (homeStaticMessageContainer) {
            videoSwiper.appendChild(homeStaticMessageContainer);
            homeStaticMessageContainer.style.display = 'flex';
        }
        return;
    }

    if (homeStaticMessageContainer) {
        homeStaticMessageContainer.style.display = 'none';
    }

    let videoCount = 0;
    // ★★★ बदलाव: विज्ञापन काउंटर जोड़ा गया ★★★
    let adCount = 0; 

    itemsToRender.forEach((video) => {
        const slide = document.createElement('div');
        slide.className = 'video-slide';
        slide.dataset.videoId = video.id;
        slide.dataset.uploaderUid = video.uploaderUid;
        slide.dataset.videoType = video.videoType || 'youtube';
        slide.addEventListener('click', (e) => {
            if (e.target.closest('.video-actions-overlay') || e.target.closest('.uploader-info') || e.target.closest('.credit-btn')) return;
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
        const videoLengthTypeForNav = video.videoLengthType !== 'long' ? 'short' : 'long';
        const creatorProfileOnClick = `navigateTo('creator-page-screen', { creatorId: '${video.uploaderUid}', startWith: '${videoLengthTypeForNav}', videoId: '${video.id}' })`;

        slide.innerHTML = `
            <div class="video-preloader" style="background-image: url('${thumbnailUrl}');"><div class="loader"></div></div>
            ${playerHtml}
            <i class="fas fa-heart like-heart-popup"></i>
            <div class="video-meta-overlay">
                <div class="uploader-info" onclick="${creatorProfileOnClick}"><img src="${escapeHTML(video.uploaderAvatar) || 'https://via.placeholder.com/40'}" class="uploader-avatar"><span class="uploader-name">${escapeHTML(video.uploaderUsername) || 'User'}</span></div>
                <p class="video-title">${escapeHTML(video.title) || 'Untitled Video'}</p>
                <button class="credit-btn haptic-trigger" onclick="navigateTo('credit-screen', { videoId: '${video.id}' })">Credit</button>
            </div>
            <div class="video-actions-overlay">
                <div class="action-icon-container" data-action="view">
                    <i class="fas fa-eye icon"></i>
                    <span class="count">${formatNumber(video.customViewCount || 0)}</span>
                </div>
                <div class="action-icon-container haptic-trigger" data-action="creator" onclick="${creatorProfileOnClick}">
                    <i class="fas fa-user-circle icon"></i>
                    <span class="count">Creator</span>
                </div>
                <div class="action-icon-container haptic-trigger" data-action="like" onclick="toggleLikeAction('${video.id}', this.closest('.video-slide'))">
                    <i class="${isLiked ? 'fas' : 'far'} fa-heart icon ${isLiked ? 'liked' : ''}"></i>
                    <span class="count">${formatNumber(video.likes || 0)}</span>
                </div>
                <div class="action-icon-container haptic-trigger ${!video.commentsEnabled ? 'disabled' : ''}" data-action="comment" onclick="${video.commentsEnabled ? `openCommentsModal('${video.id}', '${video.uploaderUid}')` : ''}">
                    <i class="fas fa-comment-dots icon"></i>
                    <span class="count">${formatNumber(video.commentCount || 0)}</span>
                </div>
            </div>`;
        videoSwiper.appendChild(slide);
        videoCount++;

        // ★★★ बदलाव: विज्ञापन जोड़ने की शर्त में adCount < 2 जोड़ा गया ★★★
        if (videoCount > 0 && videoCount % 3 === 0 && adCount < 2) {
            const adSlide = document.createElement('div');
            adSlide.className = 'video-slide native-ad-slide'; 
            
            const adContainerId = `ad-container-feed-${videoCount}`;
            adSlide.innerHTML = `
                <div class="ad-slide-wrapper">
                    <p style="color: var(--text-secondary); font-size: 0.9em; text-align: center; margin-bottom: 10px;">Advertisement</p>
                    <div id="${adContainerId}" class="ad-slot-container"></div>
                </div>`;
            videoSwiper.appendChild(adSlide);

            // ★★★ बदलाव: विज्ञापन काउंटर को बढ़ाया गया ★★★
            adCount++; 

            setTimeout(() => showMainBannerAd(document.getElementById(adContainerId)), 200);
        }
    });

    if (isYouTubeApiReady) {
        initializePlayers();
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
    const visibleSlides = Array.from(videoSwiper.querySelectorAll('.video-slide:not(.native-ad-slide)'));
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
        startWatchTimeTracker();
        startVideoViewTracker(videoId, 'short');
        
        if (userHasInteracted) {
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
    const existingIndex = appState.viewingHistory.findIndex(item => item.id === videoId);
    
    if (existingIndex > -1) {
        appState.viewingHistory.splice(existingIndex, 1);
    }

    appState.viewingHistory.unshift({
        id: videoId,
        watchedAt: new Date().toISOString()
    });

    if (appState.viewingHistory.length > 100) {
        appState.viewingHistory.pop();
    }
    localStorage.setItem('shubhzoneViewingHistory', JSON.stringify(appState.viewingHistory));
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
    
    if (userHasInteracted && typeof player.unMute === 'function' && player.isMuted()) {
        player.unMute();
        console.log(`[Audio] Unmuting video: ${videoId}`);
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
            if (entry.target.classList.contains('native-ad-slide')) {
                return;
            }

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
                const firstVideoSlide = document.querySelector('.video-slide:not(.native-ad-slide)');
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

function logoutUser() {
    if (confirm("Are you sure you want to log out?")) {
        // <<< ★★★ महत्वपूर्ण बदलाव ★★★ >>>
        // लॉगआउट करने से पहले localStorage को साफ़ करें।
        localStorage.removeItem('shubhzone_lastScreen');
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
                <button class="credit-btn-grid haptic-trigger" onclick="navigateTo('credit-screen', { videoId: '${video.id}' })">Credit</button>
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
                <button class="credit-btn-grid haptic-trigger" onclick="navigateTo('credit-screen', { videoId: '${video.id}' })">Credit</button>
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
        navigateTo('creator-page-screen', { 
            creatorId: videoToPlay.uploaderUid, 
            startWith: 'long', 
            videoId: videoToPlay.id 
        });
    } else {
        navigateTo('creator-page-screen', { 
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

    let allLongVideos = fullVideoList.filter(v => v.videoLengthType === 'long');
    
    let carouselVideos = shuffleArray([...allLongVideos]).slice(0, 10);

    if (carouselVideos.length === 0) {
        const placeholderCard = document.createElement('div');
        placeholderCard.className = 'carousel-card placeholder';
        placeholderCard.innerHTML = `<i class="fas fa-film"></i><span>No long videos found</span>`;
        wrapper.appendChild(placeholderCard);
        wrapper.classList.remove('looping');
    } else {
        let displayVideos = [...carouselVideos];
        if (displayVideos.length > 0 && displayVideos.length < 5) {
            displayVideos = [...displayVideos, ...displayVideos, ...displayVideos];
        }

        displayVideos.forEach(video => {
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

    longVideos = shuffleArray(longVideos);

    if (longVideos.length === 0) {
        const placeholderCard = document.createElement('div');
        placeholderCard.className = 'long-video-card placeholder';
        placeholderCard.innerHTML = `
           <div class="long-video-thumbnail"><i class="fas fa-video-slash"></i></div>
           <div class="long-video-info-container">
               <span class="long-video-name">No long videos in this category.</span>
           </div>
        `;
        grid.appendChild(placeholderCard);
    } else {
        longVideos.forEach((video, index) => {
            const card = createLongVideoCard(video);
            grid.appendChild(card);

            // ★★★ बदलाव: विज्ञापन जोड़ने का लॉजिक बदला गया ★★★
            // अब यह केवल एक बार, चौथे वीडियो के बाद विज्ञापन जोड़ेगा।
            if (index === 3) {
                const adContainer = document.createElement('div');
                const adId = `long-video-ad-single`; // Unique ID for the single ad
                adContainer.id = adId;
                adContainer.className = 'long-video-grid-ad';
                grid.appendChild(adContainer);
                
                setTimeout(() => {
                    const adElement = document.getElementById(adId);
                    if (adElement) {
                        showMainBannerAd(adElement);
                    }
                }, 100);
            }
        });
    }
}


function performLongVideoSearch() {
    const input = document.getElementById('long-video-search-input');
    const query = input.value.trim().toLowerCase();
    const longVideos = fullVideoList.filter(v => v.videoLengthType === 'long');
    let results = [];
    if (query) {
        results = longVideos.filter(v => 
            (v.title && v.title.toLowerCase().includes(query)) ||
            (v.uploaderUsername && v.uploaderUsername.toLowerCase().includes(query))
        );
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
    
    const commentOnClick = video.commentsEnabled 
        ? `onclick="event.stopPropagation(); openCommentsModal('${video.id}', '${video.uploaderUid}')"` 
        : 'onclick="event.stopPropagation();"';
    
    card.innerHTML = `
        <div class="long-video-thumbnail" style="background-image: url(${escapeHTML(video.thumbnailUrl)})" onclick="playVideoFromProfile('${video.id}')">
            <div class="long-video-view-count"><i class="fas fa-eye"></i> ${formatNumber(video.customViewCount || 0)}</div>
            <div class="long-video-menu haptic-trigger" onclick="event.stopPropagation(); showLongVideoMenu(event, '${video.id}')"><i class="fas fa-ellipsis-v"></i></div>
            <i class="fas fa-play play-icon-overlay"></i>
        </div>
        <div class="long-video-info-container">
            <div class="long-video-details" onclick="navigateTo('creator-page-screen', { creatorId: '${video.uploaderUid}', startWith: 'long', videoId: '${video.id}' })">
                <span class="long-video-name">${escapeHTML(video.title)}</span>
                <span class="long-video-uploader">${escapeHTML(video.uploaderUsername)}</span>
            </div>
            <div class="long-video-comment-icon haptic-trigger ${!video.commentsEnabled ? 'disabled' : ''}" ${commentOnClick}>
                <i class="fas fa-comment-dots"></i>
                <span>${formatNumber(video.commentCount || 0)}</span>
            </div>
        </div>
        <button class="credit-btn-long-grid haptic-trigger" onclick="navigateTo('credit-screen', { videoId: '${video.id}' })">Credit</button>
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
    const clearButton = document.getElementById('history-date-button'); 
    if (clearButton) {
        clearButton.innerHTML = `<i class="fas fa-trash-alt"></i> Clear All`;
        clearButton.onclick = clearAllHistory;
    }
    renderHistoryShortsScroller();
    renderHistoryLongVideoList();
}


function renderHistoryShortsScroller(filterDate = null) {
    const scroller = document.getElementById('history-shorts-scroller');
    if (!scroller) return;
    scroller.innerHTML = '';

    let historyEntries = appState.viewingHistory;
    if (filterDate) {
        historyEntries = historyEntries.filter(entry => new Date(entry.watchedAt).toISOString().slice(0, 10) === filterDate);
    }
    
    const historyVideos = historyEntries
        .map(entry => fullVideoList.find(v => v.id === entry.id && v.videoLengthType !== 'long'))
        .filter(Boolean);

    if (historyVideos.length === 0) {
        scroller.innerHTML = `<p class="static-message" style="color: var(--text-secondary);">No short video history${filterDate ? ' for this date' : ''}.</p>`;
        return;
    }

    historyVideos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'history-short-card haptic-trigger';
        card.style.backgroundImage = `url(${escapeHTML(video.thumbnailUrl)})`;
        card.innerHTML = `<div class="history-item-menu" onclick="event.stopPropagation(); showHistoryItemMenu(event, '${video.id}')"><i class="fas fa-trash-alt"></i></div>`;
        card.onclick = () => playVideoFromProfile(video.id);
        scroller.appendChild(card);
    });
}


function renderHistoryLongVideoList(filterDate = null) {
    const list = document.getElementById('history-long-video-list');
    if (!list) return;
    list.innerHTML = '';

    let historyEntries = appState.viewingHistory;
    if (filterDate) {
        historyEntries = historyEntries.filter(entry => new Date(entry.watchedAt).toISOString().slice(0, 10) === filterDate);
    }

    const historyVideos = historyEntries
        .map(entry => fullVideoList.find(v => v.id === entry.id && v.videoLengthType === 'long'))
        .filter(Boolean);

    if (historyVideos.length === 0) {
        list.innerHTML = `<p class="static-message" style="color: var(--text-secondary);">No long video history${filterDate ? ' for this date' : ''}.</p>`;
        return;
    }

    historyVideos.forEach(video => {
        const item = document.createElement('div');
        item.className = 'history-list-item haptic-trigger';
        item.innerHTML = `
            <div class="history-item-thumbnail" style="background-image: url('${escapeHTML(video.thumbnailUrl)}')" onclick="playVideoFromProfile('${video.id}')"></div>
            <div class="history-item-info" onclick="playVideoFromProfile('${video.id}')">
                <span class="history-item-title">${escapeHTML(video.title)}</span>
                <span class="history-item-uploader">${escapeHTML(video.uploaderUsername)}</span>
            </div>
            <div class="history-item-menu haptic-trigger" onclick="showHistoryItemMenu(event, '${video.id}')">
                <i class="fas fa-trash-alt"></i>
            </div>
        `;
        list.appendChild(item);
    });
}

function clearAllHistory() {
    if (confirm("Are you sure you want to clear your entire watch history? This cannot be undone.")) {
        appState.viewingHistory = [];
        localStorage.removeItem('shubhzoneViewingHistory');
        initializeHistoryScreen();
        alert("Watch history cleared.");
    }
}


function showHistoryItemMenu(event, videoId) {
    event.stopPropagation();
    if (confirm(`Remove this video from your history?`)) {
        deleteFromHistory(videoId);
    }
}

function deleteFromHistory(videoId) {
    const index = appState.viewingHistory.findIndex(item => item.id === videoId);
    if (index > -1) {
        appState.viewingHistory.splice(index, 1);
        localStorage.setItem('shubhzoneViewingHistory', JSON.stringify(appState.viewingHistory));
        initializeHistoryScreen();
    }
}


function injectEarnsureAd(targetElementId) {
    const adContainer = document.getElementById(targetElementId);
    if (!adContainer) {
        console.warn(`Ad container with ID '${targetElementId}' not found.`);
        return;
    }
    showMainBannerAd(adContainer);
}

function populateEarnsureContent(lang) {
    const earnsureContentDiv = document.querySelector('.earnsure-section-content');
    if (earnsureContentDiv) {
        earnsureContentDiv.innerHTML = earnsureContent[lang];
        currentEarnsureLanguage = lang;
    }
}

function initializeEarnsureScreen() {
    const contentArea = document.querySelector('#earnsure-screen .earnsure-content-area');
    if (!contentArea) return;

    contentArea.innerHTML = `
        <div class="earnsure-ad-container" id="earnsure-top-ad-container"></div>
        <div class="earnsure-section">
            <div class="earnsure-section-content">
                <!-- Content populated by JS -->
            </div>
        </div>
    `;

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
        
        const updateButtons = (lang) => {
            enButton.classList.toggle('active', lang === 'en');
            hiButton.classList.toggle('active', lang === 'hi');
            populateEarnsureContent(lang);
        };
        
        updateButtons(currentEarnsureLanguage);

        enButton.onclick = () => updateButtons('en');
        hiButton.onclick = () => updateButtons('hi');
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
                    <div class="profile-pic" onclick="showEnlargedImage('${escapeHTML(request.senderAvatar) || 'https://via.placeholder.com/60'}')"><img src="${escapeHTML(request.senderAvatar) || 'https://via.placeholder.com/60'}" alt="avatar"></div>
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

        let finalHtml = '';
        const friends = friendDocs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(friend => friend.name);

        friends.forEach((friend, index) => {
            finalHtml += `
                <div class="holographic-card" onclick="startChat('${friend.id}', '${escapeHTML(friend.name)}', '${escapeHTML(friend.avatar)}')">
                    <div class="profile-pic" onclick="event.stopPropagation(); showEnlargedImage('${escapeHTML(friend.avatar) || 'https://via.placeholder.com/60'}')">
                        <img src="${escapeHTML(friend.avatar) || 'https://via.placeholder.com/60'}" alt="avatar">
                    </div>
                    <div class="info">
                        <div class="name">${escapeHTML(friend.name)}</div>
                        <div class="subtext">Tap to chat</div>
                    </div>
                </div>`;
            
            if ((index + 1) % 5 === 0) {
                const adId = `friend-ad-${index}`;
                finalHtml += `<div id="${adId}" class="friend-list-ad"></div>`;
                setTimeout(() => {
                    const adContainer = document.getElementById(adId);
                    if (adContainer) showMainBannerAd(adContainer);
                }, 100);
            }
        });
        
        membersContent.innerHTML = finalHtml || '<p class="static-message">Could not load friends list.</p>';

    } catch (error) {
        console.error("Error fetching members:", error);
        membersContent.innerHTML = '<p class="static-message" style="color: var(--error-red);">Could not load your friends.</p>';
    }
}


async function populateAddFriendsList(featuredUser = null) {
    const addContent = document.querySelector('#friends-screen #add-content');
    if (!addContent) return;
    
    const userListContainer = addContent.querySelector('#add-friend-user-list');
    if (!userListContainer) {
        console.error('#add-friend-user-list container not found');
        return;
    }
    userListContainer.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';

    try {
        const usersSnapshot = await db.collection('users').orderBy('name').get();
        if (usersSnapshot.empty) {
            userListContainer.innerHTML = '<p class="static-message">No other users found.</p>';
            return;
        }
        
        const currentUserFriends = appState.currentUser.friends || [];
        const sentRequestsSnapshot = await db.collection('friendRequests').where('senderId', '==', appState.currentUser.uid).get();
        const requestedIds = sentRequestsSnapshot.docs.map(doc => doc.data().receiverId);

        const createUserCard = (user) => {
            const isRequested = requestedIds.includes(user.id);
            const buttonHtml = isRequested 
                ? `<button class="add-button requested" disabled>Requested</button>`
                : `<button class="add-button haptic-trigger" onclick="sendFriendRequest('${user.id}', this)">Add Friend</button>`;

            return `
            <div class="holographic-card">
                <div class="profile-pic" onclick="showEnlargedImage('${escapeHTML(user.avatar) || 'https://via.placeholder.com/60'}')"><img src="${escapeHTML(user.avatar) || 'https://via.placeholder.com/60'}" alt="avatar"></div>
                <div class="info">
                    <div class="name">${escapeHTML(user.name) || 'User'}</div>
                     <div class="subtext" style="font-size: 0.8em; color: var(--primary-neon);">${escapeHTML(user.referralCode) || ''}</div>
                </div>
                ${buttonHtml}
            </div>`;
        };

        let featuredHtml = '';
        if (featuredUser) {
            featuredHtml = createUserCard(featuredUser);
        }

        const otherUsersHtml = usersSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(user => 
                user.id !== appState.currentUser.uid && 
                user.name &&
                (!featuredUser || user.id !== featuredUser.id) &&
                !currentUserFriends.includes(user.id)
            )
            .map(createUserCard)
            .join('');

        userListContainer.innerHTML = featuredHtml + otherUsersHtml || '<p class="static-message">No other users to add.</p>';
    } catch (error) {
        console.error("Error fetching users for Add Friends:", error);
        userListContainer.innerHTML = '<p class="static-message" style="color: var(--error-red);">Could not load user list.</p>';
    }
}

async function searchUser() {
    const searchInput = document.getElementById('add-friend-search-input');
    const query = searchInput.value.trim();
    const userListContainer = document.querySelector('#add-friend-user-list');

    if (!query) {
        populateAddFriendsList();
        return;
    }
    
    userListContainer.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';

    try {
        let userQuery;
        if (query.startsWith('@')) {
            userQuery = await db.collection('users')
                .where('referralCode', '==', query)
                .limit(1)
                .get();
        } else {
             userQuery = await db.collection('users')
                .where('name', '>=', query)
                .where('name', '<=', query + '\uf8ff')
                .get();
        }

        if (userQuery.empty) {
            userListContainer.innerHTML = `<p class="static-message">No user found for: ${escapeHTML(query)}</p>`;
        } else {
            const foundUser = { id: userQuery.docs[0].id, ...userQuery.docs[0].data() };
            populateAddFriendsList(foundUser);
        }
    } catch (error) {
        console.error("Error searching user:", error);
        userListContainer.innerHTML = `<p class="static-message" style="color: var(--error-red);">Error during search. Check Firestore indexes.</p>`;
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
            members: uids,
            memberDetails: {
                [appState.currentUser.uid]: {name: appState.currentUser.name, avatar: appState.currentUser.avatar},
                [friendId]: {name: friendName, avatar: friendAvatar}
            }
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
// ★★★ CREATOR PAGE LOGIC - START ★★★
// =======================================================

function openCommentsForCurrentCreatorVideo() {
    const { id, uploaderUid } = appState.creatorPage.currentLongVideo;
    if (id && uploaderUid) {
        openCommentsModal(id, uploaderUid);
    } else {
        console.error("No current long video data to open comments for.");
        alert("Could not load comments for this video.");
    }
}

async function initializeCreatorPage(creatorId, startWith = 'short', videoId = null) {
    if (fullVideoList.length === 0) await refreshAndRenderFeed();
    const shortView = document.getElementById('creator-page-short-view');
    const longView = document.getElementById('creator-page-long-view');
    if (!shortView || !longView) return;
    shortView.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';
    longView.innerHTML = '<div class="loader-container"><div class="loader"></div></div>';

    const videos = fullVideoList.filter(v => v.uploaderUid === creatorId && v.audience !== '18plus');
    const shortVideos = videos.filter(v => v.videoLengthType !== 'long');
    const longVideos = videos.filter(v => v.videoLengthType === 'long');

    let startShortVideo = shortVideos[0];
    if (videoId && startWith === 'short') {
        const foundVideo = shortVideos.find(v => v.id === videoId);
        if (foundVideo) startShortVideo = foundVideo;
    }
    let startLongVideo = longVideos[0];
    if (videoId && startWith === 'long') {
        const foundVideo = longVideos.find(v => v.id === videoId);
        if (foundVideo) startLongVideo = foundVideo;
    }

    const menu = document.getElementById('more-function-menu');
    let commentBtn = document.getElementById('creator-page-comment-btn');
    if (!commentBtn) {
        commentBtn = document.createElement('button');
        commentBtn.id = 'creator-page-comment-btn';
        commentBtn.className = 'function-menu-item haptic-trigger';
        commentBtn.innerHTML = `<i class="fas fa-comment-dots"></i> Comment`;
        commentBtn.onclick = openCommentsForCurrentCreatorVideo;
        menu.appendChild(commentBtn);
    }

    const tabs = document.querySelectorAll('#creator-page-tabs .creator-page-tab-btn');
    tabs.forEach(tab => {
        tab.onclick = () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            document.querySelectorAll('.creator-page-view').forEach(v => v.classList.remove('active'));
            const activeView = document.getElementById(`creator-page-${tab.dataset.type}-view`);
            if (activeView) activeView.classList.add('active');
            
            commentBtn.style.display = tab.dataset.type === 'long' ? 'flex' : 'none';

            clearAllAdTimers(); 

            const otherType = tab.dataset.type === 'short' ? 'long' : 'short';
            if(appState.creatorPagePlayers[otherType] && typeof appState.creatorPagePlayers[otherType].pauseVideo === 'function') {
                appState.creatorPagePlayers[otherType].pauseVideo();
            }
            if(appState.creatorPagePlayers[tab.dataset.type] && typeof appState.creatorPagePlayers[tab.dataset.type].playVideo === 'function') {
                appState.creatorPagePlayers[tab.dataset.type].playVideo();
            }

            const videoWrapper = document.querySelector('#creator-page-long-view .main-video-card-wrapper');
            if (videoWrapper && videoWrapper.classList.contains('rotated')) {
                videoWrapper.classList.remove('rotated');
            }
        };
    });
    
    const menuRotate = document.getElementById('more-function-menu');
    const existingRotateBtn = document.getElementById('rotate-video-btn');
    if (existingRotateBtn) {
        existingRotateBtn.remove();
    }

    const rotateBtn = document.createElement('button');
    rotateBtn.id = 'rotate-video-btn';
    rotateBtn.className = 'function-menu-item haptic-trigger';
    rotateBtn.innerHTML = `<i class="fas fa-sync-alt"></i> Rotate`;
    rotateBtn.onclick = toggleVideoRotation;
    
    if (menuRotate) {
        menuRotate.appendChild(rotateBtn);
    }
    
    if (startWith === 'long' && startLongVideo) {
        appState.creatorPage.currentLongVideo = { id: startLongVideo.id, uploaderUid: creatorId };
    }
    
    renderCreatorVideoView(shortView, shortVideos, 'short', creatorId, startShortVideo ? startShortVideo.id : null);
    renderCreatorVideoView(longView, longVideos, 'long', creatorId, startLongVideo ? startLongVideo.id : null);
    
    document.querySelectorAll('.creator-page-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.creator-page-tab-btn').forEach(t => t.classList.remove('active'));
    document.getElementById(`creator-page-${startWith}-view`).classList.add('active');
    document.querySelector(`.creator-page-tab-btn[data-type="${startWith}"]`).classList.add('active');
    commentBtn.style.display = startWith === 'long' ? 'flex' : 'none';
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
                </div>
            </div>
            <div class="side-video-list-scroller">${videoListHtml}</div>
        </div>
    `;
    
    if (videos.length > 0 && isYouTubeApiReady) {
        initializeCreatorPagePlayer(firstVideo.videoUrl, `creator-page-player-${type}`, type);
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
                if (type === 'long') {
                    manageLongVideoPlayerBanner('hide');
                }
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

        if (type === 'long') {
            appState.creatorPage.currentLongVideo = { id: videoToPlay.id, uploaderUid: creatorId };
        }

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

function toggleVideoRotation() {
    const longVideoView = document.getElementById('creator-page-long-view');
    
    if (longVideoView && longVideoView.classList.contains('active')) {
        const videoWrapper = longVideoView.querySelector('.main-video-card-wrapper');
        const moreFunctionsMenu = document.getElementById('more-function-menu');
        const player = appState.creatorPagePlayers.long;
        
        if (videoWrapper) {
            videoWrapper.classList.toggle('rotated');
            
            if (videoWrapper.classList.contains('rotated')) {
                manageLongVideoPlayerBanner('hide');
            } else {
                if (player && player.getPlayerState() !== YT.PlayerState.PLAYING) {
                    manageLongVideoPlayerBanner('show');
                } else {
                    manageLongVideoPlayerBanner('hide');
                }
            }

            if (moreFunctionsMenu) {
                moreFunctionsMenu.classList.remove('open');
            }
        }
    } else {
        alert("Rotation is only available for long videos.");
    }
}


function handleCreatorPlayerStateChange(event) {
    const player = event.target;
    const playerState = event.data;
    const iframe = player.getIframe();
    
    const isLongVideo = iframe.closest('#creator-page-long-view');

    const videoData = player.getVideoData();
    const videoUrl = videoData.video_id;

    const currentVideo = fullVideoList.find(v => v.videoUrl === videoUrl);
    if (!currentVideo) return;
    const dbVideoId = currentVideo.id;
    const videoType = currentVideo.videoLengthType === 'long' ? 'long' : 'short';

    if (playerState === YT.PlayerState.PLAYING) {
        if (isLongVideo) manageLongVideoPlayerBanner('hide');
        startVideoViewTracker(dbVideoId, videoType);
        addVideoToHistory(dbVideoId);
    } else if (playerState === YT.PlayerState.PAUSED || playerState === YT.PlayerState.ENDED) {
        if (isLongVideo) manageLongVideoPlayerBanner('show');
        stopVideoViewTracker(dbVideoId);
    } else {
        if (isLongVideo) manageLongVideoPlayerBanner('hide');
    }
}

// =======================================================
// ★★★ PAYMENT & TRACKING LOGIC - START ★★★
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

    // सभी ट्रैकिंग डेटा को शामिल करें
    const requestData = {
        requesterUid: user.uid,
        requesterName: user.name,
        paymentMethod: method,
        paymentDetails: paymentDetails,
        address: address,
        aadhar: aadhar,
        viewerCoins: user.viewerCoins || 0,
        creatorCoins: user.creatorCoins || 0,
        unconvertedCreatorSeconds: user.unconvertedCreatorSeconds || 0,
        status: "pending",
        requestedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    try {
        await db.collection("paymentRequests").add(requestData);
        await resetTrackingData(); // डेटा रीसेट करें
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

    const user = appState.currentUser;

    // ★★★ बदलाव: "Request Payment" बटन हटा दिया गया है ★★★
    content.innerHTML = `
        <div class="track-payment-card creator-card">
            <div class="card-strip red">
                <span><i class="fas fa-crown"></i> Red Coin for Creator</span>
            </div>
            <div class="card-content">
                <p>Earned when others watch your original videos. <br>(1 Coin ≈ 15 mins watch time)</p>
                <div class="coin-display">
                    <span class="coin-icon creator"><i class="fas fa-coins"></i></span>
                    <span class="coin-count">${user.creatorCoins || 0}</span>
                </div>
                <div class="unconverted-time">
                    <p>Unconverted Time: <strong>${formatSecondsToHMS(user.unconvertedCreatorSeconds || 0)}</strong></p>
                </div>
            </div>
        </div>

        <div class="track-payment-card viewer-card">
            <div class="card-strip yellow">
                <span><i class="fas fa-eye"></i> Yellow Coin for Viewer</span>
            </div>
            <div class="card-content">
                <p>Earned from watching ads and supporting the platform.</p>
                <div class="coin-display">
                    <span class="coin-icon viewer"><i class="fas fa-coins"></i></span>
                    <span class="coin-count">${user.viewerCoins || 0}</span>
                </div>
            </div>
        </div>
    `;
}


function startAppTimeTracker() {
    if (appState.appTimeTrackerInterval) clearInterval(appState.appTimeTrackerInterval);
    appState.appTimeTrackerInterval = setInterval(() => {
        // This function can be used for general app time tracking if needed in the future
    }, 5000);
}

async function updateCreatorWatchTime(creatorId, watchedSeconds) {
    if (!creatorId || !watchedSeconds || creatorId === appState.currentUser.uid) return;

    const creatorRef = db.collection('users').doc(creatorId);
    const coinConversionThreshold = 900;

    try {
        await db.runTransaction(async (transaction) => {
            const creatorDoc = await transaction.get(creatorRef);
            if (!creatorDoc.exists) {
                return;
            }

            const creatorData = creatorDoc.data();
            const currentUnconvertedSeconds = creatorData.unconvertedCreatorSeconds || 0;
            const totalSeconds = currentUnconvertedSeconds + watchedSeconds;
            
            const newCoins = Math.floor(totalSeconds / coinConversionThreshold);
            const remainingSeconds = totalSeconds % coinConversionThreshold;

            let updateData = {
                unconvertedCreatorSeconds: remainingSeconds
            };
            
            if (newCoins > 0) {
                updateData.creatorCoins = firebase.firestore.FieldValue.increment(newCoins);
            }
            
            transaction.update(creatorRef, updateData);
        });
        console.log(`[COIN] Updated watch time for creator ${creatorId} by ${watchedSeconds} seconds.`);
    } catch (error) {
        console.error("Could not update creator watch time and coins:", error);
    }
}


function startWatchTimeTracker() {
    if (appState.watchTimeInterval) clearInterval(appState.watchTimeInterval);
    
    let secondsSinceLastUpdate = 0;
    const videoData = fullVideoList.find(v => v.id === activePlayerId);
    const creatorId = videoData ? videoData.uploaderUid : null;

    appState.watchTimeInterval = setInterval(async () => {
        if (creatorId && creatorId !== appState.currentUser.uid) {
            secondsSinceLastUpdate += 1;
        }

        if (secondsSinceLastUpdate >= 30) {
            await updateCreatorWatchTime(creatorId, secondsSinceLastUpdate);
            secondsSinceLastUpdate = 0;
        }
    }, 1000);
}

async function stopWatchTimeTracker() {
    if (appState.watchTimeInterval) {
        clearInterval(appState.watchTimeInterval);
        appState.watchTimeInterval = null;
    }
}


async function resetTrackingData() {
    try {
        const userRef = db.collection('users').doc(appState.currentUser.uid);
        await userRef.update({ 
            viewerCoins: 0, 
            creatorCoins: 0,
            unconvertedCreatorSeconds: 0
        });
        appState.currentUser.viewerCoins = 0;
        appState.currentUser.creatorCoins = 0;
        appState.currentUser.unconvertedCreatorSeconds = 0;
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
// ★★★ ADVERTISER DASHBOARD LOGIC - START ★★★
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
// ★★★ REPORT & VIEW COUNT LOGIC - START ★★★
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

    const targetSeconds = type === 'long' ? 300 : 20;
    
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
            const countElement = videoCard.querySelector('[data-action="view"] .count') || videoCard.querySelector('.long-video-view-count');
            if (countElement) {
                 const currentCountText = countElement.innerText.trim().split(' ')[1] || countElement.innerText.trim();
                 const currentCount = parseInt(currentCountText.replace(/[^\d]/g, '')) || 0;
                 const newCount = formatNumber(currentCount + 1);

                if(videoCard.querySelector('.long-video-view-count')) {
                    videoCard.querySelector('.long-video-view-count').innerHTML = `<i class="fas fa-eye"></i> ${newCount}`;
                } else {
                    countElement.innerText = newCount;
                }
            }
        }
    } catch (error) {
        console.error("Error incrementing custom view count:", error);
    }
}
// =======================================================
// ★★★ REPORT & VIEW COUNT LOGIC - END ★★★
// =======================================================

// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
// ★★★ NEW CREDIT SCREEN LOGIC - START ★★★
// ★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★★
function initializeCreditScreen(videoId) {
    const screen = document.getElementById('credit-screen');
    if (!screen) return;

    const video = fullVideoList.find(v => v.id === videoId);
    if (!video) {
        screen.innerHTML = `<p class="static-message">Video details not found.</p>`;
        return;
    }

    const channelName = escapeHTML(video.channelName) || 'Original Creator';
    const channelLink = escapeHTML(video.channelLink);
    const youtubeLink = `https://www.youtube.com/watch?v=${escapeHTML(video.videoUrl)}`;
    
    const watchOnYoutubeHTML = channelLink 
        ? `<a href="${channelLink}" target="_blank" rel="noopener noreferrer">${channelName}</a>`
        : `<a href="${youtubeLink}" target="_blank" rel="noopener noreferrer">${channelName}</a>`;

    const commonFooter = `
        <div class="credit-footer">
            <p>This site features embedded YouTube videos and gives full credit to the original creators. We do not claim any rights over the videos.</p>
            <p><strong>Revenue Policy:</strong> If the original creator reaches out, we are happy to share revenue at a fixed rate per 1,000 views as agreed upon. Until then, earnings are retained to support platform costs.</p>
            <p>For takedown requests or revenue discussion, contact: udbhavscience12@gmail.com</p>
        </div>
    `;

    const contentHi = `
        <div id="credit-content-hi" class="credit-content-lang">
            <p><strong>🎥 क्रेडिट:</strong> ${channelName}</p>
            <p><strong>📺 यूट्यूब पर देखें:</strong> ${watchOnYoutubeHTML}</p>
            <p><strong>अस्वीकरण:</strong> यह वीडियो यूट्यूब से एम्बेड किया गया है। इस वीडियो के सभी अधिकार इसके मूल निर्माता के पास सुरक्षित हैं।</p>
            <p>यदि आप इस वीडियो के असली निर्माता हैं और चाहते हैं कि यह वीडियो इस प्लेटफ़ॉर्म से हटा दिया जाए, तो कृपया हमें इस ईमेल आईडी पर संपर्क करें: udbhavscience12@gmail.com</p>
            <p>यदि आप चाहते हैं कि यह वीडियो प्लेटफ़ॉर्म पर बना रहे और आप इसके माध्यम से होने वाली कमाई में भागीदार बनें, तो हम आगे आने वाले व्यूज़ पर 10% विज्ञापन राजस्व (ad revenue) साझा करने के लिए तैयार हैं।</p>
            <p>बस एक छोटी-सी अनुरोध है:</p>
            <ul>
                <li>🔹 पुष्टि (verification) के लिए आपको अपने यूट्यूब चैनल की किसी भी 5 वीडियो में हमारा एक छोटा सा शाउटआउट (नाम या वेबसाइट का ज़िक्र) देना होगा, ताकि यह प्रमाणित किया जा सके कि चैनल वास्तव में आपका ही है।</li>
                <li>🔹 साथ ही, हर महीने कम से कम एक बार अपने किसी वीडियो या पोस्ट में हमारी वेबसाइट का उल्लेख (mention) करना होगा, ताकि हम दोनों मिलकर आगे बढ़ सकें।</li>
            </ul>
            <p>यह कोई व्यापारिक लेन-देन नहीं, बल्कि एक आपसी सहयोग (collaboration) है — जिसमें हम दोनों एक-दूसरे की इज़्ज़त करते हुए और पारदर्शिता के साथ आगे बढ़ें।</p>
            <p>आइए मिलकर एक अच्छा और ईमानदार डिजिटल सफर तय करें ✨</p>
        </div>
    `;
    
    const contentEn = `
        <div id="credit-content-en" class="credit-content-lang active">
             <p><strong>🎥 Credit:</strong> ${channelName}</p>
             <p><strong>📺 Watch on YouTube:</strong> ${watchOnYoutubeHTML}</p>
             <p><strong>Disclaimer:</strong> This video is embedded directly from YouTube. All rights to the content belong to its original creator.</p>
             <p>If you are the original creator of this video and would like it to be removed from this platform, please feel free to contact us at: udbhavscience12@gmail.com</p>
             <p>However, if you would like the video to remain on this platform and are open to collaborating, we are happy to offer 10% of the ad revenue generated from future views of your video.</p>
             <p>We do have a small request:</p>
             <ul>
                 <li>🔹 For verification, we ask you to give a short shout-out (mentioning our name or website) in any 5 videos on your YouTube channel. This helps us confirm that the channel truly belongs to you.</li>
                 <li>🔹 Additionally, we request that you kindly mention our website at least once a month in any of your videos or posts — so that we can grow together, as true collaborators.</li>
             </ul>
             <p>This is not just a financial agreement — it’s a respectful and transparent collaboration built on mutual support.</p>
             <p>Let’s grow together ✨</p>
        </div>
    `;

    screen.innerHTML = `
        <div class="screen-header transparent">
            <div class="header-icon-left haptic-trigger" onclick="navigateBack()"><i class="fas fa-arrow-left"></i></div>
            <span class="header-title">Credit</span>
            <div class="credit-language-toggle">
                <button id="credit-lang-en" class="active">EN</button>
                <button id="credit-lang-hi">HI</button>
            </div>
        </div>
        <div class="credit-content-area">
            <div id="credit-screen-ad-container"></div>
            ${contentEn}
            ${contentHi}
            ${commonFooter}
        </div>
    `;

    showMainBannerAd(document.getElementById('credit-screen-ad-container'));

    document.getElementById('credit-lang-en').addEventListener('click', () => {
        document.getElementById('credit-content-en').classList.add('active');
        document.getElementById('credit-content-hi').classList.remove('active');
        document.getElementById('credit-lang-en').classList.add('active');
        document.getElementById('credit-lang-hi').classList.remove('active');
    });
    document.getElementById('credit-lang-hi').addEventListener('click', () => {
        document.getElementById('credit-content-hi').classList.add('active');
        document.getElementById('credit-content-en').classList.remove('active');
        document.getElementById('credit-lang-hi').classList.add('active');
        document.getElementById('credit-lang-en').classList.remove('active');
    });
}
// ★★★ NEW CREDIT SCREEN LOGIC - END ★★★

// ★★★ IMAGE ENLARGE LOGIC - START ★★★
function showEnlargedImage(imageUrl) {
    let modal = document.getElementById('image-enlarge-modal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'image-enlarge-modal';
        modal.className = 'modal-overlay';
        modal.style.zIndex = '3000';
        modal.innerHTML = `
            <div class="enlarged-image-content" style="max-width: 90vw; max-height: 90vh;">
                <img id="enlarged-image-src" src="" style="width: 100%; height: 100%; object-fit: contain;">
            </div>
        `;
        document.body.appendChild(modal);
        modal.addEventListener('click', () => {
            modal.classList.remove('active');
        });
    }
    
    const imgElement = document.getElementById('enlarged-image-src');
    if(imgElement) {
        imgElement.src = imageUrl;
        modal.classList.add('active');
    }
}
// ★★★ IMAGE ENLARGE LOGIC - END ★★★


document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.header-icon-left').forEach(btn => {
        if (!btn.closest('#history-top-bar') && !btn.closest('#creator-page-screen .screen-header')) {
            btn.onclick = () => navigateBack();
        }
    });
    const creatorBackBtn = document.querySelector('#creator-page-screen .header-icon-left');
    if (creatorBackBtn) {
        creatorBackBtn.onclick = () => navigateBack();
    }

    document.getElementById('navigate-to-payment-btn')?.addEventListener('click', () => navigateTo('payment-screen'));
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
    
    initializeApp();
    const getStartedBtn = document.getElementById('get-started-btn');
    if (getStartedBtn) {
        getStartedBtn.classList.add('haptic-trigger');
        getStartedBtn.addEventListener('click', () => startAppLogic());
    }

    if (appContainer) {
        appContainer.addEventListener('click', (event) => { 
            userHasInteracted = true; 
            
            if (event.target.closest('.haptic-trigger')) {
                provideHapticFeedback(); 
            }
        });
    }

    initializeMessagingInterface();
    document.getElementById('add-friend-search-btn')?.addEventListener('click', searchUser);
    document.getElementById('add-friend-search-input')?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') searchUser();
    });


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
            showMainBannerAd(uploadScreenAdContainer);
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
    document.getElementById('more-videos-btn')?.addEventListener('click', toggleCreatorVideoList);


    loadHapticPreference();
    renderCategories();
    renderCategoriesInBar();
});
