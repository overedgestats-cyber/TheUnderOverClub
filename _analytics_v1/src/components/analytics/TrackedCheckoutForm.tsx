"use client";

import type {
  FormEvent,
} from "react";

import {
  trackEvent,
} from "@/lib/analytics/client";

const PLAN_VALUES:
  Record<string, number> = {
    daily: 2.49,
    weekly: 6.99,
    monthly: 17.99,
    yearly: 119.99,
  };

export default function TrackedCheckoutForm({
  plan,
  label,
}: {
  plan: string;
  label: string;
}) {
  function onSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    const form =
      event.currentTarget;

    event.preventDefault();

    trackEvent(
      `${plan}_plan_click`,
      {
        plan,
        value:
          PLAN_VALUES[
            plan
          ] ?? 0,
        currency:
          "EUR",
      },
    );

    trackEvent(
      "checkout_started",
      {
        plan,
        value:
          PLAN_VALUES[
            plan
          ] ?? 0,
        currency:
          "EUR",
      },
    );

    window.setTimeout(
      () => {
        form.submit();
      },
      180,
    );
  }

  return (
    <form
      action="/api/billing/checkout"
      method="post"
      onSubmit={onSubmit}
    >
      <input
        type="hidden"
        name="plan"
        value={plan}
      />

      <button type="submit">
        {label}
      </button>
    </form>
  );
}
