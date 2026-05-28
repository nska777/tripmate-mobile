import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
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

type Tab = "home" | "places" | "map" | "taxi" | "wallet" | "ai" | "profile";
type Budget = "economy" | "comfort" | "premium";
type Duration = "3h" | "1d" | "2d" | "3d";
type Crowd = "low" | "medium" | "high";

type Country = {
  id: string;
  title: string;
  emoji: string;
  currency: string;
  cities: string[];
  ready: boolean;
};

type Place = {
  id: string;
  countryId: string;
  city: string;
  title: string;
  category:
    | "museum"
    | "food"
    | "shop"
    | "sight"
    | "park"
    | "exchange"
    | "emergency";
  subtitle: string;
  address: string;
  price: number;
  cheapPrice?: number;
  crowd: Crowd;
  rating: number;
  openNow: boolean;
  bestTime: string;
  duration: string;
  tip: string;
  safety: string;
  tags: string[];
};

type RoutePoint = Place & {
  time: string;
  transport: string;
  taxiPrice: number;
};

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

const countries: Country[] = [
  {
    id: "uz",
    title: "Узбекистан",
    emoji: "🇺🇿",
    currency: "UZS",
    cities: ["Ташкент", "Самарканд", "Бухара", "Хива"],
    ready: true,
  },
  {
    id: "ae",
    title: "ОАЭ",
    emoji: "🇦🇪",
    currency: "AED",
    cities: ["Дубай", "Абу‑Даби"],
    ready: true,
  },
  {
    id: "tr",
    title: "Турция",
    emoji: "🇹🇷",
    currency: "TRY",
    cities: ["Стамбул", "Анталия"],
    ready: true,
  },
  {
    id: "kz",
    title: "Казахстан",
    emoji: "🇰🇿",
    currency: "KZT",
    cities: ["Алматы", "Астана"],
    ready: true,
  },
  {
    id: "ru",
    title: "Россия",
    emoji: "🇷🇺",
    currency: "RUB",
    cities: ["Москва", "Санкт‑Петербург", "Сочи"],
    ready: false,
  },
  {
    id: "th",
    title: "Таиланд",
    emoji: "🇹🇭",
    currency: "THB",
    cities: ["Бангкок", "Пхукет"],
    ready: false,
  },
  {
    id: "eg",
    title: "Египет",
    emoji: "🇪🇬",
    currency: "EGP",
    cities: ["Каир", "Шарм‑эль‑Шейх"],
    ready: false,
  },
  {
    id: "it",
    title: "Италия",
    emoji: "🇮🇹",
    currency: "EUR",
    cities: ["Рим", "Милан", "Венеция"],
    ready: false,
  },
  {
    id: "fr",
    title: "Франция",
    emoji: "🇫🇷",
    currency: "EUR",
    cities: ["Париж", "Ницца"],
    ready: false,
  },
  {
    id: "es",
    title: "Испания",
    emoji: "🇪🇸",
    currency: "EUR",
    cities: ["Барселона", "Мадрид"],
    ready: false,
  },
  {
    id: "us",
    title: "США",
    emoji: "🇺🇸",
    currency: "USD",
    cities: ["Нью‑Йорк", "Лос‑Анджелес"],
    ready: false,
  },
  {
    id: "jp",
    title: "Япония",
    emoji: "🇯🇵",
    currency: "JPY",
    cities: ["Токио", "Киото"],
    ready: false,
  },
];

const budgets: {
  id: Budget;
  title: string;
  subtitle: string;
  multiplier: number;
}[] = [
  { id: "economy", title: "Эконом", subtitle: "где дешевле", multiplier: 0.72 },
  { id: "comfort", title: "Комфорт", subtitle: "баланс", multiplier: 1 },
  { id: "premium", title: "Премиум", subtitle: "лучшее", multiplier: 1.75 },
];

const durations: { id: Duration; title: string; count: number }[] = [
  { id: "3h", title: "3 часа", count: 3 },
  { id: "1d", title: "1 день", count: 5 },
  { id: "2d", title: "2 дня", count: 7 },
  { id: "3d", title: "3 дня", count: 9 },
];

