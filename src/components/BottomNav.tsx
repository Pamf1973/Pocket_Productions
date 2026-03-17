import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', icon: 'grid_view', route: '/dashboard' },
  { id: 'assets', label: 'Assets', icon: 'layers', route: '/home' },
  { id: 'schedule', label: 'Schedule', icon: 'calendar_month', route: '/schedule' },
  { id: 'crew', label: 'Crew', icon: 'group', route: '/crew' },
];

interface Props {
  onAdd?: () => void;
  // kept for backward compat — if provided, overrides auto-detection
  initialActive?: string;
}

export default function BottomNav({ onAdd, initialActive }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-detect active item from current route; fall back to initialActive prop
  const routeToId: Record<string, string> = {
    '/dashboard': 'dashboard',
    '/home': 'assets',
    '/assets': 'assets',
    '/schedule': 'schedule',
    '/calendar-desktop': 'schedule',
    '/crew': 'crew',
    '/team-desktop': 'crew',
  };
  const activeId = routeToId[location.pathname] ?? initialActive ?? '';

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md bg-background-light dark:bg-background-dark border-t border-primary/20 px-6 py-3 pb-8 flex justify-between items-center z-20">
      {NAV_ITEMS.slice(0, 2).map((item) => (
        <button
          key={item.id}
          onClick={() => navigate(item.route)}
          className={`flex flex-col items-center gap-1 transition-colors ${activeId === item.id ? 'text-primary' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
        </button>
      ))}

      <div className="relative -top-6">
        <button
          onClick={onAdd ?? (() => navigate('/new-project'))}
          className="w-14 h-14 bg-primary text-white rounded-full flex items-center justify-center shadow-lg shadow-primary/40 border-4 border-background-light dark:border-background-dark active:scale-95 transition-transform"
        >
          <span className="material-symbols-outlined text-3xl">add</span>
        </button>
      </div>

      {NAV_ITEMS.slice(2).map((item) => (
        <button
          key={item.id}
          onClick={() => navigate(item.route)}
          className={`flex flex-col items-center gap-1 transition-colors ${activeId === item.id ? 'text-primary' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
