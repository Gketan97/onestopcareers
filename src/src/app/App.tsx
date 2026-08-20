import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from '../pages/Home'
import Jobs from '../pages/Jobs'
import JobDetail from '../pages/JobDetail'
// import Alerts from '../pages/Alerts'         // Phase 3
// import Unsubscribe from '../pages/Unsubscribe' // Phase 3
// import AdminJobs from '../pages/AdminJobs'   // Phase 4

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/jobs" element={<Jobs />} />
        <Route path="/jobs/:id" element={<JobDetail />} />

        {/* Reserved — see docs/DESIGN_DOC.md §4 for the full route map.
            Uncomment as each phase ships; do not add ad-hoc routes elsewhere. */}
        {/* <Route path="/alerts" element={<Alerts />} /> */}
        {/* <Route path="/alerts/verify" element={<AlertsVerify />} /> */}
        {/* <Route path="/alerts/unsubscribe" element={<Unsubscribe />} /> */}
        {/* <Route path="/admin" element={<AdminLogin />} /> */}
        {/* <Route path="/admin/jobs" element={<AdminJobs />} /> */}
        {/* <Route path="/admin/jobs/new" element={<AdminJobSubmissionForm />} /> */}

        {/* Future modules — not built yet, routes reserved per design doc §4 */}
        {/* <Route path="/case-studies" element={<CaseStudies />} /> */}
        {/* <Route path="/case-studies/:slug" element={<CaseStudyDetail />} /> */}
        {/* <Route path="/resources" element={<Resources />} /> */}
        {/* <Route path="/referrals" element={<Referrals />} /> */}
      </Routes>
    </BrowserRouter>
  )
}
