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

type CityId =
  | "tashkent"
  | "samarkand"
  | "bukhara"
  | "khiva"
  | "dubai"
  | "istanbul"
  | "almaty";
type Category = "museum" | "sight" | "food" | "shop" | "park" | "emergency";
type Crowd = "low" | "medium" | "high";
type Tab = "home" | "route" | "places" | "taxi" | "budget" | "sos";

type City = {
  id: CityId;
  title: string;
  country: string;
  currency: string;
  taxiBase: number;
  taxiPerKm: number;
  emergency: {
    police: string;
    ambulance: string;
    fire: string;
    touristPolice: string;
  };
};

type Place = {
  id: string;
  cityId: CityId;
  title: string;
  category: Category;
  subtitle: string;
  address: string;
  lat: number;
  lng: number;
  entryPrice: number;
  minSpend: number;
  durationMin: number;
  rating: number;
  crowd: Crowd;
  openNow: boolean;
  bestTime: string;
  cheapTip: string;
  safetyTip: string;
};

type RouteStep = Place & {
  order: number;
  time: string;
  taxiToNext: number;
  distanceToNextKm: number;
};

const cities: City[] = [
  {
    id: "tashkent",
    title: "Ташкент",
    country: "Узбекистан",
    currency: "UZS",
    taxiBase: 12000,
    taxiPerKm: 3200,
    emergency: {
      police: "102",
      ambulance: "103",
      fire: "101",
      touristPolice: "1173",
    },
  },
  {
    id: "samarkand",
    title: "Самарканд",
    country: "Узбекистан",
    currency: "UZS",
    taxiBase: 10000,
    taxiPerKm: 3000,
    emergency: {
      police: "102",
      ambulance: "103",
      fire: "101",
      touristPolice: "1173",
    },
  },
  {
    id: "bukhara",
    title: "Бухара",
    country: "Узбекистан",
    currency: "UZS",
    taxiBase: 10000,
    taxiPerKm: 2800,
    emergency: {
      police: "102",
      ambulance: "103",
      fire: "101",
      touristPolice: "1173",
    },
  },
  {
    id: "khiva",
    title: "Хива",
    country: "Узбекистан",
    currency: "UZS",
    taxiBase: 9000,
    taxiPerKm: 2600,
    emergency: {
      police: "102",
      ambulance: "103",
      fire: "101",
      touristPolice: "1173",
    },
  },
  {
    id: "dubai",
    title: "Дубай",
    country: "ОАЭ",
    currency: "AED",
    taxiBase: 19000,
    taxiPerKm: 8500,
    emergency: {
      police: "999",
      ambulance: "998",
      fire: "997",
      touristPolice: "901",
    },
  },
  {
    id: "istanbul",
    title: "Стамбул",
    country: "Турция",
    currency: "TRY",
    taxiBase: 17000,
    taxiPerKm: 6500,
    emergency: {
      police: "112",
      ambulance: "112",
      fire: "112",
      touristPolice: "112",
    },
  },
  {
    id: "almaty",
    title: "Алматы",
    country: "Казахстан",
    currency: "KZT",
    taxiBase: 14000,
    taxiPerKm: 4500,
    emergency: {
      police: "102",
      ambulance: "103",
      fire: "101",
      touristPolice: "112",
    },
  },
];

