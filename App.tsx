import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import { Alert, Linking, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Tab = "setup" | "arrival" | "route" | "money" | "nearby" | "health";
type Feeling = "good" | "tired" | "hot" | "headache";

type Step = { time: string; title: string; text: string; cost: string; icon: keyof typeof Ionicons.glyphMap; tip: string };
type City = {
  id: string;
  name: string;
  country: string;
  emoji: string;
  airport: string;
  currency: string;
  arrivalTip: string;
  transfer: string;
  money: string;
  cash: string;
  buy: string[];
  nearby: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string; meta: string }[];
  route: Step[];
};

const cities: City[] = [
  {
    id: "tashkent",
    name: "Ташкент",
    country: "Узбекистан",
    emoji: "🇺🇿",
    airport: "Tashkent International Airport · TAS",
    currency: "UZS",
    arrivalTip: "Паспортный контроль → багаж → SIM/eSIM → немного наличных → такси до отеля.",
    transfer: "Yandex Go / официальное такси. 60 000–120 000 UZS, обычно 20–35 минут. Не садись к водителю без фиксированной цены.",
    money: "В аэропорту меняй только 50–100$. Основную сумму лучше менять в банке или обменнике в городе.",
    cash: "На день держи 250 000–500 000 UZS наличными: базар, вода, мелкие покупки, такси.",
    buy: ["Сухофрукты", "Специи", "Лепешки", "Керамика", "Чай"],
    nearby: [
      { icon: "cash", title: "Обменник", text: "Основную сумму меняй в городе, не с рук.", meta: "10–15 мин · курс лучше" },
      { icon: "phone-portrait", title: "SIM/eSIM", text: "Интернет нужен для карт и такси.", meta: "аэропорт / ТЦ" },
      { icon: "restaurant", title: "Локальная еда", text: "Плов, шашлык, чай без туристического сета.", meta: "70–150 тыс." },
      { icon: "bag", title: "Чорсу базар", text: "Сухофрукты, специи, лепешки. Торг уместен.", meta: "20–30 мин" },
      { icon: "medkit", title: "Аптека", text: "Вода, пластырь, солнцезащита.", meta: "5–10 мин" },
    ],
    route: [
      { time: "Прилет", title: "Аэропорт TAS", text: "Документы, багаж, связь и немного наличных.", cost: "50–100$", icon: "airplane", tip: "Не меняй всю сумму в аэропорту." },
      { time: "+30 мин", title: "Такси до отеля", text: "Проверь цену в приложении и покажи адрес отеля.", cost: "60–120 тыс.", icon: "car", tip: "Не соглашайся на случайных водителей у выхода." },
      { time: "Заселение", title: "Отель", text: "Сохрани адрес, Wi‑Fi и отметь отель на карте.", cost: "0", icon: "bed", tip: "Сделай скрин адреса отеля офлайн." },
      { time: "Вечер", title: "Легкий ужин", text: "Плов / шашлык / чай, без тяжелого маршрута.", cost: "80–150 тыс.", icon: "restaurant", tip: "В первый вечер не перегружай организм." },
      { time: "09:00", title: "Завтрак и вода", text: "Легкий завтрак, вода с собой, проверка маршрута.", cost: "50–90 тыс.", icon: "cafe", tip: "Возьми бутылку воды до выхода." },
      { time: "10:15", title: "Хазрати Имам", text: "Исторический комплекс и спокойные фото.", cost: "30 тыс.", icon: "location", tip: "Лучший кадр — двор и арки сбоку." },
      { time: "12:15", title: "Чорсу базар", text: "Сухофрукты, специи, лепешки, подарки.", cost: "150–300 тыс.", icon: "bag", tip: "Сравни 3 цены до покупки." },
      { time: "14:00", title: "Обед", text: "Локальное место, где сидят местные.", cost: "80–150 тыс.", icon: "restaurant", tip: "Не садись без меню с ценами." },
      { time: "18:30", title: "Фото-точка", text: "Вечерний свет, Reels, красивые кадры.", cost: "0–50 тыс.", icon: "camera", tip: "Снимай за 30 минут до заката." },
      { time: "21:00", title: "Отель", text: "Безопасный возврат на такси.", cost: "такси", icon: "home", tip: "После 22:00 лучше не ходить пешком в незнакомом районе." },
    ],
  },
  {
    id: "samarkand",
    name: "Самарканд",
    country: "Узбекистан",
    emoji: "🇺🇿",
    airport: "Samarkand International Airport · SKD",
    currency: "UZS",
    arrivalTip: "Самарканд лучше раскрывается в 2 дня: прилет мягко, потом Регистан + базар + Шахи-Зинда.",
    transfer: "Yandex Go / официальное такси. 40 000–90 000 UZS, обычно 15–30 минут.",
    money: "В аэропорту меняй минимум. Для базара и сувениров нужны наличные.",
    cash: "На день держи 300 000–600 000 UZS наличными.",
    buy: ["Самаркандская лепешка", "Сухофрукты", "Керамика", "Специи", "Шелк"],
    nearby: [
      { icon: "cash", title: "Обменник в центре", text: "Лучше курс, чем в аэропорту.", meta: "10–20 мин" },
      { icon: "restaurant", title: "Самаркандский плов", text: "Главная гастро-точка города.", meta: "70–120 тыс." },
      { icon: "bag", title: "Сиабский базар", text: "Лепешки, сладости, специи.", meta: "торг уместен" },
      { icon: "medkit", title: "Аптека", text: "Вода, пластырь, солнцезащита.", meta: "5–10 мин" },
    ],
    route: [
      { time: "Прилет", title: "Аэропорт SKD", text: "Багаж, связь, минимум наличных.", cost: "50–100$", icon: "airplane", tip: "Сохрани адрес отеля заранее." },
      { time: "+25 мин", title: "Отель", text: "Заселение, душ, вода, короткий отдых.", cost: "0", icon: "bed", tip: "Не делай тяжелый маршрут в день прилета." },
      { time: "09:00", title: "Регистан", text: "Главный символ города.", cost: "70 тыс.", icon: "location", tip: "Утром меньше людей и мягче свет." },
      { time: "12:00", title: "Сиабский базар", text: "Лепешки, сухофрукты, сладости.", cost: "150–300 тыс.", icon: "bag", tip: "Сравни цены в дальних рядах." },
      { time: "16:00", title: "Шахи-Зинда", text: "Бирюзовая плитка и фото.", cost: "60 тыс.", icon: "camera", tip: "Снимай вдоль прохода, будет глубина." },
      { time: "21:00", title: "Отель", text: "Возврат безопасно на такси.", cost: "такси", icon: "home", tip: "Поздно лучше не идти пешком." },
    ],
  },
  {
    id: "dubai",
    name: "Дубай",
    country: "ОАЭ",
    emoji: "🇦🇪",
    airport: "Dubai International Airport · DXB",
    currency: "AED",
    arrivalTip: "Дубай требует план по районам: аэропорт → отель → Creek / Mall / Marina по дням.",
    transfer: "Careem / Uber / официальное такси. 70–140 AED, обычно 20–45 минут.",
    money: "Карта работает почти везде. Наличные нужны для рынков Deira.",
    cash: "На день держи 150–300 AED наличными.",
    buy: ["Финики", "Арабские духи", "Шоколад", "Специи", "Подарочные наборы"],
    nearby: [
      { icon: "phone-portrait", title: "SIM/eSIM", text: "Связь для карт и такси.", meta: "аэропорт · от 50 AED" },
      { icon: "cash", title: "Exchange в ТЦ", text: "Надежнее, чем с рук.", meta: "по курсу" },
      { icon: "bag", title: "Dubai Mall", text: "Магазины, еда, фонтаны.", meta: "средне/дорого" },
      { icon: "restaurant", title: "Deira local food", text: "Дешевле, чем у небоскребов.", meta: "25–60 AED" },
    ],
    route: [
      { time: "Прилет", title: "DXB Airport", text: "Паспорт, багаж, SIM/eSIM.", cost: "50–100 AED", icon: "airplane", tip: "Карту лучше подключить сразу." },
      { time: "+45 мин", title: "Отель", text: "Такси / метро, заселение.", cost: "70–140 AED", icon: "bed", tip: "Метро удобно только без тяжелого багажа." },
      { time: "Вечер", title: "Dubai Mall / фонтаны", text: "Легкий вечер без перегруза.", cost: "0–150 AED", icon: "camera", tip: "Фонтаны лучше вечером." },
      { time: "10:00", title: "Dubai Creek", text: "Abra, старый город, рынки.", cost: "5–40 AED", icon: "location", tip: "На рынках спокойно торгуйся." },
      { time: "18:30", title: "Marina / JBR", text: "Вечерняя прогулка и фото.", cost: "0–200 AED", icon: "camera", tip: "Красивый свет после заката." },
    ],
  },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("setup");
  const [cityId, setCityId] = useState("tashkent");
  const [customCity, setCustomCity] = useState("");
  const [hotel, setHotel] = useState("Hotel / адрес отеля");
  const [arrivalTime, setArrivalTime] = useState("14:30");
  const [budget, setBudget] = useState("500");
  const [done, setDone] = useState<Record<number, boolean>>({});
  const [water, setWater] = useState(0.7);
  const [pulse, setPulse] = useState("82");
  const [sleep, setSleep] = useState("7");
  const [feeling, setFeeling] = useState<Feeling>("good");

  const city = useMemo(() => cities.find((x) => x.id === cityId) ?? cities[0], [cityId]);
  const cityName = customCity.trim() || city.name;
  const doneCount = city.route.filter((_, i) => done[i]).length;
  const progress = Math.round((doneCount / city.route.length) * 100);
  const advice = getHealthAdvice(feeling, Number(pulse) || 0, Number(sleep) || 0, water);

  const toggle = (i: number) => setDone((prev) => ({ ...prev, [i]: !prev[i] }));

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar style="dark" />
      <View style={styles.app}>
        <Gradient />
        <Header city={cityName} country={city.country} emoji={city.emoji} progress={progress} />
        {tab === "setup" && <Setup city={city} cityId={cityId} setCityId={setCityId} customCity={customCity} setCustomCity={setCustomCity} hotel={hotel} setHotel={setHotel} arrivalTime={arrivalTime} setArrivalTime={setArrivalTime} budget={budget} setBudget={setBudget} setTab={setTab} />}
        {tab === "arrival" && <Arrival city={city} hotel={hotel} arrivalTime={arrivalTime} setTab={setTab} />}
        {tab === "route" && <Route city={city} done={done} toggle={toggle} />}
        {tab === "money" && <Money city={city} budget={budget} setBudget={setBudget} />}
        {tab === "nearby" && <Nearby city={city} />}
        {tab === "health" && <Health water={water} setWater={setWater} pulse={pulse} setPulse={setPulse} sleep={sleep} setSleep={setSleep} feeling={feeling} setFeeling={setFeeling} advice={advice} />}
        <Tabs active={tab} setActive={setTab} />
      </View>
    </SafeAreaView>
  );
}

