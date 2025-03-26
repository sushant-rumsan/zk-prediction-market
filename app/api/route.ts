export const revalidate = 60;

export async function GET() {
  const data = await fetch("https://api.vercel.app/blog");
  const posts = await data.json();

  return Response.json(posts);
}

export async function POST(request: Request) {
  const res = await request.json();
  return Response.json({ res });
}
