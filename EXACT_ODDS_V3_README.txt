THE UNDER OVER CLUB — EXACT ODDS V3

Confirmed production market IDs from the actual API-Football Bet365 fixture feed:

1  = Match Winner
5  = Goals Over/Under
8  = Both Teams Score
12 = Double Chance

Rules:
- Only these exact market IDs are parsed.
- O/U accepts only Over 2.5 and Under 2.5 selections.
- BTTS accepts only Yes and No from market ID 8.
- First-half, second-half, result/BTTS, corners and combination markets are impossible to enter this parser.
- Bet365 (bookmaker ID 8) is the primary displayed odds source.
- If Bet365 has no quote for a selection, the median exact-market quote from other bookmakers is used as fallback.
- /odds pagination is fully fetched before parsing.
- Fair bookmaker probabilities remain de-vigged where possible.
- No recommendation persistence is added by this package.
