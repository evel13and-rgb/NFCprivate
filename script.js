import { createQuoteManager } from './quoteLogic.js';

const QUOTES = [
  {
    t: "No soy nada. Nunca seré nada. No puedo querer ser nada. Aparte de esto, tengo en mí todos los sueños del mundo.",
    a: "Fernando Pessoa, “Tabacaria”"
  },
  {
    t: "La literatura es la prueba de que la vida no basta.",
    a: "Fernando Pessoa"
  },
  {
    t: "A veces escucho pasar el viento; y solo de oír pasar el viento, vale la pena haber nacido.",
    a: "Fernando Pessoa"
  },
  {
    t: "El valor de las cosas no está en el tiempo que duran, sino en la intensidad con que se viven.",
    a: "Fernando Pessoa"
  },
  {
    t: "La vida es lo que hacemos de ella. Los viajes son los viajeros. Lo que vemos no es lo que vemos, sino lo que somos.",
    a: "Fernando Pessoa, Libro del desasosiego"
  },
  {
    t: "La lengua portuguesa es mi patria, y la nostalgia, mi forma de estar.",
    a: "Fernando Pessoa"
  },
  {
    t: "He soñado en mi vida sueños que han permanecido conmigo para siempre, y han cambiado mis ideas; han pasado a través de mí como el vino a través del agua, y han alterado el color de mi mente. Si me caso con Linton, podría ser muy feliz: él es tan apacible, y tan diferente de Heathcliff. Pero ¿cómo puedo vivir sin mi alma? Yo sé que Heathcliff no sabe cuánto lo amo, ni que no es porque sea guapo, Nelly, sino porque es más yo que yo misma. Sea lo que sea de lo que estén hechas nuestras almas, la suya y la mía son lo mismo, y Linton es tan diferente de mí como un rayo de luna de un relámpago, o el hielo del fuego. Mi amor por Linton es como el follaje del bosque: el tiempo lo cambiará, lo sé bien, como el invierno cambia los árboles. Mi amor por Heathcliff se parece a las rocas eternas que hay debajo: no es una fuente de placer visible, pero es necesario. Nelly, yo soy Heathcliff. Él está siempre, siempre en mi mente: no como un placer, sino como mi propio ser. Así que no hables de separarnos; eso es imposible.",
    a: "🕯️ Catherine Earnshaw, Capítulo IX. Cumbres Borrascosas."
  },
  {
    t: "Hay un cansancio del alma más terrible que el del cuerpo: el cansancio de no querer nada.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "La monotonía del ser es un mar sin olas.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "El tedio es la sensación física del tiempo que pasa lentamente.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "Lo que en mí siente está pensando.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "El insomnio de mi alma tiene los ojos abiertos y ve siempre lo mismo.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "No sé quién soy: no sé qué alma tengo.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "Soy un paisaje de dentro.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "La lucidez me devora como una llama interior.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "La soledad no es estar solo, es estar vacío.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "Hay momentos en que todo me parece un decorado; incluso yo.",
    a: "Fernando Pessoa (Bernardo Soares)",
    obra: "El libro del desasosiego",
    lang: "es"
  },
  {
    t: "Isa, cuando leas estas páginas, yo habré muerto. He querido hablarte al fin sin odio, sin deseo de herirte, sin esa cólera fría que ha guiado toda mi vida.\nDurante cuarenta años he vivido junto a ti como un enemigo, y cada día he buscado nuevas razones para justificar mi odio. Pero lo cierto es que te odié porque te amé, porque esperaba de ti lo que tú no sabías darme. Te reproché haberme cerrado las puertas de tu alma, cuando en realidad era yo quien las había cerrado primero.",
    a: "Louis, Nudo de víboras"
  },
  {
    t: "Vine a Comala porque me dijeron que acá vivía mi padre, un tal Pedro Páramo. Mi madre me lo dijo. Y yo le prometí que vendría a verlo en cuanto ella muriera. Le apreté las manos en señal de que lo haría; pues ella estaba por morirse y yo en un plan de prometerlo todo.",
    a: "Juan Preciado. Pedro Páramo"
  },
  {
    t: "La tierra está llena de memorias. Oyen nuestros pasos y responden con ecos viejos, con voces que creíamos perdidas. Basta cerrar los ojos para sentir el temblor de los muertos, la respiración de quienes alguna vez amamos.",
    a: "Susurros del páramo. Pedro Páramo"
  },
  {
    t: "Se oye el rumor de la lluvia como si la noche estuviera llena de almas. Cada gota golpea con un dolor antiguo, como si el cielo llorara por nosotros. Y sin embargo, hay una paz en esa tristeza, una tregua que nos deja respirar.",
    a: "Susana San Juan. Pedro Páramo"
  },
  {
    t: "El páramo es una página en blanco. Cada paso escribe una palabra que el viento borra. Pero el corazón recuerda las historias que el aire se lleva, porque están hechas del mismo polvo que nos creó.",
    a: "Voces del pueblo. Pedro Páramo"
  },
  {
    t: "Yo maté a Pedro Páramo. Fue como si hubiera destruido a mi propio padre, porque de él dependía mi mundo. Pero también fue como quitar una piedra del camino para que corriera el agua. Desde entonces oigo el murmullo de la vida que vuelve.",
    a: "Abundio Martínez. Pedro Páramo"
  },
  {
    t: "No vayas a pedirle nada. Exígele lo nuestro. Lo demás es cosa tuya. Eso me dijo mi madre mientras me apretaba las manos antes de morir, y con esas palabras cargué el camino entero hasta Comala.",
    a: "Dolores Preciado. Pedro Páramo"
  },
  {
    t: "El pueblo estaba lleno de ecos. Cada vez que pronunciaba el nombre de Pedro Páramo, me contestaban murmullos que venían del suelo, como si la tierra misma lo repitiera.",
    a: "Juan Preciado. Pedro Páramo"
  },
  {
    t: "Sentí que el aire olía a humedad envejecida, a tierra recién abierta. Era un olor triste, como si de las paredes brotara la voz de los muertos que no terminan de irse.",
    a: "Susana San Juan. Pedro Páramo"
  },
  {
    t: "Yo estaba hecha para soñar, para caminar entre recuerdos. Por eso Pedro Páramo me buscaba: sabía que mis pensamientos eran el único lugar donde todavía podía encontrar consuelo.",
    a: "Susana San Juan. Pedro Páramo"
  },
  {
    t: "En la Media Luna todo tenía dueño, hasta el silencio. Y sin embargo, cuando él murió, entendimos que el poder de Pedro Páramo era sólo un polvo que se deshacía en el aire caliente.",
    a: "Fulgor Sedano. Pedro Páramo"
  }
];

