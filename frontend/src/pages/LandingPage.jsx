import { useAuth } from '@/hooks/useAuth';
import { Shield, Eye, FileSearch, FileCheck } from '@/components/icons';
import { useNavigate } from 'react-router-dom';
import { VideoHero } from '@/components/ui/video-hero';
import { ShapeContainer } from '@/components/ui/shape-landing-hero';

export default function LandingPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  if (isAuthenticated) {
    navigate('/verify');
    return null;
  }

  const features = [
    {
      icon: Eye,
      title: 'Vision Extraction',
      description: 'Gemini AI reads every field from your UPI screenshot with high accuracy and zero manual entry.',
    },
    {
      icon: FileSearch,
      title: 'Integrity Analysis',
      description: 'Detects font anomalies, timestamp issues, and amount‑word mismatches instantaneously.',
    },
    {
      icon: Shield,
      title: 'Duplicate Detection',
      description: 'Cross‑references against previously submitted receipts to catch reuse and prevent double-spend.',
    },
    {
      icon: FileCheck,
      title: 'Verdict Report',
      description: 'Provides a confidence‑scored verdict with full reasoning and a comprehensive downloadable PDF.',
    },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-[#070612] selection:bg-white/20">
      {/* Top Bar (Absolute floating) */}
      <header className="absolute top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-6 lg:px-12">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
            <Shield className="h-5 w-5 text-white/90" />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">ProofMatch AI</span>
        </div>
        <button
          onClick={login}
          disabled={loading}
          className="rounded-full bg-white/10 px-6 py-2.5 text-sm font-semibold text-white border border-white/20 backdrop-blur-md transition-all hover:bg-white/20 cursor-pointer disabled:opacity-50"
        >
          {loading ? 'Entering...' : 'Sign In'}
        </button>
      </header>

      {/* Background Hero */}
      <VideoHero onLogin={login} disabled={loading} />

      {/* Features */}
      <ShapeContainer
         badge="Platform Capabilities"
         title1="Detect Spoofed Transactions"
         title2="with Forensic Accuracy."
         subtitle="ProofMatch AI instantly extracts transaction fields, checks visual integrity, and verifies against existing records to prevent double-spending and forged UPI receipts."
      >
        <section id="features" className="w-full mt-4">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.02] p-8 transition-all duration-300 hover:bg-white/[0.04] hover:border-white/20"
            >
              <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/10">
                <Icon className="h-6 w-6 text-white/80 transition-transform duration-300 group-hover:scale-110 group-hover:text-white" />
              </div>
              <h3 className="mb-3 text-lg font-medium tracking-tight text-white/90">{title}</h3>
              <p className="text-sm leading-relaxed text-white/50">{description}</p>
            </div>
          ))}
          </div>
        </section>
      </ShapeContainer>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-[#070612] px-6 py-10 text-center">
        <p className="text-xs tracking-wider uppercase text-white/30">
          ProofMatch AI · Google Gen AI Academy APAC Hackathon · Track 1: AI Agents
        </p>
      </footer>
    </div>
  );
}
