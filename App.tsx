import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import {
  Alert,
  ImageBackground,
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
import {
  cities,
  makeHotels,
  makeNearby,
  makePlaces,
  type City,
  type Feeling,
  type Tempo,
} from "./src/travel-data";
import { buildRoute, calcBudget, healthAdvice } from "./src/logic/planner";

type Tab = "home" | "route" | "hotels" | "places" | "money" | "health";

const TRAVEL_IMAGES = {
  hero: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  card: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
  map: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=900&q=80",
  city: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=900&q=80",
};

export default function App() {
  const [tab, setTab] = useState<Tab>("home");
  const [cityId, setCityId] = useState("tashkent");
  const [hotel, setHotel] = useState("Выбери отель");
  const [budget, setBudget] = useState("500");
  const [tempo, setTempo] = useState<Tempo>("balanced");
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [water, setWater] = useState(0.8);
  const [pulse, setPulse] = useState("82");
  const [pressure, setPressure] = useState("120/80");
  const [feeling, setFeeling] = useState<Feeling>("good");

  const city = useMemo(
    () => cities.find((item) => item.id === cityId) ?? cities[0],
    [cityId],
  );
  const route = useMemo(() => buildRoute(city, tempo), [city, tempo]);
  const hotels = useMemo(() => makeHotels(city), [city]);
  const places = useMemo(() => makePlaces(city), [city]);
  const nearby = useMemo(() => makeNearby(city), [city]);
  const costs = useMemo(
    () => calcBudget(city.currency, hotel, budget),
    [city.currency, hotel, budget],
  );

  const completedCount = route.filter((_, index) => done[index]).length;
  const progress = Math.round((completedCount / route.length) * 100);
  const activeIndex = route.findIndex((_, index) => !done[index]);
  const activeStep = route[activeIndex] ?? route[route.length - 1];

  function selectCity(id: string) {
    const next = cities.find((item) => item.id === id);
    setCityId(id);
    setDone({});
    if (next) setHotel(`${next.city} Central Stay`);
  }

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.app}>
        <View style={styles.bgCircleOne} />
        <View style={styles.bgCircleTwo} />

        <View style={styles.header}>
          <View>
            <Text style={styles.logo}>TripMate</Text>
            <Text style={styles.headerSub}>
              {city.emoji} {city.city}, {city.country}
            </Text>
          </View>

          <View style={styles.progressPill}>
            <Text style={styles.progressText}>{progress}%</Text>
          </View>
        </View>

        {tab === "home" && (
          <HomeScreen
            city={city}
            budget={budget}
            setBudget={setBudget}
            tempo={tempo}
            setTempo={setTempo}
            selectCity={selectCity}
            activeStep={activeStep}
            setTab={setTab}
          />
        )}

        {tab === "route" && (
          <RouteScreen
            city={city}
            route={route}
            done={done}
            setDone={setDone}
            activeIndex={activeIndex}
          />
        )}

        {tab === "hotels" && (
          <HotelsScreen
            hotels={hotels}
            hotel={hotel}
            setHotel={setHotel}
            costs={costs}
          />
        )}

        {tab === "places" && <PlacesScreen city={city} places={places} />}

        {tab === "money" && (
          <MoneyScreen city={city} costs={costs} nearby={nearby} />
        )}

        {tab === "health" && (
          <HealthScreen
            water={water}
            setWater={setWater}
            pulse={pulse}
            setPulse={setPulse}
            pressure={pressure}
            setPressure={setPressure}
            feeling={feeling}
            setFeeling={setFeeling}
          />
        )}

        <BottomTabs tab={tab} setTab={setTab} />
      </View>
    </SafeAreaView>
  );
}

