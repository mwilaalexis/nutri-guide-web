import { jsPDF } from "jspdf";
import type { DailyMealSummaryDto, FoodDto, MealSummaryDto, PlanSummaryDto } from "../Types/global-types";
import { resolveMediaUrl } from "./mediaUrl";
import { downloadBlob, fetchFullPlan, planExportBasename } from "./planExport";
import {
  MEAL_CATEGORIES,
  collectFoodIds,
  fetchFoodsMap,
  formatDateFr,
  formatIngredients,
  formatRecipe,
  macrosLine,
  sortedPlanDays,
} from "./planExportShared";

/** Brand & layout tokens */
const BRAND = {
  primary: { r: 27, g: 67, b: 50 },
  accent: { r: 45, g: 106, b: 79 },
  accentSoft: { r: 241, g: 248, b: 244 },
  text: { r: 28, g: 28, b: 28 },
  muted: { r: 92, g: 92, b: 92 },
  border: { r: 229, g: 231, b: 235 },
  white: { r: 255, g: 255, b: 255 },
};

const IMG_W = 36;
const IMG_H = 27;

type ImageAsset = { dataUrl: string; format: "PNG" | "JPEG" };

type Rgb = { r: number; g: number; b: number };

async function loadImageAsset(url: string): Promise<ImageAsset | null> {
  const resolved = resolveMediaUrl(url);
  if (!resolved) return null;

  try {
    const response = await fetch(resolved, { credentials: "include" });
    if (response.ok) {
      const blob = await response.blob();
      const format: "PNG" | "JPEG" = blob.type.includes("png") ? "PNG" : "JPEG";
      const dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
      return { dataUrl, format };
    }
  } catch {
    // ignore
  }

  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const maxSide = 640;
        const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          resolve(null);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve({ dataUrl: canvas.toDataURL("image/jpeg", 0.9), format: "JPEG" });
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = resolved;
  });
}

class PlanPdfDocument {
  private doc: jsPDF;
  private y = 0;
  private readonly margin = 18;
  private readonly pageWidth: number;
  private readonly contentWidth: number;
  private readonly pageHeight: number;
  private readonly bottomLimit: number;
  private planTitle = "";
  private headerBlockEnd = 0;

  constructor() {
    this.doc = new jsPDF({ unit: "mm", format: "a4" });
    this.pageWidth = this.doc.internal.pageSize.getWidth();
    this.pageHeight = this.doc.internal.pageSize.getHeight();
    this.contentWidth = this.pageWidth - this.margin * 2;
    this.bottomLimit = this.pageHeight - 22;
    this.y = this.margin;
  }

  private setColor(rgb: Rgb) {
    this.doc.setTextColor(rgb.r, rgb.g, rgb.b);
  }

  private setFill(rgb: Rgb) {
    this.doc.setFillColor(rgb.r, rgb.g, rgb.b);
  }

  private setDraw(rgb: Rgb) {
    this.doc.setDrawColor(rgb.r, rgb.g, rgb.b);
  }

  private ensureSpace(needed: number) {
    if (this.y + needed <= this.bottomLimit) return;
    this.doc.addPage();
    this.drawRunningHeader();
    this.y = this.headerBlockEnd;
  }

  private drawRunningHeader() {
    const h = 14;
    this.setFill(BRAND.primary);
    this.doc.rect(0, 0, this.pageWidth, 3, "F");

    this.setFill(BRAND.accentSoft);
    this.doc.rect(0, 3, this.pageWidth, h - 3, "F");

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8);
    this.setColor(BRAND.primary);
    this.doc.text("NutriGuide", this.margin, 9);

    this.doc.setFont("helvetica", "normal");
    this.setColor(BRAND.muted);
    const title =
      this.planTitle.length > 52 ? `${this.planTitle.slice(0, 49)}…` : this.planTitle;
    this.doc.text(title, this.pageWidth - this.margin, 9, { align: "right" });

