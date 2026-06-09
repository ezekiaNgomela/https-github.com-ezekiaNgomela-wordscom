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

export function evaluateMarket(): MarketOffer[] {
  const agents = listAgents();

  return agents.map(a => {
    const type = a.type as ResourceType;
    const price = calculateCost(type, 1);

    const score = Math.max(0, 1 - price / 10);

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