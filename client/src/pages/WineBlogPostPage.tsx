import { useParams, Link } from "wouter";
import { ArrowLeft } from "lucide-react";
import SeoHead from "@/components/SeoHead";
import { BLOG_POSTS } from "./WineBlogPage";

export default function WineBlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const post = BLOG_POSTS.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="text-center py-24 px-4">
        <p className="font-display text-3xl mb-4">Article not found</p>
        <Link href="/blog"><a className="text-primary underline">Back to Wine Blog</a></Link>
      </div>
    );
  }

  const PostContent = post.component;

  return (
    <div className="min-h-screen bg-background">
      <SeoHead
        title={`${post.title} | Wine Blog — Terroir & Craft HK`}
        description={post.excerpt}
        ogTitle={post.titleZh}
        ogDescription={post.excerptZh}
        ogImage={post.heroImage}
        ogUrl={`https://www.terroirandcraft.online/blog/${post.slug}`}
        ogType="article"
        canonical={`https://www.terroirandcraft.online/blog/${post.slug}`}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": post.title,
          "datePublished": post.date,
          "author": { "@type": "Organization", "name": "Terroir & Craft 天地人酒業" },
          "publisher": { "@type": "Organization", "name": "Terroir & Craft 天地人酒業", "url": "https://www.terroirandcraft.online" },
          "image": post.heroImage,
        }}
      />

      {/* Hero */}
      <div className="relative h-72 sm:h-96 overflow-hidden">
        <img src={post.heroImage} alt={post.title} className="w-full h-full object-cover object-center brightness-50" />
        <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
          <div className="max-w-3xl mx-auto w-full">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[9.5px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded bg-amber-400/30 text-amber-200 border border-amber-400/30">{post.categoryZh}</span>
              <span className="text-[10px] text-white/60">{new Date(post.date).toLocaleDateString('zh-HK', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-light text-white leading-snug">{post.titleZh}</h1>
          </div>
        </div>
      </div>

      {/* Breadcrumb */}
      <div className="border-b border-border bg-[hsl(30,20%,98%)] dark:bg-muted/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-3 flex items-center gap-2 text-xs text-muted-foreground font-body">
          <Link href="/"><a className="hover:text-foreground transition-colors">Home</a></Link>
          <span>/</span>
          <Link href="/blog"><a className="hover:text-foreground transition-colors">Wine Blog</a></Link>
          <span>/</span>
          <span className="text-foreground font-medium truncate">{post.titleZh}</span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <PostContent />

        {/* Back link */}
        <div className="mt-12 pt-8 border-t border-border">
          <Link href="/blog">
            <a className="inline-flex items-center gap-2 text-sm font-body text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="w-4 h-4" />
              返回 Wine Blog
            </a>
          </Link>
        </div>
      </div>
    </div>
  );
}
