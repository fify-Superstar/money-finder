import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { hasValidAccessCookie } from "./gate";

/** Independent page-level protection, including requests that bypass middleware. */
export async function requirePaidAccess() {
  const cookieStore = await cookies();
  if (!(await hasValidAccessCookie(cookieStore.toString())))
    redirect("/unlock");
}
