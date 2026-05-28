import { StatusBar } from "expo-status-bar";
import * as Speech from "expo-speech";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  Vibration,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Tab =
  | "home"
  | "route"
  | "discover"
  | "taxi"
  | "budget"
  | "offers"
  | "voice"
  | "sos";
type Category =
  | "sight"
  | "museum"
  | "food"
  | "shop"
  | "nature"
  | "family"
  | "night"
  | "deal";
type Crowd = "low" | "medium" | "high";
type Mood = "calm" | "family" | "romantic" | "active" | "shopping";
type GuideCallPhase = "incoming" | "active";

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
  hero: string;
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
  deal?: string;
  discountPercent?: number;
  cheapTip: string;
  safetyTip: string;
  whyGo: string;
};

type SmartAlert = {
  id: string;
  type: "deal" | "crowd" | "safety" | "route" | "food";
  title: string;
  text: string;
  placeId?: string;
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
    id: "us",
    name: "США",
    emoji: "🇺🇸",
    currency: "USD",
    emergency: { police: "911", ambulance: "911", fire: "911", tourist: "911" },
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
];

const cities: City[] = [
  // Uzbekistan
  {
    id: "tashkent",
    countryId: "uz",
    name: "Ташкент",
    subtitle: "Базары, парки, современный город",
    hero: "Восточный вайб + современный город",
    taxiBaseUZS: 12000,
    taxiKmUZS: 3200,
  },
  {
    id: "samarkand",
    countryId: "uz",
    name: "Самарканд",
    subtitle: "Регистан, Шахи-Зинда, базары",
    hero: "Город великих куполов и легенд",
    taxiBaseUZS: 10000,
    taxiKmUZS: 3000,
  },
  {
    id: "bukhara",
    countryId: "uz",
    name: "Бухара",
    subtitle: "Старый город, минареты, ремесла",
    hero: "Медленный восточный город для прогулок",
    taxiBaseUZS: 10000,
    taxiKmUZS: 2800,
  },
  {
    id: "khiva",
    countryId: "uz",
    name: "Хива",
    subtitle: "Ичан-Кала, крепостные стены",
    hero: "Город-музей под открытым небом",
    taxiBaseUZS: 9000,
    taxiKmUZS: 2600,
  },
  {
    id: "fergana",
    countryId: "uz",
    name: "Фергана",
    subtitle: "Долина, ремесла, чайханы",
    hero: "Спокойная Ферганская долина",
    taxiBaseUZS: 9000,
    taxiKmUZS: 2500,
  },
  {
    id: "andijan",
    countryId: "uz",
    name: "Андижан",
    subtitle: "Рынки, долина, локальная еда",
    hero: "Живой город Ферганской долины",
    taxiBaseUZS: 9000,
    taxiKmUZS: 2500,
  },
  {
    id: "namangan",
    countryId: "uz",
    name: "Наманган",
    subtitle: "Парки, цветы, местная жизнь",
    hero: "Зеленый город долины",
    taxiBaseUZS: 9000,
    taxiKmUZS: 2500,
  },
  {
    id: "nukus",
    countryId: "uz",
    name: "Нукус",
    subtitle: "Музей Савицкого, Каракалпакстан",
    hero: "Искусство и пустынные маршруты",
    taxiBaseUZS: 9000,
    taxiKmUZS: 2600,
  },
  {
    id: "termez",
    countryId: "uz",
    name: "Термез",
    subtitle: "Буддийские памятники, юг страны",
    hero: "Южный исторический маршрут",
    taxiBaseUZS: 9000,
    taxiKmUZS: 2600,
  },

  // UAE
  {
    id: "dubai",
    countryId: "ae",
    name: "Дубай",
    subtitle: "Mall, Creek, Marina, Burj Khalifa",
    hero: "Люкс, небоскребы и старые рынки",
    taxiBaseUZS: 19000,
    taxiKmUZS: 8500,
  },
  {
    id: "abudhabi",
    countryId: "ae",
    name: "Абу-Даби",
    subtitle: "Мечеть, Лувр, набережная",
    hero: "Культура, море и спокойный люкс",
    taxiBaseUZS: 18000,
    taxiKmUZS: 8000,
  },
  {
    id: "sharjah",
    countryId: "ae",
    name: "Шарджа",
    subtitle: "Музеи, рынки, семейный отдых",
    hero: "Культурная столица ОАЭ",
    taxiBaseUZS: 17000,
    taxiKmUZS: 7600,
  },
  {
    id: "rasalkhaimah",
    countryId: "ae",
    name: "Рас-эль-Хайма",
    subtitle: "Горы, пляжи, природа",
    hero: "Горы и море рядом",
    taxiBaseUZS: 17000,
    taxiKmUZS: 7600,
  },

  // Turkey
  {
    id: "istanbul",
    countryId: "tr",
    name: "Стамбул",
    subtitle: "Айя-София, Босфор, Гранд базар",
    hero: "Город между Европой и Азией",
    taxiBaseUZS: 17000,
    taxiKmUZS: 6500,
  },
  {
    id: "antalya",
    countryId: "tr",
    name: "Анталия",
    subtitle: "Море, старый город, водопады",
    hero: "Курортный город с историей",
    taxiBaseUZS: 15000,
    taxiKmUZS: 6000,
  },
  {
    id: "ankara",
    countryId: "tr",
    name: "Анкара",
    subtitle: "Музеи, столица, история",
    hero: "Спокойная столица Турции",
    taxiBaseUZS: 15000,
    taxiKmUZS: 5800,
  },
  {
    id: "izmir",
    countryId: "tr",
    name: "Измир",
    subtitle: "Набережная, рынки, Эгейское море",
    hero: "Морской город с легким настроением",
    taxiBaseUZS: 15000,
    taxiKmUZS: 5800,
  },
  {
    id: "cappadocia",
    countryId: "tr",
    name: "Каппадокия",
    subtitle: "Шары, долины, пещеры",
    hero: "Самый кинематографичный регион Турции",
    taxiBaseUZS: 16000,
    taxiKmUZS: 6500,
  },

  // Kazakhstan
  {
    id: "almaty",
    countryId: "kz",
    name: "Алматы",
    subtitle: "Горы, Кок-Тобе, кафе",
    hero: "Горы рядом с городом",
    taxiBaseUZS: 14000,
    taxiKmUZS: 4500,
  },
  {
    id: "astana",
    countryId: "kz",
    name: "Астана",
    subtitle: "Современная архитектура",
    hero: "Футуристичная столица",
    taxiBaseUZS: 14000,
    taxiKmUZS: 4500,
  },
  {
    id: "shymkent",
    countryId: "kz",
    name: "Шымкент",
    subtitle: "Юг, рынки, еда",
    hero: "Теплый южный город",
    taxiBaseUZS: 13000,
    taxiKmUZS: 4300,
  },
  {
    id: "aktau",
    countryId: "kz",
    name: "Актау",
    subtitle: "Каспий, скалы, море",
    hero: "Каспийский маршрут",
    taxiBaseUZS: 13000,
    taxiKmUZS: 4300,
  },

  // France
  {
    id: "paris",
    countryId: "fr",
    name: "Париж",
    subtitle: "Лувр, Эйфелева башня, Монмартр",
    hero: "Романтика, музеи и красивые улицы",
    taxiBaseUZS: 32000,
    taxiKmUZS: 12000,
  },
  {
    id: "nice",
    countryId: "fr",
    name: "Ницца",
    subtitle: "Лазурный берег, море, старый город",
    hero: "Французская Ривьера",
    taxiBaseUZS: 30000,
    taxiKmUZS: 11500,
  },
  {
    id: "lyon",
    countryId: "fr",
    name: "Лион",
    subtitle: "Гастрономия, старый город",
    hero: "Кулинарная столица Франции",
    taxiBaseUZS: 30000,
    taxiKmUZS: 11200,
  },
  {
    id: "marseille",
    countryId: "fr",
    name: "Марсель",
    subtitle: "Порт, море, южный вайб",
    hero: "Средиземноморская Франция",
    taxiBaseUZS: 30000,
    taxiKmUZS: 11200,
  },

  // Italy
  {
    id: "rome",
    countryId: "it",
    name: "Рим",
    subtitle: "Колизей, Ватикан, фонтаны",
    hero: "Античность, паста и прогулки",
    taxiBaseUZS: 28000,
    taxiKmUZS: 11000,
  },
  {
    id: "milan",
    countryId: "it",
    name: "Милан",
    subtitle: "Мода, Дуомо, шопинг",
    hero: "Стиль, мода и архитектура",
    taxiBaseUZS: 28000,
    taxiKmUZS: 11000,
  },
  {
    id: "venice",
    countryId: "it",
    name: "Венеция",
    subtitle: "Каналы, мосты, романтика",
    hero: "Город на воде",
    taxiBaseUZS: 26000,
    taxiKmUZS: 10500,
  },
  {
    id: "florence",
    countryId: "it",
    name: "Флоренция",
    subtitle: "Ренессанс, музеи, виды",
    hero: "Искусство и тосканская атмосфера",
    taxiBaseUZS: 26000,
    taxiKmUZS: 10500,
  },

  // USA
  {
    id: "nyc",
    countryId: "us",
    name: "Нью-Йорк",
    subtitle: "Times Square, парки, музеи",
    hero: "Большой город, энергия и события",
    taxiBaseUZS: 35000,
    taxiKmUZS: 15000,
  },
  {
    id: "losangeles",
    countryId: "us",
    name: "Лос-Анджелес",
    subtitle: "Пляжи, Голливуд, виды",
    hero: "Кино, океан и солнце",
    taxiBaseUZS: 35000,
    taxiKmUZS: 15000,
  },
  {
    id: "miami",
    countryId: "us",
    name: "Майами",
    subtitle: "Пляжи, арт-деко, ночная жизнь",
    hero: "Океан, музыка и яркость",
    taxiBaseUZS: 34000,
    taxiKmUZS: 14500,
  },
  {
    id: "lasvegas",
    countryId: "us",
    name: "Лас-Вегас",
    subtitle: "Шоу, казино, огни",
    hero: "Город развлечений",
    taxiBaseUZS: 33000,
    taxiKmUZS: 14000,
  },
  {
    id: "sanfrancisco",
    countryId: "us",
    name: "Сан-Франциско",
    subtitle: "Мост, холмы, залив",
    hero: "Виды, океан и техно-вайб",
    taxiBaseUZS: 35000,
    taxiKmUZS: 15000,
  },

  // Japan
  {
    id: "tokyo",
    countryId: "jp",
    name: "Токио",
    subtitle: "Сибуя, храмы, технологии",
    hero: "Будущее, традиции и идеальный сервис",
    taxiBaseUZS: 30000,
    taxiKmUZS: 12000,
  },
  {
    id: "kyoto",
    countryId: "jp",
    name: "Киото",
    subtitle: "Храмы, сады, традиции",
    hero: "Традиционная Япония",
    taxiBaseUZS: 28000,
    taxiKmUZS: 11000,
  },
  {
    id: "osaka",
    countryId: "jp",
    name: "Осака",
    subtitle: "Еда, огни, замок",
    hero: "Город еды и развлечений",
    taxiBaseUZS: 28000,
    taxiKmUZS: 11000,
  },
  {
    id: "nara",
    countryId: "jp",
    name: "Нара",
    subtitle: "Олени, храмы, парки",
    hero: "Спокойный древний город",
    taxiBaseUZS: 26000,
    taxiKmUZS: 10000,
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
    cheapTip: "Сувениры лучше сравнить в 2–3 местах.",
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
    deal: "Сегодня скидки на сухофрукты до 20%",
    discountPercent: 20,
    cheapTip: "Торгуйся спокойно. Нормально просить минус 15–25%.",
    safetyTip: "Людно, аккуратнее с кошельком и телефоном.",
    whyGo: "Живой рынок города, хороший для сувениров и фото.",
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
    deal: "Лучшее время до 13:00 — больше выбор",
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
    deal: "Вечером красивые фото бесплатно",
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
    deal: "Сладости дешевле в дальних рядах",
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
    deal: "Фудкорт дешевле ресторанов с видом",
    cheapTip: "Еда в фудкорте дешевле ресторанов с видом.",
    safetyTip: "Безопасно, но легко потратить лишнее.",
    whyGo: "Крупная туристическая точка с множеством активностей.",
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
    id: "paris-louvre",
    countryId: "fr",
    cityId: "paris",
    title: "Лувр",
    category: "museum",
    subtitle: "Один из главных музеев мира",
    address: "Rue de Rivoli",
    lat: 48.8606,
    lng: 2.3376,
    entryUZS: 280000,
    minSpendUZS: 50000,
    durationMin: 150,
    rating: 4.9,
    crowd: "high",
    bestTime: "09:00–11:00",
    openNow: true,
    cheapTip: "Покупай билет заранее, чтобы не терять время в очереди.",
    safetyTip: "У входов бывают карманники.",
    whyGo: "Главная музейная точка Парижа.",
  },
  {
    id: "tokyo-shibuya",
    countryId: "jp",
    cityId: "tokyo",
    title: "Shibuya Crossing",
    category: "sight",
    subtitle: "Знаменитый перекресток и неон",
    address: "Shibuya",
    lat: 35.6595,
    lng: 139.7005,
    entryUZS: 0,
    minSpendUZS: 110000,
    durationMin: 80,
    rating: 4.7,
    crowd: "high",
    bestTime: "18:00–21:00",
    openNow: true,
    deal: "Бесплатная фото-точка, траты только на кафе",
    cheapTip: "Лучшие фото можно сделать бесплатно с верхних этажей кафе.",
    safetyTip: "Очень людно, следи за группой.",
    whyGo: "Энергия современного Токио.",
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
    deal: "Бесплатная прогулка по центру",
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
    deal: "Еда дешевле в местах, где сидят местные",
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
    deal: "Бесплатная вечерняя прогулка",
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
    deal: "Сравни цены в 3 магазинах — можно сэкономить до 30%",
    cheapTip: "Не покупай в первой точке, сравни минимум 3 цены.",
    safetyTip: "Проверяй чек и упаковку.",
    whyGo: "Полезно для подарков и понимания цен.",
  },
  ,
  {
    title: "Кофейня / завтрак в центре",
    category: "food",
    subtitle: "Легкая утренняя точка перед прогулкой",
    address: "центр города",
    entryUZS: 0,
    minSpendUZS: 70000,
    durationMin: 50,
    rating: 4.4,
    crowd: "medium",
    bestTime: "09:00–10:30",
    openNow: true,
    deal: "Комбо-завтрак часто дешевле отдельных позиций",
    cheapTip: "Смотри сет-меню и завтраки до 11:00.",
    safetyTip: "Выбирай места с рейтингом и понятным меню.",
    whyGo: "Хорошее начало маршрута на весь день.",
  },
  {
    title: "Смотровая площадка / панорамная точка",
    category: "sight",
    subtitle: "Вид на город и красивые фото",
    address: "панорамная зона",
    entryUZS: 50000,
    minSpendUZS: 20000,
    durationMin: 60,
    rating: 4.5,
    crowd: "medium",
    bestTime: "16:30–18:00",
    openNow: true,
    deal: "Лучшее фото бесплатно на закате",
    cheapTip: "Приходи до заката, чтобы не платить за дорогие кафе с видом.",
    safetyTip: "Не подходи к краям и держи телефон крепко.",
    whyGo: "Добавляет вау-эффект в маршрут.",
  },
  {
    title: "Вечерняя улица / прогулочная зона",
    category: "night",
    subtitle: "Огни, кафе, музыка и финал дня",
    address: "вечерний район",
    entryUZS: 0,
    minSpendUZS: 100000,
    durationMin: 90,
    rating: 4.5,
    crowd: "medium",
    bestTime: "19:00–21:30",
    openNow: true,
    deal: "Вечером часто бывают акции на напитки и десерты",
    cheapTip: "Смотри меню у входа и не садись без цен.",
    safetyTip: "После 22:00 лучше возвращаться на такси.",
    whyGo: "Красивый финал маршрута на весь день.",
  },
  {
    title: "Локальная кондитерская / десерт",
    category: "food",
    subtitle: "Небольшая вкусная пауза",
    address: "центр города",
    entryUZS: 0,
    minSpendUZS: 45000,
    durationMin: 35,
    rating: 4.3,
    crowd: "low",
    bestTime: "15:00–16:00",
    openNow: true,
    deal: "Десерт дня может быть дешевле",
    cheapTip: "Бери локальный десерт, не туристический набор.",
    safetyTip: "Проверяй состав, если есть аллергии.",
    whyGo: "Дает отдых и не ломает бюджет.",
  },
];

