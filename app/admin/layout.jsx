import AdminSidebar from "./components/AdminSidebar";
import styles from "./admin.module.css";

export default function AdminLayout({ children }) {
  return (
    <div className={styles.adminLayout}>
      <AdminSidebar />
      <main className={styles.mainContent}>{children}</main>
    </div>
  );
}
