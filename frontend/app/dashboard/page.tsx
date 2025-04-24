import Sidebar from '@/components/dashboard/Sidebar';
import Background from '@/components/dashboard/Background';
import KanbanBoard from '@/components/dashboard/KanbanBoard';
import Header from '@/components/dashboard/Header';
import HeaderDetails from '@/components/dashboard/HeaderDetails';

export default function DashboardPage() {
  return (
    <div className="relative h-screen w-screen overflow-hidden bg-gray-900 text-white">
      <Background />
      <div className="relative z-10 flex h-full">
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
