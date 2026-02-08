import { readFileSync } from 'fs';
import { join } from 'path';
import { SpecContent } from './SpecContent';

export const metadata = {
  title: '$403 Specification — Access Control Standard',
  description: 'Technical specification for the $403 Access Control Standard: programmable permissions, geo-gates, time-locks, and on-chain rule enforcement.',
};

export default function SpecPage() {
  const specPath = join(process.cwd(), 'content', 'spec.md');
  const markdown = readFileSync(specPath, 'utf-8');

  return <SpecContent markdown={markdown} />;
}
