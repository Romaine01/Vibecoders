import { Megaphone } from "lucide-react";
import { ContentManager } from "@/components/content-manager";

export default function AdminContentPage() { return <main className="page-main"><div className="page-header"><div><p className="eyebrow">Content & resources</p><h1>Keep residents informed.</h1><p>Publish concise announcements and maintain the emergency contact list.</p></div><Megaphone color="var(--teal)" /></div><ContentManager /></main>; }
