import React from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  CheckCircle2,
  Kanban,
  Bell,
  Activity,
  Shield,
  ArrowRight,
  Zap,
} from 'lucide-react';
import { Button } from '../../components/ui/Button.js';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <nav className="border-b border-slate-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-600 text-white shadow-sm">
              <Layers className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900">Kairo</span>
          </div>

          <div className="flex items-center gap-3">
            <Link to="/login">
              <Button variant="ghost" size="sm">
                Sign In
              </Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">
                Get Started
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-20 pb-16 sm:pt-28 sm:pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-brand-200 bg-brand-50/80 px-3.5 py-1 text-xs font-semibold text-brand-700 mb-6">
          <Zap className="h-3.5 w-3.5" />
          Powered by MVC + Event-Driven Architecture
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight max-w-4xl mx-auto leading-tight sm:leading-none">
          Manage modern projects with <span className="text-brand-600">effortless clarity</span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Kairo brings intuitive Kanban boards, real-time collaboration, asynchronous event tracking, and
          reliable notifications together into one cohesive platform.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
          <Link to="/signup">
            <Button size="lg" className="w-full sm:w-auto text-base">
              Start Free Today
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
          <Link to="/login">
            <Button variant="outline" size="lg" className="w-full sm:w-auto text-base">
              Explore Demo Workspace
            </Button>
          </Link>
        </div>

        {/* Product UI Mockup Preview */}
        <div className="mt-14 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl max-w-5xl mx-auto">
          <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-4 sm:p-6 text-left">
            <div className="flex items-center justify-between pb-4 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-red-400" />
                <span className="h-3 w-3 rounded-full bg-amber-400" />
                <span className="h-3 w-3 rounded-full bg-emerald-400" />
                <span className="ml-3 text-xs font-semibold text-slate-600">Mobile App 2.0 Redesign • Kanban Board</span>
              </div>
              <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                Synchronized
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-xl bg-white p-3.5 border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full">To Do</span>
                <p className="mt-2 text-xs font-semibold text-slate-800">Push notifications deep linking integration</p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Due in 2 days</span>
                  <span className="h-5 w-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">E</span>
                </div>
              </div>
              <div className="rounded-xl bg-white p-3.5 border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">In Progress</span>
                <p className="mt-2 text-xs font-semibold text-slate-800">Implement offline-first sync cache with SQLite</p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-amber-600 font-medium">Due tomorrow</span>
                  <span className="h-5 w-5 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center font-bold">M</span>
                </div>
              </div>
              <div className="rounded-xl bg-white p-3.5 border border-slate-200 shadow-xs">
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">Done</span>
                <p className="mt-2 text-xs font-semibold text-slate-800">Architect biometric authentication flow</p>
                <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="text-emerald-600 font-medium">Completed</span>
                  <span className="h-5 w-5 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold">E</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section className="py-20 bg-white border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 tracking-tight">
              Engineered for team performance
            </h2>
            <p className="mt-3 text-slate-600 text-sm sm:text-base">
              A robust architectural foundation combining MVC rigor with reactive event handling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50 hover:border-brand-300 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-brand-100 text-brand-600 flex items-center justify-center mb-4">
                <Kanban className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Fluid Kanban Boards</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Drag and drop tasks between Backlog, Todo, In Progress, Review, and Done with optimistic UI updates and server synchronization.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50 hover:border-brand-300 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
                <Bell className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Event-Driven Workflows</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Domain events decouple assignments, status transitions, and comments into guaranteed transactional outbox notifications.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-200 p-6 bg-slate-50/50 hover:border-brand-300 transition-colors">
              <div className="h-10 w-10 rounded-xl bg-sky-100 text-sky-600 flex items-center justify-center mb-4">
                <Shield className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Enterprise RBAC & Security</h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-600 leading-relaxed">
                Strict workspace authorization, hashed session tokens, CSRF protection, and audit logs prevent cross-workspace leakage.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-slate-100 py-8 text-center text-xs text-slate-500">
        <p>© 2026 Kairo Platform. Production-Minded Project Management Platform.</p>
      </footer>
    </div>
  );
};

export default LandingPage;
