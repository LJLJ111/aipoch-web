/** Parsed `raw_result_json` structure for leaderboard result details; see the `_reference` example. */
export interface LeaderboardMeta {
  skill_name: string;
  category: string;
  skill_description?: string;
  evaluated_on?: string;
  evaluator_version?: string;
  description?: string | null;
  execution_mode?: string;
  complexity?: string;
  n_inputs?: string;
}

export interface LeaderboardStaticCategory {
  score: number;
  max: number;
  note: string;
}

export type LeaderboardStaticCategories = Record<
  string,
  LeaderboardStaticCategory
>;

export interface LeaderboardStaticScore {
  subtotal: number;
  max: number;
  categories: LeaderboardStaticCategories;
}

export interface LeaderboardDynamicAssertion {
  text?: string;
  result?: string;
  note?: string;
}

export interface LeaderboardDynamicInput {
  total: number;
  label: string;
  type?: string;
  status_flag?: string;
  assertions_passed: number;
  assertions_total: number;
  note?: string;
  basic?: number;
  basic_max?: number;
  specialized?: number;
  specialized_max?: number;
  assertions?: LeaderboardDynamicAssertion[];
}

export interface LeaderboardDynamicScore {
  execution_avg: number;
  max: number;
  assertion_pass_rate: { passed: number; total: number };
  inputs: LeaderboardDynamicInput[];
}

export interface LeaderboardSkillVeto {
  stability: string;
  contract: string;
  determinism: string;
  security: string;
}

export interface LeaderboardResearchDimension {
  result: string;
  detail: string;
}

export interface LeaderboardResearchVeto {
  applicable: boolean;
  gate?: string;
  scientific_integrity?: LeaderboardResearchDimension;
  practice_boundaries?: LeaderboardResearchDimension;
  methodological_ground?: LeaderboardResearchDimension;
  code_usability?: LeaderboardResearchDimension;
}

export interface LeaderboardVetoGates {
  skill_veto: LeaderboardSkillVeto;
  research_veto: LeaderboardResearchVeto;
}

export interface LeaderboardFinal {
  score: number;
  max: number;
  static_weighted: number;
  dynamic_weighted: number;
}

export interface LeaderboardEvaluationPayload {
  meta: LeaderboardMeta;
  veto_gates: LeaderboardVetoGates;
  static_score: LeaderboardStaticScore;
  dynamic_score: LeaderboardDynamicScore;
  final: LeaderboardFinal;
  key_strengths: string[];
  recommendations?: unknown;
}
