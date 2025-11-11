import { AccountCreatedDto } from "@/modules/events/dtos/AccountCreatedDto";

export async function POST(request: Request) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const body = (await request.json()) as AccountCreatedDto;
    return Response.json({ message: `Account created: ${body.tenant.name}` }, { status: 200 });
  } catch (e: any) {
    return Response.json({ error: e.message }, { status: 400 });
  }
}
