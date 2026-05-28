import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
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
import { cities, interests } from "./src/data/cities";
import {
  budgetLabel,
  buildRoute,
  durationLabel,
  formatUZS,
} from "./src/lib/routeBuilder";
import type { BudgetLevel, GeneratedRoute, TripDuration } from "./src/types";

type Tab = "planner" | "route" | "assistant" | "saved" | "profile";
type ChatMessage = { id: string; role: "user" | "assistant"; text: string };
type CountryOption = {
  id: string;
  title: string;
  emoji: string;
  subtitle: string;
  available: boolean;
};

const countries: CountryOption[] = [
  {
    id: "uzbekistan",
    title: "Узбекистан",
    emoji: "🇺🇿",
    subtitle: "Ташкент, Самарканд, Бухара, Хива",
    available: true,
  },
  {
    id: "uae",
    title: "ОАЭ",
    emoji: "🇦🇪",
    subtitle: "Дубай скоро",
    available: false,
  },
  {
    id: "turkey",
    title: "Турция",
    emoji: "🇹🇷",
    subtitle: "Стамбул скоро",
    available: false,
  },
  {
    id: "kazakhstan",
    title: "Казахстан",
    emoji: "🇰🇿",
    subtitle: "Алматы скоро",
    available: false,
  },
];

const durations: { id: TripDuration; title: string; subtitle: string }[] = [
  { id: "3h", title: "3 часа", subtitle: "Быстрый маршрут" },
  { id: "1d", title: "1 день", subtitle: "Главное за день" },
  { id: "2d", title: "2 дня", subtitle: "Спокойный темп" },
  { id: "3d", title: "3 дня", subtitle: "Глубокий тур" },
];