function getHealthAdvice(feeling: Feeling, pulse: number, sleep: number, water: number) {
  if (feeling === "headache") return "Вода, тень, пауза 30–40 минут. Если хуже — аптека или помощь.";
  if (feeling === "hot") return "Жарко: сократи пеший маршрут, зайди в кафе/ТЦ, следующую точку лучше на такси.";
  if (feeling === "tired") return "Усталость: убери одну точку, оставь еду и красивое место вечером.";
  if (pulse > 105) return "Пульс высокий. Посиди 10 минут, выпей воды, не иди в жару пешком.";
  if (sleep < 6) return "После перелета мало сна: день должен быть мягким, без длинных прогулок.";
  if (water < 1.5) return "Нужно больше воды. Цель на день: 2.2–2.8 литра.";
  return "Состояние нормальное. Продолжай маршрут, но делай паузу каждые 90 минут.";
}

function Setup(p: { city: City; cityId: string; setCityId: (v: string) => void; customCity: string; setCustomCity: (v: string) => void; hotel: string; setHotel: (v: string) => void; arrivalTime: string; setArrivalTime: (v: string) => void; budget: string; setBudget: (v: string) => void; setTab: (t: Tab) => void }) {
  return <ScrollView style={styles.content} contentContainerStyle={styles.pad}><View style={styles.hero}><Text style={styles.eyebrow}>TRIP OS</Text><Text style={styles.heroTitle}>Турист знает поездку еще до вылета</Text><Text style={styles.heroText}>Аэропорт, трансфер, отель, обмен валюты, точки рядом, маршрут по шагам, здоровье и подсказки как у личного гида.</Text><Pressable style={styles.primary} onPress={() => p.setTab("arrival")}><Text style={styles.primaryText}>Начать с прилета</Text><Ionicons name="airplane" size={20} color="#fff" /></Pressable></View><Section title="Куда летим"><ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>{cities.map((c) => <Pressable key={c.id} style={[styles.cityCard, p.cityId === c.id && styles.cityActive]} onPress={() => { p.setCityId(c.id); p.setCustomCity(""); }}><Text style={styles.cityEmoji}>{c.emoji}</Text><Text style={[styles.cardTitle, p.cityId === c.id && styles.white]}>{c.name}</Text><Text style={[styles.muted, p.cityId === c.id && styles.whiteMuted]}>{c.country}</Text></Pressable>)}</ScrollView><Input icon="search" value={p.customCity} onChange={p.setCustomCity} placeholder="Или введи любой город мира" /></Section><Section title="Данные поездки"><Input icon="bed" value={p.hotel} onChange={p.setHotel} placeholder="Название/адрес отеля" /><View style={styles.two}><Input icon="time" value={p.arrivalTime} onChange={p.setArrivalTime} placeholder="Время" /><Input icon="wallet" value={p.budget} onChange={p.setBudget} placeholder={`Бюджет ${p.city.currency}`} /></View></Section><Section title="Что подготовит"><Info icon="airplane" title="Прилет" text="Паспорт, багаж, SIM, деньги, такси." /><Info icon="car" title="Трансфер" text="Как доехать из аэропорта и сколько платить." /><Info icon="map" title="Маршрут" text="Завершил пункт → приложение ведет к следующему." /><Info icon="heart" title="Организм" text="Вода, пульс, жара, усталость и акклиматизация." /></Section></ScrollView>;
}

