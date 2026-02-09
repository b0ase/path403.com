"use client";

import React, { useState, FormEvent, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import getSupabaseBrowserClient from '@/lib/supabase/client';
import { User } from '@supabase/supabase-js';
import { FaSpinner, FaPlusCircle, FaExclamationTriangle, FaLock } from 'react-icons/fa';

interface GigFormData {
  title: string;
  description: string;
  category: string;
  sub_category: string;
  skills_required: string; // Comma-separated string for now
  budget_type: 'fixed' | 'hourly' | 'negotiable';
  budget_amount_min: string; // String for input, convert to number on save
  budget_amount_max: string;
  currency: string;
  location_preference: 'remote' | 'on_site' | 'hybrid';
  tags: string; // Comma-separated string
  deadline: string; // Date input
  is_published: boolean;
}

const CreateGigPage = () => {
  const supabase = getSupabaseBrowserClient();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [formData, setFormData] = useState<GigFormData>({
    title: '',
    description: '',
    category: '',
    sub_category: '',
    skills_required: '',
    budget_type: 'negotiable',
    budget_amount_min: '',
    budget_amount_max: '',
    currency: 'USD',
    location_preference: 'remote',
    tags: '',
    deadline: '',
    is_published: false,
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      setLoading(false);
    };
    fetchUser();
  }, [supabase]);

  // Check if user is admin@b0ase.com
  const isAuthorizedUser = user?.email === 'admin@b0ase.com';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const { checked } = e.target as HTMLInputElement;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to create a gig.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMessage(null);

    const skillsArray = formData.skills_required.split(',').map(skill => skill.trim()).filter(skill => skill);
    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);

    const gigToInsert = {
      user_id: user.id,
      title: formData.title,
      description: formData.description,
      category: formData.category || null,
      sub_category: formData.sub_category || null,
      skills_required: skillsArray.length > 0 ? skillsArray : null,
      budget_type: formData.budget_type,
      budget_amount_min: formData.budget_amount_min ? parseFloat(formData.budget_amount_min) : null,
      budget_amount_max: formData.budget_amount_max ? parseFloat(formData.budget_amount_max) : null,
      currency: formData.currency || 'USD',
      status: formData.is_published ? 'open' : 'draft', // Set status based on is_published
      is_published: formData.is_published,
      location_preference: formData.location_preference,
      tags: tagsArray.length > 0 ? tagsArray : null,
      deadline: formData.deadline || null,
    };

    const { data, error: insertError } = await supabase
      .from('gigs')
      .insert(gigToInsert)
      .select()
      .single();

    setLoading(false);
    if (insertError) {
      console.error('Error creating gig:', insertError);
      setError(`Failed to create gig: ${insertError.message}`);
    } else if (data) {
      setSuccessMessage(`Gig "${data.title}" created successfully!`);
      // Optionally reset form or redirect
      // router.push('/gigs'); // Redirect to gigs page
      // Or redirect to the new gig's detail page: router.push(`/gigs/${data.id}`);
      setFormData({
        title: '',
        description: '',
        category: '',
        sub_category: '',
        skills_required: '',
        budget_type: 'negotiable',
        budget_amount_min: '',
        budget_amount_max: '',
        currency: 'USD',
        location_preference: 'remote',
        tags: '',
        deadline: '',
        is_published: false,
      });
      setTimeout(() => setSuccessMessage(null), 4000);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <FaSpinner className="animate-spin text-4xl text-sky-500 mr-3" />
          <span className="text-xl text-gray-400">Loading...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FaLock className="mx-auto text-6xl text-gray-500 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Access Restricted</h1>
          <p className="text-gray-400 mb-6">You need to be logged in to view this content.</p>
          <Link href="/login" className="bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-4 rounded-md transition-colors">
            Log In
          </Link>
        </div>
      </div>
    );
  }

  if (!isAuthorizedUser) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <FaLock className="mx-auto text-6xl text-gray-500 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-400 mb-6">This content is only available to the authorized user.</p>
          <Link href="/auth/gigs" className="bg-sky-600 hover:bg-sky-500 text-white font-medium py-2 px-4 rounded-md transition-colors">
            Go to Gigs Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const inputBaseClass = "mt-1 block w-full rounded-md bg-gray-800 border-gray-700 shadow-sm text-gray-200 placeholder-gray-500 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500 sm:text-sm p-3";
  const labelBaseClass = "block text-sm font-medium text-gray-300 mb-1";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/gigs" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
          <span>←</span> Back to Gigs Hub
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Create Gig</h1>
      <p className="text-gray-400 mb-8">Create new freelance gig opportunities.</p>
      
      <div className="space-y-6">
        <div className="p-6 border border-gray-700 rounded-lg bg-gray-850">
          <h2 className="text-xl font-semibold mb-4 text-sky-400">Gig Creation Overview</h2>
          <p className="text-gray-300 mb-4">
            This page contains personalized gig creation content for admin@b0ase.com.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800 border border-gray-700 p-6 md:p-8 rounded-xl shadow-2xl">
        {error && (
          <div className="bg-red-900 border border-red-700 text-red-100 px-4 py-3 rounded-lg relative mb-4" role="alert">
            <FaExclamationTriangle className="inline-block mr-2" /> {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-700 border border-green-500 text-green-100 px-4 py-3 rounded-lg relative mb-4" role="alert">
            {successMessage}
          </div>
        )}

        <div>
          <label htmlFor="title" className={labelBaseClass}>Gig Title <span className="text-red-500">*</span></label>
          <input type="text" name="title" id="title" value={formData.title} onChange={handleChange} required className={inputBaseClass} placeholder="e.g., I will design a modern logo for your brand" />
        </div>

        <div>
          <label htmlFor="description" className={labelBaseClass}>Description <span className="text-red-500">*</span></label>
          <textarea name="description" id="description" rows={5} value={formData.description} onChange={handleChange} required className={inputBaseClass} placeholder="Provide a detailed description of the service you are offering..."></textarea>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="category" className={labelBaseClass}>Category</label>
            <input type="text" name="category" id="category" value={formData.category} onChange={handleChange} className={inputBaseClass} placeholder="e.g., Design, Development" />
          </div>
          <div>
            <label htmlFor="sub_category" className={labelBaseClass}>Sub-category</label>
            <input type="text" name="sub_category" id="sub_category" value={formData.sub_category} onChange={handleChange} className={inputBaseClass} placeholder="e.g., Logo Design, Web App" />
          </div>
        </div>

        <div>
          <label htmlFor="skills_required" className={labelBaseClass}>Skills Required (comma-separated)</label>
          <input type="text" name="skills_required" id="skills_required" value={formData.skills_required} onChange={handleChange} className={inputBaseClass} placeholder="e.g., Photoshop, React, Copywriting" />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="budget_type" className={labelBaseClass}>Budget Type</label>
            <select name="budget_type" id="budget_type" value={formData.budget_type} onChange={handleChange} className={inputBaseClass}>
              <option value="negotiable">Negotiable</option>
              <option value="fixed">Fixed Price</option>
              <option value="hourly">Hourly Rate</option>
            </select>
          </div>
          <div>
            <label htmlFor="currency" className={labelBaseClass}>Currency</label>
            <input type="text" name="currency" id="currency" value={formData.currency} onChange={handleChange} className={inputBaseClass} placeholder="e.g., USD, EUR" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
           <div>
            <label htmlFor="budget_amount_min" className={labelBaseClass}>Min Budget / Rate (Optional)</label>
            <input type="number" name="budget_amount_min" id="budget_amount_min" value={formData.budget_amount_min} onChange={handleChange} className={inputBaseClass} placeholder="e.g., 50" />
          </div>
          <div>
            <label htmlFor="budget_amount_max" className={labelBaseClass}>Max Budget / Rate (Optional)</label>
            <input type="number" name="budget_amount_max" id="budget_amount_max" value={formData.budget_amount_max} onChange={handleChange} className={inputBaseClass} placeholder="e.g., 200" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label htmlFor="location_preference" className={labelBaseClass}>Location Preference</label>
            <select name="location_preference" id="location_preference" value={formData.location_preference} onChange={handleChange} className={inputBaseClass}>
              <option value="remote">Remote</option>
              <option value="on_site">On-site</option>
              <option value="hybrid">Hybrid</option>
            </select>
          </div>
          <div>
            <label htmlFor="deadline" className={labelBaseClass}>Deadline (Optional)</label>
            <input type="date" name="deadline" id="deadline" value={formData.deadline} onChange={handleChange} className={inputBaseClass} />
          </div>
        </div>

        <div>
          <label htmlFor="tags" className={labelBaseClass}>Tags (comma-separated for discoverability)</label>
          <input type="text" name="tags" id="tags" value={formData.tags} onChange={handleChange} className={inputBaseClass} placeholder="e.g., web design, urgent, startup" />
        </div>

        <div className="flex items-center mt-6">
          <input
            id="is_published"
            name="is_published"
            type="checkbox"
            checked={formData.is_published}
            onChange={handleChange}
            className="h-5 w-5 text-sky-600 bg-gray-700 border-gray-600 rounded focus:ring-sky-500 focus:ring-offset-gray-800"
          />
          <label htmlFor="is_published" className="ml-2 block text-sm text-gray-300">
            Publish this gig immediately? (Others can see it)
          </label>
        </div>

        <div className="mt-8 pt-6 border-t border-gray-700">
          <button 
            type="submit" 
            disabled={loading || !user}
            className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-sky-500 disabled:opacity-50 transition-colors"
          >
            {loading ? <FaSpinner className="animate-spin mr-2" /> : <FaPlusCircle className="mr-2" />}
            {loading ? 'Creating Gig...' : 'Create Gig'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateGigPage; 