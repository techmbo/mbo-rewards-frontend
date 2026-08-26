"use client";
import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";

// Code-split the simulator and mount it only when the section approaches
// the viewport — its JS never blocks initial homepage load.
const RevenueSimulator = dynamic(() => import("./RevenueSimulator"), {
  ssr: false,
  loading: () => <Placeholder />,
});

function Placeholder() {
  return (
    <div
      aria-hidden="true"
      style={{
        minHeight: 420,
        borderRadius: 16,
        border: "1px solid rgba(168,207,240,0.14)",
        background: "rgba(13,27,62,0.55)",
      }}
    />
  );
}

export default function LazyEmbed() {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!("IntersectionObserver" in window)) {
      setVisible(true);
      return;
    }
    const io = new IntersectionObserver(
      entries => {
        if (entries.some(e => e.isIntersecting)) {
          setVisible(true);
          io.disconnect();
        }
      },
      { rootMargin: "600px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <div ref={ref}>{visible ? <RevenueSimulator variant="embed" /> : <Placeholder />}</div>;
}
