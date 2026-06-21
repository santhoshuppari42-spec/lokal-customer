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
      {showReqModal && (
        <div style={s.overlay}>
          <div style={s.modal}>
            <div style={s.modalTop}>
              <span style={s.modalTitle}>{cat?.icon} {cat?.label}</span>
              <button style={s.modalClose} onClick={()=>setShowReqModal(false)}>✕</button>
            </div>
            <label style={s.lbl}>What do you need?</label>
            <div style={s.subChips}>
              {cat?.sub.map(sub=>(
                <button key={sub} style={{...s.chip,...(reqForm.item===sub?s.chipA:{})}} onClick={()=>setReqForm(f=>({...f,item:sub}))}>{sub}</button>
              ))}
            </div>
            <input style={{...s.inp,marginTop:10}} placeholder="Or type something specific..." value={reqForm.item} onChange={e=>setReqForm(f=>({...f,item:e.target.value}))} />
            <label style={s.lbl}>Describe (size, color, brand...)</label>
            <textarea style={{...s.inp,height:70,resize:"none"}} placeholder="e.g. Blue, size M, Nike brand..." value={reqForm.desc} onChange={e=>setReqForm(f=>({...f,desc:e.target.value}))} />
            <label style={s.lbl}>Budget</label>
            <input style={s.inp} placeholder="e.g. ₹500 – ₹1,000" value={reqForm.budget} onChange={e=>setReqForm(f=>({...f,budget:e.target.value}))} />
            <button style={{...s.btn,marginTop:12,opacity:reqForm.item?1:0.4}} onClick={postRequest}>
              {posting?"Posting...":"🚀 Post to Nearby Shops"}
            </button>
          </div>
        </div>
      )}
      
      <div style={s.nav}>
        <div style={s.navBrand}>🛒 <span style={s.navBrandText}>Lokál</span></div>
        <div style={s.navLoc}>📍 {user.area}</div>
        <div style={s.navUser}>
          <div style={s.navAvatar}>{user.name[0]}</div>
          <button style={s.navLogout} onClick={onLogout}>Logout</button>
        </div>
      </div>

      {tab==="home" && <>
        <div style={s.searchWrap}>
          <div style={s.searchBox}>
            <span style={{fontSize:16}}>🔍</span>
            <input style={s.searchInp} placeholder="Search anything..." value={search} onChange={e=>setSearch(e.target.value)} />
            {search && <button style={s.clearSearch} onClick={()=>setSearch("")}>✕</button>}
          </div>
        </div>

        {!search && (
          <div style={s.heroBanner}>
            <div style={s.heroTitle}>Hi {user.name.split(" ")[0]}! 👋</div>
            <div style={s.heroSub}>What do you need today?</div>
            <div style={s.heroMeta}>Shops near <b>{user.area}</b> will respond instantly</div>
          </div>
        )}

        <div style={s.section}>
          <div style={s.sectionTitle}>{search?`"${search}"`:"Browse Categories"}</div>
          <div style={s.catGrid}>
            {filteredCats.map(c=>(
              <div key={c.id} style={s.catCard} onClick={()=>{setActiveCategory(c.id);setShowReqModal(true);}}>
                <div style={s.catIcon}>{c.icon}</div>
                <div style={s.catLabel}>{c.label}</div>
                <div style={s.catPost}>Post →</div>
              </div>
            ))}
          </div>
        </div>

        {myRequests.length>0 && (
          <div style={s.section}>
            <div style={s.sectionTitle}>📋 My Requests</div>
            {myRequests.map(req=>{
              const c=CATEGORIES.find(x=>x.id===req.category);
              return (
                <div key={req.id} style={s.reqRow} onClick={()=>openBidsFor(req)}>
                  <div style={s.reqRowIcon}>{c?.icon}</div>
                  <div style={{flex:1}}>
                    <div style={s.reqRowItem}>{req.item}</div>
                    <div style={s.reqRowMeta}>{c?.label} · {new Date(req.created_at).toLocaleDateString()}</div>
                  </div>
                  <div style={s.reqRowBadge}>View Bids</div>
                </div>
              );
            })}
          </div>
        )}
      </>}

      {tab==="profile" && (
        <div style={s.section}>
          <div style={s.profileCard}>
            <div style={s.profileAvatar}>{user.name[0]}</div>
            <div style={s.profileName}>{user.name}</div>
            <div style={s.profileMeta}>📧 {user.email}</div>
            <div style={s.profileMeta}>📞 {user.phone}</div>
            <div style={s.profileMeta}>📍 {user.area}, {user.city}</div>
          </div>
          <button style={{...s.btn,background:"#EF4444"}} onClick={onLogout}>🚪 Logout</button>
        </div>
      )}

      <div style={s.bottomNav}>
        {[{key:"home",icon:"🏠",label:"Home"},{key:"profile",icon:"👤",label:"Profile"}].map(t=>(
          <button key={t.key} style={s.bottomBtn} onClick={()=>setTab(t.key)}>
            <span style={s.bottomIcon}>{t.icon}</span>
            <span style={s.bottomLabel}>{t.label}</span>
          </button>
        ))}
      </div>
      <div style={{height:70}}/>
    </div>
  );
}

