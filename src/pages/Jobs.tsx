import Layout from '../components/shell/Layout'
import JobList from '../components/jobs/JobList'

// 2026-08-23: user explicitly confirmed this page publishes EVERY role
// tracked, across every function — not scoped to analytics like the
// homepage preview. No filter-logic changes made here; deeper filtering
// (e.g. an analytics-specific view) is planned for a later build, not
// this one. See design doc §3 home-page-v7 note.
export default function Jobs() {
  return (
    <Layout>
      <div className="max-w-[1040px] mx-auto px-6 md:px-12 py-14">
        <h1 className="font-display text-4xl md:text-[42px]">Jobs</h1>
        <p className="text-text-secondary mt-2.5 text-[15px]">
          Every role we track, across every function — product, engineering,
          design, data, finance and bizops. Refreshed daily.
        </p>
        <div className="mt-8">
          <JobList />
        </div>
      </div>
    </Layout>
  )
}
