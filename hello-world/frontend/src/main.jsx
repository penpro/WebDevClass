import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import App from './App.jsx'
import { AuthProvider } from './AuthContext.jsx'

// New Penumbra Tech marketing pages.
import PenumbraHome from './pages/PenumbraHome.jsx'
import Services from './pages/Services.jsx'
import About from './pages/About.jsx'
import Contact from './pages/Contact.jsx'
import Projects from './pages/Projects.jsx'

// Public project case studies. These wrap each demo with marketing
// copy + a screenshot/sample, so the home page never links visitors
// directly into an auth-gated admin route.
import DiagnosticsCase from './pages/projects/DiagnosticsCase.jsx'

// Existing pages preserved. The old `Home.jsx` is gone from the route
// table (PenumbraHome is the new landing). The mini-apps below will move
// under /projects/<slug> in task #4, but for now they're still reachable
// at their original top-level paths so existing bookmarks and the
// Projects index fallback links keep working.
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import QuickNotes from './pages/QuickNotes.jsx'
import MoodBoards from './pages/MoodBoards.jsx'
import MoodBoard from './pages/MoodBoard.jsx'
import TaskTrackr from './pages/TaskTrackr.jsx'
import AdminPortal from './pages/AdminPortal.jsx'
import Diagnostics from './pages/Diagnostics.jsx'
import ApiGuide from './pages/ApiGuide.jsx'
import Subscribe from './pages/Subscribe.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />}>
            {/* Penumbra Tech marketing surface */}
            <Route index element={<PenumbraHome />} />
            <Route path="services" element={<Services />} />
            <Route path="projects" element={<Projects />} />
            <Route path="projects/diagnostics" element={<DiagnosticsCase />} />
            <Route path="about" element={<About />} />
            <Route path="contact" element={<Contact />} />

            {/* Auth pages */}
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />

            {/* Existing mini-apps. Will move under /projects/<slug> in
                task #4; until then they're still served at their original
                paths so the Projects page's fallback links work. */}
            <Route path="quicknotes" element={<QuickNotes />} />
            <Route path="moodboard" element={<MoodBoards />} />
            <Route path="moodboard/:token" element={<MoodBoard />} />
            <Route path="tasktrackr" element={<TaskTrackr />} />
            <Route path="api-guide" element={<ApiGuide />} />
            <Route path="subscribe" element={<Subscribe />} />

            {/* Admin */}
            <Route path="admin-portal" element={<AdminPortal />} />
            <Route
              path="admin-portal/diagnostics"
              element={<Diagnostics />}
            />

            {/* Backwards-compat redirects */}
            <Route
              path="customer-service"
              element={<Navigate to="/admin-portal" replace />}
            />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
