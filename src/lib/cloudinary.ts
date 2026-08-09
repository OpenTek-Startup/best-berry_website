/**
 * Upload d'image vers Cloudinary via un "unsigned upload preset".
 * Voir SETUP.md pour la configuration du compte Cloudinary gratuit.
 */
export async function uploadImageToCloudinary(file: File): Promise<string> {
  const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  const preset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

  if (!cloudName || !preset) {
    throw new Error('Cloudinary non configuré (voir .env et SETUP.md)');
  }

  const form = new FormData();
  form.append('file', file);
  form.append('upload_preset', preset);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: 'POST',
    body: form,
  });

  if (!res.ok) throw new Error('Échec du téléversement de l\'image');
  const data = await res.json();
  return data.secure_url as string;
}

/** Extrait l'ID d'une vidéo YouTube à partir d'une URL complète ou d'un ID brut. */
export function extraireYoutubeId(input: string): string {
  const match = input.match(/(?:youtu\.be\/|v=|embed\/)([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : input.trim();
}
