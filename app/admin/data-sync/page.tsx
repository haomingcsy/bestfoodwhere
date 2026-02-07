"use client";

import { useState, useEffect, useCallback } from "react";

interface FreshnessData {
  freshness: {
    total_restaurants: number;
    verified_24h: number;
    verified_7d: number;
    stale_14d: number;
    never_verified: number;
  };
  verification: {
    pending: number;
  };
  costs: {
    today: Array<{
      api_name: string;
      requests_today: number;
      cost_today_usd: string;
    }>;
    totalToday: number;
  };
  activity: {
    changesLast24h: number;
    closuresLast7d: number;
  };
}

interface SyncStats {
  recentSyncs: Array<{
    id: string;
    sync_type: string;
    sync_source: string;
    status: string;
    started_at: string;
    completed_at: string;
    entities_updated: number;
    entities_failed: number;
  }>;
  statistics: Array<{
    sync_source: string;
    total_syncs: number;
    successful: number;
    failed: number;
  }>;
}

export default function DataSyncDashboard() {
  const [freshness, setFreshness] = useState<FreshnessData | null>(null);
  const [syncStats, setSyncStats] = useState<SyncStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [freshnessRes, syncRes] = await Promise.all([
        fetch("/api/data/freshness?type=summary"),
        fetch("/api/sync/trigger"),
      ]);

      if (freshnessRes.ok) {
        setFreshness(await freshnessRes.json());
      }
      if (syncRes.ok) {
        setSyncStats(await syncRes.json());
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const triggerSync = async (type: "stale" | "full", limit: number) => {
    setSyncing(true);
    setSyncResult(null);

    try {
      const res = await fetch("/api/sync/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, limit }),
      });

      const data = await res.json();

      if (data.success) {
        setSyncResult(
          `Synced ${data.synced} restaurants. ${data.closures?.length || 0} closures detected.`,
        );
        // Refresh data
        fetchData();
      } else {
        setSyncResult(`Sync failed: ${data.error}`);
      }
    } catch (error) {
      setSyncResult("Sync failed: Network error");
    } finally {
      setSyncing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          Data Sync Dashboard
        </h1>
        <div className="flex gap-2">
          <button
            onClick={() => triggerSync("stale", 50)}
            disabled={syncing}
            className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50"
          >
            {syncing ? "Syncing..." : "Sync Stale (50)"}
          </button>
          <button
            onClick={() => triggerSync("full", 100)}
            disabled={syncing}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50"
          >
            Full Refresh
          </button>
        </div>
      </div>

      {syncResult && (
        <div
          className={`p-4 rounded-lg ${syncResult.includes("failed") ? "bg-red-50 text-red-800" : "bg-green-50 text-green-800"}`}
        >
          {syncResult}
        </div>
      )}

      {/* Data Freshness Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">
            Total Restaurants
          </h3>
          <p className="text-3xl font-bold text-gray-900">
            {freshness?.freshness.total_restaurants || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Verified (24h)</h3>
          <p className="text-3xl font-bold text-green-600">
            {freshness?.freshness.verified_24h || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Stale (14d+)</h3>
          <p className="text-3xl font-bold text-yellow-600">
            {freshness?.freshness.stale_14d || 0}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Never Verified</h3>
          <p className="text-3xl font-bold text-red-600">
            {freshness?.freshness.never_verified || 0}
          </p>
        </div>
      </div>

      {/* Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Recent Activity (24h)
          </h2>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Changes Detected</span>
              <span className="text-xl font-semibold">
                {freshness?.activity.changesLast24h || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Closures (7d)</span>
              <span className="text-xl font-semibold text-red-600">
                {freshness?.activity.closuresLast7d || 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Pending Verification</span>
              <span className="text-xl font-semibold text-orange-600">
                {freshness?.verification.pending || 0}
              </span>
            </div>
          </div>
        </div>

        {/* API Costs */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            API Costs Today
          </h2>
          <div className="space-y-3">
            {freshness?.costs.today.map((api) => (
              <div
                key={api.api_name}
                className="flex justify-between items-center"
              >
                <span className="text-gray-600">{api.api_name}</span>
                <div className="text-right">
                  <span className="text-sm text-gray-500 mr-2">
                    {api.requests_today} calls
                  </span>
                  <span className="font-semibold">
                    ${parseFloat(api.cost_today_usd).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
            <div className="pt-3 border-t flex justify-between items-center">
              <span className="font-medium">Total</span>
              <span className="text-xl font-bold text-gray-900">
                ${(freshness?.costs.totalToday || 0).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Syncs */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Recent Syncs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Source
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Failed
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Time
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {syncStats?.recentSyncs.map((sync) => (
                <tr key={sync.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {sync.sync_type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sync.sync_source}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        sync.status === "completed"
                          ? "bg-green-100 text-green-800"
                          : sync.status === "failed"
                            ? "bg-red-100 text-red-800"
                            : sync.status === "running"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {sync.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {sync.entities_updated}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500">
                    {sync.entities_failed}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(sync.started_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {(!syncStats?.recentSyncs ||
                syncStats.recentSyncs.length === 0) && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-4 text-center text-gray-500"
                  >
                    No sync history yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
