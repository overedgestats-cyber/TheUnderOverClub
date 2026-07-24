import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Medal,
  Search,
  Trophy,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";

const picks = [
  {
    date: "24 JUL 2026",
    competition: "Premier League",
    match: "Arsenal vs Chelsea",
    kickoff: "20:00",
    market: "Over / Under",
    selection: "Over 2.5 Goals",
    odds: "1.78",
    confidence: "89%",
    access: "FREE",
    status: "UPCOMING",
    tone: "green",
  },
  {
    date: "24 JUL 2026",
    competition: "Premier League",
    match: "Liverpool vs Spurs",
    kickoff: "21:00",
    market: "BTTS",
    selection: "BTTS Yes",
    odds: "1.72",
    confidence: "84%",
    access: "FREE",
    status: "UPCOMING",
    tone: "blue",
  },
  {
    date: "24 JUL 2026",
    competition: "Serie A",
    match: "Inter vs AC Milan",
    kickoff: "21:45",
    market: "Double Chance",
    selection: "Inter or Draw",
    odds: "1.36",
    confidence: "81%",
    access: "PREMIUM",
    status: "UPCOMING",
    tone: "orange",
  },
  {
    date: "23 JUL 2026",
    competition: "La Liga",
    match: "Real Madrid vs Betis",
    kickoff: "22:00",
    market: "1X2",
    selection: "Real Madrid Win",
    odds: "1.65",
    confidence: "76%",
    access: "PREMIUM",
    status: "WON",
    tone: "purple",
  },
  {
    date: "23 JUL 2026",
    competition: "Bundesliga",
    match: "Dortmund vs Leipzig",
    kickoff: "19:30",
    market: "Over / Under",
    selection: "Over 2.5 Goals",
    odds: "1.80",
    confidence: "79%",
    access: "PREMIUM",
    status: "LOST",
    tone: "green",
  },
  {
    date: "22 JUL 2026",
    competition: "Ligue 1",
    match: "PSG vs Marseille",
    kickoff: "21:45",
    market: "BTTS",
    selection: "BTTS Yes",
    odds: "1.70",
    confidence: "82%",
    access: "FREE",
    status: "WON",
    tone: "blue",
  },
];

export default function AllPicksPage() {
  return (
    <main className="app-shell">
      <Sidebar />

      <section className="content">
        <header className="topbar panel">
          <div className="top-stat">
            <Trophy size={34} />

            <div>
              <strong>ALL PICKS</strong>
              <span>COMPLETE PICKS ARCHIVE</span>
            </div>
          </div>

          <div className="member">
            <Medal size={30} />

            <div>
              <strong>PREMIUM</strong>
              <span>MEMBER</span>
            </div>
          </div>

          <div className="welcome">
            <div className="avatar">📚</div>

            <div>
              <small>DATABASE</small>
              <strong>312 PICKS</strong>
            </div>
          </div>
        </header>

        <section className="archive-hero panel">
          <div>
            <span>THE COMPLETE DATABASE</span>
            <h1>ALL PICKS</h1>

            <p>
              Browse current selections, previous predictions and settled
              results from every supported competition.
            </p>
          </div>

          <div className="archive-total">
            <small>TOTAL RECORDED</small>
            <strong>312</strong>
            <span>FOOTBALL PICKS</span>
          </div>
        </section>

        <section className="archive-toolbar panel">
          <label className="archive-search">
            <Search size={20} />

            <input
              type="search"
              placeholder="Search team, league or market..."
            />
          </label>

          <div className="archive-filter-buttons">
            <button type="button" className="selected">
              ALL
            </button>

            <button type="button">UPCOMING</button>
            <button type="button">WON</button>
            <button type="button">LOST</button>
            <button type="button">FREE</button>
            <button type="button">PREMIUM</button>
          </div>

          <button type="button" className="date-filter-button">
            <CalendarDays size={19} />
            DATE
          </button>
        </section>

        <section className="archive-summary panel">
          <article>
            <strong>312</strong>
            <span>TOTAL PICKS</span>
          </article>

          <article>
            <strong>225</strong>
            <span>WON</span>
          </article>

          <article>
            <strong>72.1%</strong>
            <span>WIN RATE</span>
          </article>

          <article>
            <strong>+41.2</strong>
            <span>UNITS PROFIT</span>
          </article>
        </section>

        <section className="archive-section panel">
          <div className="section-header">
            <h2>★ PICKS DATABASE</h2>

            <span className="archive-count">SHOWING 1–6 OF 312</span>
          </div>

          <div className="archive-picks-grid">
            {picks.map((pick) => (
              <article
                className={`archive-pick-card ${pick.tone}`}
                key={`${pick.date}-${pick.match}`}
              >
                <div className="archive-card-header">
                  <span>{pick.market}</span>

                  <strong
                    className={`archive-status ${pick.status.toLowerCase()}`}
                  >
                    {pick.status}
                  </strong>
                </div>

                <div className="archive-card-date">
                  <CalendarDays size={17} />
                  <span>{pick.date}</span>
                  <span>•</span>
                  <span>{pick.kickoff}</span>
                </div>

                <small className="archive-competition">
                  {pick.competition}
                </small>

                <h3>{pick.match}</h3>

                <div className="archive-selection">
                  <small>OUR PICK</small>
                  <strong>{pick.selection}</strong>
                </div>

                <div className="archive-card-numbers">
                  <div>
                    <small>ODDS</small>
                    <strong>{pick.odds}</strong>
                  </div>

                  <div>
                    <small>CONFIDENCE</small>
                    <strong>{pick.confidence}</strong>
                  </div>

                  <div>
                    <small>ACCESS</small>
                    <strong>{pick.access}</strong>
                  </div>
                </div>

                <div className="archive-confidence-meter">
                  <span style={{ width: pick.confidence }} />
                </div>

                <button type="button">VIEW PICK</button>
              </article>
            ))}
          </div>

          <div className="archive-pagination">
            <button type="button" aria-label="Previous page">
              <ChevronLeft size={20} />
            </button>

            <button type="button" className="active">
              1
            </button>

            <button type="button">2</button>
            <button type="button">3</button>
            <span>...</span>
            <button type="button">52</button>

            <button type="button" aria-label="Next page">
              <ChevronRight size={20} />
            </button>
          </div>
        </section>

        <section className="panel responsible-note">
          <strong>TRACKED FROM DAY ONE</strong>

          <p>
            Every published selection remains in the archive after the match
            has been settled.
          </p>
        </section>
      </section>
    </main>
  );
}