export default function App() {
  const [screen, setScreen] = useState("splash");
  const [user, setUser] = useState(null);
  if(screen==="splash")  return <SplashScreen onLogin={()=>setScreen("login")} onSignup={()=>setScreen("signup")} />;
  if(screen==="login")   return <LoginScreen onSuccess={u=>{setUser(u);setScreen("home");}} onSignup={()=>setScreen("signup")} onBack={()=>setScreen("splash")} />;
  if(screen==="signup")  return <SignupScreen onSuccess={u=>{setUser(u);setScreen("home");}} onLogin={()=>setScreen("login")} onBack={()=>setScreen("splash")} />;
  if(screen==="home")    return <HomeScreen user={user} onLogout={()=>setScreen("splash")} />;
  return null;
}

const s = {
  root:{fontFamily:"'Inter',system-ui,sans-serif",background:"#F8F9FB",minHeight:"100vh"},
  splash:{position:"relative",minHeight:"100vh",fontFamily:"'Inter',system-ui,sans-serif",overflow:"hidden",background:"#1E1B4B"},
  splashBg:{position:"absolute",inset:0,background:"linear-gradient(135deg,#1E1B4B 0%,#4F46E5 60%,#7C3AED 100%)"},
  splashContent:{position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",minHeight:"100vh",padding:24,textAlign:"center"},
  splashLogo:{fontSize:64,marginBottom:8},
  splashBrand:{fontWeight:900,fontSize:48,color:"#fff",letterSpacing:"-2px",marginBottom:6},
  splashTagline:{color:"rgba(255,255,255,0.8)",fontSize:18,lineHeight:1.5,marginBottom:36},
  splashActions:{display:"flex",flexDirection:"column",gap:12,width:"100%",maxWidth:320,marginBottom:28},
  splashSignup:{background:"#fff",color:"#4F46E5",border:"none",padding:"15px",borderRadius:12,fontSize:16,fontWeight:900,cursor:"pointer"},
  splashLogin:{background:"rgba(255,255,255,0.15)",color:"#fff",border:"2px solid rgba(255,255,255,0.4)",padding:"15px",borderRadius:12,fontSize:16,fontWeight:700,cursor:"pointer"},
  splashSeller:{color:"rgba(255,255,255,0.5)",fontSize:13},
  splashSellerLink:{color:"rgba(255,255,255,0.8)",fontWeight:700},
  authPage:{fontFamily:"'Inter',system-ui,sans-serif",background:"#F8F9FB",minHeight:"100vh"},
  authNav:{background:"#fff",borderBottom:"1px solid #E5E7EB",padding:"12px 16px",display:"flex",alignItems:"center",justifyContent:"space-between"},
  authNavBrand:{fontSize:18,letterSpacing:"-0.3px"},
  backBtn:{background:"none",border:"none",fontSize:20,color:"#374151",cursor:"pointer",width:32,fontWeight:700},
  stepCounter:{fontSize:13,fontWeight:700,color:"#9CA3AF"},
  progressBar:{height:3,background:"#E5E7EB"},
  progressFill:{height:3,background:"#4F46E5",transition:"width 0.3s"},
  authBody:{padding:"28px 20px"},
  authTitle:{fontWeight:900,fontSize:26,margin:"0 0 6px",letterSpacing:"-0.5px"},
  authSub:{color:"#6B7280",fontSize:14,marginBottom:22},
  authCard:{background:"#fff",border:"1px solid #E5E7EB",borderRadius:16,padding:22,marginBottom:16},
  lbl:{display:"block",fontWeight:700,fontSize:13,color:"#374151",marginBottom:5},
  inp:{width:"100%",boxSizing:"border-box",border:"1.5px solid #E5E7EB",borderRadius:8,padding:"11px 12px",fontSize:14,marginBottom:14,outline:"none",color:"#111",fontFamily:"inherit"},
  btn:{width:"100%",background:"#4F46E5",color:"#fff",border:"none",padding:"13px",borderRadius:10,fontSize:15,fontWeight:800,cursor:"pointer",fontFamily:"inherit"},
  eyeBtn:{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",background:"none",border:"none",cursor:"pointer",fontSize:16,marginTop:-7},
  errMsg:{color:"#EF4444",fontSize:13,marginBottom:12,fontWeight:600,background:"#FEF2F2",padding:"8px 12px",borderRadius:8},
  savingMsg:{color:"#4F46E5",fontSize:13,fontWeight:600,background:"#EEF2FF",padding:"8px 12px",borderRadius:8,marginBottom:12},
  switchRow:{textAlign:"center",fontSize:14,color:"#6B7280"},
  switchBtn:{background:"none",border:"none",color:"#4F46E5",fontWeight:700,cursor:"pointer",fontSize:14},
  otpSentBox:{background:"#D1FAE5",color:"#065F46",fontWeight:700,fontSize:13,padding:"10px 12px",borderRadius:8,marginBottom:16},
  otpRow:{display:"flex",gap:8,justifyContent:"center",marginBottom:16},
  otpBox:{width:42,height:48,textAlign:"center",fontSize:20,fontWeight:800,border:"2px solid #E5E7EB",borderRadius:8,outline:"none",fontFamily:"inherit"},
  gpsBtn:{width:"100%",background:"#4F46E5",color:"#fff",border:"none",padding:"12px",borderRadius:10,fontSize:14,fontWeight:800,cursor:"pointer",marginBottom:12,fontFamily:"inherit"},
  orDivider:{textAlign:"center",color:"#9CA3AF",fontSize:12,marginBottom:12},
  cityRow:{display:"flex",flexWrap:"wrap",gap:8,marginBottom:8},
  cBtn:{border:"1.5px solid #E5E7EB",background:"#fff",borderRadius:8,padding:"7px 12px",fontSize:13,fontWeight:600,cursor:"pointer",fontFamily:"inherit"},
  cBtnA:{border:"1.5px solid #4F46E5",background:"#EEF2FF",color:"#4F46E5"},
  drop:{position:"absolute",top:"100%",left:0,right:0,background:"#fff",border:"1.5px solid #E5E7EB",borderRadius:8,zIndex:99,boxShadow:"0 4px 16px rgba(0,0,0,0.12)",maxHeight:180,overflowY:"auto"},
  dItem:{padding:"10px 14px",fontSize:13,cursor:"pointer",borderBottom:"1px solid #F3F4F6"},
  nav:{background:"#fff",borderBottom:"1px solid #E5E7EB",padding:"10px 16px",display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:50},
  navBrand:{display:"flex",alignItems:"center",gap:5,fontWeight:900,fontSize:20,color:"#4F46E5",flexShrink:0},
  navBrandText:{letterSpacing:"-0.5px"},
  navLoc:{flex:1,textAlign:"center",fontSize:12,fontWeight:700,color:"#4F46E5",background:"#EEF2FF",padding:"5px 12px",borderRadius:20},
  navUser:{display:"flex",alignItems:"center",gap:8},
  navAvatar:{width:30,height:30,borderRadius:"50%",background:"#4F46E5",color:"#fff",fontWeight:900,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center"},
  navLogout:{background:"none",border:"1px solid #E5E7EB",color:"#9CA3AF",fontSize:11,padding:"4px 8px",borderRadius:6,cursor:"pointer"},
  searchWrap:{padding:"10px 14px",background:"#fff",borderBottom:"1px solid #F3F4F6"},
  searchBox:{display:"flex",alignItems:"center",gap:8,background:"#F3F4F6",borderRadius:12,padding:"10px 14px"},
  searchInp:{flex:1,background:"none",border:"none",outline:"none",fontSize:14,color:"#111",fontFamily:"inherit"},
  clearSearch:{background:"none",border:"none",color:"#9CA3AF",cursor:"pointer",fontSize:16},
  heroBanner:{background:"linear-gradient(135deg,#4F46E5,#7C3AED)",padding:"22px 20px"},
  heroTitle:{color:"#fff",fontWeight:900,fontSize:22,marginBottom:4},
  heroSub:{color:"rgba(255,255,255,0.9)",fontSize:15,marginBottom:4},
  heroMeta:{color:"rgba(255,255,255,0.7)",fontSize:12},
  section:{padding:"16px"},
  sectionTitle:{fontWeight:900,fontSize:16,marginBottom:12},
  catGrid:{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10},
  catCard:{background:"#fff",borderRadius:14,padding:"14px 10px",border:"1px solid #E5E7EB",cursor:"pointer",textAlign:"center"},
  catIcon:{fontSize:26,marginBottom:6},
  catLabel:{fontWeight:700,fontSize:12,marginBottom:6},
  catPost:{background:"#EEF2FF",color:"#4F46E5",fontSize:10,fontWeight:800,padding:"4px 8px",borderRadius:6},
  reqRow:{background:"#fff",border:"1px solid #E5E7EB",borderRadius:12,padding:"12px 14px",display:"flex",alignItems:"center",gap:10,marginBottom:8,cursor:"pointer"},
  reqRowIcon:{fontSize:22},
  reqRowItem:{fontWeight:800,fontSize:13,marginBottom:2},
  reqRowMeta:{fontSize:11,color:"#9CA3AF"},
  reqRowBadge:{background:"#EEF2FF",color:"#4F46E5",fontSize:11,fontWeight:800,padding:"4px 10px",borderRadius:20,whiteSpace:"nowrap"},
  overlay:{position:"fixed",inset:0,background:"rgba(0,0,0,0.6)",zIndex:100,display:"flex",alignItems:"flex-end"},
  modal:{background:"#fff",borderRadius:"20px 20px 0 0",width:"100%",maxHeight:"90vh",overflowY:"auto",padding:"20px 18px 36px"},
  modalTop:{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14},
  modalTitle:{fontWeight:900,fontSize:17},
  modalClose:{background:"none",border:"none",fontSize:22,cursor:"pointer",color:"#9CA3AF"},
  subChips:{display:"flex",flexWrap:"wrap",gap:7},
  chip:{border:"1.5px solid #E5E7EB",background:"#fff",borderRadius:8,padding:"6px 11px",fontSize:12,fontWeight:600,cursor:"pointer",fontFamily:"inherit"},
  chipA:{border:"1.5px solid #4F46E5",background:"#EEF2FF",color:"#4F46E5"},
  subNav:{background:"#fff",borderBottom:"1px solid #E5E7EB",padding:"11px 14px",display:"flex",alignItems:"center",gap:10,position:"sticky",top:0,zIndex:10},
  subNavTitle:{fontWeight:900,fontSize:15},
  subNavSub:{fontSize:11,color:"#6B7280",marginTop:2},
  bidsPage:{padding:14},
  reqSummary:{background:"#EEF2FF",border:"1.5px solid #C7D2FE",borderRadius:12,padding:"12px 14px",marginBottom:14},
  reqSumLabel:{fontSize:10,fontWeight:800,color:"#4F46E5",letterSpacing:"0.5px",marginBottom:4},
  reqSumItem:{fontWeight:900,fontSize:16,marginBottom:3},
  reqSumDesc:{fontSize:13,color:"#374151",marginBottom:3},
  reqSumBudget:{fontSize:13,color:"#059669",fontWeight:700},
  bidsLabel:{fontWeight:800,fontSize:14,marginBottom:10},
  emptyMini:{color:"#9CA3AF",fontSize:13,textAlign:"center",padding:20},
  bidCard:{background:"#fff",border:"1px solid #E5E7EB",borderRadius:14,padding:14,marginBottom:10},
  bidHead:{display:"flex",alignItems:"center",gap:10,marginBottom:10},
  bidShopAv:{width:38,height:38,borderRadius:10,background:"#4F46E5",color:"#fff",fontWeight:900,fontSize:17,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},
  bidShopName:{fontWeight:800,fontSize:14,marginBottom:2},
  bidShopMeta:{fontSize:12,color:"#9CA3AF"},
  avail:{background:"#D1FAE5",color:"#059669",fontSize:11,fontWeight:800,padding:"4px 9px",borderRadius:20,flexShrink:0},
  unavail:{background:"#FEE2E2",color:"#DC2626",fontSize:11,fontWeight:800,padding:"4px 9px",borderRadius:20,flexShrink:0},
  bidPriceRow:{display:"flex",alignItems:"center",gap:10,marginBottom:5},
  bidPrice:{fontWeight:900,fontSize:20},
  delivBadge:{background:"#D1FAE5",color:"#059669",fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:20},
  pickBadge:{background:"#F3F4F6",color:"#6B7280",fontSize:11,fontWeight:700,padding:"3px 8px",borderRadius:20},
  bidEta:{fontSize:12,color:"#F59E0B",fontWeight:700,marginBottom:5},
  bidNote:{fontSize:12,color:"#6B7280",fontStyle:"italic",marginBottom:4,lineHeight:1.4},
  bidTime:{fontSize:11,color:"#D1D5DB",marginBottom:10},
  bidBtns:{display:"flex",gap:8},
  chatBidBtn:{flex:1,background:"#EEF2FF",color:"#4F46E5",border:"none",padding:"9px",borderRadius:8,fontWeight:800,cursor:"pointer",fontSize:13},
  orderNowBtn:{flex:1,background:"#4F46E5",color:"#fff",border:"none",padding:"9px",borderRadius:8,fontWeight:800,cursor:"pointer",fontSize:13},
  waitingPill:{background:"#FFFBEB",border:"1px solid #FCD34D",borderRadius:20,padding:"9px 16px",fontSize:13,color:"#92400E",fontWeight:600,textAlign:"center"},
  chatFull:{fontFamily:"'Inter',system-ui,sans-serif",display:"flex",flexDirection:"column",height:"100vh",background:"#F0F4FF"},
  chatNav:{background:"#4F46E5",padding:"12px 14px",display:"flex",alignItems:"center",gap:10},
  chatAvatar:{width:36,height:36,borderRadius:10,background:"rgba(255,255,255,0.2)",color:"#fff",fontWeight:900,fontSize:16,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0},
  chatShopName:{fontWeight:800,fontSize:15,color:"#fff"},
  chatShopSub:{fontSize:11,color:"rgba(255,255,255,0.7)"},
  chatRating:{color:"#fff",fontSize:13,fontWeight:700},
  chatMessages:{flex:1,overflowY:"auto",padding:"16px 14px"},
  bubbleU:{background:"#4F46E5",color:"#fff",padding:"10px 14px",borderRadius:"16px 16px 4px 16px",maxWidth:260,fontSize:14,lineHeight:1.5},
  bubbleS:{background:"#fff",color:"#111",padding:"10px 14px",borderRadius:"16px 16px 16px 4px",maxWidth:260,fontSize:14,lineHeight:1.5,boxShadow:"0 1px 4px rgba(0,0,0,0.08)"},
  chatInputWrap:{background:"#fff",borderTop:"1px solid #E5E7EB",padding:"10px 14px",display:"flex",gap:8,alignItems:"center"},
  chatField:{flex:1,border:"1.5px solid #E5E7EB",borderRadius:22,padding:"10px 14px",fontSize:14,outline:"none",fontFamily:"inherit"},
  sendBtn:{background:"#4F46E5",color:"#fff",border:"none",width:40,height:40,borderRadius:"50%",fontWeight:900,cursor:"pointer",fontSize:16,display:"flex",alignItems:"center",justifyContent:"center"},
  bottomNav:{position:"fixed",bottom:0,left:0,right:0,background:"#fff",borderTop:"1px solid #E5E7EB",display:"flex",zIndex:50},
  bottomBtn:{flex:1,background:"none",border:"none",padding:"8px 0 6px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",gap:2},
  bottomIcon:{fontSize:22},
  bottomLabel:{fontSize:10,fontWeight:700,color:"#9CA3AF"},
  profileCard:{background:"#fff",border:"1px solid #E5E7EB",borderRadius:16,padding:24,textAlign:"center",marginBottom:16},
  profileAvatar:{width:64,height:64,borderRadius:"50%",background:"#4F46E5",color:"#fff",fontWeight:900,fontSize:28,display:"flex",alignItems:"center",justifyContent:"center",margin:"0 auto 12px"},
  profileName:{fontWeight:900,fontSize:20,marginBottom:6},
  profileMeta:{fontSize:13,color:"#6B7280",marginBottom:4},
};
