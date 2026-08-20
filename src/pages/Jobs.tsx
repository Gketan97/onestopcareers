import Layout from '../components/shell/Layout'
import JobList from '../components/jobs/JobList'

export default function Jobs() {
  return (
    <Layout>
      <div className="max-w-[1040px] mx-auto px-6 md:px-12 py-14">
        <h1 className="font-display text-4xl md:text-[42px]">Jobs</h1>
        <p className="text-text-secondary mt-2.5 text-[15px]">
          Roles across product, engineering, design, data, finance and bizops — refreshed daily.
        </p>
        <div className="mt-8">
          <JobList />
        </div>
      </div>
    </Layout>
  )
}
