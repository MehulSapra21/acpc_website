import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    const { data: lastPotd, error: fetchError } = await supabase
      .from("leetcode_potd")
      .select("question_id")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(); 

    if (fetchError) throw new Error(`Fetch error: ${fetchError.message}`);

    let nextId = 100; 
    if (lastPotd && lastPotd.question_id) {
      nextId = lastPotd.question_id + 1;
    }

    // Pass standard browser headers to bypass LeetCode's bot protection
    const response = await fetch("https://leetcode.com/api/problems/algorithms/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept-Language": "en-US,en;q=0.9",
        "Accept": "application/json"
      },
      cache: "no-store" // Prevent Vercel from caching failures
    });

    if (!response.ok) throw new Error(`Failed to reach LeetCode servers. Status: ${response.status}`);
    
    const leetcodeData = await response.json();
    
    let question = null;
    while (!question && nextId < 4000) {
      question = leetcodeData.stat_status_pairs.find((q: any) => q.stat.frontend_question_id === nextId);
      if (!question) nextId++; 
    }

    if (!question) throw new Error("No more valid questions found on LeetCode.");

    const title = question.stat.question__title;
    const slug = question.stat.question__title_slug;
    const url = `https://leetcode.com/problems/${slug}/`;
    
    const difficultyMap: Record<number, string> = { 1: "Easy", 2: "Medium", 3: "Hard" };
    const difficulty = difficultyMap[question.difficulty.level] || "Unknown";
    const today = new Date().toISOString().split('T')[0];

    const { error: insertError } = await supabase
      .from("leetcode_potd")
      .insert([{
         question_id: nextId,
         problem_title: title,
         problem_url: url,
         difficulty: difficulty,
         date_posted: today
      }]);

    if (insertError) throw new Error(`Insert error: ${insertError.message}`);

    return NextResponse.json({ success: true, generated: `Question #${nextId} - ${title}` });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Failed to generate POTD" }, { status: 500 });
  }
}