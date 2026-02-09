import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, slug, description, logo_url } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Project name required' }, { status: 400 })
    }

    if (!slug || typeof slug !== 'string') {
      return NextResponse.json({ error: 'Project slug required' }, { status: 400 })
    }

    // Check if slug already exists
    const { data: existingProject } = await supabase
      .from('projects')
      .select('id')
      .eq('id', slug)
      .single()

    if (existingProject) {
      return NextResponse.json({ error: 'Project slug already exists' }, { status: 409 })
    }

    // Create project
    const { data: project, error: createError } = await supabase
      .from('projects')
      .insert({
        id: slug,
        name,
        description: description || null,
        logo_url: logo_url || null,
      })
      .select()
      .single()

    if (createError) {
      console.error('Project create error:', createError)
      return NextResponse.json({ error: 'Failed to create project' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      project,
    })
  } catch (error) {
    console.error('Registry projects API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()

    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: projects, error: fetchError } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (fetchError) {
      console.error('Projects fetch error:', fetchError)
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    return NextResponse.json({ projects })
  } catch (error) {
    console.error('Registry projects GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