const basePlaces: Place[] = [
  {
    id: "tashkent-hazrati",
    countryId: "uz",
    city: "Ташкент",
    title: "Хазрати Имам",
    category: "sight",
    subtitle: "Главная историческая точка старого города",
    address: "Старый город",
    price: 30000,
    cheapPrice: 0,
    crowd: "medium",
    rating: 4.8,
    openNow: true,
    bestTime: "10:00–12:00",
    duration: "70 мин",
    tip: "Приезжай утром: мягкий свет и меньше групп.",
    safety: "Спокойно, но держи телефон ближе к себе.",
    tags: ["история", "фото", "семья"],
  },
  {
    id: "tashkent-chorsu",
    countryId: "uz",
    city: "Ташкент",
    title: "Чорсу базар",
    category: "shop",
    subtitle: "Специи, сувениры, лепешки, восточный рынок",
    address: "м. Чорсу",
    price: 90000,
    cheapPrice: 55000,
    crowd: "high",
    rating: 4.6,
    openNow: true,
    bestTime: "11:00–14:00",
    duration: "85 мин",
    tip: "Сначала сравни 2–3 ряда, потом покупай.",
    safety: "Людно, аккуратнее с кошельком.",
    tags: ["шопинг", "еда", "дешево"],
  },
  {
    id: "tashkent-plov",
    countryId: "uz",
    city: "Ташкент",
    title: "Центр плова",
    category: "food",
    subtitle: "Популярный плов, быстро и понятно туристу",
    address: "район телевышки",
    price: 85000,
    cheapPrice: 60000,
    crowd: "high",
    rating: 4.5,
    openNow: true,
    bestTime: "12:00–14:00",
    duration: "60 мин",
    tip: "Плов лучше есть днем, вечером может закончиться.",
    safety: "Выбирай места с большим потоком гостей.",
    tags: ["еда", "дешево"],
  },
  {
    id: "samarkand-registan",
    countryId: "uz",
    city: "Самарканд",
    title: "Регистан",
    category: "sight",
    subtitle: "Главный символ Самарканда",
    address: "Registon ko‘chasi",
    price: 70000,
    cheapPrice: 70000,
    crowd: "high",
    rating: 4.9,
    openNow: true,
    bestTime: "09:00–11:30",
    duration: "110 мин",
    tip: "Вернись вечером ради подсветки.",
    safety: "Туристическая зона, цены у продавцов выше.",
    tags: ["история", "фото"],
  },
  {
    id: "samarkand-siab",
    countryId: "uz",
    city: "Самарканд",
    title: "Сиабский базар",
    category: "shop",
    subtitle: "Лепешки, сладости, специи и сувениры",
    address: "рядом с Биби‑Ханым",
    price: 110000,
    cheapPrice: 65000,
    crowd: "medium",
    rating: 4.7,
    openNow: true,
    bestTime: "12:00–14:00",
    duration: "80 мин",
    tip: "Пробуй до покупки и торгуйся спокойно.",
    safety: "Заранее уточняй цену за штуку или килограмм.",
    tags: ["шопинг", "еда", "дешево"],
  },
  {
    id: "samarkand-shahi",
    countryId: "uz",
    city: "Самарканд",
    title: "Шахи‑Зинда",
    category: "museum",
    subtitle: "Одна из самых красивых улиц мавзолеев",
    address: "улица Шахи‑Зинда",
    price: 60000,
    cheapPrice: 60000,
    crowd: "medium",
    rating: 4.9,
    openNow: true,
    bestTime: "15:30–17:30",
    duration: "85 мин",
    tip: "Лучший свет ближе к вечеру.",
    safety: "Священное место, соблюдай тишину.",
    tags: ["музей", "история", "фото"],
  },
  {
    id: "dubai-mall",
    countryId: "ae",
    city: "Дубай",
    title: "Dubai Mall",
    category: "shop",
    subtitle: "Шопинг, фонтаны, рестораны, аквариум",
    address: "Downtown Dubai",
    price: 220000,
    cheapPrice: 90000,
    crowd: "high",
    rating: 4.8,
    openNow: true,
    bestTime: "10:00–13:00",
    duration: "120 мин",
    tip: "Еда в фудкорте дешевле ресторанов с видом.",
    safety: "Очень безопасно, но легко потратить лишнее.",
    tags: ["шопинг", "еда", "популярно"],
  },
  {
    id: "dubai-creek",
    countryId: "ae",
    city: "Дубай",
    title: "Dubai Creek",
    category: "sight",
    subtitle: "Старый город, лодки abra, рынки",
    address: "Deira",
    price: 60000,
    cheapPrice: 20000,
    crowd: "medium",
    rating: 4.6,
    openNow: true,
    bestTime: "17:00–20:00",
    duration: "90 мин",
    tip: "Abra стоит дешево и дает атмосферу старого Дубая.",
    safety: "Торгуйся на рынках, цену могут завышать.",
    tags: ["дешево", "фото"],
  },
  {
    id: "istanbul-hagia",
    countryId: "tr",
    city: "Стамбул",
    title: "Айя‑София",
    category: "museum",
    subtitle: "Главная историческая точка города",
    address: "Sultanahmet",
    price: 180000,
    cheapPrice: 180000,
    crowd: "high",
    rating: 4.9,
    openNow: true,
    bestTime: "09:00–11:00",
    duration: "100 мин",
    tip: "Приходи рано, очередь меньше.",
    safety: "Много туристов, следи за вещами.",
    tags: ["музей", "история"],
  },
  {
    id: "almaty-kok",
    countryId: "kz",
    city: "Алматы",
    title: "Кок‑Тобе",
    category: "park",
    subtitle: "Вид на город, прогулка, кафе",
    address: "Кок‑Тобе",
    price: 120000,
    cheapPrice: 60000,
    crowd: "medium",
    rating: 4.7,
    openNow: true,
    bestTime: "17:00–20:00",
    duration: "100 мин",
    tip: "Лучше ехать к закату.",
    safety: "Комфортно, но вечером бери такси обратно.",
    tags: ["природа", "фото"],
  },
];

const exchangeRates: Record<string, number> = {
  UZS: 1,
  AED: 3400,
  TRY: 390,
  KZT: 25,
  RUB: 145,
  THB: 365,
  EGP: 260,
  EUR: 13900,
  USD: 12850,
  JPY: 86,
};

