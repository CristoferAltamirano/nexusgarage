import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import { PrintTemplate } from "@/components/orders/PrintTemplate";

interface Props {
  params: Promise<{ slug: string; orderId: string }>;
}

export default async function OrderPrintPage(props: Props) {
  const params = await props.params;
  const { slug, orderId } = params;

  // 1. Buscar el Taller
  const tenant = await db.tenant.findUnique({
    where: { slug },
  });

  if (!tenant) return <div>Error: Taller no encontrado</div>;

  // 2. Buscar la Orden
  const order = await db.workOrder.findUnique({
    where: { id: orderId },
    include: {
      vehicle: {
        include: {
          customer: true,
        },
      },
      items: true,
    },
  });

  if (!order) return <div>Error: Orden no encontrada</div>;

  // 3. Renderizar el componente CLIENTE
  return <PrintTemplate order={order} tenant={tenant} />;
}