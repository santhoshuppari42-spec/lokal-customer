import { useState, useEffect } from "react";

const SUPABASE_URL = "https://ydzpbtlnckrhkcqfykcr.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlkenBidGxuY2tyaGtjcWZ5a2NyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODE5NjExNjcsImV4cCI6MjA5NzUzNzE2N30.bIYqV77b8dqa-SgqwL9PoN-0vpLLmZs3U4Zq2CMiIgk";

async function sbFetch(path, options = {}) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": options.prefer || "return=representation",
      ...(options.headers || {}),
    },
  });
  if (!res.ok) {
    let msg = res.statusText;
    try { const j = await res.json(); msg = j.message || msg; } catch(e) {}
    throw new Error(msg);
  }
  if (res.status === 204) return null;
  return res.json();
}

const db = {
  select: (table, query = "") => sbFetch(`${table}?${query}`),
  update: (table, query, body) => sbFetch(`${table}?${query}`, { method: "PATCH", body: JSON.stringify(body) }),
  insert: (table, body) => sbFetch(table, { method: "POST", body: JSON.stringify(body) }),
};

const CATEGORIES = [
  { id:"clothes",     icon:"👕", label:"Clothes",       sub:["Shirts","Pants","Sarees","Kurtas","Jeans","T-Shirts","Dresses"] },
  { id:"footwear",    icon:"👟", label:"Footwear",      sub:["Sneakers","Sandals","Heels","Formal Shoes","Slippers","Boots"] },
  { id:"electronics", icon:"📱", label:"Electronics",   sub:["Smartphones","Laptops","TVs","Earphones","Cameras","Tablets"] },
  { id:"vehicles",    icon:"🚗", label:"Vehicles",      sub:["Cars","Bikes","Scooters","Auto Parts","Tyres","Helmets"] },
  { id:"furniture",   icon:"🛋", label:"Furniture",     sub:["Sofas","Beds","Tables","Chairs","Wardrobes","Shelves"] },
  { id:"medicine",    icon:"💊", label:"Medicine",      sub:["Tablets","Syrups","First Aid","Vitamins","Baby Care","Surgical"] },
  { id:"food",        icon:"🍱", label:"Food & Grocery",sub:["Rice","Vegetables","Fruits","Snacks","Beverages","Dairy"] },
  { id:"sports",      icon:"⚽", label:"Sports",        sub:["Cricket","Football","Badminton","Gym Equipment","Cycling","Swimming"] },
  { id:"books",       icon:"📚", label:"Books",         sub:["Textbooks","Novels","Comics","Exam Prep","Children","Magazines"] },
  { id:"beauty",      icon:"💄", label:"Beauty",        sub:["Skincare","Haircare","Makeup","Perfumes","Nail Care","Men Grooming"] },
  { id:"toys",        icon:"🧸", label:"Toys",          sub:["Board Games","Action Figures","Dolls","Educational","Outdoor","LEGO"] },
  { id:"hardware",    icon:"🔨", label:"Hardware",      sub:["Tools","Paints","Pipes","Electrical","Cement","Tiles"] },
];

const CITIES = {
  Hyderabad:["Ameerpet","Madhapur","Kukatpally","Secunderabad","Banjara Hills","Gachibowli","Kondapur","KPHB","Uppal","Himayatnagar","Charminar"],
  Bengaluru:["Koramangala","Indiranagar","Whitefield","HSR Layout","BTM Layout","Jayanagar","Marathahalli","Hebbal"],
  Chennai:["Anna Nagar","T Nagar","Adyar","Velachery","Tambaram","Porur"],
  Mumbai:["Andheri","Bandra","Dadar","Thane","Borivali","Malad","Powai"],
  Delhi:["Connaught Place","Lajpat Nagar","Karol Bagh","Dwarka","Rohini","Saket","Nehru Place"],
};
const CITY_COORDS = {
  Hyderabad:{lat:17.4374,lng:78.4487}, Bengaluru:{lat:12.9352,lng:77.6245},
  Chennai:{lat:13.0827,lng:80.2707}, Mumbai:{lat:19.0760,lng:72.8777}, Delhi:{lat:28.6139,lng:77.2090},
};

