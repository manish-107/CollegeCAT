import { NextResponse } from "next/server";
import pool from "../db";

export async function POST(req: Request) {
  try {
    const { name, email } = await req.json();

    if (!name || !email) {
      return NextResponse.json(
        { error: "name email required" },
        { status: 400 }
      );
    }

    console.log("Recieved : " + name + " " + email);

    return NextResponse.json(
      { msg: `hello ${name} and email ${email}` },
      { status: 200 }
    );
  } catch (error) {
    console.log(error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET() {
  const result = await pool.query("SELECT * FROM users");
  return NextResponse.json({ msg: result.rows }, { status: 200 });
}
