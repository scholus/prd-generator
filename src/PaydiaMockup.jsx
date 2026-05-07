import { useState } from "react";

const S = {
  screen: {
    display: "flex", alignItems: "center", justifyContent: "center",
    minHeight: "100vh", background: "#e5e7eb",
  },
  phone: {
    position: "relative", width: 390, height: 844, borderRadius: 44,
    background: "#fff", overflow: "hidden", display: "flex", flexDirection: "column",
    boxShadow: "0 30px 80px rgba(0,0,0,0.35), 0 0 0 1px rgba(0,0,0,0.08)",
  },
  scroll: { flex: 1, minHeight: 0, overflowY: "auto", scrollbarWidth: "none" },
  row: { display: "flex", alignItems: "center" },
  col: { display: "flex", flexDirection: "column" },
  btn: { background: "none", border: "none", cursor: "pointer", padding: 0 },
};

function Toast({ message, visible }) {
  return (
    <div style={{
      position: "fixed", top: 64, left: "50%", transform: `translateX(-50%) translateY(${visible ? 0 : -8}px)`,
      background: "rgba(30,30,30,0.9)", color: "#fff", fontSize: 13, padding: "8px 18px",
      borderRadius: 24, boxShadow: "0 4px 16px rgba(0,0,0,0.18)", zIndex: 999,
      opacity: visible ? 1 : 0, transition: "opacity 0.25s, transform 0.25s",
      pointerEvents: "none", whiteSpace: "nowrap",
    }}>{message}</div>
  );
}

function PaydiaLogo() {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
      <div style={{
        width: 32, height: 32, borderRadius: 9, background: "#1e3a8a",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <span style={{ color: "#fff", fontWeight: 700, fontSize: 20, fontFamily: "Georgia, serif", lineHeight: 1 }}>p</span>
      </div>
      <span style={{ color: "#1e3a8a", fontWeight: 800, fontSize: 20, letterSpacing: -0.5 }}>paydia</span>
    </div>
  );
}

function QuickAction({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      ...S.btn, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, color: "#fff",
    }}>
      <div style={{
        width: 48, height: 48, borderRadius: "50%", border: "1.5px solid rgba(255,255,255,0.5)",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>{icon}</div>
      <span style={{ fontSize: 12, fontWeight: 500 }}>{label}</span>
    </button>
  );
}

function ServiceItem({ icon, label, onClick }) {
  return (
    <button onClick={onClick} style={{
      ...S.btn, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, width: "25%",
    }}>
      <div style={{
        width: 56, height: 56, borderRadius: "50%", background: "#EEF2FF",
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>{icon}</div>
      <span style={{ fontSize: 11, color: "#374151", textAlign: "center", lineHeight: 1.3, fontWeight: 500 }}>
        {label.split("\n").map((l, i) => <span key={i}>{i > 0 && <br />}{l}</span>)}
      </span>
    </button>
  );
}

// SVG icon components
const IconBell = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/>
  </svg>
);
const IconTopUp = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/>
  </svg>
);
const IconSend = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
  </svg>
);
const IconReceive = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/>
  </svg>
);
const IconMerchant = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 9l1-7h16l1 7"/><path d="M3 9a2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0 2 2 0 0 0 4 0"/>
    <path d="M5 9v12h14V9"/><rect x="9" y="14" width="6" height="7"/>
  </svg>
);
const IconKomunitas = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/>
    <path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
  </svg>
);
const IconPulsa = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="5" y="2" width="14" height="20" rx="2"/><path d="M12 18h.01"/>
    <path d="M8.5 8 C9 6 11 5.5 12 7 C13 8.5 11 10 12 11.5 C13 13 15 12.5 15.5 14" strokeWidth="1.6"/>
  </svg>
);
const IconPLN = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
  </svg>
);
const IconPDAM = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
  </svg>
);
const IconBPJS = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17" strokeWidth="2.5"/>
  </svg>
);
const IconTagihan = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
    <polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
  </svg>
);
const IconKasbon = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <rect x="2" y="5" width="20" height="14" rx="2"/>
    <line x1="2" y1="10" x2="22" y2="10"/><line x1="7" y1="15" x2="12" y2="15"/>
  </svg>
);
const IconInternet = () => (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#3B5BDB" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12.55a11 11 0 0 1 14.08 0"/>
    <path d="M1.42 9a16 16 0 0 1 21.16 0"/>
    <path d="M8.53 16.11a6 6 0 0 1 6.95 0"/>
    <line x1="12" y1="20" x2="12.01" y2="20" strokeWidth="3"/>
  </svg>
);
const IconHome = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill={active ? "#1e40af" : "#9CA3AF"}>
    <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
  </svg>
);
const IconHeart = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#1e40af" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>
);
const IconClock = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#1e40af" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
  </svg>
);
const IconUser = ({ active }) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke={active ? "#1e40af" : "#9CA3AF"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);
const IconEyeOff = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
    <line x1="1" y1="1" x2="23" y2="23"/>
  </svg>
);
const IconEye = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
  </svg>
);
const IconQRIS = () => (
  <svg width="36" height="36" viewBox="0 0 40 40" fill="white">
    <rect x="4" y="4" width="13" height="13" rx="2" fill="none" stroke="white" strokeWidth="2.5"/>
    <rect x="7" y="7" width="7" height="7" rx="1"/>
    <rect x="23" y="4" width="13" height="13" rx="2" fill="none" stroke="white" strokeWidth="2.5"/>
    <rect x="26" y="7" width="7" height="7" rx="1"/>
    <rect x="4" y="23" width="13" height="13" rx="2" fill="none" stroke="white" strokeWidth="2.5"/>
    <rect x="7" y="26" width="7" height="7" rx="1"/>
    <line x1="23" y1="23" x2="36" y2="23" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="23" y1="23" x2="23" y2="36" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="36" y1="29" x2="29" y2="29" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="29" y1="29" x2="29" y2="36" stroke="white" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="36" cy="36" r="1.5" fill="white"/>
  </svg>
);

