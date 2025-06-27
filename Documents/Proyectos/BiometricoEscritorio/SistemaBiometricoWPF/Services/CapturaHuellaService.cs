using DPFP;
using DPFP.Capture;
using DPFP.Processing;
using System.Drawing;

namespace BiomentricoHolding.Services
{
    public enum ModoCaptura { Registro, Verificacion }

    public class CapturaHuellaService : DPFP.Capture.EventHandler
    {
        private Capture Capturador;
        private Enrollment Enroller;
        private bool primerIntento = true;
        private bool lectorConectado = false;

        public Template TemplateCapturado { get; private set; }

        public event Action<string> Mensaje;
        public event Action<Template> TemplateGenerado;
        public event Action<Bitmap> MuestraProcesadaImagen;
        public event Action<Sample> MuestraProcesada; // ← muestra cruda para verificación
        public event Action IntentoFallido;

        public ModoCaptura Modo { get; set; } = ModoCaptura.Registro;

        public CapturaHuellaService()
        {
            try
            {
                Capturador = new Capture();
                if (Capturador != null)
                {
                    Capturador.EventHandler = this;
                    Enroller = new Enrollment();
                }
                else
                {
                    Mensaje?.Invoke("⚠ No se pudo inicializar el capturador.");
                }
            }
            catch (Exception ex)
            {
                Mensaje?.Invoke($"❌ Error al inicializar lector: {ex.Message}");
            }
        }

        public void IniciarCaptura()
        {
            try
            {
                DetenerCaptura(); // evitar múltiples sesiones
                Enroller.Clear();
                primerIntento = true;

                Capturador?.StartCapture();
                Mensaje?.Invoke("Coloca tu dedo en el lector para capturar la huella.");
            }
            catch (Exception ex)
            {
                Mensaje?.Invoke($"❌ Error al iniciar la captura: {ex.Message}");
            }
        }

        public void DetenerCaptura()
        {
            try
            {
                Capturador?.StopCapture();
                Mensaje?.Invoke("📴 Captura detenida.");
            }
            catch (Exception ex)
            {
                Mensaje?.Invoke($"❌ Error al detener la captura: {ex.Message}");
            }
        }

        public void OnComplete(object capture, string readerSerialNumber, Sample sample)
        {
            if (!primerIntento)
            {
                Mensaje?.Invoke("❌ Captura bloqueada. Debes reiniciar el proceso.");
                DetenerCaptura();
                return;
            }

            // Mostrar imagen
            MuestraProcesadaImagen?.Invoke(ConvertirMuestraAImagen(sample));

            // ➤ Si estamos en modo verificación, enviar sample directamente
            if (Modo == ModoCaptura.Verificacion)
            {
                MuestraProcesada?.Invoke(sample); // ← aquí haces comparación en el otro módulo
                return;
            }

            // ➤ Si estamos en modo registro, continuar flujo de enrolamiento
            var features = ExtractFeatures(sample, DataPurpose.Enrollment);
            if (features != null)
            {
                try
                {
                    Enroller.AddFeatures(features);
                    Mensaje?.Invoke($"✅ Muestra válida. Faltan {Enroller.FeaturesNeeded} muestra(s).");

                    if (Enroller.TemplateStatus == Enrollment.Status.Ready)
                    {
                        TemplateCapturado = Enroller.Template;
                        TemplateGenerado?.Invoke(TemplateCapturado);
                        Mensaje?.Invoke("🎉 Huella capturada exitosamente.");
                        DetenerCaptura();
                    }
                    else if (Enroller.TemplateStatus == Enrollment.Status.Failed)
                    {
                        ManejarFallo("❌ Las muestras no coincidieron. Debes volver a intentarlo.");
                    }
                }
                catch (DPFP.Error.SDKException ex)
                {
                    ManejarFallo($"❌ Error crítico al capturar huella:\n{ex.Message}");
                }
            }
            else
            {
                ManejarFallo("⚠ Huella no clara. Intenta nuevamente.");
            }
        }

        private void ManejarFallo(string mensaje)
        {
            primerIntento = false;
            IntentoFallido?.Invoke();
            Enroller.Clear();
            DetenerCaptura();
            Mensaje?.Invoke(mensaje);
        }

        private Bitmap ConvertirMuestraAImagen(Sample sample)
        {
            var convertidor = new SampleConversion();
            var imagen = new Bitmap(100, 100);
            convertidor.ConvertToPicture(sample, ref imagen);
            return imagen;
        }

        private FeatureSet ExtractFeatures(Sample sample, DataPurpose purpose)
        {
            var extractor = new FeatureExtraction();
            CaptureFeedback feedback = CaptureFeedback.None;
            var features = new FeatureSet();

            extractor.CreateFeatureSet(sample, purpose, ref feedback, ref features);

            return (feedback == CaptureFeedback.Good) ? features : null;
        }

        public void OnFingerTouch(object capture, string readerSerialNumber)
        {
            if (primerIntento)
                Mensaje?.Invoke("👆 Dedo detectado...");
        }

        public void OnFingerGone(object capture, string readerSerialNumber)
        {
            if (primerIntento)
                Mensaje?.Invoke("👋 Dedo retirado.");
        }

        public void OnReaderConnect(object capture, string readerSerialNumber)
        {
            lectorConectado = true;
            Mensaje?.Invoke("✅ Lector conectado.");
        }

        public void OnReaderDisconnect(object capture, string readerSerialNumber)
        {
            lectorConectado = false;
            Mensaje?.Invoke("❌ Lector desconectado.");
        }

        public void OnSampleQuality(object capture, string readerSerialNumber, CaptureFeedback feedback)
        {
            if (!primerIntento) return;

            if (feedback == CaptureFeedback.Good)
                Mensaje?.Invoke("👌 Calidad de huella aceptable.");
            else
                Mensaje?.Invoke("⚠ Calidad de huella insuficiente.");
        }
        public void Reiniciar(ModoCaptura nuevoModo)
        {
            DetenerCaptura();
            Modo = nuevoModo;
            Enroller?.Clear(); // limpia si es registro
            primerIntento = true;
            IniciarCaptura();
        }
    }
}
