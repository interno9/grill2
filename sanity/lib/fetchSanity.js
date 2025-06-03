import { client } from "@/sanity/lib/client";

export default async function Data(query) {
  const res = await client.fetch(query);
  return res;
}
