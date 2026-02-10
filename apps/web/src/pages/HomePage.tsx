import React from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../context/AuthContext";

/* ════════════════════════════════════════════════════════
   Guest Landing Page – shown when no user is logged in
   ════════════════════════════════════════════════════════ */
function GuestLanding() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav style={{
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border-light)",
        padding: "0 40px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <div style={{
            width: 38,
            height: 38,
            background: "var(--accent)",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(212, 168, 67, 0.3)",
          }}>
            <span style={{ fontSize: 18, color: "white", fontWeight: 700 }}>◆</span>
          </div>
          <span style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.3rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
          }}>
            Team Boards
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button
            className="btn btn-ghost btn-sm"
            onClick={() => navigate("/login")}
            style={{ fontSize: "0.88rem", fontWeight: 500 }}
          >
            Sign In
          </button>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => navigate("/register")}
            style={{ fontSize: "0.88rem", padding: "8px 20px" }}
          >
            Get Started
          </button>
        </div>
      </nav>

      {/* ── Hero ───────────────────────────────────────────── */}
      <section style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "80px 40px",
        background: "linear-gradient(160deg, var(--bg-primary) 0%, var(--bg-secondary) 40%, var(--accent-subtle) 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative elements */}
        <div style={{
          position: "absolute", top: -100, right: -60,
          width: 400, height: 400, borderRadius: "50%",
          background: "rgba(212, 168, 67, 0.06)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", bottom: -120, left: -80,
          width: 350, height: 350, borderRadius: "50%",
          background: "rgba(212, 168, 67, 0.04)", pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute", top: 120, left: 60,
          width: 180, height: 180, borderRadius: "50%",
          background: "rgba(212, 168, 67, 0.03)", pointerEvents: "none",
        }} />

        <div style={{
          maxWidth: 900,
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 60,
          alignItems: "center",
          position: "relative",
          zIndex: 1,
        }}>
          {/* Left: Copy */}
          <div>
            <p className="fade-in" style={{
              fontFamily: "var(--font-sans)",
              fontSize: "0.82rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: "var(--accent)",
              marginBottom: 12,
            }}>
              Project Management, Simplified
            </p>
            <h1 className="fade-in" style={{
              fontFamily: "var(--font-serif)",
              fontSize: "3rem",
              fontWeight: 700,
              color: "var(--text-primary)",
              lineHeight: 1.15,
              marginBottom: 16,
            }}>
              Organize work, <br />
              <span style={{ fontStyle: "italic", color: "var(--accent-hover)" }}>beautifully.</span>
            </h1>
            <p className="fade-in" style={{
              fontSize: "1.1rem",
              color: "var(--text-secondary)",
              lineHeight: 1.7,
              marginBottom: 32,
              maxWidth: 440,
            }}>
              Team Boards helps you manage tasks, track progress, and collaborate
              with your team — all in one elegant, distraction-free workspace.
            </p>
            <div className="fade-in" style={{ display: "flex", gap: 14 }}>
              <button
                className="btn btn-primary"
                onClick={() => navigate("/register")}
                style={{ padding: "14px 32px", fontSize: "1rem" }}
              >
                Start for Free →
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => navigate("/login")}
                style={{ padding: "14px 28px", fontSize: "1rem" }}
              >
                Sign In
              </button>
            </div>
            <p className="fade-in" style={{
              fontSize: "0.78rem",
              color: "var(--text-muted)",
              fontStyle: "italic",
              marginTop: 16,
            }}>
              Demo: alice@demo.com / password123
            </p>
          </div>

          {/* Right: Visual preview card */}
          <div className="slide-up" style={{ perspective: 1000 }}>
            <div style={{
              background: "var(--bg-card)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-light)",
              boxShadow: "0 20px 60px rgba(0,0,0,0.08), 0 4px 16px rgba(212, 168, 67, 0.08)",
              padding: 24,
              transform: "rotateY(-3deg) rotateX(2deg)",
            }}>
              {/* Mini header */}
              <div style={{
                display: "flex", alignItems: "center", gap: 8, marginBottom: 18,
                paddingBottom: 14, borderBottom: "1px solid var(--border-light)",
              }}>
                <div style={{
                  width: 26, height: 26, background: "var(--accent)", borderRadius: 5,
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <span style={{ fontSize: 12, color: "white", fontWeight: 700 }}>◆</span>
                </div>
                <span style={{ fontFamily: "var(--font-serif)", fontSize: "0.9rem", fontWeight: 600 }}>
                  Sprint Board
                </span>
              </div>

              {/* Mini columns */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10 }}>
                {[
                  { name: "Backlog", color: "#e8dcc8", tasks: ["Design system", "API docs"] },
                  { name: "In Progress", color: "#5b8cd4", tasks: ["Auth flow", "Dashboard"] },
                  { name: "Done", color: "var(--success)", tasks: ["Setup", "DB schema"] },
                ].map((col) => (
                  <div key={col.name}>
                    <div style={{
                      display: "flex", alignItems: "center", gap: 6, marginBottom: 8,
                    }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: "50%",
                        background: col.color,
                      }} />
                      <span style={{
                        fontSize: "0.7rem", fontWeight: 600,
                        textTransform: "uppercase", letterSpacing: "0.04em",
                        color: "var(--text-secondary)",
                      }}>
                        {col.name}
                      </span>
                    </div>
                    {col.tasks.map((task) => (
                      <div key={task} style={{
                        background: "var(--bg-secondary)",
                        borderRadius: 6,
                        padding: "8px 10px",
                        marginBottom: 6,
                        fontSize: "0.72rem",
                        color: "var(--text-secondary)",
                        fontWeight: 500,
                      }}>
                        {task}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features Strip ─────────────────────────────────── */}
      <section style={{
        padding: "60px 40px",
        background: "var(--bg-card)",
        borderTop: "1px solid var(--border-light)",
      }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.6rem",
            textAlign: "center",
            marginBottom: 8,
          }}>
            Everything you need
          </h2>
          <p style={{
            textAlign: "center",
            color: "var(--text-muted)",
            fontStyle: "italic",
            marginBottom: 40,
            fontSize: "0.95rem",
          }}>
            Simple, powerful, and built for teams
          </p>
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 24,
          }}>
            {[
              { icon: "📋", title: "Kanban Boards", desc: "Drag and drop tasks across columns. Visualize your workflow at a glance." },
              { icon: "🔍", title: "Search & Filter", desc: "Find any task instantly with full-text search and smart filtering." },
              { icon: "💬", title: "Comments", desc: "Collaborate with your team. Add comments and keep context in one place." },
              { icon: "🔒", title: "Secure Auth", desc: "Industry-standard JWT authentication keeps your data safe and private." },
              { icon: "⚡", title: "Real-time Stats", desc: "Track progress with live dashboards, completion rates, and pipeline views." },
              { icon: "🎨", title: "Elegant Design", desc: "A beautiful, distraction-free interface that makes work feel effortless." },
            ].map((feature, i) => (
              <div
                key={feature.title}
                className="card fade-in"
                style={{
                  padding: "28px 24px",
                  textAlign: "center",
                  animationDelay: `${i * 80}ms`,
                }}
              >
                <div style={{
                  fontSize: "1.8rem",
                  marginBottom: 12,
                }}>
                  {feature.icon}
                </div>
                <h3 style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1rem",
                  marginBottom: 8,
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  fontSize: "0.85rem",
                  color: "var(--text-muted)",
                  lineHeight: 1.6,
                  margin: 0,
                }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ────────────────────────────────────────────── */}
      <section style={{
        padding: "60px 40px",
        textAlign: "center",
        background: "linear-gradient(160deg, var(--accent-subtle) 0%, var(--bg-secondary) 100%)",
      }}>
        <div style={{ maxWidth: 500, margin: "0 auto" }}>
          <h2 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.8rem",
            marginBottom: 10,
          }}>
            Ready to get organized?
          </h2>
          <p style={{
            fontSize: "1rem",
            color: "var(--text-secondary)",
            marginBottom: 28,
            fontStyle: "italic",
            lineHeight: 1.6,
          }}>
            Join your team and start managing projects the elegant way.
          </p>
          <button
            className="btn btn-primary"
            onClick={() => navigate("/register")}
            style={{ padding: "14px 36px", fontSize: "1rem" }}
          >
            Get Started — It's Free
          </button>
        </div>
      </section>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer style={{
        padding: "24px 40px",
        borderTop: "1px solid var(--border-light)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "var(--bg-card)",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 22, height: 22, background: "var(--accent)", borderRadius: 4,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{ fontSize: 10, color: "white", fontWeight: 700 }}>◆</span>
          </div>
          <span style={{
            fontFamily: "var(--font-serif)", fontSize: "0.82rem", color: "var(--text-muted)",
          }}>
            Team Boards
          </span>
        </div>
        <p style={{
          fontSize: "0.75rem", color: "var(--text-muted)", fontStyle: "italic", margin: 0,
        }}>
          Built with React, TypeScript & Express · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   Dashboard – shown when a user IS logged in
   ════════════════════════════════════════════════════════ */
function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const { data: boardsData, isLoading: boardsLoading } = useQuery({
    queryKey: ["boards"],
    queryFn: () => api.getBoards(),
  });

  const boards = boardsData?.boards ?? [];

  const firstBoardId = boards[0]?.id;
  const { data: columnsData } = useQuery({
    queryKey: ["columns", firstBoardId],
    queryFn: () => api.getColumns(firstBoardId),
    enabled: !!firstBoardId,
  });

  const columns = columnsData?.columns ?? [];
  const totalTasks = columns.reduce((sum: number, c: any) => sum + (c.task_count || 0), 0);
  const doneCol = columns.find((c: any) => c.name === "Done");
  const doneTasks = doneCol?.task_count ?? 0;
  const inProgressCol = columns.find((c: any) => c.name === "In Progress");
  const inProgressTasks = inProgressCol?.task_count ?? 0;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      {/* ── Navbar ──────────────────────────────────────────── */}
      <nav style={{
        background: "rgba(255, 255, 255, 0.85)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid var(--border-light)",
        padding: "0 40px",
        height: 64,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        zIndex: 100,
      }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none" }}>
          <div style={{
            width: 38,
            height: 38,
            background: "var(--accent)",
            borderRadius: "var(--radius-sm)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(212, 168, 67, 0.3)",
          }}>
            <span style={{ fontSize: 18, color: "white", fontWeight: 700 }}>◆</span>
          </div>
          <span style={{
            fontFamily: "var(--font-serif)",
            fontSize: "1.3rem",
            fontWeight: 600,
            color: "var(--text-primary)",
            letterSpacing: "-0.01em",
          }}>
            Team Boards
          </span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Link to="/boards" className="btn btn-ghost btn-sm" style={{ fontSize: "0.85rem" }}>
            Boards
          </Link>
          <div style={{
            width: 1,
            height: 24,
            background: "var(--border)",
            margin: "0 8px",
          }} />
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "6px 14px",
            background: "var(--bg-secondary)",
            borderRadius: "var(--radius-md)",
          }}>
            <div style={{
              width: 30,
              height: 30,
              background: "var(--accent-light)",
              color: "var(--accent-hover)",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.8rem",
              fontWeight: 700,
            }}>
              {user?.username?.charAt(0).toUpperCase()}
            </div>
            <span style={{ fontSize: "0.88rem", fontWeight: 500, color: "var(--text-primary)" }}>
              {user?.username}
            </span>
          </div>
          <button
            className="btn btn-ghost btn-sm"
            onClick={handleLogout}
            style={{ color: "var(--text-muted)", fontSize: "0.82rem" }}
          >
            Sign out
          </button>
        </div>
      </nav>

      {/* ── Hero / Welcome ─────────────────────────────────── */}
      <section style={{
        padding: "56px 40px 40px",
        background: "linear-gradient(160deg, var(--bg-primary) 0%, var(--bg-secondary) 40%, var(--accent-subtle) 100%)",
        position: "relative",
        overflow: "hidden",
      }}>
        {/* Decorative circles */}
        <div style={{
          position: "absolute",
          top: -60,
          right: -40,
          width: 280,
          height: 280,
          borderRadius: "50%",
          background: "rgba(212, 168, 67, 0.06)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "absolute",
          bottom: -80,
          right: 180,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(212, 168, 67, 0.04)",
          pointerEvents: "none",
        }} />

        <div style={{ maxWidth: 900, margin: "0 auto", position: "relative" }}>
          <p className="fade-in" style={{
            fontFamily: "var(--font-sans)",
            fontSize: "0.82rem",
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "var(--accent)",
            marginBottom: 8,
          }}>
            {greeting()}, {user?.username}
          </p>
          <h1 className="fade-in" style={{
            fontFamily: "var(--font-serif)",
            fontSize: "2.6rem",
            fontWeight: 700,
            color: "var(--text-primary)",
            lineHeight: 1.2,
            marginBottom: 10,
            maxWidth: 600,
          }}>
            Your workspace, <br />
            <span style={{ fontStyle: "italic", color: "var(--accent-hover)" }}>beautifully organized.</span>
          </h1>
          <p className="fade-in" style={{
            fontSize: "1.05rem",
            color: "var(--text-secondary)",
            lineHeight: 1.65,
            maxWidth: 520,
            marginBottom: 28,
          }}>
            Track tasks, collaborate with your team, and keep every project moving forward — all in one elegant space.
          </p>
          <div className="fade-in" style={{ display: "flex", gap: 12 }}>
            {boards.length > 0 ? (
              <button
                className="btn btn-primary"
                onClick={() => navigate(`/board/${boards[0].id}`)}
                style={{ padding: "12px 28px", fontSize: "0.95rem" }}
              >
                Open Board →
              </button>
            ) : (
              <button
                className="btn btn-primary"
                onClick={() => navigate("/boards")}
                style={{ padding: "12px 28px", fontSize: "0.95rem" }}
              >
                Get Started →
              </button>
            )}
            <button
              className="btn btn-secondary"
              onClick={() => navigate("/boards")}
              style={{ padding: "12px 28px", fontSize: "0.95rem" }}
            >
              View All Boards
            </button>
          </div>
        </div>
      </section>

      {/* ── Stats Strip ────────────────────────────────────── */}
      <section style={{
        padding: "0 40px",
        marginTop: -20,
        position: "relative",
        zIndex: 10,
      }}>
        <div style={{
          maxWidth: 900,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 16,
        }}>
          {[
            { label: "Boards", value: boards.length, icon: "📋", color: "#5b8cd4" },
            { label: "Total Tasks", value: totalTasks, icon: "✦", color: "var(--accent)" },
            { label: "In Progress", value: inProgressTasks, icon: "⚡", color: "#d4a843" },
            { label: "Completed", value: doneTasks, icon: "✓", color: "var(--success)" },
          ].map((stat, i) => (
            <div
              key={stat.label}
              className="card slide-up"
              style={{
                padding: "20px 22px",
                display: "flex",
                alignItems: "center",
                gap: 16,
                animationDelay: `${i * 80}ms`,
              }}
            >
              <div style={{
                width: 44,
                height: 44,
                borderRadius: "var(--radius-md)",
                background: `${stat.color}12`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "1.1rem",
                flexShrink: 0,
              }}>
                {stat.icon}
              </div>
              <div>
                <p style={{
                  fontSize: "1.5rem",
                  fontFamily: "var(--font-serif)",
                  fontWeight: 700,
                  color: "var(--text-primary)",
                  lineHeight: 1.1,
                  margin: 0,
                }}>
                  {boardsLoading ? "…" : stat.value}
                </p>
                <p style={{
                  fontSize: "0.75rem",
                  color: "var(--text-muted)",
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.04em",
                  margin: 0,
                  marginTop: 2,
                }}>
                  {stat.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Main Content ───────────────────────────────────── */}
      <main style={{
        flex: 1,
        padding: "40px",
        maxWidth: 900,
        margin: "0 auto",
        width: "100%",
      }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32 }}>

          {/* Left: Boards */}
          <div>
            <div style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 20,
            }}>
              <h2 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1.3rem",
                margin: 0,
              }}>
                Your Boards
              </h2>
              <Link
                to="/boards"
                style={{
                  fontSize: "0.82rem",
                  fontWeight: 600,
                  color: "var(--accent)",
                }}
              >
                View all →
              </Link>
            </div>

            {boardsLoading ? (
              <div style={{ display: "flex", justifyContent: "center", padding: 40 }}>
                <div className="spinner" />
              </div>
            ) : boards.length === 0 ? (
              <div className="card" style={{
                padding: "40px 28px",
                textAlign: "center",
              }}>
                <div style={{ fontSize: "2.5rem", marginBottom: 12 }}>📋</div>
                <h3 style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1.1rem",
                  fontStyle: "italic",
                  color: "var(--text-secondary)",
                  marginBottom: 8,
                }}>
                  No boards yet
                </h3>
                <p style={{
                  fontSize: "0.88rem",
                  color: "var(--text-muted)",
                  marginBottom: 20,
                }}>
                  Create your first board and start organizing tasks with your team.
                </p>
                <button
                  className="btn btn-primary"
                  onClick={() => navigate("/boards")}
                >
                  + Create Board
                </button>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {boards.slice(0, 4).map((board: any, i: number) => (
                  <div
                    key={board.id}
                    className="card fade-in"
                    onClick={() => navigate(`/board/${board.id}`)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === "Enter") navigate(`/board/${board.id}`); }}
                    style={{
                      padding: "18px 22px",
                      display: "flex",
                      alignItems: "center",
                      gap: 16,
                      cursor: "pointer",
                      animationDelay: `${i * 60}ms`,
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--accent)";
                      e.currentTarget.style.transform = "translateX(4px)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--border-light)";
                      e.currentTarget.style.transform = "none";
                    }}
                  >
                    <div style={{
                      width: 44,
                      height: 44,
                      background: "var(--accent-subtle)",
                      borderRadius: "var(--radius-md)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "1.2rem",
                      flexShrink: 0,
                    }}>
                      📋
                    </div>
                    <div style={{ flex: 1 }}>
                      <h3 style={{
                        fontFamily: "var(--font-serif)",
                        fontSize: "1rem",
                        margin: 0,
                        lineHeight: 1.3,
                      }}>
                        {board.name}
                      </h3>
                      <p style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                        fontStyle: "italic",
                        margin: 0,
                        marginTop: 2,
                      }}>
                        Created {new Date(board.created_at).toLocaleDateString("en-US", {
                          month: "long",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                    <span style={{
                      fontSize: "1.1rem",
                      color: "var(--text-muted)",
                    }}>
                      →
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Quick Info Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Column overview */}
            {columns.length > 0 && (
              <div className="card fade-in" style={{ padding: "22px" }}>
                <h3 style={{
                  fontFamily: "var(--font-serif)",
                  fontSize: "1rem",
                  marginBottom: 16,
                  fontStyle: "italic",
                }}>
                  Pipeline Overview
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {columns.map((col: any) => {
                    const pct = totalTasks > 0 ? Math.round((col.task_count / totalTasks) * 100) : 0;
                    const barColors: Record<string, string> = {
                      "Backlog": "#e8dcc8",
                      "In Progress": "#5b8cd4",
                      "Review": "#b07ad4",
                      "Done": "var(--success)",
                    };
                    return (
                      <div key={col.id}>
                        <div style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 5,
                        }}>
                          <span style={{
                            fontSize: "0.82rem",
                            fontWeight: 500,
                            color: "var(--text-secondary)",
                          }}>
                            {col.name}
                          </span>
                          <span style={{
                            fontSize: "0.75rem",
                            color: "var(--text-muted)",
                            fontStyle: "italic",
                          }}>
                            {col.task_count} tasks
                          </span>
                        </div>
                        <div style={{
                          height: 6,
                          background: "var(--bg-secondary)",
                          borderRadius: 3,
                          overflow: "hidden",
                        }}>
                          <div style={{
                            height: "100%",
                            width: `${pct}%`,
                            background: barColors[col.name] || "var(--accent)",
                            borderRadius: 3,
                            transition: "width 0.6s var(--ease)",
                            minWidth: col.task_count > 0 ? 8 : 0,
                          }} />
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Progress circle */}
                {totalTasks > 0 && (
                  <div style={{
                    marginTop: 20,
                    padding: "16px 0 0",
                    borderTop: "1px solid var(--border-light)",
                    display: "flex",
                    alignItems: "center",
                    gap: 14,
                  }}>
                    <div style={{
                      width: 52,
                      height: 52,
                      borderRadius: "50%",
                      background: `conic-gradient(var(--success) ${(doneTasks / totalTasks) * 360}deg, var(--bg-secondary) 0deg)`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      flexShrink: 0,
                    }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        background: "var(--bg-card)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontSize: "0.75rem",
                        fontWeight: 700,
                        color: "var(--success)",
                      }}>
                        {Math.round((doneTasks / totalTasks) * 100)}%
                      </div>
                    </div>
                    <div>
                      <p style={{
                        fontSize: "0.88rem",
                        fontWeight: 600,
                        color: "var(--text-primary)",
                        margin: 0,
                      }}>
                        Completion Rate
                      </p>
                      <p style={{
                        fontSize: "0.78rem",
                        color: "var(--text-muted)",
                        fontStyle: "italic",
                        margin: 0,
                        marginTop: 2,
                      }}>
                        {doneTasks} of {totalTasks} tasks done
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Quick actions */}
            <div className="card fade-in" style={{ padding: "22px" }}>
              <h3 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "1rem",
                marginBottom: 14,
                fontStyle: "italic",
              }}>
                Quick Actions
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => navigate("/boards")}
                  style={{
                    width: "100%",
                    justifyContent: "flex-start",
                    gap: 10,
                    padding: "10px 14px",
                    fontSize: "0.85rem",
                  }}
                >
                  <span>📋</span> Create New Board
                </button>
                {boards.length > 0 && (
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/board/${boards[0].id}`)}
                    style={{
                      width: "100%",
                      justifyContent: "flex-start",
                      gap: 10,
                      padding: "10px 14px",
                      fontSize: "0.85rem",
                    }}
                  >
                    <span>⚡</span> Open Sprint Board
                  </button>
                )}
              </div>
            </div>

            {/* Tips */}
            <div style={{
              padding: "18px 20px",
              background: "var(--accent-subtle)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--accent-light)",
            }}>
              <p style={{
                fontFamily: "var(--font-serif)",
                fontStyle: "italic",
                fontSize: "0.9rem",
                color: "var(--text-secondary)",
                lineHeight: 1.6,
                margin: 0,
              }}>
                "Productivity is never an accident. It is always the result of a commitment
                to excellence, intelligent planning, and focused effort."
              </p>
              <p style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                margin: 0,
                marginTop: 8,
                textAlign: "right",
                fontWeight: 500,
              }}>
                — Paul J. Meyer
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer style={{
        padding: "24px 40px",
        borderTop: "1px solid var(--border-light)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{
            width: 22,
            height: 22,
            background: "var(--accent)",
            borderRadius: 4,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <span style={{ fontSize: 10, color: "white", fontWeight: 700 }}>◆</span>
          </div>
          <span style={{
            fontFamily: "var(--font-serif)",
            fontSize: "0.82rem",
            color: "var(--text-muted)",
          }}>
            Team Boards
          </span>
        </div>
        <p style={{
          fontSize: "0.75rem",
          color: "var(--text-muted)",
          fontStyle: "italic",
          margin: 0,
        }}>
          Built with React, TypeScript & Express · {new Date().getFullYear()}
        </p>
      </footer>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   Exported HomePage – switches based on auth state
   ════════════════════════════════════════════════════════ */
export function HomePage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        gap: 16,
      }}>
        <div className="spinner spinner-lg" />
        <p style={{
          fontFamily: "var(--font-serif)",
          fontStyle: "italic",
          color: "var(--text-muted)",
        }}>
          Loading...
        </p>
      </div>
    );
  }

  return user ? <Dashboard /> : <GuestLanding />;
}