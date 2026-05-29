import type { City, Feeling, Tempo } from "../travel-data";

export type RouteStep = {
  time: string;
  title: string;
  text: string;
  price: string;
  notice: string;
  icon: string;
};

export function buildRoute(city: City, tempo: Tempo): RouteStep[] {
  const base: RouteStep[] = [
    { time: "До вылета", title: "Проверка поездки", text: "Паспорт, бронь, билеты, деньги, powerbank, интернет.", price: "0", notice: "За 3 часа до вылета проверь документы", icon: "airplane" },
    { time: "Прилет", title: city.airport, text: "Паспортный контроль, багаж, SIM/eSIM, немного наличных.", price: "0", notice: "Не меняй всю сумму в аэропорту", icon: "walk" },
    { time: "Аэропорт", title: "SIM и обмен", text: city.exchange, price: city.cash, notice: "Интернет нужен до выхода из аэропорта", icon: "phone-portrait" },
    { time: "Трансфер", title: "Такси до отеля", text: city.transfer, price: "фиксируй", notice: "Сравни цену до посадки", icon: "car" },
    { time: "Check-in", title: "Отель", text: "Сохрани адрес, Wi-Fi, аптеку, магазин и обменник рядом.", price: "0", notice: "Сделай скрин адреса отеля", icon: "bed" },
    { time: "Вечер", title: "Легкий первый вечер", text: "Ужин, короткая прогулка, без перегруза после перелета.", price: "по бюджету", notice: "После 21:00 лучше такси", icon: "moon" },
    { time: "09:00", title: "Старт дня", text: "Завтрак, вода, маршрут, темп поездки.", price: "завтрак", notice: "Выпей воду перед выходом", icon: "cafe" },
    { time: "10:30", title: "Главные места", text: `Must-see точки города ${city.city}.`, price: "средний", notice: "Утром меньше людей", icon: "location" },
    { time: "13:00", title: "Обед", text: "Локальное кафе без туристического сета.", price: "средний", notice: "Пора поесть и отдохнуть", icon: "restaurant" },
    { time: "15:00", title: "Рынок / покупки", text: city.vibe, price: city.cash, notice: "Сравни цены в 3 местах", icon: "bag" },
    { time: "17:30", title: "Фото-точка", text: "Красивый свет, маршрут для Reels, видовая точка.", price: "низкий", notice: "Лучший свет через 30 минут", icon: "camera" },
    { time: "21:00", title: "Возврат в отель", text: "Безопасное завершение дня.", price: "такси", notice: "Не иди пешком в незнакомом районе", icon: "home" },
  ];

  if (tempo === "calm") return base.filter((_, index) => ![9, 10].includes(index));
  return base;
}

export function calcBudget(currency: string, hotel: string, budget: string) {
  const total = Number(budget.replace(/\D/g, "")) || 500;
  const hotelPart = hotel.includes("Airport") ? 0.32 : 0.42;
  return [
    { name: "Отель", value: Math.round(total * hotelPart) },
    { name: "Такси", value: Math.round(total * 0.12) },
    { name: "Еда", value: Math.round(total * 0.18) },
    { name: "Билеты", value: Math.round(total * 0.12) },
    { name: "Покупки", value: Math.round(total * 0.1) },
    { name: "Запас", value: Math.round(total * 0.06) },
  ].map((item) => ({ ...item, formatted: `${item.value.toLocaleString("ru-RU")} ${currency}` }));
}

export function healthAdvice(feeling: Feeling, water: number, pulse: string) {
  const pulseNumber = Number(pulse) || 0;
  if (feeling === "hot") return "Жарко: такси до следующей точки, 500 мл воды, 30 минут в тени или кафе.";
  if (feeling === "tired") return "Усталость: убери 1-2 места, оставь еду и возврат в отель.";
  if (feeling === "headache") return "Головная боль: вода, тень, пауза. Если хуже — аптека или скорая.";
  if (pulseNumber > 105) return "Пульс высокий. Остановись, посиди, выпей воды.";
  if (water < 1.5) return "Мало воды. Цель сегодня 2.2-2.8 л.";
  return "Состояние нормальное, продолжай маршрут с паузами.";
}
