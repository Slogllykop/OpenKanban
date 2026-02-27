import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "OpenKanban - Real-time Ephemeral Kanban Boards";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <div
      style={{
        background: "linear-gradient(to bottom right, #000000, #111111)",
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, sans-serif",
        color: "white",
      }}
    >
      {/* Subtle grid pattern using overlapping boxes simulating glassmorphism kanban */}
      <div
        style={{
          position: "absolute",
          display: "flex",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundImage:
            "radial-gradient(circle at 25px 25px, rgba(255, 255, 255, 0.1) 2px, transparent 0)",
          backgroundSize: "100px 100px",
          opacity: 0.5,
        }}
      />

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 10,
        }}
      >
        <div
          style={{
            padding: "16px 32px",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "999px",
            fontSize: "24px",
            color: "#d1d5db",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            marginBottom: "32px",
            background: "rgba(255,255,255,0.05)",
          }}
        >
          No Friction. Just Boards.
        </div>
        <h1
          style={{
            fontSize: "110px",
            fontWeight: "900",
            margin: "0",
            textAlign: "center",
            letterSpacing: "-0.05em",
            lineHeight: 1,
            backgroundClip: "text",
            color: "transparent",
            backgroundImage: "linear-gradient(to right, #ffffff, #888888)",
          }}
        >
          OpenKanban
        </h1>
        <p
          style={{
            fontSize: "40px",
            fontWeight: "400",
            marginTop: "40px",
            color: "#9ca3af",
            maxWidth: "800px",
            textAlign: "center",
            lineHeight: 1.4,
          }}
        >
          A sleek, real-time Kanban board with zero signup.
        </p>
      </div>

      {/* Abstract floating board columns */}
      <div
        style={{
          position: "absolute",
          bottom: "-150px",
          display: "flex",
          gap: "30px",
          opacity: 0.3,
          transform: "perspective(1000px) rotateX(45deg)",
        }}
      >
        <div
          style={{
            width: "250px",
            height: "400px",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "24px",
          }}
        />
        <div
          style={{
            width: "250px",
            height: "500px",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.15) 0%, transparent 100%)",
            border: "1px solid rgba(255,255,255,0.2)",
            borderRadius: "24px",
            transform: "translateY(-50px)",
          }}
        />
        <div
          style={{
            width: "250px",
            height: "400px",
            background:
              "linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%)",
            border: "1px solid rgba(255,255,255,0.1)",
            borderRadius: "24px",
          }}
        />
      </div>
    </div>,
    {
      ...size,
    },
  );
}
