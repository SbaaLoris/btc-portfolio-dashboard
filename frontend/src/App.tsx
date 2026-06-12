import { AuthPage } from "./pages/AuthPage";
import { DashboardPage } from "./pages/DashboardPage";
import { useAuth } from "./auth/AuthContext";

export function App() {
  const auth = useAuth();
  return auth.token ? <DashboardPage /> : <AuthPage />;
}

