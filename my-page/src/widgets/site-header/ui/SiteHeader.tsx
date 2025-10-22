"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function SiteHeader() {
  const pathname = usePathname();

  return (
    <header className="fixed">
      <Link href="/" className="cursor-pointer">
        <h1 className="text-4xl font-extralight">Choi Jun Hyeok</h1>
        <h3 className="text-s font-light ml-1">Frontend Developer</h3>
      </Link>
      <aside className="font-light ml-1 mt-12">
        <ul className="flex flex-col w-fit gap-4">
          <li>
            <Link
              href="/about"
              className={`cursor-pointer transition-all ${
                pathname === "/about/" ? "text-blue-500" : "hover:text-blue-500"
              } hover:tracking-[0.2em]`}
            >
              About me
            </Link>
          </li>
          <li>
            <Link
              href="/stacks"
              className={`cursor-pointer transition-all ${
                pathname === "/stacks/" ? "text-blue-500" : "hover:text-blue-500"
              } hover:tracking-[0.2em]`}
            >
              Stacks
            </Link>
          </li>
          <li>
            <Link
              href="/projects"
              className={`cursor-pointer transition-all ${
                pathname === "/projects/" ? "text-blue-500" : "hover:text-blue-500"
              } hover:tracking-[0.2em]`}
            >
              Projects
            </Link>
          </li>
        </ul>
      </aside>
    </header>
  );
}
