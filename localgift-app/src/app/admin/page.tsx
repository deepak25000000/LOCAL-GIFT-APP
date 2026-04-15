"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { useAuth } from "@/components/AuthContext";
import { BarChart3, Users, Package, FileText, Trash2, Eye, EyeOff, TrendingUp, Search, Shield, Award, MapPin, ChevronDown, ChevronUp, CheckCircle, XCircle, Clock, Map as MapIcon, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

// Dynamically import Recharts to avoid SSR issues
const BarChart = dynamic(() => import("recharts").then(m => m.BarChart), { ssr: false });
const Bar = dynamic(() => import("recharts").then(m => m.Bar), { ssr: false });
const LineChart = dynamic(() => import("recharts").then(m => m.LineChart), { ssr: false });
const Line = dynamic(() => import("recharts").then(m => m.Line), { ssr: false });
const PieChartRC = dynamic(() => import("recharts").then(m => m.PieChart), { ssr: false });
const Pie = dynamic(() => import("recharts").then(m => m.Pie), { ssr: false });
const Cell = dynamic(() => import("recharts").then(m => m.Cell), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(m => m.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(m => m.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(m => m.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(m => m.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import("recharts").then(m => m.ResponsiveContainer), { ssr: false });

const COLORS = ['#7c3aed', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16', '#f97316'];

function formatDate(d: string) {
  if (!d) return '';
  return new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

function formatTimeAgo(d: string) {
  if (!d) return '';
  const diff = Date.now() - new Date(d).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    available: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    claimed: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    hidden: 'bg-slate-200 dark:bg-slate-600 text-slate-500 dark:text-slate-300',
    pending: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    accepted: 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    declined: 'bg-red-100 dark:bg-red-900/30 text-red-500 dark:text-red-400',
  };
  const icons: Record<string, string> = {
    available: '🟢', claimed: '📦', hidden: '👁️‍🗨️', pending: '⏳', accepted: '✅', declined: '❌',
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${styles[status] || styles.available}`}>
      {icons[status] || ''} {status}
    </span>
  );
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);

  // Data states
  const [overview, setOverview] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [requests, setRequests] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [requestTrends, setRequestTrends] = useState<any[]>([]);
  const [userGrowth, setUserGrowth] = useState<any[]>([]);
  const [topItems, setTopItems] = useState<any[]>([]);
  const [itemTrends, setItemTrends] = useState<any[]>([]);

  // Filters
  const [itemSearch, setItemSearch] = useState("");
  const [itemCategory, setItemCategory] = useState("All");
  const [itemStatusFilter, setItemStatusFilter] = useState("all");
  const [userSearch, setUserSearch] = useState("");
  const [requestFilter, setRequestFilter] = useState("all");
  const [expandedItem, setExpandedItem] = useState<number | null>(null);

  useEffect(() => {
    if (!user) return;
    async function load() {
      try {
        const [ov, it, us, rq, cats, rt, ug, ti, itTr] = await Promise.all([
          api.getAdminAnalyticsOverview().catch(() => null),
          api.getAdminItems().catch(() => []),
          api.getAdminUsers().catch(() => []),
          api.getAdminRequestsFull().catch(() => []),
          api.getAdminAnalyticsCategories().catch(() => []),
          api.getAdminAnalyticsRequestTrends().catch(() => []),
          api.getAdminAnalyticsUserGrowth().catch(() => []),
          api.getAdminAnalyticsTopItems().catch(() => []),
          api.getAdminAnalyticsItemTrends().catch(() => []),
        ]);
        setOverview(ov);
        setItems(it || []);
        setUsers(us || []);
        setRequests(rq || []);
        setCategories(cats || []);
        setRequestTrends((rt || []).map((r: any) => ({ ...r, date: new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) })));
        setUserGrowth((ug || []).map((r: any) => ({ ...r, date: new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) })));
        setTopItems(ti || []);
        setItemTrends((itTr || []).map((r: any) => ({ ...r, date: new Date(r.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) })));
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    }
    load();
  }, [user]);

  if (authLoading || loading) return (
    <div className="flex-1 flex justify-center items-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400">Loading admin matrix...</p>
      </div>
    </div>
  );

  if (!user || user.role !== 'admin') return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
      <Shield className="w-16 h-16 text-indigo-500 mb-4 opacity-50" />
      <h2 className="text-2xl font-bold mb-2">Access Restricted</h2>
      <p className="text-slate-500">Admin privileges required.</p>
    </div>
  );

  // ─── Filters ───
  const filteredItems = items.filter(i => {
    const matchSearch = !itemSearch || i.title?.toLowerCase().includes(itemSearch.toLowerCase()) || i.owner_name?.toLowerCase().includes(itemSearch.toLowerCase());
    const matchCat = itemCategory === "All" || i.category === itemCategory;
    const matchStatus = itemStatusFilter === "all" || i.status === itemStatusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const filteredUsers = users.filter(u => {
    if (!userSearch) return true;
    return u.name?.toLowerCase().includes(userSearch.toLowerCase()) || u.email?.toLowerCase().includes(userSearch.toLowerCase());
  });

  const filteredRequests = requests.filter(r => {
    if (requestFilter === "all") return true;
    return r.status === requestFilter;
  });

  const allCategories = [...new Set(items.map(i => i.category).filter(Boolean))];
  const allStatuses = [...new Set(items.map(i => i.status).filter(Boolean))];

  // ─── Computed stats ───
  const claimedCount = items.filter(i => i.status === 'claimed').length;
  const availableCount = items.filter(i => i.status === 'available').length;
  const hiddenCount = items.filter(i => i.status === 'hidden').length;
  const fulfillmentRate = items.length > 0 ? ((claimedCount / items.length) * 100).toFixed(1) : '0';

  const TABS = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "items", label: "Items", icon: Package },
    { key: "users", label: "Users", icon: Users },
    { key: "requests", label: "Requests", icon: FileText },
    { key: "analytics", label: "Analytics", icon: TrendingUp },
    { key: "map", label: "Map View", icon: MapIcon },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Command Center</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Full platform administration, item tracking &amp; delivery intelligence</p>
        </div>

        {/* Tab Nav */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
          {TABS.map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap transition-all ${activeTab === tab.key
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30"
                : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
            >
              <tab.icon size={16} /> {tab.label}
            </button>
          ))}
        </div>

        {/* ═══════════ OVERVIEW TAB ═══════════ */}
        {activeTab === "overview" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: "Total Items", val: overview?.totalItems || 0, sub: `${availableCount} available · ${claimedCount} claimed · ${hiddenCount} hidden`, color: "bg-indigo-500" },
                { label: "Total Users", val: overview?.totalUsers || 0, sub: `Platform members`, color: "bg-emerald-500" },
                { label: "Total Requests", val: overview?.totalRequests || 0, sub: `${overview?.pendingRequests || 0} pending · ${overview?.acceptedRequests || 0} accepted`, color: "bg-purple-500" },
                { label: "Fulfillment Rate", val: `${fulfillmentRate}%`, sub: `${claimedCount} of ${items.length} items claimed`, color: "bg-amber-500" },
              ].map((s, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{s.label}</p>
                      <h3 className="text-2xl font-bold mt-1 text-slate-900 dark:text-white">{s.val}</h3>
                      <p className="text-xs text-slate-400 mt-1">{s.sub}</p>
                    </div>
                    <div className={`w-2 h-8 rounded-full ${s.color}`}></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Request Volume Breakdown */}
            <div className="grid md:grid-cols-4 gap-4">
              {[
                { label: "Conversations", val: overview?.totalConversations || 0, color: "bg-cyan-500" },
                { label: "Requests Today", val: overview?.requestsToday || 0, color: "bg-indigo-500" },
                { label: "This Week", val: overview?.requestsThisWeek || 0, color: "bg-blue-500" },
                { label: "This Month", val: overview?.requestsThisMonth || 0, color: "bg-purple-500" },
              ].map((s, i) => (
                <div key={i} className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                  <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{s.label}</p>
                  <h3 className="text-3xl font-bold mt-2 text-slate-900 dark:text-white">{s.val}</h3>
                  <div className="mt-3 h-1.5 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full ${s.color} rounded-full`} style={{ width: `${Math.min((Number(s.val) / Math.max(overview?.totalRequests || 1, 1)) * 100, 100)}%` }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Charts Row */}
            <div className="grid md:grid-cols-2 gap-6">
              {/* Item Listing Trends */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">📦 New Items Listed (30 Days)</h3>
                <div style={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer>
                    <BarChart data={itemTrends}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <Tooltip />
                      <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Items" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Distribution Pie */}
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">🏷️ Category Distribution</h3>
                <div style={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer>
                    <PieChartRC>
                      <Pie data={categories} dataKey="count" nameKey="category" cx="50%" cy="50%" outerRadius={80} label={({ category, percent }: any) => `${category} ${(percent * 100).toFixed(0)}%`}>
                        {categories.map((_, i) => (
                          <Cell key={i} fill={COLORS[i % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChartRC>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Top Requested Items */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700 flex items-center gap-2">
                <Award size={16} className="text-amber-500" />
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">🔥 Top Requested Items</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-3 text-left font-medium">#</th>
                      <th className="px-5 py-3 text-left font-medium">Item</th>
                      <th className="px-5 py-3 text-left font-medium">Category</th>
                      <th className="px-5 py-3 text-left font-medium">Owner</th>
                      <th className="px-5 py-3 text-right font-medium">Requests</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {topItems.slice(0, 5).map((item, idx) => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="px-5 py-3 font-bold text-indigo-500">#{idx + 1}</td>
                        <td className="px-5 py-3 font-medium text-slate-900 dark:text-white">{item.title}</td>
                        <td className="px-5 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400">{item.category}</span></td>
                        <td className="px-5 py-3 text-slate-500">{item.owner_name || 'Anonymous'}</td>
                        <td className="px-5 py-3 text-right font-bold text-slate-900 dark:text-white">{item.request_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Delivery / Fulfillment Summary */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">📊 Item Lifecycle Summary</h3>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                  <p className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{availableCount}</p>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300 mt-1">Available</p>
                  <p className="text-xs text-emerald-500 mt-0.5">Ready to claim</p>
                </div>
                <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">{claimedCount}</p>
                  <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">Claimed / Delivered</p>
                  <p className="text-xs text-blue-500 mt-0.5">Successfully given away</p>
                </div>
                <div className="text-center p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl">
                  <p className="text-3xl font-bold text-slate-600 dark:text-slate-300">{hiddenCount}</p>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">Hidden</p>
                  <p className="text-xs text-slate-500 mt-0.5">Removed from listing</p>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════ ITEMS TAB ═══════════ */}
        {activeTab === "items" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            {/* Search & Filters */}
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                <input value={itemSearch} onChange={e => setItemSearch(e.target.value)} placeholder="Search items or owners..."
                  className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
              </div>
              <select value={itemCategory} onChange={e => setItemCategory(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="All">All Categories</option>
                {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select value={itemStatusFilter} onChange={e => setItemStatusFilter(e.target.value)}
                className="px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                <option value="all">All Statuses</option>
                {allStatuses.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="text-xs text-slate-400">{filteredItems.length} items found</div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium w-8"></th>
                      <th className="px-4 py-3 text-left font-medium">ID</th>
                      <th className="px-4 py-3 text-left font-medium">Item</th>
                      <th className="px-4 py-3 text-left font-medium">Category</th>
                      <th className="px-4 py-3 text-left font-medium">Condition</th>
                      <th className="px-4 py-3 text-left font-medium">Owner</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Location</th>
                      <th className="px-4 py-3 text-left font-medium">Listed</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filteredItems.length === 0 ? (
                      <tr><td colSpan={10} className="px-5 py-8 text-center text-slate-400">No items match your filters.</td></tr>
                    ) : filteredItems.map(item => (
                      <>
                        <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 cursor-pointer" onClick={() => setExpandedItem(expandedItem === item.id ? null : item.id)}>
                          <td className="px-4 py-3 text-slate-400">
                            {expandedItem === item.id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                          </td>
                          <td className="px-4 py-3 text-indigo-500 font-mono text-xs">#{item.id}</td>
                          <td className="px-4 py-3 font-medium text-slate-900 dark:text-white max-w-[180px] truncate">{item.title}</td>
                          <td className="px-4 py-3"><span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">{item.category}</span></td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{item.condition || 'Good'}</td>
                          <td className="px-4 py-3 text-slate-500 text-xs">{item.owner_name || 'Anonymous'}</td>
                          <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                          <td className="px-4 py-3 text-xs text-slate-400">
                            {item.latitude && item.longitude ? (
                              <span className="flex items-center gap-1">
                                <MapPin size={12} className="text-indigo-400" />
                                {Number(item.latitude).toFixed(2)}, {Number(item.longitude).toFixed(2)}
                              </span>
                            ) : '—'}
                          </td>
                          <td className="px-4 py-3 text-slate-400 text-xs">{formatTimeAgo(item.created_at)}</td>
                          <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1">
                              <button title={item.status === 'available' ? 'Hide' : 'Show'} onClick={async () => {
                                const newStatus = item.status === 'available' ? 'hidden' : 'available';
                                try {
                                  await api.toggleItemVisibility(item.id, newStatus);
                                  setItems(items.map(i => i.id === item.id ? { ...i, status: newStatus } : i));
                                } catch { }
                              }} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-400 hover:text-indigo-500">
                                {item.status === 'available' ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                              <a href={`/item/${item.id}`} target="_blank" className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-400 hover:text-blue-500">
                                <ExternalLink size={15} />
                              </a>
                              <button title="Delete" onClick={async () => {
                                if (confirm(`Permanently delete "${item.title}"?`)) {
                                  await api.deleteAdminItem(item.id);
                                  setItems(items.filter(i => i.id !== item.id));
                                }
                              }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-slate-400 hover:text-red-500">
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </td>
                        </tr>
                        {/* Expanded Detail Row */}
                        {expandedItem === item.id && (
                          <tr key={`${item.id}-detail`} className="bg-slate-50/50 dark:bg-slate-800/50">
                            <td colSpan={10} className="px-6 py-4">
                              <div className="grid md:grid-cols-3 gap-4 text-xs">
                                <div>
                                  <p className="font-semibold text-slate-600 dark:text-slate-300 mb-2">📋 Item Details</p>
                                  <div className="space-y-1.5 text-slate-500 dark:text-slate-400">
                                    <p><span className="font-medium">Title:</span> {item.title}</p>
                                    <p><span className="font-medium">Description:</span> {item.description || 'No description'}</p>
                                    <p><span className="font-medium">Category:</span> {item.category}</p>
                                    <p><span className="font-medium">Condition:</span> {item.condition || 'Good'}</p>
                                    {item.attributes && typeof item.attributes === 'object' && Object.keys(item.attributes).length > 0 && (
                                      <div>
                                        <span className="font-medium">Attributes:</span>
                                        <ul className="ml-3 mt-1 space-y-0.5">
                                          {Object.entries(item.attributes).map(([k, v]) => (
                                            <li key={k} className="text-slate-400">• {k}: <span className="text-slate-600 dark:text-slate-300">{String(v)}</span></li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-600 dark:text-slate-300 mb-2">👤 Owner Info</p>
                                  <div className="space-y-1.5 text-slate-500 dark:text-slate-400">
                                    <p><span className="font-medium">Name:</span> {item.owner_name || 'Anonymous'}</p>
                                    <p><span className="font-medium">Email:</span> {item.owner_email || '—'}</p>
                                    <p><span className="font-medium">Owner ID:</span> <span className="font-mono text-[10px]">{item.owner_id}</span></p>
                                  </div>
                                </div>
                                <div>
                                  <p className="font-semibold text-slate-600 dark:text-slate-300 mb-2">📍 Location & Dates</p>
                                  <div className="space-y-1.5 text-slate-500 dark:text-slate-400">
                                    <p><span className="font-medium">Latitude:</span> {item.latitude || '—'}</p>
                                    <p><span className="font-medium">Longitude:</span> {item.longitude || '—'}</p>
                                    <p><span className="font-medium">Created:</span> {formatDate(item.created_at)}</p>
                                    <p><span className="font-medium">Updated:</span> {formatDate(item.updated_at)}</p>
                                    <p><span className="font-medium">Status:</span> <StatusBadge status={item.status} /></p>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════ USERS TAB ═══════════ */}
        {activeTab === "users" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
              <input value={userSearch} onChange={e => setUserSearch(e.target.value)} placeholder="Search by name or email..."
                className="w-full pl-9 pr-4 py-2 border border-slate-200 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>

            <div className="text-xs text-slate-400">{filteredUsers.length} users found</div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-5 py-3 text-left font-medium">User</th>
                      <th className="px-5 py-3 text-left font-medium">Email</th>
                      <th className="px-5 py-3 text-left font-medium">Joined</th>
                      <th className="px-5 py-3 text-center font-medium">Role</th>
                      <th className="px-5 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filteredUsers.length === 0 ? (
                      <tr><td colSpan={5} className="px-5 py-8 text-center text-slate-400">No users found.</td></tr>
                    ) : filteredUsers.map(u => (
                      <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-3">
                            <img src={u.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=default"} alt="" className="w-8 h-8 rounded-full bg-slate-200" />
                            <span className="font-medium text-slate-900 dark:text-white">{u.name || 'Anonymous'}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3 text-slate-500">{u.email || '—'}</td>
                        <td className="px-5 py-3 text-xs text-slate-400">{formatDate(u.created_at)}</td>
                        <td className="px-5 py-3 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${u.role === 'admin' ? 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' : 'bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                            {u.role === 'admin' ? '🛡️ Admin' : '👤 User'}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right">
                          <button onClick={async () => {
                            const newRole = u.role === 'admin' ? 'user' : 'admin';
                            if (confirm(`Change ${u.name}'s role to ${newRole.toUpperCase()}?`)) {
                              try {
                                await api.updateUserRole(u.id, newRole);
                                setUsers(users.map(old => old.id === u.id ? { ...old, role: newRole } : old));
                              } catch { alert("Failed to update role."); }
                            }
                          }}
                            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors">
                            {u.role === 'admin' ? 'Demote' : 'Promote'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════ REQUESTS TAB ═══════════ */}
        {activeTab === "requests" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="flex gap-2 overflow-x-auto">
              {["all", "pending", "accepted", "declined"].map(f => (
                <button key={f} onClick={() => setRequestFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${requestFilter === f ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300"}`}>
                  {f} {f === 'all' ? `(${requests.length})` : `(${requests.filter(r => r.status === f).length})`}
                </button>
              ))}
            </div>

            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400">
                    <tr>
                      <th className="px-4 py-3 text-left font-medium">ID</th>
                      <th className="px-4 py-3 text-left font-medium">Item</th>
                      <th className="px-4 py-3 text-left font-medium">Requester</th>
                      <th className="px-4 py-3 text-left font-medium">Owner</th>
                      <th className="px-4 py-3 text-left font-medium">Status</th>
                      <th className="px-4 py-3 text-left font-medium">Scheduled</th>
                      <th className="px-4 py-3 text-left font-medium">Message</th>
                      <th className="px-4 py-3 text-left font-medium">Date</th>
                      <th className="px-4 py-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {filteredRequests.length === 0 ? (
                      <tr><td colSpan={9} className="px-5 py-8 text-center text-slate-400">No requests match this filter.</td></tr>
                    ) : filteredRequests.map(r => (
                      <tr key={r.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="px-4 py-3 text-indigo-500 font-mono font-bold text-xs">#{r.id}</td>
                        <td className="px-4 py-3 font-medium text-slate-900 dark:text-white text-xs">{r.item_title}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            {r.requester_avatar && <img src={r.requester_avatar} className="w-6 h-6 rounded-full" alt="" />}
                            <div>
                              <p className="text-slate-900 dark:text-white text-xs font-medium">{r.requester_display_name || r.requester_name || 'User'}</p>
                              <p className="text-slate-400 text-[10px]">{r.requester_display_email || r.requester_email || ''}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-slate-500">{r.owner_email || '—'}</td>
                        <td className="px-4 py-3"><StatusBadge status={r.status} /></td>
                        <td className="px-4 py-3 text-xs text-slate-400">
                          {r.scheduled_time ? (
                            <span className="flex items-center gap-1"><Clock size={12} /> {r.scheduled_time}</span>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 text-slate-400 text-xs max-w-[120px] truncate">{r.message || '—'}</td>
                        <td className="px-4 py-3 text-xs text-slate-400">{formatTimeAgo(r.created_at)}</td>
                        <td className="px-4 py-3 text-right">
                          {r.status === 'pending' && (
                            <div className="flex items-center justify-end gap-1">
                              <button title="Accept" onClick={async () => {
                                if (confirm(`Accept request #${r.id} for "${r.item_title}"?`)) {
                                  try {
                                    await api.acceptRequest(r.id);
                                    setRequests(requests.map(old => {
                                      if (old.id === r.id) return { ...old, status: 'accepted' };
                                      if (old.item_id === r.item_id && old.id !== r.id && old.status === 'pending') return { ...old, status: 'declined' };
                                      return old;
                                    }));
                                  } catch { alert("Failed to accept."); }
                                }
                              }} className="p-1.5 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors text-slate-400 hover:text-emerald-500">
                                <CheckCircle size={16} />
                              </button>
                              <button title="Decline" onClick={async () => {
                                if (confirm(`Decline request #${r.id}?`)) {
                                  try {
                                    await api.declineRequest(r.id);
                                    setRequests(requests.map(old => old.id === r.id ? { ...old, status: 'declined' } : old));
                                  } catch { alert("Failed to decline."); }
                                }
                              }} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-slate-400 hover:text-red-500">
                                <XCircle size={16} />
                              </button>
                            </div>
                          )}
                          {r.status !== 'pending' && (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════ ANALYTICS TAB ═══════════ */}
        {activeTab === "analytics" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Request Trends Line Chart */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">📈 Request Volume Trends (30 Days)</h3>
              <div style={{ width: '100%', height: 280 }}>
                <ResponsiveContainer>
                  <LineChart data={requestTrends}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <Tooltip />
                    <Line type="monotone" dataKey="count" stroke="#7c3aed" strokeWidth={2.5} dot={{ r: 3 }} name="Requests" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* User Growth + Category Breakdown Side by Side */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">👥 User Acquisition (30 Days)</h3>
                <div style={{ width: '100%', height: 250 }}>
                  <ResponsiveContainer>
                    <BarChart data={userGrowth}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="date" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <YAxis tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <Tooltip />
                      <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} name="New Users" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">📊 Items by Category</h3>
                <div style={{ width: '100%', height: 250 }}>
                  <ResponsiveContainer>
                    <BarChart data={categories} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                      <YAxis dataKey="category" type="category" tick={{ fontSize: 10 }} stroke="#94a3b8" width={80} />
                      <Tooltip />
                      <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Items" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Top 10 Most Requested Items */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">🏆 Top 10 Most Requested Items</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={topItems.slice(0, 10)} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis type="number" tick={{ fontSize: 10 }} stroke="#94a3b8" />
                    <YAxis dataKey="title" type="category" tick={{ fontSize: 9 }} stroke="#94a3b8" width={120} />
                    <Tooltip />
                    <Bar dataKey="request_count" name="Requests">
                      {topItems.slice(0, 10).map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════ MAP TAB ═══════════ */}
        {activeTab === "map" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">🗺️ Item Locations Map</h3>
                <p className="text-xs text-slate-400 mt-1">All platform items shown geographically. Click markers for details.</p>
              </div>
              <div style={{ height: 500 }}>
                <AdminMapEmbed items={items} />
              </div>
            </div>

            {/* Item Location Table */}
            <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300">📍 Item Coordinates</h3>
              </div>
              <div className="overflow-x-auto max-h-[300px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 sticky top-0">
                    <tr>
                      <th className="px-4 py-2 text-left font-medium">Item</th>
                      <th className="px-4 py-2 text-left font-medium">Owner</th>
                      <th className="px-4 py-2 text-left font-medium">Status</th>
                      <th className="px-4 py-2 text-left font-medium">Latitude</th>
                      <th className="px-4 py-2 text-left font-medium">Longitude</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                    {items.filter(i => i.latitude && i.longitude).map(item => (
                      <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="px-4 py-2 font-medium text-slate-900 dark:text-white">{item.title}</td>
                        <td className="px-4 py-2 text-slate-500">{item.owner_name || '—'}</td>
                        <td className="px-4 py-2"><StatusBadge status={item.status} /></td>
                        <td className="px-4 py-2 font-mono text-slate-500">{Number(item.latitude).toFixed(4)}</td>
                        <td className="px-4 py-2 font-mono text-slate-500">{Number(item.longitude).toFixed(4)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}

// Embedded map component for admin (loaded dynamically to avoid SSR issues with Leaflet)
const AdminMapEmbed = dynamic(() => Promise.resolve(function AdminMapInner({ items }: { items: any[] }) {
  const { MapContainer, TileLayer, Marker, Popup, Circle } = require("react-leaflet");
  require("leaflet/dist/leaflet.css");
  const L = require("leaflet");

  delete (L.Icon.Default.prototype as any)._getIconUrl;
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
  });

  const validItems = items.filter(i => i.latitude && i.longitude);
  let center: [number, number] = [28.6139, 77.2090];
  if (validItems.length > 0) {
    center = [validItems[0].latitude, validItems[0].longitude];
  }

  const statusColors: Record<string, string> = {
    available: '#10b981',
    claimed: '#3b82f6',
    hidden: '#94a3b8',
  };

  return (
    <MapContainer center={center} zoom={12} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {validItems.map((item: any) => (
        <Marker key={item.id} position={[item.latitude, item.longitude]}>
          <Popup>
            <div className="min-w-[160px]">
              <h3 style={{ fontWeight: 'bold', fontSize: '13px', margin: '0 0 4px' }}>{item.title}</h3>
              <p style={{ fontSize: '11px', color: '#666', margin: '0 0 2px' }}>{item.category} · {item.condition}</p>
              <p style={{ fontSize: '11px', color: '#666', margin: '0 0 4px' }}>Owner: {item.owner_name || 'Anonymous'}</p>
              <span style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontSize: '10px',
                fontWeight: 'bold',
                color: 'white',
                background: statusColors[item.status] || '#94a3b8',
              }}>{item.status}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}), { ssr: false, loading: () => <div className="flex items-center justify-center h-full text-slate-400">Loading map...</div> });