function LocationPicker({ onDone }) {
  const [city, setCity] = useState("");
  const [area, setArea] = useState("");
  const [query, setQuery] = useState("");
  const [showDrop, setShowDrop] = useState(false);
  const [gps, setGps] = useState("idle");
  const areas = city ? (CITIES[city]||[]).filter(a=>a.toLowerCase().includes(query.toLowerCase())) : [];
  return (
    <div>
      <button style={s.gpsBtn} onClick={()=>{
        setGps("loading");
        navigator.geolocation.getCurrentPosition(
          ()=>{setCity("Hyderabad");setArea("Ameerpet");setQuery("Ameerpet");setGps("done");},
          ()=>setGps("error")
        );
      }}>{gps==="loading"?"🔄 Detecting...":gps==="done"?"✅ GPS Detected!":"📡 Use My GPS"}</button>
      <div style={s.orDivider}>— or choose manually —</div>
      <label style={s.lbl}>City</label>
      <div style={s.cityRow}>
        {Object.keys(CITIES).map(c=>(
          <button key={c} style={{...s.cBtn,...(city===c?s.cBtnA:{})}} onClick={()=>{setCity(c);setArea("");setQuery("");}}>{c}</button>
        ))}
      </div>
      {city && <>
        <label style={{...s.lbl,marginTop:12}}>Area in {city}</label>
        <div style={{position:"relative"}}>
          <input style={s.inp} placeholder="Search area..." value={query}
            onChange={e=>{setQuery(e.target.value);setShowDrop(true);}}
            onFocus={()=>setShowDrop(true)} onBlur={()=>setTimeout(()=>setShowDrop(false),150)} />
          {showDrop && areas.length>0 && (
            <div style={s.drop}>
              {areas.map(a=><div key={a} style={s.dItem} onMouseDown={()=>{setArea(a);setQuery(a);setShowDrop(false);}}>📍 {a}</div>)}
            </div>
          )}
        </div>
      </>}
      {(area||(gps==="done")) && (
        <button style={{...s.btn,background:"#10B981",marginTop:10}} onClick={()=>onDone({
          city:city||"Hyderabad", area:area||"Ameerpet",
          lat: CITY_COORDS[city||"Hyderabad"].lat, lng: CITY_COORDS[city||"Hyderabad"].lng,
        })}>Confirm: {area||"Ameerpet"}, {city||"Hyderabad"} →</button>
      )}
    </div>
  );
}

function SplashScreen({ onLogin, onSignup }) {
  return (
    <div style={s.splash}>
      <div style={s.splashBg}/>
      <div style={s.splashContent}>
        <div style={s.splashLogo}>🛒</div>
        <div style={s.splashBrand}>Lokál</div>
        <div style={s.splashTagline}>Any item. Nearby shops.<br/>Real time.</div>
        <div style={s.splashActions}>
          <button style={s.splashSignup} onClick={onSignup}>Get Started Free</button>
          <button style={s.splashLogin} onClick={onLogin}>Login →</button>
        </div>
        <div style={s.splashSeller}>Are you a shop owner? <span style={s.splashSellerLink}>partner.lokal.in</span></div>
      </div>
    </div>
  );
}

function LoginScreen({ onSuccess, onSignup, onBack }) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const login = async () => {
    setLoading(true); setError("");
    try {
      const results = await db.select("customers", `or=(email.eq.${encodeURIComponent(email)},phone.eq.${encodeURIComponent(email)})&password=eq.${encodeURIComponent(pass)}&limit=1`);
      if (!results || results.length === 0) { setError("Wrong email/phone or password"); setLoading(false); return; }
      const data = results[0];
      if(data.status === "blocked"){ setError("Your account has been blocked. Contact support."); setLoading(false); return; }
      onSuccess(data);
    } catch(e) { setError("Login failed: " + e.message); setLoading(false); }
  };

  return (
    <div style={s.authPage}>
      <div style={s.authNav}>
        <button style={s.backBtn} onClick={onBack}>←</button>
        <div style={s.authNavBrand}>🛒 <b style={{color:"#4F46E5"}}>Lokál</b></div>
        <div style={{width:32}}/>
      </div>
      <div style={s.authBody}>
        <h2 style={s.authTitle}>Welcome back 👋</h2>
        <p style={s.authSub}>Login to your Lokál account</p>
        <div style={s.authCard}>
          <label style={s.lbl}>Email or Phone</label>
          <input style={s.inp} placeholder="email@example.com or phone" value={email} onChange={e=>setEmail(e.target.value)} />
          <label style={s.lbl}>Password</label>
          <div style={{position:"relative"}}>
            <input style={s.inp} type={showPass?"text":"password"} placeholder="Your password" value={pass} onChange={e=>setPass(e.target.value)} onKeyDown={e=>e.key==="Enter"&&login()} />
            <button style={s.eyeBtn} onClick={()=>setShowPass(!showPass)}>{showPass?"🙈":"👁"}</button>
          </div>
          {error && <div style={s.errMsg}>❌ {error}</div>}
          <button style={{...s.btn,opacity:(email&&pass)?1:0.45}} onClick={login}>{loading?"Logging in...":"Login →"}</button>
        </div>
        <div style={s.switchRow}>Don't have an account? <button style={s.switchBtn} onClick={onSignup}>Sign up free</button></div>
      </div>
    </div>
  );
}

