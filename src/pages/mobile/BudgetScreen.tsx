import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BottomNav from '../../components/BottomNav';

type BudgetTab = 'cast' | 'crew' | 'locations' | 'gear';

interface CastMember {
  id: number;
  name: string;
  role: string;
  amount: string;
  rateLabel: string;
  photo: string;
  status: 'alert' | 'compliant';
  statusMessage: string;
}

const CAST: CastMember[] = [
  {
    id: 1,
    name: 'Johnathan Vance',
    role: 'Lead Role - "The Detective"',
    amount: '$12,500',
    rateLabel: 'Negotiated Rate',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCBjbzVBoSymZNCoSjCNmsb3b2RfIgHKFlgCAxmZahxaIyu5GCJTb0B3sMEUK4SsimpHqoAtzHGo8p7U95Sib6ZR_PJHM3sHlEmTfG49G1WJi35eng-d0Dwpz81hJSvJ49eDLIDnyokD2llr07hEU2FQ2cv7DBkv6DNuveuuRj_APlsmfxWw8i073A-VIh3elVaKo2YVqvfE9woU0oda6WtcxA3e8hVoAetf9g-jqwqhu2GPZPEV8SEMhrgz2Uk2yXOA1FeokJEXTfd',
    status: 'alert',
    statusMessage: 'SAG Waiver Pending: Overtime calculation mismatch',
  },
  {
    id: 2,
    name: 'Elena Rodriguez',
    role: 'Supporting - "The Informant"',
    amount: '$7,200',
    rateLabel: 'Contracted',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCY2wrSO3b_YwsVstVkUsrZiv8-noKTCMWpCWQ5yQaQKtU8aZjpO6wOHQ6e2-CmYyjEU5DVkG08Ek26Qiu2uiWFCI3uXJLp7TeMWnnbIeyhuDsvKR79X6aku5uNlkzVxNAxUKVdiPEi5gDhxvtq4eInXShYCPlaH21QKEASzM9Z23xVMf-QJ7gyJnajscdplAxzzjgYWLFw5uH_kOp-nusA3YJFIludeXMIb8KpqILQkyGjF2TARI3yqW6NF0p__wlssrWk6BZjFJx5',
    status: 'compliant',
    statusMessage: 'SAG Compliant - Tier 1 Contract',
  },
  {
    id: 3,
    name: 'Marcus Thorne',
    role: 'Day Player - "Henchman #1"',
    amount: '$1,200',
    rateLabel: 'Daily Rate',
    photo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA4bdu00bx9HY_1vEfFrF8r5YqSYueqDOt1EtWnu7JGDkck8_52zofaElCf-UeuZkA-MZhYWhuRhN7vuZwuUtxQunE-Wu7KMyuN_i7U2dXTjxgxE-2iQNwbPOP7jjFo2OErRp4W2rGTgTM1X8sb4PHNKsRVGUI5FJ_rYHVvWxTpSTH870_ZXK8dYUT2yDh11Dt2fpVH5pChl7D76kvG-V8Eya1qEYKFiIYBMdnm29sfey2SfK_PLixhicL-fGdNcA2uq1Ap6dvXeJ67',
    status: 'compliant',
    statusMessage: 'SAG Compliant - Day Player Scale',
  },
];

const TABS: { id: BudgetTab; label: string }[] = [
  { id: 'cast', label: 'Cast' },
  { id: 'crew', label: 'Crew' },
  { id: 'locations', label: 'Locations' },
  { id: 'gear', label: 'Gear' },
];