const places: Place[] = [
  {
    id: "tashkent-hazrati",
    cityId: "tashkent",
    title: "Хазрати Имам",
    category: "sight",
    subtitle: "Исторический комплекс старого города",
    address: "Старый город",
    lat: 41.3371,
    lng: 69.2406,
    entryPrice: 30000,
    minSpend: 0,
    durationMin: 70,
    rating: 4.8,
    crowd: "medium",
    openNow: true,
    bestTime: "10:00–12:00",
    cheapTip: "Вход недорогой, сувениры лучше сравнить в 2–3 местах.",
    safetyTip: "Спокойная зона, но телефон держи ближе к себе.",
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
    entryPrice: 0,
    minSpend: 65000,
    durationMin: 90,
    rating: 4.6,
    crowd: "high",
    openNow: true,
    bestTime: "11:00–14:00",
    cheapTip: "Торгуйся спокойно. Нормально просить минус 15–25%.",
    safetyTip: "Людно, аккуратнее с кошельком и телефоном.",
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
    entryPrice: 0,
    minSpend: 85000,
    durationMin: 60,
    rating: 4.5,
    crowd: "high",
    openNow: true,
    bestTime: "12:00–14:00",
    cheapTip: "Приходи днем: вечером хорошие позиции могут закончиться.",
    safetyTip: "Выбирай место с большим потоком гостей.",
  },
  {
    id: "tashkent-magic",
    cityId: "tashkent",
    title: "Magic City",
    category: "park",
    subtitle: "Вечерняя прогулка, кафе и фото",
    address: "Алмазар",
    lat: 41.3045,
    lng: 69.2447,
    entryPrice: 0,
    minSpend: 120000,
    durationMin: 90,
    rating: 4.7,
    crowd: "medium",
    openNow: true,
    bestTime: "18:30–21:00",
    cheapTip: "Можно просто гулять бесплатно, кафе выбирать по меню у входа.",
    safetyTip: "Комфортно вечером, обратно лучше ехать на такси.",
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
    entryPrice: 70000,
    minSpend: 0,
    durationMin: 110,
    rating: 4.9,
    crowd: "high",
    openNow: true,
    bestTime: "09:00–11:30",
    cheapTip: "Билет фиксированный, сувениры рядом часто дороже.",
    safetyTip: "Туристическая зона, проверяй цены заранее.",
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
    entryPrice: 0,
    minSpend: 80000,
    durationMin: 80,
    rating: 4.7,
    crowd: "medium",
    openNow: true,
    bestTime: "12:00–14:00",
    cheapTip: "Сначала пробуй, потом покупай. Сравни 2 ряда.",
    safetyTip: "Торгуйся спокойно, не показывай много наличных.",
  },
  {
    id: "samarkand-shahi",
    cityId: "samarkand",
    title: "Шахи-Зинда",
    category: "museum",
    subtitle: "Красивые мавзолеи и фото-точки",
    address: "улица Шахи-Зинда",
    lat: 39.6622,
    lng: 66.987,
    entryPrice: 60000,
    minSpend: 0,
    durationMin: 85,
    rating: 4.9,
    crowd: "medium",
    openNow: true,
    bestTime: "15:30–17:30",
    cheapTip: "Лучшее фото без доплат — ближе к вечеру.",
    safetyTip: "Священное место: тише, уважительная одежда.",
  },
  {
    id: "bukhara-lyabi",
    cityId: "bukhara",
    title: "Ляби-Хауз",
    category: "sight",
    subtitle: "Сердце старой Бухары",
    address: "старый город",
    lat: 39.7747,
    lng: 64.4231,
    entryPrice: 0,
    minSpend: 70000,
    durationMin: 80,
    rating: 4.8,
    crowd: "medium",
    openNow: true,
    bestTime: "10:00–12:00",
    cheapTip: "Кафе у воды дороже, улицей дальше можно дешевле.",
    safetyTip: "Вечером много туристов, зона комфортная.",
  },
  {
    id: "bukhara-kalyan",
    cityId: "bukhara",
    title: "Калян минарет",
    category: "museum",
    subtitle: "Сильная архитектурная точка",
    address: "центр старого города",
    lat: 39.7759,
    lng: 64.4151,
    entryPrice: 45000,
    minSpend: 0,
    durationMin: 70,
    rating: 4.9,
    crowd: "low",
    openNow: true,
    bestTime: "16:00–18:00",
    cheapTip: "Лучший вид снаружи бесплатный.",
    safetyTip: "Смотри под ноги: каменные покрытия.",
  },
  {
    id: "khiva-ichan",
    cityId: "khiva",
    title: "Ичан-Кала",
    category: "sight",
    subtitle: "Город-музей под открытым небом",
    address: "центр Хивы",
    lat: 41.3783,
    lng: 60.3596,
    entryPrice: 90000,
    minSpend: 60000,
    durationMin: 140,
    rating: 4.9,
    crowd: "medium",
    openNow: true,
    bestTime: "09:00–12:00",
    cheapTip: "Пеший маршрут экономит транспорт.",
    safetyTip: "Днем жарко: вода и головной убор обязательно.",
  },
  {
    id: "dubai-mall",
    cityId: "dubai",
    title: "Dubai Mall",
    category: "shop",
    subtitle: "Шопинг, фонтаны, аквариум, рестораны",
    address: "Downtown Dubai",
    lat: 25.1972,
    lng: 55.2796,
    entryPrice: 0,
    minSpend: 220000,
    durationMin: 120,
    rating: 4.8,
    crowd: "high",
    openNow: true,
    bestTime: "10:00–13:00",
    cheapTip: "Еда в фудкорте дешевле ресторанов с видом.",
    safetyTip: "Безопасно, но легко потратить лишнее.",
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
    entryPrice: 10000,
    minSpend: 60000,
    durationMin: 90,
    rating: 4.6,
    crowd: "medium",
    openNow: true,
    bestTime: "17:00–20:00",
    cheapTip: "Abra стоит дешево и дает атмосферу старого Дубая.",
    safetyTip: "Торгуйся на рынках, цены могут завышать.",
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
    entryPrice: 180000,
    minSpend: 0,
    durationMin: 100,
    rating: 4.9,
    crowd: "high",
    openNow: true,
    bestTime: "09:00–11:00",
    cheapTip: "Приходи рано: меньше очереди.",
    safetyTip: "Много туристов, следи за вещами.",
  },
  {
    id: "almaty-kok",
    cityId: "almaty",
    title: "Кок-Тобе",
    category: "park",
    subtitle: "Вид на город, прогулка, кафе",
    address: "Кок-Тобе",
    lat: 43.2295,
    lng: 76.9763,
    entryPrice: 120000,
    minSpend: 60000,
    durationMin: 100,
    rating: 4.7,
    crowd: "medium",
    openNow: true,
    bestTime: "17:00–20:00",
    cheapTip: "Лучше ехать к закату.",
    safetyTip: "Комфортно, но вечером такси обратно удобнее.",
  },
];

