import { Megaphone } from "lucide-react";
import { store } from "@/lib/demo-store";
import { AnnouncementRow } from "@/components/ui";

export default function AnnouncementsPage() { return <main className="page-main"><div className="page-header"><div><p className="eyebrow">Community notices</p><h1>Announcements</h1><p>Stay current on service guidance and local updates.</p></div><Megaphone color="var(--teal)" /></div><div className="card card-pad"><div className="announcement-list">{store.announcements.map((item) => <AnnouncementRow key={item.id} {...item} />)}</div></div></main>; }
