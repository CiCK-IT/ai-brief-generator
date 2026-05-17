"use client";

import { useMemo, useRef, useState, type ReactNode } from "react";

type Maturity = "初步想法" | "方向明確" | "適合進一步企劃報價";

type EventForm = {
  clientName: string;
  fillDate: string;
  source: string;
  contact: string;
  eventType: string;
  eventDate: string;
  location: string;
  guestCount: string;
  budget: string;
  purpose: string;
  stylePreferences: string[];
  services: string[];
};

type ScalarEventFormKey = Exclude<keyof EventForm, "services" | "stylePreferences">;

type EventBreakdown = {
  goals: string[];
  mainNeeds: string[];
  services: string[];
  styleDirection: string[];
  styleSuggestions?: string[];
};

type EventBriefResult = {
  summary: string;
  eventType: string;
  breakdown: EventBreakdown;
  budgetTimelineAssessment: string;
  followUpQuestions: string[];
  maturity: Maturity;
  maturityNote: string;
  nextStep: string;
};

type EventRule = {
  eventType: string;
  keywords: string[];
  summaryFocus: string;
  breakdown: EventBreakdown;
  followUpQuestions: string[];
  nextStep: string;
};

type ExampleBrief = {
  label: string;
  text: string;
  form: Partial<EventForm>;
};

const sourceOptions = ["LINE 官方帳號", "接案平台", "朋友介紹", "Instagram", "網站表單", "其他"];

const eventTypeOptions = [
  "婚禮 / 婚宴",
  "品牌活動",
  "企業活動",
  "生日派對",
  "展覽 / 市集",
  "新品發表會",
  "私人聚會",
  "其他活動",
];

const budgetOptions = ["3 萬以下", "3–8 萬", "8–15 萬", "15–30 萬", "30 萬以上", "尚未確定"];

const styleOptions = [
  "浪漫典雅",
  "簡約質感",
  "自然戶外",
  "華麗奢華",
  "活潑派對",
  "品牌專業",
  "溫馨親友",
  "尚未確定",
];

const serviceOptions = [
  "活動企劃",
  "流程規劃",
  "場地佈置",
  "主持安排",
  "攝影 / 錄影",
  "餐飲規劃",
  "視覺設計",
  "邀請函 / 報名頁",
  "現場執行",
  "其他",
];

const defaultForm: EventForm = {
  clientName: "",
  fillDate: "",
  source: "",
  contact: "",
  eventType: "",
  eventDate: "",
  location: "",
  guestCount: "",
  budget: "尚未確定",
  purpose: "",
  stylePreferences: ["尚未確定"],
  services: [],
};

const examples: ExampleBrief[] = [
  {
    label: "婚禮企劃需求",
    text: "我們預計舉辦一場約 80 人的婚禮，希望風格是浪漫典雅，目前已有日期和大概預算，但還不確定需要哪些佈置、流程規劃和攝影服務。",
    form: {
      eventType: "婚禮 / 婚宴",
      guestCount: "約 80 人",
      budget: "15–30 萬",
      purpose: "婚禮儀式與賓客接待",
      stylePreferences: ["浪漫典雅"],
      services: ["活動企劃", "流程規劃", "場地佈置", "攝影 / 錄影"],
    },
  },
  {
    label: "品牌活動需求",
    text: "我們想舉辦一場品牌新品發表活動，希望現場有質感佈置、簡單流程規劃和拍照區，預計邀請 50 位來賓，希望能整理出活動企劃方向。",
    form: {
      eventType: "品牌活動",
      guestCount: "約 50 人",
      budget: "8–15 萬",
      purpose: "新品曝光與品牌體驗",
      stylePreferences: ["品牌專業"],
      services: ["活動企劃", "流程規劃", "場地佈置", "視覺設計", "現場執行"],
    },
  },
  {
    label: "企業活動需求",
    text: "公司想辦一場內部員工活動，約 120 人參加，希望流程順暢、有主持與簡單活動設計，預算還需要評估，希望先了解需要準備哪些項目。",
    form: {
      eventType: "企業活動",
      guestCount: "約 120 人",
      budget: "尚未確定",
      purpose: "員工交流與團隊凝聚",
      stylePreferences: ["簡約質感"],
      services: ["活動企劃", "流程規劃", "主持安排", "現場執行"],
    },
  },
  {
    label: "私人派對需求",
    text: "想辦一場生日派對，大約 30 人，希望風格活潑一點，需要場地佈置、流程安排和拍照區，但目前還沒有完整想法。",
    form: {
      eventType: "生日派對",
      guestCount: "約 30 人",
      budget: "3–8 萬",
      purpose: "生日慶祝與朋友聚會",
      stylePreferences: ["活潑派對"],
      services: ["流程規劃", "場地佈置", "攝影 / 錄影", "現場執行"],
    },
  },
];

const fallbackBreakdown: EventBreakdown = {
  goals: ["釐清活動目的與參與對象", "整理目前零散想法成可討論的企劃方向"],
  mainNeeds: ["確認日期、地點、人數與預算", "釐清必要服務與可延伸服務"],
  services: ["活動企劃", "流程規劃", "服務項目盤點"],
  styleDirection: ["先收集風格參考", "確認活動氛圍與視覺方向"],
};