const crowdLabel: Record<Crowd, string> = {
  low: "мало людей",
  medium: "средне",
  high: "много людей",
};

const crowdColor: Record<Crowd, string> = {
  low: "#4ADE80",
  medium: "#FACC15",
  high: "#FB7185",
};

function money(value: number, city: City) {
  return `${Math.max(0, Math.round(value)).toLocaleString("ru-RU")} ${city.currency}`;
}

function categoryTitle(category: Category) {
  const labels: Record<Category, string> = {
    museum: "Музей",
    sight: "Место",
    food: "Еда",
    shop: "Магазин",
    park: "Парк",
    emergency: "SOS",
  };
  return labels[category];
}

function getDistanceKm(a: Place, b: Place) {
  const dx = a.lat - b.lat;
  const dy = a.lng - b.lng;
  return Math.max(1, Math.round(Math.sqrt(dx * dx + dy * dy) * 110));
}

function buildRoute(
  cityPlaces: Place[],
  selectedTags: string[],
  budgetLimit: number,
  city: City,
) {
  const selected = selectedTags.length
    ? selectedTags
    : ["sight", "food", "museum"];
  const ranked = [...cityPlaces].sort((a, b) => {
    const aMatch = selected.includes(a.category) ? 2 : 0;
    const bMatch = selected.includes(b.category) ? 2 : 0;
    const aCrowd = a.crowd === "low" ? 1 : a.crowd === "medium" ? 0.5 : 0;
    const bCrowd = b.crowd === "low" ? 1 : b.crowd === "medium" ? 0.5 : 0;
    return bMatch + b.rating + bCrowd - (aMatch + a.rating + aCrowd);
  });

  const steps: RouteStep[] = [];
  let used = 0;

  ranked.forEach((place) => {
    const previous = steps[steps.length - 1];
    const distance = previous ? getDistanceKm(previous, place) : 0;
    const taxi = previous ? city.taxiBase + distance * city.taxiPerKm : 0;
    const cost = place.entryPrice + place.minSpend + taxi;

    if (steps.length < 8 && (used + cost <= budgetLimit || steps.length < 2)) {
      used += cost;
      steps.push({
        ...place,
        order: steps.length + 1,
        time: [
          "09:30",
          "11:00",
          "12:45",
          "14:30",
          "16:15",
          "18:00",
          "19:40",
          "21:00",
        ][steps.length],
        distanceToNextKm: distance,
        taxiToNext: taxi,
        transport: previous ? `Такси ${distance} км` : "Старт из отеля",
      });
    }
  });

  return steps;
}

function openTaxi(from: Place | null, to: Place) {
  const fromText = from ? `${from.lat},${from.lng}` : "";
  const url = from
    ? `https://yandex.com/maps/?rtext=${fromText}~${to.lat},${to.lng}&rtt=auto`
    : `https://yandex.com/maps/?ll=${to.lng},${to.lat}&z=15`;
  Linking.openURL(url).catch(() =>
    Alert.alert(
      "Не удалось открыть карту",
      "Проверь интернет или установи Яндекс Карты / Google Maps.",
    ),
  );
}

