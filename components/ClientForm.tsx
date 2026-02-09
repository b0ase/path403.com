"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";

interface Client {
  id: string;
  name: string;
  email?: string;
  website?: string;
  phone?: string;
  logo_url?: string;
  created_at?: string;
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function ClientForm() {
  const [form, setForm] = useState({ name: "", email: "", website: "", phone: "", logo_url: "" });
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [uploading, setUploading] = useState(false);

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/clients");
    const data = await res.json();
    if (res.ok) setClients(data);
    else setError(data.error || "Failed to fetch clients");
    setLoading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");
    const res = await fetch("/api/clients", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    if (res.ok) {
      setSuccess("Client created!");
      setForm({ name: "", email: "", website: "", phone: "", logo_url: "" });
      fetchClients();
    } else {
      setError(data.error || "Failed to create client");
    }
    setLoading(false);
  }

  return (
    <div className="max-w-lg mx-auto my-8 p-6 bg-gray-900 text-white rounded shadow">
      <h2 className="text-xl font-bold mb-4">Add New Client</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <input
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
          placeholder="Name"
          value={form.name}
          onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
          required
        />
        <input
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
          placeholder="Email"
          type="email"
          value={form.email}
          onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
        />
        <input
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
          placeholder="Website"
          value={form.website}
          onChange={e => setForm(f => ({ ...f, website: e.target.value }))}
        />
        <input
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
          placeholder="Phone"
          value={form.phone}
          onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
        />
        <div className="flex items-center gap-2">
          <input
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded"
            placeholder="Logo URL"
            value={form.logo_url}
            onChange={e => setForm(f => ({ ...f, logo_url: e.target.value }))}
          />
          <label className="bg-blue-700 hover:bg-blue-600 text-white px-3 py-2 rounded cursor-pointer">
            Upload
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={async (e) => {
                if (e.target.files && e.target.files[0]) {
                  setUploading(true);
                  const file = e.target.files[0];
                  const filePath = `logos/${Date.now()}_${file.name}`;
                  const { data, error } = await supabase.storage
                    .from('client-logos')
                    .upload(filePath, file, { upsert: true });
                  if (!error && data) {
                    const { data: urlData } = supabase.storage
                      .from('client-logos')
                      .getPublicUrl(data.path);
                    const publicUrl = urlData.publicUrl;
                    if (publicUrl) {
                      setForm(f => ({ ...f, logo_url: publicUrl }));
                    } else {
                      setError('Failed to get public URL for logo');
                    }
                  } else {
                    setError('Logo upload failed');
                  }
                  setUploading(false);
                }
              }}
            />
          </label>
        </div>
        {form.logo_url && (
          <img src={form.logo_url} alt="Logo preview" className="mt-2 h-12 rounded bg-white object-contain" />
        )}
        <button
          type="submit"
          className="w-full bg-blue-700 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded disabled:opacity-50"
          disabled={loading || !form.name}
        >
          {loading ? "Saving..." : "Add Client"}
        </button>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
        {success && <p className="text-green-400 text-sm mt-2">{success}</p>}
      </form>
      <hr className="my-6 border-gray-700" />
      <h3 className="text-lg font-semibold mb-2">Clients</h3>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="space-y-2">
          {clients.map(client => (
            <li key={client.id} className="bg-gray-800 p-3 rounded flex items-center gap-3">
              {client.logo_url && (
                <img src={client.logo_url} alt="logo" className="w-8 h-8 rounded-full object-cover" />
              )}
              <div>
                <div className="font-bold">{client.name}</div>
                <div className="text-xs text-gray-400">{client.email} {client.phone && `| ${client.phone}`}</div>
                <div className="text-xs text-gray-500">{client.website}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
} 