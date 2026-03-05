// ─── App.jsx ──────────────────────────────────────────────────────────────────
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthProvider }   from "./context/AuthContext";
import PrivateRoute       from "./components/PrivateRoute";
import Layout             from "./components/Layout";
import Login              from "./pages/Login";
import Dashboard          from "./pages/Dashboard";
import Clients            from "./pages/Clients";
import HistoriqueClient   from "./pages/HistoriqueClient";
import Fournisseurs       from "./pages/Fournisseurs";
import Produits           from "./pages/Produits";
import Factures           from "./pages/Factures";
import Stock              from "./pages/Stock";
import BonCommandes       from "./pages/BonCommandes";
import Export             from "./pages/Export";
import Utilisateurs       from "./pages/Utilisateurs";
import NotFound           from "./pages/NotFound";

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<PrivateRoute />}>
            <Route element={<Layout />}>
              <Route path="/"              element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard"     element={<Dashboard />} />
              <Route path="/clients"       element={<Clients />} />
              <Route path="/clients/:id/historique" element={<HistoriqueClient />} />
              <Route path="/fournisseurs"  element={<Fournisseurs />} />
              <Route path="/produits"      element={<Produits />} />
              <Route path="/factures"      element={<Factures />} />
              <Route path="/stock"         element={<Stock />} />
              <Route path="/bons-commande" element={<BonCommandes />} />
              <Route path="/export"        element={<Export />} />
              <Route path="/utilisateurs"  element={<Utilisateurs />} />
            </Route>
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} theme="dark"
        toastStyle={{ background:"#1e293b", border:"1px solid #334155", color:"#f1f5f9" }} />
    </AuthProvider>
  );
}