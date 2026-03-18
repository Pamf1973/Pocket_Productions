import { useState, useRef, useEffect } from 'react';
import { useAuth } from '@clerk/clerk-react';
import DesktopLayout from '../../components/DesktopLayout';
import { apiPost, apiGet } from '../../utils/api';
import { extractScriptText } from '../../utils/extractScriptText';

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = 'Cast' | 'Crew' | 'Locations' | 'Equipment' | 'Post' | 'Misc';

interface BudgetRow {
  id: string;
  category: Category;
  description: string;
  qty: number;
  rate: number;
  total: number;
  flag?: string;
  isEditing?: boolean;
}

interface ScriptAnalysis {
  title: string;
  summary: string;
  pageCount: number;
  sceneCount: number;
  estimatedDays: number;
  locations: string[];
  cast: string[];
  budgetLineItems: BudgetRow[];
  schedule: Array<{
    day: number;
    date: string;
    scenes: string[];
    location: string;
    estimatedHours: number;
  }>;
  storyboardShots: Array<{
    frameLabel: string;
    sceneHeading: string;
    shotType: string;
    cameraMovement: string;
    lighting: string;
    description: string;
    mood: string;
  }>;
}

interface AiResponse {
  answer: string;
  suggestions: Array<{ action: string; description: string; impact: string }>;
}

interface DbLineItem {
  id: string;
  category: string;
  description: string;
  baseAmount: number;
  lineTotal: number;
  notes: string | null;
}

interface ProjectOption {
  id: string;
  title: string;
}

// ─── Demo seed data ───────────────────────────────────────────────────────────

const SEED_ROWS: BudgetRow[] = [
  { id: 'seed_0', category: 'Cast', description: 'Principal Actors — Day Rates', qty: 8, rate: 6400, total: 51200, flag: 'SAG OT' },
  { id: 'seed_1', category: 'Cast', description: 'Supporting Cast — 12 Players', qty: 12, rate: 1450, total: 17400 },
  { id: 'seed_2', category: 'Crew', description: 'Director of Photography', qty: 1, rate: 8500, total: 8500 },
  { id: 'seed_3', category: 'Crew', description: 'Gaffer + Grip Package', qty: 1, rate: 7800, total: 7800, flag: 'Overage' },
  { id: 'seed_4', category: 'Crew', description: 'Sound Mixer + Boom Op', qty: 2, rate: 1700, total: 3400 },
  { id: 'seed_5', category: 'Locations', description: 'Warehouse — Day Rate', qty: 5, rate: 900, total: 4500 },
  { id: 'seed_6', category: 'Locations', description: 'Permits — City of Los Angeles', qty: 1, rate: 2800, total: 2800, flag: 'Permit' },
  { id: 'seed_7', category: 'Equipment', description: 'Camera Package — ARRI Alexa', qty: 1, rate: 3800, total: 3800 },
  { id: 'seed_8', category: 'Equipment', description: 'Lighting Rig — HMI Packages', qty: 1, rate: 1950, total: 1950 },
  { id: 'seed_9', category: 'Post', description: 'DIT + Data Management', qty: 1, rate: 1200, total: 1200 },
  { id: 'seed_10', category: 'Misc', description: 'Catering — 55 Crew Members', qty: 5, rate: 580, total: 2900 },
  { id: 'seed_11', category: 'Misc', description: 'Transportation — Vans & Drivers', qty: 3, rate: 600, total: 1800 },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  '$' + n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 });

const CATEGORY_COLORS: Record<Category, string> = {
  Cast: 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20',
  Crew: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  Locations: 'text-green-400 bg-green-400/10 border-green-400/20',
  Equipment: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  Post: 'text-teal-400 bg-teal-400/10 border-teal-400/20',
  Misc: 'text-slate-400 bg-slate-400/10 border-slate-400/20',
};

