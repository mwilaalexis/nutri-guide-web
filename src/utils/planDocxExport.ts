import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  ImageRun,
  Packer,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  convertInchesToTwip,
} from "docx";
import type { FoodDto, MealSummaryDto, PlanSummaryDto } from "../Types/global-types";
import { resolveMediaUrl } from "./mediaUrl";
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

/** Aligné sur le PDF (verts NutriGuide) */
const HEX = {
  primary: "1B4332",
  accent: "2D6A4F",
  accentSoft: "F1F8F4",
  text: "1C1C1C",
  muted: "5C5C5C",
  border: "D1D5DB",
  white: "FFFFFF",
};

function truncate(s: string, max: number) {
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
}

function ptHalf(pt: number) {
  return Math.round(pt * 2);
}

async function fetchImageForDocx(
  url: string,
): Promise<{ type: "jpg" | "png"; data: Uint8Array } | null> {
  const resolved = resolveMediaUrl(url);
  if (!resolved) return null;
  try {
    const response = await fetch(resolved, { credentials: "include" });
    if (response.ok) {
      const blob = await response.blob();
      const buf = new Uint8Array(await blob.arrayBuffer());
      const t = blob.type.includes("png") ? "png" : "jpg";
      return { type: t, data: buf };
    }
  } catch {
    // ignore
  }
  return null;
}

function mealCardBorder() {
  return {
    top: { style: BorderStyle.SINGLE, size: 6, color: HEX.border },
    bottom: { style: BorderStyle.SINGLE, size: 6, color: HEX.border },
    left: { style: BorderStyle.SINGLE, size: 6, color: HEX.border },
    right: { style: BorderStyle.SINGLE, size: 6, color: HEX.border },
  };
}

function buildMetaTable(plan: PlanSummaryDto): Table {
  const days = sortedPlanDays(plan);
  const cells = [
    { label: "Régime", value: plan.dietStyle || "—" },
    { label: "Statut", value: plan.status || "—" },
    { label: "Moyenne / jour", value: `${plan.averageCaloriesPerDay ?? "—"} kcal` },
    { label: "Durée", value: `${plan.totalDays ?? days.length} jour(s)` },
  ];

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    columnWidths: [convertInchesToTwip(3.25), convertInchesToTwip(3.25)],
    rows: [
      new TableRow({
        children: [
          metaCell(cells[0]),
          metaCell(cells[1]),
        ],
      }),
      new TableRow({
        children: [
          metaCell(cells[2]),
          metaCell(cells[3]),
        ],
      }),
    ],
  });
}

function metaCell(item: { label: string; value: string }): TableCell {
  return new TableCell({
    shading: { fill: HEX.accentSoft, type: ShadingType.SOLID },
    margins: { top: 120, bottom: 120, left: 160, right: 160 },
    borders: {
      top: { style: BorderStyle.SINGLE, size: 4, color: HEX.border },
      bottom: { style: BorderStyle.SINGLE, size: 4, color: HEX.border },
      left: { style: BorderStyle.SINGLE, size: 4, color: HEX.border },
      right: { style: BorderStyle.SINGLE, size: 4, color: HEX.border },
    },
    children: [
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: item.label.toUpperCase(),
            size: ptHalf(7.5),
            color: HEX.muted,
            font: "Calibri",
          }),
        ],
      }),
      new Paragraph({
        children: [
          new TextRun({
            text: item.value,
            bold: true,
            size: ptHalf(11),
            color: HEX.text,
            font: "Calibri",
          }),
        ],
      }),
    ],
  });
}

