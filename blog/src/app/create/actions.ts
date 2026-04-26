"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { GoogleGenAI } from "@google/genai";

export async function createPost(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  const title = formData.get("title") as string;
  const body = formData.get("body") as string;
  const image_url = formData.get("image_url") as string;

  let summary = "";

  if (process.env.GOOGLE_AI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_AI_API_KEY });
      const prompt = `Write a concise summary of the following blog post in around 50 words. Title: ${title}\n\nContent: ${body}`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
      });
      summary = response.text || "Summary generation failed.";
    } catch (e) {
      console.error("AI Summary generation failed", e);
      summary = "Summary generation failed due to an error.";
    }
  } else {
    summary = "No API key provided for summary generation.";
  }

  const { error } = await supabase.from("posts").insert({
    title,
    body,
    image_url,
    author_id: user.id,
    summary,
  });

  if (error) {
    console.error("Error inserting post", error);
    redirect("/create?error=Failed to create post");
  }

  revalidatePath("/");
  redirect("/");
}