function Arrival({ city, hotel, arrivalTime, setTab }: { city: City; hotel: string; arrivalTime: string; setTab: (t: Tab) => void }) {
  const steps = [{ i: "airplane", t: "Посадка", x: `${arrivalTime} · ${city.airport}` }, { i: "id-card", t: "Контроль", x: "Документы и бронь отеля под рукой." }, { i: "bag-handle", t: "Багаж", x: "Проверь чемодан и вещи." }, { i: "phone-portrait", t: "SIM/eSIM", x: "Интернет нужен сразу." }, { i: "cash", t: "Деньги", x: city.money }, { i: "car", t: "Такси", x: city.transfer }, { i: "bed", t: "Отель", x: hotel }];
  return <ScrollView style={styles.content} contentContainerStyle={styles.pad}><Mini title="Прилет без паники" text={city.arrivalTip} tone="blue" />{steps.map((s, idx) => <Timeline key={s.t} icon={s.i as keyof typeof Ionicons.glyphMap} title={s.t} text={s.x} last={idx === steps.length - 1} />)}<Warn text={city.transfer} /><Pressable style={styles.primary} onPress={() => setTab("route")}><Text style={styles.primaryText}>После отеля открыть маршрут</Text><Ionicons name="map" size={20} color="#fff" /></Pressable></ScrollView>;
}

