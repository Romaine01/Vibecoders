import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ConcernDetail } from "@/components/concern-detail";

export default async function ResidentConcernPage({ params }: { params: Promise<{ reference: string }> }) { const { reference } = await params; return <main className="page-main"><div className="page-header"><Link className="text-link small" href="/app/activity"><ArrowLeft size={14} style={{ verticalAlign: "middle" }} /> Back to activity</Link></div><ConcernDetail reference={reference} /></main>; }
