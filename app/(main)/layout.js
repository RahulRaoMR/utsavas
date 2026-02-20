import TopNavBar from "../components/TopNavBar";

export default function MainLayout({ children }) {
  return (
    <>
      <TopNavBar />
      {children}
    </>
  );
}
