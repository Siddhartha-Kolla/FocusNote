import { Button } from "./ui/button";

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const navItems = [
    { name: 'Home', id: 'home' },
    { name: 'Features', id: 'features' },
    { name: 'How It Works', id: 'demo' },
    { name: 'Dashboard', id: 'dashboard' },
    { name: 'Timetable', id: 'timetable' },
    { name: 'Mock Exam', id: 'mockexam' },
    { name: 'About', id: 'about' }
  ];

  return (
    <header className="w-full border-b border-border bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div 
            className="cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <h2 className="text-primary">FocusNote</h2>
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`transition-colors hover:text-primary ${
                  currentPage === item.id ? 'text-primary' : 'text-muted-foreground'
                }`}
              >
                {item.name}
              </button>
            ))}
          </nav>

          <Button 
            onClick={() => onNavigate('dashboard')}
            className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6"
          >
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
}