import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import DesktopLayout from '../../components/DesktopLayout';
import { apiPost, apiGet } from '../../utils/api';

// ─── Types ────────────────────────────────────────────────────────────────────

interface Frame {
  id: number;
  label: string;
  hasContent: boolean;
  imgSrc?: string;
  description?: string;
  camera?: string;
  shotSize?: string;
  shotType?: string;
  cameraMovement?: string;
  equipment?: string;
  lens?: string;
  lighting?: string;
  frameRate?: string;
  vfx?: string;
  sceneHeading?: string;
  mood?: string;
}

interface AiShot {
  frameLabel: string;
  sceneHeading: string;
  shotType: string;
  cameraMovement: string;
  lighting: string;
  description: string;
  mood: string;
}

interface ProjectOption {
  id: string;
  title: string;
}

interface DbShot {
  id: string;
  sceneNumber: string;
  shotNumber: number;
  shotType: string;
  description: string;
  aiGenerated: boolean;
  aiPrompt: string | null;
  order: number;
  notes: string | null;
}

// ─── Seed data ────────────────────────────────────────────────────────────────

const SEED_FRAMES: Frame[] = [
  {
    id: 1,
    label: 'FRAME 1',
    hasContent: true,
    imgSrc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDkWkj6QvsZBfNvakSTjlrzaPjFO7vA2h3iWbrkf77GCmNftHkliJVc9stGU5zmClw6i8Ehnj6fLFb_4FiOfejX5IO8wSIxY2sBkd5RR5M0OnYTrAz86wsbNScPJvPfXzRnbwlbefUhJp8UXvjukQv0BNPtzBkJAWOiUgp2UncGUZziPPe8MzpjftKwQrlH1tO7JevvFQeVhixY_j8IElhfdswdEgsxHhbdyi5TTtQZi2Rj9VUUdVrFnjfQYscoiUsdgLBZ4iIWAvMb',
    description: 'A young, attractive blue-eyed woman with a calm and',
    camera: 'Cam 1',
    shotSize: 'WCU',
    shotType: 'SL',
    cameraMovement: 'Static',
    equipment: 'Steadicam / Straight',
    lens: 'Wide-Angle',
    lighting: 'Natural',
    frameRate: '48 fps',
    vfx: '—',
  },
  {
    id: 2,
    label: 'FRAME 2',
    hasContent: false,
    description: '',
    camera: '',
    shotSize: '',
    shotType: '',
    cameraMovement: '',
    equipment: '',
    lens: '',
    lighting: '',
    frameRate: '60 fps',
    vfx: '',
  },
  {
    id: 3,
    label: 'FRAME 3',
    hasContent: false,
  },
];

const SCRIPT_TEXT = `EXT. BACK ALLEY - NIGHT

Heavy rain falls, reflecting the flickering blue and pink neon from the street above.

JACK (40s, weary) stands in the shadows. He strikes a match. The flame illuminates his grizzled face for a brief second before he pulls a drag.

The smoke mingles with the steam rising from a nearby vent.`;

const COLOR_PALETTE = ['#0a192f', '#ff2d55', '#1a1a1a', '#008080', '#ffbf00'];

// ─── Component ────────────────────────────────────────────────────────────────

