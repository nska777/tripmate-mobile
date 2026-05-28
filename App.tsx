import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  Alert,
  Linking,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Tab =
  | "home"
  | "route"
  | "places"
  | "taxi"
  | "budget"
  | "sos"
  | "ai"
  | "profile";
type Category =
  | "sight"
  | "museum"
  | "food"
  | "shop"
  | "nature"
  | "night"
  | "family"
  | "exchange";
type Crowd = "low" | "medium" | "high";
type TravelStyle = "economy" | "comfort" | "premium";

type Country = {
  id: string;
  name: string;
  emoji: string;
  currency: string;
  emergency: {
    police: string;
    ambulance: string;
    fire: string;
    tourist: string;
  };
};

type City = {
  id: string;
  countryId: string;
  name: string;
  subtitle: string;
  taxiBaseUZS: number;
  taxiKmUZS: number;
};

type Place = {
  id: string;
  countryId: string;
  cityId: string;
  title: string;
  category: Category;
  subtitle: string;
  address: string;
  lat: number;
  lng: number;
  entryUZS: number;
  minSpendUZS: number;
  durationMin: number;
  rating: number;
  crowd: Crowd;
  bestTime: string;
  openNow: boolean;
  cheapTip: string;
  safetyTip: string;
  whyGo: string;
};

