import { supabase } from '@/lib/supabase';

export interface CmsPageItem {
  id: string;
  slug: string;
  title: string;
  content: string;
  metaDescription: string | null;
  published: boolean;
  updatedAt: string;
}

export async function getCmsPages(): Promise<CmsPageItem[]> {
  const { data, error } = await supabase
    .from('cms_pages')
    .select('id, slug, title, content, meta_description, is_published, updated_at')
    .order('slug');
  if (error) throw error;

  return (data ?? []).map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    content: p.content ?? '',
    metaDescription: p.meta_description,
    published: p.is_published ?? false,
    updatedAt: p.updated_at ?? '',
  }));
}

export async function getCmsPageBySlug(slug: string): Promise<CmsPageItem> {
  const { data, error } = await supabase
    .from('cms_pages')
    .select('id, slug, title, content, meta_description, is_published, updated_at')
    .eq('slug', slug)
    .single();
  if (error) throw error;

  return {
    id: data.id,
    slug: data.slug,
    title: data.title,
    content: data.content ?? '',
    metaDescription: data.meta_description,
    published: data.is_published ?? false,
    updatedAt: data.updated_at ?? '',
  };
}

export async function updateCmsPage(
  pageId: string,
  updates: { title: string; content: string; metaDescription: string; published: boolean }
): Promise<void> {
  const { error } = await supabase
    .from('cms_pages')
    .update({
      title: updates.title,
      content: updates.content,
      meta_description: updates.metaDescription,
      is_published: updates.published,
    })
    .eq('id', pageId);
  if (error) throw error;
}
