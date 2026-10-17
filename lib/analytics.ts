type AnalyticsWindow = Window & { dataLayer?: unknown[] };

/** Queue events even before the Google script has loaded. Never block checkout. */
export function sendAnalyticsEvent(name: string, parameters: Record<string, unknown>) {
  try {
    const target = window as AnalyticsWindow;
    target.dataLayer = target.dataLayer || [];
    function enqueue(...args: unknown[]) {
      void args;
      // Google gtag expects the arguments object, rather than an array.
      // eslint-disable-next-line prefer-rest-params
      target.dataLayer!.push(arguments);
    }
    enqueue("event", name, { ...parameters, send_to: "G-4BR3XEQRF0" });
  } catch {
    // Analytics is optional; the customer journey must continue.
  }
}
