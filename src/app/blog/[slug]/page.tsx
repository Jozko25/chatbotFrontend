import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Navbar from '@/components/Navbar';
import styles from './page.module.css';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

type Post = {
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
};

async function getPost(slug: string): Promise<Post | null> {
  try {
    const res = await fetch(`${API_URL}/api/blog/${encodeURIComponent(slug)}`, {
      next: { revalidate: 60 },
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

function renderContent(content: string) {
  const paragraphs = content.split(/\n\n+/).filter(Boolean);
  const elements: React.ReactNode[] = [];
  let key = 0;
  for (const block of paragraphs) {
    if (block.startsWith('**') && block.endsWith('**')) {
      elements.push(
        <h2 key={key++}>
          {block.replace(/\*\*/g, '').trim()}
        </h2>
      );
      continue;
    }
    const lines = block.split('\n');
    const listItems = lines.filter((l) => l.trim().startsWith('- '));
    if (listItems.length === lines.length && listItems.length > 0) {
      elements.push(
        <ul key={key++}>
          {listItems.map((li, i) => (
            <li key={i}>{li.replace(/^-\s*/, '').trim()}</li>
          ))}
        </ul>
      );
      continue;
    }
    elements.push(
      <p key={key++} dangerouslySetInnerHTML={{ __html: block.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>').replace(/`(.+?)`/g, '<code>$1</code>') }} />
    );
  }
  return elements;
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: 'Post not found' };
  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      title: `${post.title} | XeloChat Blog`,
      description: post.excerpt,
      url: `/blog/${post.slug}`,
      type: 'article',
      publishedTime: post.publishedAt,
    },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);

  if (!post) notFound();

  return (
    <>
      <Navbar />
      <div className={styles.container}>
        <div className={styles.inner}>
          <Link href="/blog" className={styles.back}>
            ← Back to Blog
          </Link>
          <article className={styles.article}>
            <h1 className={styles.title}>{post.title}</h1>
            <time className={styles.date} dateTime={post.publishedAt}>
              {new Date(post.publishedAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
            <div className={styles.body}>{renderContent(post.content)}</div>
          </article>
        </div>
      </div>
    </>
  );
}
