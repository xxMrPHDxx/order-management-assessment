/**
 * Database seed entry point.
 *
 * Phase 2 implements the full seed (30+ orders across every status and date
 * range). This placeholder keeps `npm run db:seed` wired up from day one.
 */
async function main() {
  console.log("Seed placeholder: full dataset is implemented in Phase 2.");
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
