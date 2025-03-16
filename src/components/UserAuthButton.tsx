
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserIcon, LogOutIcon } from 'lucide-react';
import LoginForm from '@/components/LoginForm';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const UserAuthButton = () => {
  const { user, logout } = useAuth();
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  return user ? (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UserIcon className="h-4 w-4" />
          <span className="hidden md:inline">{user.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleLogout}>
          <LogOutIcon className="h-4 w-4 mr-2" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  ) : (
    <Dialog open={isLoginDialogOpen} onOpenChange={setIsLoginDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <UserIcon className="h-4 w-4" />
          <span className="hidden md:inline">Sign In</span>
        </Button>
      </DialogTrigger>
      <DialogContent className="p-0">
        <LoginForm onClose={() => setIsLoginDialogOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default UserAuthButton;
