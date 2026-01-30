import type { Metadata } from 'next';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export const metadata: Metadata = {
  title: 'Blog',
  description:
    'XeloChat blog: tips on AI chatbots, website support, Google Calendar booking, and best practices for customer support automation.',
  alternates: { canonical: '/blog' },
  openGraph: { title: 'Blog | XeloChat', url: '/blog', type: 'website' },
};

async function getPosts() {
  try {
    const res = await fetch(`${API_URL}/api/blog`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function BlogPage() {
  const posts = await getPosts();

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.inner}>
          <h1 className={styles.pageTitle}>Blog</h1>
          <p className={styles.pageSubtitle}>
            Tips on AI chatbots, website support, and customer automation with XeloChat.
          </p>
          {posts.length === 0 ? (
            <p className={styles.empty}>No posts yet. Check back soon.</p>
          ) : (
            <ul className={styles.list}>
              {posts.map((post: { slug: string; title: string; excerpt: string; publishedAt: string }) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className={styles.card}>
                    <h2 className={styles.cardTitle}>{post.title}</h2>
                    <p className={styles.cardExcerpt}>{post.excerpt}</p>
                    <time className={styles.cardDate} dateTime={post.publishedAt}>
                      {new Date(post.publishedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </time>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
