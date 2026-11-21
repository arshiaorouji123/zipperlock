/**
 * GA4 event helper. Sends nothing unless GA is configured AND the visitor accepted cookies
 * (gtag only exists after consent — see components/Consent.tsx). Never sends images or
 * personal data: only event names and simple ids/labels.
 */
export type EventName =
  | 'editor_opened'
  | 'image_uploaded'
  | 'zipper_style_selected'
  | 'theme_selected'
  | 'design_selected'
  | 'design_preview'
  | 'library_search'
  | 'customization_completed'
  | 'preview_opened'
  | 'image_downloaded'
  | 'project_saved'
  | 'pwa_install_initiated';

export function track(name: EventName, params: Record<string, string | number | boolean> = {}) {
  try {
    const g = (window as unknown as { gtag?: (...a: unknown[]) => void }).gtag;
    if (typeof g === 'function') g('event', name, params);
  } catch {}
}
