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

type Tab = "home" | "live" | "route" | "places" | "tools" | "checklist" | "sos";
type CountryId = "uz" | "ae" | "tr" | "kz" | "fr" | "it" | "us" | "jp";
type Category =
  | "breakfast"
  | "sight"
  | "museum"
  | "food"
  | "shop"
  | "nature"
  | "photo"
  | "night";
type Crowd = "low" | "medium" | "high";
type TravelMode =
  | "normal"
  | "tired"
  | "eat"
  | "cheap"
  | "beautiful"
  | "nightSafe";

type Country = {
  id: CountryId;
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
  countryId: CountryId;
  name: string;
  subtitle: string;
  taxiBaseUZS: number;
  taxiKmUZS: number;
  cashTip: string;
  buyList: BuyItem[];
};

type BuyItem = {
  title: string;
  normalPriceUZS: string;
  where: string;
  tip: string;
};

type Place = {
  id: string;
  cityId: string;
  title: string;
  category: Category;
  subtitle: string;
  address: string;
  lat: number;
  lng: number;
  entryUZS: number;
  spendUZS: number;
  durationMin: number;
  rating: number;
  crowd: Crowd;
  bestTime: string;
  openNow: boolean;
  deal?: string;
  photoTip: string;
  cheapTip: string;
  safetyTip: string;
  driverText: string;
};

type RouteStep = Place & {
  order: number;
  time: string;
  distanceKm: number;
  taxiUZS: number;
  transportText: string;
};

type SmartNotice = {
  id: string;
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  text: string;
  kind: "deal" | "crowd" | "money" | "photo" | "food" | "safety";
};

type CheckItem = {
  id: string;
  title: string;
  subtitle: string;
  icon: keyof typeof Ionicons.glyphMap;
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
  {
    id: "tashkent",
    countryId: "uz",
    name: "Ташкент",
    subtitle: "Базары, плов, парки, современный город",
    taxiBaseUZS: 12000,
    taxiKmUZS: 3200,
    cashTip:
      "На день лучше иметь наличными 250 000–450 000 UZS: базар, мелкие покупки, чай, вода.",
    buyList: [
      {
        title: "Сухофрукты",
        normalPriceUZS: "60 000–180 000 UZS",
        where: "Чорсу / Алайский базар",
        tip: "Сначала попробуй, потом покупай. Сравни минимум 2 ряда.",
      },
      {
        title: "Специи",
        normalPriceUZS: "20 000–70 000 UZS",
        where: "Чорсу",
        tip: "Проси маленькую фасовку, не бери огромный набор сразу.",
      },
      {
        title: "Лепешки",
        normalPriceUZS: "5 000–15 000 UZS",
        where: "рынок / тандыр",
        tip: "Бери свежие утром или до обеда.",
      },
    ],
  },
  {
    id: "samarkand",
    countryId: "uz",
    name: "Самарканд",
    subtitle: "Регистан, Шахи-Зинда, базары, сладости",
    taxiBaseUZS: 10000,
    taxiKmUZS: 3000,
    cashTip:
      "Для базара и сувениров лучше иметь 300 000–600 000 UZS наличными.",
    buyList: [
      {
        title: "Самаркандская лепешка",
        normalPriceUZS: "8 000–20 000 UZS",
        where: "Сиабский базар",
        tip: "Не бери у первой точки у входа, дальше может быть дешевле.",
      },
      {
        title: "Сухофрукты и орехи",
        normalPriceUZS: "70 000–250 000 UZS",
        where: "Сиабский базар",
        tip: "Сравни 3 цены, торгуйся спокойно.",
      },
      {
        title: "Керамика",
        normalPriceUZS: "80 000–350 000 UZS",
        where: "сувенирные ряды",
        tip: "Проверь упаковку, чтобы довезти целым.",
      },
    ],
  },
  {
    id: "bukhara",
    countryId: "uz",
    name: "Бухара",
    subtitle: "Старый город, ремесла, минареты",
    taxiBaseUZS: 10000,
    taxiKmUZS: 2800,
    cashTip:
      "В старом городе удобно иметь 300 000 UZS наличными на чай, сувениры и мелкие входы.",
    buyList: [
      {
        title: "Сюзане",
        normalPriceUZS: "250 000–1 500 000 UZS",
        where: "старый город",
        tip: "Смотри качество вышивки и торгуйся.",
      },
      {
        title: "Миниатюры",
        normalPriceUZS: "100 000–500 000 UZS",
        where: "ремесленные лавки",
        tip: "Лучше покупать у мастера, а не у перекупщика.",
      },
      {
        title: "Чай и специи",
        normalPriceUZS: "30 000–120 000 UZS",
        where: "рынок / лавки",
        tip: "Проси попробовать аромат.",
      },
    ],
  },
  {
    id: "khiva",
    countryId: "uz",
    name: "Хива",
    subtitle: "Ичан-Кала, крепостные стены, древний город",
    taxiBaseUZS: 9000,
    taxiKmUZS: 2600,
    cashTip: "Внутри Ичан-Калы удобно иметь 250 000–400 000 UZS наличными.",
    buyList: [
      {
        title: "Шапка / тюбетейка",
        normalPriceUZS: "50 000–150 000 UZS",
        where: "Ичан-Кала",
        tip: "Покупай после сравнения 2–3 лавок.",
      },
      {
        title: "Керамика",
        normalPriceUZS: "90 000–400 000 UZS",
        where: "мастерские",
        tip: "Проси хорошо упаковать.",
      },
      {
        title: "Деревянные изделия",
        normalPriceUZS: "80 000–350 000 UZS",
        where: "ремесленные ряды",
        tip: "Проверь трещины и лак.",
      },
    ],
  },
  {
    id: "dubai",
    countryId: "ae",
    name: "Дубай",
    subtitle: "Mall, Creek, Marina, Burj Khalifa",
    taxiBaseUZS: 19000,
    taxiKmUZS: 8500,
    cashTip:
      "В Дубае карта удобнее, наличные нужны для рынков и мелких покупок: 150–300 AED.",
    buyList: [
      {
        title: "Финики",
        normalPriceUZS: "80 000–350 000 UZS",
        where: "Deira / супермаркеты",
        tip: "В супермаркете часто дешевле, чем в туристической лавке.",
      },
      {
        title: "Арабские духи",
        normalPriceUZS: "150 000–800 000 UZS",
        where: "Deira / парфюм-рынок",
        tip: "Торгуйся, пробуй на коже.",
      },
      {
        title: "Шоколад / подарки",
        normalPriceUZS: "70 000–300 000 UZS",
        where: "Dubai Mall / Carrefour",
        tip: "Для подарков супермаркет выгоднее.",
      },
    ],
  },
  {
    id: "istanbul",
    countryId: "tr",
    name: "Стамбул",
    subtitle: "Айя-София, Босфор, Гранд базар",
    taxiBaseUZS: 17000,
    taxiKmUZS: 6500,
    cashTip: "Для базара и уличной еды держи наличными 1 000–2 000 TRY.",
    buyList: [
      {
        title: "Лукум",
        normalPriceUZS: "80 000–300 000 UZS",
        where: "Египетский базар",
        tip: "Пробуй перед покупкой и сравни цены.",
      },
      {
        title: "Чай / кофе",
        normalPriceUZS: "60 000–250 000 UZS",
        where: "рынок / супермаркет",
        tip: "Супермаркет часто честнее по цене.",
      },
      {
        title: "Текстиль",
        normalPriceUZS: "150 000–700 000 UZS",
        where: "Гранд базар",
        tip: "Торгуйся и проверяй качество шва.",
      },
    ],
  },
  {
    id: "almaty",
    countryId: "kz",
    name: "Алматы",
    subtitle: "Горы, Кок-Тобе, кафе, виды",
    taxiBaseUZS: 14000,
    taxiKmUZS: 4500,
    cashTip:
      "В Алматы карта удобна, но для мелких покупок держи 10 000–20 000 KZT.",
    buyList: [
      {
        title: "Шоколад",
        normalPriceUZS: "30 000–120 000 UZS",
        where: "супермаркет / фирменные магазины",
        tip: "В супермаркете выгоднее, чем в туристических местах.",
      },
      {
        title: "Сувениры с горами",
        normalPriceUZS: "50 000–250 000 UZS",
        where: "Кок-Тобе / центр",
        tip: "Сравни цены до покупки.",
      },
      {
        title: "Чай / сладости",
        normalPriceUZS: "40 000–180 000 UZS",
        where: "рынок / ТРЦ",
        tip: "Покупай в упаковке, если везешь домой.",
      },
    ],
  },
  {
    id: "paris",
    countryId: "fr",
    name: "Париж",
    subtitle: "Лувр, Эйфелева башня, Монмартр",
    taxiBaseUZS: 32000,
    taxiKmUZS: 12000,
    cashTip: "Лучше карта. Наличные 50–100 EUR на мелочи и чаевые.",
    buyList: [
      {
        title: "Макароны",
        normalPriceUZS: "120 000–500 000 UZS",
        where: "кондитерские",
        tip: "Бери небольшую коробку, если нужно просто попробовать.",
      },
      {
        title: "Парфюм",
        normalPriceUZS: "500 000–2 000 000 UZS",
        where: "магазины косметики",
        tip: "Смотри tax free и акции.",
      },
      {
        title: "Сувениры",
        normalPriceUZS: "30 000–200 000 UZS",
        where: "не у главных достопримечательностей",
        tip: "У Эйфелевой башни часто дороже.",
      },
    ],
  },
  {
    id: "rome",
    countryId: "it",
    name: "Рим",
    subtitle: "Колизей, Ватикан, фонтаны, паста",
    taxiBaseUZS: 28000,
    taxiKmUZS: 11000,
    cashTip:
      "Карта работает почти везде. Наличные 50–100 EUR для кафе и мелочей.",
    buyList: [
      {
        title: "Паста / соусы",
        normalPriceUZS: "60 000–250 000 UZS",
        where: "супермаркет / гастролавки",
        tip: "В супермаркете дешевле и честнее.",
      },
      {
        title: "Кофе",
        normalPriceUZS: "70 000–300 000 UZS",
        where: "кофейни / магазины",
        tip: "Смотри локальные бренды.",
      },
      {
        title: "Кожаные изделия",
        normalPriceUZS: "300 000–2 000 000 UZS",
        where: "магазины",
        tip: "Проверяй качество и не покупай с рук.",
      },
    ],
  },
  {
    id: "tokyo",
    countryId: "jp",
    name: "Токио",
    subtitle: "Сибуя, храмы, технологии, еда",
    taxiBaseUZS: 30000,
    taxiKmUZS: 12000,
    cashTip: "В Японии наличные всё еще полезны: держи 10 000–20 000 JPY.",
    buyList: [
      {
        title: "Снеки / сладости",
        normalPriceUZS: "40 000–200 000 UZS",
        where: "Don Quijote / convenience stores",
        tip: "Покупай наборами, выгоднее.",
      },
      {
        title: "Косметика",
        normalPriceUZS: "100 000–700 000 UZS",
        where: "drugstores",
        tip: "Смотри tax free.",
      },
      {
        title: "Аниме-сувениры",
        normalPriceUZS: "80 000–500 000 UZS",
        where: "Akihabara",
        tip: "Сравни новые и second-hand магазины.",
      },
    ],
  },
];