function SignupScreen({ onSuccess, onLogin, onBack }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({name:"",phone:"",email:"",pass:"",confirm:""});
  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const nextStep = () => {
    if(form.pass !== form.confirm){ setError("Passwords don't match"); return; }
    setError(""); setStep(2);
  };

  const finishSignup = async (loc) => {
    setSaving(true); setError("");
    try {
      const results = await db.insert("customers", {
        name: form.name, phone: form.phone, email: form.email, password: form.pass,
        city: loc.city, area: loc.area, lat: loc.lat, lng: loc.lng,
      });
      onSuccess(results[0]);
    } catch(e) {
      setError("Could not sign up: " + e.message);
    }
    setSaving(false);
  };

  return (
    <div style={s.authPage}>
      <div style={s.authNav}>
        <button style={s.backBtn} onClick={step===1?onBack:()=>setStep(step-1)}>←</button>
        <div style={s.authNavBrand}>🛒 <b style={{color:"#4F46E5"}}>Lokál</b></div>
        <div style={s.stepCounter}>{step}/3</div>
      </div>
      <div style={s.progressBar}><div style={{...s.progressFill,width:`${(step/3)*100}%`}}/></div>
      <div style={s.authBody}>
        {step===1 && <>
          <h2 style={s.authTitle}>Create Account 🎉</h2>
          <p style={s.authSub}>Join Lokál for free.</p>
          <div style={s.authCard}>
            <label style={s.lbl}>Full Name *</label>
            <input style={s.inp} placeholder="Your full name" value={form.name} onChange={e=>setForm(f=>({...f,name:e.target.value}))} />
            <label style={s.lbl}>Phone Number *</label>
            <input style={s.inp} placeholder="+91 9876543210" value={form.phone} onChange={e=>setForm(f=>({...f,phone:e.target.value}))} />
            <label style={s.lbl}>Email *</label>
            <input style={s.inp} placeholder="you@email.com" value={form.email} onChange={e=>setForm(f=>({...f,email:e.target.value}))} />
            <label style={s.lbl}>Password *</label>
            <input style={s.inp} type="password" placeholder="Min 6 characters" value={form.pass} onChange={e=>setForm(f=>({...f,pass:e.target.value}))} />
            <label style={s.lbl}>Confirm Password *</label>
            <input style={s.inp} type="password" placeholder="Repeat password" value={form.confirm} onChange={e=>setForm(f=>({...f,confirm:e.target.value}))} />
            {error && <div style={s.errMsg}>❌ {error}</div>}
            <button style={{...s.btn,opacity:(form.name&&form.phone&&form.email&&form.pass&&form.confirm)?1:0.45}} onClick={nextStep}>Send OTP →</button>
          </div>
          <div style={s.switchRow}>Already have account? <button style={s.switchBtn} onClick={onLogin}>Login</button></div>
        </>}

        {step===2 && <>
          <h2 style={s.authTitle}>Verify Phone 📲</h2>
          <p style={s.authSub}>OTP sent to <b>{form.phone}</b></p>
          <div style={s.authCard}>
            <div style={s.otpSentBox}>📲 OTP sent successfully! (demo — any 4+ digits)</div>
            <label style={s.lbl}>Enter OTP</label>
            <div style={s.otpRow}>
              {[0,1,2,3,4,5].map(i=>(
                <input key={i} style={s.otpBox} maxLength={1} value={otp[i]||""} onChange={e=>{
                  const arr=otp.split(""); arr[i]=e.target.value; setOtp(arr.join(""));
                  if(e.target.value&&e.target.nextSibling) e.target.nextSibling.focus();
                }} />
              ))}
            </div>
            <button style={{...s.btn,opacity:otp.length>=4?1:0.45}} onClick={()=>{if(otp.length>=4)setStep(3);}}>Verify & Continue →</button>
          </div>
        </>}

        {step===3 && <>
          <h2 style={s.authTitle}>Set Your Location 📍</h2>
          <p style={s.authSub}>So nearby shops can find you</p>
          <div style={s.authCard}>
            {error && <div style={s.errMsg}>❌ {error}</div>}
            {saving && <div style={s.savingMsg}>💾 Creating your account...</div>}
            <LocationPicker onDone={finishSignup} />
          </div>
        </>}
      </div>
    </div>
  );
}

