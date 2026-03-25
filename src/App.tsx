import React, { useState, useEffect } from 'react';
import { 
  Shield, Layout, ScanSearch, Bell, Users, BarChart3, 
  Settings, Globe, AlertTriangle, CheckCircle2, ChevronRight,
  Search, Download, Plus, RefreshCw, Activity, ShieldAlert,
  ToggleLeft, ToggleRight, FileText, Database, X, ArrowRight,
  PlusCircle, MinusCircle, Edit2
} from 'lucide-react';

// --- MOCK DATA ---
const MOCK_ANALYTICS = {
  totalConsents: 145203,
  optInRate: 76.4,
  activeCookies: 142,
  classificationBreakdown: [
    { name: 'Strictly Necessary', value: 45, color: 'bg-emerald-500' },
    { name: 'Analytics', value: 30, color: 'bg-blue-500' },
    { name: 'Marketing', value: 20, color: 'bg-purple-500' },
    { name: 'Preferences', value: 5, color: 'bg-amber-500' },
  ],
  recentScans: [
    { id: 'SCN-892', date: '2026-03-24', delta: '+3', status: 'Completed' },
    { id: 'SCN-891', date: '2026-03-17', delta: '0', status: 'Completed' },
  ]
};

const MOCK_COOKIES = [
  { id: 1, name: '_ga', domain: '.example.com', provider: 'Google', category: 'Analytics', confidence: 0.98, status: 'Active' },
  { id: 2, name: '_fbp', domain: '.example.com', provider: 'Meta', category: 'Marketing', confidence: 0.95, status: 'Active' },
  { id: 3, name: 'session_id', domain: 'example.com', provider: 'First Party', category: 'Strictly Necessary', confidence: 0.99, status: 'Active' },
  { id: 4, name: 'optimizelyEndUserId', domain: '.example.com', provider: 'Optimizely', category: 'Preferences', confidence: 0.82, status: 'Active' },
  { id: 5, name: 'unknown_tracker_xyz', domain: 'track.xyz.com', provider: 'Unknown', category: 'Unclassified', confidence: 0.45, status: 'Quarantined' },
];

const MOCK_NOTIFICATIONS = [
  { id: 1, type: 'Delta Detection', message: '3 new third-party marketing cookies detected on /checkout page.', time: '2 hours ago', severity: 'high', hasReport: true },
  { id: 2, type: 'System', message: 'Weekly scheduled domain scan completed successfully.', time: '1 day ago', severity: 'info', hasReport: false },
  { id: 3, type: 'Compliance', message: 'CatBoost AI model retraining completed. Confidence threshold improved.', time: '2 days ago', severity: 'success', hasReport: false },
  { id: 4, type: 'User Action', message: 'Spike in consent withdrawals detected from Karnataka region.', time: '3 days ago', severity: 'warning', hasReport: false },
];

const MOCK_CONSENTS = [
  { id: 'DP-7721', user: 'user1@email.com', status: 'Granted', purpose: 'All', timestamp: '2026-03-24 10:12:00', auditHash: '0x8f...3a1' },
  { id: 'DP-7722', user: 'user2@email.com', status: 'Partial', purpose: 'Necessary, Analytics', timestamp: '2026-03-24 09:45:11', auditHash: '0x1b...9c4' },
  { id: 'DP-7723', user: 'user3@email.com', status: 'Withdrawn', purpose: 'None', timestamp: '2026-03-23 16:20:00', auditHash: '0x5c...2f0' },
];

const MOCK_DELTA_REPORT = {
  scanId: 'SCN-892',
  previousScanId: 'SCN-891',
  timestamp: '2026-03-24 14:30:00 IST',
  urlPath: 'https://example.com/checkout',
  summary: { added: 3, removed: 1, modified: 1 },
  changes: [
    { id: 101, type: 'added', name: '_tiktok_uid', provider: 'TikTok', category: 'Marketing', risk: 'High', details: 'New third-party tracking cookie detected.' },
    { id: 102, type: 'added', name: '_snap_tr', provider: 'Snapchat', category: 'Marketing', risk: 'High', details: 'New third-party tracking cookie detected.' },
    { id: 103, type: 'added', name: 'ad_id_x', provider: 'Unknown', category: 'Unclassified', risk: 'High', details: 'Unknown tracker with 1-year expiry. Flagged by CatBoost.' },
    { id: 104, type: 'modified', name: 'session_id', provider: 'First Party', category: 'Strictly Necessary', risk: 'Low', details: 'Expiry attribute changed from Session to 30 Days.' },
    { id: 105, type: 'removed', name: 'legacy_analytics', provider: 'OldVendor', category: 'Analytics', risk: 'Low', details: 'Cookie no longer present in current scan baseline.' },
  ]
};

