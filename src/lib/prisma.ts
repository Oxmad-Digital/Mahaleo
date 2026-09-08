import { PrismaClient } from "@/generated/prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import { setDefaultAutoSelectFamilyAttemptTimeout } from "node:net";
import ws from "ws";

// Neon's driver tunnels Postgres over a WebSocket on port 443 instead of a raw
// TCP connection on 5432, which some networks filter outbound. Node's built-in
// WebSocket ignores --dns-result-order and stalls wherever IPv6 is unroutable,
// so we hand the driver the `ws` implementation, which goes through net/tls and
// honours it.
neonConfig.webSocketConstructor = ws;

// Node gives each candidate address 250ms to complete its TCP handshake before
// moving on. The handshake to Neon's eu-central-1 region measures 300-410ms from
// Madagascar, so every attempt was being abandoned just short of connecting and
// the pool failed with an opaque AggregateError ETIMEDOUT. Connections from a
// low-latency host are unaffected by the longer ceiling.
setDefaultAutoSelectFamilyAttemptTimeout(5000);

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
