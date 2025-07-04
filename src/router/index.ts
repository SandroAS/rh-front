import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

import LayoutSite from '@/layouts/LayoutSite.vue'
import LayoutAuth from '@/layouts/LayoutAuth.vue'
import LayoutSystem from '@/layouts/LayoutSystem.vue'

import Home from '@/pages/site/Home.vue'
import Login from '@/pages/auth/Login.vue'
import Register from '@/pages/auth/Register.vue'
import Dashboard from '@/pages/system/Dashboard.vue'
import MyAccount from '@/pages/system/MyAccount.vue'
import Settings from '@/pages/system/Settings.vue'
import Patients from '@/pages/system/Patients.vue'
import PatientRecord from '@/components/system/patient/PatientRecord.vue'
import Budgets from '@/pages/system/Budgets.vue'
import Appointments from '@/pages/system/Appointments.vue'
import Schedules from '@/pages/system/Schedules.vue'
import GoogleAuthCallback from '@/pages/auth/GoogleAuthCallback.vue'
import { useUserStore } from '@/stores/user.store'

const SISTEM_NAME = 'Soft Clinic';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: LayoutSite,
    children: [
      {
        path: '',
        name: 'home',
        component: Home,
        meta: { isPublic: true, title: 'Home - '+SISTEM_NAME }
      }
    ]
  },
  {
    path: '/auth',
    component: LayoutAuth,
    children: [
      {
        path: 'login',
        name: 'login',
        component: Login,
        meta: { isPublic: true, title: 'Login - '+SISTEM_NAME }

      },
      {
        path: 'register',
        name: 'register',
        component: Register,
        meta: { isPublic: true, title: 'Registro - '+SISTEM_NAME }

      },
      {
        path: 'google-auth-callback',
        name: 'gloogleAuthCallback',
        component: GoogleAuthCallback,
        meta: { isPublic: true, title: 'Google Auth Callback - '+SISTEM_NAME }
      }
    ]
  },
  {
    path: '/system',
    component: LayoutSystem,
    children: [
      {
        path: 'dashboard',
        name: 'dashboard',
        component: Dashboard,
        meta: { isPublic: false, title: 'Dashboard - '+SISTEM_NAME }
      },
      {
        path: 'minha-conta',
        name: 'myAccount',
        component: MyAccount,
        meta: { isPublic: false, title: 'Minha Conta - '+SISTEM_NAME }
      },
      {
        path: 'configuracoes',
        name: 'settings',
        component: Settings,
        meta: { isPublic: false, title: 'Configurações - '+SISTEM_NAME }
      },
      {
        path: 'pacientes',
        name: 'patients',
        component: Patients,
        meta: { isPublic: false, title: 'Pacientes - '+SISTEM_NAME }
      },
      {
        path: 'pacientes/:id',
        name: 'patientRecord',
        component: PatientRecord,
        props: true,
        meta: { isPublic: false, title: 'Ficha de Paciente - '+SISTEM_NAME }
      },
      {
        path: 'orcamentos',
        name: 'budgets',
        component: Budgets,
        meta: { isPublic: false, title: 'Orçamentos - '+SISTEM_NAME }
      },
      {
        path: 'atendimentos',
        name: 'appointments',
        component: Appointments,
        meta: { isPublic: false, title: 'Atendimentos - '+SISTEM_NAME }
      },
      {
        path: 'agendamentos',
        name: 'schedules',
        component: Schedules,
        meta: { isPublic: false, title: 'Agendamentos - '+SISTEM_NAME }
      }
    ]
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to, from, next) => {
  const userStore = useUserStore();

  if (!userStore.user && to.name != 'gloogleAuthCallback') {
    try {
      await userStore.fetchUser();
    } catch (error) {
      console.error('[AuthMiddleware] Falha ao carregar usuário via token:', error);
      if(to.name != 'login') userStore.logout();
    }
  }

  const isPublic = to.meta.isPublic;
  const isLoggedIn = userStore.user;

  if (!isPublic && !isLoggedIn) {
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else if (isLoggedIn && isPublic) {
    next({ name: 'dashboard' });
  } else {
    next();
  }

  const defaultTitle = SISTEM_NAME;
  document.title = (to.meta.title ? `${to.meta.title} | ${defaultTitle}` : defaultTitle) as string;
});

export default router
