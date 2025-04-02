// app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";
// Import AdminPrediction type from mongodb library
import { getAllPredictions, type AdminPrediction } from "@/lib/mongodb";
import { nbaTeams, type TeamKey } from "@/lib/teams-config"; // Import TeamKey maybe needed for clarity

// No need for separate local Prediction interfaces if AdminPrediction matches
// interface PredictionUser { ... }
// interface Prediction { ... }

export default function AdminPage() {
  // --- Use AdminPrediction for the state ---
  const [predictions, setPredictions] = useState<AdminPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPredictions = async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch data - assumes it returns Promise<AdminPrediction[]>
        const allPredictions = await getAllPredictions();
        // Set state - No type assertion needed if types match
        setPredictions(allPredictions);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching predictions:", err);
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
        setLoading(false);
      }
    };

    fetchPredictions();
  }, []);

  if (loading) {
    /* ... loading indicator ... */
  }
  if (error) {
    /* ... error message ... */
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="..."> {/* Header content */} </header>
      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">All User Predictions</h1>
        <div className="rounded-lg border ...">
          <div className="p-4 border-b ..."> {/* Table Header Area */} </div>
          <div className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="..."> {/* Table Head */} </thead>
                <tbody>
                  {predictions.map(
                    (
                      prediction // prediction is now AdminPrediction
                    ) => (
                      <tr key={prediction._id} className="...">
                        <td className="px-6 py-4 font-medium">
                          {prediction.userId?.name ?? "Unknown User"}
                        </td>
                        <td className="px-6 py-4">
                          {prediction.userId?.phone ?? "No Phone"}
                        </td>
                        <td className="px-6 py-4">
                          {/* --- Type safe access --- */}
                          {/* prediction.champion is now TeamKey | null */}
                          {prediction.champion && nbaTeams[prediction.champion]
                            ? nbaTeams[prediction.champion].name
                            : "Not Selected"}
                        </td>
                        <td className="px-6 py-4">
                          {new Date(prediction.createdAt).toLocaleString()}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
            {predictions.length === 0 && <div></div>}
          </div>
        </div>
      </main>
      <footer className="border-t py-6"> {/* Footer content */} </footer>
    </div>
  );
}
