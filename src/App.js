import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider } from "./context/AuthContext";
import PrivateRoute     from "./components/PrivateRoute";
import Layout           from "./components/Layout";

import Login        from "./pages/Login";
import Dashboard    from "./pages/Dashboard";
import Clients      from "./pages/Clients";
import Fournisseurs from "./pages/Fournisseurs";
import Produits     from "./pages/Produits";
import Factures     from "./pages/Factures";
import Stock        from "./pages/Stock";
import BonCommandes from "./pages/BonCommandes";
import Export       from "./pages/Export";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Route publique */}
          <Route path="/login" element={<Login />} />

          {/* Routes protégées */}
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/"              element={<Navigate to="/login" />} />
              <Route path="/dashboard"     element={<Dashboard />} />
              <Route path="/clients"       element={<Clients />} />
              <Route path="/fournisseurs"  element={<Fournisseurs />} />
              <Route path="/produits"      element={<Produits />} />
              <Route path="/factures"      element={<Factures />} />
              <Route path="/stock"         element={<Stock />} />
              <Route path="/bons-commande" element={<BonCommandes />} />
              <Route path="/export"        element={<Export />} />
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />
    </AuthProvider>
  );
}