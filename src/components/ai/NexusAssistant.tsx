"use client";

import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Bot, X, Send, ChevronRight, Calculator, StickyNote, ArrowLeft, Trash2, Zap, 
  LayoutDashboard, Car, Wrench, Users, Package, Sparkles, GraduationCap 
} from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner"; 
import { getCountryConfig } from "@/config/localization"; 

// ==========================================
// 1. CONFIGURACIÓN Y ESTILOS
// ==========================================

const THEME = {
  primary: "bg-orange-600 hover:bg-orange-700",
  secondary: "bg-slate-900 text-white",
  accent: "text-orange-500",
  botBubble: "bg-white text-slate-700 border border-slate-100 rounded-tl-none shadow-sm",
  userBubble: "bg-linear-to-br from-orange-500 to-red-600 text-white rounded-tr-none shadow-md",
};

const STYLES = {
  chipAction: "h-10 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all active:scale-95 shadow-sm border border-orange-100 bg-orange-50 text-orange-800 hover:bg-orange-100 hover:border-orange-300 w-full cursor-pointer",
  chipTool: "h-8 px-3 rounded-lg text-[11px] font-medium flex items-center gap-1.5 transition-all bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 cursor-pointer",
  chipHelp: "h-10 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all bg-indigo-50 border border-indigo-100 text-indigo-700 hover:bg-indigo-100 hover:border-indigo-200 w-full cursor-pointer",
  scrollContainer: "flex gap-2 overflow-x-auto pb-2 w-full scrollbar-hide snap-x",
};

// ==========================================
// 2. DEFINICIÓN DE TIPOS
// ==========================================

type BotMode = "chat" | "calculator" | "notes";

interface Intent {
  id: string;
  keywords: string[]; 
  exactPhrases?: string[]; 
  responses: string[]; 
  link?: string;
  buttonText?: string;
  icon?: React.ElementType;
}

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
  actionLink?: string;
  actionLabel?: string;
  icon?: React.ElementType;
  timestamp: number;
}

interface Props {
  slug: string;
  userName?: string;
  countryCode?: string;
  taxRate?: number; // Recibimos el IVA desde la BD
}

// ==========================================
// 3. BASE DE CONOCIMIENTO
// ==========================================

