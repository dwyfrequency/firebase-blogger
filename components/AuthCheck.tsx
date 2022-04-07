import Link from "next/link";
import { ReactNode, useContext } from "react";
import { UserContext } from "../lib/context";

interface AuthCheckProps {
  children: ReactNode;
  fallback?: JSX.Element;
}
// Component's children only shown to logged-in users
export default function AuthCheck(props: AuthCheckProps) {
  const { username } = useContext(UserContext);

  return username ? (
    <>{props.children}</>
  ) : (
    props.fallback || <Link href="/enter">You must be signed in</Link>
  );
}