function callNumber(number: string) {
  Linking.openURL(`tel:${number}`).catch(() =>
    Alert.alert("Ошибка", `Номер: ${number}`),
  );
}

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [cityId, setCityId] = useState<CityId>("tashkent");
  const [budgetText, setBudgetText] = useState("500000");
  const [selectedTags, setSelectedTags] = useState<string[]>([
    "sight",
    "food",
    "museum",
  ]);
  const [savedRoutes, setSavedRoutes] = useState<RouteStep[][]>([]);
  const [chatText, setChatText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "a1",
      role: "assistant",
      text: "Напиши бюджет и город — я подберу точки, транспорт, расходы, где дешевле и где меньше людей.",
    },
  ]);

  const city = cities.find((item) => item.id === cityId) ?? cities[0];
  const cityPlaces = places.filter((item) => item.cityId === cityId);
  const budgetLimit = Number(budgetText.replace(/\D/g, "")) || 0;
  const route = useMemo(
    () => buildRoute(cityPlaces, selectedTags, budgetLimit, city),
    [cityPlaces, selectedTags, budgetLimit, city],
  );
  const routeTotal = route.reduce(
    (sum, item) => sum + item.entryPrice + item.minSpend + item.taxiToNext,
    0,
  );
  const remaining = budgetLimit - routeTotal;

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
    let answer = `За ${money(budgetLimit, city)} я подобрал: ${route.map((item) => item.title).join(" → ")}. Остаток: ${money(remaining, city)}.`;

    if (lower.includes("дешев") || lower.includes("эконом")) {
      const cheap = [...cityPlaces].sort(
        (a, b) => a.minSpend + a.entryPrice - (b.minSpend + b.entryPrice),
      )[0];
      answer = `Самый экономный вариант сейчас: ${cheap.title}. Минимально: ${money(cheap.minSpend + cheap.entryPrice, city)}. Совет: ${cheap.cheapTip}`;
    }

    if (
      lower.includes("людей") ||
      lower.includes("толп") ||
      lower.includes("народу")
    ) {
      const calm = cityPlaces.filter((item) => item.crowd !== "high");
      answer = calm.length
        ? `Где меньше людей: ${calm.map((item) => item.title).join(", ")}.`
        : "Сейчас почти везде много людей. Лучше выбрать утро или поздний вечер.";
    }

    if (lower.includes("такси")) {
      answer = route[1]
        ? `Следующее такси: ${route[1].title}. Примерно ${money(route[1].taxiToNext, city)}. Нажми кнопку “Вызвать такси” в маршруте.`
        : "Добавь больше точек в маршрут, чтобы рассчитать такси.";
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
        <Header city={city} routeTotal={routeTotal} budgetLimit={budgetLimit} />

        {tab === "home" && (
          <HomeScreen
            city={city}
            cityId={cityId}
            setCityId={setCityId}
            budgetText={budgetText}
            setBudgetText={setBudgetText}
            selectedTags={selectedTags}
            toggleTag={toggleTag}
            route={route}
            budgetLimit={budgetLimit}
            routeTotal={routeTotal}
            remaining={remaining}
            onBuild={() => setTab("route")}
          />
        )}

        {tab === "route" && (
          <RouteScreen
            city={city}
            route={route}
            routeTotal={routeTotal}
            budgetLimit={budgetLimit}
            onSave={() => setSavedRoutes((current) => [route, ...current])}
          />
        )}
        {tab === "places" && (
          <PlacesScreen
            city={city}
            places={cityPlaces}
            selectedTags={selectedTags}
            toggleTag={toggleTag}
          />
        )}
        {tab === "taxi" && <TaxiScreen city={city} route={route} />}
        {tab === "budget" && (
          <BudgetScreen
            city={city}
            budgetLimit={budgetLimit}
            route={route}
            routeTotal={routeTotal}
            remaining={remaining}
          />
        )}
        {tab === "sos" && <SosScreen city={city} />}
        {tab === "ai" && (
          <AiScreen
            messages={messages}
            chatText={chatText}
            setChatText={setChatText}
            onSend={sendChat}
          />
        )}

        <BottomTabs active={tab} setActive={setTab} />
      </View>
    </SafeAreaView>
  );
}

function Header({
  city,
  routeTotal,
  budgetLimit,
}: {
  city: City;
  routeTotal: number;
  budgetLimit: number;
}) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.logo}>TripMate</Text>
        <Text style={styles.headerSub}>AI travel budget planner</Text>
      </View>
      <View style={styles.headerRight}>
        <View style={styles.pill}>
          <Ionicons name="location" size={14} color="#E5E7EB" />
          <Text style={styles.pillText}>{city.title}</Text>
        </View>
        <View
          style={[
            styles.pill,
            routeTotal <= budgetLimit ? styles.pillGood : styles.pillBad,
          ]}
        >
          <Text style={styles.pillText}>
            {routeTotal <= budgetLimit ? "OK" : "Бюджет"}
          </Text>
        </View>
      </View>
    </View>
  );
}

