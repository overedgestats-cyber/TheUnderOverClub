export type FreeScopeFixture = {
  competitionName: string;
  competitionCountry: string | null;
  homeTeamName: string;
  awayTeamName: string;
};

const EURO_COUNTRIES = new Set([
  "England",
  "Scotland",
  "Wales",
  "Northern Ireland",
  "Ireland",
  "Spain",
  "Italy",
  "Germany",
  "France",
  "Portugal",
  "Netherlands",
  "Belgium",
  "Turkey",
  "Greece",
  "Austria",
  "Switzerland",
  "Denmark",
  "Norway",
  "Sweden",
  "Poland",
  "Czech Republic",
  "Slovakia",
  "Slovenia",
  "Croatia",
  "Serbia",
  "Romania",
  "Bulgaria",
  "Hungary",
  "Bosnia and Herzegovina",
  "North Macedonia",
  "Albania",
  "Kosovo",
  "Montenegro",
  "Moldova",
  "Ukraine",
  "Belarus",
  "Finland",
  "Iceland",
  "Estonia",
  "Latvia",
  "Lithuania",
  "Luxembourg",
  "Malta",
  "Cyprus",
  "Georgia",
  "Armenia",
  "Azerbaijan",
  "Faroe Islands",
  "Andorra",
  "San Marino",
  "Gibraltar",
]);

const CUP_TOKENS = [
  "cup",
  "pokal",
  "beker",
  "taça",
  "taca",
  "kup",
  "kupa",
  "cupa",
  "coppa",
  "copa",
  "karik",
  "knvb",
];

const UEFA_TOKENS = [
  "uefa champions league",
  "uefa europa league",
  "uefa conference league",
  "uefa europa conference league",
  "uefa super cup",
];

const DENY_COMPETITION_REGEXES = [
  /\bu-?\s?(14|15|16|17|18|19|20|21|22|23)\b/i,
  /\bu(?:14|15|16|17|18|19|20|21|22|23)\b/i,
  /\byouth\b/i,
  /\bprimavera\b/i,
  /\bjunior(?:en|s)?\b/i,
  /\bacademy\b/i,
  /\breserve(?:s)?\b/i,
  /\bpremier league 2\b/i,
  /\bprofessional development league\b/i,
  /\boberliga\b/i,
  /\bregionalliga\b/i,
  /\b3\.\s*liga\b/i,
  /\biii liga\b/i,
  /\bliga 3\b/i,
  /\bthird division\b/i,
  /\bliga 4\b/i,
  /\bfourth\b/i,
  /\bfifth\b/i,
  /\bamateur\b/i,
  /\bcounty\b/i,
  /\bykkönen\b/i,
  /\b2\.\s*divisj(?:on|ón)\s*avd\b/i,
  /\bwomen(?:'s)?\b/i,
  /\bfeminine\b/i,
  /\bféminine\b/i,
  /\bfemenina\b/i,
  /\bfrauen\b/i,
  /\bdames\b/i,
];

const DENY_TEAM_REGEXES = [
  /\bu-?\s?(14|15|16|17|18|19|20|21|22|23)\b/i,
  /\bu(?:14|15|16|17|18|19|20|21|22|23)\b/i,
  /\byouth\b/i,
  /\bprimavera\b/i,
  /\bjunior(?:en|s)?\b/i,
  /\bacademy\b/i,
  /\breserve(?:s)?\b/i,
  /\bb[- ]?team\b/i,
  /\bii\b/i,
  /\bwomen(?:'s)?\b/i,
  /\bfeminine\b/i,
  /\bféminine\b/i,
  /\bfemenina\b/i,
  /\bfrauen\b/i,
  /\bdames\b/i,
];

const TIER1_PATTERNS = [
  /^premier league$/i,
  /\bpremiership\b/i,
  /\bfirst (professional )?league\b/i,
  /\b1st division\b/i,
  /\bfirst division\b/i,
  /\bsuper\s?lig(?![ae])/i,
  /\bsuper\s?league(?!\s?2)/i,
  /\bbundesliga(?!.*2)/i,
  /\bla\s?liga(?!\s?2)/i,
  /\bserie\s?a\b/i,
  /\bligue\s?1\b/i,
  /\ber(e)?divisie\b/i,
  /\bekstraklasa\b/i,
  /\ballsvenskan\b/i,
  /\beliteserien\b/i,
  /\bsuperliga(?!\s?2)/i,
  /^1\.\s*liga$/i,
  /^1\.\s*lig$/i,
  /\bprva liga\b/i,
  /\bdivision 1\b/i,
];

const TIER2_PATTERNS = [
  /\bchampionship\b/i,
  /\b2\.\s?bundesliga\b/i,
  /\bbundesliga\s?2\b/i,
  /\bla\s?liga\s?2\b/i,
  /\bsegunda(?: división| division)?\b/i,
  /\bsegund\b/i,
  /\bserie\s?b\b/i,
  /\bligue\s?2\b/i,
  /\beerste\s?divisie\b/i,
  /\bliga\s?portugal\s?2\b/i,
  /\bchallenger\s?pro\s?league\b/i,
  /\bchallenge\s?league\b/i,
  /\b1\.\s?lig\b/i,
  /\b2\.\s?liga\b/i,
  /\b2nd division\b/i,
  /\bsecond division\b/i,
  /\bsuperettan\b/i,
  /\bobos\b/i,
  /\bi\s?liga(?!\s?2)/i,
  /\bsuper\s?league\s?2\b/i,
  /\bdivision 2\b/i,
];

function hasToken(
  value: string,
  tokens: string[],
) {
  const normalized =
    value.toLowerCase();

  return tokens.some(
    (token) =>
      normalized.includes(token),
  );
}

function matchesAny(
  value: string,
  patterns: RegExp[],
) {
  return patterns.some(
    (pattern) =>
      pattern.test(value),
  );
}

export function isEligibleFreeFixture(
  fixture: FreeScopeFixture,
): boolean {
  const competition =
    fixture.competitionName ?? "";

  const country =
    fixture.competitionCountry ?? "";

  const combinedTeams =
    `${fixture.homeTeamName} ${fixture.awayTeamName}`;

  if (
    matchesAny(
      competition,
      DENY_COMPETITION_REGEXES,
    )
  ) {
    return false;
  }

  if (
    matchesAny(
      combinedTeams,
      DENY_TEAM_REGEXES,
    )
  ) {
    return false;
  }

  if (
    hasToken(
      competition,
      UEFA_TOKENS,
    )
  ) {
    return true;
  }

  if (
    !EURO_COUNTRIES.has(country)
  ) {
    return false;
  }

  if (
    hasToken(
      competition,
      CUP_TOKENS,
    )
  ) {
    return true;
  }

  return (
    matchesAny(
      competition,
      TIER1_PATTERNS,
    ) ||
    matchesAny(
      competition,
      TIER2_PATTERNS,
    )
  );
}
