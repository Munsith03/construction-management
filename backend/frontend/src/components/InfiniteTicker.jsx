import React, { useEffect, useRef } from "react";

function TickerItem({ text }) {
  return (
    <span className="inline-block mx-4 whitespace-nowrap text-lg font-semibold text-gray-800">
      {text}
    </span>
  );
}

function InfiniteTicker({
  items = [
    "Welcome to the Infinite Ticker!",
    "React and Tailwind CSS",
    "Smooth Scrolling Effect",
    "Customizable Speed",
    "Add Your Own Content",
  ],
  speed = 50,
}) {
  const tickerRef = useRef(null);

  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;

    // Calculate total width of the ticker content
    const tickerWidth = ticker.scrollWidth / 2; // Divide by 2 since items are duplicated
    // Calculate animation duration based on width and speed (pixels per second)
    const duration = tickerWidth / speed;

    // Dynamically add keyframes for smooth animation
    const styleSheet = document.createElement("style");
    styleSheet.type = "text/css";
    styleSheet.innerText = `
      @keyframes ticker {
        0% { transform: translateX(0); }
        100% { transform: translateX(-${tickerWidth}px); }
      }
    `;
    document.head.appendChild(styleSheet);

    // Apply animation
    ticker.style.animation = `ticker ${duration}s linear infinite`;

    return () => {
      document.head.removeChild(styleSheet);
    };
  }, [items, speed]);

  return (
    <div className="overflow-hidden w-full bg-gray-100 py-2">
      <div ref={tickerRef} className="flex">
        {items.map((item, index) => (
          <TickerItem key={`item-${index}`} text={item} />
        ))}
        {items.map((item, index) => (
          <TickerItem key={`item-duplicate-${index}`} text={item} />
        ))}
      </div>
    </div>
  );
}

export default InfiniteTicker;
