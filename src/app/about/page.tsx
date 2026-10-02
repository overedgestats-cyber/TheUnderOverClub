import Link from "next/link";
import { pageMetadata, SITE_URL } from "@/lib/seo/metadata";
import styles from "./page.module.css";

export const metadata = pageMetadata("About Us — Our Football Picks & Method", "Learn how The Under Over Club analyses football, identifies value picks and tracks published wins, losses and ROI transparently.", "/about");
const structuredData = {
  "@context": "https://schema.org", "@type": "AboutPage",
  name: "About The Under Over Club", url: `${SITE_URL}/about`,
  mainEntity: { "@type": "Organization", "@id": `${SITE_URL}/#organization`,
    name: "The Under Over Club", url: SITE_URL,
    logo: `${SITE_URL}/brand/under-over-club-logo.png`,
    email: "theunderoverclub@gmail.com",
    slogan: "Stats. Goals. Profit. In that order." },
};
export default function AboutPage() {
  return <main className={styles.page}>
    <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, "\\u003c") }} />
    <header className={styles.hero}>
      <span>THE STORY BEHIND THE PICKS</span>
      <h1>About The Under Over Club</h1>
      <p className={styles.slogan}>Stats. Goals. Profit. In that order.</p>
      <p>We analyse European football and selected international competitions to find selections where our estimated probability is higher than the probability implied by the available odds.</p>
    </header>
    <div className={styles.grid}>
      <section><h2>Football first. Data behind every pick.</h2><p>Our analysis considers recent team form, home and away performance, scoring patterns and the requirements of each market. We compare model estimates with bookmaker odds to assess potential value. Those estimates express uncertainty; they are never a guarantee.</p></section>
      <section><h2>Free picks and the members’ board</h2><p>Our free selections focus on Over/Under 2.5 goals. When qualifying value is available, you can find them on Today’s Picks. Some days no free selection meets the criteria.</p><p>Members’ picks cover Over/Under 2.5, Both Teams to Score, 1X2 and Double Chance. A listed fixture does not automatically mean there is a recommended bet.</p></section>
      <section><h2>A record that includes the losses</h2><p>Published selections and odds are fixed. After a match finishes, its result is used to settle the selection. Wins, losses, voids and pending picks remain part of the record.</p><p>Our statistics distinguish free and paid recommendations. Win rate uses wins and losses; ROI uses priced settled picks with a fixed one-unit stake. Pending picks do not count as wins or losses.</p><Link href="/statistics">Explore our results →</Link></section>
      <section><h2>Enjoy football responsibly</h2><p>We provide football analysis, not guaranteed returns. Even a carefully researched selection can lose, and past results do not predict future performance. Never stake money you cannot afford to lose.</p><p>The service is intended for adults aged 18 and over.</p><Link href="/responsible-play">Read our responsible-play guidance →</Link></section>
    </div>
    <section className={styles.contact}><h2>Get in touch</h2><p>Questions about the club, your membership or our results?</p><a href="mailto:theunderoverclub@gmail.com">theunderoverclub@gmail.com</a><div className={styles.actions}><Link href="/today">VIEW FREE PICKS</Link><Link href="/subscription">EXPLORE MEMBERSHIP</Link></div></section>
  </main>;
}
