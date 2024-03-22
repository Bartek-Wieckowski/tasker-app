import { useDeleteAccount } from '@/api/mutations/users/useDeleteAccount';
import { useLogoutAccount } from '@/api/mutations/users/useLogoutAccount';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { LogOut, PocketKnife } from 'lucide-react';
import Loader from './Loader';
import { Loader as LoaderIcon } from 'lucide-react';

const UserPanel = () => {
  const { deleteUser, isDeleting } = useDeleteAccount();
  const { logoutUser, isLogouting } = useLogoutAccount();
  const { currentUser } = useAuth();

  return (
    <Popover>
      <PopoverTrigger asChild className="cursor-pointer">
        <Avatar>
          <AvatarImage src={currentUser?.imageUrl} alt={currentUser?.username} />
          <AvatarFallback>
            <LoaderIcon className="animate-spin" />
          </AvatarFallback>
        </Avatar>
      </PopoverTrigger>
      <PopoverContent className="w-40">
        <div className="flex flex-col gap-2">
          <p className="text-center text-sm">
            Welcome <span className="text-teal-600 italic">{currentUser?.username}</span> !
          </p>
          {currentUser.providerId !== 'google.com' && (
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <span className="flex items-center gap-2">
                    <PocketKnife className="w-[12px] h-[12px]" />
                    Settings
                  </span>
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit profile</DialogTitle>
                  <DialogDescription>Make changes to your profile here. Click save when you're done.</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-4 items-center gap-4 p-4">
                  <Label htmlFor="name" className="text-right">
                    Name
                  </Label>
                  <Input id="name" defaultValue="Pedro Duarte" className="col-span-3" />
                </div>
                <DialogFooter>
                  <Button type="submit">Save settings</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <Button onClick={() => logoutUser()}>
            {isLogouting ? (
              <div className="flex items-center gap-2">
                <Loader />
                Logout...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogOut className="w-[12px] h-[12px]" />
                Log Out
              </div>
            )}
          </Button>
          <Button variant="destructive" onClick={() => deleteUser()}>
            {isDeleting ? (
              <div className="flex gap-2">
                <Loader />
                Deleting...
              </div>
            ) : (
              'Delete Account'
            )}
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default UserPanel;