const categoryLabels: Record<Category, string> = {
  breakfast: "Завтрак",
  sight: "Места",
  museum: "Музеи",
  food: "Еда",
  shop: "Магазины",
  nature: "Природа",
  photo: "Фото",
  night: "Вечер",
};

const categoryIcons: Record<Category, keyof typeof Ionicons.glyphMap> = {
  breakfast: "cafe",
  sight: "camera",
  museum: "business",
  food: "restaurant",
  shop: "bag",
  nature: "leaf",
  photo: "aperture",
  night: "moon",
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

const fullDayTemplates: Omit<Place, "id" | "cityId" | "lat" | "lng">[] = [
  {
    title: "Завтрак в локальной кофейне",
    category: "breakfast",
    subtitle: "Начать день спокойно, проверить план и зарядить телефон",
    address: "центр города",
    entryUZS: 0,
    spendUZS: 70000,
    durationMin: 45,
    rating: 4.4,
    crowd: "medium",
    bestTime: "09:00–10:00",
    openNow: true,
    deal: "Комбо-завтрак обычно дешевле отдельных позиций",
    photoTip: "Сними кофе, улицу у окна и короткий кадр с картой маршрута.",
    cheapTip: "Ищи завтрак-комбо до 11:00.",
    safetyTip: "Не оставляй телефон на краю стола.",
    driverText:
      "Пожалуйста, отвезите меня в ближайшую хорошую кофейню в центре.",
  },
  {
    title: "Главная площадь / исторический центр",
    category: "sight",
    subtitle: "Первая большая точка города",
    address: "исторический центр",
    entryUZS: 0,
    spendUZS: 30000,
    durationMin: 80,
    rating: 4.7,
    crowd: "medium",
    bestTime: "10:15–11:30",
    openNow: true,
    photoTip:
      "Не снимай только прямо по центру. Отойди в угол — кадр будет глубже.",
    cheapTip: "Сначала осмотри бесплатно, сувениры покупай позже.",
    safetyTip: "В туристических местах держи документы отдельно от денег.",
    driverText: "Пожалуйста, отвезите меня в исторический центр города.",
  },
  {
    title: "Главный музей города",
    category: "museum",
    subtitle: "Культура, история и смысл поездки",
    address: "музейный квартал",
    entryUZS: 90000,
    spendUZS: 0,
    durationMin: 95,
    rating: 4.5,
    crowd: "medium",
    bestTime: "11:45–13:00",
    openNow: true,
    photoTip: "Сними вход, детали интерьера и 2–3 крупных плана экспонатов.",
    cheapTip: "Проверь бесплатные дни и скидки.",
    safetyTip: "Проверь правила фото и хранения сумок.",
    driverText: "Пожалуйста, отвезите меня в главный музей города.",
  },
  {
    title: "Обед в локальном месте",
    category: "food",
    subtitle: "Не туристический ресторан, а место с нормальными ценами",
    address: "район с кафе",
    entryUZS: 0,
    spendUZS: 110000,
    durationMin: 70,
    rating: 4.4,
    crowd: "high",
    bestTime: "13:15–14:15",
    openNow: true,
    deal: "Обеденное меню часто выгоднее основного",
    photoTip: "Сними блюдо сверху, потом короткий кадр улицы рядом.",
    cheapTip: "Смотри места, где сидят местные. Не садись без меню с ценами.",
    safetyTip: "Пей бутилированную воду, если город незнакомый.",
    driverText: "Пожалуйста, отвезите меня в хорошее локальное кафе рядом.",
  },
  {
    title: "Рынок / сувенирная улица",
    category: "shop",
    subtitle: "Купить подарки и почувствовать местный ритм",
    address: "рынок / торговая улица",
    entryUZS: 0,
    spendUZS: 140000,
    durationMin: 85,
    rating: 4.5,
    crowd: "high",
    bestTime: "14:45–16:00",
    openNow: true,
    deal: "Если берешь 2–3 товара, проси скидку",
    photoTip: "Снимай ряды, детали товаров, руки мастера, специи или ткань.",
    cheapTip: "Сравни минимум 3 цены. Первая цена часто туристическая.",
    safetyTip: "Не показывай крупные деньги. Держи сумку спереди.",
    driverText:
      "Пожалуйста, отвезите меня на главный рынок или сувенирную улицу.",
  },
  {
    title: "Пауза: десерт / чай / кофе",
    category: "food",
    subtitle: "Небольшой отдых, чтобы не устать",
    address: "уютное кафе",
    entryUZS: 0,
    spendUZS: 55000,
    durationMin: 40,
    rating: 4.3,
    crowd: "low",
    bestTime: "16:15–17:00",
    openNow: true,
    deal: "Десерт дня может быть дешевле",
    photoTip: "Сними короткий кадр еды и эмоцию отдыха.",
    cheapTip: "Бери локальный десерт, не туристический сет.",
    safetyTip: "Проверь состав, если есть аллергии.",
    driverText: "Пожалуйста, отвезите меня в спокойное кафе рядом.",
  },
  {
    title: "Смотровая / красивая фото-точка",
    category: "photo",
    subtitle: "Кадры для памяти, Reels и сторис",
    address: "панорамная точка",
    entryUZS: 50000,
    spendUZS: 20000,
    durationMin: 70,
    rating: 4.6,
    crowd: "medium",
    bestTime: "17:30–18:45",
    openNow: true,
    photoTip:
      "Лучший кадр — за 30–40 минут до заката. Снимай против света аккуратно.",
    cheapTip: "Не обязательно садиться в дорогое кафе с видом.",
    safetyTip: "Не подходи к краям ради фото.",
    driverText: "Пожалуйста, отвезите меня на ближайшую смотровую площадку.",
  },
  {
    title: "Вечерняя прогулочная улица",
    category: "night",
    subtitle: "Огни, музыка, атмосфера и финал дня",
    address: "вечерний район",
    entryUZS: 0,
    spendUZS: 100000,
    durationMin: 90,
    rating: 4.5,
    crowd: "medium",
    bestTime: "19:15–21:00",
    openNow: true,
    deal: "Вечером часто бывают акции на напитки и десерты",
    photoTip: "Снимай огни, витрины, движение людей и общий план улицы.",
    cheapTip: "Смотри меню у входа, не садись без цен.",
    safetyTip: "После 22:00 лучше возвращаться на такси.",
    driverText: "Пожалуйста, отвезите меня на вечернюю прогулочную улицу.",
  },
  {
    title: "Возврат в отель / безопасная точка",
    category: "night",
    subtitle: "Завершение маршрута без лишнего риска",
    address: "отель / безопасная зона",
    entryUZS: 0,
    spendUZS: 0,
    durationMin: 20,
    rating: 4.9,
    crowd: "low",
    bestTime: "21:15–22:00",
    openNow: true,
    photoTip: "Сними финальный кадр дня: улица, такси, вид из окна.",
    cheapTip: "Если поздно, экономия на пешей прогулке не стоит риска.",
    safetyTip: "Лучше вызвать такси, особенно если район незнакомый.",
    driverText: "Пожалуйста, отвезите меня в мой отель.",
  },
];

const realPlaces: Place[] = [
  {
    id: "tashkent-hazrati",
    cityId: "tashkent",
    title: "Хазрати Имам",
    category: "sight",
    subtitle: "Исторический комплекс старого города",
    address: "Старый город",
    lat: 41.3371,
    lng: 69.2406,
    entryUZS: 30000,
    spendUZS: 0,
    durationMin: 70,
    rating: 4.8,
    crowd: "medium",
    bestTime: "10:00–12:00",
    openNow: true,
    photoTip: "Лучше снимать общий двор и детали арок.",
    cheapTip: "Сувениры рядом сравнивай в 2–3 местах.",
    safetyTip: "Спокойная зона, но телефон держи ближе к себе.",
    driverText: "Пожалуйста, отвезите меня в комплекс Хазрати Имам.",
  },
  {
    id: "tashkent-chorsu",
    cityId: "tashkent",
    title: "Чорсу базар",
    category: "shop",
    subtitle: "Специи, лепешки, сувениры, восточный рынок",
    address: "м. Чорсу",
    lat: 41.3267,
    lng: 69.2352,
    entryUZS: 0,
    spendUZS: 65000,
    durationMin: 90,
    rating: 4.6,
    crowd: "high",
    bestTime: "11:00–14:00",
    openNow: true,
    deal: "Скидки на сухофрукты при покупке от 2 кг",
    photoTip: "Снимай купол рынка, специи крупным планом, лепешки из тандыра.",
    cheapTip: "Торгуйся спокойно. Нормально просить минус 15–25%.",
    safetyTip: "Людно, аккуратнее с кошельком и телефоном.",
    driverText: "Пожалуйста, отвезите меня на Чорсу базар.",
  },
  {
    id: "tashkent-plov",
    cityId: "tashkent",
    title: "Центр плова",
    category: "food",
    subtitle: "Популярный плов, быстро и понятно туристу",
    address: "район телевышки",
    lat: 41.3457,
    lng: 69.2848,
    entryUZS: 0,
    spendUZS: 85000,
    durationMin: 60,
    rating: 4.5,
    crowd: "high",
    bestTime: "12:00–14:00",
    openNow: true,
    deal: "Лучше приходить до 13:00 — больше выбор",
    photoTip: "Сними огромные казаны, порцию плова и чай.",
    cheapTip: "Обычная порция выгоднее больших сетов.",
    safetyTip: "Выбирай место с большим потоком гостей.",
    driverText: "Пожалуйста, отвезите меня в Центр плова.",
  },
  {
    id: "samarkand-registan",
    cityId: "samarkand",
    title: "Регистан",
    category: "sight",
    subtitle: "Главный символ Самарканда",
    address: "Registon ko‘chasi",
    lat: 39.6542,
    lng: 66.975,
    entryUZS: 70000,
    spendUZS: 0,
    durationMin: 110,
    rating: 4.9,
    crowd: "high",
    bestTime: "09:00–11:30",
    openNow: true,
    photoTip: "Снимай утром сбоку, а вечером — общий план с подсветкой.",
    cheapTip: "Сувениры рядом часто дороже, покупай позже на базаре.",
    safetyTip: "Туристическая зона, проверяй цены заранее.",
    driverText: "Пожалуйста, отвезите меня на площадь Регистан.",
  },
  {
    id: "samarkand-siab",
    cityId: "samarkand",
    title: "Сиабский базар",
    category: "shop",
    subtitle: "Лепешки, сладости, специи, сувениры",
    address: "рядом с Биби-Ханым",
    lat: 39.6616,
    lng: 66.9805,
    entryUZS: 0,
    spendUZS: 80000,
    durationMin: 80,
    rating: 4.7,
    crowd: "medium",
    bestTime: "12:00–14:00",
    openNow: true,
    deal: "Сладости дешевле в дальних рядах",
    photoTip: "Снимай лепешки, сухофрукты, продавцов и общий проход.",
    cheapTip: "Сначала пробуй, потом покупай. Сравни 2–3 ряда.",
    safetyTip: "Не показывай много наличных.",
    driverText: "Пожалуйста, отвезите меня на Сиабский базар.",
  },
  {
    id: "samarkand-shahi",
    cityId: "samarkand",
    title: "Шахи-Зинда",
    category: "museum",
    subtitle: "Мавзолеи, бирюзовая плитка, фото-точки",
    address: "улица Шахи-Зинда",
    lat: 39.6622,
    lng: 66.987,
    entryUZS: 60000,
    spendUZS: 0,
    durationMin: 85,
    rating: 4.9,
    crowd: "medium",
    bestTime: "15:30–17:30",
    openNow: true,
    photoTip: "Лучший кадр — вдоль узкого прохода с плиткой по бокам.",
    cheapTip: "Фото красивее ближе к вечеру, без дополнительных расходов.",
    safetyTip: "Священное место: уважительная одежда и спокойное поведение.",
    driverText: "Пожалуйста, отвезите меня в Шахи-Зинда.",
  },
  {
    id: "dubai-creek",
    cityId: "dubai",
    title: "Dubai Creek",
    category: "sight",
    subtitle: "Старый город, лодки abra и рынки",
    address: "Deira",
    lat: 25.2684,
    lng: 55.2972,
    entryUZS: 10000,
    spendUZS: 60000,
    durationMin: 90,
    rating: 4.6,
    crowd: "medium",
    bestTime: "17:00–20:00",
    openNow: true,
    deal: "Abra стоит дешево и дает атмосферу старого Дубая",
    photoTip: "Снимай лодки на закате и отражения на воде.",
    cheapTip:
      "Еда и сувениры в старом районе часто дешевле, чем у небоскребов.",
    safetyTip: "Торгуйся на рынках, цены могут завышать.",
    driverText: "Please take me to Dubai Creek.",
  },
  {
    id: "istanbul-hagia",
    cityId: "istanbul",
    title: "Айя-София",
    category: "museum",
    subtitle: "Главная историческая точка города",
    address: "Sultanahmet",
    lat: 41.0086,
    lng: 28.9802,
    entryUZS: 180000,
    spendUZS: 0,
    durationMin: 100,
    rating: 4.9,
    crowd: "high",
    bestTime: "09:00–11:00",
    openNow: true,
    photoTip: "Снимай с площади утром, пока меньше людей.",
    cheapTip: "Приходи рано: меньше очереди и меньше лишних расходов.",
    safetyTip: "Много туристов, следи за вещами.",
    driverText: "Please take me to Hagia Sophia, Sultanahmet.",
  },
];

function getCountry(id: CountryId) {
  return countries.find((item) => item.id === id) ?? countries[0];
}

function getCity(id: string) {
  return cities.find((item) => item.id === id) ?? cities[0];
}

function getCities(countryId: CountryId) {
  return cities.filter((item) => item.countryId === countryId);
}

function convertFromUZS(valueUZS: number, country: Country) {
  const rate = ratesToUZS[country.currency] ?? 1;
  return Math.max(0, Math.round(valueUZS / rate));
}

function money(valueUZS: number, country: Country) {
  return `${convertFromUZS(valueUZS, country).toLocaleString("ru-RU")} ${country.currency}`;
}

function parseBudget(value: string, country: Country) {
  const numeric = Number(value.replace(/\D/g, ""));
  return numeric * (ratesToUZS[country.currency] ?? 1);
}

function distanceKm(a: Place, b: Place) {
  const raw =
    Math.sqrt(Math.pow(a.lat - b.lat, 2) + Math.pow(a.lng - b.lng, 2)) * 110;
  return Math.max(1, Math.round(raw));
}

function taxiPrice(city: City, km: number) {
  return Math.round(city.taxiBaseUZS + city.taxiKmUZS * km);
}

function createFullDayPlaces(city: City, customCityName: string) {
  const real = realPlaces.filter((place) => place.cityId === city.id);
  const fill = fullDayTemplates.map((template, index) => ({
    ...template,
    id: `template-${city.id}-${index}`,
    cityId: city.id,
    lat: 41 + index * 0.012,
    lng: 69 + index * 0.012,
    address: `${customCityName}, ${template.address}`,
  }));

  const merged = [...real, ...fill];
  return merged.filter((place, index, array) => {
    return (
      array.findIndex(
        (item) =>
          item.title === place.title && item.category === place.category,
      ) === index
    );
  });
}

function buildFullDayRoute(city: City, places: Place[], mode: TravelMode) {
  const preferredByMode: Record<TravelMode, Category[]> = {
    normal: ["breakfast", "sight", "museum", "food", "shop", "photo", "night"],
    tired: ["breakfast", "sight", "food", "nature", "photo", "night"],
    eat: ["breakfast", "food", "shop", "food", "photo", "night"],
    cheap: ["breakfast", "sight", "nature", "food", "shop", "night"],
    beautiful: ["breakfast", "sight", "museum", "photo", "nature", "night"],
    nightSafe: ["food", "photo", "night"],
  };

  const categories = preferredByMode[mode];
  const sorted = [...places].sort((a, b) => {
    const aCat = categories.includes(a.category) ? 1 : 0;
    const bCat = categories.includes(b.category) ? 1 : 0;
    const aCheap = mode === "cheap" ? -(a.entryUZS + a.spendUZS) / 100000 : 0;
    const bCheap = mode === "cheap" ? -(b.entryUZS + b.spendUZS) / 100000 : 0;
    const aCalm = mode === "tired" && a.crowd === "low" ? 1.5 : 0;
    const bCalm = mode === "tired" && b.crowd === "low" ? 1.5 : 0;
    return (
      bCat + b.rating + bCheap + bCalm - (aCat + a.rating + aCheap + aCalm)
    );
  });

  const times =
    mode === "nightSafe"
      ? ["18:30", "19:30", "20:30", "21:30"]
      : [
          "09:00",
          "10:15",
          "11:45",
          "13:15",
          "14:45",
          "16:15",
          "17:45",
          "19:15",
          "21:15",
        ];

  const result: RouteStep[] = [];
  const limit = mode === "tired" ? 6 : mode === "nightSafe" ? 4 : 9;

  sorted.forEach((place) => {
    if (result.length >= limit) return;
    const prev = result[result.length - 1];
    const km = prev ? distanceKm(prev, place) : 0;
    const taxiUZS = prev ? taxiPrice(city, km) : 0;

    result.push({
      ...place,
      order: result.length + 1,
      time: times[result.length] ?? "12:00",
      distanceKm: km,
      taxiUZS,
      transportText: prev
        ? `Такси ${km} км · примерно ${Math.max(8, km * 4)} мин`
        : "Старт из отеля / текущей точки",
    });
  });

  return result;
}

function createNotices(route: RouteStep[], country: Country, city: City) {
  const notices: SmartNotice[] = [];
  const deal = route.find((item) => item.deal);
  const crowded = route.find((item) => item.crowd === "high");
  const photo = route.find(
    (item) => item.category === "photo" || item.category === "sight",
  );
  const food = route.find(
    (item) => item.category === "food" || item.category === "breakfast",
  );

  if (deal) {
    notices.push({
      id: "deal",
      icon: "pricetag",
      kind: "deal",
      title: "Акция по маршруту",
      text: `${deal.title}: ${deal.deal}`,
    });
  }

  if (crowded) {
    notices.push({
      id: "crowd",
      icon: "people",
      kind: "crowd",
      title: "Там много людей",
      text: `${crowded.title}: лучше прийти раньше или перенести ближе к вечеру.`,
    });
  }

  if (photo) {
    notices.push({
      id: "photo",
      icon: "aperture",
      kind: "photo",
      title: "Фото-гид",
      text: `${photo.title}: ${photo.photoTip}`,
    });
  }

  if (food) {
    notices.push({
      id: "food",
      icon: "restaurant",
      kind: "food",
      title: "Пора поесть",
      text: `${food.title}: заложи примерно ${money(food.spendUZS, country)}.`,
    });
  }

  notices.push({
    id: "cash",
    icon: "cash",
    kind: "money",
    title: "Сколько взять наличных",
    text: city.cashTip,
  });

  notices.push({
    id: "safety",
    icon: "shield",
    kind: "safety",
    title: "Безопасность",
    text: `SOS: полиция ${country.emergency.police}, скорая ${country.emergency.ambulance}, туристическая помощь ${country.emergency.tourist}.`,
  });

  return notices;
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

  Linking.openURL(url).catch(() => Alert.alert("Такси", to.driverText));
}

function callNumber(number: string) {
  Linking.openURL(`tel:${number}`).catch(() => Alert.alert("Номер", number));
}

function priceAdvice(inputPriceUZS: number, referenceUZS: number) {
  if (!inputPriceUZS) return "Введите цену товара, чтобы проверить.";
  const ratio = inputPriceUZS / Math.max(referenceUZS, 1);
  if (ratio >= 2.2)
    return "Очень дорого. Похоже на туристическую цену. Торгуйся или уходи.";
  if (ratio >= 1.35) return "Дороговато. Можно просить скидку 20–30%.";
  if (ratio >= 0.75) return "Цена выглядит нормально.";
  return "Цена хорошая. Проверь качество и упаковку.";
}

const checklistItems: CheckItem[] = [
  {
    id: "passport",
    title: "Паспорт / ID",
    subtitle: "Фото в телефоне + оригинал в безопасном месте",
    icon: "id-card",
  },
  {
    id: "cash",
    title: "Наличные",
    subtitle: "Для рынка, воды, мелких покупок и такси",
    icon: "cash",
  },
  {
    id: "card",
    title: "Карта",
    subtitle: "Проверь лимиты и работу за границей",
    icon: "card",
  },
  {
    id: "power",
    title: "Powerbank",
    subtitle: "Для карты, фото, связи и переводчика",
    icon: "battery-charging",
  },
  {
    id: "water",
    title: "Вода",
    subtitle: "Особенно в жарких городах",
    icon: "water",
  },
  {
    id: "hotel",
    title: "Адрес отеля",
    subtitle: "Сохрани офлайн и покажи водителю",
    icon: "home",
  },
  {
    id: "internet",
    title: "Интернет / SIM",
    subtitle: "Маршрут и такси должны работать весь день",
    icon: "wifi",
  },
  {
    id: "medicine",
    title: "Лекарства",
    subtitle: "Мини-аптечка, если есть личные препараты",
    icon: "medkit",
  },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [countryId, setCountryId] = useState<CountryId>("uz");
  const [cityId, setCityId] = useState("tashkent");
  const [customCity, setCustomCity] = useState("");
  const [budgetInput, setBudgetInput] = useState("500000");
  const [mode, setMode] = useState<TravelMode>("normal");
  const [priceInput, setPriceInput] = useState("");
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const country = getCountry(countryId);
  const city = getCity(cityId);
  const cityName = customCity.trim() || city.name;
  const cityList = getCities(countryId);
  const places = useMemo(
    () => createFullDayPlaces(city, cityName),
    [city.id, cityName],
  );
  const route = useMemo(
    () => buildFullDayRoute(city, places, mode),
    [city, places, mode],
  );
  const budgetUZS = parseBudget(budgetInput, country);

  const totals = useMemo(() => {
    const entry = route.reduce((sum, item) => sum + item.entryUZS, 0);
    const spend = route.reduce((sum, item) => sum + item.spendUZS, 0);
    const taxi = route.reduce((sum, item) => sum + item.taxiUZS, 0);
    return { entry, spend, taxi, total: entry + spend + taxi };
  }, [route]);

  const remaining = budgetUZS - totals.total;
  const notices = useMemo(
    () => createNotices(route, country, city),
    [route, country, city],
  );
  const nextPoint = route[1] ?? route[0];
  const cheapPlaces = [...places]
    .sort((a, b) => a.entryUZS + a.spendUZS - (b.entryUZS + b.spendUZS))
    .slice(0, 4);
  const photoPlaces = route.filter((item) =>
    ["sight", "photo", "nature", "night"].includes(item.category),
  );
  const referencePrice = cheapPlaces[0]?.spendUZS || 100000;
  const priceUZS = parseBudget(priceInput, country);
  const checklistDone = Object.values(checked).filter(Boolean).length;

  const changeCountry = (id: CountryId) => {
    setCountryId(id);
    const first = cities.find((item) => item.countryId === id);
    if (first) {
      setCityId(first.id);
      setCustomCity("");
    }
  };

  const applyQuickMode = (nextMode: TravelMode) => {
    setMode(nextMode);
    if (nextMode === "tired")
      Alert.alert(
        "Маршрут упрощен",
        "Я убрал часть тяжелых точек и оставил больше спокойных мест.",
      );
    if (nextMode === "eat")
      Alert.alert("Хочу поесть", "Я сделал маршрут с акцентом на еду и паузы.");
    if (nextMode === "cheap")
      Alert.alert(
        "Сделал дешевле",
        "Я снизил платные точки и добавил больше бесплатных прогулок.",
      );
    if (nextMode === "beautiful")
      Alert.alert(
        "Сделал красиво",
        "Я добавил больше фото-точек и красивых мест.",
      );
    if (nextMode === "nightSafe")
      Alert.alert(
        "Безопасный вечер",
        "Я оставил короткий вечерний маршрут и рекомендую такси.",
      );
  };

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="light" />
      <View style={styles.app}>
        <Header
          cityName={cityName}
          country={country}
          total={totals.total}
          budget={budgetUZS}
        />

        {tab === "home" && (
          <HomeScreen
            country={country}
            countryId={countryId}
            changeCountry={changeCountry}
            cityList={cityList}
            cityId={cityId}
            setCityId={(id) => {
              setCityId(id);
              setCustomCity("");
            }}
            customCity={customCity}
            setCustomCity={(value) => {
              setCustomCity(value);
              if (value.trim()) setCityId(`custom-${countryId}`);
            }}
            budgetInput={budgetInput}
            setBudgetInput={setBudgetInput}
            route={route}
            totals={totals}
            budgetUZS={budgetUZS}
            remaining={remaining}
            notices={notices}
            setTab={setTab}
          />
        )}

        {tab === "live" && (
          <LiveDayScreen
            country={country}
            route={route}
            notices={notices}
            mode={mode}
            applyQuickMode={applyQuickMode}
            totals={totals}
            budgetUZS={budgetUZS}
            remaining={remaining}
          />
        )}

        {tab === "route" && (
          <RouteScreen
            country={country}
            route={route}
            totals={totals}
            budgetUZS={budgetUZS}
          />
        )}
        {tab === "places" && (
          <PlacesScreen
            country={country}
            places={places}
            cheapPlaces={cheapPlaces}
            photoPlaces={photoPlaces}
          />
        )}
        {tab === "tools" && (
          <ToolsScreen
            country={country}
            city={city}
            priceInput={priceInput}
            setPriceInput={setPriceInput}
            priceAdviceText={priceAdvice(priceUZS, referencePrice)}
            photoPlaces={photoPlaces}
            route={route}
          />
        )}
        {tab === "checklist" && (
          <ChecklistScreen
            checked={checked}
            setChecked={setChecked}
            checklistDone={checklistDone}
            country={country}
            city={city}
          />
        )}
        {tab === "sos" && <SosScreen country={country} nextPoint={nextPoint} />}

        <BottomTabs active={tab} setActive={setTab} />
      </View>
    </SafeAreaView>
  );
}

