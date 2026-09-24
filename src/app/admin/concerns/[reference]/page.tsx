import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ConcernDetail } from "@/components/concern-detail";

export default async function AdminConcernDetailPage({ params }: { params: Promise<{ reference: string }> }) { const { reference } = await params; return <main className="page-main"><div className="page-header"><Link className="text-link small" href="/admin/concerns"><ArrowLeft size={14} style={{ verticalAlign: "middle" }} /> Back to queue</Link></div><ConcernDetail reference={reference} admin /></main>; }
