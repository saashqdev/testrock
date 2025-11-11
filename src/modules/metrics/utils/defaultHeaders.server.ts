// Next.js compatible headers function
export const serverTimingHeaders = ({ loaderHeaders, parentHeaders }: { loaderHeaders: Headers; parentHeaders: Headers }) => {
  return setServerTimingHeaders(new Headers(), {
    loaderHeaders,
    parentHeaders,
  });
};
export function setServerTimingHeaders(
  headers: Headers,
  args: {
    loaderHeaders: Headers;
    parentHeaders: Headers;
  }
) {
  if (args.loaderHeaders.has("Server-Timing")) {
    headers.set("Server-Timing", args.loaderHeaders.get("Server-Timing")!);
  }
  if (args.parentHeaders.has("Server-Timing")) {
    headers.append("Server-Timing", args.parentHeaders.get("Server-Timing")!);
  }
  return headers;
}
