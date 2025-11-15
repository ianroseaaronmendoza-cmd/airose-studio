import axios from "axios";
import { API_BASE } from "@/lib/config";

const API = `${API_BASE}/api/blogs`;

export interface Blog {
  id: number;
  title: string;
  slug: string;
  content?: string;
  coverImage?: string;
  createdAt?: string;
  updatedAt?: string;
}

export async function getAllBlogs() {
  const res = await axios.get(API);
  return res.data;
}

export async function getBlog(slug: string) {
  const res = await axios.get(`${API}/${slug}`);
  return res.data;
}

export async function createBlog(data: any) {
  const res = await axios.post(API, data);
  return res.data;
}

export async function updateBlog(slug: string, data: any) {
  const res = await axios.put(`${API}/${slug}`, data);
  return res.data;
}

export async function deleteBlog(slug: string) {
  const res = await axios.delete(`${API}/${slug}`);
  return res.data;
}