function Header({
  cityName,
  country,
  total,
  budget,
}: {
  cityName: string;
  country: Country;
  total: number;
  budget: number;
}) {
  const ok = total <= budget;
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.logo}>TripMate</Text>
        <Text style={styles.headerSub}>live travel assistant</Text>
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
  countryId: CountryId;
  changeCountry: (id: CountryId) => void;
  cityList: City[];
  cityId: string;
  setCityId: (id: string) => void;
  customCity: string;
  setCustomCity: (value: string) => void;
  budgetInput: string;
  setBudgetInput: (value: string) => void;
  route: RouteStep[];
  totals: { entry: number; spend: number; taxi: number; total: number };
  budgetUZS: number;
  remaining: number;
  notices: SmartNotice[];
  setTab: (tab: Tab) => void;
}) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.heroSun} />
        <View style={styles.heroBadge}>
          <Ionicons name="sparkles" size={15} color={colors.dark} />
          <Text style={styles.heroBadgeText}>LIVE DAY</Text>
        </View>
        <Text style={styles.heroTitle}>Приложение ведет туриста весь день</Text>
        <Text style={styles.heroText}>
          Маршрут, такси, бюджет, фото-гид, проверка цен, что купить, чек-лист и
          кнопки “я устал / хочу поесть / сделай дешевле”.
        </Text>

        <Pressable
          style={styles.heroButton}
          onPress={() => props.setTab("live")}
        >
          <Text style={styles.heroButtonText}>Запустить живой день</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.dark} />
        </Pressable>
      </View>

      <Section title="Умные уведомления">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {props.notices.map((notice) => (
            <NoticeCard key={notice.id} notice={notice} />
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
              onPress={() => props.changeCountry(country.id)}
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
          {props.cityList.map((city) => (
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

        <View style={styles.inputBox}>
          <Ionicons name="search" size={18} color={colors.muted} />
          <TextInput
            value={props.customCity}
            onChangeText={props.setCustomCity}
            placeholder="Или введи любой город мира"
            placeholderTextColor={colors.muted}
            style={styles.input}
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

      <View style={styles.summaryCard}>
        <Text style={styles.kicker}>ПЛАН НА ВЕСЬ ДЕНЬ</Text>
        <Text style={styles.summaryTitle}>
          {props.route.length} точек ·{" "}
          {money(props.totals.total, props.country)}
        </Text>
        <Text style={styles.cardMuted}>
          {props.route.map((item) => item.title).join(" → ")}
        </Text>
        <View style={styles.statGrid}>
          <MiniStat
            label="Бюджет"
            value={money(props.budgetUZS, props.country)}
          />
          <MiniStat
            label="Итого"
            value={money(props.totals.total, props.country)}
          />
          <MiniStat
            label="Остаток"
            value={money(props.remaining, props.country)}
          />
        </View>
      </View>
    </ScrollView>
  );
}

function LiveDayScreen(props: {
  country: Country;
  route: RouteStep[];
  notices: SmartNotice[];
  mode: TravelMode;
  applyQuickMode: (mode: TravelMode) => void;
  totals: { entry: number; spend: number; taxi: number; total: number };
  budgetUZS: number;
  remaining: number;
}) {
  const current = props.route[0];
  const next = props.route[1];

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.liveHero}>
        <Text style={styles.kicker}>ЖИВОЙ ДЕНЬ</Text>
        <Text style={styles.liveTitle}>Сейчас: {current?.title}</Text>
        <Text style={styles.cardMuted}>{current?.subtitle}</Text>

        <View style={styles.actionRow}>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => current && openMap(current)}
          >
            <Ionicons name="map" size={17} color={colors.dark} />
            <Text style={styles.secondaryButtonText}>Карта</Text>
          </Pressable>
          <Pressable
            style={styles.darkButton}
            onPress={() => next && openTaxi(current, next)}
          >
            <Ionicons name="car" size={17} color={colors.text} />
            <Text style={styles.darkButtonText}>Такси дальше</Text>
          </Pressable>
        </View>
      </View>

      <Section title="Быстрые команды">
        <View style={styles.commandGrid}>
          <CommandButton
            icon="battery-dead"
            title="Я устал"
            subtitle="Упростить"
            onPress={() => props.applyQuickMode("tired")}
          />
          <CommandButton
            icon="restaurant"
            title="Хочу поесть"
            subtitle="Еда ближе"
            onPress={() => props.applyQuickMode("eat")}
          />
          <CommandButton
            icon="cash"
            title="Сделай дешевле"
            subtitle="Экономия"
            onPress={() => props.applyQuickMode("cheap")}
          />
          <CommandButton
            icon="aperture"
            title="Сделай красиво"
            subtitle="Фото-точки"
            onPress={() => props.applyQuickMode("beautiful")}
          />
          <CommandButton
            icon="moon"
            title="Ночной safe"
            subtitle="Только такси"
            onPress={() => props.applyQuickMode("nightSafe")}
          />
          <CommandButton
            icon="refresh"
            title="Обычный день"
            subtitle="Вернуть"
            onPress={() => props.applyQuickMode("normal")}
          />
        </View>
      </Section>

      <Section title="Рекомендации">
        {props.notices.map((notice) => (
          <NoticeWide key={notice.id} notice={notice} />
        ))}
      </Section>

      <View style={styles.summaryCard}>
        <Text style={styles.kicker}>БЮДЖЕТ</Text>
        <Text style={styles.summaryTitle}>
          {money(props.totals.total, props.country)} из{" "}
          {money(props.budgetUZS, props.country)}
        </Text>
        <Text style={styles.cardMuted}>
          Остаток: {money(props.remaining, props.country)}
        </Text>
      </View>

      <Section title="Расписание дня">
        {props.route.map((step, index) => {
          const previous = index > 0 ? props.route[index - 1] : null;
          return (
            <RouteStepCard
              key={step.id}
              step={step}
              previous={previous}
              country={props.country}
            />
          );
        })}
      </Section>
    </ScrollView>
  );
}

function RouteScreen({
  country,
  route,
  totals,
  budgetUZS,
}: {
  country: Country;
  route: RouteStep[];
  totals: { entry: number; spend: number; taxi: number; total: number };
  budgetUZS: number;
}) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.summaryCard}>
        <Text style={styles.kicker}>ПОЛНЫЙ МАРШРУТ</Text>
        <Text style={styles.summaryTitle}>
          {route.length} точек с 09:00 до 22:00
        </Text>
        <View style={styles.statGrid}>
          <MiniStat label="Билеты" value={money(totals.entry, country)} />
          <MiniStat label="Еда/покупки" value={money(totals.spend, country)} />
          <MiniStat label="Такси" value={money(totals.taxi, country)} />
        </View>
        <Text style={styles.cardMuted}>
          Итого: {money(totals.total, country)} / бюджет:{" "}
          {money(budgetUZS, country)}
        </Text>
      </View>

      {route.map((step, index) => {
        const previous = index > 0 ? route[index - 1] : null;
        return (
          <RouteStepCard
            key={step.id}
            step={step}
            previous={previous}
            country={country}
          />
        );
      })}
    </ScrollView>
  );
}

