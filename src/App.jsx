import React, { useState, useRef, useCallback, useEffect } from "react";

// ── CORES ────────────────────────────────────────────────────────────────────
const bg="#000000",s1="#09111f",s2="#0d1828",s3="#121f33",brd="#1a2d47";
const gold="#c8a235",green="#22c55e",wa="#25D366",txt="#ccd8ee",sub="#5a7899";
const danger="#ef4444",warn="#f59e0b",info="#60a5fa";
const sc=s=>s>=70?"#22c55e":s>=40?"#f59e0b":"#ef4444";
const R=v=>v?`R$ ${Number(v).toLocaleString("pt-BR",{maximumFractionDigits:0})}`:"—";
const H=()=>new Date().toLocaleTimeString("pt-BR",{hour:"2-digit",minute:"2-digit"});

// ── CSS ───────────────────────────────────────────────────────────────────────
const CSS=`*{box-sizing:border-box;margin:0;padding:0}body{background:${bg};color:${txt};font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;overflow:hidden}::-webkit-scrollbar{width:3px}::-webkit-scrollbar-thumb{background:${brd};border-radius:3px}input,textarea{outline:none}button{cursor:pointer}@keyframes spin{to{transform:rotate(360deg)}}@keyframes pop{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}@keyframes sl{from{opacity:0;transform:translateY(4px)}to{opacity:1}}@keyframes fadeup{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}@keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}.spin{animation:spin .6s linear infinite}.pop{animation:pop .2s ease both}.sl{animation:sl .18s ease both}.fadeup{animation:fadeup .45s cubic-bezier(.22,1,.36,1) both}.pulse{animation:pulse 2.5s ease infinite}`;

// ── UI ────────────────────────────────────────────────────────────────────────
const Sp=({n=13,c=gold})=><div className="spin" style={{width:n,height:n,border:`2px solid ${brd}`,borderTopColor:c,borderRadius:"50%",flexShrink:0}}/>;
const Av=({v,n=36})=><div style={{width:n,height:n,borderRadius:"50%",background:"linear-gradient(135deg,#1a3a60,#2a5a90)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:Math.round(n*.35),fontWeight:700,color:gold,flexShrink:0}}>{(v||"?").slice(0,2).toUpperCase()}</div>;

// ── DEMO ──────────────────────────────────────────────────────────────────────
const DEMO=[
  {id:"d1",nome:"Lucas Ferreira",fone:"+5511999001001",unread:2,ult:"Preciso de vaga de garagem. Trabalho no Itaim.",hora:"09:17",score:0,crm:{},status:"novo",
   msgs:[{id:1,dir:"in",de:"Lucas",txt:"Olá! Vi o anúncio do apt 3 quartos em Moema. Disponível?",h:"09:14"},{id:2,dir:"out",de:"Corretor",txt:"Bom dia, Lucas! Disponível! Tem faixa de investimento em mente?",h:"09:15"},{id:3,dir:"in",de:"Lucas",txt:"600 a 800 mil. Família com 2 filhos, área de lazer importante.",h:"09:16"},{id:4,dir:"in",de:"Lucas",txt:"Preciso de vaga de garagem. Trabalho no Itaim, localização importa muito.",h:"09:17"}]},
  {id:"d2",nome:"Mariana Santos",fone:"+5511999002002",unread:1,ult:"Quais as formas de pagamento? Tem Caixa?",hora:"08:43",score:0,crm:{},status:"novo",
   msgs:[{id:1,dir:"in",de:"Mariana",txt:"Vi o studio em Pinheiros. O preço ainda é R$ 420k?",h:"08:30"},{id:2,dir:"out",de:"Corretor",txt:"Boa tarde! Sim esse valor. Uso próprio ou investimento?",h:"08:32"},{id:3,dir:"in",de:"Mariana",txt:"Uso próprio! Trabalho na Faria Lima, seria perfeito.",h:"08:35"},{id:4,dir:"in",de:"Mariana",txt:"Quais as formas de pagamento? Tem financiamento pela Caixa?",h:"08:43"}]},
  {id:"d3",nome:"Patricia Nunes",fone:"+5511999007007",unread:2,ult:"Se der 2% de desconto, fecho hoje mesmo!",hora:"09:05",score:0,crm:{},status:"novo",
   msgs:[{id:1,dir:"in",de:"Patricia",txt:"Ainda tem a cobertura nos Jardins disponível?",h:"08:50"},{id:2,dir:"out",de:"Corretor",txt:"Bom dia Patricia! Temos sim! Posso enviar os detalhes?",h:"08:52"},{id:3,dir:"in",de:"Patricia",txt:"Manda tudo! Orçamento até 2.5 mi.",h:"08:55"},{id:4,dir:"in",de:"Patricia",txt:"Se der 2% de desconto, fecho hoje mesmo!",h:"09:05"}]},
  {id:"d4",nome:"Roberto Alves",fone:"+5511999003003",unread:0,ult:"Vou conversar com minha esposa e retorno.",hora:"Ontem",score:0,crm:{},status:"novo",
   msgs:[{id:1,dir:"in",de:"Roberto",txt:"Tenho interesse em casa no Alphaville.",h:"14:20"},{id:2,dir:"out",de:"Corretor",txt:"Olá Roberto! Qual sua faixa de investimento?",h:"14:22"},{id:3,dir:"in",de:"Roberto",txt:"1 a 1.2 mi. Família com 3 filhos.",h:"14:25"},{id:4,dir:"in",de:"Roberto",txt:"Vou conversar com minha esposa e retorno amanhã.",h:"15:10"}]},
  {id:"d5",nome:"Ana Lima",fone:"+5511999006006",unread:3,ult:"Quando posso agendar visita? Prefiro sábado.",hora:"08:15",score:0,crm:{},status:"novo",
   msgs:[{id:1,dir:"in",de:"Ana",txt:"Interesse no apt 3 quartos com suíte no Brooklin.",h:"08:10"},{id:2,dir:"out",de:"Corretor",txt:"Boa tarde, Ana! Já conhece o empreendimento?",h:"08:12"},{id:3,dir:"in",de:"Ana",txt:"Vi pelo anúncio. Orçamento até 950k.",h:"08:13"},{id:4,dir:"in",de:"Ana",txt:"Quando posso agendar visita? Prefiro sábado de manhã.",h:"08:15"}]},
];

// ── PROVEDORES DE IA ──────────────────────────────────────────────────────────
const PROVIDERS = {
  claude: { name:"Claude",  icon:"🧠", cor:"#c8a235", hint:"sk-ant-api03-...",  modelo:"claude-sonnet-4-6" },
  openai: { name:"ChatGPT", icon:"🤖", cor:"#10a37f", hint:"sk-proj-...",       modelo:"gpt-4o" },
  gemini: { name:"Gemini",  icon:"✨", cor:"#4285f4", hint:"AIzaSy...",          modelo:"gemini-2.0-flash" },
  grok:   { name:"Grok",    icon:"⚡", cor:"#9333ea", hint:"xai-...",            modelo:"grok-3" },
};

const SYSTEM_PROMPT = "Você é um coach de vendas imobiliárias expert com 20 anos de experiência. Analise conversas em profundidade e gere insights acionáveis. Retorne APENAS JSON válido, sem texto adicional.";

function buildUserPrompt(nomeContato, mensagens) {
  const conv = mensagens.map(m=>`${m.de}: ${m.txt}`).join("\n");
  return `Analise a conversa com ${nomeContato} e retorne APENAS JSON válido:
{
  "crm": {
    "orcamento_max": null,
    "tipo_imovel": null,
    "localizacao": null,
    "dormitorios": null,
    "urgencia": null,
    "score_lead": 0,
    "necessidades": [],
    "objecoes": []
  },
  "estudo": {
    "perfil_comprador": "Descreva em 2-3 frases quem é esse cliente, motivação real e momento de vida",
    "comportamento": "Como ele toma decisões: racional/emocional, rápido/lento, influência de terceiros",
    "o_que_realmente_quer": "O que está por trás do pedido explícito dele",
    "como_abordar": "Tom, velocidade e estilo ideal para esse cliente específico",
    "pontos_de_atencao": ["ponto 1", "ponto 2"],
    "probabilidade_fechar": "alta|media|baixa",
    "tempo_estimado": "Ex: 1-3 dias, semana, mês"
  },
  "acao": {
    "tecnica": "nome da técnica",
    "motivo": "por que esta é a melhor ação agora em 1 frase",
    "mensagem": "mensagem completa, personalizada, pronta para copiar e enviar",
    "como_responder": "Orientação sobre TOM e ABORDAGEM para responder essa mensagem específica",
    "prioridade": "alta|media|normal"
  },
  "objecoes_provaveis": [
    {"objecao": "objeção que pode vir", "resposta": "como responder"}
  ],
  "proximo_passo": "ação concreta a ser tomada após enviar a mensagem",
  "sinal_fechamento": false
}

Conversa:
${conv}`;
}

function parseJsonResposta(raw) {
  const clean = raw.replace(/```json\n?|```/g,"").trim();
  return JSON.parse(clean);
}

async function chamarClaude(nomeContato, mensagens) {
  const provider = localStorage.getItem("ai_provider") || "claude";
  const apiKey   = localStorage.getItem(`${provider}_key`) || "";
  const pInfo    = PROVIDERS[provider];

  if (!apiKey) return { erro: `Chave da API ${pInfo.name} não configurada. Cole sua chave na tela inicial.` };

  const userPrompt = buildUserPrompt(nomeContato, mensagens);

  try {
    let raw = "";

    // ── Claude (Anthropic) ──────────────────────────────────────────────────
    if (provider === "claude") {
      const r = await fetch("https://api.anthropic.com/v1/messages", {
        method:"POST",
        headers:{
          "Content-Type":"application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
          "anthropic-dangerous-direct-browser-access": "true"
        },
        body: JSON.stringify({
          model: pInfo.modelo,
          max_tokens: 1500,
          system: SYSTEM_PROMPT,
          messages: [{ role:"user", content: userPrompt }]
        })
      });
      if (!r.ok) { const e=await r.json().catch(()=>({})); return {erro:`Claude ${r.status}: ${e?.error?.message||r.statusText}`}; }
      const d = await r.json();
      raw = d.content?.find(b=>b.type==="text")?.text ?? "{}";

    // ── OpenAI (ChatGPT) ────────────────────────────────────────────────────
    } else if (provider === "openai") {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method:"POST",
        headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${apiKey}` },
        body: JSON.stringify({
          model: pInfo.modelo,
          max_tokens: 1500,
          response_format: { type:"json_object" },
          messages:[
            { role:"system", content: SYSTEM_PROMPT },
            { role:"user",   content: userPrompt }
          ]
        })
      });
      if (!r.ok) { const e=await r.json().catch(()=>({})); return {erro:`ChatGPT ${r.status}: ${e?.error?.message||r.statusText}`}; }
      const d = await r.json();
      raw = d.choices?.[0]?.message?.content ?? "{}";

    // ── Gemini (Google) ─────────────────────────────────────────────────────
    } else if (provider === "gemini") {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${pInfo.modelo}:generateContent?key=${apiKey}`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({
          systemInstruction:{ parts:[{ text: SYSTEM_PROMPT }] },
          contents:[{ parts:[{ text: userPrompt }] }],
          generationConfig:{ maxOutputTokens:1500, responseMimeType:"application/json" }
        })
      });
      if (!r.ok) { const e=await r.json().catch(()=>({})); return {erro:`Gemini ${r.status}: ${e?.error?.message||r.statusText}`}; }
      const d = await r.json();
      raw = d.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

    // ── Grok (xAI) — compatível com OpenAI ─────────────────────────────────
    } else if (provider === "grok") {
      const r = await fetch("https://api.x.ai/v1/chat/completions", {
        method:"POST",
        headers:{ "Content-Type":"application/json", "Authorization":`Bearer ${apiKey}` },
        body: JSON.stringify({
          model: pInfo.modelo,
          max_tokens: 1500,
          messages:[
            { role:"system", content: SYSTEM_PROMPT },
            { role:"user",   content: userPrompt }
          ]
        })
      });
      if (!r.ok) { const e=await r.json().catch(()=>({})); return {erro:`Grok ${r.status}: ${e?.error?.message||r.statusText}`}; }
      const d = await r.json();
      raw = d.choices?.[0]?.message?.content ?? "{}";
    }

    return parseJsonResposta(raw);
  } catch(e) {
    return { erro: String(e) };
  }
}