const crowdLabels: Record<Crowd, string> = {
  low: "мало людей",
  medium: "средне",
  high: "много людей",
};
const crowdColors: Record<Crowd, string> = {
  low: "#86EFAC",
  medium: "#FDE68A",
  high: "#FDA4AF",
};

function getRate(country: Country) {
  return exchangeRates[country.currency] ?? 1;
}

function money(valueUZS: number, country: Country) {
  const converted = Math.max(1, Math.round(valueUZS / getRate(country)));
  return `${converted.toLocaleString("ru-RU")} ${country.currency}`;
}

function categoryLabel(category: Place["category"]) {
  const labels: Record<Place["category"], string> = {
    museum: "Музей",
    food: "Еда",
    shop: "Магазин",
    sight: "Место",
    park: "Парк",
    exchange: "Обмен",
    emergency: "SOS",
  };
  return labels[category];
}

function buildSmartRoute(
  places: Place[],
  duration: Duration,
  budget: Budget,
): RoutePoint[] {
  const limit = durations.find((item) => item.id === duration)?.count ?? 5;
  const budgetBoost =
    budget === "economy"
      ? (p: Place) => (p.cheapPrice ? -p.cheapPrice : p.price)
      : (p: Place) => p.price;
  const sorted = [...places].sort((a, b) => {
    if (budget === "economy") return budgetBoost(a) - budgetBoost(b);
    return b.rating - a.rating || a.price - b.price;
  });
  const times = [
    "09:30",
    "11:00",
    "12:40",
    "14:30",
    "16:20",
    "18:10",
    "20:00",
    "10:30",
    "15:30",
  ];
  return sorted.slice(0, limit).map((place, index) => ({
    ...place,
    time: times[index] ?? "12:00",
    transport:
      index === 0
        ? "Старт от отеля"
        : index % 2 === 0
          ? "Такси 10–15 мин"
          : "Пешком 8–12 мин",
    taxiPrice: index === 0 ? 0 : 25000 + index * 7000,
  }));
}

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [countryId, setCountryId] = useState("uz");
  const [city, setCity] = useState("Ташкент");
  const [budget, setBudget] = useState<Budget>("comfort");
  const [duration, setDuration] = useState<Duration>("1d");
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "история",
    "еда",
    "фото",
  ]);
  const [saved, setSaved] = useState<RoutePoint[][]>([]);
  const [spent, setSpent] = useState([
    { id: "food", title: "Еда", value: 180000 },
    { id: "taxi", title: "Такси", value: 70000 },
    { id: "tickets", title: "Музеи", value: 90000 },
    { id: "shopping", title: "Шопинг", value: 120000 },
  ]);
  const [chatText, setChatText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "a1",
      role: "assistant",
      text: "Я помогу выбрать дешевые места, избежать толпы, рассчитать расходы и вызвать такси до следующей точки.",
    },
  ]);

  const country =
    countries.find((item) => item.id === countryId) ?? countries[0];
  const cityPlaces = useMemo(
    () =>
      basePlaces.filter(
        (item) => item.countryId === country.id && item.city === city,
      ),
    [country.id, city],
  );
  const visiblePlaces = cityPlaces.length
    ? cityPlaces
    : basePlaces.filter((item) => item.countryId === "uz");
  const route = useMemo(
    () => buildSmartRoute(visiblePlaces, duration, budget),
    [visiblePlaces, duration, budget],
  );
  const totalBudgetUZS = route.reduce(
    (sum, item) => sum + item.price + item.taxiPrice,
    0,
  );
  const spentTotal = spent.reduce((sum, item) => sum + item.value, 0);
  const nextPoint = route[1] ?? route[0];

  const chooseCountry = (next: Country) => {
    setCountryId(next.id);
    setCity(next.cities[0]);
  };

  const toggleTag = (tag: string) => {
    setSelectedTags((current) =>
      current.includes(tag)
        ? current.filter((item) => item !== tag)
        : [...current, tag],
    );
  };

  const sendChat = () => {
    const text = chatText.trim();
    if (!text) return;
    const lower = text.toLowerCase();
    let answer = `Я бы начал с маршрута: ${route.map((item) => item.title).join(" → ")}. Общий бюджет: ${money(totalBudgetUZS, country)}.`;

    if (lower.includes("дешев") || lower.includes("цена")) {
      const cheap = [...visiblePlaces].sort(
        (a, b) => (a.cheapPrice ?? a.price) - (b.cheapPrice ?? b.price),
      )[0];
      answer = `Самый выгодный вариант сейчас: ${cheap.title}. Обычная цена: ${money(cheap.price, country)}, можно уложиться примерно в ${money(cheap.cheapPrice ?? cheap.price, country)}.`;
    }

    if (lower.includes("народ") || lower.includes("толп")) {
      const calm = visiblePlaces.filter((item) => item.crowd !== "high");
      answer = calm.length
        ? `Где меньше людей: ${calm.map((item) => item.title).join(", ")}.`
        : "Сейчас почти везде много людей. Лучше перенести посещение на утро.";
    }

    if (lower.includes("такси")) {
      answer = `Следующая точка: ${nextPoint.title}. Такси примерно ${money(nextPoint.taxiPrice || 25000, country)}. Нажми вкладку “Такси”.`;
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
        <Header country={country} city={city} savedCount={saved.length} />

        {tab === "home" && (
          <HomeScreen
            countries={countries}
            country={country}
            chooseCountry={chooseCountry}
            city={city}
            setCity={setCity}
            budget={budget}
            setBudget={setBudget}
            duration={duration}
            setDuration={setDuration}
            selectedTags={selectedTags}
            toggleTag={toggleTag}
            route={route}
            totalBudgetUZS={totalBudgetUZS}
            onBuild={() => setTab("map")}
            countryMoney={(value) => money(value, country)}
          />
        )}

        {tab === "places" && (
          <PlacesScreen
            places={visiblePlaces}
            country={country}
            countryMoney={(value) => money(value, country)}
          />
        )}
        {tab === "map" && (
          <MapScreen
            route={route}
            country={country}
            countryMoney={(value) => money(value, country)}
            onSave={() => setSaved((current) => [route, ...current])}
          />
        )}
        {tab === "taxi" && (
          <TaxiScreen
            route={route}
            country={country}
            city={city}
            countryMoney={(value) => money(value, country)}
          />
        )}
        {tab === "wallet" && (
          <WalletScreen
            spent={spent}
            setSpent={setSpent}
            totalBudgetUZS={totalBudgetUZS}
            spentTotal={spentTotal}
            country={country}
            countryMoney={(value) => money(value, country)}
          />
        )}
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
            city={city}
            budget={budget}
            savedCount={saved.length}
            spentTotal={spentTotal}
            countryMoney={(value) => money(value, country)}
          />
        )}

        <BottomTabs active={tab} setActive={setTab} />
      </View>
    </SafeAreaView>
  );
}

