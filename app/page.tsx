"use client";
import { useEffect, useMemo, useState } from "react";

type Quote={id:string;folio:string;cliente:string;pieza:string;material:string;peso:number;horas:number;precio:number;estado:string;created_at:string};
type Config={materialCost:number;electricity:number;machineHour:number;laborHour:number;markup:number;minPrice:number};

const initial:Config={materialCost:420,electricity:3.2,machineHour:12,laborHour:80,markup:45,minPrice:80};
const money=(n:number)=>n.toLocaleString("es-MX",{style:"currency",currency:"MXN"});
const nav=[["dashboard","Dashboard"],["quote","Nueva cotización"],["quotes","Cotizaciones"],["materials","Materiales"],["printers","Impresoras"],["settings","Configuración"]];

export default function Home(){
 const [section,setSection]=useState("dashboard");
 const [quotes,setQuotes]=useState<Quote[]>([]);
 const [config,setConfig]=useState<Config>(initial);
 const [form,setForm]=useState({cliente:"",pieza:"",material:"PLA",peso:100,horas:2,merma:10,mano:0.5,envio:0});
 useEffect(()=>{try{setQuotes(JSON.parse(localStorage.getItem("quotes3d")||"[]"));setConfig({...initial,...JSON.parse(localStorage.getItem("config3d")||"{}")});}catch{}},[]);
 const calc=useMemo(()=>{
   const material=(form.peso*(1+form.merma/100)/1000)*config.materialCost;
   const machine=form.horas*config.machineHour;
   const energy=form.horas*config.electricity;
   const labor=form.mano*config.laborHour;
   const cost=material+machine+energy+labor+Number(form.envio||0);
   const suggested=Math.max(config.minPrice,cost*(1+config.markup/100));
   return {material,machine,energy,labor,cost,suggested};
 },[form,config]);
 const saveConfig=(c:Config)=>{setConfig(c);localStorage.setItem("config3d",JSON.stringify(c));};
 const newQuote=()=>{
   const n=quotes.length+1; const q:Quote={id:crypto.randomUUID(),folio:"C3D-"+String(n).padStart(5,"0"),cliente:form.cliente||"Mostrador",pieza:form.pieza||"Pieza 3D",material:form.material,peso:Number(form.peso),horas:Number(form.horas),precio:Math.round(calc.suggested),estado:"Pendiente",created_at:new Date().toISOString()};
   const next=[q,...quotes];setQuotes(next);localStorage.setItem("quotes3d",JSON.stringify(next));setSection("quotes");
 };
 const total=quotes.reduce((a,q)=>a+q.precio,0);
 return <main className="app">
  <aside className="sidebar">
   <div className="brand"><div className="brandMark">3D</div><div><b>Cotizador 3D</b><span>La Garra Estampa</span></div></div>
   <div className="nav">{nav.map(([id,label])=><button key={id} className={section===id?"active":""} onClick={()=>setSection(id)}><span>{id==="dashboard"?"⌂":id==="quote"?"＋":id==="quotes"?"▤":id==="materials"?"◈":id==="printers"?"▣":"⚙"}</span>{label}</button>)}</div>
   <div className="sidebarFoot">v1.0 · Costeo profesional</div>
  </aside>
  <section className="content">
   <header><div><div className="eyebrow">IMPRESIÓN 3D</div><h1>{section==="dashboard"?"Dashboard":section==="quote"?"Nueva cotización":section==="quotes"?"Cotizaciones":section==="materials"?"Materiales":section==="printers"?"Impresoras":"Configuración"}</h1></div><button className="primary" onClick={()=>setSection("quote")}>＋ Nueva cotización</button></header>
   {section==="dashboard"&&<Dashboard quotes={quotes} total={total} setSection={setSection}/>}
   {section==="quote"&&<QuoteForm form={form} setForm={setForm} calc={calc} save={newQuote}/>}
   {section==="quotes"&&<Quotes quotes={quotes} />}
   {section==="materials"&&<Catalog title="Materiales" items={["PLA","PETG","ABS","TPU","Resina estándar"]} />}
   {section==="printers"&&<Catalog title="Impresoras" items={["Impresora principal","Impresora secundaria","Resin printer"]} />}
   {section==="settings"&&<Settings config={config} save={saveConfig}/>}
  </section>
 </main>
}

