$ErrorActionPreference = "Stop"

$project = "C:\Users\Marty\Desktop\theunderoverclub"
Set-Location $project

$pagePath = Join-Path $project "src\app\page.tsx"
$cssPath  = Join-Path $project "src\app\home.module.css"

if (-not (Test-Path $pagePath)) {
  throw "Missing file: $pagePath"
}

if (-not (Test-Path $cssPath)) {
  throw "Missing file: $cssPath"
}

$page = Get-Content $pagePath -Raw
$css  = Get-Content $cssPath -Raw

if ($page -notmatch 'styles\.mobileBottomNav') {
  $marker = @'
        <footer className={styles.footer}>
'@

  if (-not $page.Contains($marker)) {
    throw "Could not find the homepage footer marker. No files were changed."
  }

  $mobileNav = @'
        <nav
          className={styles.mobileBottomNav}
          aria-label="Mobile navigation"
        >
          <Link href="/" className={styles.mobileBottomItem}>
            <span>⌂</span>
            HOME
          </Link>

          <Link href="/today" className={styles.mobileBottomItem}>
            <span>2</span>
            FREE
          </Link>

          <Link href="/paid-picks" className={styles.mobileBottomItem}>
            <span>★</span>
            PAID
          </Link>

          <Link href="/statistics" className={styles.mobileBottomItem}>
            <span>%</span>
            STATS
          </Link>

          <Link
            href={isSignedIn ? "/account" : "/sign-in"}
            className={styles.mobileBottomItem}
          >
            <span>●</span>
            {isSignedIn ? "ACCOUNT" : "SIGN IN"}
          </Link>
        </nav>

'@

  $page = $page.Replace(
    $marker,
    $mobileNav + $marker
  )

  Copy-Item $pagePath "$pagePath.before-mobile-launch-v1.bak" -Force

  [System.IO.File]::WriteAllText(
    $pagePath,
    $page,
    [System.Text.UTF8Encoding]::new($false)
  )

  Write-Host "Added mobile bottom navigation to src\app\page.tsx" -ForegroundColor Green
}
else {
  Write-Host "Mobile navigation is already present in page.tsx" -ForegroundColor Yellow
}

