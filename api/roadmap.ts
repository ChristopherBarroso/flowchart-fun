import { VercelRequest, VercelResponse } from "@vercel/node";

import { getAreasOfResearchHtml } from "./_lib/_notion";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const areasOfResearch = await getAreasOfResearchHtml();
  res.setHeader("Cache-Control", "s-maxage=1, stale-while-revalidate");
  res.status(200).json({ areasOfResearch });
}