function HomeScreen(props: {
  city: City;
  cityId: CityId;
  setCityId: (id: CityId) => void;
  budgetText: string;
  setBudgetText: (value: string) => void;
  selectedTags: string[];
  toggleTag: (tag: string) => void;
  route: RouteStep[];
  budgetLimit: number;
  routeTotal: number;
  remaining: number;
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
        <Text style={styles.kicker}>SMART TRIP</Text>
        <Text style={styles.heroTitle}>Маршрут строго под твой бюджет</Text>
        <Text style={styles.heroText}>
          Введи сумму — приложение подберет точки, расходы, такси между точками,
          где дешевле и где меньше людей.
        </Text>
      </View>

      <Section title="1. Город">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {cities.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => props.setCityId(item.id)}
              style={[
                styles.cityCard,
                props.cityId === item.id && styles.activeCard,
              ]}
            >
              <Text style={styles.cityTitle}>{item.title}</Text>
              <Text style={styles.cardText}>{item.country}</Text>
              <Text style={styles.cardAccent}>{item.currency}</Text>
            </Pressable>
          ))}
        </ScrollView>
      </Section>

      <Section title="2. Сколько денег готов потратить?">
        <View style={styles.budgetBox}>
          <TextInput
            value={props.budgetText}
            onChangeText={props.setBudgetText}
            keyboardType="number-pad"
            placeholder="Например 500000"
            placeholderTextColor="#94A3B8"
            style={styles.budgetInput}
          />
          <Text style={styles.currencyText}>{props.city.currency}</Text>
        </View>
        <View style={styles.quickBudgets}>
          {[250000, 500000, 1000000, 2000000].map((sum) => (
            <Pressable
              key={sum}
              onPress={() => props.setBudgetText(String(sum))}
              style={styles.quickBudget}
            >
              <Text style={styles.quickBudgetText}>
                {money(sum, props.city)}
              </Text>
            </Pressable>
          ))}
        </View>
      </Section>

      <Section title="3. Что добавить в маршрут?">
        <View style={styles.chips}>
          {(["sight", "museum", "food", "shop", "park"] as Category[]).map(
            (tag) => {
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
                    {categoryTitle(tag)}
                  </Text>
                </Pressable>
              );
            },
          )}
        </View>
      </Section>

      <View style={styles.summary}>
        <Text style={styles.kicker}>РАСЧЕТ</Text>
        <Text style={styles.summaryTitle}>
          Подобрано точек: {props.route.length}
        </Text>
        <Text style={styles.cardText}>
          Маршрут:{" "}
          {props.route.map((item) => item.title).join(" → ") ||
            "увеличь бюджет или выбери город"}
        </Text>
        <View style={styles.moneyRow}>
          <MiniStat
            label="Бюджет"
            value={money(props.budgetLimit, props.city)}
          />
          <MiniStat
            label="Расход"
            value={money(props.routeTotal, props.city)}
          />
          <MiniStat
            label="Остаток"
            value={money(props.remaining, props.city)}
          />
        </View>
      </View>

      <Pressable style={styles.primaryButton} onPress={props.onBuild}>
        <Text style={styles.primaryButtonText}>Построить маршрут</Text>
        <Ionicons name="arrow-forward" size={20} color="#101828" />
      </Pressable>
    </ScrollView>
  );
}

function RouteScreen({
  city,
  route,
  routeTotal,
  budgetLimit,
  onSave,
}: {
  city: City;
  route: RouteStep[];
  routeTotal: number;
  budgetLimit: number;
  onSave: () => void;
}) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.summary}>
        <Text style={styles.kicker}>ГОТОВЫЙ МАРШРУТ</Text>
        <Text style={styles.summaryTitle}>
          {routeTotal <= budgetLimit ? "Уложились в бюджет" : "Бюджет превышен"}
        </Text>
        <View style={styles.moneyRow}>
          <MiniStat label="Бюджет" value={money(budgetLimit, city)} />
          <MiniStat label="Итого" value={money(routeTotal, city)} />
        </View>
      </View>

      {route.map((step, index) => {
        const previous = index > 0 ? route[index - 1] : null;
        return (
          <View key={step.id} style={styles.routeCard}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.cardTop}>
                <Text style={styles.timeText}>{step.time}</Text>
                <Text
                  style={[styles.crowdText, { color: crowdColor[step.crowd] }]}
                >
                  {crowdLabel[step.crowd]}
                </Text>
              </View>
              <Text style={styles.placeTitle}>{step.title}</Text>
              <Text style={styles.cardText}>{step.subtitle}</Text>
              <Text style={styles.infoText}>📍 {step.address}</Text>
              <Text style={styles.infoText}>
                🎫 Вход: {money(step.entryPrice, city)} • траты:{" "}
                {money(step.minSpend, city)}
              </Text>
              <Text style={styles.infoText}>
                🚕 Транспорт: {step.transport} • {money(step.taxiToNext, city)}
              </Text>
              <Text style={styles.tipText}>Где дешевле: {step.cheapTip}</Text>

              <View style={styles.actionRow}>
                <Pressable
                  style={styles.secondaryButton}
                  onPress={() => openTaxi(previous, step)}
                >
                  <Ionicons name="car" size={17} color="#101828" />
                  <Text style={styles.secondaryButtonText}>Вызвать такси</Text>
                </Pressable>
                <Pressable
                  style={styles.darkButton}
                  onPress={() =>
                    Linking.openURL(
                      `https://www.google.com/maps/search/?api=1&query=${step.lat},${step.lng}`,
                    )
                  }
                >
                  <Ionicons name="map" size={17} color="#E5E7EB" />
                  <Text style={styles.darkButtonText}>Карта</Text>
                </Pressable>
              </View>
            </View>
          </View>
        );
      })}

      <Pressable style={styles.primaryButton} onPress={onSave}>
        <Text style={styles.primaryButtonText}>Сохранить маршрут</Text>
        <Ionicons name="bookmark" size={19} color="#101828" />
      </Pressable>
    </ScrollView>
  );
}

