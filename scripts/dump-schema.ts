import { createClient } from "@libsql/client";
import * as fs from "fs";

const TURSO_URL = "libsql://djadwal2-djalle.aws-eu-west-1.turso.io";
const TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzgyNTU1NjIsImlkIjoiMDE5ZGVkNTItMTIwMC03NzMxLTg3YTEtNzI3ODZiMzMzNDUwIiwicmlkIjoiMzZhMDhjYTktYWIzNS00NWY2LTg5YjItNWFiYzQwMWU5ZTI4In0.ReCQJbAVkFkklKA170BwRPf6KHqBNS8KncLM3z4boKGMtW5FOgWUA0SF79lkLaxyBaDOSVMvUOwO4BUIuTOIDg";

async function dump() {
  const client = createClient({ url: TURSO_URL, authToken: TURSO_TOKEN });
  const r = await client.execute("PRAGMA table_info(assignments)");
  fs.writeFileSync("assignments_schema.json", JSON.stringify(r.rows, null, 2));
  client.close();
}
dump();
