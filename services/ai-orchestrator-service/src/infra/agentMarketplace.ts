/**
 * PHASE 13: AGENT MARKETPLACE
 * Agents compete for tasks based on cost + capability
 */

import { listAgents } from "../core/agentRegistry";
import { calculateCost, ResourceType } from "./pricingEngine";

export type MarketOffer = {
  agentId: string;
  type: ResourceType;
  price: number;
  score: number;
};

function getReputation(agent: any): number {
  // normalize reputation (assumes 0 - 1000 scale)
  return Number(agent?.metadata?.reputationScore ?? 0) / 1000;
}

function getCostScore(price: number): number {
  return Math.max(0, 1 - price / 10);
}

export function evaluateMarket(): MarketOffer[] {
  const agents = listAgents();

  return agents.map(a => {
    const type = a.type as ResourceType;
    const price = calculateCost(type, 1);

    const reputation = getReputation(a);
    const costScore = getCostScore(price);

    const score = (reputation * 0.5) + (costScore * 0.5);

    return {
      agentId: a.id,
      type,
      price,
      score
    };
  });
}

export function selectBestAgent(type: ResourceType) {
  const market = evaluateMarket().filter(m => m.type === type);

  return market.sort((a, b) => b.score - a.score)[0];
}
