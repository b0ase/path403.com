"use client";
import React, { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';

interface EventFormData {
  id?: string;
  title: string;
  description?: string;
  category: string;
  event_date: string | Date;
  user_id?: string;
  legacy_id?: number;
}

interface SupabaseEventData {
  id?: string;
  title: string;
  description?: string;
  category: string;
  event_date: string;
  user_id: string;
  legacy_id?: number;
}

type EventFormProps = {
  date: Date;
  event?: Partial<EventFormData & { id: string }>;
  onSave: (eventData: SupabaseEventData) => void;
  onCancel: () => void;
  categories: { id: string; name: string; color: string }[];
};

export default function EventForm({ date, event, onSave, onCancel, categories }: EventFormProps) {
  const supabase = createClient();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [title, setTitle] = useState(event?.title || '');
  const [description, setDescription] = useState(event?.description || '');
  const [category, setCategory] = useState(event?.category || (categories.length > 0 ? categories[0].id : ''));
  const [isGoogleSyncEnabled, setIsGoogleSyncEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
    };
    getUser();
  }, [supabase]);

  useEffect(() => {
    const hasGoogleAuth = localStorage.getItem('googleAuthSession');
    setIsGoogleConnected(!!hasGoogleAuth);
  }, []);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('You must be logged in to save an event.');
      return;
    }
    setIsLoading(true);
    
    const eventDateForSupabase = new Date(
        date.getFullYear(),
        date.getMonth(),
        date.getDate()
    ).toISOString().split('T')[0];

    const eventDataToSave: SupabaseEventData = {
      title,
      description,
      category,
      event_date: eventDateForSupabase, 
      user_id: currentUser.id,
    };

    if (event && event.id) {
      eventDataToSave.id = event.id;
    }

    if (event && event.legacy_id) {
        eventDataToSave.legacy_id = event.legacy_id;
    }
    
    try {
      const { data: savedData, error } = await supabase
        .from('calendar_events')
        .upsert([eventDataToSave])
        .select()
        .single();

      if (error) {
        console.error('Error saving event to Supabase:', error);
        alert(`Error saving event: ${error.message}`);
      } else if (savedData) {
        console.log('Event saved successfully:', savedData);
        onSave(savedData as SupabaseEventData);
      }
    } catch (err) {
      console.error('Unexpected error during event save:', err);
      alert('An unexpected error occurred while saving the event.');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="event-title" className="block text-sm font-medium text-gray-300 mb-1">
          Event Title
        </label>
        <input
          id="event-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter event title"
          required
        />
      </div>
      
      <div>
        <label htmlFor="event-description" className="block text-sm font-medium text-gray-300 mb-1">
          Description
        </label>
        <textarea
          id="event-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24"
          placeholder="Enter event description"
        />
      </div>
      
      <div>
        <label htmlFor="event-category" className="block text-sm font-medium text-gray-300 mb-1">
          Category
        </label>
        <select
          id="event-category"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="w-full bg-gray-800 border border-gray-700 rounded-md px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          {categories.filter(cat => cat.id !== 'all').map(cat => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>
      
      {isGoogleConnected && (
        <div className="flex items-center">
          <input
            id="google-sync"
            type="checkbox"
            checked={isGoogleSyncEnabled}
            onChange={(e) => setIsGoogleSyncEnabled(e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded"
          />
          <label htmlFor="google-sync" className="ml-2 block text-sm text-gray-300">
            Sync with Google Calendar
          </label>
        </div>
      )}
      
      <div className="flex justify-end space-x-3 pt-3 border-t border-gray-700">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md text-sm"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading || !title}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
        >
          {isLoading ? (
            <>
              <span className="animate-spin mr-2 text-xs">⟳</span>
              Saving...
            </>
          ) : (
            <>Save Event</>
          )}
        </button>
      </div>
    </form>
  );
} 