const eventRules: EventRule[] = [
  {
    eventType: "婚禮 / 婚宴",
    keywords: ["婚禮", "婚宴", "新人", "儀式", "證婚", "賓客"],
    summaryFocus:
      "這份需求偏向婚禮與婚宴企劃，重點會放在儀式流程、賓客體驗、場地佈置、攝影紀錄與整體氛圍的一致性。",
    breakdown: {
      goals: ["建立新人期待中的婚禮氛圍", "讓儀式、宴客與拍攝流程更順暢"],
      mainNeeds: ["婚禮流程規劃", "場地動線與佈置方向", "攝影 / 錄影與主持需求"],
      services: ["活動企劃", "流程規劃", "場地佈置", "攝影 / 錄影"],
      styleDirection: ["浪漫典雅", "溫馨親友", "可加入新人故事與儀式細節"],
    },
    followUpQuestions: [
      "活動日期與場地是否已確認？",
      "預算是否包含場地、餐飲、佈置、主持與攝影？",
      "是否需要完整婚禮流程規劃，或只需要佈置與單項服務？",
      "是否已有喜歡的婚禮風格圖片或參考案例？",
    ],
    nextStep:
      "建議先確認婚禮日期、場地條件、預算範圍與必要服務項目，再整理成初步婚禮企劃方向與報價範圍。",
  },
  {
    eventType: "品牌活動",
    keywords: ["品牌", "快閃", "體驗", "曝光", "拍照區", "社群"],
    summaryFocus:
      "這份需求偏向品牌活動企劃，重點會放在品牌訊息、來賓體驗、拍照打卡區、現場視覺與社群曝光效果。",
    breakdown: {
      goals: ["讓來賓理解品牌形象與活動主題", "創造可拍攝與可分享的現場體驗"],
      mainNeeds: ["品牌主題轉譯", "現場佈置與拍照區", "簡潔流暢的活動流程"],
      services: ["活動企劃", "視覺設計", "場地佈置", "現場執行"],
      styleDirection: ["品牌專業", "簡約質感", "需與品牌識別保持一致"],
    },
    followUpQuestions: [
      "活動主要目標是曝光、銷售、會員招募，還是媒體體驗？",
      "是否已有品牌識別、主視覺或指定風格規範？",
      "是否需要拍照區、媒體背板、報到流程或社群互動設計？",
      "是否有品牌露出、贊助商或動線安排需求？",
    ],
    nextStep:
      "建議先確認品牌訊息、來賓名單、曝光目標與現場服務範圍，再整理成活動主題、視覺方向與執行清單。",
  },
  {
    eventType: "企業活動",
    keywords: ["企業", "公司", "員工", "尾牙", "春酒", "內部", "團隊"],
    summaryFocus:
      "這份需求偏向企業活動企劃，重點會放在流程穩定、主持安排、員工參與感、活動節奏與現場執行效率。",
    breakdown: {
      goals: ["提升員工參與感與活動順暢度", "讓內部活動具備清楚流程與現場節奏"],
      mainNeeds: ["活動流程設計", "主持與橋段安排", "人數與場地動線規劃"],
      services: ["活動企劃", "流程規劃", "主持安排", "現場執行"],
      styleDirection: ["簡約質感", "品牌專業", "兼顧企業形象與輕鬆互動"],
    },
    followUpQuestions: [
      "活動目的是員工凝聚、頒獎、教育訓練，還是年度聚會？",
      "是否需要主持、表演、互動遊戲或分組活動？",
      "預算是否包含餐飲、場地、設備與活動執行人力？",
      "是否有主管致詞、頒獎流程或企業品牌露出需求？",
    ],
    nextStep:
      "建議先確認活動目的、人數、場地、預算與流程長度，再規劃主持橋段、互動內容與現場執行配置。",
  },
  {
    eventType: "生日派對",
    keywords: ["生日", "派對", "慶生", "拍照", "朋友"],
    summaryFocus:
      "這份需求偏向私人生日派對，重點會放在主題風格、場地佈置、拍照區、簡單流程與賓客互動感。",
    breakdown: {
      goals: ["打造有記憶點的慶祝氛圍", "讓派對流程輕鬆但不失秩序"],
      mainNeeds: ["派對主題設定", "場地佈置與拍照區", "簡單流程與活動安排"],
      services: ["流程規劃", "場地佈置", "攝影 / 錄影", "現場執行"],
      styleDirection: ["活潑派對", "溫馨親友", "可依壽星喜好調整主題"],
    },
    followUpQuestions: [
      "場地是否已確認，是否有佈置時間與限制？",
      "是否需要拍照區、蛋糕桌、背板或小活動橋段？",
      "預算是否包含場地、餐飲、佈置與攝影？",
      "是否已有喜歡的色系或派對主題？",
    ],
    nextStep:
      "建議先確認場地、派對主題、必要佈置與拍照需求，再整理成一版精簡可執行的派對企劃。",
  },
  {
    eventType: "展覽 / 市集",
    keywords: ["展覽", "市集", "攤位", "展場", "人流", "動線"],
    summaryFocus:
      "這份需求偏向展覽或市集活動，重點會放在人流動線、攤位視覺、報到或導引設計，以及現場執行管理。",
    breakdown: {
      goals: ["提升現場辨識度與互動效率", "讓來賓能清楚理解活動內容與動線"],
      mainNeeds: ["展場動線規劃", "攤位或展區視覺", "報到與現場導引"],
      services: ["活動企劃", "視覺設計", "場地佈置", "現場執行"],
      styleDirection: ["簡約質感", "品牌專業", "需兼顧資訊清楚與現場耐用性"],
    },
    followUpQuestions: [
      "展區或攤位尺寸與現場限制是否已確認？",
      "是否需要人流動線、報到、導覽或互動設計？",
      "視覺物料需要哪些品項，例如背板、立牌、指引牌或攤位佈置？",
      "是否有品牌曝光、招商或銷售轉換目標？",
    ],
    nextStep:
      "建議先取得場地圖與攤位規格，確認人流、物料、視覺與現場執行需求，再拆成製作與執行清單。",
  },
  {
    eventType: "新品發表會",
    keywords: ["新品", "發表", "發布", "媒體", "來賓", "產品"],
    summaryFocus:
      "這份需求偏向新品發表會，重點會放在產品亮點、品牌敘事、來賓體驗、流程節奏與媒體或社群曝光。",
    breakdown: {
      goals: ["清楚傳達產品價值與品牌定位", "建立來賓與媒體可理解、可分享的活動體驗"],
      mainNeeds: ["發表流程設計", "產品展示與拍照區", "來賓報到與媒體接待"],
      services: ["活動企劃", "流程規劃", "視覺設計", "現場執行"],
      styleDirection: ["品牌專業", "簡約質感", "可加入產品展示與品牌敘事"],
    },
    followUpQuestions: [
      "新品發表的核心訊息與主打賣點是什麼？",
      "是否邀請媒體、KOL、合作夥伴或 VIP 客戶？",
      "是否需要產品展示區、拍照區、簡報流程或直播紀錄？",
      "活動成效希望以曝光、名單、銷售還是合作洽談衡量？",
    ],
    nextStep:
      "建議先整理產品亮點、來賓名單、流程段落與曝光目標，再規劃活動主題、現場視覺與執行需求。",
  },
  {
    eventType: "私人聚會",
    keywords: ["私人", "聚會", "親友", "家人", "朋友"],
    summaryFocus:
      "這份需求偏向私人聚會，重點會放在舒適氛圍、餐飲安排、簡單佈置與親友互動感。",
    breakdown: {
      goals: ["讓親友聚會更有儀式感", "以舒適自然的方式整理現場流程與佈置"],
      mainNeeds: ["聚會主題與氛圍", "餐飲與座位安排", "簡單流程與拍照需求"],
      services: ["流程規劃", "場地佈置", "餐飲規劃", "現場執行"],
      styleDirection: ["溫馨親友", "自然戶外", "不需過度正式但要有質感"],
    },
    followUpQuestions: [
      "聚會場地是在室內、戶外、餐廳還是私人空間？",
      "是否需要餐飲、座位、拍照區或簡單流程安排？",
      "賓客年齡層與互動形式是否需要特別考量？",
      "希望整體氛圍偏輕鬆、正式、溫馨還是派對感？",
    ],
    nextStep:
      "建議先確認場地、人數、餐飲與必要佈置，再整理成簡潔的聚會流程與服務項目。",
  },
];

const defaultResult: EventBriefResult = {
  summary:
    "填寫活動資訊後，系統會整理活動目的、服務範圍、風格方向與下一步確認事項。",
  eventType: "等待活動資訊",
  breakdown: {
    goals: ["等待活動資訊"],
    mainNeeds: ["填寫日期、地點、人數與預算後產生重點"],
    services: ["尚未選擇服務項目"],
    styleDirection: ["尚未確定"],
    styleSuggestions: ["可先選擇 1–2 個風格偏好，或保留尚未確定。"],
  },
  budgetTimelineAssessment: "填寫活動日期、預算與服務項目後，會產生初步判斷。",
  followUpQuestions: [
    "活動日期與場地是否已確認？",
    "預算是否包含場地、餐飲、佈置與攝影？",
    "是否需要完整企劃流程，或只需要單項服務？",
  ],
  maturity: "初步想法",
  maturityNote: "尚未開始分析，先填寫活動資訊或點選範例即可產生 Brief。",
  nextStep: "填寫左側欄位，或點選範例快速產生活動 Brief。",
};

const painPoints = [
  {
    title: "想法很多但不夠具體",
    body: "客戶常只描述想要的氛圍，卻沒有整理日期、地點、人數、預算與必要服務。",
  },
  {
    title: "報價前需要反覆補問",
    body: "活動範圍、服務項目與執行細節不清楚時，容易來回確認很多次。",
  },
  {
    title: "需求分散在不同訊息裡",
    body: "風格截圖、場地資訊、預算與流程想法常散在 LINE、表單與聊天紀錄中。",
  },
  {
    title: "難以快速形成企劃方向",
    body: "缺少結構化整理時，活動企劃與報價很難快速進入下一步。",
  },
];

const outcomeCards = [
  {
    title: "活動摘要",
    body: "把日期、地點、人數、目的與補充需求整理成清楚的活動概述。",
  },
  {
    title: "服務項目拆解",
    body: "初步拆解可能需要的企劃、流程、佈置、影像與現場執行服務。",
  },
  {
    title: "預算與時程判斷",
    body: "根據預算、活動日期、類型與服務數量，判斷目前是否適合進一步報價。",
  },
  {
    title: "補問問題與下一步建議",
    body: "提示接下來應補齊哪些關鍵資訊，讓企劃與報價更快收斂。",
  },
];

