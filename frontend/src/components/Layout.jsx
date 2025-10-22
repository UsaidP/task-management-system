import Header from "./Header"
import Sidebar from "./layout/Sidebar"

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen bg-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default Layout
