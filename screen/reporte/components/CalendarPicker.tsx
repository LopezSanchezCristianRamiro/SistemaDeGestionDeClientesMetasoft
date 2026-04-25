// components/CalendarPicker.tsx
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
    Modal, Pressable, ScrollView,
    Text, TouchableOpacity, View,
} from "react-native";

const MESES = ["Enero","Febrero","Marzo","Abril","Mayo","Junio","Julio","Agosto","Septiembre","Octubre","Noviembre","Diciembre"];
const MESES_SHORT = ["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];

function fmtShort(iso: string) {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${parseInt(d)} ${MESES_SHORT[parseInt(m)-1]} ${y}`;
}
function toIso(y: number, m: number, d: number) {
  return `${y}-${String(m+1).padStart(2,"0")}-${String(d).padStart(2,"0")}`;
}
function firstOfMonth() { const d = new Date(); d.setDate(1); return d.toISOString().split("T")[0]; }
function lastOfMonth()  { const d = new Date(); d.setMonth(d.getMonth()+1); d.setDate(0); return d.toISOString().split("T")[0]; }
function prevMonthFirst() { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth()-1); return d.toISOString().split("T")[0]; }
function prevMonthLast()  { const d = new Date(); d.setDate(0); return d.toISOString().split("T")[0]; }

interface Props {
  desde: string;
  hasta: string;
  onChange: (desde: string, hasta: string) => void;
}

export function CalendarPicker({ desde, hasta, onChange }: Props) {
  const [visible, setVisible] = useState(false);
  const [viewYear, setViewYear] = useState(new Date().getFullYear());
  const [viewMonth, setViewMonth] = useState(new Date().getMonth());
  // null = esperando primer click, string = primer click hecho
  const [picking, setPicking] = useState<string | null>(null);
  const [tempDesde, setTempDesde] = useState(desde);
  const [tempHasta, setTempHasta] = useState(hasta);

  function open() {
    setTempDesde(desde);
    setTempHasta(hasta);
    setPicking(null);
    const d = desde ? new Date(desde + "T00:00:00") : new Date();
    setViewYear(d.getFullYear());
    setViewMonth(d.getMonth());
    setVisible(true);
  }

  function onDayPress(iso: string) {
    if (picking === null) {
      // primer toque = inicio
      setTempDesde(iso);
      setTempHasta(iso);
      setPicking(iso);
    } else {
      // segundo toque = fin
      if (iso < picking) {
        setTempDesde(iso);
        setTempHasta(picking);
      } else {
        setTempDesde(picking);
        setTempHasta(iso);
      }
      setPicking(null);
    }
  }

  function confirm() {
    onChange(tempDesde, tempHasta);
    setVisible(false);
  }

  function quickSet(d: string, h: string) {
    setTempDesde(d); setTempHasta(h); setPicking(null);
    const pd = new Date(d + "T00:00:00");
    setViewYear(pd.getFullYear()); setViewMonth(pd.getMonth());
  }

  const firstDow = (() => { let d = new Date(viewYear, viewMonth, 1).getDay(); return d === 0 ? 6 : d-1; })();
  const daysInMonth = new Date(viewYear, viewMonth+1, 0).getDate();
  const today = new Date();
  const todayIso = toIso(today.getFullYear(), today.getMonth(), today.getDate());

  const days: (number | null)[] = [
    ...Array(firstDow).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i+1),
  ];

  // Estilo de cada día
  function dayStyle(iso: string) {
    const isDesde = iso === tempDesde;
    const isHasta = iso === tempHasta;
    const inRange = iso > tempDesde && iso < tempHasta;
    const isToday = iso === todayIso;

    if (isDesde || isHasta) return { bg: "#E1007E", text: "#fff", radius: 20 };
    if (inRange) return { bg: "#E0F0FF", text: "#0369A1", radius: 0 };
    if (isToday) return { bg: "transparent", text: "#E1007E", radius: 20 };
    return { bg: "transparent", text: "#374151", radius: 8 };
  }

  const hasRange = tempDesde && tempHasta && tempDesde !== tempHasta;

  return (
    <>
      {/* ── BOTÓN TRIGGER ── */}
      <TouchableOpacity
        onPress={open}
        style={{
          flexDirection: "row", alignItems: "center", gap: 8,
          backgroundColor: "#F8F7FF", borderRadius: 12,
          borderWidth: 1.5, borderColor: "#E0DBFF",
          paddingHorizontal: 14, paddingVertical: 9,
          alignSelf: "flex-start",
        }}
      >
        {/* Ícono calendario SVG-like con View */}
        <Ionicons name="calendar-outline" size={18} color="#7C3AED" />
        <Text style={{ fontSize: 13, fontWeight: "700", color: "#1E0A3C" }}>
          {desde && hasta && desde !== hasta
            ? `${fmtShort(desde)} → ${fmtShort(hasta)}`
            : desde ? fmtShort(desde) : "Calendario"}
        </Text>
      </TouchableOpacity>

      {/* ── MODAL ── */}
      <Modal visible={visible} transparent animationType="fade">
        <Pressable
          style={{ flex:1, backgroundColor:"rgba(0,0,0,0.4)", justifyContent:"center", alignItems:"center" }}
          onPress={() => setVisible(false)}
        >
          <Pressable style={{ backgroundColor:"#fff", borderRadius:24, padding:20, width:340, elevation:12 }} onPress={()=>{}}>

            {/* Header */}
            <View style={{ flexDirection:"row", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
              <Text style={{ fontSize:16, fontWeight:"800", color:"#1E0A3C" }}>Seleccionar período</Text>
              <TouchableOpacity
                onPress={() => setVisible(false)}
                style={{ width:28, height:28, borderRadius:14, backgroundColor:"#F3F4F6", alignItems:"center", justifyContent:"center" }}
              >
                <Text style={{ color:"#6B7280", fontSize:13 }}>✕</Text>
              </TouchableOpacity>
            </View>

            {/* Accesos rápidos */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom:12 }}>
              <View style={{ flexDirection:"row", gap:8 }}>
                {[
                  { label:"Este mes",      d: firstOfMonth(), h: lastOfMonth()   },
                  { label:"Mes anterior",  d: prevMonthFirst(), h: prevMonthLast() },
                  { label:"Este año",      d: `${new Date().getFullYear()}-01-01`, h: `${new Date().getFullYear()}-12-31` },
                ].map(opt => (
                  <TouchableOpacity key={opt.label} onPress={() => quickSet(opt.d, opt.h)}
                    style={{ paddingHorizontal:12, paddingVertical:6, borderRadius:20, backgroundColor:"#F0EEFF" }}>
                    <Text style={{ fontSize:12, color:"#7C3AED", fontWeight:"600" }}>{opt.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </ScrollView>

            {/* Indicador de rango */}
            <View style={{ flexDirection:"row", alignItems:"center", justifyContent:"center", gap:8, marginBottom:14,
              backgroundColor:"#F8F7FF", borderRadius:10, padding:10 }}>
              <View style={{ alignItems:"center" }}>
                <Text style={{ fontSize:9, color:"#9CA3AF", fontWeight:"700", textTransform:"uppercase" }}>Inicio</Text>
                <Text style={{ fontSize:13, fontWeight:"700", color: tempDesde ? "#E1007E" : "#CBD5E1" }}>
                  {tempDesde ? fmtShort(tempDesde) : "—"}
                </Text>
              </View>
              <Text style={{ fontSize:16, color:"#CBD5E1" }}>→</Text>
              <View style={{ alignItems:"center" }}>
                <Text style={{ fontSize:9, color:"#9CA3AF", fontWeight:"700", textTransform:"uppercase" }}>Fin</Text>
                <Text style={{ fontSize:13, fontWeight:"700", color: hasRange ? "#7C3AED" : "#CBD5E1" }}>
                  {hasRange ? fmtShort(tempHasta) : picking ? "Elige fin…" : "—"}
                </Text>
              </View>
            </View>

            {/* Hint */}
            {picking && (
              <Text style={{ fontSize:11, color:"#9CA3AF", textAlign:"center", marginBottom:8 }}>
                Ahora toca el día de fin
              </Text>
            )}

            {/* Nav mes */}
            <View style={{ flexDirection:"row", alignItems:"center", justifyContent:"space-between", marginBottom:10 }}>
              <TouchableOpacity
                onPress={() => { if(viewMonth===0){setViewMonth(11);setViewYear(y=>y-1);}else setViewMonth(m=>m-1); }}
                style={{ width:32, height:32, borderRadius:8, backgroundColor:"#F8F7FF", alignItems:"center", justifyContent:"center" }}
              >
                <Text style={{ color:"#7C3AED", fontSize:18 }}>‹</Text>
              </TouchableOpacity>
              <Text style={{ fontSize:14, fontWeight:"700", color:"#1E0A3C" }}>{MESES[viewMonth]} {viewYear}</Text>
              <TouchableOpacity
                onPress={() => { if(viewMonth===11){setViewMonth(0);setViewYear(y=>y+1);}else setViewMonth(m=>m+1); }}
                style={{ width:32, height:32, borderRadius:8, backgroundColor:"#F8F7FF", alignItems:"center", justifyContent:"center" }}
              >
                <Text style={{ color:"#7C3AED", fontSize:18 }}>›</Text>
              </TouchableOpacity>
            </View>

            {/* Días semana */}
            <View style={{ flexDirection:"row", marginBottom:4 }}>
              {["Lu","Ma","Mi","Ju","Vi","Sa","Do"].map(d => (
                <Text key={d} style={{ flex:1, textAlign:"center", fontSize:10, fontWeight:"700", color:"#9CA3AF" }}>{d}</Text>
              ))}
            </View>

            {/* Grid días */}
            <View style={{ flexDirection:"row", flexWrap:"wrap" }}>
              {days.map((day, i) => {
                if (!day) return <View key={`e-${i}`} style={{ width:"14.28%", height:36 }} />;
                const iso = toIso(viewYear, viewMonth, day);
                const s = dayStyle(iso);
                const isDesde = iso === tempDesde;
                const isHasta = iso === tempHasta;
                const inRange = iso > tempDesde && iso < tempHasta;

                return (
                  <TouchableOpacity
                    key={iso}
                    onPress={() => onDayPress(iso)}
                    style={{
                      width:"14.28%", height:36,
                      alignItems:"center", justifyContent:"center",
                      backgroundColor: inRange ? "#E0F0FF" : "transparent",
                      borderTopLeftRadius: isDesde ? 20 : 0,
                      borderBottomLeftRadius: isDesde ? 20 : 0,
                      borderTopRightRadius: isHasta ? 20 : 0,
                      borderBottomRightRadius: isHasta ? 20 : 0,
                    }}
                  >
                    <View style={{
                      width:30, height:30, borderRadius: s.radius,
                      backgroundColor: s.bg, alignItems:"center", justifyContent:"center",
                    }}>
                      <Text style={{ fontSize:13, fontWeight: isDesde||isHasta ? "700":"400", color: s.text }}>
                        {day}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Botones */}
            <View style={{ flexDirection:"row", gap:10, marginTop:16, paddingTop:14, borderTopWidth:1, borderTopColor:"#F3F4F6" }}>
              <TouchableOpacity onPress={() => setVisible(false)}
                style={{ flex:1, paddingVertical:10, borderRadius:12, borderWidth:1.5, borderColor:"#E5E7EB", alignItems:"center" }}>
                <Text style={{ color:"#6B7280", fontWeight:"600" }}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={confirm}
                style={{ flex:1, paddingVertical:10, borderRadius:12, backgroundColor: tempDesde ? "#E1007E":"#E5E7EB", alignItems:"center" }}>
                <Text style={{ color: tempDesde ? "#fff":"#9CA3AF", fontWeight:"700" }}>Aplicar</Text>
              </TouchableOpacity>
            </View>

          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}