import { StatusBar } from "expo-status-bar";
import React, { useMemo, useState } from "react";
import { Alert, ImageBackground, Linking, Platform, Pressable, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { cities, makeHotels, makeNearby, makePlaces, type City, type Feeling, type Tempo } from "./src/travel-data";
import { buildRoute, calcBudget, healthAdvice } from "./src/logic/planner";

type Tab = "home" | "trip" | "hotels" | "places" | "money" | "body";

type ImageCity = City & { hero?: string; cardImage?: string; mapImage?: string };

const FALLBACK = {
  hero: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80",
  card: "https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?auto=format&fit=crop&w=900&q=80",
  map: "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?auto=format&fit=crop&w=900&q=80",
};

function img(city: ImageCity, kind: "hero" | "card" | "map") {
  if (kind === "hero") return city.hero || FALLBACK.hero;
  if (kind === "card") return city.cardImage || FALLBACK.card;
  return city.mapImage || FALLBACK.map;
}

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

  const city = useMemo(() => ((cities || []) as ImageCity[]).find((item) => item.id === cityId) ?? ((cities || []) as ImageCity[])[0], [cityId]);
  const route = useMemo(() => buildRoute(city, tempo), [city, tempo]);
  const hotels = useMemo(() => makeHotels(city), [city]);
  const places = useMemo(() => makePlaces(city), [city]);
  const nearby = useMemo(() => makeNearby(city), [city]);
  const costs = useMemo(() => calcBudget(city.currency, hotel, budget), [city.currency, hotel, budget]);
  const activeIndex = route.findIndex((_, i) => !done[i]);
  const current = route[activeIndex] ?? route[route.length - 1];
  const progress = Math.round((route.filter((_, i) => done[i]).length / route.length) * 100);

  function pickCity(id: string) {
    const next = ((cities || []) as ImageCity[]).find((x) => x.id === id);
    setCityId(id);
    setDone({});
    if (next) setHotel(`${next.city} Central Stay`);
  }

  if (!city) {
    return <SafeAreaView style={s.safe}><Text style={s.logo}>TripMate</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={s.safe}>
      <StatusBar style="light" />
      <View style={s.app}>
        <Glow />
        <Header city={city} progress={progress} />
        {tab === "home" && <Home city={city} current={current} budget={budget} setBudget={setBudget} tempo={tempo} setTempo={setTempo} pickCity={pickCity} setTab={setTab} />}
        {tab === "trip" && <Trip city={city} route={route} done={done} setDone={setDone} activeIndex={activeIndex} />}
        {tab === "hotels" && <Hotels hotels={hotels} hotel={hotel} setHotel={setHotel} costs={costs} />}
        {tab === "places" && <Places city={city} places={places} />}
        {tab === "money" && <Money city={city} costs={costs} nearby={nearby} />}
        {tab === "body" && <Body water={water} setWater={setWater} pulse={pulse} setPulse={setPulse} pressure={pressure} setPressure={setPressure} feeling={feeling} setFeeling={setFeeling} />}
        <Tabs tab={tab} setTab={setTab} />
      </View>
    </SafeAreaView>
  );
}

function Header({ city, progress }: { city: ImageCity; progress: number }) {
  return <View style={s.header}><View><Text style={s.logo}>TripMate</Text><Text style={s.sub}>{city.emoji} {city.city} · {city.country}</Text></View><View style={s.progress}><Text style={s.progressText}>{progress}%</Text></View></View>;
}