if ($css -notmatch '\.mobileBottomNav') {
  $mobileCss = @'

/* MOBILE LAUNCH V1 */
.mobileBottomNav {
  display: none;
}

.mobileBottomItem {
  text-decoration: none;
}

@media (max-width: 760px) {
  .page {
    padding-bottom: 78px;
  }

  .shell {
    width: calc(100% - 16px);
    padding-top: 8px;
    padding-bottom: 18px;
  }

  .header {
    min-height: 56px;
    padding: 10px 12px;
    box-shadow: 4px 4px 0 rgba(0,0,0,0.35);
  }

  .brand {
    gap: 8px;
    font-size: 9px;
    letter-spacing: 0.1em;
  }

  .brandMark {
    width: 30px;
    height: 30px;
    font-size: 9px;
    box-shadow: 2px 2px 0 #020402;
  }

  .header .nav {
    display: none;
  }

  .hero {
    grid-template-columns: 1fr;
    gap: 10px;
    margin-top: 10px;
    min-height: auto;
  }

  .heroCopy {
    padding: 30px 22px 26px;
    box-shadow: 5px 5px 0 rgba(0,0,0,0.4);
  }

  .eyebrow {
    font-size: 9px;
    line-height: 1.5;
  }

  .hero h1 {
    margin: 20px 0 18px;
    font-size: clamp(58px, 20vw, 88px);
    line-height: 0.82;
  }

  .heroCopy > p {
    font-size: 15px;
    line-height: 1.55;
  }

  .heroActions {
    display: grid;
    grid-template-columns: 1fr;
    gap: 9px;
    margin-top: 24px;
  }

  .primaryButton,
  .secondaryButton {
    width: 100%;
    min-height: 50px;
    box-sizing: border-box;
  }

  .heroMeta {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 6px;
    margin-top: 22px;
  }

  .heroMeta span {
    padding: 8px 6px;
    text-align: center;
    font-size: 7px;
  }

  .pixelStadium {
    min-height: 300px;
    box-shadow: 5px 5px 0 rgba(0,0,0,0.4);
  }

  .scoreboard {
    top: 26px;
    width: 150px;
    padding: 11px 12px;
  }

  .scoreboard strong {
    font-size: 12px;
  }

  .floodlightLeft,
  .floodlightRight {
    top: 8px;
    height: 145px;
    width: 12px;
  }

  .floodlightLeft {
    left: 24px;
  }

  .floodlightRight {
    right: 24px;
  }

  .floodlightLeft::before,
  .floodlightRight::before {
    width: 52px;
    height: 28px;
  }

  .floodlightLeft::before {
    left: -20px;
  }

  .floodlightRight::before {
    right: -20px;
  }

  .stand {
    top: 104px;
    height: 108px;
  }

  .crowd,
  .crowdSecond {
    inset-left: 10px;
    inset-right: 10px;
    height: 34px;
  }

  .crowdSecond {
    top: 58px;
  }

  .pitch {
    left: 8%;
    right: 8%;
    bottom: 14px;
    height: 120px;
  }

  .centerCircle {
    width: 52px;
    height: 52px;
  }

  .goalLeft,
  .goalRight {
    width: 34px;
    height: 65px;
  }

  .section {
    margin-top: 10px;
    padding: 16px;
    box-shadow: 4px 4px 0 rgba(0,0,0,0.34);
  }

  .sectionHeading {
    display: grid;
    grid-template-columns: 1fr;
    gap: 10px;
    margin-bottom: 16px;
  }

  .sectionHeading h2,
  .paidCopy h2 {
    font-size: 34px;
  }

  .sectionDate,
  .textLink {
    font-size: 9px;
  }

  .pickGrid,
  .statsGrid,
  .howSection,
  .paidSection {
    grid-template-columns: 1fr;
  }

  .pickGrid {
    gap: 10px;
  }

  .pickTop,
  .competition,
  .teams {
    padding-left: 16px;
    padding-right: 16px;
  }

  .teams {
    padding-top: 20px;
    padding-bottom: 20px;
  }

  .teams strong {
    font-size: 28px;
  }

  .selection {
    margin: 0 16px 16px;
    padding: 16px !important;
  }

  .selection strong {
    font-size: 22px;
  }

  .pickMetrics div {
    padding: 12px 10px 14px;
  }

  .pickMetrics span {
    font-size: 7px;
  }

  .pickMetrics strong {
    font-size: 17px;
  }

  .sectionFooter {
    align-items: flex-start;
    flex-direction: column;
    gap: 8px;
  }

  .statsGrid {
    gap: 8px;
  }

  .statCard {
    min-height: auto;
    padding: 18px;
  }

  .statCard strong {
    margin-top: 10px;
    font-size: 34px;
  }

  .liveRecord {
    align-items: flex-start;
    flex-wrap: wrap;
  }

  .liveRecord > span:last-child {
    width: 100%;
    margin-left: 18px;
  }

  .paidSection {
    gap: 10px;
    margin-top: 10px;
  }

  .paidCopy,
  .pricePanel {
    box-shadow: 4px 4px 0 rgba(0,0,0,0.34);
  }

  .paidCopy,
  .pricePanel {
    padding: 20px;
  }

  .priceTop {
    padding: 18px;
  }

  .priceTop strong {
    font-size: 48px;
  }

  .howSection {
    margin-top: 10px;
  }

  .howSection > div {
    padding: 20px;
  }

  .footer {
    margin-top: 12px;
    padding: 20px 6px 8px;
    flex-direction: column;
  }

  .footer nav {
    display: none;
  }

  .mobileBottomNav {
    position: fixed;
    z-index: 100;
    left: 8px;
    right: 8px;
    bottom: 8px;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    min-height: 62px;
    border: 1px solid var(--line-strong);
    background: rgba(3, 8, 6, 0.97);
    box-shadow: 5px 5px 0 rgba(0,0,0,0.55);
    backdrop-filter: blur(8px);
  }

  .mobileBottomItem {
    display: grid;
    place-items: center;
    align-content: center;
    gap: 4px;
    min-width: 0;
    border-right: 1px solid var(--line);
    color: #829087;
    text-align: center;
    font-size: 7px;
    font-weight: 900;
    letter-spacing: 0.05em;
  }

  .mobileBottomItem:last-child {
    border-right: 0;
  }

  .mobileBottomItem span {
    display: grid;
    place-items: center;
    width: 20px;
    height: 20px;
    color: var(--green);
    font-size: 11px;
    font-weight: 900;
  }

  .mobileBottomItem:active {
    background: #0b2013;
    color: var(--green);
  }
}

@media (max-width: 390px) {
  .hero h1 {
    font-size: 54px;
  }

  .heroMeta {
    grid-template-columns: 1fr;
  }

  .mobileBottomItem {
    font-size: 6px;
  }
}
'@

  Add-Content -Path $cssPath -Value $mobileCss -Encoding utf8

  Write-Host "Added mobile launch CSS to src\app\home.module.css" -ForegroundColor Green
}
else {
  Write-Host "Mobile CSS is already present in home.module.css" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Mobile launch patch installed." -ForegroundColor Cyan
Write-Host "Now run: npm run build" -ForegroundColor White
