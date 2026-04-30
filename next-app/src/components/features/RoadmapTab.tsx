"use client";

import { useRoadmapState, type InitialRoadmapData } from "@/hooks/useRoadmapState";
import { GoalSetupCard } from "./roadmap/GoalSetupCard";
import { ResultHeroCard } from "./roadmap/ResultHeroCard";
import { AlgorithmDialog } from "./roadmap/AlgorithmDialog";
import { ScenarioCard } from "./roadmap/ScenarioCard";

interface RoadmapTabProps {
  initialData?: InitialRoadmapData | null;
  onSwitchTab?: (tab: string) => void;
}

export function RoadmapTab({ initialData, onSwitchTab }: RoadmapTabProps) {
  const { state, actions, computed } = useRoadmapState(initialData);
  const { result, status, maxPossibleGPA, combinations, scenarioText, retakeSuggestions } = computed;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      <div className="lg:col-span-4 sticky top-20 space-y-6 h-fit z-20 self-start">
        <GoalSetupCard state={state} actions={actions} computed={computed} />
      </div>

      <div className="lg:col-span-8 space-y-3">
        <ResultHeroCard
          result={result}
          status={status}
          maxPossibleGPA={maxPossibleGPA}
          targetGPA={state.targetGPA}
          currentCredits={state.currentCredits}
        />
        <AlgorithmDialog
          currentGPA={state.currentGPA}
          currentCredits={state.currentCredits}
          targetGPA={state.targetGPA}
          remainingCredits={state.remainingCredits}
          retakes={state.retakes}
          result={result}
        />
        <ScenarioCard
          scenarioText={scenarioText}
          combinations={combinations}
          result={result}
          retakeSuggestions={retakeSuggestions}
          hasManualData={computed.hasManualData}
          missingScenarios={computed.missingScenarios}
          targetGPA={state.targetGPA}
          totalPointsGap={computed.totalPointsGap}
          onAddRetakeSuggestion={actions.addRetakesFromSuggestion}
          onSwitchTab={onSwitchTab}
        />
      </div>
    </div>
  );
}
