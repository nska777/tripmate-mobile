import { cities, places } from '../data/cities';
import type { BudgetLevel, GeneratedRoute, RouteStop, TripDuration } from '../types';

const durationLimit: Record<TripDuration, number> = {
  '3h': 3,
  '1d': 5,
  '2d': 7,
  '3d': 9
};

const startTimes = ['09:30', '11:15', '13:00', '15:00', '17:20', '19:00', '20:30', '10:30', '14:30'];

export function buildRoute(cityId: string, duration: TripDuration, budget: BudgetLevel, selectedInterests: string[]): GeneratedRoute {
  const city = cities.find((item) => item.id === cityId) ?? cities[0];
  const cityPlaces = places.filter((place) => place.cityId === city.id);
  const interests = selectedInterests.length ? selectedInterests : ['history', 'food', 'photo'];

  const sorted = [...cityPlaces].sort((a, b) => {
    const aScore = a.tags.filter((tag) => interests.includes(tag)).length;
    const bScore = b.tags.filter((tag) => interests.includes(tag)).length;
    return bScore - aScore || b.durationMinutes - a.durationMinutes;
  });

  const stopCount = Math.min(durationLimit[duration], sorted.length);
  const stops: RouteStop[] = sorted.slice(0, stopCount).map((place, index) => ({
    ...place,
    time: startTimes[index] ?? '12:00',
    transfer: index === 0 ? 'Старт из отеля или текущей точки' : index % 2 === 0 ? '10–15 минут на такси' : 'Пешком или короткая поездка'
  }));

  const placesBudget = stops.reduce((sum, stop) => sum + stop.priceUZS, 0);
  const totalBudget = city.dailyBudgetUZS[budget] + placesBudget;

  return {
    city,
    duration,
    budget,
    interests,
    totalBudget,
    stops
  };
}

export function formatUZS(value: number) {
  return new Intl.NumberFormat('ru-RU', { maximumFractionDigits: 0 }).format(value) + ' сум';
}

export function durationLabel(duration: TripDuration) {
  const labels: Record<TripDuration, string> = {
    '3h': '3 часа',
    '1d': '1 день',
    '2d': '2 дня',
    '3d': '3 дня'
  };
  return labels[duration];
}

export function budgetLabel(budget: BudgetLevel) {
  const labels: Record<BudgetLevel, string> = {
    economy: 'Эконом',
    comfort: 'Комфорт',
    premium: 'Премиум'
  };
  return labels[budget];
}
