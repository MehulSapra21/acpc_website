import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 1. Get the last posted question ID to know where we left off
    const { data: lastPotd } = await supabase
      .from("leetcode_potd")
      .select("question_id")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    let nextId = 100; // Default starting point
    if (lastPotd && lastPotd.question_id) {
      nextId = lastPotd.question_id + 1;
    }

    // 2. Fetch the master list of all LeetCode algorithms
    const response = await fetch("https://leetcode.com/api/problems/algorithms/");
    const leetcodeData = await response.json();
    
    // 3. Find the next valid question (skipping any IDs LeetCode might have deleted)
    let question = null;
    while (!question && nextId < 4000) {
      question = leetcodeData.stat_status_pairs.find((q: any) => q.stat.frontend_question_id === nextId);
      if (!question) nextId++; // If missing, increment and check the next one
    }

    if (!question) return NextResponse.json({ error: "No more questions found" }, { status: 404 });

    // 4. Extract data
    const title = question.stat.question__title;
    const slug = question.stat.question__title_slug;
    const url = `https://leetcode.com/problems/${slug}/`;
    
    const difficultyMap: Record<number, string> = { 1: "Easy", 2: "Medium", 3: "Hard" };
    const difficulty = difficultyMap[question.difficulty.level] || "Unknown";
    
    const today = new Date().toISOString().split('T')[0]; // Format: YYYY-MM-DD

    // 5. Save to Supabase
    const { error: insertError } = await supabase
      .from("leetcode_potd")
      .insert([{
         question_id: nextId,
         problem_title: title,
         problem_url: url,
         difficulty: difficulty,
         date_posted: today
      }]);

    if (insertError) throw insertError;

    return NextResponse.json({ success: true, generated: `Question #${nextId} - ${title}` });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to generate POTD" }, { status: 500 });
  }
}