function Route({ city, done, toggle }: { city: City; done: Record<number, boolean>; toggle: (i: number) => void }) {
  const current = city.route.findIndex((_, i) => !done[i]);
  return <ScrollView style={styles.content} contentContainerStyle={styles.pad}><Mini title="Живой маршрут" text="Маршрут теперь как сценарий: завершил один пункт — переходишь к следующему." tone="green" />{city.route.map((s, i) => <Pressable key={i} style={[styles.route, i === current && styles.routeCurrent, done[i] && styles.routeDone]} onPress={() => toggle(i)}><View style={[styles.routeIcon, i === current && styles.iconCurrent, done[i] && styles.iconDone]}><Ionicons name={done[i] ? "checkmark" : s.icon} size={19} color={done[i] || i === current ? "#fff" : "#2563EB"} /></View><View style={{ flex: 1 }}><View style={styles.routeTop}><Text style={styles.time}>{s.time}</Text><Text style={styles.cost}>{s.cost}</Text></View><Text style={styles.cardTitle}>{s.title}</Text><Text style={styles.muted}>{s.text}</Text><Text style={styles.tip}>💡 {s.tip}</Text><View style={styles.actions}><Small title="Готово" icon="checkmark" onPress={() => toggle(i)} /><Small title="Карта" icon="map" onPress={() => openMap(`${s.title} ${city.name}`)} /><Small title="Такси" icon="car" onPress={() => openMap(`${s.title} ${city.name}`)} /></View></View></Pressable>)}</ScrollView>;
}

