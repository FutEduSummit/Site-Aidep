from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.lib.colors import HexColor, white
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import stringWidth
from pathlib import Path

ROOT = Path(r"C:\Users\user\Desktop\Site-Aidep")
OUT = ROOT / "output" / "pdf" / "relatorio-entrega-site-aidep.pdf"
FONT = ROOT / "site" / "src" / "fonts"
pdfmetrics.registerFont(TTFont("Sora", str(FONT / "Sora-Regular.ttf")))
pdfmetrics.registerFont(TTFont("SoraMedium", str(FONT / "Sora-Medium.ttf")))
pdfmetrics.registerFont(TTFont("SoraBold", str(FONT / "Sora-Bold.ttf")))
W, H = A4
GREEN, INK, MUTED, LINE, PALE, BLACK = HexColor("#10963E"), HexColor("#101512"), HexColor("#5D675F"), HexColor("#D9E4DA"), HexColor("#F3F8F3"), HexColor("#0A0A0A")

def wrap(text, font, size, width):
    words, lines, line = text.split(), [], ""
    for word in words:
        test = (line + " " + word).strip()
        if stringWidth(test, font, size) <= width: line = test
        else: lines.append(line); line = word
    if line: lines.append(line)
    return lines

def paragraph(c, text, x, y, width, size=8.2, leading=12, color=INK, font="Sora"):
    c.setFont(font, size); c.setFillColor(color)
    for line in wrap(text, font, size, width): c.drawString(x, y, line); y -= leading
    return y

def card(c, x, y, w, h, number, title, text):
    c.setFillColor(PALE); c.roundRect(x, y-h, w, h, 6, fill=1, stroke=0)
    c.setFillColor(GREEN); c.setFont("SoraBold", 8); c.drawString(x+14, y-18, number)
    c.setFillColor(INK); c.setFont("SoraBold", 10); c.drawString(x+14, y-35, title)
    paragraph(c, text, x+14, y-52, w-28, 7.6, 10.4, MUTED)

def metric_icon(c, kind, x, y):
    c.setStrokeColor(GREEN); c.setLineWidth(0.9); c.setFillColor(GREEN)
    if kind == "globe":
        c.circle(x, y, 6, stroke=1, fill=0); c.line(x-6, y, x+6, y); c.line(x, y-6, x, y+6)
    elif kind == "pages":
        c.rect(x-5, y-5, 8, 9, stroke=1, fill=0); c.rect(x-2, y-2, 7, 8, stroke=1, fill=0)
    elif kind == "folder":
        c.roundRect(x-6, y-4, 12, 8, 1, stroke=1, fill=0); c.line(x-5, y+3, x-1, y+3); c.line(x-4, y+3, x-3, y+5)
    elif kind == "news":
        c.rect(x-5, y-5, 10, 10, stroke=1, fill=0); c.line(x-2, y+2, x+3, y+2); c.line(x-2, y, x+3, y); c.line(x-2, y-2, x+2, y-2); c.rect(x-4, y-2, 1, 4, stroke=1, fill=0)
    elif kind == "document":
        c.rect(x-4, y-6, 8, 12, stroke=1, fill=0); c.line(x+1, y+6, x+4, y+3); c.line(x-2, y, x+2, y); c.line(x-2, y-2, x+2, y-2)
    elif kind == "grid":
        for dx in (-3, 1):
            for dy in (-3, 1): c.rect(x+dx, y+dy, 3, 3, stroke=1, fill=0)
    elif kind == "pin":
        c.circle(x, y+2, 3, stroke=1, fill=0); c.line(x-2, y, x, y-5); c.line(x+2, y, x, y-5)
    else:
        c.rect(x-6, y-4, 12, 8, stroke=1, fill=0); c.line(x-3, y-6, x+3, y-6); c.circle(x+5, y-1, 0.6, stroke=1, fill=1)

def metric_badge(c, x, y, w, number, label, kind):
    c.setFillColor(PALE); c.roundRect(x, y-32, w, 32, 6, fill=1, stroke=0)
    c.setFillColor(white); c.circle(x+17, y-16, 10, fill=1, stroke=0)
    metric_icon(c, kind, x+17, y-16)
    c.setFillColor(GREEN); c.setFont("SoraBold", 12); c.drawString(x+32, y-14, number)
    c.setFillColor(MUTED); c.setFont("SoraBold", 5.6); c.drawString(x+32, y-23, label)

c = canvas.Canvas(str(OUT), pagesize=A4)
c.setTitle("Relatório de Entrega - Site AIDEP"); c.setAuthor("AIDEP")
c.setFillColor(BLACK); c.rect(0, H-118, W, 118, fill=1, stroke=0)
logo = ROOT / "site" / "public" / "brand" / "pt" / "horizontal-white.png"
if logo.exists():
    image = ImageReader(str(logo)); iw, ih = image.getSize(); c.drawImage(image, 42, H-72, width=120, height=120*ih/iw, mask='auto')
