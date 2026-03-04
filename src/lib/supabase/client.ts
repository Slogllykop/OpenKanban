/** biome-ignore-all lint/style/noNonNullAssertion: Manually verified */
import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  let client: ReturnType<typeof createBrowserClient>;

  client = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLIC_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      realtime: {
        worker: true,
        heartbeatCallback: (status) => {
          if (status === "disconnected") {
            client?.realtime?.connect();
          }
        },
      },
    },
  );

  return client;
}
