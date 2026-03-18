import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import DesktopLayout from '../../components/DesktopLayout';
import { apiPost, apiGet } from '../../utils/api';
import { extractScriptText } from '../../utils/extractScriptText';

// ─── Types ────────────────────────────────────────────────────────────────────

interface CastMember {
  id: string;
  characterName: string;
  actorName: string;
  tier: 'Lead' | 'Supporting' | 'Featured' | 'Day Player';
}

interface CrewMember {
  id: string;
  name: string;
  role: string;
  department: string;
}

interface LocationEntry {
  id: string;
  name: string;
  address: string;
  notes: string;
}

interface ScriptAnalysis {
  title: string;
  cast: string[];
  locations: string[];
  estimatedDays: number;
  budgetLineItems: Array<{ total: number }>;
}

const GENRES = [
  'Sci-Fi / Noir', 'Cyberpunk Thriller', 'Documentary', 'High Fantasy',
  'Corporate Production', 'Horror', 'Action / Adventure', 'Drama', 'Comedy',
  'Thriller', 'Romance', 'Crime', 'Western', 'Animation', 'Other',
];

const PROJECT_TYPES = ['Feature Film', 'Short Film', 'Commercial', 'Documentary', 'TV Episode', 'Music Video', 'Web Series', 'Pilot'];
const STATUSES = ['Development', 'Pre-Production', 'Production', 'Post-Production', 'Completed'];
const DEPARTMENTS = ['Directing', 'Camera', 'Sound', 'Lighting', 'Grip', 'Art Department', 'Hair & Makeup', 'Wardrobe', 'Production', 'Post-Production', 'VFX', 'Other'];

const uid = () => crypto.randomUUID();

// ─── Component ────────────────────────────────────────────────────────────────

