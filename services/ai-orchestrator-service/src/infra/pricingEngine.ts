/**
 * PHASE 13: PRICING ENGINE
 * Assigns cost to agent execution and compute usage
 */

export type ResourceType = "executor" | "planner" | "critic" | "memory";

export type PriceCard = {
  resource: ResourceType;
  baseCost: number;
  multiplier: number;
};

const priceTable: Record<ResourceType, PriceCard> = {
  executor: { resource: "executor", baseCost: 1.2, multiplier: 1.5 },
  planner: { resource: "planner", baseCost: 2.0, multiplier: 2.0 },
  critic: { resource: "critic", baseCost: 1.5, multiplier: 1.8 },
  memory: { resource: "memory", baseCost: 0.5, multiplier: 1.2 }
};

export function calculateCost(type: ResourceType, units: number = 1) {
  const price = priceTable[type];
  return price.baseCost * price.multiplier * units;
}

export function getPriceTable() {
  return priceTable;
}