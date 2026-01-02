"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Bot, X, Send, ChevronRight, Sparkles, PlusCircle, Search, Settings, Calculator, StickyNote, ArrowLeft, Trash2 } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";

// --- TIPOS DEL CEREBRO ---
type Intent = {
  id: string;
  keywords: string[];
  response: string;
  link?: string;
  buttonText?: string;
};

// --- BASE DE CONOCIMIENTO (Navegación) ---
const KNOWLEDGE_BASE: Intent[] = [
  { 
    id: "create_order", 
    keywords: ["crear", "nueva", "ingresar", "orden", "auto", "vehículo"], 
    response: "Para ingresar un nuevo vehículo, ve a Órdenes > Nueva Orden.", 
    link: "/orders", 
    buttonText: "Ir a Órdenes" 
  },
  { 
    id: "view_orders", 
    keywords: ["ver", "lista", "buscar", "orden", "historial"], 
    response: "Revisa el historial completo en el listado de Órdenes.", 
    link: "/orders", 
    buttonText: "Ver Listado" 
  },
  { 
    id: "clients", 
    keywords: ["cliente", "dueño", "persona", "telefono", "contacto"], 
    response: "Gestión de cartera de clientes.", 
    link: "/customers", 
    buttonText: "Gestionar Clientes" 
  },
  { 
    id: "inventory", 
    keywords: ["stock", "precio", "inventario", "repuesto", "producto"], 
    response: "Revisa stock y precios en el Inventario.", 
    link: "/inventory", 
    buttonText: "Ir a Inventario" 
  },
  { 
    id: "settings", 
    keywords: ["configurar", "taller", "logo", "nombre", "iva"], 
    response: "Ajusta los datos de tu empresa en Configuración.", 
    link: "/settings/catalog",
    buttonText: "Configuración" 
  }
];

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

// Modos del Bot
type BotMode = "chat" | "calculator" | "notes";

