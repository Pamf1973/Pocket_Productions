import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import DesktopLayout from '../../components/DesktopLayout';
import { apiGet } from '../../utils/api';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_PROJECTS: ApiProject[] = [
  {
    id: '1', title: 'Nightfall', format: 'Feature Film', genre: 'Thriller',
    totalBudget: 2400000, sagAgreementTier: 'LOW_BUDGET', logline: 'A detective uncovers a web of corruption that reaches the highest levels of city government — forcing her to choose between justice and survival.',
    createdAt: '2026-02-01T00:00:00Z', updatedAt: '2026-03-15T00:00:00Z',
    _count: { phases: 4, persons: 34, characters: 12, locations: 8 },
  },
  {
    id: '2', title: 'Echo Chamber', format: 'Short Film', genre: 'Drama',
    totalBudget: 85000, sagAgreementTier: 'STUDENT', logline: 'Two estranged siblings reunite over one weekend to settle their late father\'s estate — and old wounds.',
    createdAt: '2026-01-10T00:00:00Z', updatedAt: '2026-03-10T00:00:00Z',
    _count: { phases: 3, persons: 11, characters: 4, locations: 3 },
  },
  {
    id: '3', title: 'The Signal', format: 'Feature Film', genre: 'Sci-Fi',
    totalBudget: 5750000, sagAgreementTier: 'SAG_LOW_BUDGET', logline: 'A satellite engineer intercepts a repeating signal from deep space — and decoding it may cost humanity everything.',
    createdAt: '2025-11-20T00:00:00Z', updatedAt: '2026-03-17T00:00:00Z',
    _count: { phases: 5, persons: 62, characters: 18, locations: 14 },
  },
  {
    id: '4', title: 'Parallel Lines', format: 'TV Pilot', genre: 'Crime',
    totalBudget: 1200000, sagAgreementTier: 'LOW_BUDGET', logline: 'Three strangers connected by a single event must navigate a city that wants them silenced.',
    createdAt: '2026-02-14T00:00:00Z', updatedAt: '2026-03-12T00:00:00Z',
    _count: { phases: 2, persons: 28, characters: 9, locations: 6 },
  },
  {
    id: '5', title: 'Golden Hour', format: 'Documentary', genre: 'Documentary',
    totalBudget: 320000, sagAgreementTier: 'NON_UNION', logline: 'An intimate portrait of three independent farmers fighting to keep their land through a historic drought.',
    createdAt: '2026-03-01T00:00:00Z', updatedAt: '2026-03-16T00:00:00Z',
    _count: { phases: 2, persons: 8, characters: 3, locations: 5 },
  },
];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ApiProject {
  id: string;
  title: string;
  format: string;
  genre: string | null;
  totalBudget: number;
  sagAgreementTier: string;
  logline: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: { phases: number; persons: number; characters: number; locations: number };
}

const STATUS_COLOR: Record<string, string> = {
  'Pre-Production': 'text-amber-400 bg-amber-400/10 border-amber-400/20',
  'Production': 'text-green-400 bg-green-400/10 border-green-400/20',
  'Post-Production': 'text-blue-400 bg-blue-400/10 border-blue-400/20',
  'Development': 'text-purple-400 bg-purple-400/10 border-purple-400/20',
  'Completed': 'text-slate-400 bg-slate-400/10 border-slate-400/20',
};

