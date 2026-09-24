export default function AdminLoading() {
  return (
    <main className="page-main" aria-busy="true" aria-live="polite">
      <div className="loading-screen">
        <span className="loading-spinner" aria-hidden="true" />
        <div><strong>Loading operations workspace</strong><p>Preparing current community service records.</p></div>
      </div>
    </main>
  );
}