function HomeScreen({ user, onLogout }) {
  const [tab, setTab] = useState("home");
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState(null);
  const [showReqModal, setShowReqModal] = useState(false);
  const [activeRequest, setActiveRequest] = useState(null);
  const [myRequests, setMyRequests] = useState([]);
  const [chatShop, setChatShop] = useState(null);
  const [reqForm, setReqForm] = useState({item:"",desc:"",budget:""});
  const [chatLog, setChatLog] = useState([]);
  const [chatMsg, setChatMsg] = useState("");
  const [screen, setScreen] = useState("home");
  const [bids, setBids] = useState([]);
  const [shopsById, setShopsById] = useState({});
  const [posting, setPosting] = useState(false);

  const cat = CATEGORIES.find(c=>c.id===activeCategory);
  const filteredCats = CATEGORIES.filter(c=>
    c.label.toLowerCase().includes(search.toLowerCase())||
    c.sub.some(s=>s.toLowerCase().includes(search.toLowerCase()))
  );

  async function loadMyRequests() {
    try {
      const data = await db.select("requests", `customer_id=eq.${user.id}&order=created_at.desc`);
      setMyRequests(data||[]);
    } catch(e) { console.error(e); }
  }
  useEffect(()=>{ loadMyRequests(); }, []);

  async function loadBids(reqId) {
    try {
      const bidData = await db.select("bids", `request_id=eq.${reqId}&order=created_at.asc`);
      setBids(bidData||[]);
      if(bidData && bidData.length){
        const ids = [...new Set(bidData.map(b=>b.shop_id))].join(",");
        const shopData = await db.select("shops", `id=in.(${ids})`);
        const map = {};
        (shopData||[]).forEach(sh=>{ map[sh.id]=sh; });
        setShopsById(map);
      }
    } catch(e) { console.error(e); }
  }

  const postRequest = async () => {
    if(!reqForm.item) return;
    setPosting(true);
    try {
      const results = await db.insert("requests", {
        customer_id: user.id, category: activeCategory, item: reqForm.item,
        description: reqForm.desc, budget: reqForm.budget, area: user.area, city: user.city,
        lat: user.lat, lng: user.lng,
      });
      const data = results[0];
      setActiveRequest(data);
      setReqForm({item:"",desc:"",budget:""});
      setShowReqModal(false);
      setScreen("bids");
      loadMyRequests();
      loadBids(data.id);
    } catch(e) { alert("Could not post: "+e.message); }
    setPosting(false);
  };

  const openBidsFor = (req) => {
    setActiveRequest(req);
    loadBids(req.id);
    setScreen("bids");
  };

  async function loadChat(shop, req) {
    try {
      const data = await db.select("messages", `request_id=eq.${req.id}&shop_id=eq.${shop.id}&order=created_at.asc`);
      setChatLog(data||[]);
    } catch(e) { console.error(e); }
  }

  const sendChat = async () => {
    if(!chatMsg.trim())return;
    try {
      await db.insert("messages", {
        request_id: activeRequest.id, shop_id: chatShop.id, sender: "customer", text: chatMsg,
      });
      setChatLog(p=>[...p,{sender:"customer",text:chatMsg}]);
      setChatMsg("");
    } catch(e) { console.error(e); }
  };

  if(screen==="chat") return (
    <div style={s.chatFull}>
      <div style={s.chatNav}>
        <button style={s.backBtn} onClick={()=>setScreen("bids")}>←</button>
        <div style={s.chatAvatar}>{chatShop?.name[0]}</div>
        <div style={{flex:1}}>
          <div style={s.chatShopName}>{chatShop?.name}</div>
          <div style={s.chatShopSub}>📍 {chatShop?.area} · {chatShop?.is_open?"🟢 Online":"🔴 Offline"}</div>
        </div>
        <div style={s.chatRating}>⭐ {chatShop?.rating||0}</div>
      </div>
      <div style={s.chatMessages}>
        {chatLog.length===0 && <div style={s.emptyMini}>No messages yet. Say hello!</div>}
        {chatLog.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:m.sender==="customer"?"flex-end":"flex-start",marginBottom:10}}>
            <div style={m.sender==="customer"?s.bubbleU:s.bubbleS}>{m.text}</div>
          </div>
        ))}
      </div>
      <div style={s.chatInputWrap}>
        <input style={s.chatField} placeholder="Type a message..." value={chatMsg} onChange={e=>setChatMsg(e.target.value)} onKeyDown={e=>e.key==="Enter"&&sendChat()} />
        <button style={s.sendBtn} onClick={sendChat}>➤</button>
      </div>
    </div>
  );

  if(screen==="bids") {
    const reqCat = CATEGORIES.find(c=>c.id===activeRequest?.category);
    return (
      <div style={s.root}>
        <div style={s.subNav}>
          <button style={s.backBtn} onClick={()=>setScreen("home")}>←</button>
          <div style={{flex:1}}>
            <div style={s.subNavTitle}>{reqCat?.icon} {activeRequest?.item}</div>
            <div style={s.subNavSub}>📍 {user.area} · {bids.filter(b=>b.available).length} shops responded</div>
          </div>
        </div>
        <div style={s.bidsPage}>
          <div style={s.reqSummary}>
            <div style={s.reqSumLabel}>YOUR REQUEST</div>
            <div style={s.reqSumItem}>{activeRequest?.item}</div>
            {activeRequest?.description && <div style={s.reqSumDesc}>{activeRequest.description}</div>}
            {activeRequest?.budget && <div style={s.reqSumBudget}>💰 {activeRequest.budget}</div>}
          </div>
          <div style={s.bidsLabel}>🏪 {bids.filter(b=>b.available).length} Shops Responded</div>
          {bids.length===0 && <div style={s.waitingPill}>⏳ Waiting for nearby shops to respond...</div>}
          {bids.map((bid,i)=>{
            const shop = shopsById[bid.shop_id];
            if(!shop) return null;
            return (
              <div key={i} style={{...s.bidCard,opacity:bid.available?1:0.5}}>
                <div style={s.bidHead}>
                  <div style={s.bidShopAv}>{shop.name[0]}</div>
                  <div style={{flex:1}}>
                    <div style={s.bidShopName}>{shop.name}</div>
                    <div style={s.bidShopMeta}>⭐{shop.rating||0} · 📍{shop.area}</div>
                  </div>
                  <div style={bid.available?s.avail:s.unavail}>{bid.available?"✅ Available":"❌ Unavailable"}</div>
                </div>
                {bid.available && <>
                  <div style={s.bidPriceRow}>
                    <span style={s.bidPrice}>{bid.price||"Price on chat"}</span>
                    <span style={bid.delivery?s.delivBadge:s.pickBadge}>{bid.delivery?"🛵 Delivery":"🏪 Pickup only"}</span>
                  </div>
                  {bid.eta && <div style={s.bidEta}>⏱ {bid.eta}</div>}
                </>}
                {bid.note && <div style={s.bidNote}>"{bid.note}"</div>}
                <div style={s.bidTime}>{new Date(bid.created_at).toLocaleTimeString()}</div>
                {bid.available && (
                  <div style={s.bidBtns}>
                    <button style={s.chatBidBtn} onClick={()=>{setChatShop(shop);loadChat(shop, activeRequest);setScreen("chat");}}>💬 Chat</button>
                    <button style={s.orderNowBtn}>📦 Order Now</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <div style={s.root}>
      {showR
