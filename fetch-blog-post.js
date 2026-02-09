const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function fetchPost() {
  try {
    const result = await pool.query(
      "SELECT slug, title, content, tags FROM blog_posts WHERE slug = $1 AND status = 'published'",
      ['building-ai-agents-that-actually-work']
    );

    if (result.rows.length > 0) {
      console.log('FOUND POST:');
      console.log('Title:', result.rows[0].title);
      console.log('Content length:', result.rows[0].content?.length || 0);
      console.log('\nFirst 500 chars of content:');
      console.log(result.rows[0].content?.substring(0, 500));
    } else {
      console.log('Post not found in database');
    }

    await pool.end();
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

fetchPost();
