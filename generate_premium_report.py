#!/usr/bin/env python3
"""Generate a clean premium Personal Money Map PDF with ReportLab."""

from __future__ import annotations

from pathlib import Path

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_JUSTIFY, TA_LEFT, TA_RIGHT
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import mm
from reportlab.platypus import (
    HRFlowable,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)
from reportlab.pdfgen import canvas

OUTPUT_NAME = "Personal_Money_Map_Sample.pdf"

INK = colors.HexColor("#17241C")
MOSS = colors.HexColor("#1D5A3E")
MOSS_DARK = colors.HexColor("#143D2A")
COPPER = colors.HexColor("#C45C26")
CREAM = colors.HexColor("#FFFAF2")
PAPER = colors.HexColor("#F3EEE4")
MUTED = colors.HexColor("#5A6B61")
LINE = colors.HexColor("#D9D0C1")
WHITE = colors.white
HEADER_FILL = colors.HexColor("#EDF2F7")
ROW_ALT = colors.HexColor("#F7FAFC")
GRID = colors.HexColor("#E2E8F0")
BODY_TEXT = colors.HexColor("#2D3748")


class NumberedCanvas(canvas.Canvas):
    """Canvas that draws branded header/footer after the page count is known."""

    def __init__(self, *args, **kwargs):
        canvas.Canvas.__init__(self, *args, **kwargs)
        self._saved_page_states: list[dict] = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        page_count = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self._draw_page_chrome(page_count)
            canvas.Canvas.showPage(self)
        canvas.Canvas.save(self)

    def _draw_page_chrome(self, page_count: int) -> None:
        width, height = A4
        page_number = getattr(self, "_pageNumber", 1)

        self.setFillColor(MOSS)
        self.rect(0, height - 16 * mm, width, 16 * mm, fill=1, stroke=0)
        self.setFillColor(CREAM)
        self.setFont("Helvetica-Bold", 9)
        self.drawString(18 * mm, height - 10 * mm, "MONEY FINDER")
        self.setFont("Helvetica", 8)
        self.drawRightString(
            width - 18 * mm,
            height - 10 * mm,
            "Personal Money Map  ·  Premium Report",
        )

        self.setFillColor(PAPER)
        self.rect(0, 0, width, 14 * mm, fill=1, stroke=0)
        self.setStrokeColor(LINE)
        self.setLineWidth(0.4)
        self.line(18 * mm, 14 * mm, width - 18 * mm, 14 * mm)

        self.setFillColor(MUTED)
        self.setFont("Helvetica", 8)
        self.drawString(
            18 * mm,
            6 * mm,
            "Ranked fits based on your answers, not a promise of income.",
        )
        self.drawRightString(
            width - 18 * mm,
            6 * mm,
            f"Page {page_number} of {page_count}",
        )