function Money({ city, budget, setBudget }: { city: City; budget: string; setBudget: (v: string) => void }) { return <ScrollView style={styles.content} contentContainerStyle={styles.pad}><Mini title="Деньги и обмен" text="Сколько менять, где платить картой, где нужны наличные и как не переплатить туристическую цену." tone="green" /><Input icon="wallet" value={budget} onChange={setBudget} placeholder={`Бюджет в ${city.currency}`} /><Info icon="cash" title="Обмен" text={city.money} /><Info icon="card" title="Наличные" text={city.cash} /><Section title="Что купить"><View style={styles.chips}>{city.buy.map((b) => <View key={b} style={styles.chip}><Text style={styles.chipText}>{b}</Text></View>)}</View></Section><Info icon="alert-circle" title="Правило" text="Если цена кажется высокой — не спорь. Сравни 2–3 места и возвращайся." /></ScrollView>; }
function Nearby({ city }: { city: City }) { return <ScrollView style={styles.content} contentContainerStyle={styles.pad}><Mini title="Рядом со мной" text="Обменники, магазины, аптеки, еда, SIM/eSIM и нужные точки рядом." tone="blue" />{city.nearby.map((p) => <View key={p.title} style={styles.nearby}><View style={styles.iconBox}><Ionicons name={p.icon} size={21} color="#2563EB" /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{p.title}</Text><Text style={styles.muted}>{p.text}</Text><Text style={styles.meta}>{p.meta}</Text></View><Pressable style={styles.circle} onPress={() => openMap(`${p.title} ${city.name}`)}><Ionicons name="navigate" size={18} color="#fff" /></Pressable></View>)}</ScrollView>; }
function Health(p: { water: number; setWater: (n: number) => void; pulse: string; setPulse: (v: string) => void; sleep: string; setSleep: (v: string) => void; feeling: Feeling; setFeeling: (f: Feeling) => void; advice: string }) { const moods = [{ id: "good", t: "Норм", i: "happy" }, { id: "tired", t: "Устал", i: "battery-dead" }, { id: "hot", t: "Жарко", i: "sunny" }, { id: "headache", t: "Болит", i: "medical" }]; return <ScrollView style={styles.content} contentContainerStyle={styles.pad}><Mini title="Контроль организма" text="Акклиматизация: вода, пульс, сон, жара и усталость." tone="yellow" /><View style={styles.metrics}><Metric icon="water" title="Вода" value={`${p.water.toFixed(1)} л`} onPress={() => p.setWater(Math.min(3, p.water + 0.25))} /><MetricInput icon="heart" title="Пульс" value={p.pulse} onChange={p.setPulse} /><MetricInput icon="moon" title="Сон" value={p.sleep} onChange={p.setSleep} /></View><Section title="Состояние"><View style={styles.moods}>{moods.map((m) => <Pressable key={m.id} style={[styles.mood, p.feeling === m.id && styles.moodActive]} onPress={() => p.setFeeling(m.id as Feeling)}><Ionicons name={m.i as keyof typeof Ionicons.glyphMap} size={20} color={p.feeling === m.id ? "#fff" : "#2563EB"} /><Text style={[styles.moodText, p.feeling === m.id && styles.moodTextActive]}>{m.t}</Text></Pressable>)}</View></Section><Info icon="sparkles" title="Рекомендация" text={p.advice} /></ScrollView>; }
function Gradient() { return <View pointerEvents="none" style={StyleSheet.absoluteFill}><View style={styles.bg} /><View style={[styles.blob, styles.b1]} /><View style={[styles.blob, styles.b2]} /><View style={[styles.blob, styles.b3]} /></View>; }
function Header({ city, country, emoji, progress }: { city: string; country: string; emoji: string; progress: number }) { return <View style={styles.header}><View><Text style={styles.logo}>TripMate</Text><Text style={styles.sub}>{emoji} {city}, {country}</Text></View><View style={styles.progress}><Text style={styles.progressText}>{progress}%</Text></View></View>; }
function Section({ title, children }: { title: string; children: React.ReactNode }) { return <View style={styles.section}><Text style={styles.sectionTitle}>{title}</Text>{children}</View>; }
function Mini({ title, text, tone }: { title: string; text: string; tone: "blue" | "green" | "yellow" }) { return <View style={[styles.mini, tone === "green" && styles.green, tone === "yellow" && styles.yellow]}><Text style={styles.eyebrow}>TRIP ASSISTANT</Text><Text style={styles.miniTitle}>{title}</Text><Text style={styles.muted}>{text}</Text></View>; }
function Input({ icon, value, onChange, placeholder }: { icon: keyof typeof Ionicons.glyphMap; value: string; onChange: (v: string) => void; placeholder: string }) { return <View style={styles.inputBox}><Ionicons name={icon} size={18} color="#2563EB" /><TextInput value={value} onChangeText={onChange} placeholder={placeholder} placeholderTextColor="#8091A7" style={styles.input} /></View>; }
function Info({ icon, title, text }: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string }) { return <View style={styles.info}><View style={styles.iconBox}><Ionicons name={icon} size={20} color="#2563EB" /></View><View style={{ flex: 1 }}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.muted}>{text}</Text></View></View>; }
function Timeline({ icon, title, text, last }: { icon: keyof typeof Ionicons.glyphMap; title: string; text: string; last: boolean }) { return <View style={styles.timeline}><View style={styles.timelineLeft}><View style={styles.dot}><Ionicons name={icon} size={18} color="#fff" /></View>{!last && <View style={styles.line} />}</View><View style={styles.timelineBody}><Text style={styles.cardTitle}>{title}</Text><Text style={styles.muted}>{text}</Text></View></View>; }
function Warn({ text }: { text: string }) { return <View style={styles.warn}><Ionicons name="alert-circle" size={24} color="#F97316" /><Text style={styles.warnText}>{text}</Text></View>; }
function Small({ title, icon, onPress }: { title: string; icon: keyof typeof Ionicons.glyphMap; onPress: () => void }) { return <Pressable style={styles.small} onPress={onPress}><Ionicons name={icon} size={14} color="#2563EB" /><Text style={styles.smallText}>{title}</Text></Pressable>; }
function Metric({ icon, title, value, onPress }: { icon: keyof typeof Ionicons.glyphMap; title: string; value: string; onPress: () => void }) { return <Pressable style={styles.metric} onPress={onPress}><Ionicons name={icon} size={27} color="#0EA5E9" /><Text style={styles.metricValue}>{value}</Text><Text style={styles.muted}>{title}</Text><Text style={styles.add}>+250 мл</Text></Pressable>; }
function MetricInput({ icon, title, value, onChange }: { icon: keyof typeof Ionicons.glyphMap; title: string; value: string; onChange: (v: string) => void }) { return <View style={styles.metric}><Ionicons name={icon} size={27} color="#EF4444" /><TextInput value={value} onChangeText={onChange} keyboardType="number-pad" style={styles.metricInput} /><Text style={styles.muted}>{title}</Text></View>; }
function Tabs({ active, setActive }: { active: Tab; setActive: (t: Tab) => void }) { const tabs: { id: Tab; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [{ id: "setup", label: "Trip", icon: "sparkles" }, { id: "arrival", label: "Прилет", icon: "airplane" }, { id: "route", label: "День", icon: "map" }, { id: "money", label: "Деньги", icon: "cash" }, { id: "nearby", label: "Рядом", icon: "compass" }, { id: "health", label: "Тело", icon: "heart" }]; return <View style={styles.tabs}>{tabs.map((t) => { const s = active === t.id; return <Pressable key={t.id} style={[styles.tab, s && styles.tabActive]} onPress={() => setActive(t.id)}><Ionicons name={t.icon} size={17} color={s ? "#fff" : "#667085"} /><Text style={[styles.tabText, s && styles.tabTextActive]}>{t.label}</Text></Pressable>; })}</View>; }
function openMap(query: string) { const url = Platform.OS === "ios" ? `http://maps.apple.com/?q=${encodeURIComponent(query)}` : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`; Linking.openURL(url).catch(() => Alert.alert("Карта", query)); }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#EEF8FF" }, app: { flex: 1 }, bg: { ...StyleSheet.absoluteFillObject, backgroundColor: "#EEF8FF" }, blob: { position: "absolute", borderRadius: 999 }, b1: { width: 340, height: 340, top: -120, right: -130, backgroundColor: "rgba(96,165,250,0.35)" }, b2: { width: 300, height: 300, top: 150, left: -130, backgroundColor: "rgba(45,212,191,0.28)" }, b3: { width: 360, height: 360, bottom: -170, right: -120, backgroundColor: "rgba(251,191,36,0.23)" }, header: { paddingHorizontal: 18, paddingTop: Platform.OS === "android" ? 14 : 12, paddingBottom: 12, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }, logo: { fontSize: 30, fontWeight: "900", color: "#102033", letterSpacing: -1.1 }, sub: { fontSize: 13, fontWeight: "800", color: "#53657B", marginTop: 2 }, progress: { minWidth: 58, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.72)", borderWidth: 1, borderColor: "rgba(255,255,255,0.9)", alignItems: "center", justifyContent: "center" }, progressText: { color: "#2563EB", fontWeight: "900" }, content: { flex: 1 }, pad: { paddingHorizontal: 16, paddingBottom: 118 }, hero: { borderRadius: 34, padding: 22, backgroundColor: "rgba(255,255,255,0.78)", borderWidth: 1, borderColor: "rgba(255,255,255,0.9)", shadowColor: "#3B82F6", shadowOpacity: 0.18, shadowRadius: 30, shadowOffset: { width: 0, height: 18 }, marginBottom: 20 }, eyebrow: { color: "#2563EB", fontSize: 12, fontWeight: "900", letterSpacing: 1.2 }, heroTitle: { color: "#102033", fontSize: 34, lineHeight: 39, fontWeight: "900", marginTop: 10, letterSpacing: -1 }, heroText: { color: "#53657B", fontSize: 15, lineHeight: 23, marginTop: 10, fontWeight: "700" }, primary: { minHeight: 56, backgroundColor: "#2563EB", borderRadius: 22, alignItems: "center", justifyContent: "center", flexDirection: "row", gap: 8, marginTop: 16 }, primaryText: { color: "#fff", fontSize: 15, fontWeight: "900" }, section: { marginBottom: 22 }, sectionTitle: { fontSize: 20, fontWeight: "900", color: "#102033", marginBottom: 12 }, row: { gap: 10, paddingRight: 16 }, cityCard: { width: 170, minHeight: 130, padding: 16, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.68)", borderWidth: 1, borderColor: "rgba(255,255,255,0.9)" }, cityActive: { backgroundColor: "#2563EB" }, cityEmoji: { fontSize: 28, marginBottom: 10 }, white: { color: "#fff" }, whiteMuted: { color: "rgba(255,255,255,0.78)" }, cardTitle: { color: "#102033", fontSize: 16, fontWeight: "900" }, muted: { color: "#64748B", fontSize: 13, lineHeight: 20, marginTop: 5, fontWeight: "700" }, inputBox: { minHeight: 54, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.76)", borderWidth: 1, borderColor: "rgba(255,255,255,0.95)", paddingHorizontal: 14, flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 }, input: { flex: 1, color: "#102033", fontWeight: "800", fontSize: 14 }, two: { flexDirection: "row", gap: 10 }, info: { padding: 15, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.74)", borderWidth: 1, borderColor: "rgba(255,255,255,0.95)", flexDirection: "row", gap: 12, marginBottom: 10 }, iconBox: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#DBEAFE", alignItems: "center", justifyContent: "center" }, mini: { borderRadius: 30, padding: 20, backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#BFDBFE", marginBottom: 16 }, green: { backgroundColor: "#ECFDF5", borderColor: "#A7F3D0" }, yellow: { backgroundColor: "#FEF3C7", borderColor: "#FDE68A" }, miniTitle: { color: "#102033", fontSize: 25, lineHeight: 31, fontWeight: "900", marginTop: 8, letterSpacing: -0.6 }, timeline: { flexDirection: "row", gap: 12 }, timelineLeft: { width: 36, alignItems: "center" }, dot: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center" }, line: { width: 3, height: 46, backgroundColor: "rgba(37,99,235,0.18)", marginTop: 6, borderRadius: 2 }, timelineBody: { flex: 1, backgroundColor: "rgba(255,255,255,0.72)", borderWidth: 1, borderColor: "rgba(255,255,255,0.92)", borderRadius: 22, padding: 14, marginBottom: 12 }, warn: { padding: 15, backgroundColor: "#FFF7ED", borderRadius: 24, borderWidth: 1, borderColor: "#FED7AA", flexDirection: "row", gap: 12, marginBottom: 10 }, warnText: { flex: 1, color: "#9A3412", fontWeight: "800", lineHeight: 20 }, route: { flexDirection: "row", gap: 12, padding: 14, borderRadius: 26, backgroundColor: "rgba(255,255,255,0.72)", borderWidth: 1, borderColor: "rgba(255,255,255,0.9)", marginBottom: 10 }, routeCurrent: { borderColor: "#2563EB", backgroundColor: "rgba(219,234,254,0.92)" }, routeDone: { backgroundColor: "rgba(220,252,231,0.9)", borderColor: "#86EFAC" }, routeIcon: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#DBEAFE", alignItems: "center", justifyContent: "center" }, iconCurrent: { backgroundColor: "#2563EB" }, iconDone: { backgroundColor: "#16A34A" }, routeTop: { flexDirection: "row", justifyContent: "space-between", gap: 10 }, time: { color: "#2563EB", fontWeight: "900", fontSize: 13 }, cost: { color: "#0F766E", fontWeight: "900", fontSize: 12 }, tip: { color: "#475569", fontSize: 13, lineHeight: 19, marginTop: 8, fontWeight: "700" }, actions: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 12 }, small: { paddingHorizontal: 11, paddingVertical: 8, borderRadius: 999, backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#BFDBFE", flexDirection: "row", alignItems: "center", gap: 5 }, smallText: { color: "#2563EB", fontWeight: "900", fontSize: 12 }, chips: { flexDirection: "row", flexWrap: "wrap", gap: 8 }, chip: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#E2E8F0", borderRadius: 999, paddingHorizontal: 13, paddingVertical: 9 }, chipText: { color: "#102033", fontWeight: "900" }, nearby: { flexDirection: "row", gap: 12, alignItems: "center", padding: 15, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.74)", borderWidth: 1, borderColor: "rgba(255,255,255,0.95)", marginBottom: 10 }, meta: { color: "#0F766E", fontWeight: "900", fontSize: 12, marginTop: 6 }, circle: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center" }, metrics: { flexDirection: "row", gap: 10, marginBottom: 20 }, metric: { flex: 1, minHeight: 145, padding: 14, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.76)", borderWidth: 1, borderColor: "rgba(255,255,255,0.95)" }, metricValue: { color: "#102033", fontSize: 23, fontWeight: "900", marginTop: 10 }, metricInput: { color: "#102033", fontSize: 23, fontWeight: "900", marginTop: 6, borderBottomWidth: 1, borderBottomColor: "#E2E8F0" }, add: { color: "#2563EB", fontWeight: "900", marginTop: 12 }, moods: { flexDirection: "row", flexWrap: "wrap", gap: 10 }, mood: { flexGrow: 1, minWidth: "45%", minHeight: 56, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.74)", borderWidth: 1, borderColor: "rgba(255,255,255,0.95)", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 }, moodActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" }, moodText: { color: "#102033", fontWeight: "900" }, moodTextActive: { color: "#fff" }, tabs: { position: "absolute", left: 8, right: 8, bottom: 10, minHeight: 70, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.9)", borderWidth: 1, borderColor: "rgba(255,255,255,0.95)", flexDirection: "row", padding: 6, shadowColor: "#2563EB", shadowOpacity: 0.18, shadowRadius: 22, shadowOffset: { width: 0, height: 10 } }, tab: { flex: 1, borderRadius: 22, alignItems: "center", justifyContent: "center", paddingVertical: 8 }, tabActive: { backgroundColor: "#2563EB" }, tabText: { color: "#667085", fontSize: 8.5, fontWeight: "900", marginTop: 3 }, tabTextActive: { color: "#fff" },
});
