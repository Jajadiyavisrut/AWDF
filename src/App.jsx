import { Navigate, Routes, Route } from 'react-router-dom'
import './assets/components/resume.css'
import NavBar from './assets/components/NavBar'
import Footer from './assets/components/footer'
import Home from './assets/components/Home'
import Projects from './assets/components/Projects'
import Contact from './assets/components/Contact'
import TodoList from './assets/components/TodoList'
import NotFound from './assets/components/NotFound'
import AuthPage from './assets/components/AuthPage'
import { getToken } from './assets/components/auth'

function ProtectedRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />
}

function App() {
  return (
    <div className="page-shell">
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><Projects /></ProtectedRoute>} />
          <Route path="/contact" element={<ProtectedRoute><Contact /></ProtectedRoute>} />
          <Route path="/todo" element={<ProtectedRoute><TodoList /></ProtectedRoute>} />
          <Route path="/login" element={<AuthPage />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
