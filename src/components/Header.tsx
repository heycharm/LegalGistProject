
import { FileTextIcon } from 'lucide-react';
import { ModeToggle } from '@/components/ModeToggle';
import UserAuthButton from '@/components/UserAuthButton';
import ApiKeyForm from '@/components/ApiKeyForm';

const Header = () => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 border-b bg-background z-50 flex items-center px-4">
      <div className="flex items-center justify-between w-full max-w-7xl mx-auto">
        <div className="flex items-center gap-2">
          <FileTextIcon className="h-6 w-6 text-primary" />
          <h1 className="font-bold text-xl">LegalGist</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <ApiKeyForm />
          <UserAuthButton />
          <ModeToggle />
        </div>
      </div>
    </header>
  );
};

export default Header;
