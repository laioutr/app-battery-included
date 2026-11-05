/** Removes html tags from a string. This is very much not to be used with untrusted input. */
export const unhtml = (html: string) => html.replace(/<[^>]*>?/g, '').trim();
