// app/summary/page.tsx
"use client";

import { useEffect, useState, type FC, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { getPredictionsAction } from "@/app/actions";
import { Share2 } from "lucide-react";
import ConfettiEffect from "@/components/confetti-effect";
import {
  nbaTeams,
  type NBATeam,
  type NbaTeamKey,
  LogoProps,
} from "@/lib/teams-config";
import Image from "next/image";

// Type guard to validate keys
function isValidTeamKey(key: string | null | undefined): key is NbaTeamKey {
  return key ? Object.prototype.hasOwnProperty.call(nbaTeams, key) : false;
}

export default function SummaryPage() {
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [predictions, setPredictions] = useState<Record<string, string>>({});
  const [championKey, setChampionKey] = useState<NbaTeamKey | null>(null);
  const [loading, setLoading] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId =
      typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    const storedUserName =
      typeof window !== "undefined" ? localStorage.getItem("userName") : null;

    if (!storedUserId) {
      router.push("/");
      return;
    }

    setUserId(storedUserId);
    setUserName(storedUserName);

    const fetchPredictions = async () => {
      setLoading(true);
      setServerError(null);

      if (!storedUserId) return;

      try {
        const result = await getPredictionsAction(storedUserId);

        if (result.success) {
          const userPredictions = result.predictions || {};
          setPredictions(userPredictions);

          const potentialChampionId = userPredictions["F1"];
          if (isValidTeamKey(potentialChampionId)) {
            setChampionKey(potentialChampionId);
            setTimeout(() => setShowConfetti(true), 500);
          }
        } else {
          console.error("Server Action Error:", result.error);
          setServerError(result.error || "Failed to load prediction data.");
        }
      } catch (error) {
        console.error("Error fetching predictions:", error);
        setServerError("An unexpected error occurred.");
      } finally {
        setLoading(false);
      }
    };

    fetchPredictions();
  }, [router]);

  const championData: NBATeam | undefined = championKey
    ? nbaTeams[championKey]
    : undefined;
  const ChampionLogoComponent: ComponentType<LogoProps> | undefined =
    championData?.logo;

  const getConfettiColors = () => {
    return championData
      ? [
          championData.primaryColor,
          championData.secondaryColor,
          "#FFD700",
          "#FFFFFF",
        ]
      : undefined;
  };

  const handleShare = () => {
    const championName = championData ? championData.name : "a team";
    const shareText = `I predicted ${championName} to win the NBA Championship! Make your own predictions at NBA Playoff Predictor.`;

    if (navigator.share) {
      navigator
        .share({
          title: "My NBA Playoff Predictions",
          text: shareText,
          url: window.location.href,
        })
        .catch((error) => console.log("Error sharing", error));
    } else {
      navigator.clipboard
        .writeText(`${shareText} ${window.location.href}`)
        .then(() => alert("Prediction link copied to clipboard!"))
        .catch(() =>
          alert(
            "Share this prediction: " + shareText + " " + window.location.href
          )
        );
    }
  };

  const handleStartOver = () => {
    router.push("/brackets");
  };

  if (loading) {
    return <div className="text-center py-10">Loading your predictions...</div>;
  }

  if (serverError) {
    return <div className="text-center py-10 text-red-500">{serverError}</div>;
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-50 dark:bg-gray-900">
      <ConfettiEffect
        active={!!championKey && showConfetti}
        teamColors={getConfettiColors()}
        duration={8000}
      />

      <header className="..."> {/* Header */} </header>

      <main className="flex-1 container mx-auto py-8 px-4">
        <h1 className="...">Your NBA Playoff Predictions Summary</h1>

        {championData && ChampionLogoComponent ? (
          <motion.div className="mb-8">
            <div className="relative overflow-hidden">
              <div
                className="absolute inset-0"
                style={{ backgroundColor: championData.primaryColor }}
              />
              <div className="relative z-10 p-4">
                <h3 className="...">Prediction</h3>
              </div>
              <div className="relative z-10 p-6">
                <motion.div className="mb-4">
                  <ChampionLogoComponent size={150} />
                </motion.div>
                <h2 className="...">{championData.name}</h2>
                <p className="...">
                  #{championData.seed} {championData.conference}ern Conference
                </p>
                <div className="mt-6">
                  <motion.div>
                    <Image
                      src="/trophy.png"
                      width={100}
                      height={100}
                      alt="Trophy"
                    />
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>
        ) : (
          <p className="text-center">No champion prediction found.</p>
        )}

        {Object.keys(predictions).length > 0 && (
          <h2 className="...">Your Matchup Winners</h2>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          {!loading && Object.keys(predictions).length === 0 && (
            <p className="text-center">You haven't made any predictions yet.</p>
          )}

          {Object.entries(predictions)
            .sort()
            .map(([matchupId, teamId]) => {
              if (!isValidTeamKey(teamId)) {
                console.warn(`Invalid key: ${teamId} for ${matchupId}`);
                return null;
              }
              const teamData = nbaTeams[teamId];
              const LogoComponent = teamData.logo;
              if (!LogoComponent) return null;

              return (
                <motion.div key={matchupId}>
                  <div className="flex flex-col">
                    <div className="p-3 border-b">
                      <h3>{matchupId} - ...</h3>
                    </div>
                    <div className="p-4 flex-grow flex items-center">
                      <div className="mr-3">
                        <LogoComponent size={36} />
                      </div>
                      <div>
                        <div>{teamData.name}</div>
                        <div>
                          {teamData.seed} {teamData.conference}
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
        </div>

        <div className="flex flex-col sm:flex-row">
          <button onClick={handleShare} className="mr-4">
            <Share2 /> Share
          </button>
          <button onClick={handleStartOver}>Start Over</button>
        </div>
      </main>

      <footer className="border-t py-6 mt-12">{/* Footer */}</footer>
    </div>
  );
}
