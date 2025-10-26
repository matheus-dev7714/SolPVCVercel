import { useEffect, useState } from "react";
import type { PoolListItem } from "@/types/pve";
import { PoolCard } from "@/components/pool-card";
import { RunnerCard } from "@/components/runner-card";
import { WalletDisplay } from "@/components/wallet-display";

const topRunners = [
  { token: "BONK", roi: "+234%", volume: "1.2M SOL", status: "RESOLVED" as const },
  { token: "WIF", roi: "+189%", volume: "890K SOL", status: "RESOLVED" as const },
  { token: "PEPE", roi: "+156%", volume: "2.1M SOL", status: "RESOLVED" as const },
];

export default function Index() {
  const [aiPools, setAiPools] = useState<PoolListItem[]>([]);
  const [marketPools, setMarketPools] = useState<PoolListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPools() {
      try {
        const response = await fetch("/api/pools/top");
        if (response.ok) {
          const allPools: PoolListItem[] = await response.json();
          setAiPools(allPools.filter((p) => p.pool_type === "PvAI"));
          setMarketPools(allPools.filter((p) => p.pool_type !== "PvAI"));
        } else {
          // Use fallback pools
          useFallbackPools();
        }
      } catch (error) {
        console.error("Failed to fetch pools:", error);
        useFallbackPools();
      } finally {
        setLoading(false);
      }
    }

    function useFallbackPools() {
      const now = Math.floor(Date.now() / 1000);
      
      const fallbackAIPools: PoolListItem[] = [
        {
          id: 8,
          token: "POPCAT",
          mint: "POPCAT_DEV_AI_MINT_000000000000000000008",
          logo: null,
          line_bps: 260,
          confidence: 0.88,
          lock_ts: now - 1200,
          end_ts: now + 2 * 3600,
          totals: { over: 12_000_000_000, under: 11_000_000_000 },
          status: "OPEN",
          pool_type: "PvAI",
          ai: { confidence: 0.88, model: "pve-v0.3.0", commit: "0xPOPCAT_AI_FALLBACK", payload_url: null },
        },
        {
          id: 1,
          token: "BONK",
          mint: "DezXAZ8z7PnrnRJjz3wXBoRgixCa6xjnB7YaB1pPB263",
          logo: null,
          line_bps: 300,
          confidence: 0.61,
          lock_ts: now + 4 * 3600,
          end_ts: now + 8 * 3600,
          totals: { over: 34_000_000_000, under: 29_000_000_000 },
          status: "OPEN",
          pool_type: "PvAI",
          ai: { confidence: 0.61, model: "pve-v0.3.0", commit: "0xA1B2...ABCD", payload_url: null },
        },
        {
          id: 9,
          token: "WIF",
          mint: "WIF_DEV_AI_MINT_000000000000000000009",
          logo: null,
          line_bps: 180,
          confidence: 0.62,
          lock_ts: now + 3 * 3600,
          end_ts: now + 7 * 3600,
          totals: { over: 8_000_000_000, under: 7_000_000_000 },
          status: "OPEN",
          pool_type: "PvAI",
          ai: { confidence: 0.62, model: "pve-v0.3.0", commit: "0xWIF_AI_FALLBACK", payload_url: null },
        },
      ];

      const fallbackMarketPools: PoolListItem[] = [
        {
          id: 3,
          token: "POPCAT",
          mint: "7GCihgDB8fe6KNjn2MYtkzZcRjQy3t9GHdC8uHYmW2hr",
          logo: null,
          line_bps: null,
          confidence: 0,
          lock_ts: now + 3 * 3600,
          end_ts: now + 6 * 3600,
          totals: { over: 52_000_000_000, under: 48_000_000_000 },
          status: "OPEN",
          pool_type: "PvMarket",
          ai: null,
        },
        {
          id: 4,
          token: "MEW",
          mint: "MEW1gQWJ3nEXg2qgERiKu7FAFj79PHvQVREQUzScPP5",
          logo: null,
          line_bps: null,
          confidence: 0,
          lock_ts: now + 2 * 3600,
          end_ts: now + 5 * 3600,
          totals: { over: 24_000_000_000, under: 26_000_000_000 },
          status: "OPEN",
          pool_type: "PvMarket",
          ai: null,
        },
        {
          id: 2,
          token: "WIF",
          mint: "EKpQGSJtjMFqKZ9KQanSqYXRcF8fBopzLHYxdM65zcjm",
          logo: null,
          line_bps: null,
          confidence: 0,
          lock_ts: now - 1800,
          end_ts: now + 3600,
          totals: { over: 18_000_000_000, under: 24_000_000_000 },
          status: "OPEN",
          pool_type: "PvMarket",
          ai: null,
        },
      ];

      setAiPools(fallbackAIPools);
      setMarketPools(fallbackMarketPools);
    }

    fetchPools();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-muted-foreground">Loading pools...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-border/50 backdrop-blur-sm sticky top-0 z-50 bg-background/80">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-bold tracking-tight">solPVE</h1>
              <p className="text-sm text-muted-foreground hidden md:block">
                PVE Runners for the people
              </p>
            </div>
            <WalletDisplay />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-12">
        <section>
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight">Top Runners</h2>
            <p className="text-sm text-muted-foreground">Highest ROI pools this week</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topRunners.map((runner) => (
              <RunnerCard key={runner.token} runner={runner} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight">Versus AI</h2>
            <p className="text-sm text-muted-foreground">
              Dynamic AI target (updates periodically before lock)
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {aiPools.map((pool) => (
              <PoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        </section>

        <section>
          <div className="mb-6">
            <h2 className="text-xl font-bold tracking-tight">Versus Market</h2>
            <p className="text-sm text-muted-foreground">
              Static AI target (single-line prediction)
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {marketPools.map((pool) => (
              <PoolCard key={pool.id} pool={pool} />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}