type RouteStep = Place & {
  order: number;
  time: string;
  distanceKm: number;
  taxiUZS: number;
  transportText: string;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const countries: Country[] = [
  {
    id: "uz",
    name: "Узбекистан",
    emoji: "🇺🇿",
    currency: "UZS",
    emergency: {
      police: "102",
      ambulance: "103",
      fire: "101",
      tourist: "1173",
    },
  },
  {
    id: "ae",
    name: "ОАЭ",
    emoji: "🇦🇪",
    currency: "AED",
    emergency: { police: "999", ambulance: "998", fire: "997", tourist: "901" },
  },
  {
    id: "tr",
    name: "Турция",
    emoji: "🇹🇷",
    currency: "TRY",
    emergency: { police: "112", ambulance: "112", fire: "112", tourist: "112" },
  },
  {
    id: "kz",
    name: "Казахстан",
    emoji: "🇰🇿",
    currency: "KZT",
    emergency: { police: "102", ambulance: "103", fire: "101", tourist: "112" },
  },
  {
    id: "ru",
    name: "Россия",
    emoji: "🇷🇺",
    currency: "RUB",
    emergency: { police: "102", ambulance: "103", fire: "101", tourist: "112" },
  },
  {
    id: "fr",
    name: "Франция",
    emoji: "🇫🇷",
    currency: "EUR",
    emergency: { police: "17", ambulance: "15", fire: "18", tourist: "112" },
  },
  {
    id: "it",
    name: "Италия",
    emoji: "🇮🇹",
    currency: "EUR",
    emergency: { police: "112", ambulance: "118", fire: "115", tourist: "112" },
  },
  {
    id: "es",
    name: "Испания",
    emoji: "🇪🇸",
    currency: "EUR",
    emergency: { police: "112", ambulance: "112", fire: "112", tourist: "112" },
  },
  {
    id: "us",
    name: "США",
    emoji: "🇺🇸",
    currency: "USD",
    emergency: { police: "911", ambulance: "911", fire: "911", tourist: "911" },
  },
  {
    id: "th",
    name: "Таиланд",
    emoji: "🇹🇭",
    currency: "THB",
    emergency: {
      police: "191",
      ambulance: "1669",
      fire: "199",
      tourist: "1155",
    },
  },
  {
    id: "jp",
    name: "Япония",
    emoji: "🇯🇵",
    currency: "JPY",
    emergency: {
      police: "110",
      ambulance: "119",
      fire: "119",
      tourist: "050-3816-2787",
    },
  },
  {
    id: "eg",
    name: "Египет",
    emoji: "🇪🇬",
    currency: "EGP",
    emergency: { police: "122", ambulance: "123", fire: "180", tourist: "126" },
  },
];

const popularCities: City[] = [
  {
    id: "tashkent",
    countryId: "uz",
    name: "Ташкент",
    subtitle: "Базары, парки, современный город",
    taxiBaseUZS: 12000,
    taxiKmUZS: 3200,
  },
  {
    id: "samarkand",
    countryId: "uz",
    name: "Самарканд",
    subtitle: "Регистан, Шахи-Зинда, плов",
    taxiBaseUZS: 10000,
    taxiKmUZS: 3000,
  },
  {
    id: "bukhara",
    countryId: "uz",
    name: "Бухара",
    subtitle: "Старый город, минареты, ремесла",
    taxiBaseUZS: 10000,
    taxiKmUZS: 2800,
  },
  {
    id: "khiva",
    countryId: "uz",
    name: "Хива",
    subtitle: "Ичан-Кала, крепостные стены",
    taxiBaseUZS: 9000,
    taxiKmUZS: 2600,
  },
  {
    id: "dubai",
    countryId: "ae",
    name: "Дубай",
    subtitle: "Mall, Creek, Marina, Burj Khalifa",
    taxiBaseUZS: 19000,
    taxiKmUZS: 8500,
  },
  {
    id: "abudhabi",
    countryId: "ae",
    name: "Абу-Даби",
    subtitle: "Мечеть, Лувр, набережная",
    taxiBaseUZS: 18000,
    taxiKmUZS: 8000,
  },
  {
    id: "istanbul",
    countryId: "tr",
    name: "Стамбул",
    subtitle: "Айя-София, Босфор, Гранд базар",
    taxiBaseUZS: 17000,
    taxiKmUZS: 6500,
  },
  {
    id: "antalya",
    countryId: "tr",
    name: "Анталия",
    subtitle: "Море, старый город, водопады",
    taxiBaseUZS: 15000,
    taxiKmUZS: 6000,
  },
  {
    id: "almaty",
    countryId: "kz",
    name: "Алматы",
    subtitle: "Горы, Кок-Тобе, кафе",
    taxiBaseUZS: 14000,
    taxiKmUZS: 4500,
  },
  {
    id: "astana",
    countryId: "kz",
    name: "Астана",
    subtitle: "Современная архитектура",
    taxiBaseUZS: 14000,
    taxiKmUZS: 4500,
  },
  {
    id: "moscow",
    countryId: "ru",
    name: "Москва",
    subtitle: "Красная площадь, музеи, парки",
    taxiBaseUZS: 18000,
    taxiKmUZS: 6000,
  },
  {
    id: "spb",
    countryId: "ru",
    name: "Санкт-Петербург",
    subtitle: "Эрмитаж, каналы, дворцы",
    taxiBaseUZS: 17000,
    taxiKmUZS: 5800,
  },
  {
    id: "paris",
    countryId: "fr",
    name: "Париж",
    subtitle: "Лувр, Эйфелева башня, Монмартр",
    taxiBaseUZS: 32000,
    taxiKmUZS: 12000,
  },
  {
    id: "rome",
    countryId: "it",
    name: "Рим",
    subtitle: "Колизей, Ватикан, фонтаны",
    taxiBaseUZS: 28000,
    taxiKmUZS: 11000,
  },
  {
    id: "barcelona",
    countryId: "es",
    name: "Барселона",
    subtitle: "Гауди, море, готический квартал",
    taxiBaseUZS: 27000,
    taxiKmUZS: 10500,
  },
  {
    id: "nyc",
    countryId: "us",
    name: "Нью-Йорк",
    subtitle: "Times Square, парки, музеи",
    taxiBaseUZS: 35000,
    taxiKmUZS: 15000,
  },
  {
    id: "bangkok",
    countryId: "th",
    name: "Бангкок",
    subtitle: "Храмы, рынки, уличная еда",
    taxiBaseUZS: 12000,
    taxiKmUZS: 4500,
  },
  {
    id: "tokyo",
    countryId: "jp",
    name: "Токио",
    subtitle: "Сибуя, храмы, технологии",
    taxiBaseUZS: 30000,
    taxiKmUZS: 12000,
  },
  {
    id: "cairo",
    countryId: "eg",
    name: "Каир",
    subtitle: "Пирамиды, музеи, базары",
    taxiBaseUZS: 11000,
    taxiKmUZS: 4200,
  },
];

const places: Place[] = [
  {
    id: "tashkent-hazrati",
    countryId: "uz",
    cityId: "tashkent",
    title: "Хазрати Имам",
    category: "sight",
    subtitle: "Исторический комплекс старого города",
    address: "Старый город",
    lat: 41.3371,
    lng: 69.2406,
    entryUZS: 30000,
    minSpendUZS: 0,
    durationMin: 70,
    rating: 4.8,
    crowd: "medium",
    bestTime: "10:00–12:00",
    openNow: true,
    cheapTip: "Вход недорогой, сувениры лучше сравнить в 2–3 местах.",
    safetyTip: "Спокойная зона, но телефон держи ближе к себе.",
    whyGo: "Хорошая первая точка для знакомства со старым городом.",
  },
  {
    id: "tashkent-chorsu",
    countryId: "uz",
    cityId: "tashkent",
    title: "Чорсу базар",
    category: "shop",
    subtitle: "Специи, лепешки, сувениры, восточный рынок",
    address: "м. Чорсу",
    lat: 41.3267,
    lng: 69.2352,
    entryUZS: 0,
    minSpendUZS: 65000,
    durationMin: 90,
    rating: 4.6,
    crowd: "high",
    bestTime: "11:00–14:00",
    openNow: true,
    cheapTip: "Торгуйся спокойно. Нормально просить минус 15–25%.",
    safetyTip: "Людно, аккуратнее с кошельком и телефоном.",
    whyGo: "Самый живой рынок города, хороший для сувениров и фото.",
  },
  {
    id: "tashkent-plov",
    countryId: "uz",
    cityId: "tashkent",
    title: "Центр плова",
    category: "food",
    subtitle: "Популярный плов, быстро и понятно туристу",
    address: "район телевышки",
    lat: 41.3457,
    lng: 69.2848,
    entryUZS: 0,
    minSpendUZS: 85000,
    durationMin: 60,
    rating: 4.5,
    crowd: "high",
    bestTime: "12:00–14:00",
    openNow: true,
    cheapTip: "Приходи днем: вечером хорошие позиции могут закончиться.",
    safetyTip: "Выбирай место с большим потоком гостей.",
    whyGo: "Понятная точка для первого плова в Ташкенте.",
  },
  {
    id: "tashkent-magic",
    countryId: "uz",
    cityId: "tashkent",
    title: "Magic City",
    category: "family",
    subtitle: "Вечерняя прогулка, кафе и фото",
    address: "Алмазар",
    lat: 41.3045,
    lng: 69.2447,
    entryUZS: 0,
    minSpendUZS: 120000,
    durationMin: 90,
    rating: 4.7,
    crowd: "medium",
    bestTime: "18:30–21:00",
    openNow: true,
    cheapTip: "Можно просто гулять бесплатно, кафе выбирать по меню у входа.",
    safetyTip: "Комфортно вечером, обратно лучше ехать на такси.",
    whyGo: "Удобная вечерняя точка для семьи и фото.",
  },
  {
    id: "samarkand-registan",
    countryId: "uz",
    cityId: "samarkand",
    title: "Регистан",
    category: "sight",
    subtitle: "Главный символ Самарканда",
    address: "Registon ko‘chasi",
    lat: 39.6542,
    lng: 66.975,
    entryUZS: 70000,
    minSpendUZS: 0,
    durationMin: 110,
    rating: 4.9,
    crowd: "high",
    bestTime: "09:00–11:30",
    openNow: true,
    cheapTip: "Билет фиксированный, сувениры рядом часто дороже.",
    safetyTip: "Туристическая зона, проверяй цены заранее.",
    whyGo: "Главная вау-точка города.",
  },
  {
    id: "samarkand-siab",
    countryId: "uz",
    cityId: "samarkand",
    title: "Сиабский базар",
    category: "shop",
    subtitle: "Лепешки, сладости, специи, сувениры",
    address: "рядом с Биби-Ханым",
    lat: 39.6616,
    lng: 66.9805,
    entryUZS: 0,
    minSpendUZS: 80000,
    durationMin: 80,
    rating: 4.7,
    crowd: "medium",
    bestTime: "12:00–14:00",
    openNow: true,
    cheapTip: "Сначала пробуй, потом покупай. Сравни 2 ряда.",
    safetyTip: "Торгуйся спокойно, не показывай много наличных.",
    whyGo: "Хорошая точка для сладостей, специй и сувениров.",
  },
  {
    id: "samarkand-shahi",
    countryId: "uz",
    cityId: "samarkand",
    title: "Шахи-Зинда",
    category: "museum",
    subtitle: "Красивые мавзолеи и фото-точки",
    address: "улица Шахи-Зинда",
    lat: 39.6622,
    lng: 66.987,
    entryUZS: 60000,
    minSpendUZS: 0,
    durationMin: 85,
    rating: 4.9,
    crowd: "medium",
    bestTime: "15:30–17:30",
    openNow: true,
    cheapTip: "Лучшее фото без доплат — ближе к вечеру.",
    safetyTip: "Священное место: тише, уважительная одежда.",
    whyGo: "Одна из самых красивых улиц мавзолеев в регионе.",
  },
  {
    id: "bukhara-lyabi",
    countryId: "uz",
    cityId: "bukhara",
    title: "Ляби-Хауз",
    category: "sight",
    subtitle: "Сердце старой Бухары",
    address: "старый город",
    lat: 39.7747,
    lng: 64.4231,
    entryUZS: 0,
    minSpendUZS: 70000,
    durationMin: 80,
    rating: 4.8,
    crowd: "medium",
    bestTime: "10:00–12:00",
    openNow: true,
    cheapTip: "Кафе у воды дороже, улицей дальше можно дешевле.",
    safetyTip: "Вечером много туристов, зона комфортная.",
    whyGo: "Лучшая стартовая точка для прогулки по старому городу.",
  },
  {
    id: "khiva-ichan",
    countryId: "uz",
    cityId: "khiva",
    title: "Ичан-Кала",
    category: "sight",
    subtitle: "Город-музей под открытым небом",
    address: "центр Хивы",
    lat: 41.3783,
    lng: 60.3596,
    entryUZS: 90000,
    minSpendUZS: 60000,
    durationMin: 140,
    rating: 4.9,
    crowd: "medium",
    bestTime: "09:00–12:00",
    openNow: true,
    cheapTip: "Пеший маршрут экономит транспорт.",
    safetyTip: "Днем жарко: вода и головной убор обязательно.",
    whyGo: "Цельная атмосфера древнего города.",
  },
  {
    id: "dubai-mall",
    countryId: "ae",
    cityId: "dubai",
    title: "Dubai Mall",
    category: "shop",
    subtitle: "Шопинг, фонтаны, аквариум, рестораны",
    address: "Downtown Dubai",
    lat: 25.1972,
    lng: 55.2796,
    entryUZS: 0,
    minSpendUZS: 220000,
    durationMin: 120,
    rating: 4.8,
    crowd: "high",
    bestTime: "10:00–13:00",
    openNow: true,
    cheapTip: "Еда в фудкорте дешевле ресторанов с видом.",
    safetyTip: "Безопасно, но легко потратить лишнее.",
    whyGo: "Крупная туристическая точка с множеством активностей.",
  },
  {
    id: "dubai-creek",
    countryId: "ae",
    cityId: "dubai",
    title: "Dubai Creek",
    category: "sight",
    subtitle: "Старый город, лодки abra и рынки",
    address: "Deira",
    lat: 25.2684,
    lng: 55.2972,
    entryUZS: 10000,
    minSpendUZS: 60000,
    durationMin: 90,
    rating: 4.6,
    crowd: "medium",
    bestTime: "17:00–20:00",
    openNow: true,
    cheapTip: "Abra стоит дешево и дает атмосферу старого Дубая.",
    safetyTip: "Торгуйся на рынках, цены могут завышать.",
    whyGo: "Более бюджетная и атмосферная сторона Дубая.",
  },
  {
    id: "istanbul-hagia",
    countryId: "tr",
    cityId: "istanbul",
    title: "Айя-София",
    category: "museum",
    subtitle: "Главная историческая точка города",
    address: "Sultanahmet",
    lat: 41.0086,
    lng: 28.9802,
    entryUZS: 180000,
    minSpendUZS: 0,
    durationMin: 100,
    rating: 4.9,
    crowd: "high",
    bestTime: "09:00–11:00",
    openNow: true,
    cheapTip: "Приходи рано: меньше очереди.",
    safetyTip: "Много туристов, следи за вещами.",
    whyGo: "Одна из главных исторических точек мира.",
  },
  {
    id: "almaty-kok",
    countryId: "kz",
    cityId: "almaty",
    title: "Кок-Тобе",
    category: "nature",
    subtitle: "Вид на город, прогулка, кафе",
    address: "Кок-Тобе",
    lat: 43.2295,
    lng: 76.9763,
    entryUZS: 120000,
    minSpendUZS: 60000,
    durationMin: 100,
    rating: 4.7,
    crowd: "medium",
    bestTime: "17:00–20:00",
    openNow: true,
    cheapTip: "Лучше ехать к закату и заранее заложить транспорт.",
    safetyTip: "Комфортно, но вечером такси обратно удобнее.",
    whyGo: "Один из лучших видов на город и горы.",
  },
];

const fallbackTemplates: Omit<
  Place,
  "id" | "countryId" | "cityId" | "lat" | "lng"
>[] = [
  {
    title: "Главная площадь / исторический центр",
    category: "sight",
    subtitle: "Стартовая точка для первого знакомства с городом",
    address: "центр города",
    entryUZS: 0,
    minSpendUZS: 50000,
    durationMin: 80,
    rating: 4.6,
    crowd: "medium",
    bestTime: "10:00–12:00",
    openNow: true,
    cheapTip:
      "Сначала осмотрись бесплатно, не покупай сувениры в первой лавке.",
    safetyTip: "В туристической зоне следи за телефоном и документами.",
    whyGo: "Позволяет быстро понять атмосферу города.",
  },
  {
    title: "Главный музей города",
    category: "museum",
    subtitle: "Культура, история и базовое понимание страны",
    address: "музейный квартал",
    entryUZS: 90000,
    minSpendUZS: 0,
    durationMin: 100,
    rating: 4.5,
    crowd: "medium",
    bestTime: "11:00–14:00",
    openNow: true,
    cheapTip: "Проверь бесплатные дни и студенческие скидки.",
    safetyTip: "Проверь правила фото и хранения сумок.",
    whyGo: "Хорошая точка для смысла, а не только фото.",
  },
  {
    title: "Локальный рынок / food street",
    category: "food",
    subtitle: "Еда, напитки, сувениры и местная жизнь",
    address: "популярный рынок",
    entryUZS: 0,
    minSpendUZS: 90000,
    durationMin: 75,
    rating: 4.4,
    crowd: "high",
    bestTime: "12:00–15:00",
    openNow: true,
    cheapTip: "Сравни цены, выбирай места с большим потоком местных.",
    safetyTip: "Людно: кошелек и телефон держи ближе.",
    whyGo: "Самый простой способ почувствовать город через еду.",
  },
  {
    title: "Парк / набережная",
    category: "nature",
    subtitle: "Спокойная прогулка без больших расходов",
    address: "центральный парк",
    entryUZS: 0,
    minSpendUZS: 30000,
    durationMin: 70,
    rating: 4.3,
    crowd: "low",
    bestTime: "17:00–20:00",
    openNow: true,
    cheapTip: "Можно провести время почти бесплатно.",
    safetyTip: "Вечером держись освещенных зон.",
    whyGo: "Хорошо разгружает маршрут и бюджет.",
  },
  {
    title: "Торговая улица / сувениры",
    category: "shop",
    subtitle: "Подарки, локальные товары, витрины",
    address: "торговый район",
    entryUZS: 0,
    minSpendUZS: 110000,
    durationMin: 80,
    rating: 4.2,
    crowd: "medium",
    bestTime: "15:00–18:00",
    openNow: true,
    cheapTip: "Не покупай в первой точке, сравни минимум 3 цены.",
    safetyTip: "Проверяй чек и упаковку.",
    whyGo: "Полезно для подарков и понимания цен.",
  },
];

const categoryLabels: Record<Category, string> = {
  sight: "Места",
  museum: "Музеи",
  food: "Еда",
  shop: "Магазины",
  nature: "Природа",
  night: "Вечер",
  family: "Семья",
  exchange: "Обмен",
};

const categoryIcons: Record<Category, keyof typeof Ionicons.glyphMap> = {
  sight: "camera",
  museum: "business",
  food: "restaurant",
  shop: "bag",
  nature: "leaf",
  night: "moon",
  family: "people",
  exchange: "cash",
};

const crowdLabels: Record<Crowd, string> = {
  low: "мало людей",
  medium: "средне",
  high: "много людей",
};

const crowdColors: Record<Crowd, string> = {
  low: "#22C55E",
  medium: "#EAB308",
  high: "#F43F5E",
};

const currencyRatesToUZS: Record<string, number> = {
  UZS: 1,
  AED: 3500,
  TRY: 400,
  KZT: 26,
  RUB: 150,
  EUR: 14000,
  USD: 13000,
  THB: 360,
  JPY: 90,
  EGP: 270,
};

function getCityById(id: string) {
  return popularCities.find((city) => city.id === id) ?? popularCities[0];
}

function getCountryById(id: string) {
  return countries.find((country) => country.id === id) ?? countries[0];
}

function convertFromUZS(valueUZS: number, country: Country) {
  const rate = currencyRatesToUZS[country.currency] ?? 1;
  return Math.max(0, Math.round(valueUZS / rate));
}

function money(valueUZS: number, country: Country) {
  const converted = convertFromUZS(valueUZS, country);
  return `${converted.toLocaleString("ru-RU")} ${country.currency}`;
}

function parseBudgetToUZS(value: string, country: Country) {
  const number = Number(value.replace(/\D/g, ""));
  const rate = currencyRatesToUZS[country.currency] ?? 1;
  return Math.max(0, Math.round(number * rate));
}

function distanceKm(a: Place, b: Place) {
  const raw =
    Math.sqrt(Math.pow(a.lat - b.lat, 2) + Math.pow(a.lng - b.lng, 2)) * 110;
  return Math.max(1, Math.round(raw));
}

function taxiPrice(distance: number, city: City) {
  return Math.round(city.taxiBaseUZS + distance * city.taxiKmUZS);
}

function makeFallbackPlaces(
  country: Country,
  city: City,
  customCityName: string,
): Place[] {
  return fallbackTemplates.map((template, index) => ({
    ...template,
    id: `fallback-${city.id}-${index}`,
    countryId: country.id,
    cityId: city.id,
    lat: 41 + index * 0.01,
    lng: 69 + index * 0.01,
    title: `${template.title}`,
    address: `${customCityName}, ${template.address}`,
  }));
}

function getPlacesForCity(
  country: Country,
  city: City,
  customCityName: string,
) {
  const real = places.filter((place) => place.cityId === city.id);
  return real.length ? real : makeFallbackPlaces(country, city, customCityName);
}

function buildRoute(args: {
  allPlaces: Place[];
  city: City;
  budgetUZS: number;
  selectedCategories: Category[];
  travelStyle: TravelStyle;
}) {
  const { allPlaces, city, budgetUZS, selectedCategories, travelStyle } = args;
  const multiplier =
    travelStyle === "economy" ? 0.8 : travelStyle === "premium" ? 1.35 : 1;

  const ranked = [...allPlaces].sort((a, b) => {
    const aMatch = selectedCategories.includes(a.category) ? 2 : 0;
    const bMatch = selectedCategories.includes(b.category) ? 2 : 0;
    const aCrowd = a.crowd === "low" ? 1 : a.crowd === "medium" ? 0.4 : 0;
    const bCrowd = b.crowd === "low" ? 1 : b.crowd === "medium" ? 0.4 : 0;
    const aCheap =
      travelStyle === "economy" ? -(a.entryUZS + a.minSpendUZS) / 100000 : 0;
    const bCheap =
      travelStyle === "economy" ? -(b.entryUZS + b.minSpendUZS) / 100000 : 0;
    return (
      bMatch +
      b.rating +
      bCrowd +
      bCheap -
      (aMatch + a.rating + aCrowd + aCheap)
    );
  });

  const result: RouteStep[] = [];
  let total = 0;
  const times = [
    "09:30",
    "11:00",
    "12:30",
    "14:20",
    "16:10",
    "18:00",
    "19:30",
    "21:00",
  ];

  ranked.forEach((place) => {
    const previous = result[result.length - 1];
    const km = previous ? distanceKm(previous, place) : 0;
    const taxi = previous ? taxiPrice(km, city) : 0;
    const placeCost = Math.round(
      (place.entryUZS + place.minSpendUZS) * multiplier,
    );
    const fullCost = placeCost + taxi;

    if (
      result.length < 8 &&
      (total + fullCost <= budgetUZS || result.length < 2)
    ) {
      total += fullCost;
      result.push({
        ...place,
        order: result.length + 1,
        time: times[result.length] ?? "12:00",
        distanceKm: km,
        taxiUZS: taxi,
        transportText: previous
          ? `Такси ${km} км, примерно ${Math.max(8, km * 4)} мин`
          : "Старт из отеля / текущей точки",
        entryUZS: Math.round(place.entryUZS * multiplier),
        minSpendUZS: Math.round(place.minSpendUZS * multiplier),
      });
    }
  });

  return result;
}

function openMaps(place: Place) {
  const url = Platform.select({
    ios: `http://maps.apple.com/?ll=${place.lat},${place.lng}&q=${encodeURIComponent(place.title)}`,
    android: `geo:${place.lat},${place.lng}?q=${encodeURIComponent(place.title)}`,
    default: `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`,
  });

  Linking.openURL(
    url ??
      `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`,
  ).catch(() => {
    Alert.alert("Карта не открылась", `${place.title}: ${place.address}`);
  });
}

function openTaxi(from: Place | null, to: Place) {
  const url = from
    ? `https://yandex.com/maps/?rtext=${from.lat},${from.lng}~${to.lat},${to.lng}&rtt=auto`
    : `https://yandex.com/maps/?ll=${to.lng},${to.lat}&z=15`;

  Linking.openURL(url).catch(() => {
    Alert.alert("Такси / карта", `Куда ехать: ${to.title}, ${to.address}`);
  });
}

function callNumber(number: string) {
  Linking.openURL(`tel:${number}`).catch(() => Alert.alert("Номер", number));
}

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [countryId, setCountryId] = useState("uz");
  const [cityId, setCityId] = useState("tashkent");
  const [customCity, setCustomCity] = useState("");
  const [budgetValue, setBudgetValue] = useState("500000");
  const [travelStyle, setTravelStyle] = useState<TravelStyle>("comfort");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([
    "sight",
    "museum",
    "food",
    "shop",
  ]);
  const [savedRoutes, setSavedRoutes] = useState<RouteStep[][]>([]);
  const [chatText, setChatText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "hello",
      role: "assistant",
      text: "Я помогу подобрать маршрут под бюджет: точки, такси, где дешевле, где меньше людей, расходы и SOS.",
    },
  ]);

  const country = getCountryById(countryId);
  const city = getCityById(cityId);
  const shownCityName = customCity.trim() || city.name;
  const cityOptions = popularCities.filter(
    (item) => item.countryId === countryId,
  );
  const allPlaces = useMemo(
    () => getPlacesForCity(country, city, shownCityName),
    [country.id, city.id, shownCityName],
  );
  const budgetUZS = parseBudgetToUZS(budgetValue, country);

  const route = useMemo(
    () =>
      buildRoute({
        allPlaces,
        city,
        budgetUZS,
        selectedCategories,
        travelStyle,
      }),
    [allPlaces, city, budgetUZS, selectedCategories, travelStyle],
  );

  const routeTotal = route.reduce(
    (sum, item) => sum + item.entryUZS + item.minSpendUZS + item.taxiUZS,
    0,
  );
  const routeEntry = route.reduce((sum, item) => sum + item.entryUZS, 0);
  const routeSpend = route.reduce((sum, item) => sum + item.minSpendUZS, 0);
  const routeTaxi = route.reduce((sum, item) => sum + item.taxiUZS, 0);
  const remaining = budgetUZS - routeTotal;

  const cheapestPlaces = [...allPlaces]
    .sort((a, b) => a.entryUZS + a.minSpendUZS - (b.entryUZS + b.minSpendUZS))
    .slice(0, 5);
  const calmPlaces = allPlaces
    .filter((place) => place.crowd !== "high")
    .slice(0, 5);
  const nextPoint = route[1] ?? route[0];

  const toggleCategory = (category: Category) => {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  };

  const handleCountry = (nextCountryId: string) => {
    setCountryId(nextCountryId);
    const firstCity = popularCities.find(
      (item) => item.countryId === nextCountryId,
    );
    if (firstCity) {
      setCityId(firstCity.id);
      setCustomCity("");
    }
  };

  const handleCustomCity = (value: string) => {
    setCustomCity(value);
    if (value.trim()) {
      setCityId(`custom-${country.id}`);
    }
  };

  const sendChat = () => {
    const text = chatText.trim();
    if (!text) return;

    const lower = text.toLowerCase();
    let answer = `Для ${shownCityName} под бюджет ${money(budgetUZS, country)} я подобрал: ${route.map((item) => item.title).join(" → ")}. Итого: ${money(routeTotal, country)}. Остаток: ${money(remaining, country)}.`;

    if (lower.includes("дешев") || lower.includes("эконом")) {
      const cheap = cheapestPlaces[0];
      answer = `Самая дешевая сильная точка: ${cheap.title}. Примерно ${money(cheap.entryUZS + cheap.minSpendUZS, country)}. ${cheap.cheapTip}`;
    }

    if (
      lower.includes("людей") ||
      lower.includes("толп") ||
      lower.includes("народу")
    ) {
      answer = calmPlaces.length
        ? `Где меньше людей: ${calmPlaces.map((item) => item.title).join(", ")}.`
        : "Сейчас в популярных точках может быть много людей. Лучше идти утром или ближе к закрытию.";
    }

    if (lower.includes("такси") || lower.includes("яндекс")) {
      answer = nextPoint
        ? `Следующая точка для такси: ${nextPoint.title}. Примерная поездка: ${money(nextPoint.taxiUZS, country)}. Нажми “Такси” или кнопку на карточке маршрута.`
        : "Сначала построй маршрут, затем появятся точки такси.";
    }

    if (
      lower.includes("полиция") ||
      lower.includes("скорая") ||
      lower.includes("sos")
    ) {
      answer = `SOS для ${country.name}: полиция ${country.emergency.police}, скорая ${country.emergency.ambulance}, пожарная ${country.emergency.fire}, туристическая помощь ${country.emergency.tourist}.`;
    }

    setMessages((current) => [
      ...current,
      { id: `u-${Date.now()}`, role: "user", text },
      { id: `a-${Date.now()}`, role: "assistant", text: answer },
    ]);
    setChatText("");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.app}>
        <Header
          cityName={shownCityName}
          country={country}
          routeTotal={routeTotal}
          budgetUZS={budgetUZS}
        />

        {tab === "home" && (
          <HomeScreen
            country={country}
            countryId={countryId}
            onCountry={handleCountry}
            cityId={cityId}
            cityOptions={cityOptions}
            customCity={customCity}
            onCustomCity={handleCustomCity}
            onCity={(id) => {
              setCityId(id);
              setCustomCity("");
            }}
            budgetValue={budgetValue}
            setBudgetValue={setBudgetValue}
            travelStyle={travelStyle}
            setTravelStyle={setTravelStyle}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            route={route}
            routeTotal={routeTotal}
            remaining={remaining}
            budgetUZS={budgetUZS}
            onBuild={() => setTab("route")}
          />
        )}

        {tab === "route" && (
          <RouteScreen
            country={country}
            route={route}
            routeTotal={routeTotal}
            budgetUZS={budgetUZS}
            remaining={remaining}
            onSave={() => {
              setSavedRoutes((current) => [route, ...current].slice(0, 10));
              Alert.alert("Сохранено", "Маршрут добавлен в профиль.");
            }}
          />
        )}

        {tab === "places" && (
          <PlacesScreen
            country={country}
            places={allPlaces}
            cheapestPlaces={cheapestPlaces}
            calmPlaces={calmPlaces}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
          />
        )}

        {tab === "taxi" && (
          <TaxiScreen country={country} route={route} nextPoint={nextPoint} />
        )}
        {tab === "budget" && (
          <BudgetScreen
            country={country}
            budgetUZS={budgetUZS}
            routeTotal={routeTotal}
            remaining={remaining}
            routeEntry={routeEntry}
            routeSpend={routeSpend}
            routeTaxi={routeTaxi}
            route={route}
          />
        )}
        {tab === "sos" && <SosScreen country={country} />}
        {tab === "ai" && (
          <AiScreen
            messages={messages}
            chatText={chatText}
            setChatText={setChatText}
            onSend={sendChat}
          />
        )}
        {tab === "profile" && (
          <ProfileScreen
            country={country}
            cityName={shownCityName}
            savedRoutes={savedRoutes}
            budgetUZS={budgetUZS}
            route={route}
          />
        )}

        <BottomTabs active={tab} setActive={setTab} />
      </View>
    </SafeAreaView>
  );
}