function Home({ city, current, budget, setBudget, tempo, setTempo, pickCity, setTab }: any) {
  const list = ((cities || []) as ImageCity[]).slice(0, 15);
  return <ScrollView style={s.content} contentContainerStyle={s.pad} showsVerticalScrollIndicator={false}>
    <View style={s.heroWrap}>
      <ImageBackground source={{ uri: img(city, "hero") }} style={s.hero} imageStyle={s.heroImg}>
        <View style={s.darkShade} />
        <Text style={s.heroTitle}>Explore.{"\n"}Travel.{"\n"}Inspire.</Text>
        <Text style={s.heroText}>Life is all about journey. Find yours.</Text>
        <Pressable style={s.cta} onPress={() => setTab("trip")}><Text style={s.ctaText}>Get Started</Text><Ionicons name="arrow-forward" size={18} color="#09211F" /></Pressable>
      </ImageBackground>
    </View>

    <Title text="People like" />
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.cardsRow}>{list.map((item) => {
      const active = item.id === city.id;
      return <Pressable key={item.id} style={[s.destCard, active && s.destActive]} onPress={() => pickCity(item.id)}>
        <ImageBackground source={{ uri: img(item, "card") }} style={s.destImg} imageStyle={s.destImgRadius}><View style={s.photoShade}/><Text style={s.destName}>{item.city}</Text><Text style={s.destMeta}>⌖ {item.country}</Text></ImageBackground>
        <Text style={[s.cardTitle, active && s.white]}>{item.city}</Text>
        <Text style={[s.muted, active && s.whiteMuted]} numberOfLines={2}>{item.vibe}</Text>
      </Pressable>;
    })}</ScrollView>

    <Title text="Trip setup" />
    <View style={s.setupCard}><View style={s.inputLine}><Ionicons name="wallet" size={18} color="#2DD4BF"/><TextInput value={budget} onChangeText={setBudget} keyboardType="number-pad" placeholder="Budget" placeholderTextColor="#748191" style={s.input}/><Text style={s.money}>{city.currency}</Text></View><View style={s.chips}>{(["calm","balanced","active","premium"] as Tempo[]).map((x) => <Pressable key={x} onPress={() => setTempo(x)} style={[s.chip, tempo===x && s.chipOn]}><Text style={[s.chipText, tempo===x && s.white]}>{x}</Text></Pressable>)}</View></View>

    <Title text="Next step" />
    <Pressable style={s.next} onPress={() => setTab("trip")}><View style={s.iconDark}><Ionicons name={current.icon as any} size={22} color="#fff"/></View><View style={{flex:1}}><Text style={s.cardTitle}>{current.time} · {current.title}</Text><Text style={s.muted}>{current.notice}</Text></View><Ionicons name="chevron-forward" size={20} color="#7A8795"/></Pressable>
  </ScrollView>;
}

function Trip({ city, route, done, setDone, activeIndex }: any) {
  return <ScrollView style={s.content} contentContainerStyle={s.pad} showsVerticalScrollIndicator={false}>
    <ImageBackground source={{ uri: img(city, "map") }} style={s.map} imageStyle={s.mapImg}><View style={s.mapShade}/><Text style={s.mapTitle}>Destination</Text><View style={s.line}/><Dot top={92} left={72}/><Dot top={165} left={205}/><Dot top={255} left={112}/><View style={s.stats}><Text style={s.stat}>Time{"\n"}2h 34 min</Text><Text style={s.stat}>Distance{"\n"}2.3 km</Text></View></ImageBackground>
    {route.map((r: any, i: number) => { const ok = done[i]; const active = i === activeIndex; return <Pressable key={`${r.time}-${r.title}`} style={[s.step, active && s.stepOn, ok && s.stepDone]} onPress={() => setDone({ ...done, [i]: !ok })}><View style={[s.stepIcon, active && s.stepIconOn, ok && s.stepIconDone]}><Ionicons name={(ok ? "checkmark" : r.icon) as any} size={19} color={active || ok ? "#fff" : "#2DD4BF"}/></View><View style={{flex:1}}><Text style={s.time}>{r.time} · {r.price}</Text><Text style={s.cardTitle}>{r.title}</Text><Text style={s.muted}>{r.text}</Text><Text style={s.notice}>🔔 {r.notice}</Text><View style={s.actions}><Small text="Done" icon="checkmark" onPress={() => setDone({ ...done, [i]: !ok })}/><Small text="Map" icon="map" onPress={() => openMap(`${r.title} ${city.city}`)}/><Small text="Taxi" icon="car" onPress={() => openMap(`${r.title} ${city.city}`)}/></View></View></Pressable>; })}
  </ScrollView>;
}

