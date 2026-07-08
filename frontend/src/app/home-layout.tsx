import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mizofy Movies — Watch Free Movies & Series Online',
  description:
    'Stream thousands of free movies, series, and exclusive content on Mizofy Movies. Discover the latest releases, trending videos, and popular categories — all in one place.',
  keywords: 'Mizofy Movies, free movies online, watch movies, streaming, series, videos, entertainment',
  openGraph: {
    type: 'website',
    title: 'Mizofy Movies — Watch Free Movies & Series Online',
    description:
      'Stream thousands of free movies, series, and exclusive content on Mizofy Movies.',
    siteName: 'Mizofy Movies',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Mizofy Movies — Watch Free Movies & Series Online',
    description: 'Stream free movies & series on Mizofy Movies.',
  },
};

export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
