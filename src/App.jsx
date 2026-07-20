import { Routes, Route } from 'react-router-dom'
import './assets/components/resume.css'
import NavBar from './assets/components/NavBar'
import Footer from './assets/components/footer'
import Home from './assets/components/Home'
import Projects from './assets/components/Projects'
import Contact from './assets/components/Contact'
import NotFound from './assets/components/NotFound'

function App() {
  return (
    <div className="page-shell">
      <NavBar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}

export default App
