"use client";

import { useMemo, useRef, useState } from "react";

type BriefResult = {
  summary: string;
  projectType: string;
  features: string[];
  maturity: "尚未分析" | "初步想法" | "方向明確" | "適合進一步報價";
  nextStep: string;
};

type ProjectRule = {
  projectType: string;
  keywords: string[];
  features: string[];
};

const examples = [
  {
    label: "報價工具需求",
    text: "我想做一個讓客人填寫需求後，可以根據品項和數量自動計算報價的工具，也希望能產生一份簡單的報價摘要。",
  },
  {
    label: "詢價頁需求",
    text: "我目前都用 LINE 問客戶需求，資料很分散，想做一個有質感的詢價頁，讓客戶可以填寫預算、時程、需求內容和聯絡方式。",
  },
  {
    label: "品牌網站需求",
    text: "我想做一個品牌形象網站，能介紹服務內容、作品案例和合作流程，希望整體看起來專業、有設計感，也能讓客戶留下聯絡資訊。",
  },
  {
    label: "管理後台需求",
    text: "我想做一個簡單的管理後台，可以查看客戶需求、修改案件狀態、追蹤報價進度，避免資料都散在 Excel 和聊天紀錄裡。",
  },
];

const projectRules: ProjectRule[] = [
  {
    projectType: "報價工具",
    keywords: ["報價", "價格", "金額", "計算", "品項"],
    features: [
      "客戶需求填寫",
      "品項與數量選擇",
      "價格規則設定",
      "即時報價摘要",
      "送出成功提示",
      "後續聯絡資訊收集",
    ],
  },
  {
    projectType: "詢價 / 需求收集頁",
    keywords: ["表單", "填資料", "詢價", "需求", "聯絡"],
    features: [
      "客戶資料填寫",
      "需求類型選擇",
      "預算與時程收集",
      "需求內容補充",
      "聯絡方式欄位",
      "送出成功提示",
    ],
  },
  {
    projectType: "管理工具 / Dashboard",
    keywords: ["後台", "管理", "狀態", "追蹤", "案件"],
    features: [
      "案件列表檢視",
      "客戶需求紀錄",
      "案件狀態管理",
      "報價進度追蹤",
      "資料篩選與搜尋",
      "內部備註欄位",
    ],
  },
  {
    projectType: "品牌形象頁 / 作品集頁",
    keywords: ["品牌", "形象", "網站", "作品集", "服務介紹"],
    features: [
      "服務內容介紹",
      "作品案例展示",
      "合作流程說明",
      "品牌視覺呈現",
      "聯絡表單",
      "行動版頁面優化",
    ],
  },
];

const defaultResult: BriefResult = {
  summary:
    "目前尚未開始整理。貼上客戶需求或點選範例後，系統會在這裡產生初步摘要，協助你判斷專案方向。",
  projectType: "等待需求輸入",
  features: ["專案摘要", "需求類型判斷", "核心功能清單", "成熟度判斷"],
  maturity: "尚未分析",
  nextStep: "可以先貼上一段客戶描述，再按下「開始整理需求」。",
};

const painPoints = [
  {
    title: "需求描述零散",
    body: "客戶常用 LINE、電話或簡短訊息描述想法，資訊不完整，難以直接估價。",
  },
  {
    title: "報價前反覆確認",
    body: "需求、預算、時程與功能範圍不清楚時，容易花很多時間來回溝通。",
  },
  {
    title: "資料分散難整理",
    body: "資訊散在表單、Excel、聊天紀錄與筆記中，不容易轉成清楚的專案規格。",
  },
  {
    title: "難以判斷下一步",
    body: "不確定該先報價、先訪談，還是先補齊需求，導致合作流程變慢。",
  },
];

const outcomeCards = [
  {
    title: "專案摘要",
    body: "把零散描述整理成一段清楚的需求說明。",
  },
  {
    title: "功能清單",
    body: "初步拆解可能需要的功能與頁面。",
  },
  {
    title: "需求成熟度",
    body: "判斷目前是初步想法、方向明確，或適合進一步報價。",
  },
  {
    title: "下一步建議",
    body: "提示接下來應該補問哪些問題，或是否可以進入報價討論。",
  },
];

const audiences = ["接案者", "設計服務", "顧問服務", "小型品牌", "需要整理需求的服務型產業"];
const workflow = ["貼上需求", "系統初步整理", "檢視功能與成熟度", "進入報價或提案討論"];

function findProjectRule(input: string) {
  return projectRules.find((rule) =>
    rule.keywords.some((keyword) => input.includes(keyword)),
  );
}

