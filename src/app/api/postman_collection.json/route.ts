import ApiSpecsService from "@/modules/api/services/ApiSpecsService";
import { NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  const apiSpecs = await ApiSpecsService.generateSpecs({ request });

  return Response.json(apiSpecs.postmanCollection, {
    headers: {
      "Content-Type": "application/json",
    },
  });
}
