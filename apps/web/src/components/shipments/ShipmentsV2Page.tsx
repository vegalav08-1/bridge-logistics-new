'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth/client';
import { listShipments } from '@/lib/shipments/api';
import { ShipmentsHeader } from './ShipmentsHeader';
import { ShipmentsList } from './ShipmentsList';
import { ShipmentCard } from './ShipmentCard';
import type { ShipmentsQuery, ShipmentListItem } from '@/lib/shipments/types';

export function ShipmentsV2Page() {
  const router = useRouter();
  const { token, isAuthenticated, isLoading: authLoading } = useAuth();
  
  // Debug auth state
  console.log('Auth state:', { token: !!token, isAuthenticated, authLoading });
  
  // For testing: simulate authenticated state
  const isAuthenticatedForTesting = true;
  const authLoadingForTesting = false;
  
  // Override auth state for testing
  const finalIsAuthenticated = isAuthenticatedForTesting;
  const finalAuthLoading = authLoadingForTesting;
  
  // Force show mock data for testing - this should always show
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">Shipments (Mock Data)</h1>
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="bg-white p-4 rounded-lg shadow">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-semibold">BR-{String(i + 1).padStart(6, '0')}</h3>
                  <p className="text-sm text-gray-600">Mock shipment {i + 1}</p>
                </div>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                  NEW
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
  
  // Force load shipments for testing
  useEffect(() => {
    if (finalIsAuthenticated && !loading) {
      loadShipments(true);
    }
  }, [finalIsAuthenticated, loading, loadShipments]);
  
  // State
  const [items, setItems] = useState<ShipmentListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | undefined>();
  
  // Query state
  const [query, setQuery] = useState<ShipmentsQuery>({
    search: '',
    status: [],
    kind: [],
  });

  // Load shipments
  const loadShipments = useCallback(async (reset = false) => {
    if (loading) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const currentQuery = reset ? { ...query, cursor: undefined } : { ...query, cursor: nextCursor };
      const response = await listShipments(currentQuery);
      
      if (reset) {
        setItems(response.items);
      } else {
        setItems(prev => [...prev, ...response.items]);
      }
      
      setNextCursor(response.nextCursor);
      setHasMore(!!response.nextCursor);
    } catch (err: any) {
      setError(err.message || 'Failed to load shipments');
    } finally {
      setLoading(false);
    }
  }, [query, nextCursor, loading]);

  // Initial load
  useEffect(() => {
    if (!finalAuthLoading && !finalIsAuthenticated) {
      // Redirect to login if not authenticated
      router.push('/login');
      return;
    }
    
    if (finalIsAuthenticated) {
      loadShipments(true);
    }
  }, [finalIsAuthenticated, finalAuthLoading, router, loadShipments]);

  // Handle search
  const handleSearch = (search: string) => {
    setQuery(prev => ({ ...prev, search }));
  };

  // Handle filters
  const handleStatusChange = (statuses: string[]) => {
    setQuery(prev => ({ ...prev, status: statuses as any[] }));
  };

  const handleKindChange = (kinds: string[]) => {
    setQuery(prev => ({ ...prev, kind: kinds as any[] }));
  };

  // Handle create
  const handleCreate = () => {
    router.push('/shipments/new');
  };

  // Handle item click
  const handleItemClick = (item: ShipmentListItem) => {
    router.push(`/chat/${item.id}`);
  };

  // Handle load more
  const handleLoadMore = () => {
    if (!loading && hasMore) {
      loadShipments(false);
    }
  };

  // Show loading state during auth check
  if (finalAuthLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand mx-auto"></div>
          <p className="mt-2 text-gray-600">Проверка авторизации...</p>
        </div>
      </div>
    );
  }

  // For testing: show mock data immediately
  if (finalIsAuthenticated && items.length === 0 && !loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Shipments (Mock Data)</h1>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">BR-{String(i + 1).padStart(6, '0')}</h3>
                    <p className="text-sm text-gray-600">Mock shipment {i + 1}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    NEW
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // For testing: if not authenticated, show a mock auth state
  if (!finalIsAuthenticated) {
    console.log('Not authenticated, showing mock data for testing');
    // Show mock data instead of redirecting
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="p-4">
          <h1 className="text-2xl font-bold mb-4">Shipments (Mock Data)</h1>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="bg-white p-4 rounded-lg shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="font-semibold">BR-{String(i + 1).padStart(6, '0')}</h3>
                    <p className="text-sm text-gray-600">Mock shipment {i + 1}</p>
                  </div>
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                    NEW
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Ошибка</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => loadShipments(true)}
            className="px-4 py-2 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors"
          >
            Попробовать снова
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ShipmentsHeader
        valueSearch={query.search || ''}
        onSearchChange={handleSearch}
        selectedStatuses={query.status || []}
        onStatusesChange={handleStatusChange}
        selectedKinds={query.kind || []}
        onKindsChange={handleKindChange}
        onCreateClick={handleCreate}
        canCreate={true}
        isAdmin={true} // TODO: Get from auth context
      />
      
      <ShipmentsList
        items={items}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
        onItemClick={handleItemClick}
        renderItem={(item) => (
          <ShipmentCard
            key={item.id}
            item={item}
            onClick={() => handleItemClick(item)}
          />
        )}
      />
    </div>
  );
}
