import React, { lazy } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

// Self-hosted brand fonts. Each weight is a separate woff2 that Vite
// bundles into /assets/ with the immutable cache header set in
// nginx — first paint after deploy fetches once, every subsequent
// visit serves from local cache. Beats Google Fonts on privacy (no
// third-party origin trip), CSP simplicity, and offline reliability.
//
// Keep this list aligned with theme.js fontWeights — adding a new
// weight to the theme means adding the matching import here.
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource/inter/700.css'
import '@fontsource/space-grotesk/400.css'
import '@fontsource/space-grotesk/500.css'
import '@fontsource/space-grotesk/600.css'
import '@fontsource/space-grotesk/700.css'
import '@fontsource/jetbrains-mono/400.css'
import '@fontsource/jetbrains-mono/500.css'

import App from './App.jsx'
import { AuthProvider } from './AuthContext.jsx'

// Eager: the marketing landing. Visitors hit / first, so loading it
// statically avoids a paint-then-loader flash on the most-shared URL.
import PenumbraHome from './pages/PenumbraHome.jsx'

// Lazy: every other route. Vite emits one chunk per import() call, so
// the marketing visitor downloads PenumbraHome + the shell and nothing
// else; admin / diagnostics / Stripe / case-study code only loads when
// someone actually navigates to it. Suspense boundary lives in
// Layout.jsx so NavBar + Footer stay rendered during the chunk fetch.
const Services = lazy(() => import('./pages/Services.jsx'))
const About = lazy(() => import('./pages/About.jsx'))
const Contact = lazy(() => import('./pages/Contact.jsx'))
const Projects = lazy(() => import('./pages/Projects.jsx'))
const Stack = lazy(() => import('./pages/Stack.jsx'))
const Blog = lazy(() => import('./pages/Blog.jsx'))
const BlogPost = lazy(() => import('./pages/BlogPost.jsx'))
const Judgment = lazy(() => import('./pages/Judgment.jsx'))
const Guide = lazy(() => import('./pages/Guide.jsx'))
const SaasRescue = lazy(() => import('./pages/SaasRescue.jsx'))
const NotFound = lazy(() => import('./pages/NotFound.jsx'))

const DiagnosticsCase = lazy(() => import('./pages/projects/DiagnosticsCase.jsx'))
const TheoryOfComputationCase = lazy(() => import('./pages/projects/TheoryOfComputationCase.jsx'))
const Repair360Case = lazy(() => import('./pages/projects/Repair360Case.jsx'))
const TrigonometryToolsCase = lazy(() => import('./pages/projects/TrigonometryToolsCase.jsx'))
const MetaverseOriginsCase = lazy(() => import('./pages/projects/MetaverseOriginsCase.jsx'))
const MusicVisualizerCase = lazy(() => import('./pages/projects/MusicVisualizerCase.jsx'))
const AphelionCase = lazy(() => import('./pages/projects/AphelionCase.jsx'))

const Login = lazy(() => import('./pages/Login.jsx'))
const Register = lazy(() => import('./pages/Register.jsx'))
const ForgotPassword = lazy(() => import('./pages/ForgotPassword.jsx'))
const ResetPassword = lazy(() => import('./pages/ResetPassword.jsx'))
const QuickNotes = lazy(() => import('./pages/QuickNotes.jsx'))
const MoodBoards = lazy(() => import('./pages/MoodBoards.jsx'))
const MoodBoard = lazy(() => import('./pages/MoodBoard.jsx'))
const TaskTrackr = lazy(() => import('./pages/TaskTrackr.jsx'))
const AdminPortal = lazy(() => import('./pages/AdminPortal.jsx'))
const Diagnostics = lazy(() => import('./pages/Diagnostics.jsx'))
const ApiGuide = lazy(() => import('./pages/ApiGuide.jsx'))
// Subscribe pulls in @stripe/react-stripe-js which is the single biggest
// dep on the site — splitting it out is the largest single win.
const Subscribe = lazy(() => import('./pages/Subscribe.jsx'))

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
            <Route
              path="projects/theory-of-computation"
              element={<TheoryOfComputationCase />}
            />
            <Route path="projects/repair360-auto" element={<Repair360Case />} />
            <Route
              path="projects/trigonometry-tools"
              element={<TrigonometryToolsCase />}
            />
            <Route
              path="projects/metaverse-origins"
              element={<MetaverseOriginsCase />}
            />
            <Route
              path="projects/music-visualizer"
              element={<MusicVisualizerCase />}
            />
            <Route
              path="projects/aphelion"
              element={<AphelionCase />}
            />
            <Route path="about" element={<About />} />
            <Route path="blog" element={<Blog />} />
            <Route path="blog/:slug" element={<BlogPost />} />
            <Route path="contact" element={<Contact />} />
            <Route path="stack" element={<Stack />} />
            <Route path="judgment" element={<Judgment />} />
            <Route path="guide" element={<Guide />} />
            <Route path="saas-rescue" element={<SaasRescue />} />

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

            {/* Catch-all: any unmatched path under / renders the
                NotFound page. Returns HTTP 200 from nginx (SPA
                fallback is always 200 without SSR), but the visible
                page is an explicit 404 with links to the high-value
                routes. */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