function Header({
  country,
  city,
  savedCount,
}: {
  country: Country;
  city: string;
  savedCount: number;
}) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.logo}>TripMate</Text>
        <Text style={styles.headerSub}>Global travel assistant</Text>
      </View>
      <View style={styles.headerRight}>
        <View style={styles.cityPill}>
          <Text style={styles.cityPillText}>
            {country.emoji} {city}
          </Text>
        </View>
        <View style={styles.countPill}>
          <Text style={styles.countPillText}>{savedCount}</Text>
        </View>
      </View>
    </View>
  );
}

function HomeScreen(props: {
  countries: Country[];
  country: Country;
  chooseCountry: (country: Country) => void;
  city: string;
  setCity: (city: string) => void;
  budget: Budget;
  setBudget: (budget: Budget) => void;
  duration: Duration;
  setDuration: (duration: Duration) => void;
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  route: RoutePoint[];
  totalBudgetUZS: number;
  onBuild: () => void;
  countryMoney: (value: number) => string;
}) {
  const popularTags = [
    "история",
    "еда",
    "фото",
    "дешево",
    "музей",
    "шопинг",
    "семья",
    "ночь",
    "природа",
  ];

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <View style={styles.heroGlow} />
        <Text style={styles.kicker}>AI TRAVEL OS</Text>
        <Text style={styles.heroTitle}>Путешествуй без хаоса</Text>
        <Text style={styles.heroText}>
          Маршрут, расходы, места, магазины, музеи, толпа, такси и подсказки где
          дешевле — в одном приложении.
        </Text>
        <View style={styles.heroStats}>
          <MiniStat
            value={props.countryMoney(props.totalBudgetUZS)}
            label="бюджет дня"
          />
          <MiniStat value={`${props.route.length}`} label="точек" />
        </View>
      </View>

      <Section title="1. Страна">
        <FlatList
          horizontal
          data={props.countries}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowList}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => props.chooseCountry(item)}
              style={[
                styles.countryCard,
                props.country.id === item.id && styles.activeCard,
              ]}
            >
              <Text style={styles.countryEmoji}>{item.emoji}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardText}>{item.cities.join(", ")}</Text>
              <Text style={[styles.soon, item.ready && styles.ready]}>
                {item.ready ? "Данные есть" : "Скоро база"}
              </Text>
            </Pressable>
          )}
        />
      </Section>

      <Section title="2. Город">
        <View style={styles.chips}>
          {props.country.cities.map((item) => (
            <Pressable
              key={item}
              onPress={() => props.setCity(item)}
              style={[styles.chip, props.city === item && styles.chipActive]}
            >
              <Text
                style={[
                  styles.chipText,
                  props.city === item && styles.chipTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title="3. Время">
        <View style={styles.gridTwo}>
          {durations.map((item) => (
            <ChoiceCard
              key={item.id}
              title={item.title}
              subtitle={`${item.count} точек`}
              active={props.duration === item.id}
              onPress={() => props.setDuration(item.id)}
            />
          ))}
        </View>
      </Section>

      <Section title="4. Бюджет">
        <View style={styles.gridThree}>
          {budgets.map((item) => (
            <ChoiceCard
              key={item.id}
              title={item.title}
              subtitle={item.subtitle}
              active={props.budget === item.id}
              onPress={() => props.setBudget(item.id)}
              compact
            />
          ))}
        </View>
      </Section>

      <Section title="5. Интересы">
        <View style={styles.chips}>
          {popularTags.map((tag) => {
            const active = props.selectedTags.includes(tag);
            return (
              <Pressable
                key={tag}
                onPress={() => props.toggleTag(tag)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {tag}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Section>

      <View style={styles.summaryCard}>
        <Text style={styles.kicker}>ПРЕДВАРИТЕЛЬНЫЙ МАРШРУТ</Text>
        <Text style={styles.summaryTitle}>
          {props.country.emoji} {props.city} •{" "}
          {props.countryMoney(props.totalBudgetUZS)}
        </Text>
        <Text style={styles.cardText}>
          {props.route.map((item) => item.title).join(" → ")}
        </Text>
      </View>

      <Pressable style={styles.primaryButton} onPress={props.onBuild}>
        <Text style={styles.primaryButtonText}>Построить маршрут</Text>
        <Ionicons name="arrow-forward" size={20} color="#0F172A" />
      </Pressable>
    </ScrollView>
  );
}

function PlacesScreen({
  places,
  country,
  countryMoney,
}: {
  places: Place[];
  country: Country;
  countryMoney: (value: number) => string;
}) {
  const [filter, setFilter] = useState<
    "all" | Place["category"] | "cheap" | "calm"
  >("all");
  const filters = [
    { id: "all", title: "Все" },
    { id: "museum", title: "Музеи" },
    { id: "food", title: "Еда" },
    { id: "shop", title: "Магазины" },
    { id: "cheap", title: "Где дешевле" },
    { id: "calm", title: "Без толпы" },
  ] as const;

  const visible = places.filter((place) => {
    if (filter === "all") return true;
    if (filter === "cheap")
      return Boolean(place.cheapPrice && place.cheapPrice < place.price);
    if (filter === "calm") return place.crowd !== "high";
    return place.category === filter;
  });

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <Section title="Места, музеи, магазины">
        <FlatList
          horizontal
          data={filters}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowList}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setFilter(item.id)}
              style={[
                styles.filterChip,
                filter === item.id && styles.chipActive,
              ]}
            >
              <Text
                style={[
                  styles.chipText,
                  filter === item.id && styles.chipTextActive,
                ]}
              >
                {item.title}
              </Text>
            </Pressable>
          )}
        />
      </Section>

      {visible.map((place) => (
        <PlaceCard
          key={place.id}
          place={place}
          country={country}
          countryMoney={countryMoney}
        />
      ))}
    </ScrollView>
  );
}

function PlaceCard({
  place,
  countryMoney,
}: {
  place: Place;
  country: Country;
  countryMoney: (value: number) => string;
}) {
  return (
    <View style={styles.placeCard}>
      <View style={styles.placeTop}>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardAccent}>
            {categoryLabel(place.category)} • {place.rating.toFixed(1)} ★
          </Text>
          <Text style={styles.placeTitle}>{place.title}</Text>
          <Text style={styles.cardText}>{place.subtitle}</Text>
        </View>
        <View
          style={[styles.crowdBadge, { borderColor: crowdColors[place.crowd] }]}
        >
          <Text style={[styles.crowdText, { color: crowdColors[place.crowd] }]}>
            {crowdLabels[place.crowd]}
          </Text>
        </View>
      </View>
      <View style={styles.priceRow}>
        <MiniStat value={countryMoney(place.price)} label="обычная цена" />
        <MiniStat
          value={countryMoney(place.cheapPrice ?? place.price)}
          label="можно дешевле"
        />
      </View>
      <Text style={styles.infoText}>
        📍 {place.address} • лучше {place.bestTime} • {place.duration}
      </Text>
      <Text style={styles.tipText}>Совет: {place.tip}</Text>
      <Text style={styles.safetyText}>Безопасность: {place.safety}</Text>
    </View>
  );
}

function MapScreen({
  route,
  countryMoney,
  onSave,
}: {
  route: RoutePoint[];
  country: Country;
  countryMoney: (value: number) => string;
  onSave: () => void;
}) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.mapMock}>
        <Text style={styles.kicker}>LIVE ROUTE MAP</Text>
        <Text style={styles.heroTitle}>Карта маршрута</Text>
        <Text style={styles.heroText}>
          Здесь будет Google/Apple Maps. Сейчас — визуальная схема точек, такси
          и загруженности.
        </Text>
      </View>

      <Section title="Маршрут по точкам">
        {route.map((point, index) => (
          <View key={point.id} style={styles.routeRow}>
            <View style={styles.dot}>
              <Text style={styles.dotText}>{index + 1}</Text>
            </View>
            <View style={styles.routeBody}>
              <Text style={styles.stopTime}>
                {point.time} • {point.transport}
              </Text>
              <Text style={styles.stopTitle}>{point.title}</Text>
              <Text style={styles.cardText}>{point.address}</Text>
              <Text style={styles.infoText}>
                Такси до точки:{" "}
                {point.taxiPrice ? countryMoney(point.taxiPrice) : "старт"}
              </Text>
            </View>
          </View>
        ))}
      </Section>

      <Pressable style={styles.primaryButton} onPress={onSave}>
        <Text style={styles.primaryButtonText}>Сохранить маршрут</Text>
        <Ionicons name="bookmark" size={19} color="#0F172A" />
      </Pressable>
    </ScrollView>
  );
}

