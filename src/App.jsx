import './storage.js';
import { useState, useEffect, useRef, useCallback } from "react";

// ═══════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════
const LEVELS = [
  { lv:1,  xp:0,      title:"Iniciante",        color:"#9ca3af", months:0  },
  { lv:2,  xp:200,    title:"Aprendiz",          color:"#60a5fa", months:1  },
  { lv:3,  xp:500,    title:"Determinado",       color:"#34d399", months:2  },
  { lv:4,  xp:1000,   title:"Persistente",       color:"#a78bfa", months:3  },
  { lv:5,  xp:1800,   title:"Disciplinado",      color:"#f59e0b", months:4  },
  { lv:6,  xp:3000,   title:"Evoluindo",         color:"#f97316", months:5  },
  { lv:7,  xp:4800,   title:"Guerreiro",         color:"#ef4444", months:6  },
  { lv:8,  xp:7500,   title:"Veterano",          color:"#ec4899", months:8  },
  { lv:9,  xp:11000,  title:"Elite",             color:"#8b5cf6", months:10 },
  { lv:10, xp:16000,  title:"Mestre",            color:"#06b6d4", months:12 },
  { lv:11, xp:23000,  title:"Lenda",             color:"#84cc16", months:15 },
  { lv:12, xp:33000,  title:"Imparável",         color:"#f0c040", months:18 },
  { lv:13, xp:47000,  title:"Fenômeno",          color:"#ff6b6b", months:21 },
  { lv:14, xp:66000,  title:"Excepcional",       color:"#4ecdc4", months:24 },
  { lv:15, xp:92000,  title:"Extraordinário",    color:"#a855f7", months:27 },
  { lv:16, xp:128000, title:"Transcendente",     color:"#f43f5e", months:30 },
  { lv:17, xp:175000, title:"Mítico",            color:"#fb923c", months:33 },
  { lv:18, xp:240000, title:"Lendário",          color:"#38bdf8", months:36 },
  { lv:19, xp:325000, title:"Supremo",           color:"#e879f9", months:42 },
  { lv:20, xp:440000, title:"★ FORMA FINAL ★",  color:"#f0c040", months:48 },
];

const DYNAMIC_TITLES = [
  { cond:(s,lv)=>lv>=20&&(s.forca||0)>=25,                 title:"C B U M",              icon:"🏆" },
  { cond:(s,lv)=>lv>=20&&(s.totalKm||0)>=200,              title:"Usain Bolt",            icon:"⚡" },
  { cond:(s,lv)=>lv>=20&&(s.totalStudyHours||0)>=500,      title:"Einstein",              icon:"🧠" },
  { cond:(s,lv)=>lv>=20&&(s.streakBest||0)>=180,           title:"Miyamoto Musashi",      icon:"⚔️"  },
  { cond:(_,lv)=>lv>=17,                                    title:"Forma Mítica",          icon:"✨" },
  { cond:(_,lv)=>lv>=14,                                    title:"Ser Excepcional",       icon:"💎" },
  { cond:(_,lv)=>lv>=11,                                    title:"Lenda Viva",            icon:"🌟" },
  { cond:(_,lv)=>lv>=8,                                     title:"Veterano de Elite",     icon:"🎖️" },
  { cond:(s,lv)=>lv>=5&&(s.streakBest||0)>=30,             title:"Monge da Rotina",       icon:"🧘" },
  { cond:(s,lv)=>lv>=5&&(s.forca||0)>=15,                  title:"Guerreiro Físico",      icon:"💪" },
  { cond:(s,lv)=>lv>=5&&(s.totalStudyHours||0)>=100,       title:"Estrategista",          icon:"🎯" },
  { cond:()=>true,                                           title:"Guerreiro Estrategista",icon:"⚔️" },
];

const DEFAULT_PLANS = {
  A:{ id:"A", label:"Treino A", focus:"Peito · Tríceps · Ombro", icon:"🏋️", color:"#ef4444", isDefault:true,
    exercises:[
      {id:"fP",  name:"Flexão de Peito",          sets:4, reps:"15",      rest:"60s", tip:"Cotovelos 45° do corpo"},
      {id:"fT",  name:"Flexão Fechada (Tríceps)", sets:3, reps:"12",      rest:"60s", tip:"Mãos próximas no chão"},
      {id:"fO",  name:"Flexão Pike (Ombro)",      sets:3, reps:"10",      rest:"60s", tip:"Quadril elevado"},
      {id:"mT",  name:"Mergulho Tríceps",         sets:3, reps:"12",      rest:"60s", tip:"Use cadeira ou banco"},
      {id:"eL",  name:"Elevação Lateral",         sets:3, reps:"15",      rest:"45s", tip:"Com garrafa ou peso"},
    ]},
  B:{ id:"B", label:"Treino B", focus:"Costas · Bíceps · Barra", icon:"🦾", color:"#60a5fa", isDefault:true,
    exercises:[
      {id:"bF",  name:"Barra Fixa",               sets:4, reps:"Máx",     rest:"90s", tip:"Meta TAF: 6+ reps"},
      {id:"bS",  name:"Barra Supinada (Bíceps)",  sets:3, reps:"8",       rest:"90s", tip:"Pegada voltada pra você"},
      {id:"rI",  name:"Remada Invertida",         sets:4, reps:"12",      rest:"60s", tip:"Embaixo de mesa"},
      {id:"rB",  name:"Rosca Bíceps",             sets:3, reps:"15",      rest:"60s", tip:"Com garrafa ou peso"},
      {id:"sup", name:"Superman (Lombar)",        sets:3, reps:"15",      rest:"45s", tip:"Deitado, eleve braços e pernas"},
    ]},
  C:{ id:"C", label:"Treino C", focus:"Pernas · Core · Abdominal", icon:"🦵", color:"#34d399", isDefault:true,
    exercises:[
      {id:"ag",  name:"Agachamento Livre",        sets:4, reps:"20",      rest:"60s", tip:"Joelhos não passam a ponta do pé"},
      {id:"av",  name:"Avanço (Lunge)",           sets:3, reps:"12 cada", rest:"60s", tip:"Alterne as pernas"},
      {id:"ab",  name:"Abdominal",                sets:4, reps:"25",      rest:"60s", tip:"Meta TAF: 30 em 1 minuto"},
      {id:"pr",  name:"Prancha Isométrica",       sets:3, reps:"45s",     rest:"30s", tip:"Corpo reto, respire fundo"},
      {id:"mc",  name:"Mountain Climber",         sets:3, reps:"20 cada", rest:"45s", tip:"Joelhos ao peito"},
    ]},
  D:{ id:"D", label:"Treino D", focus:"TAF · Cooper · Resistência", icon:"🏃", color:"#f59e0b", isDefault:true,
    exercises:[
      {id:"cp",  name:"Teste de Cooper (12min)",  sets:1, reps:"12min",   rest:"—",   tip:"Meta TAF: +2.400m homens"},
      {id:"fTAF",name:"Flexão TAF (1 min)",       sets:1, reps:"Máx/60s", rest:"2min",tip:"Meta: 30+ repetições"},
      {id:"aTAF",name:"Abdominal TAF (1 min)",    sets:1, reps:"Máx/60s", rest:"2min",tip:"Meta: 30+ repetições"},
      {id:"bu",  name:"Burpee",                   sets:3, reps:"10",      rest:"60s", tip:"Flexão + salto completo"},
      {id:"po",  name:"Polichinelo",              sets:3, reps:"30",      rest:"30s", tip:"Aquecimento e resistência"},
    ]},
};

