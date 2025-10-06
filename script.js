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
  }
  { "t": "Siento como si me hubiesen robado algo esencial y no sé qué es.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "Soy del tamaño de lo que veo, no del tamaño de mi estatura.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "Todo me cansa, hasta aquello que no me cansa.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "No soy nada. Nunca seré nada. No puedo querer ser nada. Aparte de eso, tengo en mí todos los sueños del mundo.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "La tristeza es un hábito que se me ha hecho carne.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "Vivir es ser otro. Ni sentir es posible si hoy se siente como ayer se sintió.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "La vida es lo que hacemos de ella. Los viajes son los viajeros. Lo que vemos no es lo que vemos, sino lo que somos.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "Sueño porque no puedo vivir.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "Tengo, en efecto, el alma de una marioneta filosófica.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "Nada me une a nada. Quiero veinte cosas al mismo tiempo y no deseo ninguna.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "Mi alma es como una orquesta oculta; no sé qué instrumentos tocan ni qué música producen.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "Soy como una habitación con muchos espejos que se reflejan en espejos; en cada uno me veo diferente, y la imagen de todos esos reflejos soy yo.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "He llegado a un punto donde ya no me interesa ser comprendido: me basta con ser.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "Todo esfuerzo es un error; toda acción es una derrota.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "No pertenezco a nada. Ni siquiera a la indiferencia a la que pertenezco.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "Mi deseo es huir, pero no sé de qué; mi deseo es buscar, pero no sé qué.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "Sufro de una lucidez que me impide ser contento.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "A veces siento un cansancio tan profundo que no tengo ni siquiera ganas de soñar.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "Hay un cansancio del alma más terrible que el del cuerpo: el cansancio de no querer nada.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "La monotonía del ser es un mar sin olas.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "El tedio es la sensación física del tiempo que pasa lentamente.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "Lo que en mí siente está pensando.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "El insomnio de mi alma tiene los ojos abiertos y ve siempre lo mismo.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "No sé quién soy: no sé qué alma tengo.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "Soy un paisaje de dentro.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "La lucidez me devora como una llama interior.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "La soledad no es estar solo, es estar vacío.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "Hay momentos en que todo me parece un decorado; incluso yo.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "La vida es una posada en la que debo esperar hasta que me llamen del abismo.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" },
  { "t": "No me duele la vida; me duele la conciencia de vivir.", "a": "Fernando Pessoa (Bernardo Soares)", "obra": "El libro del desasosiego", "lang": "es" }
];

const STORAGE_KEY = "paramo-literario-vistos";

function getVistos() {
  try {
    const arr = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return Array.isArray(arr) ? arr : [];
  } catch { return []; }
}

function setVistos(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function pickRandomNoRepeat() {
  let vistos = getVistos();
  if (vistos.length >= QUOTES.length) {
    vistos = [];
  }
  const disponibles = QUOTES.map((_, i) => i).filter(i => !vistos.includes(i));
  const elegido = disponibles[Math.floor(Math.random() * disponibles.length)];
  vistos.push(elegido);
  setVistos(vistos);
  return { ...QUOTES[elegido], idx: elegido };
}

let currentQuote = null;
let voicesReady = false;

// Selecciona la voz más fluida disponible
function getPreferredVoice() {
  const voices = window.speechSynthesis.getVoices();
  return (
    voices.find(v => v.lang.startsWith("es") && v.name.includes("Google")) ||
    voices.find(v => v.lang.startsWith("es") && v.name.includes("Microsoft Sabina")) ||
    voices.find(v => v.lang.startsWith("es"))
  );
}

function speakQuote(text) {
  if (!voicesReady) {
    setTimeout(() => speakQuote(text), 200);
    return;
  }
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }
  const utter = new window.SpeechSynthesisUtterance(text);
  const preferred = getPreferredVoice();
  if (preferred) {
    utter.voice = preferred;
    utter.lang = preferred.lang;
  } else {
    utter.lang = "es-ES";
  }
  window.speechSynthesis.speak(utter);
}

function renderQuote() {
  currentQuote = pickRandomNoRepeat();
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
window.speechSynthesis.onvoiceschanged = () => {
  voicesReady = true;
};

document.addEventListener("DOMContentLoaded", () => {
  if (window.speechSynthesis.getVoices().length > 0) {
    voicesReady = true;
  }
  initApp();
});