def build_styles() -> dict[str, ParagraphStyle]:
    base = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "ReportTitle",
        parent=base["Title"],
        fontName="Times-Bold",
        fontSize=26,
        leading=30,
        textColor=INK,
        alignment=TA_LEFT,
        spaceAfter=6,
    )
    subtitle_style = ParagraphStyle(
        "ReportSubtitle",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=11,
        leading=15,
        textColor=COPPER,
        alignment=TA_LEFT,
        spaceAfter=16,
    )
    h1_style = ParagraphStyle(
        "ReportH1",
        parent=base["Heading1"],
        fontName="Times-Bold",
        fontSize=16,
        leading=20,
        textColor=MOSS_DARK,
        spaceBefore=15,
        spaceAfter=10,
        keepWithNext=True,
    )
    h2_style = ParagraphStyle(
        "ReportH2",
        parent=base["Heading2"],
        fontName="Helvetica-Bold",
        fontSize=11,
        leading=14,
        textColor=MOSS,
        spaceBefore=10,
        spaceAfter=6,
        keepWithNext=True,
    )
    body_style = ParagraphStyle(
        "ReportBody",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=10,
        leading=15,
        textColor=BODY_TEXT,
        alignment=TA_JUSTIFY,
        spaceAfter=8,
    )
    cell_style = ParagraphStyle(
        "ReportCell",
        parent=base["Normal"],
        fontName="Helvetica",
        fontSize=9,
        leading=13,
        textColor=BODY_TEXT,
        alignment=TA_LEFT,
    )
    cell_header_style = ParagraphStyle(
        "ReportCellHeader",
        parent=cell_style,
        fontName="Helvetica-Bold",
        textColor=MOSS_DARK,
    )
    caption_style = ParagraphStyle(
        "ReportCaption",
        parent=base["Normal"],
        fontName="Helvetica-Oblique",
        fontSize=8,
        leading=11,
        textColor=MUTED,
        alignment=TA_LEFT,
        spaceBefore=8,
    )
    footer_note_style = ParagraphStyle(
        "ReportNote",
        parent=body_style,
        fontSize=8,
        leading=12,
        textColor=MUTED,
        alignment=TA_LEFT,
    )

    return {
        "title": title_style,
        "subtitle": subtitle_style,
        "h1": h1_style,
        "h2": h2_style,
        "body": body_style,
        "cell": cell_style,
        "cell_header": cell_header_style,
        "caption": caption_style,
        "note": footer_note_style,
    }


def branded_table(data: list[list], col_widths: list[float]) -> Table:
    table = Table(data, colWidths=col_widths, repeatRows=1)
    table.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), HEADER_FILL),
                ("TEXTCOLOR", (0, 0), (-1, 0), MOSS_DARK),
                ("ALIGN", (0, 0), (-1, -1), "LEFT"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("GRID", (0, 0), (-1, -1), 0.5, GRID),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [WHITE, ROW_ALT]),
                ("LEFTPADDING", (0, 0), (-1, -1), 8),
                ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                ("TOPPADDING", (0, 0), (-1, 0), 8),
                ("BOTTOMPADDING", (0, 0), (-1, 0), 8),
                ("TOPPADDING", (0, 1), (-1, -1), 7),
                ("BOTTOMPADDING", (0, 1), (-1, -1), 7),
            ]
        )
    )
    return table


