import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";
import { DocumentCenter } from "@/components/document-center";

export default function DocumentsPage() { return <main className="page-main"><Link className="back-link" href="/app"><ArrowLeft size={15} /> Back to home</Link><div className="page-header"><div><p className="eyebrow">Public documents</p><h1>Request and track documents.</h1><p>Keep the reference close. When a document is released, it can be verified publicly without exposing resident details.</p></div><FileText color="var(--teal)" /></div><DocumentCenter /></main>; }
