"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { LandingHeader, LandingFooter } from "@/components/landing-sections"
import { api } from "@/lib/api"
import { Skeleton } from "@workspace/ui/components/skeleton"
import { Input } from "@workspace/ui/components/input"
import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { HugeiconsIcon } from "@hugeicons/react"
import { ArrowRight01Icon, Search01Icon, ViewIcon, Clock01Icon } from "@hugeicons/core-free-icons"

export default function BlogPage() {
  const [posts, setPosts] = useState<any[]>([])
  const [categories, setCategories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [activeCategory, setActiveCategory] = useState("")
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [featured, setFeatured] = useState<any>(null)

  useEffect(() => { loadCategories() }, [])
  useEffect(() => { loadPosts() }, [page, activeCategory])
  useEffect(() => {
    if (search) {
      const t = setTimeout(() => { setPage(1); loadPosts() }, 400)
      return () => clearTimeout(t)
    }
  }, [search])

  async function loadPosts() {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (search) params.set("search", search)
      if (activeCategory) params.set("category", activeCategory)
      params.set("page", String(page))
      params.set("limit", "9")
      const res = await api.blog.listPublic(params.toString())
      const rawPosts = res.data?.posts || res.data
      const allPosts = Array.isArray(rawPosts) ? rawPosts : []
      if (page === 1 && !search && !activeCategory) {
        const feat = allPosts.find((p: any) => p.isFeatured) || allPosts[0]
        setFeatured(feat)
        setPosts(allPosts.filter((p: any) => p.id !== feat?.id))
      } else {
        setFeatured(null)
        setPosts(allPosts)
      }
      setTotalPages(Math.ceil((res.total || 0) / 9))
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }

  async function loadCategories() {
    try {
      const res = await api.blog.categories.list()
      const rawCats = res.data?.categories || res.data
      setCategories(Array.isArray(rawCats) ? rawCats : [])
    } catch {}
  }

  return (
    <div className="min-h-screen bg-slate-950">
      <LandingHeader />

      {/* Hero */}
      <section className="relative overflow-hidden border-b border-white/8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(59,130,246,0.08),transparent_50%)]" />
        <div className="relative mx-auto max-w-4xl px-4 text-center">
          <Badge className="mb-4 bg-blue-500/10 text-blue-400 border-blue-500/20">Blog & Insights</Badge>
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Xerin Express Blog
          </h1>
          <p className="mt-4 text-lg text-slate-400">
            Logistics insights, delivery tips, company news, and industry updates from the Xerin Express team.
          </p>
          <div className="mt-8 relative max-w-md mx-auto">
            <HugeiconsIcon icon={Search01Icon} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-slate-500" />
            <Input
              placeholder="Search articles..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-white/5 border-white/10 text-white placeholder:text-slate-500"
            />
          </div>
        </div>
      </section>

      {/* Category filter */}
      {categories.length > 0 && (
        <div className="border-b border-white/8 bg-slate-950">
          <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-4">
            <button
              onClick={() => { setActiveCategory(""); setPage(1) }}
              className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                !activeCategory ? "bg-blue-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
              }`}
            >
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => { setActiveCategory(c.slug); setPage(1) }}
                className={`shrink-0 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                  activeCategory === c.slug ? "bg-blue-500 text-white" : "bg-white/5 text-slate-400 hover:bg-white/10"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mx-auto max-w-6xl px-4 py-12">
        {/* Featured post */}
        {featured && !loading && (
          <Link href={`/blog/${featured.slug}`} className="group mb-12 block">
            <div className="grid gap-6 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-950 md:grid-cols-2">
              {featured.coverImage ? (
                <div className="relative h-64 overflow-hidden md:h-full">
                  <img src={featured.coverImage} alt={featured.title} className="size-full object-cover transition-transform group-hover:scale-105" />
                </div>
              ) : (
                <div className="flex h-64 items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10 md:h-full">
                  <span className="text-6xl">📰</span>
                </div>
              )}
              <div className="flex flex-col justify-center p-6 md:p-8">
                <div className="mb-3 flex items-center gap-2">
                  <Badge className="bg-yellow-500/10 text-yellow-400 border-yellow-500/20">Featured</Badge>
                  {featured.category && <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/20">{featured.category.name}</Badge>}
                </div>
                <h2 className="text-2xl font-bold text-white group-hover:text-blue-400 transition-colors">{featured.title}</h2>
                {featured.excerpt && <p className="mt-3 text-slate-400 line-clamp-2">{featured.excerpt}</p>}
                <div className="mt-4 flex items-center gap-3 text-sm text-slate-500">
                  <span>By {featured.author?.name || "Unknown"}</span>
                  {featured.readTime && <span className="flex items-center gap-1"><HugeiconsIcon icon={Clock01Icon} strokeWidth={2} className="size-3" /> {featured.readTime} min read</span>}
                  <span className="flex items-center gap-1"><HugeiconsIcon icon={ViewIcon} strokeWidth={2} className="size-3" /> {featured.views} views</span>
                </div>
                <div className="mt-4 flex items-center gap-1 text-blue-400 text-sm font-medium">
                  Read article
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={2} className="size-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Posts grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-72 rounded-2xl bg-white/5" />)}
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <span className="text-5xl mb-4">📝</span>
            <p className="text-slate-400">No articles found. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link key={post.id} href={`/blog/${post.slug}`} className="group overflow-hidden rounded-2xl border border-white/10 bg-slate-900/50 transition-all hover:border-blue-500/30 hover:bg-slate-900">
                {post.coverImage ? (
                  <div className="relative h-48 overflow-hidden">
                    <img src={post.coverImage} alt={post.title} className="size-full object-cover transition-transform group-hover:scale-105" />
                  </div>
                ) : (
                  <div className="flex h-48 items-center justify-center bg-gradient-to-br from-blue-500/10 to-purple-500/10">
                    <span className="text-4xl">📰</span>
                  </div>
                )}
                <div className="p-5">
                  {post.category && <Badge className="mb-2 bg-blue-500/10 text-blue-400 border-blue-500/20">{post.category.name}</Badge>}
                  <h3 className="font-bold text-white group-hover:text-blue-400 transition-colors line-clamp-2">{post.title}</h3>
                  {post.excerpt && <p className="mt-2 text-sm text-slate-400 line-clamp-2">{post.excerpt}</p>}
                  <div className="mt-4 flex items-center justify-between text-xs text-slate-500">
                    <span>{post.author?.name || "Unknown"}</span>
                    <span className="flex items-center gap-1"><HugeiconsIcon icon={ViewIcon} strokeWidth={2} className="size-3" /> {post.views}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-12 flex items-center justify-center gap-2">
            <Button variant="outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>Prev</Button>
            <span className="text-sm text-slate-400">Page {page} of {totalPages}</span>
            <Button variant="outline" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</Button>
          </div>
        )}
      </div>

      <LandingFooter />
    </div>
  )
}
