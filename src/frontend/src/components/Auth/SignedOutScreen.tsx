import { useInternetIdentity } from '../../hooks/useInternetIdentity';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckSquare, Loader2 } from 'lucide-react';

export default function SignedOutScreen() {
  const { login, loginStatus } = useInternetIdentity();

  const isLoggingIn = loginStatus === 'logging-in';

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <CheckSquare className="h-10 w-10 text-primary" />
          </div>
          <div>
            <CardTitle className="text-3xl mb-2">Task Manager 2.0</CardTitle>
            <CardDescription className="text-base">
              Organize your work with advanced task management features
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <img
            src="/assets/generated/empty-state-clipboard.dim_1200x800.png"
            alt="Task Management"
            className="w-full max-w-md mx-auto rounded-lg opacity-90"
          />
          <div className="space-y-3 text-center">
            <h3 className="font-semibold text-lg">Features</h3>
            <ul className="text-sm text-muted-foreground space-y-2 max-w-md mx-auto text-left">
              <li>✓ Create and organize tasks with priorities and tags</li>
              <li>✓ Track due dates with intelligent reminders</li>
              <li>✓ Kanban board view for visual task management</li>
              <li>✓ Advanced filtering and sorting options</li>
              <li>✓ Keyboard shortcuts for power users</li>
              <li>✓ Dark mode support</li>
            </ul>
          </div>
          <div className="text-center">
            <Button onClick={login} disabled={isLoggingIn} size="lg" className="gap-2">
              {isLoggingIn ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign in to get started'
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