function Header({
  cityName,
  country,
  routeTotal,
  budgetUZS,
}: {
  cityName: string;
  country: Country;
  routeTotal: number;
  budgetUZS: number;
}) {
  const ok = routeTotal <= budgetUZS;
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.logo}>TripMate</Text>
        <Text style={styles.headerSub}>Global AI travel planner</Text>
      </View>
      <View style={styles.headerRight}>
        <View style={styles.pill}>
          <Text style={styles.pillText}>
            {country.emoji} {cityName}
          </Text>
        </View>
        <View style={[styles.pill, ok ? styles.goodPill : styles.badPill]}>
          <Text style={styles.pillText}>{ok ? "OK" : "OVER"}</Text>
        </View>
      </View>
    </View>
  );
}

function HomeScreen(props: {
  country: Country;
  countryId: string;
  onCountry: (id: string) => void;
  cityId: string;
  cityOptions: City[];
  customCity: string;
  onCustomCity: (value: string) => void;
  onCity: (id: string) => void;
  budgetValue: string;
  setBudgetValue: (value: string) => void;
  travelStyle: TravelStyle;
  setTravelStyle: (value: TravelStyle) => void;
  selectedCategories: Category[];
  toggleCategory: (category: Category) => void;
  route: RouteStep[];
  routeTotal: number;
  remaining: number;
  budgetUZS: number;
  onBuild: () => void;
}) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.heroGlow} />
        <Text style={styles.kicker}>SMART GLOBAL TRIP</Text>
        <Text style={styles.heroTitle}>
          Маршрут под сумму, город и стиль поездки
        </Text>
        <Text style={styles.heroText}>
          Выбираешь страну, город и бюджет. Приложение подбирает известные
          точки, такси между ними, расходы, где дешевле и где меньше людей.
        </Text>
      </View>

      <Section title="1. Страна">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {countries.map((country) => (
            <Pressable
              key={country.id}
              onPress={() => props.onCountry(country.id)}
              style={[
                styles.countryCard,
                props.countryId === country.id && styles.activeCard,
              ]}
            >
              <Text style={styles.countryEmoji}>{country.emoji}</Text>
              <Text style={styles.cardTitle}>{country.name}</Text>
              <Text style={styles.cardMuted}>{country.currency}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </Section>

      <Section title="2. Город">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {props.cityOptions.map((city) => (
            <Pressable
              key={city.id}
              onPress={() => props.onCity(city.id)}
              style={[
                styles.cityCard,
                props.cityId === city.id &&
                  !props.customCity &&
                  styles.activeCard,
              ]}
            >
              <Text style={styles.cardTitle}>{city.name}</Text>
              <Text style={styles.cardMuted}>{city.subtitle}</Text>
            </Pressable>
          ))}
        </ScrollView>
        <View style={styles.inputBox}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            value={props.customCity}
            onChangeText={props.onCustomCity}
            placeholder="Или введи любой город мира"
            placeholderTextColor={colors.muted}
            style={styles.input}
          />
        </View>
      </Section>

      <Section title={`3. Бюджет в ${props.country.currency}`}>
        <View style={styles.budgetBox}>
          <TextInput
            value={props.budgetValue}
            onChangeText={props.setBudgetValue}
            keyboardType="number-pad"
            placeholder="Например 500000"
            placeholderTextColor={colors.muted}
            style={styles.budgetInput}
          />
          <Text style={styles.currency}>{props.country.currency}</Text>
        </View>
        <View style={styles.quickRow}>
          {[250000, 500000, 1000000, 2000000].map((sum) => (
            <Pressable
              key={sum}
              onPress={() =>
                props.setBudgetValue(String(convertFromUZS(sum, props.country)))
              }
              style={styles.quickChip}
            >
              <Text style={styles.quickChipText}>
                {money(sum, props.country)}
              </Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title="4. Стиль поездки">
        <View style={styles.segmentRow}>
          {(
            [
              ["economy", "Эконом"],
              ["comfort", "Комфорт"],
              ["premium", "Премиум"],
            ] as [TravelStyle, string][]
          ).map(([id, label]) => (
            <Pressable
              key={id}
              onPress={() => props.setTravelStyle(id)}
              style={[
                styles.segment,
                props.travelStyle === id && styles.segmentActive,
              ]}
            >
              <Text
                style={[
                  styles.segmentText,
                  props.travelStyle === id && styles.segmentTextActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title="5. Что включить">
        <View style={styles.chipsWrap}>
          {(
            [
              "sight",
              "museum",
              "food",
              "shop",
              "nature",
              "night",
              "family",
            ] as Category[]
          ).map((cat) => {
            const active = props.selectedCategories.includes(cat);
            return (
              <Pressable
                key={cat}
                onPress={() => props.toggleCategory(cat)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Ionicons
                  name={categoryIcons[cat]}
                  size={15}
                  color={active ? colors.dark : colors.text}
                />
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {categoryLabels[cat]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Section>

      <View style={styles.summaryCard}>
        <Text style={styles.kicker}>РАСЧЕТ МАРШРУТА</Text>
        <Text style={styles.summaryTitle}>
          Подобрано точек: {props.route.length}
        </Text>
        <Text style={styles.cardMuted}>
          {props.route.map((item) => item.title).join(" → ") ||
            "Укажи бюджет и город, чтобы собрать маршрут."}
        </Text>
        <View style={styles.statGrid}>
          <MiniStat
            label="Бюджет"
            value={money(props.budgetUZS, props.country)}
          />
          <MiniStat
            label="Расход"
            value={money(props.routeTotal, props.country)}
          />
          <MiniStat
            label="Остаток"
            value={money(props.remaining, props.country)}
          />
        </View>
      </View>

      <Pressable style={styles.primaryButton} onPress={props.onBuild}>
        <Text style={styles.primaryButtonText}>Построить маршрут</Text>
        <Ionicons name="arrow-forward" size={20} color={colors.dark} />
      </Pressable>
    </ScrollView>
  );
}

function RouteScreen(props: {
  country: Country;
  route: RouteStep[];
  routeTotal: number;
  budgetUZS: number;
  remaining: number;
  onSave: () => void;
}) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.summaryCard}>
        <Text style={styles.kicker}>ГОТОВЫЙ МАРШРУТ</Text>
        <Text style={styles.summaryTitle}>
          {props.routeTotal <= props.budgetUZS
            ? "Уложились в бюджет"
            : "Бюджет превышен"}
        </Text>
        <View style={styles.statGrid}>
          <MiniStat
            label="Бюджет"
            value={money(props.budgetUZS, props.country)}
          />
          <MiniStat
            label="Итого"
            value={money(props.routeTotal, props.country)}
          />
          <MiniStat
            label="Остаток"
            value={money(props.remaining, props.country)}
          />
        </View>
      </View>

      {props.route.map((step, index) => {
        const previous = index > 0 ? props.route[index - 1] : null;
        return (
          <View key={step.id} style={styles.routeCard}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepCircleText}>{index + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.cardTop}>
                <Text style={styles.timeText}>{step.time}</Text>
                <Text
                  style={[styles.crowdText, { color: crowdColors[step.crowd] }]}
                >
                  {crowdLabels[step.crowd]}
                </Text>
              </View>
              <Text style={styles.placeTitle}>{step.title}</Text>
              <Text style={styles.cardMuted}>{step.subtitle}</Text>
              <Text style={styles.info}>📍 {step.address}</Text>
              <Text style={styles.info}>
                ⏱ {step.durationMin} мин • ⭐ {step.rating}
              </Text>
              <Text style={styles.info}>
                🎫 Вход: {money(step.entryUZS, props.country)} • траты:{" "}
                {money(step.minSpendUZS, props.country)}
              </Text>
              <Text style={styles.info}>
                🚕 {step.transportText} • {money(step.taxiUZS, props.country)}
              </Text>
              <Text style={styles.tip}>Где дешевле: {step.cheapTip}</Text>
              <Text style={styles.tip}>Безопасность: {step.safetyTip}</Text>

              <View style={styles.actionRow}>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => openTaxi(previous, step)}
                >
                  <Ionicons name="car" size={17} color={colors.dark} />
                  <Text style={styles.secondaryButtonText}>Вызвать такси</Text>
                </Pressable>
                <Pressable
                  style={styles.darkButton}
                  onPress={() => openMaps(step)}
                >
                  <Ionicons name="map" size={17} color={colors.text} />
                  <Text style={styles.darkButtonText}>Карта</Text>
                </Pressable>
              </View>
            </View>
          </View>
        );
      })}

      <Pressable style={styles.primaryButton} onPress={props.onSave}>
        <Text style={styles.primaryButtonText}>Сохранить маршрут</Text>
        <Ionicons name="bookmark" size={19} color={colors.dark} />
      </Pressable>
    </ScrollView>
  );
}

function PlacesScreen(props: {
  country: Country;
  places: Place[];
  cheapestPlaces: Place[];
  calmPlaces: Place[];
  selectedCategories: Category[];
  toggleCategory: (category: Category) => void;
}) {
  const filtered = props.places.filter((place) =>
    props.selectedCategories.includes(place.category),
  );
  const visible = filtered.length ? filtered : props.places;

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <Section title="Фильтр мест">
        <View style={styles.chipsWrap}>
          {(
            [
              "sight",
              "museum",
              "food",
              "shop",
              "nature",
              "night",
              "family",
            ] as Category[]
          ).map((cat) => {
            const active = props.selectedCategories.includes(cat);
            return (
              <Pressable
                key={cat}
                onPress={() => props.toggleCategory(cat)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {categoryLabels[cat]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Section>

      <Section title="Где дешевле">
        {props.cheapestPlaces.slice(0, 3).map((place) => (
          <CompactPlace key={place.id} place={place} country={props.country} />
        ))}
      </Section>

      <Section title="Где меньше людей">
        {props.calmPlaces.slice(0, 3).map((place) => (
          <CompactPlace key={place.id} place={place} country={props.country} />
        ))}
      </Section>

      <Section title="Все точки">
        {visible.map((place) => (
          <PlaceCard key={place.id} place={place} country={props.country} />
        ))}
      </Section>
    </ScrollView>
  );
}

function TaxiScreen({
  country,
  route,
  nextPoint,
}: {
  country: Country;
  route: RouteStep[];
  nextPoint?: RouteStep;
}) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.summaryCard}>
        <Text style={styles.kicker}>ТАКСИ МЕЖДУ ТОЧКАМИ</Text>
        <Text style={styles.summaryTitle}>Каждый переезд виден отдельно</Text>
        <Text style={styles.cardMuted}>
          Кнопка открывает Яндекс/карты с маршрутом до следующей точки.
        </Text>
      </View>

      {nextPoint && (
        <Pressable
          style={styles.primaryButton}
          onPress={() => openTaxi(null, nextPoint)}
        >
          <Text style={styles.primaryButtonText}>
            Вызвать такси до: {nextPoint.title}
          </Text>
          <Ionicons name="car" size={20} color={colors.dark} />
        </Pressable>
      )}

      {route.map((step, index) => {
        const previous = index > 0 ? route[index - 1] : null;
        return (
          <View key={step.id} style={styles.taxiCard}>
            <Text style={styles.placeTitle}>
              {index === 0 ? "Старт" : previous?.title} → {step.title}
            </Text>
            <Text style={styles.cardMuted}>{step.transportText}</Text>
            <Text style={styles.bigMoney}>{money(step.taxiUZS, country)}</Text>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => openTaxi(previous, step)}
            >
              <Ionicons name="car" size={17} color={colors.dark} />
              <Text style={styles.secondaryButtonText}>
                Открыть такси / карту
              </Text>
            </Pressable>
          </View>
        );
      })}
    </ScrollView>
  );
}

function BudgetScreen(props: {
  country: Country;
  budgetUZS: number;
  routeTotal: number;
  remaining: number;
  routeEntry: number;
  routeSpend: number;
  routeTaxi: number;
  route: RouteStep[];
}) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.summaryCard}>
        <Text style={styles.kicker}>КОШЕЛЕК ПОЕЗДКИ</Text>
        <Text style={styles.summaryTitle}>
          {money(props.routeTotal, props.country)} из{" "}
          {money(props.budgetUZS, props.country)}
        </Text>
        <Text style={styles.cardMuted}>
          Остаток: {money(props.remaining, props.country)}
        </Text>
      </View>

      <ExpenseRow
        icon="ticket"
        title="Билеты / музеи"
        value={money(props.routeEntry, props.country)}
      />
      <ExpenseRow
        icon="restaurant"
        title="Еда / покупки"
        value={money(props.routeSpend, props.country)}
      />
      <ExpenseRow
        icon="car"
        title="Такси / транспорт"
        value={money(props.routeTaxi, props.country)}
      />
      <ExpenseRow
        icon="wallet"
        title="Итого"
        value={money(props.routeTotal, props.country)}
      />

      <Section title="Расходы по точкам">
        {props.route.map((step) => (
          <View key={step.id} style={styles.expenseCard}>
            <Text style={styles.cardTitle}>{step.title}</Text>
            <Text style={styles.cardMuted}>
              Вход {money(step.entryUZS, props.country)} • траты{" "}
              {money(step.minSpendUZS, props.country)} • такси{" "}
              {money(step.taxiUZS, props.country)}
            </Text>
          </View>
        ))}
      </Section>
    </ScrollView>
  );
}

function SosScreen({ country }: { country: Country }) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.sosHero}>
        <Ionicons name="shield-checkmark" size={42} color="#FB7185" />
        <Text style={styles.sosTitle}>Экстренная помощь</Text>
        <Text style={styles.cardMuted}>
          Звонок откроется прямо на телефоне. Номера зависят от выбранной
          страны.
        </Text>
      </View>

      <SosButton
        title="Полиция"
        number={country.emergency.police}
        icon="shield"
      />
      <SosButton
        title="Скорая помощь"
        number={country.emergency.ambulance}
        icon="medkit"
      />
      <SosButton
        title="Пожарная служба"
        number={country.emergency.fire}
        icon="flame"
      />
      <SosButton
        title="Туристическая помощь"
        number={country.emergency.tourist}
        icon="help-circle"
      />

      <View style={styles.summaryCard}>
        <Text style={styles.kicker}>ФРАЗА ДЛЯ МЕСТНЫХ</Text>
        <Text style={styles.cardTitle}>
          Помогите, пожалуйста. Мне нужно вызвать помощь и добраться до
          безопасного места.
        </Text>
      </View>
    </ScrollView>
  );
}

function AiScreen({
  messages,
  chatText,
  setChatText,
  onSend,
}: {
  messages: ChatMessage[];
  chatText: string;
  setChatText: (value: string) => void;
  onSend: () => void;
}) {
  return (
    <View style={styles.aiWrap}>
      <ScrollView
        contentContainerStyle={styles.chatPad}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((message) => (
          <View
            key={message.id}
            style={[
              styles.bubble,
              message.role === "user"
                ? styles.userBubble
                : styles.assistantBubble,
            ]}
          >
            <Text
              style={[
                styles.bubbleText,
                message.role === "user" && styles.userBubbleText,
              ]}
            >
              {message.text}
            </Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputRow}>
        <TextInput
          value={chatText}
          onChangeText={setChatText}
          placeholder="Спроси: где дешевле, такси, SOS, где меньше людей..."
          placeholderTextColor={colors.muted}
          style={styles.chatInput}
          multiline
        />
        <Pressable style={styles.sendButton} onPress={onSend}>
          <Ionicons name="send" size={18} color={colors.dark} />
        </Pressable>
      </View>
    </View>
  );
}

function ProfileScreen({
  country,
  cityName,
  savedRoutes,
  budgetUZS,
  route,
}: {
  country: Country;
  cityName: string;
  savedRoutes: RouteStep[][];
  budgetUZS: number;
  route: RouteStep[];
}) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileHero}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={36} color={colors.dark} />
        </View>
        <Text style={styles.profileName}>Гость TripMate</Text>
        <Text style={styles.cardMuted}>Профиль путешественника</Text>
      </View>

      <View style={styles.statGrid}>
        <MiniStat label="Страна" value={`${country.emoji} ${country.name}`} />
        <MiniStat label="Город" value={cityName} />
        <MiniStat label="Бюджет" value={money(budgetUZS, country)} />
      </View>

      <Section title="Сохраненные маршруты">
        {savedRoutes.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.cardTitle}>Пока нет сохраненных маршрутов</Text>
            <Text style={styles.cardMuted}>
              Открой вкладку “Маршрут” и нажми сохранить.
            </Text>
          </View>
        ) : (
          savedRoutes.map((saved, index) => (
            <View key={index} style={styles.expenseCard}>
              <Text style={styles.cardTitle}>Маршрут #{index + 1}</Text>
              <Text style={styles.cardMuted}>
                {saved.map((item) => item.title).join(" → ")}
              </Text>
            </View>
          ))
        )}
      </Section>

      <Section title="Текущая логика">
        <ProfileRow
          icon="cash"
          title="Подбор по бюджету"
          value={money(budgetUZS, country)}
        />
        <ProfileRow
          icon="car"
          title="Такси между точками"
          value={`${Math.max(route.length - 1, 0)} переездов`}
        />
        <ProfileRow
          icon="shield"
          title="SOS"
          value={`Полиция ${country.emergency.police}`}
        />
        <ProfileRow
          icon="cloud-offline"
          title="Офлайн-пакеты"
          value="Следующий этап"
        />
      </Section>
    </ScrollView>
  );
}

function PlaceCard({ place, country }: { place: Place; country: Country }) {
  return (
    <View style={styles.placeCard}>
      <View style={styles.cardTop}>
        <Text style={styles.badge}>{categoryLabels[place.category]}</Text>
        <Text style={[styles.crowdText, { color: crowdColors[place.crowd] }]}>
          {crowdLabels[place.crowd]}
        </Text>
      </View>
      <Text style={styles.placeTitle}>{place.title}</Text>
      <Text style={styles.cardMuted}>{place.subtitle}</Text>
      <Text style={styles.info}>
        ⭐ {place.rating} • {place.bestTime} • {place.durationMin} мин
      </Text>
      <Text style={styles.info}>
        Цена: {money(place.entryUZS + place.minSpendUZS, country)}
      </Text>
      <Text style={styles.tip}>Дешевле: {place.cheapTip}</Text>
      <View style={styles.actionRow}>
        <Pressable style={styles.darkButton} onPress={() => openMaps(place)}>
          <Ionicons name="map" size={17} color={colors.text} />
          <Text style={styles.darkButtonText}>Карта</Text>
        </Pressable>
        <Pressable
          style={styles.secondaryButton}
          onPress={() => openTaxi(null, place)}
        >
          <Ionicons name="car" size={17} color={colors.dark} />
          <Text style={styles.secondaryButtonText}>Такси</Text>
        </Pressable>
      </View>
    </View>
  );
}

function CompactPlace({ place, country }: { place: Place; country: Country }) {
  return (
    <Pressable style={styles.compactCard} onPress={() => openMaps(place)}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{place.title}</Text>
        <Text style={styles.cardMuted}>
          {categoryLabels[place.category]} •{" "}
          {money(place.entryUZS + place.minSpendUZS, country)}
        </Text>
      </View>
      <Text style={[styles.crowdText, { color: crowdColors[place.crowd] }]}>
        {crowdLabels[place.crowd]}
      </Text>
    </Pressable>
  );
}

function ExpenseRow({
  icon,
  title,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
}) {
  return (
    <View style={styles.expenseRow}>
      <Ionicons name={icon} size={22} color={colors.accent} />
      <Text style={styles.expenseTitle}>{title}</Text>
      <Text style={styles.expenseValue}>{value}</Text>
    </View>
  );
}

function SosButton({
  title,
  number,
  icon,
}: {
  title: string;
  number: string;
  icon: keyof typeof Ionicons.glyphMap;
}) {
  return (
    <Pressable style={styles.sosButton} onPress={() => callNumber(number)}>
      <Ionicons name={icon} size={24} color="#FFF" />
      <View style={{ flex: 1 }}>
        <Text style={styles.sosButtonTitle}>{title}</Text>
        <Text style={styles.sosNumber}>{number}</Text>
      </View>
      <Ionicons name="call" size={22} color="#FFF" />
    </Pressable>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniLabel}>{label}</Text>
      <Text style={styles.miniValue}>{value}</Text>
    </View>
  );
}

