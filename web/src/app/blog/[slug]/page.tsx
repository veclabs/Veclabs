import { readFile } from "fs/promises";
import path from "path";
import Link from "next/link";
import { notFound } from "next/navigation";

const V = {
  bg: "var(--bg)",
  surface: "var(--surface)",
  border: "var(--border)",
  text: "var(--text)",
  textMuted: "var(--text-muted)",
  textDim: "var(--text-dim)",
  mono: "var(--font-geist-mono), 'Geist Mono', monospace",
} as const;

interface PostMeta {
  title:       string;
  date:        string;
  readingTime: string;
  tags:        string[];
}

function parseFrontmatter(content: string): { meta: PostMeta; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!match) {
    return {
      meta: { title: "", date: "", readingTime: "", tags: [] },
      body: content,
    };
  }

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
      title:       String(fm.title       ?? ""),
      date:        String(fm.date        ?? ""),
      readingTime: String(fm.readingTime ?? ""),
      tags:        Array.isArray(fm.tags) ? fm.tags : [],
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
      <nav
        style={{
          position:     "fixed",
          top:          0,
          left:         0,
          right:        0,
          zIndex:       50,
          background:   V.bg,
          borderBottom: `1px solid ${V.border}`,
          height:       52,
        }}
      >
        <div
          className="content-width"
          style={{
            height:         "100%",
            display:        "flex",
            alignItems:     "center",
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
          <Link
            href="/blog"
            style={{
              fontFamily: V.mono,
              fontSize:   13,
              color:      V.textMuted,
              textDecoration: "none",
            }}
          >
            Blog
          </Link>
        </div>
      </nav>

      <main
        style={{
          paddingTop: 52,
          background: V.bg,
          minHeight:  "100vh",
        }}
      >
        <div
          style={{
            maxWidth:      680,
            margin:        "0 auto",
            padding:       "56px 48px 96px",
          }}
        >
          <Link
            href="/blog"
            style={{
              fontFamily:     V.mono,
              fontSize:       13,
              color:          V.textMuted,
              textDecoration: "none",
              display:        "inline-block",
              marginBottom:   40,
            }}
          >
            -- Writing
          </Link>

          <div
            style={{
              fontFamily: V.mono,
              fontSize:   12,
              color:      V.textDim,
              marginBottom: 16,
            }}
          >
            {meta.date}
            {meta.readingTime && ` · ${meta.readingTime}`}
          </div>

          <h1
            style={{
              fontFamily:    V.mono,
              fontWeight:    700,
              fontSize:      32,
              color:         V.text,
              letterSpacing: "-0.02em",
              lineHeight:    1.2,
              margin:        "0 0 40px",
            }}
          >
            {meta.title}
          </h1>

          <div
            style={{
              fontFamily:  V.mono,
              fontSize:    16,
              fontWeight:  400,
              color:       V.textMuted,
              lineHeight:  1.85,
            }}
          >
            {paragraphs.map((p, i) => {
              if (p.startsWith("# ")) {
                return (
                  <h2
                    key={i}
                    style={{
                      fontFamily:    V.mono,
                      fontWeight:    700,
                      fontSize:      26,
                      color:         V.text,
                      letterSpacing: "-0.02em",
                      margin:        "40px 0 16px",
                    }}
                  >
                    {p.slice(2)}
                  </h2>
                );
              }
              if (p.startsWith("## ")) {
                return (
                  <h3
                    key={i}
                    style={{
                      fontFamily: V.mono,
                      fontWeight: 700,
                      fontSize:   20,
                      color:      V.text,
                      margin:     "32px 0 12px",
                    }}
                  >
                    {p.slice(3)}
                  </h3>
                );
              }
              if (p.startsWith("```")) {
                const code = p.replace(/^```[^\n]*\n/, "").replace(/```$/, "");
                return (
                  <pre
                    key={i}
                    style={{
                      background:  V.surface,
                      border:      `1px solid ${V.border}`,
                      borderRadius: 2,
                      padding:     "20px 24px",
                      fontFamily:  V.mono,
                      fontSize:    13,
                      lineHeight:  1.6,
                      color:       V.text,
                      margin:      "24px 0",
                      overflowX:   "auto",
                      whiteSpace:  "pre-wrap",
                    }}
                  >
                    {code}
                  </pre>
                );
              }
              return (
                <p key={i} style={{ margin: "0 0 20px" }}>
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
