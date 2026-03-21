import { readdir, readFile } from "fs/promises";
import path from "path";
import Link from "next/link";

const V = {
  bg: "var(--bg)",
  surface: "var(--surface)",
  border: "var(--border)",
  borderLight: "var(--border-light)",
  text: "var(--text)",
  textMuted: "var(--text-muted)",
  textDim: "var(--text-dim)",
  mono: "var(--font-geist-mono), 'Geist Mono', monospace",
} as const;

interface PostMeta {
  slug: string;
  title: string;
  date: string;
  readingTime: string;
  tags: string[];
  excerpt: string;
}

function parseFrontmatter(content: string): Record<string, string | string[]> {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return {};
  const fm: Record<string, string | string[]> = {};
  for (const line of match[1].split("\n")) {
    const colon = line.indexOf(":");
    if (colon === -1) continue;
    const key = line.slice(0, colon).trim();
    const val = line.slice(colon + 1).trim();
    if (val.startsWith("[")) {
      fm[key] = val
        .slice(1, -1)
        .split(",")
        .map((s) => s.trim().replace(/^"|"$/g, ""));
    } else {
      fm[key] = val.replace(/^"|"$/g, "");
    }
  }
  return fm;
}

async function getPosts(): Promise<PostMeta[]> {
  const dir = path.join(process.cwd(), "src/content/blog");
  const files = await readdir(dir);
  const posts: PostMeta[] = [];
  for (const file of files) {
    if (!file.endsWith(".mdx")) continue;
    const slug = file.replace(".mdx", "");
    const content = await readFile(path.join(dir, file), "utf-8");
    const fm = parseFrontmatter(content);
    posts.push({
      slug,
      title: String(fm.title ?? slug),
      date: String(fm.date ?? ""),
      readingTime: String(fm.readingTime ?? ""),
      tags: Array.isArray(fm.tags) ? fm.tags : [],
      excerpt: String(fm.excerpt ?? ""),
    });
  }
  return posts.sort((a, b) => b.date.localeCompare(a.date));
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: V.bg,
          borderBottom: `1px solid ${V.border}`,
          height: 52,
        }}
      >
        <div
          className="content-width"
          style={{
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <span
                style={{
                  fontFamily: V.mono,
                  fontWeight: 700,
                  fontSize: 14,
                  color: V.text,
                }}
              >
                Recall
              </span>
              <span style={{ fontFamily: V.mono, fontSize: 11, color: V.textMuted }}>
                by VecLabs
              </span>
            </div>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <a
              href="https://docs.veclabs.xyz"
              style={{ fontFamily: V.mono, fontSize: 13, color: V.textMuted, textDecoration: "none" }}
            >
              Docs
            </a>
            <span style={{ fontFamily: V.mono, fontSize: 13, color: V.text }}>Blog</span>
          </div>
        </div>
      </nav>

      <main
        style={{
          paddingTop: 52,
          background: V.bg,
          minHeight: "100vh",
        }}
      >
        <div className="content-width" style={{ maxWidth: 720, paddingTop: 64, paddingBottom: 96 }}>
          <div
            style={{
              fontFamily: V.mono,
              fontSize: 11,
              fontWeight: 500,
              color: V.textMuted,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              marginBottom: 40,
            }}
          >
            WRITING
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  style={{
                    display: "flex",
                    position: "relative",
                    background: V.surface,
                    border: `1px solid ${V.border}`,
                    borderRadius: 2,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: 4,
                      flexShrink: 0,
                      background: V.borderLight,
                    }}
                  />
                  <div style={{ padding: "20px 20px 20px 16px", flex: 1 }}>
                    <div
                      style={{
                        fontFamily: V.mono,
                        fontSize: 12,
                        color: V.textMuted,
                        marginBottom: 8,
                      }}
                    >
                      {post.date}
                      {post.readingTime && ` · ${post.readingTime}`}
                      {post.tags.length > 0 && ` · ${post.tags.join(", ")}`}
                    </div>
                    <div
                      style={{
                        fontFamily: V.mono,
                        fontWeight: 700,
                        fontSize: 16,
                        color: V.text,
                        marginBottom: post.excerpt ? 8 : 0,
                        textDecoration: "underline",
                        textDecorationColor: "transparent",
                      }}
                    >
                      {post.title}
                    </div>
                    {post.excerpt ? (
                      <p
                        style={{
                          fontFamily: V.mono,
                          fontSize: 14,
                          color: V.textMuted,
                          margin: 0,
                          lineHeight: 1.6,
                        }}
                      >
                        {post.excerpt}
                      </p>
                    ) : null}
                    <div
                      style={{
                        fontFamily: V.mono,
                        fontSize: 12,
                        color: V.textMuted,
                        marginTop: 12,
                      }}
                    >
                      Read more →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