const budgets: { id: BudgetLevel; title: string; subtitle: string }[] = [
  { id: "economy", title: "Эконом", subtitle: "Без лишних трат" },
  { id: "comfort", title: "Комфорт", subtitle: "Оптимально" },
  { id: "premium", title: "Премиум", subtitle: "Лучшие места" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("planner");
  const [countryId, setCountryId] = useState("uzbekistan");
  const [cityId, setCityId] = useState(cities[0].id);
  const [duration, setDuration] = useState<TripDuration>("1d");
  const [budget, setBudget] = useState<BudgetLevel>("comfort");
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    "history",
    "food",
    "photo",
  ]);
  const [savedRoutes, setSavedRoutes] = useState<GeneratedRoute[]>([]);
  const [chatText, setChatText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "hello",
      role: "assistant",
      text: "Привет! Я AI‑гид. Спроси, куда сходить вечером, где поесть или как не переплатить.",
    },
  ]);

  const selectedCountry =
    countries.find((item) => item.id === countryId) ?? countries[0];
  const availableCities = useMemo(
    () => cities.filter((city) => city.country === selectedCountry.title),
    [selectedCountry.title],
  );
  const route = useMemo(
    () => buildRoute(cityId, duration, budget, selectedInterests),
    [cityId, duration, budget, selectedInterests],
  );

  const chooseCountry = (country: CountryOption) => {
    setCountryId(country.id);
    const firstCity = cities.find((city) => city.country === country.title);
    if (firstCity) setCityId(firstCity.id);
  };

  const toggleInterest = (id: string) => {
    setSelectedInterests((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  };

  const saveCurrentRoute = () => {
    setSavedRoutes((current) => [route, ...current].slice(0, 8));
    setTab("saved");
  };

  const sendChat = () => {
    const text = chatText.trim();
    if (!text) return;

    const lower = text.toLowerCase();
    const city = route.city.title;
    let answer = `Для ${city} я бы построил маршрут: ${route.stops.map((stop) => stop.title).join(" → ")}. Бюджет примерно ${formatUZS(route.totalBudget)}.`;

    if (lower.includes("вечер") || lower.includes("ноч")) {
      const evening =
        route.stops.find((stop) => stop.tags.includes("night")) ??
        route.stops[route.stops.length - 1];
      answer = `На вечер лучше: ${evening.title}. ${evening.tip}`;
    }

    if (
      lower.includes("дешев") ||
      lower.includes("эконом") ||
      lower.includes("не переплат")
    ) {
      answer = `Чтобы не переплатить: уточняй цену заранее, сравни 2–3 места и не соглашайся на навязчивые предложения. Эконом‑день в ${city}: около ${formatUZS(route.city.dailyBudgetUZS.economy)}.`;
    }

    if (lower.includes("фото") || lower.includes("инст")) {
      const photo =
        route.stops.find((stop) => stop.tags.includes("photo")) ??
        route.stops[0];
      answer = `Для фото лучше: ${photo.title}. Лучшее время: ${photo.bestTime}. Совет: ${photo.tip}`;
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
        <Header route={route} savedCount={savedRoutes.length} />

        {tab === "planner" && (
          <PlannerScreen
            countryId={countryId}
            countries={countries}
            chooseCountry={chooseCountry}
            cityId={cityId}
            citiesList={availableCities.length ? availableCities : cities}
            setCityId={setCityId}
            duration={duration}
            setDuration={setDuration}
            budget={budget}
            setBudget={setBudget}
            selectedInterests={selectedInterests}
            toggleInterest={toggleInterest}
            route={route}
            onBuild={() => setTab("route")}
          />
        )}

        {tab === "route" && (
          <RouteScreen route={route} onSave={saveCurrentRoute} />
        )}
        {tab === "assistant" && (
          <AssistantScreen
            messages={messages}
            chatText={chatText}
            setChatText={setChatText}
            onSend={sendChat}
          />
        )}
        {tab === "saved" && (
          <SavedScreen
            savedRoutes={savedRoutes}
            openRoute={() => setTab("route")}
          />
        )}
        {tab === "profile" && (
          <ProfileScreen
            route={route}
            savedCount={savedRoutes.length}
            country={selectedCountry}
          />
        )}

        <BottomTabs active={tab} setActive={setTab} />
      </View>
    </SafeAreaView>
  );
}

function Header({
  route,
  savedCount,
}: {
  route: GeneratedRoute;
  savedCount: number;
}) {
  return (
    <View style={styles.header}>
      <View>
        <Text style={styles.logo}>TripMate</Text>
        <Text style={styles.headerSub}>Apple dark AI travel guide</Text>
      </View>
      <View style={styles.headerRight}>
        <View style={styles.cityPill}>
          <Ionicons name="location" size={14} color="#F8FAFC" />
          <Text style={styles.cityPillText}>{route.city.title}</Text>
        </View>
        <View style={styles.countPill}>
          <Text style={styles.countPillText}>{savedCount}</Text>
        </View>
      </View>
    </View>
  );
}

function PlannerScreen(props: {
  countryId: string;
  countries: CountryOption[];
  chooseCountry: (country: CountryOption) => void;
  cityId: string;
  citiesList: typeof cities;
  setCityId: (id: string) => void;
  duration: TripDuration;
  setDuration: (id: TripDuration) => void;
  budget: BudgetLevel;
  setBudget: (id: BudgetLevel) => void;
  selectedInterests: string[];
  toggleInterest: (id: string) => void;
  route: GeneratedRoute;
  onBuild: () => void;
}) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <View style={styles.heroGlow} />
        <Text style={styles.kicker}>AI TRAVEL PLANNER</Text>
        <Text style={styles.heroTitle}>Новый город без стресса</Text>
        <Text style={styles.heroText}>
          Выбери страну, город, бюджет и интересы. TripMate соберет маршрут как
          локальный друг.
        </Text>
        <View style={styles.heroStats}>
          <MiniStat value="30 сек" label="создание" />
          <MiniStat value={formatUZS(props.route.totalBudget)} label="бюджет" />
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
                props.countryId === item.id && styles.activeCard,
                !item.available && styles.disabled,
              ]}
            >
              <Text style={styles.countryEmoji}>{item.emoji}</Text>
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardText}>{item.subtitle}</Text>
              {!item.available && <Text style={styles.soon}>Скоро</Text>}
            </Pressable>
          )}
        />
      </Section>

      <Section title="2. Город">
        <FlatList
          horizontal
          data={props.citiesList}
          keyExtractor={(item) => item.id}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.rowList}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => props.setCityId(item.id)}
              style={[
                styles.cityCard,
                props.cityId === item.id && styles.activeCard,
              ]}
            >
              <Text style={styles.cardTitle}>{item.title}</Text>
              <Text style={styles.cardAccent}>{item.country}</Text>
              <Text style={styles.cardText}>{item.short}</Text>
            </Pressable>
          )}
        />
      </Section>

      <Section title="3. Время">
        <View style={styles.gridTwo}>
          {durations.map((item) => (
            <ChoiceCard
              key={item.id}
              {...item}
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
              {...item}
              active={props.budget === item.id}
              onPress={() => props.setBudget(item.id)}
              compact
            />
          ))}
        </View>
      </Section>

      <Section title="5. Интересы">
        <View style={styles.chips}>
          {interests.map((item) => {
            const active = props.selectedInterests.includes(item.id);
            return (
              <Pressable
                key={item.id}
                onPress={() => props.toggleInterest(item.id)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text
                  style={[styles.chipText, active && styles.chipTextActive]}
                >
                  {item.icon} {item.title}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Section>

      <View style={styles.summaryCard}>
        <Text style={styles.kicker}>ПРЕДВАРИТЕЛЬНЫЙ ПЛАН</Text>
        <Text style={styles.summaryTitle}>
          {props.route.city.title} • {durationLabel(props.route.duration)} •{" "}
          {budgetLabel(props.route.budget)}
        </Text>
        <Text style={styles.cardText}>
          Маршрут: {props.route.stops.map((stop) => stop.title).join(" → ")}
        </Text>
        <Text style={styles.budget}>
          ≈ {formatUZS(props.route.totalBudget)}
        </Text>
      </View>

      <Pressable style={styles.primaryButton} onPress={props.onBuild}>
        <Text style={styles.primaryButtonText}>Построить маршрут</Text>
        <Ionicons name="arrow-forward" size={20} color="#08111F" />
      </Pressable>
    </ScrollView>
  );
}

function RouteScreen({
  route,
  onSave,
}: {
  route: GeneratedRoute;
  onSave: () => void;
}) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.heroCard}>
        <Text style={styles.kicker}>ГОТОВЫЙ МАРШРУТ</Text>
        <Text style={styles.heroTitle}>
          {route.city.title} за {durationLabel(route.duration)}
        </Text>
        <Text style={styles.heroText}>{route.city.hero}</Text>
        <View style={styles.heroStats}>
          <MiniStat value={formatUZS(route.totalBudget)} label="бюджет" />
          <MiniStat value={`${route.stops.length}`} label="точек" />
        </View>
      </View>

      <Section title="План по времени">
        {route.stops.map((stop, index) => (
          <View key={stop.id} style={styles.stopCard}>
            <View style={styles.dot}>
              <Text style={styles.dotText}>{index + 1}</Text>
            </View>
            <View style={styles.stopBody}>
              <Text style={styles.stopTime}>
                {stop.time} • {stop.category}
              </Text>
              <Text style={styles.stopTitle}>{stop.title}</Text>
              <Text style={styles.cardText}>{stop.subtitle}</Text>
              <Text style={styles.infoText}>📍 {stop.address}</Text>
              <Text style={styles.infoText}>🚕 {stop.transfer}</Text>
              <Text style={styles.tipText}>Совет: {stop.tip}</Text>
            </View>
          </View>
        ))}
      </Section>

      <Section title="Фразы для города">
        {route.city.phrases.map((phrase) => (
          <View key={phrase.local} style={styles.savedCard}>
            <Text style={styles.stopTitle}>{phrase.ru}</Text>
            <Text style={styles.phraseLocal}>{phrase.local}</Text>
            <Text style={styles.cardText}>{phrase.meaning}</Text>
          </View>
        ))}
      </Section>

      <Pressable style={styles.primaryButton} onPress={onSave}>
        <Text style={styles.primaryButtonText}>Сохранить маршрут</Text>
        <Ionicons name="bookmark" size={19} color="#08111F" />
      </Pressable>
    </ScrollView>
  );
}

