import { readdir, readFile } from "fs/promises";
import path from "path";
import Link from "next/link";

const T = {
  surface: "#FFFFFF",
  ink: "#0A0A0A",
  muted: "#6B7280",
  border: "#E5E7EB",
  accent: "#E8930A",
  codeBg: "#F9FAFB",
} as const;

const SANS = "var(--font-sans), sans-serif";
const MONO = "var(--font-mono), monospace";

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
      {/* Nav */}
      <nav
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          background: T.surface,
          borderBottom: `1px solid ${T.border}`,
          height: 56,
        }}
      >
        <div
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 48px",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Link href="/" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 1 }}>
              <span
                style={{
                  fontFamily: SANS,
                  fontWeight: 600,
                  fontSize: 16,
                  color: T.ink,
                  letterSpacing: "-0.02em",
                }}
              >
                veclabs
              </span>
              <span
                style={{ color: T.accent, fontWeight: 700, fontSize: 18 }}
              >
                .
              </span>
            </div>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 32 }}>
            <a
              href="https://docs.veclabs.xyz"
              style={{
                fontFamily: SANS,
                fontSize: 14,
                color: T.muted,
                textDecoration: "none",
              }}
            >
              Docs
            </a>
            <a
              href="https://github.com/veclabs/veclabs"
              style={{
                fontFamily: SANS,
                fontSize: 14,
                color: T.muted,
                textDecoration: "none",
              }}
            >
              GitHub
            </a>
            <span
              style={{
                fontFamily: SANS,
                fontSize: 14,
                color: T.ink,
                fontWeight: 500,
              }}
            >
              Blog
            </span>
          </div>
        </div>
      </nav>

      <main style={{ paddingTop: 56 }}>
        <div className="section-container">
          <div style={{ marginBottom: 56 }}>
            <h1
              style={{
                fontFamily: SANS,
                fontWeight: 600,
                fontSize: "clamp(32px, 5vw, 56px)",
                color: T.ink,
                letterSpacing: "-0.02em",
                margin: "0 0 12px",
              }}
            >
              Blog
            </h1>
            <p
              style={{
                fontFamily: SANS,
                fontSize: 16,
                color: T.muted,
                margin: 0,
              }}
            >
              Engineering notes, product announcements, and technical deep-dives.
            </p>
          </div>

          <div
            style={{ display: "flex", flexDirection: "column", gap: 24 }}
          >
            {posts.map((post) => (
              <article
                key={post.slug}
                style={{
                  border: `1px solid ${T.border}`,
                  borderRadius: 6,
                  padding: 32,
                  background: T.surface,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    marginBottom: 12,
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 12,
                      color: T.muted,
                    }}
                  >
                    {post.date}
                  </span>
                  <span
                    style={{
                      fontFamily: MONO,
                      fontSize: 12,
                      color: T.muted,
                    }}
                  >
                    {post.readingTime}
                  </span>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        style={{
                          fontFamily: MONO,
                          fontSize: 10,
                          color: T.muted,
                          background: T.codeBg,
                          border: `1px solid ${T.border}`,
                          borderRadius: 4,
                          padding: "2px 8px",
                        }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <h2
                  style={{
                    fontFamily: SANS,
                    fontWeight: 600,
                    fontSize: 20,
                    color: T.ink,
                    margin: "0 0 12px",
                    letterSpacing: "-0.01em",
                  }}
                >
                  {post.title}
                </h2>

                <p
                  style={{
                    fontFamily: SANS,
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: T.muted,
                    margin: "0 0 20px",
                  }}
                >
                  {post.excerpt}
                </p>

                <Link
                  href={`/blog/${post.slug}`}
                  style={{
                    fontFamily: SANS,
                    fontWeight: 500,
                    fontSize: 14,
                    color: T.ink,
                    textDecoration: "none",
                  }}
                >
                  Read →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
