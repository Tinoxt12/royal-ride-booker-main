import { createSupabaseAppRepository } from "./supabase-app-repository";
import type { AppRepository } from "./types";

let repository: AppRepository | null = null;

export function getAppRepository() {
  if (repository) return repository;

  repository = createSupabaseAppRepository();

  return repository;
}

export type { AppRepository } from "./types";