function HomeScreen({
  city,
  budget,
  setBudget,
  tempo,
  setTempo,
  selectCity,
  activeStep,
  setTab,
}: any) {
  const countries = Array.from(
    new Set(cities.map((item) => `${item.emoji} ${item.country}`)),
  );

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.pagePad}
      showsVerticalScrollIndicator={false}
    >
      <ImageBackground
        source={{ uri: TRAVEL_IMAGES.hero }}
        style={styles.hero}
        imageStyle={styles.heroImage}
      >
        <View style={styles.heroOverlay} />
        <Text style={styles.heroTitle}>
          Explore.{"\n"}Travel.{"\n"}Inspire.
        </Text>
        <Text style={styles.heroCaption}>
          Life is all about journey. Find yours.
        </Text>

        <Pressable style={styles.mainButton} onPress={() => setTab("route")}>
          <Text style={styles.mainButtonText}>Get Started</Text>
          <Ionicons name="arrow-forward" size={18} color="#102033" />
        </Pressable>
      </ImageBackground>

      <Section title="Страны">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {countries.map((country) => (
            <View key={country} style={styles.countryChip}>
              <Text style={styles.countryText}>{country}</Text>
            </View>
          ))}
        </ScrollView>
      </Section>

      <Section title="People like">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.row}
        >
          {cities.map((item) => {
            const active = item.id === city.id;
            return (
              <Pressable
                key={item.id}
                style={[
                  styles.destinationCard,
                  active && styles.destinationActive,
                ]}
                onPress={() => selectCity(item.id)}
              >
                <ImageBackground
                  source={{ uri: TRAVEL_IMAGES.card }}
                  style={styles.destinationPhoto}
                  imageStyle={styles.destinationPhotoImage}
                >
                  <View style={styles.destinationShade} />
                  <Text style={styles.destinationName}>{item.city}</Text>
                  <Text style={styles.destinationMeta}>⌖ {item.country}</Text>
                </ImageBackground>
                <Text style={[styles.cardTitle, active && styles.white]}>
                  {item.city}
                </Text>
                <Text style={[styles.cardMuted, active && styles.whiteMuted]}>
                  {item.vibe}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </Section>

      <Section title="Параметры поездки">
        <View style={styles.inputCard}>
          <Ionicons name="wallet" size={18} color="#2DD4BF" />
          <TextInput
            value={budget}
            onChangeText={setBudget}
            keyboardType="number-pad"
            placeholder="Бюджет"
            placeholderTextColor="#8190A2"
            style={styles.input}
          />
          <Text style={styles.currency}>{city.currency}</Text>
        </View>

        <View style={styles.tempoRow}>
          {(["calm", "balanced", "active", "premium"] as Tempo[]).map(
            (item) => (
              <Pressable
                key={item}
                style={[styles.tempoChip, tempo === item && styles.tempoActive]}
                onPress={() => setTempo(item)}
              >
                <Text
                  style={[styles.tempoText, tempo === item && styles.white]}
                >
                  {item === "calm"
                    ? "спокойно"
                    : item === "balanced"
                      ? "баланс"
                      : item === "active"
                        ? "активно"
                        : "премиум"}
                </Text>
              </Pressable>
            ),
          )}
        </View>
      </Section>

      <Section title="Что делать сейчас">
        <Pressable style={styles.nowCard} onPress={() => setTab("route")}>
          <View style={styles.darkIcon}>
            <Ionicons name={activeStep.icon as any} size={23} color="#fff" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>
              {activeStep.time} · {activeStep.title}
            </Text>
            <Text style={styles.cardMuted}>{activeStep.notice}</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </Pressable>
      </Section>
    </ScrollView>
  );
}

function RouteScreen({ city, route, done, setDone, activeIndex }: any) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.pagePad}
      showsVerticalScrollIndicator={false}
    >
      <ImageBackground
        source={{ uri: TRAVEL_IMAGES.map }}
        style={styles.mapCard}
        imageStyle={styles.mapImage}
      >
        <View style={styles.mapOverlay} />
        <Text style={styles.mapTitle}>Destination</Text>
        <View style={styles.curve} />
        <View style={[styles.pin, { top: 90, left: 64 }]} />
        <View style={[styles.pin, { top: 160, left: 190 }]} />
        <View style={[styles.pin, { top: 250, left: 105 }]} />
        <View style={styles.mapInfo}>
          <Text style={styles.mapInfoText}>Time{"\n"}2h 34 min</Text>
          <Text style={styles.mapInfoText}>Distance{"\n"}2.3 km</Text>
        </View>
      </ImageBackground>

      {route.map((step: any, index: number) => {
        const active = index === activeIndex;
        const ok = done[index];

        return (
          <Pressable
            key={`${step.time}-${step.title}`}
            onPress={() => setDone({ ...done, [index]: !ok })}
            style={[
              styles.stepCard,
              active && styles.stepActive,
              ok && styles.stepDone,
            ]}
          >
            <View
              style={[
                styles.stepIcon,
                active && styles.stepIconActive,
                ok && styles.stepIconDone,
              ]}
            >
              <Ionicons
                name={(ok ? "checkmark" : step.icon) as any}
                size={20}
                color={active || ok ? "#fff" : "#2DD4BF"}
              />
            </View>

            <View style={{ flex: 1 }}>
              <Text style={styles.timeText}>
                {step.time} · {step.price}
              </Text>
              <Text style={styles.cardTitle}>{step.title}</Text>
              <Text style={styles.cardMuted}>{step.text}</Text>
              <Text style={styles.notice}>🔔 {step.notice}</Text>

              <View style={styles.actions}>
                <SmallButton
                  title="Готово"
                  icon="checkmark"
                  onPress={() => setDone({ ...done, [index]: !ok })}
                />
                <SmallButton
                  title="Карта"
                  icon="map"
                  onPress={() => openMap(`${step.title} ${city.city}`)}
                />
                <SmallButton
                  title="Такси"
                  icon="car"
                  onPress={() => openMap(`${step.title} ${city.city}`)}
                />
              </View>
            </View>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

function HotelsScreen({ hotels, hotel, setHotel, costs }: any) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.pagePad}
      showsVerticalScrollIndicator={false}
    >
      <Intro
        title="Отели перед поездкой"
        text="Эконом, комфорт и премиум-логика: приложение заранее предлагает где лучше жить и почему."
      />

      {hotels.map((item: any) => (
        <Pressable
          key={item.name}
          onPress={() => setHotel(item.name)}
          style={[styles.hotelCard, hotel === item.name && styles.hotelActive]}
        >
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.cardMuted}>
            {item.area} · {item.level} · {item.price}
          </Text>
          <Text style={styles.notice}>Почему: {item.why}</Text>
        </Pressable>
      ))}

      <Section title="Расчет суммы">
        {costs.map((item: any) => (
          <View key={item.name} style={styles.moneyRow}>
            <Text style={styles.cardTitle}>{item.name}</Text>
            <Text style={styles.moneyValue}>{item.formatted}</Text>
          </View>
        ))}
      </Section>
    </ScrollView>
  );
}

function PlacesScreen({ city, places }: any) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.pagePad}
      showsVerticalScrollIndicator={false}
    >
      <Intro
        title="Куда сходить"
        text="Места распределены: must-see, еда, покупки, отдых, фото, музей и вечер."
      />

      {places.map((place: any) => (
        <View key={place.title} style={styles.placeCard}>
          <View style={styles.lightIcon}>
            <Ionicons name={place.icon as any} size={21} color="#2DD4BF" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.cardTitle}>{place.title}</Text>
            <Text style={styles.cardMuted}>
              {place.type} · {place.duration} · {place.price} · {place.bestTime}
            </Text>
            <Text style={styles.notice}>{place.tip}</Text>
          </View>
          <Pressable
            style={styles.circleButton}
            onPress={() => openMap(`${place.title} ${city.city}`)}
          >
            <Ionicons name="navigate" size={18} color="#fff" />
          </Pressable>
        </View>
      ))}
    </ScrollView>
  );
}

