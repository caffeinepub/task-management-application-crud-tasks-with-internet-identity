import { useInternetIdentity } from './hooks/useInternetIdentity';
import { useGetCallerUserProfile } from './hooks/useCurrentUserProfile';
import SignedOutScreen from './components/Auth/SignedOutScreen';
import ProfileSetupDialog from './components/Auth/ProfileSetupDialog';
import TaskPage from './components/Tasks/TaskPage';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';
import AccessDeniedScreen from './components/Error/AccessDeniedScreen';

export default function App() {
  const { identity, loginStatus } = useInternetIdentity();
  const { data: userProfile, isLoading: profileLoading, isFetched, error } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;
  const isInitializing = loginStatus === 'initializing';

  // Show access denied if there's an authorization error
  if (error && error.message.includes('Unauthorized')) {
    return <AccessDeniedScreen />;
  }

  // Show loading state during initialization
  if (isInitializing) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
          <p className="mt-4 text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  // Show signed out screen if not authenticated
  if (!isAuthenticated) {
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
