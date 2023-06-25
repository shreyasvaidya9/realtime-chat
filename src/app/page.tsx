import { db } from "@/lib/db";
import Button from "@/components/ui/Button";

export default async function Home() {
  await db.set("hello", "hello");

  return (
    <main className="">
      <Button>hello</Button>
    </main>
  );
}
