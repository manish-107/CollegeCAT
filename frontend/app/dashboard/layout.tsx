import { YearBatchProvider } from './context/YearBatchContext';
import { UserProvider } from './context/UserContext';
import QueryProvider from '../providers/QueryProvider';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <UserProvider>
        <YearBatchProvider>
          <main>{children}</main>
        </YearBatchProvider>
      </UserProvider>
    </QueryProvider>
  )
}
