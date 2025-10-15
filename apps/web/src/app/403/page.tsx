'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Shield, ArrowLeft } from 'lucide-react';

export default function ForbiddenPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <div className="mx-auto h-16 w-16 text-red-500">
            <Shield className="h-16 w-16" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            Доступ запрещен
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            У вас нет прав для доступа к этой странице
          </p>
        </div>

        <Card className="p-8">
          <div className="space-y-4">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Недостаточно прав
              </h3>
              <p className="text-sm text-gray-600">
                Для доступа к этой странице требуются права администратора
              </p>
            </div>

            <div className="flex flex-col space-y-3">
              <Button
                onClick={() => router.back()}
                variant="outline"
                className="w-full"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Назад
              </Button>
              
              <Button
                onClick={() => router.push('/')}
                className="w-full"
              >
                На главную
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}