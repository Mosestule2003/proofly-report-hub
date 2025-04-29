
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationsProvider } from "@/context/NotificationsContext";

// Pages
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import AdminLogin from "./pages/AdminLogin";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <NotificationsProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <div className="min-h-screen flex flex-col">
                <Header />
                <main className="flex-grow">
                  <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/cart" element={<Cart />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/checkout/success/:orderId" element={<CheckoutSuccess />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <footer className="bg-muted py-6 px-6 border-t">
                  <div className="container mx-auto flex justify-center items-center">
                    <p className="mr-3">© 2025 Proofly. All rights reserved.</p>
                    <Link to="/admin/login" className="text-primary font-medium hover:underline transition-colors border-l pl-3 border-muted-foreground/30">
                      Admin Login
                    </Link>
                  </div>
                </footer>
              </div>
            </BrowserRouter>
          </TooltipProvider>
        </NotificationsProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
