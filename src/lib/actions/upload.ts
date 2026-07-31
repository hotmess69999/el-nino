"use server";

import { revalidatePath } from "next/cache";
import { requireCurrentUser } from "@/lib/auth/session";
import { createReport } from "@/lib/uploads/service";

export async function createReportAction(formData: FormData) {
  const user = await requireCurrentUser();

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return { ok: false as const, errors: { file: "Choose a video to upload." } };
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  const result = await createReport(
    user.id,
    {
      category: formData.get("category"),
      caption: formData.get("caption"),
      latitude: formData.get("latitude"),
      longitude: formData.get("longitude"),
      locationLabel: formData.get("locationLabel"),
    },
    { buffer, mimeType: file.type },
  );

  if (result.ok) {
    revalidatePath("/feed");
    revalidatePath("/profile");
  }
  return result;
}