function PlacesScreen({
  country,
  places,
  cheapPlaces,
  photoPlaces,
}: {
  country: Country;
  places: Place[];
  cheapPlaces: Place[];
  photoPlaces: RouteStep[];
}) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <Section title="Где дешевле">
        {cheapPlaces.map((place) => (
          <CompactPlace key={place.id} place={place} country={country} />
        ))}
      </Section>

      <Section title="Фото-гид">
        {photoPlaces.slice(0, 5).map((place) => (
          <View key={place.id} style={styles.photoCard}>
            <Text style={styles.cardTitle}>{place.title}</Text>
            <Text style={styles.cardMuted}>{place.photoTip}</Text>
          </View>
        ))}
      </Section>

      <Section title="Все места">
        {places.map((place) => (
          <PlaceCard key={place.id} place={place} country={country} />
        ))}
      </Section>
    </ScrollView>
  );
}

function ToolsScreen(props: {
  country: Country;
  city: City;
  priceInput: string;
  setPriceInput: (value: string) => void;
  priceAdviceText: string;
  photoPlaces: RouteStep[];
  route: RouteStep[];
}) {
  const driverPoint = props.route[0];

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <Section title="Проверка туристической цены">
        <View style={styles.toolCard}>
          <Text style={styles.cardTitle}>Проверь, не завышена ли цена</Text>
          <Text style={styles.cardMuted}>
            Введи цену товара, которую тебе назвали.
          </Text>
          <View style={styles.inputBox}>
            <Ionicons name="cash" size={18} color={colors.muted} />
            <TextInput
              value={props.priceInput}
              onChangeText={props.setPriceInput}
              keyboardType="number-pad"
              placeholder={`Цена в ${props.country.currency}`}
              placeholderTextColor={colors.muted}
              style={styles.input}
            />
          </View>
          <Text style={styles.adviceText}>{props.priceAdviceText}</Text>
        </View>
      </Section>

      <Section title="Что купить в городе">
        {props.city.buyList.map((item) => (
          <View key={item.title} style={styles.buyCard}>
            <Text style={styles.cardTitle}>{item.title}</Text>
            <Text style={styles.cardMuted}>
              Нормальная цена: {item.normalPriceUZS}
            </Text>
            <Text style={styles.cardMuted}>Где: {item.where}</Text>
            <Text style={styles.tip}>Совет: {item.tip}</Text>
          </View>
        ))}
      </Section>

      <Section title="Фразы для торга">
        {[
          "Очень красиво, но дорого. Сделайте дешевле, пожалуйста.",
          "Если я возьму два товара, какая будет последняя цена?",
          "Я посмотрю еще и вернусь, если цена будет лучше.",
        ].map((phrase) => (
          <View key={phrase} style={styles.phraseCard}>
            <Text style={styles.phraseText}>{phrase}</Text>
          </View>
        ))}
      </Section>

      <Section title="Показать водителю">
        <View style={styles.driverCard}>
          <Text style={styles.driverTitle}>
            {driverPoint?.driverText ??
              "Пожалуйста, отвезите меня по этому адресу."}
          </Text>
          <Text style={styles.cardMuted}>{driverPoint?.address}</Text>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => driverPoint && openTaxi(null, driverPoint)}
          >
            <Ionicons name="car" size={17} color={colors.dark} />
            <Text style={styles.secondaryButtonText}>Открыть такси</Text>
          </Pressable>
        </View>
      </Section>
    </ScrollView>
  );
}

