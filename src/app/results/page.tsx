import {
  CheckCircle2,
  Medal,
  MinusCircle,
  Trophy,
  XCircle,
} from "lucide-react";

import Sidebar from "@/components/Sidebar";

const results = [
  {
    date: "23 JUL 2026",
    competition: "Premier League",
    match: "Arsenal vs Chelsea",
    pick: "Over 2.5 Goals",
    odds: "1.78",
    score: "2 - 1",
    result: "WON",
    profit: "+0.78",
  },
  {
    date: "23 JUL 2026",
    competition: "Premier League",
    match: "Liverpool vs Spurs",
    pick: "BTTS Yes",
    odds: "1.72",
    score: "2 - 2",
    result: "WON",
    profit: "+0.72",
  },
  {
    date: "22 JUL 2026",
    competition: "Serie A",
    match: "Inter vs AC Milan",
    pick: "Inter or Draw",
    odds: "1.36",
    score: "0 - 1",
    result: "LOST",
    profit: "-1.00",
  },
  {
    date: "22 JUL 2026",
    competition: "La Liga",
    match: "Real Madrid vs Betis",
    pick: "Real Madrid Win",
    odds: "1.65",
    score: "3 - 0",
    result: "WON",
    profit: "+0.65",
  },
  {
    date: "21 JUL 2026",
    competition: "Bundesliga",
    match: "Dortmund vs Leipzig",
    pick: "Over 2.5 Goals",
    odds: "1.80",
    score: "1 - 1",
    result: "LOST",
    profit: "-1.00",
  },
  {
    date: "21 JUL 2026",
    competition: "Ligue 1",
    match: "PSG vs Marseille",
    pick: "BTTS Yes",
    odds: "1.70",
    score: "2 - 1",
    result: "WON",
    profit: "+0.70",
  },
  {
    date: "20 JUL 2026",
    competition: "Championship",
    match: "Leeds vs Norwich",
    pick: "Over 2.5 Goals",
    odds: "1.74",
    score: "2 - 2",
    result: "WON",
    profit: "+0.74",
  },
  {
    date: "20 JUL 2026",
    competition: "Serie A",
    match: "Roma vs Lazio",
    pick: "BTTS Yes",
    odds: "1.68",
    score: "1 - 1",
    result: "VOID",
    profit: "0.00",
  },
];

function ResultIcon({ result }: { result: string }) {
  if (result === "WON") {
    return <CheckCircle2 size={21} />;
  }

  if (result === "LOST") {
    return <XCircle size={21} />;
  }

  return <MinusCircle size={21} />;
}

export default function ResultsPage() {
  return (
    <main className="app-shell">
      <Sidebar />

      <section className="content">
        <header className="topbar panel">
          <div className="top-stat">
            <Trophy size={34} />

            <div>
              <strong>RESULTS TRACKER</strong>
              <span>EVERY PICK RECORDED</span>
            </div>
          </div>

          <div className="member">
            <Medal size={30} />

            <div>
              <strong>TRANSPARENT</strong>
              <span>PERFORMANCE</span>
            </div>
          </div>

          <div className="welcome">
            <div className="avatar">📊</div>

            <div>
              <small>LAST UPDATED</small>
              <strong>24 JUL 2026</strong>
            </div>
          </div>
        </header>

        <section className="results-hero panel">
          <div>
            <span>VERIFIED PERFORMANCE</span>

            <h1>RESULTS</h1>

            <p>
              Every settled selection is shown here, including wins, losses,
              odds and unit profit.
            </p>
          </div>

          <div className="results-record">
            <small>CURRENT RECORD</small>
            <strong>18W - 7L</strong>
            <span>72% WIN RATE</span>
          </div>
        </section>

        <section className="results-stats panel">
          <article>
            <strong>72%</strong>
            <span>WIN RATE</span>
            <small>LAST 30 DAYS</small>
          </article>

          <article>
            <strong>+8.29</strong>
            <span>UNITS PROFIT</span>
            <small>LAST 30 DAYS</small>
          </article>

          <article>
            <strong>25</strong>
            <span>SETTLED PICKS</span>
            <small>LAST 30 DAYS</small>
          </article>

          <article>
            <strong>13.8%</strong>
            <span>ROI</span>
            <small>LAST 30 DAYS</small>
          </article>
        </section>

        <section className="results-section panel">
          <div className="section-header">
            <h2>★ RECENT RESULTS</h2>

            <div className="filters">
              <button type="button" className="selected">
                ALL
              </button>

              <button type="button">WON</button>
              <button type="button">LOST</button>
              <button type="button">FREE PICKS</button>
              <button type="button">PREMIUM</button>
            </div>
          </div>

          <div className="results-table-wrapper">
            <table className="results-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>MATCH</th>
                  <th>PICK</th>
                  <th>ODDS</th>
                  <th>SCORE</th>
                  <th>RESULT</th>
                  <th>PROFIT</th>
                </tr>
              </thead>

              <tbody>
                {results.map((item) => {
                  let profitClass = "profit-neutral";

                  if (item.profit.startsWith("+")) {
                    profitClass = "profit-positive";
                  }

                  if (item.profit.startsWith("-")) {
                    profitClass = "profit-negative";
                  }

                  return (
                    <tr key={`${item.date}-${item.match}`}>
                      <td>{item.date}</td>

                      <td>
                        <small>{item.competition}</small>
                        <strong>{item.match}</strong>
                      </td>

                      <td>{item.pick}</td>
                      <td>{item.odds}</td>
                      <td>{item.score}</td>

                      <td>
                        <span
                          className={`result-badge ${item.result.toLowerCase()}`}
                        >
                          <ResultIcon result={item.result} />
                          {item.result}
                        </span>
                      </td>

                      <td className={profitClass}>{item.profit}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section className="results-bottom-grid">
          <article className="panel performance-card">
            <h3>BEST MARKET</h3>
            <strong>OVER 2.5 GOALS</strong>
            <span>78% WIN RATE</span>
          </article>

          <article className="panel performance-card">
            <h3>BEST LEAGUE</h3>
            <strong>PREMIER LEAGUE</strong>
            <span>+4.72 UNITS</span>
          </article>

          <article className="panel performance-card">
            <h3>CURRENT STREAK</h3>
            <strong>2 WINS</strong>
            <span>KEEP IT GOING</span>
          </article>
        </section>

        <section className="panel responsible-note">
          <strong>FULL TRANSPARENCY</strong>

          <p>
            Results include winning and losing selections. Past performance
            does not guarantee future results.
          </p>
        </section>
      </section>
    </main>
  );
}