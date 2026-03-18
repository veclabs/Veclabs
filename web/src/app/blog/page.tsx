import { readdir, readFile } from "fs/promises";
import path from "path";
import Link from "next/link";

const V = {
  bg:       "#080808",
  surface:  "#0F0F0F",
  border:   "#1A1A1A",
  border2:  "#242424",
  ink:      "#EBEBEB",
  inkMuted: "#5A5A5A",
  inkDim:   "#2E2E2E",
  green:    "#00C471",
  mono:     "var(--font-geist-mono), 'Geist Mono', monospace",
} as const;

interface PostMeta {
  slug:        string;
  title:       string;
  date:        string;
  readingTime: string;
  tags:        string[];
  excerpt:     string;
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
    const slug    = file.replace(".mdx", "");
    const content = await readFile(path.join(dir, file), "utf-8");
    const fm      = parseFrontmatter(content);
    posts.push({
      slug,
      title:       String(fm.title       ?? slug),
      date:        String(fm.date        ?? ""),
      readingTime: String(fm.readingTime ?? ""),
      tags:        Array.isArray(fm.tags) ? fm.tags : [],
      excerpt:     String(fm.excerpt     ?? ""),
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
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <div
                style={{
                  width:        6,
                  height:       6,
                  borderRadius: "50%",
                  background:   V.green,
                }}
              />
              <span
                style={{
                  fontFamily:     V.mono,
                  fontWeight:     700,
                  fontSize:       14,
                  color:          V.ink,
                  letterSpacing:  "-0.02em",
                }}
              >
                veclabs
              </span>
            </div>
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
            <a
              href="https://docs.veclabs.xyz"
              style={{ fontFamily: V.mono, fontSize: 13, color: V.inkMuted, textDecoration: "none" }}
            >
              Docs
            </a>
            <span
              style={{ fontFamily: V.mono, fontSize: 13, color: V.ink }}
            >
              Blog
            </span>
          </div>
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
          className="content-width"
          style={{ maxWidth: 720, paddingTop: 64, paddingBottom: 96 }}
        >
          <div
            style={{
              fontFamily:     V.mono,
              fontSize:       11,
              fontWeight:     500,
              color:          V.inkDim,
              textTransform:  "uppercase",
              letterSpacing:  "0.08em",
              marginBottom:   40,
            }}
          >
            WRITING
          </div>

          <div>
            {posts.map((post, i) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                style={{ textDecoration: "none", display: "block" }}
              >
                <div
                  style={{
                    display:       "grid",
                    gridTemplateColumns: "100px 1fr auto",
                    gap:           24,
                    alignItems:    "center",
                    padding:       "16px 0",
                    borderBottom:  `1px solid ${V.border}`,
                    borderTop:     i === 0 ? `1px solid ${V.border}` : "none",
                  }}
                >
                  <span
                    style={{
                      fontFamily: V.mono,
                      fontSize:   12,
                      color:      V.inkDim,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {post.date}
                  </span>

                  <div>
                    <div
                      style={{
                        fontFamily:  V.mono,
                        fontWeight:  600,
                        fontSize:    15,
                        color:       V.ink,
                        marginBottom: 2,
                        transition:  "color 150ms",
                      }}
                    >
                      {post.title}
                    </div>
                  </div>

                  <div
                    style={{
                      textAlign: "right",
                      whiteSpace: "nowrap",
                    }}
                  >
                    <div
                      style={{
                        fontFamily: V.mono,
                        fontSize:   11,
                        color:      V.inkDim,
                      }}
                    >
                      {post.readingTime}
                    </div>
                    <div
                      style={{
                        fontFamily: V.mono,
                        fontSize:   10,
                        color:      V.inkDim,
                        marginTop:  2,
                      }}
                    >
                      {post.tags.join(", ")}
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
