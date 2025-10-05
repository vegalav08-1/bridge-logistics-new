import * as React from 'react';

export function Container({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-screen-sm px-4">{children}</div>;
}
