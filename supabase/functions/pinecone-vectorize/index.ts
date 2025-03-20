
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { routeRequest } from "./router.ts";

serve(async (req: Request) => {
  return await routeRequest(req);
});