function TaxiScreen({
  route,
  country,
  city,
  countryMoney,
}: {
  route: RoutePoint[];
  country: Country;
  city: string;
  countryMoney: (value: number) => string;
}) {
  const [fromIndex, setFromIndex] = useState(0);
  const from = route[fromIndex] ?? route[0];
  const to = route[fromIndex + 1] ?? route[0];

  const openMaps = () => {
    const query = encodeURIComponent(`${to.title}, ${city}`);
    Linking.openURL(
      `https://www.google.com/maps/search/?api=1&query=${query}`,
    ).catch(() => undefined);
  };

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>TAXI ASSISTANT</Text>
        <Text style={styles.heroTitle}>Такси до следующей точки</Text>
        <Text style={styles.heroText}>
          Расчет примерной цены и быстрый переход в карты/такси. Реальная
          интеграция с сервисами подключается через deep links/API.
        </Text>
      </View>

      <Section title="Выбери текущую точку">
        {route.map((point, index) => (
          <Pressable
            key={point.id}
            onPress={() => setFromIndex(index)}
            style={[styles.savedCard, fromIndex === index && styles.activeCard]}
          >
            <Text style={styles.stopTitle}>
              {index + 1}. {point.title}
            </Text>
            <Text style={styles.cardText}>{point.address}</Text>
          </Pressable>
        ))}
      </Section>

      <View style={styles.summaryCard}>
        <Text style={styles.kicker}>ПОЕЗДКА</Text>
        <Text style={styles.summaryTitle}>
          {from?.title ?? "Старт"} → {to?.title ?? "Финиш"}
        </Text>
        <Text style={styles.cardText}>
          Город: {country.emoji} {city}
        </Text>
        <Text style={styles.budget}>
          ≈ {countryMoney(to?.taxiPrice || 25000)}
        </Text>
      </View>

      <Pressable style={styles.primaryButton} onPress={openMaps}>
        <Text style={styles.primaryButtonText}>Открыть маршрут в картах</Text>
        <Ionicons name="navigate" size={19} color="#0F172A" />
      </Pressable>
    </ScrollView>
  );
}

