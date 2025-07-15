import { ErrorBoundary } from '../overlay/ErrorBoundary';

interface SidebarErrorBoundaryProps {
  children: React.ReactNode;
}

export function SidebarErrorBoundary({ children }: SidebarErrorBoundaryProps) {
  return <ErrorBoundary variant="component">{children}</ErrorBoundary>;
}