function getMaturity(input: string): BriefResult["maturity"] {
  const compactLength = input.replace(/\s/g, "").length;
  const hasQuoteReadyInfo = ["預算", "時程", "功能", "參考風格"].some((keyword) =>
    input.includes(keyword),
  );

  if (compactLength < 40) return "初步想法";
  if (compactLength > 120 && hasQuoteReadyInfo) return "適合進一步報價";
  return "方向明確";
}

function makeSummary(input: string, projectType: string) {
  const cleanInput = input.trim().replace(/\s+/g, " ");
  const shortened =
    cleanInput.length > 92 ? `${cleanInput.slice(0, 92)}...` : cleanInput;

  if (projectType === "初步需求，建議進一步釐清") {
    return `客戶目前描述了「${shortened}」，但專案類型與功能範圍仍不夠明確，建議先補齊目標、使用情境與必要功能。`;
  }

  return `這是一個偏向「${projectType}」的需求。客戶希望將「${shortened}」整理成可執行的頁面或工具，重點會落在資訊收集、功能拆解與後續溝通效率。`;
}

function makeNextStep(projectType: string, maturity: BriefResult["maturity"]) {
  if (maturity === "初步想法") {
    return "建議補充參考網站、希望完成時間與必要功能，再判斷是否可以進入報價討論。";
  }

  if (maturity === "適合進一步報價") {
    return "需求已相對清楚，可進一步整理成提案或報價方向，並確認交付範圍與優先順序。";
  }

  if (projectType === "報價工具") {
    return "建議先確認功能範圍、預算區間、報價規則，以及是否需要儲存客戶資料。";
  }

  if (projectType === "管理工具 / Dashboard") {
    return "建議先確認需要追蹤的案件狀態、欄位資料、權限需求與日常使用流程。";
  }

  return "建議先確認必要功能、預算區間、時程期待與資料是否需要後續管理。";
}

function analyzeRequirement(input: string): BriefResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      summary: "尚未偵測到需求內容。請先貼上客戶描述，或點選左側範例快速試用。",
      projectType: "初步需求，建議進一步釐清",
      features: ["需求內容輸入", "專案目標補充", "功能範圍確認", "預算與時程釐清"],
      maturity: "初步想法",
      nextStep: "建議先補上一段客戶原始描述，再進行初步整理。",
    };
  }

  const matchedRule = findProjectRule(trimmed);
  const projectType = matchedRule?.projectType ?? "初步需求，建議進一步釐清";
  const features =
    matchedRule?.features ?? ["需求目標釐清", "使用情境補充", "必要功能整理", "預算與時程確認"];
  const maturity = getMaturity(trimmed);

  return {
    summary: makeSummary(trimmed, projectType),
    projectType,
    features,
    maturity,
    nextStep: makeNextStep(projectType, maturity),
  };
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      {eyebrow ? (
        <p className="mb-3 text-sm font-semibold text-[#6171d9]">{eyebrow}</p>
      ) : null}
      <h2 className="text-2xl font-semibold text-[#151821] md:text-4xl">{title}</h2>
      {description ? (
        <p className="mt-4 text-base leading-8 text-[#647084] md:text-lg">{description}</p>
      ) : null}
    </div>
  );
}

