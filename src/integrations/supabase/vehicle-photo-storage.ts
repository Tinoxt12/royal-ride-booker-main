import { activeDataSource } from "@/repositories";
import { getSupabaseClient } from "./client";

export const VEHICLE_PHOTO_BUCKET = "vehicle-photos";

function sanitizeFileName(name: string) {
  return name.replace(/[^a-zA-Z0-9.-]/g, "-").toLowerCase();
}

export async function uploadVehiclePhoto(file: File) {
  if (activeDataSource === "mock") {
    return URL.createObjectURL(file);
  }

  const supabase = getSupabaseClient();
  const filePath = `vehicles/${Date.now()}-${sanitizeFileName(file.name)}`;

  const { error: uploadError } = await supabase.storage
    .from(VEHICLE_PHOTO_BUCKET)
    .upload(filePath, file, {
      upsert: false,
    });

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from(VEHICLE_PHOTO_BUCKET)
    .getPublicUrl(filePath);

  return data.publicUrl;
}