function Hotels({ hotels, hotel, setHotel, costs }: any) { return <ScrollView style={s.content} contentContainerStyle={s.pad}><Intro title="Hotels before trip" text="Budget, comfort and premium picks with approximate cost." />{hotels.map((h: any) => <Pressable key={h.name} style={[s.panel, hotel===h.name && s.panelOn]} onPress={() => setHotel(h.name)}><Text style={s.cardTitle}>{h.name}</Text><Text style={s.muted}>{h.area} · {h.level} · {h.price}</Text><Text style={s.notice}>Почему: {h.why}</Text></Pressable>)}<Title text="Budget split" />{costs.map((c:any)=><View key={c.name} style={s.moneyRow}><Text style={s.cardTitle}>{c.name}</Text><Text style={s.money}>{c.formatted}</Text></View>)}</ScrollView>; }
function Places({ city, places }: any) { return <ScrollView style={s.content} contentContainerStyle={s.pad}><Intro title="Places to visit" text="Must-see, food, shopping, rest, photo points and evening walk." />{places.map((p:any)=><View key={p.title} style={s.place}><View style={s.iconLight}><Ionicons name={p.icon as any} size={20} color="#2DD4BF"/></View><View style={{flex:1}}><Text style={s.cardTitle}>{p.title}</Text><Text style={s.muted}>{p.type} · {p.duration} · {p.price}</Text><Text style={s.notice}>{p.tip}</Text></View><Pressable style={s.round} onPress={() => openMap(`${p.title} ${city.city}`)}><Ionicons name="navigate" size={18} color="#fff"/></Pressable></View>)}</ScrollView>; }
function Money({ city, costs, nearby }: any) { return <ScrollView style={s.content} contentContainerStyle={s.pad}><Intro title="Money & taxi" text="Exchange, cash, taxi and nearby useful points." /><Info icon="cash" title="Exchange" text={city.exchange}/><Info icon="car" title="Taxi" text={city.transfer}/><Info icon="card" title="Cash" text={city.cash}/>{costs.map((c:any)=><View key={c.name} style={s.moneyRow}><Text style={s.cardTitle}>{c.name}</Text><Text style={s.money}>{c.formatted}</Text></View>)}<Title text="Nearby" />{nearby.map((n:any)=><Info key={n.title} icon={n.icon} title={n.title} text={`${n.text} · ${n.meta}`}/>)}</ScrollView>; }
function Body(p: any) { const moods = [["good","Норм","happy"],["tired","Устал","battery-dead"],["hot","Жарко","sunny"],["headache","Болит","medical"]]; return <ScrollView style={s.content} contentContainerStyle={s.pad}><Intro title="Health & watches" text="Pulse, pressure, water and acclimatization. Watch sync is a next native step."/><View style={s.watch}><Ionicons name="watch" size={38} color="#09211F"/><Text style={s.watchTitle}>Connect watches</Text><Text style={s.muted}>Apple Watch / HealthKit needs dev build. Expo Go is only UI/mock.</Text></View><View style={s.metrics}><Metric title="Water" value={`${p.water.toFixed(1)} л`} icon="water" onPress={() => p.setWater(Math.min(3,p.water+0.25))}/><MetricInput title="Pulse" value={p.pulse} setValue={p.setPulse} icon="heart"/><MetricInput title="Pressure" value={p.pressure} setValue={p.setPressure} icon="fitness"/></View><View style={s.moods}>{moods.map((m)=><Pressable key={m[0]} style={[s.mood, p.feeling===m[0] && s.moodOn]} onPress={()=>p.setFeeling(m[0])}><Ionicons name={m[2] as any} size={18} color={p.feeling===m[0]?"#fff":"#2DD4BF"}/><Text style={[s.moodText,p.feeling===m[0]&&s.white]}>{m[1]}</Text></Pressable>)}</View><Info icon="sparkles" title="Advice" text={healthAdvice(p.feeling,p.water,p.pulse)}/></ScrollView>; }