export default function DesktopNewProject() {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  // ── Project Info
  const [title, setTitle] = useState('');
  const [projectType, setProjectType] = useState(PROJECT_TYPES[0]);
  const [genre, setGenre] = useState(GENRES[0]);
  const [status, setStatus] = useState(STATUSES[1]);
  const [tagline, setTagline] = useState('');
  const [company, setCompany] = useState('');

  // ── Schedule & Budget
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [shootDays, setShootDays] = useState('');
  const [totalBudget, setTotalBudget] = useState('');

  // ── Key Personnel
  const [director, setDirector] = useState('');
  const [dp, setDp] = useState('');
  const [producer, setProducer] = useState('');

  // ── Cast
  const [cast, setCast] = useState<CastMember[]>([]);

  // ── Crew
  const [crew, setCrew] = useState<CrewMember[]>([]);

  // ── Locations
  const [locations, setLocations] = useState<LocationEntry[]>([]);

  // ── Analyzed script text (raw)
  const [analyzedScriptText, setAnalyzedScriptText] = useState<string>('');

  // ── Script Upload
  const [scriptLoading, setScriptLoading] = useState(false);
  const [scriptResult, setScriptResult] = useState<ScriptAnalysis | null>(null);
  const [scriptError, setScriptError] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Script Analysis ─────────────────────────────────────────────────────────

  const analyzeFile = async (file: File) => {
    setScriptLoading(true);
    setScriptError(null);
    setScriptResult(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const scriptText = await extractScriptText(file, token);
      setAnalyzedScriptText(scriptText);
      const { result } = await apiPost<{ result: ScriptAnalysis }>(
        token,
        '/api/ai/analyze-script',
        { scriptText }
      );
      setScriptResult(result);
      localStorage.setItem('pp_last_script_analysis', JSON.stringify(result));

      // Auto-populate fields from analysis
      if (!title && result.title && result.title !== 'Untitled Script') setTitle(result.title);
      if (result.estimatedDays) setShootDays(String(result.estimatedDays));
      if (result.budgetLineItems?.length) {
        const total = result.budgetLineItems.reduce((s, i) => s + i.total, 0);
        if (!totalBudget) setTotalBudget(String(total));
      }
      if (result.cast?.length) {
        setCast(result.cast.map((name) => ({
          id: uid(),
          characterName: name,
          actorName: '',
          tier: 'Supporting' as const,
        })));
      }
      if (result.locations?.length) {
        setLocations(result.locations.map((name) => ({
          id: uid(),
          name,
          address: '',
          notes: '',
        })));
      }
    } catch (err) {
      setScriptError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setScriptLoading(false);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) analyzeFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) analyzeFile(file);
  };

  // ── Cast helpers ────────────────────────────────────────────────────────────
  const addCast = () => setCast((p) => [...p, { id: uid(), characterName: '', actorName: '', tier: 'Supporting' }]);
  const updateCast = (id: string, patch: Partial<CastMember>) => setCast((p) => p.map((m) => m.id === id ? { ...m, ...patch } : m));
  const removeCast = (id: string) => setCast((p) => p.filter((m) => m.id !== id));

  // ── Crew helpers ────────────────────────────────────────────────────────────
  const addCrew = () => setCrew((p) => [...p, { id: uid(), name: '', role: '', department: DEPARTMENTS[0] }]);
  const updateCrew = (id: string, patch: Partial<CrewMember>) => setCrew((p) => p.map((m) => m.id === id ? { ...m, ...patch } : m));
  const removeCrew = (id: string) => setCrew((p) => p.filter((m) => m.id !== id));

  // ── Location helpers ────────────────────────────────────────────────────────
  const addLocation = () => setLocations((p) => [...p, { id: uid(), name: '', address: '', notes: '' }]);
  const updateLocation = (id: string, patch: Partial<LocationEntry>) => setLocations((p) => p.map((m) => m.id === id ? { ...m, ...patch } : m));
  const removeLocation = (id: string) => setLocations((p) => p.filter((m) => m.id !== id));

  // ── Submit ──────────────────────────────────────────────────────────────────
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');

      // Step 1: Create the project
      const project = await apiPost<{ id: string }>(token, '/api/projects', {
        title: title || 'Untitled Project',
        format: projectType,
        genre: genre || undefined,
        totalBudget: parseFloat(totalBudget) || 1000,
        logline: tagline || undefined,
        notes: JSON.stringify({
          company, status, startDate, endDate, shootDays,
          director, dp, producer, cast, crew, locations,
        }),
      });

      // Step 2: Save project as current
      localStorage.setItem('pp_current_project_id', project.id);

      // Step 3: If a script was uploaded, analyze and save budget + storyboard to this project
      if (analyzedScriptText) {
        await apiPost(token, '/api/ai/analyze-and-save', {
          projectId: project.id,
          scriptText: analyzedScriptText,
        });
      }

      navigate('/projects-desktop');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to create project');
      setSubmitting(false);
    }
  };

  // ─── Reusable styles ────────────────────────────────────────────────────────
  const inputCls = "w-full bg-slate-900/30 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:ring-2 focus:ring-blue-600/20 focus:border-blue-600 outline-none transition-all text-sm";
  const selectCls = inputCls + " appearance-none cursor-pointer";
  const labelCls = "text-xs font-bold text-slate-500 uppercase tracking-widest ml-1";
  const sectionCls = "rounded-2xl border border-slate-800 p-6 space-y-4";

  return (
    <DesktopLayout>
      <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full pb-20">
        {/* Header */}
        <div className="mb-10">
          <h2 className="text-3xl font-bold text-slate-100 mb-2">New Project</h2>
          <p className="text-slate-500 text-sm">Configure your complete production environment — cast, crew, locations, and script all in one place.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* ── Section 1: Project Identity ── */}
          <div className={sectionCls} style={{ background: 'rgba(15,23,42,0.6)' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-blue-400 text-[18px]">movie</span>
              </div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Project Identity</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <label className={labelCls}>Project Title</label>
                <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Neon Horizon" className={inputCls} />
              </div>

              <div className="space-y-2">
                <label className={labelCls}>Project Type</label>
                <div className="relative">
                  <select value={projectType} onChange={(e) => setProjectType(e.target.value)} className={selectCls}>
                    {PROJECT_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelCls}>Genre</label>
                <div className="relative">
                  <select value={genre} onChange={(e) => setGenre(e.target.value)} className={selectCls}>
                    {GENRES.map((g) => <option key={g}>{g}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelCls}>Status</label>
                <div className="relative">
                  <select value={status} onChange={(e) => setStatus(e.target.value)} className={selectCls}>
                    {STATUSES.map((s) => <option key={s}>{s}</option>)}
                  </select>
                  <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none">expand_more</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelCls}>Production Company</label>
                <input type="text" value={company} onChange={(e) => setCompany(e.target.value)}
                  placeholder="e.g. Pocket Productions LLC" className={inputCls} />
              </div>

              <div className="col-span-2 space-y-2">
                <label className={labelCls}>Tagline / Logline</label>
                <textarea value={tagline} onChange={(e) => setTagline(e.target.value)} rows={2}
                  placeholder="One sentence that captures your story..."
                  className={inputCls + " resize-none"} />
              </div>
            </div>
          </div>

          {/* ── Section 2: Schedule & Budget ── */}
          <div className={sectionCls} style={{ background: 'rgba(15,23,42,0.6)' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-green-600/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-green-400 text-[18px]">calendar_today</span>
              </div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Schedule & Budget</h3>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className={labelCls}>Principal Photography Start</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">calendar_today</span>
                  <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)}
                    className={inputCls + " pl-12 [color-scheme:dark]"} />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelCls}>Wrap / End Date</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-[20px]">event_available</span>
                  <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)}
                    className={inputCls + " pl-12 [color-scheme:dark]"} />
                </div>
              </div>

              <div className="space-y-2">
                <label className={labelCls}>Estimated Shoot Days</label>
                <input type="number" value={shootDays} onChange={(e) => setShootDays(e.target.value)}
                  placeholder="e.g. 30" className={inputCls} />
              </div>

              <div className="space-y-2">
                <label className={labelCls}>Total Budget (USD)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 font-medium text-sm">$</span>
                  <input type="number" value={totalBudget} onChange={(e) => setTotalBudget(e.target.value)}
                    placeholder="0.00" className={inputCls + " pl-8"} />
                </div>
              </div>
            </div>
          </div>

          {/* ── Section 3: Script Upload ── */}
          <div className={sectionCls} style={{ background: 'rgba(15,23,42,0.6)' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-purple-600/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-400 text-[18px]">description</span>
              </div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Script Upload</h3>
              <span className="text-xs text-slate-500">— Claude will auto-populate cast, crew & budget</span>
            </div>

            {!scriptResult && !scriptLoading && (
              <>
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl flex flex-col items-center justify-center gap-3 p-8 cursor-pointer transition-all ${
                    isDragOver ? 'border-blue-400 bg-blue-500/10' : 'border-white/10 hover:border-blue-500/40 hover:bg-white/[0.02]'
                  }`}
                >
                  <span className="material-symbols-outlined text-4xl text-slate-500">upload_file</span>
                  <div className="text-center">
                    <p className="text-sm font-bold text-slate-300">Drop your screenplay here</p>
                    <p className="text-xs text-slate-500 mt-1">or click to browse — .txt, .fdx, .fountain, .pdf, .docx</p>
                  </div>
                </div>
                <input ref={fileInputRef} type="file" accept=".txt,.fdx,.fountain,.pdf,.docx"
                  className="hidden" onChange={handleFileInput} />
              </>
            )}

            {scriptLoading && (
              <div className="rounded-xl bg-blue-900/20 border border-blue-500/20 p-6 flex items-center gap-4">
                <span className="material-symbols-outlined text-blue-400 text-3xl animate-spin">progress_activity</span>
                <div>
                  <p className="text-sm font-bold text-white">Claude is analyzing your script…</p>
                  <p className="text-xs text-blue-400 mt-0.5">Extracting cast, locations, budget estimates, and schedule</p>
                </div>
              </div>
            )}

            {scriptError && (
              <div className="rounded-xl bg-red-900/20 border border-red-500/20 p-4 flex items-center gap-3">
                <span className="material-symbols-outlined text-red-400">error</span>
                <p className="text-sm text-red-300">{scriptError}</p>
                <button type="button" onClick={() => { setScriptError(null); fileInputRef.current?.click(); }}
                  className="ml-auto text-xs font-bold text-red-400 hover:text-red-200">Try again</button>
              </div>
            )}

            {scriptResult && (
              <div className="rounded-xl bg-gradient-to-r from-green-900/20 to-slate-900/30 border border-green-500/20 p-5">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-green-400 mb-1">Analysis Complete — Fields Auto-Populated</p>
                    <h3 className="text-base font-black text-white">{scriptResult.title}</h3>
                  </div>
                  <button type="button" onClick={() => setScriptResult(null)}
                    className="text-slate-500 hover:text-white transition-colors shrink-0">
                    <span className="material-symbols-outlined text-[18px]">close</span>
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: `${scriptResult.cast?.length ?? 0} Cast`, icon: 'person', color: 'text-yellow-400' },
                    { label: `${scriptResult.locations?.length ?? 0} Locations`, icon: 'location_on', color: 'text-green-400' },
                    { label: `${scriptResult.estimatedDays} Shoot Days`, icon: 'calendar_today', color: 'text-blue-400' },
                  ].map((s) => (
                    <div key={s.label} className="flex items-center gap-1.5 bg-white/5 border border-white/10 rounded-lg px-3 py-1.5">
                      <span className={`material-symbols-outlined text-[14px] ${s.color}`}>{s.icon}</span>
                      <span className="text-xs font-bold text-slate-300">{s.label}</span>
                    </div>
                  ))}
                  <button type="button" onClick={() => { setScriptResult(null); fileInputRef.current?.click(); }}
                    className="text-xs text-slate-500 hover:text-slate-300 ml-auto">Upload different script</button>
                </div>
              </div>
            )}
          </div>

          {/* ── Section 4: Key Personnel ── */}
          <div className={sectionCls} style={{ background: 'rgba(15,23,42,0.6)' }}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 rounded-lg bg-amber-600/20 flex items-center justify-center">
                <span className="material-symbols-outlined text-amber-400 text-[18px]">star</span>
              </div>
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Key Personnel</h3>
            </div>

            <div className="grid grid-cols-3 gap-4">
              {[
                { label: 'Director', value: director, set: setDirector, icon: 'camera' },
                { label: 'Director of Photography', value: dp, set: setDp, icon: 'videocam' },
                { label: 'Producer', value: producer, set: setProducer, icon: 'manage_accounts' },
              ].map(({ label, value, set, icon }) => (
                <div key={label} className="space-y-2">
                  <label className={labelCls}>{label}</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-[18px]">{icon}</span>
                    <input type="text" value={value} onChange={(e) => set(e.target.value)}
                      placeholder={`Enter name`} className={inputCls + " pl-10"} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Section 5: Cast ── */}
          <div className={sectionCls} style={{ background: 'rgba(15,23,42,0.6)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-yellow-600/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-yellow-400 text-[18px]">person</span>
                </div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Cast</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-yellow-600/20 text-yellow-400 border border-yellow-600/30">
                  {cast.length} MEMBERS
                </span>
              </div>
              <button type="button" onClick={addCast}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-400 border border-blue-600/20 px-3 py-1.5 rounded-lg hover:bg-blue-600/10 transition-colors">
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add Cast
              </button>
            </div>

            {cast.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No cast members yet. Upload a script or add manually.</p>
            ) : (
              <div className="space-y-2">
                {/* Header row */}
                <div className="grid grid-cols-12 gap-2 px-2">
                  <span className="col-span-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Character Name</span>
                  <span className="col-span-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Actor / Talent</span>
                  <span className="col-span-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Tier</span>
                </div>
                {cast.map((m) => (
                  <div key={m.id} className="grid grid-cols-12 gap-2 items-center bg-slate-900/50 rounded-xl p-2">
                    <input value={m.characterName} onChange={(e) => updateCast(m.id, { characterName: e.target.value })}
                      placeholder="Character name" className="col-span-4 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs outline-none focus:border-blue-600" />
                    <input value={m.actorName} onChange={(e) => updateCast(m.id, { actorName: e.target.value })}
                      placeholder="Actor name (optional)" className="col-span-4 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs outline-none focus:border-blue-600" />
                    <div className="col-span-3 relative">
                      <select value={m.tier} onChange={(e) => updateCast(m.id, { tier: e.target.value as CastMember['tier'] })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs outline-none focus:border-blue-600 appearance-none">
                        {(['Lead', 'Supporting', 'Featured', 'Day Player'] as const).map((t) => <option key={t}>{t}</option>)}
                      </select>
                    </div>
                    <button type="button" onClick={() => removeCast(m.id)}
                      className="col-span-1 flex items-center justify-center text-slate-600 hover:text-red-400 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Section 6: Crew ── */}
          <div className={sectionCls} style={{ background: 'rgba(15,23,42,0.6)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-600/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-blue-400 text-[18px]">group</span>
                </div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Crew</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-600/30">
                  {crew.length} MEMBERS
                </span>
              </div>
              <button type="button" onClick={addCrew}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-400 border border-blue-600/20 px-3 py-1.5 rounded-lg hover:bg-blue-600/10 transition-colors">
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add Crew
              </button>
            </div>

            {crew.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No crew members yet. Add department heads and key crew manually.</p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 px-2">
                  <span className="col-span-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Name</span>
                  <span className="col-span-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Role / Title</span>
                  <span className="col-span-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Department</span>
                </div>
                {crew.map((m) => (
                  <div key={m.id} className="grid grid-cols-12 gap-2 items-center bg-slate-900/50 rounded-xl p-2">
                    <input value={m.name} onChange={(e) => updateCrew(m.id, { name: e.target.value })}
                      placeholder="Full name" className="col-span-4 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs outline-none focus:border-blue-600" />
                    <input value={m.role} onChange={(e) => updateCrew(m.id, { role: e.target.value })}
                      placeholder="e.g. Director of Photography" className="col-span-4 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs outline-none focus:border-blue-600" />
                    <div className="col-span-3 relative">
                      <select value={m.department} onChange={(e) => updateCrew(m.id, { department: e.target.value })}
                        className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs outline-none focus:border-blue-600 appearance-none">
                        {DEPARTMENTS.map((d) => <option key={d}>{d}</option>)}
                      </select>
                    </div>
                    <button type="button" onClick={() => removeCrew(m.id)}
                      className="col-span-1 flex items-center justify-center text-slate-600 hover:text-red-400 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* ── Section 7: Locations ── */}
          <div className={sectionCls} style={{ background: 'rgba(15,23,42,0.6)' }}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-green-600/20 flex items-center justify-center">
                  <span className="material-symbols-outlined text-green-400 text-[18px]">location_on</span>
                </div>
                <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Locations</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-green-600/20 text-green-400 border border-green-600/30">
                  {locations.length} LOCATIONS
                </span>
              </div>
              <button type="button" onClick={addLocation}
                className="flex items-center gap-1.5 text-xs font-bold text-blue-400 border border-blue-600/20 px-3 py-1.5 rounded-lg hover:bg-blue-600/10 transition-colors">
                <span className="material-symbols-outlined text-[16px]">add</span>
                Add Location
              </button>
            </div>

            {locations.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-4">No locations yet. Upload a script or add manually.</p>
            ) : (
              <div className="space-y-2">
                <div className="grid grid-cols-12 gap-2 px-2">
                  <span className="col-span-3 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Location Name</span>
                  <span className="col-span-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Address</span>
                  <span className="col-span-4 text-[10px] font-bold text-slate-600 uppercase tracking-widest">Notes</span>
                </div>
                {locations.map((loc) => (
                  <div key={loc.id} className="grid grid-cols-12 gap-2 items-center bg-slate-900/50 rounded-xl p-2">
                    <input value={loc.name} onChange={(e) => updateLocation(loc.id, { name: e.target.value })}
                      placeholder="Location name" className="col-span-3 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs outline-none focus:border-blue-600" />
                    <input value={loc.address} onChange={(e) => updateLocation(loc.id, { address: e.target.value })}
                      placeholder="Street address (optional)" className="col-span-4 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs outline-none focus:border-blue-600" />
                    <input value={loc.notes} onChange={(e) => updateLocation(loc.id, { notes: e.target.value })}
                      placeholder="Scout notes, permits, etc." className="col-span-4 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 text-xs outline-none focus:border-blue-600" />
                    <button type="button" onClick={() => removeLocation(loc.id)}
                      className="col-span-1 flex items-center justify-center text-slate-600 hover:text-red-400 transition-colors">
                      <span className="material-symbols-outlined text-[18px]">delete</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {submitError && (
            <div className="rounded-xl bg-red-900/20 border border-red-500/20 p-3 flex items-center gap-2">
              <span className="material-symbols-outlined text-red-400 text-[16px]">error</span>
              <p className="text-xs text-red-300">{submitError}</p>
            </div>
          )}

          {/* ── Footer ── */}
          <div className="pt-6 flex items-center justify-between border-t border-slate-800">
            <div className="flex items-center gap-3 text-slate-500">
              <span className="material-symbols-outlined text-[18px]">info</span>
              <p className="text-[11px] leading-tight max-w-[220px]">Project files, scheduling, and asset tracking will be initialized upon confirmation.</p>
            </div>
            <div className="flex gap-4">
              <button type="button" onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/50 font-medium transition-all text-sm">
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-60 text-white px-8 py-4 rounded-xl font-bold transition-all shadow-xl shadow-blue-600/30 text-sm flex items-center gap-2 group">
                {submitting ? (
                  <>
                    <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                    Creating…
                  </>
                ) : (
                  <>
                    Initialize Production
                    <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">rocket_launch</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </DesktopLayout>
  );
}
