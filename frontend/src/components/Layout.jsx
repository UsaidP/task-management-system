import Header from "./Header";
import Sidebar from "./layout/Sidebar";

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-light-bg-primary dark:bg-dark-bg-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-light-bg-secondary dark:bg-dark-bg-secondary p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
