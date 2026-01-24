"use client";

import Image from "next/image";
import ReactMarkdown from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

interface MarkdownProps {
  children: string;
  className?: string;
}

/**
 * Modern styled Markdown renderer with blue theme.
 *
 * Uses DM Sans for prose and Space Mono for code.
 * Rounded corners, subtle shadows, blue accents.
 */
export function Markdown({ children, className = "" }: MarkdownProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

const components: Components = {
  // Headings - bold, DM Sans, no margins on first heading
  h1: ({ children }) => (
    <h1 className="mb-4 mt-6 border-b border-border pb-2 text-2xl font-bold first:mt-0">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-5 text-xl font-bold first:mt-0">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-4 text-lg font-bold first:mt-0">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="mb-2 mt-3 text-base font-bold first:mt-0">{children}</h4>
  ),
  h5: ({ children }) => (
    <h5 className="mb-1 mt-2 text-sm font-bold uppercase tracking-wider first:mt-0">
      {children}
    </h5>
  ),
  h6: ({ children }) => (
    <h6 className="mb-1 mt-2 text-sm font-bold uppercase tracking-wider text-muted-foreground first:mt-0">
      {children}
    </h6>
  ),

  // Paragraph
  p: ({ children }) => (
    <p className="mb-3 leading-relaxed last:mb-0">{children}</p>
  ),

  // Lists - disc bullets for modern style
  ul: ({ children }) => (
    <ul className="mb-3 ml-4 list-disc space-y-1 marker:text-primary">
      {children}
    </ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-3 ml-4 list-decimal space-y-1 marker:text-primary">
      {children}
    </ol>
  ),
  li: ({ children }) => <li className="pl-1">{children}</li>,

  // Links - blue underline on hover
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-primary underline decoration-primary/50 decoration-1 underline-offset-2 transition-colors hover:decoration-primary"
    >
      {children}
    </a>
  ),

  // Strong/Bold
  strong: ({ children }) => <strong className="font-bold">{children}</strong>,

  // Emphasis/Italic
  em: ({ children }) => <em className="italic">{children}</em>,

  // Inline code - blue background tint
  code: ({ className, children, ...props }) => {
    // Check if this is a code block (has language class) or inline code
    const isBlock = className?.includes("language-");
    if (isBlock) {
      return (
        <code className={`${className} font-mono text-sm`} {...props}>
          {children}
        </code>
      );
    }
    return (
      <code className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-sm text-primary">
        {children}
      </code>
    );
  },

  // Code blocks - dark background, rounded corners
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto rounded-lg border border-border bg-muted p-4 font-mono text-sm">
      {children}
    </pre>
  ),

  // Blockquote - left border with blue
  blockquote: ({ children }) => (
    <blockquote className="mb-3 border-l-4 border-primary pl-4 italic text-muted-foreground">
      {children}
    </blockquote>
  ),

  // Horizontal rule
  hr: () => <hr className="my-6 border-t border-border" />,

  // Images - rounded corners, subtle border
  // Using unoptimized for markdown images since they can come from any external source
  img: ({ src, alt }) => {
    // src can be string or Blob from react-markdown types, but markdown only provides strings
    const imageSrc = typeof src === "string" ? src : "";
    if (!imageSrc) return null;
    return (
      <span className="my-4 block">
        <Image
          src={imageSrc}
          alt={alt || ""}
          width={0}
          height={0}
          sizes="100vw"
          className="h-auto w-full rounded-lg border border-border"
          unoptimized
        />
      </span>
    );
  },

  // Tables - modern style with rounded corners
  table: ({ children }) => (
    <div className="mb-4 overflow-x-auto rounded-lg border border-border">
      <table className="w-full">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-muted text-foreground">{children}</thead>
  ),
  tbody: ({ children }) => <tbody>{children}</tbody>,
  tr: ({ children }) => (
    <tr className="border-b border-border last:border-b-0">{children}</tr>
  ),
  th: ({ children }) => (
    <th className="px-4 py-2 text-left text-sm font-semibold">{children}</th>
  ),
  td: ({ children }) => (
    <td className="border-r border-border px-4 py-2 last:border-r-0">
      {children}
    </td>
  ),

  // Delete/Strikethrough
  del: ({ children }) => (
    <del className="line-through opacity-60">{children}</del>
  ),
};
