import { createClient } from "@libsql/client";

const TURSO_URL = "libsql://djadwal2-djalle.aws-eu-west-1.turso.io";
const TURSO_TOKEN = "eyJhbGciOiJFZERTQSIsInR5cCI6IkpXVCJ9.eyJhIjoicnciLCJpYXQiOjE3NzgyNTU1NjIsImlkIjoiMDE5ZGVkNTItMTIwMC03NzMxLTg3YTEtNzI3ODZiMzMzNDUwIiwicmlkIjoiMzZhMDhjYTktYWIzNS00NWY2LTg5YjItNWFiYzQwMWU5ZTI4In0.ReCQJbAVkFkklKA170BwRPf6KHqBNS8KncLM3z4boKGMtW5FOgWUA0SF79lkLaxyBaDOSVMvUOwO4BUIuTOIDg";

async function explore() {
  const client = createClient({
    url: TURSO_URL,
    authToken: TURSO_TOKEN,
  });

  console.log("Connecting to Turso...");
  
  try {
    // Get all tables
    const tables = await client.execute("SELECT name FROM sqlite_master WHERE type='table'");
    console.log("Tables found:");
    console.table(tables.rows);

    for (const row of tables.rows) {
      const tableName = row.name as string;
      if (tableName.startsWith("_") || tableName === "sqlite_sequence") continue;
      
      console.log(`\n--- Table: ${tableName} ---`);
      const schema = await client.execute(`PRAGMA table_info(${tableName})`);
      console.table(schema.rows);
      
      const count = await client.execute(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`Count: ${count.rows[0].count}`);
    }
  } catch (error) {
    console.error("Error exploring Turso:", error);
  } finally {
    client.close();
  }
}

explore();
