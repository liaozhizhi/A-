import { GoogleGenAI, Type } from "@google/genai";
import { DailyReview } from "./types";

const apiKey = process.env.API_KEY || ''; // Ensure this is set in your environment

// Initialize Gemini Client
// IMPORTANT: Do not create this client if API key is missing to avoid crashes on load, handle gracefully in function.
let ai: GoogleGenAI | null = null;
if (apiKey) {
    ai = new GoogleGenAI({ apiKey: apiKey });
}

export const generateMarketAnalysis = async (marketNotes: string): Promise<DailyReview | null> => {
  if (!ai) {
    console.error("Gemini API Key is missing.");
    return null;
  }

  const today = new Date().toISOString().split('T')[0];

  const prompt = `
    作为一位资深的A股超短线操盘手，请根据以下的市场笔记或新闻摘要（如果没有提供，请基于你截止目前的知识模拟一个典型的震荡市或牛市复盘），
    生成一份${today}的A股复盘报告，并选出5支明天最具爆发力的短线潜力股。
    
    用户提供的市场线索: "${marketNotes}"

    你需要输出JSON格式的数据。
    
    选股逻辑要求：
    1. 题材热点：优先选择当前最热的主线题材。
    2. 资金流向：选择主力资金大幅流入的个股。
    3. 技术形态：突破关键压力位或并在均线多头排列。
    
    请严格按照Schema输出。
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            date: { type: Type.STRING, description: "Today's date YYYY-MM-DD" },
            sentiment_score: { type: Type.INTEGER, description: "Market sentiment score 0-100" },
            summary: { type: Type.STRING, description: "Brief summary of the market today (max 200 chars)" },
            hot_sectors: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Top 3 hot sectors today"
            },
            volume_analysis: { type: Type.STRING, description: "Analysis of trading volume" },
            stock_picks: {
              type: Type.ARRAY,
              description: "5 stock picks for tomorrow",
              items: {
                type: Type.OBJECT,
                properties: {
                  code: { type: Type.STRING, description: "Stock Code (e.g. 600519)" },
                  name: { type: Type.STRING, description: "Stock Name" },
                  reason: { type: Type.STRING, description: "Why this stock was chosen" },
                  entry_price: { type: Type.STRING, description: "Suggested entry price range" },
                  target_price: { type: Type.STRING, description: "Target price" },
                  stop_loss: { type: Type.STRING, description: "Stop loss price" }
                },
                required: ["code", "name", "reason", "entry_price", "target_price", "stop_loss"]
              }
            }
          },
          required: ["date", "sentiment_score", "summary", "hot_sectors", "volume_analysis", "stock_picks"]
        }
      }
    });

    const text = response.text;
    if (!text) return null;
    
    const data = JSON.parse(text) as DailyReview;
    // Ensure the date matches today if the AI generated an old date
    data.date = today; 
    return data;

  } catch (error) {
    console.error("Gemini Generation Error:", error);
    return null;
  }
};