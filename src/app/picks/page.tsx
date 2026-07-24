const picks = [
  {
    match: "Arsenal vs Chelsea",
    market: "Over / Under",
    selection: "Over 2.5 Goals",
    odds: "1.78",
    confidence: "89%",
    status: "Premium",
  },
  {
    match: "Liverpool vs Spurs",
    market: "BTTS",
    selection: "Both Teams To Score",
    odds: "1.72",
    confidence: "84%",
    status: "Free",
  },
  {
    match: "Inter vs AC Milan",
    market: "Double Chance",
    selection: "Inter or Draw",
    odds: "1.36",
    confidence: "81%",
    status: "Premium",
  },
];

export default function PicksPage() {
  return (
    <main className="simple-page">
      <header className="page-heading">
        <a href="/">← Dashboard</a>
        <div>
          <p>THE UNDER OVER CLUB</p>
          <h1>Today&apos;s Picks</h1>
        </div>
      </header>

      <section className="page-intro">
        <span>23 JULY 2026</span>
        <h2>Today&apos;s Football Selections</h2>
        <p>Data-backed picks, clear markets and tracked results.</p>
      </section>

      <section className="today-picks-grid">
        {picks.map((pick) => (
          <article className="today-pick-card" key={pick.match}>
            <div className="today-pick-top">
              <span>{pick.market}</span>
              <strong>{pick.status}</strong>
            </div>

            <div className="today-pick-ball">⚽</div>

            <h2>{pick.match}</h2>
            <h3>{pick.selection}</h3>

            <div className="today-pick-details">
              <div>
                <small>ODDS</small>
                <strong>{pick.odds}</strong>
              </div>

              <div>
                <small>CONFIDENCE</small>
                <strong>{pick.confidence}</strong>
              </div>
            </div>

            <button>VIEW ANALYSIS</button>
          </article>
        ))}
      </section>
    </main>
  );
}