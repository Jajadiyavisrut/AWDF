import { lazy, Suspense } from 'react'
import { Navigate, Routes, Route } from 'react-router-dom'
import './assets/components/resume.css'
import NavBar from './assets/components/NavBar'
import Footer from './assets/components/footer'
import Home from './assets/components/Home'
import NotFound from './assets/components/NotFound'
import AuthPage from './assets/components/AuthPage'
import ResetPasswordPage from './assets/components/ResetPasswordPage'
import { getToken } from './assets/components/auth'

import DelayedFallback from './assets/components/DelayedFallback'

const Projects = lazy(() => import('./assets/components/Projects'))
const Contact = lazy(() => import('./assets/components/Contact'))
const TodoList = lazy(() => import('./assets/components/TodoList'))

function PageLoader() {
  return (
    <div className="page-loader" role="status" aria-live="polite">
      <span className="page-loader-spinner" aria-hidden="true"></span>
      <p>Loading page...</p>
    </div>
  )
}

function ProtectedRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <div className="page-shell">
      <NavBar />
      <main>
        <Suspense fallback={<DelayedFallback delay={300}><PageLoader /></DelayedFallback>}>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
            <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
            <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
            <Route path="/todo" element={<ProtectedRoute><TodoList /></ProtectedRoute>} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  )
}

export default App
