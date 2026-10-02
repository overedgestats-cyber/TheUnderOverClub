$ErrorActionPreference = "Stop"

$project = "C:\Users\Marty\Desktop\theunderoverclub"
Set-Location $project

$clientPath = Join-Path $project "src\lib\api-football\client.ts"
$routePath = Join-Path $project "src\app\api\admin\store-paid-analysis\route.ts"

if (-not (Test-Path $clientPath)) {
  throw "Missing file: $clientPath"
}

$client = Get-Content $clientPath -Raw

if ($client -match 'apiFootballFetchWithRateLimit') {
  Write-Host "API-Football rate-limit patch is already installed." -ForegroundColor Yellow
}
else {
  $marker = 'async function apiFootballEnvelope<T>('

  if (-not $client.Contains($marker)) {
    throw "Could not find apiFootballEnvelope<T> marker in client.ts"
  }

  $helper = @'
const API_FOOTBALL_MIN_INTERVAL_MS = 250;

const API_FOOTBALL_RATE_LIMIT_RETRY_DELAYS_MS = [
  5_000,
  15_000,
  30_000,
];

let apiFootballThrottleTail: Promise<void> =
  Promise.resolve();

let apiFootballNextRequestAt = 0;

function apiFootballSleep(
  milliseconds: number,
) {
  return new Promise<void>(
    (resolve) => {
      setTimeout(
        resolve,
        milliseconds,
      );
    },
  );
}

async function reserveApiFootballRequestSlot() {
  let release:
    (() => void) | null =
    null;

  const previous =
    apiFootballThrottleTail;

  apiFootballThrottleTail =
    new Promise<void>(
      (resolve) => {
        release = resolve;
      },
    );

  await previous;

  try {
    const now =
      Date.now();

    const waitMs =
      Math.max(
        0,
        apiFootballNextRequestAt -
          now,
      );

    if (waitMs > 0) {
      await apiFootballSleep(
        waitMs,
      );
    }

    apiFootballNextRequestAt =
      Date.now() +
      API_FOOTBALL_MIN_INTERVAL_MS;
  }
  finally {
    release?.();
  }
}

function isApiFootballRateLimitPayload(
  payload: unknown,
) {
  if (
    !payload ||
    typeof payload !== "object"
  ) {
    return false;
  }

  const errors =
    (
      payload as {
        errors?: unknown;
      }
    ).errors;

  if (!errors) {
    return false;
  }

  const text =
    typeof errors === "string"
      ? errors
      : JSON.stringify(
          errors,
        );

  return /rate\s*limit|ratelimit|too many requests|requests per minute|requests per second/i.test(
    text,
  );
}

function retryAfterMilliseconds(
  response: Response,
  fallback: number,
) {
  const raw =
    response.headers.get(
      "retry-after",
    );

  if (!raw) {
    return fallback;
  }

  const seconds =
    Number(raw);

  if (
    Number.isFinite(seconds) &&
    seconds > 0
  ) {
    return Math.ceil(
      seconds * 1000,
    );
  }

  const date =
    Date.parse(raw);

  if (
    Number.isFinite(date)
  ) {
    return Math.max(
      0,
      date - Date.now(),
    );
  }

  return fallback;
}

async function apiFootballFetchWithRateLimit(
  url: URL,
  apiKey: string,
): Promise<Response> {
  const totalAttempts =
    API_FOOTBALL_RATE_LIMIT_RETRY_DELAYS_MS.length +
    1;

  for (
    let attempt = 0;
    attempt < totalAttempts;
    attempt += 1
  ) {
    await reserveApiFootballRequestSlot();

    const response =
      await fetch(
        url,
        {
          method: "GET",
          headers: {
            "x-apisports-key":
              apiKey,
          },
          cache:
            "no-store",
        },
      );

    let rateLimited =
      response.status === 429;

    if (!rateLimited) {
      const contentType =
        response.headers.get(
          "content-type",
        ) ?? "";

      if (
        contentType.includes(
          "application/json",
        )
      ) {
        try {
          const payload =
            await response
              .clone()
              .json();

          rateLimited =
            isApiFootballRateLimitPayload(
              payload,
            );
        }
        catch {
          // The normal parser below will handle malformed responses.
        }
      }
    }

    if (!rateLimited) {
      return response;
    }

    const isLastAttempt =
      attempt ===
      totalAttempts - 1;

    if (isLastAttempt) {
      return response;
    }

    const fallbackDelay =
      API_FOOTBALL_RATE_LIMIT_RETRY_DELAYS_MS[
        attempt
      ];

    const waitMs =
      retryAfterMilliseconds(
        response,
        fallbackDelay,
      );

    console.warn(
      `[API-Football] Rate limit reached. Retrying in ${waitMs}ms.`,
    );

    await apiFootballSleep(
      waitMs,
    );
  }

  throw new Error(
    "API-Football request retry loop exited unexpectedly.",
  );
}

'@

  $client = $client.Replace(
    $marker,
    $helper + $marker
  )

  $oldFetch = @'
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "x-apisports-key": apiKey,
    },
    cache: "no-store",
  });
'@

  $newFetch = @'
  const response =
    await apiFootballFetchWithRateLimit(
      url,
      apiKey,
    );
'@

  if (-not $client.Contains($oldFetch)) {
    throw "Could not find the expected fetch block in client.ts. No file was changed."
  }

  $client = $client.Replace(
    $oldFetch,
    $newFetch
  )

  Copy-Item $clientPath "$clientPath.before-rate-limit-v1.bak" -Force
  [System.IO.File]::WriteAllText(
    $clientPath,
    $client,
    [System.Text.UTF8Encoding]::new($false)
  )

  Write-Host "Patched src\lib\api-football\client.ts" -ForegroundColor Green
}

if (Test-Path $routePath) {
  $route = Get-Content $routePath -Raw

  if ($route -match 'export const maxDuration\s*=\s*\d+\s*;') {
    $updated = [regex]::Replace(
      $route,
      'export const maxDuration\s*=\s*\d+\s*;',
      'export const maxDuration = 300;'
    )

    if ($updated -ne $route) {
      Copy-Item $routePath "$routePath.before-rate-limit-v1.bak" -Force
      [System.IO.File]::WriteAllText(
        $routePath,
        $updated,
        [System.Text.UTF8Encoding]::new($false)
      )
      Write-Host "Set store-paid-analysis maxDuration to 300 seconds." -ForegroundColor Green
    }
  }
  else {
    Write-Host "No maxDuration declaration found in store-paid-analysis route; left unchanged." -ForegroundColor Yellow
  }
}

Write-Host ""
Write-Host "Patch complete." -ForegroundColor Cyan
Write-Host "Next run: npm run build" -ForegroundColor White
