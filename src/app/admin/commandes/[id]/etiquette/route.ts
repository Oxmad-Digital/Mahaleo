import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { fetchLabelPdf } from "@/lib/sendcloud";
import { orderReference } from "@/lib/order-status";

/**
 * Sert le PDF de l'étiquette Sendcloud. Les URLs d'étiquette de Sendcloud
 * exigent les clés API : le fichier transite donc par notre serveur plutôt que
 * d'être lié directement depuis la fiche commande.
 */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return new Response("Accès refusé.", { status: 403 });
  }

  const { id } = await params;
  const shipment = await prisma.shipment.findUnique({ where: { orderId: id } });

  if (!shipment?.parcelId || shipment.cancelledAt) {
    return new Response("Aucune étiquette disponible pour cette commande.", { status: 404 });
  }

  let pdf: ArrayBuffer;
  try {
    pdf = await fetchLabelPdf(Number(shipment.parcelId));
  } catch (error) {
    console.error("[sendcloud] Téléchargement de l'étiquette impossible:", error);
    return new Response("L'étiquette n'a pas pu être récupérée auprès de Sendcloud.", { status: 502 });
  }

  if (!shipment.labelPrinted) {
    await prisma.shipment.update({ where: { orderId: id }, data: { labelPrinted: true } });
  }

  const filename = `etiquette-${orderReference(id).replace("#", "")}.pdf`;
  return new Response(pdf, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