const CATEGORIES: Category[] = ['Cast', 'Crew', 'Locations', 'Equipment', 'Post', 'Misc'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function DesktopBudgets() {
  const { getToken } = useAuth();

  const [lineItems, setLineItems] = useState<BudgetRow[]>(SEED_ROWS);
  const [scriptAnalysis, setScriptAnalysis] = useState<ScriptAnalysis | null>(null);
  const [aiQuery, setAiQuery] = useState('');
  const [aiResponse, setAiResponse] = useState<AiResponse | null>(null);
  const [importing, setImporting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [sagEnabled, setSagEnabled] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const [currentProjectId, setCurrentProjectId] = useState<string | null>(
    localStorage.getItem('pp_current_project_id')
  );
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
  const [projectLoading, setProjectLoading] = useState(false);

  // Load project list
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const projects = await apiGet<ProjectOption[]>(token, '/api/projects');
        setProjectOptions(projects);
        // If no current project is set but projects exist, use the first one
        if (!currentProjectId && projects.length > 0) {
          setCurrentProjectId(projects[0].id);
          localStorage.setItem('pp_current_project_id', projects[0].id);
        }
      } catch { /* ignore */ }
    })();
  }, [getToken]);

  // Load budget items when project changes
  useEffect(() => {
    if (!currentProjectId) return;
    (async () => {
      setProjectLoading(true);
      try {
        const token = await getToken();
        if (!token) return;
        const items = await apiGet<DbLineItem[]>(
          token,
          `/api/budget/line-items?projectId=${currentProjectId}`
        );
        if (items.length > 0) {
          const mapped: BudgetRow[] = items.map((item) => {
            let qty = 1, rate = item.lineTotal, flag: string | undefined;
            let originalCategory: Category = 'Misc';
            try {
              const parsed = JSON.parse(item.notes ?? '{}');
              qty = parsed.qty ?? 1;
              rate = parsed.rate ?? item.lineTotal;
              flag = parsed.flag ?? undefined;
              originalCategory = (parsed.originalCategory as Category) ?? 'Misc';
            } catch { /* ignore */ }
            return {
              id: item.id,
              category: originalCategory,
              description: item.description,
              qty,
              rate,
              total: item.lineTotal,
              flag,
            };
          });
          setLineItems(mapped);
        }
      } catch { /* ignore */ } finally {
        setProjectLoading(false);
      }
    })();
  }, [currentProjectId, getToken]);

  // ── Script import ──────────────────────────────────────────────────────────

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setImporting(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const scriptText = await extractScriptText(file, token);
      const { result } = await apiPost<{ result: ScriptAnalysis }>(
        token,
        '/api/ai/analyze-script',
        { scriptText }
      );
      setScriptAnalysis(result);
      if (result.budgetLineItems && result.budgetLineItems.length > 0) {
        setLineItems(
          result.budgetLineItems.map((item, i) => ({
            ...item,
            id: item.id ?? `ai_${Date.now()}_${i}`,
          }))
        );
      }
      // Persist for other pages
      localStorage.setItem('pp_last_script_analysis', JSON.stringify(result));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to analyse script');
    } finally {
      setImporting(false);
    }
  };

  // ── Budget query ───────────────────────────────────────────────────────────

  const handleBudgetQuery = async () => {
    if (!aiQuery.trim()) return;
    setAnalyzing(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const { result } = await apiPost<{ result: AiResponse }>(
        token,
        '/api/ai/budget-query',
        {
          question: aiQuery,
          lineItems: lineItems.map(({ category, description, qty, rate, total }) => ({
            category,
            description,
            qty,
            rate,
            total,
          })),
          sagEnabled,
        }
      );
      setAiResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to query budget');
    } finally {
      setAnalyzing(false);
    }
  };

  // ── Inline editing ─────────────────────────────────────────────────────────

  const updateRow = (id: string, patch: Partial<BudgetRow>) => {
    setLineItems((prev) =>
      prev.map((row) => {
        if (row.id !== id) return row;
        const updated = { ...row, ...patch };
        if (patch.qty !== undefined || patch.rate !== undefined) {
          updated.total = updated.qty * updated.rate;
        }
        return updated;
      })
    );
  };

  const deleteRow = (id: string) => {
    setLineItems((prev) => prev.filter((r) => r.id !== id));
    if (editingId === id) setEditingId(null);
  };

  const addRow = () => {
    const id = crypto.randomUUID();
    const newRow: BudgetRow = {
      id,
      category: 'Misc',
      description: '',
      qty: 1,
      rate: 0,
      total: 0,
    };
    setLineItems((prev) => [...prev, newRow]);
    setEditingId(id);
  };

  // ── Export / Save ──────────────────────────────────────────────────────────

  const handleExport = () => {
    const header = 'Category,Description,Qty,Rate,Total,Flag\n';
    const rows = lineItems
      .map((r) => `${r.category},"${r.description}",${r.qty},${r.rate},${r.total},${r.flag ?? ''}`)
      .join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `budget_${scriptAnalysis?.title ?? 'export'}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  // ── Anomaly flags ──────────────────────────────────────────────────────────

  const anomalies = lineItems.filter((r) => r.flag);

  const grandTotal = lineItems.reduce((sum, r) => sum + r.total, 0);

  // ─── Render ────────────────────────────────────────────────────────────────

  return (
    <DesktopLayout
      headerRight={
        <div className="flex items-center gap-2">
          <button
            onClick={handleSave}
            className="flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            {saved ? 'Saved!' : 'Save to Project'}
          </button>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">download</span>
            Export Budget
          </button>
        </div>
      }
    >
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Error banner */}
        {error && (
          <div className="rounded-xl bg-red-900/30 border border-red-500/30 p-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-red-400 text-[18px]">error</span>
            <p className="text-sm text-red-300">{error}</p>
            <button onClick={() => setError(null)} className="ml-auto text-red-400 hover:text-red-200">
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>
        )}

        {/* ── Project Selector bar ── */}
        {projectOptions.length > 0 && (
          <div className="rounded-xl bg-slate-900/60 border border-white/5 px-4 py-3 flex items-center gap-3">
            <span className="material-symbols-outlined text-slate-400 text-[18px]">folder_open</span>
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest shrink-0">Project</span>
            <div className="relative flex-1 max-w-xs">
              <select
                value={currentProjectId ?? ''}
                onChange={(e) => {
                  setCurrentProjectId(e.target.value);
                  localStorage.setItem('pp_current_project_id', e.target.value);
                }}
                className="w-full bg-slate-800 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-slate-200 outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
              >
                {projectOptions.map((p) => (
                  <option key={p.id} value={p.id}>{p.title}</option>
                ))}
              </select>
              <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none text-[16px]">expand_more</span>
            </div>
            {projectLoading && (
              <span className="material-symbols-outlined text-blue-400 text-[16px] animate-spin">progress_activity</span>
            )}
          </div>
        )}

        {/* ── Section A: AI Budget Analyst bar ── */}
        <div className="rounded-xl bg-gradient-to-r from-blue-900/40 to-slate-900/40 border border-blue-500/20 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="size-8 rounded-lg bg-blue-600/30 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-400 text-[18px]">smart_toy</span>
            </div>
            <div>
              <p className="text-sm font-bold text-white">AI Budget Analyst</p>
              <p className="text-[10px] text-blue-400">
                {anomalies.length > 0
                  ? `${anomalies.length} anomali${anomalies.length === 1 ? 'e' : 'es'} detected`
                  : 'No anomalies detected'}
              </p>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">SAG-AFTRA Mode</span>
              <button
                onClick={() => setSagEnabled(!sagEnabled)}
                className={`relative w-10 h-5 rounded-full transition-colors ${sagEnabled ? 'bg-blue-600' : 'bg-slate-700'}`}
              >
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${sagEnabled ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          </div>

          {/* Anomaly flags */}
          {anomalies.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {anomalies.map((a) => (
                <div
                  key={a.id}
                  className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border text-amber-400 bg-amber-400/10 border-amber-400/20"
                >
                  <span className="material-symbols-outlined text-[14px]">warning</span>
                  {a.description.slice(0, 28)} — {a.flag}
                </div>
              ))}
            </div>
          )}

          {/* Controls row */}
          <div className="flex gap-2">
            <input
              type="text"
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleBudgetQuery()}
              placeholder='Ask AI: "What if we cut the grip package by 20%?"'
              className="flex-1 bg-white/5 border border-white/10 rounded-lg py-2 px-4 text-sm text-slate-300 placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              onClick={handleBudgetQuery}
              disabled={analyzing || !aiQuery.trim()}
              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5"
            >
              {analyzing ? (
                <>
                  <span className="material-symbols-outlined text-[16px] animate-spin">progress_activity</span>
                  Analyzing…
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[16px]">send</span>
                  Analyze
                </>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt,.fdx,.fountain,.pdf,.docx"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              disabled={importing}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 text-sm font-medium px-3 py-2 rounded-lg transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">
                {importing ? 'hourglass_top' : 'upload_file'}
              </span>
              {importing ? 'Analysing Script…' : 'Import Screenplay'}
            </button>
          </div>

          {/* Importing progress indicator */}
          {importing && (
            <div className="mt-3 flex items-center gap-2 text-xs text-blue-400">
              <span className="material-symbols-outlined text-[14px] animate-spin">progress_activity</span>
              Claude is reading your screenplay and generating a full production breakdown…
            </div>
          )}
        </div>

        {/* ── Section B: AI response panel ── */}
        {aiResponse && (
          <div className="rounded-xl bg-gradient-to-r from-indigo-900/30 to-slate-900/40 border border-indigo-500/20 p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-indigo-400 text-[18px]">psychology</span>
                <p className="text-sm font-bold text-white">AI Budget Analysis</p>
              </div>
              <button onClick={() => setAiResponse(null)} className="text-slate-500 hover:text-white transition-colors">
                <span className="material-symbols-outlined text-[16px]">close</span>
              </button>
            </div>

            <p className="text-sm text-slate-300 leading-relaxed mb-4">{aiResponse.answer}</p>

            {aiResponse.suggestions.length > 0 && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-2">Actionable Suggestions</p>
                <div className="grid grid-cols-3 gap-3">
                  {aiResponse.suggestions.map((s, i) => (
                    <div key={i} className="rounded-lg bg-white/5 border border-white/5 p-3">
                      <p className="text-xs font-bold text-white mb-1">{s.action}</p>
                      <p className="text-[11px] text-slate-400 mb-2">{s.description}</p>
                      <p className="text-[10px] font-bold text-green-400">{s.impact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Section D: Script analysis banner ── */}
        {scriptAnalysis && (
          <div className="rounded-xl bg-gradient-to-r from-green-900/30 to-slate-900/40 border border-green-500/20 p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold uppercase tracking-widest text-green-400 mb-1">Screenplay Analysed</p>
                <p className="text-base font-bold text-white">{scriptAnalysis.title}</p>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{scriptAnalysis.summary}</p>

                {scriptAnalysis.schedule.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mb-1.5">Shoot Schedule</p>
                    <div className="flex flex-wrap gap-2">
                      {scriptAnalysis.schedule.slice(0, 5).map((day) => (
                        <div key={day.day} className="text-[10px] bg-white/5 border border-white/10 rounded px-2 py-1">
                          <span className="font-bold text-white">Day {day.day}</span>
                          <span className="text-slate-400 ml-1">{day.location}</span>
                          <span className="text-slate-500 ml-1">• {day.estimatedHours}h</span>
                        </div>
                      ))}
                      {scriptAnalysis.schedule.length > 5 && (
                        <div className="text-[10px] text-slate-500 px-2 py-1">
                          +{scriptAnalysis.schedule.length - 5} more days
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-4 text-center shrink-0">
                <div>
                  <p className="text-xl font-black text-white">{scriptAnalysis.pageCount}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Pages</p>
                </div>
                <div>
                  <p className="text-xl font-black text-white">{scriptAnalysis.sceneCount}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Scenes</p>
                </div>
                <div>
                  <p className="text-xl font-black text-white">{scriptAnalysis.estimatedDays}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Shoot Days</p>
                </div>
                <div>
                  <p className="text-xl font-black text-white">{scriptAnalysis.cast.length}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Cast</p>
                </div>
                <div>
                  <p className="text-xl font-black text-green-400">{fmt(grandTotal)}</p>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest">Est. Total</p>
                </div>
                <button
                  onClick={() => setScriptAnalysis(null)}
                  className="ml-2 text-slate-500 hover:text-white transition-colors"
                >
                  <span className="material-symbols-outlined text-[18px]">close</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── Section C: Budget line items table ── */}
        <div className="rounded-xl bg-slate-900 border border-white/5 overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <h2 className="text-sm font-bold text-white">
              {scriptAnalysis ? `Generated Budget — ${scriptAnalysis.title}` : 'Line Items — Day 42'}
            </h2>
            <span className="text-xs text-slate-400">
              {lineItems.length} line items · Grand total: <span className="font-bold text-white">{fmt(grandTotal)}</span>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Category</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Description</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Qty</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Rate</th>
                  <th className="text-right px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Total</th>
                  <th className="text-left px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">Flag</th>
                  <th className="px-4 py-3 text-[10px] font-bold uppercase tracking-widest text-slate-500 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {lineItems.map((row) => {
                  const isEditing = editingId === row.id;
                  const catColor = CATEGORY_COLORS[row.category] ?? CATEGORY_COLORS.Misc;

                  return (
                    <tr
                      key={row.id}
                      className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                      onClick={() => !isEditing && setEditingId(row.id)}
                    >
                      {/* Category */}
                      <td className="px-4 py-2">
                        {isEditing ? (
                          <select
                            value={row.category}
                            onChange={(e) => updateRow(row.id, { category: e.target.value as Category })}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-800 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none"
                          >
                            {CATEGORIES.map((c) => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>
                        ) : (
                          <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border ${catColor}`}>
                            {row.category}
                          </span>
                        )}
                      </td>

                      {/* Description */}
                      <td className="px-4 py-2">
                        {isEditing ? (
                          <input
                            value={row.description}
                            onChange={(e) => updateRow(row.id, { description: e.target.value })}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-800 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none w-full min-w-[200px]"
                          />
                        ) : (
                          <span className="text-slate-300">{row.description || <em className="text-slate-600">Click to edit</em>}</span>
                        )}
                      </td>

                      {/* Qty */}
                      <td className="px-4 py-2 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={row.qty}
                            onChange={(e) => updateRow(row.id, { qty: Number(e.target.value) })}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-800 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none w-16 text-right"
                          />
                        ) : (
                          <span className="font-mono text-slate-400">{row.qty}</span>
                        )}
                      </td>

                      {/* Rate */}
                      <td className="px-4 py-2 text-right">
                        {isEditing ? (
                          <input
                            type="number"
                            value={row.rate}
                            onChange={(e) => updateRow(row.id, { rate: Number(e.target.value) })}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-slate-800 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none w-24 text-right"
                          />
                        ) : (
                          <span className="font-mono text-slate-400">{fmt(row.rate)}</span>
                        )}
                      </td>

                      {/* Total */}
                      <td className="px-4 py-2 text-right">
                        <span className="font-mono font-bold text-white">{fmt(row.total)}</span>
                      </td>

                      {/* Flag */}
                      <td className="px-4 py-2">
                        {isEditing ? (
                          <input
                            value={row.flag ?? ''}
                            onChange={(e) => updateRow(row.id, { flag: e.target.value || undefined })}
                            onClick={(e) => e.stopPropagation()}
                            placeholder="Optional flag"
                            className="bg-slate-800 border border-white/10 rounded px-2 py-1 text-xs text-white outline-none w-28"
                          />
                        ) : (
                          row.flag && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                              {row.flag}
                            </span>
                          )
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-2 text-center">
                        <div className="flex items-center justify-center gap-1" onClick={(e) => e.stopPropagation()}>
                          {isEditing ? (
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 rounded text-green-400 hover:bg-green-400/10 transition-colors"
                              title="Done"
                            >
                              <span className="material-symbols-outlined text-[16px]">check</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => setEditingId(row.id)}
                              className="p-1 rounded text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 transition-colors"
                              title="Edit"
                            >
                              <span className="material-symbols-outlined text-[16px]">edit</span>
                            </button>
                          )}
                          <button
                            onClick={() => deleteRow(row.id)}
                            className="p-1 rounded text-slate-500 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                            title="Delete"
                          >
                            <span className="material-symbols-outlined text-[16px]">delete</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* Totals row */}
              <tfoot>
                <tr className="border-t-2 border-white/10 bg-slate-800/40">
                  <td colSpan={4} className="px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-widest">
                    Grand Total
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-black text-white text-base">
                    {fmt(grandTotal)}
                  </td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Add line item */}
          <div className="p-4 border-t border-white/5">
            <button
              onClick={addRow}
              className="flex items-center gap-2 text-sm font-bold text-blue-400 hover:text-blue-300 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">add_circle</span>
              Add Line Item
            </button>
          </div>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-4 gap-4">
          {[
            { label: 'Total Estimate', value: fmt(grandTotal), color: 'text-white' },
            { label: 'Shoot Days', value: scriptAnalysis ? `${scriptAnalysis.estimatedDays} days` : '—', color: 'text-blue-400' },
            { label: 'Scenes', value: scriptAnalysis ? `${scriptAnalysis.sceneCount}` : '—', color: 'text-green-400' },
            { label: 'Locations', value: scriptAnalysis ? `${scriptAnalysis.locations.length}` : '—', color: 'text-amber-400' },
          ].map((card) => (
            <div key={card.label} className="rounded-xl p-4 bg-slate-900 border border-white/5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">{card.label}</p>
              <p className={`text-2xl font-black ${card.color}`}>{card.value}</p>
            </div>
          ))}
        </div>

      </div>
    </DesktopLayout>
  );
}
