'use client'

import Link from 'next/link'
import { Learn2EarnLogo } from '@/components/ui/logo'

export function PublicFooter() {
  return (
    <footer className="bg-[#0F1B3D] text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-3">
              <Learn2EarnLogo variant="white" size="sm" showText={false} />
            </div>
            <p className="text-xs leading-relaxed text-white/50">
              Learn skills, build your career and earn online with expert-led courses, tools and resources.
            </p>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/tools" className="hover:text-white transition-colors">Tools</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/#courses" className="hover:text-white transition-colors">Courses</Link></li>
              <li><Link href="/#pricing" className="hover:text-white transition-colors">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Company</h4>
            <ul className="space-y-2 text-xs">
              <li><a href="#community" className="hover:text-white transition-colors">Community</a></li>
              <li><a href="#instructors" className="hover:text-white transition-colors">Instructors</a></li>
              <li><a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest text-white/40 mb-3">Get Started</h4>
            <ul className="space-y-2 text-xs">
              <li><Link href="/signup" className="hover:text-white transition-colors">Create Account</Link></li>
              <li><Link href="/login" className="hover:text-white transition-colors">Sign In</Link></li>
              <li><Link href="/signup" className="hover:text-white transition-colors">Enroll Now</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] text-white/40">© {new Date().getFullYear()} Learn2Earn. All rights reserved.</p>
          <p className="text-[11px] text-white/40">Learn Skills. Build Career. Earn Online.</p>
        </div>
      </div>
    </footer>
  )
}
