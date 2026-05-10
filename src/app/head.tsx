export default function Head() {
  return (
    <>
      {/* Instrument Serif bu Next sürümünde next/font ile yok; Google link ile yüklenir */}
      {/* eslint-disable @next/next/no-page-custom-font -- */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      <link
        href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&display=swap"
        rel="stylesheet"
      />
      {/* eslint-enable @next/next/no-page-custom-font */}

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

