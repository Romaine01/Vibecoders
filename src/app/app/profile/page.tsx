import { getCurrentUser } from "@/lib/auth";
import { ProfilePanel } from "@/components/profile-panel";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  if (!user || user.role !== "resident") return null;

  return (
    <main className="page-main">
      <div className="page-header">
        <div>
          <p className="eyebrow">My profile</p>
          <h1>Resident profile</h1>
          <p>
            Keep your details current so document applications can be completed
            faster.
          </p>
        </div>
      </div>
      <ProfilePanel profile={user} />
    </main>
  );
}
