import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'

import App from './App.jsx'
import { AuthProvider } from './AuthContext.jsx'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import QuickNotes from './pages/QuickNotes.jsx'
import MoodBoards from './pages/MoodBoards.jsx'
import MoodBoard from './pages/MoodBoard.jsx'
import TaskTrackr from './pages/TaskTrackr.jsx'
import CustomerService from './pages/CustomerService.jsx'
import ApiGuide from './pages/ApiGuide.jsx'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="forgot-password" element={<ForgotPassword />} />
            <Route path="reset-password" element={<ResetPassword />} />
            <Route path="quicknotes" element={<QuickNotes />} />
            <Route path="moodboard" element={<MoodBoards />} />
            <Route path="moodboard/:token" element={<MoodBoard />} />
            <Route path="tasktrackr" element={<TaskTrackr />} />
            <Route path="customer-service" element={<CustomerService />} />
            <Route path="api-guide" element={<ApiGuide />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
