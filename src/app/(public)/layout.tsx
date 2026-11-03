import { Providers } from "@/components/Providers";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";

/**
 * Layout nhóm (public): trang công khai, render tĩnh (SSG/ISR).
 * Không gọi auth()/cookies() ở đây — nếu gọi, mọi trang con sẽ bị ép thành dynamic.
 */
export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <SiteHeader />
      <main id="noi-dung" className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        {children}
      </main>
      <SiteFooter />
    </Providers>
  );
}
