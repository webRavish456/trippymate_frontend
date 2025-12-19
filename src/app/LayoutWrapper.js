'use client';

import { usePathname } from "next/navigation";
import { Provider } from "react-redux";
import store from "@/store/store";
import Footer from "@/component/footer";
import Header from "@/component/header";
import Adventure from "@/component/cta";

export default function LayoutWrapper({ children }) {
  const pathname = usePathname();
  const isAuthPage = pathname?.startsWith('/auth');
  const isProfilePage = pathname === '/profile';
  const isBookingDetailsPage = pathname?.startsWith('/my-bookings/') && pathname !== '/my-bookings';
  const isFeedbackPage = pathname?.includes('/feedback');

  return (
    <Provider store={store}>
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {!isAuthPage && <Header/>}
        <main style={{ flex: 1 }}>
          {children}
        </main>
        {!isAuthPage && !isProfilePage && !isBookingDetailsPage && !isFeedbackPage && <Adventure />}
        {!isAuthPage && <Footer />}
      </div>
    </Provider>
  );
}

