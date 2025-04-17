import { Link, Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col ">
      <header className="bg-accent2 text-white p-4 flex justify-between items-center shadow-md">
        <h1 className="text-xl font-medium m-0">Sayıya Göre Boyama</h1>
        <nav className="flex gap-4">
          <Link to="/" className=" no-underline py-2 px-3 hover:underline">
            Ana Sayfa
          </Link>
          <Link
            to="/prepare"
            className=" no-underline py-2 px-3 hover:underline"
          >
            Özel SVG Yükle
          </Link>
        </nav>
      </header>

      <main className="flex-1 p-8 max-w-screen-xl w-full mx-auto">
        <Outlet />
      </main>

      <footer className="bg-gray-100 p-4 text-center text-sm text-gray-600 border-t border-gray-200">
        <p>&copy; {new Date().getFullYear()} SVG Boyama Uygulaması</p>
      </footer>
    </div>
  );
};

export default Layout;
