import { ImageResponse } from "next/og";

// Configuración del tamaño (Estándar para favicons)
export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

// Generación del Icono
export default function Icon() {
  return new ImageResponse(
    (
      // Contenedor Naranja Industrial
      <div
        style={{
          fontSize: 24,
          background: "#ea580c", // Nuestro Naranja Mecánico (orange-600)
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          borderRadius: "6px", // Bordes un poco redondeados estilo App
        }}
      >
        {/* SVG de una Llave Inglesa (Wrench) */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}