const storage = typeof window !== 'undefined' ? window.localStorage : undefined;
const quoteManager = createQuoteManager(QUOTES, storage);

let currentQuote = null;
const synth = typeof window !== 'undefined' && 'speechSynthesis' in window ? window.speechSynthesis : null;
let voicesReady = synth ? synth.getVoices().length > 0 : false;

// Selecciona la voz más fluida disponible
function getPreferredVoice() {
  if (!synth) return null;
  const voices = synth.getVoices();
  return (
    voices.find(v => v.lang.startsWith("es") && v.name.includes("Google")) ||
    voices.find(v => v.lang.startsWith("es") && v.name.includes("Microsoft Sabina")) ||
    voices.find(v => v.lang.startsWith("es"))
  );
}

function speakQuote(text) {
  if (!synth) {
    return;
  }
  if (!voicesReady) {
    setTimeout(() => speakQuote(quote), 200);
    return;
  }
  if (synth.speaking) {
    synth.cancel();
  }
  const utter = new window.SpeechSynthesisUtterance(buildSpeechText(quote));
  const preferred = getPreferredVoice();
  if (preferred) {
    utter.voice = preferred;
    utter.lang = preferred.lang;
  } else if (quote.lang) {
    utter.lang = quote.lang.startsWith("es") ? "es-ES" : quote.lang;
  } else {
    utter.lang = "es-ES";
  }
  synth.speak(utter);
}

function renderQuote() {
  currentQuote = quoteManager.next();
  document.getElementById('quote').textContent = '“' + currentQuote.t + '”';
  document.getElementById('author').textContent = '— ' + currentQuote.a;
}

function initApp() {
  renderQuote();
  const card = document.getElementById("card");
  if (card) {
    card.addEventListener("click", () => {
      if (currentQuote) {
        speakQuote(currentQuote);
      }
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (currentQuote) {
          speakQuote(currentQuote);
        }
      }
    });
  }
}

// Espera a que las voces estén listas antes de permitir hablar
if (synth) {
  synth.onvoiceschanged = () => {
    voicesReady = true;
  };
}

document.addEventListener("DOMContentLoaded", () => {
  if (synth && synth.getVoices().length > 0) {
    voicesReady = true;
  }
  initApp();
});
