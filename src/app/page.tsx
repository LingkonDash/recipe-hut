import Image from "next/image";
import Link from "next/link";
import { RecipeCard } from "@/components/ui/recipe-card";
import { Recipe } from "@/types/recipe";
import { headers } from "next/headers";
import { HomeAnimations } from "@/components/home-animations";

async function getBaseUrl() {
  const headersList = await headers();
  const host = headersList.get("host");
  const protocol = process.env.NODE_ENV === "development" ? "http" : "https";
  return `${protocol}://${host}`;
}

async function getFeaturedRecipes() {
  try {
    const baseUrl = await getBaseUrl();
    const res = await fetch(`${baseUrl}/api/recipes?sort=rating&limit=4`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return { recipes: [] };
    const data = await res.json();
    return { recipes: data.recipes || [] };
  } catch (error) {
    console.error("Error fetching featured recipes:", error);
    return { recipes: [] };
  }
}

async function getRecipeStats() {
  try {
    const baseUrl = await getBaseUrl();
    const res = await fetch(`${baseUrl}/api/recipes?limit=1`, {
      next: { revalidate: 3600 }
    });
    if (!res.ok) return { total: 0 };
    const data = await res.json();
    return { total: data.total || 0 };
  } catch (error) {
    console.error("Error fetching recipe stats:", error);
    return { total: 0 };
  }
}

export default async function Home() {
  const [{ recipes: featuredRecipes }, { total: totalRecipes }] = await Promise.all([
    getFeaturedRecipes(),
    getRecipeStats()
  ]);

  return (
    <main className="flex min-h-screen flex-col items-center">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes gradient-xy {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient-xy {
          animation: gradient-xy 15s ease infinite;
          background-size: 400% 400%;
        }
      `}} />

      {/* 1. Hero Section */}
      <section className="relative w-full h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-secondary animate-gradient-xy z-0"></div>
        <div className="absolute inset-0 bg-black/40 z-0"></div>
        
        <div className="relative z-10 container max-w-4xl mx-auto px-4 flex flex-col items-center text-center">
          <h1 className="hero-animate text-5xl md:text-7xl font-extrabold text-white mb-6 drop-shadow-lg tracking-tight">
            Discover Your Next <br /> <span className="text-accent drop-shadow-md">Culinary Masterpiece</span>
          </h1>
          <p className="hero-animate text-lg md:text-xl text-zinc-100 mb-10 max-w-2xl drop-shadow-md font-medium">
            Join a thriving community of food lovers. Explore thousands of curated recipes, ask our AI assistant for ideas, and elevate your home cooking experience.
          </p>
          
          <div className="hero-animate flex flex-col sm:flex-row gap-4 w-full max-w-xl">
            <form action="/explore" className="flex-grow flex relative shadow-2xl rounded-full">
              <input 
                type="text" 
                name="search" 
                placeholder="What are you craving today?" 
                className="w-full px-6 py-4 rounded-l-full text-zinc-900 focus:outline-none focus:ring-2 focus:ring-primary border-none"
                required
              />
              <button type="submit" className="bg-primary hover:bg-primary/90 text-white px-8 py-4 rounded-r-full font-bold transition-colors flex items-center gap-2">
                Search
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
              </button>
            </form>
          </div>
          
          <Link href="/explore" className="hero-animate mt-8 text-white font-medium hover:text-accent transition-colors flex items-center gap-2">
            Or browse all recipes
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </Link>
        </div>
        
        {/* Visual Cue */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/80">
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
        </div>
      </section>

      {/* 2. Why Recipe Hut */}
      <section className="gsap-section w-full py-24 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Why Choose Recipe Hut?</h2>
            <p className="text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto">We provide the best tools and community for home chefs to discover, organize, and create incredible meals.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <div className="gsap-stagger-card bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a2 2 0 0 1 2 2c0 1.1-.9 2-2 2s-2-.9-2-2a2 2 0 0 1 2-2Z"/><path d="M12 6v14"/><path d="M5 10a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2"/><path d="M5 10v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">AI Recipe Assistant</h3>
              <p className="text-zinc-600 dark:text-zinc-400">Not sure what to cook? Tell our AI what is in your fridge, and we will generate the perfect recipe for you instantly.</p>
            </div>
            
            <div className="gsap-stagger-card bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-secondary/10 text-secondary rounded-xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Detailed Nutrition</h3>
              <p className="text-zinc-600 dark:text-zinc-400">Track your macros with precision. Every recipe includes comprehensive nutritional charts and breakdown.</p>
            </div>
            
            <div className="gsap-stagger-card bg-white dark:bg-zinc-900 p-8 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 hover:-translate-y-1 transition-transform">
              <div className="w-12 h-12 bg-accent/10 text-accent rounded-xl flex items-center justify-center mb-6">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4 Z"/></svg>
              </div>
              <h3 className="text-xl font-bold mb-3">Easy Uploads</h3>
              <p className="text-zinc-600 dark:text-zinc-400">Share your family secrets with the world. Our recipe builder makes formatting and uploading a breeze.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Browse by Category */}
      <section className="gsap-section w-full py-24 bg-zinc-50 dark:bg-zinc-950 border-y border-zinc-200 dark:border-zinc-900">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-end mb-12 max-w-6xl mx-auto">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Browse by Category</h2>
              <p className="text-zinc-600 dark:text-zinc-400">Find exactly what you are looking for.</p>
            </div>
            <Link href="/explore" className="text-primary font-medium hover:underline hidden sm:block">
              View All Categories
            </Link>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 max-w-6xl mx-auto">
            {[
              { name: "Breakfast", icon: "🍳", bg: "bg-orange-100 dark:bg-orange-950/30" },
              { name: "Vegan", icon: "🥗", bg: "bg-green-100 dark:bg-green-950/30" },
              { name: "Desserts", icon: "🍰", bg: "bg-pink-100 dark:bg-pink-950/30" },
              { name: "Quick Meals", icon: "⏱️", bg: "bg-blue-100 dark:bg-blue-950/30" },
              { name: "Healthy", icon: "🥑", bg: "bg-teal-100 dark:bg-teal-950/30" },
            ].map((cat) => (
              <Link 
                key={cat.name} 
                href={`/explore?category=${cat.name}`}
                className={`gsap-stagger-card flex flex-col items-center justify-center p-6 rounded-2xl ${cat.bg} hover:shadow-md transition-all hover:-translate-y-1 border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800`}
              >
                <span className="text-4xl mb-3">{cat.icon}</span>
                <span className="font-bold text-foreground">{cat.name}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* 4. Featured Recipes */}
      <section className="gsap-section w-full py-24 bg-background">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="flex justify-between items-end mb-12">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Top Rated Recipes</h2>
              <p className="text-zinc-600 dark:text-zinc-400">Hand-picked favorites from our community.</p>
            </div>
            <Link href="/explore?sort=rating" className="text-primary font-medium hover:underline hidden sm:block">
              See more
            </Link>
          </div>
          
          {featuredRecipes.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredRecipes.map((recipe: Recipe) => (
                <div key={recipe._id} className="gsap-stagger-card h-full">
                  <RecipeCard recipe={recipe} />
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-12 text-center border border-zinc-200 dark:border-zinc-800">
              <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="mx-auto text-zinc-400 mb-4"><path d="M12 2v20"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
              <h3 className="text-xl font-bold mb-2">Check back soon!</h3>
              <p className="text-zinc-500 max-w-md mx-auto">We are cooking up something special. Featured recipes will appear here once they are rated by the community.</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. How It Works */}
      <section className="gsap-section w-full py-24 bg-zinc-900 text-white">
        <div className="container mx-auto px-4 max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-zinc-400 max-w-2xl mx-auto">From discovering to dining in three simple steps.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connecting Line */}
            <div className="hidden md:block absolute top-8 left-[16%] right-[16%] h-[2px] bg-zinc-800 z-0"></div>
            
            {[
              { 
                step: "01", 
                title: "Search or Ask AI", 
                desc: "Browse our extensive catalog or tell our AI what ingredients you have.",
                icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2"><path d="m21 21-4.3-4.3"/><circle cx="11" cy="11" r="8"/>
              </svg>
              },
              {       
                step: "02", 
                title: "Pick a Recipe", 
                desc: "Choose the perfect meal based on ratings, nutrition, or prep time.",
                icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="m9 15 2 2 4-4"/>
              </svg>
              },
              { 
                step: "03", 
                title: "Cook & Track", 
                desc: "Follow easy instructions and automatically log the nutritional value.",
                icon: <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2"><path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>
              </svg>
              },
            ].map((s, i) => (
              <div key={i} className="gsap-stagger-card relative z-10 flex flex-col items-center text-center group">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center text-primary mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-white transition-all border-4 border-zinc-900">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{s.icon}</svg>
                </div>
                <div className="text-primary font-bold text-sm mb-2">{s.step}</div>
                <h3 className="text-xl font-bold mb-3">{s.title}</h3>
                <p className="text-zinc-400">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 6. By The Numbers */}
      <section className="gsap-section w-full py-20 bg-primary text-white">
        <div className="container mx-auto px-4 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-extrabold mb-2">
                <span className="gsap-number" data-value={totalRecipes > 0 ? totalRecipes : 500}>0</span>{totalRecipes > 0 ? '' : '+'}
              </div>
              <div className="text-primary-foreground/80 font-medium">Recipes Published</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold mb-2">
                <span className="gsap-number" data-value="25">0</span>+
              </div>
              <div className="text-primary-foreground/80 font-medium">Cuisines</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold mb-2">
                <span className="gsap-number" data-value="12">0</span>
              </div>
              <div className="text-primary-foreground/80 font-medium">Dietary Categories</div>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-extrabold mb-2">
                <span className="gsap-number" data-value="10">0</span>k+
              </div>
              <div className="text-primary-foreground/80 font-medium">Happy Cooks</div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Newsletter */}
      <section className="gsap-section w-full py-24 bg-background">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="bg-zinc-100 dark:bg-zinc-900 rounded-3xl p-8 md:p-16 border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-3xl font-bold mb-4 text-foreground">Never miss a recipe.</h2>
            <p className="text-zinc-600 dark:text-zinc-400 mb-8 max-w-xl mx-auto">Subscribe to our weekly newsletter for the latest recipes, cooking tips, and exclusive features right in your inbox.</p>
            
            <div className="max-w-md mx-auto p-6 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-500">
              Coming soon
            </div>
          </div>
        </div>
      </section>

      {/* 8. FAQ */}
      <section className="gsap-section w-full py-24 bg-zinc-50 dark:bg-zinc-950 border-t border-zinc-200 dark:border-zinc-900">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="text-3xl font-bold text-center mb-12 text-foreground">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {[
              {
                q: "Is Recipe Hut free to use?",
                a: "Yes! Exploring recipes, checking nutrition facts, and reading community reviews are completely free. We do offer a premium tier for advanced AI features in the future."
              },
              {
                q: "Can I upload my own recipes?",
                a: "Absolutely. Once you create an account, you can use our intuitive recipe builder to add your ingredients, steps, and photos to share with the community."
              },
              {
                q: "How does the AI assistant work?",
                a: "Our AI assistant analyzes your available ingredients and dietary preferences to generate a custom recipe. It can also help you modify existing recipes for allergies or scale portions."
              },
              {
                q: "How accurate is the nutritional information?",
                a: "We calculate macros using a standard USDA food database based on the ingredients and quantities provided. While highly accurate, they should be used as estimates."
              },
              {
                q: "Can I save recipes to a personal cookbook?",
                a: "Yes! Registered users can 'favorite' recipes and organize them into custom collections for easy access later."
              }
            ].map((faq, i) => (
              <details key={i} className="gsap-stagger-card group bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                <summary className="flex justify-between items-center font-bold cursor-pointer list-none p-6 text-lg hover:text-primary transition-colors">
                  {faq.q}
                  <span className="transition group-open:rotate-180">
                    <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                  </span>
                </summary>
                <div className="text-zinc-600 dark:text-zinc-400 p-6 pt-0 leading-relaxed">
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </div>
      </section>
      
      <HomeAnimations />
    </main>
  );
}
