import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  price: number;
  image_urls: string[];
  brand: { name: string };
  category: { name: string };
  inventory: { quantity: number };
  specifications: Record<string, string>;
  search_keywords: string[];
  tags: string[];
  popularity: number;
}

function extractKeywords(query: string): string[] {
  const normalized = query.toLowerCase()
    .replace(/i want |i need |looking for |show me |find |give me |recommend |suggest /gi, "")
    .replace(/glasses|specs|spectacles|eyewear/gi, "frames")
    .replace(/sun glasses|shades/gi, "sunglasses")
    .replace(/computer glasses|screen glasses|digital glasses/gi, "blue cut")
    .replace(/contact lens/gi, "contact lenses")
    .replace(/[.,!?]/g, " ");
  
  const words = normalized.split(/\s+/).filter(w => w.length > 2);
  return words;
}

function scoreProduct(product: Product, keywords: string[]): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  const allText = [
    product.name?.toLowerCase() || "",
    product.description?.toLowerCase() || "",
    product.brand?.name?.toLowerCase() || "",
    product.category?.name?.toLowerCase() || "",
    ...(product.search_keywords || []).map(k => k.toLowerCase()),
    ...(product.tags || []).map(t => t.toLowerCase()),
  ].join(" ");
  
  const specs = product.specifications || {};
  
  for (const keyword of keywords) {
    if (allText.includes(keyword)) {
      score += 10;
      if (!reasons.includes("Matches your search terms")) {
        reasons.push("Matches your search terms");
      }
    }
    
    if (product.name?.toLowerCase().includes(keyword)) {
      score += 5;
    }
    if (product.category?.name?.toLowerCase().includes(keyword)) {
      score += 8;
    }
    
    const specValues = Object.values(specs).map(v => String(v).toLowerCase());
    for (const val of specValues) {
      if (val.includes(keyword)) score += 3;
    }
  }
  
  if (product.popularity > 100) {
    score += 5;
    reasons.push("Popular among customers");
  }
  
  if (product.inventory?.quantity > 10) {
    score += 2;
    reasons.push("Available in stock");
  }
  
  return { score, reasons };
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }
  
  try {
    const { query, products } = await req.json();
    
    if (!query || !Array.isArray(products)) {
      return new Response(
        JSON.stringify({ error: "Missing query or products array" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    const keywords = extractKeywords(query);
    const scored = products.map((product: Product) => {
      const { score, reasons } = scoreProduct(product, keywords);
      return { ...product, aiScore: score, reasons };
    });
    
    scored.sort((a, b) => b.aiScore - a.aiScore);
    
    const topResults = scored.filter(p => p.aiScore > 0).slice(0, 8);
    const similarProducts = scored.filter(p => p.aiScore > 0 && p.aiScore < topResults[0]?.aiScore).slice(0, 4);
    
    return new Response(
      JSON.stringify({
        query,
        keywords,
        recommended: topResults,
        similar: similarProducts,
        totalScored: products.length,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
