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

    if (fetchError) throw new Error(`Database error: ${fetchError.message}`);

    let nextId = 100; 
    if (lastPotd && lastPotd.question_id) {
      nextId = lastPotd.question_id + 1;
    }

    let questionsList: any[] = [];

    // Strategy 1: Bypass Cloudflare 403 using a dedicated LeetCode API Proxy
    try {
      const response = await fetch("https://alfa-leetcode-api.onrender.com/problems?limit=5000", { 
        cache: "no-store" 
      });
      if (!response.ok) throw new Error("Primary proxy failed");
      const data = await response.json();
      questionsList = data.problemsetQuestionList;
    } catch (e) {
      
      // Strategy 2: Fallback to an open IP Proxy routing the official API
      const proxyUrl = "https://api.allorigins.win/raw?url=" + encodeURIComponent("https://leetcode.com/api/problems/algorithms/");
      const fallbackRes = await fetch(proxyUrl, { cache: "no-store" });
      if (!fallbackRes.ok) throw new Error("Both primary and fallback proxies were blocked by Cloudflare.");
      
      const data = await fallbackRes.json();
      
      // Map the official structure to match the proxy structure so the rest of the code works
      questionsList = data.stat_status_pairs.map((q: any) => ({
        questionFrontendId: String(q.stat.frontend_question_id),
        title: q.stat.question__title,
        titleSlug: q.stat.question__title_slug,
        difficulty: q.difficulty.level === 1 ? "Easy" : q.difficulty.level === 2 ? "Medium" : "Hard"
      }));
    }

    let question = null;
    while (!question && nextId < 5000) {
      // Find the exact question ID in our extracted list
      question = questionsList.find((q: any) => String(q.questionFrontendId) === String(nextId));
      if (!question) nextId++; // Skip IDs that LeetCode deleted
    }

    if (!question) throw new Error("Question not found.");

    const url = `https://leetcode.com/problems/${question.titleSlug}/`;
    const today = new Date().toISOString().split('T')[0];

    // Save to your Supabase table
    const { error: insertError } = await supabase
      .from("leetcode_potd")
      .insert([{
         question_id: nextId,
         problem_title: question.title,
         problem_url: url,
         difficulty: question.difficulty,
         date_posted: today
      }]);

    if (insertError) throw new Error(`Insert error: ${insertError.message}`);

    return NextResponse.json({ success: true, generated: `Question #${nextId} - ${question.title}` });

  } catch (error: any) {
    console.error(error);
    return NextResponse.json({ error: error.message || "Failed to generate POTD" }, { status: 500 });
  }
}