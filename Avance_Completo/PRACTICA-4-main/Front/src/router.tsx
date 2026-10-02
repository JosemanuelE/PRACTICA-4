import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import LoginView from './view/LoginView'
import RegisterView from './view/RegisterView'
import HomeView from './view/HomeView'
import PlanAccionView from './view/PlanAccionView'
import LeyesView from './view/LeyesView'
import DiagnosticoView from './view/DiagnosticoView'
import EvolucionView from './view/EvolucionView'
import PagLayout from './layout/PagLayout'
import CpanelLoginView from './view/CpanelLoginView'
import CpanelDashboardView from './view/CpanelDashboardView'
import VerifyEmailView from './view/VerifyEmailView'
import ForgotPasswordView from './view/ForgotPasswordView'
import ResetPasswordView from './view/ResetPasswordView'
import CommunityView from './view/CommunityView'

export default function Router() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Navigate to="/pag/home" replace />} />
                <Route path="/auth/login" element={<LoginView />} />
                <Route path="/auth/register" element={<RegisterView />} />
                <Route path="/auth/verify-email" element={<VerifyEmailView />} />
                <Route path="/auth/forgot-password" element={<ForgotPasswordView />} />
                <Route path="/auth/reset-password" element={<ResetPasswordView />} />
                <Route path="/cpanel" element={<CpanelLoginView />} />
                <Route path="/cpanel/dashboard" element={<CpanelDashboardView />} />
                <Route element={<PagLayout />}>
                    <Route path="/pag/home" element={<HomeView />} />
                    <Route path="/pag/plan-accion" element={<PlanAccionView />} />
                    <Route path="/pag/cursos" element={<Navigate to="/pag/plan-accion" replace />} />
                    <Route path="/pag/leyes" element={<LeyesView />} />
                    <Route path="/pag/diagnostico" element={<DiagnosticoView />} />
                    <Route path="/pag/evolucion" element={<EvolucionView />} />
                    <Route path="/pag/comunidad" element={<CommunityView />} />
                    <Route path="/pag/comunidad/:topicId" element={<CommunityView />} />
                </Route>
            </Routes>
        </BrowserRouter>
    )
}