import { redirect } from "next/navigation";
import { HOME_PATH } from "@/lib/auth-routes";

/** El middleware ya envía a /login si no hay sesión; aquí solo se entra al repertorio. */
export default function Home() {
  redirect(HOME_PATH);
}
