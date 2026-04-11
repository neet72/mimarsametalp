/**
 * Kullanım: node scripts/hash-admin-password.mjs "güçlü-şifre"
 * Çıktıyı .env içinde ADMIN_PASSWORD_HASH olarak kullan.
 */
import bcrypt from "bcryptjs";

const plain = process.argv[2];
if (!plain) {
  console.error('Kullanım: node scripts/hash-admin-password.mjs "şifreniz"');
  process.exit(1);
}

const hash = bcrypt.hashSync(plain, 12);
console.log(hash);
console.log("");
console.log("# Next.js .env (önerilen — $ kaçışı yok):");
console.log(`ADMIN_PASSWORD_HASH_B64=${Buffer.from(hash, "utf8").toString("base64")}`);