function WalletScreen({
  spent,
  setSpent,
  totalBudgetUZS,
  spentTotal,
  countryMoney,
}: {
  spent: { id: string; title: string; value: number }[];
  setSpent: React.Dispatch<
    React.SetStateAction<{ id: string; title: string; value: number }[]>
  >;
  totalBudgetUZS: number;
  spentTotal: number;
  country: Country;
  countryMoney: (value: number) => string;
}) {
  const addExpense = (id: string, amount: number) => {
    setSpent((current) =>
      current.map((item) =>
        item.id === id ? { ...item, value: item.value + amount } : item,
      ),
    );
  };

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>TRIP WALLET</Text>
        <Text style={styles.heroTitle}>{countryMoney(spentTotal)}</Text>
        <Text style={styles.heroText}>
          Потрачено из примерного бюджета {countryMoney(totalBudgetUZS)}.
          Остаток: {countryMoney(Math.max(0, totalBudgetUZS - spentTotal))}
        </Text>
      </View>

      <Section title="Расходы">
        {spent.map((item) => (
          <View key={item.id} style={styles.expenseRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.stopTitle}>{item.title}</Text>
              <Text style={styles.cardText}>{countryMoney(item.value)}</Text>
            </View>
            <Pressable
              style={styles.smallButton}
              onPress={() => addExpense(item.id, 25000)}
            >
              <Text style={styles.smallButtonText}>+ расход</Text>
            </Pressable>
          </View>
        ))}
      </Section>

      <Section title="Подсказки экономии">
        <View style={styles.savedCard}>
          <Text style={styles.stopTitle}>Где дешевле?</Text>
          <Text style={styles.cardText}>
            Еда на локальных рынках и в популярных osh‑центрах обычно дешевле
            ресторанов у туристических объектов.
          </Text>
        </View>
        <View style={styles.savedCard}>
          <Text style={styles.stopTitle}>Как не переплатить?</Text>
          <Text style={styles.cardText}>
            На рынках сравни 2–3 продавца. Если цена сильно выше средней,
            приложение покажет предупреждение.
          </Text>
        </View>
      </Section>
    </ScrollView>
  );
}