const categoryLabels: Record<Category, string> = {
  sight: "Достопримеч.",
  museum: "Музеи",
  food: "Еда",
  shop: "Магазины",
  nature: "Природа",
  family: "Семья",
  night: "Вечер",
  deal: "Акции",
};

const categoryIcons: Record<Category, keyof typeof Ionicons.glyphMap> = {
  sight: "camera",
  museum: "business",
  food: "restaurant",
  shop: "bag",
  nature: "leaf",
  family: "people",
  night: "moon",
  deal: "pricetag",
};

const crowdLabels: Record<Crowd, string> = {
  low: "мало людей",
  medium: "средне",
  high: "много людей",
};

const crowdColors: Record<Crowd, string> = {
  low: "#22C55E",
  medium: "#FACC15",
  high: "#FB7185",
};

const ratesToUZS: Record<string, number> = {
  UZS: 1,
  AED: 3500,
  TRY: 400,
  KZT: 26,
  RUB: 150,
  EUR: 14000,
  USD: 13000,
  JPY: 90,
};

function countryById(id: string) {
  return countries.find((item) => item.id === id) ?? countries[0];
}

function cityById(id: string) {
  return cities.find((item) => item.id === id) ?? cities[0];
}

function convertFromUZS(valueUZS: number, country: Country) {
  const rate = ratesToUZS[country.currency] ?? 1;
  return Math.max(0, Math.round(valueUZS / rate));
}

