import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Jobs from '../pages/Jobs'
import JobDetail from '../pages/JobDetail'
import Companies from '../pages/Companies'
import CompanyProfile from '../pages/CompanyProfile'
import CareerCircle from '../pages/CareerCircle'
import CareerCircleJoin from '../pages/CareerCircleJoin'
import Login from '../pages/Login'
import Saved from '../pages/Saved'
import Privacy from '../pages/Privacy'
import Terms from '../pages/Terms'
// import AdminJobs from '../pages/AdminJobs'   // Phase 4

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:slug" element={<JobDetail />} />
        <Route path="/companies" element={<Companies />} />
        <Route path="/companies/:slug" element={<CompanyProfile />} />
        <Route path="/career-circle" element={<CareerCircle />} />
        <Route path="/career-circle/join" element={<CareerCircleJoin />} />
        <Route path="/login" element={<Login />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/saved" element={<Saved />} />

        {/* Reserved — see docs/DESIGN_DOC.md §4 for the full route map.
            Uncomment as each phase ships; do not add ad-hoc routes elsewhere.
            The WhatsApp job-alerts service (Alerts/Unsubscribe, OTP flow) was
            cut — CareerCircle covers job updates via WhatsApp already. See
            design doc §8. */}
        {/* <Route path="/admin" element={<AdminLogin />} /> */}
        {/* <Route path="/admin/jobs" element={<AdminJobs />} /> */}
        {/* <Route path="/admin/jobs/new" element={<AdminJobSubmissionForm />} /> */}

        {/* Future modules — not built yet, routes reserved per design doc §4.
            Canonical nav (2026-08-23): Jobs, Career Circle (both live),
            Resources, Projects, AI (none live yet). Don't add a route/label
            pair here without also adding it to navConfig.ts — see design
            doc §2 and the home-page-v7 note. */}
        {/* <Route path="/resources" element={<Resources />} /> */}
        {/* <Route path="/projects" element={<Projects />} /> */}
        {/* <Route path="/ai" element={<AI />} /> */}
      </Routes>
    </BrowserRouter>
  )
}
