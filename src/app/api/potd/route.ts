import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  try {
    // 1. Safely check for the last posted question without crashing if empty
    const { data: lastPotd, error: fetchError } = await supabase
      .from("leetcode_potd")
      .select("question_id")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(); // FIX: Safely handles 0 rows!

    if (fetchError) throw new Error(`Fetch error: ${fetchError.message}`);

    let nextId = 100; // Start at 100 if table is empty
    if (lastPotd && lastPotd.question_id) {
      nextId = lastPotd.question_id + 1;
    }

    // 2. Fetch the master list of all LeetCode algorithms
    const response = await fetch("https://leetcode.com/api/problems/algorithms/");
    if (!response.ok) throw new Error("Failed to reach LeetCode servers.");
    const leetcodeData = await response.json();
    
    // 3. Find the next valid question
    let question = null;
    while (!question && nextId < 4000) {
      question = leetcodeData.stat_status_pairs.find((q: any) => q.stat.frontend_question_id === nextId);
      if (!question) nextId++; // Skip missing IDs
    }

    if (!question) throw new Error("No more valid questions found on LeetCode.");

    // 4. Extract data
    const title = question.stat.question__title;
    const slug = question.stat.question__title_slug;
    const url = `https://leetcode.com/problems/${slug}/`;
    
    const difficultyMap: Record<number, string> = { 1: "Easy", 2: "Medium", 3: "Hard" };
    const difficulty = difficultyMap[question.difficulty.level] || "Unknown";
    const today = new Date().toISOString().split('T')[0];

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

    if (insertError) throw new Error(`Insert error: ${insertError.message}`);

    return NextResponse.json({ success: true, generated: `Question #${nextId} - ${title}` });

  } catch (error: any) {
    console.error(error);
    // This will now print the EXACT reason it failed to the screen!
    return NextResponse.json({ error: error.message || "Failed to generate POTD" }, { status: 500 });
  }
}