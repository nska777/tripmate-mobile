export type City = {
  id: string;
  country: string;
  emoji: string;
  city: string;
  airport: string;
  currency: string;
  cash: string;
  transfer: string;
  exchange: string;
  vibe: string;
  hero?: string;
  cardImage?: string;
  mapImage?: string;
};

export type Tempo = "calm" | "balanced" | "active" | "premium";
export type Feeling = "good" | "tired" | "hot" | "headache";
export type TabKey = "flow" | "arrival" | "hotel" | "routes" | "places" | "nearby" | "health" | "sos";

export type Hotel = { name: string; area: string; level: string; price: string; why: string };
export type Place = { title: string; type: string; duration: string; price: string; bestTime: string; tip: string; warning: string; icon: string };
export type DayStep = { time: string; title: string; text: string; move: string; price: string; notification: string; icon: string };
export type NearbyPoint = { icon: string; title: string; text: string; meta: string };

const IMG = {
  mountain: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=1200&q=80",
  beach: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  desert: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
  city: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1200&q=80",
  asia: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
};

export const cities: City[] = [
  { id: "tashkent", country: "Узбекистан", emoji: "🇺🇿", city: "Ташкент", airport: "TAS · Tashkent International", currency: "UZS", cash: "250 000–500 000 UZS", transfer: "Yandex Go / официальное такси · 60 000–120 000 UZS · 20–35 мин", exchange: "В аэропорту меняй только небольшую сумму, основную сумму — в банке или обменнике в городе.", vibe: "базары, плов, парки, современный город", hero: IMG.desert, cardImage: IMG.city, mapImage: IMG.mountain },
  { id: "samarkand", country: "Узбекистан", emoji: "🇺🇿", city: "Самарканд", airport: "SKD · Samarkand International", currency: "UZS", cash: "300 000–600 000 UZS", transfer: "Yandex Go · 40 000–90 000 UZS · 15–30 мин", exchange: "Меняй минимум в аэропорту, наличные нужны для базара и сувениров.", vibe: "Регистан, Сиаб, Шахи-Зинда, сладости", hero: IMG.mountain, cardImage: IMG.desert, mapImage: IMG.city },
  { id: "bukhara", country: "Узбекистан", emoji: "🇺🇿", city: "Бухара", airport: "BHK · Bukhara International", currency: "UZS", cash: "250 000–500 000 UZS", transfer: "Такси · 35 000–80 000 UZS · 15–25 мин", exchange: "Лучше менять в центре возле старого города.", vibe: "старый город, ремесла, минареты", hero: IMG.city, cardImage: IMG.desert, mapImage: IMG.mountain },
  { id: "khiva", country: "Узбекистан", emoji: "🇺🇿", city: "Хива", airport: "UGC · Urgench Airport", currency: "UZS", cash: "250 000–450 000 UZS", transfer: "Такси из Ургенча · 120 000–220 000 UZS · 40–55 мин", exchange: "Часть денег держи наличными внутри Ичан-Калы.", vibe: "Ичан-Кала, крепостные стены, ремесла", hero: IMG.desert, cardImage: IMG.city, mapImage: IMG.desert },
  { id: "dubai", country: "ОАЭ", emoji: "🇦🇪", city: "Дубай", airport: "DXB · Dubai International", currency: "AED", cash: "150–300 AED", transfer: "Careem / Uber / Taxi · 70–140 AED · 20–45 мин", exchange: "Карта почти везде, наличные нужны для рынков Deira.", vibe: "небоскребы, моллы, Marina, Creek", hero: IMG.desert, cardImage: IMG.beach, mapImage: IMG.city },
  { id: "abu-dhabi", country: "ОАЭ", emoji: "🇦🇪", city: "Абу-Даби", airport: "AUH · Zayed International", currency: "AED", cash: "150–300 AED", transfer: "Taxi / Careem · 80–180 AED · 25–50 мин", exchange: "Основные платежи картой, наличные для рынков и такси.", vibe: "мечеть, Louvre, острова, пляжи", hero: IMG.beach, cardImage: IMG.desert, mapImage: IMG.city },
  { id: "istanbul", country: "Турция", emoji: "🇹🇷", city: "Стамбул", airport: "IST · Istanbul Airport", currency: "TRY", cash: "1 000–2 500 TRY", transfer: "Havaist / Taxi · 45–90 мин", exchange: "Не меняй у случайных людей, смотри комиссию.", vibe: "Айя-София, Босфор, базары, уличная еда", hero: IMG.city, cardImage: IMG.beach, mapImage: IMG.mountain },
  { id: "antalya", country: "Турция", emoji: "🇹🇷", city: "Анталья", airport: "AYT · Antalya Airport", currency: "TRY", cash: "1 000–2 000 TRY", transfer: "Taxi / tram · 25–45 мин", exchange: "Карта и наличные вместе, на рынках нужен cash.", vibe: "море, старый город, водопады, пляжи", hero: IMG.beach, cardImage: IMG.desert, mapImage: IMG.beach },
  { id: "almaty", country: "Казахстан", emoji: "🇰🇿", city: "Алматы", airport: "ALA · Almaty International", currency: "KZT", cash: "10 000–25 000 KZT", transfer: "Yandex Go · 4 000–8 000 KZT · 25–45 мин", exchange: "Карта удобна, cash для базара и мелких покупок.", vibe: "горы, кофе, Кок-Тобе, парки", hero: IMG.mountain, cardImage: IMG.mountain, mapImage: IMG.mountain },
  { id: "astana", country: "Казахстан", emoji: "🇰🇿", city: "Астана", airport: "NQZ · Astana International", currency: "KZT", cash: "10 000–25 000 KZT", transfer: "Yandex Go · 3 500–7 000 KZT · 20–40 мин", exchange: "Карта удобна, наличные на мелочи.", vibe: "архитектура, набережная, музеи", hero: IMG.city, cardImage: IMG.mountain, mapImage: IMG.city },
  { id: "paris", country: "Франция", emoji: "🇫🇷", city: "Париж", airport: "CDG · Charles de Gaulle", currency: "EUR", cash: "50–120 EUR", transfer: "RER / Taxi / Uber · 45–75 мин", exchange: "Лучше карта, наличные только на мелочи.", vibe: "Лувр, Эйфелева башня, Монмартр", hero: IMG.city, cardImage: IMG.city, mapImage: IMG.mountain },
  { id: "rome", country: "Италия", emoji: "🇮🇹", city: "Рим", airport: "FCO · Fiumicino", currency: "EUR", cash: "50–120 EUR", transfer: "Train / Taxi · 35–60 мин", exchange: "Карта почти везде, cash для кафе и рынков.", vibe: "Колизей, Ватикан, паста, фонтаны", hero: IMG.city, cardImage: IMG.desert, mapImage: IMG.city },
  { id: "barcelona", country: "Испания", emoji: "🇪🇸", city: "Барселона", airport: "BCN · El Prat", currency: "EUR", cash: "50–100 EUR", transfer: "Aerobus / Taxi · 30–45 мин", exchange: "Береги телефон в туристических местах.", vibe: "Гауди, море, tapas, прогулки", hero: IMG.beach, cardImage: IMG.city, mapImage: IMG.beach },
  { id: "london", country: "Великобритания", emoji: "🇬🇧", city: "Лондон", airport: "LHR · Heathrow", currency: "GBP", cash: "40–100 GBP", transfer: "Elizabeth line / Tube / Taxi", exchange: "Карта почти везде, наличные редко нужны.", vibe: "музеи, парки, шопинг, районы", hero: IMG.city, cardImage: IMG.mountain, mapImage: IMG.city },
  { id: "new-york", country: "США", emoji: "🇺🇸", city: "Нью-Йорк", airport: "JFK · John F. Kennedy", currency: "USD", cash: "80–200 USD", transfer: "AirTrain / Uber / Taxi · 45–90 мин", exchange: "Карта основная, cash для tips и мелочей.", vibe: "Times Square, Central Park, музеи, rooftop", hero: IMG.city, cardImage: IMG.mountain, mapImage: IMG.city },
  { id: "tokyo", country: "Япония", emoji: "🇯🇵", city: "Токио", airport: "HND/NRT · Tokyo Airports", currency: "JPY", cash: "10 000–20 000 JPY", transfer: "Train / Limousine bus / Taxi", exchange: "Наличные полезны, IC card для транспорта.", vibe: "Shibuya, храмы, еда, технологии", hero: IMG.asia, cardImage: IMG.asia, mapImage: IMG.mountain },
  { id: "seoul", country: "Южная Корея", emoji: "🇰🇷", city: "Сеул", airport: "ICN · Incheon", currency: "KRW", cash: "50 000–150 000 KRW", transfer: "AREX / bus / taxi", exchange: "Карта удобна, cash для рынков.", vibe: "дворцы, K-style, рынки, кафе", hero: IMG.asia, cardImage: IMG.city, mapImage: IMG.asia },
  { id: "bangkok", country: "Таиланд", emoji: "🇹🇭", city: "Бангкок", airport: "BKK · Suvarnabhumi", currency: "THB", cash: "1 500–4 000 THB", transfer: "Airport Rail Link / Grab / Taxi", exchange: "Меняй в надежных обменниках, cash нужен часто.", vibe: "храмы, street food, рынки, rooftop", hero: IMG.beach, cardImage: IMG.asia, mapImage: IMG.desert },
  { id: "singapore", country: "Сингапур", emoji: "🇸🇬", city: "Сингапур", airport: "SIN · Changi", currency: "SGD", cash: "50–150 SGD", transfer: "MRT / Grab / Taxi", exchange: "Карта почти везде, cash для hawker centers.", vibe: "Marina Bay, сады, еда, чистый город", hero: IMG.city, cardImage: IMG.asia, mapImage: IMG.beach },
  { id: "doha", country: "Катар", emoji: "🇶🇦", city: "Доха", airport: "DOH · Hamad International", currency: "QAR", cash: "100–300 QAR", transfer: "Metro / Karwa / Uber", exchange: "Карта удобна, cash для Souq Waqif.", vibe: "Souq Waqif, музеи, набережная", hero: IMG.desert, cardImage: IMG.city, mapImage: IMG.desert },
];

