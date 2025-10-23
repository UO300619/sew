
import sys
import xml.etree.ElementTree as ET



# Clase Kml

class Kml(object):
    """
    Genera archivo KML con puntos y líneas
    @version 1.1 19/Octubre/2024
    @autor: Juan Manuel Cueva Lovelle. Universidad de Oviedo
    """
    def __init__(self):
        """
        Crea el elemento raíz y el espacio de nombres
        """
        self.raiz = ET.Element('kml', xmlns="http://www.opengis.net/kml/2.2")
        self.doc = ET.SubElement(self.raiz,'Document')

    def addPlacemark(self,nombre,descripcion,long,lat,alt, modoAltitud):
        """
        Añade un elemento <Placemark> con puntos <Point>
        """
        pm = ET.SubElement(self.doc,'Placemark')
        ET.SubElement(pm,'name').text = nombre
        ET.SubElement(pm,'description').text = descripcion
        punto = ET.SubElement(pm,'Point')
        ET.SubElement(punto,'coordinates').text = '{},{},{}'.format(long,lat,alt)
        ET.SubElement(punto,'altitudeMode').text = modoAltitud

    def addLineString(self,nombre,extrude,tesela, listaCoordenadas, modoAltitud, color, ancho):
        """
        Añade un elemento <Placemark> con líneas <LineString>
        """
        ET.SubElement(self.doc,'name').text = nombre
        pm = ET.SubElement(self.doc,'Placemark')
        ls = ET.SubElement(pm, 'LineString')
        ET.SubElement(ls,'extrude').text = extrude
        ET.SubElement(ls,'tessellation').text = tesela
        ET.SubElement(ls,'coordinates').text = listaCoordenadas
        ET.SubElement(ls,'altitudeMode').text = modoAltitud 

        estilo = ET.SubElement(pm, 'Style')
        linea = ET.SubElement(estilo, 'LineStyle')
        ET.SubElement (linea, 'color').text = color
        ET.SubElement (linea, 'width').text = ancho

    def escribir(self,nombreArchivoKML):
        """
        Escribe el archivo KML con declaración y codificación
        """
        arbol = ET.ElementTree(self.raiz)
        ET.indent(arbol)
        arbol.write(nombreArchivoKML, encoding='utf-8', xml_declaration=True)
    
    def ver(self):
        """
        Muestra el archivo KML. Se utiliza para depurar
        """
        print("\nElemento raiz = ", self.raiz.tag)
        if self.raiz.text != None:
            print("Contenido = ", self.raiz.text.strip('\n'))
        else:
            print("Contenido = ", self.raiz.text)
        print("Atributos = ", self.raiz.attrib)
        for hijo in self.raiz.findall('.//'):
            print("\nElemento = ", hijo.tag)
            if hijo.text != None:
                print("Contenido = ", hijo.text.strip('\n'))
            else:
                print("Contenido = ", hijo.text)    
            print("Atributos = ", hijo.attrib)




# Función para extraer coordenadas del XML usando XPath

def extraer_coordenadas(xml_path):
    ns = {'u': 'http://www.uniovi.es'}
    tree = ET.parse(xml_path)
    root = tree.getroot()

    coords = []

    # Buscar todas las coordenadas del XML
    for c in root.findall('.//u:coordenada', ns):
        lat = float(c.attrib.get('latitud'))
        lon = float(c.attrib.get('longitud'))
        alt = float(c.attrib.get('altitud', 0))
        coords.append((lon, lat, alt))

    return coords

# Programa principal

def main():

    xml_path = "circuitoEsquema.xml"
    kml_path = "circuito.kml"

    # 1️⃣ Leer el archivo XML (árbol DOM en memoria)
    try:
        coords = extraer_coordenadas(xml_path)
    except Exception as e:
        print(f"Error procesando XML: {e}")
        sys.exit(2)

    if not coords:
        print("No se encontraron coordenadas en el XML.")
        sys.exit(3)

   
    kml = Kml()

    # Punto de inicio (origen)
    origen = coords[0]
    kml.addPlacemark(
        nombre="Origen del circuito",
        descripcion="Punto inicial del trazado",
        long=origen[0],
        lat=origen[1],
        alt=origen[2],
        modoAltitud="relativeToGround"
    )

    # Línea completa del circuito
    lista_coordenadas = ""
    for lon, lat, alt in coords:
        lista_coordenadas += f"{lon},{lat},{alt} "

    kml.addLineString(
        nombre="Trazado del circuito",
        extrude="1",
        tesela="1",
        listaCoordenadas=lista_coordenadas.strip(),
        modoAltitud="relativeToGround",
        color="ff0000ff",  # rojo en formato ABGR
        ancho="3"
    )

    # 3️⃣ Escribir archivo KML
    kml.escribir(kml_path)
    print(f"Archivo '{kml_path}' generado correctamente con {len(coords)} puntos.")


if __name__ == "__main__":
    main()
