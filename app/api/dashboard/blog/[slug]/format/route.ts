import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';

const execAsync = promisify(exec);

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const supabase = await createClient();

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const filePath = path.join(process.cwd(), 'content', 'blog', `${slug}.md`);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: 'Blog post file not found' },
        { status: 404 }
      );
    }

    const results = {
      spacing: { success: false, message: '' },
      frontmatter: { success: false, message: '' },
    };

    // Run spacing fix script
    try {
      const spacingScript = '/tmp/fix-blog-spacing.sh';
      if (fs.existsSync(spacingScript)) {
        const { stdout, stderr } = await execAsync(`bash ${spacingScript} "${filePath}"`);
        results.spacing.success = true;
        results.spacing.message = stdout || 'Spacing fixed';
      } else {
        results.spacing.message = 'Spacing script not found, creating it...';

        // Create the script inline
        const spacingScriptContent = `#!/bin/bash
FILE="$1"
TMP_FILE="/tmp/blog-fix-temp.md"

awk '
BEGIN { prev_blank = 0; in_frontmatter = 0; fm_count = 0 }
{
  if ($0 == "---") {
    fm_count++
    if (fm_count <= 2) in_frontmatter = (fm_count == 1)
  }

  if (in_frontmatter || fm_count < 2) {
    print
    next
  }

  is_heading = ($0 ~ /^##+ /)
  is_blank = ($0 ~ /^[[:space:]]*$/)

  if (prev_was_heading && !is_blank && !is_heading) {
    print ""
  }

  print

  prev_was_heading = is_heading
  prev_blank = is_blank
}
' "$FILE" > "$TMP_FILE"

mv "$TMP_FILE" "$FILE"
echo "Fixed spacing in $FILE"
`;
        fs.writeFileSync(spacingScript, spacingScriptContent, { mode: 0o755 });
        const { stdout } = await execAsync(`bash ${spacingScript} "${filePath}"`);
        results.spacing.success = true;
        results.spacing.message = stdout || 'Spacing fixed';
      }
    } catch (error: any) {
      results.spacing.message = `Error: ${error.message}`;
    }

    // Run frontmatter fix script
    try {
      const frontmatterScript = '/tmp/fix-frontmatter.sh';
      if (fs.existsSync(frontmatterScript)) {
        const { stdout } = await execAsync(`bash ${frontmatterScript} "${filePath}"`);
        results.frontmatter.success = true;
        results.frontmatter.message = stdout || 'Frontmatter fixed';
      } else {
        results.frontmatter.message = 'Frontmatter script not found (non-critical)';
        results.frontmatter.success = true; // Non-critical
      }
    } catch (error: any) {
      results.frontmatter.message = `Error: ${error.message}`;
    }

    // Update the status to formatted
    await supabase
      .from('blog_post_review_status')
      .upsert({
        slug,
        formatted: true,
        last_checked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'slug'
      });

    const allSuccess = results.spacing.success && results.frontmatter.success;

    return NextResponse.json({
      success: allSuccess,
      results,
      message: allSuccess
        ? 'Blog post formatted successfully'
        : 'Some formatting steps failed',
    });
  } catch (error) {
    console.error('Error in blog post formatting:', error);
    return NextResponse.json(
      { error: 'Failed to format blog post' },
      { status: 500 }
    );
  }
}