const services1 = [
  { icon: <IconKomunitas />, label: "Komunitas" },
  { icon: <IconPulsa />, label: "Pulsa &\nPaket Data" },
  { icon: <IconPLN />, label: "PLN" },
  { icon: <IconPDAM />, label: "PDAM" },
];
const services2 = [
  { icon: <IconBPJS />, label: "BPJS\nKesehatan" },
  { icon: <IconTagihan />, label: "Tagihan" },
  { icon: <IconKasbon />, label: "Kasbon" },
  { icon: <IconInternet />, label: "Internet" },
];

export default function PaydiaMockup() {
  const [activeTab, setActiveTab] = useState("home");
  const [balanceVisible, setBalanceVisible] = useState(false);
  const [toast, setToast] = useState({ visible: false, message: "" });
  const [page, setPage] = useState(0);

  const PHONE_W = 390, PHONE_H = 844;
  const scale = Math.min(window.innerWidth / PHONE_W, window.innerHeight / PHONE_H, 1);

  const showToast = (msg) => {
    setToast({ visible: true, message: msg });
    setTimeout(() => setToast({ visible: false, message: "" }), 2000);
  };

  return (
    <div style={S.screen}>
      <Toast message={toast.message} visible={toast.visible} />

      <div style={{
        transform: `scale(${scale})`,
        transformOrigin: "top center",
        marginBottom: scale < 1 ? PHONE_H * (scale - 1) : 0,
      }}>
      <div style={S.phone}>
        {/* Status bar */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 24px 4px", background: "#fff" }}>
          <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>13.22</span>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {/* Signal bars */}
            <svg width="16" height="14" viewBox="0 0 16 14">
              <rect x="0" y="8" width="3" height="6" rx="0.5" fill="#111"/>
              <rect x="4.5" y="5" width="3" height="9" rx="0.5" fill="#111"/>
              <rect x="9" y="2" width="3" height="12" rx="0.5" fill="#111"/>
              <rect x="13.5" y="0" width="2.5" height="14" rx="0.5" fill="#111" opacity="0.25"/>
            </svg>
            {/* Wifi */}
            <svg width="18" height="14" viewBox="0 0 24 18" fill="none" stroke="#111" strokeWidth="2.5" strokeLinecap="round">
              <path d="M1 5.5a18 18 0 0 1 22 0" opacity="0.25"/>
              <path d="M4 9.5a13 13 0 0 1 16 0" opacity="0.5"/>
              <path d="M7.5 13a8 8 0 0 1 9 0" opacity="0.8"/>
              <circle cx="12" cy="17" r="1.2" fill="#111" stroke="none"/>
            </svg>
            {/* Battery */}
            <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
              <div style={{ width: 25, height: 12, borderRadius: 3, border: "1.5px solid #111", position: "relative", display: "flex", alignItems: "center", padding: "1px 1.5px" }}>
                <div style={{ width: "40%", height: "100%", background: "#111", borderRadius: 1.5 }} />
              </div>
              <div style={{ width: 3, height: 6, background: "#111", borderRadius: "0 1px 1px 0", opacity: 0.5 }} />
            </div>
          </div>
        </div>

        {/* Scrollable body */}
        <div style={{ ...S.scroll }}>

          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 20px 6px", background: "#fff" }}>
            <PaydiaLogo />
            <button onClick={() => showToast("Notifikasi")} style={{ ...S.btn, position: "relative", color: "#111" }}>
              <IconBell />
              <span style={{ position: "absolute", top: -1, right: -1, width: 10, height: 10, background: "#ef4444", borderRadius: "50%", border: "2px solid #fff" }} />
            </button>
          </div>

          {/* User name + Gold */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 20px 4px", background: "#fff" }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#111" }}>Dion</span>
            <button onClick={() => showToast("Paydia Gold")} style={{
              ...S.btn, background: "#B8860B", color: "#fff", fontSize: 11, fontWeight: 700,
              padding: "4px 12px", borderRadius: 20, display: "flex", alignItems: "center", gap: 5,
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><circle cx="12" cy="12" r="10"/></svg>
              Gold
            </button>
          </div>

          {/* Balance */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "2px 20px 12px", background: "#fff" }}>
            <span style={{ fontSize: 15, color: "#1f2937", letterSpacing: balanceVisible ? 0 : 3, fontWeight: 600 }}>
              {balanceVisible ? "Rp 1.250.000" : "•••••••"}
            </span>
            <button onClick={() => setBalanceVisible(!balanceVisible)} style={{ ...S.btn }}>
              {balanceVisible ? <IconEye /> : <IconEyeOff />}
            </button>
          </div>

          {/* Quick Actions Blue Card */}
          <div style={{
            margin: "0 16px 14px",
            borderRadius: 18,
            padding: "20px 16px",
            background: "linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-around" }}>
              <QuickAction icon={<IconTopUp />} label="Top Up" onClick={() => showToast("Top Up")} />
              <QuickAction icon={<IconSend />} label="Kirim" onClick={() => showToast("Kirim")} />
              <QuickAction icon={<IconReceive />} label="Minta Uang" onClick={() => showToast("Minta Uang")} />
              <QuickAction icon={<IconMerchant />} label="Merchant" onClick={() => showToast("Merchant")} />
            </div>
          </div>

          {/* Two-col cards */}
          <div style={{ display: "flex", gap: 12, margin: "0 16px 14px" }}>
            {/* Transaksi Favorit */}
            <button onClick={() => showToast("Transaksi Favorit")} style={{
              ...S.btn, flex: 1, background: "#fff", border: "1px solid #e5e7eb",
              borderRadius: 18, padding: 14, textAlign: "left", minHeight: 120,
              display: "flex", flexDirection: "column", gap: 6,
            }}>
              <span style={{ fontSize: 13, fontWeight: 700, color: "#1f2937" }}>Transaksi Favorit</span>
              <div style={{
                width: 32, height: 32, borderRadius: "50%", border: "2px solid #d1d5db",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                </svg>
              </div>
              <span style={{ fontSize: 11, color: "#9CA3AF", lineHeight: 1.4 }}>Kamu belum punya transaksi favorit</span>
            </button>

            {/* Promo card */}
            <button onClick={() => showToast("Fitur Minta Uang")} style={{
              ...S.btn, flex: 1, borderRadius: 18, minHeight: 120, overflow: "hidden",
              background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
              position: "relative", display: "flex", flexDirection: "column", padding: 12, textAlign: "left",
            }}>
              {/* Mini phone illustration */}
              <div style={{
                position: "absolute", right: 8, top: 8, width: 56, height: 80,
                background: "rgba(255,255,255,0.1)", borderRadius: 10,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <svg width="28" height="44" viewBox="0 0 28 44" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5">
                  <rect x="2" y="2" width="24" height="40" rx="4"/>
                  <line x1="8" y1="12" x2="20" y2="12"/><line x1="8" y1="17" x2="20" y2="17"/>
                  <line x1="8" y1="22" x2="16" y2="22"/>
                </svg>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 4 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: "rgba(255,255,255,0.2)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 11, fontFamily: "Georgia,serif" }}>p</span>
                </div>
                <span style={{ color: "#fff", fontSize: 11, fontWeight: 600 }}>paydia</span>
              </div>
              <div style={{ marginTop: "auto" }}>
                <span style={{ color: "#FDE68A", fontSize: 11, fontWeight: 700, display: "block", marginBottom: 3 }}>✦ New Feature</span>
                <p style={{ color: "#fff", fontSize: 12, fontWeight: 600, lineHeight: 1.4, margin: 0 }}>
                  Split Bill Gak Jadi Drama dengan fitur{" "}
                  <span style={{ color: "#93C5FD", fontWeight: 700 }}>Minta Uang</span>
                </p>
              </div>
            </button>
          </div>

          {/* Services Grid */}
          <div style={{
            margin: "0 16px 14px", background: "#fff", borderRadius: 18,
            padding: "16px 8px 12px", border: "1px solid #f3f4f6",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
          }}>
            {/* Slide container */}
            <div style={{ overflow: "hidden" }}>
              <div style={{
                display: "flex", transition: "transform 0.3s ease",
                transform: `translateX(${-page * 100}%)`,
                width: "200%",
              }}>
                {[services1, services2].map((services, si) => (
                  <div key={si} style={{ display: "flex", width: "50%", padding: "4px 0" }}>
                    {services.map((s, i) => (
                      <ServiceItem key={i} icon={s.icon} label={s.label} onClick={() => showToast(s.label.replace("\n", " "))} />
                    ))}
                  </div>
                ))}
              </div>
            </div>

            {/* Dots */}
            <div style={{ display: "flex", justifyContent: "center", gap: 8, marginTop: 14 }}>
              {[0, 1].map(i => (
                <button key={i} onClick={() => setPage(i)} style={{
                  ...S.btn,
                  width: i === page ? 24 : 8, height: 8, borderRadius: 4,
                  background: i === page ? "#1e40af" : "#CBD5E1",
                  transition: "width 0.3s, background 0.3s",
                }} />
              ))}
            </div>
          </div>

          {/* Banner */}
          <div style={{
            margin: "0 16px 90px", borderRadius: 18, overflow: "hidden", height: 150,
            background: "linear-gradient(130deg, #1e3a8a 0%, #4f46e5 50%, #7c3aed 100%)",
            position: "relative", display: "flex", alignItems: "flex-end", padding: 16,
          }}>
            {/* Decorative circles */}
            <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
              <div style={{ position: "absolute", width: 120, height: 120, borderRadius: "50%", background: "rgba(255,255,255,0.05)", top: -30, right: -20 }} />
              <div style={{ position: "absolute", width: 90, height: 90, borderRadius: "50%", background: "rgba(99,102,241,0.2)", top: 10, right: 60 }} />
              <div style={{ position: "absolute", width: 80, height: 80, borderRadius: "50%", background: "rgba(167,139,250,0.15)", bottom: -20, left: "55%" }} />
            </div>
            {/* Silhouette group (simulated) */}
            <div style={{ position: "absolute", right: 12, top: 12, display: "flex", gap: 6, opacity: 0.35 }}>
              {[0, 1, 2, 3].map(i => (
                <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff" }} />
                  <div style={{ width: 14, height: 28, borderRadius: "6px 6px 0 0", background: "#fff" }} />
                </div>
              ))}
            </div>
            {/* Text */}
            <div style={{ position: "relative", zIndex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 5 }}>
                <div style={{ width: 16, height: 16, borderRadius: 4, background: "rgba(255,255,255,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 10, fontFamily: "Georgia,serif" }}>p</span>
                </div>
                <span style={{ color: "rgba(255,255,255,0.85)", fontSize: 11, fontWeight: 600 }}>paydia</span>
              </div>
              <p style={{ color: "#fff", fontSize: 14, fontWeight: 700, lineHeight: 1.4, margin: 0 }}>
                Bayar lebih mudah<br />bersama teman-teman
              </p>
            </div>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div style={{
          position: "absolute", bottom: 0, left: 0, right: 0,
          background: "#fff", borderTop: "1px solid #f1f5f9",
          paddingBottom: 20,
        }}>
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-around", padding: "8px 16px 0" }}>
            <button onClick={() => setActiveTab("home")} style={{ ...S.btn, display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 4 }}>
              <IconHome active={activeTab === "home"} />
            </button>
            <button onClick={() => setActiveTab("fav")} style={{ ...S.btn, display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 4 }}>
              <IconHeart active={activeTab === "fav"} />
            </button>
            {/* QRIS center button */}
            <button onClick={() => showToast("QRIS Scanner")} style={{
              ...S.btn, marginTop: -20, width: 64, height: 64, borderRadius: "50%",
              background: "linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%)",
              display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 16px rgba(30,64,175,0.4)", zIndex: 10,
            }}>
              <IconQRIS />
            </button>
            <button onClick={() => setActiveTab("history")} style={{ ...S.btn, display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 4 }}>
              <IconClock active={activeTab === "history"} />
            </button>
            <button onClick={() => setActiveTab("profile")} style={{ ...S.btn, display: "flex", flexDirection: "column", alignItems: "center", paddingBottom: 4 }}>
              <IconUser active={activeTab === "profile"} />
            </button>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
