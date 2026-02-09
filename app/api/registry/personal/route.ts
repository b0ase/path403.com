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
    const {
      full_name,
      username,
      bio,
      website,
      bsv_address,
      eth_address,
      sol_address,
    } = body

    // Validate at least one field is provided
    if (!full_name && !username && !bio && !website && !bsv_address && !eth_address && !sol_address) {
      return NextResponse.json({ error: 'At least one field required' }, { status: 400 })
    }

    // Build update object with only provided fields
    const updateData: Record<string, string> = {}
    if (full_name !== undefined) updateData.full_name = full_name
    if (username !== undefined) updateData.username = username
    if (bio !== undefined) updateData.bio = bio
    if (website !== undefined) updateData.website = website
    if (bsv_address !== undefined) updateData.bsv_address = bsv_address
    if (eth_address !== undefined) updateData.eth_address = eth_address
    if (sol_address !== undefined) updateData.sol_address = sol_address

    // Update profile
    const { data: profile, error: updateError } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id)
      .select()
      .single()

    if (updateError) {
      console.error('Profile update error:', updateError)
      return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      profile,
    })
  } catch (error) {
    console.error('Registry personal API error:', error)
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

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Profile fetch error:', profileError)
      return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 })
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Registry personal GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
