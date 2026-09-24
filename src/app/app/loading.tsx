export default function ResidentLoading() {
  return (
    <main className="page-main" aria-busy="true" aria-live="polite">
      <div className="loading-screen">
        <span className="loading-spinner" aria-hidden="true" />
        <div><strong>Loading your workspace</strong><p>Preparing your service records and tools.</p></div>
      </div>
    </main>
  );
}