function ProfileRow({
  icon,
  title,
  value,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
}) {
  return (
    <View style={styles.profileRow}>
      <Ionicons name={icon} size={20} color={colors.accent} />
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardMuted}>{value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.muted} />
    </View>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function BottomTabs({
  active,
  setActive,
}: {
  active: Tab;
  setActive: (tab: Tab) => void;
}) {
  const tabs: {
    id: Tab;
    title: string;
    icon: keyof typeof Ionicons.glyphMap;
  }[] = [
    { id: "home", title: "Главная", icon: "sparkles" },
    { id: "route", title: "Маршрут", icon: "map" },
    { id: "places", title: "Места", icon: "business" },
    { id: "taxi", title: "Такси", icon: "car" },
    { id: "budget", title: "Бюджет", icon: "wallet" },
    { id: "sos", title: "SOS", icon: "shield" },
    { id: "ai", title: "AI", icon: "chatbubble" },
    { id: "profile", title: "Профиль", icon: "person-circle" },
  ];

  return (
    <View style={styles.tabs}>
      {tabs.map((tab) => {
        const isActive = active === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => setActive(tab.id)}
            style={[styles.tab, isActive && styles.tabActive]}
          >
            <Ionicons
              name={tab.icon}
              size={17}
              color={isActive ? colors.dark : colors.muted}
            />
            <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
              {tab.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const colors = {
  bg: "#111827",
  panel: "#1F2937",
  panel2: "#243142",
  border: "rgba(255,255,255,0.12)",
  text: "#F9FAFB",
  muted: "#94A3B8",
  soft: "#CBD5E1",
  accent: "#93C5FD",
  green: "#86EFAC",
  dark: "#101828",
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg },
  app: { flex: 1, backgroundColor: colors.bg },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 10 : 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: {
    color: colors.text,
    fontSize: 27,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  headerSub: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2,
  },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 7 },
  pill: {
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 999,
  },
  goodPill: { backgroundColor: "rgba(74,222,128,0.18)" },
  badPill: { backgroundColor: "rgba(251,113,133,0.18)" },
  pillText: { color: colors.text, fontSize: 11, fontWeight: "900" },
  content: { flex: 1 },
  contentPad: { padding: 16, paddingBottom: 122 },
  hero: {
    backgroundColor: colors.panel,
    borderRadius: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: 20,
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    right: -80,
    top: -80,
    backgroundColor: "rgba(147,197,253,0.16)",
  },
  kicker: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  heroTitle: {
    color: colors.text,
    fontSize: 31,
    lineHeight: 36,
    fontWeight: "900",
    marginTop: 10,
  },
  heroText: { color: colors.soft, fontSize: 14, lineHeight: 21, marginTop: 10 },
  section: { marginBottom: 22 },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },
  row: { gap: 10, paddingRight: 12 },
  countryCard: {
    width: 145,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 14,
  },
  countryEmoji: { fontSize: 26, marginBottom: 8 },
  cityCard: {
    width: 178,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 14,
  },
  activeCard: { borderColor: colors.accent, backgroundColor: "#2B3B52" },
  cardTitle: { color: colors.text, fontSize: 15, fontWeight: "900" },
  cardMuted: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  inputBox: {
    marginTop: 10,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    paddingHorizontal: 13,
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  input: { color: colors.text, flex: 1, fontWeight: "800" },
  budgetBox: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  budgetInput: {
    flex: 1,
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    paddingVertical: 4,
  },
  currency: { color: colors.accent, fontWeight: "900", fontSize: 16 },
  quickRow: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 },
  quickChip: {
    backgroundColor: colors.panel2,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.border,
  },
  quickChipText: { color: colors.soft, fontWeight: "800", fontSize: 12 },
  segmentRow: { flexDirection: "row", gap: 8 },
  segment: {
    flex: 1,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    minHeight: 46,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentActive: { backgroundColor: colors.accent },
  segmentText: { color: colors.soft, fontWeight: "900" },
  segmentTextActive: { color: colors.dark },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipActive: { backgroundColor: colors.accent, borderColor: "#BFDBFE" },
  chipText: { color: colors.soft, fontWeight: "900" },
  chipTextActive: { color: colors.dark },
  summaryCard: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 26,
    padding: 17,
    marginBottom: 16,
  },
  summaryTitle: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 20,
    marginTop: 7,
  },
  statGrid: { flexDirection: "row", gap: 8, marginTop: 14 },
  miniStat: {
    flex: 1,
    backgroundColor: colors.panel2,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  miniLabel: { color: colors.muted, fontWeight: "800", fontSize: 11 },
  miniValue: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 12,
    marginTop: 5,
  },
  primaryButton: {
    backgroundColor: colors.accent,
    borderRadius: 22,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: { color: colors.dark, fontSize: 16, fontWeight: "900" },
  routeCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 26,
    padding: 14,
    marginBottom: 13,
  },
  stepCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  stepCircleText: { color: colors.dark, fontWeight: "900" },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    alignItems: "center",
  },
  timeText: { color: colors.accent, fontWeight: "900" },
  crowdText: { fontWeight: "900", fontSize: 12 },
  placeTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 6,
  },
  info: { color: colors.soft, fontWeight: "700", marginTop: 8, lineHeight: 19 },
  tip: { color: "#E0F2FE", marginTop: 9, lineHeight: 19 },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  secondaryButton: {
    flex: 1,
    backgroundColor: colors.accent,
    borderRadius: 16,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
  },
  secondaryButtonText: { color: colors.dark, fontWeight: "900", fontSize: 12 },
  darkButton: {
    flex: 1,
    backgroundColor: colors.panel2,
    borderRadius: 16,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    borderWidth: 1,
    borderColor: colors.border,
  },
  darkButtonText: { color: colors.text, fontWeight: "900", fontSize: 12 },
  placeCard: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 15,
    marginBottom: 12,
  },
  compactCard: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 13,
    marginBottom: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  badge: {
    color: colors.dark,
    backgroundColor: colors.accent,
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontWeight: "900",
    fontSize: 11,
  },
  taxiCard: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 15,
    marginBottom: 12,
  },
  bigMoney: {
    color: colors.green,
    fontSize: 22,
    fontWeight: "900",
    marginVertical: 10,
  },
  expenseRow: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  expenseTitle: { color: colors.text, fontWeight: "900", flex: 1 },
  expenseValue: { color: colors.green, fontWeight: "900" },
  expenseCard: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 13,
    marginBottom: 8,
  },
  sosHero: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  sosTitle: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    marginTop: 10,
  },
  sosButton: {
    backgroundColor: "#DC2626",
    borderRadius: 22,
    padding: 16,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  sosButtonTitle: { color: "#FFF", fontSize: 17, fontWeight: "900" },
  sosNumber: { color: "#FECACA", marginTop: 3, fontWeight: "800" },
  aiWrap: { flex: 1, paddingBottom: 88 },
  chatPad: { padding: 16, paddingBottom: 18 },
  bubble: { maxWidth: "84%", padding: 14, borderRadius: 22, marginBottom: 10 },
  assistantBubble: {
    backgroundColor: colors.panel,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
  },
  userBubble: { backgroundColor: colors.accent, alignSelf: "flex-end" },
  bubbleText: { color: colors.text, lineHeight: 20, fontWeight: "600" },
  userBubbleText: { color: colors.dark },
  inputRow: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderTopWidth: 1,
    borderColor: colors.border,
  },
  chatInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: colors.panel,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: colors.border,
    color: colors.text,
    fontWeight: "700",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  profileHero: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 28,
    padding: 20,
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  profileName: { color: colors.text, fontSize: 24, fontWeight: "900" },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 14,
    marginBottom: 10,
  },
  emptyCard: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 16,
  },
  tabs: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 10,
    backgroundColor: "#182230",
    borderRadius: 26,
    padding: 6,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    paddingVertical: 8,
  },
  tabActive: { backgroundColor: colors.accent },
  tabText: {
    color: colors.muted,
    fontWeight: "900",
    fontSize: 8,
    marginTop: 2,
  },
  tabTextActive: { color: colors.dark },
});
