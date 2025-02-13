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

    const insertResult = await pool.query(
      `INSERT INTO USERS(uname,email) VALUES($1,$2)`,
      [name, email]
    );

    if (insertResult.rowCount === 0) {
      return NextResponse.json({ error: "Unable to insert" }, { status: 400 });
    }

    return NextResponse.json({ msg: `Inserted successfully` }, { status: 200 });
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