const audiences = ["婚禮企劃", "活動公司", "品牌行銷團隊", "企業活動窗口", "自由活動企劃者", "小型工作室"];
const workflow = ["填寫活動資訊", "系統初步整理", "檢視重點與補問問題", "進入企劃或報價討論"];

function getDisplayValue(value: string) {
  return value.trim() || "尚未填寫";
}

function getSelectedServicesLabel(services: string[]) {
  return services.length > 0 ? services.join("、") : "尚未選擇";
}

function getSelectedStyles(styles: string[]) {
  return styles.filter((style) => style !== "尚未確定");
}

function getSelectedStylesLabel(styles: string[]) {
  const selectedStyles = getSelectedStyles(styles);
  return selectedStyles.length > 0 ? selectedStyles.join("、") : "尚未確定";
}

function getGuestScaleText(guestCount: string) {
  const rawCount = guestCount.trim();

  if (!rawCount) {
    return "目前尚未提供預估人數";
  }

  const normalizedCount =
    rawCount
      .replace(/^(約|大約|預計|預估)\s*/u, "")
      .replace(/位來賓|位|人|名|規模|左右/g, "")
      .trim() || rawCount;

  return `約 ${normalizedCount} 位來賓規模`;
}

function cleanQuestionText(question: string) {
  return question.replace(/^\s*(?:[0-9０-９]+[\s.、．)]*)+/u, "").trim();
}

function findRuleByType(eventType: string) {
  return eventRules.find((rule) => rule.eventType === eventType);
}

function findRuleByText(input: string) {
  const scoredRules = eventRules.map((rule, index) => ({
    rule,
    index,
    score: rule.keywords.reduce((total, keyword) => (input.includes(keyword) ? total + 1 : total), 0),
  }));

  scoredRules.sort((a, b) => b.score - a.score || a.index - b.index);
  return scoredRules[0]?.score > 0 ? scoredRules[0].rule : undefined;
}

function resolveRule(input: string, form: EventForm) {
  return findRuleByType(form.eventType) ?? findRuleByText(input);
}

function getDaysUntil(eventDate: string) {
  if (!eventDate) return null;

  const today = new Date();
  const event = new Date(`${eventDate}T00:00:00`);
  const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const diff = event.getTime() - todayMidnight.getTime();

  return Math.ceil(diff / 86400000);
}

function getMaturity(input: string, form: EventForm): Maturity {
  const compactLength = input.replace(/\s/g, "").length;
  const filledScore = [
    form.eventType,
    form.eventDate,
    form.location,
    form.guestCount,
    form.budget !== "尚未確定" ? form.budget : "",
    form.purpose,
    getSelectedStyles(form.stylePreferences).length > 0 ? "styles" : "",
    form.services.length > 0 ? "services" : "",
  ].filter(Boolean).length;

  if (filledScore >= 6 && compactLength >= 60 && form.services.length >= 2) {
    return "適合進一步企劃報價";
  }

  if (filledScore >= 3 || compactLength >= 40) {
    return "方向明確";
  }

  return "初步想法";
}

function getEventProfile(eventType: string) {
  if (eventType === "婚禮 / 婚宴") {
    return {
      essence: "婚禮 / 婚宴",
      defaultGoal: "讓儀式、宴客與賓客體驗在同一個風格脈絡下順暢發生",
      consultantAngle: "企劃重點應放在儀式流程、賓客體驗、風格氛圍與場地條件。",
      nextFocus: "優先整理儀式與宴客流程、場地進退場限制、佈置範圍與影像紀錄需求",
    };
  }

  if (eventType === "品牌活動") {
    return {
      essence: "品牌活動",
      defaultGoal: "透過現場體驗與視覺設計提升品牌曝光與來賓記憶點",
      consultantAngle: "企劃重點應放在品牌曝光、來賓體驗、拍照區設計與視覺一致性。",
      nextFocus: "優先確認品牌訊息、來賓動線、拍照區需求、主視覺規範與曝光目標",
    };
  }

  if (eventType === "企業活動") {
    return {
      essence: "企業活動",
      defaultGoal: "讓內部溝通、活動節奏與現場執行都更穩定",
      consultantAngle: "企劃重點應放在流程順暢、人數控管、主持安排、活動節奏與內部溝通。",
      nextFocus: "優先確認流程長度、主持橋段、分工窗口、人數控管與現場執行節點",
    };
  }

  if (eventType === "生日派對" || eventType === "私人聚會") {
    return {
      essence: eventType,
      defaultGoal: "營造有記憶點、好互動且適合拍照的聚會氛圍",
      consultantAngle: "企劃重點應放在氛圍、賓客互動、佈置、拍照與餐飲安排。",
      nextFocus: "優先確認場地限制、派對主題、拍照區、餐飲形式與簡單流程安排",
    };
  }

  if (eventType === "展覽 / 市集") {
    return {
      essence: "展覽 / 市集",
      defaultGoal: "讓現場動線、攤位配置與視覺識別能支撐人流與互動需求",
      consultantAngle: "企劃重點應放在動線、攤位配置、視覺識別、人流與現場執行。",
      nextFocus: "優先取得場地圖、攤位尺寸、物料清單、人流動線與現場人力配置",
    };
  }

  if (eventType === "新品發表會") {
    return {
      essence: "新品發表會",
      defaultGoal: "透過產品展示、媒體 / 來賓體驗與品牌視覺建立發表亮點",
      consultantAngle: "企劃重點應放在產品展示、媒體 / 來賓體驗、品牌視覺與流程安排。",
      nextFocus: "優先確認產品亮點、發表流程、媒體接待、拍照區與品牌視覺規範",
    };
  }

  return {
    essence: eventType || "活動企劃",
    defaultGoal: "把零散活動想法整理成可估價、可執行的企劃方向",
    consultantAngle: "企劃重點應先聚焦活動目的、場地條件、預算範圍與必要服務。",
    nextFocus: "優先確認活動目的、日期、地點、人數、預算與必要服務項目",
  };
}

function getKnownInfo(form: EventForm) {
  return [
    form.eventDate ? "活動日期" : "",
    form.location.trim() ? "活動地點" : "",
    form.guestCount.trim() ? "預估人數" : "",
    form.budget !== "尚未確定" ? "預算區間" : "",
    form.services.length > 0 ? "主要服務項目" : "",
    getSelectedStyles(form.stylePreferences).length > 0 ? "風格偏好" : "",
  ].filter(Boolean);
}

function getMissingInfo(form: EventForm) {
  return [
    form.eventDate ? "" : "活動日期",
    form.location.trim() ? "" : "活動地點",
    form.guestCount.trim() ? "" : "預估人數",
    form.budget !== "尚未確定" ? "" : "預算範圍",
    form.services.length > 0 ? "" : "必要服務項目",
    getSelectedStyles(form.stylePreferences).length > 0 ? "" : "風格參考",
  ].filter(Boolean);
}

function getServiceFocus(services: string[]) {
  const focus = [
    services.includes("場地佈置") ? "場地佈置範圍與拍照區設計" : "",
    services.includes("主持安排") ? "主持風格、流程長度與活動橋段" : "",
    services.includes("攝影 / 錄影") ? "影像紀錄時段與交付格式" : "",
    services.includes("餐飲規劃") ? "餐飲形式、動線與特殊飲食需求" : "",
    services.includes("視覺設計") ? "主視覺、色系與現場物料一致性" : "",
    services.includes("邀請函 / 報名頁") ? "邀請或報名流程與名單管理" : "",
  ].filter(Boolean);

  return focus.length > 0 ? focus.slice(0, 3) : ["必要服務範圍與執行深度"];
}

