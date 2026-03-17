import { useNavigate, useLocation } from 'react-router-dom';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Home', icon: 'grid_view', route: '/dashboard' },
  { id: 'assets', label: 'Assets', icon: 'layers', route: '/home' },
  { id: 'budget', label: 'Budget', icon: 'payments', route: '/budget' },
  { id: 'schedule', label: 'Schedule', icon: 'calendar_month', route: '/schedule' },
  { id: 'crew', label: 'Crew', icon: 'group', route: '/crew' },
];

const routeToId: Record<string, string> = {
  '/dashboard': 'dashboard',
  '/home': 'assets',
  '/assets': 'assets',
  '/budget': 'budget',
  '/budgets': 'budget',
  '/schedule': 'schedule',
  '/calendar-desktop': 'schedule',
  '/crew': 'crew',
  '/team-desktop': 'crew',
};

interface Props {
  onAdd?: () => void;
  initialActive?: string;
}

export default function BottomNav({ onAdd, initialActive }: Props) {
  const navigate = useNavigate();
  const location = useLocation();

  const activeId = routeToId[location.pathname] ?? initialActive ?? '';

  return (
    <nav
      className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-20 flex items-center justify-around px-4 pb-8 pt-3"
      style={{
        background: 'rgba(10,15,26,0.95)',
        backdropFilter: 'blur(12px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {/* First 2 tabs */}
      {NAV_ITEMS.slice(0, 2).map((item) => (
        <button
          key={item.id}
          onClick={() => navigate(item.route)}
          className="flex flex-col items-center gap-1"
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ color: activeId === item.id ? '#ec5b13' : 'rgba(255,255,255,0.3)' }}
          >
            {item.icon}
          </span>
          <span
            className="text-[9px] font-bold uppercase tracking-wider"
            style={{ color: activeId === item.id ? '#ec5b13' : 'rgba(255,255,255,0.3)' }}
          >
            {item.label}
          </span>
        </button>
      ))}

      {/* FAB */}
      <div className="relative -top-5">
        <button
          onClick={onAdd ?? (() => navigate('/new-project'))}
          className="w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-95 transition-transform border-4"
          style={{
            background: 'linear-gradient(135deg, #ec5b13, #c0410a)',
            boxShadow: '0 8px 20px rgba(236,91,19,0.4)',
            borderColor: 'rgba(10,15,26,0.95)',
          }}
        >
          <span className="material-symbols-outlined text-white text-[28px]">add</span>
        </button>
      </div>

      {/* Last 3 tabs */}
      {NAV_ITEMS.slice(2).map((item) => (
        <button
          key={item.id}
          onClick={() => navigate(item.route)}
          className="flex flex-col items-center gap-1"
        >
          <span
            className="material-symbols-outlined text-[22px]"
            style={{ color: activeId === item.id ? '#ec5b13' : 'rgba(255,255,255,0.3)' }}
          >
            {item.icon}
          </span>
          <span
            className="text-[9px] font-bold uppercase tracking-wider"
            style={{ color: activeId === item.id ? '#ec5b13' : 'rgba(255,255,255,0.3)' }}
          >
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