function AssistantScreen(props: {
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
          placeholder="Спроси AI‑гида..."
          placeholderTextColor="#64748B"
          style={styles.chatInput}
          multiline
        />
        <Pressable style={styles.sendButton} onPress={props.onSend}>
          <Ionicons name="send" size={18} color="#08111F" />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

function SavedScreen({
  savedRoutes,
  openRoute,
}: {
  savedRoutes: GeneratedRoute[];
  openRoute: () => void;
}) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      {savedRoutes.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>Пока нет сохраненных маршрутов</Text>
          <Text style={styles.cardText}>
            Собери маршрут и нажми “Сохранить маршрут”.
          </Text>
        </View>
      ) : (
        savedRoutes.map((route, index) => (
          <Pressable
            key={`${route.city.id}-${index}`}
            style={styles.savedCard}
            onPress={openRoute}
          >
            <Text style={styles.stopTitle}>
              {route.city.title} • {durationLabel(route.duration)}
            </Text>
            <Text style={styles.cardText}>
              {route.stops.map((stop) => stop.title).join(" → ")}
            </Text>
            <Text style={styles.budget}>{formatUZS(route.totalBudget)}</Text>
          </Pressable>
        ))
      )}
    </ScrollView>
  );
}

function ProfileScreen({
  route,
  savedCount,
  country,
}: {
  route: GeneratedRoute;
  savedCount: number;
  country: CountryOption;
}) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.contentPad}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.profileHero}>
        <View style={styles.avatar}>
          <Ionicons name="person" size={34} color="#08111F" />
        </View>
        <Text style={styles.profileName}>Гость TripMate</Text>
        <Text style={styles.cardText}>Профиль путешественника</Text>
      </View>
      <View style={styles.gridThree}>
        <MiniStat value={`${country.emoji} ${country.title}`} label="страна" />
        <MiniStat value={route.city.title} label="город" />
        <MiniStat value={`${savedCount}`} label="сохранено" />
      </View>
      <Section title="Настройки">
        <ProfileRow icon="language" title="Язык" value="Русский" />
        <ProfileRow
          icon="wallet"
          title="Бюджет"
          value={budgetLabel(route.budget)}
        />
        <ProfileRow icon="cloud-offline" title="Офлайн" value="Скоро" />
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
    { id: "planner", title: "План", icon: "sparkles" },
    { id: "route", title: "Маршрут", icon: "map" },
    { id: "assistant", title: "AI", icon: "chatbubble" },
    { id: "saved", title: "Сохранено", icon: "bookmark" },
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
            style={[styles.tabItem, isActive && styles.tabItemActive]}
          >
            <Ionicons
              name={tab.icon}
              size={18}
              color={isActive ? "#08111F" : "#64748B"}
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

