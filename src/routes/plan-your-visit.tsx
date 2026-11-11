import { createFileRoute, Link } from '@tanstack/react-router';
import { Book } from './book';

export const Route = createFileRoute('/plan-your-visit')({
  head: () => ({
    meta: [
      { title: 'Plan Your Visit | Visit Rwanda' },
      { name: 'description', content: 'Plan a Rwanda trip with destination choices, activities, dates and official visitor information.' },
    ],
  }),
  component: Book,
});

export function PlanYourVisit() {
  return <Book />;
}