const TABS = ['ALL PROJECTS', 'IN PRODUCTION', 'POST-PRODUCTION'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function DesktopProjects() {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [activeTab, setActiveTab] = useState(TABS[0]);
  const [projects, setProjects] = useState<ApiProject[]>(MOCK_PROJECTS);
  const [loading, setLoading] = useState(false);
  const [error] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const data = await apiGet<ApiProject[]>(token, '/api/projects');
        if (data?.length) setProjects(data);
      } catch {
        // keep mock data visible on error
      } finally {
        setLoading(false);
      }
    })();
  }, [getToken]);

  const fmt = (n: number) =>
    '$' + n.toLocaleString('en-US', { maximumFractionDigits: 0 });

  return (
    <DesktopLayout
      headerRight={
        <button
          onClick={() => navigate('/new-project-desktop')}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-bold px-4 py-2 rounded-lg transition-colors"
        >
          <span className="material-symbols-outlined text-[16px]">add</span>
          New Project
        </button>
      }
    >
      <div className="flex-1 overflow-y-auto p-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-slate-100">Projects</h2>
            <p className="text-slate-500 text-sm mt-1">
              {loading ? 'Loading…' : `${projects.length} project${projects.length !== 1 ? 's' : ''} in your production slate`}
            </p>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 rounded-xl bg-slate-900 border border-slate-800 p-1">
            {TABS.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                  activeTab === tab
                    ? 'bg-blue-600 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center py-20 gap-3 text-slate-400">
            <span className="material-symbols-outlined animate-spin text-blue-400">progress_activity</span>
            <span className="text-sm">Loading your projects…</span>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="rounded-xl bg-red-900/20 border border-red-500/20 p-4 flex items-center gap-3 mb-6">
            <span className="material-symbols-outlined text-red-400">error</span>
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && projects.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
            <div className="w-20 h-20 rounded-2xl bg-blue-600/10 border border-blue-600/20 flex items-center justify-center">
              <span className="material-symbols-outlined text-blue-400 text-[40px]">movie</span>
            </div>
            <div>
              <h3 className="text-xl font-bold text-slate-200 mb-2">No projects yet</h3>
              <p className="text-slate-500 text-sm max-w-xs">Create your first production to start organizing cast, crew, budget, and schedule in one place.</p>
            </div>
            <button
              onClick={() => navigate('/new-project-desktop')}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-bold px-6 py-3 rounded-xl transition-colors"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Create First Project
            </button>
          </div>
        )}

        {/* Project grid */}
        {!loading && projects.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {projects.map((project) => (
              <div
                key={project.id}
                className="group rounded-2xl border border-slate-800 overflow-hidden hover:border-blue-600/40 transition-all cursor-pointer"
                style={{ background: 'rgba(15,23,42,0.7)' }}
                onClick={() => navigate(`/projects-desktop`)}
              >
                {/* Card header */}
                <div className="p-5 border-b border-slate-800">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-600/20 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-blue-400 text-[20px]">movie</span>
                    </div>
                    <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${STATUS_COLOR[project.format] ?? STATUS_COLOR['Development']}`}>
                      {project.format}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 leading-tight mb-1 group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {project.logline ?? (project.genre ? `${project.genre} production` : 'No description')}
                  </p>
                </div>

                {/* Stats */}
                <div className="p-5">
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <div>
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">Budget</p>
                      <p className="text-sm font-bold text-slate-200">{fmt(project.totalBudget)}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">Persons</p>
                      <p className="text-sm font-bold text-slate-200">{project._count?.persons ?? 0}</p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mb-0.5">Locations</p>
                      <p className="text-sm font-bold text-slate-200">{project._count?.locations ?? 0}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-slate-600 font-mono">
                      {new Date(project.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full border ${
                      project.sagAgreementTier === 'NON_UNION'
                        ? 'text-slate-400 bg-slate-400/10 border-slate-400/20'
                        : 'text-green-400 bg-green-400/10 border-green-400/20'
                    }`}>
                      {project.sagAgreementTier.replace(/_/g, ' ')}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {/* New project card */}
            <button
              onClick={() => navigate('/new-project-desktop')}
              className="rounded-2xl border-2 border-dashed border-slate-800 hover:border-blue-500/40 flex flex-col items-center justify-center gap-3 p-8 text-slate-600 hover:text-blue-400 transition-all min-h-[200px]"
            >
              <span className="material-symbols-outlined text-4xl">add_circle</span>
              <span className="text-sm font-bold uppercase tracking-widest">New Project</span>
            </button>
          </div>
        )}
      </div>
    </DesktopLayout>
  );
}
