import { FileText } from "lucide-react";
import { AdminDocuments } from "@/components/admin-documents";

export default function AdminDocumentsPage() { return <main className="page-main"><div className="page-header"><div><p className="eyebrow">Document management</p><h1>Process public-service requests.</h1><p>Keep each request moving through an explicit status until it is ready to release.</p></div><FileText color="var(--teal)" /></div><AdminDocuments /></main>; }
