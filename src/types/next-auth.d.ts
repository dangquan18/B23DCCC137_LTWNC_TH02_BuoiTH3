import type { DefaultSession } from "next-auth";
import type { UserRole } from "@/lib/permissions";

declare module "next-auth" {
  /** Session trả về từ auth(), useSession(), getSession(). */
  interface Session {
    user: {
      id: string;
      role: UserRole;
    } & DefaultSession["user"];
  }

  /** Đối tượng user trả về từ authorize() / profile() của provider. */
  interface User {
    role: UserRole;
  }
}

// next-auth/jwt chỉ re-export từ @auth/core/jwt → phải mở rộng module gốc.
declare module "@auth/core/jwt" {
  interface JWT {
    id: string;
    role: UserRole;
  }
}
