import { Suspense } from "react";
import AdminSidebar from "./components/AdminSidebar";
import styles from "./admin.module.css";

export default function AdminLayout({ children }) {
  return (
    <div className={styles.adminLayout}>
      <Suspense fallback={null}>
        <AdminSidebar />
      </Suspense>
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
