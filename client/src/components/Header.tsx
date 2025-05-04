import { useUser } from "@/context/UserContext";
import { MoonIcon } from "lucide-react";

export default function Header() {
  const { user } = useUser();
  
  return (
    <header className="px-4 py-4 flex items-center justify-between border-b border-gray-200 bg-white">
      <div className="flex items-center">
        <div className="w-10 h-10 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
          <MoonIcon className="h-5 w-5" />
        </div>
        <h1 className="ml-3 text-xl font-semibold text-neutral-800">MoodMoney</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-neutral-500 hover:text-neutral-700">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>
        {user && (
          <div className="w-9 h-9 bg-primary-100 text-primary rounded-full flex items-center justify-center">
            <span className="text-sm font-medium">{user.initials}</span>
          </div>
        )}
      </div>
    </header>
  );
}