function Dashboard({quotes,total,setSection}:{quotes:Quote[];total:number;setSection:(s:string)=>void}){
 const pending=quotes.filter(q=>q.estado==="Pendiente").length;
 return <div className="page">
  <div className="stats"><Stat label="Cotizaciones" value={String(quotes.length)} hint="histórico"/><Stat label="Pendientes" value={String(pending)} hint="por atender"/><Stat label="Venta cotizada" value={money(total)} hint="acumulado"/><Stat label="Ticket promedio" value={money(quotes.length?total/quotes.length:0)} hint="por cotización"/></div>
  <div className="grid2">
   <div className="panel"><div className="panelHead"><div><b>Acciones rápidas</b><p>Empieza una cotización en segundos.</p></div></div><div className="quick"><button onClick={()=>setSection("quote")}><strong>＋</strong><span>Nueva cotización<small>Calcular precio de una pieza</small></span></button><button onClick={()=>setSection("materials")}><strong>◈</strong><span>Materiales<small>Precios por kilogramo</small></span></button><button onClick={()=>setSection("settings")}><strong>⚙</strong><span>Costos<small>Electricidad, máquina y mano de obra</small></span></button></div></div>
   <div className="panel"><div className="panelHead"><div><b>Últimas cotizaciones</b><p>Las más recientes.</p></div><button className="textBtn" onClick={()=>setSection("quotes")}>Ver todas →</button></div><QuoteList quotes={quotes.slice(0,5)}/></div>
  </div>
 </div>
}
function Stat({label,value,hint}:{label:string;value:string;hint:string}){return <div className="stat"><span>{label}</span><b>{value}</b><small>{hint}</small></div>}
function QuoteForm({form,setForm,calc,save}:{form:any;setForm:any;calc:any;save:()=>void}){
 const f=(k:string)=>(e:any)=>setForm({...form,[k]:e.target.type==="number"?Number(e.target.value):e.target.value});
 return <div className="page"><div className="quoteLayout"><div className="panel formPanel"><div className="panelHead"><div><b>Datos de la pieza</b><p>Captura los datos de tu laminador.</p></div></div>
  <div className="formGrid"><Field label="Cliente"><input value={form.cliente} onChange={f("cliente")} placeholder="Nombre del cliente"/></Field><Field label="Nombre de pieza"><input value={form.pieza} onChange={f("pieza")} placeholder="Ej. Soporte personalizado"/></Field><Field label="Material"><select value={form.material} onChange={f("material")}><option>PLA</option><option>PETG</option><option>ABS</option><option>TPU</option><option>Resina</option></select></Field><Field label="Peso (g)"><input type="number" min="0" value={form.peso} onChange={f("peso")}/></Field><Field label="Tiempo de impresión (h)"><input type="number" min="0" step=".1" value={form.horas} onChange={f("horas")}/></Field><Field label="Merma / soportes (%)"><input type="number" min="0" value={form.merma} onChange={f("merma")}/></Field><Field label="Mano de obra (h)"><input type="number" min="0" step=".1" value={form.mano} onChange={f("mano")}/></Field><Field label="Otros costos"><input type="number" min="0" value={form.envio} onChange={f("envio")}/></Field></div>
  <div className="hint">Tip: el peso y tiempo vienen directamente del laminador (Cura, PrusaSlicer, OrcaSlicer, Bambu Studio, etc.).</div>
  </div>
  <div className="panel summary"><div className="summaryTop"><span>COSTEO</span><b>{money(calc.suggested)}</b><small>Precio sugerido</small></div><Line l="Material" v={money(calc.material)}/><Line l="Electricidad" v={money(calc.energy)}/><Line l="Máquina" v={money(calc.machine)}/><Line l="Mano de obra" v={money(calc.labor)}/><Line l="Otros" v={money(Number(form.envio||0))}/><div className="totalLine"><span>Costo real</span><b>{money(calc.cost)}</b></div><div className="margin">Utilidad estimada <strong>{money(calc.suggested-calc.cost)}</strong></div><button className="primary full" onClick={save}>Guardar cotización</button></div></div></div>
}
function Field({label,children}:{label:string;children:React.ReactNode}){return <label className="field"><span>{label}</span>{children}</label>}
function Line({l,v}:{l:string;v:string}){return <div className="line"><span>{l}</span><b>{v}</b></div>}
function Quotes({quotes}:{quotes:Quote[]}){return <div className="page"><div className="panel"><div className="panelHead"><div><b>Historial</b><p>{quotes.length} cotizaciones guardadas.</p></div></div>{quotes.length?<QuoteList quotes={quotes}/>:<Empty/>}</div></div>}
function QuoteList({quotes}:{quotes:Quote[]}){return <div className="table"><div className="tr th"><span>Folio</span><span>Cliente / pieza</span><span>Material</span><span>Precio</span><span>Estado</span></div>{quotes.map(q=><div className="tr" key={q.id}><span className="mono">{q.folio}</span><span><b>{q.cliente}</b><small>{q.pieza}</small></span><span>{q.material} · {q.peso} g</span><span><b>{money(q.precio)}</b></span><span><em>{q.estado}</em></span></div>)}</div>}
function Empty(){return <div className="empty">Aún no hay cotizaciones. Crea la primera desde <b>Nueva cotización</b>.</div>}
function Catalog({title,items}:{title:string;items:string[]}){return <div className="page"><div className="panel"><div className="panelHead"><div><b>{title}</b><p>Catálogo preparado para conectarse a Supabase.</p></div><button className="primary">＋ Agregar</button></div><div className="catalog">{items.map((x,i)=><div className="catalogItem" key={x}><div className="avatar">{i+1}</div><div><b>{x}</b><small>{title==="Materiales"?"Costo configurable por kg":"Costo configurable por hora"}</small></div><span>Configurar →</span></div>)}</div></div></div>}
function Settings({config,save}:{config:Config;save:(c:Config)=>void}){const [c,setC]=useState(config);const f=(k:keyof Config)=>(e:any)=>setC({...c,[k]:Number(e.target.value)});return <div className="page"><div className="panel settings"><div className="panelHead"><div><b>Parámetros de costeo</b><p>Estos valores determinan el precio sugerido.</p></div></div><div className="formGrid"><Field label="Filamento ($/kg)"><input type="number" value={c.materialCost} onChange={f("materialCost")}/></Field><Field label="Electricidad ($/kWh)"><input type="number" step=".01" value={c.electricity} onChange={f("electricity")}/></Field><Field label="Máquina ($/hora)"><input type="number" step=".1" value={c.machineHour} onChange={f("machineHour")}/></Field><Field label="Mano de obra ($/hora)"><input type="number" value={c.laborHour} onChange={f("laborHour")}/></Field><Field label="Utilidad (%)"><input type="number" value={c.markup} onChange={f("markup")}/></Field><Field label="Precio mínimo ($)"><input type="number" value={c.minPrice} onChange={f("minPrice")}/></Field></div><button className="primary" onClick={()=>save(c)}>Guardar configuración</button></div></div>}
