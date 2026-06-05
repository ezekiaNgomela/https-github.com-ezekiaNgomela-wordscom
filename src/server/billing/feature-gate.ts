// Phase 29.0 - Monetization Layer: Feature Gating System
// Controls premium vs free access, AI limits, and workspace capabilities

import { User } from "../auth/user.model";

export type Feature =
  | "ai.chat"
  | "ai.advanced"
  | "collaboration.realtime"
  | "export.pdf"
  | "workspace.unlimited"
  | "version.history.advanced";

export interface FeatureContext {
  user: User;
  usage?: {
    aiRequestsToday?: number;
  };
}

export class FeatureGate {
  // free tier limits
  private static FREE_LIMITS = {
    aiRequestsPerDay: 20,
  };

  static hasFeature(feature: Feature, ctx: FeatureContext): boolean {
    const { user, usage } = ctx;

    // premium users bypass most restrictions
    if (user.plan === "premium") return true;

    switch (feature) {
      case "ai.chat":
        return (usage?.aiRequestsToday || 0) < this.FREE_LIMITS.aiRequestsPerDay;

      case "ai.advanced":
        return false;

      case "collaboration.realtime":
        return true;

      case "export.pdf":
        return false;

      case "workspace.unlimited":
        return false;

      case "version.history.advanced":
        return false;

      default:
        return false;
    }
  }

  static assert(feature: Feature, ctx: FeatureContext) {
    if (!this.hasFeature(feature, ctx)) {
      throw new Error(`Feature locked: ${feature}. Upgrade to premium.`);
    }
  }
}