function getEventTypeBreakdown(eventType: string) {
  if (eventType === "婚禮 / 婚宴") {
    return {
      goals: ["安排清楚的儀式與宴客流程", "讓賓客體驗、場地動線與風格氛圍保持一致", "保留新人故事與重要時刻的影像紀錄"],
      mainNeeds: ["確認儀式流程、進退場與宴客節奏", "整理場地動線、佈置範圍、花藝與拍照區", "確認攝影 / 錄影、主持與賓客接待方式"],
      services: ["活動企劃", "流程規劃", "場地佈置", "攝影 / 錄影"],
      summaryAngle: "這類活動不只是佈置或流程安排，而是需要同時照顧儀式感、賓客動線、現場氛圍與影像紀錄。",
    };
  }

  if (eventType === "品牌活動") {
    return {
      goals: ["放大品牌曝光與活動記憶點", "把產品或品牌訊息轉成可體驗的現場內容", "讓來賓容易拍照、分享並理解活動主軸"],
      mainNeeds: ["確認品牌露出位置、拍照區與主視覺規範", "規劃產品展示、來賓體驗與動線節奏", "整理視覺設計、佈置與現場執行範圍"],
      services: ["活動企劃", "視覺設計", "場地佈置", "現場執行"],
      summaryAngle: "這類活動重點不只是辦一場聚會，而是要兼顧品牌展示、來賓體驗、拍照傳播與現場動線。",
    };
  }

  if (eventType === "企業活動") {
    return {
      goals: ["讓活動流程穩定且容易控場", "提升員工參與感並降低現場溝通成本", "協助內部窗口掌握流程、主持與執行節點"],
      mainNeeds: ["確認流程長度、人數控管與主持安排", "規劃活動節奏、互動橋段與內部溝通分工", "整理場地設備、報到動線與現場執行人力"],
      services: ["活動企劃", "流程規劃", "主持安排", "現場執行"],
      summaryAngle: "這類活動的核心是流程控場與內部協作，需要先把主持橋段、人數控管、活動節奏與窗口分工整理清楚。",
    };
  }

  if (eventType === "生日派對" || eventType === "私人聚會") {
    return {
      goals: ["營造符合主角與賓客關係的聚會氛圍", "安排自然好互動的橋段與拍照場景", "讓餐飲、動線與佈置維持輕鬆但有質感"],
      mainNeeds: ["確認派對主題、互動橋段與音樂氛圍", "整理餐飲形式、座位或站立動線", "規劃拍照區、佈置重點與現場執行方式"],
      services: ["流程規劃", "場地佈置", "餐飲規劃", "現場執行"],
      summaryAngle: "這類活動重點在氛圍與賓客互動，不需要過度複雜，但要先把餐飲、佈置、拍照區與流程節奏安排好。",
    };
  }

  if (eventType === "展覽 / 市集") {
    return {
      goals: ["提高展區辨識度與參觀效率", "讓人流、攤位配置與現場執行更有秩序", "把品牌或活動資訊清楚轉成現場視覺"],
      mainNeeds: ["確認攤位配置、參觀動線與展區尺寸", "整理視覺識別、指標、背板與展示物料", "規劃人流管理、報到導引與現場執行分工"],
      services: ["活動企劃", "視覺設計", "場地佈置", "現場執行"],
      summaryAngle: "這類活動需要先把攤位配置、參觀動線、視覺識別與現場人流管理整理清楚，避免執行時資訊分散。",
    };
  }

  if (eventType === "新品發表會") {
    return {
      goals: ["清楚呈現產品亮點與品牌定位", "建立媒體 / 來賓容易理解與拍攝的活動體驗", "讓展示動線與流程安排支撐曝光目標"],
      mainNeeds: ["確認產品展示方式、拍照區與展示動線", "規劃發表流程、媒體 / KOL 接待與簡報節奏", "整理品牌視覺、背板、指標與現場執行範圍"],
      services: ["活動企劃", "流程規劃", "視覺設計", "現場執行"],
      summaryAngle: "這類活動不只是發布訊息，而是需要把產品亮點、品牌視覺、媒體 / 來賓體驗與流程節奏整合成一個清楚的發表場景。",
    };
  }

  return {
    goals: fallbackBreakdown.goals,
    mainNeeds: fallbackBreakdown.mainNeeds,
    services: fallbackBreakdown.services,
    summaryAngle: "目前活動類型仍偏初步，建議先釐清活動本質、服務範圍與現場執行條件。",
  };
}

function getSummaryOpening(form: EventForm, eventType: string) {
  if (!form.guestCount.trim()) {
    return `這是一場${eventType}需求，目前尚未提供預估人數`;
  }

  return `這是一場${getGuestScaleText(form.guestCount)}的${eventType}需求`;
}

function makeSummary(input: string, form: EventForm, rule?: EventRule) {
  const eventType = form.eventType || rule?.eventType || "活動企劃";
  const profile = getEventProfile(eventType);
  const typeBreakdown = getEventTypeBreakdown(eventType);
  const goal = form.purpose.trim() || profile.defaultGoal;
  const selectedServices =
    form.services.length > 0 ? form.services : (rule?.breakdown.services ?? typeBreakdown.services);
  const knownInfo = getKnownInfo(form);
  const missingInfo = getMissingInfo(form);
  const knownText =
    knownInfo.length > 0
      ? `目前已明確的資訊包含${knownInfo.join("、")}，已具備初步 Brief 基礎`
      : "目前資訊仍偏概念階段，尚未形成可直接估價的完整條件";
  const missingText =
    missingInfo.length > 0
      ? `仍需確認的關鍵缺口是${missingInfo.slice(0, 4).join("、")}`
      : "關鍵資訊已相對完整，接下來可進入企劃範圍與報價假設整理";
  const serviceFocus = getServiceFocus(form.services).join("、");
  const serviceText =
    selectedServices.length > 0
      ? `需求已包含${selectedServices.slice(0, 5).join("、")}，${typeBreakdown.summaryAngle}`
      : `${typeBreakdown.summaryAngle}目前尚未選擇服務項目，建議先確認必要服務與可延伸服務。`;
  const detailHint = input.trim()
    ? "補充需求已可作為活動氛圍、執行深度與報價假設的判斷依據"
    : "尚未補充客戶原始描述，後續建議加入實際想法、參考圖或限制條件";

  return `${getSummaryOpening(form, profile.essence)}，核心目標是${goal}。${serviceText}${knownText}；${missingText}。下一步建議優先確認${profile.nextFocus}，並把${serviceFocus}拆成必要項目與可延伸項目，作為初步企劃與報價範圍。${detailHint}。`;
}

function makeBudgetTimelineAssessment(form: EventForm, rule?: EventRule) {
  const daysUntil = getDaysUntil(form.eventDate);
  const serviceCount = form.services.length;
  const lowBudget = form.budget === "3 萬以下" || form.budget === "3–8 萬";
  const highScope = serviceCount >= 5;
  const typeText = form.eventType || rule?.eventType || "目前活動類型";
  const dateText = form.eventDate ? `活動日期已提供` : "活動日期尚未提供";
  const timeText =
    daysUntil === null
      ? "仍需確認可規劃時間"
      : daysUntil < 0
        ? "日期看起來已過期，建議重新確認"
        : daysUntil <= 14
          ? "距離活動時間較短，需優先收斂必要服務"
          : daysUntil <= 45
            ? "仍有初步規劃時間，但建議盡快確認場地與服務項目"
            : "時程相對充裕，適合先整理完整企劃方向";
  const budgetText =
    form.budget === "尚未確定"
      ? "預算尚未確定，建議先設定可接受上限或分成基本版與完整方案"
      : `目前預算為「${form.budget}」`;
  const scopeText =
    lowBudget && highScope
      ? "服務項目較多且預算偏精簡，建議先拆出必要項目與延伸項目"
      : highScope
        ? "服務項目較完整，後續可進一步估算人力、物料與執行成本"
        : "服務項目數量適中，可先確認每個項目的深度與交付內容";

  return `${typeText}的${dateText}，${timeText}。${budgetText}。目前勾選 ${serviceCount} 項服務，${scopeText}。`;
}

