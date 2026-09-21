import { toJpeg, toPng } from "html-to-image";
import jsPDF from "jspdf";

export type ImageFormat = "png" | "jpg";

const CAPTURE_OPTIONS = {
  pixelRatio: 3,
  backgroundColor: "#fffaf3",
  cacheBust: true,
} as const;

/** Triggers a browser download without adding temporary DOM elements. */\nfunction triggerDownload(dataUrl: string, filename: string): void {
  const link = document.createElement("a");
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

/** Waits until an in-memory image can safely be measured by jsPDF. */\nfunction waitForImage(image: HTMLImageElement): Promise<void> {
  return new Promise((resolve, reject) => {
    image.onload = () => resolve();
    image.onerror = () => reject(new Error("Failed to load invoice preview."));
  });
}

/** Exports the rendered invoice preview as a PNG or JPEG file. */
export async function exportInvoiceImage(
  element: HTMLElement,
  invoiceNumber: string,
  format: ImageFormat,
): Promise<void> {
  const dataUrl =
    format === "png"
      ? await toPng(element, CAPTURE_OPTIONS)
      : await toJpeg(element, { ...CAPTURE_OPTIONS, quality: 0.96 });

  triggerDownload(dataUrl, `invoice-${invoiceNumber}.${format}`);
}

/**
 * Captures the invoice preview and fits it onto a single A4 PDF page.
 * The preview is rendered at a high pixel ratio to keep exported text sharp.
 */
export async function exportInvoicePdf(
  element: HTMLElement,
  invoiceNumber: string,
): Promise<void> {
  const dataUrl = await toPng(element, CAPTURE_OPTIONS);
  const image = new Image();
  image.src = dataUrl;
  await waitForImage(image);

  const pageWidth = 190;
  const pageHeight = 277;
  const imageHeight = (image.height / image.width) * pageWidth;

  const pdf = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  pdf.addImage(
    dataUrl,
    "PNG",
    10,
    10,
    pageWidth,
    Math.min(imageHeight, pageHeight),
  );
  pdf.save(`invoice-${invoiceNumber}.pdf`);
}