function money(valueUZS: number, country: Country) {
  return `${convertFromUZS(valueUZS, country).toLocaleString("ru-RU")} ${country.currency}`;
}

function budgetToUZS(value: string, country: Country) {
  const numeric = Number(value.replace(/\D/g, ""));
  return Math.max(0, numeric * (ratesToUZS[country.currency] ?? 1));
}

function distanceKm(a: Place, b: Place) {
  return Math.max(
    1,
    Math.round(
      Math.sqrt(Math.pow(a.lat - b.lat, 2) + Math.pow(a.lng - b.lng, 2)) * 110,
    ),
  );
}

function taxiCost(distance: number, city: City) {
  return Math.round(city.taxiBaseUZS + distance * city.taxiKmUZS);
}

function fallbackPlaces(
  country: Country,
  city: City,
  customName: string,
): Place[] {
  return fallbackTemplates.map((template, index) => ({
    ...template,
    id: `fallback-${city.id}-${index}`,
    countryId: country.id,
    cityId: city.id,
    lat: 41 + index * 0.012,
    lng: 69 + index * 0.012,
    address: `${customName}, ${template.address}`,
  }));
}

function placesForCity(country: Country, city: City, customName: string) {
  const real = places.filter((place) => place.cityId === city.id);
  return real.length ? real : fallbackPlaces(country, city, customName);
}

function buildSmartRoute(params: {
  items: Place[];
  city: City;
  budgetUZS: number;
  selectedCategories: Category[];
  mood: Mood;
}) {
  const { items, city, budgetUZS, selectedCategories, mood } = params;

  const times = [
    "09:00",
    "10:15",
    "11:45",
    "13:15",
    "14:45",
    "16:15",
    "17:45",
    "19:15",
    "20:45",
    "22:00",
  ];

  const ranked = [...items].sort((a, b) => {
    const aCategory = selectedCategories.includes(a.category) ? 2 : 0;
    const bCategory = selectedCategories.includes(b.category) ? 2 : 0;
    const aCalm = a.crowd === "low" ? 1 : a.crowd === "medium" ? 0.4 : 0;
    const bCalm = b.crowd === "low" ? 1 : b.crowd === "medium" ? 0.4 : 0;
    const aDeal = a.deal ? 0.8 : 0;
    const bDeal = b.deal ? 0.8 : 0;
    const aMood =
      mood === "family" && a.category === "family"
        ? 1.2
        : mood === "shopping" && a.category === "shop"
          ? 1.2
          : mood === "calm" && a.crowd === "low"
            ? 1.2
            : mood === "romantic" &&
                ["sight", "nature", "night"].includes(a.category)
              ? 1
              : mood === "active" &&
                  ["sight", "museum", "food"].includes(a.category)
                ? 0.8
                : 0;
    const bMood =
      mood === "family" && b.category === "family"
        ? 1.2
        : mood === "shopping" && b.category === "shop"
          ? 1.2
          : mood === "calm" && b.crowd === "low"
            ? 1.2
            : mood === "romantic" &&
                ["sight", "nature", "night"].includes(b.category)
              ? 1
              : mood === "active" &&
                  ["sight", "museum", "food"].includes(b.category)
                ? 0.8
                : 0;

    return (
      bCategory +
      b.rating +
      bCalm +
      bDeal +
      bMood -
      (aCategory + a.rating + aCalm + aDeal + aMood)
    );
  });

  const routePool: Place[] = [...ranked];

  // Главное исправление: даже если в конкретном городе мало реальных точек,
  // мы добавляем универсальные точки дня, чтобы маршрут был полноценный с утра до вечера.
  fallbackTemplates.forEach((template, index) => {
    routePool.push({
      ...template,
      id: `day-fill-${city.id}-${index}`,
      countryId: city.countryId,
      cityId: city.id,
      lat: 41 + index * 0.012,
      lng: 69 + index * 0.012,
      address: template.address,
    });
  });

  const uniquePool = routePool.filter(
    (place, index, array) =>
      array.findIndex(
        (item) =>
          item.title === place.title && item.category === place.category,
      ) === index,
  );

  const result: RouteStep[] = [];
  let total = 0;

  uniquePool.forEach((place) => {
    const prev = result[result.length - 1];
    const km = prev ? distanceKm(prev, place) : 0;
    const taxi = prev ? taxiCost(km, city) : 0;
    const pointCost = place.entryUZS + place.minSpendUZS + taxi;

    // Для полного дня первые 8 точек добавляются обязательно,
    // а бюджет используется как расчет/предупреждение, а не как жесткий стоп.
    if (
      result.length < 10 &&
      (result.length < 8 || total + pointCost <= budgetUZS)
    ) {
      total += pointCost;
      result.push({
        ...place,
        order: result.length + 1,
        time: times[result.length] ?? "12:00",
        distanceKm: km,
        taxiUZS: taxi,
        transportText: prev
          ? `Такси ${km} км · ${Math.max(7, km * 4)} мин`
          : "Старт из отеля / текущей точки",
      });
    }
  });

  return result;
}

function buildAlerts(
  route: RouteStep[],
  placesList: Place[],
  country: Country,
): SmartAlert[] {
  const alerts: SmartAlert[] = [];
  const deal = placesList.find((place) => place.deal);
  const crowded = route.find((place) => place.crowd === "high");
  const cheap = [...placesList].sort(
    (a, b) => a.entryUZS + a.minSpendUZS - (b.entryUZS + b.minSpendUZS),
  )[0];
  const next = route[1] ?? route[0];

  if (deal) {
    alerts.push({
      id: "deal",
      type: "deal",
      title: "Акция рядом",
      text: `${deal.title}: ${deal.deal}`,
      placeId: deal.id,
    });
  }

  if (crowded) {
    alerts.push({
      id: "crowd",
      type: "crowd",
      title: "Много людей",
      text: `${crowded.title} сейчас может быть загружен. Лучше идти утром или после 17:00.`,
      placeId: crowded.id,
    });
  }

  if (cheap) {
    alerts.push({
      id: "cheap",
      type: "food",
      title: "Где дешевле",
      text: `${cheap.title} — примерно ${money(cheap.entryUZS + cheap.minSpendUZS, country)}.`,
      placeId: cheap.id,
    });
  }

  if (next) {
    alerts.push({
      id: "route",
      type: "route",
      title: "Следующая точка",
      text: `После текущей точки лучше ехать в ${next.title}. Такси примерно ${money(next.taxiUZS, country)}.`,
      placeId: next.id,
    });
  }

  alerts.push({
    id: "safety",
    type: "safety",
    title: "Безопасность",
    text: `SOS: полиция ${country.emergency.police}, скорая ${country.emergency.ambulance}, туристическая помощь ${country.emergency.tourist}.`,
  });

  return alerts;
}

