// app/brackets/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import PlayoffBracket from "@/components/playoff-bracket";
import ConfettiEffect from "@/components/confetti-effect";
import { savePredictionsAction } from "@/app/actions"; // Import the server action
// Import necessary types along with the object
import { nbaTeams } from "@/lib/teams-config";

// Import BracketKey type if needed by PlayoffBracket prop type
import type { BracketKey, NbaTeamKey } from "@/lib/teams-config";

export default function BracketsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  // Using Record<string, string> requires checks before indexing nbaTeams
  const [predictions, setPredictions] = useState<Record<string, string>>({});
  // More type-safe option:
  // const [predictions, setPredictions] = useState<Partial<Record<BracketKey, NbaTeamKey>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [championSelected, setChampionSelected] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = localStorage.getItem("userId");
    const storedUserName = localStorage.getItem("userName");
    if (!storedUserId) {
      router.push("/");
      return;
    }
    setUserId(storedUserId);
    setUserName(storedUserName);
  }, [router]);

  // Handle prediction change (ensure key/value are appropriate)
  const handlePredictionChange = (
    matchupId: string | BracketKey,
    teamId: string
  ) => {
    setPredictions((prev) => {
      const newPredictions = { ...prev, [matchupId]: teamId };
      if (matchupId === "F1") {
        setChampionSelected(true);
        setTimeout(() => {
          setShowConfetti(true);
        }, 300);
      }
      return newPredictions;
    });
  };

  // Updated handleSubmit (same as before, relies on Server Action)
  const handleSubmit = async () => {
    if (!userId) {
      setServerError("User not identified. Please go back and register.");
      return;
    }
    if (Object.keys(predictions).length < 15) {
      // Check total predictions = 15 (adjust as needed)
      setServerError("Please complete all matchups before submitting.");
      return;
    }
    if (!predictions.F1) {
      // Explicitly check for champion selection
      setServerError(
        "Please select a champion (winner of F1) before submitting."
      );
      return;
    }

    setIsSubmitting(true);
    setServerError(null);
    const result = await savePredictionsAction(userId, predictions);
    if (result.success) {
      router.push("/summary");
    } else {
      console.error("Server Action Error (savePredictions):", result.error);
      setServerError(result.error || "An unknown error occurred while saving.");
      setIsSubmitting(false); // Only set back if error, success navigates away
    }
    // Don't set isSubmitting false on success as we are navigating away
  };

  // --- Updated getConfettiColors with type checking ---
  const getConfettiColors = () => {
    const championKey = "F1";
    const championTeamId = predictions[championKey]; // string | undefined

    // Check if ID exists and is a valid key in nbaTeams
    if (
      championTeamId &&
      Object.prototype.hasOwnProperty.call(nbaTeams, championTeamId)
    ) {
      // Now it's safe to use championTeamId as a key
      const team = nbaTeams[championTeamId as NbaTeamKey]; // Use assertion after check
      return [team.primaryColor, team.secondaryColor, "#FFD700", "#FFFFFF"];
    }
    return undefined; // Return undefined if champion isn't valid
  };

  if (!userId && typeof window !== "undefined") {
    return (
      <div className="container mx-auto py-10 px-4 text-center">
        Loading user info...
      </div>
    );
  }

  // --- Prepare Champion Data for JSX ---
  const championTeamId = predictions.F1; // string | undefined
  // Check if ID is valid before accessing name
  const isValidChampion =
    championTeamId &&
    Object.prototype.hasOwnProperty.call(nbaTeams, championTeamId);
  const championName = isValidChampion
    ? nbaTeams[championTeamId as NbaTeamKey].name // Assert type after check
    : "a champion"; // Fallback text

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <ConfettiEffect active={showConfetti} teamColors={getConfettiColors()} />
      <header className="sticky top-0 z-40 border-b bg-white dark:bg-gray-950 bg-opacity-95 backdrop-blur supports-[backdrop-filter]:bg-opacity-60">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            NBA Playoff Predictor
          </span>
          {userName && (
            <span className="text-sm text-gray-600 dark:text-gray-300">
              Making predictions as: {userName}
            </span>
          )}
        </div>
      </header>
      <main className="flex-1 container mx-auto py-8 px-4">
        {/* Display Server Error */}
        {serverError && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="my-4 p-3 text-center text-sm font-medium text-red-700 bg-red-100 dark:bg-red-900/30 dark:text-red-300 rounded-md border border-red-300 dark:border-red-700"
          >
            {serverError}
          </motion.div>
        )}

        <h1 className="text-3xl font-bold mb-2 text-center md:text-left text-gray-900 dark:text-white">
          {" "}
          Make Your Playoff Predictions{" "}
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mb-8 text-center md:text-left">
          Click on the team you think will win each matchup. The winners will
          advance to the next round automatically.
        </p>

        <div className="overflow-x-auto pb-6">
          <PlayoffBracket
            onPredictionChange={handlePredictionChange}
            predictions={predictions}
          />
        </div>

        {/* Champion selected message */}
        {championSelected && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 mb-4 text-center"
          >
            <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">
              {/* --- Use the prepared championName variable --- */}
              You've selected {championName} as your champion!
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Ready to submit your predictions?
            </p>
          </motion.div>
        )}

        {/* Submit Button Area */}
        <div className="mt-4 flex justify-center">
          {" "}
          {/* Reduced margin */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <button
              onClick={handleSubmit}
              // Ensure champion is selected and minimum predictions (15 matchups) are met
              disabled={
                isSubmitting ||
                !championSelected ||
                Object.keys(predictions).length < 15
              }
              className={`inline-flex items-center justify-center px-6 py-3 text-base font-medium rounded-md shadow-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
                isSubmitting
                  ? "bg-gray-400 text-gray-700 cursor-wait"
                  : championSelected // Style based on champion selected
                  ? "bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-500"
                  : "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500"
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              {isSubmitting ? "Submitting..." : "Submit My Predictions"}
            </button>
          </motion.div>
        </div>
      </main>
      <footer className="border-t border-gray-200 dark:border-gray-700 py-6 mt-12">
        <div className="container mx-auto text-center text-sm text-gray-500 dark:text-gray-400 px-4">
          © {new Date().getFullYear()} NBA Playoff Predictor
        </div>
      </footer>
    </div>
  );
}
