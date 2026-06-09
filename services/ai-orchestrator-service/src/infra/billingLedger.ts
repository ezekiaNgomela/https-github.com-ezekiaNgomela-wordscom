/**
 * PHASE 13: BILLING LEDGER
 * Tracks system-wide compute usage and costs
 */

import { calculateCost, ResourceType } from "./pricingEngine";

export type LedgerEntry = {
  timestamp: number;
  resource: ResourceType;
  units: number;
  cost: number;
  metadata?: any;
};

const ledger: LedgerEntry[] = [];

export function charge(resource: ResourceType, units: number, metadata?: any) {
  const cost = calculateCost(resource, units);

  const entry: LedgerEntry = {
    timestamp: Date.now(),
    resource,
    units,
    cost,
    metadata
  };

  ledger.push(entry);
  return entry;
}

export function getLedger() {
  return ledger;
}

export function getTotalCost() {
  return ledger.reduce((sum, e) => sum + e.cost, 0);
}