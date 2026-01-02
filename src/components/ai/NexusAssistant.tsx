"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, X, Send, ChevronRight, Calculator, StickyNote, ArrowLeft, Trash2, Sparkles, Zap } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

// --- TIPOS ---
type Intent = {
  id: string;
  keywords: string[];
  response: string;
  link?: string;
  buttonText?: string;
  requiredPath?: string;
};

// --- BASE DE CONOCIMIENTO CON PERSONALIDAD ---
const KNOWLEDGE_BASE: Intent[] = [
  { 
    id: "add_items_tutorial", 
    keywords: ["agregar item", "poner repuesto", "agregar repuesto", "editar orden", "modificar orden", "presupuesto", "ojo", "servicios", "cargar", "editar"], 
    response: "¡Es muy fácil! Ve al listado de Órdenes y busca el botón del OJO (👁️) a la derecha. ¡Ahí ocurre la magia para editar el presupuesto! ✨", 
    link: "/orders", 
    buttonText: "Ir a Órdenes",
    requiredPath: "/orders"
  },
  { 
    id: "create_order", 
    keywords: ["orden", "auto", "vehículo", "ingresar", "nueva", "crear"], 
    response: "¡Manos a la obra! 🚗 Vamos a ingresar ese vehículo en Órdenes > Nueva Orden.", 
    link: "/orders", 
    buttonText: "Crear Orden" 
  },
  { 
    id: "clients", 
    keywords: ["cliente", "dueño", "contacto", "crear", "nuevo", "rut"], 
    response: "Mantén tu agenda al día. 📒 Aquí puedes gestionar o crear nuevos clientes.", 
    link: "/customers", 
    buttonText: "Ver Clientes" 
  },
  { 
    id: "inventory", 
    keywords: ["stock", "precio", "inventario", "repuesto", "producto", "insumo"], 
    response: "El corazón del taller. 📦 Revisa stock, precios y alertas aquí.", 
    link: "/inventory", 
    buttonText: "Ir a Inventario" 
  },
  { 
    id: "settings", 
    keywords: ["configurar", "taller", "logo", "nombre", "iva", "datos"], 
    response: "¡Pon la casa en orden! ⚙️ Ajusta los datos de tu empresa en Configuración.", 
    link: "/settings/catalog",
    buttonText: "Configuración" 
  }
];

// --- ALGORITMO DE SIMILITUD ---
const getSimilarity = (s1: string, s2: string) => {
    let longer = s1;
    let shorter = s2;
    if (s1.length < s2.length) { longer = s2; shorter = s1; }
    const longerLength = longer.length;
    if (longerLength === 0) return 1.0;
    
    const costs = new Array();
    for (let i = 0; i <= s1.length; i++) {
        let lastValue = i;
        for (let j = 0; j <= s2.length; j++) {
            if (i == 0) costs[j] = j;
            else {
                if (j > 0) {
                    let newValue = costs[j - 1];
                    if (s1.charAt(i - 1) != s2.charAt(j - 1)) newValue = Math.min(Math.min(newValue, lastValue), costs[j]) + 1;
                    costs[j - 1] = lastValue;
                    lastValue = newValue;
                }
            }
        }
        if (i > 0) costs[s2.length] = lastValue;
    }
    return (longerLength - costs[s2.length]) / longerLength;
}

interface Message {
  id: string;
  role: "bot" | "user";
  text: string;
  actionLink?: string;
  actionLabel?: string;
}

interface Props {
  slug: string; 
  userName?: string;
}

type BotMode = "chat" | "calculator" | "notes";