function MoneyScreen({ city, costs, nearby }: any) {
  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.pagePad}
      showsVerticalScrollIndicator={false}
    >
      <Intro
        title="Деньги, такси, обмен"
        text="Расчет бюджета, нормальная цена такси, где менять валюту и что находится рядом."
      />

      <Info title="Обмен валюты" text={city.exchange} icon="cash" />
      <Info title="Такси" text={city.transfer} icon="car" />
      <Info title="Наличные" text={city.cash} icon="card" />

      {costs.map((item: any) => (
        <View key={item.name} style={styles.moneyRow}>
          <Text style={styles.cardTitle}>{item.name}</Text>
          <Text style={styles.moneyValue}>{item.formatted}</Text>
        </View>
      ))}

      <Section title="Рядом">
        {nearby.map((item: any) => (
          <Info
            key={item.title}
            icon={item.icon}
            title={item.title}
            text={`${item.text} · ${item.meta}`}
          />
        ))}
      </Section>
    </ScrollView>
  );
}

function HealthScreen(props: any) {
  const moods = [
    ["good", "Норм", "happy"],
    ["tired", "Устал", "battery-dead"],
    ["hot", "Жарко", "sunny"],
    ["headache", "Болит", "medical"],
  ];

  return (
    <ScrollView
      style={styles.content}
      contentContainerStyle={styles.pagePad}
      showsVerticalScrollIndicator={false}
    >
      <Intro
        title="Часы и организм"
        text="Пульс, давление, вода, сон, жара и акклиматизация. Сейчас ручной ввод, потом HealthKit/Google Fit."
      />

      <View style={styles.watchCard}>
        <Ionicons name="watch" size={40} color="#102033" />
        <Text style={styles.watchTitle}>Связать с часами</Text>
        <Text style={styles.cardMuted}>
          Apple Watch / HealthKit потребует dev-build, Expo Go не считывает это
          полноценно.
        </Text>
      </View>

      <View style={styles.metrics}>
        <Metric
          title="Вода"
          value={`${props.water.toFixed(1)} л`}
          icon="water"
          onPress={() => props.setWater(Math.min(3, props.water + 0.25))}
        />
        <MetricInput
          title="Пульс"
          value={props.pulse}
          setValue={props.setPulse}
          icon="heart"
        />
        <MetricInput
          title="Давление"
          value={props.pressure}
          setValue={props.setPressure}
          icon="fitness"
        />
      </View>

      <View style={styles.moods}>
        {moods.map((mood) => (
          <Pressable
            key={mood[0]}
            onPress={() => props.setFeeling(mood[0])}
            style={[
              styles.mood,
              props.feeling === mood[0] && styles.moodActive,
            ]}
          >
            <Ionicons
              name={mood[2] as any}
              size={19}
              color={props.feeling === mood[0] ? "#fff" : "#2DD4BF"}
            />
            <Text
              style={[
                styles.moodText,
                props.feeling === mood[0] && styles.white,
              ]}
            >
              {mood[1]}
            </Text>
          </Pressable>
        ))}
      </View>

      <Info
        title="Рекомендация"
        icon="sparkles"
        text={healthAdvice(props.feeling, props.water, props.pulse)}
      />
    </ScrollView>
  );
}

