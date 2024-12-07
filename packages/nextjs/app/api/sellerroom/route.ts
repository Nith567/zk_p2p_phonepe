import { NextRequest } from "next/server";
import prismadb from "~~/lib/db";

export async function POST(req: NextRequest) {
  const { eoa } = await req.json();
  const user = await prismadb.user.findUnique({
    where: {
      eoa: eoa,
    },
    select: {
      isSeller: true,
    },
  });
  const sellerOrBuyer = user?.isSeller;
  const messageData = {
    sellerOrBuyer,
  };

  // return new Response(JSON.stringify(message));
  return new Response(JSON.stringify(messageData));
}