function getFollowUpQuestions(form: EventForm, rule?: EventRule) {
  const questions: string[] = [];

  if (!form.eventDate) {
    questions.push("活動日期或預計檔期是否已確認，是否有不可更動的時間限制？");
  }

  if (!form.location.trim()) {
    questions.push("活動場地是否已確認，場地方是否有進退場、佈置時間、音響燈光或動線限制？");
  }

  if (!form.guestCount.trim()) {
    questions.push("預估來賓人數與主要對象是誰，是否有貴賓、媒體、長輩或員工分組需求？");
  }

  if (form.budget === "尚未確定") {
    questions.push("預算是否包含場地、餐飲、佈置、攝影與現場執行費，或需要拆成基本版與完整方案？");
  }

  if (form.services.length === 0) {
    questions.push("目前需要完整活動企劃，還是先從流程、佈置、主持、影像等單項服務開始？");
  }

  if (form.services.includes("場地佈置")) {
    questions.push("場地佈置是否已有色系、背板、拍照區、花藝、桌面佈置或主視覺需求？");
  }

  if (form.services.includes("主持安排")) {
    questions.push("主持流程預計多長，主持風格希望正式、活潑還是溫馨，是否需要互動橋段？");
  }

  if (form.services.includes("攝影 / 錄影")) {
    questions.push("影像需求是平面紀錄、精華影片、完整錄影，還是需要即時社群素材？");
  }

  if (form.services.includes("餐飲規劃")) {
    questions.push("餐飲形式是套餐、Buffet、外燴還是輕食，是否有用餐動線與特殊飲食需求？");
  }

  if (form.services.includes("視覺設計")) {
    questions.push("是否已有品牌識別、主視覺、指定字體色系或必須露出的活動資訊？");
  }

  if (form.eventType === "品牌活動" || form.eventType === "新品發表會" || rule?.eventType === "品牌活動" || rule?.eventType === "新品發表會") {
    questions.push("是否有品牌露出規範、產品展示方式、媒體邀請或 KOL 接待需求？");
  }

  if (getSelectedStyles(form.stylePreferences).length === 0) {
    questions.push("是否已有喜歡的風格圖片、色系、花藝、材質或參考案例？");
  }

  if (questions.length < 3) {
    const ruleQuestions = (rule?.followUpQuestions ?? []).filter((question) => {
      return form.services.includes("攝影 / 錄影") || !question.includes("攝影");
    });
    questions.push(...ruleQuestions);
  }

  return Array.from(new Set(questions.map(cleanQuestionText).filter(Boolean))).slice(0, 5);
}

function getMaturityNote(maturity: Maturity, form: EventForm) {
  const missingItems = [
    form.eventType ? "" : "活動類型",
    form.eventDate ? "" : "活動日期",
    form.location.trim() ? "" : "活動地點",
    form.guestCount.trim() ? "" : "預估人數",
    form.budget !== "尚未確定" ? "" : "預算區間",
    form.services.length > 0 ? "" : "服務項目",
  ].filter(Boolean);

  if (maturity === "適合進一步企劃報價") {
    return "活動資訊已具備初步企劃與估價基礎，可進一步整理服務範圍、人力配置與報價假設。";
  }

  if (maturity === "方向明確") {
    return missingItems.length > 0
      ? `活動方向已初步明確，但仍建議補齊${missingItems.join("、")}。`
      : "活動方向已初步明確，可開始收斂企劃主軸與服務項目深度。";
  }

  return "目前仍偏初步想法，建議先確認活動日期、地點、人數、預算與必要服務項目。";
}

function getNextStep(form: EventForm, maturity: Maturity, rule?: EventRule) {
  const profile = getEventProfile(form.eventType || rule?.eventType || "");
  const daysUntil = getDaysUntil(form.eventDate);
  const missingInfo = getMissingInfo(form);
  const serviceFocus = getServiceFocus(form.services).slice(0, 2).join("、");
  const urgentNote =
    daysUntil !== null && daysUntil <= 14 && daysUntil >= 0
      ? "由於活動日期較近，需同步確認供應商可配合時間與現場執行人力。"
      : "";

  if (maturity === "初步想法") {
    return `建議先補齊日期、地點、人數、預算與必要服務；目前可先建立一頁式活動規格表，逐項確認${missingInfo.length > 0 ? missingInfo.slice(0, 4).join("、") : "活動基本條件"}，再判斷是否需要完整企劃、單項服務或分階段報價。${urgentNote}`.trim();
  }

  if (maturity === "方向明確") {
    return `建議整理 MVP 活動範圍，把必要服務與可延伸服務分開：先確認${profile.nextFocus}，再針對${serviceFocus}建立初步清單，避免報價時範圍過大或漏掉關鍵執行項目。${urgentNote}`.trim();
  }

  return `建議進入初步企劃與報價整理：先確認場地條件、服務深度、執行人力與物料範圍，再依「${form.budget === "尚未確定" ? "基本版 / 完整版" : form.budget}」建立報價假設、企劃大綱與下一輪提案確認清單。${urgentNote}`.trim();
}

function getDynamicGoals(form: EventForm, rule?: EventRule) {
  const profile = getEventProfile(form.eventType || rule?.eventType || "");
  const typeBreakdown = getEventTypeBreakdown(form.eventType || rule?.eventType || "");
  const goals = [
    form.purpose.trim() ? `達成「${form.purpose.trim()}」目的` : profile.defaultGoal,
    ...typeBreakdown.goals,
  ];

  if (form.services.includes("現場執行")) {
    goals.push("降低活動當天臨場溝通與執行風險");
  }

  return Array.from(new Set(goals)).slice(0, 3);
}

function getDynamicMainNeeds(form: EventForm, rule?: EventRule) {
  const typeBreakdown = getEventTypeBreakdown(form.eventType || rule?.eventType || "");
  const needs = [
    ...typeBreakdown.mainNeeds,
    !form.eventDate || !form.location.trim() ? "確認活動日期、場地條件與進退場限制" : "",
    !form.guestCount.trim() ? "補齊預估人數與賓客組成" : "",
    form.budget === "尚未確定" ? "建立預算範圍與基本 / 完整方案" : `以「${form.budget}」拆分必要與延伸服務`,
    form.services.includes("場地佈置") ? "整理佈置區域、背板、拍照區與色系參考" : "",
    form.services.includes("主持安排") ? "規劃流程長度、主持風格與互動橋段" : "",
    form.services.includes("攝影 / 錄影") ? "確認影像紀錄範圍與交付格式" : "",
    form.services.includes("餐飲規劃") ? "確認餐飲形式、動線與特殊飲食需求" : "",
  ].filter(Boolean);

  return Array.from(new Set(needs.length > 0 ? needs : (rule?.breakdown.mainNeeds ?? fallbackBreakdown.mainNeeds))).slice(0, 5);
}