const DEFAULT_CONCURSO = {
  id:"bb", name:"Banco do Brasil", active:true,
  subjects:[
    {id:"port",  name:"Língua Portuguesa",       icon:"📝", color:"#60a5fa"},
    {id:"logica",name:"Raciocínio Lógico",       icon:"🧩", color:"#a78bfa"},
    {id:"matfin",name:"Matemática,   icon:"📊", color:"#34d399"},
    {id:"banc",  name:"Conhecimentos Bancários", icon:"🏦", color:"#f59e0b"},
    {id:"atual", name:"Atualidades do Mercado",  icon:"📰", color:"#f97316"},
    {id:"info",  name:"Informática",             icon:"💻", color:"#22d3ee"},
    {id:"ing",   name:"Inglês",                  icon:"🌎", color:"#ec4899"},
    {id:"redac", name:"Redação",                 icon:"✍️", color:"#84cc16"},
  ],
  subjectMin:{}, questions:{}, studySessions:[],
};

const QUESTS = [
  {id:"study_1h",label:"Estudar 1 hora",   xp:30,icon:"📚",cat:"mente",     core:true},
  {id:"study_2h",label:"Estudar 2ª hora",  xp:25,icon:"📖",cat:"mente",     req:"study_1h"},
  {id:"read",    label:"Ler livro",         xp:15,icon:"📕",cat:"mente"},
  {id:"workout", label:"Treino completo",   xp:30,icon:"💪",cat:"corpo",     core:true},
  {id:"run",     label:"Corrida",           xp:20,icon:"🏃",cat:"corpo"},
  {id:"sleep",   label:"Dormir bem",        xp:30,icon:"😴",cat:"disciplina",core:true},
  {id:"organize",label:"Organizar rotina",  xp:10,icon:"📋",cat:"disciplina"},
];
const PENALTIES=[
  {id:"miss_train",    label:"Faltei o treino",   xp:-30,icon:"😤"},
  {id:"procrastinate", label:"Procrastinei o dia", xp:-20,icon:"😔"},
];
const BOSS_POOL=[
  {name:"Semana do Estudioso",icon:"📚",desc:"600min estudo + 3 treinos",         xp:200,goals:{studyMin:600,trainCount:3}},
  {name:"Semana do Guerreiro",icon:"⚔️", desc:"5 treinos + 10km corrida",          xp:180,goals:{trainCount:5,runKm:10}},
  {name:"Semana da Precisão", icon:"🎯",desc:"80 questões + 480min estudo",       xp:220,goals:{questions:80,studyMin:480}},
  {name:"Semana Imparável",   icon:"👑",desc:"900min + 4 treinos + 50 questões",  xp:300,goals:{studyMin:900,trainCount:4,questions:50}},
];

const AVATAR_SKINS=["#FDBCB4","#F1C27D","#E0AC69","#C68642","#8D5524"];
const AVATAR_HAIRS=["#1a0a00","#4a2c00","#8B4513","#DAA520","#FF6B6B","#E0E0E0","#2c3e50","#e91e63"];
const AVATAR_EXPRESSIONS=[{id:"happy",l:"😊"},{id:"focused",l:"😤"},{id:"cool",l:"😎"},{id:"tired",l:"😴"}];
const AVATAR_HAIR_STYLES=[{id:"short",l:"Curto"},{id:"medium",l:"Médio"},{id:"mohawk",l:"Moicano"},{id:"bald",l:"Careca"}];
const PLAN_ICONS=["🏋️","🦾","🦵","🏃","🥊","🤸","⚡","🔥","💥","🎯"];
const PLAN_COLORS=["#ef4444","#60a5fa","#34d399","#f59e0b","#a78bfa","#f97316","#ec4899","#22d3ee","#84cc16","#f0c040"];

const RUN_XP=(km)=>km>=10?60:km>=8?48:km>=6?38:km>=4?28:km>=2?18:10;
const FIN_XP=(v)=>v>=500?40:v>=300?30:v>=100?20:10;
const catColor={mente:"#60a5fa",corpo:"#ef4444",disciplina:"#a78bfa"};

// ═══════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════
const todayStr=()=>new Date().toISOString().slice(0,10);
const fmtTime=(s)=>{const h=Math.floor(s/3600),m=Math.floor((s%3600)/60),sc=s%60;return h?`${h}:${String(m).padStart(2,"0")}:${String(sc).padStart(2,"0")}`:`${String(m).padStart(2,"0")}:${String(sc).padStart(2,"0")}`;};
const fmtHM=(m)=>!m?"-":m<60?`${m}min`:`${Math.floor(m/60)}h${m%60?` ${m%60}min`:""}`;
const fmtKm=(k)=>k?(+k).toFixed(1)+"km":"—";
const pct=(a,b)=>b?Math.round((a/b)*100):0;
const curr=(v)=>`R$ ${(+v||0).toLocaleString("pt-BR",{minimumFractionDigits:2,maximumFractionDigits:2})}`;
const uid=()=>Math.random().toString(36).slice(2,8);
const weekId=()=>{const d=new Date(),j=new Date(d.getFullYear(),0,1);return `${d.getFullYear()}-W${Math.ceil(((d-j)/86400000+j.getDay()+1)/7)}`;};
const unlockDate=(m)=>{const d=new Date("2026-03-15");d.setMonth(d.getMonth()+m);return d;};
const timeUnlocked=(m)=>new Date()>=unlockDate(m);
const daysLeft=(d)=>Math.max(0,Math.ceil((d-new Date())/(864e5)));
const bmiCat=(b)=>b<18.5?{l:"Abaixo do peso",c:"#60a5fa",t:"Aumente a ingestão calórica."}:b<25?{l:"Peso ideal ✓",c:"#22c55e",t:"Parabéns! Mantenha a rotina."}:b<30?{l:"Sobrepeso",c:"#f59e0b",t:"Combine cardio com controle alimentar."}:b<35?{l:"Obesidade I",c:"#f97316",t:"Consulte um profissional de saúde."}:{l:"Obesidade II+",c:"#ef4444",t:"Busque acompanhamento médico."};
function getLvl(xp){let cur=LEVELS[0],nxt=LEVELS[1];for(let i=0;i<LEVELS.length;i++){if(xp>=LEVELS[i].xp&&timeUnlocked(LEVELS[i].months)){cur=LEVELS[i];nxt=LEVELS[i+1]||null;}}return {cur,nxt};}
function getDynTitle(s,lv){return DYNAMIC_TITLES.find(t=>t.cond(s,lv))||DYNAMIC_TITLES[DYNAMIC_TITLES.length-1];}
function streakMulti(s){return s>=30?1.25:s>=7?1.10:1;}
async function sg(k){try{const r=await window.storage.get(k);return r?JSON.parse(r.value):null;}catch{return null;}}
async function ss(k,v){try{await window.storage.set(k,JSON.stringify(v));}catch{}}

const START={
  username:"Jhonas",totalXP:30,
  attrs:{forca:6,resistencia:5,inteligencia:6,foco:5,mental:4,disciplina:4},
  stats:{totalWorkouts:0,totalStudyHours:0,activeDays:0,totalQuests:0,totalKm:0,totalRuns:0,prKm:0,totalQuestions:0,booksFinished:0,streakBest:0,bossesCleared:0},
  streak:{current:0,best:0,lastDate:""},
  boss:{weekId:"",type:0,studyMin:0,trainCount:0,questions:0,runKm:0,claimed:false},
  concursos:[{...DEFAULT_CONCURSO,subjectMin:{},questions:{},studySessions:[]}],
  activeConcurso:"bb",
  books:{current:{title:"Inteligência Emocional",author:"Daniel Goleman",page:456,total:551,startDate:"2026-03-15"},library:[]},
  runs:[],workoutLog:[],workoutPlans:null,unlockedAch:[],questionLog:[],
  finance:{salary:800,expenses:[
    {id:"food",   name:"Alimentação",  amount:300,icon:"🍽️",paid:false,installments:null},
    {id:"phone",  name:"Plano Celular",amount:50, icon:"📱",paid:false,installments:null},
    {id:"inet",   name:"Internet",     amount:80, icon:"🌐",paid:false,installments:null},
  ]},
  avatar:{skin:0,hair:0,hairStyle:"short",expression:"happy"},
  body:{weight:"",height:""},
};

// ═══════════════════════════════════════════════════════════════
// AVATAR
// ═══════════════════════════════════════════════════════════════
function AvatarSVG({skin=0,hair=0,hairStyle="short",expression="happy",size=80}){
  const sc=AVATAR_SKINS[skin]||AVATAR_SKINS[0];
  const hc=AVATAR_HAIRS[hair]||AVATAR_HAIRS[0];
  const mouth={happy:"M 38 58 Q 50 66 62 58",focused:"M 38 60 L 62 60",cool:"M 38 60 Q 50 56 62 60",tired:"M 40 62 Q 50 58 60 62"};
  const eyes={happy:"M 38 46 Q 41 42 44 46 M 56 46 Q 59 42 62 46",focused:"M 37 45 L 44 45 M 56 45 L 63 45",cool:"M 36 45 L 45 48 M 55 48 L 64 45",tired:"M 38 45 Q 41 48 44 45 M 56 45 Q 59 48 62 45"};
  const hp={short:`M 22 50 Q 22 21 50 18 Q 78 21 78 50 Z`,medium:`M 18 58 Q 18 18 50 16 Q 82 18 82 58 Z`,mohawk:`M 42 28 L 50 8 L 58 28 Z`,bald:null};
  return(
    <svg width={size} height={size} viewBox="0 0 100 100">
      <rect x="41" y="77" width="18" height="14" rx="3" fill={sc}/>
      <ellipse cx="50" cy="95" rx="26" ry="9" fill="#1a1535"/>
      <circle cx="50" cy="50" r="28" fill={sc}/>
      {hp[hairStyle]&&<path d={hp[hairStyle]} fill={hc}/>}
      <path d={eyes[expression]||eyes.happy} stroke="#1a0a00" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M 50 50 L 48 55 L 52 55" stroke={skin===0?"#e8a090":"#7a5230"} strokeWidth="1.5" fill="none" strokeLinecap="round"/>
      <path d={mouth[expression]||mouth.happy} stroke="#1a0a00" strokeWidth="2" fill="none" strokeLinecap="round"/>
      <ellipse cx="22" cy="52" rx="4" ry="6" fill={sc}/>
      <ellipse cx="78" cy="52" rx="4" ry="6" fill={sc}/>
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════
// APP
// ═══════════════════════════════════════════════════════════════
export default function App(){
  const [tab,setTab]=useState("home");
  const [char,setChar]=useState(null);
  const [quests,setQuests]=useState({});
  const [pens,setPens]=useState({});
  const [loading,setLoading]=useState(true);
  const [floats,setFloats]=useState([]);
  const [lvlUpMsg,setLvlUp]=useState(null);
  const [toast,setToast]=useState(null);

  const [studyTab,setStudyTab]=useState("timer");
  const [bodyTab,setBodyTab]=useState("treino");
  const [lifeTab,setLifeTab]=useState("financeiro");
  const [dailyTab,setDailyTab]=useState("missoes");
  const [qPeriod,setQPeriod]=useState("all");

  // Timer
  const [timerOn,setTimerOn]=useState(false);
  const [timerSub,setTimerSub]=useState(null);
  const [elapsed,setElapsed]=useState(0);
  const m1=useRef(false),m2=useRef(false);

  // Workout states
  const [activeWorkout,setActiveWorkout]=useState(null);
  const [doneEx,setDoneEx]=useState({});
  const [workoutView,setWorkoutView]=useState("list"); // list | active | edit | new
  const [editingPlanKey,setEditingPlanKey]=useState(null);
  const [editPlan,setEditPlan]=useState(null);
  const [newPlanName,setNewPlanName]=useState("");
  const [newPlanFocus,setNewPlanFocus]=useState("");
  const [newPlanIcon,setNewPlanIcon]=useState("🏋️");
  const [newPlanColor,setNewPlanColor]=useState("#ef4444");
  const [newExName,setNewExName]=useState("");
  const [newExSets,setNewExSets]=useState("3");
  const [newExReps,setNewExReps]=useState("12");
  const [newExRest,setNewExRest]=useState("60s");
  const [newExTip,setNewExTip]=useState("");

  // Forms
  const [qSub,setQSub]=useState("");
  const [qCorr,setQCorr]=useState("");
  const [qTot,setQTot]=useState("");
  const [bookTitle,setBookTitle]=useState("");
  const [bookAuthor,setBookAuthor]=useState("");
  const [bookPages,setBookPages]=useState("");
  const [bookPage,setBookPage]=useState("");
  const [addingBook,setAddingBook]=useState(false);
  const [runKm,setRunKm]=useState("");
  const [runMin,setRunMin]=useState("");
  const [weightIn,setWeightIn]=useState("");
  const [heightIn,setHeightIn]=useState("");
  const [newExpName,setNewExpName]=useState("");
  const [newExpAmt,setNewExpAmt]=useState("");
  const [newExpIcon,setNewExpIcon]=useState("💳");
  const [newExpInst,setNewExpInst]=useState("");
  const [newExpTotal,setNewExpTotal]=useState("");
  const [addingExp,setAddingExp]=useState(false);
  const [editingSalary,setEditingSalary]=useState(false);
  const [salaryIn,setSalaryIn]=useState("");
  const [addingConcurso,setAddingConcurso]=useState(false);
  const [newConcName,setNewConcName]=useState("");
  const [editingUsername,setEditingUsername]=useState(false);
  const [usernameIn,setUsernameIn]=useState("");
  const [showAvatarEditor,setShowAvatarEditor]=useState(false);

  const charRef=useRef(null);
  const questsRef=useRef({});
  useEffect(()=>{charRef.current=char;},[char]);
  useEffect(()=>{questsRef.current=quests;},[quests]);

  // LOAD
  useEffect(()=>{
    (async()=>{
      const c=await sg("rpg_v6_char");
      const q=await sg(`rpg_v6_q_${todayStr()}`);
      const p=await sg(`rpg_v6_p_${todayStr()}`);
      let loaded;
      if(c){
        loaded={...START,...c,
          stats:{...START.stats,...(c.stats||{})},
          finance:{salary:c.finance?.salary||800,expenses:c.finance?.expenses||START.finance.expenses},
          streak:{...START.streak,...(c.streak||{})},
          boss:{...START.boss,...(c.boss||{})},
          books:{current:c.books?.current||null,library:c.books?.library||[]},
          concursos:c.concursos||[{...DEFAULT_CONCURSO}],
          avatar:c.avatar||START.avatar,body:c.body||START.body,
          workoutPlans:c.workoutPlans||null,
          runs:c.runs||[],workoutLog:c.workoutLog||[],unlockedAch:c.unlockedAch||[],
          questionLog:c.questionLog||[],
        };
      } else { loaded={...START}; }
      const wid=weekId();
      if(loaded.boss.weekId!==wid){
        const wn=parseInt(wid.split("W")[1])||0;
        loaded.boss={weekId:wid,type:wn%BOSS_POOL.length,studyMin:0,trainCount:0,questions:0,runKm:0,claimed:false};
      }
      setChar(loaded);setQuests(q||{});setPens(p||{});
      const ac=loaded.concursos?.find(c2=>c2.id===loaded.activeConcurso);
      if(ac?.subjects?.length) setQSub(ac.subjects[0].id);
      setLoading(false);
    })();
  },[]);

  useEffect(()=>{
    if(!timerOn) return;
    const iv=setInterval(()=>setElapsed(e=>{
      const ne=e+1;
      if(ne===3600&&!m1.current){m1.current=true;autoQuest("study_1h",30);}
      if(ne===7200&&!m2.current){m2.current=true;autoQuest("study_2h",25);}
      return ne;
    }),1000);
    return()=>clearInterval(iv);
  },[timerOn]);

  const addFloat=useCallback((xp)=>{
    const id=Date.now()+Math.random();
    setFloats(f=>[...f,{id,xp}]);
    setTimeout(()=>setFloats(f=>f.filter(x=>x.id!==id)),2500);
  },[]);

  const showToast=(msg,color="#f0c040")=>{setToast({msg,color});setTimeout(()=>setToast(null),2800);};
  const save=async(c,q,p)=>{await ss("rpg_v6_char",c);if(q!=null)await ss(`rpg_v6_q_${todayStr()}`,q);if(p!=null)await ss(`rpg_v6_p_${todayStr()}`,p);};

  const applyDelta=(c,oldQ,newQ,raw)=>{
    const multi=streakMulti(c.streak?.current||0);
    const bonus=raw>0?Math.round(raw*(multi-1)):0;
    const cores=QUESTS.filter(q=>q.core).map(q=>q.id);
    const hadB=cores.every(id=>oldQ[id]),hasB=cores.every(id=>newQ[id]);
    return Math.round(raw+bonus)+(hadB===hasB?0:hasB?20:-20);
  };

  const triggerLvl=(prev,next)=>{
    if(getLvl(next).cur.lv>getLvl(prev).cur.lv){
      const d=LEVELS.find(l=>l.lv===getLvl(next).cur.lv);
      setLvlUp(d);setTimeout(()=>setLvlUp(null),3500);
    }
  };

  const updateStreak=(c,newQ)=>{
    const cores=QUESTS.filter(q=>q.core).map(q=>q.id);
    if(!cores.every(id=>newQ[id])) return c.streak;
    const td=todayStr(),s={...c.streak};
    if(s.lastDate===td) return s;
    const yest=new Date();yest.setDate(yest.getDate()-1);
    s.current=s.lastDate===yest.toISOString().slice(0,10)?s.current+1:1;
    s.best=Math.max(s.best,s.current);s.lastDate=td;return s;
  };

  const autoQuest=useCallback((qid,xp)=>{
    const c=charRef.current,q=questsRef.current;
    if(!c||q[qid]) return;
    const newQ={...q,[qid]:true};questsRef.current=newQ;setQuests(newQ);
    const delta=applyDelta(c,q,newQ,xp);
    const newXP=Math.max(0,c.totalXP+delta);
    const nc={...c,totalXP:newXP,stats:{...c.stats,totalStudyHours:(c.stats.totalStudyHours||0)+1,totalQuests:(c.stats.totalQuests||0)+1},boss:{...c.boss,studyMin:(c.boss.studyMin||0)+60}};
    charRef.current=nc;setChar(nc);addFloat(delta);triggerLvl(c.totalXP,newXP);save(nc,newQ,null);
  },[addFloat]);

  const toggleQuest=async(quest)=>{
    if(quest.req&&!quests[quest.req]) return;
    const wasOn=!!quests[quest.id];
    const newQ={...quests,[quest.id]:!wasOn};setQuests(newQ);questsRef.current=newQ;
    const raw=wasOn?-quest.xp:quest.xp;
    const ns={...char.stats};
    if(!wasOn){if(quest.id==="workout")ns.totalWorkouts=(ns.totalWorkouts||0)+1;if(quest.id==="study_1h"||quest.id==="study_2h")ns.totalStudyHours=(ns.totalStudyHours||0)+1;ns.totalQuests=(ns.totalQuests||0)+1;}
    else{if(quest.id==="workout")ns.totalWorkouts=Math.max(0,(ns.totalWorkouts||0)-1);ns.totalQuests=Math.max(0,(ns.totalQuests||0)-1);}
    const delta=applyDelta(char,quests,newQ,raw);
    const newXP=Math.max(0,char.totalXP+delta);
    const newStreak=!wasOn?updateStreak({...char,stats:ns},newQ):char.streak;
    if(newStreak.current>(ns.streakBest||0)) ns.streakBest=newStreak.current;
    const newBoss={...char.boss};
    if(!wasOn&&quest.id==="workout") newBoss.trainCount=(newBoss.trainCount||0)+1;
    const nc={...char,totalXP:newXP,stats:ns,streak:newStreak,boss:newBoss};
    charRef.current=nc;setChar(nc);addFloat(delta);triggerLvl(char.totalXP,newXP);await save(nc,newQ,null);
  };

  const togglePen=async(pen)=>{
    const wasOn=!!pens[pen.id];const newP={...pens,[pen.id]:!wasOn};setPens(newP);
    const delta=wasOn?-pen.xp:pen.xp;const newXP=Math.max(0,char.totalXP+delta);
    const nc={...char,totalXP:newXP};charRef.current=nc;setChar(nc);addFloat(delta);await save(nc,null,newP);
  };

  const startTimer=(s)=>{if(timerOn)return;m1.current=false;m2.current=false;setTimerSub(s);setElapsed(0);setTimerOn(true);};
  const stopTimer=async()=>{
    if(!timerOn||!timerSub) return;setTimerOn(false);
    const mins=Math.floor(elapsed/60);if(mins<1){setElapsed(0);setTimerSub(null);return;}
    const c=charRef.current;
    const concs=c.concursos.map(cc=>{if(cc.id!==c.activeConcurso)return cc;
      const sm={...(cc.subjectMin||{}),[timerSub]:((cc.subjectMin||{})[timerSub]||0)+mins};
      return {...cc,subjectMin:sm,studySessions:[{date:todayStr(),subject:timerSub,minutes:mins},...(cc.studySessions||[])].slice(0,40)};});
    const nc={...c,concursos:concs,boss:{...c.boss,studyMin:(c.boss.studyMin||0)+mins}};
    charRef.current=nc;setChar(nc);await save(nc,null,null);
    setElapsed(0);setTimerSub(null);m1.current=false;m2.current=false;showToast(`Sessão salva: ${fmtHM(mins)}`,"#60a5fa");
  };

  const getPlans=()=>char?.workoutPlans||DEFAULT_PLANS;

  // ── WORKOUT EDITOR ──
  const openEditPlan=(key)=>{
    const plans=getPlans();
    setEditingPlanKey(key);
    setEditPlan(JSON.parse(JSON.stringify(plans[key])));
    setWorkoutView("edit");
  };

  const saveEditPlan=async()=>{
    if(!editPlan) return;
    const c=charRef.current;
    const plans={...getPlans(),[editingPlanKey]:editPlan};
    const nc={...c,workoutPlans:plans};
    charRef.current=nc;setChar(nc);await save(nc,null,null);
    setWorkoutView("list");setEditingPlanKey(null);setEditPlan(null);
    showToast("Treino salvo!","#ef4444");
  };

  const addExerciseToEdit=()=>{
    if(!newExName.trim()) return;
    const ex={id:uid(),name:newExName,sets:parseInt(newExSets)||3,reps:newExReps||"12",rest:newExRest||"60s",tip:newExTip||""};
    setEditPlan(p=>({...p,exercises:[...p.exercises,ex]}));
    setNewExName("");setNewExSets("3");setNewExReps("12");setNewExRest("60s");setNewExTip("");
  };

  const removeExercise=(idx)=>setEditPlan(p=>({...p,exercises:p.exercises.filter((_,i)=>i!==idx)}));

  const updateExField=(idx,field,val)=>setEditPlan(p=>{
    const exs=[...p.exercises];exs[idx]={...exs[idx],[field]:val};return {...p,exercises:exs};
  });

  const createNewPlan=async()=>{
    if(!newPlanName.trim()) return;
    const key=`custom_${uid()}`;
    const plan={id:key,label:newPlanName,focus:newPlanFocus||"Treino personalizado",icon:newPlanIcon,color:newPlanColor,isDefault:false,exercises:[]};
    const c=charRef.current;
    const plans={...getPlans(),[key]:plan};
    const nc={...c,workoutPlans:plans};
    charRef.current=nc;setChar(nc);await save(nc,null,null);
    setNewPlanName("");setNewPlanFocus("");setWorkoutView("list");
    showToast("Nova ficha criada!",newPlanColor);
  };

  const deletePlan=async(key)=>{
    const plans=getPlans();
    if(Object.keys(plans).length<=1){showToast("Mantenha ao menos 1 treino","#ef4444");return;}
    const newPlans={...plans};delete newPlans[key];
    const c=charRef.current;const nc={...c,workoutPlans:newPlans};
    charRef.current=nc;setChar(nc);await save(nc,null,null);showToast("Ficha removida","#ef4444");
  };

  const startWorkout=(key)=>{setActiveWorkout(key);setDoneEx({});setWorkoutView("active");};
  const finishWorkout=async()=>{
    const plan=getPlans()[activeWorkout];
    const done2=plan.exercises.filter(e=>doneEx[e.id]).length;
    const xp=done2===plan.exercises.length?35:Math.round((done2/plan.exercises.length)*25);
    const c=charRef.current;
    const newStats={...c.stats,totalWorkouts:(c.stats.totalWorkouts||0)+1};
    const log2={date:todayStr(),workout:activeWorkout,label:plan.label,done:done2,total:plan.exercises.length,xp};
    const newXP=Math.max(0,c.totalXP+xp);
    const newQ={...questsRef.current,workout:true};setQuests(newQ);questsRef.current=newQ;
    const nc={...c,totalXP:newXP,stats:newStats,boss:{...c.boss,trainCount:(c.boss.trainCount||0)+1},workoutLog:[log2,...(c.workoutLog||[])].slice(0,30)};
    charRef.current=nc;setChar(nc);addFloat(xp);triggerLvl(c.totalXP,newXP);await save(nc,newQ,null);
    setActiveWorkout(null);setDoneEx({});setWorkoutView("list");showToast(`${plan.label} concluído! +${xp} XP`,plan.color);
  };

  // questões
  const submitQ=async()=>{
    const cor=parseInt(qCorr),tot=parseInt(qTot);if(!cor||!tot||cor>tot) return;
    const c=charRef.current;
    const concs=c.concursos.map(cc=>{if(cc.id!==c.activeConcurso)return cc;
      const prev=(cc.questions||{})[qSub]||{correct:0,total:0};
      return {...cc,questions:{...(cc.questions||{}),[qSub]:{correct:prev.correct+cor,total:prev.total+tot}}};});
    const xpGain=Math.round(cor*0.5);const newXP=Math.max(0,c.totalXP+xpGain);
    const newLog=[{date:todayStr(),subject:qSub,correct:cor,total:tot,concurso:c.activeConcurso},...(c.questionLog||[])].slice(0,500);
    const nc={...c,totalXP:newXP,stats:{...c.stats,totalQuestions:(c.stats.totalQuestions||0)+tot},concursos:concs,boss:{...c.boss,questions:(c.boss.questions||0)+tot},questionLog:newLog};
    charRef.current=nc;setChar(nc);addFloat(xpGain);triggerLvl(c.totalXP,newXP);await save(nc,null,null);
    setQCorr("");setQTot("");showToast(`+${xpGain} XP · ${cor}/${tot} acertos`,"#a78bfa");
  };

  const getQStats=(sub,ac)=>{
    if(qPeriod==="all") return (ac?.questions||{})[sub]||{correct:0,total:0};
    const days=qPeriod==="today"?0:qPeriod==="7d"?7:30;
    const cutoff=new Date();if(days>0)cutoff.setDate(cutoff.getDate()-days);
    const logs=(char.questionLog||[]).filter(l=>l.concurso===char.activeConcurso&&l.subject===sub&&(days===0?l.date===todayStr():new Date(l.date)>=cutoff));
    return {correct:logs.reduce((a,l)=>a+l.correct,0),total:logs.reduce((a,l)=>a+l.total,0)};
  };

  // livros
  const updatePage=async()=>{const p=parseInt(bookPage);if(!p||!char.books.current)return;const np=Math.min(p,char.books.current.total);const nc={...char,books:{...char.books,current:{...char.books.current,page:np}}};charRef.current=nc;setChar(nc);await save(nc,null,null);setBookPage("");showToast(`Página ${np} salva!`,"#60a5fa");};
  const finishBook=async()=>{const c=charRef.current;if(!c.books.current)return;const done={...c.books.current,finishedDate:todayStr()};const nc={...c,totalXP:c.totalXP+80,stats:{...c.stats,booksFinished:(c.stats.booksFinished||0)+1},books:{current:null,library:[done,...(c.books.library||[])]}};charRef.current=nc;setChar(nc);addFloat(80);triggerLvl(c.totalXP,nc.totalXP);await save(nc,null,null);showToast("📚 Livro finalizado! +80 XP","#f0c040");};
  const addBook=async()=>{if(!bookTitle||!bookPages)return;const book={title:bookTitle,author:bookAuthor,page:0,total:parseInt(bookPages),startDate:todayStr()};const c=charRef.current;const library=c.books.current?[{...c.books.current},...(c.books.library||[])]:c.books.library||[];const nc={...c,books:{current:book,library}};charRef.current=nc;setChar(nc);await save(nc,null,null);setBookTitle("");setBookAuthor("");setBookPages("");setAddingBook(false);showToast("📖 Livro adicionado!","#60a5fa");};

  // corrida
  const logRun=async()=>{
    const km=parseFloat(runKm),min2=parseFloat(runMin);if(!km||km<=0)return;
    const c=charRef.current;const isPR=km>(c.stats.prKm||0);const xpGain=RUN_XP(km)+(isPR?20:0);
    const pace=min2&&km?Math.round((min2/km)*60):null;
    const ns={...c.stats,totalKm:(c.stats.totalKm||0)+km,totalRuns:(c.stats.totalRuns||0)+1,prKm:Math.max(c.stats.prKm||0,km)};
    const newXP=Math.max(0,c.totalXP+xpGain);
    const nc={...c,totalXP:newXP,stats:ns,boss:{...c.boss,runKm:(c.boss.runKm||0)+km},runs:[{date:todayStr(),km,minutes:min2||null,pace,xp:xpGain,pr:isPR},...(c.runs||[])].slice(0,100)};
    charRef.current=nc;setChar(nc);addFloat(xpGain);triggerLvl(c.totalXP,newXP);await save(nc,null,null);
    setRunKm("");setRunMin("");showToast(`🏃 ${km}km${isPR?" · PR! 🏅":""}`,isPR?"#f0c040":"#34d399");
  };

  // finance
  const togglePaid=async(expId)=>{const c=charRef.current;const exp=c.finance.expenses.find(e=>e.id===expId);const wasPaid=exp?.paid;const exps=c.finance.expenses.map(e=>e.id!==expId?e:{...e,paid:!e.paid});const xpDelta=wasPaid?-FIN_XP(exp.amount):FIN_XP(exp.amount);const nc={...c,totalXP:Math.max(0,c.totalXP+xpDelta),finance:{...c.finance,expenses:exps}};charRef.current=nc;setChar(nc);addFloat(xpDelta);await save(nc,null,null);};
  const addExpense=async()=>{if(!newExpName||!newExpAmt)return;const inst=newExpInst&&newExpTotal?{current:parseInt(newExpInst),total:parseInt(newExpTotal)}:null;const exp={id:`e_${uid()}`,name:newExpName,amount:parseFloat(newExpAmt),icon:newExpIcon,paid:false,installments:inst};const c=charRef.current;const nc={...c,finance:{...c.finance,expenses:[...c.finance.expenses,exp]}};charRef.current=nc;setChar(nc);await save(nc,null,null);setNewExpName("");setNewExpAmt("");setNewExpInst("");setNewExpTotal("");setAddingExp(false);showToast("Gasto adicionado!","#22c55e");};
  const removeExpense=async(id)=>{const c=charRef.current;const nc={...c,finance:{...c.finance,expenses:c.finance.expenses.filter(e=>e.id!==id)}};charRef.current=nc;setChar(nc);await save(nc,null,null);};
  const advanceInstallment=async(expId)=>{const c=charRef.current;const exps=c.finance.expenses.map(e=>{if(e.id!==expId||!e.installments)return e;const next=e.installments.current+1;return next>e.installments.total?{...e,paid:true,installments:{...e.installments,current:e.installments.total}}:{...e,installments:{...e.installments,current:next}};});const nc={...c,finance:{...c.finance,expenses:exps}};charRef.current=nc;setChar(nc);await save(nc,null,null);showToast("Parcela avançada!","#22c55e");};
  const saveSalary=async()=>{const v=parseFloat(salaryIn);if(!v)return;const c=charRef.current;const nc={...c,finance:{...c.finance,salary:v}};charRef.current=nc;setChar(nc);await save(nc,null,null);setEditingSalary(false);setSalaryIn("");showToast("Salário atualizado!","#22c55e");};

  // concurso
  const addConcurso=async()=>{if(!newConcName)return;const id=`c_${uid()}`;const c=charRef.current;const nc={...c,concursos:[...c.concursos,{id,name:newConcName,active:true,subjects:[],subjectMin:{},questions:{},studySessions:[]}],activeConcurso:id};charRef.current=nc;setChar(nc);await save(nc,null,null);setNewConcName("");setAddingConcurso(false);showToast("Concurso criado!","#a78bfa");};
  const switchConcurso=async(id)=>{const c=charRef.current;const nc={...c,activeConcurso:id};charRef.current=nc;setChar(nc);await save(nc,null,null);const conc=c.concursos.find(cc=>cc.id===id);if(conc?.subjects?.length)setQSub(conc.subjects[0].id);};

  // avatar / username
  const saveAvatar=async(av)=>{const c=charRef.current;const nc={...c,avatar:{...c.avatar,...av}};charRef.current=nc;setChar(nc);await save(nc,null,null);};
  const saveUsername=async()=>{if(!usernameIn.trim())return;const c=charRef.current;const nc={...c,username:usernameIn.trim()};charRef.current=nc;setChar(nc);await save(nc,null,null);setEditingUsername(false);setUsernameIn("");showToast("Nome atualizado!","#f0c040");};
  const saveBodyStats=async()=>{if(!weightIn&&!heightIn)return;const c=charRef.current;const nc={...c,body:{weight:weightIn||c.body?.weight||"",height:heightIn||c.body?.height||""}};charRef.current=nc;setChar(nc);await save(nc,null,null);setWeightIn("");setHeightIn("");showToast("Medidas salvas!","#34d399");};

  // boss
  const claimBoss=async()=>{const c=charRef.current;const boss=BOSS_POOL[c.boss?.type||0];const newXP=Math.max(0,c.totalXP+boss.xp);const nc={...c,totalXP:newXP,stats:{...c.stats,bossesCleared:(c.stats.bossesCleared||0)+1},boss:{...c.boss,claimed:true}};charRef.current=nc;setChar(nc);addFloat(boss.xp);triggerLvl(c.totalXP,newXP);await save(nc,null,null);showToast(`⚔️ Boss derrotado! +${boss.xp} XP`,"#f0c040");};

  // ═══════════════════════════════════════════════════════════════
  // RENDER
  // ═══════════════════════════════════════════════════════════════
  if(loading) return(
    <div style={{background:"#07070f",height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",flexDirection:"column",gap:14}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Text:wght@400;600&display=swap');`}</style>
      <div style={{fontSize:48}}>⚔️</div>
      <div style={{color:"#f0c040",fontFamily:"Cinzel,serif",fontSize:13,letterSpacing:4}}>RPG DA VIDA REAL</div>
    </div>
  );

  const {cur,nxt}=getLvl(char.totalXP);
  const xpInLvl=char.totalXP-cur.xp,xpNeeded=nxt?nxt.xp-cur.xp:1;
  const lvlPct=Math.min(100,(xpInLvl/xpNeeded)*100);
  const streak=char.streak?.current||0;
  const multi=streakMulti(streak);
  const dynTitle=getDynTitle(char.stats,cur.lv);
  const ac=char.concursos?.find(c=>c.id===char.activeConcurso)||char.concursos?.[0];
  const boss=BOSS_POOL[char.boss?.type||0];
  const bGls=boss.goals;
  const bPcts={studyMin:bGls.studyMin?Math.min(100,((char.boss?.studyMin||0)/bGls.studyMin)*100):null,trainCount:bGls.trainCount?Math.min(100,((char.boss?.trainCount||0)/bGls.trainCount)*100):null,questions:bGls.questions?Math.min(100,((char.boss?.questions||0)/bGls.questions)*100):null,runKm:bGls.runKm?Math.min(100,((char.boss?.runKm||0)/bGls.runKm)*100):null};
  const bossComplete=Object.entries(bGls).every(([k])=>bPcts[k]>=100);
  const weakSubs=(ac?.subjects||[]).filter(s=>{const d=(ac.questions||{})[s.id];return d&&d.total>=10&&(d.correct/d.total)<0.80;});
  const salary=char.finance?.salary||0;
  const expenses=char.finance?.expenses||[];
  const totalExp=expenses.reduce((a,e)=>a+e.amount,0);
  const paidExp=expenses.filter(e=>e.paid).reduce((a,e)=>a+e.amount,0);
  const remaining=salary-totalExp;
  const weight=parseFloat(char.body?.weight||0);
  const height=parseFloat(char.body?.height||0)/100;
  const bmi=weight&&height?+(weight/(height*height)).toFixed(1):null;
  const bmiC=bmi?bmiCat(bmi):null;
  const plans=getPlans();
  const todayXP=(()=>{let x=QUESTS.filter(q=>quests[q.id]).reduce((s,q)=>s+q.xp,0)+PENALTIES.filter(p=>pens[p.id]).reduce((s,p)=>s+p.xp,0);if(QUESTS.filter(q=>q.core).every(q=>quests[q.id]))x+=20;return x;})();

  const css=`
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700;900&family=Crimson+Text:wght@400;600&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#0a0a0f}::-webkit-scrollbar-thumb{background:#2a2848}
    @keyframes floatUp{0%{opacity:1;transform:translateY(0)}100%{opacity:0;transform:translateY(-80px) scale(1.3)}}
    @keyframes lvlUp{0%,100%{opacity:0;transform:scale(0.8)}15%,85%{opacity:1;transform:scale(1)}}
    @keyframes pulse{0%,100%{box-shadow:0 0 6px #f0c04033}50%{box-shadow:0 0 22px #f0c04077}}
    @keyframes gpulse{0%,100%{box-shadow:0 0 6px #22c55e33}50%{box-shadow:0 0 22px #22c55e77}}
    @keyframes rpulse{0%,100%{box-shadow:0 0 6px #ef444433}50%{box-shadow:0 0 20px #ef444488}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:0.4}}
    @keyframes fadeIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
    .btn{background:none;border:none;cursor:pointer;text-align:left;width:100%;padding:0}.btn:active{transform:scale(0.97)}
    .tbtn{background:none;border:none;cursor:pointer}.tbtn:active{transform:scale(0.93)}
    .inp{background:#0f0f1e;border:1px solid #2a2848;border-radius:8px;color:#e8dfc0;font-family:Crimson Text,serif;font-size:14px;padding:9px 12px;width:100%;outline:none}
    .inp:focus{border-color:#f0c04066}
    select.inp{cursor:pointer}
    .sbtn{background:none;border:none;cursor:pointer;font-family:Cinzel,serif;letter-spacing:1px;border-radius:9px;padding:10px 0;width:100%;font-size:11px}.sbtn:active{transform:scale(0.96)}
  `;

  const Card=({children,style,glow,anim})=><div style={{background:"#0f0f1e",border:`1px solid ${glow||"#1a1838"}`,borderRadius:12,padding:"12px 14px",animation:anim||"none",...style}}>{children}</div>;
  const Lbl=({children,color,mb=8})=><div style={{fontFamily:"Cinzel,serif",fontSize:9,letterSpacing:3,color:color||"#555",marginBottom:mb}}>{children}</div>;
  const STabs=({tabs,val,onChange})=>(
    <div style={{display:"flex",gap:5,marginBottom:12}}>
      {tabs.map(t=><button key={t.id} onClick={()=>onChange(t.id)} style={{flex:1,padding:"8px 0",borderRadius:9,border:`1px solid ${val===t.id?`${t.c||"#f0c040"}55`:"#1a1838"}`,background:val===t.id?`linear-gradient(135deg,${t.c||"#f0c040"}18,${t.c||"#f0c040"}08)`:"#0f0f1e",fontFamily:"Cinzel,serif",fontSize:9,color:val===t.id?t.c||"#f0c040":"#555",letterSpacing:1,cursor:"pointer"}}>{t.i} {t.l}</button>)}
    </div>
  );

  return(
    <div style={{background:"#07070f",minHeight:"100vh",fontFamily:"Crimson Text,Georgia,serif",color:"#e8dfc0",display:"flex",flexDirection:"column",maxWidth:480,margin:"0 auto"}}>
      <style>{css}</style>

      {/* BG glow */}
      <div style={{position:"fixed",inset:0,pointerEvents:"none",zIndex:0}}>
        <div style={{position:"absolute",top:-60,left:-60,width:240,height:240,borderRadius:"50%",background:"radial-gradient(circle,#1a0a3a44,transparent 70%)"}}/>
      </div>

      {/* Floats */}
      <div style={{position:"fixed",top:108,left:"50%",transform:"translateX(-50%)",zIndex:300,pointerEvents:"none",textAlign:"center",minWidth:100}}>
        {floats.map(f=><div key={f.id} style={{animation:"floatUp 2.5s ease-out forwards",fontFamily:"Cinzel,serif",fontWeight:900,fontSize:22,color:f.xp>=0?"#f0c040":"#ef4444",textShadow:`0 0 14px ${f.xp>=0?"#f0c04099":"#ef444499"}`}}>{f.xp>=0?`+${f.xp}`:f.xp} XP</div>)}
      </div>

      {/* Toast */}
      {toast&&<div style={{position:"fixed",top:14,left:"50%",transform:"translateX(-50%)",zIndex:400,animation:"fadeIn 0.3s ease",background:"#111122ee",border:`1px solid ${toast.color}55`,borderRadius:12,padding:"10px 20px",fontSize:12,color:toast.color,fontFamily:"Cinzel,serif",letterSpacing:1,whiteSpace:"nowrap",pointerEvents:"none"}}>{toast.msg}</div>}

      {/* LevelUp */}
      {lvlUpMsg&&<div style={{position:"fixed",inset:0,zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",background:"#00000099",pointerEvents:"none"}}><div style={{animation:"lvlUp 3.5s ease-in-out forwards",background:"linear-gradient(135deg,#1a0d00,#2a1800)",border:`2px solid ${lvlUpMsg.color}`,borderRadius:22,padding:"28px 48px",textAlign:"center",boxShadow:`0 0 80px ${lvlUpMsg.color}55`}}><div style={{fontSize:48}}>⬆️</div><div style={{fontFamily:"Cinzel,serif",fontSize:9,letterSpacing:5,color:"#888",margin:"8px 0 4px"}}>LEVEL UP</div><div style={{fontFamily:"Cinzel,serif",fontSize:34,fontWeight:900,color:lvlUpMsg.color}}>{lvlUpMsg.lv}</div><div style={{fontFamily:"Cinzel,serif",fontSize:14,color:"#e8dfc0",marginTop:6}}>{lvlUpMsg.title}</div></div></div>}

      {/* HEADER */}
      <div style={{background:"linear-gradient(180deg,#0d0820,#08080f)",borderBottom:"1px solid #1a1838",padding:"11px 14px 8px",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
          <div style={{display:"flex",alignItems:"center",gap:10}}>
            <div onClick={()=>setShowAvatarEditor(v=>!v)} style={{cursor:"pointer",flexShrink:0}}><AvatarSVG {...(char.avatar||{})} size={42}/></div>
            <div>
              <div style={{fontFamily:"Cinzel,serif",fontSize:15,fontWeight:900,color:"#f0c040",letterSpacing:2,lineHeight:1}}>{char.username||"Jogador"}</div>
              <div style={{display:"flex",alignItems:"center",gap:5,marginTop:2}}>
                <span style={{fontSize:9,color:"#a78bfa",fontFamily:"Cinzel,serif"}}>{dynTitle.icon} {dynTitle.title}</span>
                {streak>0&&<span style={{fontSize:8,color:"#f97316",background:"#f9731622",border:"1px solid #f9731644",borderRadius:5,padding:"1px 5px",fontFamily:"Cinzel,serif"}}>🔥{streak}d{multi>1?` ×${multi.toFixed(2)}`:""}</span>}
              </div>
            </div>
          </div>
          <div style={{textAlign:"right"}}>
            <div style={{fontFamily:"Cinzel,serif",fontSize:22,fontWeight:900,color:cur.color,lineHeight:1}}>Lv.{cur.lv}</div>
            <div style={{fontSize:8,color:"#444"}}>{cur.title}</div>
          </div>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
          <span style={{fontSize:8,color:"#444",fontFamily:"Cinzel,serif"}}>XP</span>
          <span style={{fontSize:8,color:"#f0c040",fontFamily:"Cinzel,serif"}}>{char.totalXP.toLocaleString()}{nxt?` / ${nxt.xp.toLocaleString()}`:""}</span>
        </div>
        <div style={{height:5,background:"#141228",borderRadius:3,overflow:"hidden"}}>
          <div style={{height:"100%",width:`${lvlPct}%`,background:`linear-gradient(90deg,${cur.color}77,${cur.color})`,borderRadius:3,transition:"width 0.6s",boxShadow:`0 0 8px ${cur.color}66`}}/>
        </div>
        <div style={{display:"flex",justifyContent:"space-between",marginTop:2}}>
          <span style={{fontSize:7,color:"#333"}}>{nxt?`${Math.round(lvlPct)}% → ${nxt.title}`:"NÍVEL MÁXIMO"}</span>
          <span style={{fontSize:7,color:todayXP>=0?"#34d399":"#ef4444"}}>Hoje {todayXP>0?"+":""}{todayXP} XP</span>
        </div>
        {weakSubs.length>0&&<div style={{marginTop:5,background:"#1a080844",border:"1px solid #ef444455",borderRadius:7,padding:"3px 10px",display:"flex",alignItems:"center",gap:6,animation:"rpulse 2.5s infinite"}}><span style={{fontSize:10}}>⚠️</span><span style={{fontSize:8,color:"#ef9999",fontFamily:"Cinzel,serif"}}>{weakSubs.map(s=>s.name.split(" ")[0]).join(", ")} abaixo de 80%</span></div>}
      </div>

      {/* Avatar drawer */}
      {showAvatarEditor&&(
        <div style={{background:"#0d0820",border:"1px solid #1a1838",padding:"11px 14px",position:"sticky",top:showAvatarEditor?0:"-100%",zIndex:99,animation:"fadeIn 0.2s ease"}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
            <Lbl mb={0}>EDITAR AVATAR</Lbl>
            <button className="tbtn" onClick={()=>setShowAvatarEditor(false)} style={{color:"#555",fontSize:16}}>✕</button>
          </div>
          <div style={{display:"flex",gap:12}}>
            <AvatarSVG {...(char.avatar||{})} size={62}/>
            <div style={{flex:1}}>
              <div style={{fontSize:9,color:"#666",marginBottom:3}}>Expressão</div>
              <div style={{display:"flex",gap:5,marginBottom:7}}>{AVATAR_EXPRESSIONS.map(e=><button key={e.id} className="tbtn" onClick={()=>saveAvatar({expression:e.id})} style={{fontSize:17,opacity:(char.avatar?.expression||"happy")===e.id?1:0.3}}>{e.l}</button>)}</div>
              <div style={{fontSize:9,color:"#666",marginBottom:3}}>Cabelo</div>
              <div style={{display:"flex",gap:4,marginBottom:7}}>{AVATAR_HAIR_STYLES.map(s=><button key={s.id} className="tbtn" onClick={()=>saveAvatar({hairStyle:s.id})} style={{fontSize:8,fontFamily:"Cinzel,serif",color:(char.avatar?.hairStyle||"short")===s.id?"#f0c040":"#444",background:(char.avatar?.hairStyle||"short")===s.id?"#1a1400":"transparent",border:`1px solid ${(char.avatar?.hairStyle||"short")===s.id?"#f0c04055":"#2a2848"}`,borderRadius:5,padding:"2px 5px"}}>{s.l}</button>)}</div>
              <div style={{fontSize:9,color:"#666",marginBottom:3}}>Tom de pele</div>
              <div style={{display:"flex",gap:5,marginBottom:7}}>{AVATAR_SKINS.map((s,i)=><button key={i} className="tbtn" onClick={()=>saveAvatar({skin:i})} style={{width:18,height:18,borderRadius:"50%",background:s,border:`2px solid ${(char.avatar?.skin||0)===i?"#f0c040":"transparent"}`,flexShrink:0}}/>)}</div>
              <div style={{fontSize:9,color:"#666",marginBottom:3}}>Cabelo cor</div>
              <div style={{display:"flex",gap:5}}>{AVATAR_HAIRS.map((h,i)=><button key={i} className="tbtn" onClick={()=>saveAvatar({hair:i})} style={{width:18,height:18,borderRadius:"50%",background:h,border:`2px solid ${(char.avatar?.hair||0)===i?"#f0c040":"transparent"}`,flexShrink:0}}/>)}</div>
            </div>
          </div>
        </div>
      )}

      {/* CONTENT */}
      <div style={{flex:1,overflowY:"auto",paddingBottom:68,position:"relative",zIndex:10}}>

        {/* HOME */}
        {tab==="home"&&<div style={{padding:"12px 12px 0"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:10}}>
            {[{l:"Streak",v:`${streak}d`,i:"🔥",c:"#f97316"},{l:"Estudos",v:fmtHM(Object.values(ac?.subjectMin||{}).reduce((a,b)=>a+b,0)),i:"📚",c:"#60a5fa"},{l:"Km total",v:fmtKm(char.stats.totalKm),i:"🏃",c:"#34d399"}].map((s,i)=>(
              <Card key={i} style={{padding:"10px",textAlign:"center"}}><div style={{fontSize:17,marginBottom:3}}>{s.i}</div><div style={{fontFamily:"Cinzel,serif",fontSize:13,color:s.c,fontWeight:700}}>{s.v}</div><div style={{fontSize:8,color:"#444",letterSpacing:1,marginTop:1}}>{s.l.toUpperCase()}</div></Card>
            ))}
          </div>
          <Card glow={remaining<0?"#ef444455":"#22c55e33"} style={{marginBottom:10}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}><Lbl mb={0}>SAÚDE FINANCEIRA</Lbl><span style={{fontFamily:"Cinzel,serif",fontSize:13,color:remaining>=0?"#22c55e":"#ef4444"}}>{curr(remaining)} livre</span></div>
            <div style={{height:7,background:"#1a1838",borderRadius:3,overflow:"hidden",marginBottom:4}}><div style={{height:"100%",width:`${Math.min(100,(paidExp/salary)*100)}%`,background:"linear-gradient(90deg,#22c55e77,#22c55e)",borderRadius:3,transition:"width 0.5s"}}/></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:9,color:"#555"}}>Pago: {curr(paidExp)}</span><span style={{fontSize:9,color:"#555"}}>{curr(totalExp)} / {curr(salary)}</span></div>
          </Card>
          {bmi&&<Card glow={bmiC.c+"44"} style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><Lbl mb={2}>IMC</Lbl><div style={{fontFamily:"Cinzel,serif",fontSize:22,color:bmiC.c,fontWeight:700}}>{bmi}</div><div style={{fontSize:11,color:bmiC.c}}>{bmiC.l}</div><div style={{fontSize:10,color:"#666",marginTop:2}}>{bmiC.t}</div></div><div style={{textAlign:"right",fontSize:11,color:"#555"}}><div>{char.body.weight} kg</div><div>{char.body.height} cm</div></div></div></Card>}
          {char.books.current&&<Card glow="#60a5fa33" style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:13}}>📖 <span style={{color:"#aaa"}}>{char.books.current.title}</span></span><span style={{fontFamily:"Cinzel,serif",fontSize:12,color:"#60a5fa"}}>{pct(char.books.current.page,char.books.current.total)}%</span></div><div style={{height:5,background:"#1a1838",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${pct(char.books.current.page,char.books.current.total)}%`,background:"linear-gradient(90deg,#60a5fa77,#60a5fa)",borderRadius:3}}/></div></Card>}
        </div>}

        {/* DAILY */}
        {tab==="daily"&&<div style={{padding:"12px 12px 0"}}>
          <STabs tabs={[{id:"missoes",i:"⚔️",l:"Missões",c:"#f0c040"},{id:"boss",i:"👹",l:"Boss",c:"#8b5cf6"},{id:"streak",i:"🔥",l:"Streak",c:"#f97316"}]} val={dailyTab} onChange={setDailyTab}/>
          {dailyTab==="missoes"&&<>
            {(()=>{const cores=QUESTS.filter(q=>q.core),done=cores.filter(q=>quests[q.id]).length,all=done===cores.length;return<div style={{background:all?"linear-gradient(135deg,#0a2010,#0d2a14)":"#0f0f1e",border:`1px solid ${all?"#22c55e55":"#2a1e0a"}`,borderRadius:10,padding:"9px 12px",marginBottom:10,display:"flex",alignItems:"center",gap:8,animation:all?"gpulse 3s infinite":"none"}}><span style={{fontSize:18}}>{all?"🏆":"🎯"}</span><div><div style={{fontFamily:"Cinzel,serif",fontSize:9,color:all?"#22c55e":"#f0c040",letterSpacing:1}}>{all?"COMPLETO! +20 XP BÔNUS":`${done}/${cores.length} MISSÕES PRINCIPAIS`}</div><div style={{fontSize:10,color:"#555"}}>Estudar + Treinar + Dormir bem</div></div></div>;})()}
            {["mente","corpo","disciplina"].map(cat=><div key={cat} style={{marginBottom:10}}>
              <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}><div style={{height:1,flex:1,background:`linear-gradient(90deg,${catColor[cat]}44,transparent)`}}/><span style={{fontFamily:"Cinzel,serif",fontSize:9,color:catColor[cat],letterSpacing:2}}>{cat.toUpperCase()}</span><div style={{height:1,flex:1,background:`linear-gradient(270deg,${catColor[cat]}44,transparent)`}}/></div>
              {QUESTS.filter(q=>q.cat===cat).map(q=>{const done=!!quests[q.id],locked=q.req&&!quests[q.req];return<button key={q.id} className="btn" onClick={()=>!locked&&toggleQuest(q)} style={{opacity:locked?0.35:1,marginBottom:5}}><div style={{background:done?`linear-gradient(135deg,${catColor[cat]}18,${catColor[cat]}08)`:"#0f0f1e",border:`1px solid ${done?catColor[cat]+"66":"#1a1838"}`,borderRadius:10,padding:"9px 12px",display:"flex",alignItems:"center",gap:10}}><div style={{width:20,height:20,borderRadius:5,border:`2px solid ${done?catColor[cat]:"#2a2848"}`,background:done?catColor[cat]+"33":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{done&&<span style={{color:catColor[cat],fontSize:11,fontWeight:900}}>✓</span>}</div><span style={{fontSize:16}}>{locked?"🔒":q.icon}</span><div style={{flex:1}}><div style={{fontSize:13,color:done?"#e8dfc0":"#777"}}>{q.label}</div>{q.core&&<div style={{fontSize:8,color:"#f0c04044",fontFamily:"Cinzel,serif",letterSpacing:1}}>MISSÃO PRINCIPAL</div>}</div><span style={{fontFamily:"Cinzel,serif",fontWeight:700,color:done?catColor[cat]:"#333",fontSize:11}}>+{q.xp}</span></div></button>;})}
            </div>)}
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:7}}><div style={{height:1,flex:1,background:"linear-gradient(90deg,#ef444444,transparent)"}}/><span style={{fontFamily:"Cinzel,serif",fontSize:9,color:"#ef4444",letterSpacing:2}}>PENALIDADES</span><div style={{height:1,flex:1,background:"linear-gradient(270deg,#ef444444,transparent)"}}/></div>
            {PENALTIES.map(pen=>{const on=!!pens[pen.id];return<button key={pen.id} className="btn" onClick={()=>togglePen(pen)} style={{marginBottom:5}}><div style={{background:on?"#1e0808":"#0f0f1e",border:`1px solid ${on?"#ef444466":"#1a1838"}`,borderRadius:10,padding:"9px 12px",display:"flex",alignItems:"center",gap:10}}><div style={{width:20,height:20,borderRadius:5,border:`2px solid ${on?"#ef4444":"#2a2848"}`,background:on?"#ef444433":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{on&&<span style={{color:"#ef4444",fontSize:11,fontWeight:900}}>✗</span>}</div><span style={{fontSize:16}}>{pen.icon}</span><span style={{flex:1,fontSize:13,color:on?"#ef9999":"#777"}}>{pen.label}</span><span style={{fontFamily:"Cinzel,serif",fontWeight:700,color:"#ef4444",fontSize:11}}>{pen.xp}</span></div></button>;})}
          </>}
          {dailyTab==="boss"&&<Card glow={bossComplete&&!char.boss?.claimed?"#f0c04077":char.boss?.claimed?"#22c55e55":"#2a2248"} anim={bossComplete&&!char.boss?.claimed?"pulse 2s infinite":"none"}>
            <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}><span style={{fontSize:26}}>{boss.icon}</span><div style={{flex:1}}><Lbl mb={2}>BOSS SEMANAL</Lbl><div style={{fontSize:15,color:"#e8dfc0"}}>{boss.name}</div></div><span style={{fontFamily:"Cinzel,serif",fontSize:13,color:"#f0c040",fontWeight:700}}>+{boss.xp} XP</span></div>
            <div style={{fontSize:12,color:"#666",marginBottom:10}}>{boss.desc}</div>
            {Object.entries(bGls).map(([k,goal])=>{const labels={studyMin:"Estudo",trainCount:"Treinos",questions:"Questões",runKm:"Corrida"};const vals={studyMin:`${fmtHM(char.boss?.studyMin||0)} / ${fmtHM(goal)}`,trainCount:`${char.boss?.trainCount||0} / ${goal}x`,questions:`${char.boss?.questions||0} / ${goal}`,runKm:`${(char.boss?.runKm||0).toFixed(1)} / ${goal}km`};return<div key={k} style={{marginBottom:7}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:11,color:"#777"}}>{labels[k]}</span><span style={{fontSize:11,color:bPcts[k]>=100?"#22c55e":"#888",fontFamily:"Cinzel,serif"}}>{vals[k]}</span></div><div style={{height:5,background:"#1a1838",borderRadius:3,overflow:"hidden"}}><div style={{height:"100%",width:`${bPcts[k]||0}%`,background:bPcts[k]>=100?"#22c55e":"#8b5cf6",borderRadius:3,transition:"width 0.5s"}}/></div></div>;})}
            {bossComplete&&!char.boss?.claimed&&<button className="sbtn" onClick={claimBoss} style={{marginTop:10,background:"linear-gradient(135deg,#f0c040,#d4a017)",color:"#000",fontWeight:700,fontSize:13}}>⚔️ REIVINDICAR +{boss.xp} XP</button>}
            {char.boss?.claimed&&<div style={{marginTop:8,textAlign:"center",fontSize:11,color:"#22c55e",fontFamily:"Cinzel,serif",letterSpacing:1}}>✓ BOSS DERROTADO ESTA SEMANA</div>}
          </Card>}
          {dailyTab==="streak"&&<Card glow={streak>=7?"#f9731666":"#2a1e0a"} style={{textAlign:"center",padding:"22px 14px"}}>
            <div style={{fontSize:44,marginBottom:6}}>{streak>=30?"🔥":streak>=7?"⚡":"💤"}</div>
            <div style={{fontFamily:"Cinzel,serif",fontSize:36,fontWeight:900,color:"#f97316"}}>{streak}</div>
            <div style={{fontFamily:"Cinzel,serif",fontSize:10,color:"#f9731699",letterSpacing:3,margin:"4px 0 10px"}}>DIAS CONSECUTIVOS</div>
            {multi>1&&<div style={{background:"#f9731622",border:"1px solid #f9731644",borderRadius:8,padding:"6px 14px",display:"inline-block",fontFamily:"Cinzel,serif",fontSize:12,color:"#f97316"}}>✨ ×{multi.toFixed(2)} ATIVO</div>}
            <div style={{marginTop:14,display:"flex",justifyContent:"space-around"}}>
              {[{l:"Recorde",v:char.streak?.best||0,c:"#f0c040"},{l:"Dias ativos",v:char.stats.activeDays||0,c:"#a78bfa"},{l:"Missões",v:char.stats.totalQuests||0,c:"#34d399"}].map((s,i)=><div key={i}><div style={{fontFamily:"Cinzel,serif",fontSize:20,color:s.c}}>{s.v}</div><div style={{fontSize:9,color:"#555"}}>{s.l}</div></div>)}
            </div>
          </Card>}
        </div>}

        {/* STUDY */}
        {tab==="study"&&<div style={{padding:"12px 12px 0"}}>
          <div style={{display:"flex",gap:5,marginBottom:10}}>
            <select className="inp" style={{flex:1}} value={char.activeConcurso} onChange={e=>switchConcurso(e.target.value)}>{(char.concursos||[]).map(c=><option key={c.id} value={c.id}>{c.name}</option>)}</select>
            <button className="tbtn" onClick={()=>setAddingConcurso(v=>!v)} style={{background:"#1a1535",border:"1px solid #a78bfa55",color:"#a78bfa",borderRadius:8,padding:"9px 12px",fontFamily:"Cinzel,serif",fontSize:10,flexShrink:0}}>+ NOVO</button>
          </div>
          {addingConcurso&&<div style={{display:"flex",gap:5,marginBottom:10}}><input className="inp" value={newConcName} onChange={e=>setNewConcName(e.target.value)} placeholder="Nome do concurso..."/><button className="tbtn" onClick={addConcurso} style={{background:"#1a1535",border:"1px solid #a78bfa55",color:"#a78bfa",borderRadius:8,padding:"9px 13px",fontFamily:"Cinzel,serif",fontSize:11,flexShrink:0}}>OK</button></div>}
          <STabs tabs={[{id:"timer",i:"⏱️",l:"Timer",c:"#60a5fa"},{id:"questoes",i:"🎯",l:"Questões",c:"#a78bfa"},{id:"livros",i:"📖",l:"Livros",c:"#f0c040"}]} val={studyTab} onChange={setStudyTab}/>

          {studyTab==="timer"&&<>
            {timerOn&&timerSub?(()=>{const sub=(ac?.subjects||[]).find(s=>s.id===timerSub)||{icon:"📚",color:"#60a5fa",name:"Estudo"};return<div style={{background:`linear-gradient(135deg,${sub.color}18,${sub.color}06)`,border:`1px solid ${sub.color}55`,borderRadius:14,padding:"20px 14px",textAlign:"center"}}><div style={{fontSize:22,marginBottom:4}}>{sub.icon}</div><div style={{fontFamily:"Cinzel,serif",fontSize:9,color:sub.color,letterSpacing:3,marginBottom:8}}>{sub.name?.toUpperCase()}</div><div style={{fontFamily:"Cinzel,serif",fontSize:48,fontWeight:900,color:"#f0c040",animation:"blink 2s infinite",letterSpacing:3,lineHeight:1}}>{fmtTime(elapsed)}</div><div style={{display:"flex",justifyContent:"center",gap:16,margin:"12px 0"}}>{[{l:"1h +30XP",done:m1.current,r:elapsed>=3600},{l:"2h +25XP",done:m2.current,r:elapsed>=7200}].map((m,i)=><div key={i} style={{fontSize:10,fontFamily:"Cinzel,serif",color:m.done?"#34d399":m.r?"#f0c040":"#444"}}>{m.done?"✓ ":""}{m.l}</div>)}</div><div style={{height:4,background:"#1a1530",borderRadius:2,overflow:"hidden",marginBottom:12}}><div style={{height:"100%",width:`${Math.min(100,(elapsed/7200)*100)}%`,background:`linear-gradient(90deg,${sub.color}88,${sub.color})`,borderRadius:2,transition:"width 1s linear"}}/></div><button className="sbtn" onClick={stopTimer} style={{background:"#1e0808",border:"1px solid #ef444466",color:"#ef4444",fontSize:11,letterSpacing:2}}>⏹ ENCERRAR</button></div>;})(
            ):<>
              <Lbl>MATÉRIA — {ac?.name?.toUpperCase()}</Lbl>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,marginBottom:12}}>
                {(ac?.subjects||[]).map(sub=>{const mins=(ac.subjectMin||{})[sub.id]||0;return<button key={sub.id} className="tbtn" onClick={()=>startTimer(sub.id)} style={{width:"100%"}}><div style={{background:`linear-gradient(135deg,${sub.color}14,${sub.color}06)`,border:`1px solid ${sub.color}44`,borderRadius:11,padding:"11px 10px",textAlign:"center"}}><div style={{fontSize:20,marginBottom:3}}>{sub.icon}</div><div style={{fontFamily:"Cinzel,serif",fontSize:8,color:sub.color,letterSpacing:1,marginBottom:2}}>{sub.name?.split(" ")[0]?.toUpperCase()}</div><div style={{fontSize:10,color:"#555",marginBottom:5}}>{mins>0?fmtHM(mins):"—"}</div><div style={{background:sub.color,color:"#000",borderRadius:5,padding:"3px 0",fontFamily:"Cinzel,serif",fontSize:8,fontWeight:700}}>▶ INICIAR</div></div></button>;})}
              </div>
              <Lbl>TEMPO POR MATÉRIA</Lbl>
              {(ac?.subjects||[]).map(sub=>{const mins=(ac.subjectMin||{})[sub.id]||0,mx=Math.max(...(ac.subjects||[]).map(s=>(ac.subjectMin||{})[s.id]||0),1);return<div key={sub.id} style={{background:"#0f0f1e",border:"1px solid #1a1838",borderRadius:8,padding:"7px 12px",marginBottom:4}}><div style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12}}>{sub.icon} <span style={{color:"#888"}}>{sub.name}</span></span><span style={{fontFamily:"Cinzel,serif",fontSize:10,color:mins>0?sub.color:"#333"}}>{mins>0?fmtHM(mins):"—"}</span></div><div style={{height:3,background:"#1a1838",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${(mins/mx)*100}%`,background:sub.color,borderRadius:2,transition:"width 0.4s"}}/></div></div>;})}
            </>}
          </>}

          {studyTab==="questoes"&&<>
            {weakSubs.length>0&&<div style={{background:"linear-gradient(135deg,#1e0808,#2a0a0a)",border:"1px solid #ef444466",borderRadius:11,padding:"11px 13px",marginBottom:10,animation:"rpulse 2.5s infinite"}}><Lbl color="#ef4444" mb={6}>⚠️ ABAIXO DE 80% — FOQUE AQUI</Lbl>{weakSubs.map(s=>{const d=getQStats(s.id,ac);return<div key={s.id} style={{display:"flex",justifyContent:"space-between",marginBottom:3}}><span style={{fontSize:12}}>{s.icon} <span style={{color:"#ef9999"}}>{s.name}</span></span><span style={{fontFamily:"Cinzel,serif",color:"#ef4444",fontWeight:700}}>{pct(d.correct,d.total)}%</span></div>;})}</div>}
            <Card style={{marginBottom:10}}><Lbl>REGISTRAR QUESTÕES</Lbl><div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,marginBottom:6}}><input className="inp" value={qCorr} onChange={e=>setQCorr(e.target.value)} type="number" min="0" placeholder="Acertos"/><input className="inp" value={qTot} onChange={e=>setQTot(e.target.value)} type="number" min="1" placeholder="Total"/></div><select className="inp" value={qSub} onChange={e=>setQSub(e.target.value)} style={{marginBottom:8}}>{(ac?.subjects||[]).map(s=><option key={s.id} value={s.id}>{s.icon} {s.name}</option>)}</select><button className="sbtn" onClick={submitQ} style={{background:"linear-gradient(135deg,#1a1535,#221c42)",border:"1px solid #a78bfa55",color:"#a78bfa",fontSize:11,letterSpacing:1}}>✓ REGISTRAR (+0.5 XP/ACERTO)</button></Card>
            <div style={{display:"flex",gap:5,marginBottom:10}}>{[{id:"today",l:"Hoje"},{id:"7d",l:"7 dias"},{id:"30d",l:"30 dias"},{id:"all",l:"Sempre"}].map(p=><button key={p.id} className="tbtn" onClick={()=>setQPeriod(p.id)} style={{flex:1,padding:"7px 0",borderRadius:8,border:`1px solid ${qPeriod===p.id?"#a78bfa55":"#1a1838"}`,background:qPeriod===p.id?"#1a1535":"#0f0f1e",color:qPeriod===p.id?"#a78bfa":"#555",fontFamily:"Cinzel,serif",fontSize:9}}>{p.l}</button>)}</div>
            <Lbl>DESEMPENHO — {qPeriod==="today"?"HOJE":qPeriod==="7d"?"7 DIAS":qPeriod==="30d"?"30 DIAS":"TOTAL"}</Lbl>
            {(ac?.subjects||[]).map(sub=>{const d=getQStats(sub.id,ac);const acc=d.total>0?pct(d.correct,d.total):null;const weak=acc!==null&&acc<80;return<div key={sub.id} style={{background:weak?"linear-gradient(135deg,#1e080855,#2a0a0a55)":"#0f0f1e",border:`1px solid ${weak?"#ef444455":"#1a1838"}`,borderRadius:10,padding:"9px 12px",marginBottom:5}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:acc!==null?4:0}}><span style={{fontSize:12}}>{sub.icon} <span style={{color:"#aaa"}}>{sub.name}</span></span><div style={{display:"flex",alignItems:"center",gap:7}}>{acc!==null&&<span style={{fontSize:10,color:"#555"}}>{d.correct}/{d.total}</span>}<span style={{fontFamily:"Cinzel,serif",fontSize:14,fontWeight:700,color:acc===null?"#333":acc>=80?sub.color:"#ef4444"}}>{acc===null?"—":`${acc}%`}</span>{weak&&<span>⚠️</span>}</div></div>{acc!==null&&<><div style={{height:4,background:"#1a1838",borderRadius:2,overflow:"hidden"}}><div style={{height:"100%",width:`${acc}%`,background:acc>=80?sub.color:"#ef4444",borderRadius:2,transition:"width 0.4s"}}/></div><div style={{display:"flex",justifyContent:"space-between",marginTop:2}}><span style={{fontSize:8,color:"#444"}}>Meta: 80%</span>{weak?<span style={{fontSize:8,color:"#ef4444"}}>Faltam {80-acc}%</span>:<span style={{fontSize:8,color:"#34d39977"}}>✓ Na meta</span>}</div></>}</div>;})}
          </>}

          {studyTab==="livros"&&<>
            <button className="sbtn" onClick={()=>setAddingBook(v=>!v)} style={{background:"#0f0f1e",border:"1px solid #60a5fa44",color:"#60a5fa",fontSize:10,letterSpacing:2,marginBottom:10}}>{addingBook?"✕ CANCELAR":"+ ADICIONAR LIVRO"}</button>
            {addingBook&&<Card style={{marginBottom:10}}><Lbl>NOVO LIVRO</Lbl><input className="inp" value={bookTitle} onChange={e=>setBookTitle(e.target.value)} placeholder="Título" style={{marginBottom:6}}/><input className="inp" value={bookAuthor} onChange={e=>setBookAuthor(e.target.value)} placeholder="Autor" style={{marginBottom:6}}/><input className="inp" value={bookPages} onChange={e=>setBookPages(e.target.value)} type="number" placeholder="Total de páginas" style={{marginBottom:9}}/><button className="sbtn" onClick={addBook} style={{background:"linear-gradient(135deg,#1a1535,#221c42)",border:"1px solid #60a5fa55",color:"#60a5fa",fontSize:11}}>✓ ADICIONAR</button></Card>}
            {char.books.current&&(()=>{const b=char.books.current,p2=pct(b.page,b.total);return<Card glow="#60a5fa33" style={{marginBottom:10}}><Lbl>LEITURA ATUAL</Lbl><div style={{fontSize:14,color:"#e8dfc0",marginBottom:2}}>{b.title}</div><div style={{fontSize:12,color:"#60a5fa88",marginBottom:8}}>por {b.author}</div><div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:12,color:"#777"}}>Pág. {b.page} / {b.total}</span><span style={{fontFamily:"Cinzel,serif",fontSize:14,color:"#60a5fa",fontWeight:700}}>{p2}%</span></div><div style={{height:8,background:"#1a1838",borderRadius:4,overflow:"hidden",marginBottom:9}}><div style={{height:"100%",width:`${p2}%`,background:"linear-gradient(90deg,#60a5fa77,#60a5fa)",borderRadius:4,transition:"width 0.5s",boxShadow:"0 0 8px #60a5fa55"}}/></div><div style={{display:"flex",gap:6}}><input className="inp" value={bookPage} onChange={e=>setBookPage(e.target.value)} type="number" placeholder={`Pág. atual (${b.page})`} style={{flex:1}}/><button className="tbtn" onClick={updatePage} style={{background:"#1a1535",border:"1px solid #60a5fa55",color:"#60a5fa",borderRadius:8,padding:"9px 13px",fontFamily:"Cinzel,serif",fontSize:9,flexShrink:0}}>SALVAR</button></div>{p2>=100&&<button className="sbtn" onClick={finishBook} style={{marginTop:9,background:"linear-gradient(135deg,#f0c040,#d4a017)",color:"#000",fontWeight:700,fontSize:12,animation:"pulse 2s infinite"}}>🎉 FINALIZAR +80 XP</button>}</Card>;})()} 
            {(char.books.library||[]).length>0&&<><Lbl>BIBLIOTECA — {char.books.library.length} LIVROS</Lbl>{char.books.library.map((b,i)=><div key={i} style={{background:"linear-gradient(135deg,#1a1400,#1e1600)",border:"1px solid #f0c04033",borderRadius:10,padding:"10px 13px",marginBottom:5,display:"flex",alignItems:"center",gap:10}}><span style={{fontSize:22}}>📗</span><div style={{flex:1}}><div style={{fontSize:13,color:"#e8dfc0"}}>{b.title}</div><div style={{fontSize:10,color:"#f0c04077"}}>{b.author}{b.finishedDate?` · ${b.finishedDate}`:""}</div></div><span style={{fontFamily:"Cinzel,serif",fontSize:10,color:"#f0c040"}}>+80</span></div>)}</>}
          </>}
        </div>}

        {/* BODY */}
        {tab==="body"&&<div style={{padding:"12px 12px 0"}}>
          <STabs tabs={[{id:"treino",i:"💪",l:"Treino",c:"#ef4444"},{id:"corrida",i:"🏃",l:"Corrida",c:"#34d399"},{id:"medidas",i:"📏",l:"Medidas",c:"#60a5fa"}]} val={bodyTab} onChange={setBodyTab}/>

          {bodyTab==="treino"&&<>
            {/* ── WORKOUT LIST ── */}
            {workoutView==="list"&&<>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <Lbl mb={0}>MINHAS FICHAS</Lbl>
                <button className="tbtn" onClick={()=>setWorkoutView("new")} style={{background:"#1a1535",border:"1px solid #a78bfa55",color:"#a78bfa",borderRadius:8,padding:"5px 12px",fontFamily:"Cinzel,serif",fontSize:9,letterSpacing:1}}>+ NOVA FICHA</button>
              </div>
              {Object.entries(plans).map(([key,plan])=>(
                <div key={key} style={{background:`linear-gradient(135deg,${plan.color}14,${plan.color}06)`,border:`1px solid ${plan.color}44`,borderRadius:12,padding:"12px 13px",marginBottom:8}}>
                  <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:8}}>
                    <span style={{fontSize:24}}>{plan.icon}</span>
                    <div style={{flex:1}}>
                      <div style={{fontFamily:"Cinzel,serif",fontSize:11,color:plan.color,letterSpacing:1}}>{plan.label}</div>
                      <div style={{fontSize:11,color:"#888"}}>{plan.focus}</div>
                      <div style={{fontSize:10,color:"#555"}}>{plan.exercises.length} exercícios</div>
                    </div>
                  </div>
                  <div style={{display:"flex",gap:6}}>
                    <button className="tbtn" onClick={()=>startWorkout(key)} style={{flex:2,padding:"9px 0",borderRadius:8,background:plan.color,color:"#000",fontFamily:"Cinzel,serif",fontSize:10,fontWeight:700,letterSpacing:1}}>▶ INICIAR</button>
                    <button className="tbtn" onClick={()=>openEditPlan(key)} style={{flex:1,padding:"9px 0",borderRadius:8,background:"#0f0f1e",border:`1px solid ${plan.color}44`,color:plan.color,fontFamily:"Cinzel,serif",fontSize:9}}>✎ EDITAR</button>
                    {!plan.isDefault&&<button className="tbtn" onClick={()=>deletePlan(key)} style={{padding:"9px 10px",borderRadius:8,background:"#1e0808",border:"1px solid #ef444433",color:"#ef4444",fontSize:12}}>🗑</button>}
                  </div>
                </div>
              ))}
              {(char.workoutLog||[]).length>0&&<><div style={{fontFamily:"Cinzel,serif",fontSize:9,letterSpacing:3,color:"#555",margin:"10px 0 8px"}}>HISTÓRICO</div>{(char.workoutLog||[]).slice(0,4).map((w,i)=><div key={i} style={{background:"#0f0f1e",border:"1px solid #1a1838",borderRadius:9,padding:"8px 12px",marginBottom:4,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><span style={{fontSize:12,color:"#aaa"}}>{w.label}</span><div style={{fontSize:10,color:"#555"}}>{w.date} · {w.done}/{w.total}</div></div><span style={{fontFamily:"Cinzel,serif",fontSize:12,color:"#f0c040"}}>+{w.xp} XP</span></div>)}</>}
            </>}

            {/* ── ACTIVE WORKOUT ── */}
            {workoutView==="active"&&activeWorkout&&(()=>{const plan=plans[activeWorkout];const done2=plan.exercises.filter(e=>doneEx[e.id]).length;return<div>
              <div style={{background:`linear-gradient(135deg,${plan.color}18,${plan.color}06)`,border:`1px solid ${plan.color}55`,borderRadius:12,padding:"12px",marginBottom:10}}>
                <div style={{fontFamily:"Cinzel,serif",fontSize:9,color:plan.color,letterSpacing:2,marginBottom:2}}>{plan.label.toUpperCase()}</div>
                <div style={{fontSize:12,color:"#aaa",marginBottom:8}}>{plan.focus}</div>
                <div style={{height:5,background:"#1a1838",borderRadius:3,overflow:"hidden",marginBottom:4}}><div style={{height:"100%",width:`${(done2/plan.exercises.length)*100}%`,background:plan.color,borderRadius:3,transition:"width 0.3s"}}/></div>
                <div style={{fontSize:10,color:"#555"}}>{done2}/{plan.exercises.length} exercícios</div>
              </div>
              {plan.exercises.map(ex=>{const done3=!!doneEx[ex.id];return<button key={ex.id} className="btn" onClick={()=>setDoneEx(d=>({...d,[ex.id]:!d[ex.id]}))} style={{marginBottom:6}}><div style={{background:done3?`linear-gradient(135deg,${plan.color}18,${plan.color}08)`:"#0f0f1e",border:`1px solid ${done3?plan.color+"66":"#1a1838"}`,borderRadius:10,padding:"11px 12px"}}><div style={{display:"flex",alignItems:"center",gap:10,marginBottom:3}}><div style={{width:22,height:22,borderRadius:6,border:`2px solid ${done3?plan.color:"#2a2848"}`,background:done3?plan.color+"33":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{done3&&<span style={{color:plan.color,fontSize:12,fontWeight:900}}>✓</span>}</div><div style={{flex:1}}><div style={{fontSize:13,color:done3?"#e8dfc0":"#aaa"}}>{ex.name}</div><div style={{fontSize:11,color:plan.color}}>{ex.sets}x {ex.reps} · {ex.rest}</div></div></div><div style={{fontSize:10,color:"#555",paddingLeft:32}}>💡 {ex.tip}</div></div></button>;})}
              <div style={{display:"flex",gap:6,marginTop:4,marginBottom:10}}><button className="tbtn" onClick={()=>{setActiveWorkout(null);setWorkoutView("list");}} style={{flex:1,padding:"10px",borderRadius:9,border:"1px solid #2a2848",color:"#666",fontFamily:"Cinzel,serif",fontSize:10}}>CANCELAR</button><button className="tbtn" onClick={finishWorkout} style={{flex:2,padding:"10px",borderRadius:9,background:`linear-gradient(135deg,${plan.color}22,${plan.color}11)`,border:`1px solid ${plan.color}55`,color:plan.color,fontFamily:"Cinzel,serif",fontSize:11,letterSpacing:1}}>✓ CONCLUIR</button></div>
            </div>;})()} 

            {/* ── EDIT WORKOUT ── */}
            {workoutView==="edit"&&editPlan&&<div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div>
                  <div style={{fontFamily:"Cinzel,serif",fontSize:11,color:editPlan.color,letterSpacing:1}}>EDITANDO: {editPlan.label}</div>
                  <div style={{fontSize:11,color:"#666"}}>{editPlan.exercises.length} exercícios</div>
                </div>
                <div style={{display:"flex",gap:6}}>
                  <button className="tbtn" onClick={()=>{setWorkoutView("list");setEditingPlanKey(null);setEditPlan(null);}} style={{color:"#555",fontFamily:"Cinzel,serif",fontSize:9,border:"1px solid #2a2848",borderRadius:7,padding:"6px 10px"}}>CANCELAR</button>
                  <button className="tbtn" onClick={saveEditPlan} style={{color:editPlan.color,fontFamily:"Cinzel,serif",fontSize:9,border:`1px solid ${editPlan.color}55`,borderRadius:7,padding:"6px 10px",background:`${editPlan.color}22`}}>✓ SALVAR</button>
                </div>
              </div>

              {/* Edit name/focus */}
              <Card style={{marginBottom:10}}>
                <Lbl>INFORMAÇÕES DA FICHA</Lbl>
                <input className="inp" value={editPlan.label} onChange={e=>setEditPlan(p=>({...p,label:e.target.value}))} placeholder="Nome da ficha" style={{marginBottom:6}}/>
                <input className="inp" value={editPlan.focus} onChange={e=>setEditPlan(p=>({...p,focus:e.target.value}))} placeholder="Foco (ex: Peito · Tríceps)"/>
              </Card>

              {/* Existing exercises */}
              <Lbl>EXERCÍCIOS ATUAIS</Lbl>
              {editPlan.exercises.map((ex,idx)=>(
                <Card key={ex.id} style={{marginBottom:7}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                    <input className="inp" value={ex.name} onChange={e=>updateExField(idx,"name",e.target.value)} style={{flex:1,marginRight:8,padding:"6px 9px",fontSize:13}}/>
                    <button className="tbtn" onClick={()=>removeExercise(idx)} style={{color:"#ef4444",fontSize:16,flexShrink:0}}>🗑</button>
                  </div>
                  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginBottom:5}}>
                    <div><div style={{fontSize:8,color:"#555",marginBottom:2}}>SÉRIES</div><input className="inp" value={ex.sets} onChange={e=>updateExField(idx,"sets",e.target.value)} style={{padding:"6px 8px",fontSize:12}}/></div>
                    <div><div style={{fontSize:8,color:"#555",marginBottom:2}}>REPS</div><input className="inp" value={ex.reps} onChange={e=>updateExField(idx,"reps",e.target.value)} style={{padding:"6px 8px",fontSize:12}}/></div>
                    <div><div style={{fontSize:8,color:"#555",marginBottom:2}}>DESCANSO</div><input className="inp" value={ex.rest} onChange={e=>updateExField(idx,"rest",e.target.value)} style={{padding:"6px 8px",fontSize:12}}/></div>
                  </div>
                  <input className="inp" value={ex.tip} onChange={e=>updateExField(idx,"tip",e.target.value)} placeholder="Dica (opcional)" style={{fontSize:11,padding:"6px 9px"}}/>
                </Card>
              ))}

              {/* Add new exercise */}
              <Card style={{marginTop:4,marginBottom:10}} glow="#34d39933">
                <Lbl color="#34d399">+ ADICIONAR EXERCÍCIO</Lbl>
                <input className="inp" value={newExName} onChange={e=>setNewExName(e.target.value)} placeholder="Nome do exercício" style={{marginBottom:6}}/>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,marginBottom:6}}>
                  <div><div style={{fontSize:8,color:"#555",marginBottom:2}}>SÉRIES</div><input className="inp" value={newExSets} onChange={e=>setNewExSets(e.target.value)} style={{padding:"6px 8px",fontSize:12}}/></div>
                  <div><div style={{fontSize:8,color:"#555",marginBottom:2}}>REPS</div><input className="inp" value={newExReps} onChange={e=>setNewExReps(e.target.value)} style={{padding:"6px 8px",fontSize:12}}/></div>
                  <div><div style={{fontSize:8,color:"#555",marginBottom:2}}>DESCANSO</div><input className="inp" value={newExRest} onChange={e=>setNewExRest(e.target.value)} style={{padding:"6px 8px",fontSize:12}}/></div>
                </div>
                <input className="inp" value={newExTip} onChange={e=>setNewExTip(e.target.value)} placeholder="Dica (opcional)" style={{marginBottom:9,fontSize:11}}/>
                <button className="sbtn" onClick={addExerciseToEdit} style={{background:"linear-gradient(135deg,#0a2010,#0d2a14)",border:"1px solid #34d39955",color:"#34d399",fontSize:11,letterSpacing:1}}>+ ADICIONAR EXERCÍCIO</button>
              </Card>
            </div>}

            {/* ── NEW PLAN ── */}
            {workoutView==="new"&&<div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <Lbl mb={0}>NOVA FICHA DE TREINO</Lbl>
                <button className="tbtn" onClick={()=>setWorkoutView("list")} style={{color:"#555",fontSize:16}}>✕</button>
              </div>
              <Card style={{marginBottom:10}}>
                <input className="inp" value={newPlanName} onChange={e=>setNewPlanName(e.target.value)} placeholder="Nome da ficha (ex: Treino de Perna)" style={{marginBottom:7}}/>
                <input className="inp" value={newPlanFocus} onChange={e=>setNewPlanFocus(e.target.value)} placeholder="Foco (ex: Quadríceps · Glúteo)" style={{marginBottom:10}}/>
                <Lbl>ÍCONE</Lbl>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:10}}>
                  {PLAN_ICONS.map(ic=><button key={ic} className="tbtn" onClick={()=>setNewPlanIcon(ic)} style={{fontSize:22,opacity:newPlanIcon===ic?1:0.3}}>{ic}</button>)}
                </div>
                <Lbl>COR</Lbl>
                <div style={{display:"flex",flexWrap:"wrap",gap:6,marginBottom:12}}>
                  {PLAN_COLORS.map(c=><button key={c} className="tbtn" onClick={()=>setNewPlanColor(c)} style={{width:28,height:28,borderRadius:8,background:c,border:`3px solid ${newPlanColor===c?"#fff":"transparent"}`}}/>)}
                </div>
                <button className="sbtn" onClick={createNewPlan} style={{background:`linear-gradient(135deg,${newPlanColor}33,${newPlanColor}11)`,border:`1px solid ${newPlanColor}66`,color:newPlanColor,fontSize:12,letterSpacing:1,fontWeight:700}}>✓ CRIAR FICHA</button>
              </Card>
              <div style={{background:"#0f0f1e",border:"1px solid #1a1838",borderRadius:9,padding:"9px 12px"}}>
                <div style={{fontSize:11,color:"#555"}}>💡 Depois de criar, clique em ✎ EDITAR para adicionar os exercícios da sua nova ficha.</div>
              </div>
            </div>}
          </>}

          {bodyTab==="corrida"&&<>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:10}}>{[{l:"Total",v:fmtKm(char.stats.totalKm),i:"📍",c:"#34d399"},{l:"Corridas",v:`${char.stats.totalRuns||0}x`,i:"🏃",c:"#60a5fa"},{l:"Recorde",v:fmtKm(char.stats.prKm),i:"🏅",c:"#f0c040"}].map((s,i)=><Card key={i} style={{padding:"10px",textAlign:"center"}}><div style={{fontSize:17,marginBottom:3}}>{s.i}</div><div style={{fontFamily:"Cinzel,serif",fontSize:13,color:s.c,fontWeight:700}}>{s.v}</div><div style={{fontSize:8,color:"#444",letterSpacing:1,marginTop:1}}>{s.l.toUpperCase()}</div></Card>)}</div>
            <Card glow="#34d39933" style={{marginBottom:10}}><Lbl>REGISTRAR CORRIDA</Lbl><div style={{display:"flex",gap:5,marginBottom:6}}><input className="inp" value={runKm} onChange={e=>setRunKm(e.target.value)} type="number" step="0.1" placeholder="Distância (km)" style={{flex:1}}/><input className="inp" value={runMin} onChange={e=>setRunMin(e.target.value)} type="number" placeholder="Tempo (min)" style={{flex:1}}/></div><div style={{display:"flex",gap:4,marginBottom:8}}>{[2,5,8,10].map(k=><button key={k} className="tbtn" onClick={()=>setRunKm(String(k))} style={{flex:1,padding:"7px 0",borderRadius:7,border:`1px solid ${parseFloat(runKm)===k?"#34d39966":"#2a2848"}`,background:parseFloat(runKm)===k?"#34d39922":"transparent",color:parseFloat(runKm)===k?"#34d399":"#555",fontFamily:"Cinzel,serif",fontSize:9}}>{k}km</button>)}</div>{runKm&&<div style={{marginBottom:8,padding:"6px 10px",background:"#141228",borderRadius:7,border:"1px solid #2a2848",display:"flex",justifyContent:"space-between",fontSize:11,color:"#888"}}><span>XP estimado</span><span style={{color:"#34d399",fontFamily:"Cinzel,serif",fontWeight:700}}>+{RUN_XP(parseFloat(runKm)||0)}{parseFloat(runKm)>(char.stats.prKm||0)?" + 20 PR!":""}</span></div>}<button className="sbtn" onClick={logRun} style={{background:"linear-gradient(135deg,#0a2010,#0d2a14)",border:"1px solid #34d39955",color:"#34d399",fontSize:11,letterSpacing:1}}>🏃 REGISTRAR</button></Card>
            {(char.runs||[]).length>0&&(()=>{const now=new Date();const days=[];for(let i=29;i>=0;i--){const d=new Date(now);d.setDate(d.getDate()-i);days.push(d.toISOString().slice(0,10));}const byDay={};(char.runs||[]).forEach(r=>{if(r.date)byDay[r.date]=(byDay[r.date]||0)+r.km;});return<><Lbl>ÚLTIMOS 30 DIAS</Lbl><div style={{display:"grid",gridTemplateColumns:"repeat(10,1fr)",gap:4,marginBottom:10}}>{days.map(d=>{const km2=byDay[d]||0;return<div key={d} title={`${d}: ${km2}km`} style={{height:18,borderRadius:3,background:km2>=10?"#34d399":km2>=5?"#22a374":km2>0?"#115c3f":"#1a1838"}}/>;})}</div></>;})()} 
            {(char.runs||[]).length>0&&<><Lbl>HISTÓRICO COMPLETO</Lbl>{(char.runs||[]).slice(0,10).map((r,i)=><div key={i} style={{background:"#0f0f1e",border:`1px solid ${r.pr?"#f0c04044":"#1a1838"}`,borderRadius:9,padding:"8px 12px",marginBottom:4,display:"flex",justifyContent:"space-between",alignItems:"center"}}><div><span style={{fontSize:12}}>🏃 <span style={{color:"#888"}}>{r.date}</span></span>{r.pace&&<div style={{fontSize:9,color:"#555"}}>{Math.floor(r.pace/60)}'{r.pace%60}" /km</div>}</div><div style={{display:"flex",gap:7,alignItems:"center"}}>{r.pr&&<span style={{fontSize:8,fontFamily:"Cinzel,serif",color:"#f0c040",background:"#f0c04022",border:"1px solid #f0c04044",borderRadius:5,padding:"1px 5px"}}>PR</span>}<span style={{fontFamily:"Cinzel,serif",fontSize:13,color:"#34d399",fontWeight:700}}>{r.km}km</span><span style={{fontSize:10,color:"#555"}}>+{r.xp}</span></div></div>)}</>}
          </>}

          {bodyTab==="medidas"&&<>
            <Card style={{marginBottom:10}}><Lbl>ALTURA E PESO</Lbl><div style={{display:"flex",gap:5,marginBottom:8}}><input className="inp" value={weightIn} onChange={e=>setWeightIn(e.target.value)} type="number" step="0.1" placeholder={`Peso kg${char.body?.weight?` (${char.body.weight})`:""}`} style={{flex:1}}/><input className="inp" value={heightIn} onChange={e=>setHeightIn(e.target.value)} type="number" placeholder={`Altura cm${char.body?.height?` (${char.body.height})`:""}`} style={{flex:1}}/></div><button className="sbtn" onClick={saveBodyStats} style={{background:"linear-gradient(135deg,#0a2010,#0d2a14)",border:"1px solid #34d39955",color:"#34d399",fontSize:11,letterSpacing:1}}>💾 SALVAR MEDIDAS</button></Card>
            {bmi&&<Card glow={bmiC.c+"44"} style={{marginBottom:10,textAlign:"center",padding:"20px 14px"}}><Lbl mb={8}>ÍNDICE DE MASSA CORPORAL</Lbl><div style={{fontFamily:"Cinzel,serif",fontSize:48,fontWeight:900,color:bmiC.c,textShadow:`0 0 20px ${bmiC.c}66`}}>{bmi}</div><div style={{fontFamily:"Cinzel,serif",fontSize:14,color:bmiC.c,marginBottom:8}}>{bmiC.l}</div><div style={{height:8,background:"#1a1838",borderRadius:4,overflow:"hidden",marginBottom:12}}><div style={{height:"100%",width:`${Math.min(100,Math.max(0,((bmi-10)/30)*100))}%`,background:`linear-gradient(90deg,${bmiC.c}77,${bmiC.c})`,borderRadius:4}}/></div><div style={{fontSize:12,color:"#888"}}>{bmiC.t}</div><div style={{display:"flex",justifyContent:"space-around",marginTop:14}}>{[{l:"PESO",v:`${char.body.weight}kg`},{l:"ALTURA",v:`${char.body.height}cm`}].map((s,i)=><div key={i}><div style={{fontFamily:"Cinzel,serif",fontSize:16,color:"#e8dfc0"}}>{s.v}</div><div style={{fontSize:9,color:"#555"}}>{s.l}</div></div>)}</div></Card>}
            <Card><Lbl>TABELA IMC</Lbl>{[["< 18.5","Abaixo do peso","#60a5fa"],[" 18.5 – 24.9","Peso ideal ✓","#22c55e"],["25 – 29.9","Sobrepeso","#f59e0b"],["30 – 34.9","Obesidade I","#f97316"],["≥ 35","Obesidade II+","#ef4444"]].map(([r,l,c],i)=><div key={i} style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><span style={{fontSize:11,color:"#777"}}>{r}</span><span style={{fontSize:11,color:c,fontFamily:"Cinzel,serif"}}>{l}</span></div>)}</Card>
          </>}
        </div>}

        {/* LIFE */}
        {tab==="life"&&<div style={{padding:"12px 12px 0"}}>
          <STabs tabs={[{id:"financeiro",i:"💰",l:"Finanças",c:"#22c55e"},{id:"perfil",i:"👤",l:"Perfil",c:"#f0c040"}]} val={lifeTab} onChange={setLifeTab}/>

          {lifeTab==="financeiro"&&<>
            <Card glow="#22c55e33" style={{marginBottom:10}}><div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><div><Lbl mb={2}>SALÁRIO MENSAL</Lbl>{editingSalary?<div style={{display:"flex",gap:5,marginTop:5}}><input className="inp" value={salaryIn} onChange={e=>setSalaryIn(e.target.value)} type="number" placeholder="Valor" style={{width:130}}/><button className="tbtn" onClick={saveSalary} style={{background:"#22c55e22",border:"1px solid #22c55e55",color:"#22c55e",borderRadius:7,padding:"7px 11px",fontFamily:"Cinzel,serif",fontSize:9}}>OK</button><button className="tbtn" onClick={()=>setEditingSalary(false)} style={{color:"#555",background:"none",border:"1px solid #2a2848",borderRadius:7,padding:"7px 9px",fontSize:11}}>✕</button></div>:<button className="tbtn" onClick={()=>{setEditingSalary(true);setSalaryIn(String(salary));}} style={{background:"none",border:"none",padding:0,display:"flex",alignItems:"center",gap:6,cursor:"pointer"}}><span style={{fontFamily:"Cinzel,serif",fontSize:22,fontWeight:700,color:"#22c55e"}}>{curr(salary)}</span><span style={{fontSize:10,color:"#444"}}>✎</span></button>}</div><div style={{textAlign:"right"}}><div style={{fontFamily:"Cinzel,serif",fontSize:15,color:remaining>=0?"#22c55e":"#ef4444"}}>{curr(remaining)}</div><div style={{fontSize:9,color:"#555"}}>disponível</div></div></div><div style={{height:8,background:"#1a1838",borderRadius:4,overflow:"hidden",marginBottom:5}}><div style={{height:"100%",width:`${Math.min(100,(totalExp/salary)*100)}%`,background:`linear-gradient(90deg,${remaining>=0?"#22c55e":"#ef4444"}88,${remaining>=0?"#22c55e":"#ef4444"})`,borderRadius:4,transition:"width 0.5s"}}/></div><div style={{display:"flex",justifyContent:"space-between",fontSize:9,color:"#555"}}><span>Comprometido: {curr(totalExp)}</span><span>{Math.round((totalExp/salary)*100)}% do salário</span></div></Card>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><Lbl mb={0}>GASTOS E CONTAS</Lbl><button className="tbtn" onClick={()=>setAddingExp(v=>!v)} style={{background:"#0a2010",border:"1px solid #22c55e44",color:"#22c55e",borderRadius:7,padding:"4px 10px",fontFamily:"Cinzel,serif",fontSize:8,letterSpacing:1}}>+ ADICIONAR</button></div>
            {addingExp&&<Card style={{marginBottom:10}}><Lbl>NOVO GASTO</Lbl><div style={{display:"flex",flexWrap:"wrap",gap:4,marginBottom:7}}>{["🍽️","📱","🌐","💳","🏠","🎮","💊","📚","✈️","🎵","⛽","💄"].map(ic=><button key={ic} className="tbtn" onClick={()=>setNewExpIcon(ic)} style={{fontSize:17,opacity:newExpIcon===ic?1:0.3}}>{ic}</button>)}</div><input className="inp" value={newExpName} onChange={e=>setNewExpName(e.target.value)} placeholder="Nome do gasto" style={{marginBottom:5}}/><input className="inp" value={newExpAmt} onChange={e=>setNewExpAmt(e.target.value)} type="number" placeholder="Valor mensal (R$)" style={{marginBottom:5}}/><div style={{display:"flex",gap:5,marginBottom:9}}><input className="inp" value={newExpInst} onChange={e=>setNewExpInst(e.target.value)} type="number" placeholder="Parcela atual (ex: 2)" style={{flex:1}}/><input className="inp" value={newExpTotal} onChange={e=>setNewExpTotal(e.target.value)} type="number" placeholder="Total parcelas (ex: 12)" style={{flex:1}}/></div><div style={{display:"flex",gap:5}}><button className="tbtn" onClick={()=>setAddingExp(false)} style={{flex:1,padding:"9px",borderRadius:8,border:"1px solid #2a2848",color:"#666",fontFamily:"Cinzel,serif",fontSize:9}}>CANCELAR</button><button className="tbtn" onClick={addExpense} style={{flex:2,padding:"9px",borderRadius:8,background:"linear-gradient(135deg,#0a2010,#0d2a14)",border:"1px solid #22c55e55",color:"#22c55e",fontFamily:"Cinzel,serif",fontSize:10,letterSpacing:1}}>✓ ADICIONAR</button></div></Card>}
            {expenses.map(exp=><div key={exp.id} style={{background:exp.paid?"linear-gradient(135deg,#0a2010,#0d2a14)":"#0f0f1e",border:`1px solid ${exp.paid?"#22c55e44":"#1a1838"}`,borderRadius:11,padding:"11px 12px",marginBottom:6}}><div style={{display:"flex",alignItems:"center",gap:9}}><button className="tbtn" onClick={()=>togglePaid(exp.id)} style={{width:22,height:22,borderRadius:5,border:`2px solid ${exp.paid?"#22c55e":"#2a2848"}`,background:exp.paid?"#22c55e33":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>{exp.paid&&<span style={{color:"#22c55e",fontSize:11,fontWeight:900}}>✓</span>}</button><span style={{fontSize:18}}>{exp.icon}</span><div style={{flex:1}}><div style={{fontSize:13,color:exp.paid?"#aaa":"#e8dfc0",textDecoration:exp.paid?"line-through":"none"}}>{exp.name}</div><div style={{display:"flex",alignItems:"center",gap:8,marginTop:1}}>{exp.installments&&<div style={{fontSize:10,color:"#a78bfa"}}>📋 {exp.installments.current}/{exp.installments.total}x{exp.installments.current<exp.installments.total&&<button className="tbtn" onClick={()=>advanceInstallment(exp.id)} style={{marginLeft:4,fontSize:9,color:"#a78bfa",border:"1px solid #a78bfa44",borderRadius:4,padding:"1px 5px",fontFamily:"Cinzel,serif"}}>+1</button>}</div>}<span style={{fontSize:10,color:"#555"}}>+{FIN_XP(exp.amount)} XP ao pagar</span></div></div><div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}><span style={{fontFamily:"Cinzel,serif",fontSize:13,color:exp.paid?"#22c55e":"#e8dfc0"}}>{curr(exp.amount)}</span><button className="tbtn" onClick={()=>removeExpense(exp.id)} style={{color:"#333",fontSize:11}}>✕</button></div></div></div>)}
          </>}

          {lifeTab==="perfil"&&<>
            <Card style={{marginBottom:10}}><div style={{display:"flex",alignItems:"center",gap:12}}><div onClick={()=>setShowAvatarEditor(v=>!v)} style={{cursor:"pointer",flexShrink:0}}><AvatarSVG {...(char.avatar||{})} size={70}/><div style={{fontSize:8,color:"#555",textAlign:"center",marginTop:2}}>toque para editar</div></div><div style={{flex:1}}>{editingUsername?<div><input className="inp" value={usernameIn} onChange={e=>setUsernameIn(e.target.value)} placeholder="Seu nome" style={{marginBottom:6}}/><div style={{display:"flex",gap:5}}><button className="tbtn" onClick={saveUsername} style={{flex:1,padding:"7px",borderRadius:7,background:"#f0c04022",border:"1px solid #f0c04055",color:"#f0c040",fontFamily:"Cinzel,serif",fontSize:9}}>✓ SALVAR</button><button className="tbtn" onClick={()=>setEditingUsername(false)} style={{padding:"7px 10px",borderRadius:7,border:"1px solid #2a2848",color:"#555",fontSize:11}}>✕</button></div></div>:<button className="tbtn" onClick={()=>{setEditingUsername(true);setUsernameIn(char.username||"");}} style={{background:"none",border:"none",padding:0,cursor:"pointer",display:"flex",alignItems:"center",gap:6,marginBottom:4}}><span style={{fontFamily:"Cinzel,serif",fontSize:18,color:"#f0c040",letterSpacing:2}}>{char.username||"Jogador"}</span><span style={{fontSize:10,color:"#444"}}>✎</span></button>}<div style={{fontSize:10,color:"#a78bfa",fontFamily:"Cinzel,serif"}}>{dynTitle.icon} {dynTitle.title}</div><div style={{fontSize:10,color:"#555",marginTop:3}}>Lv.{cur.lv} · {cur.title} · {char.totalXP.toLocaleString()} XP</div></div></div></Card>
            <Lbl>ROADMAP — 20 NÍVEIS</Lbl>
            {LEVELS.map(lvl=>{const tU=timeUnlocked(lvl.months),xpOk=char.totalXP>=lvl.xp,isCur=cur.lv===lvl.lv,isPast=cur.lv>lvl.lv,uDate=unlockDate(lvl.months);return<div key={lvl.lv} style={{background:isCur?`linear-gradient(135deg,${lvl.color}18,${lvl.color}08)`:"#0f0f1e",border:`1px solid ${isCur?lvl.color+"66":isPast?"#2a2848":"#1a1838"}`,borderRadius:9,padding:"8px 12px",marginBottom:4,display:"flex",alignItems:"center",gap:9,opacity:!tU?0.4:1}}><div style={{fontFamily:"Cinzel,serif",fontWeight:900,fontSize:13,color:isPast?lvl.color:tU?"#e8dfc0":"#444",width:22,textAlign:"center",flexShrink:0}}>{isPast?"✓":tU?lvl.lv:"🔒"}</div><div style={{flex:1,minWidth:0}}><div style={{fontFamily:"Cinzel,serif",fontSize:10,color:tU?"#e8dfc0":"#444"}}>{lvl.title}</div><div style={{fontSize:9,color:"#444"}}>{lvl.xp.toLocaleString()} XP</div>{!tU&&<div style={{fontSize:8,color:"#f0c04055",fontFamily:"Cinzel,serif"}}>🔒 {uDate.toLocaleDateString("pt-BR",{month:"short",year:"numeric"})} ({daysLeft(uDate)}d)</div>}{tU&&!xpOk&&!isPast&&<div style={{fontSize:8,color:"#a78bfa77"}}>Faltam {(lvl.xp-char.totalXP).toLocaleString()} XP</div>}</div>{isCur&&<div style={{fontSize:7,fontFamily:"Cinzel,serif",color:lvl.color,border:`1px solid ${lvl.color}55`,borderRadius:4,padding:"2px 5px",flexShrink:0}}>ATUAL</div>}</div>;})}
          </>}
        </div>}
      </div>

      {/* NAV */}
      <div style={{position:"fixed",bottom:0,left:"50%",transform:"translateX(-50%)",width:"100%",maxWidth:480,background:"#09080f",borderTop:"1px solid #181530",display:"flex",justifyContent:"space-around",padding:"6px 0 10px",zIndex:100}}>
        {[{id:"home",i:"🏠",l:"Home"},{id:"daily",i:"⚔️",l:"Daily"},{id:"study",i:"📚",l:"Estudar"},{id:"body",i:"💪",l:"Treino"},{id:"life",i:"💵",l:"Life"}].map(t=>(
          <button key={t.id} className="tbtn" onClick={()=>setTab(t.id)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:1,padding:"3px 9px",borderRadius:9,background:tab===t.id?"#1a1535":"transparent",position:"relative"}}>
            {t.id==="study"&&timerOn&&<div style={{position:"absolute",top:0,right:5,width:6,height:6,borderRadius:"50%",background:"#ef4444",animation:"blink 1s infinite"}}/>}
            {t.id==="study"&&weakSubs.length>0&&!timerOn&&<div style={{position:"absolute",top:0,right:5,width:6,height:6,borderRadius:"50%",background:"#ef4444"}}/>}
            <div style={{fontSize:19}}>{t.i}</div>
            <div style={{fontFamily:"Cinzel,serif",fontSize:7,letterSpacing:1,color:tab===t.id?"#f0c040":"#3a3555"}}>{t.l.toUpperCase()}</div>
          </button>
        ))}
      </div>
    </div>
  );
}
