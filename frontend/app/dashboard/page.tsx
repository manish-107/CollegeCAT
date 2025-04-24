import Sidebar from '@/components/dashboard/Sidebar';
import Background from '@/components/dashboard/Background';
import KanbanBoard from '@/components/dashboard/KanbanBoard';
import Header from '@/components/dashboard/Header';
import HeaderDetails from '@/components/dashboard/HeaderDetails';

export default function DashboardPage() {
  return (
    <div className="relative bg-gray-900 w-screen h-screen overflow-hidden text-white">
      <Background />
      <div className="z-10 relative flex h-full">
        <Sidebar />
        <div className="flex-1 p-6 overflow-auto">
          <Header/>
          <HeaderDetails/>
          <KanbanBoard />
        </div>
      </div>
    </div>
  );
}
