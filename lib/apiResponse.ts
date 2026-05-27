import { NextResponse } from "next/server";

export function successResponse(data: any = {}, message: string = "success") {
  return NextResponse.json({
    code: 0,
    message,
    data,
  });
}

export function errorResponse(message: string, status: number = 400) {
  return NextResponse.json(
    {
      code: 1,
      message,
      data: null,
    },
    { status }
  );
}
