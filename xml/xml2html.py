
import sys
import xml.etree.ElementTree as ET
from typing import List

class Html:
    def __init__(self, lang='es'):

        self.root = ET.Element('html', lang=lang)
        self.head = ET.SubElement(self.root, 'head')
        self.body = ET.SubElement(self.root, 'body')

        ET.SubElement(self.head, 'meta', attrib={'charset': 'utf-8'})
        ET.SubElement(self.head, 'meta', attrib={
            'name': 'viewport',
            'content': 'width=device-width, initial-scale=1'
        })

        self.title = ET.SubElement(self.head, 'title')
        self.title.text = 'Info del circuito'

        self._css_link = None

    def set_title(self, text: str):
        self.title.text = text

    def link_css(self, href: str):

        if self._css_link is None:
            self._css_link = ET.SubElement(self.head, 'link', rel='stylesheet', href=href)
        else:
            self._css_link.set('href', href)


    def add_paragraph(self, text: str):
        p = ET.SubElement(self.body, 'p', {})
        p.text = text
        return p

    def add_section(self, title: str):
        sec_attrib = {}
        section = ET.SubElement(self.body, 'section', attrib=sec_attrib)
        ET.SubElement(section, 'h2').text = title
        return section

    def add_definition_list(self, parent, items: List[tuple]):
        
        dl = ET.SubElement(parent, 'dl')
        for term, definition in items:
            dt = ET.SubElement(dl, 'dt')
            dt.text = term
            dd = ET.SubElement(dl, 'dd')
            dd.text = definition
        return dl
    
    

    def add_unordered_list(self, parent, items: List[str]):
        ul = ET.SubElement(parent, 'ul')
        for it in items:
            li = ET.SubElement(ul, 'li')
            li.text = it
        return ul
    
    def add_ordered_list(self, parent, items: List[str]):
        ol = ET.SubElement(parent, 'ol')
        for it in items:
            li = ET.SubElement(ol, 'li')
            li.text = it
        return ol

    def add_link(self, parent, href: str, text: str):
        a = ET.SubElement(parent, 'a', href=href)
        a.text = text

        return a

    def add_image(self, parent, src: str, alt: str, width: str = None, height: str = None):
        attrib = {'src': src, 'alt': alt}
        if width:
            attrib['width'] = width
        if height:
            attrib['height'] = height
        img = ET.SubElement(parent, 'img', attrib=attrib)
        return img

    def add_table(self, parent, headers: List[str], rows: List[List[str]]):
        table = ET.SubElement(parent, 'table')
        thead = ET.SubElement(table, 'thead')
        trh = ET.SubElement(thead, 'tr')
        for h in headers:
            th = ET.SubElement(trh, 'th')
            th.text = h
        tbody = ET.SubElement(table, 'tbody')
        for r in rows:
            tr = ET.SubElement(tbody, 'tr')
            for cell in r:
                td = ET.SubElement(tr, 'td')
                td.text = cell
        return table

    def write(self, filename: str):

        doc = ET.ElementTree(self.root)
        ET.indent(doc)

        with open(filename, 'wb') as f:
            f.write(b'<!DOCTYPE html>\n')
            doc.write(f, encoding='utf-8', xml_declaration=False, method='html')


def extraer_info(xml_path: str):

    ns = {'u': 'http://www.uniovi.es'}
    tree = ET.parse(xml_path)
    root = tree.getroot()

    info = {}

    # Nombre del circuito (elemento <nombreC nombre="...">)
    nombreC = root.findall('.//u:nombreC', ns)
    if nombreC:
        # atributo 'nombre'
        info['nombre'] = nombreC[0].attrib.get('nombre', nombreC[0].text or '').strip()
    else:
        info['nombre'] = 'Desconocido'

    # Medidas: longitud y anchura (atributo metros)
    longitud_el = root.find('.//u:longitud', ns)
    anchura_el = root.find('.//u:anchura', ns)
    info['longitud_m'] = longitud_el.attrib.get('metros') if longitud_el is not None else ''
    info['anchura_m'] = anchura_el.attrib.get('metros') if anchura_el is not None else ''

    # Fecha y hora
    fecha_el = root.find('.//u:fecha', ns)
    hora_el = root.find('.//u:hora', ns)
    info['fecha'] = fecha_el.attrib.get('dia') if fecha_el is not None else (fecha_el.text if fecha_el is not None and fecha_el.text else '')
    info['hora'] = hora_el.attrib.get('hora') if hora_el is not None else (hora_el.text if hora_el is not None and hora_el.text else '')

    # Número de vueltas
    nv_el = root.find('.//u:numeroVueltas', ns)
    info['vueltas'] = nv_el.attrib.get('vueltas') if nv_el is not None else ''

    # Localidad y país
    loc_el = root.find('.//u:localidad', ns)
    pais_el = root.find('.//u:pais', ns)
    info['ciudad'] = loc_el.attrib.get('ciudad') if loc_el is not None else (loc_el.text if loc_el is not None and loc_el.text else '')
    info['pais'] = pais_el.attrib.get('pais') if pais_el is not None else (pais_el.text if pais_el is not None and pais_el.text else '')

    # Patrocinador
    pat_el = root.find('.//u:patrocinador', ns)
    info['patrocinador'] = pat_el.attrib.get('empresa') if pat_el is not None else (pat_el.text if pat_el is not None and pat_el.text else '')

    # Referencias: lista de (url, texto)
    info['referencias'] = []
    for ref in root.findall('.//u:referencias/u:referencia', ns):
        url = ref.attrib.get('url', '').strip()
        text = (ref.text or '').strip()
        info['referencias'].append((url, text))

    # Imagenes: lista de (url, texto)
    info['imagenes'] = []
    for img in root.findall('.//u:imagenes/u:imagen', ns):
        url = img.attrib.get('url', '').strip()
        text = (img.text or '').strip()
        info['imagenes'].append((url, text))

    # Videos: lista de (url, texto)
    info['videos'] = []
    for vid in root.findall('.//u:videos/u:video', ns):
        url = vid.attrib.get('url', '').strip()
        text = (vid.text or '').strip()
        info['videos'].append((url, text))

    # Vencedor (persona nombre attr)
    ganador_el = root.find('.//u:vencedor/u:persona', ns)
    info['vencedor'] = ganador_el.attrib.get('nombre') if ganador_el is not None else ''

    # Clasificados (lista)
    info['clasificados'] = []
    for p in root.findall('.//u:clasificados/u:persona', ns):
        nombre = p.attrib.get('nombre') or (p.text or '').strip()
        info['clasificados'].append(nombre)

    return info