function coverBanner(): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            shading: { fill: HEX.primary, type: ShadingType.SOLID },
            margins: { top: 280, bottom: 200, left: 280, right: 280 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: "NutriGuide",
                    bold: true,
                    size: ptHalf(28),
                    color: HEX.white,
                    font: "Calibri",
                  }),
                ],
              }),
              new Paragraph({
                spacing: { before: 80 },
                children: [
                  new TextRun({
                    text: "Plan nutritionnel personnalisé",
                    size: ptHalf(11),
                    color: "D8EDE3",
                    font: "Calibri",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

export async function buildPlanDocxBlob(plan: PlanSummaryDto): Promise<Blob> {
  const foods = await fetchFoodsMap(collectFoodIds(plan));
  const planTitle = plan.goal || "Plan nutritionnel";
  const generated = plan.generatedAt
    ? formatDateFr(plan.generatedAt, "long")
    : formatDateFr(new Date().toISOString(), "long");

  const imageCache = new Map<string, Awaited<ReturnType<typeof fetchImageForDocx>>>();

  const children: (Paragraph | Table)[] = [];

  children.push(coverBanner());
  children.push(
    new Paragraph({
      spacing: { before: 200, after: 120 },
      alignment: AlignmentType.END,
      children: [
        new TextRun({ text: generated, size: ptHalf(10), color: HEX.muted, font: "Calibri" }),
        new TextRun({ text: "     ·     ", color: HEX.muted }),
        new TextRun({
          text: "Document confidentiel",
          italics: true,
          size: ptHalf(10),
          color: HEX.muted,
          font: "Calibri",
        }),
      ],
    }),
  );

  children.push(
    new Paragraph({
      spacing: { after: 160 },
      children: [
        new TextRun({
          text: planTitle,
          bold: true,
          size: ptHalf(22),
          color: HEX.text,
          font: "Calibri",
        }),
      ],
    }),
  );

  children.push(buildMetaTable(plan));

  children.push(
    new Paragraph({
      spacing: { before: 200, after: 240 },
      border: {
        bottom: { color: HEX.border, space: 1, style: BorderStyle.SINGLE, size: 12 },
      },
      children: [],
    }),
  );

  for (const day of sortedPlanDays(plan)) {
    children.push(dayHeaderBlock(day.date, day.totalCalories ?? 0));

    for (const { label, key } of MEAL_CATEGORIES) {
      const meals = day[key];
      if (!Array.isArray(meals) || meals.length === 0) continue;

      children.push(
        new Paragraph({
          spacing: { before: 160, after: 80 },
          children: [
            new TextRun({
              text: label,
              bold: true,
              size: ptHalf(10),
              color: HEX.accent,
              font: "Calibri",
            }),
          ],
        }),
      );

      for (const meal of meals) {
        const food = meal.foodId ? foods.get(meal.foodId) : undefined;
        const mealName = meal.name || food?.name || "Repas";
        const card = await mealCardTable(meal, food, mealName, imageCache);
        children.push(card);
        children.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
      }
    }

    children.push(new Paragraph({ children: [new TextRun({ text: "" })] }));
  }

  const headerTitle = truncate(planTitle, 52);

  const doc = new Document({
    creator: "NutriGuide",
    title: planTitle,
    description: "Plan nutritionnel personnalisé",
    styles: {
      default: {
        document: {
          run: {
            font: "Calibri",
            size: ptHalf(11),
            color: HEX.text,
          },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            margin: {
              top: convertInchesToTwip(0.75),
              right: convertInchesToTwip(0.9),
              bottom: convertInchesToTwip(0.85),
              left: convertInchesToTwip(0.9),
            },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: [
                  new TableRow({
                    children: [
                      new TableCell({
                        width: { size: 2, type: WidthType.PERCENTAGE },
                        shading: { fill: HEX.primary, type: ShadingType.SOLID },
                        children: [new Paragraph({ children: [] })],
                      }),
                      new TableCell({
                        shading: { fill: HEX.accentSoft, type: ShadingType.SOLID },
                        margins: { left: 160, right: 160, top: 80, bottom: 80 },
                        children: [
                          new Paragraph({
                            children: [
                              new TextRun({
                                text: "NutriGuide",
                                bold: true,
                                size: ptHalf(9),
                                color: HEX.primary,
                                font: "Calibri",
                              }),
                              new TextRun({
                                text: "          ",
                              }),
                              new TextRun({
                                text: headerTitle,
                                size: ptHalf(9),
                                color: HEX.muted,
                                font: "Calibri",
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
              new Paragraph({ spacing: { after: 80 }, border: {
                bottom: { color: HEX.border, space: 1, style: BorderStyle.SINGLE, size: 6 },
              }, children: [] }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                border: {
                  top: { color: HEX.border, space: 1, style: BorderStyle.SINGLE, size: 6 },
                },
                spacing: { before: 80 },
                children: [
                  new TextRun({
                    text: "NutriGuide  ·  Plan nutritionnel",
                    size: ptHalf(8),
                    color: HEX.muted,
                    font: "Calibri",
                  }),
                  new TextRun({ text: "     " }),
                  new TextRun({
                    text: "Page ",
                    size: ptHalf(8),
                    color: HEX.muted,
                    font: "Calibri",
                  }),
                  new TextRun({ children: [PageNumber.CURRENT], size: ptHalf(8), font: "Calibri" }),
                  new TextRun({
                    text: " sur ",
                    size: ptHalf(8),
                    color: HEX.muted,
                    font: "Calibri",
                  }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: ptHalf(8), font: "Calibri" }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });

  return Packer.toBlob(doc);
}

function dayHeaderBlock(dateIso: string, totalKcal: number): Table {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 2, type: WidthType.PERCENTAGE },
            shading: { fill: HEX.primary, type: ShadingType.SOLID },
            children: [new Paragraph({ children: [] })],
          }),
          new TableCell({
            shading: { fill: HEX.accentSoft, type: ShadingType.SOLID },
            margins: { left: 160, right: 160, top: 100, bottom: 100 },
            children: [
              new Paragraph({
                children: [
                  new TextRun({
                    text: formatDateFr(dateIso, "long"),
                    bold: true,
                    size: ptHalf(13),
                    color: HEX.primary,
                    font: "Calibri",
                  }),
                  new TextRun({ text: "     " }),
                  new TextRun({
                    text: `${totalKcal} kcal`,
                    size: ptHalf(10),
                    color: HEX.muted,
                    font: "Calibri",
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
    ],
  });
}

async function mealCardTable(
  meal: MealSummaryDto,
  food: FoodDto | undefined,
  mealName: string,
  imageCache: Map<string, Awaited<ReturnType<typeof fetchImageForDocx>>>,
): Promise<Table> {
  const imageUrl = food?.imagePath || meal.imagePath;
  const cacheKey = imageUrl || meal.id;
  let img = imageCache.get(cacheKey);
  if (img === undefined) {
    img = imageUrl ? await fetchImageForDocx(imageUrl) : null;
    imageCache.set(cacheKey, img);
  }

  const ingredients = formatIngredients(meal, food);
  const recipe = formatRecipe(food);
  const macro = macrosLine(food, meal);

  const leftCol: (Paragraph | Table)[] = [];

  if (img) {
    const emuPerInch = 914400;
    const wEmu = Math.round(1.35 * emuPerInch);
    const hEmu = Math.round(1.0 * emuPerInch);
    leftCol.push(
      new Paragraph({
        children: [
          new ImageRun({
            type: img.type,
            data: img.data,
            transformation: {
              width: wEmu,
              height: hEmu,
            },
          }),
        ],
      }),
    );
  }

  leftCol.push(
    new Paragraph({
      spacing: { after: 60 },
      children: [
        new TextRun({
          text: mealName,
          bold: true,
          size: ptHalf(12),
          color: HEX.text,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      spacing: { after: 100 },
      children: [
        new TextRun({
          text: macro,
          size: ptHalf(9),
          color: HEX.muted,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      spacing: { before: 40, after: 40 },
      children: [
        new TextRun({
          text: "Ingrédients",
          bold: true,
          size: ptHalf(9),
          color: HEX.accent,
          font: "Calibri",
        }),
      ],
    }),
  );

  for (const line of ingredients) {
    leftCol.push(
      new Paragraph({
        spacing: { after: 40 },
        children: [
          new TextRun({
            text: `•  ${line}`,
            size: ptHalf(9.5),
            color: HEX.text,
            font: "Calibri",
          }),
        ],
      }),
    );
  }

  leftCol.push(
    new Paragraph({
      spacing: { before: 120, after: 40 },
      border: {
        top: { style: BorderStyle.SINGLE, size: 4, color: HEX.border, space: 8 },
      },
      children: [],
    }),
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: "Préparation",
          bold: true,
          size: ptHalf(9),
          color: HEX.accent,
          font: "Calibri",
        }),
      ],
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: recipe,
          size: ptHalf(9.5),
          color: HEX.text,
          font: "Calibri",
        }),
      ],
    }),
  );

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    borders: mealCardBorder(),
    rows: [
      new TableRow({
        children: [
          new TableCell({
            margins: { top: 120, bottom: 120, left: 160, right: 160 },
            borders: mealCardBorder(),
            children: leftCol,
          }),
        ],
      }),
    ],
  });
}
