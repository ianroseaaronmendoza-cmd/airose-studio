import { Client } from "@notionhq/client";

// Initialize Notion client
export const notion = new Client({
  auth: process.env.NOTION_API_KEY,
});

// Common Notion utilities
export async function getDatabase(databaseId: string) {
  const response = await notion.databases.retrieve({
    database_id: databaseId,
  });
  return response;
}

export async function getPage(pageId: string) {
  const response = await notion.pages.retrieve({ page_id: pageId });
  return response;
}

export async function createPage(databaseId: string, properties: any) {
  const response = await notion.pages.create({
    parent: { database_id: databaseId },
    properties,
  });
  return response;
}