function getStyleSuggestions(input: string, form: EventForm, rule?: EventRule) {
  const selectedStyles = getSelectedStyles(form.stylePreferences);
  const eventType = form.eventType || rule?.eventType || "";
  const context = `${eventType} ${form.purpose} ${input} ${selectedStyles.join("、")}`;
  const suggestions = [
    (eventType === "新品發表會" || eventType === "品牌活動") &&
    (selectedStyles.includes("華麗奢華") || selectedStyles.includes("品牌專業") || context.includes("品牌"))
      ? "建議統一背板、邀請函與現場指標設計，讓品牌視覺在現場保持一致。"
      : "",
    (eventType === "新品發表會" || eventType === "品牌活動") &&
    (selectedStyles.includes("華麗奢華") || selectedStyles.includes("品牌專業") || context.includes("新品"))
      ? "可規劃品牌拍照區與產品展示焦點，讓來賓更容易理解活動主軸。"
      : "",
    eventType === "婚禮 / 婚宴" && selectedStyles.includes("浪漫典雅")
      ? "建議補充儀式流程、賓客動線與入場節奏，讓浪漫氛圍能延伸到整場體驗。"
      : "",
    eventType === "婚禮 / 婚宴" && selectedStyles.includes("浪漫典雅")
      ? "可整理主視覺色系、花藝、桌面佈置與拍照區需求，方便後續估價。"
      : "",
    (eventType === "生日派對" || eventType === "私人聚會") && selectedStyles.includes("活潑派對")
      ? "建議確認互動橋段、音樂氛圍與拍照區配置，讓現場節奏更有記憶點。"
      : "",
    (eventType === "生日派對" || eventType === "私人聚會") && selectedStyles.includes("活潑派對")
      ? "可補充餐飲形式、活動動線與主要來賓組成，避免現場安排過度鬆散。"
      : "",
    selectedStyles.length === 0 && eventType === "婚禮 / 婚宴"
      ? "可先討論浪漫典雅、溫馨親友或自然戶外三種方向，再依場地條件收斂。"
      : "",
    selectedStyles.length === 0 && (eventType === "品牌活動" || eventType === "新品發表會")
      ? "可先以品牌專業或簡約質感作為基礎，再依產品調性加入材質與燈光層次。"
      : "",
    selectedStyles.length === 0 && eventType === "企業活動"
      ? "可先以簡約質感與品牌專業作為主軸，讓流程控場與企業形象保持一致。"
      : "",
    selectedStyles.length === 0 && (eventType === "生日派對" || eventType === "私人聚會")
      ? "可先在活潑派對、溫馨親友或簡約質感中選定一個主軸，再規劃佈置與餐飲。"
      : "",
    selectedStyles.length === 0 && eventType === "展覽 / 市集"
      ? "可先以品牌專業或簡約質感建立視覺識別，再依攤位動線調整資訊層級。"
      : "",
    form.services.includes("場地佈置")
      ? "因為有場地佈置需求，建議補充參考圖片、色系、背板尺寸與拍照區位置。"
      : "",
    form.services.includes("視覺設計")
      ? "若需要視覺設計，可先整理品牌識別、主視覺素材與必須露出的活動資訊。"
      : "",
    form.services.includes("主持安排")
      ? "若有主持安排，建議同步確認主持語氣、流程長度與互動橋段。"
      : "",
  ].filter(Boolean);

  const fallbackSuggestions = [
    "建議先整理 2–3 張風格參考圖，確認色系、材質與現場氛圍。",
    "可把必要服務與可延伸服務分開，讓企劃與報價更容易收斂。",
    "下一步可補充場地條件與現場動線，避免風格方向無法落地執行。",
  ];

  return Array.from(new Set(suggestions.length > 0 ? suggestions : fallbackSuggestions)).slice(0, 3);
}

function getStyleBreakdown(input: string, form: EventForm, rule?: EventRule) {
  const selectedStyles = getSelectedStyles(form.stylePreferences);

  if (selectedStyles.length > 0) {
    return {
      styleDirection: selectedStyles,
      styleSuggestions: getStyleSuggestions(input, form, rule),
    };
  }

  return {
    styleDirection: ["尚未確定"],
    styleSuggestions: getStyleSuggestions(input, form, rule),
  };
}

function analyzeEventBrief(input: string, form: EventForm): EventBriefResult {
  const rule = resolveRule(input, form);
  const eventType = form.eventType || rule?.eventType || "初步活動需求";
  const maturity = getMaturity(input, form);
  const selectedServiceBreakdown =
    form.services.length > 0 ? form.services : (rule?.breakdown.services ?? fallbackBreakdown.services);
  const styleBreakdown = getStyleBreakdown(input, form, rule);

  return {
    summary: makeSummary(input, form, rule),
    eventType,
    breakdown: {
      goals: getDynamicGoals(form, rule),
      mainNeeds: getDynamicMainNeeds(form, rule),
      services: selectedServiceBreakdown,
      styleDirection: styleBreakdown.styleDirection,
      styleSuggestions: styleBreakdown.styleSuggestions,
    },
    budgetTimelineAssessment: makeBudgetTimelineAssessment(form, rule),
    followUpQuestions: getFollowUpQuestions(form, rule),
    maturity,
    maturityNote: getMaturityNote(maturity, form),
    nextStep: getNextStep(form, maturity, rule),
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
      {eyebrow ? <p className="mb-3 text-sm font-semibold text-[#a17b4b]">{eyebrow}</p> : null}
      <h2 className="text-2xl font-semibold text-[#1d1b1a] md:text-4xl">{title}</h2>
      {description ? <p className="mt-4 text-base leading-8 text-[#786b60] md:text-lg">{description}</p> : null}
    </div>
  );
}

