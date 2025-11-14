// src/client/api/projects.ts
import axios from "axios";

const API = "http://localhost:4000/api/projects";  // ✅ absolute URL to backend

/* ---------------------------------------------------------
   TYPES
--------------------------------------------------------- */
export interface Project {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
}

/* ---------------------------------------------------------
   GET ALL PROJECTS
--------------------------------------------------------- */
export async function getAllProjects(): Promise<Project[]> {
  const res = await axios.get(API);
  return res.data;
}

/* ---------------------------------------------------------
   GET ONE PROJECT BY SLUG
--------------------------------------------------------- */
export async function getProject(slug: string): Promise<Project> {
  const res = await axios.get(`${API}/${encodeURIComponent(slug)}`);
  return res.data;
}

/* ---------------------------------------------------------
   CREATE PROJECT
--------------------------------------------------------- */
export async function createProject(data: {
  title: string;
  slug?: string;
  summary?: string;
  content?: string;
}) {
  const res = await axios.post(API, data);
  return res.data;
}

/* ---------------------------------------------------------
   UPDATE PROJECT
--------------------------------------------------------- */
export async function updateProject(
  slug: string,
  data: {
    title?: string;
    summary?: string;
    content?: string;
    newSlug?: string;
  }
) {
  const res = await axios.put(`${API}/${encodeURIComponent(slug)}`, data);
  return res.data;
}

/* ---------------------------------------------------------
   DELETE PROJECT
--------------------------------------------------------- */
export async function deleteProject(slug: string) {
  const res = await axios.delete(`${API}/${encodeURIComponent(slug)}`);
  return res.data;
}