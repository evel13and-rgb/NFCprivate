import { createQuoteManager } from './quoteLogic.js';

const QUOTES = [
  {
    t: "He soñado en mi vida sueños que han permanecido conmigo para siempre, y han cambiado mis ideas; han pasado a través de mí como el vino a través del agua, y han alterado el color de mi mente. Si me caso con Linton, podría ser muy feliz: él es tan apacible, y tan diferente de Heathcliff. Pero ¿cómo puedo vivir sin mi alma? Yo sé que Heathcliff no sabe cuánto lo amo, ni que no es porque sea guapo, Nelly, sino porque es más yo que yo misma. Sea lo que sea de lo que estén hechas nuestras almas, la suya y la mía son lo mismo, y Linton es tan diferente de mí como un rayo de luna de un relámpago, o el hielo del fuego. Mi amor por Linton es como el follaje del bosque: el tiempo lo cambiará, lo sé bien, como el invierno cambia los árboles. Mi amor por Heathcliff se parece a las rocas eternas que hay debajo: no es una fuente de placer visible, pero es necesario. Nelly, yo soy Heathcliff. Él está siempre, siempre en mi mente: no como un placer, sino como mi propio ser. Así que no hables de separarnos; eso es imposible.",
    a: "🕯️ Catherine Earnshaw, Capítulo IX. Cumbres Borrascosas."
  },
  {
    t: "—¡Déjame ir, Heathcliff! —dijo ella—. Si me matas, mi alma no descansará. Estaré a tu alrededor, en los páramos, de noche y de día. Me asomaré por tu ventana en cada viento; me reiré de ti, y no podrás escapar de mí hasta que te mueras. ¿Te crees que porque odio el alma que me separó de ti, no te amo a ti? ¡Tonto, tonto Heathcliff! ¡Oh, te amo, te amo! ¿Por qué no puedo odiarte? Me has roto el corazón, y tú rompes el tuyo al mismo tiempo; y eso es suficiente para ambos.",
    a: "Catherine Earnshaw. Cumbres Borrascosas."
  },
  {
    t: "No sé cómo logré abrir el ataúd; no me importaba si me descubrían, si me maldecían o si me condenaban. La miré: ¡ay, Dios mío! Su rostro había perdido la expresión, pero seguía siendo ella. Mis lágrimas no eran de dolor, sino de furia. La abracé con desesperación y la besé con la rabia de un loco. —¡Catherine Earnshaw! —grité—, que regreses a mí como alma o como sombra, pero regresa. Persígueme, tortúrame, hazme perder la razón, pero no te apartes de mi lado. ¡No puedo vivir sin mi vida! ¡No puedo vivir sin mi alma!”",
    a: "Heathcliff. Cumbres Borrascosas"
  },
  {
    t: "He estado vagando por los páramos noche y día desde que ella murió. No puedo dormir, no puedo comer. La odio por dejarme; pero la amo con una pasión que no muere. No puedo dejar de odiar lo que destruyó mi alma. ¡Oh, si pudiera olvidarla! Pero cada pensamiento, cada visión, cada respiración me la devuelve. A veces me parece que la veo en los pliegues de la niebla, o en la forma de una nube, o que la oigo riendo en el viento. No quiero seguir viviendo. Estoy cansado de seguir respirando cuando ella no está aquí. No quiero suplantar a los vivos, quiero estar con los muertos. Tal vez la muerte me devuelva lo que la vida me quitó.",
    a: "Heathcliff. Cumbres Borrascosas"
  },
  {
    t: "Estaba tendido en la cama, con los ojos abiertos y una sonrisa extraña en los labios, como si hubiera conseguido por fin lo que tanto había deseado. La ventana estaba abierta, el viento agitaba el cabello sobre su frente, y la lluvia había empapado la almohada. Su rostro, aunque pálido, tenía una serenidad que jamás vi en él en vida. No sentí miedo, sino una especie de respeto solemne. Era como si el espíritu de Catherine hubiera venido a buscarlo, y ahora ambos descansaran juntos, al fin.",
    a: "Nelly Dean. Cumbres Borrascosas"
  },
  {
    t: "Cielos, qué tierra salvaje, triste y hermosa es ésta —pensé al aproximarme al edificio—. El aire soplaba con tanta fuerza que apenas podía mantenerme en pie, y los páramos se extendían a mi alrededor como un mar oscuro y sin límites. Sin embargo, había algo en ese aislamiento, en esa rudeza, que me atraía irresistiblemente. Era un paisaje que hablaba de pasiones primitivas y tormentas interiores.",
    a: "Lockwood. Cumbres Borrascosas"
  },
  {
    t: "Fue una noche espantosa aquella en que cobré vida. Un frío helado me recorrió; una luz deslumbrante hirió mis ojos, y un ruido confuso me ensordeció. Poco a poco distinguí las formas que me rodeaban, y una sensación de calor, de hambre, de cansancio me abrumó. No sabía quién era ni qué era. Vagaba por los bosques sin rumbo, estremecido por la lluvia y el viento, con los sentidos confusos pero llenos de una curiosidad inexplicable. Aprendí que el fuego daba calor y luz, pero también que quemaba; y que el agua calmaba la sed, pero podía ahogar. Así, paso a paso, fui descubriendo el mundo.",
    a: "La Criatura. Frankenstein o El moderno Prometeo"
  },
  {
    t: "Observaba a la familia y aprendía de ellos. Me maravillaba la suavidad de sus costumbres, el amor que se profesaban y la armonía de su hogar. Al principio ignoraba las palabras que pronunciaban, pero poco a poco fui comprendiendo que existía un modo de comunicación más elevado que los gestos. Me esforcé por imitar sus sonidos, y con el tiempo logré entenderlos. Así, en mi corazón nacieron emociones desconocidas: admiración, ternura, deseo de afecto. Comprendí que ellos se amaban mutuamente, y que yo no tenía a nadie. Cada día que pasaba aumentaba mi conocimiento y mi desesperanza.",
    a: "La Criatura. Frankenstein o El moderno Prometeo"
  },
  {
    t: "Un día, mientras contemplaba mi reflejo en un estanque, me sobrecogió el espanto. No podía creer que aquel rostro deformado y espantoso me perteneciera. Cuando veía a los demás hombres, tan bellos y armoniosos, sentía que entre ellos yo no tenía lugar. La desesperación me invadió. ¡Oh, cuánto hubiera dado por borrar esa fealdad, por tener un amigo que no huyera al verme! Pero comprendí que mi destino era la soledad.",
    a: "La Criatura. Frankenstein o El moderno Prometeo"
  },
  {
    t: "¡Créame una compañera, igual que yo, con la que pueda vivir en la mutua comprensión! Exijo este derecho, que no se me niegue por compasión o por justicia. He sido bueno; he sufrido; he sido abandonado. La soledad me consume. Recuerde que soy su obra: usted me debe felicidad, o al menos la ausencia del tormento. Si concede mi petición, me alejaré para siempre de los hombres, y usted no volverá a saber de mí.",
    a: "La Criatura. Frankenstein o El moderno Prometeo"
  },
  {
    t: "Él está muerto, y yo también lo estaré pronto. Pero antes de irme quiero que sepa que no era mi deseo hacer el mal. Todo empezó con el abandono. Quería amor y recibí odio. Quería compañía y recibí soledad. Si los hombres hubieran sido justos conmigo, habría sido su amigo; pero el sufrimiento convirtió mi corazón en hiel. Aun así, no puedo odiar a quien me dio la vida; he sentido dolor por su muerte. No me queda más que desaparecer entre los hielos, donde el fuego de mis remordimientos se extinguirá para siempre.",
    a: "La Criatura. Frankenstein o El moderno Prometeo"
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
    setTimeout(() => speakQuote(text), 200);
    return;
  }
  if (synth.speaking) {
    synth.cancel();
  }
  const utter = new window.SpeechSynthesisUtterance(text);
  const preferred = getPreferredVoice();
  if (preferred) {
    utter.voice = preferred;
    utter.lang = preferred.lang;
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
        speakQuote(`${currentQuote.t}. ${currentQuote.a}`);
      }
    });
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        if (currentQuote) {
          speakQuote(`${currentQuote.t}. ${currentQuote.a}`);
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
