import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';

type StatusFilter = 'active' | 'preprod' | 'filming' | 'post';

interface Project {
  id: number;
  title: string;
  genre: string;
  phase: string;
  phaseColor: string;
  photo: string;
  health: ('green' | 'yellow' | 'red' | 'gray')[];
  budgetUsed: string;
  budgetTotal: string;
  budgetPercent: number;
  stats: { label: string; value: string; valueColor?: string }[];
}

const PROJECTS: Project[] = [
  {
    id: 1,
    title: 'Project Neon Genesis',
    genre: 'Action • Sci-Fi • 2024',
    phase: 'FILMING • DAY 42',
    phaseColor: 'bg-primary',
    photo:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuA7U1Gh4-kKaYostL_eEorsf99I_MqQ1acbIdsxccR9fO4r5oOUjw0z_8weTOkmmfRTt2CtAX4reSaK82QlAv3ZNbB2JDgjjcCaP6QQFKycjF_bME75dRJEEfFEZppwYR0Cq3pAx1-zKjmYu7pqIWjfEISAZ5S-dpRZRATrs5bo2yJqvi2rHzbI6WhTCKqOzkJ448p42yoso_Br-bvOqmgNEpOZ1qmOWnaX64qYsQSvBkFszpb2iTevdiyZNEgGkBIrLym0HTMnleEu',
    health: ['green', 'green', 'gray'],
    budgetUsed: '$2.4M',
    budgetTotal: '$5.0M',
    budgetPercent: 48,
    stats: [
      { label: 'Crew', value: '124' },
      { label: 'Scenes', value: '89/210' },
      { label: 'Risk', value: 'Low', valueColor: 'text-green-500' },
    ],
  },
  {
    id: 2,
    title: 'Midnight Protocol',
    genre: 'Thriller • Noir',
    phase: 'PRE-PRODUCTION',
    phaseColor: 'bg-slate-700',
    photo:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBpi15PIaYsvfxH-E45RENXH_qfU8nM2Vg1yR96bKMb8kmKStXuQ3vy55BI93ni-yD0iXh36nB1NA5HCBCSGAplQKM1QsvWnAJZtviy5eyRD7FZM8MrGMHqiPq7gGLTNsxwswgBp2V8VvkEDvcmxLkKg16kpFNaHaWU-f0rWo_WCK0SJXd76oB9IA6N1mmO1IEpNyNDx8zQycNzK-fvntjZSk9GGQ0z8tmfFzxl4wbQ_oQFGoACWweD-r-9PG4a2EYyESG2yVzoRKh1',
    health: ['yellow', 'gray', 'gray'],
    budgetUsed: '$0.8M',
    budgetTotal: '$12.5M',
    budgetPercent: 6,
    stats: [
      { label: 'Casting', value: '85%' },
      { label: 'Locations', value: 'Alert', valueColor: 'text-amber-500' },
      { label: 'Start', value: 'Oct 12' },
    ],
  },
  {
    id: 3,
    title: 'Silicon Dreams',
    genre: 'Documentary • Tech',
    phase: 'POST-PRODUCTION',
    phaseColor: 'bg-slate-600',
    photo:
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAhunedzMw0FkCcdGLT5ekqzdcWSKdwk4nc6-YGrGtXjf3W-sZe-m4JU0sXnQuTNWH4-49Q3NH3SqVn8a5-sr-ZpGWXBoFju6OFkydMxVz6uoyjUeJMrGKWKVdlb78D9ihVWLtdJBD5UVBeldRG4yBxPYbgX12kEoIFiZk_pXUGbpASlKXc-mxz0cpyzCTls66Ml66sVkgccreU1oIj3HSXvPrJ3W_joQtQiH1nkv-HQJJuC73HUgWAdZTfpKibX7IEK6E8RObFB-u9',
    health: ['green', 'green', 'green'],
    budgetUsed: '$1.1M',
    budgetTotal: '$1.2M',
    budgetPercent: 92,
    stats: [
      { label: 'Edit', value: '78%' },
      { label: 'Sound', value: 'Done', valueColor: 'text-green-500' },
      { label: 'Delivery', value: 'Nov 1' },
    ],
  },
];

const HEALTH_COLOR: Record<string, string> = {
  green: 'bg-green-500',
  yellow: 'bg-yellow-400',
  red: 'bg-red-500',
  gray: 'bg-slate-300 dark:bg-slate-700',
};

const FILTERS: { id: StatusFilter; label: string }[] = [
  { id: 'active', label: 'Active' },
  { id: 'preprod', label: 'Pre-Prod' },
  { id: 'filming', label: 'Filming' },
  { id: 'post', label: 'Post' },
];

export default function StudioOpsScreen() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<StatusFilter>('active');

  return (
    <div className="relative flex flex-col min-h-screen max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl text-slate-900 dark:text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center justify-between px-4 py-4 bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary flex items-center justify-center text-white">
            <span className="material-symbols-outlined text-xl">movie_filter</span>
          </div>
          <h1 className="text-lg font-bold tracking-tight">
            Studio<span className="text-primary">Ops</span>
          </h1>
        </div>
        <button className="size-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
          <span className="material-symbols-outlined">notifications</span>
        </button>
      </header>

      {/* Search */}
      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 flex items-center gap-2">
        <div className="flex-1 relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-lg">search</span>
          <input
            type="text"
            className="w-full bg-slate-100 dark:bg-slate-800 rounded-xl py-2.5 pl-9 pr-4 text-sm placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Search productions..."
          />
        </div>
        <button className="size-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-500">
          <span className="material-symbols-outlined text-lg">tune</span>
        </button>
      </div>

      {/* Filter chips */}
      <div className="px-4 py-3 flex gap-2 overflow-x-auto no-scrollbar">
        {FILTERS.map((f) => (
          <button
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap transition-colors ${
              activeFilter === f.id
                ? 'bg-primary text-white'
                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Project Cards */}
      <main className="flex-1 px-4 pb-24 space-y-4 overflow-y-auto">
        {PROJECTS.map((proj) => (
          <div
            key={proj.id}
            className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-sm border border-slate-100 dark:border-slate-800 cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => navigate('/budget')}
          >
            {/* Photo */}
            <div className="relative h-44 w-full overflow-hidden">
              <img src={proj.photo} alt={proj.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <span className={`absolute top-3 left-3 ${proj.phaseColor} text-white text-[10px] font-bold px-2 py-1 rounded`}>
                {proj.phase}
              </span>
            </div>

            {/* Info */}
            <div className="p-4">
              <div className="flex justify-between items-start mb-1">
                <div>
                  <h3 className="font-bold text-base">{proj.title}</h3>
                  <p className="text-slate-400 text-xs">{proj.genre}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Health</span>
                  <div className="flex gap-1">
                    {proj.health.map((h, i) => (
                      <div key={i} className={`w-4 h-2 rounded-full ${HEALTH_COLOR[h]}`} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Budget bar */}
              <div className="mt-3 mb-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400 font-medium">Budget Consumed</span>
                  <span className="font-bold">
                    {proj.budgetUsed} / {proj.budgetTotal}
                  </span>
                </div>
                <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="bg-primary h-full rounded-full"
                    style={{ width: `${proj.budgetPercent}%` }}
                  />
                </div>
              </div>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-2 border-t border-slate-100 dark:border-slate-800 pt-3">
                {proj.stats.map((stat, i) => (
                  <div key={i} className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{stat.label}</span>
                    <span className={`text-sm font-bold ${stat.valueColor ?? 'text-slate-900 dark:text-slate-100'}`}>
                      {stat.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </main>

      <BottomNav />
    </div>
  );
}
