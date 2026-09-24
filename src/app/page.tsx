import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileText,
  LineChart,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { InstallOneButton } from "@/components/install-one";
import { PolicyLinks } from "@/components/policy-dialog";
import { Brand } from "@/components/ui";

export default function LandingPage() {
  return (
    <main className="landing">
      <header className="site-header">
        <div className="header-inner">
          <Link href="/"><Brand /></Link>
          <nav className="header-nav" aria-label="Public navigation">
            <a href="#how-it-works">How it works</a>
            <a href="#impact">Impact</a>
            <a href="#trust">Trust & safety</a>
          </nav>
          <div className="header-actions">
            <InstallOneButton className="button ghost install-cta" />
            <Link className="button secondary" href="/login">Sign in</Link>
            <Link className="button primary" href="/register">Get started <ArrowRight size={15} /></Link>
          </div>
        </div>
      </header>

      <section className="hero hero-photo">
        <Image className="hero-background" src="/images/tankulan.jpg" alt="" fill priority sizes="100vw" />
        <div className="hero-overlay" />
        <div className="page-width hero-grid">
          <div>
            <p className="eyebrow"><span className="eyebrow-dot" /> Community services, connected</p>
            <h1>Make community action visible.</h1>
            <p className="hero-copy">ONE gives residents a clear way to report needs, request public documents, and follow each outcome from first submission to measurable impact.</p>
            <div className="hero-actions">
              <Link className="button primary" href="/register">Report a concern <ArrowRight size={16} /></Link>
              <Link className="button secondary" href="/login">Open my workspace</Link>
            </div>
            <p className="hero-note"><CheckCircle2 size={15} color="var(--success)" /> Every status change is timestamped and accountable.</p>
          </div>

          <div className="hero-panel">
            <div className="hero-panel-header">
              <div><h2>From need to outcome</h2><p>A simple loop for residents and operations teams.</p></div>
              <LineChart size={19} color="var(--teal)" />
            </div>
            <div className="signal-list">
              <div className="signal"><span className="signal-icon"><ClipboardList size={17} /></span><div><strong>Report</strong><small>Send a concern with location and evidence.</small></div></div>
              <div className="signal"><span className="signal-icon"><MapPin size={17} /></span><div><strong>Track</strong><small>See the live status and timeline.</small></div></div>
              <div className="signal"><span className="signal-icon"><ShieldCheck size={17} /></span><div><strong>Resolve</strong><small>Document the action and completion evidence.</small></div></div>
              <div className="signal"><span className="signal-icon"><LineChart size={17} /></span><div><strong>Measure</strong><small>Count outcomes, not just submissions.</small></div></div>
            </div>
          </div>
        </div>
        <span className="photo-credit">CTTO</span>
      </section>

      <section className="landing-section" id="how-it-works">
        <div className="page-width">
          <div className="section-intro">
            <p className="eyebrow">One connected desk</p>
            <h2>Services designed around the moment that matters.</h2>
            <p>Less guessing for residents. Better context for the people coordinating action. A shared record keeps the whole community moving.</p>
          </div>
          <div className="three-up">
            <div className="feature-tile"><span className="feature-icon"><ClipboardList size={18} /></span><h3>Report with confidence</h3><p>Choose a category, describe the need, add a landmark or current location, and attach photo evidence when it helps.</p></div>
            <div className="feature-tile"><span className="feature-icon"><FileText size={18} /></span><h3>Request what you need</h3><p>Submit common community documents, see processing status, and verify released documents with a public QR-friendly link.</p></div>
            <div className="feature-tile"><span className="feature-icon"><LineChart size={18} /></span><h3>See the work add up</h3><p>Operations teams record assignments and outcomes. The impact view maps completed action to SDG 11 and SDG 16.</p></div>
          </div>
        </div>
      </section>

      <section className="landing-section alt" id="impact">
        <div className="page-width">
          <div className="section-intro">
            <p className="eyebrow">Community impact</p>
            <h2>Measure the work that was actually completed.</h2>
            <p>ONE treats a submission as a need, not an impact claim. Only documented, resolved action contributes to outcome metrics.</p>
          </div>
          <div className="grid-2">
            <div className="card card-pad"><h3>SDG 11 · Sustainable cities and communities</h3><p className="muted small">Track resolved infrastructure, waste, water, safety, environment, and disaster concerns against a healthier, more resilient community.</p></div>
            <div className="card card-pad"><h3>SDG 16 · Peace, justice and strong institutions</h3><p className="muted small">Make response times, completed public services, recorded actions, and audit trails legible to the community.</p></div>
          </div>
        </div>
      </section>

      <section className="landing-section" id="trust">
        <div className="page-width grid-2 trust-grid">
          <div><p className="eyebrow">Built for trust</p><h2>A clear record is a form of care.</h2></div>
          <div><p className="muted trust-copy">Resident records are private by default. Admin actions are role-gated, status changes are validated, evidence is constrained to images, and every important workflow step creates an audit entry.</p><Link className="text-link" href="/register">Start with your workspace <ArrowRight size={14} /></Link></div>
        </div>
      </section>

      <footer className="landing-footer">
        <div className="page-width footer-grid">
          <div className="footer-product"><Brand /><p>ONE — Community Services &amp; Development Platform</p><small>Report. Request. Track. Connect.</small><div className="footer-links"><Link href="/install">Install ONE</Link><PolicyLinks /></div></div>
          <div className="footer-community">
            <p>Community technology partners</p>
            <div className="footer-partner-logos">
              <Image className="footer-devcon-logo" src="/brand/devcon-bukidnon.png" alt="DEVCON Bukidnon" width={1254} height={1254} sizes="120px" />
              <Image className="footer-community-logo" src="/brand/developer-community.png" alt="Developer community mark" width={1317} height={1194} sizes="84px" />
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