function PlacesScreen({
  city,
  places,
  selectedTags,
  toggleTag,
}: {
  city: City;
  places: Place[];
  selectedTags: string[];
  toggleTag: (tag: string) => void;
}) {
  const sorted = [...places].sort(
    (a, b) =>
      (a.crowd === "low" ? -1 : 1) - (b.crowd === "low" ? -1 : 1) ||
      a.minSpend + a.entryPrice - (b.minSpend + b.entryPrice),
  );
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <Section title="Фильтр мест">
        <View style={styles.chips}>
          {(["sight", "museum", "food", "shop", "park"] as Category[]).map(
            (tag) => (
              <Pressable
                key={tag}
                onPress={() => toggleTag(tag)}
                style={[
                  styles.chip,
                  selectedTags.includes(tag) && styles.chipActive,
                ]}
              >
                <Text
                  style={[
                    styles.chipText,
                    selectedTags.includes(tag) && styles.chipTextActive,
                  ]}
                >
                  {categoryTitle(tag)}
                </Text>
              </Pressable>
            ),
          )}
        </View>
      </Section>

      {sorted.map((place) => (
        <View key={place.id} style={styles.placeCard}>
          <View style={styles.cardTop}>
            <Text style={styles.badge}>{categoryTitle(place.category)}</Text>
            <Text
              style={[styles.crowdText, { color: crowdColor[place.crowd] }]}
            >
              {crowdLabel[place.crowd]}
            </Text>
          </View>
          <Text style={styles.placeTitle}>{place.title}</Text>
          <Text style={styles.cardText}>{place.subtitle}</Text>
          <Text style={styles.infoText}>
            ⭐ {place.rating} • {place.bestTime} • {place.durationMin} мин
          </Text>
          <Text style={styles.infoText}>
            Цена: {money(place.entryPrice + place.minSpend, city)}
          </Text>
          <Text style={styles.tipText}>Дешевле: {place.cheapTip}</Text>
        </View>
      ))}
    </ScrollView>
  );
}

function TaxiScreen({ city, route }: { city: City; route: RouteStep[] }) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.summary}>
        <Text style={styles.kicker}>ТАКСИ МЕЖДУ ТОЧКАМИ</Text>
        <Text style={styles.summaryTitle}>
          Видно куда ехать и сколько примерно стоит
        </Text>
      </View>

      {route.map((step, index) => {
        const previous = index > 0 ? route[index - 1] : null;
        return (
          <View key={step.id} style={styles.taxiCard}>
            <Text style={styles.placeTitle}>
              {index === 0 ? "Старт" : previous?.title} → {step.title}
            </Text>
            <Text style={styles.cardText}>{step.transport}</Text>
            <Text style={styles.budgetBig}>{money(step.taxiToNext, city)}</Text>
            <Pressable
              style={styles.secondaryButton}
              onPress={() => openTaxi(previous, step)}
            >
              <Ionicons name="car" size={17} color="#101828" />
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
  city,
  budgetLimit,
  route,
  routeTotal,
  remaining,
}: {
  city: City;
  budgetLimit: number;
  route: RouteStep[];
  routeTotal: number;
  remaining: number;
}) {
  const entries = route.reduce((sum, item) => sum + item.entryPrice, 0);
  const spend = route.reduce((sum, item) => sum + item.minSpend, 0);
  const taxi = route.reduce((sum, item) => sum + item.taxiToNext, 0);

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.summary}>
        <Text style={styles.kicker}>КОШЕЛЕК ПОЕЗДКИ</Text>
        <Text style={styles.summaryTitle}>
          {money(routeTotal, city)} из {money(budgetLimit, city)}
        </Text>
        <Text style={styles.cardText}>Остаток: {money(remaining, city)}</Text>
      </View>

      <ExpenseRow
        icon="ticket"
        title="Билеты / музеи"
        value={money(entries, city)}
      />
      <ExpenseRow
        icon="restaurant"
        title="Еда / покупки на точках"
        value={money(spend, city)}
      />
      <ExpenseRow
        icon="car"
        title="Такси / транспорт"
        value={money(taxi, city)}
      />
      <ExpenseRow icon="wallet" title="Итого" value={money(routeTotal, city)} />
    </ScrollView>
  );
}

