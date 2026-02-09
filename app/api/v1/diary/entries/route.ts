import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

interface ActionItem {
  id: string;
  diary_entry_id: string;
  user_id: string;
  created_at: string;
  text: string;
  is_completed: boolean;
  sent_to_wip_at: string | null;
  wip_task_id: string | null;
}

interface DiaryEntry {
  id: string;
  user_id: string;
  created_at: string;
  entry_timestamp: string;
  title: string;
  summary: string;
  diary_action_items: ActionItem[];
}

export async function POST(request: Request) {
  const supabase = await createClient();
  let newDiaryEntryData: DiaryEntry | null = null;

  try {
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json({ error: 'Failed to get session', details: sessionError.message }, { status: 500 });
    }

    if (!session) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    const userId = session.user.id;

    const { title, summary, action_items: actionItemTexts } = await request.json();

    if (!title || title.trim() === '') {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }
    if (!summary || summary.trim() === '') {
      return NextResponse.json({ error: 'Summary is required' }, { status: 400 });
    }

    // 1. Insert the diary entry
    const { data: diaryEntryData, error: diaryEntryError } = await supabase
      .from('diary_entries')
      .insert({
        title: title.trim(),
        summary: summary.trim(),
        user_id: userId,
        entry_timestamp: new Date().toISOString(),
      })
      .select()
      .single();

    if (diaryEntryError) {
      console.error('Error inserting diary entry:', diaryEntryError);
      throw new Error(`Failed to insert diary entry: ${diaryEntryError.message}`);
    }
    if (!diaryEntryData) {
      throw new Error('No data returned after inserting diary entry.');
    }
    
    // Prepare the response structure early, assign action items later if any
    newDiaryEntryData = {
        id: diaryEntryData.id,
        user_id: diaryEntryData.user_id,
        created_at: diaryEntryData.created_at,
        entry_timestamp: diaryEntryData.entry_timestamp,
        title: diaryEntryData.title,
        summary: diaryEntryData.summary,
        diary_action_items: [], // Initialize as empty
    };


    // 2. Insert action items if provided
    let createdActionItems: ActionItem[] = [];
    if (actionItemTexts && Array.isArray(actionItemTexts) && actionItemTexts.length > 0) {
      const validActionItems = actionItemTexts
        .map((text: unknown) => (typeof text === 'string' ? text.trim() : ''))
        .filter(text => text !== '');

      if (validActionItems.length > 0) {
        const actionItemsToInsert = validActionItems.map(text => ({
          diary_entry_id: diaryEntryData.id,
          user_id: userId,
          text: text,
          is_completed: false,
          sent_to_wip_at: null,
          wip_task_id: null,
        }));

        const { data: insertedActionItemsData, error: actionItemsError } = await supabase
          .from('diary_action_items')
          .insert(actionItemsToInsert)
          .select();

        if (actionItemsError) {
          console.error('Error inserting action items. Diary entry was created but action items failed:', actionItemsError);
          // Decide on rollback strategy or partial success response
          // For now, we'll throw, which means the diary entry might be orphaned if this step fails.
          // A more robust solution might involve a transaction or a cleanup step.
          throw new Error(`Failed to insert action items: ${actionItemsError.message}. Main entry ID: ${diaryEntryData.id}`);
        }
        createdActionItems = insertedActionItemsData || [];
        if (newDiaryEntryData) { // Check if newDiaryEntryData is not null
            newDiaryEntryData.diary_action_items = createdActionItems;
        }
      }
    }
    
    if (!newDiaryEntryData) {
        // This case should ideally not be reached if diaryEntryData was successfully processed
        // but it's a fallback.
        throw new Error("Diary entry data was not properly formed after processing action items.");
    }

    return NextResponse.json(newDiaryEntryData, { status: 201 });

  } catch (error: any) {
    console.error('Error in POST /api/v1/diary/entries:', error);
    // If an error occurred after the main entry was created but before action items,
    // newDiaryEntryData might hold the main entry data.
    // Consider if you want to return this or just a generic error.
    let errorMessage = 'Failed to create diary entry';
    if (error instanceof Error) {
        errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage, details: error.toString() }, { status: 500 });
  }
} 