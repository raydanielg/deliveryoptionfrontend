"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { LandingHeader, LandingFooter } from "@/components/landing-sections"
import { api } from "@/lib/api"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Badge } from "@workspace/ui/components/badge"
import { Button } from "@workspace/ui/components/button"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowLeft01Icon, ViewIcon, Clock01Icon, Attachment02Icon, Calendar03Icon } from "@hugeicons/core-free-icons"

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [related, setRelated] = useState<any[]>([])

  useEffect(() => {
    if (!slug) return
    loadPost()
  }, [slug])

  async function loadPost() {
    try {
      setLoading(true)
      const res = await api.blog.getBySlug(slug as string)
      setPost(res.data)
      if (res.data?.category?.slug) {
        try {
          const relRes = await api.blog.listPublic(`category=${res.data.category.slug}&limit=4`)
          setRelated((relRes.data || []).filter((p: any) => p.id !== res.data.id).slice(0, 3))
        } catch {}
      }
    } catch {
      setPost(null)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950">
        <LandingHeader />
        <div className="mx-auto max-w-3xl px-4 py-12">
          <Skeleton className="mb-6 h-8 w-3/4 bg-white/5" />
          <Skeleton className="mb-4 h-4 w-1/2 bg-white/5" />
          <Skeleton className="h-64 w-full bg-white/5" />
        </div>
        <LandingFooter />
      </div>
    )
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-950">
        <LandingHeader />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <span className="text-5xl mb-4">🔍</span>
          <h1 className="text-2xl font-bold text-white">Article not found</h1>
          <p className="mt-2 text-slate-400">The article you're looking for doesn't exist or has been removed.</p>
          <Link href="/blog">
            <Button className="mt-6">Back to Blog</Button>
          </Link>
        </div>
        <LandingFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <LandingHeader />

      {/* Hero with cover image */}
      <section className="relative overflow-hidden border-b border-white/8">
        {post.coverImage ? (
          <div className="absolute inset-0">
            <img src={post.coverImage} alt={post.title} className="size-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-950/40" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-slate-950" />
        )}
        <div className="relative mx-auto max-w-3xl px-4 py-16">
          <Link href="/blog" className="mb-6 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-white transition-colors">
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} className="size-4" />
            Back to Blog
          </Link>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            {post.category && <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">{post.category.name}</Badge>}
            {post.isFeatured && <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Featured</Badge>}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-lg text-slate-300">{post.excerpt}</p>}
          <div className="mt-6 flex flex-wrap items-center gap-4 text-sm text-slate-400">
            <div className="flex items-center gap-2">
              {post.author?.avatar ? (
                <img src={post.author.avatar} alt={post.author.name} className="size-8 rounded-full object-cover" />
              ) : (
                <div className="flex size-8 items-center justify-center rounded-full bg-blue-500/20 text-xs font-bold text-blue-400">
                  {post.author?.name?.charAt(0) || "U"}
                </div>
              )}
              <span>{post.author?.name || "Unknown"}</span>
            </div>
            {post.publishedAt && (
              <span className="flex items-center gap-1">
                <HugeiconsIcon icon={Calendar03Icon} strokeWidth={2} className="size-3" />
                {new Date(post.publishedAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
              </span>
            )}
            {post.readTime && (
              <span className="flex items-center gap-1">
                <HugeiconsIcon icon={Clock01Icon} strokeWidth={2} className="size-3" />
                {post.readTime} min read
              </span>
            )}
            <span className="flex items-center gap-1">
              <HugeiconsIcon icon={ViewIcon} strokeWidth={2} className="size-3" />
              {post.views} views
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <article className="mx-auto max-w-3xl px-4 py-12">
        {post.tags?.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            {post.tags.map((tag: string) => (
              <Badge key={tag} className="bg-white/5 text-slate-400 border-white/10">#{tag}</Badge>
            ))}
          </div>
        )}

        <div className="prose prose-invert prose-slate max-w-none">
          <div className="whitespace-pre-wrap text-slate-200 leading-relaxed">{post.content}</div>
        </div>

        {/* Gallery */}
        {post.images?.length > 0 && (
          <div className="mt-12 border-t border-white/8 pt-8">
            <h2 className="mb-4 text-xl font-bold text-white">Gallery</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {post.images.map((img: any) => (
                <figure key={img.id} className="overflow-hidden rounded-xl border border-white/10">
                  <img src={img.url} alt={img.caption || ""} className="w-full object-cover" />
                  {img.caption && <figcaption className="p-3 text-sm text-slate-400">{img.caption}</figcaption>}
                </figure>
              ))}
            </div>
          </div>
        )}

        {/* Attachments */}
        {post.attachments?.length > 0 && (
          <div className="mt-12 border-t border-white/8 pt-8">
            <h2 className="mb-4 text-xl font-bold text-white">Attachments</h2>
            <div className="space-y-2">
              {post.attachments.map((att: any) => (
                <a
                  key={att.id}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 p-3 transition-colors hover:bg-white/10"
                >
                  <HugeiconsIcon icon={Attachment02Icon} strokeWidth={2} className="size-5 text-blue-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{att.fileName}</p>
                    <p className="text-xs text-slate-500">{att.fileType}</p>
                  </div>
                  <span className="text-sm text-blue-400">Download</span>
                </a>
              ))}
            </div>
          </div>
        )}
      </article>

      {/* Related posts */}
      {related.length > 0 && (
        <section className="border-t border-white/8 bg-slate-900/30 py-12">
          <div className="mx-auto max-w-6xl px-4">
            <h2 className="mb-6 text-2xl font-bold text-white">Related Articles</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((rp) => (
                <Link key={rp.id} href={`/blog/${rp.slug}`} className="group overflow-hidden rounded-xl border border-white/10 bg-slate-900/50 transition-all hover:border-blue-500/30">
                  {rp.coverImage ? (
                    <div className="h-40 overflow-hidden">
                      <img src={rp.coverImage} alt={rp.title} className="size-full object-cover transition-transform group-hover:scale-105" />
                    </div>
                  ) : (
                    <div className="flex h-40 items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                      <span className="text-3xl">📰</span>
                    </div>
                  )}
                  <div className="p-4">
                    <h3 className="font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-2">{rp.title}</h3>
                    <p className="mt-2 text-sm text-slate-400 line-clamp-2">{rp.excerpt}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <LandingFooter />
    </div>
  )
}
