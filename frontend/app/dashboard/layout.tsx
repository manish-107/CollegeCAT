'use client' 

import { useEffect, useState } from 'react'
import Sidebar from './components/Sidebar'
import Header from './components/Header'


const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
 
  const [currentStep, setCurrentStep] = useState<number>(1) 
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };
 
  useEffect(() => {
    const fetchWorkflowStep = async () => {
      const response = await fetch('/api/workflow-step') 
      const data = await response.json()
      setCurrentStep(data.step)
    }

    fetchWorkflowStep()
  }, [])

  return (
    <div className="flex h-screen bg-[var(--background)]">
      {sidebarOpen && <Sidebar currentStep={currentStep} />}
      <div className="flex-1 flex flex-col">
        <Header onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen}/>
        <main className="flex-1 p-4 overflow-auto">{children}</main>
      </div>
    </div>
  )
}

export default DashboardLayout