const glass = "rgba(255,255,255,0.1)";
const card = "rgba(255,255,255,0.07)";

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#050812" },
  app: { flex: 1, backgroundColor: "#050812" },
  header: {
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "rgba(255,255,255,0.06)",
  },
  logo: {
    color: "#F8FAFC",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.8,
  },
  headerSub: {
    color: "#64748B",
    marginTop: 2,
    fontSize: 12,
    fontWeight: "700",
  },
  headerRight: { flexDirection: "row", gap: 8, alignItems: "center" },
  cityPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.08)",
    borderWidth: 1,
    borderColor: glass,
  },
  cityPillText: { color: "#F8FAFC", fontWeight: "800", fontSize: 12 },
  countPill: {
    backgroundColor: "#93C5FD",
    minWidth: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  countPillText: { color: "#08111F", fontWeight: "900" },
  content: { flex: 1, backgroundColor: "#050812" },
  contentPad: { padding: 16, paddingBottom: 118 },
  heroCard: {
    backgroundColor: "#0B1220",
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
    backgroundColor: "rgba(96,165,250,0.24)",
  },
  kicker: {
    color: "#93C5FD",
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
    backgroundColor: "rgba(255,255,255,0.08)",
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
    width: 178,
    minHeight: 138,
    backgroundColor: card,
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: glass,
  },
  countryEmoji: { fontSize: 28 },
  cityCard: {
    width: 218,
    backgroundColor: card,
    borderRadius: 26,
    padding: 16,
    borderWidth: 1,
    borderColor: glass,
  },
  activeCard: {
    borderColor: "#93C5FD",
    backgroundColor: "rgba(147,197,253,0.15)",
  },
  disabled: { opacity: 0.62 },
  cardTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 8,
  },
  cardAccent: { color: "#93C5FD", fontWeight: "800", marginTop: 3 },
  cardText: { color: "#94A3B8", fontSize: 12, lineHeight: 18, marginTop: 5 },
  soon: { color: "#FDE68A", fontWeight: "900", fontSize: 11, marginTop: 8 },
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
  chips: { flexDirection: "row", flexWrap: "wrap", gap: 9 },
  chip: {
    backgroundColor: card,
    borderColor: glass,
    borderWidth: 1,
    paddingHorizontal: 13,
    paddingVertical: 10,
    borderRadius: 999,
  },
  chipActive: { backgroundColor: "#93C5FD", borderColor: "#BFDBFE" },
  chipText: { fontWeight: "800", color: "#CBD5E1" },
  chipTextActive: { color: "#08111F" },
  summaryCard: {
    backgroundColor: "rgba(255,255,255,0.09)",
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
    backgroundColor: "#93C5FD",
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginBottom: 10,
  },
  primaryButtonText: { color: "#08111F", fontSize: 16, fontWeight: "900" },
  stopCard: { flexDirection: "row", gap: 10, marginBottom: 14 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#93C5FD",
    alignItems: "center",
    justifyContent: "center",
  },
  dotText: { color: "#08111F", fontWeight: "900", fontSize: 12 },
  stopBody: {
    flex: 1,
    backgroundColor: card,
    borderRadius: 24,
    padding: 15,
    borderWidth: 1,
    borderColor: glass,
  },
  stopTime: { color: "#93C5FD", fontWeight: "900" },
  stopTitle: {
    color: "#F8FAFC",
    fontSize: 18,
    fontWeight: "900",
    marginTop: 4,
  },
  phraseLocal: {
    color: "#93C5FD",
    fontWeight: "900",
    fontSize: 17,
    marginTop: 4,
  },
  infoText: { color: "#CBD5E1", marginTop: 8, fontWeight: "700" },
  tipText: { color: "#E2E8F0", marginTop: 10, lineHeight: 19 },
  assistantWrap: { flex: 1, paddingBottom: 86, backgroundColor: "#050812" },
  chatList: { flex: 1 },
  chatPad: { padding: 16, paddingBottom: 20 },
  bubble: { maxWidth: "84%", padding: 14, borderRadius: 22, marginBottom: 10 },
  assistantBubble: {
    backgroundColor: card,
    alignSelf: "flex-start",
    borderWidth: 1,
    borderColor: glass,
  },
  userBubble: { backgroundColor: "#93C5FD", alignSelf: "flex-end" },
  bubbleText: { color: "#F8FAFC", lineHeight: 20, fontWeight: "600" },
  userBubbleText: { color: "#08111F" },
  chatInputRow: {
    flexDirection: "row",
    gap: 10,
    padding: 14,
    backgroundColor: "#050812",
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
    backgroundColor: "#93C5FD",
    alignItems: "center",
    justifyContent: "center",
  },
  emptyCard: {
    backgroundColor: card,
    borderRadius: 24,
    padding: 18,
    borderWidth: 1,
    borderColor: glass,
  },
  emptyTitle: { color: "#F8FAFC", fontSize: 18, fontWeight: "900" },
  savedCard: {
    backgroundColor: card,
    borderRadius: 24,
    padding: 16,
    borderWidth: 1,
    borderColor: glass,
    marginBottom: 12,
  },
  profileHero: {
    backgroundColor: "#0B1220",
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
    backgroundColor: "#93C5FD",
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
  tabs: {
    position: "absolute",
    left: 12,
    right: 12,
    bottom: 12,
    backgroundColor: "rgba(15,23,42,0.96)",
    borderRadius: 28,
    padding: 7,
    flexDirection: "row",
    borderWidth: 1,
    borderColor: glass,
  },
  tabItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 20,
    gap: 2,
  },
  tabItemActive: { backgroundColor: "#93C5FD" },
  tabText: { fontSize: 9, fontWeight: "900", color: "#64748B" },
  tabTextActive: { color: "#08111F" },
});
