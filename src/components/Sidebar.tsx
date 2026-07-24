"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  CircleUserRound,
  Gamepad2,
  Globe2,
  Home,
  List,
  LogOut,
  Medal,
  Star,
  Trophy,
} from "lucide-react";

const menuItems = [
  {
    label: "Dashboard",
    icon: Home,
    href: "/",
  },
  {
    label: "Today's Picks",
    icon: Star,
    href: "/picks",
  },
  {
    label: "All Picks",
    icon: List,
    href: "/all-picks",
  },
  {
    label: "Results",
    icon: Trophy,
    href: "/results",
  },
  {
    label: "Statistics",
    icon: BarChart3,
    href: "/statistics",
  },
  {
    label: "Leagues",
    icon: Globe2,
    href: "/leagues",
  },
  {
    label: "Penalty Game",
    icon: Gamepad2,
    href: "/penalty-game",
  },
  {
    label: "Subscription",
    icon: Medal,
    href: "/subscription",
  },
  {
    label: "Account",
    icon: CircleUserRound,
    href: "/account",
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar panel">
      <Link href="/" className="brand">
        <div className="brand-ball">⚽</div>

        <div>
          <small>THE</small>

          <strong>
            UNDER
            <br />
            <span>OVER</span>
          </strong>

          <small>CLUB ★★★</small>
        </div>
      </Link>

      <nav className="menu" aria-label="Main navigation">
        {menuItems.map(({ label, icon: Icon, href }) => {
          const isActive =
            href === "/"
              ? pathname === "/"
              : pathname === href || pathname.startsWith(`${href}/`);

          return (
            <Link
              key={label}
              href={href}
              className={isActive ? "active" : ""}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <section className="upgrade-card">
        <h3>LEVEL UP</h3>

        <div className="cup">🏆</div>

        <p>Upgrade to premium to unlock all picks &amp; features.</p>

        <Link href="/subscription" className="upgrade-button">
          UPGRADE NOW
        </Link>
      </section>

      <button type="button" className="logout-button">
        <LogOut size={20} />
        <span>Logout</span>
      </button>
    </aside>
  );
}