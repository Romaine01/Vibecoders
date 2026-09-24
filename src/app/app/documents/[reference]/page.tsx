import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getDocument } from "@/lib/demo-store";
import { DocumentDetail } from "@/components/document-detail";

export default async function DocumentDetailPage({
  params,
}: {
  params: Promise<{ reference: string }>;
}) {
  const [user, { reference }] = await Promise.all([getCurrentUser(), params]);
  const request = getDocument(reference);
  if (!user || user.role !== "resident" || !request || request.residentId !== user.id) notFound();

  return (
    <main className="page-main">
      <div className="page-header">
        <Link className="back-link" href="/app/activity">
          <ArrowLeft size={16} /> Back to activity
        </Link>
      </div>
      <DocumentDetail reference={reference} />
    </main>
  );
}