const RAW_KNOWLEDGE_BASE: Intent[] = [
  {
    id: "dashboard",
    keywords: ["inicio", "dashboard", "resumen", "casa", "home", "estadisticas", "numeros", "ventas", "volver", "principal", "metricas"],
    exactPhrases: ["ir al inicio", "ver resumen"],
    responses: [
      "¡Volvamos al cuartel general! 🏠 Aquí tienes el resumen de operaciones.",
      "Claro, te llevo al Inicio para que revises las métricas clave.",
      "Entendido. Abriendo el Dashboard principal."
    ],
    link: "/dashboard",
    buttonText: "Ir al Inicio",
    icon: LayoutDashboard
  },
  {
    id: "vehicles",
    keywords: ["vehiculo", "vehículo", "auto", "moto", "camioneta", "flota", "patente", "crear auto", "nuevo auto", "ver autos", "mis vehiculos", "mis vehículos", "parque"],
    exactPhrases: ["ver flota", "buscar auto"],
    responses: [
      "Gestión de flota. 🚘 Aquí tienes el control de todos los vehículos.",
      "¿Buscas un auto en particular? Vamos al listado de Vehículos.",
      "Parque automotriz. 🚙 Crea, edita o busca vehículos aquí."
    ],
    link: "/vehicles",
    buttonText: "Ver Vehículos",
    icon: Car
  },
  {
    id: "create_order",
    keywords: ["orden", "trabajo", "ingresar", "taller", "recepcion", "recepción", "reparacion", "servicio", "ot", "ticket", "entrada"],
    exactPhrases: ["nueva orden", "crear orden", "ingresar vehiculo"],
    responses: [
      "¡Manos a la obra! 🛠️ Vamos a ingresar una nueva Orden de Trabajo.",
      "Registremos ese servicio. Abriendo formulario de ingreso.",
      "Gestión de trabajos. 📝 Crea una nueva orden aquí."
    ],
    link: "/orders",
    buttonText: "Crear Orden",
    icon: Wrench
  },
  {
    id: "order_details_help",
    keywords: ["presupuesto", "cotizacion", "repuesto", "insumo", "mano de obra", "editar orden", "modificar orden", "ojo", "detalle", "items", "servicios"],
    exactPhrases: ["como edito", "agregar repuesto", "ver presupuesto"],
    responses: [
      "Para gestionar el Presupuesto (repuestos y mano de obra), debes ir al listado y hacer clic en el **OJO (👁️)** de la orden correspondiente.",
      "Todo lo relacionado con ítems y costos se maneja dentro del detalle de la orden. Busca el ícono del **OJO (👁️)**.",
      "¡Es fácil! Ve a Órdenes, busca la fila y dale al **OJO (👁️)** para cargar el presupuesto."
    ],
    link: "/orders",
    buttonText: "Ir a Órdenes",
    icon: GraduationCap
  },
  {
    id: "clients",
    keywords: ["cliente", "dueño", "contacto", "crear cliente", "nuevo cliente", "rut", "persona", "usuarios", "propietario", "dni", "cuit", "rfc", "nif"],
    responses: [
      "Tu cartera de clientes. 👥 Gestiona o crea nuevos contactos.",
      "Base de datos de personas. 📒 ¿Necesitas buscar a alguien?",
      "Acceso directo a la agenda de Clientes."
    ],
    link: "/customers",
    buttonText: "Ver Clientes",
    icon: Users
  },
  {
    id: "inventory",
    keywords: ["stock", "precio", "inventario", "repuesto", "producto", "insumo", "bodega", "materiales", "existencias"],
    responses: [
      "El corazón del taller 📦. Revisa stock, precios y existencias.",
      "Control de bodega. ¿Qué repuesto necesitamos buscar?",
      "Accede al inventario completo de productos y servicios."
    ],
    link: "/inventory",
    buttonText: "Ir a Inventario",
    icon: Package
  },
  {
    id: "settings",
    keywords: ["configurar", "taller", "logo", "nombre", "iva", "datos", "empresa", "ajustes", "parametros", "impuesto"],
    responses: [
      "Zona de administración. ⚙️ Configura los datos de tu empresa.",
      "Ajustes del sistema. 🔧 Edita la información de tu taller aquí.",
    ],
    link: "/settings/catalog",
    buttonText: "Configuración",
    icon: Zap
  },
  // --- INTENCIONES SOCIALES ---
  {
    id: "greeting",
    keywords: ["hola", "buenas", "que tal", "hello", "hi", "saludos"],
    responses: [
      "¡Hola! 👋 ¿En qué puedo ayudarte hoy?",
      "¡Buenas! Aquí NexusBot listo para trabajar. 🍊",
      "¡Hola colega! ¿Qué gestionamos hoy?"
    ]
  },
  {
    id: "thanks",
    keywords: ["gracias", "grasia", "te pasaste", "vale", "thanks", "excelente", "buena"],
    responses: [
      "¡De nada! Para eso estamos. 🦾",
      "¡Un placer ayudarte! 🚀",
      "A la orden. Cualquier otra cosa, avísame."
    ]
  },
  {
    id: "insult_filter",
    keywords: ["tonto", "inutil", "bobo", "estupido", "malo"],
    responses: [
      "Estoy aprendiendo cada día para ser mejor. 🥺 Intenta preguntarme por 'Órdenes' o 'Inventario'.",
      "Mis circuitos hacen lo mejor que pueden. 🤖 ¿Probamos buscando una patente?",
      "Vaya, lamento no haber sido de ayuda. Intenta usar los botones de abajo."
    ]
  }
];

// ==========================================
// 4. UTILITIES & ALGORITHMS
// ==========================================

const levenshteinDistance = (a: string, b: string): number => {
  const matrix = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) == a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }
  return matrix[b.length][a.length];
};

const calculateSimilarity = (s1: string, s2: string): number => {
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  if (longer.length === 0) return 1.0;
  return (longer.length - levenshteinDistance(longer, shorter)) / longer.length;
};

const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

const getSafeUrl = (baseSlug: string, path?: string) => {
  if (!path || path === "/" || path === "") return `/${baseSlug}`; 
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `/${baseSlug}${cleanPath}`;
};

// ==========================================
// 5. COMPONENTE PRINCIPAL
// ==========================================

