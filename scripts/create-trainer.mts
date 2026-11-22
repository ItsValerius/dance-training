// Usage: pnpm create-trainer <username> <password> "<Display Name>" <email>
import { auth } from "../src/lib/auth";

const [username, password, name, email] = process.argv.slice(2);
if (!username || !password || !name || !email?.includes("@")) {
  console.error('Usage: pnpm create-trainer <username> <password> "<Display Name>" <email>');
  process.exit(1);
}
const u = username.toLowerCase();
// no headers = trusted server call, allowed by the admin plugin
await auth.api.createUser({
  body: { name, password, role: "admin", email: `${u}@trainers.invalid`, data: { username: u, displayUsername: u, contactEmail: email.trim().toLowerCase() } },
});
console.log(`Trainer "${u}" created.`);
