'use client';

import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/Card';
import { Chip } from '@/components/ui/Chip';
import { Skeleton, SkeletonText, SkeletonCard, SkeletonList } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { Container } from '@/components/layout/Container';
import { 
  Package, 
  Search, 
  Plus, 
  Bell, 
  User,
  Check,
  AlertCircle,
  RefreshCw
} from '@/components/icons';

export default function UIDemoPage() {
  return (
    <Container className="py-8 space-y-8">
      <div className="space-y-4">
        <h1 className="text-3xl font-bold text-text">UI2 Demo</h1>
        <p className="text-muted-foreground">
          Демонстрация новой дизайн-системы Bridge Logistics
        </p>
      </div>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-text">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="primary" size="sm">Primary Small</Button>
          <Button variant="primary" size="md">Primary Medium</Button>
          <Button variant="primary" size="lg">Primary Large</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button variant="primary" loading>Loading</Button>
          <Button variant="primary" icon={<Plus className="h-4 w-4" />}>With Icon</Button>
        </div>
      </section>

      {/* Inputs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-text">Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input label="Default Input" placeholder="Enter text..." />
          <Input label="With Error" error="This field is required" />
          <Input label="With Hint" hint="This is a helpful hint" />
          <Input label="Disabled" disabled value="Disabled input" />
        </div>
      </section>

      {/* Cards */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-text">Cards</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card variant="elevated">
            <CardHeader>
              <h3 className="text-lg font-semibold">Elevated Card</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This is an elevated card with shadow and border.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="primary" size="sm">Action</Button>
            </CardFooter>
          </Card>

          <Card variant="outline">
            <CardHeader>
              <h3 className="text-lg font-semibold">Outline Card</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This is an outline card with border only.
              </p>
            </CardContent>
          </Card>

          <Card variant="flat">
            <CardHeader>
              <h3 className="text-lg font-semibold">Flat Card</h3>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">
                This is a flat card with no shadow or border.
              </p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Chips */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-text">Chips</h2>
        <div className="flex flex-wrap gap-2">
          <Chip variant="default">Default</Chip>
          <Chip variant="success">Success</Chip>
          <Chip variant="warning">Warning</Chip>
          <Chip variant="danger">Danger</Chip>
          <Chip variant="outline">Outline</Chip>
          <Chip variant="success" icon={<Check className="h-3 w-3" />}>With Icon</Chip>
        </div>
      </section>

      {/* Skeletons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-text">Skeletons</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Text Skeleton</h3>
            <SkeletonText lines={3} />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Card Skeleton</h3>
            <SkeletonCard />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-medium">List Skeleton</h3>
            <SkeletonList items={3} />
          </div>
        </div>
      </section>

      {/* Empty State */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-text">Empty State</h2>
        <Card>
          <EmptyState
            icon={<Package className="h-12 w-12 text-muted-foreground" />}
            title="Нет отгрузок"
            description="Создайте первую отгрузку, чтобы начать работу с системой."
            cta={
              <Button variant="primary" icon={<Plus className="h-4 w-4" />}>
                Создать отгрузку
              </Button>
            }
          />
        </Card>
      </section>

      {/* Error State */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-text">Error State</h2>
        <Card>
          <ErrorState
            title="Ошибка загрузки"
            message="Не удалось загрузить данные. Проверьте подключение к интернету и попробуйте снова."
            onRetry={() => console.log('Retry clicked')}
            retryLabel="Попробовать снова"
          />
        </Card>
      </section>

      {/* Navigation Demo */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-text">Navigation Icons</h2>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center space-x-2 p-3 border border-border rounded-lg">
            <Package className="h-5 w-5 text-brand" />
            <span className="text-sm">Отгрузки</span>
          </div>
          <div className="flex items-center space-x-2 p-3 border border-border rounded-lg">
            <Search className="h-5 w-5 text-brand" />
            <span className="text-sm">Поиск</span>
          </div>
          <div className="flex items-center space-x-2 p-3 border border-border rounded-lg">
            <Plus className="h-5 w-5 text-brand" />
            <span className="text-sm">Создать</span>
          </div>
          <div className="flex items-center space-x-2 p-3 border border-border rounded-lg">
            <Bell className="h-5 w-5 text-brand" />
            <span className="text-sm">Уведомления</span>
          </div>
          <div className="flex items-center space-x-2 p-3 border border-border rounded-lg">
            <User className="h-5 w-5 text-brand" />
            <span className="text-sm">Аккаунт</span>
          </div>
        </div>
      </section>
    </Container>
  );
}


