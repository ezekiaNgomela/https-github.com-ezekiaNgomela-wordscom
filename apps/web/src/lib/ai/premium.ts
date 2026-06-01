import { doc, getDoc, setDoc } from 'firebase/firestore';
import { User } from 'firebase/auth';
import { db } from '../../firebase';

export type PremiumState = {
  isSignedIn: boolean;
  isPremium: boolean;
  premiumExpires: number | null;
};

export const EMPTY_PREMIUM_STATE: PremiumState = {
  isSignedIn: false,
  isPremium: false,
  premiumExpires: null,
};

export const readPremiumState = async (user: User | null): Promise<PremiumState> => {
  if (!user) return EMPTY_PREMIUM_STATE;

  const userRef = doc(db, 'users', user.uid);
  const userDoc = await getDoc(userRef);
  if (!userDoc.exists()) {
    await setDoc(userRef, { isPremium: false, tokens: 50 }, { merge: true });
    return { ...EMPTY_PREMIUM_STATE, isSignedIn: true };
  }

  const data = userDoc.data();
  const premiumExpires = data.premiumExpires ?? null;
  const isPremium = Boolean(data.isPremium) && (!premiumExpires || premiumExpires > Date.now());

  if (data.isPremium && premiumExpires && premiumExpires <= Date.now()) {
    await setDoc(userRef, { isPremium: false }, { merge: true });
  }

  return {
    isSignedIn: true,
    isPremium,
    premiumExpires,
  };
};