# -------------------------
# Programa principal
# -------------------------
def main():
    xml_path = "circuitoEsquema.xml"
    html_path = "InfoCircuito.html"

    try:
        info = extraer_info(xml_path)
    except Exception as e:
        print(f"Error al leer/parsar '{xml_path}': {e}")
        sys.exit(2)


    doc = Html(lang='es')
    doc.set_title(f"Info: {info.get('nombre','Circuito')}")

    doc.link_css("MotoGP Desktop/estilo/estilo.css")


    header = ET.SubElement(doc.body, 'header')
    ET.SubElement(header, 'h1').text = info.get('nombre', 'Circuito')

    sec_gen = doc.add_section("Datos generales")
    items = [
        ("Longitud (m)", info.get('longitud_m','')),
        ("Anchura (m)", info.get('anchura_m','')),
        ("Fecha", info.get('fecha','')),
        ("Hora", info.get('hora','')),
        ("Número de vueltas", info.get('vueltas','')),
        ("Ciudad", info.get('ciudad','')),
        ("País", info.get('pais','')),
        ("Patrocinador", info.get('patrocinador','')),
    ]
    doc.add_definition_list(sec_gen, items)


    sec_refs = doc.add_section("Referencias")
    if info['referencias']:
        ul = ET.SubElement(sec_refs, 'ul')
        for url, text in info['referencias']:
            li = ET.SubElement(ul, 'li')
            a = ET.SubElement(li, 'a', href=url)
            a.text = text or url

            a.set('rel', 'noopener noreferrer')
    else:
        ET.SubElement(sec_refs, 'p').text = "No hay referencias."

    sec_imgs = doc.add_section("Imágenes")
    if info['imagenes']:
        grid = ET.SubElement(sec_imgs, 'div')
        for url, text in info['imagenes']:
            item = ET.SubElement(grid, 'figure')
            # Use the provided URL as the src. Add alt text from element text.
            img_alt = text or f"Imagen del circuito: {info.get('nombre','')}"
            ET.SubElement(item, 'img', src=url, alt=img_alt)
            if text:
                ET.SubElement(item, 'figcaption').text = text
    else:
        ET.SubElement(sec_imgs, 'p').text = "No hay imágenes."

    # Sección: vídeos
    sec_vids = doc.add_section("Vídeos")
    if info['videos']:
        ulv = ET.SubElement(sec_vids, 'ul')
        for url, text in info['videos']:
            li = ET.SubElement(ulv, 'li')
            a = ET.SubElement(li, 'a', href=url)
            a.text = text or url
    else:
        ET.SubElement(sec_vids, 'p').text = "No hay vídeos."

    # Sección: resultados
    sec_res = doc.add_section("Resultados")
    ET.SubElement(sec_res, 'p').text = f"Vencedor: {info.get('vencedor','')}"
    if info['clasificados']:
        doc.add_ordered_list(sec_res, info['clasificados'])
    else:
        ET.SubElement(sec_res, 'p').text = "No hay clasificados."

    # Footer con nota
    footer = ET.SubElement(doc.body, 'footer')
    ET.SubElement(footer, 'p').text = "&copy; 2025 MotoGP Desktop - Enol Ruiz Barcala"

    # Escribir HTML final
    try:
        doc.write(html_path)
        print(f"Archivo '{html_path}' generado correctamente.")
    except Exception as e:
        print(f"Error al escribir '{html_path}': {e}")
        sys.exit(3)


if __name__ == "__main__":
    main()
