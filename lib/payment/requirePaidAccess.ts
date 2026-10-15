import "server-only";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePaidAccess } from "./revalidateAccess";

export async function requirePaidAccess() {
  const cookieStore = await cookies();
  if (!(await revalidatePaidAccess(cookieStore.toString())))
    redirect("/unlock");
}