// Alias for newer architecture files. This prevents runtime crashes when App.tsx imports travelCities instead of cities.
export const travelCities = cities;

export function makeHotels(city: City): Hotel[] {
  return [
    { name: `${city.city} Central Stay`, area: "центр / рядом с маршрутом", level: "Комфорт", price: "средний", why: "меньше такси, проще вернуться вечером" },
    { name: `${city.city} Old Town Boutique`, area: "старый город / исторический район", level: "Атмосферный", price: "средний+", why: "лучше для прогулок и фото" },
    { name: `${city.city} Premium View`, area: "лучший район / видовая зона", level: "Premium", price: "выше", why: "красивее, безопаснее, удобнее для первого раза" },
    { name: `${city.city} Airport Smart Hotel`, area: "возле аэропорта", level: "Практичный", price: "ниже", why: "для позднего прилета или раннего вылета" },
  ];
}

export function makePlaces(city: City): Place[] {
  return [
    { title: `Главная площадь ${city.city}`, type: "must-see", duration: "60–90 мин", price: "часто бесплатно", bestTime: "утро", tip: "сначала осмотр, потом фото сбоку", warning: "не покупай сувениры в первой лавке", icon: "location" },
    { title: "Исторический центр", type: "культура", duration: "90 мин", price: "низкий/средний", bestTime: "10:00–12:00", tip: "иди после завтрака", warning: "следи за телефоном в толпе", icon: "business" },
    { title: "Локальный рынок", type: "покупки", duration: "60–120 мин", price: "по бюджету", bestTime: "до обеда", tip: "сравни 3 цены", warning: "не показывай крупные купюры", icon: "bag" },
    { title: "Локальное кафе", type: "еда", duration: "45–70 мин", price: "средний", bestTime: "13:00–15:00", tip: "садись там, где есть меню", warning: "избегай сетов без цены", icon: "restaurant" },
    { title: "Парк / набережная", type: "отдых", duration: "40–80 мин", price: "бесплатно", bestTime: "после обеда", tip: "идеально для восстановления", warning: "в жару иди в тень", icon: "leaf" },
    { title: "Смотровая / фото-точка", type: "фото", duration: "45–70 мин", price: "низкий/средний", bestTime: "закат", tip: "лучший кадр за 30 минут до заката", warning: "не рискуй ради фото", icon: "camera" },
    { title: "Музей города", type: "музей", duration: "70–120 мин", price: "средний", bestTime: "11:00–14:00", tip: "выбирай один главный музей", warning: "проверь правила фото", icon: "library" },
    { title: "Вечерняя улица", type: "вечер", duration: "60–90 мин", price: "по бюджету", bestTime: "19:00–21:00", tip: "сними огни и витрины", warning: "после 22:00 лучше такси", icon: "moon" },
  ];
}

export function makeNearby(city: City): NearbyPoint[] {
  return [
    { icon: "cash", title: "Обмен валюты", text: city.exchange, meta: "сравни курс и комиссию" },
    { icon: "phone-portrait", title: "SIM / eSIM", text: "Интернет нужен до выхода из аэропорта и для такси.", meta: "аэропорт / ТЦ" },
    { icon: "restaurant", title: "Еда рядом", text: "Локальные места лучше туристических сетов.", meta: "проверь меню с ценами" },
    { icon: "bag", title: "Магазин / рынок", text: city.vibe, meta: "торг уместен на рынках" },
    { icon: "medkit", title: "Аптека", text: "Вода, пластырь, солнцезащита, базовые лекарства.", meta: "первый день после прилета" },
    { icon: "car", title: "Такси", text: city.transfer, meta: "фиксируй цену до посадки" },
  ];
}