function Section({ title, children }: any) {
  return (
    <View style={{ marginBottom: 22 }}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {children}
    </View>
  );
}

function Intro({ title, text }: any) {
  return (
    <View style={styles.intro}>
      <Text style={styles.kicker}>TRAVEL ASSISTANT</Text>
      <Text style={styles.introTitle}>{title}</Text>
      <Text style={styles.cardMuted}>{text}</Text>
    </View>
  );
}

function Info({ icon, title, text }: any) {
  return (
    <View style={styles.infoCard}>
      <View style={styles.lightIcon}>
        <Ionicons name={icon} size={20} color="#2DD4BF" />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardMuted}>{text}</Text>
      </View>
    </View>
  );
}

function SmallButton({ title, icon, onPress }: any) {
  return (
    <Pressable style={styles.smallButton} onPress={onPress}>
      <Ionicons name={icon} size={14} color="#0F9991" />
      <Text style={styles.smallButtonText}>{title}</Text>
    </Pressable>
  );
}

function Metric({ title, value, icon, onPress }: any) {
  return (
    <Pressable style={styles.metric} onPress={onPress}>
      <Ionicons name={icon} size={28} color="#2DD4BF" />
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.cardMuted}>{title}</Text>
    </Pressable>
  );
}

function MetricInput({ title, value, setValue, icon }: any) {
  return (
    <View style={styles.metric}>
      <Ionicons name={icon} size={28} color="#F97316" />
      <TextInput
        value={value}
        onChangeText={setValue}
        style={styles.metricInput}
      />
      <Text style={styles.cardMuted}>{title}</Text>
    </View>
  );
}

