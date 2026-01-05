import { createClient } from '@supabase/supabase-js';
import { DailyReview, StockPick } from './types';

// ------------------------------------------------------------------
// CONFIGURATION: REPLACE THESE VALUES
// ------------------------------------------------------------------
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://your-project-id.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_KEY || 'your-anon-key';
// ------------------------------------------------------------------

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export const saveReview = async (review: DailyReview): Promise<DailyReview | null> => {
  try {
    // 1. Insert Review
    const { data: reviewData, error: reviewError } = await supabase
      .from('daily_reviews')
      .insert({
        date: review.date,
        sentiment_score: review.sentiment_score,
        summary: review.summary,
        hot_sectors: review.hot_sectors,
        volume_analysis: review.volume_analysis
      })
      .select()
      .single();

    if (reviewError) throw reviewError;

    // 2. Insert Stock Picks linked to Review
    if (review.stock_picks && review.stock_picks.length > 0) {
      const picksToInsert = review.stock_picks.map(pick => ({
        review_id: reviewData.id,
        code: pick.code,
        name: pick.name,
        reason: pick.reason,
        entry_price: pick.entry_price,
        target_price: pick.target_price,
        stop_loss: pick.stop_loss
      }));

      const { error: picksError } = await supabase
        .from('stock_picks')
        .insert(picksToInsert);

      if (picksError) throw picksError;
    }

    return { ...reviewData, stock_picks: review.stock_picks };
  } catch (error) {
    console.error('Error saving review:', error);
    return null;
  }
};

export const fetchLatestReview = async (): Promise<DailyReview | null> => {
  try {
    const { data, error } = await supabase
      .from('daily_reviews')
      .select(`
        *,
        stock_picks (*)
      `)
      .order('date', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      console.log('No data found or error:', error.message);
      return null;
    }
    return data;
  } catch (error) {
    console.error('Error fetching latest review:', error);
    return null;
  }
};

export const fetchHistory = async (): Promise<DailyReview[]> => {
  try {
    const { data, error } = await supabase
      .from('daily_reviews')
      .select('*')
      .order('date', { ascending: false })
      .limit(20);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching history:', error);
    return [];
  }
};