function openMap(place: Place) {
  const url = Platform.select({
    ios: `http://maps.apple.com/?ll=${place.lat},${place.lng}&q=${encodeURIComponent(place.title)}`,
    android: `geo:${place.lat},${place.lng}?q=${encodeURIComponent(place.title)}`,
    default: `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`,
  });

  Linking.openURL(
    url ??
      `https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}`,
  ).catch(() => {
    Alert.alert("Карта", `${place.title}, ${place.address}`);
  });
}

function openTaxi(from: Place | null, to: Place) {
  const url = from
    ? `https://yandex.com/maps/?rtext=${from.lat},${from.lng}~${to.lat},${to.lng}&rtt=auto`
    : `https://yandex.com/maps/?ll=${to.lng},${to.lat}&z=15`;

  Linking.openURL(url).catch(() =>
    Alert.alert("Такси", `Куда ехать: ${to.title}, ${to.address}`),
  );
}

function callNumber(number: string) {
  Linking.openURL(`tel:${number}`).catch(() => Alert.alert("Номер", number));
}

function speak(text: string) {
  Speech.stop();
  Speech.speak(text, {
    language: "ru-RU",
    pitch: 1,
    rate: 0.92,
  });
}

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [countryId, setCountryId] = useState("uz");
  const [cityId, setCityId] = useState("tashkent");
  const [customCity, setCustomCity] = useState("");
  const [budgetInput, setBudgetInput] = useState("500000");
  const [mood, setMood] = useState<Mood>("active");
  const [selectedCategories, setSelectedCategories] = useState<Category[]>([
    "sight",
    "museum",
    "food",
    "shop",
  ]);
  const [chatText, setChatText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "hello",
      role: "assistant",
      text: "Привет. Я твой туристический помощник. Скажи бюджет, город или спроси: где дешевле, где меньше людей, вызови такси, покажи места.",
    },
  ]);
  const [guideCallOpen, setGuideCallOpen] = useState(false);
  const [guideCallPhase, setGuideCallPhase] =
    useState<GuideCallPhase>("incoming");
  const [guideCallText, setGuideCallText] = useState("");
  const [femaleVoiceId, setFemaleVoiceId] = useState<string | undefined>(
    undefined,
  );
  const guideCallTextRef = useRef("");

  const country = countryById(countryId);
  const city = cityById(cityId);
  const cityName = customCity.trim() || city.name;
  const cityOptions = cities.filter((item) => item.countryId === countryId);
  const budgetUZS = budgetToUZS(budgetInput, country);
  const cityPlaces = useMemo(
    () => placesForCity(country, city, cityName),
    [country.id, city.id, cityName],
  );

  const route = useMemo(
    () =>
      buildSmartRoute({
        items: cityPlaces,
        city,
        budgetUZS,
        selectedCategories,
        mood,
      }),
    [cityPlaces, city, budgetUZS, selectedCategories, mood],
  );

  const alerts = useMemo(
    () => buildAlerts(route, cityPlaces, country),
    [route, cityPlaces, country],
  );
  const total = route.reduce(
    (sum, item) => sum + item.entryUZS + item.minSpendUZS + item.taxiUZS,
    0,
  );
  const entryTotal = route.reduce((sum, item) => sum + item.entryUZS, 0);
  const spendTotal = route.reduce((sum, item) => sum + item.minSpendUZS, 0);
  const taxiTotal = route.reduce((sum, item) => sum + item.taxiUZS, 0);
  const remaining = budgetUZS - total;
  const nextPoint = route[1] ?? route[0];
  const dealPlaces = cityPlaces.filter((place) => place.deal);
  const calmPlaces = cityPlaces.filter((place) => place.crowd !== "high");
  const cheapPlaces = [...cityPlaces].sort(
    (a, b) => a.entryUZS + a.minSpendUZS - (b.entryUZS + b.minSpendUZS),
  );

  useEffect(() => {
    Speech.getAvailableVoicesAsync()
      .then((voices) => {
        const russianFemale =
          voices.find(
            (voice) =>
              voice.language?.toLowerCase().startsWith("ru") &&
              /female|woman|anna|milena|oksana|alena|yelena|katya|google/i.test(
                `${voice.name} ${voice.identifier}`,
              ),
          ) ??
          voices.find((voice) =>
            voice.language?.toLowerCase().startsWith("ru"),
          ) ??
          voices.find((voice) =>
            /female|woman|anna|milena|oksana|alena|yelena|katya|google/i.test(
              `${voice.name} ${voice.identifier}`,
            ),
          );

        setFemaleVoiceId(russianFemale?.identifier);
      })
      .catch(() => {
        setFemaleVoiceId(undefined);
      });
  }, []);

  useEffect(() => {
    if (guideCallOpen && guideCallPhase === "incoming") {
      Vibration.vibrate([0, 650, 260, 650, 260, 650], true);
      return () => Vibration.cancel();
    }

    Vibration.cancel();
    return undefined;
  }, [guideCallOpen, guideCallPhase]);

  const speakFemale = async (textToSpeak: string) => {
    const phrase = textToSpeak.trim();
    if (!phrase) return;

    Speech.stop();

    const baseOptions = {
      language: "ru-RU",
      pitch: 1.18,
      rate: 0.86,
    };

    const trySpeak = (withVoice: boolean) => {
      Speech.speak(phrase, {
        ...baseOptions,
        ...(withVoice && femaleVoiceId ? { voice: femaleVoiceId } : {}),
        onError: () => {
          Speech.stop();
          Speech.speak(phrase, baseOptions);
        },
      });
    };

    trySpeak(Boolean(femaleVoiceId));

    // На части Android-устройств выбранный voice может молча не проиграться.
    // Поэтому через секунду проверяем, идет ли речь, и запускаем системный голос без voice-id.
    setTimeout(async () => {
      try {
        const isSpeaking = await Speech.isSpeakingAsync();
        if (!isSpeaking) {
          Speech.stop();
          Speech.speak(phrase, baseOptions);
        }
      } catch {
        Speech.stop();
        Speech.speak(phrase, baseOptions);
      }
    }, 1100);
  };

  const setCountry = (id: string) => {
    setCountryId(id);
    const firstCity = cities.find((item) => item.countryId === id);
    if (firstCity) {
      setCityId(firstCity.id);
      setCustomCity("");
    }
  };

  const toggleCategory = (category: Category) => {
    setSelectedCategories((current) =>
      current.includes(category)
        ? current.filter((item) => item !== category)
        : [...current, category],
    );
  };

  const assistantReply = (text: string) => {
    const lower = text.toLowerCase();
    let answer = `Я подобрал маршрут по ${cityName}: ${route.map((item) => item.title).join(" → ")}. Итого ${money(total, country)}, остаток ${money(remaining, country)}.`;

    if (
      lower.includes("дешев") ||
      lower.includes("акци") ||
      lower.includes("скидк")
    ) {
      const cheap = cheapPlaces[0];
      const deal = dealPlaces[0];
      answer = deal
        ? `Есть рекомендация: ${deal.title}. ${deal.deal}. Еще дешевый вариант: ${cheap.title}, примерно ${money(cheap.entryUZS + cheap.minSpendUZS, country)}.`
        : `Самый дешевый вариант: ${cheap.title}, примерно ${money(cheap.entryUZS + cheap.minSpendUZS, country)}. ${cheap.cheapTip}`;
      setTab("offers");
    }

    if (
      lower.includes("людей") ||
      lower.includes("толп") ||
      lower.includes("спокой")
    ) {
      answer = calmPlaces.length
        ? `Где меньше людей: ${calmPlaces.map((item) => item.title).join(", ")}.`
        : "Сейчас популярные точки загружены. Лучше идти утром или ближе к вечеру.";
      setTab("discover");
    }

    if (lower.includes("такси") || lower.includes("яндекс")) {
      if (nextPoint) {
        answer = `Открываю маршрут до ${nextPoint.title}. Примерное такси: ${money(nextPoint.taxiUZS, country)}.`;
        openTaxi(null, nextPoint);
        setTab("taxi");
      } else {
        answer =
          "Сначала построй маршрут, потом я смогу открыть такси до следующей точки.";
      }
    }

    if (
      lower.includes("мест") ||
      lower.includes("покажи") ||
      lower.includes("куда")
    ) {
      answer = `Показываю места для ${cityName}: ${cityPlaces.map((item) => item.title).join(", ")}.`;
      setTab("discover");
    }

    if (
      lower.includes("полици") ||
      lower.includes("скор") ||
      lower.includes("sos") ||
      lower.includes("помощ")
    ) {
      answer = `Экстренные номера: полиция ${country.emergency.police}, скорая ${country.emergency.ambulance}, пожарная ${country.emergency.fire}, туристическая помощь ${country.emergency.tourist}.`;
      setTab("sos");
    }

    return answer;
  };

  const sendChat = () => {
    const text = chatText.trim();
    if (!text) return;

    const answer = assistantReply(text);
    setMessages((current) => [
      ...current,
      { id: `u-${Date.now()}`, role: "user", text },
      { id: `a-${Date.now()}`, role: "assistant", text: answer },
    ]);
    setChatText("");
    speakFemale(answer);
  };

  const quickVoice = (command: string) => {
    const answer = assistantReply(command);
    setMessages((current) => [
      ...current,
      { id: `u-${Date.now()}`, role: "user", text: command },
      { id: `a-${Date.now()}`, role: "assistant", text: answer },
    ]);
    speakFemale(answer);
  };

  const startGuideCall = () => {
    const plan = route.length
      ? route
          .map((item, index) => `${index + 1}. ${item.time} — ${item.title}`)
          .join(". ")
      : "сначала выберу лучшие точки города, потом рассчитаю такси и бюджет.";

    const intro = `Привет, красавчик. Я твоя персональная туристическая ассистентка. Сейчас соберу тебе красивый маршрут на весь день. Слушай план: ${plan}. По деньгам выходит примерно ${money(total, country)}. Остаток: ${money(remaining, country)}. Я буду вести тебя от точки к точке, подсказывать где дешевле, где много людей и когда лучше вызвать такси.`;

    guideCallTextRef.current = intro;
    setGuideCallText(intro);
    setGuideCallPhase("incoming");
    setGuideCallOpen(true);
  };

  const acceptGuideCall = () => {
    const phrase = guideCallTextRef.current || guideCallText;
    setGuideCallPhase("active");
    setTab("route");
    Vibration.cancel();

    // Даем модалке переключиться в состояние "звонок активен", затем запускаем речь.
    setTimeout(() => {
      speakFemale(phrase);
    }, 450);
  };

  const closeGuideCall = () => {
    Speech.stop();
    Vibration.cancel();
    setGuideCallOpen(false);
    setGuideCallPhase("incoming");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.app}>
        <Header
          cityName={cityName}
          country={country}
          total={total}
          budgetUZS={budgetUZS}
        />

        {tab === "home" && (
          <HomeScreen
            country={country}
            countryId={countryId}
            setCountry={setCountry}
            cityId={cityId}
            cityOptions={cityOptions}
            setCityId={(id) => {
              setCityId(id);
              setCustomCity("");
            }}
            customCity={customCity}
            setCustomCity={(value) => {
              setCustomCity(value);
              if (value.trim()) {
                setCityId(`custom-${country.id}`);
              }
            }}
            budgetInput={budgetInput}
            setBudgetInput={setBudgetInput}
            mood={mood}
            setMood={setMood}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            alerts={alerts}
            route={route}
            total={total}
            budgetUZS={budgetUZS}
            remaining={remaining}
            onBuild={() => setTab("route")}
            onVoice={() => setTab("voice")}
            onGuideCall={startGuideCall}
          />
        )}

        {tab === "route" && (
          <RouteScreen
            country={country}
            route={route}
            total={total}
            budgetUZS={budgetUZS}
            remaining={remaining}
          />
        )}
        {tab === "discover" && (
          <DiscoverScreen
            country={country}
            places={cityPlaces}
            selectedCategories={selectedCategories}
            toggleCategory={toggleCategory}
            cheapPlaces={cheapPlaces}
            calmPlaces={calmPlaces}
          />
        )}
        {tab === "taxi" && (
          <TaxiScreen country={country} route={route} nextPoint={nextPoint} />
        )}
        {tab === "budget" && (
          <BudgetScreen
            country={country}
            budgetUZS={budgetUZS}
            total={total}
            remaining={remaining}
            entryTotal={entryTotal}
            spendTotal={spendTotal}
            taxiTotal={taxiTotal}
            route={route}
          />
        )}
        {tab === "offers" && (
          <OffersScreen
            country={country}
            alerts={alerts}
            dealPlaces={dealPlaces}
            cheapPlaces={cheapPlaces}
          />
        )}
        {tab === "voice" && (
          <VoiceScreen
            messages={messages}
            chatText={chatText}
            setChatText={setChatText}
            sendChat={sendChat}
            quickVoice={quickVoice}
          />
        )}
        {tab === "sos" && <SosScreen country={country} />}

        <GuideCallModal
          visible={guideCallOpen}
          phase={guideCallPhase}
          text={guideCallText}
          nextPoint={nextPoint}
          onAccept={acceptGuideCall}
          onClose={closeGuideCall}
          onReplay={() =>
            speakFemale(guideCallTextRef.current || guideCallText)
          }
          onTaxi={() => {
            if (nextPoint) openTaxi(null, nextPoint);
          }}
        />

        <BottomTabs active={tab} setActive={setTab} />
      </View>
    </SafeAreaView>
  );
}

