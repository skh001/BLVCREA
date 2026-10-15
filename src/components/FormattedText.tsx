import { Fragment } from 'react';
import { cn } from '@/lib/utils';

interface FormattedTextProps {
  text: string;
  className?: string;
}

/**
 * Renders multi-line text as written: blank lines start a new paragraph,
 * single line breaks become <br />. Content is rendered as text (no HTML injection).
 */
export default function FormattedText({ text, className }: FormattedTextProps) {
  const paragraphs = text
    .replace(/\r\n?/g, '\n')
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  return (
    <div className={cn('space-y-4', className)}>
      {paragraphs.map((paragraph, i) => {
        const lines = paragraph.split('\n');
        return (
          <p key={i}>
            {lines.map((line, j) => (
              <Fragment key={j}>
                {j > 0 && <br />}
                {line}
              </Fragment>
            ))}
          </p>
        );
      })}
    </div>
  );
}
