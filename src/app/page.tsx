import { Medal, Trophy } from "lucide-react";
import Sidebar from "@/components/Sidebar";

const picks = [
  {
    market: "OVER / UNDER",
    status: "FREE PICK",
    match: "Arsenal vs Chelsea",
    competition: "Premier League",
    kickoff: "20:00",
    selection: "OVER 2.5 GOALS",
    odds: "1.78",
    confidence: "89%",
    analysis:
      "Both teams create a high number of chances and have shown consistent attacking form.",
    tone: "green",
  },
  {
    market: "BTTS",
    status: "FREE PICK",
    match: "Liverpool vs Spurs",
    competition: "Premier League",
    kickoff: "21:00",
    selection: "BTTS YES",
    odds: "1.72",
    confidence: "84%",
    analysis:
      "Both sides regularly score, while neither defence has been consistently reliable.",
    tone: "blue",
  },
  {
    market: "DOUBLE CHANCE",
    status: "PREMIUM",
    match: "Inter vs AC Milan",
    competition: "Serie A",
    kickoff: "21:45",
    selection: "INTER OR DRAW",
    odds: "1.36",
    confidence: "81%",
    analysis:
      "Inter's recent home performances and defensive record support the double-chance market.",
    tone: "orange",
  },
  {
    market: "1X2",
    status: "PREMIUM",
    match: "Real Madrid vs Betis",
    competition: "La Liga",
    kickoff: "22:00",
    selection: "REAL MADRID WIN",
    odds: "1.65",
    confidence: "76%",
    analysis:
      "Real Madrid have the stronger squad, home advantage and superior recent attacking numbers.",
    tone: "purple",
  },
];

export default function PicksPage() {
  return (
    <main className="app-shell">
      <Sidebar />

      <section className="content">
        <header className="topbar panel">
          <div className="top-stat">
            <Trophy size={34} />

            <div>
              <strong>TODAY&apos;S PICKS</strong>
              <span>2 FREE PICKS AVAILABLE</span>
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
            <div className="avatar">🧔</div>

            <div>
              <small>WELCOME,</small>
              <strong>PLAYER1</strong>
            </div>
          </div>
        </header>

        <section className="picks-page-hero panel">
          <div>
            <span className="page-label">DAILY FOOTBALL PICKS</span>
            <h1>TODAY&apos;S PICKS</h1>
            <p>
              Clear selections, tracked results and simple statistical
              reasoning.
            </p>
          </div>

          <div className="picks-date">
            <small>DATE</small>
            <strong>24 JULY 2026</strong>
          </div>
        </section>

        <section className="picks-summary panel">
          <div>
            <strong>4</strong>
            <span>TOTAL PICKS</span>
          </div>

          <div>
            <strong>2</strong>
            <span>FREE PICKS</span>
          </div>

          <div>
            <strong>2</strong>
            <span>PREMIUM PICKS</span>
          </div>

          <div>
            <strong>82.5%</strong>
            <span>AVG. CONFIDENCE</span>
          </div>
        </section>

        <section className="today-picks-section panel">
          <div className="section-header">
            <h2>★ TODAY&apos;S FOOTBALL SELECTIONS</h2>

            <div className="filters">
              <button type="button" className="selected">
                ALL
              </button>

              <button type="button">FREE</button>
              <button type="button">PREMIUM</button>
              <button type="button">OVER / UNDER</button>
              <button type="button">BTTS</button>
            </div>
          </div>

          <div className="today-picks-list">
            {picks.map((pick) => (
              <article
                className={`full-pick-card ${pick.tone}`}
                key={pick.match}
              >
                <div className="full-pick-header">
                  <span>{pick.market}</span>
                  <strong>{pick.status}</strong>
                </div>

                <div className="full-pick-content">
                  <div className="full-pick-match">
                    <div className="full-pick-icon">⚽</div>

                    <div>
                      <small>{pick.competition}</small>
                      <h3>{pick.match}</h3>
                      <span>KICKOFF: {pick.kickoff}</span>
                    </div>
                  </div>

                  <div className="full-pick-selection">
                    <small>OUR PICK</small>
                    <strong>{pick.selection}</strong>
                  </div>

                  <div className="full-pick-numbers">
                    <div>
                      <small>ODDS</small>
                      <strong>{pick.odds}</strong>
                    </div>

                    <div>
                      <small>CONFIDENCE</small>
                      <strong>{pick.confidence}</strong>
                    </div>
                  </div>
                </div>

                <div className="full-pick-meter">
                  <span style={{ width: pick.confidence }} />
                </div>

                <div className="full-pick-analysis">
                  <small>QUICK ANALYSIS</small>
                  <p>{pick.analysis}</p>
                </div>

                <button type="button" className="analysis-button">
                  VIEW FULL ANALYSIS
                </button>
              </article>
            ))}
          </div>
        </section>

        <section className="panel responsible-note">
          <strong>PLAY SMART</strong>
          <p>
            Football predictions are not guaranteed. Only bet what you can
            afford to lose.
          </p>
        </section>
      </section>
    </main>
  );
}