export function NexusAssistant({ slug, userName = "Colega" }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<BotMode>("chat"); // Estado para cambiar pantallas
  const [input, setInput] = useState("");
  
  // --- ESTADOS CALCULADORA ---
  const [calcAmount, setCalcAmount] = useState("");
  const [calcResult, setCalcResult] = useState<{net: number, tax: number, total: number} | null>(null);

  // --- ESTADOS NOTAS ---
  const [note, setNote] = useState("");
  const [savedNotes, setSavedNotes] = useState<string[]>([]);

  // Cargar notas al inicio
  useEffect(() => {
    const saved = localStorage.getItem("nexus_bot_notes");
    if (saved) setSavedNotes(JSON.parse(saved));
  }, []);

  // Guardar notas al cambiar
  useEffect(() => {
    localStorage.setItem("nexus_bot_notes", JSON.stringify(savedNotes));
  }, [savedNotes]);

  const [messages, setMessages] = useState<Message[]>([
    { 
      id: "init", 
      role: "bot", 
      text: `¡Hola ${userName}! Soy NexusBot 🤖. ¿Navegación, cálculos o notas?` 
    }
  ]);
  
  const router = useRouter();
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen, mode]); // Scroll también al cambiar de modo

  // --- LÓGICA DEL CHAT ---
  const processMessage = (text: string) => {
    const lowerText = text.toLowerCase();
    
    // Detectar Cambio de Modo por texto
    if (lowerText.includes("calculadora") || lowerText.includes("calcular") || lowerText.includes("iva")) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: "bot", text: "Abriendo calculadora..." }]);
        setTimeout(() => setMode("calculator"), 500);
        return;
    }
    if (lowerText.includes("nota") || lowerText.includes("anotar") || lowerText.includes("recordar")) {
        setMessages(prev => [...prev, { id: Date.now().toString(), role: "bot", text: "Abriendo tus notas..." }]);
        setTimeout(() => setMode("notes"), 500);
        return;
    }

    // Buscador de Intents
    let bestMatch: Intent | null = null;
    let maxMatches = 0;

    KNOWLEDGE_BASE.forEach((intent) => {
      const matches = intent.keywords.filter(k => lowerText.includes(k)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = intent;
      }
    });

    let responseMsg: Message = {
      id: Date.now().toString(),
      role: "bot",
      text: "No entendí eso. Prueba 'calculadora', 'notas' o 'crear orden'.",
    };

    if (bestMatch && maxMatches > 0) {
      responseMsg = {
        id: Date.now().toString(),
        role: "bot",
        text: (bestMatch as Intent).response,
        actionLink: `/${slug}${(bestMatch as Intent).link}`,
        actionLabel: (bestMatch as Intent).buttonText
      };
    }

    setTimeout(() => {
      setMessages((prev) => [...prev, responseMsg]);
    }, 600);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { id: Date.now().toString(), role: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);
    processMessage(input);
    setInput("");
  };

  // --- LOGICA CALCULADORA ---
  const handleCalculate = () => {
    const val = parseFloat(calcAmount);
    if (isNaN(val)) return;
    const tax = val * 0.19; // IVA Chile
    setCalcResult({
        net: val,
        tax: tax,
        total: val + tax
    });
  };

  // --- LOGICA NOTAS ---
  const addNote = () => {
    if (!note.trim()) return;
    setSavedNotes(prev => [note, ...prev]);
    setNote("");
  };
  const deleteNote = (index: number) => {
    const newNotes = [...savedNotes];
    newNotes.splice(index, 1);
    setSavedNotes(newNotes);
  };

  // --- RENDERIZADO DE VISTAS ---
  
  // 1. VISTA DE CHAT (La original)
  const renderChat = () => (
    <>
        <CardContent className="flex-1 p-0 overflow-hidden bg-slate-50 relative">
        <ScrollArea className="h-full p-4">
            <div className="space-y-4 pb-2">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === "bot" ? "justify-start" : "justify-end"} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${
                    msg.role === "bot"
                        ? "bg-white text-slate-700 border border-slate-200 rounded-tl-none"
                        : "bg-indigo-600 text-white rounded-tr-none"
                    }`}>
                    <p className="leading-relaxed">{msg.text}</p>
                    {msg.actionLink && msg.actionLabel && (
                    <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-3 h-8 text-xs border-indigo-100 text-indigo-700 hover:bg-indigo-50 hover:text-indigo-800 w-full justify-between bg-indigo-50/50"
                        onClick={() => router.push(msg.actionLink!)}
                    >
                        {msg.actionLabel} <ChevronRight className="h-3 w-3" />
                    </Button>
                    )}
                </div>
                </div>
            ))}
            
            {messages[messages.length - 1].role === 'bot' && (
                <div className="flex flex-wrap gap-2 mt-4 ml-1">
                    <p className="w-full text-[10px] text-slate-400 font-bold uppercase mb-1 ml-1">Herramientas</p>
                    <button onClick={() => setMode("calculator")} className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:bg-indigo-50 hover:border-indigo-200 hover:text-indigo-600 transition-colors flex items-center gap-1">
                        <Calculator className="h-3 w-3" /> Calculadora
                    </button>
                    <button onClick={() => setMode("notes")} className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:bg-yellow-50 hover:border-yellow-200 hover:text-yellow-700 transition-colors flex items-center gap-1">
                        <StickyNote className="h-3 w-3" /> Notas
                    </button>
                </div>
            )}
            <div ref={scrollRef} />
            </div>
        </ScrollArea>
        </CardContent>
        <CardFooter className="p-3 bg-white border-t border-slate-100">
        <div className="flex w-full items-center gap-2">
            <Input 
            placeholder="Escribe aquí..." 
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            className="focus-visible:ring-indigo-500 bg-slate-50 border-slate-200"
            />
            <Button size="icon" onClick={handleSend} className="bg-indigo-600 hover:bg-indigo-700 shrink-0 shadow-sm">
            <Send className="h-4 w-4" />
            </Button>
        </div>
        </CardFooter>
    </>
  );

  // 2. VISTA CALCULADORA
  const renderCalculator = () => (
    <div className="flex-1 flex flex-col p-6 bg-slate-50">
        <div className="mb-6">
            <h3 className="text-sm font-bold text-slate-500 uppercase mb-2">Calculadora de Presupuesto</h3>
            <div className="flex gap-2">
                <Input 
                    type="number" 
                    placeholder="Monto Neto..." 
                    value={calcAmount}
                    onChange={(e) => setCalcAmount(e.target.value)}
                    className="bg-white text-lg"
                />
                <Button onClick={handleCalculate} className="bg-indigo-600 hover:bg-indigo-700">Calculár</Button>
            </div>
        </div>

        {calcResult && (
            <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm space-y-2 animate-in zoom-in-95 duration-200">
                <div className="flex justify-between text-sm text-slate-500">
                    <span>Neto:</span>
                    <span className="font-mono">${calcResult.net.toLocaleString("es-CL")}</span>
                </div>
                <div className="flex justify-between text-sm text-slate-500">
                    <span>IVA (19%):</span>
                    <span className="font-mono text-red-500">+${calcResult.tax.toLocaleString("es-CL")}</span>
                </div>
                <div className="h-px bg-slate-100 my-1"/>
                <div className="flex justify-between font-bold text-lg text-slate-800">
                    <span>Total:</span>
                    <span className="font-mono">${calcResult.total.toLocaleString("es-CL")}</span>
                </div>
            </div>
        )}
        <div className="mt-auto text-center text-xs text-slate-400">
            Útil para dar precios rápidos a clientes.
        </div>
    </div>
  );

  // 3. VISTA NOTAS
  const renderNotes = () => (
    <div className="flex-1 flex flex-col bg-slate-50 overflow-hidden">
         <div className="p-4 bg-white border-b border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase mb-2">Bloc de Notas Rápido</h3>
            <div className="flex gap-2">
                <Textarea 
                    placeholder="Ej: Llamar al cliente del Yaris..." 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-h-[60px] resize-none text-sm bg-slate-50"
                    onKeyDown={(e) => {
                        if(e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            addNote();
                        }
                    }}
                />
            </div>
            <Button onClick={addNote} size="sm" className="w-full mt-2 bg-yellow-500 hover:bg-yellow-600 text-white">
                Guardar Nota
            </Button>
         </div>

         <ScrollArea className="flex-1 p-4">
            <div className="space-y-3">
                {savedNotes.length === 0 && (
                    <div className="text-center text-slate-400 text-sm py-10">
                        <StickyNote className="h-10 w-10 mx-auto mb-2 opacity-20" />
                        No tienes notas guardadas.
                    </div>
                )}
                {savedNotes.map((n, i) => (
                    <div key={i} className="bg-yellow-50 border border-yellow-100 p-3 rounded-lg shadow-sm text-sm text-yellow-900 relative group animate-in slide-in-from-top-2">
                        <p className="pr-6 whitespace-pre-wrap">{n}</p>
                        <button 
                            onClick={() => deleteNote(i)}
                            className="absolute top-2 right-2 text-yellow-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <Trash2 className="h-4 w-4" />
                        </button>
                    </div>
                ))}
            </div>
         </ScrollArea>
    </div>
  );

  return (
    <div className="fixed bottom-24 right-6 z-50 flex flex-col items-end gap-4 print:hidden">
      
      {/* VENTANA PRINCIPAL */}
      {isOpen && (
        <Card className="w-80 sm:w-96 h-[32rem] shadow-2xl border-slate-200 flex flex-col animate-in slide-in-from-bottom-5 fade-in duration-200 overflow-hidden">
          {/* HEADER COMÚN */}
          <CardHeader className="bg-slate-900 text-white p-4 flex flex-row justify-between items-center space-y-0 shrink-0">
            <div className="flex items-center gap-3">
                {mode !== 'chat' && (
                    <Button variant="ghost" size="icon" onClick={() => setMode("chat")} className="text-slate-400 hover:text-white hover:bg-slate-800 -ml-2 h-8 w-8">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                )}
                
                <div className={`p-1.5 rounded-lg ${mode === 'chat' ? 'bg-indigo-500' : mode === 'calculator' ? 'bg-green-500' : 'bg-yellow-500'}`}>
                    {mode === 'chat' && <Bot className="h-4 w-4 text-white" />}
                    {mode === 'calculator' && <Calculator className="h-4 w-4 text-white" />}
                    {mode === 'notes' && <StickyNote className="h-4 w-4 text-white" />}
                </div>
                
                <div>
                    <CardTitle className="text-sm font-bold">
                        {mode === 'chat' ? 'Asistente Nexus' : mode === 'calculator' ? 'Calculadora' : 'Mis Notas'}
                    </CardTitle>
                </div>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="text-white hover:bg-slate-800 h-6 w-6">
              <X className="h-4 w-4" />
            </Button>
          </CardHeader>
          
          {/* CONTENIDO CAMBIANTE SEGÚN MODO */}
          {mode === 'chat' && renderChat()}
          {mode === 'calculator' && renderCalculator()}
          {mode === 'notes' && renderNotes()}

        </Card>
      )}

      {/* BOTÓN FLOTANTE ACTIVADOR */}
      <div className="group relative">
        {!isOpen && (
            <span className="absolute right-16 top-4 bg-white px-3 py-1 rounded-lg text-xs font-medium text-slate-600 shadow-md border border-slate-100 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                Herramientas 🛠️
            </span>
        )}
        <Button
            onClick={() => setIsOpen(!isOpen)}
            className={`h-14 w-14 rounded-full shadow-2xl transition-all duration-300 border-4 border-white ${
            isOpen 
                ? "bg-slate-800 hover:bg-slate-900 rotate-90 scale-0 opacity-0 hidden" 
                : "bg-gradient-to-br from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 scale-100 opacity-100 flex"
            }`}
        >
            <Bot className="h-7 w-7 text-white" />
        </Button>
      </div>

       {isOpen && (
         <Button
            onClick={() => setIsOpen(false)}
            className="h-12 w-12 rounded-full shadow-lg bg-slate-200 hover:bg-slate-300 text-slate-600 border-4 border-white"
         >
            <X className="h-6 w-6" />
         </Button>
       )}
    </div>
  );
}