function AiScreen(props: {
  messages: ChatMessage[];
  chatText: string;
  setChatText: (value: string) => void;
  onSend: () => void;
}) {
  return (
    <KeyboardAvoidingView
      style={styles.assistantWrap}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        style={styles.chatList}
        contentContainerStyle={styles.chatPad}
        showsVerticalScrollIndicator={false}
      >
        {props.messages.map((message) => (
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
      <View style={styles.chatInputRow}>
        <TextInput
          value={props.chatText}
          onChangeText={props.setChatText}
          placeholder="Спроси про цены, толпу, такси..."
          placeholderTextColor="#64748B"
          style={styles.chatInput}
          multiline
        />
        <Pressable style={styles.sendButton} onPress={props.onSend}>
          <Ionicons name="send" size={18} color="#0F172A" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function ProfileScreen({
  country,
  city,
  budget,
  savedCount,
  spentTotal,
  countryMoney,
}: {
  country: Country;
  city: string;
  budget: Budget;
  savedCount: number;
  spentTotal: number;
  countryMoney: (value: number) => string;
}) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileHero}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={34} color="#0F172A" />
        </View>
        <Text style={styles.profileName}>Гость TripMate</Text>
        <Text style={styles.cardText}>Профиль путешественника</Text>
      </View>
      <View style={styles.gridThree}>
        <MiniStat value={`${country.emoji} ${country.title}`} label="страна" />
        <MiniStat value={city} label="город" />
        <MiniStat value={`${savedCount}`} label="маршруты" />
      </View>
      <Section title="Настройки">
        <ProfileRow icon="language" title="Язык" value="Русский" />
        <ProfileRow icon="wallet" title="Бюджет" value={budgetLabel(budget)} />
        <ProfileRow
          icon="cash"
          title="Расходы"
          value={countryMoney(spentTotal)}
        />
        <ProfileRow
          icon="shield-checkmark"
          title="Безопасный режим"
          value="Включен"
        />
        <ProfileRow icon="cloud-offline" title="Офлайн‑город" value="Скоро" />
      </Section>
    </ScrollView>
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
      <Ionicons name={icon} size={20} color="#93C5FD" />
      <View style={{ flex: 1 }}>
        <Text style={styles.profileRowTitle}>{title}</Text>
        <Text style={styles.cardText}>{value}</Text>
      </View>
      <Ionicons name="chevron-forward" size={18} color="#64748B" />
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
    { id: "places", title: "Места", icon: "business" },
    { id: "map", title: "Карта", icon: "map" },
    { id: "taxi", title: "Такси", icon: "car" },
    { id: "wallet", title: "Расходы", icon: "wallet" },
    { id: "ai", title: "AI", icon: "chatbubble" },
    { id: "profile", title: "Профиль", icon: "person-circle" },
  ];

  return (
    <View style={styles.tabsWrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabs}
      >
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <Pressable
              key={tab.id}
              onPress={() => setActive(tab.id)}
              style={[styles.tabItem, isActive && styles.tabItemActive]}
            >
              <Ionicons
                name={tab.icon}
                size={18}
                color={isActive ? "#0F172A" : "#94A3B8"}
              />
              <Text style={[styles.tabText, isActive && styles.tabTextActive]}>
                {tab.title}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
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

function ChoiceCard(props: {
  title: string;
  subtitle: string;
  active: boolean;
  onPress: () => void;
  compact?: boolean;
}) {
  return (
    <Pressable
      onPress={props.onPress}
      style={[
        styles.choiceCard,
        props.compact && styles.choiceCompact,
        props.active && styles.activeCard,
      ]}
    >
      <Text style={styles.choiceTitle}>{props.title}</Text>
      <Text style={styles.cardText}>{props.subtitle}</Text>
    </Pressable>
  );
}

function MiniStat({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.miniStat}>
      <Text style={styles.miniStatValue}>{value}</Text>
      <Text style={styles.cardText}>{label}</Text>
    </View>
  );
}

const glass = "rgba(255,255,255,0.13)";
const card = "rgba(255,255,255,0.08)";
const screen = "#111827";
const panel = "#1F2937";
const accent = "#93C5FD";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: screen },
  app: { flex: 1, backgroundColor: screen },
  header: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: glass,
  },
  logo: {
    color: "#F8FAFC",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  headerSub: {
    color: "#CBD5E1",
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
  },
  headerRight: { flexDirection: "row", gap: 8, alignItems: "center" },
  cityPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: card,
    borderWidth: 1,
    borderColor: glass,
  },
  cityPillText: { color: "#F8FAFC", fontWeight: "800", fontSize: 12 },
  countPill: {
    backgroundColor: accent,
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  countPillText: { color: "#0F172A", fontWeight: "900" },
  content: { flex: 1, backgroundColor: screen },
  contentPad: { padding: 16, paddingBottom: 126 },
  heroCard: {
    backgroundColor: panel,
    borderRadius: 32,
    padding: 22,
    marginBottom: 22,
    borderWidth: 1,
    borderColor: glass,
    overflow: "hidden",
  },
  heroGlow: {
    position: "absolute",
    right: -70,
    top: -90,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(147,197,253,0.20)",
  },
  kicker: {
    color: accent,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase",
    letterSpacing: 1.2,
  },
  heroTitle: {
    color: "#F8FAFC",
    fontSize: 34,
    lineHeight: 38,
    fontWeight: "900",
    marginTop: 10,
    letterSpacing: -1.1,
  },
  heroText: { color: "#CBD5E1", fontSize: 14, lineHeight: 21, marginTop: 10 },
  heroStats: { flexDirection: "row", gap: 10, marginTop: 18 },
  miniStat: {
    flex: 1,
    backgroundColor: card,
    borderWidth: 1,
    borderColor: glass,
    borderRadius: 18,
    padding: 12,
  },
  miniStatValue: { color: "#F8FAFC", fontSize: 15, fontWeight: "900" },
  section: { marginBottom: 23 },
  sectionTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },
  rowList: { gap: 12, paddingRight: 12 },
  countryCard: {
    width: 180,
    minHeight: 142,
    backgroundColor: card,
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: glass,
  },
  countryEmoji: { fontSize: 28 },
  activeCard: {
    borderColor: accent,
    backgroundColor: "rgba(147,197,253,0.17)",
  },
  cardTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 8,
  },
  cardAccent: { color: accent, fontWeight: "800", marginTop: 3 },
  cardText: { color: "#CBD5E1", fontSize: 12, lineHeight: 18, marginTop: 5 },
  soon: { color: "#FDE68A", fontWeight: "900", fontSize: 11, marginTop: 8 },
  ready: { color: "#86EFAC" },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  chip: {
    backgroundColor: card,
    borderColor: glass,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 999,
  },
  chipActive: { backgroundColor: accent, borderColor: "#BFDBFE" },
  chipText: { fontWeight: "800", color: "#CBD5E1" },
  chipTextActive: { color: "#0F172A" },
  gridTwo: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  gridThree: { flexDirection: "row", gap: 8, marginBottom: 22 },
  choiceCard: {
    flexBasis: "48%",
    flexGrow: 1,
    backgroundColor: card,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: glass,
  },
  choiceCompact: { flex: 1, paddingHorizontal: 10 },
  choiceTitle: { color: "#F8FAFC", fontSize: 15, fontWeight: "900" },
  summaryCard: {
    backgroundColor: card,
    borderRadius: 26,
    padding: 18,
    borderWidth: 1,
    borderColor: glass,
    marginBottom: 14,
  },
  summaryTitle: {
    color: "#F8FAFC",
    fontWeight: "900",
    fontSize: 18,
    marginTop: 6,
  },
  budget: { color: "#86EFAC", fontWeight: "900", fontSize: 20, marginTop: 10 },
  primaryButton: {
    minHeight: 58,
    backgroundColor: accent,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  primaryButtonText: { color: "#0F172A", fontSize: 16, fontWeight: "900" },
  filterChip: {
    backgroundColor: card,
    borderColor: glass,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
  },
  placeCard: {
    backgroundColor: card,
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: glass,
    marginBottom: 14,
  },
  placeTop: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
  placeTitle: {
    color: "#F8FAFC",
    fontSize: 20,
    fontWeight: "900",
    marginTop: 4,
  },
  crowdBadge: {
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 9,
    paddingVertical: 6,
  },
  crowdText: { fontSize: 10, fontWeight: "900" },
  priceRow: { flexDirection: "row", gap: 10, marginTop: 12 },
  infoText: { color: "#E2E8F0", marginTop: 8, fontWeight: "700" },
  tipText: { color: "#F8FAFC", marginTop: 10, lineHeight: 19 },
  safetyText: {
    color: "#FDE68A",
    marginTop: 8,
    lineHeight: 19,
    fontWeight: "700",
  },
  mapMock: {
    minHeight: 250,
    borderRadius: 34,
    backgroundColor: panel,
    padding: 22,
    justifyContent: "flex-end",
    borderWidth: 1,
    borderColor: glass,
    marginBottom: 22,
  },
  routeRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  dot: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: accent,
    alignItems: "center",
    justifyContent: "center",
  },
  dotText: { color: "#0F172A", fontWeight: "900", fontSize: 12 },
  routeBody: {
    flex: 1,
    backgroundColor: card,
    borderRadius: 24,
    padding: 15,
    borderWidth: 1,
    borderColor: glass,
  },
  stopTime: { color: accent, fontWeight: "900" },
  stopTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 4,
  },
  expenseRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: card,
    borderRadius: 22,
    padding: 14,
    borderWidth: 1,
    borderColor: glass,
    marginBottom: 10,
  },
  smallButton: {
    backgroundColor: accent,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  smallButtonText: { color: "#0F172A", fontWeight: "900", fontSize: 12 },
  assistantWrap: { flex: 1, paddingBottom: 88, backgroundColor: screen },
  chatList: { flex: 1 },
  chatPad: { padding: 16, paddingBottom: 20 },
  bubble: { maxWidth: "84%", padding: 14, borderRadius: 22, marginBottom: 10 },
  assistantBubble: {
    backgroundColor: card,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: glass,
  },
  userBubble: { backgroundColor: accent, alignSelf: "flex-end" },
  bubbleText: { color: "#F8FAFC", lineHeight: 20, fontWeight: "600" },
  userBubbleText: { color: "#0F172A" },
  chatInputRow: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    backgroundColor: screen,
    borderTopWidth: 1,
    borderColor: glass,
  },
  chatInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: card,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: glass,
    color: "#F8FAFC",
    fontWeight: "700",
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 18,
    backgroundColor: accent,
    alignItems: "center",
    justifyContent: "center",
  },
  savedCard: {
    backgroundColor: card,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: glass,
    marginBottom: 12,
  },
  profileHero: {
    backgroundColor: panel,
    borderWidth: 1,
    borderColor: glass,
    borderRadius: 32,
    padding: 22,
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: accent,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  profileName: { color: "#F8FAFC", fontSize: 24, fontWeight: "900" },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: card,
    borderWidth: 1,
    borderColor: glass,
    borderRadius: 22,
    padding: 14,
    marginBottom: 10,
  },
  profileRowTitle: { color: "#F8FAFC", fontWeight: "900", fontSize: 15 },
  tabsWrap: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: "rgba(31,41,55,0.98)",
    borderRadius: 28,
    padding: 7,
    borderWidth: 1,
    borderColor: glass,
  },
  tabs: { gap: 6, paddingRight: 8 },
  tabItem: {
    minWidth: 74,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    paddingHorizontal: 9,
    borderRadius: 20,
    gap: 2,
  },
  tabItemActive: { backgroundColor: accent },
  tabText: { fontSize: 9, fontWeight: "900", color: "#94A3B8" },
  tabTextActive: { color: "#0F172A" },
});