export default function DesktopStoryboard() {
  const navigate = useNavigate();
  const { getToken } = useAuth();

  const [frames, setFrames] = useState<Frame[]>(SEED_FRAMES);
  const [script, setScript] = useState(SCRIPT_TEXT);
  const [activeMode, setActiveMode] = useState<'ai' | 'upload' | 'blank'>('ai');
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [imageGenerating, setImageGenerating] = useState<Record<number, boolean>>({});

  const [currentProjectId, setCurrentProjectId] = useState<string | null>(
    localStorage.getItem('pp_current_project_id')
  );
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);

  // Load project list
  useEffect(() => {
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const projects = await apiGet<ProjectOption[]>(token, '/api/projects');
        setProjectOptions(projects);
        if (!currentProjectId && projects.length > 0) {
          setCurrentProjectId(projects[0].id);
          localStorage.setItem('pp_current_project_id', projects[0].id);
        }
      } catch { /* ignore */ }
    })();
  }, [getToken]);

  // Load shots from DB when project changes
  useEffect(() => {
    if (!currentProjectId) return;
    (async () => {
      try {
        const token = await getToken();
        if (!token) return;
        const shots = await apiGet<DbShot[]>(
          token,
          `/api/storyboard/shots?projectId=${currentProjectId}`
        );
        if (shots.length > 0) {
          const mapped: Frame[] = shots.map((shot) => {
            let frameLabel = `FRAME ${shot.shotNumber}`;
            let cameraMovement = '';
            let lighting = '';
            let mood = '';
            try {
              const parsed = JSON.parse(shot.notes ?? '{}');
              frameLabel = parsed.frameLabel || frameLabel;
              cameraMovement = parsed.cameraMovement || '';
              lighting = parsed.lighting || '';
              mood = parsed.mood || '';
            } catch { /* ignore */ }
            return {
              id: shot.shotNumber,
              label: frameLabel,
              hasContent: true,
              sceneHeading: shot.sceneNumber,
              description: shot.description,
              shotType: shot.shotType,
              cameraMovement,
              lighting,
              mood,
              camera: 'Cam 1',
              shotSize: 'WS',
              equipment: 'Steadicam',
              lens: 'Standard',
              frameRate: '24 fps',
              vfx: '—',
            };
          });
          setFrames(mapped);
        }
      } catch { /* ignore */ }
    })();
  }, [currentProjectId, getToken]);

  // Pre-fill script textarea from localStorage if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('pp_last_script_analysis');
      if (saved) {
        const analysis = JSON.parse(saved);
        if (analysis?.title && analysis?.summary) {
          setScript(`${analysis.title}\n\n${analysis.summary}`);
        }
      }
    } catch {
      // ignore parse errors
    }
  }, []);

  // ── Generate shots ─────────────────────────────────────────────────────────

  const handleGenerateShots = async () => {
    if (!script.trim()) return;
    setGenerating(true);
    setError(null);
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const { result } = await apiPost<{ result: { storyboardShots: AiShot[] } }>(
        token,
        '/api/ai/analyze-script',
        { scriptText: script }
      );

      if (!result.storyboardShots || result.storyboardShots.length === 0) {
        throw new Error('No storyboard shots were generated. Try adding more scene description.');
      }

      const newFrames: Frame[] = result.storyboardShots.map((shot, i) => ({
        id: i + 1,
        label: shot.frameLabel || `FRAME ${i + 1}`,
        hasContent: true,
        sceneHeading: shot.sceneHeading,
        description: shot.description,
        shotType: shot.shotType,
        cameraMovement: shot.cameraMovement,
        lighting: shot.lighting,
        mood: shot.mood,
        camera: 'Cam 1',
        shotSize: 'WS',
        equipment: 'Steadicam',
        lens: 'Standard',
        frameRate: '24 fps',
        vfx: '—',
      }));

      setFrames(newFrames);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate shots');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateImage = async (frame: Frame) => {
    setImageGenerating((prev) => ({ ...prev, [frame.id]: true }));
    try {
      const token = await getToken();
      if (!token) throw new Error('Not authenticated');
      const { url } = await apiPost<{ url: string }>(
        token,
        '/api/ai/generate-image',
        {
          sceneHeading: frame.sceneHeading || 'EXT. LOCATION - DAY',
          description: frame.description || '',
          shotType: frame.shotType || 'Wide Shot',
          lighting: frame.lighting || 'Natural',
          mood: frame.mood || 'Neutral',
        }
      );
      setFrames((prev) => prev.map((f) => f.id === frame.id ? { ...f, imgSrc: url } : f));
    } catch (err) {
      // Silent fail — user can retry
      console.error('Image generation failed:', err);
    } finally {
      setImageGenerating((prev) => ({ ...prev, [frame.id]: false }));
    }
  };

  // ─── Render ────────────────────────────────────────────────────────────────

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
      <div className="flex flex-1 overflow-hidden">
        {/* Workspace */}
        <div className="flex flex-1 flex-col overflow-hidden bg-slate-950">
          {/* Project header */}
          <div className="shrink-0 flex flex-wrap items-center justify-between gap-4 p-6 border-b border-blue-600/10 bg-transparent">
            <div className="flex flex-col gap-1">
              {projectOptions.length > 0 ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-widest shrink-0">Project:</span>
                  <div className="relative">
                    <select
                      value={currentProjectId ?? ''}
                      onChange={(e) => {
                        setCurrentProjectId(e.target.value);
                        localStorage.setItem('pp_current_project_id', e.target.value);
                      }}
                      className="bg-transparent border border-blue-600/20 rounded-lg pl-2 pr-6 py-0.5 text-xs font-bold text-blue-300 outline-none focus:ring-1 focus:ring-blue-500 appearance-none cursor-pointer"
                    >
                      {projectOptions.map((p) => (
                        <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">{p.title}</option>
                      ))}
                    </select>
                    <span className="material-symbols-outlined absolute right-1 top-1/2 -translate-y-1/2 text-blue-400 pointer-events-none text-[14px]">expand_more</span>
                  </div>
                </div>
              ) : (
                <span className="text-xs font-bold text-blue-400 uppercase tracking-widest">Storyboard</span>
              )}
              <h1 className="text-2xl font-black leading-tight">Scene 1: The Rain-Slicked Alley</h1>
            </div>
            <div className="flex gap-3">
              <button className="flex items-center gap-2 px-4 h-10 rounded-xl border border-blue-600/20 text-slate-300 text-sm font-bold hover:bg-blue-600/5 transition-all">
                <span className="material-symbols-outlined text-lg">picture_as_pdf</span>
                Export PDF
              </button>
              <button
                onClick={handleGenerateShots}
                disabled={generating || !script.trim()}
                className="flex items-center gap-2 px-6 h-10 rounded-xl bg-blue-600 text-white text-sm font-bold shadow-lg shadow-blue-600/25 hover:scale-[1.02] disabled:opacity-50 disabled:scale-100 transition-all"
              >
                {generating ? (
                  <>
                    <span className="material-symbols-outlined text-lg animate-spin">progress_activity</span>
                    Generating…
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-lg">bolt</span>
                    Generate Shots
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Editor + Shot grid */}
          <div className="flex flex-1 overflow-hidden">
            {/* Script panel */}
            <section
              className="w-[380px] shrink-0 border-r border-blue-600/10 flex flex-col p-6 overflow-y-auto"
              style={{ background: 'rgba(30,41,59,0.3)', backdropFilter: 'blur(12px)' }}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-400 text-lg">description</span>
                  Script Editor
                </h3>
                <div className="flex gap-1">
                  <button className="p-1 text-slate-400 hover:text-blue-400 transition-colors">
                    <span className="material-symbols-outlined text-base">undo</span>
                  </button>
                  <button className="p-1 text-slate-400 hover:text-blue-400 transition-colors">
                    <span className="material-symbols-outlined text-base">redo</span>
                  </button>
                </div>
              </div>

              {/* Script textarea */}
              <div className="flex flex-col flex-1 min-h-[280px] rounded-xl border border-blue-600/20 bg-slate-900 p-4 shadow-sm mb-4">
                <textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  className="w-full flex-1 resize-none border-none outline-none bg-transparent text-slate-100 text-sm font-normal leading-relaxed placeholder:text-slate-700"
                  placeholder="Enter script scene description here..."
                />
                <div className="flex items-center justify-between pt-4 border-t border-blue-600/5">
                  <div className="flex items-center gap-2">
                    {['mic', 'attachment', 'palette'].map((icon) => (
                      <button key={icon} className="p-2 rounded-lg hover:bg-blue-600/10 text-slate-400 hover:text-blue-400 transition-all">
                        <span className="material-symbols-outlined">{icon}</span>
                      </button>
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-blue-400/40 uppercase">AI Ready</span>
                </div>
              </div>

              {/* Error banner */}
              {error && (
                <div className="mb-4 rounded-lg bg-red-900/20 border border-red-500/20 p-3 flex items-start gap-2">
                  <span className="material-symbols-outlined text-red-400 text-[16px] shrink-0 mt-0.5">error</span>
                  <p className="text-xs text-red-300">{error}</p>
                </div>
              )}

              {/* Scene analysis */}
              <div className="p-4 rounded-xl border border-blue-600/10">
                <h4 className="text-xs font-bold text-blue-400 mb-2 uppercase">Scene Analysis</h4>
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Lighting</span>
                    <span className="text-slate-200 font-medium">Low Key / Chiaroscuro</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Tone</span>
                    <span className="text-slate-200 font-medium">Melancholic, Suspense</span>
                  </div>
                </div>
                <h4 className="text-[10px] font-bold text-slate-500 mb-2 uppercase tracking-wider">Color Palette</h4>
                <div className="flex items-center gap-2">
                  {COLOR_PALETTE.map((color) => (
                    <div key={color} className="size-5 rounded-full border border-white/10 shadow-sm" style={{ backgroundColor: color }} />
                  ))}
                </div>
              </div>
            </section>

            {/* Shot cards panel */}
            <section className="flex-1 p-6 overflow-y-auto bg-slate-950">
              {/* Mode tabs */}
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-blue-600/10">
                {[
                  { key: 'upload', label: 'Upload Storyboard', icon: 'upload_file' },
                  { key: 'ai', label: 'AI StoryBoarder', icon: 'auto_awesome' },
                  { key: 'blank', label: 'Blank Story Board', icon: 'note_add' },
                ].map((btn) => (
                  <button
                    key={btn.key}
                    onClick={() => setActiveMode(btn.key as typeof activeMode)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                      activeMode === btn.key
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                        : 'border border-blue-600/20 text-slate-300 hover:bg-blue-600/5'
                    }`}
                  >
                    <span className="material-symbols-outlined text-lg">{btn.icon}</span>
                    {btn.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-3 mb-4">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Generated Storyboard</p>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-600/30">
                  {frames.length} SHOTS
                </span>
                <div className="ml-auto">
                  <button className="flex items-center gap-1.5 text-xs font-bold text-slate-400 border border-white/10 px-3 py-1.5 rounded-lg hover:bg-white/5">
                    Grid View
                    <span className="material-symbols-outlined text-[14px]">expand_more</span>
                  </button>
                </div>
              </div>

              {/* Generating overlay hint */}
              {generating && (
                <div className="mb-4 rounded-xl bg-blue-900/20 border border-blue-500/20 p-4 flex items-center gap-3">
                  <span className="material-symbols-outlined text-blue-400 animate-spin">progress_activity</span>
                  <p className="text-sm text-blue-300">Claude is generating storyboard shots from your script…</p>
                </div>
              )}

              {/* Frame cards */}
              <div className="grid grid-cols-3 gap-4">
                {frames.map((frame) => (
                  <div
                    key={frame.id}
                    className="rounded-xl border border-white/10 overflow-hidden"
                    style={{ background: 'rgba(15,20,30,0.8)' }}
                  >
                    <div className="p-3 bg-slate-800/50">
                      <p className="text-[10px] font-black text-white uppercase tracking-widest">{frame.label}</p>
                      {frame.sceneHeading && (
                        <p className="text-[9px] text-blue-400 mt-0.5 truncate">{frame.sceneHeading}</p>
                      )}
                    </div>

                    {frame.hasContent ? (
                      <>
                        {/* AI-generated frames show a scene heading placeholder instead of an image */}
                        {frame.sceneHeading && !frame.imgSrc ? (
                          <div className="h-32 bg-slate-800/60 flex flex-col items-center justify-center gap-2 px-3 relative">
                            {imageGenerating[frame.id] ? (
                              <>
                                <span className="material-symbols-outlined text-blue-400 text-3xl animate-spin">progress_activity</span>
                                <p className="text-[10px] text-blue-400 font-bold">Generating image…</p>
                              </>
                            ) : (
                              <>
                                <span className="material-symbols-outlined text-slate-600 text-3xl">movie</span>
                                <p className="text-[10px] text-slate-500 text-center font-medium leading-snug">{frame.sceneHeading}</p>
                                {frame.mood && (
                                  <span className="text-[9px] text-blue-500 font-bold uppercase tracking-widest">{frame.mood}</span>
                                )}
                                <button
                                  onClick={() => handleGenerateImage(frame)}
                                  className="absolute bottom-2 right-2 flex items-center gap-1 bg-blue-600/80 hover:bg-blue-500 text-white text-[9px] font-bold px-2 py-1 rounded-lg transition-colors"
                                >
                                  <span className="material-symbols-outlined text-[12px]">auto_awesome</span>
                                  Generate Image
                                </button>
                              </>
                            )}
                          </div>
                        ) : (
                          <div className="h-32 overflow-hidden">
                            <img src={frame.imgSrc} alt={frame.label} className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="p-3 space-y-2 text-[10px]">
                          <p className="text-slate-300 text-xs line-clamp-2">{frame.description}</p>
                          <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                            {[
                              { label: 'CAMERA', value: frame.camera },
                              { label: 'SHOT SIZE', value: frame.shotSize },
                              { label: 'SHOT TYPE', value: frame.shotType },
                              { label: 'CAMERA MOVEMENT', value: frame.cameraMovement },
                              { label: 'EQUIPMENT', value: frame.equipment },
                              { label: 'LIGHTING', value: frame.lighting },
                              { label: 'FRAME RATE', value: frame.frameRate },
                              { label: 'VFX', value: frame.vfx },
                            ].map(({ label, value }) => (
                              <div key={label}>
                                <p className="text-[9px] text-slate-600 uppercase tracking-widest">{label}</p>
                                <p className="font-bold text-slate-200 truncate">{value || '—'}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="p-3 space-y-2 text-[10px] opacity-40">
                        <p className="text-slate-500 text-xs italic">Enter description</p>
                        <div className="grid grid-cols-2 gap-x-3 gap-y-1.5">
                          {['CAMERA', 'SHOT SIZE', 'SHOT TYPE', 'CAMERA MOVEMENT', 'EQUIPMENT', 'LIGHTING', 'FRAME RATE', 'VFX'].map((label) => (
                            <div key={label}>
                              <p className="text-[9px] text-slate-600 uppercase tracking-widest">{label}</p>
                              <p className="font-bold text-slate-500">
                                {label.charAt(0) + label.slice(1).toLowerCase().replace('_', ' ')}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add manual shot */}
                <button className="rounded-xl border-2 border-dashed border-white/10 hover:border-blue-500/40 flex flex-col items-center justify-center gap-2 p-6 text-slate-500 hover:text-blue-400 transition-all min-h-[200px]">
                  <span className="material-symbols-outlined text-4xl">add_circle</span>
                  <span className="text-xs font-bold uppercase tracking-widest">Add Manual Shot</span>
                </button>
              </div>
            </section>
          </div>

          {/* Footer bar */}
          <footer className="shrink-0 border-t border-blue-600/10 px-6 py-2 flex items-center justify-between bg-slate-950">
            <div className="flex items-center gap-2 text-[10px] text-blue-400/60 font-bold uppercase">
              <span className="size-1.5 rounded-full bg-green-400 animate-pulse" />
              Cloud Synced
              <span className="text-slate-600 ml-2">V2.4.0-Noir</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] font-bold">
              <span className="text-slate-500 uppercase tracking-widest">Render Engine: Diffusion V4</span>
              <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest">Pro Plan</span>
            </div>
          </footer>
        </div>
      </div>
    </DesktopLayout>
  );
}