export function NexusAssistant({ slug, userName = "Colega" }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<BotMode>("chat");
  const [input, setInput] = useState("");
  
  // Estados herramientas
  const [calcAmount, setCalcAmount] = useState("");
  const [calcResult, setCalcResult] = useState<{net: number, tax: number, total: number} | null>(null);
  const [note, setNote] = useState("");
  const [savedNotes, setSavedNotes] = useState<string[]>([]);

  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const saved = localStorage.getItem("nexus_bot_notes");
    if (saved) setSavedNotes(JSON.parse(saved));
  }, []);

  useEffect(() => {
    localStorage.setItem("nexus_bot_notes", JSON.stringify(savedNotes));
  }, [savedNotes]);

  const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "init-msg", 
      role: "bot", 
      text: `¡Hola ${userName}! 👋 Soy NexusBot, tu copiloto en el taller. \n\n¿Qué vamos a gestionar hoy?` 
    }
  ]);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, mode]);

  // --- CEREBRO CON FUZZY LOGIC ---
  const processMessage = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // 1. Modos rápidos
    if (lowerText.includes("calculadora") || lowerText.includes("calcular")) {
        setMessages(prev => [...prev, { id: generateId(), role: "bot", text: "🧮 Abriendo calculadora rápida..." }]);
        setTimeout(() => setMode("calculator"), 500);
        return;
    }
    if (lowerText.includes("nota")) {
        setMessages(prev => [...prev, { id: generateId(), role: "bot", text: "📝 Abriendo tu bloc de notas..." }]);
        setTimeout(() => setMode("notes"), 500);
        return;
    }

    // 2. Detector de Patentes
    const plateRegex = /[a-z]{2,4}[-]?[0-9]{2,4}/i; 
    if (plateRegex.test(lowerText) && lowerText.length <= 8) {
        const detectedPlate = lowerText.toUpperCase().replace(/[^A-Z0-9]/g, "");
        setMessages(prev => [...prev, {
            id: generateId(),
            role: "bot",
            text: `🔎 ¡Ojo! Detecté una patente: **${detectedPlate}**. \n¿Quieres buscar el historial de este vehículo?`,
            actionLink: `/${slug}/orders?query=${detectedPlate}`, 
            actionLabel: "Buscar Patente"
        }]);
        return;
    }

    // 3. BUSQUEDA INTELIGENTE
    let bestMatch: Intent | null = null;
    let highestScore = 0;

    KNOWLEDGE_BASE.forEach((intent) => {
        let score = 0;
        const words = lowerText.split(" ");
        words.forEach(word => {
            intent.keywords.forEach(keyword => {
                const similarity = getSimilarity(word, keyword);
                if (similarity > 0.75) { score += similarity; }
            });
        });
        if (score > highestScore) {
            highestScore = score;
            bestMatch = intent;
        }
    });

    let responseMsg: Message = {
      id: generateId(),
      role: "bot",
      text: "Hmm, esa no me la sé (aún) 😅. \nPrueba palabras clave como **'Crear orden'**, **'Inventario'** o usa los atajos de abajo 👇",
    };

    if (bestMatch && highestScore > 0.8) {
      const intent = bestMatch as Intent;
      const currentPath = `/${slug}${intent.link}`;
      const isOnPage = pathname.includes(intent.link || "xyz");

      if (intent.id === "add_items_tutorial") {
         if (isOnPage) {
            responseMsg = {
                id: generateId(),
                role: "bot",
                text: "¡Excelente, ya estás en el lugar correcto! 📍\n\n👉 Mira la tabla a la derecha.\n👉 Busca el ícono **OJO (👁️)**.\n👉 ¡Clic ahí y listo! A editar.",
            };
         } else {
            responseMsg = {
                id: generateId(),
                role: "bot",
                text: "¡Entendido! Para agregar repuestos o servicios, primero vamos al listado de Órdenes.",
                actionLink: currentPath,
                actionLabel: "Ir a Órdenes"
            };
         }
      } else if (isOnPage) {
         responseMsg = { id: generateId(), role: "bot", text: `¡Ya estamos aquí! 😎 ${intent.response}` };
      } else {
         responseMsg = {
            id: generateId(),
            role: "bot",
            text: intent.response,
            actionLink: currentPath,
            actionLabel: intent.buttonText
         };
      }
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, responseMsg]);
    }, 600);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: generateId(), role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    processMessage(input);
    setInput("");
  };

  const handleQuickAction = (text: string) => {
    const userMsg: Message = { id: generateId(), role: "user", text: text };
    setMessages((prev) => [...prev, userMsg]);
    processMessage(text);
  };

  // --- UI COMPONENTS ---
  const renderDynamicSuggestions = () => {
    const isOrders = pathname.includes("/orders");
    const isInventory = pathname.includes("/inventory");
    const isCustomers = pathname.includes("/customers");

    return (
        <div className="mt-5 w-full animate-in fade-in slide-in-from-bottom-3">
            <div className="flex items-center gap-1 mb-2 px-1">
                <Zap className="h-3 w-3 text-amber-500 fill-amber-500" />
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Acciones Rápidas
                </span>
            </div>
            
            <div className="flex gap-2 overflow-x-auto pb-3 px-1 scrollbar-hide">
                {/* Herramientas (Gris) */}
                <button onClick={() => setMode("calculator")} className="chip-tool">
                    <Calculator className="h-3.5 w-3.5"/> Calculadora
                </button>
                <button onClick={() => setMode("notes")} className="chip-tool">
                    <StickyNote className="h-3.5 w-3.5"/> Notas
                </button>

                <div className="w-px h-6 bg-slate-200 mx-1 shrink-0 self-center"></div>

                {/* Acciones Contextuales (Azul / Naranja) */}
                {isOrders && (
                    <>
                        <button onClick={() => handleQuickAction("crear orden")} className="chip-action">
                           ➕ Nueva Orden
                        </button>
                        <button onClick={() => handleQuickAction("cómo agrego repuestos")} className="chip-help">
                           ❓ ¿Cómo edito?
                        </button>
                    </>
                )}
                {isInventory && (
                    <button onClick={() => handleQuickAction("crear producto")} className="chip-action">
                        ➕ Nuevo Ítem
                    </button>
                )}
                {isCustomers && (
                    <button onClick={() => handleQuickAction("crear cliente")} className="chip-action">
                        ➕ Nuevo Cliente
                    </button>
                )}
                {!isOrders && !isInventory && !isCustomers && (
                    <button onClick={() => handleQuickAction("crear orden")} className="chip-action">
                        ➕ Nueva Orden
                    </button>
                )}
            </div>
        </div>
    )
  }

  const handleCalculate = () => {
    const val = parseFloat(calcAmount);
    if (isNaN(val)) return;
    const tax = val * 0.19; 
    setCalcResult({ net: val, tax: tax, total: val + tax });
  };
  const addNote = () => { if(note.trim()){ setSavedNotes(p=>[note,...p]); setNote(""); }};
  const deleteNote = (i: number) => { const n=[...savedNotes]; n.splice(i,1); setSavedNotes(n); };

  const renderChat = () => (
    <>
        <CardContent className="flex-1 p-0 overflow-hidden bg-slate-50 relative">
        <ScrollArea className="h-full p-4">
            <div className="space-y-4 pb-2">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "bot" ? "justify-start" : "justify-end"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    msg.role === "bot" ? "bg-white text-slate-700 border border-slate-200 rounded-tl-none" : "bg-indigo-600 text-white rounded-tr-none"
                }`}>
                    <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>
                    {msg.actionLink && msg.actionLabel && (
                    <Button variant="outline" size="sm" className="mt-3 h-8 text-xs border-indigo-100 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 w-full justify-between bg-indigo-50/50" onClick={() => router.push(msg.actionLink!)}>
                        {msg.actionLabel} <ChevronRight className="h-3 w-3" />
                    </Button>
                    )}
                </div>
                </div>
            ))}
            {messages[messages.length-1].role === 'bot' && renderDynamicSuggestions()}
            <div ref={scrollRef} />
            </div>
        </ScrollArea>
        </CardContent>
        <CardFooter className="p-3 bg-white border-t border-slate-100">
            <div className="flex w-full items-center gap-2">
                <Input placeholder="Escribe aquí..." value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && handleSend()} className="focus-visible:ring-indigo-500 bg-slate-50 border-slate-200" />
                <Button size="icon" onClick={handleSend} className="bg-indigo-600 hover:bg-indigo-700 shrink-0 shadow-sm"><Send className="h-4 w-4" /></Button>
            </div>
        </CardFooter>

        <style jsx global>{`
            .chip-base {
                @apply h-8 px-3 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 shrink-0 whitespace-nowrap shadow-sm border;
            }
            .chip-tool {
                @apply chip-base bg-white border-slate-200 text-slate-600 hover:bg-slate-50 hover:border-slate-300;
            }
            .chip-action {
                @apply chip-base bg-indigo-50 border-indigo-100 text-indigo-600 hover:bg-indigo-100 hover:border-indigo-200;
            }
            .chip-help {
                @apply chip-base bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100 hover:border-amber-200;
            }
            .scrollbar-hide::-webkit-scrollbar { display: none; }
            .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}</style>
    </>
  );

  const renderCalculator = () => (
    <div className="flex-1 flex flex-col p-6 bg-slate-50">
        <div className="mb-6"><h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Calculadora (IVA 19%)</h3><div className="flex gap-2"><Input type="number" placeholder="Monto Neto..." value={calcAmount} onChange={(e) => setCalcAmount(e.target.value)} className="bg-white text-lg"/><Button onClick={handleCalculate} className="bg-indigo-600 hover:bg-indigo-700">Calculár</Button></div></div>
        {calcResult && <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2 animate-in zoom-in-95 duration-200"><div className="flex justify-between text-sm text-slate-500"><span>Neto:</span><span className="font-mono">${calcResult.net.toLocaleString("es-CL")}</span></div><div className="flex justify-between text-sm text-slate-500"><span>IVA:</span><span className="font-mono text-red-500">+${calcResult.tax.toLocaleString("es-CL")}</span></div><div className="h-px bg-slate-100 my-1"/><div className="flex justify-between font-bold text-lg text-slate-800"><span>Total:</span><span className="font-mono">${calcResult.total.toLocaleString("es-CL")}</span></div></div>}
    </div>
  );
  const renderNotes = () => (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden"><div className="p-4 bg-white border-b border-slate-200"><h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Notas Rápidas</h3><div className="flex gap-2"><Textarea placeholder="Escribe una nota..." value={note} onChange={(e) => setNote(e.target.value)} className="min-h-15 resize-none text-sm bg-slate-50" onKeyDown={(e) => {if(e.key === 'Enter' && !e.shiftKey) {e.preventDefault(); addNote();}}}/></div><Button onClick={addNote} size="sm" className="w-full mt-2 bg-yellow-500 hover:bg-yellow-600 text-white">Guardar</Button></div><ScrollArea className="flex-1 p-4"><div className="space-y-3">{savedNotes.length === 0 && <div className="text-center text-slate-400 text-sm py-10">Sin notas.</div>}{savedNotes.map((n, i) => (<div key={i} className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg shadow-sm text-sm text-yellow-900 relative group"><p className="pr-6 whitespace-pre-wrap">{n}</p><button onClick={() => deleteNote(i)} className="absolute top-2 right-2 text-yellow-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="h-4 w-4" /></button></div>))}</div></ScrollArea></div>
  );

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-4 print:hidden">
      {isOpen && (
        <Card className="w-80 sm:w-96 h-128 shadow-2xl border-slate-200 flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-200 overflow-hidden">
          <CardHeader className="bg-slate-900 text-white p-4 flex flex-row justify-between items-center space-y-0 shrink-0">
            <div className="flex items-center gap-3">
                {mode !== 'chat' && <Button variant="ghost" size="icon" onClick={() => setMode("chat")} className="text-slate-400 hover:text-white -ml-2 h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>}
                <div className={`p-1.5 rounded-lg ${mode === 'chat' ? 'bg-indigo-500' : mode === 'calculator' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                    {mode === 'chat' && <Bot className="h-4 w-4 text-white" />}
                    {mode === 'calculator' && <Calculator className="h-4 w-4 text-white" />}
                    {mode === 'notes' && <StickyNote className="h-4 w-4 text-white" />}
                </div>
                <CardTitle className="text-sm font-bold">{mode === 'chat' ? 'Asistente Nexus' : mode === 'calculator' ? 'Calculadora' : 'Notas'}</CardTitle>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-slate-800 h-6 w-6"><X className="h-4 w-4" /></Button>
          </CardHeader>
          {mode === 'chat' && renderChat()}
          {mode === 'calculator' && renderCalculator()}
          {mode === 'notes' && renderNotes()}
        </Card>
      )}
      <div className="group relative">
        {!isOpen && <span className="absolute right-16 top-4 bg-white px-3 py-1 rounded-lg text-xs font-medium text-slate-600 shadow-md border border-slate-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">Herramientas 🛠️</span>}
        <Button onClick={() => setIsOpen(!isOpen)} className={`h-14 w-14 rounded-full shadow-2xl transition-all duration-300 border-4 border-white ${isOpen ? "bg-slate-800 rotate-90 scale-0 opacity-0 hidden" : "bg-linear-to-br from-indigo-500 to-purple-600 scale-100 opacity-100 flex"}`}>
            <Bot className="h-7 w-7 text-white" />
        </Button>
      </div>
      {isOpen && <Button onClick={() => setIsOpen(false)} className="h-12 w-12 rounded-full shadow-lg bg-slate-200 hover:bg-slate-300 text-slate-600 border-4 border-white"><X className="h-6 w-6" /></Button>}
    </div>
  );
}