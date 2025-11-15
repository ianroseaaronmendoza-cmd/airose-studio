import axios from "axios";
import { API_BASE } from "@/lib/config";

const API = `${API_BASE}/api/projects`;

export interface Project {
  id: number;
  title: string;
  slug: string;
  summary?: string;
  content?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getAllProjects(): Promise<Project[]> {
  const res = await axios.get(API);
  return res.data;
}

export async function getProject(slug: string): Promise<Project> {
  const res = await axios.get(`${API}/${encodeURIComponent(slug)}`);
  return res.data;
}

export async function createProject(data: any) {
  const res = await axios.post(API, data);
  return res.data;
}

export async function updateProject(slug: string, data: any) {
  const res = await axios.put(`${API}/${encodeURIComponent(slug)}`, data);
  return res.data;
}

export async function deleteProject(slug: string) {
  const res = await axios.delete(`${API}/${encodeURIComponent(slug)}`);
  return res.data;
}