function Header({
  cityName,
  country,
  total,
  budgetUZS,
}: {
  cityName: string;
  country: Country;
  total: number;
  budgetUZS: number;
}) {
  const ok = total <= budgetUZS;
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.logo}>TripMate</Text>
        <Text style={styles.headerSub}>tourist AI guide</Text>
      </View>

      <View style={styles.headerRight}>
        <View style={styles.headerPill}>
          <Text style={styles.headerPillText}>
            {country.emoji} {cityName}
          </Text>
        </View>
        <View
          style={[styles.headerPill, ok ? styles.goodPill : styles.badPill]}
        >
          <Text style={styles.headerPillText}>{ok ? "OK" : "OVER"}</Text>
        </View>
      </View>
    </View>
  );
}

function HomeScreen(props: {
  country: Country;
  countryId: string;
  setCountry: (id: string) => void;
  cityId: string;
  cityOptions: City[];
  setCityId: (id: string) => void;
  customCity: string;
  setCustomCity: (value: string) => void;
  budgetInput: string;
  setBudgetInput: (value: string) => void;
  mood: Mood;
  setMood: (value: Mood) => void;
  selectedCategories: Category[];
  toggleCategory: (category: Category) => void;
  alerts: SmartAlert[];
  route: RouteStep[];
  total: number;
  budgetUZS: number;
  remaining: number;
  onBuild: () => void;
  onVoice: () => void;
  onGuideCall: () => void;
}) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.sun} />
        <View style={styles.heroBadge}>
          <Ionicons name="navigate" size={15} color={colors.dark} />
          <Text style={styles.heroBadgeText}>LIVE TOURIST GUIDE</Text>
        </View>
        <Text style={styles.heroTitle}>
          Твой личный гид, который сам ведет по городу
        </Text>
        <Text style={styles.heroText}>
          Маршрут на весь день, такси, скидки, акции, предупреждения, бюджет,
          SOS и голосовой помощник в одном приложении.
        </Text>

        <View style={styles.heroButtons}>
          <Pressable style={styles.primaryButton} onPress={props.onBuild}>
            <Text style={styles.primaryButtonText}>Построить маршрут</Text>
            <Ionicons name="arrow-forward" size={19} color={colors.dark} />
          </Pressable>
          <Pressable style={styles.voiceButton} onPress={props.onVoice}>
            <Ionicons name="mic" size={20} color={colors.text} />
          </Pressable>
        </View>

        <Pressable style={styles.guideCallButton} onPress={props.onGuideCall}>
          <View style={styles.guideAvatarSmall}>
            <Ionicons name="call" size={18} color={colors.dark} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.guideCallTitle}>
              Помоги составить маршрут сама
            </Text>
            <Text style={styles.guideCallSub}>
              Персональная ассистентка озвучит план на весь день
            </Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color={colors.soft} />
        </Pressable>
      </View>

      <Section title="Умные рекомендации сейчас">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {props.alerts.map((alert) => (
            <AlertCard key={alert.id} alert={alert} />
          ))}
        </ScrollView>
      </Section>

      <Section title="Страна">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {countries.map((country) => (
            <Pressable
              key={country.id}
              onPress={() => props.setCountry(country.id)}
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

      <Section title="Город">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {props.cityOptions.map((city) => (
            <Pressable
              key={city.id}
              onPress={() => props.setCityId(city.id)}
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

        <View style={styles.searchBox}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            value={props.customCity}
            onChangeText={props.setCustomCity}
            placeholder="Или введи любой город мира"
            placeholderTextColor={colors.muted}
            style={styles.searchInput}
          />
        </View>
      </Section>

      <Section title={`Бюджет в ${props.country.currency}`}>
        <View style={styles.budgetBox}>
          <TextInput
            value={props.budgetInput}
            onChangeText={props.setBudgetInput}
            keyboardType="number-pad"
            placeholder="Например 500000"
            placeholderTextColor={colors.muted}
            style={styles.budgetInput}
          />
          <Text style={styles.currency}>{props.country.currency}</Text>
        </View>
        <View style={styles.quickRow}>
          {[250000, 500000, 1000000, 2000000].map((value) => (
            <Pressable
              key={value}
              onPress={() =>
                props.setBudgetInput(
                  String(convertFromUZS(value, props.country)),
                )
              }
              style={styles.quickChip}
            >
              <Text style={styles.quickText}>
                {money(value, props.country)}
              </Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title="Настроение поездки">
        <View style={styles.moodGrid}>
          {(
            [
              ["active", "Активно", "walk"],
              ["calm", "Спокойно", "leaf"],
              ["family", "Семья", "people"],
              ["romantic", "Романтика", "heart"],
              ["shopping", "Шопинг", "bag"],
            ] as [Mood, string, keyof typeof Ionicons.glyphMap][]
          ).map(([id, label, icon]) => (
            <Pressable
              key={id}
              onPress={() => props.setMood(id)}
              style={[styles.moodCard, props.mood === id && styles.moodActive]}
            >
              <Ionicons
                name={icon}
                size={20}
                color={props.mood === id ? colors.dark : colors.accent}
              />
              <Text
                style={[
                  styles.moodText,
                  props.mood === id && styles.moodTextActive,
                ]}
              >
                {label}
              </Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title="Что включить">
        <View style={styles.chipsWrap}>
          {(
            [
              "sight",
              "museum",
              "food",
              "shop",
              "nature",
              "family",
              "night",
            ] as Category[]
          ).map((category) => {
            const active = props.selectedCategories.includes(category);
            return (
              <Pressable
                key={category}
                onPress={() => props.toggleCategory(category)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Ionicons
                  name={categoryIcons[category]}
                  size={15}
                  color={active ? colors.dark : colors.text}
                />
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {categoryLabels[category]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Section>

      <View style={styles.summaryCard}>
        <Text style={styles.kicker}>ПЛАН ПОЕЗДКИ</Text>
        <Text style={styles.summaryTitle}>
          Маршрут на весь день: {props.route.length} точек
        </Text>
        <Text style={styles.cardMuted}>
          {props.route.map((item) => item.title).join(" → ") ||
            "Выбери город и бюджет"}
        </Text>
        <View style={styles.statGrid}>
          <MiniStat
            label="Бюджет"
            value={money(props.budgetUZS, props.country)}
          />
          <MiniStat label="Итого" value={money(props.total, props.country)} />
          <MiniStat
            label="Остаток"
            value={money(props.remaining, props.country)}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function RouteScreen({
  country,
  route,
  total,
  budgetUZS,
  remaining,
}: {
  country: Country;
  route: RouteStep[];
  total: number;
  budgetUZS: number;
  remaining: number;
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
          {total <= budgetUZS ? "Уложились в бюджет" : "Бюджет превышен"}
        </Text>
        <View style={styles.statGrid}>
          <MiniStat label="Бюджет" value={money(budgetUZS, country)} />
          <MiniStat label="Итого" value={money(total, country)} />
          <MiniStat label="Остаток" value={money(remaining, country)} />
        </View>
      </View>

      {route.map((step, index) => {
        const previous = index > 0 ? route[index - 1] : null;
        return (
          <View key={step.id} style={styles.routeCard}>
            <View style={styles.stepCircle}>
              <Text style={styles.stepText}>{index + 1}</Text>
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
              {step.deal ? (
                <Text style={styles.dealLine}>🔥 {step.deal}</Text>
              ) : null}
              <Text style={styles.info}>📍 {step.address}</Text>
              <Text style={styles.info}>
                🎫 Вход: {money(step.entryUZS, country)} • траты:{" "}
                {money(step.minSpendUZS, country)}
              </Text>
              <Text style={styles.info}>
                🚕 {step.transportText} • {money(step.taxiUZS, country)}
              </Text>
              <Text style={styles.tip}>Совет: {step.cheapTip}</Text>

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
                  onPress={() => openMap(step)}
                >
                  <Ionicons name="map" size={17} color={colors.text} />
                  <Text style={styles.darkButtonText}>Карта</Text>
                </Pressable>
              </View>
            </View>
          </View>
        );
      })}
    </ScrollView>
  );
}

function DiscoverScreen({
  country,
  places,
  selectedCategories,
  toggleCategory,
  cheapPlaces,
  calmPlaces,
}: {
  country: Country;
  places: Place[];
  selectedCategories: Category[];
  toggleCategory: (c: Category) => void;
  cheapPlaces: Place[];
  calmPlaces: Place[];
}) {
  const visible = places.filter((place) =>
    selectedCategories.includes(place.category),
  );
  const list = visible.length ? visible : places;

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <Section title="Категории">
        <View style={styles.chipsWrap}>
          {(
            [
              "sight",
              "museum",
              "food",
              "shop",
              "nature",
              "family",
              "night",
            ] as Category[]
          ).map((category) => {
            const active = selectedCategories.includes(category);
            return (
              <Pressable
                key={category}
                onPress={() => toggleCategory(category)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {categoryLabels[category]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Section>

      <Section title="Где дешевле">
        {cheapPlaces.slice(0, 3).map((place) => (
          <CompactPlace key={place.id} place={place} country={country} />
        ))}
      </Section>

      <Section title="Где меньше людей">
        {calmPlaces.slice(0, 3).map((place) => (
          <CompactPlace key={place.id} place={place} country={country} />
        ))}
      </Section>

      <Section title="Все места">
        {list.map((place) => (
          <PlaceCard key={place.id} place={place} country={country} />
        ))}
      </Section>
    </ScrollView>
  );
}

function OffersScreen({
  country,
  alerts,
  dealPlaces,
  cheapPlaces,
}: {
  country: Country;
  alerts: SmartAlert[];
  dealPlaces: Place[];
  cheapPlaces: Place[];
}) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.offerHero}>
        <Ionicons name="notifications" size={34} color={colors.dark} />
        <Text style={styles.offerTitle}>Уведомления и рекомендации</Text>
        <Text style={styles.offerText}>
          Приложение само подсказывает, где акция, где дешевле, где много людей
          и куда идти дальше.
        </Text>
      </View>

      <Section title="Сейчас важно">
        {alerts.map((alert) => (
          <AlertWide key={alert.id} alert={alert} />
        ))}
      </Section>

      <Section title="Акции / скидки">
        {(dealPlaces.length ? dealPlaces : cheapPlaces.slice(0, 3)).map(
          (place) => (
            <PlaceCard key={place.id} place={place} country={country} />
          ),
        )}
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
        <Text style={styles.kicker}>ТАКСИ</Text>
        <Text style={styles.summaryTitle}>
          До следующей точки — в один клик
        </Text>
        <Text style={styles.cardMuted}>
          Открывается карта/Яндекс с маршрутом. Позже можно подключить прямые
          API такси.
        </Text>
      </View>

      {nextPoint ? (
        <Pressable
          style={styles.primaryButton}
          onPress={() => openTaxi(null, nextPoint)}
        >
          <Text style={styles.primaryButtonText}>
            Вызвать такси до {nextPoint.title}
          </Text>
          <Ionicons name="car" size={19} color={colors.dark} />
        </Pressable>
      ) : null}

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

function BudgetScreen({
  country,
  budgetUZS,
  total,
  remaining,
  entryTotal,
  spendTotal,
  taxiTotal,
  route,
}: {
  country: Country;
  budgetUZS: number;
  total: number;
  remaining: number;
  entryTotal: number;
  spendTotal: number;
  taxiTotal: number;
  route: RouteStep[];
}) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.summaryCard}>
        <Text style={styles.kicker}>БЮДЖЕТ</Text>
        <Text style={styles.summaryTitle}>
          {money(total, country)} из {money(budgetUZS, country)}
        </Text>
        <Text style={styles.cardMuted}>
          Остаток: {money(remaining, country)}
        </Text>
      </View>

      <ExpenseRow
        icon="ticket"
        title="Билеты / музеи"
        value={money(entryTotal, country)}
      />
      <ExpenseRow
        icon="restaurant"
        title="Еда / покупки"
        value={money(spendTotal, country)}
      />
      <ExpenseRow icon="car" title="Такси" value={money(taxiTotal, country)} />
      <ExpenseRow icon="wallet" title="Итого" value={money(total, country)} />

      <Section title="Расходы по точкам">
        {route.map((step) => (
          <View key={step.id} style={styles.expenseCard}>
            <Text style={styles.cardTitle}>{step.title}</Text>
            <Text style={styles.cardMuted}>
              Вход {money(step.entryUZS, country)} • траты{" "}
              {money(step.minSpendUZS, country)} • такси{" "}
              {money(step.taxiUZS, country)}
            </Text>
          </View>
        ))}
      </Section>
    </ScrollView>
  );
}

function VoiceScreen({
  messages,
  chatText,
  setChatText,
  sendChat,
  quickVoice,
}: {
  messages: ChatMessage[];
  chatText: string;
  setChatText: (v: string) => void;
  sendChat: () => void;
  quickVoice: (v: string) => void;
}) {
  return (
    <View style={styles.voiceWrap}>
      <View style={styles.voiceHeader}>
        <View style={styles.micCircle}>
          <Ionicons name="mic" size={34} color={colors.dark} />
        </View>
        <Text style={styles.voiceTitle}>Голосовой помощник</Text>
        <Text style={styles.cardMuted}>
          Пока команды вводятся текстом или быстрыми кнопками, а помощник
          отвечает голосом. Реальную запись голоса подключим следующим модулем.
        </Text>
      </View>

      <View style={styles.quickCommands}>
        {[
          "Где дешевле?",
          "Где меньше людей?",
          "Вызови такси",
          "Покажи места",
          "SOS помощь",
        ].map((cmd) => (
          <Pressable
            key={cmd}
            style={styles.commandChip}
            onPress={() => quickVoice(cmd)}
          >
            <Text style={styles.commandText}>{cmd}</Text>
          </Pressable>
        ))}
      </View>

      <ScrollView
        style={styles.chatList}
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
          placeholder="Напиши команду для помощника..."
          placeholderTextColor={colors.muted}
          style={styles.chatInput}
          multiline
        />
        <Pressable style={styles.sendButton} onPress={sendChat}>
          <Ionicons name="send" size={18} color={colors.dark} />
        </Pressable>
      </View>
    </View>
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
    </ScrollView>
  );
}

function GuideCallModal({
  visible,
  phase,
  text,
  nextPoint,
  onAccept,
  onClose,
  onReplay,
  onTaxi,
}: {
  visible: boolean;
  phase: GuideCallPhase;
  text: string;
  nextPoint?: RouteStep;
  onAccept: () => void;
  onClose: () => void;
  onReplay: () => void;
  onTaxi: () => void;
}) {
  const incoming = phase === "incoming";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.callOverlay}>
        <View style={styles.callCard}>
          <View style={styles.callTop}>
            <View
              style={[styles.callAvatar, incoming && styles.callAvatarRinging]}
            >
              <Ionicons name="woman" size={42} color={colors.dark} />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.callName}>AI-гид ассистентка</Text>
              <Text style={styles.callStatus}>
                {incoming
                  ? "Входящий звонок..."
                  : "Звонок активен · говорит голосом"}
              </Text>
            </View>

            <Pressable style={styles.callClose} onPress={onClose}>
              <Ionicons name="close" size={22} color={colors.text} />
            </Pressable>
          </View>

          <View style={styles.callWave}>
            <View style={[styles.waveBar, incoming && styles.waveBarHot]} />
            <View
              style={[
                styles.waveBar,
                { height: 46 },
                incoming && styles.waveBarHot,
              ]}
            />
            <View
              style={[
                styles.waveBar,
                { height: 30 },
                incoming && styles.waveBarHot,
              ]}
            />
            <View
              style={[
                styles.waveBar,
                { height: 58 },
                incoming && styles.waveBarHot,
              ]}
            />
            <View
              style={[
                styles.waveBar,
                { height: 36 },
                incoming && styles.waveBarHot,
              ]}
            />
          </View>

          {incoming ? (
            <>
              <Text style={styles.incomingTitle}>
                Тебе звонит персональная туристическая ассистентка
              </Text>
              <Text style={styles.incomingSub}>
                Ответь на звонок — она голосом соберет маршрут на весь день.
              </Text>

              <View style={styles.callActions}>
                <Pressable style={styles.declineButton} onPress={onClose}>
                  <Ionicons name="call" size={22} color="#FFF" />
                  <Text style={styles.declineText}>Сбросить</Text>
                </Pressable>

                <Pressable style={styles.acceptButton} onPress={onAccept}>
                  <Ionicons name="call" size={22} color="#FFF" />
                  <Text style={styles.acceptText}>Ответить</Text>
                </Pressable>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.activeCallTitle}>Ассистентка говорит...</Text>

              <View style={styles.callActions}>
                <Pressable style={styles.callAction} onPress={onReplay}>
                  <Ionicons name="volume-high" size={20} color={colors.dark} />
                  <Text style={styles.callActionText}>Повторить голосом</Text>
                </Pressable>

                <Pressable style={styles.callActionDark} onPress={onTaxi}>
                  <Ionicons name="car" size={20} color={colors.text} />
                  <Text style={styles.callActionDarkText}>
                    {nextPoint ? "Такси дальше" : "Нет точки"}
                  </Text>
                </Pressable>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
}

function AlertCard({ alert }: { alert: SmartAlert }) {
  const icon: keyof typeof Ionicons.glyphMap =
    alert.type === "deal"
      ? "pricetag"
      : alert.type === "crowd"
        ? "people"
        : alert.type === "safety"
          ? "shield"
          : alert.type === "food"
            ? "restaurant"
            : "navigate";

  return (
    <View style={styles.alertCard}>
      <View style={styles.alertIcon}>
        <Ionicons name={icon} size={20} color={colors.dark} />
      </View>
      <Text style={styles.alertTitle}>{alert.title}</Text>
      <Text style={styles.alertText}>{alert.text}</Text>
    </View>
  );
}

function AlertWide({ alert }: { alert: SmartAlert }) {
  return (
    <View style={styles.alertWide}>
      <Ionicons name="notifications" size={22} color={colors.accent} />
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{alert.title}</Text>
        <Text style={styles.cardMuted}>{alert.text}</Text>
      </View>
    </View>
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
      {place.deal ? <Text style={styles.dealLine}>🔥 {place.deal}</Text> : null}
      <Text style={styles.info}>
        ⭐ {place.rating} • {place.bestTime} • {place.durationMin} мин
      </Text>
      <Text style={styles.info}>
        Цена: {money(place.entryUZS + place.minSpendUZS, country)}
      </Text>
      <Text style={styles.tip}>Совет: {place.cheapTip}</Text>
      <View style={styles.actionRow}>
        <Pressable style={styles.darkButton} onPress={() => openMap(place)}>
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
    <Pressable style={styles.compactCard} onPress={() => openMap(place)}>
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
    { id: "discover", title: "Места", icon: "compass" },
    { id: "taxi", title: "Такси", icon: "car" },
    { id: "budget", title: "Бюджет", icon: "wallet" },
    { id: "offers", title: "Акции", icon: "notifications" },
    { id: "voice", title: "Голос", icon: "mic" },
    { id: "sos", title: "SOS", icon: "shield" },
  ];

  return (
    <View style={styles.tabs}>
      {tabs.map((tab) => {
        const selected = active === tab.id;
        return (
          <Pressable
            key={tab.id}
            onPress={() => setActive(tab.id)}
            style={[styles.tab, selected && styles.tabActive]}
          >
            <Ionicons
              name={tab.icon}
              size={17}
              color={selected ? colors.dark : colors.muted}
            />
            <Text style={[styles.tabText, selected && styles.tabTextActive]}>
              {tab.title}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const colors = {
  bg: "#102033",
  bg2: "#172A40",
  panel: "#20364F",
  panel2: "#2A4463",
  border: "rgba(255,255,255,0.14)",
  text: "#F8FAFC",
  muted: "#AFC4DA",
  soft: "#D7E4F2",
  accent: "#9DDCFF",
  gold: "#FFD166",
  green: "#92F2B4",
  dark: "#071421",
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
    alignItems: "center",
    justifyContent: "space-between",
  },
  logo: {
    color: colors.text,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -1,
  },
  headerSub: {
    color: colors.muted,
    fontWeight: "800",
    fontSize: 12,
    marginTop: 1,
  },
  headerRight: { flexDirection: "row", gap: 7, alignItems: "center" },
  headerPill: {
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  goodPill: { backgroundColor: "rgba(34,197,94,0.22)" },
  badPill: { backgroundColor: "rgba(251,113,133,0.22)" },
  headerPillText: { color: colors.text, fontWeight: "900", fontSize: 11 },
  content: { flex: 1 },
  contentPad: { padding: 16, paddingBottom: 122 },
  hero: {
    borderRadius: 34,
    padding: 22,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.panel,
    overflow: "hidden",
    marginBottom: 20,
  },
  sun: {
    position: "absolute",
    width: 220,
    height: 220,
    borderRadius: 110,
    right: -70,
    top: -80,
    backgroundColor: "rgba(255,209,102,0.22)",
  },
  heroBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.gold,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  heroBadgeText: { color: colors.dark, fontWeight: "900", fontSize: 11 },
  heroTitle: {
    color: colors.text,
    fontSize: 32,
    lineHeight: 37,
    fontWeight: "900",
    marginTop: 16,
  },
  heroText: { color: colors.soft, fontSize: 14, lineHeight: 22, marginTop: 10 },
  heroButtons: { flexDirection: "row", gap: 10, marginTop: 18 },
  primaryButton: {
    flex: 1,
    minHeight: 58,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: { color: colors.dark, fontWeight: "900", fontSize: 15 },
  voiceButton: {
    width: 58,
    height: 58,
    borderRadius: 22,
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  guideCallButton: {
    marginTop: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  guideAvatarSmall: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  guideCallTitle: { color: colors.text, fontWeight: "900", fontSize: 14 },
  guideCallSub: {
    color: colors.muted,
    fontWeight: "700",
    fontSize: 12,
    marginTop: 2,
  },
  section: { marginBottom: 22 },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },
  row: { gap: 10, paddingRight: 12 },
  alertCard: {
    width: 235,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 15,
  },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  alertTitle: { color: colors.text, fontWeight: "900", fontSize: 16 },
  alertText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  alertWide: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 14,
    marginBottom: 10,
  },
  countryCard: {
    width: 145,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 14,
  },
  countryEmoji: { fontSize: 27, marginBottom: 8 },
  cityCard: {
    width: 185,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 14,
  },
  activeCard: { backgroundColor: colors.panel2, borderColor: colors.accent },
  cardTitle: { color: colors.text, fontWeight: "900", fontSize: 15 },
  cardMuted: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
  },
  searchBox: {
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
  searchInput: { flex: 1, color: colors.text, fontWeight: "800" },
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  quickText: { color: colors.soft, fontWeight: "900", fontSize: 12 },
  moodGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  moodCard: {
    width: "31.5%",
    minHeight: 78,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
  },
  moodActive: { backgroundColor: colors.accent },
  moodText: { color: colors.text, fontWeight: "900", fontSize: 12 },
  moodTextActive: { color: colors.dark },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  chipActive: { backgroundColor: colors.accent },
  chipText: { color: colors.soft, fontWeight: "900", fontSize: 12 },
  chipTextActive: { color: colors.dark },
  summaryCard: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 26,
    padding: 17,
    marginBottom: 16,
  },
  kicker: {
    color: colors.accent,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.1,
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
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    padding: 10,
  },
  miniLabel: { color: colors.muted, fontWeight: "800", fontSize: 11 },
  miniValue: {
    color: colors.text,
    fontWeight: "900",
    fontSize: 12,
    marginTop: 5,
  },
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
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
  },
  stepText: { color: colors.dark, fontWeight: "900" },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  timeText: { color: colors.accent, fontWeight: "900" },
  crowdText: { fontWeight: "900", fontSize: 12 },
  placeTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900",
    marginTop: 6,
  },
  dealLine: {
    color: colors.gold,
    fontWeight: "900",
    marginTop: 8,
    lineHeight: 19,
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
  offerHero: {
    backgroundColor: colors.gold,
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  offerTitle: {
    color: colors.dark,
    fontSize: 27,
    fontWeight: "900",
    marginTop: 10,
  },
  offerText: {
    color: "rgba(7,20,33,0.78)",
    fontWeight: "800",
    marginTop: 8,
    lineHeight: 20,
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
  voiceWrap: { flex: 1, paddingBottom: 88 },
  voiceHeader: {
    margin: 16,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 28,
    padding: 20,
    alignItems: "center",
  },
  micCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  voiceTitle: { color: colors.text, fontSize: 25, fontWeight: "900" },
  quickCommands: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  commandChip: {
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  commandText: { color: colors.text, fontWeight: "900", fontSize: 12 },
  chatList: { flex: 1 },
  chatPad: { padding: 16, paddingBottom: 18 },
  bubble: { maxWidth: "84%", padding: 14, borderRadius: 22, marginBottom: 10 },
  assistantBubble: {
    backgroundColor: colors.panel,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: colors.border,
  },
  userBubble: { backgroundColor: colors.accent, alignSelf: "flex-end" },
  bubbleText: { color: colors.text, lineHeight: 20, fontWeight: "700" },
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
  callOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.72)",
    alignItems: "center",
    justifyContent: "center",
    padding: 18,
  },
  callCard: {
    width: "100%",
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 34,
    padding: 18,
  },
  callTop: { flexDirection: "row", alignItems: "center", gap: 12 },
  callAvatar: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
  },
  callAvatarRinging: { borderWidth: 4, borderColor: "rgba(255,255,255,0.35)" },
  callName: { color: colors.text, fontWeight: "900", fontSize: 19 },
  callStatus: { color: colors.muted, fontWeight: "800", marginTop: 3 },
  callClose: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.panel2,
    alignItems: "center",
    justifyContent: "center",
  },
  callWave: {
    height: 76,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginVertical: 18,
  },
  waveBar: {
    width: 10,
    height: 22,
    borderRadius: 999,
    backgroundColor: colors.accent,
  },
  waveBarHot: { backgroundColor: colors.gold },
  callText: {
    color: colors.soft,
    fontSize: 15,
    lineHeight: 23,
    fontWeight: "700",
  },
  incomingTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 4,
  },
  incomingSub: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "800",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  activeCallTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
    marginTop: 4,
  },
  callActions: { flexDirection: "row", gap: 10, marginTop: 18 },
  callAction: {
    flex: 1,
    minHeight: 50,
    borderRadius: 18,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  callActionText: { color: colors.dark, fontWeight: "900" },
  callActionDark: {
    flex: 1,
    minHeight: 50,
    borderRadius: 18,
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  callActionDarkText: { color: colors.text, fontWeight: "900" },
  acceptButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 999,
    backgroundColor: "#22C55E",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  acceptText: { color: "#FFF", fontWeight: "900", fontSize: 15 },
  declineButton: {
    flex: 1,
    minHeight: 56,
    borderRadius: 999,
    backgroundColor: "#EF4444",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  declineText: { color: "#FFF", fontWeight: "900", fontSize: 15 },
  tabs: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 10,
    backgroundColor: "#13253A",
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
