import { cache } from "react";
import NextAuth, { CredentialsSignin } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { LoginFormSchema } from "@/lib/definitions";
import { MINUTE, clientIpFrom, rateLimit } from "@/lib/rate-limit";

// Hash bcrypt d'un mot de passe aléatoire jeté : comparé quand l'e-mail est
// inconnu, pour que le temps de réponse ne révèle pas quels comptes existent.
const DUMMY_PASSWORD_HASH = "$2b$10$iMzZ0IN/EK5mJgMZXVAV8exf9j1sXV/To04uqlRBrOeUph8iZ.eTi";

const LOGIN_WINDOW_MS = 15 * MINUTE;
const LOGIN_MAX_PER_IP = 30;
const LOGIN_MAX_PER_EMAIL = 10;

export class RateLimitedSignin extends CredentialsSignin {
  code = "rate_limited";
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  session: { strategy: "jwt" },
  pages: { signIn: "/connexion" },
  providers: [
    Credentials({
      credentials: {
        email: {},
        password: {},
      },
      // La limite vit ici et non dans l'action `login` : l'endpoint
      // /api/auth/callback/credentials est appelable directement.
      authorize: async (credentials, request) => {
        const parsed = LoginFormSchema.safeParse(credentials);
        if (!parsed.success) return null;

        const { email, password } = parsed.data;
        const ip = clientIpFrom(request.headers);
        const [ipAllowed, emailAllowed] = await Promise.all([
          rateLimit(`login:ip:${ip}`, LOGIN_MAX_PER_IP, LOGIN_WINDOW_MS),
          rateLimit(`login:email:${email.toLowerCase()}`, LOGIN_MAX_PER_EMAIL, LOGIN_WINDOW_MS),
        ]);
        if (!ipAllowed || !emailAllowed) throw new RateLimitedSignin();

        const user = await prisma.user.findUnique({ where: { email } });
        const isValid = await bcrypt.compare(password, user?.passwordHash ?? DUMMY_PASSWORD_HASH);
        if (!user || !isValid) return null;

        if (user.status !== "ACTIVE") return null;

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          sessionVersion: user.sessionVersion,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.sessionVersion = user.sessionVersion;
        return token;
      }
      if (!token.id) return null;

      // Le jeton dure 30 jours : rôle et statut sont relus à chaque requête pour
      // qu'une révocation admin, une suspension ou un changement de mot de passe
      // (sessionVersion) prenne effet immédiatement. Retourner null déconnecte.
      const current = await prisma.user.findUnique({
        where: { id: token.id },
        select: { role: true, status: true, sessionVersion: true, name: true, email: true },
      });
      if (!current || current.status !== "ACTIVE") return null;
      if (current.sessionVersion !== (token.sessionVersion ?? 0)) return null;

      token.role = current.role;
      token.name = current.name;
      token.email = current.email;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
        session.user.role = token.role ?? "USER";
      }
      return session;
    },
  },
});

/**
 * Session pour les composants serveur, mémorisée le temps d'un rendu : une page
 * et ses slots parallèles (modale admin) ne relisent l'utilisateur qu'une fois.
 */
export const getSession = cache(() => auth());
