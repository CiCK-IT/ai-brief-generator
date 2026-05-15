"use client";

import { useMemo, useRef, useState } from "react";

type Maturity = "尚未分析" | "初步想法" | "方向明確" | "適合進一步報價";

type BriefForm = {
  clientName: string;
  fillDate: string;
  source: string;
  contact: string;
  selectedType: string;
  budget: string;
  timeline: string;
};

type BriefBreakdown = {
  primaryGoal: string[];
  requiredFeatures: string[];
  extendableFeatures: string[];
};

type BriefResult = {
  summary: string;
  projectType: string;
  breakdown: BriefBreakdown;
  followUpQuestions: string[];
  coreFeatures: string[];
  maturity: Maturity;
  maturityNote: string;
  nextStep: string;
};

type ProjectRule = {
  projectType: string;
  keywords: string[];
  breakdown: BriefBreakdown;
  followUpQuestions: string[];
  coreFeatures: string[];
  summaryFocus: string;
  nextStep: string;
};

const sourceOptions = [
  "LINE 官方帳號",
  "接案平台",
  "朋友介紹",
  "Instagram",
  "104 / 履歷",
  "網站表單",
  "其他",
];

const projectTypeOptions = [
  "報價工具",
  "詢價 / 需求收集頁",
  "品牌形象頁 / 作品集頁",
  "管理工具 / Dashboard",
  "AI 工具 / 自動化流程",
  "尚未確定",
];

const budgetOptions = ["1 萬以下", "1–3 萬", "3–5 萬", "5–10 萬", "10 萬以上", "尚未確定"];
const timelineOptions = ["一週內", "兩週內", "一個月內", "一到三個月", "尚未確定"];

