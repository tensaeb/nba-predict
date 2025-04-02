// components/playoff-bracket.tsx

"use client";

import { useState, useEffect, type FC, type ComponentType } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
// Import all necessary types from the config file, including LogoProps
import {
  nbaTeams,
  initialBracket,
  type NbaTeamKey,
  type NBATeam,
  type LogoProps,
} from "@/lib/teams-config";
import { cn } from "@/lib/utils";

// --- Types (consistent import/usage) ---

// MatchupData type remains the same
type MatchupData = {
  round: number;
  matchupId: string; // string OR BracketKey; Consistent type is best
  team1: NbaTeamKey | null;
  team2: NbaTeamKey | null;
  nextMatchup: string | null; // Keep string to align with initialBracket
  winnerPosition: "team1" | "team2" | null;
};

type BracketData = typeof initialBracket; // Keep inferred type

type BracketKey = keyof BracketData;

// MatchupProps must now use NbaTeamKey and ensure Logo rendering
type MatchupProps = {
  matchup: MatchupData; // Use the specific type here
  onTeamSelect: (matchupId: BracketKey, teamId: string) => void; //USe A STRING to ensure code functions - We should not have to rely on code when clicking an button on users and force that interaction is wrong so must use string, other components need rely or can not action well. Can refactor and ensure safe logic instead.
  selectedTeam: NbaTeamKey | null; // selectedTeam can be null or a key
  isFinal?: boolean;
};

// --- Matchup Component ---
// Access nbaTeams using team IDs which are strings or null