// ── PROXY WASELLER ────────────────────────────────────────────────────────────
const PROXY="https://izpgtvqlliwbacncfaez.supabase.co/functions/v1/waseller-proxy";
async function proxy(action, url, token, extra={}) {
  const r = await fetch(`${PROXY}?action=${action}`,{
    method:"POST",headers:{"Content-Type":"application/json"},
    body:JSON.stringify({wasellerUrl:url,wasellerToken:token,...extra})
  });
  const d = await r.json();
  if(!d.ok) throw new Error(d.error||"Erro");
  return d.result;
}

// ═══════════════════════════════════════════════════════════════════
// TELA CONECTAR
// ═══════════════════════════════════════════════════════════════════
function Conectar({onEntrar}) {
  useEffect(()=>{
    const el=document.createElement("style");
    el.textContent=CSS;
    document.head.appendChild(el);
    return()=>{try{document.head.removeChild(el)}catch{}};
  },[]);

  const [url,setUrl]=useState("");
  const [tok,setTok]=useState("");
  const [provider,setProvider]=useState(localStorage.getItem("ai_provider")||"claude");
  const [apiKey,setApiKey]=useState(()=>localStorage.getItem(`${localStorage.getItem("ai_provider")||"claude"}_key`)||"");
  const [load,setLoad]=useState(false);
  const [err,setErr]=useState("");

  const trocarProvider=(p)=>{
    setProvider(p);
    setApiKey(localStorage.getItem(`${p}_key`)||"");
    localStorage.setItem("ai_provider",p);
  };

  const salvarKey=()=>{
    localStorage.setItem("ai_provider",provider);
    if(apiKey.trim()) localStorage.setItem(`${provider}_key`,apiKey.trim());
  };

  const entrarDemo=()=>{
    salvarKey();
    onEntrar("demo",null,null);
  };

  const real=async()=>{
    if(!url||!tok){setErr("Preencha URL e Token");return;}
    salvarKey();
    setLoad(true);setErr("");
    try{
      await proxy("test",url.trim(),tok.trim());
      onEntrar("real",url.trim(),tok.trim());
    }catch(e){setErr(String(e.message));setLoad(false);}
  };

  const inp={width:"100%",background:s3,border:`1px solid ${brd}`,borderRadius:10,padding:"10px 13px",color:txt,fontSize:13,transition:"border-color .2s"};
  const pInfo=PROVIDERS[provider];

  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:`radial-gradient(ellipse 100% 80% at 50% -5%, #0d1e3a 0%, ${bg} 70%)`,position:"relative",overflow:"hidden",padding:"24px 16px"}}>

      {/* blobs decorativos */}
      <div className="pulse" style={{position:"absolute",width:600,height:600,borderRadius:"60% 40% 55% 45%/50% 60% 40% 60%",background:`radial-gradient(circle at 40% 40%, ${gold}0a, transparent 65%)`,top:"-20%",left:"-15%",pointerEvents:"none",zIndex:0}}/>
      <div className="pulse" style={{position:"absolute",width:400,height:400,borderRadius:"40% 60% 45% 55%/60% 40% 60% 40%",background:"radial-gradient(circle at 60% 60%, #6366f10b, transparent 65%)",bottom:"-10%",right:"-8%",pointerEvents:"none",zIndex:0,animationDelay:".8s"}}/>

      <div className="fadeup" style={{width:440,maxWidth:"96vw",position:"relative",zIndex:1,background:"rgba(9,17,31,0.93)",border:`1px solid rgba(200,162,53,0.14)`,borderRadius:26,overflow:"hidden",boxShadow:"0 40px 100px rgba(0,0,0,.8), 0 0 0 1px rgba(255,255,255,.03), inset 0 1px 0 rgba(255,255,255,.04)"}}>

        {/* ── Logo ──────────────────────────────────────── */}
        <div style={{padding:"32px 32px 22px",textAlign:"center",borderBottom:`1px solid rgba(255,255,255,.05)`,background:"linear-gradient(180deg,rgba(13,30,56,.8) 0%, transparent 100%)"}}>
          <div style={{display:"inline-flex",alignItems:"baseline",gap:1,marginBottom:11,userSelect:"none"}}>
            <span style={{fontSize:52,fontWeight:900,color:"#fff",letterSpacing:"-4px",lineHeight:1,fontFamily:"system-ui,-apple-system"}}>GO</span>
            <span style={{fontSize:52,fontWeight:900,background:`linear-gradient(135deg,${gold} 30%,#f7e07a 100%)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"-2px",lineHeight:1,fontFamily:"system-ui,-apple-system"}}>.IA</span>
          </div>
          <div style={{fontSize:10,color:sub,letterSpacing:".2em",textTransform:"uppercase"}}>Sales Intelligence · WhatsApp · Imóveis</div>
          <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:7,marginTop:11}}>
            <div style={{height:"1px",width:36,background:`linear-gradient(90deg,transparent,${brd})`}}/>
            <span style={{fontSize:9,color:`${sub}70`,letterSpacing:".08em"}}>usando</span>
            <span style={{fontSize:9,fontWeight:700,color:pInfo.cor,letterSpacing:".04em"}}>{pInfo.icon} {pInfo.name}</span>
            <div style={{height:"1px",width:36,background:`linear-gradient(90deg,${brd},transparent)`}}/>
          </div>
        </div>

        {/* ── Provedor ──────────────────────────────────── */}
        <div style={{padding:"20px 26px 16px",borderBottom:`1px solid ${brd}`,background:`${pInfo.cor}07`}}>
          <div style={{fontSize:9,color:sub,marginBottom:11,fontWeight:700,textTransform:"uppercase",letterSpacing:".14em",textAlign:"center"}}>Escolha seu provedor de IA</div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:8,marginBottom:14}}>
            {Object.entries(PROVIDERS).map(([id,p])=>(
              <button key={id} onClick={()=>trocarProvider(id)}
                style={{padding:"11px 4px 9px",borderRadius:13,border:`1.5px solid ${provider===id?p.cor+"90":brd}`,background:provider===id?`${p.cor}1c`:s3,color:provider===id?p.cor:sub,fontSize:9,fontWeight:provider===id?700:400,display:"flex",flexDirection:"column",alignItems:"center",gap:5,transition:"all .18s",boxShadow:provider===id?`0 0 16px ${p.cor}18`:"none",letterSpacing:".03em"}}>
                <span style={{fontSize:20,lineHeight:1}}>{p.icon}</span>
                <span>{p.name}</span>
              </button>
            ))}
          </div>

          <div style={{position:"relative"}}>
            <input
              type="password"
              value={apiKey}
              onChange={e=>setApiKey(e.target.value)}
              placeholder={pInfo.hint}
              style={{...inp,border:`1.5px solid ${apiKey?green+"55":pInfo.cor+"40"}`,paddingRight:38}}
            />
            {apiKey&&<span style={{position:"absolute",right:12,top:"50%",transform:"translateY(-50%)",color:green,fontSize:15,pointerEvents:"none",fontWeight:700}}>✓</span>}
          </div>
          <div style={{fontSize:9,marginTop:6,textAlign:"center",color:apiKey?green:warn,letterSpacing:".02em"}}>
            {apiKey?`✓ Chave ${pInfo.name} salva — pronta para usar`:`Cole sua chave ${pInfo.name} para habilitar a análise IA`}
          </div>
        </div>

        {/* ── Demo ──────────────────────────────────────── */}
        <div style={{padding:"18px 26px 14px",borderBottom:`1px solid ${brd}`}}>
          <button onClick={entrarDemo}
            style={{width:"100%",padding:"14px",background:`linear-gradient(135deg,#1db954,${wa},#18a852)`,backgroundSize:"200% 200%",border:"none",borderRadius:14,color:"#fff",fontWeight:800,fontSize:15,display:"flex",alignItems:"center",justifyContent:"center",gap:9,boxShadow:`0 6px 28px ${wa}30`,letterSpacing:".02em"}}>
            <span style={{fontSize:20}}>📱</span>Entrar com demonstração
          </button>
          <div style={{fontSize:9,color:sub,textAlign:"center",marginTop:7,letterSpacing:".04em"}}>5 conversas · análise IA real · zero configuração</div>
        </div>

        {/* ── Waseller real ─────────────────────────────── */}
        <div style={{padding:"14px 26px 22px"}}>
          <div style={{fontSize:9,color:sub,textAlign:"center",marginBottom:12,textTransform:"uppercase",letterSpacing:".14em"}}>— ou conecte ao Waseller CRM —</div>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:10}}>
            <input value={url} onChange={e=>setUrl(e.target.value)} placeholder="https://app.waseller.com.br/api" style={inp}/>
            <input type="password" value={tok} onChange={e=>setTok(e.target.value)} onKeyDown={e=>e.key==="Enter"&&real()} placeholder="wsl_live_..." style={inp}/>
          </div>
          {err&&<div style={{padding:"9px 12px",background:"#2a0808",border:"1px solid #5c1010",borderRadius:9,fontSize:11,color:danger,marginBottom:10,lineHeight:1.5}}>⚠️ {err}</div>}
          <button onClick={real} disabled={load}
            style={{width:"100%",padding:"12px",background:load?s3:s2,border:`1.5px solid ${load?brd:gold+"55"}`,borderRadius:11,color:load?sub:gold,fontWeight:700,fontSize:13,display:"flex",alignItems:"center",justifyContent:"center",gap:8,transition:"all .2s"}}>
            {load?<><Sp/>Verificando...</>:"⚡ Conectar ao Waseller"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// TELA SYNC
// ═══════════════════════════════════════════════════════════════════
function Sinc({modo,url,tok,onPronto}) {
  const [pct,setPct]=useState(0);
  const [label,setLabel]=useState("Iniciando...");
  const [linhas,setLinhas]=useState([]);
  const [aviso,setAviso]=useState("");
  const fez=useRef(false);
  const log=(m,c=sub)=>setLinhas(p=>[...p,{m,c}].slice(-8));

  useEffect(()=>{
    let vivo=true;
    (async()=>{
      log("Carregando...",info);
      await new Promise(r=>setTimeout(r,300));
      if(!vivo) return;

      if(modo==="demo"){
        log("📱 Modo demonstração",wa);
        for(let p=0;p<=100;p+=5){
          if(!vivo) return;
          await new Promise(r=>setTimeout(r,55));
          setPct(p);
          if(p===25){setLabel("Carregando conversas...");log("✓ 5 conversas",green);}
          if(p===55){setLabel("Carregando mensagens...");log("✓ 20 mensagens",green);}
          if(p===80){setLabel("Preparando IA...");log("✓ Claude AI pronto",gold);}
          if(p===100) setLabel("Pronto!");
        }
        await new Promise(r=>setTimeout(r,300));
        if(!vivo||fez.current) return;
        fez.current=true;
        onPronto(DEMO);
        return;
      }

      setLabel("Conectando ao Waseller...");
      try{
        const convs=await proxy("conversations",url,tok,{page:1,limit:50});
        const arr=Array.isArray(convs)?convs:[];
        if(!arr.length) throw new Error("Sem conversas");
        log(`✓ ${arr.length} conversas`,green);
        setPct(50);setLabel("Carregando mensagens...");

        const result=[];
        for(const c of arr.slice(0,25)){
          if(!vivo) return;
          try{
            const ms=await proxy("messages",url,tok,{conv_id:c.id,limit:30});
            const mArr=Array.isArray(ms)?ms:[];
            result.push({id:c.id,nome:c.contact_name||c.contact_phone,fone:c.contact_phone,
              unread:c.unread_count||0,ult:c.last_message||"",hora:(c.last_message_at||"").slice(11,16)||"",
              score:0,crm:{},status:"novo",
              msgs:mArr.map(m=>({id:m.id,dir:m.direction==="inbound"?"in":"out",de:m.direction==="inbound"?(c.contact_name||"Cliente"):"Corretor",txt:m.text||"",h:(m.timestamp||"").slice(11,16)||""}))});
          }catch{
            result.push({id:c.id,nome:c.contact_name||c.contact_phone,fone:c.contact_phone,unread:c.unread_count||0,ult:c.last_message||"",hora:"",score:0,crm:{},status:"novo",msgs:[]});
          }
        }
        log(`✓ Mensagens carregadas`,green);
        setPct(100);setLabel("Pronto!");
        await new Promise(r=>setTimeout(r,300));
        if(!vivo||fez.current) return;
        fez.current=true;
        onPronto(result.length>0?result:DEMO);

      }catch(e){
        log(`❌ ${e.message}`,danger);
        setAviso("Erro ao conectar — usando demonstração.");
        for(let p=0;p<=100;p+=20){await new Promise(r=>setTimeout(r,100));setPct(p);}
        setLabel("Usando demonstração");
        await new Promise(r=>setTimeout(r,500));
        if(!vivo||fez.current) return;
        fez.current=true;
        onPronto(DEMO);
      }
    })();
    return()=>{vivo=false;};
  },[]);// eslint-disable-line

  return(
    <div style={{height:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:`radial-gradient(ellipse 80% 60% at 50% -5%, #0d1e3a 0%, ${bg} 65%)`}}>
      <div className="pop" style={{width:420,background:"rgba(9,17,31,0.95)",border:`1px solid rgba(200,162,53,0.14)`,borderRadius:22,padding:30,boxShadow:"0 32px 80px rgba(0,0,0,.7)"}}>
        <div style={{textAlign:"center",marginBottom:20}}>
          <div style={{display:"inline-flex",alignItems:"baseline",gap:1,marginBottom:10}}>
            <span style={{fontSize:34,fontWeight:900,color:"#fff",letterSpacing:"-2px",lineHeight:1}}>GO</span>
            <span style={{fontSize:34,fontWeight:900,background:`linear-gradient(135deg,${gold},#f0d060)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",letterSpacing:"-1.5px",lineHeight:1}}>.IA</span>
          </div>
          <div style={{fontSize:13,fontWeight:700,color:txt,marginBottom:2}}>{label}</div>
          <div style={{fontSize:10,color:sub}}>{modo==="demo"?"Demonstração":"Waseller CRM"}</div>
        </div>
        <div style={{height:6,background:brd,borderRadius:3,overflow:"hidden",marginBottom:14}}>
          <div style={{height:"100%",width:`${pct}%`,background:`linear-gradient(90deg,${gold},${green})`,borderRadius:3,transition:"width .25s"}}/>
        </div>
        {aviso&&<div style={{padding:"8px 11px",background:`${warn}10`,border:`1px solid ${warn}30`,borderRadius:8,fontSize:11,color:warn,marginBottom:10}}>⚠️ {aviso}</div>}
        <div style={{background:bg,border:`1px solid ${brd}`,borderRadius:8,padding:"9px 11px",minHeight:70,fontFamily:"monospace"}}>
          {linhas.map((l,i)=><div key={i} style={{fontSize:10,color:l.c,marginBottom:2}}>{l.m}</div>)}
          {pct<100&&<div style={{display:"flex",gap:5,alignItems:"center",marginTop:3}}><Sp n={9}/><span style={{fontSize:9,color:sub}}>processando...</span></div>}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// MENU DE NAVEGAÇÃO
// ═══════════════════════════════════════════════════════════════════
const APPS = [
  { id:"copilot",  icon:"💬", label:"Copilot IA",    desc:"Análise de conversas",  cor:"#60a5fa", url:"/" },
  { id:"crm",      icon:"📊", label:"CRM Pipeline",  desc:"Funil de vendas Kanban", cor:"#c8a235", url:"/crm" },
  { id:"email",    icon:"📧", label:"E-mail",         desc:"Disparador de e-mails",  cor:"#22c55e", url:"/email" },
  { id:"docs",     icon:"📄", label:"DocIntel",       desc:"Books e espelhos",       cor:"#a78bfa", url:"/documents" },
  { id:"templates",icon:"📋", label:"Templates",      desc:"Mensagens prontas",      cor:"#f59e0b", url:"/templates" },
  { id:"analytics",icon:"📈", label:"Analytics",      desc:"Performance e métricas", cor:"#f97316", url:"/analytics" },
  { id:"manager",  icon:"👔", label:"Gerência",       desc:"Equipe de corretores",   cor:"#ec4899", url:"/manager" },
  { id:"settings", icon:"⚙️", label:"Configurações",  desc:"Conexões e API",         cor:"#5a7899", url:"/settings" },
];

function MenuApps({ onFechar }) {
  const [hover, setHover] = useState(null);
  const abrir = (app) => {
    try { window.open(window.location.origin + app.url, "_blank"); } catch {}
    onFechar();
  };
  return (
    <div onClick={(e) => e.target === e.currentTarget && onFechar()}
      style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:9999, display:"flex", alignItems:"flex-start", justifyContent:"flex-start", padding:"54px 0 0 8px" }}>
      <div className="pop" style={{ background:"#09111f", border:"1px solid #1a2d47", borderRadius:16, padding:16, width:320, boxShadow:"0 20px 60px rgba(0,0,0,.7)" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:14 }}>
          <div>
            <div style={{ fontSize:15, fontWeight:900, letterSpacing:"-0.5px" }}>
              <span style={{color:"#fff"}}>GO</span><span style={{background:`linear-gradient(135deg,${gold},#f0d060)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>.IA</span>
            </div>
            <div style={{ fontSize:10, color:"#5a7899", marginTop:1 }}>Navegar para outro módulo</div>
          </div>
          <button onClick={onFechar} style={{ width:26, height:26, borderRadius:8, background:"#121f33", border:"1px solid #1a2d47", color:"#5a7899", fontSize:14, display:"flex", alignItems:"center", justifyContent:"center" }}>×</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:8 }}>
          {APPS.map(app => (
            <button key={app.id} onClick={() => abrir(app)} onMouseEnter={() => setHover(app.id)} onMouseLeave={() => setHover(null)}
              style={{ background: hover===app.id ? `${app.cor}15` : "#0d1828", border:`1px solid ${hover===app.id ? app.cor+"50" : "#1a2d47"}`, borderRadius:10, padding:"11px 12px", cursor:"pointer", textAlign:"left", transition:"all .15s" }}>
              <div style={{ fontSize:20, marginBottom:5 }}>{app.icon}</div>
              <div style={{ fontSize:11, fontWeight:600, color: hover===app.id ? app.cor : "#ccd8ee", marginBottom:2 }}>{app.label}</div>
              <div style={{ fontSize:9, color:"#5a7899", lineHeight:1.4 }}>{app.desc}</div>
            </button>
          ))}
        </div>
        <div style={{ marginTop:12, padding:"9px 12px", background:"#0a1628", border:"1px solid #1a2d47", borderRadius:9, fontSize:10, color:"#5a7899", lineHeight:1.6 }}>
          💡 Para usar todos os módulos com dados reais, acesse o app Next.js em produção após o deploy na Vercel.
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════
function Dashboard({modo,url,tok,convData}) {
  const [convs,setConvs]=useState(convData);
  const [sel,setSel]=useState(convData[0]||null);
  const [mensagens,setMensagens]=useState((convData[0]||{}).msgs||[]);
  const [sugs,setSugs]=useState([]);
  const [analisando,setAnalisando]=useState(false);
  const [erroIA,setErroIA]=useState("");
  const [estudo,setEstudo]=useState(null);
  const [tabDir,setTabDir]=useState("sugestao");
  const [enviando,setEnviando]=useState(null);
  const [totalEnv,setTotalEnv]=useState(0);
  const [input,setInput]=useState("");
  const [auto,setAuto]=useState(false);
  const [busca,setBusca]=useState("");
  const [menuAberto,setMenuAberto]=useState(false);
  const endRef=useRef(null);

  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"});},[mensagens.length]);

  const selecionar=useCallback((c)=>{
    setSel(c);setMensagens(c.msgs||[]);setSugs([]);setErroIA("");setEstudo(null);setTabDir("sugestao");
  },[]);

  const analisar=useCallback(async(convOpt)=>{
    const conv=convOpt||sel;
    if(!conv){setErroIA("Selecione uma conversa primeiro");return;}
    const ms=conv.msgs||[];
    if(ms.length===0){setErroIA("Esta conversa não tem mensagens para analisar.");return;}

    setAnalisando(true);setErroIA("");setSugs([]);

    const res=await chamarClaude(conv.nome,ms);

    if(res?.erro){
      setErroIA(`Erro: ${res.erro}`);
      setAnalisando(false);
      return;
    }

    const score=res.crm?.score_lead||0;
    const newStatus=res.sinal_fechamento?"fechar":score>=70?"quente":score>=40?"morno":"frio";
    const upd={...conv,score,crm:res.crm||{},status:newStatus};
    setConvs(prev=>prev.map(c=>c.id===conv.id?upd:c));
    setSel(prev=>prev?.id===conv.id?{...prev,...upd}:prev);

    if(res.estudo) setEstudo(res.estudo);
    if(res.acao?.mensagem){
      const sug={
        id:Date.now()+"_"+conv.id,
        conv_id:conv.id,
        nome:conv.nome,
        tecnica:res.acao.tecnica||"Estratégica",
        motivo:res.acao.motivo||"",
        mensagem:res.acao.mensagem,
        como_responder:res.acao.como_responder||"",
        prioridade:res.acao.prioridade||"normal",
        fechamento:res.sinal_fechamento||false,
        status:"pendente",
        h:H(),
      };
      setSugs(prev=>[sug,...prev.filter(s=>s.conv_id!==conv.id||s.status!=="pendente")]);
      if(auto&&score>=70) setTimeout(()=>enviar(sug.id,conv.id,sug.mensagem),1000);
    }
    setAnalisando(false);
  },[sel,auto]);// eslint-disable-line

  const enviar=useCallback((id,convId,msg)=>{
    const a=sugs.find(s=>s.id===id)||{conv_id:convId,mensagem:msg};
    const cid=a.conv_id,m=a.mensagem;
    if(!cid||!m) return;
    setEnviando(id);
    setTimeout(async()=>{
      if(modo==="real"&&url&&tok){
        const c=convs.find(x=>x.id===cid);
        if(c?.fone) try{await proxy("send",url,tok,{phone:c.fone,message:m,chat_id:cid});}catch{}
      }
      const nova={id:Date.now()+"",dir:"out",de:"Corretor",txt:m,h:H(),ia:true};
      setMensagens(prev=>[...prev,nova]);
      setConvs(prev=>prev.map(c=>c.id===cid?{...c,msgs:[...(c.msgs||[]),nova],ult:m.slice(0,60),hora:H(),status:"enviado"}:c));
      setSugs(prev=>prev.map(s=>s.id===id?{...s,status:"enviado",h:H()}:s));
      setTotalEnv(n=>n+1);
      setEnviando(null);
    },600);
  },[sugs,convs,modo,url,tok]);

  const rejeitar=id=>setSugs(prev=>prev.map(s=>s.id===id?{...s,status:"rejeitado"}:s));
  const aprovarTudo=()=>sugs.filter(s=>s.status==="pendente").forEach((s,i)=>setTimeout(()=>enviar(s.id,null,null),i*380));

  const enviarManual=()=>{
    if(!input.trim()||!sel) return;
    const m={id:Date.now()+"",dir:"out",de:"Corretor",txt:input.trim(),h:H()};
    setMensagens(prev=>[...prev,m]);
    setConvs(prev=>prev.map(c=>c.id===sel.id?{...c,msgs:[...(c.msgs||[]),m],ult:input.slice(0,60),hora:H()}:c));
    setInput("");
  };

  const pendentes=sugs.filter(s=>s.status==="pendente");
  const filtradas=[...convs]
    .filter(c=>!busca||(c.nome||"").toLowerCase().includes(busca.toLowerCase()))
    .sort((a,b)=>{
      if(a.unread>0&&b.unread===0) return -1;
      if(b.unread>0&&a.unread===0) return 1;
      return ({"fechar":0,"quente":1,"enviado":2,"morno":3,"frio":4,"novo":5}[a.status]??5)-
             ({"fechar":0,"quente":1,"enviado":2,"morno":3,"frio":4,"novo":5}[b.status]??5);
    });

  const COR={fechar:"#22c55e",quente:"#f97316",enviado:green,morno:warn,frio:info,novo:sub};
  const LAB={fechar:"💰 FECHAR",quente:"🔥 Quente",enviado:"✓ Enviado",morno:"⚡ Morno",frio:"❄️ Frio",novo:"● Novo"};

  return(
    <div style={{display:"flex",height:"100vh",overflow:"hidden"}}>

      {/* ── LISTA ──────────────────────────────────────────── */}
      <div style={{width:252,flexShrink:0,borderRight:`1px solid ${brd}`,background:s1,display:"flex",flexDirection:"column"}}>
        {menuAberto && <MenuApps onFechar={()=>setMenuAberto(false)}/>}

        <div style={{padding:"10px 11px",borderBottom:`1px solid ${brd}`,background:s2}}>
          <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:8}}>
            <button onClick={()=>setMenuAberto(true)} title="Abrir outros módulos"
              style={{width:23,height:23,borderRadius:6,background:menuAberto?`${gold}20`:`linear-gradient(135deg,${gold},#e0c040)`,border:`1px solid ${menuAberto?gold:brd}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,flexShrink:0,cursor:"pointer",transition:"all .15s"}}>
              {menuAberto?"✕":"⊞"}
            </button>
            <div style={{flex:1}}>
              <div style={{fontSize:13,fontWeight:900,letterSpacing:"-0.5px"}}>
                <span style={{color:"#fff"}}>GO</span><span style={{background:`linear-gradient(135deg,${gold},#f0d060)`,WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>.IA</span>
              </div>
              <div style={{fontSize:9,color:wa}}>● {modo==="demo"?"DEMO":"WASELLER"}</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{fontSize:13,fontWeight:700,color:green}}>{totalEnv}</div>
              <div style={{fontSize:8,color:sub}}>enviados</div>
            </div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:4,marginBottom:7}}>
            {[{l:"Total",v:convs.length,c:info},{l:"Urgente",v:convs.filter(c=>c.unread>0).length,c:danger},{l:"Fila",v:pendentes.length,c:gold}].map((m,i)=>(
              <div key={i} style={{background:s3,borderRadius:6,padding:"4px",textAlign:"center"}}>
                <div style={{fontSize:13,fontWeight:700,color:m.c,lineHeight:1}}>{m.v}</div>
                <div style={{fontSize:8,color:sub}}>{m.l}</div>
              </div>
            ))}
          </div>
          <div style={{display:"flex",alignItems:"center",gap:7,padding:"6px 8px",background:auto?`${green}10`:s3,border:`1px solid ${auto?green:brd}`,borderRadius:7,cursor:"pointer",marginBottom:6}} onClick={()=>setAuto(p=>!p)}>
            <div style={{width:24,height:13,borderRadius:10,background:auto?green:brd,position:"relative",flexShrink:0,transition:"background .2s"}}>
              <div style={{position:"absolute",top:2,left:auto?11:2,width:9,height:9,borderRadius:"50%",background:"#fff",transition:"left .2s"}}/>
            </div>
            <div style={{fontSize:9,fontWeight:700,color:auto?green:sub}}>Auto-Piloto {auto?"ON":"OFF"} · score≥70</div>
          </div>
          <input value={busca} onChange={e=>setBusca(e.target.value)} placeholder="Buscar..."
            style={{width:"100%",background:s3,border:`1px solid ${brd}`,borderRadius:7,padding:"5px 9px",color:txt,fontSize:11}}/>
        </div>

        <div style={{flex:1,overflowY:"auto"}}>
          {filtradas.map(c=>{
            const cor=COR[c.status]||sub;
            const lbl=LAB[c.status]||"● Novo";
            const ativa=sel?.id===c.id;
            const temSug=pendentes.some(s=>s.conv_id===c.id);
            return(
              <div key={c.id} onClick={()=>selecionar(c)}
                style={{padding:"9px 10px",borderBottom:`1px solid ${bg}`,cursor:"pointer",background:ativa?s3:temSug?`${gold}05`:"transparent",borderLeft:ativa?`3px solid ${gold}`:"3px solid transparent",transition:"all .1s"}}>
                <div style={{display:"flex",alignItems:"center",gap:7}}>
                  <div style={{position:"relative"}}>
                    <Av v={(c.nome||"?").split(" ").map(p=>p[0]).slice(0,2).join("")} n={32}/>
                    {c.unread>0&&<div style={{position:"absolute",top:-3,right:-3,width:14,height:14,borderRadius:"50%",background:danger,border:`2px solid ${s1}`,fontSize:8,fontWeight:700,color:"#fff",display:"flex",alignItems:"center",justifyContent:"center"}}>{c.unread>9?"9+":c.unread}</div>}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:1}}>
                      <span style={{fontSize:11,fontWeight:600,color:txt,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",maxWidth:110}}>{c.nome}</span>
                      <span style={{fontSize:8,color:sub}}>{c.hora}</span>
                    </div>
                    <div style={{fontSize:10,color:sub,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap",marginBottom:2}}>{c.ult}</div>
                    <div style={{display:"flex",alignItems:"center",gap:4}}>
                      <span style={{fontSize:8,padding:"0 5px",borderRadius:20,color:cor,background:`${cor}15`,border:`1px solid ${cor}30`,fontWeight:700}}>{lbl}</span>
                      {c.score>0&&<span style={{fontSize:9,fontWeight:700,color:sc(c.score),marginLeft:"auto"}}>{c.score}</span>}
                      {temSug&&<div style={{width:5,height:5,borderRadius:"50%",background:gold}}/>}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── CHAT ───────────────────────────────────────────── */}
      <div style={{flex:1,display:"flex",flexDirection:"column",minWidth:0,borderRight:`1px solid ${brd}`}}>
        {sel?(
          <>
            <div style={{padding:"9px 13px",background:s1,borderBottom:`1px solid ${brd}`,display:"flex",alignItems:"center",gap:8,flexShrink:0}}>
              <Av v={(sel.nome||"?").split(" ").map(p=>p[0]).slice(0,2).join("")} n={29}/>
              <div style={{flex:1}}>
                <div style={{fontSize:12,fontWeight:600,color:txt}}>{sel.nome}</div>
                <div style={{fontSize:9,color:wa}}>📱 {sel.fone}</div>
              </div>
              {sel.crm?.tipo_imovel&&<span style={{fontSize:9,padding:"2px 7px",borderRadius:20,color:info,background:`${info}15`,border:`1px solid ${info}30`}}>{sel.crm.tipo_imovel}</span>}
              {sel.crm?.orcamento_max&&<span style={{fontSize:9,padding:"2px 7px",borderRadius:20,color:gold,background:`${gold}15`,border:`1px solid ${gold}30`}}>{R(sel.crm.orcamento_max)}</span>}
              {sel.score>0&&<span style={{fontSize:11,fontWeight:700,color:sc(sel.score)}}>{sel.score}</span>}
            </div>

            {erroIA&&<div className="sl" style={{margin:"6px 12px 0",padding:"9px 12px",background:"#2a0808",border:"1px solid #5c1010",borderRadius:8,fontSize:11,color:danger,lineHeight:1.5}}>⚠️ {erroIA}</div>}

            <div style={{flex:1,overflowY:"auto",padding:"11px 12px",display:"flex",flexDirection:"column",gap:8}}>
              {mensagens.map(m=>(
                <div key={m.id} className="sl" style={{display:"flex",flexDirection:m.dir==="out"?"row-reverse":"row",gap:6,alignItems:"flex-end"}}>
                  {m.dir==="in"&&<div style={{width:19,height:19,borderRadius:"50%",background:"#1a3a60",display:"flex",alignItems:"center",justifyContent:"center",fontSize:8,fontWeight:700,color:gold,flexShrink:0}}>{(sel.nome||"?")[0]}</div>}
                  <div style={{maxWidth:"75%"}}>
                    <div style={{padding:"8px 11px",fontSize:12,lineHeight:1.6,borderRadius:m.dir==="in"?"3px 12px 12px 12px":"12px 3px 12px 12px",background:m.dir==="in"?s3:"linear-gradient(135deg,#0d3b2e,#0a2819)",border:m.dir==="out"?"1px solid #1a4d37":"none"}}>{m.txt}</div>
                    <div style={{fontSize:8,color:sub,marginTop:2,textAlign:m.dir==="out"?"right":"left"}}>
                      {m.h}{m.dir==="out"&&" ✓✓"}{m.ia&&<span style={{marginLeft:3,color:gold}}>🤖</span>}
                    </div>
                  </div>
                </div>
              ))}
              {analisando&&<div style={{display:"flex",gap:6,padding:"8px 11px",background:s3,borderRadius:"3px 12px 12px 12px",width:"fit-content",alignItems:"center"}}><Sp n={10}/><span style={{fontSize:10,color:sub}}>GO.IA analisando...</span></div>}
              <div ref={endRef}/>
            </div>

            {sugs.filter(s=>s.conv_id===sel.id&&s.status==="pendente").slice(0,1).map(s=>(
              <div key={s.id} className="pop" style={{margin:"0 10px 8px",padding:"11px 12px",background:`${gold}10`,border:`1px solid ${gold}45`,borderRadius:11}}>
                <div style={{fontSize:10,color:gold,marginBottom:5,display:"flex",alignItems:"center",gap:6}}>
                  <span>🤖 Sugestão da IA · {s.tecnica}</span>
                  <span style={{padding:"1px 6px",borderRadius:20,fontSize:8,color:s.prioridade==="alta"?danger:warn,background:`${s.prioridade==="alta"?danger:warn}15`,border:`1px solid ${s.prioridade==="alta"?danger:warn}30`,fontWeight:700}}>{s.prioridade}</span>
                  {s.fechamento&&<span style={{padding:"1px 6px",borderRadius:20,fontSize:8,color:green,background:`${green}15`,border:`1px solid ${green}30`,fontWeight:700}}>💰 FECHAR</span>}
                </div>
                {s.motivo&&<div style={{fontSize:10,color:sub,fontStyle:"italic",marginBottom:7,lineHeight:1.5}}>💭 {s.motivo}</div>}
                {s.como_responder&&<div style={{fontSize:10,color:info,background:`${info}10`,border:`1px solid ${info}25`,borderRadius:7,padding:"7px 9px",marginBottom:7,lineHeight:1.6}}>💡 <strong>Tom:</strong> {s.como_responder}</div>}
                <div style={{fontSize:12,color:txt,background:s3,borderRadius:8,padding:"9px 11px",lineHeight:1.7,marginBottom:9,borderLeft:`3px solid ${gold}`}}>{s.mensagem}</div>
                <div style={{display:"flex",gap:6}}>
                  <button onClick={()=>enviar(s.id,null,null)} disabled={enviando===s.id}
                    style={{flex:2,padding:"8px",background:green,border:"none",borderRadius:7,color:"#000",fontWeight:700,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",gap:5}}>
                    {enviando===s.id?<><Sp n={11} c="#000"/>Enviando...</>:"✓ Enviar via WhatsApp"}
                  </button>
                  <button onClick={()=>rejeitar(s.id)} style={{flex:1,padding:"8px",background:"transparent",border:`1px solid ${brd}`,borderRadius:7,color:sub,fontSize:11}}>✗ Rejeitar</button>
                  <button onClick={()=>analisar()} style={{flex:1,padding:"8px",background:`${info}15`,border:`1px solid ${info}40`,borderRadius:7,color:info,fontSize:11}}>🔄 Nova</button>
                </div>
              </div>
            ))}

            <div style={{padding:"8px 10px",borderTop:`1px solid ${brd}`,background:s1,flexShrink:0,display:"flex",gap:6,alignItems:"center"}}>
              <button onClick={()=>analisar()} disabled={analisando} title="Pedir à IA"
                style={{width:33,height:33,borderRadius:"50%",background:analisando?`${gold}10`:`${gold}20`,border:`1px solid ${gold}50`,color:gold,fontSize:15,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                {analisando?<Sp n={11}/>:"🤖"}
              </button>
              <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&enviarManual()}
                placeholder="Mensagem manual ou 🤖 para IA sugerir..."
                style={{flex:1,background:s3,border:`1px solid ${brd}`,borderRadius:20,padding:"7px 12px",color:txt,fontSize:12}}/>
              <button onClick={enviarManual} disabled={!input.trim()}
                style={{width:33,height:33,borderRadius:"50%",background:input.trim()?wa:s3,border:"none",color:"#fff",fontSize:14,flexShrink:0,display:"flex",alignItems:"center",justifyContent:"center"}}>➤</button>
            </div>
          </>
        ):(
          <div style={{flex:1,display:"flex",alignItems:"center",justifyContent:"center",color:sub}}>
            <div style={{textAlign:"center"}}><div style={{fontSize:34,marginBottom:8}}>💬</div><div>Selecione uma conversa</div></div>
          </div>
        )}
      </div>

      {/* ── FILA IA ────────────────────────────────────────── */}
      <div style={{width:285,flexShrink:0,display:"flex",flexDirection:"column",background:s1}}>
        <div style={{borderBottom:`1px solid ${brd}`,background:s2}}>
          <div style={{display:"flex",padding:"0 12px",gap:0}}>
            {[["sugestao","🤖 Sugestão"],["estudo","🧠 Estudo"]].map(([id,lbl])=>(
              <button key={id} onClick={()=>setTabDir(id)}
                style={{padding:"9px 12px",border:"none",borderBottom:`2px solid ${tabDir===id?gold:"transparent"}`,background:"transparent",color:tabDir===id?gold:sub,fontSize:11,fontWeight:tabDir===id?700:400,cursor:"pointer"}}>
                {lbl}{id==="sugestao"&&pendentes.length>0&&<span style={{marginLeft:4,background:gold,color:"#000",borderRadius:10,fontSize:8,padding:"0 5px",fontWeight:700}}>{pendentes.length}</span>}
                {id==="estudo"&&estudo&&<span style={{marginLeft:4,background:`${green}30`,color:green,borderRadius:10,fontSize:8,padding:"0 5px",fontWeight:700}}>✓</span>}
              </button>
            ))}
            {tabDir==="sugestao"&&pendentes.length>0&&(
              <button onClick={aprovarTudo} style={{marginLeft:"auto",padding:"6px 8px",background:`${green}18`,border:`1px solid ${green}40`,borderRadius:6,color:green,fontSize:9,fontWeight:700,whiteSpace:"nowrap",alignSelf:"center"}}>
                ✓ Tudo ({pendentes.length})
              </button>
            )}
          </div>

          {sugs.length===0&&(
            <div style={{background:s3,border:`1px solid ${brd}`,borderRadius:9,padding:"14px",textAlign:"center"}}>
              <div style={{fontSize:24,marginBottom:7}}>🤖</div>
              <div style={{fontSize:11,fontWeight:600,color:txt,marginBottom:6}}>Como usar a IA:</div>
              <div style={{fontSize:10,color:sub,lineHeight:1.7,textAlign:"left"}}>
                1️⃣ Selecione uma conversa na lista<br/>
                2️⃣ Clique no botão <strong style={{color:gold}}>🤖</strong> abaixo do chat<br/>
                3️⃣ A IA analisa e cria uma mensagem<br/>
                4️⃣ Aprove para enviar ou rejeite
              </div>
              {analisando&&(
                <div style={{marginTop:10,display:"flex",alignItems:"center",justifyContent:"center",gap:6,color:gold}}>
                  <Sp n={12}/><span style={{fontSize:11,fontWeight:600}}>Analisando...</span>
                </div>
              )}
              {!analisando&&sel&&(
                <button onClick={()=>analisar()} style={{marginTop:11,width:"100%",padding:"9px",background:gold,border:"none",borderRadius:8,color:"#000",fontWeight:700,fontSize:12,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
                  🤖 Analisar "{(sel.nome||"").split(" ")[0]}" agora
                </button>
              )}
            </div>
          )}
        </div>

        {/* ABA ESTUDO */}
        {tabDir==="estudo"&&(
          <div style={{flex:1,overflowY:"auto",padding:"12px 12px"}}>
            {!estudo&&!analisando&&(
              <div style={{textAlign:"center",padding:"30px 16px",color:sub}}>
                <div style={{fontSize:32,marginBottom:10}}>🧠</div>
                <div style={{fontSize:13,color:txt,marginBottom:6,fontWeight:600}}>Estudo do Cliente</div>
                <div style={{fontSize:11,color:sub,lineHeight:1.7,marginBottom:14}}>
                  Clique em <strong style={{color:gold}}>🤖</strong> no chat para a IA fazer uma análise profunda.
                </div>
                <button onClick={()=>analisar()} disabled={!sel}
                  style={{padding:"9px 20px",background:gold,border:"none",borderRadius:8,color:"#000",fontWeight:700,fontSize:12,opacity:!sel?0.5:1}}>
                  🧠 Gerar estudo agora
                </button>
              </div>
            )}
            {analisando&&(
              <div style={{textAlign:"center",padding:"30px 16px"}}>
                <div style={{display:"flex",justifyContent:"center",marginBottom:12}}><Sp n={22} c={gold}/></div>
                <div style={{fontSize:13,color:gold,fontWeight:600}}>GO.IA analisando...</div>
                <div style={{fontSize:11,color:sub,marginTop:4}}>Gerando estudo completo do cliente</div>
              </div>
            )}
            {estudo&&!analisando&&(
              <div style={{display:"flex",flexDirection:"column",gap:10}}>
                {estudo.probabilidade_fechar&&(
                  <div style={{display:"flex",gap:8,padding:"10px 12px",background:estudo.probabilidade_fechar==="alta"?`${green}12`:estudo.probabilidade_fechar==="media"?`${warn}12`:`${info}10`,border:`1px solid ${estudo.probabilidade_fechar==="alta"?green:estudo.probabilidade_fechar==="media"?warn:info}30`,borderRadius:9}}>
                    <span style={{fontSize:18}}>{estudo.probabilidade_fechar==="alta"?"🔥":estudo.probabilidade_fechar==="media"?"⚡":"❄️"}</span>
                    <div>
                      <div style={{fontSize:10,fontWeight:700,color:estudo.probabilidade_fechar==="alta"?green:estudo.probabilidade_fechar==="media"?warn:info}}>
                        PROBABILIDADE DE FECHAR: {estudo.probabilidade_fechar?.toUpperCase()}
                      </div>
                      {estudo.tempo_estimado&&<div style={{fontSize:9,color:sub,marginTop:1}}>⏱ {estudo.tempo_estimado}</div>}
                    </div>
                  </div>
                )}
                {estudo.perfil_comprador&&(
                  <div style={{background:s3,border:`1px solid ${brd}`,borderRadius:9,padding:"10px 12px"}}>
                    <div style={{fontSize:9,fontWeight:700,color:gold,textTransform:"uppercase",letterSpacing:".1em",marginBottom:5}}>👤 Quem é esse cliente</div>
                    <div style={{fontSize:11,color:txt,lineHeight:1.7}}>{estudo.perfil_comprador}</div>
                  </div>
                )}
                {estudo.o_que_realmente_quer&&(
                  <div style={{background:s3,border:`1px solid ${brd}`,borderRadius:9,padding:"10px 12px"}}>
                    <div style={{fontSize:9,fontWeight:700,color:"#f97316",textTransform:"uppercase",letterSpacing:".1em",marginBottom:5}}>🎯 O que realmente quer</div>
                    <div style={{fontSize:11,color:txt,lineHeight:1.7}}>{estudo.o_que_realmente_quer}</div>
                  </div>
                )}
                {estudo.comportamento&&(
                  <div style={{background:s3,border:`1px solid ${brd}`,borderRadius:9,padding:"10px 12px"}}>
                    <div style={{fontSize:9,fontWeight:700,color:info,textTransform:"uppercase",letterSpacing:".1em",marginBottom:5}}>🧠 Como decide</div>
                    <div style={{fontSize:11,color:txt,lineHeight:1.7}}>{estudo.comportamento}</div>
                  </div>
                )}
                {estudo.como_abordar&&(
                  <div style={{background:`${gold}08`,border:`1px solid ${gold}30`,borderRadius:9,padding:"10px 12px"}}>
                    <div style={{fontSize:9,fontWeight:700,color:gold,textTransform:"uppercase",letterSpacing:".1em",marginBottom:5}}>💡 Como abordar</div>
                    <div style={{fontSize:11,color:txt,lineHeight:1.7}}>{estudo.como_abordar}</div>
                  </div>
                )}
                {Array.isArray(estudo.pontos_de_atencao)&&estudo.pontos_de_atencao.length>0&&(
                  <div style={{background:s3,border:`1px solid ${brd}`,borderRadius:9,padding:"10px 12px"}}>
                    <div style={{fontSize:9,fontWeight:700,color:warn,textTransform:"uppercase",letterSpacing:".1em",marginBottom:6}}>⚠️ Pontos de atenção</div>
                    <div style={{display:"flex",flexDirection:"column",gap:4}}>
                      {estudo.pontos_de_atencao.map((p,i)=>(
                        <div key={i} style={{display:"flex",gap:6,alignItems:"flex-start"}}>
                          <span style={{color:warn,fontSize:10,flexShrink:0}}>•</span>
                          <span style={{fontSize:11,color:txt,lineHeight:1.6}}>{p}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <button onClick={()=>setTabDir("sugestao")}
                  style={{padding:"9px",background:gold,border:"none",borderRadius:8,color:"#000",fontWeight:700,fontSize:12,width:"100%"}}>
                  🤖 Ver mensagem sugerida →
                </button>
              </div>
            )}
          </div>
        )}

        {/* ABA SUGESTÃO */}
        {tabDir==="sugestao"&&<div style={{flex:1,overflowY:"auto",padding:"8px 10px"}}>
          {sugs.map(s=>{
            const pend=s.status==="pendente";
            return(
              <div key={s.id} className={pend?"pop":""} style={{background:s.status==="enviado"?`${green}08`:s.status==="rejeitado"?`${danger}05`:s2,border:`1px solid ${s.status==="enviado"?green+"25":s.status==="rejeitado"?danger+"18":brd}`,borderRadius:10,padding:"10px 11px",marginBottom:7,opacity:s.status==="rejeitado"?0.4:1}}>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:6}}>
                  <Av v={(s.nome||"?").split(" ").map(p=>p[0]).slice(0,2).join("")} n={22}/>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:10,fontWeight:600,color:txt,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{s.nome}</div>
                    <div style={{fontSize:8,color:sub}}>🎯 {s.tecnica}</div>
                  </div>
                  {pend&&<span style={{fontSize:8,padding:"1px 5px",borderRadius:20,color:s.prioridade==="alta"?danger:warn,fontWeight:700}}>⏳</span>}
                  {s.status==="enviado"&&<span style={{fontSize:8,color:green,fontWeight:700}}>✓ Env.</span>}
                  {s.fechamento&&<span style={{fontSize:8,color:green,fontWeight:700}}>💰</span>}
                </div>
                {s.motivo&&<div style={{fontSize:9,color:sub,fontStyle:"italic",marginBottom:5,lineHeight:1.4}}>💭 {s.motivo.slice(0,70)}{s.motivo.length>70?"...":""}</div>}
                <div style={{fontSize:11,color:txt,background:s3,borderRadius:7,padding:"7px 9px",lineHeight:1.6,marginBottom:pend?7:0,borderLeft:`2px solid ${gold}`}}>
                  {s.mensagem.slice(0,115)}{s.mensagem.length>115?"...":""}
                </div>
                {pend&&(
                  <div style={{display:"flex",gap:5}}>
                    <button onClick={()=>enviar(s.id,null,null)} disabled={enviando===s.id}
                      style={{flex:2,padding:"5px",background:green,border:"none",borderRadius:6,color:"#000",fontWeight:700,fontSize:10,display:"flex",alignItems:"center",justifyContent:"center",gap:3}}>
                      {enviando===s.id?<><Sp n={9} c="#000"/>...</>:"✓ Enviar"}
                    </button>
                    <button onClick={()=>rejeitar(s.id)} style={{flex:1,padding:"5px",background:"transparent",border:`1px solid ${brd}`,borderRadius:6,color:sub,fontSize:10}}>✗</button>
                  </div>
                )}
                {s.status==="enviado"&&<div style={{fontSize:8,color:sub,textAlign:"right"}}>{s.h}</div>}
              </div>
            );
          })}
        </div>}

        <div style={{padding:"6px 12px",borderTop:`1px solid ${brd}`,background:s2}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:5,textAlign:"center"}}>
            {[{l:"Pendentes",v:sugs.filter(s=>s.status==="pendente").length,c:warn},{l:"Enviadas",v:sugs.filter(s=>s.status==="enviado").length,c:green},{l:"Rejeitadas",v:sugs.filter(s=>s.status==="rejeitado").length,c:sub}].map((m,i)=>(
              <div key={i}><div style={{fontSize:12,fontWeight:700,color:m.c}}>{m.v}</div><div style={{fontSize:8,color:sub}}>{m.l}</div></div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════
// ROOT
// ═══════════════════════════════════════════════════════════════════
export default function App() {
  const [tela,setTela]=useState("conectar");
  const [cfg,setCfg]=useState({modo:"demo",url:null,tok:null});
  const [convData,setConvData]=useState([]);

  const onEntrar=useCallback((modo,url,tok)=>{
    setCfg({modo,url,tok});
    setTela("sinc");
  },[]);

  const onPronto=useCallback((dados)=>{
    const final=Array.isArray(dados)&&dados.length>0?dados:DEMO;
    setConvData(final);
    setTela("dashboard");
  },[]);

  return(
    <>
      {tela==="conectar" &&<Conectar onEntrar={onEntrar}/>}
      {tela==="sinc"     &&<Sinc modo={cfg.modo} url={cfg.url} tok={cfg.tok} onPronto={onPronto}/>}
      {tela==="dashboard"&&<Dashboard modo={cfg.modo} url={cfg.url} tok={cfg.tok} convData={convData.length>0?convData:DEMO}/>}
    </>
  );
}