function Glow(){return <><View style={s.glowA}/><View style={s.glowB}/><View style={s.glowC}/></>}
function Title({text}:{text:string}){return <Text style={s.title}>{text}</Text>}
function Intro({title,text}:any){return <View style={s.intro}><Text style={s.kicker}>TRAVEL APP</Text><Text style={s.introTitle}>{title}</Text><Text style={s.muted}>{text}</Text></View>}
function Dot({top,left}:any){return <View style={[s.dot,{top,left}]}/>}
function Small({text,icon,onPress}:any){return <Pressable style={s.small} onPress={onPress}><Ionicons name={icon} size={14} color="#2DD4BF"/><Text style={s.smallText}>{text}</Text></Pressable>}
function Info({icon,title,text}:any){return <View style={s.place}><View style={s.iconLight}><Ionicons name={icon} size={20} color="#2DD4BF"/></View><View style={{flex:1}}><Text style={s.cardTitle}>{title}</Text><Text style={s.muted}>{text}</Text></View></View>}
function Metric({title,value,icon,onPress}:any){return <Pressable style={s.metric} onPress={onPress}><Ionicons name={icon} size={26} color="#2DD4BF"/><Text style={s.metricValue}>{value}</Text><Text style={s.muted}>{title}</Text></Pressable>}
function MetricInput({title,value,setValue,icon}:any){return <View style={s.metric}><Ionicons name={icon} size={26} color="#F8B454"/><TextInput value={value} onChangeText={setValue} style={s.metricInput}/><Text style={s.muted}>{title}</Text></View>}
function Tabs({tab,setTab}:any){const tabs=[["home","Home","compass"],["trip","Trip","map"],["hotels","Hotel","bed"],["places","Like","camera"],["money","Cash","cash"],["body","Body","watch"]];return <View style={s.tabs}>{tabs.map(t=><Pressable key={t[0]} onPress={()=>setTab(t[0])} style={[s.tab,tab===t[0]&&s.tabOn]}><Ionicons name={t[2] as any} size={17} color={tab===t[0]?"#051B1A":"#B8C3C8"}/><Text style={[s.tabText,tab===t[0]&&s.tabTextOn]}>{t[1]}</Text></Pressable>)}</View>}
function openMap(q:string){const url=Platform.OS==="ios"?`http://maps.apple.com/?q=${encodeURIComponent(q)}`:`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`;Linking.openURL(url).catch(()=>Alert.alert("Карта",q))}

