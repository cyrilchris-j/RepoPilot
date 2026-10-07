import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  GitBranch,
  ExternalLink,
  Search,
  Sparkles,
  ThumbsUp,
  Clock,
  ArrowRight,
  TrendingUp,
  Download,
  Copy,
  Check,
  Trash2,
  Edit3,
  BarChart3,
  Code2,
  RefreshCw,
  Plus,
  X,
  User,
  Star,
  Activity,
  Home,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  ArrowLeft,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import {
  getTrackedRepositories,
  getUserFeedbacks,
  getAdminMetrics,
  deleteTrackedRepository,
  recordRepositoryAnalysis,
  updateFeedbackStatus,
  deleteFeedback,
  isAdminAuthenticated,
  verifyAdminPassword,
  logoutAdmin,
} from '../lib/adminFeedbackService';
import { useRepo } from '../lib/RepoContext';
import type { TrackedRepository, UserFeedback, FeedbackStatus, FeedbackCategory } from '../types';

export function AdminPage() {
  const navigate = useNavigate();
  const { setRepoUrl } = useRepo();

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => isAdminAuthenticated());
  const [passwordInput, setPasswordInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // State
  const [activeTab, setActiveTab] = useState<'repos' | 'feedback' | 'analytics'>('repos');
  const [repos, setRepos] = useState<TrackedRepository[]>(() => getTrackedRepositories());
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>(() => getUserFeedbacks());
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [copiedAllRepos, setCopiedAllRepos] = useState(false);

  // Search & Filters for Repositories
  const [repoSearch, setRepoSearch] = useState('');
  const [repoSort, setRepoSort] = useState<'times' | 'recent' | 'name' | 'stars'>('times');

  // Search & Filters for Feedback
  const [feedbackSearch, setFeedbackSearch] = useState('');
  const [feedbackStatusFilter, setFeedbackStatusFilter] = useState<'all' | FeedbackStatus>('all');
  const [feedbackCategoryFilter, setFeedbackCategoryFilter] = useState<'all' | FeedbackCategory>('all');

  // Modal to manually add a repo
  const [isAddRepoModalOpen, setIsAddRepoModalOpen] = useState(false);
  const [newRepoUrl, setNewRepoUrl] = useState('');

  // Editing Admin Note modal
  const [editingNoteFeedbackId, setEditingNoteFeedbackId] = useState<string | null>(null);
  const [adminNoteText, setAdminNoteText] = useState('');

  // Admin authentication handlers
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);
    try {
      const ok = await verifyAdminPassword(passwordInput);
      if (ok) {
        setIsAuthenticated(true);
        setPasswordInput('');
        setRepos(getTrackedRepositories());
        setFeedbacks(getUserFeedbacks());
      } else {
        setLoginError('Incorrect administrator password. Access denied.');
      }
    } catch {
      setLoginError('Error verifying password. Please try again.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    logoutAdmin();
    setIsAuthenticated(false);
  };

  // Refresh lists
  const handleRefresh = () => {
    setRepos(getTrackedRepositories());
    setFeedbacks(getUserFeedbacks());
  };

  // Copy single repo link
  const copySingleLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(url);
    setTimeout(() => setCopiedLink(null), 1800);
  };

  // Copy all repo links as a newline-separated list
  const copyAllRepoLinks = () => {
    const allUrls = repos.map((r) => r.url).join('\n');
    navigator.clipboard.writeText(allUrls);
    setCopiedAllRepos(true);
    setTimeout(() => setCopiedAllRepos(false), 2000);
  };

  // Export all data as JSON
  const handleExportData = () => {
    const data = {
      exportedAt: new Date().toISOString(),
      service: 'RepoPilot Admin Export',
      summary: getAdminMetrics(),
      repositories: repos,
      userFeedback: feedbacks,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `repopilot-admin-data-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Delete repo
  const handleDeleteRepo = (id: string) => {
    if (confirm('Are you sure you want to remove this repository from admin tracking?')) {
      const updated = deleteTrackedRepository(id);
      setRepos(updated);
    }
  };

  // Open repository in RepoPilot
  const handleOpenInRepoPilot = (url: string) => {
    setRepoUrl(url);
    navigate('/analyzing', { state: { repoUrl: url } });
  };

  // Add manual repo
  const handleAddRepo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepoUrl.trim()) return;
    recordRepositoryAnalysis({ url: newRepoUrl.trim() });
    setRepos(getTrackedRepositories());
    setNewRepoUrl('');
    setIsAddRepoModalOpen(false);
  };

  // Feedback status update
  const handleStatusChange = (id: string, newStatus: FeedbackStatus) => {
    const updated = updateFeedbackStatus(id, newStatus);
    setFeedbacks(updated);
  };

  // Save admin note
  const handleSaveAdminNote = (id: string) => {
    const updated = updateFeedbackStatus(id, feedbacks.find((f) => f.id === id)?.status || 'under_review', adminNoteText);
    setFeedbacks(updated);
    setEditingNoteFeedbackId(null);
    setAdminNoteText('');
  };

  // Delete feedback
  const handleDeleteFeedback = (id: string) => {
    if (confirm('Are you sure you want to delete this suggestion?')) {
      const updated = deleteFeedback(id);
      setFeedbacks(updated);
    }
  };

  // Filtered Repositories
  const filteredRepos = useMemo(() => {
    return repos
      .filter((r) => {
        if (repoSearch.trim()) {
          const q = repoSearch.toLowerCase();
          const matchName = r.name.toLowerCase().includes(q);
          const matchOwner = r.owner.toLowerCase().includes(q);
          const matchUrl = r.url.toLowerCase().includes(q);
          const matchLang = (r.language || '').toLowerCase().includes(q);
          if (!matchName && !matchOwner && !matchUrl && !matchLang) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (repoSort === 'times') return (b.analysisCount || 1) - (a.analysisCount || 1);
        if (repoSort === 'recent') return new Date(b.lastAnalyzedAt).getTime() - new Date(a.lastAnalyzedAt).getTime();
        if (repoSort === 'stars') return (b.stars || 0) - (a.stars || 0);
        if (repoSort === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [repos, repoSearch, repoSort]);

  // Filtered Feedbacks
  const filteredFeedbacks = useMemo(() => {
    return feedbacks
      .filter((f) => {
        if (feedbackStatusFilter !== 'all' && f.status !== feedbackStatusFilter) return false;
        if (feedbackCategoryFilter !== 'all' && f.category !== feedbackCategoryFilter) return false;
        if (feedbackSearch.trim()) {
          const q = feedbackSearch.toLowerCase();
          const matchTitle = f.title.toLowerCase().includes(q);
          const matchDesc = f.description.toLowerCase().includes(q);
          const matchAuthor = (f.submittedBy || '').toLowerCase().includes(q);
          if (!matchTitle && !matchDesc && !matchAuthor) return false;
        }
        return true;
      })
      .sort((a, b) => b.votes - a.votes);
  }, [feedbacks, feedbackStatusFilter, feedbackCategoryFilter, feedbackSearch]);

  // Overall metrics
  const metrics = useMemo(() => getAdminMetrics(), [repos, feedbacks]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-6 text-text-primary">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md p-8 rounded-2xl bg-surface border border-border shadow-2xl space-y-6"
        >
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan flex items-center justify-center mx-auto">
              <Lock size={22} />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-text-primary">
              RepoPilot Admin Access
            </h2>
            <p className="text-xs text-text-secondary max-w-sm mx-auto">
              Enter the administrator password to view analyzed repositories, repository links, website usage, and user improvement suggestions.
            </p>
          </div>

          {loginError && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
              <AlertCircle size={14} className="shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-text-secondary uppercase tracking-wider mb-1.5">
                Admin Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="Enter administrator password..."
                  className="w-full px-3.5 py-2.5 pr-10 text-xs rounded-lg bg-elevated border border-border focus:border-accent-cyan focus:outline-none text-text-primary font-mono placeholder:text-text-secondary/40"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-1"
                >
                  {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoggingIn}
              className="w-full btn-primary py-2.5 text-xs font-medium flex items-center justify-center gap-2 cursor-pointer"
            >
              <ShieldCheck size={14} />
              <span>{isLoggingIn ? 'Verifying...' : 'Unlock Admin Dashboard'}</span>
            </button>
          </form>

          <div className="pt-4 border-t border-border/60 flex items-center justify-between text-xs">
            <Link to="/" className="text-text-secondary hover:text-text-primary flex items-center gap-1">
              <ArrowLeft size={12} />
              <span>Return to Home</span>
            </Link>
            <Link to="/app" className="text-accent-cyan hover:underline">
              Open App
            </Link>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg text-text-primary pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 bg-surface/90 backdrop-blur border-b border-border px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="w-7 h-7 rounded border border-accent-cyan/40 bg-accent-cyan/10 flex items-center justify-center">
                <ShieldAlert size={15} className="text-accent-cyan" />
              </div>
              <div>
                <span className="text-sm font-semibold tracking-tight">RepoPilot</span>
                <span className="ml-2 text-[10px] font-mono px-1.5 py-0.5 rounded bg-accent-cyan/15 text-accent-cyan border border-accent-cyan/30 uppercase font-semibold">
                  ADMIN
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleRefresh}
              className="p-1.5 rounded-lg bg-elevated border border-border/80 hover:border-accent-cyan/40 text-text-secondary hover:text-text-primary text-xs transition-colors"
              title="Refresh Data"
            >
              <RefreshCw size={14} />
            </button>

            <button
              type="button"
              onClick={handleExportData}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-elevated border border-border/80 hover:border-accent-cyan/40 text-text-secondary hover:text-text-primary text-xs transition-colors"
              title="Export all data as JSON"
            >
              <Download size={13} className="text-accent-cyan" />
              <span className="hidden sm:inline text-[11px] font-mono">Export Data</span>
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="p-1.5 rounded-lg bg-elevated border border-border/80 hover:bg-rose-500/10 hover:border-rose-500/40 text-text-secondary hover:text-rose-400 text-xs transition-colors"
              title="Lock Admin Session"
            >
              <LogOut size={14} />
            </button>

            <Link
              to="/app/improvements"
              className="hidden md:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-surface border border-border text-text-secondary hover:text-text-primary text-xs transition-colors"
            >
              <Sparkles size={13} className="text-accent-violet" />
              <span>Feedback Wishlist</span>
            </Link>

            <Link
              to="/app"
              className="btn-primary text-xs px-3.5 py-1.5 flex items-center gap-1"
            >
              <span>Open App</span>
              <ArrowRight size={12} />
            </Link>

            <Link
              to="/"
              className="p-1.5 rounded-lg bg-elevated border border-border/60 text-text-secondary hover:text-text-primary transition-colors"
              title="Go to Home Page"
            >
              <Home size={14} />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 pt-8">
        {/* Page Title & Status */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-border/80">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-text-primary flex items-center gap-2.5">
              <span>Admin Dashboard &amp; Analytics</span>
            </h1>
            <p className="text-xs md:text-sm text-text-secondary mt-1">
              Live overview of website usage, analyzed repositories, GitHub repository links, and user improvement feedback.
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              ADMIN MODE ACTIVE
            </span>
          </div>
        </div>

        {/* 5-Metric Hero Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5 mt-6">
          {/* Card 1: Total Repos */}
          <div className="p-4 rounded-xl bg-surface border border-border/80 shadow-xs relative overflow-hidden group">
            <div className="text-[10px] font-mono text-text-secondary uppercase tracking-wider flex items-center justify-between">
              <span>REPOSITORIES</span>
              <GitBranch size={13} className="text-accent-cyan" />
            </div>
            <div className="text-2xl font-bold font-mono text-text-primary mt-2">
              {metrics.totalRepositories}
            </div>
            <div className="text-[11px] text-text-secondary mt-1 flex items-center gap-1">
              <span className="text-accent-cyan font-medium">Distinct codebases</span>
            </div>
          </div>

          {/* Card 2: Total Analysis Runs (Usage Count) */}
          <div className="p-4 rounded-xl bg-surface border border-border/80 shadow-xs relative overflow-hidden group">
            <div className="text-[10px] font-mono text-text-secondary uppercase tracking-wider flex items-center justify-between">
              <span>TOTAL RUNS</span>
              <Activity size={13} className="text-accent-violet" />
            </div>
            <div className="text-2xl font-bold font-mono text-accent-cyan mt-2">
              {metrics.totalAnalyses}
            </div>
            <div className="text-[11px] text-text-secondary mt-1">
              Website analysis uses
            </div>
          </div>

          {/* Card 3: Estimated Unique Users */}
          <div className="p-4 rounded-xl bg-surface border border-border/80 shadow-xs relative overflow-hidden group">
            <div className="text-[10px] font-mono text-text-secondary uppercase tracking-wider flex items-center justify-between">
              <span>DEVELOPERS</span>
              <User size={13} className="text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
              {metrics.uniqueUsers}
            </div>
            <div className="text-[11px] text-text-secondary mt-1">
              Active sessions
            </div>
          </div>

          {/* Card 4: User Improvement Suggestions */}
          <div className="p-4 rounded-xl bg-surface border border-border/80 shadow-xs relative overflow-hidden group">
            <div className="text-[10px] font-mono text-text-secondary uppercase tracking-wider flex items-center justify-between">
              <span>SUGGESTIONS</span>
              <Sparkles size={13} className="text-purple-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-purple-300 mt-2">
              {metrics.totalFeedback}
            </div>
            <div className="text-[11px] text-text-secondary mt-1">
              Community feedback
            </div>
          </div>

          {/* Card 5: Total Votes */}
          <div className="p-4 rounded-xl bg-surface border border-border/80 shadow-xs relative overflow-hidden group col-span-2 md:col-span-1">
            <div className="text-[10px] font-mono text-text-secondary uppercase tracking-wider flex items-center justify-between">
              <span>COMMUNITY VOTES</span>
              <ThumbsUp size={13} className="text-amber-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-amber-400 mt-2">
              {metrics.totalVotes}
            </div>
            <div className="text-[11px] text-text-secondary mt-1">
              Total feature likes
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 mt-8 border-b border-border/80">
          <button
            type="button"
            onClick={() => setActiveTab('repos')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'repos'
                ? 'border-accent-cyan text-accent-cyan font-semibold'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <GitBranch size={14} />
            <span>Analyzed Repositories &amp; Links</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface border border-border">
              {repos.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('feedback')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'feedback'
                ? 'border-accent-cyan text-accent-cyan font-semibold'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <Sparkles size={14} />
            <span>User Improvements &amp; Wishlist</span>
            <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-surface border border-border">
              {feedbacks.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`flex items-center gap-2 px-4 py-3 text-xs font-medium border-b-2 transition-all ${
              activeTab === 'analytics'
                ? 'border-accent-cyan text-accent-cyan font-semibold'
                : 'border-transparent text-text-secondary hover:text-text-primary'
            }`}
          >
            <BarChart3 size={14} />
            <span>Analytics &amp; Usage Breakdown</span>
          </button>
        </div>

        {/* ─── TAB 1: ANALYZED REPOSITORIES & LINKS ─── */}
        {activeTab === 'repos' && (
          <div className="mt-6 space-y-4">
            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  value={repoSearch}
                  onChange={(e) => setRepoSearch(e.target.value)}
                  placeholder="Search repository name, owner, language..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-surface border border-border/80 focus:border-accent-cyan/60 focus:outline-none text-text-primary placeholder:text-text-secondary/50"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Sort */}
                <div className="flex items-center gap-1.5 bg-surface border border-border/80 rounded-lg px-2.5 py-1 text-xs">
                  <span className="text-[10px] font-mono text-text-secondary uppercase">Sort:</span>
                  <select
                    value={repoSort}
                    onChange={(e) => setRepoSort(e.target.value as any)}
                    aria-label="Sort repositories"
                    className="bg-transparent text-text-primary text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="times" className="bg-surface">Most Analyzed (Usage)</option>
                    <option value="recent" className="bg-surface">Recently Analyzed</option>
                    <option value="stars" className="bg-surface">GitHub Stars</option>
                    <option value="name" className="bg-surface">Repo Name</option>
                  </select>
                </div>

                {/* Copy All Repo Links */}
                <button
                  type="button"
                  onClick={copyAllRepoLinks}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-elevated border border-border/80 hover:border-accent-cyan/40 text-text-secondary hover:text-text-primary text-xs transition-colors"
                  title="Copy all repository URLs to clipboard"
                >
                  {copiedAllRepos ? (
                    <Check size={13} className="text-emerald-400" />
                  ) : (
                    <Copy size={13} />
                  )}
                  <span>{copiedAllRepos ? 'Copied All URLs!' : 'Copy All Links'}</span>
                </button>

                {/* Manual Add Repo */}
                <button
                  type="button"
                  onClick={() => setIsAddRepoModalOpen(true)}
                  className="btn-primary flex items-center gap-1 px-3 py-1.5 text-xs font-medium"
                >
                  <Plus size={13} />
                  <span>Track Repo</span>
                </button>
              </div>
            </div>

            {/* Repositories Table / Card List */}
            <div className="rounded-xl border border-border/80 bg-surface/60 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-elevated/80 border-b border-border/80 text-[10px] font-mono text-text-secondary uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Repository &amp; Owner</th>
                      <th className="py-3 px-4">Repository Link (GitHub)</th>
                      <th className="py-3 px-4">Usage / Analyzed</th>
                      <th className="py-3 px-4">Language</th>
                      <th className="py-3 px-4">Last Active</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50 font-sans">
                    {filteredRepos.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-text-secondary">
                          No repositories found matching your query.
                        </td>
                      </tr>
                    ) : (
                      filteredRepos.map((r) => {
                        const isCopied = copiedLink === r.url;
                        const lastTime = new Date(r.lastAnalyzedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <tr
                            key={r.id}
                            className="hover:bg-elevated/40 transition-colors group"
                          >
                            {/* Repo identity */}
                            <td className="py-3.5 px-4 font-mono">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 rounded bg-elevated border border-border/70 flex items-center justify-center text-text-secondary">
                                  <GitBranch size={13} />
                                </div>
                                <div>
                                  <div className="font-semibold text-text-primary text-[13px]">
                                    {r.owner}/{r.name}
                                  </div>
                                  {r.stars ? (
                                    <div className="text-[10px] text-text-secondary flex items-center gap-1 font-sans">
                                      <Star size={10} className="text-amber-400 fill-amber-400" />
                                      <span>{r.stars.toLocaleString()} stars</span>
                                    </div>
                                  ) : null}
                                </div>
                              </div>
                            </td>

                            {/* Clickable link */}
                            <td className="py-3.5 px-4">
                              <div className="flex items-center gap-1.5 max-w-xs">
                                <a
                                  href={r.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-accent-cyan hover:underline truncate font-mono text-[11px] flex items-center gap-1"
                                  title={`Open ${r.url} on GitHub`}
                                >
                                  <span>{r.url}</span>
                                  <ExternalLink size={11} className="shrink-0" />
                                </a>
                                <button
                                  type="button"
                                  onClick={() => copySingleLink(r.url)}
                                  className="p-1 rounded hover:bg-elevated text-text-secondary hover:text-text-primary transition-colors shrink-0"
                                  title="Copy URL"
                                >
                                  {isCopied ? (
                                    <Check size={11} className="text-emerald-400" />
                                  ) : (
                                    <Copy size={11} />
                                  )}
                                </button>
                              </div>
                            </td>

                            {/* Usage Count */}
                            <td className="py-3.5 px-4">
                              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-accent-cyan/10 text-accent-cyan border border-accent-cyan/30 font-mono text-[11px] font-semibold">
                                <Activity size={10} />
                                <span>{r.analysisCount || 1} times</span>
                              </span>
                            </td>

                            {/* Language */}
                            <td className="py-3.5 px-4">
                              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-elevated border border-border/70 text-text-secondary">
                                {r.language || 'Code'}
                              </span>
                            </td>

                            {/* Last Active */}
                            <td className="py-3.5 px-4 text-[11px] font-mono text-text-secondary">
                              <div className="flex items-center gap-1">
                                <Clock size={11} />
                                <span>{lastTime}</span>
                              </div>
                            </td>

                            {/* Actions */}
                            <td className="py-3.5 px-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenInRepoPilot(r.url)}
                                  className="px-2.5 py-1 rounded bg-accent-cyan/10 hover:bg-accent-cyan/20 border border-accent-cyan/30 text-accent-cyan text-[11px] font-medium transition-colors"
                                  title="Open inside RepoPilot workspace"
                                >
                                  Inspect Repo
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteRepo(r.id)}
                                  className="p-1.5 rounded hover:bg-rose-500/10 text-text-secondary hover:text-rose-400 transition-colors"
                                  title="Remove from admin tracking"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* ─── TAB 2: USER IMPROVEMENTS & FEEDBACK ─── */}
        {activeTab === 'feedback' && (
          <div className="mt-6 space-y-4">
            {/* Filter Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1 max-w-md">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-secondary" />
                <input
                  type="text"
                  value={feedbackSearch}
                  onChange={(e) => setFeedbackSearch(e.target.value)}
                  placeholder="Search suggestions, feedback, authors..."
                  className="w-full pl-9 pr-4 py-2 text-xs rounded-lg bg-surface border border-border/80 focus:border-accent-cyan/60 focus:outline-none text-text-primary placeholder:text-text-secondary/50"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                {/* Status Filter */}
                <div className="flex items-center gap-1 bg-surface border border-border/80 rounded-lg px-2 py-1">
                  <span className="text-[10px] font-mono text-text-secondary uppercase">Status:</span>
                  <select
                    value={feedbackStatusFilter}
                    onChange={(e) => setFeedbackStatusFilter(e.target.value as any)}
                    aria-label="Filter feedback by status"
                    className="bg-transparent text-text-primary text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-surface">All Statuses</option>
                    <option value="under_review" className="bg-surface">Under Review</option>
                    <option value="planned" className="bg-surface">Planned</option>
                    <option value="in_progress" className="bg-surface">In Progress</option>
                    <option value="completed" className="bg-surface">Completed</option>
                  </select>
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-1 bg-surface border border-border/80 rounded-lg px-2 py-1">
                  <span className="text-[10px] font-mono text-text-secondary uppercase">Category:</span>
                  <select
                    value={feedbackCategoryFilter}
                    onChange={(e) => setFeedbackCategoryFilter(e.target.value as any)}
                    aria-label="Filter feedback by category"
                    className="bg-transparent text-text-primary text-xs focus:outline-none cursor-pointer"
                  >
                    <option value="all" className="bg-surface">All Categories</option>
                    <option value="feature" className="bg-surface">Feature Request</option>
                    <option value="ui_ux" className="bg-surface">UI / UX</option>
                    <option value="agent_ai" className="bg-surface">AI Intelligence</option>
                    <option value="integration" className="bg-surface">Integration</option>
                    <option value="performance" className="bg-surface">Performance</option>
                    <option value="other" className="bg-surface">General</option>
                  </select>
                </div>

                <Link
                  to="/app/improvements"
                  className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1 font-medium"
                >
                  <Plus size={13} />
                  <span>Public Wishlist</span>
                </Link>
              </div>
            </div>

            {/* Feedback Cards */}
            <div className="space-y-3">
              {filteredFeedbacks.length === 0 ? (
                <div className="py-12 text-center text-text-secondary border border-dashed border-border/80 rounded-xl bg-surface/30">
                  No improvement suggestions match the current filters.
                </div>
              ) : (
                filteredFeedbacks.map((f) => {
                  return (
                    <div
                      key={f.id}
                      className="p-5 rounded-xl border border-border/80 bg-surface/80 hover:border-border transition-all space-y-3 shadow-xs"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2 mb-1.5">
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan uppercase">
                              {f.category.replace('_', ' ')}
                            </span>

                            {/* Status dropdown directly editable by Admin */}
                            <select
                              value={f.status}
                              onChange={(e) => handleStatusChange(f.id, e.target.value as FeedbackStatus)}
                              className={`text-[10px] font-mono px-2 py-0.5 rounded border focus:outline-none cursor-pointer ${
                                f.status === 'completed'
                                  ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                                  : f.status === 'planned'
                                  ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                  : f.status === 'in_progress'
                                  ? 'bg-purple-500/10 text-purple-300 border-purple-500/40'
                                  : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                              }`}
                            >
                              <option value="under_review" className="bg-surface text-text-primary">Under Review</option>
                              <option value="planned" className="bg-surface text-text-primary">Planned</option>
                              <option value="in_progress" className="bg-surface text-text-primary">In Progress</option>
                              <option value="completed" className="bg-surface text-text-primary">Completed</option>
                            </select>

                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-elevated border border-border text-text-secondary flex items-center gap-1">
                              <ThumbsUp size={11} className="text-amber-400" />
                              <span>{f.votes} votes</span>
                            </span>
                          </div>

                          <h3 className="text-sm font-semibold text-text-primary">
                            {f.title}
                          </h3>

                          <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                            {f.description}
                          </p>

                          {/* Existing Developer Note */}
                          {f.adminNote && (
                            <div className="mt-2.5 p-2.5 rounded-lg bg-accent-cyan/5 border border-accent-cyan/20 text-xs text-text-primary">
                              <div className="text-[10px] font-mono text-accent-cyan font-semibold uppercase flex items-center gap-1">
                                <Sparkles size={11} />
                                <span>Official Developer Response</span>
                              </div>
                              <p className="text-[11px] text-text-secondary mt-0.5">
                                {f.adminNote}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Admin Action Buttons */}
                        <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoteFeedbackId(f.id);
                              setAdminNoteText(f.adminNote || '');
                            }}
                            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-elevated border border-border/80 hover:border-accent-cyan/40 text-text-secondary hover:text-text-primary text-xs transition-colors"
                            title="Add or edit developer reply"
                          >
                            <Edit3 size={12} className="text-accent-cyan" />
                            <span className="text-[11px]">Reply</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteFeedback(f.id)}
                            className="p-1.5 rounded-lg hover:bg-rose-500/10 text-text-secondary hover:text-rose-400 transition-colors"
                            title="Delete suggestion"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] font-mono text-text-secondary">
                        <div className="flex items-center gap-2">
                          <span className="text-text-primary font-medium">{f.submittedBy}</span>
                          <span>{f.userHandle}</span>
                        </div>
                        <div>
                          {new Date(f.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 3: ANALYTICS & USAGE BREAKDOWN ─── */}
        {activeTab === 'analytics' && (
          <div className="mt-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Language Distribution */}
              <div className="p-5 rounded-xl border border-border/80 bg-surface/80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                    <Code2 size={15} className="text-accent-cyan" />
                    <span>Analyzed Codebase Languages</span>
                  </h3>
                  <span className="text-[10px] font-mono text-text-secondary">
                    {metrics.topLanguages.length} Languages
                  </span>
                </div>

                <div className="space-y-3">
                  {metrics.topLanguages.map(({ language, count }) => {
                    const pct = Math.round((count / Math.max(metrics.totalRepositories, 1)) * 100);
                    return (
                      <div key={language} className="space-y-1">
                        <div className="flex justify-between text-xs font-mono">
                          <span className="text-text-primary">{language}</span>
                          <span className="text-text-secondary">{count} repos ({pct}%)</span>
                        </div>
                        <div className="h-1.5 w-full rounded-full bg-elevated overflow-hidden">
                          <div
                            className="h-full bg-accent-cyan rounded-full transition-all duration-500"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Most Analyzed Repositories */}
              <div className="p-5 rounded-xl border border-border/80 bg-surface/80">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                    <TrendingUp size={15} className="text-accent-violet" />
                    <span>Top Visited / Analyzed Repositories</span>
                  </h3>
                  <span className="text-[10px] font-mono text-text-secondary">By frequency</span>
                </div>

                <div className="space-y-2.5">
                  {repos.slice(0, 5).map((r, i) => (
                    <div
                      key={r.id}
                      className="p-2.5 rounded-lg bg-elevated/50 border border-border/60 flex items-center justify-between text-xs"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-full bg-surface border border-border/80 text-[10px] font-mono flex items-center justify-center shrink-0">
                          {i + 1}
                        </span>
                        <div className="truncate">
                          <span className="font-mono font-medium text-text-primary">{r.name}</span>
                          <span className="text-text-secondary ml-1.5 text-[11px]">({r.owner})</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono text-accent-cyan font-bold text-[11px]">
                          {r.analysisCount || 1} scans
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Quick Export Handbook / Data Card */}
            <div className="p-6 rounded-xl border border-border/80 bg-gradient-to-br from-surface via-elevated to-surface flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Download size={15} className="text-accent-cyan" />
                  <span>Download Full Website Activity Report</span>
                </h4>
                <p className="text-xs text-text-secondary mt-1">
                  Export all repository links, visit counts, timestamps, and community improvement feedback as a JSON file.
                </p>
              </div>
              <button
                type="button"
                onClick={handleExportData}
                className="btn-primary text-xs px-4 py-2 flex items-center gap-1.5 shrink-0"
              >
                <Download size={13} />
                <span>Export JSON Report</span>
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Modal: Manually Track Repo */}
      <AnimatePresence>
        {isAddRepoModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-surface border border-border rounded-xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <GitBranch size={16} className="text-accent-cyan" />
                  <span>Track Repository in Admin</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddRepoModalOpen(false)}
                  className="p-1 rounded text-text-secondary hover:text-text-primary"
                >
                  <X size={15} />
                </button>
              </div>

              <form onSubmit={handleAddRepo} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1">
                    GitHub URL or repository identifier
                  </label>
                  <input
                    type="text"
                    required
                    value={newRepoUrl}
                    onChange={(e) => setNewRepoUrl(e.target.value)}
                    placeholder="e.g. vercel/next.js or https://github.com/facebook/react"
                    className="w-full px-3 py-2 text-xs rounded-lg bg-elevated border border-border focus:border-accent-cyan focus:outline-none text-text-primary placeholder:text-text-secondary/40 font-mono"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddRepoModalOpen(false)}
                    className="px-3 py-1.5 text-xs rounded text-text-secondary hover:text-text-primary"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary text-xs px-4 py-1.5"
                  >
                    Add Repository
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Edit Developer Note */}
      <AnimatePresence>
        {editingNoteFeedbackId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-lg bg-surface border border-border rounded-xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-border/80 pb-3">
                <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                  <Sparkles size={16} className="text-accent-cyan" />
                  <span>Developer Response / Roadmap Note</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setEditingNoteFeedbackId(null)}
                  className="p-1 rounded text-text-secondary hover:text-text-primary"
                >
                  <X size={15} />
                </button>
              </div>

              <div>
                <label className="block text-xs font-medium text-text-primary mb-1">
                  Public Developer Response (Visible to users on Improvements page)
                </label>
                <textarea
                  rows={3}
                  value={adminNoteText}
                  onChange={(e) => setAdminNoteText(e.target.value)}
                  placeholder="e.g. Thanks for the suggestion! We're planning to implement this in our upcoming release."
                  className="w-full px-3 py-2 text-xs rounded-lg bg-elevated border border-border focus:border-accent-cyan focus:outline-none text-text-primary placeholder:text-text-secondary/40 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingNoteFeedbackId(null)}
                  className="px-3 py-1.5 text-xs rounded text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveAdminNote(editingNoteFeedbackId)}
                  className="btn-primary text-xs px-4 py-1.5"
                >
                  Save Response
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
