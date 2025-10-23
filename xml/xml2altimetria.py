

import xml.etree.ElementTree as ET
import sys


# ======================================================
# Clase Svg (proporcionada por el profesor)
# ======================================================
class Svg(object):
    """
    Genera archivos SVG con rectángulos, círculos, líneas, polilíneas y texto
    @version 1.0 18/Octubre/2024
    @author: Juan Manuel Cueva Lovelle. Universidad de Oviedo
    """
    def __init__(self):
        self.raiz = ET.Element('svg', xmlns="http://www.w3.org/2000/svg", version="2.0")

    def addRect(self,x,y,width,height,fill, strokeWidth,stroke):
        ET.SubElement(self.raiz,'rect',
                      x=x, y=y,
                      width=width, height=height,
                      fill=fill, strokeWidth=strokeWidth, stroke=stroke)
        
    def addLine(self,x1,y1,x2,y2,stroke,strokeWith):
        ET.SubElement(self.raiz,'line',
                      x1=x1, y1=y1,
                      x2=x2, y2=y2,
                      stroke=stroke, strokeWith=strokeWith)

    def addPolyline(self,points,stroke,strokeWith,fill):
        ET.SubElement(self.raiz,'polyline',
                      points=points,
                      stroke=stroke,
                      strokeWith=strokeWith,
                      fill=fill)
        
    def addText(self,texto,x,y,fontFamily,fontSize,style):
        ET.SubElement(self.raiz,'text',
                      x=x, y=y,
                      fontFamily=fontFamily,
                      fontSize=fontSize,
                      style=style).text=texto

    def escribir(self,nombreArchivoSVG):
        arbol = ET.ElementTree(self.raiz)
        ET.indent(arbol)
        arbol.write(nombreArchivoSVG, encoding='utf-8', xml_declaration=True)



# Función para extraer altitudes con XPath

def extraer_altitudes(xml_path):
    ns = {'u': 'http://www.uniovi.es'}
    tree = ET.parse(xml_path)
    root = tree.getroot()

    altitudes = []

    # Altitud del origen
    for c in root.findall('.//u:origen/u:coordenada', ns):
        alt = float(c.attrib.get('altitud', 0))
        altitudes.append(alt)

    # Altitudes de los tramos
    for c in root.findall('.//u:tramos/u:tramo/u:coordenada', ns):
        alt = float(c.attrib.get('altitud', 0))
        altitudes.append(alt)

    return altitudes


def main():
    xml_path = "circuitoEsquema.xml"
    svg_path = "altimetria.svg"


    altitudes = extraer_altitudes(xml_path)
    if not altitudes:
        print("No se encontraron altitudes en el XML.")
        sys.exit(2)


    ancho_svg = 800
    alto_svg = 400
    margen = 50

    max_alt = max(altitudes)
    min_alt = min(altitudes)

   
    escala_y = (alto_svg - 2*margen) / (max_alt - min_alt)

 
    paso_x = (ancho_svg - 2*margen) / (len(altitudes) - 1)

   
    svg = Svg()

    svg.addRect('0','0',str(ancho_svg),str(alto_svg),'white','1','black')
    svg.addLine(str(margen), str(alto_svg - margen),
                str(ancho_svg - margen), str(alto_svg - margen),
                'black','2')
    svg.addLine(str(margen), str(margen),
                str(margen), str(alto_svg - margen),
                'black','2')


    svg.addText("Puntos del circuito", str(ancho_svg/2 - 80),
                str(alto_svg - 10), 'Verdana', '18', 'none')
    svg.addText("Altitud (m)", '10', str(alto_svg/2), 'Verdana', '18',
                "writing-mode: tb; glyph-orientation-vertical: 0;")

 
    puntos = ""
    for i, alt in enumerate(altitudes):
        x = margen + i * paso_x
        y = alto_svg - margen - (alt - min_alt) * escala_y
        puntos += f"{x},{y} "

    puntos += f"{ancho_svg - margen},{alto_svg - margen} {margen},{alto_svg - margen}"

    svg.addPolyline(points=puntos.strip(), stroke='red', strokeWith='2', fill='lightblue')

    svg.escribir(svg_path)
    print(f"Archivo '{svg_path}' generado correctamente con {len(altitudes)} puntos.")


if __name__ == "__main__":
    main()
