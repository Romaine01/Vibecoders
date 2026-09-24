import Link from "next/link";
import { CheckCircle2, ShieldCheck, XCircle } from "lucide-react";
import { publicDocumentVerification } from "@/lib/demo-store";

export default async function VerifyPage({ params }: { params: Promise<{ reference: string }> }) {
  const { reference } = await params;
  const document = publicDocumentVerification(reference);
  return (
    <main className="verify-page">
      <div className="verify-card">
        <div className="brand-lockup compact"><span className="brand-mark">O</span><span>ONE</span></div>
        <div className={`verify-icon ${document ? "success" : "danger"}`}>{document ? <CheckCircle2 size={28} /> : <XCircle size={28} />}</div>
        <p className="eyebrow"><ShieldCheck size={14} /> Public document verification</p>
        <h1>{document ? "Document verified" : "Document not verified"}</h1>
        <p className="muted">{document ? "This reference matches a document issued through the community services desk." : "We could not find a released document matching this reference."}</p>
        {document && <dl className="verification-details"><div><dt>Reference</dt><dd>{document.reference}</dd></div><div><dt>Document type</dt><dd>{document.documentType}</dd></div><div><dt>Issue date</dt><dd>{document.issueDate ? new Date(document.issueDate).toLocaleDateString() : "—"}</dd></div><div><dt>Issuing organization</dt><dd>{document.issuingOrganization}</dd></div></dl>}
        <Link className="button secondary full-width" href="/">Return to ONE</Link>
      </div>
    </main>
  );
}