function ChecklistScreen({
  checked,
  setChecked,
  checklistDone,
  country,
  city,
}: {
  checked: Record<string, boolean>;
  setChecked: (value: Record<string, boolean>) => void;
  checklistDone: number;
  country: Country;
  city: City;
}) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.summaryCard}>
        <Text style={styles.kicker}>ЧЕК-ЛИСТ ПЕРЕД ВЫХОДОМ</Text>
        <Text style={styles.summaryTitle}>
          {checklistDone} из {checklistItems.length} готово
        </Text>
        <Text style={styles.cardMuted}>{city.cashTip}</Text>
      </View>

      {checklistItems.map((item) => {
        const done = Boolean(checked[item.id]);
        return (
          <Pressable
            key={item.id}
            style={[styles.checkRow, done && styles.checkRowDone]}
            onPress={() => setChecked({ ...checked, [item.id]: !done })}
          >
            <View style={[styles.checkIcon, done && styles.checkIconDone]}>
              <Ionicons
                name={done ? "checkmark" : item.icon}
                size={20}
                color={done ? colors.dark : colors.accent}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardMuted}>{item.subtitle}</Text>
            </View>
          </Pressable>
        );
      })}

      <View style={styles.summaryCard}>
        <Text style={styles.kicker}>ОФЛАЙН-КАРТОЧКА</Text>
        <Text style={styles.cardTitle}>
          {country.emoji} {country.name}
        </Text>
        <Text style={styles.cardMuted}>
          Полиция: {country.emergency.police} · Скорая:{" "}
          {country.emergency.ambulance} · Туристическая помощь:{" "}
          {country.emergency.tourist}
        </Text>
      </View>
    </ScrollView>
  );
}

