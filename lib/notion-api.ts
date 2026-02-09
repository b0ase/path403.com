import { Client } from '@notionhq/client';
import { portfolioData } from './data';
import { createAdminClient } from './supabase/admin';

// Database and page IDs (extracted from URLs)
const PROJECTS_DATABASE_ID = '21d9c67aff39807495b8ded2256eb792';
const PROJECTS_PAGE_ID = '21d9c67aff39802bab23c588e9646bc2';

export interface NotionProject {
  id: string;
  title: string;
  status: string;
  client: string;
  description: string;
  budget: string;
  deadline?: string;
  url?: string;
}

export class NotionAPI {
  // Get the OAuth access token from database
  static async getAccessToken(): Promise<string | null> {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('notion_tokens')
        .select('access_token')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error || !data) {
        console.error('No Notion token found:', error);
        return null;
      }

      return data.access_token;
    } catch (error) {
      console.error('Error getting access token:', error);
      return null;
    }
  }

  // Create Notion client with OAuth token
  static async createClient(): Promise<Client | null> {
    const accessToken = await this.getAccessToken();
    if (!accessToken) {
      throw new Error('No Notion access token available. Please authorize the integration first.');
    }

    return new Client({
      auth: accessToken,
    });
  }

  // Test the connection
  static async testConnection(): Promise<boolean> {
    try {
      const notion = await this.createClient();
      if (!notion) return false;
      
      await notion.users.me({});
      return true;
    } catch (error) {
      console.error('Notion connection failed:', error);
      return false;
    }
  }

  // Query projects from Notion database
  static async getProjects(): Promise<NotionProject[]> {
    try {
      const notion = await this.createClient();
      if (!notion) return [];

      const response = await notion.databases.query({
        database_id: PROJECTS_DATABASE_ID,
      });

      return response.results.map((page: any) => ({
        id: page.id,
        title: page.properties.Name?.title[0]?.plain_text || 'Untitled',
        status: page.properties.Status?.select?.name || 'Unknown',
        client: page.properties.Client?.rich_text[0]?.plain_text || 'No client',
        description: page.properties.Description?.rich_text[0]?.plain_text || 'No description',
        budget: page.properties.Budget?.rich_text[0]?.plain_text || 'No budget',
        deadline: page.properties.Deadline?.date?.start,
        url: page.properties.URL?.url,
      }));
    } catch (error) {
      console.error('Failed to get projects:', error);
      return [];
    }
  }

  // Create a project page in Notion
  static async createProject(project: {
    title: string;
    description: string;
    client?: string;
    budget?: string;
    status?: string;
    url?: string;
  }): Promise<boolean> {
    try {
      const notion = await this.createClient();
      if (!notion) return false;

      await notion.pages.create({
        parent: { database_id: PROJECTS_DATABASE_ID },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: project.title,
                },
              },
            ],
          },
          Description: {
            rich_text: [
              {
                text: {
                  content: project.description,
                },
              },
            ],
          },
          Client: {
            rich_text: [
              {
                text: {
                  content: project.client || 'b0ase.com',
                },
              },
            ],
          },
          Status: {
            select: {
              name: project.status || 'Active',
            },
          },
          Budget: {
            rich_text: [
              {
                text: {
                  content: project.budget || 'TBD',
                },
              },
            ],
          },
          ...(project.url && {
            URL: {
              url: project.url,
            },
          }),
        },
      });

      return true;
    } catch (error) {
      console.error('Failed to create project:', error);
      return false;
    }
  }

  // Create a showcase page
  static async createShowcasePage(project: {
    title: string;
    description: string;
    tech: string[];
    url?: string;
  }): Promise<boolean> {
    try {
      const notion = await this.createClient();
      if (!notion) return false;

      const blocks: any[] = [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: project.description,
                },
              },
            ],
          },
        },
      ];

      if (project.tech.length > 0) {
        blocks.push({
          object: 'block',
          type: 'heading_3',
          heading_3: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'Technologies Used',
                },
              },
            ],
          },
        });

        project.tech.forEach((tech) => {
          blocks.push({
            object: 'block',
            type: 'bulleted_list_item',
            bulleted_list_item: {
              rich_text: [
                {
                  type: 'text',
                  text: {
                    content: tech,
                  },
                },
              ],
            },
          });
        });
      }

      if (project.url) {
        blocks.push({
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: 'Live URL: ',
                },
              },
              {
                type: 'text',
                text: {
                  content: project.url,
                  link: {
                    url: project.url,
                  },
                },
              },
            ],
          },
        });
      }

      await notion.pages.create({
        parent: { page_id: PROJECTS_PAGE_ID },
        properties: {
          title: {
            title: [
              {
                text: {
                  content: project.title,
                },
              },
            ],
          },
        },
        children: blocks,
      });

      return true;
    } catch (error) {
      console.error('Failed to create showcase page:', error);
      return false;
    }
  }

  // Sync local project data to Notion
  static async syncProjectsToNotion(): Promise<void> {
    try {
      console.log('Syncing projects to Notion...');
      
      for (const project of portfolioData.projects) {
        await this.createShowcasePage({
          title: project.title,
          description: project.description,
          tech: project.tech || [],
          url: project.liveUrl || project.githubUrl
        });
        
        console.log(`Synced: ${project.title}`);
        
        // Add delay to avoid rate limits
        await new Promise<void>(resolve => setTimeout(resolve, 300));
      }
      
      console.log('Sync completed!');
    } catch (error) {
      console.error('Failed to sync projects:', error);
    }
  }
} 