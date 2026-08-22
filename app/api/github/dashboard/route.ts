import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { redis } from "@/lib/cache/redis";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("gittower_github_token")?.value;

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Derive cache key based on token substring
  const tokenHash = Buffer.from(token.slice(0, 16)).toString("hex");
  const cacheKey = `dashboard:user:${tokenHash}`;

  try {
    const { data: dashboardData, fromCache, latencyMs } = await redis.getOrSet(
      cacheKey,
      async () => {
        const headers = {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github.full+json",
        };

        // Helper to fetch search API
        const fetchSearch = async (query: string) => {
          const res = await fetch(`https://api.github.com/search/issues?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=15`, { headers });
          if (!res.ok) throw new Error(`GitHub API error: ${res.statusText}`);
          const data = await res.json();
          return data.items;
        };

        // Fetch notifications
        const fetchNotifications = async () => {
          const res = await fetch(`https://api.github.com/notifications?all=false`, { headers });
          if (!res.ok) return [];
          const notifications = await res.json();
          if (!Array.isArray(notifications)) return [];
          
          const urls = notifications.map(n => n.subject?.url).filter(Boolean).slice(0, 15);
          const items = await Promise.all(
            urls.map(url => fetch(url, { headers }).then(r => r.ok ? r.json() : null))
          );
          
          // Filter out nulls and errors, and normalize to look like Search API issues
          return items.filter(i => i && !i.message).map(i => {
            if (!i.repository_url) {
              if (i.base && i.base.repo) {
                i.repository_url = i.base.repo.url;
              } else if (i.url) {
                i.repository_url = i.url.replace(/\/(issues|pulls)\/\d+$/, '');
              }
            }
            return i;
          });
        };

        // Fetch the 7 categories concurrently
        const [reviewRequested, mentions, myPrs, myIssues, involved, assigned, notifications] = await Promise.all([
          fetchSearch("is:pr is:open review-requested:@me"),
          fetchSearch("is:open mentions:@me"),
          fetchSearch("is:pr author:@me"),
          fetchSearch("is:issue author:@me is:open"),
          fetchSearch("is:open involves:@me -author:@me"),
          fetchSearch("is:open assignee:@me"),
          fetchNotifications(),
        ]);

        return {
          reviewRequested,
          mentions,
          myPrs,
          myIssues,
          involved,
          assigned,
          notifications,
        };
      },
      60 // 60 seconds TTL in Redis
    );

    const response = NextResponse.json(dashboardData);
    response.headers.set("X-Cache-Lookup", fromCache ? "HIT" : "MISS");
    response.headers.set("X-Cache-Latency", `${latencyMs}ms`);
    return response;
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    return NextResponse.json({ error: "Failed to fetch dashboard data" }, { status: 500 });
  }
}