function SosScreen({
  country,
  nextPoint,
}: {
  country: Country;
  nextPoint?: RouteStep;
}) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.sosHero}>
        <Ionicons name="shield-checkmark" size={42} color="#FB7185" />
        <Text style={styles.sosTitle}>Я потерялся / нужна помощь</Text>
        <Text style={styles.cardMuted}>Быстрые действия для туриста.</Text>
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

      <Section title="Фраза местному человеку">
        <View style={styles.driverCard}>
          <Text style={styles.driverTitle}>
            Здравствуйте. Я турист. Помогите, пожалуйста, мне нужно добраться до
            безопасного места.
          </Text>
        </View>
      </Section>

      {nextPoint ? (
        <Pressable
          style={styles.heroButton}
          onPress={() => openTaxi(null, nextPoint)}
        >
          <Text style={styles.heroButtonText}>
            Вызвать такси до следующей точки
          </Text>
          <Ionicons name="car" size={20} color={colors.dark} />
        </Pressable>
      ) : null}
    </ScrollView>
  );
}

function RouteStepCard({
  step,
  previous,
  country,
}: {
  step: RouteStep;
  previous: RouteStep | null;
  country: Country;
}) {
  return (
    <View style={styles.routeCard}>
      <View style={styles.stepCircle}>
        <Text style={styles.stepText}>{step.order}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <View style={styles.cardTop}>
          <Text style={styles.timeText}>{step.time}</Text>
          <Text style={[styles.crowdText, { color: crowdColors[step.crowd] }]}>
            {crowdLabels[step.crowd]}
          </Text>
        </View>
        <Text style={styles.placeTitle}>{step.title}</Text>
        <Text style={styles.cardMuted}>{step.subtitle}</Text>
        {step.deal ? <Text style={styles.dealText}>🔥 {step.deal}</Text> : null}
        <Text style={styles.info}>📍 {step.address}</Text>
        <Text style={styles.info}>
          🎫 Вход {money(step.entryUZS, country)} · траты{" "}
          {money(step.spendUZS, country)}
        </Text>
        <Text style={styles.info}>
          🚕 {step.transportText} · {money(step.taxiUZS, country)}
        </Text>
        <Text style={styles.tip}>📸 {step.photoTip}</Text>

        <View style={styles.actionRow}>
          <Pressable
            style={styles.secondaryButton}
            onPress={() => openTaxi(previous, step)}
          >
            <Ionicons name="car" size={17} color={colors.dark} />
            <Text style={styles.secondaryButtonText}>Вызвать такси</Text>
          </Pressable>
          <Pressable style={styles.darkButton} onPress={() => openMap(step)}>
            <Ionicons name="map" size={17} color={colors.text} />
            <Text style={styles.darkButtonText}>Карта</Text>
          </Pressable>
        </View>
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
      <Text style={styles.info}>
        Цена: {money(place.entryUZS + place.spendUZS, country)} ·{" "}
        {place.bestTime}
      </Text>
      <Text style={styles.tip}>{place.cheapTip}</Text>
    </View>
  );
}