// --- COMPONENTS ---

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700',
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200',
    info: 'bg-blue-50 text-blue-700 border border-blue-200',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

export default function App() {
  const [activeTab, setActiveTab] = useState('notifications');

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardView />;
      case 'banner': return <BannerBuilderView />;
      case 'scanner': return <ScannerView />;
      case 'consent': return <ConsentManagerView />;
      case 'notifications': return <NotificationsView />;
      default: return <DashboardView />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col z-10">
        <div className="p-4 flex items-center space-x-3 border-b border-slate-800">
          <div className="bg-indigo-500 p-2 rounded-lg text-white">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-bold text-white text-lg leading-tight">Unified CMP</h1>
            <p className="text-[10px] font-medium text-indigo-300 tracking-wider uppercase">DPDP Compliant CMP</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <NavItem icon={BarChart3} label="Analytics Dashboard" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <NavItem icon={Layout} label="Banner Builder" isActive={activeTab === 'banner'} onClick={() => setActiveTab('banner')} />
          <NavItem icon={ScanSearch} label="Cookie Scanner" isActive={activeTab === 'scanner'} onClick={() => setActiveTab('scanner')} />
          <NavItem icon={Users} label="Consent Manager" isActive={activeTab === 'consent'} onClick={() => setActiveTab('consent')} />
          <NavItem icon={Bell} label="Notifications" isActive={activeTab === 'notifications'} onClick={() => setActiveTab('notifications')} badge={3} />
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button className="flex items-center space-x-3 w-full p-2 rounded-lg hover:bg-slate-800 transition-colors">
            <Settings className="w-5 h-5 text-slate-400" />
            <span className="text-sm font-medium">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 z-10">
          <h2 className="text-xl font-semibold text-slate-800 capitalize">
            {activeTab.replace('-', ' ')}
          </h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center text-sm text-slate-500 bg-slate-100 px-3 py-1.5 rounded-md border border-slate-200">
              <Globe className="w-4 h-4 mr-2 text-indigo-500" />
              <span>Domain: example.com</span>
            </div>
            <div className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold border border-indigo-200 cursor-pointer">
              A
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto p-8 relative z-0">
          <div className="max-w-7xl mx-auto">
            {renderContent()}
          </div>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon: Icon, label, isActive, onClick, badge }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${
        isActive 
          ? 'bg-indigo-600/10 text-indigo-400 font-medium' 
          : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
      }`}
    >
      <div className="flex items-center space-x-3">
        <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
        <span className="text-sm">{label}</span>
      </div>
      {badge && (
        <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
          {badge}
        </span>
      )}
    </button>
  );
}

// --- VIEWS ---

function DashboardView() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Total Valid Consents</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{MOCK_ANALYTICS.totalConsents.toLocaleString()}</h3>
            </div>
            <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center">
              <Users className="w-6 h-6 text-indigo-600" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-emerald-600 font-medium flex items-center"><Activity className="w-4 h-4 mr-1"/> +12%</span>
            <span className="text-slate-500 ml-2">from last month</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Global Opt-In Rate</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{MOCK_ANALYTICS.optInRate}%</h3>
            </div>
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-4 w-full bg-slate-100 rounded-full h-2">
            <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${MOCK_ANALYTICS.optInRate}%` }}></div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">Active Cookies</p>
              <h3 className="text-3xl font-bold text-slate-900 mt-2">{MOCK_ANALYTICS.activeCookies}</h3>
            </div>
            <div className="w-12 h-12 bg-amber-50 rounded-full flex items-center justify-center">
              <Database className="w-6 h-6 text-amber-600" />
            </div>
          </div>
          <p className="text-sm text-slate-500 mt-4">Across 3 configured domains</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-6 flex items-center">
            <PieChartIcon className="w-5 h-5 mr-2 text-indigo-500" />
            Cookie Classification (CatBoost AI)
          </h3>
          <div className="space-y-4">
            {MOCK_ANALYTICS.classificationBreakdown.map((item) => (
              <div key={item.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-slate-700">{item.name}</span>
                  <span className="text-slate-500">{item.value}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2.5">
                  <div className={`${item.color} h-2.5 rounded-full`} style={{ width: `${item.value}%` }}></div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
           <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold flex items-center">
              <ScanSearch className="w-5 h-5 mr-2 text-indigo-500" />
              Recent Scans & Delta
            </h3>
            <button className="text-sm text-indigo-600 hover:text-indigo-700 font-medium">View All</button>
          </div>
          <div className="space-y-4">
            {MOCK_ANALYTICS.recentScans.map((scan) => (
              <div key={scan.id} className="flex items-center justify-between p-4 border border-slate-100 rounded-lg bg-slate-50">
                <div className="flex items-center space-x-4">
                  <div className="bg-white p-2 rounded-md shadow-sm">
                    <FileText className="w-5 h-5 text-slate-400" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-800">{scan.id}</p>
                    <p className="text-xs text-slate-500">{scan.date}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-xs text-slate-500">Delta</p>
                    <p className={`font-semibold ${scan.delta !== '0' ? 'text-rose-500' : 'text-slate-700'}`}>
                      {scan.delta}
                    </p>
                  </div>
                  <Badge variant="success">{scan.status}</Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

function BannerBuilderView() {
  const [theme, setTheme] = useState('light');
  
  return (
    <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-8rem)]">
      <Card className="w-full lg:w-1/3 flex flex-col h-full overflow-hidden">
        <div className="p-5 border-b border-slate-200 bg-slate-50">
          <h3 className="text-lg font-semibold">Banner Configuration</h3>
          <p className="text-sm text-slate-500">Design and compliance settings</p>
        </div>
        
        <div className="p-5 overflow-y-auto flex-1 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Theme</label>
            <div className="flex space-x-3">
              <button 
                onClick={() => setTheme('light')}
                className={`flex-1 py-2 border rounded-md text-sm font-medium transition-colors ${theme === 'light' ? 'bg-indigo-50 border-indigo-200 text-indigo-700' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                Light
              </button>
              <button 
                onClick={() => setTheme('dark')}
                className={`flex-1 py-2 border rounded-md text-sm font-medium transition-colors ${theme === 'dark' ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 hover:bg-slate-50'}`}
              >
                Dark
              </button>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
            <h4 className="text-sm font-bold text-slate-800 mb-3 flex items-center">
              <Shield className="w-4 h-4 mr-2 text-indigo-600" /> 
              DPDP Act Requirements
            </h4>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Primary Language (Notice)</label>
                <select className="w-full border-slate-300 rounded-md shadow-sm text-sm p-2 border focus:ring-indigo-500 focus:border-indigo-500">
                  <option>English</option>
                  <option>Hindi (हिंदी)</option>
                  <option>Kannada (ಕನ್ನಡ)</option>
                  <option>Tamil (தமிழ்)</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">Supports all 22 scheduled languages.</p>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Easy Withdrawal Button</p>
                  <p className="text-xs text-slate-500">Show persistent widget per DPDPA</p>
                </div>
                <ToggleSwitch active={true} />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-200">
             <h4 className="text-sm font-bold text-slate-800 mb-3">Privacy Signals</h4>
             <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Respect GPC Signal</p>
                  <p className="text-xs text-slate-500 mt-1 pr-4">Automatically reject non-essential cookies if Global Privacy Control header is detected.</p>
                </div>
                <ToggleSwitch active={true} />
              </div>
          </div>
        </div>
        
        <div className="p-4 border-t border-slate-200 bg-slate-50">
          <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
            Publish Changes
          </button>
        </div>
      </Card>

      <div className="w-full lg:w-2/3 bg-slate-200 rounded-xl border border-slate-300 flex items-center justify-center p-8 relative overflow-hidden h-full">
        <div className="absolute top-4 left-4 bg-white/80 backdrop-blur px-3 py-1 rounded-full text-xs font-semibold text-slate-500 border border-slate-300 shadow-sm">
          Live Preview
        </div>

        <div className="w-full h-full bg-white rounded-lg shadow-xl border border-slate-200 flex flex-col overflow-hidden relative">
           <div className="h-12 border-b border-slate-100 flex items-center px-4 space-x-2">
              <div className="w-3 h-3 rounded-full bg-rose-400"></div>
              <div className="w-3 h-3 rounded-full bg-amber-400"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-400"></div>
              <div className="ml-4 bg-slate-100 h-6 rounded w-1/2"></div>
           </div>
           <div className="flex-1 p-8 space-y-4">
             <div className="h-8 bg-slate-100 rounded w-1/3"></div>
             <div className="h-4 bg-slate-50 rounded w-full"></div>
             <div className="h-4 bg-slate-50 rounded w-5/6"></div>
             <div className="h-4 bg-slate-50 rounded w-4/6"></div>
           </div>

           <div className={`absolute bottom-0 left-0 right-0 border-t shadow-2xl ${theme === 'dark' ? 'bg-slate-900 text-white border-slate-800' : 'bg-white text-slate-800 border-slate-200'} p-6 m-4 rounded-xl`}>
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex-1">
                  <h4 className="font-bold text-lg mb-1">We value your privacy</h4>
                  <p className={`text-sm ${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    We and our partners use cookies to enhance your experience, analyze site usage, and assist in our marketing efforts. Under the DPDP Act, you have the right to consent to specific purposes. 
                  </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                  <button className={`px-4 py-2 rounded-lg text-sm font-medium border ${theme === 'dark' ? 'border-slate-700 hover:bg-slate-800' : 'border-slate-300 hover:bg-slate-50'}`}>
                    Manage Preferences
                  </button>
                  <button className="px-4 py-2 rounded-lg text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm">
                    Accept All
                  </button>
                </div>
              </div>
           </div>

           <div className="absolute bottom-4 left-4 bg-indigo-600 text-white p-3 rounded-full shadow-lg cursor-pointer hover:bg-indigo-700 transition-transform hover:scale-105">
             <Shield className="w-6 h-6" />
           </div>
        </div>
      </div>
    </div>
  );
}

function ScannerView() {
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setTimeout(() => setIsScanning(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Cookie Scanner & AI Classification</h2>
          <p className="text-sm text-slate-500">Powered by CatBoost Architecture for high-accuracy categorization.</p>
        </div>
        <button 
          onClick={handleScan}
          disabled={isScanning}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center transition-colors disabled:opacity-70"
        >
          {isScanning ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <ScanSearch className="w-4 h-4 mr-2" />}
          {isScanning ? 'Scanning Domain...' : 'Initiate Scan'}
        </button>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600">Cookie Name</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Provider</th>
                <th className="px-6 py-4 font-semibold text-slate-600">AI Classification</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Confidence Score</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-600"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {MOCK_COOKIES.map((cookie) => (
                <tr key={cookie.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{cookie.name}</td>
                  <td className="px-6 py-4 text-slate-600">{cookie.provider}</td>
                  <td className="px-6 py-4">
                    <Badge variant={cookie.category === 'Unclassified' ? 'warning' : 'default'}>
                      {cookie.category}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-2">
                      <span className={`font-medium ${cookie.confidence > 0.9 ? 'text-emerald-600' : cookie.confidence > 0.7 ? 'text-amber-600' : 'text-rose-600'}`}>
                        {(cookie.confidence * 100).toFixed(1)}%
                      </span>
                      {cookie.confidence < 0.7 && (
                        <span className="text-xs text-rose-500" title="Low confidence. Flagged for manual review and model retraining.">
                          (Needs Review)
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className={`flex items-center ${cookie.status === 'Active' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        <div className={`w-2 h-2 rounded-full mr-2 ${cookie.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                        {cookie.status}
                     </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-slate-400 hover:text-indigo-600 transition-colors">
                      <Settings className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-5">
           <h4 className="font-semibold mb-2 flex items-center text-slate-800">
             <Activity className="w-4 h-4 mr-2 text-indigo-500" />
             Model Health (CatBoost v3.2)
           </h4>
           <div className="space-y-3 text-sm">
             <div className="flex justify-between"><span className="text-slate-500">Last Retrained</span> <span className="font-medium">2026-03-10</span></div>
             <div className="flex justify-between"><span className="text-slate-500">Low Confidence Rate</span> <span className="font-medium">0.08%</span></div>
             <div className="flex justify-between"><span className="text-slate-500">Feature Schema Hash</span> <span className="font-medium font-mono text-xs">abc123ff</span></div>
           </div>
        </Card>
        
        <Card className="p-5 bg-indigo-50 border-indigo-100">
           <h4 className="font-semibold mb-2 text-indigo-900 flex items-center">
             <ShieldAlert className="w-4 h-4 mr-2" />
             Zero-Knowledge Redaction Bridge
           </h4>
           <p className="text-sm text-indigo-700 mb-3">
             PII detected in cookie payloads is automatically masked before reaching server logs to ensure DPDP compliance.
           </p>
           <button className="text-sm font-medium text-indigo-600 hover:text-indigo-800 flex items-center">
             View Redaction Logs <ChevronRight className="w-4 h-4 ml-1" />
           </button>
        </Card>
      </div>
    </div>
  );
}

function ConsentManagerView() {
  return (
    <div className="space-y-6">
      <Card className="p-6 border-l-4 border-l-indigo-500">
        <div className="flex items-start justify-between">
          <div className="max-w-3xl">
            <h3 className="text-lg font-semibold text-slate-800 flex items-center">
              <Globe className="w-5 h-5 mr-2 text-indigo-500" />
              Cross-Domain Consent Sharing
            </h3>
            <p className="text-sm text-slate-600 mt-2 leading-relaxed">
              Link domains to share user consent across your ecosystem. 
              <br/><span className="font-medium text-amber-700 bg-amber-50 px-1 py-0.5 rounded mt-1 inline-block">Note on Chrome Storage Partitioning (v115+):</span> Consent submitted on a top-level domain cannot be implicitly shared with sub-domains without explicit grouping. Ensure your domain groups are structured on the same level.
            </p>
          </div>
          <button className="bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            Manage Domain Groups
          </button>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50">
          <div>
            <h3 className="font-semibold text-slate-800">Consent Ledger (Data Principals)</h3>
            <p className="text-xs text-slate-500">Immutable audit logs for DPDPA compliance resolution.</p>
          </div>
          <div className="flex space-x-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search User ID or Hash..." 
                className="pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none w-64"
              />
            </div>
            <button className="border border-slate-300 p-2 rounded-lg hover:bg-slate-100 text-slate-600" title="Export Audit Log">
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600">Consent ID</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Data Principal</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Status</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Consented Purposes</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Timestamp</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Audit Hash</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {MOCK_CONSENTS.map((consent) => (
                <tr key={consent.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">{consent.id}</td>
                  <td className="px-6 py-4 text-slate-600">{consent.user}</td>
                  <td className="px-6 py-4">
                    <Badge variant={
                      consent.status === 'Granted' ? 'success' : 
                      consent.status === 'Withdrawn' ? 'danger' : 'warning'
                    }>
                      {consent.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-slate-600">{consent.purpose}</td>
                  <td className="px-6 py-4 text-slate-500 text-xs">{consent.timestamp}</td>
                  <td className="px-6 py-4 text-slate-400 font-mono text-xs">{consent.auditHash}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function NotificationsView() {
  const [showReport, setShowReport] = useState(false);

  return (
    <div className="space-y-6 relative h-full">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-slate-800">Notification Center</h2>
          <p className="text-sm text-slate-500">System alerts, delta detection, and risk analysis flows.</p>
        </div>
        <button className="text-sm font-medium text-indigo-600 hover:text-indigo-700">
          Mark all as read
        </button>
      </div>

      <div className="space-y-4">
        {MOCK_NOTIFICATIONS.map((notif) => (
          <Card key={notif.id} className={`p-5 flex items-start space-x-4 border-l-4 ${
            notif.severity === 'high' ? 'border-l-rose-500' :
            notif.severity === 'warning' ? 'border-l-amber-500' :
            notif.severity === 'success' ? 'border-l-emerald-500' : 'border-l-blue-500'
          }`}>
            <div className={`p-2 rounded-full mt-1 ${
              notif.severity === 'high' ? 'bg-rose-100 text-rose-600' :
              notif.severity === 'warning' ? 'bg-amber-100 text-amber-600' :
              notif.severity === 'success' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'
            }`}>
              {notif.severity === 'high' ? <AlertTriangle className="w-5 h-5" /> : 
               notif.severity === 'success' ? <CheckCircle2 className="w-5 h-5" /> :
               <Bell className="w-5 h-5" />}
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <h4 className="font-semibold text-slate-800">{notif.type}</h4>
                <span className="text-xs font-medium text-slate-400">{notif.time}</span>
              </div>
              <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
              
              {notif.hasReport && (
                <div className="mt-4">
                  <button 
                    onClick={() => setShowReport(true)}
                    className="text-xs font-semibold bg-rose-50 text-rose-700 px-4 py-2 rounded-lg border border-rose-200 hover:bg-rose-100 hover:shadow-sm transition-all flex items-center"
                  >
                    <FileText className="w-4 h-4 mr-2" />
                    Review Delta Report
                  </button>
                </div>
              )}
            </div>
          </Card>
        ))}
      </div>

      {/* DELTA REPORT MODAL OVERLAY */}
      {showReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-lg font-bold text-slate-800 flex items-center">
                  <ScanSearch className="w-5 h-5 mr-2 text-indigo-600" />
                  Delta Detection Report
                </h3>
                <p className="text-sm text-slate-500 mt-1 flex items-center space-x-2">
                  <span>Baseline: <strong>{MOCK_DELTA_REPORT.previousScanId}</strong></span>
                  <ArrowRight className="w-3 h-3" />
                  <span>Current: <strong>{MOCK_DELTA_REPORT.scanId}</strong></span>
                  <span className="text-slate-300">|</span>
                  <span>{MOCK_DELTA_REPORT.timestamp}</span>
                </p>
              </div>
              <button 
                onClick={() => setShowReport(false)}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-500 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
              
              {/* Summary Cards */}
              <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-rose-50 border border-rose-100 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-rose-600">Newly Added</p>
                    <p className="text-2xl font-bold text-rose-700">{MOCK_DELTA_REPORT.summary.added}</p>
                  </div>
                  <PlusCircle className="w-8 h-8 text-rose-200" />
                </div>
                <div className="bg-amber-50 border border-amber-100 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-amber-600">Modified</p>
                    <p className="text-2xl font-bold text-amber-700">{MOCK_DELTA_REPORT.summary.modified}</p>
                  </div>
                  <Edit2 className="w-8 h-8 text-amber-200" />
                </div>
                <div className="bg-emerald-50 border border-emerald-100 rounded-lg p-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-emerald-600">Removed</p>
                    <p className="text-2xl font-bold text-emerald-700">{MOCK_DELTA_REPORT.summary.removed}</p>
                  </div>
                  <MinusCircle className="w-8 h-8 text-emerald-200" />
                </div>
              </div>

              {/* Changes Table */}
              <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
                <div className="px-5 py-3 border-b border-slate-200 bg-slate-100/50">
                  <h4 className="font-semibold text-slate-700 text-sm">Detected Changes on: {MOCK_DELTA_REPORT.urlPath}</h4>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm whitespace-nowrap">
                    <thead className="bg-slate-50 border-b border-slate-200">
                      <tr>
                        <th className="px-5 py-3 font-semibold text-slate-600">Status</th>
                        <th className="px-5 py-3 font-semibold text-slate-600">Cookie Name</th>
                        <th className="px-5 py-3 font-semibold text-slate-600">Provider & Category</th>
                        <th className="px-5 py-3 font-semibold text-slate-600">Risk Level</th>
                        <th className="px-5 py-3 font-semibold text-slate-600 w-full">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {MOCK_DELTA_REPORT.changes.map((change) => (
                        <tr key={change.id} className="hover:bg-slate-50">
                          <td className="px-5 py-3">
                            {change.type === 'added' && <Badge variant="danger">New</Badge>}
                            {change.type === 'modified' && <Badge variant="warning">Modified</Badge>}
                            {change.type === 'removed' && <Badge variant="success">Removed</Badge>}
                          </td>
                          <td className="px-5 py-3 font-medium text-slate-800">{change.name}</td>
                          <td className="px-5 py-3">
                            <div className="flex flex-col">
                              <span className="text-slate-800">{change.provider}</span>
                              <span className="text-xs text-slate-500">{change.category}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3">
                            <span className={`flex items-center text-xs font-semibold ${change.risk === 'High' ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {change.risk === 'High' && <AlertTriangle className="w-3 h-3 mr-1" />}
                              {change.risk}
                            </span>
                          </td>
                          <td className="px-5 py-3 text-slate-600 text-xs whitespace-normal max-w-xs">
                            {change.details}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end space-x-3">
              <button 
                onClick={() => setShowReport(false)}
                className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
              >
                Close
              </button>
              <button 
                onClick={() => setShowReport(false)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors flex items-center"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Acknowledge & Update Classifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// --- UTILS & MINI COMPONENTS ---

function ToggleSwitch({ active }) {
  const [isOn, setIsOn] = useState(active);
  return (
    <button 
      onClick={() => setIsOn(!isOn)}
      className="focus:outline-none"
    >
      {isOn ? (
        <ToggleRight className="w-8 h-8 text-indigo-600" />
      ) : (
        <ToggleLeft className="w-8 h-8 text-slate-300" />
      )}
    </button>
  );
}

function PieChartIcon({ className }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path>
      <path d="M22 12A10 10 0 0 0 12 2v10z"></path>
    </svg>
  );
}