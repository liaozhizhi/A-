export interface StockPick {
  code: string;
  name: string;
  reason: string;
  entry_price: string;
  target_price: string;
  stop_loss: string;
}

export interface DailyReview {
  id?: string;
  date: string;
  sentiment_score: number; // 0 to 100
  summary: string;
  hot_sectors: string[]; // e.g., ["AI", "Semiconductors"]
  volume_analysis: string;
  stock_picks?: StockPick[];
  created_at?: string;
}

export enum Tab {
  TODAY = 'today',
  HISTORY = 'history',
  SETTINGS = 'settings'
}

export enum MarketMood {
  BEARISH = 'bearish',
  NEUTRAL = 'neutral',
  BULLISH = 'bullish',
}