export default function Home() {
  const [requirement, setRequirement] = useState("");
  const [result, setResult] = useState<BriefResult>(defaultResult);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const maturityWidth = useMemo(() => {
    if (result.maturity === "適合進一步報價") return "100%";
    if (result.maturity === "方向明確") return "66%";
    if (result.maturity === "初步想法") return "34%";
    return "18%";
  }, [result.maturity]);

  const handleExampleClick = (text: string) => {
    setRequirement(text);
    setResult(analyzeRequirement(text));
    inputRef.current?.focus();
  };

  const handleAnalyze = () => {
    setResult(analyzeRequirement(requirement));
  };

  return (
    <main className="page-surface min-h-screen overflow-hidden">
      <div className="soft-grid pointer-events-none absolute inset-x-0 top-0 h-[720px]" />

      <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <a href="#" className="text-base font-semibold text-[#151821]" aria-label="cick tools">
          cick tools
        </a>
        <a
          href="#brief-tool"
          className="rounded-full border border-[#cfd7e6] bg-white/70 px-5 py-2.5 text-sm font-semibold text-[#1e2532] shadow-sm transition hover:border-[#9ba9d5] hover:bg-white"
        >
          開始整理需求
        </a>
      </header>

      <section className="relative mx-auto grid w-full max-w-7xl gap-10 px-6 pb-20 pt-12 md:grid-cols-[1.04fr_0.96fr] md:px-10 md:pb-28 md:pt-20">
        <div className="flex flex-col justify-center">
          <p className="mb-5 text-sm font-semibold text-[#6171d9]">AI Brief Generator</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.18] text-[#11141c] md:text-6xl">
            把零散需求，整理成清楚的專案方向
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-9 text-[#5f6b7d]">
            貼上客戶傳來的需求描述，快速整理出專案摘要、核心功能、需求成熟度與下一步建議，讓溝通與報價更有效率。
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#brief-tool"
              className="inline-flex items-center justify-center rounded-full bg-[#151821] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(21,24,33,0.18)] transition hover:bg-[#2b3242]"
            >
              開始整理需求
            </a>
            <a
              href="#outcomes"
              className="inline-flex items-center justify-center rounded-full border border-[#cfd7e6] bg-white/70 px-7 py-3.5 text-sm font-semibold text-[#273044] transition hover:bg-white"
            >
              查看整理內容
            </a>
          </div>
        </div>

        <div className="card-shadow rounded-lg border border-white/70 bg-white/86 p-4 backdrop-blur md:p-6">
          <div className="rounded-lg border border-[#dbe2ed] bg-[#f9fbfd] p-4">
            <div className="flex items-center justify-between border-b border-[#e3e9f2] pb-4">
              <div>
                <p className="text-xs font-semibold text-[#6171d9]">AI 分析預覽</p>
                <p className="mt-1 text-lg font-semibold text-[#151821]">客戶需求整理中</p>
              </div>
              <div className="rounded-full bg-[#151821] px-3 py-1 text-xs font-semibold text-white">
                Demo
              </div>
            </div>

            <div className="space-y-4 pt-5">
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <p className="text-xs font-semibold text-[#6171d9]">需求摘要</p>
                <p className="mt-2 text-sm leading-6 text-[#596579]">
                  將詢價、功能想法與品牌期待整理成一段可討論的專案方向。
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {["客戶資料填寫", "功能清單", "需求成熟度", "下一步建議"].map((item) => (
                  <div key={item} className="rounded-lg border border-[#e2e8f2] bg-white px-3 py-3">
                    <p className="text-sm font-semibold text-[#273044]">{item}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-white p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-[#6171d9]">需求成熟度</p>
                  <p className="text-xs font-semibold text-[#596579]">方向明確</p>
                </div>
                <div className="h-2 rounded-full bg-[#e9eef6]">
                  <div className="mini-meter h-2 w-2/3 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-6 py-18 md:px-10 md:py-24">
        <SectionHeading title="為什麼需要需求整理？" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {painPoints.map((point) => (
            <article
              key={point.title}
              className="card-shadow rounded-lg border border-white/70 bg-white/86 p-6"
            >
              <h3 className="text-lg font-semibold text-[#151821]">{point.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[#647084]">{point.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="brief-tool" className="relative mx-auto w-full max-w-7xl px-6 py-18 md:px-10 md:py-24">
        <SectionHeading
          eyebrow="Interactive Demo"
          title="貼上需求，立即產生初步整理"
          description="第一版以關鍵字規則模擬 AI 整理流程，讓作品集先完整呈現使用情境與互動價值。"
        />

        <div className="mb-5 rounded-lg border border-[#cbd8ef] bg-[#eef4ff] px-5 py-4 text-sm leading-7 text-[#33415f]">
          Demo 版本會根據輸入內容進行初步整理，未來可串接 AI API，提供更完整的需求分析。
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="card-shadow rounded-lg border border-white/70 bg-white/90 p-5 md:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#6171d9]">需求輸入區</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#151821]">貼上客戶需求</h2>
              </div>
              <div className="rounded-full bg-[#f0f4fa] px-3 py-1 text-xs font-semibold text-[#647084]">
                Frontend Demo
              </div>
            </div>

            <label htmlFor="requirement" className="sr-only">
              貼上客戶需求
            </label>
            <textarea
              ref={inputRef}
              id="requirement"
              value={requirement}
              onChange={(event) => setRequirement(event.target.value)}
              placeholder="例如：我想做一個可以讓客人填資料的網站，最好可以自動算價格，也想要看起來有質感，但目前還不確定預算和功能要怎麼規劃……"
              className="min-h-60 w-full resize-none rounded-lg border border-[#d7deea] bg-[#fbfcfe] px-4 py-4 text-base leading-8 text-[#1b2230] outline-none transition placeholder:text-[#9aa6b8] focus:border-[#7d8df1] focus:bg-white focus:ring-4 focus:ring-[#7d8df1]/12"
            />

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {examples.map((example) => (
                <button
                  key={example.label}
                  type="button"
                  onClick={() => handleExampleClick(example.text)}
                  className="rounded-lg border border-[#d9e0ec] bg-white px-4 py-3 text-left text-sm font-semibold text-[#273044] transition hover:border-[#9ba9d5] hover:bg-[#f7f9fe]"
                >
                  {example.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              className="mt-5 w-full rounded-lg bg-[#151821] px-6 py-4 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(21,24,33,0.16)] transition hover:bg-[#2b3242]"
            >
              開始整理需求
            </button>
          </div>

          <div className="card-shadow rounded-lg border border-white/70 bg-[#151821] p-5 text-white md:p-6">
            <div className="mb-5 flex flex-col gap-3 border-b border-white/12 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#9eb0ff]">AI 整理結果區</p>
                <h2 className="mt-2 text-2xl font-semibold">整理結果</h2>
              </div>
              <div className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white/78">
                {result.maturity}
              </div>
            </div>

            <div className="grid gap-4">
              <article className="rounded-lg bg-white/[0.07] p-5 ring-1 ring-white/10">
                <p className="text-sm font-semibold text-[#9eb0ff]">A. 需求摘要</p>
                <p className="mt-3 text-base leading-8 text-white/82">{result.summary}</p>
              </article>

              <article className="rounded-lg bg-white/[0.07] p-5 ring-1 ring-white/10">
                <p className="text-sm font-semibold text-[#9eb0ff]">B. 需求類型</p>
                <p className="mt-3 text-xl font-semibold text-white">{result.projectType}</p>
              </article>

              <article className="rounded-lg bg-white/[0.07] p-5 ring-1 ring-white/10">
                <p className="text-sm font-semibold text-[#9eb0ff]">C. 核心功能清單</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {result.features.map((feature) => (
                    <div
                      key={feature}
                      className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white/86"
                    >
                      {feature}
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-lg bg-white/[0.07] p-5 ring-1 ring-white/10">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-[#9eb0ff]">D. 需求成熟度</p>
                  <p className="text-sm font-semibold text-white">{result.maturity}</p>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/12">
                  <div
                    className="mini-meter h-2 rounded-full transition-all duration-500"
                    style={{ width: maturityWidth }}
                  />
                </div>
              </article>

              <article className="rounded-lg bg-white/[0.07] p-5 ring-1 ring-white/10">
                <p className="text-sm font-semibold text-[#9eb0ff]">E. 下一步建議</p>
                <p className="mt-3 text-base leading-8 text-white/82">{result.nextStep}</p>
              </article>
            </div>
          </div>
        </div>
      </section>

      <section id="outcomes" className="relative mx-auto w-full max-w-7xl px-6 py-18 md:px-10 md:py-24">
        <SectionHeading title="整理後可以得到什麼？" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {outcomeCards.map((card) => (
            <article key={card.title} className="rounded-lg border border-[#dfe6f0] bg-white/82 p-6">
              <h3 className="text-lg font-semibold text-[#151821]">{card.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[#647084]">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative mx-auto grid w-full max-w-7xl gap-5 px-6 py-18 md:grid-cols-[0.9fr_1.1fr] md:px-10 md:py-24">
        <div className="rounded-lg border border-[#dfe6f0] bg-white/78 p-6">
          <p className="text-sm font-semibold text-[#6171d9]">For Service Teams</p>
          <h2 className="mt-3 text-2xl font-semibold text-[#151821] md:text-4xl">適合誰使用？</h2>
          <p className="mt-4 text-base leading-8 text-[#647084]">
            適合需要把客戶訊息、訪談內容與初步想法整理成工作方向的服務型團隊。
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {audiences.map((audience) => (
            <div
              key={audience}
              className="rounded-lg border border-[#dfe6f0] bg-white/86 px-5 py-5 text-base font-semibold text-[#273044]"
            >
              {audience}
            </div>
          ))}
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-6 py-18 md:px-10 md:py-24">
        <SectionHeading title="使用流程" />
        <div className="grid gap-4 md:grid-cols-4">
          {workflow.map((step, index) => (
            <article key={step} className="rounded-lg border border-[#dfe6f0] bg-white/86 p-6">
              <p className="text-sm font-semibold text-[#6171d9]">Step {index + 1}</p>
              <h3 className="mt-4 text-xl font-semibold text-[#151821]">{step}</h3>
            </article>
          ))}
        </div>
      </section>

      <footer className="relative border-t border-[#dfe6f0] bg-white/58">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 py-10 md:flex-row md:items-end md:justify-between md:px-10">
          <div>
            <p className="text-lg font-semibold text-[#151821]">cick tools</p>
            <p className="mt-2 text-sm text-[#647084]">高質感客製商業工具設計</p>
          </div>
          <p className="text-sm text-[#647084]">Designed &amp; built by cick tools.</p>
        </div>
      </footer>
    </main>
  );
}