function CompactPlace({ place, country }: { place: Place; country: Country }) {
  return (
    <View style={styles.compactCard}>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{place.title}</Text>
        <Text style={styles.cardMuted}>
          {categoryLabels[place.category]} ·{" "}
          {money(place.entryUZS + place.spendUZS, country)}
        </Text>
      </View>
      <Text style={[styles.crowdText, { color: crowdColors[place.crowd] }]}>
        {crowdLabels[place.crowd]}
      </Text>
    </View>
  );
}

function NoticeCard({ notice }: { notice: SmartNotice }) {
  return (
    <View style={styles.noticeCard}>
      <View style={styles.noticeIcon}>
        <Ionicons name={notice.icon} size={20} color={colors.dark} />
      </View>
      <Text style={styles.noticeTitle}>{notice.title}</Text>
      <Text style={styles.noticeText}>{notice.text}</Text>
    </View>
  );
}

function NoticeWide({ notice }: { notice: SmartNotice }) {
  return (
    <View style={styles.noticeWide}>
      <Ionicons name={notice.icon} size={22} color={colors.accent} />
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{notice.title}</Text>
        <Text style={styles.cardMuted}>{notice.text}</Text>
      </View>
    </View>
  );
}

function CommandButton({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <Pressable style={styles.commandButton} onPress={onPress}>
      <Ionicons name={icon} size={22} color={colors.accent} />
      <Text style={styles.commandTitle}>{title}</Text>
      <Text style={styles.commandSub}>{subtitle}</Text>
    </Pressable>
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
    { id: "live", title: "День", icon: "navigate" },
    { id: "route", title: "Маршрут", icon: "map" },
    { id: "places", title: "Места", icon: "compass" },
    { id: "tools", title: "Инструм.", icon: "construct" },
    { id: "checklist", title: "Чек", icon: "checkbox" },
    { id: "sos", title: "SOS", icon: "shield" },
  ];

  return (
    <View style={styles.tabs}>
      {tabs.map((tab) => {
        const selected = active === tab.id;
        return (
          <Pressable
            key={tab.id}
            style={[styles.tab, selected && styles.tabActive]}
            onPress={() => setActive(tab.id)}
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
    justifyContent: "space-between",
    alignItems: "center",
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
  pill: {
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  pillText: { color: colors.text, fontWeight: "900", fontSize: 11 },
  goodPill: { backgroundColor: "rgba(34,197,94,0.22)" },
  badPill: { backgroundColor: "rgba(251,113,133,0.22)" },
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
  heroSun: {
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
  heroButton: {
    marginTop: 18,
    minHeight: 58,
    borderRadius: 22,
    backgroundColor: colors.accent,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  heroButtonText: { color: colors.dark, fontWeight: "900", fontSize: 15 },
  section: { marginBottom: 22 },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },
  row: { gap: 10, paddingRight: 12 },
  noticeCard: {
    width: 240,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 15,
  },
  noticeIcon: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.gold,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  noticeTitle: { color: colors.text, fontWeight: "900", fontSize: 16 },
  noticeText: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
  },
  noticeWide: {
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
  input: { flex: 1, color: colors.text, fontWeight: "800" },
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
  liveHero: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 28,
    padding: 18,
    marginBottom: 18,
  },
  liveTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900",
    marginTop: 8,
  },
  commandGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  commandButton: {
    width: "31.5%",
    minHeight: 96,
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 20,
    padding: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  commandTitle: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 7,
    textAlign: "center",
  },
  commandSub: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 3,
    textAlign: "center",
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
  dealText: {
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
  photoCard: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 14,
    marginBottom: 10,
  },
  placeCard: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 15,
    marginBottom: 12,
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
  toolCard: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 15,
  },
  adviceText: {
    color: colors.gold,
    fontSize: 16,
    fontWeight: "900",
    lineHeight: 23,
    marginTop: 12,
  },
  buyCard: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 14,
    marginBottom: 10,
  },
  phraseCard: {
    backgroundColor: colors.panel2,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 18,
    padding: 13,
    marginBottom: 8,
  },
  phraseText: { color: colors.text, fontWeight: "900", lineHeight: 20 },
  driverCard: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 24,
    padding: 15,
  },
  driverTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    lineHeight: 29,
  },
  checkRow: {
    backgroundColor: colors.panel,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 22,
    padding: 14,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  checkRowDone: {
    backgroundColor: "rgba(157,220,255,0.18)",
    borderColor: colors.accent,
  },
  checkIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.panel2,
    alignItems: "center",
    justifyContent: "center",
  },
  checkIconDone: { backgroundColor: colors.accent },
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