def build_pdf(output_path: str | Path | None = None) -> Path:
    styles = build_styles()
    destination = Path(output_path or OUTPUT_NAME)

    doc = SimpleDocTemplate(
        str(destination),
        pagesize=A4,
        leftMargin=18 * mm,
        rightMargin=18 * mm,
        topMargin=24 * mm,
        bottomMargin=20 * mm,
        title="Personal Money Map — Premium Report",
        author="Money Finder",
        subject="Premium Personalized Opportunity & Risk Assessment",
    )

    story = []

    # ------------------ PAGE 1: EXECUTIVE BRIEFING ------------------
    story.append(Paragraph("Personal Money Map", styles["title"]))
    story.append(
        Paragraph(
            "Premium Personalized Opportunity &amp; Risk Assessment",
            styles["subtitle"],
        )
    )
    story.append(
        HRFlowable(
            width="100%",
            thickness=1.2,
            color=MOSS,
            spaceAfter=14,
        )
    )

    intro_txt = (
        "Wafa, I have personally reviewed your unique 12-question diagnostic. "
        "Based on your current asset structures, weekly available hour blocks, "
        "and technological capacity, your profile has been processed through the "
        "baseline matching system and manually refined. Below is your tailored "
        "operational path optimized for risk mitigation and capital velocity."
    )
    story.append(Paragraph(intro_txt, styles["body"]))
    story.append(Spacer(1, 8))

    story.append(Paragraph("Your Top 3 Positioned Opportunities", styles["h1"]))
    story.append(
        Paragraph(
            "These are ranked fits based on your answers, not a promise of income.",
            styles["caption"],
        )
    )

    table_data = [
        [
            Paragraph("<b>Opportunity Vector</b>", styles["cell_header"]),
            Paragraph("<b>Strategic Fit Alignment Score</b>", styles["cell_header"]),
            Paragraph("<b>Estimated Time-to-Value</b>", styles["cell_header"]),
        ],
        [
            Paragraph("1. Capital Optimization Brokerage", styles["cell"]),
            Paragraph("94% — High Tech Comfort Alignment", styles["cell"]),
            Paragraph("14 – 21 Days", styles["cell"]),
        ],
        [
            Paragraph("2. Micro-SaaS Specialized Diagnostics", styles["cell"]),
            Paragraph("89% — High Margin / Asset-Light", styles["cell"]),
            Paragraph("7 – 10 Days", styles["cell"]),
        ],
        [
            Paragraph("3. Localized Logistics Routing Technology", styles["cell"]),
            Paragraph("82% — Asset-Backed Scaling", styles["cell"]),
            Paragraph("30 Days", styles["cell"]),
        ],
    ]
    story.append(branded_table(table_data, [200, 170, 134]))
    story.append(Spacer(1, 16))

    story.append(Paragraph("How to use this report", styles["h2"]))
    story.append(
        Paragraph(
            "Start with Rank 1. Complete the first 7-day block before expanding "
            "into Rank 2 or Rank 3. Treat scores as relative fit, not a forecast "
            "of revenue, clients, or work. Money Finder is a matching tool, not "
            "financial advice.",
            styles["body"],
        )
    )

    story.append(PageBreak())

    # ------------------ PAGE 2: EXECUTION BLUEPRINT ------------------
    story.append(Paragraph("Your First 7-Day Action Plan", styles["h1"]))
    story.append(
        Paragraph(
            "Execute these tasks sequentially to ensure frictionless deployment "
            "without capital overextension:",
            styles["body"],
        )
    )
    story.append(Spacer(1, 10))

    steps_table = [
        [
            Paragraph("<b>Day Block</b>", styles["cell_header"]),
            Paragraph("<b>Operational Directive</b>", styles["cell_header"]),
            Paragraph("<b>Risk Factor Checklist</b>", styles["cell_header"]),
        ],
        [
            Paragraph("Days 1 – 2", styles["cell"]),
            Paragraph(
                "Initialize workspace directory loops and lock environment variables.",
                styles["cell"],
            ),
            Paragraph("[ ] Ensure zero public exposure", styles["cell"]),
        ],
        [
            Paragraph("Days 3 – 4", styles["cell"]),
            Paragraph(
                "Deploy background social listening streams to seed test variants.",
                styles["cell"],
            ),
            Paragraph("[ ] Maintain local compliance", styles["cell"]),
        ],
        [
            Paragraph("Days 5 – 7", styles["cell"]),
            Paragraph(
                "Audit checkout processor webhooks against currency parameters.",
                styles["cell"],
            ),
            Paragraph("[ ] Verify transaction path", styles["cell"]),
        ],
    ]
    story.append(branded_table(steps_table, [80, 260, 164]))
    story.append(Spacer(1, 18))

    story.append(Paragraph("Operating notes", styles["h2"]))
    story.append(
        Paragraph(
            "Keep the signed access session on this device while you work through "
            "the plan. Revisit Rank 1 actions before adding new spend. If a step "
            "depends on payment or webhook confirmation, verify the live AUD path "
            "before going further.",
            styles["body"],
        )
    )
    story.append(
        Paragraph(
            "This premium report is a personalised Money Map sample. Results "
            "depend on your circumstances, effort, skills, and market demand. "
            "It does not guarantee income and is not a substitute for professional "
            "financial, tax, or legal advice.",
            styles["note"],
        )
    )

    doc.build(story, canvasmaker=NumberedCanvas)
    return destination


def main() -> None:
    path = build_pdf()
    print(f"Premium Money Map PDF generated successfully as '{path.name}'.")


if __name__ == "__main__":
    main()
