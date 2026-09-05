import { router, type Href } from 'expo-router';

/**
 * Goes back if there's history to go back to; otherwise navigates to the
 * given fallback. Needed because a fresh page load / browser refresh starts
 * with empty history (e.g. opening /board/5/tasks/9/edit directly), so
 * router.back() alone has nowhere to go even though the screen has an
 * obvious logical parent.
 */
export function goBackOr(fallbackHref: Href): void {
  if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(fallbackHref);
  }
}
