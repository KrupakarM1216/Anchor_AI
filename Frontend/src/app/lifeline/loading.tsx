export default function LifelineLoading() {
  return (
    <main className="lifeline-loading" aria-live="polite" aria-busy="true">
      <div>
        <div className="lifeline-spinner" />
        <h1>Opening Lifeline...</h1>
        <p className="active">Preparing your private crisis-support workspace.</p>
      </div>
    </main>
  );
}
