import { Nav } from "@/components/nav";

/** Signed-in pages: the nav bar is part of the static shell. Auth pages live outside this group, without it. */
export default function AppLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Nav />
      {children}
    </>
  );
}
