# 🔧 NexusGarage OS

<div align="center">

  <img src="https://github.com/user-attachments/assets/b0f6f802-d2bb-47da-8af5-4ea12963250e" alt="NexusGarage Banner" width="100%" />
  
  <p align="center">
    <strong>El sistema operativo integral para la gestión de talleres mecánicos modernos.</strong>
  </p>

  <p align="center">
    <a href="https://nextjs.org">
      <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js" />
    </a>
    <a href="https://www.typescriptlang.org/">
      <img src="https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript" alt="TypeScript" />
    </a>
    <a href="https://tailwindcss.com/">
      <img src="https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwindcss" alt="Tailwind CSS" />
    </a>
    <a href="https://www.prisma.io/">
      <img src="https://img.shields.io/badge/Prisma-ORM-2d3748?style=flat-square&logo=prisma" alt="Prisma" />
    </a>
    <a href="https://clerk.com/">
      <img src="https://img.shields.io/badge/Auth-Clerk-6c47ff?style=flat-square&logo=clerk" alt="Clerk" />
    </a>
  </p>
</div>

---

## 🚀 Sobre el Proyecto

**NexusGarage** es una plataforma SaaS (Software as a Service) diseñada para digitalizar y optimizar la operativa diaria de talleres automotrices. Resuelve el caos administrativo permitiendo a los dueños de talleres gestionar múltiples sucursales, controlar el flujo de caja, inventario y reparaciones en tiempo real.

Lo que diferencia a NexusGarage es su enfoque en la experiencia de usuario (UX) y la integración de **NexusBot**, un asistente virtual inteligente capaz de realizar cálculos, guardar notas y navegar por el sistema mediante lenguaje natural.

## ✨ Características Principales

### 🛠️ Gestión Operativa
* **Multi-Tenancy:** Arquitectura robusta que permite gestionar múltiples talleres con una sola cuenta.
* **Órdenes de Trabajo (OT):** Ciclo de vida completo desde la recepción del vehículo, diagnóstico, presupuesto hasta la entrega.
* **Control de Flota:** Historial clínico de cada vehículo por patente.
* **Gestión de Clientes:** Base de datos CRM integrada.

### 🤖 NexusBot AI (Asistente Inteligente)
Un copiloto virtual integrado en la plataforma:
* **Navegación por Voz/Texto:** "Llevame a órdenes", "Crear nuevo cliente".
* **Herramientas Rápidas:** Calculadora de IVA integrada y Bloc de Notas persistente.
* **Búsqueda Inteligente:** Algoritmos *Fuzzy Search* para detectar patentes y RUTs incluso con errores de escritura.
* **Interfaz Conversacional:** UI moderna tipo chat con sugerencias dinámicas.

### 📊 Financiero & Dashboard
* **Métricas en Tiempo Real:** Ingresos mensuales, vehículos en taller y tickets promedio.
* **Inventario:** Control de stock de repuestos y servicios.

## 🛠️ Stack Tecnológico

* **Frontend:** [Next.js 14](https://nextjs.org/) (App Router), React, Lucide Icons.
* **Estilos:** [Tailwind CSS](https://tailwindcss.com/), [Shadcn/ui](https://ui.shadcn.com/) (Componentes accesibles).
* **Backend:** Server Actions (Next.js), API Routes.
* **Base de Datos:** PostgreSQL (Vía Neon/Supabase/Railway).
* **ORM:** [Prisma](https://www.prisma.io/).
* **Autenticación:** [Clerk Auth](https://clerk.com/).
* **Despliegue:** [Vercel](https://vercel.com/).

## 📸 Capturas de Pantalla

| Dashboard Principal | Asistente NexusBot |
|:-------------------:|:------------------:|
| <img src="https://github.com/user-attachments/assets/8d27e56d-4f21-4a42-97fe-2b4500268042" alt="Dashboard Principal" width="100%" /> | <img src="https://github.com/user-attachments/assets/81350184-2052-43bf-b6be-7767d372c3b3" alt="NexusBot Preview" width="100%" /> |

## ⚡ Instalación y Despliegue Local

Sigue estos pasos para levantar el proyecto en tu máquina local:

1.  **Clonar el repositorio:**
    ```bash
    git clone [https://github.com/CristoferAltamirano/nexusgarage.git](https://github.com/CristoferAltamirano/nexusgarage.git)
    cd nexusgarage
    ```

2.  **Instalar dependencias:**
    ```bash
    npm install
    # o
    yarn install
    ```

3.  **Configurar Variables de Entorno:**
    Crea un archivo `.env` en la raíz basado en el `.env.example`:
    ```env
    NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
    CLERK_SECRET_KEY=sk_test_...
    DATABASE_URL="postgresql://user:password@host:port/db?schema=public"
    ```

4.  **Sincronizar Base de Datos:**
    ```bash
    npx prisma generate
    npx prisma db push
    ```

5.  **Correr el servidor de desarrollo:**
    ```bash
    npm run dev
    ```

    Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 🤝 Contribución

Las contribuciones son bienvenidas. Por favor, sigue estos pasos:
1.  Haz un Fork del proyecto.
2.  Crea una rama para tu feature (`git checkout -b feature/NuevaFeature`).
3.  Haz Commit de tus cambios (`git commit -m 'feat: Agregada nueva funcionalidad'`).
4.  Haz Push a la rama (`git push origin feature/NuevaFeature`).
5.  Abre un Pull Request.

## 📄 Licencia

Distribuido bajo la licencia MIT. Ver `LICENSE` para más información.

---

<div align="center">
  Hecho con ❤️ y mucho café por <strong>Cristofer Altamirano</strong>.
</div>
