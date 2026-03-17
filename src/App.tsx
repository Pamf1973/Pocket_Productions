import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Landing
import LandingPage from './pages/LandingPage';

// Auth
import LoginScreen from './pages/LoginScreen';
import ProtectedRoute from './components/ProtectedRoute';
import DeviceRoute from './components/DeviceRoute';

// Mobile pages
import MobileDashboard from './pages/mobile/MobileDashboard';
import HomeScreen from './pages/mobile/HomeScreen';
import BudgetScreen from './pages/mobile/BudgetScreen';
import ScheduleScreen from './pages/mobile/ScheduleScreen';
import NexusOpsScreen from './pages/mobile/NexusOpsScreen';
import ScoutNoir from './pages/mobile/ScoutNoir';
import NewProjectScreen from './pages/mobile/NewProjectScreen';
import StudioOpsScreen from './pages/mobile/StudioOpsScreen';
import StoryboardStudioScreen from './pages/mobile/StoryboardStudioScreen';
import CrewOpsScreen from './pages/mobile/CrewOpsScreen';
import PWAInstallScreen from './pages/mobile/PWAInstallScreen';

// Desktop pages
import DesktopDashboard from './pages/desktop/DesktopDashboard';
import DesktopAssets from './pages/desktop/DesktopAssets';
import DesktopBudgets from './pages/desktop/DesktopBudgets';
import DesktopCalendar from './pages/desktop/DesktopCalendar';
import DesktopLocations from './pages/desktop/DesktopLocations';
import DesktopNewProject from './pages/desktop/DesktopNewProject';
import DesktopProjects from './pages/desktop/DesktopProjects';
import DesktopStoryboard from './pages/desktop/DesktopStoryboard';
import DesktopTeam from './pages/desktop/DesktopTeam';
import DesktopSettings from './pages/desktop/DesktopSettings';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth */}
        <Route path="/login" element={<LoginScreen />} />

        {/* Landing / PWA install */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/install" element={<PWAInstallScreen />} />

        {/* Dashboard — mobile PWA or desktop web */}
        <Route
          path="/dashboard"
          element={
            <DeviceRoute
              mobile={<MobileDashboard />}
              desktop={<ProtectedRoute><DesktopDashboard /></ProtectedRoute>}
            />
          }
        />

        {/* Assets — mobile PWA or desktop web */}
        <Route
          path="/assets"
          element={
            <DeviceRoute
              mobile={<HomeScreen />}
              desktop={<ProtectedRoute><DesktopAssets /></ProtectedRoute>}
            />
          }
        />

        {/* Calendar — mobile PWA or desktop web */}
        <Route
          path="/calendar-desktop"
          element={
            <DeviceRoute
              mobile={<ScheduleScreen />}
              desktop={<ProtectedRoute><DesktopCalendar /></ProtectedRoute>}
            />
          }
        />

        {/* Mobile-only pages */}
        <Route path="/home" element={<HomeScreen />} />
        <Route path="/budget" element={<BudgetScreen />} />
        <Route path="/schedule" element={<ScheduleScreen />} />
        <Route path="/nexus" element={<NexusOpsScreen />} />
        <Route path="/scout" element={<ScoutNoir />} />
        <Route path="/new-project" element={<NewProjectScreen />} />
        <Route path="/projects" element={<StudioOpsScreen />} />
        <Route path="/storyboard" element={<StoryboardStudioScreen />} />
        <Route path="/crew" element={<CrewOpsScreen />} />

        {/* Desktop-only pages (auth-gated) */}
        <Route path="/budgets" element={<ProtectedRoute><DesktopBudgets /></ProtectedRoute>} />
        <Route path="/locations-desktop" element={<ProtectedRoute><DesktopLocations /></ProtectedRoute>} />
        <Route path="/new-project-desktop" element={<ProtectedRoute><DesktopNewProject /></ProtectedRoute>} />
        <Route path="/projects-desktop" element={<ProtectedRoute><DesktopProjects /></ProtectedRoute>} />
        <Route path="/storyboard-desktop" element={<ProtectedRoute><DesktopStoryboard /></ProtectedRoute>} />
        <Route path="/team-desktop" element={<ProtectedRoute><DesktopTeam /></ProtectedRoute>} />
        <Route path="/settings-desktop" element={<ProtectedRoute><DesktopSettings /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}
