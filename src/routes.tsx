import MainDashboard from "views/admin/default";

import {
  MdAddBox, MdAdminPanelSettings,
  MdFace, // Beranda
  MdFamilyRestroom,
  MdHome,
  MdMode,
  MdPlusOne
} from "react-icons/md";

import HealthPage from "views/admin/healtSystem";
import AdminPage from "views/admin/manajemenAdmin";
import ModelsPage from "views/admin/manajemenModel";
import ProductsPage from "views/admin/manajemenProduk";
import QRCodesPage from "views/admin/manajemenQrCode";
import ProfileOverview from "views/admin/profile";
import ARViewerPage from "views/admin/ThreeDModel/ARViewerPage";
import SignIn from "views/auth/SignIn";

const routes: any = [
  // ==================== DASHBOARD ====================
  {
    name: "Halaman Utama",
    layout: "/admin",
    path: "default",
    icon: <MdHome className="h-6 w-6" />,
    component: <MainDashboard />,
  },

  // ==================== DATA MASTER ====================
  {
    name: "Manajemen Produk",
    layout: "/admin",
    path: "produk",
    icon: <MdAddBox className="h-6 w-6" />,
    component: <ProductsPage />,
  },
  {
    name: "Manajemen Model",
    layout: "/admin",
    path: "model",
    icon: <MdMode className="h-6 w-6" />,
    component: <ModelsPage />,
  },
  {
    name: "Kesehatan Sisten",
    layout: "/admin",
    path: "kesehatan-sistem",
    icon: <MdPlusOne className="h-6 w-6" />,
    component: <HealthPage />,
  },
  {
    name: "Manajemen Admin",
    layout: "/admin",
    path: "data-admin",
    icon: <MdAdminPanelSettings className="h-6 w-6" />,
    component: <AdminPage />,
  },
  {
    name: "Akun Pengguna",
    layout: "/admin",
    path: "profile",
    icon: <MdFace className="h-6 w-6" />,
    component: <ProfileOverview />,
  },
  {
    name: "Manajemen QrCode",
    layout: "/admin",
    path: "qrCode",
    icon: <MdFamilyRestroom className="h-6 w-6" />,
    component: <QRCodesPage />,
  },
  // {
  //   name: "Scan Analytics",
  //   layout: "/admin",
  //   path: "scan-analytics",
  //   icon: <MdScanner className="h-6 w-6" />,
  //   component: <AnalyticsPage />,
  // },
  // {
  //   path: "ar/:sku",      // ← Dynamic SKU
  //   component: <ARViewerQrCode />,
  //   public: true,         // ← Tandai sebagai public (opsional)
  // },
  {
    layout: "/admin",
    path: "ar",
    component: <ARViewerPage />,
  },
  {
    layout: "/auth",
    path: "sign-in",
    component: <SignIn />,
  },
  // {
  //   name: "Bantuan Kelurahan",
  //   layout: "/admin",
  //   path: "bantuan-kelurahan",
  //   icon: <MdCardGiftcard className="h-6 w-6" />,
  //   subRoutes: [
  //     {
  //       name: "Jenis Bantuan",
  //       layout: "/admin",
  //       path: "jenis-bantuan",
  //       icon: <MdCategory className="h-6 w-6" />,
  //       component: <JenisBantuanPage />,
  //     },
  //     {
  //       name: "Penerima",
  //       layout: "/admin",
  //       path: "penerima-bantuan",
  //       icon: <MdPeople className="h-6 w-6" />,
  //       component: <PenerimaBantuan />,
  //     },
  //   ],
  // },
];

export default routes;