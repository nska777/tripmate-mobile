export type BudgetLevel = 'economy' | 'comfort' | 'premium';
export type TripDuration = '3h' | '1d' | '2d' | '3d';

export type Place = {
  id: string;
  title: string;
  subtitle: string;
  cityId: string;
  category: string;
  durationMinutes: number;
  priceUZS: number;
  bestTime: string;
  address: string;
  tip: string;
  safety: string;
  tags: string[];
};

export type City = {
  id: string;
  title: string;
  country: string;
  short: string;
  hero: string;
  accent: string;
  dailyBudgetUZS: Record<BudgetLevel, number>;
  phrases: { ru: string; local: string; meaning: string }[];
};

export type RouteStop = Place & {
  time: string;
  transfer: string;
};

export type GeneratedRoute = {
  city: City;
  duration: TripDuration;
  budget: BudgetLevel;
  interests: string[];
  totalBudget: number;
  stops: RouteStop[];
};
