import Link from "next/link";
import { Download, ShieldCheck } from "lucide-react";
import { InstallExperience } from "@/components/install-one";
import { Brand } from "@/components/ui";

export default function InstallPage() {
  return (
    <main className="install-page">
      <section className="install-card">
        <Link href="/"><Brand /></Link>
        <div className="install-heading"><span className="install-icon"><Download size={22} /></span><div><p className="eyebrow">ONE on your device</p><h1>Install ONE</h1><p>Keep community services close to your home screen for faster access to reports, documents, and updates.</p></div></div>
        <InstallExperience />
        <div className="notice"><ShieldCheck size={16} />ONE remains an online service. Installation gives you a focused, standalone way to open it; it does not replace emergency services.</div>
        <p className="auth-foot"><Link href="/">← Back to ONE</Link></p>
      </section>
    </main>
  );
}
