import { activeDataSource } from "@/config/env";
import { createMockAppRepository } from "./mock-app-repository";
import { createSupabaseAppRepository } from "./supabase-app-repository";
import type { AppRepository } from "./types";

let repository: AppRepository | null = null;

export function getAppRepository() {
  if (repository) return repository;

  repository = activeDataSource === "supabase"
    ? createSupabaseAppRepository()
    : createMockAppRepository();

  return repository;
}

export { activeDataSource };
export type { AppRepository } from "./types";