function SosScreen({ city }: { city: City }) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.sosHero}>
        <Ionicons name="shield-checkmark" size={42} color="#FB7185" />
        <Text style={styles.sosTitle}>Экстренная помощь</Text>
        <Text style={styles.cardText}>
          Выбери службу. Приложение откроет звонок на телефоне.
        </Text>
      </View>

      <SosButton title="Полиция" number={city.emergency.police} icon="shield" />
      <SosButton
        title="Скорая помощь"
        number={city.emergency.ambulance}
        icon="medkit"
      />
      <SosButton
        title="Пожарная служба"
        number={city.emergency.fire}
        icon="flame"
      />
      <SosButton
        title="Туристическая полиция / справка"
        number={city.emergency.touristPolice}
        icon="help-circle"
      />
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
          placeholder="Спроси: где дешевле, где меньше людей, такси..."
          placeholderTextColor="#94A3B8"
          style={styles.chatInput}
          multiline
        />
        <Pressable style={styles.sendButton} onPress={onSend}>
          <Ionicons name="send" size={18} color="#101828" />
        </Pressable>
      </View>
    </View>
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
      <Ionicons name={icon} size={22} color="#93C5FD" />
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
    { id: "places", title: "Места", icon: "business" },
    { id: "taxi", title: "Такси", icon: "car" },
    { id: "budget", title: "Бюджет", icon: "wallet" },
    { id: "sos", title: "SOS", icon: "shield" },
    { id: "ai", title: "AI", icon: "chatbubble" },
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
              color={isActive ? "#101828" : "#94A3B8"}
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

