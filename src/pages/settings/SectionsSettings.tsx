import { useEffect, useState } from 'react';
import { ChevronDown, ChevronUp, RotateCcw } from 'lucide-react';
import type { Settings } from '@/lib/api/types';
import {
  EVENT_LABELS,
  EVENT_SECTIONS,
  NEWS_LABELS,
  NEWS_SECTIONS,
  TRENDING_LABELS,
  TRENDING_SECTIONS,
} from '@/lib/sections';
import { useSettings, useUpdateSettings } from '@/features/settings/queries';
import { errorMessage } from '@/lib/api';
import { useToast } from '@/providers/ToastProvider';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/feedback';
import { SettingsCard } from './SettingsLayout';

type OrderKey = 'newsOrder' | 'eventsOrder' | 'trendingOrder';

const GROUPS: Array<{
  key: OrderKey;
  title: string;
  description: string;
  defaults: string[];
  labels: Record<string, string>;
}> = [
  {
    key: 'newsOrder',
    title: 'News sections',
    description: 'Controls the order sections appear on the News page and in the news rail.',
    defaults: [...NEWS_SECTIONS],
    labels: NEWS_LABELS,
  },
  {
    key: 'eventsOrder',
    title: 'Event categories',
    description: 'Controls the order of hackathons, contests and CTFs.',
    defaults: [...EVENT_SECTIONS],
    labels: EVENT_LABELS,
  },
  {
    key: 'trendingOrder',
    title: 'Trending sections',
    description: 'Controls the order of repositories, models, papers and podcasts.',
    defaults: [...TRENDING_SECTIONS],
    labels: TRENDING_LABELS,
  },
];

type Orders = Record<OrderKey, string[]>;

const sameOrder = (a: string[], b: string[]) =>
  a.length === b.length && a.every((value, index) => value === b[index]);

export function SectionsSettings() {
  const settings = useSettings();
  const update = useUpdateSettings();
  const toast = useToast();
  const [orders, setOrders] = useState<Orders | null>(null);

  useEffect(() => {
    if (!settings.data || orders) return;
    setOrders({
      newsOrder: [...settings.data.newsOrder],
      eventsOrder: [...settings.data.eventsOrder],
      trendingOrder: [...settings.data.trendingOrder],
    });
  }, [settings.data, orders]);

  if (settings.isLoading || !orders) {
    if (settings.isError) {
      return (
        <SettingsCard title="Section order" description="These preferences could not be loaded.">
          <p className="text-[12.5px] text-danger">{errorMessage(settings.error)}</p>
        </SettingsCard>
      );
    }
    return (
      <div className="space-y-4">
        <Skeleton className="h-44 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    );
  }

  const dirty = GROUPS.some(
    (group) => !sameOrder(orders[group.key], (settings.data as Settings)[group.key] as string[]),
  );

  const move = (key: OrderKey, index: number, direction: -1 | 1) => {
    setOrders((current) => {
      if (!current) return current;
      const next = [...current[key]];
      const target = index + direction;
      if (target < 0 || target >= next.length) return current;
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return { ...current, [key]: next };
    });
  };

  const save = () => {
    update.mutate(
      {
        newsOrder: orders.newsOrder as Settings['newsOrder'],
        eventsOrder: orders.eventsOrder as Settings['eventsOrder'],
        trendingOrder: orders.trendingOrder as Settings['trendingOrder'],
      },
      {
        onSuccess: () => toast.push({ title: 'Section order saved', tone: 'success' }),
        onError: (error) =>
          toast.push({
            title: 'Could not save the order',
            description: errorMessage(error),
            tone: 'error',
          }),
      },
    );
  };

  return (
    <div className="space-y-4">
      {GROUPS.map((group) => (
        <SettingsCard
          key={group.key}
          title={group.title}
          description={group.description}
          footer={
            <Button
              variant="ghost"
              size="sm"
              iconLeft={<RotateCcw size={12} />}
              onClick={() =>
                setOrders((current) =>
                  current ? { ...current, [group.key]: [...group.defaults] } : current,
                )
              }
            >
              Reset to default
            </Button>
          }
        >
          <ul className="space-y-1">
            {orders[group.key].map((section, index, list) => (
              <li
                key={section}
                className="flex items-center gap-2 rounded-md border border-line bg-surface px-2.5 py-2"
              >
                <span className="w-5 shrink-0 font-mono text-[10.5px] text-subtle">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <span className="min-w-0 flex-1 truncate text-[13px] text-ink">
                  {group.labels[section] ?? section}
                </span>
                <button
                  type="button"
                  aria-label={`Move ${group.labels[section] ?? section} up`}
                  disabled={index === 0}
                  onClick={() => move(group.key, index, -1)}
                  className="focus-ring inline-flex h-6 w-6 items-center justify-center rounded text-subtle transition-colors hover:bg-raised hover:text-ink disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronUp size={14} />
                </button>
                <button
                  type="button"
                  aria-label={`Move ${group.labels[section] ?? section} down`}
                  disabled={index === list.length - 1}
                  onClick={() => move(group.key, index, 1)}
                  className="focus-ring inline-flex h-6 w-6 items-center justify-center rounded text-subtle transition-colors hover:bg-raised hover:text-ink disabled:pointer-events-none disabled:opacity-30"
                >
                  <ChevronDown size={14} />
                </button>
              </li>
            ))}
          </ul>
        </SettingsCard>
      ))}

      <div className="flex flex-wrap items-center justify-end gap-2">
        {update.isError ? (
          <span className="text-[11.5px] text-danger">{errorMessage(update.error)}</span>
        ) : null}
        <Button
          variant="ghost"
          size="sm"
          disabled={!dirty || update.isPending}
          onClick={() => {
            if (!settings.data) return;
            setOrders({
              newsOrder: [...settings.data.newsOrder],
              eventsOrder: [...settings.data.eventsOrder],
              trendingOrder: [...settings.data.trendingOrder],
            });
          }}
        >
          Discard changes
        </Button>
        <Button
          variant="primary"
          size="sm"
          disabled={!dirty}
          loading={update.isPending}
          onClick={save}
        >
          Save order
        </Button>
      </div>
    </div>
  );
}
