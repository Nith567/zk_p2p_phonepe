import { NextRequest, NextResponse } from "next/server";
import prismadb from "~~/lib/db";

export async function GET(req: NextRequest, res: NextResponse) {
  try {
    const users = await prismadb.user.findMany({
      where: {
        isSeller: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        createdAt: true,
        eoa: true,
        name: true,
      },
    });
    return NextResponse.json(users);
    // return users;
  } catch (error) {
    console.error("error", error);
    return new Response("Internal room  Server Error", { status: 500 });
  }
}
