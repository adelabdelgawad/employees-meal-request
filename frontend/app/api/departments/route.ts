import { NextRequest, NextResponse } from "next/server";

// In-memory store for demonstration
declare global {
  var records: any[];
}
/**
 * GET /api/records?search=...
 * - Lists all records, optionally filtered by `search` param.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search")?.trim().toLowerCase();

    // Filter records by search query (case-insensitive)
    const filtered = global.records.filter((record: any) =>
      record.name.toLowerCase().includes(search)
    );

    return NextResponse.json(filtered, { status: 200 });
  } catch (error) {
    console.error("GET /api/records error:", error);
    return NextResponse.json(
      { error: "Failed to fetch records" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/records
 * - Creates a new record.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const newId = Date.now(); // Use a timestamp as a simple ID for now
    const newRecord = { id: newId, ...body };

    global.records.push(newRecord);

    return NextResponse.json(newRecord, { status: 201 });
  } catch (error) {
    console.error("POST /api/records error:", error);
    return NextResponse.json(
      { error: "Failed to create record" },
      { status: 500 }
    );
  }
}
