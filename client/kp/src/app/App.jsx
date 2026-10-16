import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import { CartProvider } from '@/cart/CartProvider';
import { AuthProvider } from '@/context/AuthContext';
import { AuthModal } from '@/components/auth/AuthModal/AuthModal';
import { ProfileModal } from '@/components/auth/ProfileModal/ProfileModal';
import { CartDrawer } from '@/components/cart/CartDrawer/CartDrawer';
import { Footer } from '@/components/layout/Footer/Footer';
import { ScrollToTop } from '@/components/routing/ScrollToTop/ScrollToTop';
import { ProtectedRoute } from '@/components/routing/ProtectedRoute/ProtectedRoute';
import { HomePage } from '@/pages/HomePage/HomePage';
import { NotFoundPage } from '@/pages/NotFoundPage/NotFoundPage';
import { AboutPage } from '@/pages/AboutPage/AboutPage';
import { ContactPage } from '@/pages/ContactPage/ContactPage';
import { FaqPage } from '@/pages/FaqPage/FaqPage';
import { ProductDetailPage } from '@/pages/ProductDetailPage/ProductDetailPage';
import { ProductsPage } from '@/pages/ProductsPage/ProductsPage';
import { ReviewsPage } from '@/pages/ReviewsPage/ReviewsPage';
import { AdminPage } from '@/pages/AdminPage/AdminPage';
import { MyOrdersPage } from '@/pages/MyOrdersPage/MyOrdersPage';
import { FoundationPage } from '@/pages/FoundationPage/FoundationPage';

function RootLayout() {
  return (
    <>
      <ScrollToTop />
      <Outlet />
      <Footer />
    </>
  );
}

const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { path: '', element: <HomePage /> },
      { path: 'products', element: <ProductsPage /> },
      { path: 'products/:slug', element: <ProductDetailPage /> },
      { path: 'festival-specials', element: <ProductsPage /> },
      { path: 'reviews', element: <ReviewsPage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'faq', element: <FaqPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'my-orders', element: <MyOrdersPage /> },
      { path: 'foundation', element: <FoundationPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  // Admin is standalone — no Footer, no public Header.
  // ProtectedRoute blocks rendering + redirects non-admins before any child mounts.
  { path: '/admin', element: <ProtectedRoute><AdminPage /></ProtectedRoute> },
]);

export function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <RouterProvider router={router} />
                <CartDrawer />
                <AuthModal />
                <ProfileModal />
            </CartProvider>
        </AuthProvider>
    );
}