const Matchup: FC<MatchupProps> = ({
  matchup,
  onTeamSelect,
  selectedTeam,
  isFinal = false,
}) => {
  // We're storing the *keys* in MatchupData (team1, team2), so use those
  const team1Data: NBATeam | undefined = matchup.team1
    ? nbaTeams[matchup.team1]
    : undefined; // Use 'undefined'
  const team2Data: NBATeam | undefined = matchup.team2
    ? nbaTeams[matchup.team2]
    : undefined;

  // Safely get the Logo components after getting data
  const Team1LogoComponent: ComponentType<LogoProps> | undefined =
    team1Data?.logo;
  const Team2LogoComponent: ComponentType<LogoProps> | undefined =
    team2Data?.logo;

  // Adjust conditional rendering to handle null cases clearly.
  if (!team1Data && !team2Data) {
    return (
      <div className="h-32 flex items-center justify-center text-gray-400 dark:text-gray-500">
        Matchup TBD
      </div>
    );
  }

  return (
    <div
      className={cn(
        "p-2 w-64 transition-all duration-300 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm",
        isFinal ? "scale-110 shadow-lg border-2 border-amber-400" : ""
      )}
    >
      {/* Team 1 Slot */}
      <motion.div
        className={cn(
          "flex items-center p-2 mb-2 rounded-md",
          matchup.team1 // Check if a team exists
            ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" // Mouse interaction
            : "opacity-60 cursor-not-allowed",
          selectedTeam === matchup.team1 // Is team selected?
            ? `bg-opacity-20 dark:bg-opacity-20 border-l-4` // Highlight if selected
            : "" // No special styling
        )}
        style={{
          backgroundColor:
            selectedTeam === matchup.team1 && team1Data
              ? team1Data.primaryColor + "33"
              : undefined,
          borderLeftColor:
            selectedTeam === matchup.team1 && team1Data
              ? team1Data.primaryColor
              : "transparent",
        }}
        onClick={() => {
          // Type guard + make sure matchup.team1 is of type NbaTeamKey is not called when function and typing must enforce by its parents instead by passing. As action functions or user defined set states where type-safety matters it is okay, as components that type is what matter
          if (matchup.team1) {
            onTeamSelect(matchup.matchupId as BracketKey, matchup.team1);
          }
        }}
        whileHover={matchup.team1 ? { scale: 1.02 } : undefined}
        whileTap={matchup.team1 ? { scale: 0.98 } : undefined}
      >
        {/* Display Team 1 */}
        {team1Data && Team1LogoComponent ? ( // Verify Team 1 Data exist
          <>
            <div className="mr-2 h-[40px] w-[40px] flex-shrink-0 flex items-center justify-center">
              {" "}
              {/* Wrapper div for size, prevents logo stretching */}
              <Team1LogoComponent size={36} />
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {team1Data.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                #{team1Data.seed} {team1Data.conference}
              </div>
            </div>
          </>
        ) : (
          <div className="h-10 flex items-center justify-center w-full text-gray-400 dark:text-gray-500">
            TBD
          </div>
        )}
      </motion.div>

      {/* Team 2 Slot */}
      <motion.div
        className={cn(
          "flex items-center p-2 mb-2 rounded-md",
          matchup.team2 // Check if a team exists
            ? "cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700" // Mouse interaction
            : "opacity-60 cursor-not-allowed",
          selectedTeam === matchup.team2 // Is team selected?
            ? `bg-opacity-20 dark:bg-opacity-20 border-l-4` // Highlight if selected
            : "" // No special styling
        )}
        style={{
          backgroundColor:
            selectedTeam === matchup.team2 && team2Data
              ? team2Data.primaryColor + "33"
              : undefined,
          borderLeftColor:
            selectedTeam === matchup.team2 && team2Data
              ? team2Data.primaryColor
              : "transparent",
        }}
        onClick={() => {
          // Type guard + make sure matchup.team2 is of type NbaTeamKey for what will enforce with this, a set time after, you must rely on function props pass it from the user. To guarantee the result and keep on the main result function so user or parent element know what action must be going for
          if (matchup.team2) {
            onTeamSelect(matchup.matchupId as BracketKey, matchup.team2);
          }
        }}
        whileHover={matchup.team2 ? { scale: 1.02 } : undefined}
        whileTap={matchup.team2 ? { scale: 0.98 } : undefined}
      >
        {/* Display Team 2 Logo and Data */}
        {team2Data && Team2LogoComponent ? ( // Verify Team 2 Data exist
          <>
            <div className="mr-2 h-[40px] w-[40px] flex-shrink-0 flex items-center justify-center">
              <Team2LogoComponent size={36} />
            </div>
            <div>
              <div className="font-medium text-gray-900 dark:text-gray-100">
                {team2Data.name}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                #{team2Data.seed} {team2Data.conference}
              </div>
            </div>
          </>
        ) : (
          <div className="h-10 flex items-center justify-center w-full text-gray-400 dark:text-gray-500">
            TBD
          </div>
        )}
      </motion.div>
    </div>
  );
};

// --- PlayoffBracket Props ---
// Strict typing here improves downstream benefits

type PlayoffBracketProps = {
  onPredictionChange: (matchupId: BracketKey, teamId: string) => void; // Corrected to string, and all parts involved

  predictions: Partial<Record<BracketKey, string>>; // all is part of partial and rely user types
};

// --- PlayoffBracket Component ---
export default function PlayoffBracket({
  onPredictionChange,
  predictions,
}: PlayoffBracketProps) {
  const [bracket, setBracket] = useState<BracketData>(initialBracket); // State infers fine, but you type on side props call. Enforce the prop
  const hasChampion: boolean = !!predictions["F1"] || false;

  // In PlayoffBracket component - Update the useEffect
  useEffect(() => {
    // Deep clone initialBracket to avoid mutation
    const newBracket = JSON.parse(
      JSON.stringify(initialBracket)
    ) as BracketData;

    // Iterate through the current predictions
    Object.entries(predictions).forEach(([matchupIdStr, winningTeamIdStr]) => {
      const matchupId = matchupIdStr as BracketKey;
      const winningTeamId = winningTeamIdStr as NbaTeamKey | null; // winningTeamId can be null if prediction is cleared

      // Find the original definition of the matchup being predicted
      const originalMatchup = initialBracket[matchupId];
      if (!originalMatchup || !winningTeamId) return; // Skip if matchup doesn't exist or no winner selected

      // Check if this matchup feeds into a next one
      if (originalMatchup.nextMatchup) {
        const nextMatchupId = originalMatchup.nextMatchup;
        const nextMatchup = newBracket[nextMatchupId]; // Get the corresponding matchup object in our *new* bracket structure

        if (nextMatchup) {
          // --- CORE FIX ---
          // Use the winnerPosition defined in initialBracket for the *current* matchup
          // to determine where the winner goes in the *next* matchup.
          const positionToUpdate = originalMatchup.winnerPosition;

          if (positionToUpdate === "team1") {
            nextMatchup.team1 = winningTeamId; // Assign the actual winning team ID
          } else if (positionToUpdate === "team2") {
            nextMatchup.team2 = winningTeamId; // Assign the actual winning team ID
          }
          // No need for 'else', winnerPosition should always be 'team1' or 'team2' for advancing matchups
        }
      }
    });

    // Update the component's state with the newly calculated bracket
    setBracket(newBracket);
  }, [predictions]); // Re-run whenever predictions change

  // This is now useEffa *typed* event handler, so it must accept known input but no check because string validation will occurs as effect function only for function scope side use
  const handleTeamSelect = (matchupId: BracketKey, teamId: string) => {
    //Now, to keep you and typescript for happy add logic for effect of what to use if change set or side call back action
    //This was changed
    onPredictionChange(matchupId, teamId); //The parent with has this side only type its important type parent is always has and follow

    //Old method- this one doesnt let call this functions as the other side will be complain due high strong logic from all parts. As not allow to have more one way can flow you are enforce. No let you decide as your desition so your approach force all follow a rule this not the real type flow way when its a "Side Effect"/its only set
    /*onPredictionChange(matchupId,  (NbaTeamKey.TeamId) as (NbaTeamKey | null));
          //Validate it is true to make it more happy side or a effect on what you do but side side. We are not using other cases as validation check that you have on it type/the part will break of your system or design code

        } else
           /// here other type you will have this is not used of your test case what for a result. No for see no use, add when will used the right path flow  of validation code you be adding to let it test the all side path with new test-cases. Do the first way the all other and this will easy too if it, ever, see new action its no needed but it just there to you can call on side as action for this you did side a props from father. This  for that for only you never know be back
          alert ("You can set the NbaTeam Key/you set this or just is bad to change now.");*/
  };

  // Inside the PlayoffBracket component (before return statement)
  const getMatchup = (key: BracketKey): MatchupData => {
    return bracket[key];
  };

  return (
    <div className="min-w-[1200px] p-4 overflow-x-auto">
      <div className="flex justify-between mb-4">
        <div className="text-xl font-bold">Eastern Conference</div>
        <div className="text-xl font-bold text-right">Western Conference</div>
      </div>

      <div className="flex justify-between items-start relative">
        {/* Round 1 - East */}
        <div className="flex flex-col gap-6 z-10">
          <Matchup
            matchup={getMatchup("E1")}
            onTeamSelect={handleTeamSelect}
            selectedTeam={predictions["E1"] as NbaTeamKey | null}
          />
          <Matchup
            matchup={getMatchup("E2")}
            onTeamSelect={handleTeamSelect}
            selectedTeam={predictions["E2"] as NbaTeamKey | null}
          />
          <Matchup
            matchup={getMatchup("E3")}
            onTeamSelect={handleTeamSelect}
            selectedTeam={predictions["E3"] as NbaTeamKey | null}
          />
          <Matchup
            matchup={getMatchup("E4")}
            onTeamSelect={handleTeamSelect}
            selectedTeam={predictions["E4"] as NbaTeamKey | null}
          />
        </div>

        {/* Round 2 - East */}
        <div className="flex flex-col gap-12 justify-around mt-[5.5rem] z-10">
          <Matchup
            matchup={getMatchup("E5")}
            onTeamSelect={handleTeamSelect}
            selectedTeam={predictions["E5"] as NbaTeamKey | null}
          />
          <Matchup
            matchup={getMatchup("E6")}
            onTeamSelect={handleTeamSelect}
            selectedTeam={predictions["E6"] as NbaTeamKey | null}
          />
        </div>

        {/* Conference Finals & Finals */}
        <div className="flex flex-col items-center gap-6 justify-center mt-[12rem] z-10">
          <Matchup
            matchup={getMatchup("E7")}
            onTeamSelect={handleTeamSelect}
            selectedTeam={predictions["E7"] as NbaTeamKey | null}
          />
          <div className="text-center font-bold my-4">
            <motion.div
              initial={{ scale: 1 }}
              animate={hasChampion ? { scale: [1, 1.1, 1] } : {}}
              transition={{ repeat: hasChampion ? Infinity : 0, duration: 1.5 }}
              className="text-amber-500 text-lg"
            >
              NBA Finals
            </motion.div>
          </div>
          {/* Ensure F1 matchup data is passed correctly */}
          <Matchup
            matchup={getMatchup("F1")}
            onTeamSelect={handleTeamSelect}
            selectedTeam={predictions["F1"] as NbaTeamKey | null}
            isFinal={true}
          />
          <Matchup
            matchup={getMatchup("W7")}
            onTeamSelect={handleTeamSelect}
            selectedTeam={predictions["W7"] as NbaTeamKey | null}
          />
        </div>

        {/* Round 2 - West */}
        <div className="flex flex-col gap-12 justify-around mt-[5.5rem] z-10">
          <Matchup
            matchup={getMatchup("W5")}
            onTeamSelect={handleTeamSelect}
            selectedTeam={predictions["W5"] as NbaTeamKey | null}
          />
          <Matchup
            matchup={getMatchup("W6")}
            onTeamSelect={handleTeamSelect}
            selectedTeam={predictions["W6"] as NbaTeamKey | null}
          />
        </div>

        {/* Round 1 - West */}
        <div className="flex flex-col gap-6 z-10">
          <Matchup
            matchup={getMatchup("W1")}
            onTeamSelect={handleTeamSelect}
            selectedTeam={predictions["W1"] as NbaTeamKey | null}
          />
          <Matchup
            matchup={getMatchup("W2")}
            onTeamSelect={handleTeamSelect}
            selectedTeam={predictions["W2"] as NbaTeamKey | null}
          />
          <Matchup
            matchup={getMatchup("W3")}
            onTeamSelect={handleTeamSelect}
            selectedTeam={predictions["W3"] as NbaTeamKey | null}
          />
          <Matchup
            matchup={getMatchup("W4")}
            onTeamSelect={handleTeamSelect}
            selectedTeam={predictions["W4"] as NbaTeamKey | null}
          />
        </div>
      </div>
    </div>
  );
}
