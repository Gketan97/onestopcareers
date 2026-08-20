import type { ReactNode } from 'react'
import Nav from './Nav'
import Footer from './Footer'

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Nav />
      <div className="flex-1">{children}</div>
      <Footer />
    </div>
  )
}
