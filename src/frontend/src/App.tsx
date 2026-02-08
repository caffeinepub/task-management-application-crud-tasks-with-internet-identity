import { useEffect, useRef } from 'react';
import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useCurrentUserProfile';
import { useQueryClient } from '@tanstack/react-query';
import { isAuthorizationError } from './utils/isAuthorizationError';
import SignedOutScreen from './components/Auth/SignedOutScreen';
import ProfileSetupDialog from './components/Auth/ProfileSetupDialog';
import TaskPage from './components/Tasks/TaskPage';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

export default function App() {
  const { identity, loginStatus, clear, isInitializing } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched, error } = useGetCallerUserProfile();
  const queryClient = useQueryClient();
  const hasHandledAuthError = useRef(false);

  const isAuthenticated = !!identity;

  // Handle authorization errors by clearing session and showing signed-out screen
  useEffect(() => {
    if (isAuthenticated && error && isAuthorizationError(error) && !hasHandledAuthError.current) {
      hasHandledAuthError.current = true;
      const handleAuthError = async () => {
        await clear();
        queryClient.clear();
      };
      handleAuthError();
    }
  }, [isAuthenticated, error, clear, queryClient]);

  // Reset the error handler flag when user logs out
  useEffect(() => {
    if (!isAuthenticated) {
      hasHandledAuthError.current = false;
    }
  }, [isAuthenticated]);

  // Show signed-out landing screen during initialization or when not authenticated
  // This prevents any Access Denied flash during initial load
  if (isInitializing || !isAuthenticated) {
    return <SignedOutScreen />;
  }

  // Show profile setup if authenticated but no profile exists
  const showProfileSetup = isAuthenticated && !profileLoading && isFetched && userProfile === null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {showProfileSetup ? (
          <ProfileSetupDialog open={true} />
        ) : (
          <TaskPage />
        )}
      </main>
      <Footer />
    </div>
  );
}
