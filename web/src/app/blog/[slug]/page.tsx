import { readFile } from "fs/promises";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";

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
  title: string;
  date: string;
  readingTime: string;
  tags: string[];
  excerpt: string;
}

function parseFrontmatter(content: string): {
  meta: PostMeta;
  body: string;
} {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match)
    return {
      meta: {
        title: "",
        date: "",
        readingTime: "",
        tags: [],
        excerpt: "",
      },
      body: content,
    };

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

  return {
    meta: {
      title: String(fm.title ?? ""),
      date: String(fm.date ?? ""),
      readingTime: String(fm.readingTime ?? ""),
      tags: Array.isArray(fm.tags) ? fm.tags : [],
      excerpt: String(fm.excerpt ?? ""),
    },
    body: match[2].trim(),
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const filePath = path.join(
    process.cwd(),
    "src/content/blog",
    `${slug}.mdx`
  );

  let content: string;
  try {
    content = await readFile(filePath, "utf-8");
  } catch {
    notFound();
  }

  const { meta, body } = parseFrontmatter(content);

  const paragraphs = body.split("\n\n").filter(Boolean);

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
            <Link
              href="/blog"
              style={{
                fontFamily: SANS,
                fontSize: 14,
                color: T.muted,
                textDecoration: "none",
              }}
            >
              Blog
            </Link>
          </div>
        </div>
      </nav>

      <main style={{ paddingTop: 56 }}>
        <div
          style={{
            maxWidth: 720,
            margin: "0 auto",
            padding: "64px 48px 96px",
          }}
        >
          {/* Back link */}
          <Link
            href="/blog"
            style={{
              fontFamily: MONO,
              fontSize: 12,
              color: T.muted,
              textDecoration: "none",
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              marginBottom: 40,
            }}
          >
            ← All posts
          </Link>

          {/* Meta */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 16,
              marginBottom: 24,
              flexWrap: "wrap",
            }}
          >
            <span
              style={{ fontFamily: MONO, fontSize: 12, color: T.muted }}
            >
              {meta.date}
            </span>
            <span
              style={{ fontFamily: MONO, fontSize: 12, color: T.muted }}
            >
              {meta.readingTime}
            </span>
            {meta.tags.map((tag) => (
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

          {/* Title */}
          <h1
            style={{
              fontFamily: SANS,
              fontWeight: 600,
              fontSize: "clamp(28px, 4vw, 44px)",
              color: T.ink,
              letterSpacing: "-0.02em",
              lineHeight: 1.15,
              margin: "0 0 32px",
            }}
          >
            {meta.title}
          </h1>

          {/* Content */}
          <div
            style={{
              fontFamily: SANS,
              fontSize: 16,
              lineHeight: 1.8,
              color: T.ink,
            }}
          >
            {paragraphs.map((p, i) => {
              if (p.startsWith("# ")) {
                return (
                  <h1
                    key={i}
                    style={{
                      fontFamily: SANS,
                      fontWeight: 600,
                      fontSize: 32,
                      color: T.ink,
                      letterSpacing: "-0.02em",
                      margin: "40px 0 16px",
                    }}
                  >
                    {p.slice(2)}
                  </h1>
                );
              }
              if (p.startsWith("## ")) {
                return (
                  <h2
                    key={i}
                    style={{
                      fontFamily: SANS,
                      fontWeight: 600,
                      fontSize: 24,
                      color: T.ink,
                      letterSpacing: "-0.01em",
                      margin: "36px 0 12px",
                    }}
                  >
                    {p.slice(3)}
                  </h2>
                );
              }
              return (
                <p
                  key={i}
                  style={{ margin: "0 0 20px", color: T.muted }}
                >
                  {p}
                </p>
              );
            })}
          </div>
        </div>
      </main>
    </>
  );
}
