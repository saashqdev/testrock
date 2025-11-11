import { redirect } from "next/navigation";
import { headers } from "next/headers";
import RedirectsUtils from "./RedirectsUtils";

async function findAndRedirect({ request }: { request?: Request }) {
  const redirects: { [key: string]: string } = RedirectsUtils.redirects;
  
  let pathname: string;
  let searchParams: URLSearchParams;
  
  if (request?.url) {
    // If request is provided (API routes), use it
    pathname = new URL(request.url).pathname;
    searchParams = new URL(request.url).searchParams;
  } else {
    // Otherwise, construct from headers (Server Components)
    const heads = await headers();
    const url = heads.get("x-url") || "/";
    const fullUrl = new URL(url, "http://localhost");
    pathname = fullUrl.pathname;
    searchParams = fullUrl.searchParams;
  }
  
  const redirectPath = Object.keys(redirects).find((path) => {
    const regex = new RegExp(`^${path.replace(/\*/g, ".*")}$`);
    return regex.test(pathname);
  });

  if (redirectPath) {
    // eslint-disable-next-line no-console
    console.log("redirects", { pathname, redirectPath });
    const searchString = searchParams.toString();
    throw redirect(redirects[redirectPath] + (searchString ? `?${searchString}` : ""));
  }
}

export default {
  findAndRedirect,
};
