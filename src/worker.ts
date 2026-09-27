export default {
  async fetch(_request: Request, _env: any): Promise<Response> {
    // Fallback if not handled by static assets
    return new Response("Flyr - Not Found", { status: 404 });
  },
};
