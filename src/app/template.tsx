/**
 * Geçiş animasyonu yalnızca {@link MainLayout} içindeki `PageTransition` ile yapılır.
 * Burada ikinci bir sarım (eski motion/PageTransition) çift animasyon ve gereksiz istemci JS üretiyordu.
 */
export default function AppTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
