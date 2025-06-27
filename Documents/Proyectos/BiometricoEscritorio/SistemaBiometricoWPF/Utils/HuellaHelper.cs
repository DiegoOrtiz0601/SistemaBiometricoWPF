using DPFP;
using System.IO;

namespace BiomentricoHolding.Utils // Cambia "Utils" si usas otro nombre de carpeta 
{
    public static class HuellaHelper
    {
        public static byte[] ConvertirTemplateABytes(Template template)
        {
            using (MemoryStream stream = new MemoryStream())
            {
                template.Serialize(stream);
                return stream.ToArray();
            }
        }

        public static Template ConvertirBytesATemplate(byte[] datos)
        {
            Template template = new Template();
            using (MemoryStream stream = new MemoryStream(datos))
            {
                template.DeSerialize(stream);
            }
            return template;
        }
    }
}
