import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useOfficialLogin } from '../../hooks/useOfficialLogin';
import { Lock, AlertCircle } from 'lucide-react';

interface OfficialLoginDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function OfficialLoginDialog({
  open,
  onOpenChange,
  onSuccess,
}: OfficialLoginDialogProps) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useOfficialLogin();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    setTimeout(() => {
      const success = login(userId, password);
      setIsLoading(false);

      if (success) {
        setUserId('');
        setPassword('');
        setError('');
        onOpenChange(false);
        onSuccess();
      } else {
        setError('अमान्य उपयोगकर्ता आईडी या पासवर्ड। कृपया पुनः प्रयास करें।');
      }
    }, 500);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setUserId('');
      setPassword('');
      setError('');
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Lock className="h-5 w-5 text-primary" />
            Official Login
          </DialogTitle>
          <DialogDescription>
            कृपया अपनी उपयोगकर्ता आईडी और पासवर्ड दर्ज करें
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="userId">User ID</Label>
            <Input
              id="userId"
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="उपयोगकर्ता आईडी दर्ज करें"
              required
              disabled={isLoading}
              autoComplete="username"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="पासवर्ड दर्ज करें"
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isLoading}
              className="flex-1"
            >
              रद्द करें
            </Button>
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? 'लॉगिन हो रहा है...' : 'लॉगिन करें'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