const defaultForm: BriefForm = {
  clientName: "",
  fillDate: "",
  source: "",
  contact: "",
  selectedType: "尚未確定",
  budget: "尚未確定",
  timeline: "尚未確定",
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

const fallbackBreakdown: BriefBreakdown = {
  primaryGoal: ["釐清專案目的與使用情境", "整理客戶目前真正想解決的問題"],
  requiredFeatures: ["需求內容補充", "目標使用者確認", "必要功能整理", "預算與時程釐清"],
  extendableFeatures: ["參考案例收集", "初步 MVP 範圍規劃", "後續提案方向整理"],
};

const fallbackCoreFeatures = ["需求訪談整理", "功能範圍確認", "預算與時程釐清", "MVP 優先順序規劃"];

const projectRules: ProjectRule[] = [
  {
    projectType: "報價工具",
    keywords: ["報價", "價格", "金額", "計算", "品項", "數量", "摘要"],
    summaryFocus:
      "這份需求適合整理成一個以報價流程為核心的互動工具，重點會放在客戶填寫需求、品項與數量選擇、價格邏輯計算，以及最後產生可供雙方確認的報價摘要。",
    breakdown: {
      primaryGoal: ["降低人工估價時間", "讓客戶能先自行填寫需求並取得初步報價方向"],
      requiredFeatures: ["品項與數量選擇", "價格計算規則", "報價摘要預覽", "客戶聯絡資料填寫"],
      extendableFeatures: ["稅額與折扣設定", "PDF 報價單匯出", "Email 或 LINE 通知", "報價紀錄管理"],
    },
    followUpQuestions: [
      "報價邏輯是固定價格、區間價格，還是需要人工評估？",
      "是否需要把客戶填寫資料與報價紀錄儲存起來？",
      "是否需要稅額、折扣、PDF 報價單或通知功能？",
    ],
    coreFeatures: ["客戶需求表單", "品項與數量設定", "價格計算邏輯", "報價摘要預覽", "送出成功提示"],
    nextStep: "建議先整理 MVP 報價流程，確認品項、價格規則、稅額與摘要格式，再判斷是否需要資料庫、PDF 匯出與通知功能。",
  },
  {
    projectType: "詢價 / 需求收集頁",
    keywords: ["表單", "填資料", "填寫", "詢價", "需求", "聯絡", "預算", "時程"],
    summaryFocus:
      "這份需求可整理為一個對外的詢價與需求收集頁，重點是把 LINE 或零散訊息改成有結構的欄位，讓客戶一次提供預算、時程、需求內容與聯絡方式。",
    breakdown: {
      primaryGoal: ["集中收集客戶需求", "減少來回追問與資訊遺漏"],
      requiredFeatures: ["客戶基本資料", "需求類型欄位", "預算與時程收集", "聯絡方式與備註欄位"],
      extendableFeatures: ["送出後通知", "需求摘要寄送", "資料儲存與匯出", "後續案件追蹤"],
    },
    followUpQuestions: [
      "客戶送出後是否需要 Email 或 LINE 通知？",
      "需求資料是否要儲存到資料庫，或只需要寄信通知？",
      "詢價頁需要哪些必填欄位，例如預算、時程、服務類型或附件？",
    ],
    coreFeatures: ["客戶資料欄位", "需求內容填寫", "預算與時程選擇", "聯絡方式收集", "送出確認訊息"],
    nextStep: "建議先定義詢價表單欄位與必填資訊，再確認是否需要資料儲存、通知流程與後續管理介面。",
  },
  {
    projectType: "管理工具 / Dashboard",
    keywords: ["後台", "管理", "狀態", "追蹤", "案件", "列表", "Excel"],
    summaryFocus:
      "這份需求偏向內部管理工具，核心不是展示頁，而是把客戶需求、案件狀態與報價進度集中管理，減少資料散落在 Excel、聊天紀錄與個人筆記中。",
    breakdown: {
      primaryGoal: ["集中管理客戶需求與案件狀態", "讓報價與追蹤流程更清楚"],
      requiredFeatures: ["客戶列表", "案件狀態管理", "搜尋與篩選", "報價進度追蹤"],
      extendableFeatures: ["內部備註", "權限角色", "提醒通知", "資料匯出"],
    },
    followUpQuestions: [
      "案件狀態需要有哪些階段，例如新需求、已報價、洽談中或已成交？",
      "是否需要多人使用與權限管理？",
      "資料來源會從表單進來，還是需要手動新增與編輯？",
    ],
    coreFeatures: ["客戶列表", "案件狀態欄位", "搜尋與篩選", "內部備註", "報價進度追蹤"],
    nextStep: "建議先盤點案件欄位、狀態流程與日常查找方式，再決定是否需要登入、權限、通知與資料匯出。",
  },
  {
    projectType: "品牌形象頁 / 作品集頁",
    keywords: ["品牌", "形象", "網站", "作品集", "服務介紹", "案例", "合作流程"],
    summaryFocus:
      "這份需求適合整理成品牌形象與作品展示頁，重點會放在讓訪客快速理解服務內容、信任感、過往案例與下一步聯絡行動。",
    breakdown: {
      primaryGoal: ["建立專業品牌印象", "讓潛在客戶理解服務價值並留下聯絡資訊"],
      requiredFeatures: ["品牌介紹", "服務內容區塊", "作品案例展示", "合作流程與 CTA"],
      extendableFeatures: ["常見問題", "客戶推薦", "文章或知識內容", "多頁式作品集架構"],
    },
    followUpQuestions: [
      "是否已有參考網站或品牌風格方向？",
      "作品案例需要呈現哪些資訊，例如前後對比、成果數據或服務範圍？",
      "主要 CTA 是預約諮詢、填寫表單，還是導向 LINE 聯絡？",
    ],
    coreFeatures: ["品牌主視覺區", "服務內容介紹", "作品案例展示", "合作流程", "聯絡 CTA"],
    nextStep: "建議先整理品牌定位、服務項目、作品素材與主要 CTA，再規劃首頁架構與行動版重點內容。",
  },
  {
    projectType: "AI 工具 / 自動化流程",
    keywords: ["AI", "自動化", "流程", "整理", "分析", "產生", "通知", "串接"],
    summaryFocus:
      "這份需求可以整理成 AI 工具或自動化流程，重點會放在把重複性資料整理、通知、判斷或內容產生流程變得更省時，第一版仍應先明確資料來源與人工覆核方式。",
    breakdown: {
      primaryGoal: ["減少重複整理工作", "把人工判斷流程轉成可追蹤的半自動化步驟"],
      requiredFeatures: ["資料輸入欄位", "規則或提示詞設定", "整理結果預覽", "人工確認流程"],
      extendableFeatures: ["AI API 串接", "自動通知", "第三方工具整合", "歷史紀錄保存"],
    },
    followUpQuestions: [
      "目前希望自動化的是哪一段流程，輸入與輸出分別是什麼？",
      "結果是否需要人工確認後才能送出或儲存？",
      "未來是否需要串接表單、試算表、Email、LINE 或其他工具？",
    ],
    coreFeatures: ["資料輸入區", "規則設定", "整理結果預覽", "人工確認", "流程狀態提示"],
    nextStep: "建議先畫出目前人工流程，定義輸入資料、輸出格式與需要人工確認的節點，再決定後續是否串接 AI API 或第三方工具。",
  },
];

const defaultResult: BriefResult = {
  summary:
    "目前尚未開始整理。填寫基本資料、專案資訊，並貼上客戶需求後，Demo 會把原始描述轉成一張初步 brief，協助你快速判斷專案方向、功能範圍與下一步溝通重點。",
  projectType: "等待需求輸入",
  breakdown: {
    primaryGoal: ["等待客戶需求內容", "準備產生初步專案方向"],
    requiredFeatures: ["基本資料", "專案資訊", "原始需求", "成熟度判斷"],
    extendableFeatures: ["補問問題", "MVP 建議", "提案方向整理"],
  },
  followUpQuestions: [
    "這個專案主要想解決哪個業務問題？",
    "目前是否已有預算、時程或參考風格？",
    "哪些功能是第一版一定要有，哪些可以之後再做？",
  ],
  coreFeatures: ["Brief 基本資料", "需求描述整理", "需求類型判斷", "下一步建議"],
  maturity: "尚未分析",
  maturityNote: "尚未輸入需求，因此還不能判斷成熟度。",
  nextStep: "可以先填寫左側欄位，貼上一段客戶描述，或點選範例需求快速試用整理流程。",
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
const workflow = ["填寫 Brief", "系統初步整理", "檢視功能與成熟度", "進入報價或提案討論"];

function getDisplayValue(value: string) {
  return value.trim() || "尚未填寫";
}

function getBudgetKnown(form: BriefForm) {
  return form.budget !== "尚未確定";
}

function getTimelineKnown(form: BriefForm) {
  return form.timeline !== "尚未確定";
}

function findProjectRuleByType(projectType: string) {
  return projectRules.find((rule) => rule.projectType === projectType);
}

function findProjectRule(input: string) {
  const scoredRules = projectRules.map((rule, index) => ({
    rule,
    index,
    score: rule.keywords.reduce((total, keyword) => {
      return input.includes(keyword) ? total + 1 : total;
    }, 0),
  }));

  scoredRules.sort((a, b) => b.score - a.score || a.index - b.index);
  return scoredRules[0]?.score > 0 ? scoredRules[0].rule : undefined;
}

function resolveProjectRule(input: string, form: BriefForm) {
  if (form.selectedType !== "尚未確定") {
    return findProjectRuleByType(form.selectedType);
  }

  return findProjectRule(input);
}

function getMaturity(input: string, form: BriefForm): Maturity {
  const compactLength = input.replace(/\s/g, "").length;
  const hasQuoteReadyInfo = ["預算", "時程", "功能", "參考風格"].some((keyword) =>
    input.includes(keyword),
  );
  const structuredScore = [
    form.selectedType !== "尚未確定",
    getBudgetKnown(form),
    getTimelineKnown(form),
    Boolean(form.clientName.trim()),
    Boolean(form.contact.trim()),
  ].filter(Boolean).length;

  if (compactLength > 120 && (hasQuoteReadyInfo || structuredScore >= 3)) {
    return "適合進一步報價";
  }

  if (compactLength >= 40 || structuredScore >= 2) {
    return "方向明確";
  }

  return "初步想法";
}

function makeSummary(input: string, rule: ProjectRule | undefined, form: BriefForm) {
  const cleanInput = input.trim().replace(/\s+/g, " ");
  const shortened =
    cleanInput.length > 96 ? `${cleanInput.slice(0, 96)}...` : cleanInput;
  const clientText = form.clientName.trim() ? `${form.clientName.trim()} 的需求` : "這份需求";
  const budgetText = getBudgetKnown(form) ? `預算區間為「${form.budget}」` : "預算尚未確定";
  const timelineText = getTimelineKnown(form) ? `預計時程為「${form.timeline}」` : "時程尚未確定";

  if (!rule) {
    return `${clientText}目前描述了「${shortened}」。根據目前資料，${budgetText}、${timelineText}，專案類型與功能優先順序仍需要進一步釐清，建議先補齊目標、預算、時程與必要功能，再進入估價或提案討論。`;
  }

  return `${clientText}可先整理為「${rule.projectType}」方向。${rule.summaryFocus} 目前原始描述為「${shortened}」，${budgetText}、${timelineText}。從 brief 角度來看，下一步應先把第一版必做範圍與可延伸項目分開，避免報價時範圍過大或期待不一致。`;
}

function getMaturityNote(maturity: Maturity, projectType: string, form: BriefForm) {
  const missingItems = [
    form.selectedType === "尚未確定" ? "需求類型" : "",
    getBudgetKnown(form) ? "" : "預算區間",
    getTimelineKnown(form) ? "" : "預計時程",
  ].filter(Boolean);

  if (maturity === "適合進一步報價") {
    return "需求已包含較多關鍵資訊，適合進一步拆成 MVP 範圍、交付項目與報價假設。";
  }

  if (maturity === "方向明確") {
    return missingItems.length > 0
      ? `方向已初步明確，但仍需確認${missingItems.join("、")}與功能範圍。`
      : "方向已初步明確，可開始整理功能範圍、資料流與第一版交付內容。";
  }

  if (projectType === "等待需求輸入") {
    return "尚未輸入需求，因此還不能判斷成熟度。";
  }

  return "目前仍偏初步想法，建議補充使用情境、必要功能、預算區間與完成時間。";
}

function getContextualQuestions(rule: ProjectRule | undefined, form: BriefForm) {
  const baseQuestions =
    rule?.followUpQuestions ?? [
      "目前最重要的業務目標是什麼？",
      "是否需要資料儲存、通知或後台管理？",
      "是否已有參考網站、預算區間或希望完成時間？",
    ];
  const questions = [...baseQuestions];

  if (!getBudgetKnown(form)) {
    questions[1] = "是否已有可接受的預算上限，或可以拆成 MVP 與延伸功能分階段進行？";
  }

  if (!getTimelineKnown(form)) {
    questions[2] = "希望完成時間是否有明確期限，或可以分階段上線？";
  } else if (getBudgetKnown(form)) {
    questions[2] = `在「${form.budget}」預算與「${form.timeline}」時程下，哪些功能必須放在第一版？`;
  }

  return questions.slice(0, 3);
}

function getNextStep(rule: ProjectRule | undefined, form: BriefForm) {
  const baseNextStep =
    rule?.nextStep ?? "建議先整理 MVP 功能清單，再確認是否需要資料庫、通知與後台管理。";
  const missingItems = [
    form.selectedType === "尚未確定" ? "需求類型" : "",
    getBudgetKnown(form) ? "" : "預算區間",
    getTimelineKnown(form) ? "" : "預計時程",
  ].filter(Boolean);
  const fastTimeline = form.timeline === "一週內" || form.timeline === "兩週內";
  const leanBudget = form.budget === "1 萬以下" || form.budget === "1–3 萬";
  const contextHints = [
    leanBudget ? "預算偏精簡，建議優先鎖定 MVP 與必要功能。" : "",
    fastTimeline ? "時程較短，建議先避免加入後台、通知或複雜整合。" : "",
    missingItems.length > 0 ? `目前仍建議補齊${missingItems.join("、")}。` : "",
  ].filter(Boolean);

  return contextHints.length > 0 ? `${baseNextStep} ${contextHints.join(" ")}` : baseNextStep;
}

function analyzeRequirement(input: string, form: BriefForm): BriefResult {
  const trimmed = input.trim();
  const matchedRule = resolveProjectRule(trimmed, form);
  const projectType = matchedRule?.projectType ?? "初步需求，建議進一步釐清";

  if (!trimmed) {
    return {
      summary: "尚未偵測到需求內容。請先貼上客戶描述，或點選左側範例快速試用。",
      projectType,
      breakdown: matchedRule?.breakdown ?? fallbackBreakdown,
      followUpQuestions: getContextualQuestions(matchedRule, form),
      coreFeatures: matchedRule?.coreFeatures ?? fallbackCoreFeatures,
      maturity: getMaturity(trimmed, form),
      maturityNote: getMaturityNote(getMaturity(trimmed, form), projectType, form),
      nextStep: getNextStep(matchedRule, form),
    };
  }

  const maturity = getMaturity(trimmed, form);

  return {
    summary: makeSummary(trimmed, matchedRule, form),
    projectType,
    breakdown: matchedRule?.breakdown ?? fallbackBreakdown,
    followUpQuestions: getContextualQuestions(matchedRule, form),
    coreFeatures: matchedRule?.coreFeatures ?? fallbackCoreFeatures,
    maturity,
    maturityNote: getMaturityNote(maturity, projectType, form),
    nextStep: getNextStep(matchedRule, form),
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

function FormSection({
  title,
  children,
  description,
}: {
  title: string;
  children: React.ReactNode;
  description?: string;
}) {
  return (
    <section className="rounded-lg border border-[#e1e7f2] bg-white/62 p-4">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[#151821]">{title}</h3>
        {description ? <p className="mt-1 text-sm leading-6 text-[#647084]">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

function TextField({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#3c475d]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-lg border border-[#d7deea] bg-white/82 px-4 text-sm text-[#1b2230] outline-none transition placeholder:text-[#9aa6b8] focus:border-[#7d8df1] focus:bg-white focus:ring-4 focus:ring-[#7d8df1]/12"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  options,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-[#3c475d]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-lg border border-[#d7deea] bg-white/82 px-4 text-sm text-[#1b2230] outline-none transition focus:border-[#7d8df1] focus:bg-white focus:ring-4 focus:ring-[#7d8df1]/12"
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}

function BreakdownGroup({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.06] p-4">
      <p className="text-sm font-semibold text-[#b5c3ff]">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-white/82">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#8ad8ce]" />
            <span>{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function OverviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.055] px-4 py-3">
      <p className="text-xs font-semibold text-white/48">{label}</p>
      <p className="mt-1 text-sm font-semibold leading-6 text-white/88">{getDisplayValue(value)}</p>
    </div>
  );
}

export default function Home() {
  const [requirement, setRequirement] = useState("");
  const [briefForm, setBriefForm] = useState<BriefForm>(defaultForm);
  const [result, setResult] = useState<BriefResult>(defaultResult);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const maturityWidth = useMemo(() => {
    if (result.maturity === "適合進一步報價") return "100%";
    if (result.maturity === "方向明確") return "66%";
    if (result.maturity === "初步想法") return "34%";
    return "18%";
  }, [result.maturity]);

  const updateForm = (key: keyof BriefForm, value: string) => {
    setBriefForm((current) => ({ ...current, [key]: value }));
  };

  const handleExampleClick = (text: string) => {
    setRequirement(text);
    setResult(analyzeRequirement(text, briefForm));
    inputRef.current?.focus();
  };

  const handleAnalyze = () => {
    setResult(analyzeRequirement(requirement, briefForm));
  };

  return (
    <main className="page-surface min-h-screen overflow-hidden">
      <div className="hero-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[780px]" />
      <div className="soft-grid pointer-events-none absolute inset-x-0 top-0 h-[720px]" />

      <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <a href="#" className="text-base font-semibold text-[#151821]" aria-label="cick tools">
          cick tools
        </a>
        <a
          href="#brief-tool"
          className="rounded-full border border-[#c6d2e8] bg-white/72 px-5 py-2.5 text-sm font-semibold text-[#1e2532] shadow-sm backdrop-blur transition hover:border-[#9ba9d5] hover:bg-white"
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
              className="inline-flex items-center justify-center rounded-full bg-[#151821] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(21,24,33,0.2)] transition hover:bg-[#2b3242]"
            >
              開始整理需求
            </a>
            <a
              href="#outcomes"
              className="inline-flex items-center justify-center rounded-full border border-[#cfd7e6] bg-white/70 px-7 py-3.5 text-sm font-semibold text-[#273044] backdrop-blur transition hover:bg-white"
            >
              查看整理內容
            </a>
          </div>
        </div>

        <div className="card-shadow rounded-lg border border-white/76 bg-white/72 p-4 backdrop-blur-xl md:p-6">
          <div className="rounded-lg border border-[#cdd8e8] bg-[#f7faff]/86 p-4">
            <div className="flex items-center justify-between border-b border-[#dce5f2] pb-4">
              <div>
                <p className="text-xs font-semibold text-[#6171d9]">AI Brief Report</p>
                <p className="mt-1 text-lg font-semibold text-[#151821]">客戶需求整理中</p>
              </div>
              <div className="rounded-full bg-[#151821] px-3 py-1 text-xs font-semibold text-white">
                Demo
              </div>
            </div>

            <div className="space-y-4 pt-5">
              <div className="rounded-lg bg-white/88 p-4 shadow-sm">
                <p className="text-xs font-semibold text-[#6171d9]">專案摘要</p>
                <p className="mt-2 text-sm leading-6 text-[#596579]">
                  將基本資料、專案資訊與原始需求整理成一張可討論的 brief。
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {["基本資料", "專案資訊", "補問問題", "下一步建議"].map((item) => (
                  <div key={item} className="rounded-lg border border-[#e2e8f2] bg-white/86 px-3 py-3">
                    <p className="text-sm font-semibold text-[#273044]">{item}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-white/88 p-4 shadow-sm">
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
              className="card-shadow rounded-lg border border-white/70 bg-white/82 p-6 backdrop-blur"
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
          title="建立客戶需求 Brief，立即產生初步整理"
          description="以基本資料、專案資訊與原始需求模擬 AI 整理流程，讓作品集呈現更完整的接案前置工作。"
        />

        <div className="mb-5 rounded-lg border border-[#cfd8f6] bg-white/80 p-5 shadow-[0_16px_42px_rgba(67,84,130,0.09)] backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#6171d9]">Demo Mode</p>
              <p className="mt-2 text-sm leading-7 text-[#43506a]">
                Demo 版本會根據輸入內容進行初步整理，未來可串接 AI API，提供更完整的需求分析。
              </p>
            </div>
            <div className="rounded-full border border-[#d9e2f3] bg-[#f7f9ff] px-4 py-2 text-xs font-semibold text-[#6171d9]">
              規則模擬中
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.98fr_1.02fr]">
          <div className="card-shadow rounded-lg border border-white/70 bg-white/88 p-5 backdrop-blur md:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#6171d9]">Brief 建立工具</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#151821]">客戶需求資料</h2>
              </div>
              <div className="rounded-full bg-[#f0f4fa] px-3 py-1 text-xs font-semibold text-[#647084]">
                Frontend Demo
              </div>
            </div>

            <div className="space-y-4">
              <FormSection title="基本資料" description="先記錄這次需求來源，方便後續回頭追蹤。">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="客戶名稱"
                    value={briefForm.clientName}
                    onChange={(value) => updateForm("clientName", value)}
                    placeholder="例如：王小姐 / 某某品牌"
                  />
                  <TextField
                    label="填寫日期"
                    type="date"
                    value={briefForm.fillDate}
                    onChange={(value) => updateForm("fillDate", value)}
                  />
                  <SelectField
                    label="客戶來源"
                    value={briefForm.source}
                    options={sourceOptions}
                    onChange={(value) => updateForm("source", value)}
                    placeholder="選擇來源"
                  />
                  <TextField
                    label="聯絡方式"
                    value={briefForm.contact}
                    onChange={(value) => updateForm("contact", value)}
                    placeholder="例如：LINE ID / Email / 電話"
                  />
                </div>
              </FormSection>

              <FormSection title="專案資訊" description="選擇已知條件，Demo 會把這些資訊納入整理結果。">
                <div className="grid gap-4 sm:grid-cols-3">
                  <SelectField
                    label="需求類型"
                    value={briefForm.selectedType}
                    options={projectTypeOptions}
                    onChange={(value) => updateForm("selectedType", value)}
                  />
                  <SelectField
                    label="預算區間"
                    value={briefForm.budget}
                    options={budgetOptions}
                    onChange={(value) => updateForm("budget", value)}
                  />
                  <SelectField
                    label="預計時程"
                    value={briefForm.timeline}
                    options={timelineOptions}
                    onChange={(value) => updateForm("timeline", value)}
                  />
                </div>
              </FormSection>

              <FormSection title="原始需求" description="貼上客戶原話，或先點選範例快速測試不同 brief 結果。">
                <label htmlFor="requirement" className="sr-only">
                  貼上客戶需求
                </label>
                <textarea
                  ref={inputRef}
                  id="requirement"
                  value={requirement}
                  onChange={(event) => setRequirement(event.target.value)}
                  placeholder="例如：我想做一個可以讓客人填資料的網站，最好可以自動算價格，也想要看起來有質感，但目前還不確定預算和功能要怎麼規劃……"
                  className="min-h-52 w-full resize-none rounded-lg border border-[#d7deea] bg-[#fbfcfe] px-4 py-4 text-base leading-8 text-[#1b2230] outline-none transition placeholder:text-[#9aa6b8] focus:border-[#7d8df1] focus:bg-white focus:ring-4 focus:ring-[#7d8df1]/12"
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
              </FormSection>
            </div>

            <button
              type="button"
              onClick={handleAnalyze}
              className="mt-5 w-full rounded-lg bg-[#151821] px-6 py-4 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(21,24,33,0.16)] transition hover:bg-[#2b3242]"
            >
              開始整理需求
            </button>
          </div>

          <div className="card-shadow rounded-lg border border-white/14 bg-[#111722] p-5 text-white shadow-[0_30px_80px_rgba(15,22,34,0.24)] md:p-6">
            <div className="mb-5 flex flex-col gap-3 border-b border-white/12 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#9eb0ff]">AI Brief 報告卡</p>
                <h2 className="mt-2 text-2xl font-semibold">初步專案 Brief</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/82">
                {result.projectType}
              </div>
            </div>

            <div className="grid gap-4">
              <article className="rounded-lg border border-[#9eb0ff]/20 bg-[#9eb0ff]/10 p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-[#c3ccff]">專案 Brief 概覽</p>
                  <p className="text-xs font-semibold text-white/50">Client snapshot</p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <OverviewItem label="客戶名稱" value={briefForm.clientName} />
                  <OverviewItem label="填寫日期" value={briefForm.fillDate} />
                  <OverviewItem label="客戶來源" value={briefForm.source} />
                  <OverviewItem label="需求類型" value={briefForm.selectedType} />
                  <OverviewItem label="預算區間" value={briefForm.budget} />
                  <OverviewItem label="預計時程" value={briefForm.timeline} />
                </div>
              </article>

              <article className="rounded-lg bg-white/[0.075] p-5 ring-1 ring-white/10">
                <p className="text-sm font-semibold text-[#9eb0ff]">需求摘要</p>
                <p className="mt-3 text-base leading-8 text-white/84">{result.summary}</p>
              </article>

              <article className="rounded-lg bg-white/[0.075] p-5 ring-1 ring-white/10">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-[#9eb0ff]">需求拆解</p>
                  <p className="text-xs font-semibold text-white/56">Brief structure</p>
                </div>
                <div className="mt-4 grid gap-3 xl:grid-cols-3">
                  <BreakdownGroup title="主要目標" items={result.breakdown.primaryGoal} />
                  <BreakdownGroup title="必要功能" items={result.breakdown.requiredFeatures} />
                  <BreakdownGroup title="可延伸功能" items={result.breakdown.extendableFeatures} />
                </div>
              </article>

              <article className="rounded-lg bg-white/[0.075] p-5 ring-1 ring-white/10">
                <p className="text-sm font-semibold text-[#9eb0ff]">建議補問問題</p>
                <ol className="mt-4 space-y-3">
                  {result.followUpQuestions.map((question, index) => (
                    <li key={question} className="flex gap-3 text-sm leading-7 text-white/84">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-[#b5c3ff]">
                        {index + 1}
                      </span>
                      <span>{question}</span>
                    </li>
                  ))}
                </ol>
              </article>

              <article className="rounded-lg bg-white/[0.075] p-5 ring-1 ring-white/10">
                <p className="text-sm font-semibold text-[#9eb0ff]">核心功能清單</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {result.coreFeatures.map((feature) => (
                    <div
                      key={feature}
                      className="rounded-lg border border-white/10 bg-white/[0.06] px-4 py-3 text-sm font-semibold text-white/84"
                    >
                      {feature}
                    </div>
                  ))}
                </div>
              </article>

              <article className="rounded-lg bg-white/[0.075] p-5 ring-1 ring-white/10">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-[#9eb0ff]">需求成熟度</p>
                  <p className="text-sm font-semibold text-white">{result.maturity}</p>
                </div>
                <div className="mt-4 h-2 rounded-full bg-white/12">
                  <div
                    className="mini-meter h-2 rounded-full transition-all duration-500"
                    style={{ width: maturityWidth }}
                  />
                </div>
                <p className="mt-4 text-sm leading-7 text-white/76">{result.maturityNote}</p>
              </article>

              <article className="rounded-lg border border-[#8ad8ce]/20 bg-[#8ad8ce]/10 p-5">
                <p className="text-sm font-semibold text-[#9fe4dc]">下一步建議</p>
                <p className="mt-3 text-base leading-8 text-white/86">{result.nextStep}</p>
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
