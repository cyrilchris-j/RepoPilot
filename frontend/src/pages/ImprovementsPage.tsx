import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Send,
  Check,
  Tag,
  User,
  ShieldCheck,
  Lock,
  Eye,
  EyeOff,
  LogOut,
  Clock,
  Trash2,
  Edit3,
  AlertCircle,
  FileText,
  ArrowRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  getUserFeedbacks,
  submitUserFeedback,
  isAdminAuthenticated,
  verifyAdminPassword,
  logoutAdmin,
  updateFeedbackStatus,
  deleteFeedback,
} from '../lib/adminFeedbackService';
import type { UserFeedback, FeedbackCategory, FeedbackStatus } from '../types';

const CATEGORIES: Array<{ id: FeedbackCategory; label: string; desc: string }> = [
  { id: 'feature', label: 'Feature Request', desc: 'New capability or tool you would like added' },
  { id: 'ui_ux', label: 'UI / UX Design', desc: 'Interface, theme, readability or design tweak' },
  { id: 'agent_ai', label: 'AI Intelligence', desc: 'AI code analysis, assistant or agent prompts' },
  { id: 'integration', label: 'Integration', desc: 'GitHub, GitLab, Docker, or CI/CD integration' },
  { id: 'performance', label: 'Performance', desc: 'Faster repo indexing, speed or memory optimization' },
  { id: 'other', label: 'General Feedback', desc: 'Other ideas or comments for the website' },
];

