
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { Header } from "@/components/Header";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import { NotificationsProvider } from "@/context/NotificationsContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import Admin from "./pages/Admin";
import AdminUsers from "./pages/AdminUsers";
import AdminOrders from "./pages/AdminOrders";
import AdminUserDetail from "./pages/AdminUserDetail";
import AdminLogin from "./pages/AdminLogin";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import CheckoutProcessing from "./pages/CheckoutProcessing";
import PaymentPage from "./pages/PaymentPage";
import NotFound from "./pages/NotFound";
import Index from "./pages/Index";

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
                    {/* Public routes with admin redirect */}
                    <Route path="/" element={<Index />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/admin/login" element={<AdminLogin />} />
                    <Route path="/checkout/success/:orderId" element={<CheckoutSuccess />} />
                    
                    {/* Tenant-only routes */}
                    <Route element={<ProtectedRoute allowedRoles={['tenant']} redirectPath="/login" />}>
                      <Route path="/dashboard" element={<Dashboard />} />
                      <Route path="/cart" element={<Cart />} />
                      <Route path="/payment" element={<PaymentPage />} />
                      <Route path="/checkout/processing" element={<CheckoutProcessing />} />
                    </Route>
                    
                    {/* Admin-only routes */}
                    <Route element={<ProtectedRoute allowedRoles={['admin']} redirectPath="/admin/login" />}>
                      <Route path="/admin" element={<Admin />} />
                      <Route path="/admin/users" element={<AdminUsers />} />
                      <Route path="/admin/users/:userId" element={<AdminUserDetail />} />
                      <Route path="/admin/orders" element={<AdminOrders />} />
                    </Route>
                    
                    {/* 404 Route */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </main>
                <footer className="bg-muted py-6 px-6 border-t">
                  <div className="container mx-auto flex justify-center items-center space-x-2">
                    <p>© 2025 Proofly. All rights reserved.</p>
                    <span className="mx-2">|</span>
                    <Link 
                      to="/admin/login" 
                      className="text-proofly-purple hover:text-proofly-dark-purple font-medium hover:underline transition-colors"
                    >
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
