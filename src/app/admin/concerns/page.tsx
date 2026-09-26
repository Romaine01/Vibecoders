import Link from "next/link";
import { Filter } from "lucide-react";
import { listConcerns } from "@/lib/data-store";
import { AdminConcernQueue } from "@/components/admin-concern-queue";

export default async function AdminConcernsPage() { const concerns = await listConcerns(); return <main className="page-main"><div className="page-header"><div><p className="eyebrow">Concern management</p><h1>Review queue</h1><p>Search and open a concern to receive, assign, start work, and resolve it.</p></div><Link className="button secondary" href="/admin"><Filter size={16} /> Overview</Link></div><div className="card card-pad"><AdminConcernQueue concerns={concerns} /></div></main>; }