function BottomTabs({ tab, setTab }: any) {
  const tabs = [
    ["home", "Home", "compass"],
    ["route", "Route", "map"],
    ["hotels", "Hotel", "bed"],
    ["places", "Places", "camera"],
    ["money", "Money", "cash"],
    ["health", "Body", "watch"],
  ];

  return (
    <View style={styles.tabs}>
      {tabs.map((item) => (
        <Pressable
          key={item[0]}
          onPress={() => setTab(item[0])}
          style={[styles.tab, tab === item[0] && styles.tabActive]}
        >
          <Ionicons
            name={item[2] as any}
            size={17}
            color={tab === item[0] ? "#fff" : "#64748B"}
          />
          <Text style={[styles.tabText, tab === item[0] && styles.white]}>
            {item[1]}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

function openMap(query: string) {
  const url =
    Platform.OS === "ios"
      ? `http://maps.apple.com/?q=${encodeURIComponent(query)}`
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;

  Linking.openURL(url).catch(() => Alert.alert("Карта", query));
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#E9F1F2" },
  app: { flex: 1 },
  bgCircleOne: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 180,
    right: -130,
    top: -100,
    backgroundColor: "rgba(147,197,253,.55)",
  },
  bgCircleTwo: {
    position: "absolute",
    width: 360,
    height: 360,
    borderRadius: 180,
    left: -150,
    top: 230,
    backgroundColor: "rgba(45,212,191,.28)",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  brand: { fontSize: 32, fontWeight: "900", color: "#102033" },
  subtitle: { fontSize: 13, fontWeight: "800", color: "#4B5B6B" },
  progressPill: {
    width: 68,
    height: 48,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,.75)",
    alignItems: "center",
    justifyContent: "center",
  },
  progressText: { fontWeight: "900", color: "#2563EB" },
  content: { flex: 1 },
  pagePad: { padding: 20, paddingBottom: 118 },
  hero: {
    height: 500,
    borderRadius: 36,
    padding: 24,
    justifyContent: "flex-end",
    overflow: "hidden",
    marginBottom: 26,
  },
  heroImage: { borderRadius: 36 },
  heroOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,.42)",
  },
  heroTitle: {
    fontSize: 44,
    lineHeight: 50,
    fontWeight: "900",
    color: "#102033",
  },
  heroCaption: {
    fontSize: 14,
    color: "#344252",
    fontWeight: "700",
    marginTop: 12,
  },
  mainButton: {
    height: 58,
    borderRadius: 24,
    backgroundColor: "#2DD4BF",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    marginTop: 26,
  },
  mainButtonText: { fontWeight: "900", fontSize: 16, color: "#102033" },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "900",
    color: "#102033",
    marginBottom: 12,
  },
  row: { gap: 12, paddingRight: 12 },
  countryChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,.72)",
  },
  countryText: { fontWeight: "900", color: "#102033" },
  destinationCard: {
    width: 240,
    padding: 12,
    borderRadius: 30,
    backgroundColor: "rgba(255,255,255,.78)",
    borderWidth: 1,
    borderColor: "#fff",
  },
  destinationActive: { backgroundColor: "#102033" },
  destinationPhoto: {
    height: 160,
    justifyContent: "flex-end",
    padding: 14,
    overflow: "hidden",
    marginBottom: 12,
  },
  destinationPhotoImage: { borderRadius: 22 },
  destinationShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,.22)",
    borderRadius: 22,
  },
  destinationName: { color: "#fff", fontSize: 23, fontWeight: "900" },
  destinationMeta: {
    color: "rgba(255,255,255,.85)",
    fontWeight: "800",
    marginTop: 3,
  },
  white: { color: "#fff" },
  whiteMuted: { color: "rgba(255,255,255,.75)" },
  cardTitle: { fontSize: 16, fontWeight: "900", color: "#102033" },
  cardMuted: {
    fontSize: 13,
    lineHeight: 20,
    color: "#64748B",
    fontWeight: "700",
    marginTop: 5,
  },
  tiny: { fontSize: 11, color: "#64748B", fontWeight: "700", marginTop: 7 },
  inputCard: {
    height: 58,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,.78)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 12,
  },
  input: { flex: 1, fontWeight: "900", color: "#102033" },
  currency: { fontWeight: "900", color: "#2DD4BF" },
  tempoRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  tempoChip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,.76)",
  },
  tempoActive: { backgroundColor: "#102033" },
  tempoText: { fontWeight: "900", color: "#102033", fontSize: 12 },
  nowCard: {
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    padding: 16,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,.78)",
  },
  darkIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#102033",
    alignItems: "center",
    justifyContent: "center",
  },
  intro: {
    borderRadius: 30,
    padding: 20,
    backgroundColor: "rgba(255,255,255,.78)",
    marginBottom: 18,
  },
  kicker: {
    fontWeight: "900",
    letterSpacing: 1.4,
    color: "#2DD4BF",
    fontSize: 12,
  },
  introTitle: {
    fontSize: 28,
    lineHeight: 33,
    fontWeight: "900",
    color: "#102033",
    marginTop: 6,
  },
  mapCard: {
    height: 360,
    borderRadius: 36,
    overflow: "hidden",
    marginBottom: 20,
  },
  mapImage: { borderRadius: 36 },
  mapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(16,32,51,.28)",
  },
  mapTitle: {
    position: "absolute",
    top: 24,
    alignSelf: "center",
    fontWeight: "900",
    fontSize: 18,
    color: "#fff",
  },
  curve: {
    position: "absolute",
    left: 66,
    top: 82,
    width: 220,
    height: 220,
    borderRadius: 120,
    borderWidth: 5,
    borderColor: "rgba(255,255,255,.82)",
    transform: [{ rotate: "35deg" }],
  },
  pin: {
    position: "absolute",
    width: 19,
    height: 19,
    borderRadius: 10,
    backgroundColor: "#fff",
    borderWidth: 5,
    borderColor: "#2DD4BF",
  },
  mapInfo: { position: "absolute", right: 18, bottom: 24, gap: 12 },
  mapInfoText: { color: "#fff", fontWeight: "900", fontSize: 15 },
  stepCard: {
    flexDirection: "row",
    gap: 12,
    padding: 15,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,.78)",
    marginBottom: 10,
  },
  stepActive: {
    backgroundColor: "#E6FFFC",
    borderWidth: 1,
    borderColor: "#2DD4BF",
  },
  stepDone: { backgroundColor: "#DCFCE7" },
  stepIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E6FFFC",
    alignItems: "center",
    justifyContent: "center",
  },
  stepIconActive: { backgroundColor: "#102033" },
  stepIconDone: { backgroundColor: "#16A34A" },
  timeText: {
    fontSize: 12,
    fontWeight: "900",
    color: "#0F9991",
    marginBottom: 4,
  },
  notice: { fontSize: 12.5, fontWeight: "800", color: "#F97316", marginTop: 7 },
  actions: { flexDirection: "row", gap: 8, flexWrap: "wrap", marginTop: 12 },
  smallButton: {
    paddingHorizontal: 11,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#E6FFFC",
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  smallButtonText: { fontSize: 12, fontWeight: "900", color: "#0F9991" },
  hotelCard: {
    padding: 16,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,.78)",
    marginBottom: 10,
  },
  hotelActive: {
    backgroundColor: "#E6FFFC",
    borderWidth: 1,
    borderColor: "#2DD4BF",
  },
  moneyRow: {
    height: 56,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,.78)",
    paddingHorizontal: 16,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  moneyValue: { fontWeight: "900", color: "#16A34A" },
  placeCard: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    padding: 15,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,.78)",
    marginBottom: 10,
  },
  lightIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E6FFFC",
    alignItems: "center",
    justifyContent: "center",
  },
  circleButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#102033",
    alignItems: "center",
    justifyContent: "center",
  },
  infoCard: {
    flexDirection: "row",
    gap: 12,
    padding: 15,
    borderRadius: 26,
    backgroundColor: "rgba(255,255,255,.78)",
    marginBottom: 10,
  },
  watchCard: {
    borderRadius: 30,
    padding: 20,
    backgroundColor: "#E6FFFC",
    marginBottom: 16,
  },
  watchTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#102033",
    marginTop: 10,
  },
  metrics: { flexDirection: "row", gap: 10, marginBottom: 20 },
  metric: {
    flex: 1,
    minHeight: 136,
    borderRadius: 24,
    backgroundColor: "rgba(255,255,255,.78)",
    padding: 14,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: "900",
    color: "#102033",
    marginTop: 10,
  },
  metricInput: {
    fontSize: 19,
    fontWeight: "900",
    color: "#102033",
    marginTop: 8,
  },
  moods: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 14 },
  mood: {
    minWidth: "47%",
    height: 56,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,.78)",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  moodActive: { backgroundColor: "#102033" },
  moodText: { fontWeight: "900", color: "#102033" },
  tabs: {
    position: "absolute",
    left: 8,
    right: 8,
    bottom: 10,
    minHeight: 70,
    borderRadius: 28,
    backgroundColor: "rgba(255,255,255,.94)",
    flexDirection: "row",
    padding: 6,
  },
  tab: {
    flex: 1,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  tabActive: { backgroundColor: "#102033" },
  tabText: { fontSize: 8, fontWeight: "900", color: "#64748B", marginTop: 3 },
});
