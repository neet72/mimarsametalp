export default function Head() {
  return (
    <>
      {/* Performance: warm up critical third-party connections */}
      <link rel="dns-prefetch" href="//res.cloudinary.com" />
      <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="" />

      <link rel="dns-prefetch" href="//vitals.vercel-insights.com" />
      <link rel="preconnect" href="https://vitals.vercel-insights.com" crossOrigin="" />

      <link rel="dns-prefetch" href="//va.vercel-scripts.com" />
      <link rel="preconnect" href="https://va.vercel-scripts.com" crossOrigin="" />
    </>
  );
}

