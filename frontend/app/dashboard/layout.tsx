import { YearBatchProvider } from './context/YearBatchContext';
import QueryProvider from '../providers/QueryProvider';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <YearBatchProvider>
        <main>{children}</main>
      </YearBatchProvider>
    </QueryProvider>
  )
}