const bg = "#111827";
const panel = "#1F2937";
const panel2 = "#243142";
const text = "#F9FAFB";
const muted = "#CBD5E1";
const soft = "#94A3B8";
const border = "rgba(255,255,255,0.12)";
const accent = "#93C5FD";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: bg },
  app: { flex: 1, backgroundColor: bg },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 10 : 12,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: border,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logo: { color: text, fontSize: 27, fontWeight: "900", letterSpacing: -0.8 },
  headerSub: { color: soft, fontSize: 12, fontWeight: "700", marginTop: 2 },
  headerRight: { flexDirection: "row", alignItems: "center", gap: 7 },
  pill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    backgroundColor: panel2,
    borderWidth: 1,
    borderColor: border,
    paddingHorizontal: 9,
    paddingVertical: 8,
    borderRadius: 999,
  },
  pillGood: { backgroundColor: "rgba(74,222,128,0.18)" },
  pillBad: { backgroundColor: "rgba(251,113,133,0.18)" },
  pillText: { color: text, fontSize: 11, fontWeight: "900" },
  content: { flex: 1 },
  contentPad: { padding: 16, paddingBottom: 120 },
  hero: {
    backgroundColor: panel,
    borderRadius: 30,
    padding: 20,
    borderWidth: 1,
    borderColor: border,
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
    color: accent,
    fontSize: 12,
    fontWeight: "900",
    letterSpacing: 1.1,
  },
  heroTitle: {
    color: text,
    fontSize: 31,
    lineHeight: 36,
    fontWeight: "900",
    marginTop: 10,
  },
  heroText: { color: muted, fontSize: 14, lineHeight: 21, marginTop: 10 },
  section: { marginBottom: 22 },
  sectionTitle: {
    color: text,
    fontSize: 18,
    fontWeight: "900",
    marginBottom: 12,
  },
  row: { gap: 10, paddingRight: 12 },
  cityCard: {
    width: 165,
    backgroundColor: panel,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 22,
    padding: 14,
  },
  activeCard: { borderColor: accent, backgroundColor: "#2B3B52" },
  cityTitle: { color: text, fontSize: 18, fontWeight: "900" },
  cardText: { color: soft, fontSize: 13, lineHeight: 19, marginTop: 5 },
  cardAccent: { color: accent, fontWeight: "900", marginTop: 8 },
  budgetBox: {
    backgroundColor: panel,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 24,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  budgetInput: {
    flex: 1,
    color: text,
    fontSize: 28,
    fontWeight: "900",
    paddingVertical: 4,
  },
  currencyText: { color: accent, fontWeight: "900", fontSize: 16 },
  quickBudgets: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 10,
  },
  quickBudget: {
    backgroundColor: panel2,
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: border,
  },
  quickBudgetText: { color: muted, fontWeight: "800", fontSize: 12 },
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  chip: {
    backgroundColor: panel,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 999,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },
  chipActive: { backgroundColor: accent, borderColor: "#BFDBFE" },
  chipText: { color: muted, fontWeight: "900" },
  chipTextActive: { color: "#101828" },
  summary: {
    backgroundColor: panel,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 26,
    padding: 17,
    marginBottom: 16,
  },
  summaryTitle: { color: text, fontWeight: "900", fontSize: 20, marginTop: 7 },
  moneyRow: { flexDirection: "row", gap: 8, marginTop: 14 },
  miniStat: {
    flex: 1,
    backgroundColor: panel2,
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: border,
  },
  miniLabel: { color: soft, fontWeight: "800", fontSize: 11 },
  miniValue: { color: text, fontWeight: "900", fontSize: 12, marginTop: 5 },
  primaryButton: {
    backgroundColor: accent,
    borderRadius: 22,
    minHeight: 58,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: { color: "#101828", fontSize: 16, fontWeight: "900" },
  routeCard: {
    flexDirection: "row",
    gap: 12,
    backgroundColor: panel,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 26,
    padding: 14,
    marginBottom: 13,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: accent,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: { color: "#101828", fontWeight: "900" },
  cardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
    alignItems: "center",
  },
  timeText: { color: accent, fontWeight: "900" },
  crowdText: { fontWeight: "900", fontSize: 12 },
  placeTitle: { color: text, fontSize: 19, fontWeight: "900", marginTop: 6 },
  infoText: { color: muted, fontWeight: "700", marginTop: 8, lineHeight: 19 },
  tipText: { color: "#E0F2FE", marginTop: 9, lineHeight: 19 },
  actionRow: { flexDirection: "row", gap: 8, marginTop: 12 },
  secondaryButton: {
    flex: 1,
    backgroundColor: accent,
    borderRadius: 16,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    paddingHorizontal: 10,
  },
  secondaryButtonText: { color: "#101828", fontWeight: "900", fontSize: 12 },
  darkButton: {
    flex: 1,
    backgroundColor: panel2,
    borderRadius: 16,
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
    borderWidth: 1,
    borderColor: border,
  },
  darkButtonText: { color: text, fontWeight: "900", fontSize: 12 },
  placeCard: {
    backgroundColor: panel,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 24,
    padding: 15,
    marginBottom: 12,
  },
  badge: {
    color: "#101828",
    backgroundColor: accent,
    overflow: "hidden",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    fontWeight: "900",
    fontSize: 11,
  },
  taxiCard: {
    backgroundColor: panel,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 24,
    padding: 15,
    marginBottom: 12,
  },
  budgetBig: {
    color: "#86EFAC",
    fontSize: 22,
    fontWeight: "900",
    marginVertical: 10,
  },
  expenseRow: {
    backgroundColor: panel,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 22,
    padding: 15,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  expenseTitle: { color: text, fontWeight: "900", flex: 1 },
  expenseValue: { color: "#86EFAC", fontWeight: "900" },
  sosHero: {
    backgroundColor: panel,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 28,
    padding: 20,
    marginBottom: 16,
  },
  sosTitle: { color: text, fontSize: 28, fontWeight: "900", marginTop: 10 },
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
    backgroundColor: panel,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: border,
  },
  userBubble: { backgroundColor: accent, alignSelf: "flex-end" },
  bubbleText: { color: text, lineHeight: 20, fontWeight: "600" },
  userBubbleText: { color: "#101828" },
  inputRow: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    borderTopWidth: 1,
    borderColor: border,
  },
  chatInput: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    backgroundColor: panel,
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: border,
    color: text,
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
    borderColor: border,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    paddingVertical: 8,
  },
  tabActive: { backgroundColor: accent },
  tabText: { color: soft, fontWeight: "900", fontSize: 8, marginTop: 2 },
  tabTextActive: { color: "#101828" },
});