export function NexusAssistant({ slug, userName = "Colega", countryCode = "CL", taxRate = 19 }: Props) {
  // --- ESTADOS ---
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<BotMode>("chat");
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Configuración Regional
  const countryConfig = getCountryConfig(countryCode);
  
  // Herramientas
  const [calcAmount, setCalcAmount] = useState("");
  const [calcResult, setCalcResult] = useState<{net: number, tax: number, total: number} | null>(null);
  const [note, setNote] = useState("");
  const [savedNotes, setSavedNotes] = useState<string[]>([]);

  // Refs y Hooks
  const router = useRouter();
  const pathname = usePathname();
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // --- INICIALIZACIÓN ---
  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 12) return "¡Buenos días";
    if (hour < 20) return "¡Buenas tardes";
    return "¡Buenas noches";
  }, []);

  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "init", 
      role: "bot", 
      text: `${greeting} ${userName}! 🍊\nSoy NexusBot v12.1 (${countryConfig.name}).\n\nEstoy conectado a tu taller. ¿Qué necesitas gestionar hoy?`,
      timestamp: Date.now()
    }
  ]);

  // Cargar/Guardar Notas
  useEffect(() => {
    const saved = localStorage.getItem(`nexus_notes_${slug}`);
    if (saved) {
        try { setSavedNotes(JSON.parse(saved)); } catch (e) { console.error("Error parsing notes", e); }
    }
  }, [slug]);

  useEffect(() => {
    if (savedNotes.length > 0) {
        localStorage.setItem(`nexus_notes_${slug}`, JSON.stringify(savedNotes));
    }
  }, [savedNotes, slug]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isTyping, mode, isOpen]);

  // Focus input al abrir
  useEffect(() => {
    if (isOpen && mode === 'chat') {
        setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, mode]);

  // --- LÓGICA DEL BOT (THE BRAIN) ---
  const processUserMessage = useCallback((text: string) => {
    const lowerText = text.trim().toLowerCase();
    setIsTyping(true);

    const thinkingTime = Math.floor(Math.random() * 400) + 400;

    setTimeout(() => {
      let matchedIntent: Intent | null = null;
      let maxScore = 0;
      let responseMsg: Message | null = null;

      // 1. DETECCIÓN DE PATRONES ESPECÍFICOS (Regex)
      
      // Herramientas
      if (lowerText.includes("calculadora") || lowerText.includes("calcular")) {
        setMessages(prev => [...prev, { id: generateId(), role: "bot", text: "🧮 Abriendo calculadora rápida...", timestamp: Date.now() }]);
        setMode("calculator");
        setIsTyping(false);
        return;
      }
      if (lowerText.includes("nota") || lowerText.includes("apunte")) {
        setMessages(prev => [...prev, { id: generateId(), role: "bot", text: "📝 Abriendo bloc de notas...", timestamp: Date.now() }]);
        setMode("notes");
        setIsTyping(false);
        return;
      }

      // Patentes
      const plateRegex = /[a-z]{2,4}[-]?[0-9]{2,4}/i;
      const potentialPlate = lowerText.match(plateRegex);
      if (potentialPlate && potentialPlate[0].length <= 8 && lowerText.length < 20) {
         const cleanPlate = potentialPlate[0].toUpperCase().replace(/[^A-Z0-9]/g, "");
         responseMsg = {
            id: generateId(), role: "bot",
            text: `🔎 He detectado una patente: **${cleanPlate}**. \n¿Quieres buscar su historial?`,
            actionLink: getSafeUrl(slug, `/orders?query=${cleanPlate}`),
            actionLabel: "Buscar en Órdenes",
            icon: Car,
            timestamp: Date.now()
         };
      }

      // IDENTIFICACIÓN FISCAL (Adaptado al país)
      const taxIdRegex = /(\d{1,3}(?:\.\d{1,3}){2}-[\dkK])|(\d{7,11})|(\d{2}-\d{8}-\d{1})/;
      const potentialTaxId = lowerText.match(taxIdRegex);
      
      if (!responseMsg && potentialTaxId) {
         const taxLabel = countryConfig.taxIdLabel;
         responseMsg = {
            id: generateId(), role: "bot",
            text: `👤 He detectado un ${taxLabel}: **${potentialTaxId[0]}**. \n¿Buscamos a este cliente?`,
            actionLink: getSafeUrl(slug, `/customers?query=${potentialTaxId[0]}`),
            actionLabel: "Buscar Cliente",
            icon: Users,
            timestamp: Date.now()
         };
      }

      // 2. MATCHING INTELIGENTE
      if (!responseMsg) {
        RAW_KNOWLEDGE_BASE.forEach(intent => {
            let score = 0;
            if (intent.exactPhrases?.some(phrase => lowerText.includes(phrase))) {
                score = 1.0; 
            } else {
                const words = lowerText.split(" ");
                let wordMatches = 0;
                words.forEach(word => {
                    if (word.length < 3) return;
                    intent.keywords.forEach(keyword => {
                        const similarity = calculateSimilarity(word, keyword);
                        if (similarity > 0.8) { 
                            score += similarity;
                            wordMatches++;
                        }
                    });
                });
                if (wordMatches > 0) {
                    score = score / Math.max(1, words.filter(w => w.length >= 3).length);
                    if (wordMatches >= 2) score += 0.2;
                }
            }
            if (score > maxScore) {
                maxScore = score;
                matchedIntent = intent;
            }
        });

        if (matchedIntent && maxScore > 0.45) {
            const intent = matchedIntent as Intent;
            const targetUrl = getSafeUrl(slug, intent.link);
            const isOnPage = pathname === targetUrl;
            const randomResponse = intent.responses[Math.floor(Math.random() * intent.responses.length)];

            if (intent.id === "order_details_help") {
                if (isOnPage) {
                    responseMsg = { id: generateId(), role: "bot", text: "¡Excelente! Ya estás en la lista. \n\n👁️ **Haz clic en el ícono del OJO** a la derecha de la orden para editar.", timestamp: Date.now() };
                } else {
                    responseMsg = { id: generateId(), role: "bot", text: "Primero debemos ir al listado de Órdenes.", actionLink: targetUrl, actionLabel: "Ir a Órdenes", icon: intent.icon, timestamp: Date.now() };
                }
            } 
            else if (!intent.link) {
                responseMsg = { id: generateId(), role: "bot", text: randomResponse, timestamp: Date.now() };
            }
            else if (isOnPage && intent.id !== "dashboard") {
                responseMsg = { id: generateId(), role: "bot", text: `¡Ya estamos aquí! 😎 \n${randomResponse}`, timestamp: Date.now() };
            } else {
                responseMsg = {
                    id: generateId(), role: "bot", 
                    text: randomResponse,
                    actionLink: targetUrl, 
                    actionLabel: intent.buttonText, 
                    icon: intent.icon,
                    timestamp: Date.now()
                };
            }
        } else {
            responseMsg = {
                id: generateId(), role: "bot",
                text: "Hmm, no estoy seguro de entender eso. 🤔\n\nIntenta con palabras clave como **'Crear orden'**, **'Inventario'** o usa los botones rápidos.",
                timestamp: Date.now()
            };
        }
      }

      setMessages(prev => [...prev, responseMsg!]);
      setIsTyping(false);
    }, thinkingTime);
  }, [pathname, slug, countryConfig]);

  // --- HANDLERS ---
  const handleSend = () => {
    if (!input.trim()) return;
    const userText = input;
    setMessages(prev => [...prev, { id: generateId(), role: "user", text: userText, timestamp: Date.now() }]);
    setInput("");
    processUserMessage(userText);
  };

  const handleQuickAction = (text: string) => {
    setMessages(prev => [...prev, { id: generateId(), role: "user", text: text, timestamp: Date.now() }]);
    processUserMessage(text);
  };

  const handleClearChat = () => {
    setMessages([{ id: generateId(), role: "bot", text: "Chat reiniciado. 🧹 ¿En qué te ayudo ahora?", timestamp: Date.now() }]);
    setMode("chat");
  };

  const handleCalculate = () => {
    const val = parseFloat(calcAmount);
    if (isNaN(val)) return;
    
    // ✅ CORRECCIÓN MASTER: Usar el taxRate real de la BD
    const rate = taxRate / 100;
    
    const tax = Math.round(val * rate);
    setCalcResult({ net: val, tax: tax, total: val + tax });
  };

  const handleAddNote = () => {
    if (!note.trim()) return;
    setSavedNotes(prev => [note, ...prev]);
    setNote("");
    toast.success("Nota guardada");
  };

  // --- RENDERERS ---
  const renderDynamicSuggestions = () => {
    const isOrders = pathname.includes("/orders");
    const isInventory = pathname.includes("/inventory");
    const isCustomers = pathname.includes("/customers");
    const isVehicles = pathname.includes("/vehicles");
    const isDashboard = pathname === `/${slug}` || pathname === `/${slug}/` || pathname === `/${slug}/dashboard`;

    return (
        <div className="mt-5 w-full animate-in fade-in slide-in-from-bottom-3 duration-500">
            <div className="flex gap-2 mb-3">
                <button onClick={() => setMode("calculator")} className={STYLES.chipTool}><Calculator className="h-3.5 w-3.5"/> Calculadora</button>
                <button onClick={() => setMode("notes")} className={STYLES.chipTool}><StickyNote className="h-3.5 w-3.5"/> Notas</button>
            </div>
            <div className="flex items-center gap-1.5 mb-2 px-1 opacity-80">
                <Sparkles className="h-3 w-3 text-orange-500 fill-orange-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sugerencias Inteligentes</span>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
                {isDashboard && (
                    <>
                     <button onClick={() => handleQuickAction("crear orden")} className={STYLES.chipAction}>➕ Nueva Orden</button>
                     <button onClick={() => handleQuickAction("ver flota")} className={STYLES.chipAction}>🚘 Ver Flota</button>
                    </>
                )}
                {isOrders && (
                    <>
                        <button onClick={() => handleQuickAction("crear orden")} className={STYLES.chipAction}>➕ Nueva Orden</button>
                        <button onClick={() => handleQuickAction("ver presupuesto")} className={STYLES.chipHelp}>🛠️ Presupuesto</button>
                    </>
                )}
                {isInventory && (<button onClick={() => handleQuickAction("crear producto")} className={STYLES.chipAction}>➕ Nuevo Ítem</button>)}
                {isCustomers && (<button onClick={() => handleQuickAction("crear cliente")} className={STYLES.chipAction}>➕ Nuevo Cliente</button>)}
                {isVehicles && (<button onClick={() => handleQuickAction("crear auto")} className={STYLES.chipAction}>🚘 Nuevo Auto</button>)}
                {!isDashboard && (
                    <button onClick={() => handleQuickAction("ir al inicio")} className={`${STYLES.chipTool} justify-center border-dashed bg-slate-50/50`}>🏠 Ir al Inicio</button>
                )}
            </div>
        </div>
    )
  };

  const renderCalculator = () => {
    return (
        <div className="flex-1 flex flex-col p-6 bg-slate-50/50">
            <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-400 uppercase mb-3 flex items-center gap-2">
                    {/* ✅ MOSTRAMOS EL % REAL */}
                    <Calculator className="h-3 w-3"/> Calculadora Rápida ({taxRate}%)
                </h3>
                <div className="flex gap-2">
                    <Input 
                        type="number" 
                        placeholder="Monto Neto..." 
                        value={calcAmount} 
                        onChange={(e) => setCalcAmount(e.target.value)} 
                        className="bg-white text-lg h-11 shadow-sm border-slate-200 focus-visible:ring-orange-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleCalculate()}
                    />
                    <Button onClick={handleCalculate} className={`${THEME.primary} h-11 px-6 font-bold shadow-md`}>Calc</Button>
                </div>
            </div>
            {calcResult && (
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-lg space-y-3 animate-in zoom-in-95 duration-200">
                    <div className="flex justify-between text-sm text-slate-500"><span>Neto:</span><span className="font-mono">{countryConfig.currencySymbol}{calcResult.net.toLocaleString("es-CL")}</span></div>
                    <div className="flex justify-between text-sm text-slate-500"><span>Impuesto ({taxRate}%):</span><span className="font-mono text-red-500">+{countryConfig.currencySymbol}{calcResult.tax.toLocaleString("es-CL")}</span></div>
                    <div className="h-px bg-slate-100 my-1"/>
                    <div className="flex justify-between font-bold text-xl text-slate-800"><span>Total:</span><span className="font-mono text-orange-600">{countryConfig.currencySymbol}{calcResult.total.toLocaleString("es-CL")}</span></div>
                </div>
            )}
        </div>
    );
  };

  const renderNotes = () => (
    <div className="flex-1 flex flex-col bg-slate-50/50 overflow-hidden">
        <div className="p-4 bg-white border-b border-slate-200 shadow-sm z-10">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2 flex items-center gap-2"><StickyNote className="h-3 w-3"/> Notas Rápidas</h3>
            <div className="flex flex-col gap-2">
                <Textarea 
                    placeholder="Escribe algo importante..." 
                    value={note} 
                    onChange={(e) => setNote(e.target.value)} 
                    className="min-h-20 resize-none text-sm bg-slate-50 focus-visible:ring-orange-500 border-slate-200"
                    onKeyDown={(e) => {
                        if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddNote(); }
                    }}
                />
                <Button onClick={handleAddNote} size="sm" className="w-full bg-yellow-500 hover:bg-yellow-600 text-white shadow-sm font-medium h-8">Guardar Nota</Button>
            </div>
        </div>
        <ScrollArea className="flex-1 p-4 bg-slate-50/50">
            <div className="space-y-3">
                {savedNotes.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 text-slate-400 text-sm">
                        <StickyNote className="h-8 w-8 mb-2 opacity-20"/>
                        <p>No hay notas guardadas.</p>
                    </div>
                )}
                {savedNotes.map((n, i) => (
                    <div key={i} className="bg-yellow-50 border border-yellow-100 p-3 rounded-xl shadow-sm text-sm text-yellow-900 relative group animate-in slide-in-from-bottom-2 duration-300">
                        <p className="pr-6 whitespace-pre-wrap leading-relaxed">{n}</p>
                        <button 
                            onClick={() => {
                                const newNotes = [...savedNotes];
                                newNotes.splice(i, 1);
                                setSavedNotes(newNotes);
                            }} 
                            className="absolute top-2 right-2 text-yellow-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all p-1 hover:bg-yellow-100 rounded"
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                        </button>
                    </div>
                ))}
            </div>
        </ScrollArea>
    </div>
  );

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 print:hidden font-sans">
      {isOpen && (
        <Card className="w-80 sm:w-96 h-137.5 max-h-[85vh] shadow-2xl border-slate-200 flex flex-col animate-in slide-in-from-bottom-10 fade-in duration-300 overflow-hidden rounded-2xl ring-1 ring-black/5">
          <CardHeader className="bg-slate-900/95 backdrop-blur-md text-white p-4 flex flex-row justify-between items-center space-y-0 shrink-0 border-b border-slate-800">
            <div className="flex items-center gap-3">
                {mode !== 'chat' && (
                    <Button variant="ghost" size="icon" onClick={() => setMode("chat")} className="text-slate-400 hover:text-white -ml-2 h-8 w-8 rounded-full hover:bg-white/10">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                )}
                <div className={`p-2 rounded-xl transition-all duration-500 ${mode === 'chat' ? 'bg-linear-to-br from-orange-500 to-red-600 shadow-lg shadow-orange-900/20' : mode === 'calculator' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                    {mode === 'chat' && <Bot className="h-5 w-5 text-white" />}
                    {mode === 'calculator' && <Calculator className="h-5 w-5 text-white" />}
                    {mode === 'notes' && <StickyNote className="h-5 w-5 text-white" />}
                </div>
                <div>
                    <CardTitle className="text-sm font-bold tracking-wide">
                        {mode === 'chat' ? 'Nexus AI' : mode === 'calculator' ? 'Calculadora' : 'Notas'}
                    </CardTitle>
                    <p className="text-[10px] text-slate-400 font-medium leading-none mt-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        {mode === 'chat' ? `Online • v12.1 (${countryCode})` : 'Herramienta'}
                    </p>
                </div>
            </div>
            <div className="flex gap-1">
                {mode === 'chat' && (
                    <Button variant="ghost" size="icon" onClick={handleClearChat} className="text-slate-400 hover:text-white hover:bg-white/10 h-8 w-8 rounded-full transition-colors" title="Limpiar Chat">
                        <Trash2 className="h-4 w-4" />
                    </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-red-400 hover:bg-red-500/20 h-8 w-8 rounded-full transition-colors">
                    <X className="h-5 w-5" />
                </Button>
            </div>
          </CardHeader>

          {mode === 'chat' && (
            <>
                <CardContent className="flex-1 p-0 overflow-hidden bg-slate-50/30 relative">
                    <ScrollArea className="h-full p-4">
                        <div className="space-y-5 pb-2">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.role === "bot" ? "justify-start" : "justify-end"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                                    {msg.role === 'bot' && (
                                        <div className="w-6 h-6 rounded-full bg-linear-to-br from-orange-100 to-orange-200 border border-orange-200 flex items-center justify-center mr-2 shrink-0 mt-1">
                                            <Bot className="h-3.5 w-3.5 text-orange-600" />
                                        </div>
                                    )}
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm transition-all ${msg.role === "bot" ? THEME.botBubble : THEME.userBubble}`}>
                                        <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                                        
                                        {msg.actionLink && msg.actionLabel && (
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                className={`mt-3 h-8 text-xs w-full justify-between border group ${
                                                    msg.role === 'bot' 
                                                    ? 'border-orange-100 bg-orange-50/50 text-orange-700 hover:bg-orange-100' 
                                                    : 'border-white/20 bg-white/10 text-white hover:bg-white/20'
                                                }`} 
                                                onClick={() => router.push(msg.actionLink!)}
                                            >
                                                <span className="flex items-center gap-2 font-semibold">
                                                    {msg.icon && <msg.icon className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />}
                                                    {msg.actionLabel}
                                                </span>
                                                <ChevronRight className="h-3 w-3 opacity-70 group-hover:translate-x-1 transition-transform" />
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                            
                            {/* INDICADOR DE ESCRITURA */}
                            {isTyping && (
                                <div className="flex justify-start animate-in fade-in slide-in-from-bottom-1">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center mr-2 shrink-0 mt-1">
                                        <Bot className="h-3.5 w-3.5 text-slate-400" />
                                    </div>
                                    <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-1.5 h-11.5">
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                        <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                                    </div>
                                </div>
                            )}

                            {!isTyping && messages[messages.length-1].role === 'bot' && renderDynamicSuggestions()}
                            <div ref={scrollRef} />
                        </div>
                    </ScrollArea>
                </CardContent>
                
                {/* FOOTER DEL CHAT */}
                <CardFooter className="p-3 bg-white border-t border-slate-100">
                    <div className="flex w-full items-center gap-2">
                        <Input 
                            ref={inputRef}
                            placeholder="Escribe aquí..." 
                            value={input} 
                            onChange={(e) => setInput(e.target.value)} 
                            onKeyDown={(e) => e.key === "Enter" && handleSend()} 
                            className="focus-visible:ring-orange-500 bg-slate-50 border-slate-200 h-10 shadow-sm transition-all focus:bg-white" 
                        />
                        <Button size="icon" onClick={handleSend} className={`${THEME.primary} shrink-0 shadow-md h-10 w-10 transition-transform active:scale-95`}>
                            <Send className="h-4 w-4" />
                        </Button>
                    </div>
                </CardFooter>
            </>
          )}

          {mode === 'calculator' && renderCalculator()}
          {mode === 'notes' && renderNotes()}
        </Card>
      )}

      {/* BOTÓN FLOTANTE */}
      <div className="group relative z-50">
        {!isOpen && (
            <div className="absolute right-16 top-3 px-3 py-1.5 bg-white rounded-xl shadow-lg border border-slate-100 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0 pointer-events-none">
                <span className="text-xs font-bold text-slate-700 whitespace-nowrap">Asistente IA</span>
                <span className="flex h-2 w-2 rounded-full bg-green-500"></span>
            </div>
        )}
        <Button 
            onClick={() => setIsOpen(!isOpen)} 
            className={`h-14 w-14 rounded-full shadow-2xl transition-all duration-500 border-4 border-white ${
                isOpen 
                ? "bg-slate-800 rotate-90 scale-0 opacity-0 hidden" 
                : "bg-linear-to-br from-orange-500 to-red-600 hover:scale-110 hover:shadow-orange-500/40 scale-100 opacity-100 flex"
            }`}
        >
            <Bot className="h-7 w-7 text-white" />
        </Button>
      </div>

      {isOpen && (
        <Button 
            onClick={() => setIsOpen(false)} 
            className="h-12 w-12 rounded-full shadow-xl bg-white hover:bg-slate-50 text-slate-600 border-4 border-slate-100 animate-in zoom-in duration-200 flex items-center justify-center"
        >
            <X className="h-6 w-6" />
        </Button>
      )}
    </div>
  );
}