export function ImprovementsPage() {
  // Admin authentication state
  const [isAdmin, setIsAdmin] = useState<boolean>(() => isAdminAuthenticated());
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPasswordInput, setAdminPasswordInput] = useState('');
  const [showPasswordText, setShowPasswordText] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  // Form state for regular users
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<FeedbackCategory>('feature');
  const [formPriority, setFormPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [formName, setFormName] = useState('');
  const [formHandle, setFormHandle] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Admin view state
  const [feedbacks, setFeedbacks] = useState<UserFeedback[]>([]);
  const [activeTab, setActiveTab] = useState<'submit' | 'admin_view'>('submit');
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [adminNoteText, setAdminNoteText] = useState('');

  // When admin unlocks, load feedback list
  useEffect(() => {
    if (isAdmin) {
      setFeedbacks(getUserFeedbacks());
    }
  }, [isAdmin]);

  // Handle password login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setIsVerifying(true);

    try {
      const ok = await verifyAdminPassword(adminPasswordInput);
      if (ok) {
        setIsAdmin(true);
        setShowAdminLogin(false);
        setAdminPasswordInput('');
        setFeedbacks(getUserFeedbacks());
        setActiveTab('admin_view');
      } else {
        setAuthError('Incorrect administrator password. Access denied.');
      }
    } catch {
      setAuthError('Failed to verify password. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setIsAdmin(false);
    setActiveTab('submit');
  };

  // Submit suggestion form
  const handleSubmitSuggestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formDescription.trim()) return;

    submitUserFeedback({
      title: formTitle.trim(),
      description: formDescription.trim(),
      category: formCategory,
      priority: formPriority,
      submittedBy: formName.trim() || 'Community Developer',
      userHandle: formHandle.trim() || '@developer',
    });

    setIsSubmitted(true);
    setFormTitle('');
    setFormDescription('');
    setFormName('');
    setFormHandle('');
    setFormPriority('medium');
  };

  // Admin actions
  const handleStatusChange = (id: string, newStatus: FeedbackStatus) => {
    const updated = updateFeedbackStatus(id, newStatus);
    setFeedbacks(updated);
  };

  const handleSaveNote = (id: string) => {
    const target = feedbacks.find(f => f.id === id);
    const updated = updateFeedbackStatus(id, target?.status || 'under_review', adminNoteText);
    setFeedbacks(updated);
    setEditingNoteId(null);
    setAdminNoteText('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this improvement suggestion?')) {
      const updated = deleteFeedback(id);
      setFeedbacks(updated);
    }
  };

  return (
    <div className="min-h-full pb-16 bg-bg text-text-primary">
      {/* Top Header */}
      <div className="border-b border-border/80 bg-surface/60 backdrop-blur-xs px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan text-xs font-mono mb-2.5">
              <Sparkles size={13} />
              <span>FEEDBACK &amp; FEATURE SUGGESTIONS</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-semibold tracking-tight text-text-primary">
              Suggest an Improvement
            </h1>
            <p className="text-xs md:text-sm text-text-secondary mt-1 max-w-xl leading-relaxed">
              Have an idea or feature you&apos;d love to see added to RepoPilot? Submit your suggestion below.
              All feedback is sent directly and privately to the administrator.
            </p>
          </div>

          {/* Admin view switch (only visible if admin is authenticated) */}
          {isAdmin && (
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setActiveTab(activeTab === 'admin_view' ? 'submit' : 'admin_view')}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono transition-colors flex items-center gap-1.5 ${
                  activeTab === 'admin_view'
                    ? 'bg-accent-cyan/15 border-accent-cyan/50 text-accent-cyan font-semibold'
                    : 'bg-elevated border-border text-text-secondary hover:text-text-primary'
                }`}
              >
                <ShieldCheck size={13} className="text-accent-cyan" />
                <span>{activeTab === 'admin_view' ? 'Form Mode' : 'Admin View'}</span>
              </button>
              <button
                type="button"
                onClick={handleAdminLogout}
                className="p-1.5 rounded-lg bg-elevated border border-border/80 hover:bg-rose-500/10 hover:border-rose-500/30 text-text-secondary hover:text-rose-400 text-xs transition-colors"
                title="Lock Admin Session"
              >
                <LogOut size={13} />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-4xl mx-auto px-6 mt-8">
        {/* ─── TAB 1: SUGGESTION SUBMISSION FORM (DEFAULT FOR REGULAR USERS) ─── */}
        {activeTab === 'submit' && (
          <div className="space-y-6">
            {isSubmitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 rounded-2xl border border-border/80 bg-surface/90 text-center space-y-4 shadow-lg max-w-xl mx-auto my-6"
              >
                <div className="w-14 h-14 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center mx-auto">
                  <Check size={28} />
                </div>
                <h3 className="text-lg font-semibold text-text-primary">
                  Thank You for Your Suggestion!
                </h3>
                <p className="text-xs text-text-secondary max-w-md mx-auto leading-relaxed">
                  Your improvement feedback has been securely submitted. Only the site administrator
                  can view this submission to review and plan roadmap additions.
                </p>
                <div className="pt-3">
                  <button
                    type="button"
                    onClick={() => setIsSubmitted(false)}
                    className="btn-primary text-xs px-4 py-2 inline-flex items-center gap-1.5"
                  >
                    <span>Submit Another Improvement</span>
                    <ArrowRight size={13} />
                  </button>
                </div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-border/80 bg-surface/80 p-6 md:p-8 shadow-sm"
              >
                <div className="border-b border-border/60 pb-5 mb-6">
                  <h2 className="text-base font-semibold text-text-primary flex items-center gap-2">
                    <FileText size={16} className="text-accent-cyan" />
                    <span>Improvement Suggestion Form</span>
                  </h2>
                  <p className="text-xs text-text-secondary mt-1">
                    Describe what feature or enhancement you would like added to the website.
                  </p>
                </div>

                <form onSubmit={handleSubmitSuggestion} className="space-y-5">
                  {/* Title */}
                  <div>
                    <label className="block text-xs font-medium text-text-primary mb-1.5">
                      Improvement Title <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Add interactive Git branch graph visualizer"
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg bg-elevated border border-border/80 focus:border-accent-cyan/60 focus:outline-none text-text-primary placeholder:text-text-secondary/40 transition-colors"
                    />
                  </div>

                  {/* Category Selection */}
                  <div>
                    <label className="block text-xs font-medium text-text-primary mb-2">
                      Category
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
                      {CATEGORIES.map((cat) => {
                        const isSelected = formCategory === cat.id;
                        return (
                          <button
                            type="button"
                            key={cat.id}
                            onClick={() => setFormCategory(cat.id)}
                            className={`p-3 rounded-xl border text-left transition-all ${
                              isSelected
                                ? 'bg-accent-cyan/10 border-accent-cyan/60 shadow-xs'
                                : 'bg-elevated/40 border-border/70 hover:bg-elevated hover:border-border'
                            }`}
                          >
                            <div className="flex items-center gap-1.5">
                              <Tag
                                size={12}
                                className={isSelected ? 'text-accent-cyan' : 'text-text-secondary'}
                              />
                              <span
                                className={`text-xs font-medium ${
                                  isSelected ? 'text-accent-cyan' : 'text-text-primary'
                                }`}
                              >
                                {cat.label}
                              </span>
                            </div>
                            <p className="text-[11px] text-text-secondary mt-1 leading-snug">
                              {cat.desc}
                            </p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Detailed Description */}
                  <div>
                    <label className="block text-xs font-medium text-text-primary mb-1.5">
                      Detailed Suggestion / How It Helps <span className="text-rose-400">*</span>
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formDescription}
                      onChange={(e) => setFormDescription(e.target.value)}
                      placeholder="Explain how you would like this feature to work and how it will improve developer productivity on RepoPilot..."
                      className="w-full px-3.5 py-2.5 text-xs rounded-lg bg-elevated border border-border/80 focus:border-accent-cyan/60 focus:outline-none text-text-primary placeholder:text-text-secondary/40 resize-none leading-relaxed"
                    />
                  </div>

                  {/* Priority */}
                  <div>
                    <label className="block text-xs font-medium text-text-primary mb-1.5">
                      Impact / Priority
                    </label>
                    <div className="flex gap-2">
                      {(['low', 'medium', 'high'] as const).map((p) => (
                        <button
                          type="button"
                          key={p}
                          onClick={() => setFormPriority(p)}
                          className={`flex-1 py-2 text-xs rounded-lg border capitalize transition-colors ${
                            formPriority === p
                              ? 'bg-accent-cyan/15 border-accent-cyan/60 text-accent-cyan font-medium'
                              : 'bg-elevated/40 border-border/60 text-text-secondary hover:text-text-primary'
                          }`}
                        >
                          {p === 'low' ? 'Nice to have' : p === 'medium' ? 'Helpful' : 'High Priority'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Submitter Name & Handle */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    <div>
                      <label className="block text-xs font-medium text-text-primary mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Alex Rivera"
                        className="w-full px-3.5 py-2 text-xs rounded-lg bg-elevated border border-border/80 focus:border-accent-cyan/60 focus:outline-none text-text-primary placeholder:text-text-secondary/40"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-text-primary mb-1.5">
                        GitHub Username or Email
                      </label>
                      <input
                        type="text"
                        value={formHandle}
                        onChange={(e) => setFormHandle(e.target.value)}
                        placeholder="e.g. @alex or alex@example.com"
                        className="w-full px-3.5 py-2 text-xs rounded-lg bg-elevated border border-border/80 focus:border-accent-cyan/60 focus:outline-none text-text-primary placeholder:text-text-secondary/40"
                      />
                    </div>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-4 border-t border-border flex items-center justify-between">
                    <span className="text-[11px] text-text-secondary font-mono flex items-center gap-1">
                      <Lock size={11} className="text-accent-cyan" />
                      <span>Sent privately to Admin</span>
                    </span>

                    <button
                      type="submit"
                      className="btn-primary text-xs px-5 py-2.5 flex items-center gap-1.5 font-medium shadow-md shadow-accent-cyan/10"
                    >
                      <Send size={13} />
                      <span>Send Suggestion</span>
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </div>
        )}

        {/* ─── TAB 2: ADMIN VIEW (PASSWORD PROTECTED - ONLY ADMIN CAN VIEW) ─── */}
        {activeTab === 'admin_view' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl border border-accent-cyan/30 bg-accent-cyan/5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-accent-cyan" />
                <div>
                  <h3 className="text-xs font-semibold text-text-primary font-mono uppercase">
                    Admin Protected View
                  </h3>
                  <p className="text-[11px] text-text-secondary">
                    You are authenticated as administrator. Viewing all {feedbacks.length} submitted improvements.
                  </p>
                </div>
              </div>

              <Link
                to="/admin"
                className="btn-primary text-xs px-3 py-1.5 flex items-center gap-1"
              >
                <span>Full Admin Dashboard</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            {feedbacks.length === 0 ? (
              <div className="p-12 text-center text-text-secondary border border-dashed border-border/80 rounded-xl bg-surface/40">
                No improvement suggestions have been submitted yet.
              </div>
            ) : (
              feedbacks.map((item) => (
                <div
                  key={item.id}
                  className="p-5 rounded-xl border border-border/80 bg-surface/80 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2 mb-1.5">
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-accent-cyan/10 border border-accent-cyan/30 text-accent-cyan uppercase">
                          {item.category.replace('_', ' ')}
                        </span>

                        {/* Status selector */}
                        <select
                          value={item.status}
                          onChange={(e) => handleStatusChange(item.id, e.target.value as FeedbackStatus)}
                          className={`text-[10px] font-mono px-2 py-0.5 rounded border focus:outline-none cursor-pointer ${
                            item.status === 'completed'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                              : item.status === 'planned'
                              ? 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                              : item.status === 'in_progress'
                              ? 'bg-purple-500/10 text-purple-300 border-purple-500/40'
                              : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                          }`}
                        >
                          <option value="under_review" className="bg-surface text-text-primary">Under Review</option>
                          <option value="planned" className="bg-surface text-text-primary">Planned</option>
                          <option value="in_progress" className="bg-surface text-text-primary">In Progress</option>
                          <option value="completed" className="bg-surface text-text-primary">Completed</option>
                        </select>

                        {item.priority === 'high' && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-rose-500/10 text-rose-400 border border-rose-500/30 uppercase">
                            High Priority
                          </span>
                        )}
                      </div>

                      <h3 className="text-sm font-semibold text-text-primary">{item.title}</h3>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed whitespace-pre-line">
                        {item.description}
                      </p>

                      {item.adminNote && (
                        <div className="mt-2.5 p-2.5 rounded-lg bg-accent-cyan/5 border border-accent-cyan/20 text-xs text-text-primary">
                          <span className="text-[10px] font-mono text-accent-cyan font-semibold uppercase block">
                            Admin Note:
                          </span>
                          <span className="text-[11px] text-text-secondary mt-0.5 block">
                            {item.adminNote}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => {
                          setEditingNoteId(item.id);
                          setAdminNoteText(item.adminNote || '');
                        }}
                        className="p-1.5 rounded-lg bg-elevated border border-border/80 hover:border-accent-cyan/40 text-text-secondary hover:text-text-primary transition-colors text-xs"
                        title="Add admin reply"
                      >
                        <Edit3 size={13} className="text-accent-cyan" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="p-1.5 rounded-lg bg-elevated border border-border/80 hover:bg-rose-500/10 hover:border-rose-500/40 text-text-secondary hover:text-rose-400 transition-colors text-xs"
                        title="Delete suggestion"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border/40 flex items-center justify-between text-[10px] font-mono text-text-secondary">
                    <div className="flex items-center gap-2">
                      <User size={11} />
                      <span className="text-text-primary">{item.submittedBy}</span>
                      <span>({item.userHandle || 'none'})</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock size={11} />
                      <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Admin Password Prompt Modal */}
      <AnimatePresence>
        {showAdminLogin && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm bg-surface border border-border rounded-2xl shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center gap-2.5 border-b border-border/80 pb-3">
                <div className="w-8 h-8 rounded-lg bg-accent-cyan/10 border border-accent-cyan/30 flex items-center justify-center text-accent-cyan">
                  <Lock size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-text-primary">
                    Administrator Authentication
                  </h3>
                  <p className="text-[11px] text-text-secondary">
                    Enter password to view user improvements
                  </p>
                </div>
              </div>

              {authError && (
                <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle size={14} className="shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              <form onSubmit={handleAdminLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-text-primary mb-1">
                    Admin Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPasswordText ? 'text' : 'password'}
                      required
                      value={adminPasswordInput}
                      onChange={(e) => setAdminPasswordInput(e.target.value)}
                      placeholder="Enter administrator password..."
                      className="w-full px-3 py-2 pr-9 text-xs rounded-lg bg-elevated border border-border focus:border-accent-cyan focus:outline-none text-text-primary font-mono placeholder:text-text-secondary/40"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPasswordText(!showPasswordText)}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary p-1"
                    >
                      {showPasswordText ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAdminLogin(false);
                      setAuthError('');
                      setAdminPasswordInput('');
                    }}
                    className="px-3 py-1.5 text-xs rounded text-text-secondary hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className="btn-primary text-xs px-4 py-1.5 flex items-center gap-1.5"
                  >
                    <Lock size={12} />
                    <span>{isVerifying ? 'Verifying...' : 'Unlock View'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal: Edit Admin Note */}
      <AnimatePresence>
        {editingNoteId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-surface border border-border rounded-xl shadow-2xl p-6 space-y-4"
            >
              <h3 className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Edit3 size={15} className="text-accent-cyan" />
                <span>Add / Edit Admin Note</span>
              </h3>

              <textarea
                rows={3}
                value={adminNoteText}
                onChange={(e) => setAdminNoteText(e.target.value)}
                placeholder="Write an internal note or response..."
                className="w-full px-3 py-2 text-xs rounded-lg bg-elevated border border-border focus:border-accent-cyan focus:outline-none text-text-primary resize-none"
              />

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingNoteId(null)}
                  className="px-3 py-1.5 text-xs rounded text-text-secondary hover:text-text-primary"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleSaveNote(editingNoteId)}
                  className="btn-primary text-xs px-4 py-1.5"
                >
                  Save Note
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