const s=StyleSheet.create({safe:{flex:1,backgroundColor:"#0C2024"},app:{flex:1,backgroundColor:"#0C2024"},glowA:{position:"absolute",width:320,height:320,borderRadius:160,backgroundColor:"rgba(45,212,191,.25)",top:-130,right:-120},glowB:{position:"absolute",width:360,height:360,borderRadius:180,backgroundColor:"rgba(248,180,84,.16)",bottom:-140,left:-170},glowC:{position:"absolute",width:260,height:260,borderRadius:130,backgroundColor:"rgba(82,124,255,.15)",top:240,left:-100},header:{paddingHorizontal:20,paddingTop:12,paddingBottom:10,flexDirection:"row",justifyContent:"space-between",alignItems:"center"},logo:{fontSize:32,fontWeight:"900",color:"#F4FBFA"},sub:{fontSize:13,fontWeight:"800",color:"#9FB0B6"},progress:{width:62,height:42,borderRadius:22,backgroundColor:"rgba(255,255,255,.1)",alignItems:"center",justifyContent:"center",borderWidth:1,borderColor:"rgba(255,255,255,.12)"},progressText:{color:"#2DD4BF",fontWeight:"900"},content:{flex:1},pad:{padding:18,paddingBottom:118},heroWrap:{borderRadius:34,shadowColor:"#000",shadowOpacity:.35,shadowRadius:25,shadowOffset:{width:0,height:18},marginBottom:26},hero:{height:500,borderRadius:34,padding:24,justifyContent:"flex-end",overflow:"hidden"},heroImg:{borderRadius:34},darkShade:{...StyleSheet.absoluteFillObject,backgroundColor:"rgba(0,0,0,.28)"},photoShade:{...StyleSheet.absoluteFillObject,backgroundColor:"rgba(0,0,0,.28)",borderRadius:24},heroTitle:{fontSize:46,lineHeight:52,fontWeight:"900",color:"#F7FBFB",letterSpacing:-1.2},heroText:{color:"rgba(255,255,255,.82)",fontWeight:"800",marginTop:10},cta:{height:58,borderRadius:24,backgroundColor:"#2DD4BF",alignItems:"center",justifyContent:"center",flexDirection:"row",gap:8,marginTop:24},ctaText:{fontSize:16,fontWeight:"900",color:"#09211F"},title:{fontSize:22,fontWeight:"900",color:"#F4FBFA",marginBottom:12},cardsRow:{gap:14,paddingRight:18},destCard:{width:250,borderRadius:30,backgroundColor:"rgba(255,255,255,.08)",padding:12,borderWidth:1,borderColor:"rgba(255,255,255,.12)"},destActive:{backgroundColor:"rgba(45,212,191,.16)",borderColor:"rgba(45,212,191,.45)"},destImg:{height:170,justifyContent:"flex-end",padding:16,marginBottom:12,overflow:"hidden"},destImgRadius:{borderRadius:24},destName:{fontSize:24,fontWeight:"900",color:"#fff"},destMeta:{color:"rgba(255,255,255,.82)",fontWeight:"800",marginTop:4},white:{color:"#fff"},whiteMuted:{color:"rgba(255,255,255,.72)"},cardTitle:{fontSize:16,fontWeight:"900",color:"#F4FBFA"},muted:{fontSize:13,lineHeight:20,color:"#9FB0B6",fontWeight:"700",marginTop:5},setupCard:{borderRadius:26,backgroundColor:"rgba(255,255,255,.08)",padding:14,borderWidth:1,borderColor:"rgba(255,255,255,.1)",marginBottom:24},inputLine:{height:54,borderRadius:20,backgroundColor:"rgba(255,255,255,.09)",flexDirection:"row",alignItems:"center",paddingHorizontal:14,gap:10,marginBottom:12},input:{flex:1,color:"#fff",fontWeight:"900"},money:{color:"#2DD4BF",fontWeight:"900"},chips:{flexDirection:"row",flexWrap:"wrap",gap:8},chip:{paddingHorizontal:12,paddingVertical:9,borderRadius:999,backgroundColor:"rgba(255,255,255,.08)"},chipOn:{backgroundColor:"#2DD4BF"},chipText:{color:"#B8C3C8",fontWeight:"900",fontSize:12},next:{flexDirection:"row",alignItems:"center",gap:12,padding:15,borderRadius:26,backgroundColor:"rgba(255,255,255,.08)",borderWidth:1,borderColor:"rgba(255,255,255,.1)",marginBottom:22},iconDark:{width:46,height:46,borderRadius:23,backgroundColor:"rgba(45,212,191,.22)",alignItems:"center",justifyContent:"center"},map:{height:380,borderRadius:34,overflow:"hidden",marginBottom:20},mapImg:{borderRadius:34},mapShade:{...StyleSheet.absoluteFillObject,backgroundColor:"rgba(3,18,20,.36)"},mapTitle:{position:"absolute",top:24,alignSelf:"center",color:"#fff",fontWeight:"900",fontSize:18},line:{position:"absolute",left:75,top:85,width:225,height:225,borderRadius:130,borderWidth:5,borderColor:"rgba(255,255,255,.78)",transform:[{rotate:"34deg"}]},dot:{position:"absolute",width:20,height:20,borderRadius:10,backgroundColor:"#fff",borderWidth:5,borderColor:"#2DD4BF"},stats:{position:"absolute",right:18,bottom:24,gap:12},stat:{color:"#fff",fontWeight:"900",fontSize:15,backgroundColor:"rgba(3,18,20,.42)",padding:12,borderRadius:18,overflow:"hidden"},step:{flexDirection:"row",gap:12,padding:15,borderRadius:26,backgroundColor:"rgba(255,255,255,.08)",borderWidth:1,borderColor:"rgba(255,255,255,.1)",marginBottom:10},stepOn:{borderColor:"rgba(45,212,191,.45)",backgroundColor:"rgba(45,212,191,.13)"},stepDone:{backgroundColor:"rgba(22,163,74,.18)",borderColor:"rgba(22,163,74,.35)"},stepIcon:{width:40,height:40,borderRadius:20,backgroundColor:"rgba(45,212,191,.14)",alignItems:"center",justifyContent:"center"},stepIconOn:{backgroundColor:"#2DD4BF"},stepIconDone:{backgroundColor:"#16A34A"},time:{fontSize:12,color:"#2DD4BF",fontWeight:"900",marginBottom:4},notice:{fontSize:12.5,color:"#F8B454",fontWeight:"800",marginTop:7},actions:{flexDirection:"row",flexWrap:"wrap",gap:8,marginTop:12},small:{paddingHorizontal:11,paddingVertical:8,borderRadius:999,backgroundColor:"rgba(45,212,191,.13)",flexDirection:"row",alignItems:"center",gap:5},smallText:{fontSize:12,fontWeight:"900",color:"#2DD4BF"},intro:{borderRadius:28,backgroundColor:"rgba(255,255,255,.08)",padding:18,borderWidth:1,borderColor:"rgba(255,255,255,.1)",marginBottom:18},kicker:{fontSize:12,fontWeight:"900",letterSpacing:1.4,color:"#2DD4BF"},introTitle:{fontSize:30,lineHeight:35,fontWeight:"900",color:"#fff",marginTop:7},panel:{borderRadius:26,backgroundColor:"rgba(255,255,255,.08)",padding:16,borderWidth:1,borderColor:"rgba(255,255,255,.1)",marginBottom:10},panelOn:{backgroundColor:"rgba(45,212,191,.14)",borderColor:"rgba(45,212,191,.45)"},moneyRow:{height:56,borderRadius:22,backgroundColor:"rgba(255,255,255,.08)",paddingHorizontal:16,marginBottom:9,flexDirection:"row",alignItems:"center",justifyContent:"space-between"},place:{flexDirection:"row",alignItems:"center",gap:12,borderRadius:26,backgroundColor:"rgba(255,255,255,.08)",padding:15,borderWidth:1,borderColor:"rgba(255,255,255,.1)",marginBottom:10},iconLight:{width:44,height:44,borderRadius:22,backgroundColor:"rgba(45,212,191,.14)",alignItems:"center",justifyContent:"center"},round:{width:42,height:42,borderRadius:21,backgroundColor:"rgba(255,255,255,.12)",alignItems:"center",justifyContent:"center"},watch:{borderRadius:28,padding:18,backgroundColor:"rgba(45,212,191,.16)",borderWidth:1,borderColor:"rgba(45,212,191,.35)",marginBottom:14},watchTitle:{fontSize:24,fontWeight:"900",color:"#fff",marginTop:8},metrics:{flexDirection:"row",gap:10,marginBottom:18},metric:{flex:1,minHeight:132,borderRadius:24,backgroundColor:"rgba(255,255,255,.08)",padding:14,borderWidth:1,borderColor:"rgba(255,255,255,.1)"},metricValue:{fontSize:21,fontWeight:"900",color:"#fff",marginTop:9},metricInput:{fontSize:19,fontWeight:"900",color:"#fff",marginTop:8},moods:{flexDirection:"row",flexWrap:"wrap",gap:10,marginBottom:14},mood:{minWidth:"47%",height:56,borderRadius:20,backgroundColor:"rgba(255,255,255,.08)",alignItems:"center",justifyContent:"center",flexDirection:"row",gap:8},moodOn:{backgroundColor:"rgba(45,212,191,.24)"},moodText:{color:"#B8C3C8",fontWeight:"900"},tabs:{position:"absolute",left:8,right:8,bottom:10,minHeight:70,borderRadius:28,backgroundColor:"rgba(9,26,28,.92)",borderWidth:1,borderColor:"rgba(255,255,255,.12)",flexDirection:"row",padding:6},tab:{flex:1,borderRadius:22,alignItems:"center",justifyContent:"center"},tabOn:{backgroundColor:"#2DD4BF"},tabText:{fontSize:8,fontWeight:"900",color:"#B8C3C8",marginTop:3},tabTextOn:{color:"#051B1A"}});
