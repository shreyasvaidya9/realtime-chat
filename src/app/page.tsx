import { db } from "@/lib/db";
import Button from "@/components/ui/Button";

export default async function Home() {
  await db.set("hello", "hello");

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      Realtime Chat
      <Button>hello</Button>
    </main>
  );
}
