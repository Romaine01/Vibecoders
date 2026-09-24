import { Megaphone } from "lucide-react";
import { store } from "@/lib/demo-store";
import { AnnouncementRow } from "@/components/ui";
import { announcementTypes, type AnnouncementType } from "@/lib/types";

export default function AnnouncementsPage() {
  const published = store.announcements.filter(
    (item) => !item.status || item.status === "published",
  );

  return (
    <main className="page-main">
      <div className="page-header">
        <div>
          <p className="eyebrow">Community notices</p>
          <h1>Announcements</h1>
          <p>Official announcements, advisories, emergency notices, and service updates.</p>
        </div>
        <Megaphone color="var(--teal)" aria-hidden="true" />
      </div>
      <div className="card card-pad">
        {published.length ? (
          <div className="announcement-list">
            {published.map((item) => (
              <AnnouncementRow key={item.id} {...item} />
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <h3>No announcements yet</h3>
            <p>Official notices from the service desk will appear here.</p>
          </div>
        )}
        <p className="muted small" style={{ marginTop: 14 }}>
          Types:{" "}
          {announcementTypes
            .map((type: AnnouncementType) =>
              type === "service_notice"
                ? "Service notice"
                : type.charAt(0).toUpperCase() + type.slice(1),
            )
            .join(" · ")}
        </p>
      </div>
    </main>
  );
}