    this.setDraw(BRAND.border);
    this.doc.setLineWidth(0.2);
    this.doc.line(this.margin, h + 1, this.pageWidth - this.margin, h + 1);

    this.headerBlockEnd = h + 6;
    this.y = this.headerBlockEnd;
  }

  private drawCoverHeader(plan: PlanSummaryDto) {
    const coverH = 44;
    this.setFill(BRAND.primary);
    this.doc.rect(0, 0, this.pageWidth, coverH, "F");

    this.setFill(BRAND.accent);
    this.doc.rect(0, coverH - 4, this.pageWidth, 4, "F");

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(22);
    this.setColor(BRAND.white);
    this.doc.text("NutriGuide", this.margin, 18);

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(10);
    this.doc.text("Plan nutritionnel personnalisé", this.margin, 26);

    const generated = plan.generatedAt
      ? formatDateFr(plan.generatedAt, "long")
      : formatDateFr(new Date().toISOString(), "long");
    this.doc.text(generated, this.pageWidth - this.margin, 18, { align: "right" });
    this.doc.text("Document confidentiel", this.pageWidth - this.margin, 26, { align: "right" });

    this.y = coverH + 10;
    this.planTitle = plan.goal || "Plan nutritionnel";

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(16);
    this.setColor(BRAND.text);
    const goalLines = this.doc.splitTextToSize(this.planTitle, this.contentWidth);
    this.doc.text(goalLines, this.margin, this.y);
    this.y += goalLines.length * 7 + 4;

    this.drawMetaGrid(plan);
    this.y += 6;

    this.setDraw(BRAND.border);
    this.doc.setLineWidth(0.35);
    this.doc.line(this.margin, this.y, this.pageWidth - this.margin, this.y);
    this.y += 10;

    this.headerBlockEnd = 20;
  }

  private drawMetaGrid(plan: PlanSummaryDto) {
    const days = sortedPlanDays(plan);
    const items = [
      { label: "Régime", value: plan.dietStyle || "—" },
      { label: "Statut", value: plan.status || "—" },
      { label: "Moyenne / jour", value: `${plan.averageCaloriesPerDay ?? "—"} kcal` },
      { label: "Durée", value: `${plan.totalDays ?? days.length} jour(s)` },
    ];

    const colW = (this.contentWidth - 6) / 2;
    const rowH = 16;
    const gridH = rowH * 2 + 6;

    this.setFill(BRAND.accentSoft);
    this.doc.roundedRect(this.margin, this.y, this.contentWidth, gridH, 3, 3, "F");
    this.setDraw(BRAND.border);
    this.doc.setLineWidth(0.2);
    this.doc.roundedRect(this.margin, this.y, this.contentWidth, gridH, 3, 3, "S");

    items.forEach((item, i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = this.margin + 6 + col * (colW + 6);
      const y = this.y + 6 + row * rowH;

      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(7.5);
      this.setColor(BRAND.muted);
      this.doc.text(item.label.toUpperCase(), x, y);

      this.doc.setFont("helvetica", "bold");
      this.doc.setFontSize(10);
      this.setColor(BRAND.text);
      this.doc.text(item.value, x, y + 5);
    });

    this.y += gridH + 4;
  }

  private drawDayHeader(day: DailyMealSummaryDto) {
    this.ensureSpace(18);
    const barH = 11;

    this.setFill(BRAND.primary);
    this.doc.rect(this.margin, this.y, 3, barH, "F");

    this.setFill(BRAND.accentSoft);
    this.doc.rect(this.margin + 3, this.y, this.contentWidth - 3, barH, "F");

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(11);
    this.setColor(BRAND.primary);
    const label = formatDateFr(day.date, "long");
    this.doc.text(label, this.margin + 7, this.y + 7);

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(9);
    this.setColor(BRAND.muted);
    this.doc.text(`${day.totalCalories ?? 0} kcal`, this.pageWidth - this.margin - 4, this.y + 7, {
      align: "right",
    });

    this.y += barH + 6;
  }

  private drawCategoryTitle(title: string) {
    this.ensureSpace(10);
    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8.5);
    this.setColor(BRAND.accent);
    this.doc.text(title, this.margin + 2, this.y);

    this.setDraw(BRAND.border);
    this.doc.setLineWidth(0.15);
    const tw = this.doc.getTextWidth(title);
    this.doc.line(this.margin + 2 + tw + 3, this.y - 1, this.pageWidth - this.margin, this.y - 1);

    this.y += 7;
  }

  private wrapLines(text: string, width: number): string[] {
    const lines = this.doc.splitTextToSize(text, width);
    return Array.isArray(lines) ? lines : [lines];
  }

  private measureMealCard(
    meal: MealSummaryDto,
    food: FoodDto | undefined,
    hasImage: boolean,
  ): number {
    const bodyW = this.contentWidth - 12 - (hasImage ? IMG_W + 10 : 0);
    const mealName = meal.name || food?.name || "Repas";
    const nameLines = this.wrapLines(mealName, bodyW);
    const recipeLines = this.wrapLines(formatRecipe(food), bodyW);
    const ingredients = formatIngredients(meal, food);

    let ingLineCount = 0;
    for (const ing of ingredients) {
      ingLineCount += this.wrapLines(`•  ${ing}`, bodyW - 4).length;
    }

    const titleH = nameLines.length * 5 + 4;
    const macroH = 6;
    const imgBlock = hasImage ? IMG_H + 4 : 0;
    const ingH = 8 + ingLineCount * 4.2;
    const recH = 8 + recipeLines.length * 4.2;
    const padding = 12;

    return padding + Math.max(imgBlock, titleH + macroH) + ingH + recH;
  }

  private async drawMealCard(
    meal: MealSummaryDto,
    food: FoodDto | undefined,
    imageCache: Map<string, ImageAsset | null>,
  ) {
    const imageUrl = food?.imagePath || meal.imagePath;
    const cacheKey = imageUrl || meal.id;
    let image = imageCache.get(cacheKey);
    if (image === undefined) {
      image = imageUrl ? await loadImageAsset(imageUrl) : null;
      imageCache.set(cacheKey, image);
    }

    const hasImage = !!image;
    const cardH = this.measureMealCard(meal, food, hasImage);
    this.ensureSpace(cardH + 4);

    const cardTop = this.y;
    this.setDraw(BRAND.border);
    this.setFill(BRAND.white);
    this.doc.setLineWidth(0.25);
    this.doc.roundedRect(this.margin, cardTop, this.contentWidth, cardH, 2.5, 2.5, "FD");

    const pad = 6;
    const textX = this.margin + pad + (hasImage ? IMG_W + 8 : 0);
    const bodyW = this.contentWidth - pad * 2 - (hasImage ? IMG_W + 8 : 0);

    if (image) {
      try {
        this.setDraw(BRAND.border);
        this.doc.setLineWidth(0.2);
        this.doc.roundedRect(
          this.margin + pad,
          cardTop + pad,
          IMG_W,
          IMG_H,
          1.5,
          1.5,
          "S",
        );
        this.doc.addImage(
          image.dataUrl,
          image.format,
          this.margin + pad + 0.5,
          cardTop + pad + 0.5,
          IMG_W - 1,
          IMG_H - 1,
        );
      } catch {
        // ignore
      }
    }

    let ty = cardTop + pad + 4;
    const mealName = meal.name || food?.name || "Repas";

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(11);
    this.setColor(BRAND.text);
    const nameLines = this.wrapLines(mealName, bodyW);
    this.doc.text(nameLines, textX, ty);
    ty += nameLines.length * 5 + 2;

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8);
    this.setColor(BRAND.muted);
    this.doc.text(macrosLine(food, meal), textX, ty);
    ty = Math.max(ty + 6, cardTop + pad + IMG_H + 6);

    const ingredients = formatIngredients(meal, food);
    const recipeLines = this.wrapLines(formatRecipe(food), bodyW);

    ty = this.drawSectionBlock(ty, "Ingrédients", ingredients, bodyW, true);
    this.drawSectionBlock(ty, "Préparation", recipeLines, bodyW, false);
    this.y = cardTop + cardH + 5;
  }

  private drawSectionBlock(
    startY: number,
    title: string,
    contentLines: string[],
    bodyW: number,
    bulletIngredients: boolean,
  ): number {
    let ty = startY + 2;
    const left = this.margin + 8;

    this.doc.setFont("helvetica", "bold");
    this.doc.setFontSize(8);
    this.setColor(BRAND.accent);
    this.doc.text(title, left, ty);
    ty += 5;

    this.doc.setFont("helvetica", "normal");
    this.doc.setFontSize(8.5);
    this.setColor(BRAND.text);

    if (bulletIngredients) {
      for (const ing of contentLines) {
        for (const wl of this.wrapLines(`•  ${ing}`, bodyW - 4)) {
          this.doc.text(wl, left, ty);
          ty += 4.2;
        }
      }
    } else {
      for (const wl of contentLines) {
        this.doc.text(wl, left, ty);
        ty += 4.2;
      }
    }

    if (bulletIngredients) {
      ty += 2;
      this.setDraw(BRAND.border);
      this.doc.setLineWidth(0.1);
      this.doc.line(this.margin + 8, ty, this.pageWidth - this.margin - 8, ty);
      ty += 5;
    }

    return ty;
  }

  private drawFooters() {
    const total = this.doc.getNumberOfPages();
    for (let i = 1; i <= total; i++) {
      this.doc.setPage(i);
      const footerY = this.pageHeight - 12;

      this.setDraw(BRAND.border);
      this.doc.setLineWidth(0.2);
      this.doc.line(this.margin, footerY - 4, this.pageWidth - this.margin, footerY - 4);

      this.doc.setFont("helvetica", "normal");
      this.doc.setFontSize(7.5);
      this.setColor(BRAND.muted);
      this.doc.text("NutriGuide  ·  Plan nutritionnel", this.margin, footerY);
      this.doc.text(`Page ${i} sur ${total}`, this.pageWidth - this.margin, footerY, {
        align: "right",
      });
    }
  }

  async build(plan: PlanSummaryDto, foods: Map<string, FoodDto>): Promise<Blob> {
    this.drawCoverHeader(plan);
    const imageCache = new Map<string, ImageAsset | null>();

    for (const day of sortedPlanDays(plan)) {
      this.drawDayHeader(day);

      for (const { label, key } of MEAL_CATEGORIES) {
        const meals = day[key];
        if (!Array.isArray(meals) || meals.length === 0) continue;

        this.drawCategoryTitle(label);
        for (const meal of meals) {
          const food = meal.foodId ? foods.get(meal.foodId) : undefined;
          await this.drawMealCard(meal, food, imageCache);
        }
      }

      this.y += 6;
    }

    this.drawFooters();
    return this.doc.output("blob");
  }
}

export async function buildPlanPdfBlob(plan: PlanSummaryDto): Promise<Blob> {
  const foodIds = collectFoodIds(plan);
  const foods = await fetchFoodsMap(foodIds);
  const builder = new PlanPdfDocument();
  return builder.build(plan, foods);
}

export async function exportPlanPdfRich(planId: string, basename?: string): Promise<void> {
  const plan = await fetchFullPlan(planId);
  if (!plan) throw new Error("Plan introuvable");

  const blob = await buildPlanPdfBlob(plan);
  const name = `${basename ?? planExportBasename(plan)}.pdf`;
  downloadBlob(blob, name);
}