export default function BudgetScreen() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<BudgetTab>('cast');

  return (
    <div className="relative flex min-h-screen w-full flex-col max-w-md mx-auto bg-background-light dark:bg-background-dark shadow-2xl overflow-x-hidden">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md p-4 justify-between border-b border-primary/10">
        <button
          onClick={() => navigate(-1)}
          className="text-slate-900 dark:text-slate-100 flex size-10 shrink-0 items-center justify-center rounded-full hover:bg-primary/10 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h2 className="text-slate-900 dark:text-slate-100 text-lg font-bold leading-tight tracking-tight flex-1 text-center">
          Production Budget
        </h2>
        <div className="flex w-10 items-center justify-end">
          <button className="flex size-10 items-center justify-center rounded-full hover:bg-primary/10 transition-colors">
            <span className="material-symbols-outlined">more_vert</span>
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="flex flex-col gap-3 p-4">
        <div className="flex flex-col gap-1 rounded-xl p-5 bg-primary text-white shadow-lg shadow-primary/20">
          <p className="text-white/80 text-xs font-semibold uppercase tracking-wider">Total Budget</p>
          <div className="flex justify-between items-end">
            <p className="text-3xl font-extrabold leading-tight">$450,200</p>
            <p className="text-white/90 text-sm font-medium bg-white/20 px-2 py-0.5 rounded-full">
              Project Alpha
            </p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1 rounded-xl p-4 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
              Expended
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">$210,000</p>
            <div className="flex items-center gap-1 text-rose-500 text-xs font-bold mt-1">
              <span className="material-symbols-outlined text-sm">trending_up</span>
              46.6%
            </div>
          </div>
          <div className="flex flex-col gap-1 rounded-xl p-4 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <p className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase tracking-wider">
              Remaining
            </p>
            <p className="text-xl font-bold text-slate-900 dark:text-slate-100">$240,200</p>
            <div className="flex items-center gap-1 text-emerald-500 text-xs font-bold mt-1">
              <span className="material-symbols-outlined text-sm">payments</span>
              In Green
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[72px] z-10 bg-background-light dark:bg-background-dark">
        <div className="flex border-b border-slate-200 dark:border-slate-800 px-4 gap-6 overflow-x-auto no-scrollbar">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex flex-col items-center justify-center border-b-2 pb-3 pt-4 whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-slate-500 dark:text-slate-400'
              }`}
            >
              <p className="text-sm font-bold tracking-wide">{tab.label}</p>
            </button>
          ))}
        </div>
      </div>

      {/* List Section */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 mb-20">
        <div className="flex justify-between items-center px-1">
          <h3 className="text-slate-900 dark:text-slate-100 text-sm font-extrabold uppercase tracking-widest flex items-center gap-2">
            <span className="w-2 h-2 bg-primary rounded-full" />
            Cast - SAG-AFTRA Compliant
          </h3>
          <span className="material-symbols-outlined text-slate-400">filter_list</span>
        </div>

        {/* Cast Items */}
        <div className="space-y-3">
          {CAST.map((member) => (
            <div
              key={member.id}
              className={`group relative flex flex-col gap-3 rounded-xl p-4 bg-white dark:bg-slate-800 shadow-sm border-y border-r border-slate-100 dark:border-slate-700/50 ${
                member.status === 'alert'
                  ? 'border-l-4 border-l-rose-500'
                  : 'border border-slate-100 dark:border-slate-700/50'
              }`}
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="size-10 rounded-lg bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div>
                    <p className="text-slate-900 dark:text-slate-100 font-bold">{member.name}</p>
                    <p className="text-slate-500 dark:text-slate-400 text-xs">{member.role}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0">
                  <p className="text-slate-900 dark:text-slate-100 font-bold">{member.amount}</p>
                  <p className="text-slate-400 text-[10px] uppercase font-bold">{member.rateLabel}</p>
                </div>
              </div>
              {member.status === 'alert' ? (
                <div className="flex items-center gap-2 bg-rose-50 dark:bg-rose-900/20 px-2 py-1.5 rounded text-rose-600 dark:text-rose-400 text-xs font-semibold">
                  <span className="material-symbols-outlined text-sm">warning</span>
                  {member.statusMessage}
                </div>
              ) : (
                <div className="flex items-center gap-2 px-2 py-1 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  {member.statusMessage}
                </div>
              )}
            </div>
          ))}

          {/* Upcoming Locations Preview */}
          <div className="pt-4 px-1">
            <h3 className="text-slate-900 dark:text-slate-100 text-sm font-extrabold uppercase tracking-widest flex items-center gap-2 mb-3">
              <span className="w-2 h-2 bg-slate-400 rounded-full" />
              Upcoming: Top Locations
            </h3>
            <div className="relative w-full h-32 rounded-xl overflow-hidden mb-2 group cursor-pointer">
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10" />
              <img
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBLcH50tbRtPu5V8lPIoOA6p9-Q9Mo_C0u43ZW7v5TO1PPPQNh3EKormYzSK7Xm2hB22GfyLlVmHV1AO2FvR-xUeYC5xhlLqtjBfOhdmqWL9s-h11XQdefx7cOhfgyRrR8cXRyiU6hQip-Pvg6xMIH6lZvtRfDrqInovAotyL1GJW584yqMiUI7RF9HiBn_ITGZbQKC4dfU2kvm-uX4FuHRoCepU8C5ByIvygQ1N3AY-Q6fppzl7eKQqMg4aNyemXoUQvBS2T-8WpHT"
                alt="Downtown Alleyway location"
              />
              <div className="absolute bottom-3 left-3 z-20">
                <p className="text-white font-bold">Downtown Alleyway</p>
                <p className="text-white/80 text-[10px] uppercase font-bold tracking-tight">
                  Main Sequence - $15,000
                </p>
              </div>
              <div className="absolute top-3 right-3 z-20">
                <span className="bg-primary text-white text-[10px] font-bold px-2 py-1 rounded">
                  PENDING PERMIT
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