c.setFillColor(white); c.setFont("SoraBold", 22); c.drawString(42, H-90, "Relatório de entrega")
c.setFillColor(HexColor("#B8C7BA")); c.setFont("Sora", 8.4); c.drawString(42, H-108, "Site institucional e painel de conteúdo")
c.setFillColor(GREEN); c.rect(42, H-116, 48, 3, fill=1, stroke=0)

y = H - 204
c.setFillColor(GREEN); c.setFont("SoraBold", 8); c.drawString(42, y, "VISÃO GERAL")
c.setFillColor(INK); c.setFont("SoraBold", 15); c.drawString(42, y-23, "Plataforma institucional AIDEP")
y = paragraph(c, "Ambiente digital para apresentar a associação, seus projetos e resultados, com conteúdo em português, inglês e espanhol e navegação pensada para computador e celular.", 42, y-42, 500, 9, 13, MUTED)
y -= 18
c.setStrokeColor(LINE); c.line(42, y, W-42, y); y -= 20
c.setFillColor(GREEN); c.setFont("SoraBold", 8); c.drawString(42, y, "SITE PÚBLICO")
c.setFillColor(INK); c.setFont("SoraBold", 12.5); c.drawString(42, y-19, "Páginas e experiências entregues")
left_x, right_x, card_w, card_y = 42, 307, 246, y-36
card(c, left_x, card_y, card_w, 74, "01", "Página inicial", "Apresentação da AIDEP, propósito, públicos atendidos, números de impacto, mapa de atuação, fotos, vídeos, parceiros e canais de contato.")
card(c, right_x, card_y, card_w, 74, "02", "Projetos e notícias", "Índice de projetos, páginas detalhadas com galeria e vídeos, além de área de notícias com páginas individuais e conteúdo relacionado.")
card_y -= 85
card(c, left_x, card_y, card_w, 74, "03", "Transparência", "Biblioteca pública de documentos com busca e filtros por ano e categoria, prévia no próprio site, visualização e download.")
card(c, right_x, card_y, card_w, 74, "04", "Institucional", "Páginas de parceiros e doações, seletor de idioma, rodapé completo, SEO técnico, acessibilidade e layout responsivo.")

y = card_y - 96
c.setStrokeColor(LINE); c.line(42, y, W-42, y); y -= 17
metricas = [("3", "IDIOMAS", "globe"), ("6", "PÁGINAS", "pages"), ("3", "PROJETOS", "folder"), ("9", "NOTÍCIAS", "news"), ("2", "DOCUMENTOS", "document"), ("3", "MÓDULOS", "grid"), ("16", "POLOS", "pin"), ("100%", "RESPONSIVO", "screen")]
for indice, (numero, rotulo, icone) in enumerate(metricas):
    coluna, linha = indice % 4, indice // 4
    metric_badge(c, 42 + coluna * 128, y - linha * 38, 119, numero, rotulo, icone)
y -= 85
c.setFillColor(GREEN); c.setFont("SoraBold", 8); c.drawString(42, y, "PAINEL ADMINISTRATIVO")
c.setFillColor(INK); c.setFont("SoraBold", 12.5); c.drawString(42, y-19, "Gestão de conteúdo sem depender de código")
y = paragraph(c, "Acesso restrito para a equipe administrar o conteúdo publicado. Alterações são refletidas no site público após a publicação.", 42, y-36, 500, 8.4, 12, MUTED)
items = [("Notícias", "criar, editar, salvar como rascunho, publicar e remover matérias."), ("Projetos", "cadastrar e atualizar projetos, imagens, galerias, dados de atuação e publicação."), ("Transparência", "enviar documentos, organizar categorias e disponibilizar arquivos com prévia automática.")]
base = y - 14
for i, (title, desc) in enumerate(items):
    x = 42 + i*170
    c.setFillColor(GREEN); c.circle(x+7, base-7, 7, fill=1, stroke=0)
    c.setFillColor(white); c.setFont("SoraBold", 7); c.drawCentredString(x+7, base-9.5, str(i+1))
    c.setFillColor(INK); c.setFont("SoraBold", 8.5); c.drawString(x+20, base-4, title)
    paragraph(c, desc, x+20, base-18, 140, 7.1, 9.5, MUTED)
c.setFillColor(BLACK); c.rect(0, 0, W, 37, fill=1, stroke=0)
c.setFillColor(white); c.setFont("SoraMedium", 7.2); c.drawString(42, 15, "AIDEP - Associação Internacional para o Desenvolvimento do Desporto e Paradesporto")
c.setFillColor(HexColor("#B8C7BA")); c.drawRightString(W-42, 15, "Entrega do site institucional")
c.save(); print(OUT)
