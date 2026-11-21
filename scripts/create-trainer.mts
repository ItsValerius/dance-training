// Usage: pnpm create-trainer <username> <password> "<Display Name>"
import { auth } from "../src/lib/auth";

const [username, password, name] = process.argv.slice(2);
if (!username || !password || !name) {
  console.error('Usage: pnpm create-trainer <username> <password> "<Display Name>"');
  process.exit(1);
}
const u = username.toLowerCase();
// no headers = trusted server call, allowed by the admin plugin
await auth.api.createUser({
  body: { name, password, role: "admin", email: `${u}@trainers.invalid`, data: { username: u, displayUsername: u } },
});
console.log(`Trainer "${u}" created.`);
