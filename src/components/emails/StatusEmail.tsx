import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
  Hr,
} from '@react-email/components';

interface StatusEmailProps {
  customerName: string;
  vehicleModel: string; // "Toyota Yaris - AB1234"
  status: string;       // "COMPLETED", "IN_PROGRESS", etc.
  orderNumber: number;
  tenantName: string;   // "Taller Altamirano"
  orderUrl: string;     // Link al comprobante
}

export const StatusEmail = ({
  customerName,
  vehicleModel,
  status,
  orderNumber,
  tenantName,
  orderUrl,
}: StatusEmailProps) => {
  
  // Lógica de Diseño según Estado
  let title = "";
  let message = "";
  let color = "#333";

  switch (status) {
    case "COMPLETED":
      title = "¡Tu vehículo está listo! 🚀";
      message = "Buenas noticias. Hemos terminado el trabajo en tu vehículo. Puedes pasar a retirarlo cuando gustes.";
      color = "#16a34a"; // Green
      break;
    case "DELIVERED":
      title = "Gracias por tu preferencia 🤝";
      message = "Tu vehículo ha sido entregado. Adjuntamos el respaldo digital de tu servicio en este correo.";
      color = "#2563eb"; // Blue
      break;
    case "WAITING_PARTS":
      title = "Esperando Repuestos 📦";
      message = "Estamos a la espera de repuestos para continuar con la reparación. Te avisaremos apenas lleguen.";
      color = "#ea580c"; // Orange
      break;
    case "CANCELLED":
      title = "Orden Cancelada 🚫";
      message = "La orden de trabajo ha sido cancelada. Si tienes dudas, por favor contáctanos.";
      color = "#dc2626"; // Red
      break;
    default: // IN_PROGRESS
      title = "Trabajo en Progreso 🔧";
      message = "Ya hemos comenzado a trabajar en tu vehículo. Te mantendremos informado de cualquier novedad.";
      color = "#0891b2"; // Cyan
  }

  return (
    <Html>
      <Head />
      <Preview>{title} - {tenantName}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={{ ...h1, color }}>{tenantName}</Heading>
          <Text style={meta}>Orden #{orderNumber}</Text>
          
          <Hr style={hr} />
          
          <Heading style={h2}>{title}</Heading>
          <Text style={paragraph}>Hola <strong>{customerName}</strong>,</Text>
          <Text style={paragraph}>{message}</Text>
          
          <Section style={box}>
            <Text style={vehicleText}>🚗 Vehículo: <strong>{vehicleModel}</strong></Text>
          </Section>

          {(status === "COMPLETED" || status === "DELIVERED") && (
            <Section style={btnContainer}>
              <Link href={orderUrl} style={{ ...button, backgroundColor: color }}>
                Ver Comprobante Digital
              </Link>
            </Section>
          )}

          <Hr style={hr} />
          
          <Text style={footer}>
            Este es un correo automático de {tenantName}.<br />
            Si tienes dudas, puedes responder directamente a este correo.
          </Text>
        </Container>
      </Body>
    </Html>
  );
};

// Estilos (Inline Styles para correos)
const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '0 auto',
  padding: '20px 0 48px',
  marginBottom: '64px',
};

const h1 = {
  fontSize: '24px',
  fontWeight: 'bold',
  textAlign: 'center' as const,
  margin: '30px 0',
};

const h2 = {
  fontSize: '20px',
  fontWeight: '600',
  color: '#333',
  padding: '0 48px',
};

const meta = {
  color: '#8898aa',
  fontSize: '12px',
  textAlign: 'center' as const,
  marginTop: '-20px',
  marginBottom: '30px',
};

const paragraph = {
  fontSize: '16px',
  lineHeight: '26px',
  color: '#525f7f',
  padding: '0 48px',
};

const box = {
  padding: '24px',
  backgroundColor: '#f9fafb',
  borderRadius: '4px',
  margin: '24px 48px',
  border: '1px solid #e5e7eb',
};

const vehicleText = {
  margin: '0',
  fontSize: '16px',
  color: '#333',
};

const btnContainer = {
  textAlign: 'center' as const,
  padding: '20px',
};

const button = {
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: 'bold',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const hr = {
  borderColor: '#e6ebf1',
  margin: '20px 0',
};

const footer = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
  textAlign: 'center' as const,
};