function FormSection({
  title,
  children,
  description,
}: {
  title: string;
  children: ReactNode;
  description?: string;
}) {
  return (
    <section className="rounded-lg border border-[#eadfd2] bg-white/68 p-4">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-[#1d1b1a]">{title}</h3>
        {description ? <p className="mt-1 text-sm leading-6 text-[#837368]">{description}</p> : null}
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
      <span className="text-sm font-semibold text-[#4e453e]">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-12 w-full rounded-lg border border-[#e3d7c9] bg-white/86 px-4 text-sm text-[#211f1d] outline-none transition placeholder:text-[#aa9b8e] focus:border-[#b98f5d] focus:bg-white focus:ring-4 focus:ring-[#b98f5d]/12"
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
      <span className="text-sm font-semibold text-[#4e453e]">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="mt-2 h-12 w-full rounded-lg border border-[#e3d7c9] bg-white/86 px-4 text-sm text-[#211f1d] outline-none transition focus:border-[#b98f5d] focus:bg-white focus:ring-4 focus:ring-[#b98f5d]/12"
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
      <p className="text-sm font-semibold text-[#e6c894]">{title}</p>
      <ul className="mt-3 space-y-2">
        {items.map((item) => (
          <li key={item} className="flex gap-2 text-sm leading-6 text-white/82">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#d4a373]" />
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
  const [eventForm, setEventForm] = useState<EventForm>(defaultForm);
  const [details, setDetails] = useState("");
  const [result, setResult] = useState<EventBriefResult>(defaultResult);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  const maturityWidth = useMemo(() => {
    if (result.maturity === "適合進一步企劃報價") return "100%";
    if (result.maturity === "方向明確") return "66%";
    return "34%";
  }, [result.maturity]);

  const updateForm = (key: ScalarEventFormKey, value: string) => {
    setEventForm((current) => ({ ...current, [key]: value }));
  };

  const toggleStyle = (style: string) => {
    setEventForm((current) => {
      if (style === "尚未確定") {
        return { ...current, stylePreferences: ["尚未確定"] };
      }

      const selectedStyles = getSelectedStyles(current.stylePreferences);
      const nextStyles = selectedStyles.includes(style)
        ? selectedStyles.filter((item) => item !== style)
        : [...selectedStyles, style];

      return {
        ...current,
        stylePreferences: nextStyles.length > 0 ? nextStyles : ["尚未確定"],
      };
    });
  };

  const toggleService = (service: string) => {
    setEventForm((current) => {
      const isSelected = current.services.includes(service);
      return {
        ...current,
        services: isSelected
          ? current.services.filter((item) => item !== service)
          : [...current.services, service],
      };
    });
  };

  const handleExampleClick = (example: ExampleBrief) => {
    const nextForm = { ...eventForm, ...example.form };
    setEventForm(nextForm);
    setDetails(example.text);
    setResult(analyzeEventBrief(example.text, nextForm));
    inputRef.current?.focus();
  };

  const handleAnalyze = () => {
    setResult(analyzeEventBrief(details, eventForm));
  };

  return (
    <main className="page-surface min-h-screen overflow-hidden">
      <div className="hero-atmosphere pointer-events-none absolute inset-x-0 top-0 h-[780px]" />
      <div className="soft-grid pointer-events-none absolute inset-x-0 top-0 h-[720px]" />

      <header className="relative mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 md:px-10">
        <a href="#" className="text-base font-semibold text-[#1d1b1a]" aria-label="cick tools">
          cick tools
        </a>
        <a
          href="#brief-tool"
          className="rounded-full border border-[#ddcfbe] bg-white/72 px-5 py-2.5 text-sm font-semibold text-[#2a2520] shadow-sm backdrop-blur transition hover:border-[#c4a57a] hover:bg-white"
        >
          開始整理活動需求
        </a>
      </header>

      <section className="relative mx-auto grid w-full max-w-7xl gap-10 px-6 pb-20 pt-12 md:grid-cols-[1.04fr_0.96fr] md:px-10 md:pb-28 md:pt-20">
        <div className="flex flex-col justify-center">
          <p className="mb-5 text-sm font-semibold text-[#a17b4b]">AI Event Brief Generator</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-[1.18] text-[#1d1b1a] md:text-6xl">
            把零散活動想法，整理成清楚的企劃 Brief
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-9 text-[#74675d]">
            協助婚禮、品牌活動與企劃服務，將客戶零散的想法整理成活動摘要、需求重點、預算方向與下一步確認事項，讓溝通與報價更有效率。
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <a
              href="#brief-tool"
              className="inline-flex items-center justify-center rounded-full bg-[#1f1b17] px-7 py-3.5 text-sm font-semibold text-white shadow-[0_18px_36px_rgba(31,27,23,0.2)] transition hover:bg-[#332b24]"
            >
              開始整理活動需求
            </a>
            <a
              href="#outcomes"
              className="inline-flex items-center justify-center rounded-full border border-[#ddcfbe] bg-white/70 px-7 py-3.5 text-sm font-semibold text-[#4a3f35] backdrop-blur transition hover:bg-white"
            >
              查看整理內容
            </a>
          </div>
        </div>

        <div className="card-shadow rounded-lg border border-white/76 bg-white/72 p-4 backdrop-blur-xl md:p-6">
          <div className="rounded-lg border border-[#eadccc] bg-[#fffaf4]/88 p-4">
            <div className="flex items-center justify-between border-b border-[#ecdfd1] pb-4">
              <div>
                <p className="text-xs font-semibold text-[#a17b4b]">活動 Brief 預覽</p>
                <p className="mt-1 text-lg font-semibold text-[#1d1b1a]">企劃方向整理中</p>
              </div>
              <div className="rounded-full bg-[#1f1b17] px-3 py-1 text-xs font-semibold text-white">
                Demo
              </div>
            </div>

            <div className="space-y-4 pt-5">
              <div className="rounded-lg bg-white/88 p-4 shadow-sm">
                <p className="text-xs font-semibold text-[#a17b4b]">活動摘要</p>
                <p className="mt-2 text-sm leading-6 text-[#786b60]">
                  將活動類型、日期、人數、預算與補充想法整理成可討論的企劃方向。
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {["服務項目", "風格方向", "預算判斷", "下一步建議"].map((item) => (
                  <div key={item} className="rounded-lg border border-[#eadfd2] bg-white/86 px-3 py-3">
                    <p className="text-sm font-semibold text-[#4a3f35]">{item}</p>
                  </div>
                ))}
              </div>
              <div className="rounded-lg bg-white/88 p-4 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <p className="text-xs font-semibold text-[#a17b4b]">需求成熟度</p>
                  <p className="text-xs font-semibold text-[#786b60]">方向明確</p>
                </div>
                <div className="h-2 rounded-full bg-[#efe5d9]">
                  <div className="mini-meter h-2 w-2/3 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative mx-auto w-full max-w-7xl px-6 py-18 md:px-10 md:py-24">
        <SectionHeading title="為什麼活動需求需要先整理？" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {painPoints.map((point) => (
            <article
              key={point.title}
              className="card-shadow rounded-lg border border-white/70 bg-white/82 p-6 backdrop-blur"
            >
              <h3 className="text-lg font-semibold text-[#1d1b1a]">{point.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[#786b60]">{point.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section id="brief-tool" className="relative mx-auto w-full max-w-7xl px-6 py-18 md:px-10 md:py-24">
        <SectionHeading
          eyebrow="Interactive Demo"
          title="建立活動 Brief"
          description="填寫活動基本資訊與補充需求，系統會用前端規則模擬 AI，整理出活動企劃 Brief。"
        />

        <div className="mb-5 rounded-lg border border-[#ead8c4] bg-white/82 p-5 shadow-[0_16px_42px_rgba(106,80,52,0.09)] backdrop-blur">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-semibold text-[#a17b4b]">Demo Mode</p>
              <p className="mt-2 text-sm leading-7 text-[#5e5248]">
                Demo 版本會根據輸入內容進行初步整理，未來可串接 AI API，提供更完整的需求分析。
              </p>
            </div>
            <div className="rounded-full border border-[#e8dccd] bg-[#fff9f1] px-4 py-2 text-xs font-semibold text-[#a17b4b]">
              前端規則模擬
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[0.98fr_1.02fr]">
          <div className="card-shadow rounded-lg border border-white/70 bg-white/88 p-5 backdrop-blur md:p-6">
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-semibold text-[#a17b4b]">Event Brief Builder</p>
                <h2 className="mt-2 text-2xl font-semibold text-[#1d1b1a]">活動需求輸入區</h2>
              </div>
              <div className="rounded-full bg-[#f6eee4] px-3 py-1 text-xs font-semibold text-[#7a6653]">
                活動企劃 Demo
              </div>
            </div>

            <div className="space-y-4">
              <FormSection title="基本資料" description="先記錄來源與聯絡資訊，方便後續補問與報價追蹤。">
                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="客戶名稱"
                    value={eventForm.clientName}
                    onChange={(value) => updateForm("clientName", value)}
                    placeholder="例如：王小姐 / 某某品牌"
                  />
                  <TextField
                    label="填寫日期"
                    type="date"
                    value={eventForm.fillDate}
                    onChange={(value) => updateForm("fillDate", value)}
                  />
                  <SelectField
                    label="客戶來源"
                    value={eventForm.source}
                    options={sourceOptions}
                    onChange={(value) => updateForm("source", value)}
                    placeholder="選擇來源"
                  />
                  <TextField
                    label="聯絡方式"
                    value={eventForm.contact}
                    onChange={(value) => updateForm("contact", value)}
                    placeholder="例如：LINE ID / Email / 電話"
                  />
                </div>
              </FormSection>

              <FormSection title="活動資訊" description="把活動規模、目的與預算先收斂成可討論的初步範圍。">
                <div className="grid gap-4 sm:grid-cols-2">
                  <SelectField
                    label="活動類型"
                    value={eventForm.eventType}
                    options={eventTypeOptions}
                    onChange={(value) => updateForm("eventType", value)}
                    placeholder="選擇活動類型"
                  />
                  <TextField
                    label="活動日期"
                    type="date"
                    value={eventForm.eventDate}
                    onChange={(value) => updateForm("eventDate", value)}
                  />
                  <TextField
                    label="活動地點"
                    value={eventForm.location}
                    onChange={(value) => updateForm("location", value)}
                    placeholder="例如：台北 / 飯店宴會廳 / 戶外場地"
                  />
                  <TextField
                    label="預估人數"
                    value={eventForm.guestCount}
                    onChange={(value) => updateForm("guestCount", value)}
                    placeholder="例如：約 80 人"
                  />
                  <SelectField
                    label="預算區間"
                    value={eventForm.budget}
                    options={budgetOptions}
                    onChange={(value) => updateForm("budget", value)}
                  />
                  <TextField
                    label="活動目的"
                    value={eventForm.purpose}
                    onChange={(value) => updateForm("purpose", value)}
                    placeholder="例如：婚禮儀式 / 新品曝光 / 員工交流"
                  />
                  <div className="sm:col-span-2">
                    <div>
                      <p className="text-sm font-semibold text-[#4e453e]">風格偏好</p>
                      <div className="mt-2 grid gap-3 sm:grid-cols-2">
                        {styleOptions.map((style) => {
                          const isSelected = eventForm.stylePreferences.includes(style);

                          return (
                            <label
                              key={style}
                              className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-semibold transition ${
                                isSelected
                                  ? "border-[#b98f5d] bg-[#fff7ed] text-[#3c3128] shadow-[0_10px_26px_rgba(122,91,55,0.1)]"
                                  : "border-[#e3d7c9] bg-white/80 text-[#4e453e] hover:border-[#c4a57a] hover:bg-white"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleStyle(style)}
                                className="h-4 w-4 accent-[#a17b4b]"
                              />
                              <span>{style}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              </FormSection>

              <FormSection title="服務項目" description="可複選目前可能需要的服務，系統會用這些項目判斷範圍與下一步。">
                <div className="grid gap-3 sm:grid-cols-2">
                  {serviceOptions.map((service) => (
                    <label
                      key={service}
                      className="flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border border-[#e3d7c9] bg-white/80 px-4 py-3 text-sm font-semibold text-[#4e453e] transition hover:border-[#c4a57a] hover:bg-white"
                    >
                      <input
                        type="checkbox"
                        checked={eventForm.services.includes(service)}
                        onChange={() => toggleService(service)}
                        className="h-4 w-4 accent-[#a17b4b]"
                      />
                      <span>{service}</span>
                    </label>
                  ))}
                </div>
              </FormSection>

              <FormSection title="補充活動需求" description="貼上客戶原話，或先點選範例快速測試不同活動 Brief 結果。">
                <label htmlFor="event-details" className="sr-only">
                  補充活動需求
                </label>
                <textarea
                  ref={inputRef}
                  id="event-details"
                  value={details}
                  onChange={(event) => setDetails(event.target.value)}
                  placeholder="例如：我們想辦一場約 80 人的婚禮，希望整體是浪漫典雅的感覺，目前已有場地，但還不確定需要哪些佈置和流程規劃，希望能先整理出企劃方向與報價範圍……"
                  className="min-h-52 w-full resize-none rounded-lg border border-[#e3d7c9] bg-[#fffdf9] px-4 py-4 text-base leading-8 text-[#211f1d] outline-none transition placeholder:text-[#aa9b8e] focus:border-[#b98f5d] focus:bg-white focus:ring-4 focus:ring-[#b98f5d]/12"
                />

                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {examples.map((example) => (
                    <button
                      key={example.label}
                      type="button"
                      onClick={() => handleExampleClick(example)}
                      className="rounded-lg border border-[#e3d7c9] bg-white px-4 py-3 text-left text-sm font-semibold text-[#4a3f35] transition hover:border-[#c4a57a] hover:bg-[#fff9f1]"
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
              className="mt-5 w-full rounded-lg bg-[#1f1b17] px-6 py-4 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(31,27,23,0.16)] transition hover:bg-[#332b24]"
            >
              開始整理活動需求
            </button>
          </div>

          <div className="card-shadow rounded-lg border border-white/12 bg-[#1f1b17] p-5 text-white shadow-[0_30px_80px_rgba(31,27,23,0.24)] md:p-6">
            <div className="mb-5 flex flex-col gap-3 border-b border-white/12 pb-5 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-[#e6c894]">活動 Brief 結果</p>
                <h2 className="mt-2 text-2xl font-semibold">初步活動企劃 Brief</h2>
              </div>
              <div className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold text-white/82">
                {result.eventType}
              </div>
            </div>

            <div className="grid gap-4">
              <article className="rounded-lg border border-[#e6c894]/20 bg-[#e6c894]/10 p-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-[#e6c894]">活動 Brief 概覽</p>
                  <p className="text-xs font-semibold text-white/50">Event snapshot</p>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <OverviewItem label="客戶名稱" value={eventForm.clientName} />
                  <OverviewItem label="活動類型" value={eventForm.eventType} />
                  <OverviewItem label="活動日期" value={eventForm.eventDate} />
                  <OverviewItem label="活動地點" value={eventForm.location} />
                  <OverviewItem label="預估人數" value={eventForm.guestCount} />
                  <OverviewItem label="預算區間" value={eventForm.budget} />
                  <OverviewItem label="風格偏好" value={getSelectedStylesLabel(eventForm.stylePreferences)} />
                  <OverviewItem label="服務項目" value={getSelectedServicesLabel(eventForm.services)} />
                </div>
              </article>

              <article className="rounded-lg bg-white/[0.075] p-5 ring-1 ring-white/10">
                <p className="text-sm font-semibold text-[#e6c894]">A. 活動需求摘要</p>
                <p className="mt-3 text-base leading-8 text-white/84">{result.summary}</p>
              </article>

              <article className="rounded-lg bg-white/[0.075] p-5 ring-1 ring-white/10">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm font-semibold text-[#e6c894]">B. 活動重點拆解</p>
                  <p className="text-xs font-semibold text-white/56">Planning structure</p>
                </div>
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  <BreakdownGroup title="活動目標" items={result.breakdown.goals} />
                  <BreakdownGroup title="主要需求" items={result.breakdown.mainNeeds} />
                  <BreakdownGroup title="服務項目" items={result.breakdown.services} />
                  <BreakdownGroup title="已選風格" items={result.breakdown.styleDirection} />
                  {result.breakdown.styleSuggestions && result.breakdown.styleSuggestions.length > 0 ? (
                    <BreakdownGroup title="可延伸風格建議" items={result.breakdown.styleSuggestions} />
                  ) : null}
                </div>
              </article>

              <article className="rounded-lg bg-white/[0.075] p-5 ring-1 ring-white/10">
                <p className="text-sm font-semibold text-[#e6c894]">C. 預算與時程判斷</p>
                <p className="mt-3 text-base leading-8 text-white/82">{result.budgetTimelineAssessment}</p>
              </article>

              <article className="rounded-lg bg-white/[0.075] p-5 ring-1 ring-white/10">
                <p className="text-sm font-semibold text-[#e6c894]">D. 建議補問問題</p>
                <ol className="mt-4 list-decimal space-y-3 pl-5">
                  {result.followUpQuestions.map((question) => {
                    const cleanQuestion = cleanQuestionText(question);

                    return (
                      <li key={cleanQuestion} className="pl-2 text-sm leading-7 text-white/84 marker:text-[#e6c894]">
                        <span>{cleanQuestion}</span>
                      </li>
                    );
                  })}
                </ol>
              </article>

              <article className="rounded-lg bg-white/[0.075] p-5 ring-1 ring-white/10">
                <div className="flex items-center justify-between gap-4">
                  <p className="text-sm font-semibold text-[#e6c894]">E. 需求成熟度</p>
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

              <article className="rounded-lg border border-[#d4a373]/24 bg-[#d4a373]/12 p-5">
                <p className="text-sm font-semibold text-[#f2d2a4]">F. 下一步建議</p>
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
            <article key={card.title} className="rounded-lg border border-[#eadfd2] bg-white/82 p-6">
              <h3 className="text-lg font-semibold text-[#1d1b1a]">{card.title}</h3>
              <p className="mt-4 text-sm leading-7 text-[#786b60]">{card.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="relative mx-auto grid w-full max-w-7xl gap-5 px-6 py-18 md:grid-cols-[0.9fr_1.1fr] md:px-10 md:py-24">
        <div className="rounded-lg border border-[#eadfd2] bg-white/78 p-6">
          <p className="text-sm font-semibold text-[#a17b4b]">For Event Teams</p>
          <h2 className="mt-3 text-2xl font-semibold text-[#1d1b1a] md:text-4xl">適合誰使用？</h2>
          <p className="mt-4 text-base leading-8 text-[#786b60]">
            適合需要把客戶想法、場地條件、服務項目與預算時程整理成企劃方向的活動服務團隊。
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {audiences.map((audience) => (
            <div
              key={audience}
              className="rounded-lg border border-[#eadfd2] bg-white/86 px-5 py-5 text-base font-semibold text-[#4a3f35]"
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
            <article key={step} className="rounded-lg border border-[#eadfd2] bg-white/86 p-6">
              <p className="text-sm font-semibold text-[#a17b4b]">Step {index + 1}</p>
              <h3 className="mt-4 text-xl font-semibold text-[#1d1b1a]">{step}</h3>
            </article>
          ))}
        </div>
      </section>

      <footer className="relative border-t border-[#eadfd2] bg-white/58">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-3 px-6 py-10 md:flex-row md:items-end md:justify-between md:px-10">
          <div>
            <p className="text-lg font-semibold text-[#1d1b1a]">cick tools</p>
            <p className="mt-2 text-sm text-[#786b60]">高質感客製商業工具設計</p>
          </div>
          <p className="text-sm text-[#786b60]">Designed &amp; built by cick tools.</p>
        </div>
      </footer>
    </main>
  );
}
