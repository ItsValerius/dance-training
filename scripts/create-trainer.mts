// Usage: pnpm create-trainer <email> <password> "<Display Name>"
import { auth } from "../src/lib/auth";

const [email, password, name] = process.argv.slice(2);
if (!email?.includes("@") || !password || !name) {
  console.error('Usage: pnpm create-trainer <email> <password> "<Display Name>"');
  process.exit(1);
}
// no headers = trusted server call, allowed by the admin plugin
await auth.api.createUser({ body: { name, password, role: "admin", email: email.trim().toLowerCase() } });
console.log(`Trainer "${email}" created.`);
