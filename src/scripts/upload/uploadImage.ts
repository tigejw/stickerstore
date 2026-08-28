import type { SupabaseClient } from '@supabase/supabase-js';

interface UploadImageInput {
  supabaseClient: SupabaseClient;
  bucket: string;
  path: string;
  buffer: Buffer;
}

export async function uploadImage({
  supabaseClient,
  bucket,
  path,
  buffer,
}: UploadImageInput): Promise<string> {
  const { error: uploadError } = await supabaseClient.storage
    .from(bucket)
    .upload(path, buffer, {
      contentType: 'image/webp',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Failed to upload image to "${path}": ${uploadError.message}`);
  }

  const { data } = supabaseClient.storage.from(bucket).getPublicUrl(path);

  if (!data?.publicUrl) {
    throw new Error(`Failed to get public URL for "${path}"`);
  }

  return data.publicUrl;
}