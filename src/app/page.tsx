
import TaskManager from "@/component/TaskManager";
import MembersTimeline from "@/component/Timeline/MembersTimeline";

export default function Home() {
  return (
    <main className="min-h-screen">
      <TaskManager />
      <div className="min-h-screen bg-gray-50 p-8">
        <h1 className="text-4xl font-serif text-center mb-8">Members Dashboard</h1>
        <div className="max-w-7xl mx-auto h-[600px]">
          <MembersTimeline />
        </div>
      </div>
    </main>
  );
}
