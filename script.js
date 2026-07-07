import { createQuoteManager } from './quoteLogic.js';
import { initFireflyAura } from './fireflies.js';
import { getTimeOfDay, isNightTime } from './dayNight.js';
import { initDaylightMotes, setDaylightMotesActive } from './dayMotes.js';

const PRE_RANDOM_QUOTES = [];
const E_A_FRAGMENTOS_QUOTES = [
  {
    t: "Esa sensación de extrañeza tan profunda, una otredad convexa que casi me pone del revés en el mundo",
    a: "E.A",
    obra: "fragmentos",
    lang: "es"
  },
  {
    t: "Quería hurgar en mi cuerpo, con mis dedos dentro de mi carne, hasta encontrar eso que desquicia",
    a: "E.A",
    obra: "fragmentos",
    lang: "es"
  }
];

const CUMBRES_BORRASCOSAS_QUOTES = [
  {
    t: "He soñado en mi vida sueños que han permanecido conmigo para siempre y han cambiado mis ideas. Han pasado a través de mí como el vino a través del agua, y han alterado el color de mi mente. Si me caso con Linton, podría ser muy feliz: él es tan apacible y tan diferente de Heathcliff. Pero ¿cómo puedo vivir sin mi alma? Sea lo que sea de lo que estén hechas nuestras almas, la suya y la mía son lo mismo, y Linton es tan diferente de mí como un rayo de luna de un relámpago, o el hielo del fuego. Mi amor por Linton es como el follaje del bosque: el tiempo lo cambiará, lo sé bien, como el invierno cambia los árboles. Mi amor por Heathcliff se parece a las rocas eternas que hay debajo: no es una fuente de placer visible, pero es necesario. Nelly, yo soy Heathcliff. Él está siempre, siempre en mi mente: no como un placer, sino como mi propio ser. Así que no hables de separarnos; eso es imposible.",
    a: "Catherine Earnshaw",
    obra: "Cumbres borrascosas, Emily Brontë",
    lang: "es"
  },
  {
    t: "Si todo pereciera y él permaneciera, yo seguiría existiendo; y si todo permaneciera y él fuese aniquilado, el universo se convertiría en algo extraño y terrible: yo no sería parte de él.",
    a: "Catherine Earnshaw",
    obra: "Cumbres borrascosas, Emily Brontë",
    lang: "es"
  }
];


const NUDO_DE_VIBORAS_QUOTES = [
  {
    t: "Isa, cuando leas estas páginas, yo habré muerto. He querido hablarte al fin sin odio, sin deseo de herirte, sin esa cólera fría que ha guiado toda mi vida.\nDurante cuarenta años he vivido junto a ti como un enemigo, y cada día he buscado nuevas razones para justificar mi odio. Pero lo cierto es que te odié porque te amé, porque esperaba de ti lo que tú no sabías darme. Te reproché haberme cerrado las puertas de tu alma, cuando en realidad era yo quien las había cerrado primero.",
    a: "Louis",
    obra: "Nudo de víboras, François Mauriac",
    lang: "es"
  },
  {
    t: "Durante años viví en tu presencia como un animal en una jaula, y tú, con tu dulzura que me exasperaba, no sabías que tus silencios eran mi tortura. No pedía ternura, Isa, pedía simplemente que me reconocieras como un ser que sufre. Me casé contigo con la esperanza de ser salvado, y tú, sin saberlo, fuiste mi condena. Entre nosotros no hubo odio al principio; hubo miedo. Yo temía necesitarte, y tú temías mi necesidad.",
    a: "Louis",
    obra: "Nudo de víboras, François Mauriac",
    lang: "es"
  },
  {
    t: "Cuando era niño, me enseñaron a desconfiar de la vida, a no esperar nada. Aprendí que la ternura es debilidad, que la pobreza es vergüenza y que amar es exponerse al desprecio. Así se formó el nudo de víboras en mi corazón. Lo he alimentado durante toda mi existencia, hasta que se confundió con mi propia sangre. ¿Cómo podía darte lo que nunca recibí?",
    a: "Louis",
    obra: "Nudo de víboras, François Mauriac",
    lang: "es"
  },
  {
    t: "Mis hijos no me aman. Los he alimentado, vestido, educado, pero nunca me miraron con gratitud. Y, sin embargo, ¿qué les di yo? ¿Un padre o un enemigo? Tal vez sintieron mi desconfianza desde que nacieron. Yo temía que se apoderaran de mi herencia, de mis bienes, de mi vida. Y ellos, al ver mi mirada endurecida, me rehusaron su amor. El amor no se impone: se mendiga o se pierde.",
    a: "Louis",
    obra: "Nudo de víboras, François Mauriac",
    lang: "es"
  },
  {
    t: "He vivido rodeado de gente, y sin embargo no he tenido nunca un solo amigo. Me consideraban inteligente, respetable, temible incluso. Pero en el fondo, Isa, me he sentido siempre solo como un niño perdido. Hay un momento en la vida en que uno comprende que la soledad no proviene de los demás, sino de uno mismo. Yo soy mi propio exilio.",
    a: "Louis",
    obra: "Nudo de víboras, François Mauriac",
    lang: "es"
  },
  {
    t: "Creía que la bondad era una palabra vacía, una máscara de los débiles. Pero he visto morir a mi hija, y en su mirada había algo que nunca entendí: perdón. Por primera vez sentí que alguien me amaba sin esperar nada, y ese amor, tan suave, me ha vencido más que todos mis odios. He pasado la vida despreciando a los que amaban, y ahora sé que solo ellos vivían.",
    a: "Louis",
    obra: "Nudo de víboras, François Mauriac",
    lang: "es"
  },
  {
    t: "He buscado a Dios en los libros, en los dogmas, en los templos, y nunca lo encontré. Lo hallo ahora, al final, en la mirada de los que perdoné tarde, y en el perdón que nunca pedí. Dios no me ha hablado con relámpagos ni con milagros: me ha hablado con la paciencia de los que me amaron. He comprendido que Dios no estaba fuera, sino dentro del corazón que había convertido en piedra.",
    a: "Louis",
    obra: "Nudo de víboras, François Mauriac",
    lang: "es"
  }
];

const PEDRO_PARAMO_QUOTES = [
  {
    t: "Vine a Comala porque me dijeron que acá vivía mi padre, un tal Pedro Páramo. Mi madre me lo dijo. Y yo le prometí que vendría a verlo en cuanto ella muriera. Le apreté las manos en señal de que lo haría; pues ella estaba por morirse y yo en un plan de prometerlo todo.",
    a: "Juan Preciado",
    obra: "Pedro Páramo, Juan Rulfo",
    lang: "es"
  },
  {
    t: "La tierra está llena de memorias. Oyen nuestros pasos y responden con ecos viejos, con voces que creíamos perdidas. Basta cerrar los ojos para sentir el temblor de los muertos, la respiración de quienes alguna vez amamos.",
    a: "Susurros del páramo",
    obra: "Pedro Páramo, Juan Rulfo",
    lang: "es"
  },
  {
    t: "Se oye el rumor de la lluvia como si la noche estuviera llena de almas. Cada gota golpea con un dolor antiguo, como si el cielo llorara por nosotros. Y sin embargo, hay una paz en esa tristeza, una tregua que nos deja respirar.",
    a: "Susana San Juan",
    obra: "Pedro Páramo, Juan Rulfo",
    lang: "es"
  },
  {
    t: "El páramo es una página en blanco. Cada paso escribe una palabra que el viento borra. Pero el corazón recuerda las historias que el aire se lleva, porque están hechas del mismo polvo que nos creó.",
    a: "Voces del pueblo",
    obra: "Pedro Páramo, Juan Rulfo",
    lang: "es"
  },
  {
    t: "Yo maté a Pedro Páramo. Fue como si hubiera destruido a mi propio padre, porque de él dependía mi mundo. Pero también fue como quitar una piedra del camino para que corriera el agua. Desde entonces oigo el murmullo de la vida que vuelve.",
    a: "Abundio Martínez",
    obra: "Pedro Páramo, Juan Rulfo",
    lang: "es"
  },
  {
    t: "No vayas a pedirle nada. Exígele lo nuestro. Lo demás es cosa tuya. Eso me dijo mi madre mientras me apretaba las manos antes de morir, y con esas palabras cargué el camino entero hasta Comala.",
    a: "Dolores Preciado",
    obra: "Pedro Páramo, Juan Rulfo",
    lang: "es"
  },
  {
    t: "El pueblo estaba lleno de ecos. Cada vez que pronunciaba el nombre de Pedro Páramo, me contestaban murmullos que venían del suelo, como si la tierra misma lo repitiera.",
    a: "Juan Preciado",
    obra: "Pedro Páramo, Juan Rulfo",
    lang: "es"
  },
  {
    t: "Sentí que el aire olía a humedad envejecida, a tierra recién abierta. Era un olor triste, como si de las paredes brotara la voz de los muertos que no terminan de irse.",
    a: "Susana San Juan",
    obra: "Pedro Páramo, Juan Rulfo",
    lang: "es"
  },
  {
    t: "Yo estaba hecha para soñar, para caminar entre recuerdos. Por eso Pedro Páramo me buscaba: sabía que mis pensamientos eran el único lugar donde todavía podía encontrar consuelo.",
    a: "Susana San Juan",
    obra: "Pedro Páramo, Juan Rulfo",
    lang: "es"
  },
  {
    t: "En la Media Luna todo tenía dueño, hasta el silencio. Y sin embargo, cuando él murió, entendimos que el poder de Pedro Páramo era sólo un polvo que se deshacía en el aire caliente.",
    a: "Fulgor Sedano",
    obra: "Pedro Páramo, Juan Rulfo",
    lang: "es"
  }
];

const FRANKENSTEIN_QUOTES = [
  {
    t: "Después de días y noches de increíble trabajo y fatiga, logré descubrir la causa de la generación y de la vida; más aún, me vi en posesión del poder de infundir vida a la materia inanimada. Era como si un velo se me hubiese caído de los ojos. Una luz tan intensa y deslumbradora se desplegó ante mí, que tuve que cerrar los párpados. El entusiasmo que me embargó entonces fue casi divino. ¡Qué sublime secreto poseía yo! Pensaba que si lograba animar la materia muerta, podría crear un nuevo género de seres que me bendijeran como su creador. Ningún padre podría reclamar el mérito de la vida de su hijo con tanto fervor como yo el de aquella criatura que iba a modelar.",
    a: "Víctor Frankenstein",
    obra: "Frankenstein o el moderno Prometeo, Mary Shelley",
    lang: "es"
  },
  {
    t: "Fue una noche espantosa aquella en que cobré vida. Un frío helado me recorrió; una luz deslumbrante hirió mis ojos, y un ruido confuso me ensordeció. Poco a poco distinguí las formas que me rodeaban, y una sensación de calor, de hambre, de cansancio me abrumó. No sabía quién era ni qué era. Vagaba por los bosques sin rumbo, estremecido por la lluvia y el viento, con los sentidos confusos pero llenos de una curiosidad inexplicable. Aprendí que el fuego daba calor y luz, pero también que quemaba; y que el agua calmaba la sed, pero podía ahogar. Así, paso a paso, fui descubriendo el mundo.",
    a: "La Criatura",
    obra: "Frankenstein o el moderno Prometeo, Mary Shelley",
    lang: "es"
  },
  {
    t: "Observaba a la familia y aprendía de ellos. Me maravillaba la suavidad de sus costumbres, el amor que se profesaban y la armonía de su hogar. Al principio ignoraba las palabras que pronunciaban, pero poco a poco fui comprendiendo que existía un modo de comunicación más elevado que los gestos. Me esforcé por imitar sus sonidos, y con el tiempo logré entenderlos. Así, en mi corazón nacieron emociones desconocidas: admiración, ternura, deseo de afecto. Comprendí que ellos se amaban mutuamente, y que yo no tenía a nadie. Cada día que pasaba aumentaba mi conocimiento y mi desesperanza.",
    a: "La Criatura",
    obra: "Frankenstein o el moderno Prometeo, Mary Shelley",
    lang: "es"
  },
  {
    t: "Un día, mientras contemplaba mi reflejo en un estanque, me sobrecogió el espanto. No podía creer que aquel rostro deformado y espantoso me perteneciera. Cuando veía a los demás hombres, tan bellos y armoniosos, sentía que entre ellos yo no tenía lugar. La desesperación me invadió. ¡Oh, cuánto hubiera dado por borrar esa fealdad, por tener un amigo que no huyera al verme! Pero comprendí que mi destino era la soledad.",
    a: "La Criatura",
    obra: "Frankenstein o el moderno Prometeo, Mary Shelley",
    lang: "es"
  },
  {
    t: "¡Créame una compañera, igual que yo, con la que pueda vivir en la mutua comprensión! Exijo este derecho, que no se me niegue por compasión o por justicia. He sido bueno; he sufrido; he sido abandonado. La soledad me consume. Recuerde que soy su obra: usted me debe felicidad, o al menos la ausencia del tormento. Si concede mi petición, me alejaré para siempre de los hombres, y usted no volverá a saber de mí.",
    a: "La Criatura",
    obra: "Frankenstein o el moderno Prometeo, Mary Shelley",
    lang: "es"
  },
  {
    t: "Comencé a pensar que si creaba una segunda criatura, ambos podrían multiplicarse, y la raza humana sería aniquilada. En un instante la destruí: la obra de mis manos se convirtió en polvo. Miré al monstruo que me observaba a través de la ventana, y vi en su rostro un gesto que me heló la sangre. A partir de ese momento, juró venganza contra mí, y contra todos los que yo amaba.",
    a: "Víctor Frankenstein",
    obra: "Frankenstein o el moderno Prometeo, Mary Shelley",
    lang: "es"
  },
  {
    t: "Él está muerto, y yo también lo estaré pronto. Pero antes de irme quiero que sepa que no era mi deseo hacer el mal. Todo empezó con el abandono. Quería amor y recibí odio. Quería compañía y recibí soledad. Si los hombres hubieran sido justos conmigo, habría sido su amigo; pero el sufrimiento convirtió mi corazón en hiel. Aun así, no puedo odiar a quien me dio la vida; he sentido dolor por su muerte. No me queda más que desaparecer entre los hielos, donde el fuego de mis remordimientos se extinguirá para siempre.",
    a: "La Criatura",
    obra: "Frankenstein o el moderno Prometeo, Mary Shelley",
    lang: "es"
  },
  {
    t: "Mientras observaba cómo se alejaba sobre el mar helado, su figura se hizo cada vez más pequeña hasta perderse en la niebla. Un resplandor rojizo iluminó un instante el horizonte, y comprendí que había cumplido su palabra. El ser desgraciado, el más solitario de todos los que han vivido, había desaparecido, dejando tras de sí un mundo más vacío.",
    a: "Robert Walton",
    obra: "Frankenstein o el moderno Prometeo, Mary Shelley",
    lang: "es"
  }
];

const ANNE_DE_LAS_TEJAS_VERDES_QUOTES = [
  {
    t: "¿No es maravilloso pensar que mañana es un día nuevo, todavía sin errores?",
    a: "Anne Shirley",
    obra: "Anne de las Tejas Verdes, Lucy Maud Montgomery",
    lang: "es"
  },
  {
    t: "Me gusta imaginar cosas imposibles; es la única manera de hacer que el mundo tenga sentido. Sin imaginación, el amanecer sería solo el principio de otro día, y no el milagro que realmente es.",
    a: "Anne Shirley",
    obra: "Anne de las Tejas Verdes, Lucy Maud Montgomery",
    lang: "es"
  },
  {
    t: "Nunca tuve una familia, así que me inventé muchas. Vivían en los árboles, en los espejos, en las nubes. Y aunque no existían, me hacían compañía. Supongo que por eso sé querer tanto: porque lo aprendí de lo que me faltaba.",
    a: "Anne Shirley",
    obra: "Anne de las Tejas Verdes, Lucy Maud Montgomery",
    lang: "es"
  },
  {
    t: "Al principio Marilla me miraba como si fuera una tormenta. Pero las tormentas también traen aire nuevo, y flores después. Creo que eso fue lo que hice en su vida: despeinarla un poco para que pudiera oler la primavera.",
    a: "Anne Shirley",
    obra: "Anne de las Tejas Verdes, Lucy Maud Montgomery",
    lang: "es"
  },
  {
    t: "Gilbert Blythe me tiró de las trenzas y me llamó ‘zanahoria’. No sabe lo que hizo: no solo insultó mi pelo, insultó mi alma. Pero luego me pidió perdón con esos ojos suyos, y supe que algún día lo perdonaría… aunque no todavía.",
    a: "Anne Shirley",
    obra: "Anne de las Tejas Verdes, Lucy Maud Montgomery",
    lang: "es"
  },
  {
    t: "Hay algo en la tristeza que también es hermoso. Quizá porque en esos momentos el corazón se da cuenta de que está vivo, y late más fuerte, como si quisiera recordarnos que aún queda esperanza.",
    a: "Anne Shirley",
    obra: "Anne de las Tejas Verdes, Lucy Maud Montgomery",
    lang: "es"
  },
  {
    t: "Cuando llegué a Tejas Verdes pensé que era un error, que nadie podría quererme. Pero Marilla me dio un hogar, y Matthew me dio ternura. Ellos no sabían que me estaban salvando, pero lo hicieron.",
    a: "Anne Shirley",
    obra: "Anne de las Tejas Verdes, Lucy Maud Montgomery",
    lang: "es"
  },
  {
    t: "Matthew me dijo una vez que era bueno ser soñadora, y que el mundo necesitaba más personas así. Desde entonces, cada vez que alguien se ríe de mis fantasías, pienso que tal vez estoy cumpliendo con mi deber hacia la humanidad.",
    a: "Anne Shirley",
    obra: "Anne de las Tejas Verdes, Lucy Maud Montgomery",
    lang: "es"
  },
  {
    t: "La vida está llena de despedidas que duelen y de comienzos que dan miedo. Pero también está llena de mañanas nuevas, de árboles que florecen sin avisar, y de amistades que crecen como jardines descuidados pero hermosos.",
    a: "Anne Shirley",
    obra: "Anne de las Tejas Verdes, Lucy Maud Montgomery",
    lang: "es"
  },
  {
    t: "A veces me siento feliz sin motivo, solo porque el cielo es azul o porque alguien ha sido amable conmigo. Creo que la felicidad no se busca, se encuentra en los rincones más pequeños, donde nadie mira.",
    a: "Anne Shirley",
    obra: "Anne de las Tejas Verdes, Lucy Maud Montgomery",
    lang: "es"
  },
  {
    t: "No me da miedo hacerme mayor, siempre que no se me marchite la imaginación. Porque una persona sin imaginación es como un pájaro sin alas: puede caminar, pero jamás conocerá el cielo.",
    a: "Anne Shirley",
    obra: "Anne de las Tejas Verdes, Lucy Maud Montgomery",
    lang: "es"
  },
  {
    t: "Matthew murió, y el mundo se volvió silencioso. Pero cada vez que miro las flores del jardín, siento que él está allí, en la bondad del viento. Y pienso que los que amamos nunca se van del todo: se quedan en lo que nos enseñaron a mirar con ternura.",
    a: "Anne Shirley",
    obra: "Anne de las Tejas Verdes, Lucy Maud Montgomery",
    lang: "es"
  },
  {
    t: "Creo que si alguna vez llego a ser escritora, no escribiré sobre cosas grandes y terribles, sino sobre las pequeñas alegrías, los amaneceres, los libros, los amigos. Porque la felicidad, como la belleza, no necesita gritar para existir.",
    a: "Anne Shirley",
    obra: "Anne de las Tejas Verdes, Lucy Maud Montgomery",
    lang: "es"
  },
  {
    t: "El mundo es grande, y la vida también lo es. A veces me asusta, pero luego recuerdo que tengo un corazón que sueña, y eso me basta para seguir caminando.",
    a: "Anne Shirley",
    obra: "Anne de las Tejas Verdes, Lucy Maud Montgomery",
    lang: "es"
  }
];

const LA_VIDA_ES_SUENO_QUOTES = [
  {
    t: "¿Qué es la vida? Un frenesí.\n¿Qué es la vida? Una ilusión,\nuna sombra, una ficción;\ny el mayor bien es pequeño;\nque toda la vida es sueño,\ny los sueños, sueños son.",
    a: "Segismundo — Jornada Segunda",
    obra: "La vida es sueño, Pedro Calderón de la Barca",
    lang: "es"
  },
  {
    t: "Yo sueño que estoy aquí\ndestas prisiones cargado,\ny soñé que en otro estado\nmás lisonjero me vi.",
    a: "Segismundo — Jornada Segunda",
    obra: "La vida es sueño, Pedro Calderón de la Barca",
    lang: "es"
  },
  {
    t: "Sueña el rey que es rey, y vive\ncon este engaño mandando,\ndisponiendo y gobernando;\ny este aplauso, que recibe\nprestado, en el viento escribe,\ny en cenizas le convierte\nla muerte, ¡desdicha fuerte!\n¿Que hay quien intente reinar,\nviendo que ha de despertar\nen el sueño de la muerte?",
    a: "Segismundo — Jornada Segunda",
    obra: "La vida es sueño, Pedro Calderón de la Barca",
    lang: "es"
  },
  {
    t: "Sueña el rico en su riqueza,\nque más cuidados le ofrece;\nsueña el pobre que padece\nsu miseria y su pobreza;\nsueña el que a medrar empieza,\nsueña el que afana y pretende,\nsueña el que agravia y ofende;\ny en el mundo, en conclusión,\ntodos sueñan lo que son,\naunque ninguno lo entiende.",
    a: "Segismundo — Jornada Segunda",
    obra: "La vida es sueño, Pedro Calderón de la Barca",
    lang: "es"
  },
  {
    t: "¡Ay mísero de mí, y ay infelice!\nApurar, cielos, pretendo,\nya que me tratáis así,\nqué delito cometí\ncontra vosotros naciendo;\naunque si nací, ya entiendo\nqué delito he cometido;\nbastante causa ha tenido\nvuestra justicia y rigor,\npues el delito mayor\ndel hombre es haber nacido.",
    a: "Segismundo — Jornada Primera",
    obra: "La vida es sueño, Pedro Calderón de la Barca",
    lang: "es"
  },
  {
    t: "Nace el ave, y con las galas\nque le dan belleza suma,\napenas es flor de pluma,\no ramillete con alas,\ncuando las etéreas salas\ncorta con velocidad,\nnegándose a la piedad\ndel nido que deja en calma;\n¿y teniendo yo más alma,\ntengo menos libertad?",
    a: "Segismundo — Jornada Primera",
    obra: "La vida es sueño, Pedro Calderón de la Barca",
    lang: "es"
  },
  {
    t: "Nace el bruto, y con la piel\nque dibujan manchas bellas,\napenas signo es de estrellas,\ngracias al docto pincel,\ncuando, atrevido y cruel,\nla humana necesidad\nle enseña a tener crueldad,\nmonstruo de su laberinto;\n¿y yo, con mejor instinto,\ntengo menos libertad?",
    a: "Segismundo — Jornada Primera",
    obra: "La vida es sueño, Pedro Calderón de la Barca",
    lang: "es"
  },
  {
    t: "Obrar bien es lo que importa;\nsi fuere verdad, por serlo;\nsi no, por ganar amigos\npara cuando despertemos.",
    a: "Segismundo — Jornada Tercera",
    obra: "La vida es sueño, Pedro Calderón de la Barca",
    lang: "es"
  },
  {
    t: "Que estoy soñando, y que quiero\nobrar bien, pues no se pierde\nobrar bien, aun entre sueños.",
    a: "Segismundo — Jornada Tercera",
    obra: "La vida es sueño, Pedro Calderón de la Barca",
    lang: "es"
  },
  {
    t: "A reinar, fortuna, vamos;\nno me despiertes si duermo,\ny si es verdad, no me duermas.",
    a: "Segismundo — Jornada Tercera",
    obra: "La vida es sueño, Pedro Calderón de la Barca",
    lang: "es"
  },
  {
    t: "Mal, Polonia, recibes\na un extranjero, pues con sangre escribes\nsu entrada en tus arenas.",
    a: "Rosaura — Jornada Primera",
    obra: "La vida es sueño, Pedro Calderón de la Barca",
    lang: "es"
  },
  {
    t: "Venció el amor, venció el honor.",
    a: "Segismundo — Jornada Tercera",
    obra: "La vida es sueño, Pedro Calderón de la Barca",
    lang: "es"
  },
  {
    t: "Que cuando el valor se humilla,\nse engrandece más.",
    a: "Segismundo — Jornada Tercera",
    obra: "La vida es sueño, Pedro Calderón de la Barca",
    lang: "es"
  }
];

const BARTLEBY_TAGS = ["literatura", "soledad", "negativa", "oficina", "muro", "alienación", "clásicos"];

const BARTLEBY_QUOTES = [
  {
    id: "bartleby-001",
    t: "A la tercera llamada apareció Bartleby.\n\n—Tome —le dije—, quiero que me ayude a revisar esta copia.\n\nBartleby permaneció inmóvil un instante, como si no hubiera oído. Después, con una voz singularmente suave y firme, respondió:\n\n—Preferiría no hacerlo.",
    a: "Herman Melville",
    author: "Herman Melville",
    obra: "Bartleby, el escribiente",
    obraTitulo: "Bartleby, el escribiente",
    type: "fragmento",
    highlight: "Preferiría no hacerlo.",
    tags: BARTLEBY_TAGS,
    lang: "es"
  },
  {
    id: "bartleby-002",
    t: "Me quedé sentado, por un momento, en perfecto silencio. La respuesta era tan extraña, tan inesperada, dicha además sin la menor insolencia, que no supe si enfadarme o dudar de mis propios oídos.\n\n—¿Preferiría no hacerlo? —repetí.\n\n—Preferiría no hacerlo —contestó Bartleby.",
    a: "Herman Melville",
    author: "Herman Melville",
    obra: "Bartleby, el escribiente",
    obraTitulo: "Bartleby, el escribiente",
    type: "fragmento",
    highlight: "Preferiría no hacerlo.",
    tags: BARTLEBY_TAGS,
    lang: "es"
  },
  {
    id: "bartleby-003",
    t: "Si hubiera habido en su actitud algo de ira, de impaciencia o de desafío, lo habría despedido al instante. Pero no había nada de eso.\n\nBartleby estaba de pie, pálido, pulcro, respetuoso, abandonado.\n\nSu misma mansedumbre me desarmaba.",
    a: "Herman Melville",
    author: "Herman Melville",
    obra: "Bartleby, el escribiente",
    obraTitulo: "Bartleby, el escribiente",
    type: "fragmento",
    highlight: "Su misma mansedumbre me desarmaba.",
    tags: BARTLEBY_TAGS,
    lang: "es"
  },
  {
    id: "bartleby-004",
    t: "Coloqué su mesa cerca de una pequeña ventana lateral. Desde allí no se veía el cielo ni la calle, sino únicamente un muro oscuro, alto, inmóvil.\n\nAllí trabajaba Bartleby.\n\nPrimero por la mañana, todo el día, y el último por la noche: era un centinela perpetuo en su rincón.",
    a: "Herman Melville",
    author: "Herman Melville",
    obra: "Bartleby, el escribiente",
    obraTitulo: "Bartleby, el escribiente",
    type: "fragmento",
    highlight: "Era un centinela perpetuo en su rincón.",
    tags: BARTLEBY_TAGS,
    lang: "es"
  },
  {
    id: "bartleby-005",
    t: "A veces, cuando yo levantaba la vista, lo encontraba de pie junto a la ventana, sin escribir, sin leer, sin moverse.\n\nNo miraba nada vivo.\n\nSe había abandonado a una de sus profundas ensoñaciones frente al muro muerto.",
    a: "Herman Melville",
    author: "Herman Melville",
    obra: "Bartleby, el escribiente",
    obraTitulo: "Bartleby, el escribiente",
    type: "fragmento",
    highlight: "Se había abandonado a una de sus profundas ensoñaciones frente al muro muerto.",
    tags: BARTLEBY_TAGS,
    lang: "es"
  },
  {
    id: "bartleby-006",
    t: "Pasaron los días. Bartleby ya no copiaba. Ya no revisaba. Ya no obedecía ninguna petición.\n\n—¿Por qué no escribe? —le pregunté.\n\nNo hubo violencia en su respuesta, ni tristeza visible, ni justificación.\n\n—He decidido no escribir más.",
    a: "Herman Melville",
    author: "Herman Melville",
    obra: "Bartleby, el escribiente",
    obraTitulo: "Bartleby, el escribiente",
    type: "fragmento",
    highlight: "He decidido no escribir más.",
    tags: BARTLEBY_TAGS,
    lang: "es"
  },
  {
    id: "bartleby-007",
    t: "—Bartleby —le dije—, ¿quiere decirme algo de usted? ¿De dónde viene? ¿Quién es? ¿Qué le ha traído aquí?\n\nÉl se retiró un poco más hacia su rincón, como si la pregunta lo hubiera tocado físicamente.\n\n—Por ahora preferiría no dar ninguna respuesta.",
    a: "Herman Melville",
    author: "Herman Melville",
    obra: "Bartleby, el escribiente",
    obraTitulo: "Bartleby, el escribiente",
    type: "fragmento",
    highlight: "Por ahora preferiría no dar ninguna respuesta.",
    tags: BARTLEBY_TAGS,
    lang: "es"
  },
  {
    id: "bartleby-008",
    t: "Había intentado razonar con él, intimidarlo, compadecerlo, liberarme de él. Nada servía. Seguía allí, sereno, inmóvil, irreductible.\n\nEntonces me pregunté, no sin cierto horror:\n\n¿Qué debo hacer con este hombre, o más bien con este fantasma?",
    a: "Herman Melville",
    author: "Herman Melville",
    obra: "Bartleby, el escribiente",
    obraTitulo: "Bartleby, el escribiente",
    type: "fragmento",
    highlight: "¿Qué debo hacer con este hombre, o más bien con este fantasma?",
    tags: BARTLEBY_TAGS,
    lang: "es"
  },
  {
    id: "bartleby-009",
    t: "Al acercarnos todos a su espacio, Bartleby pareció ofendido, no con violencia, sino con una especie de dignidad herida.\n\nNos miró como si hubiéramos invadido una habitación interior.\n\n—Preferiría que me dejaran solo aquí.",
    a: "Herman Melville",
    author: "Herman Melville",
    obra: "Bartleby, el escribiente",
    obraTitulo: "Bartleby, el escribiente",
    type: "fragmento",
    highlight: "Preferiría que me dejaran solo aquí.",
    tags: BARTLEBY_TAGS,
    lang: "es"
  },
  {
    id: "bartleby-010",
    t: "Le propuse otros trabajos, otros destinos, alguna salida posible. Un empleo en una tienda. Un puesto de mensajero. Cualquier ocupación que lo sacara de aquel rincón.\n\nBartleby no se alteró.\n\n—No me gustaría nada de eso. No soy exigente, pero me gusta estar quieto.",
    a: "Herman Melville",
    author: "Herman Melville",
    obra: "Bartleby, el escribiente",
    obraTitulo: "Bartleby, el escribiente",
    type: "fragmento",
    highlight: "No soy exigente, pero me gusta estar quieto.",
    tags: BARTLEBY_TAGS,
    lang: "es"
  },
  {
    id: "bartleby-011",
    t: "—¿Quiere volver a copiar para alguien?\n\n—No. Preferiría no hacer ningún cambio.\n\n—¿Quiere viajar?\n\n—No.\n\n—¿Quiere ir a otra oficina?\n\nBartleby permaneció igual, como si cualquier forma de movimiento fuera una violencia.\n\n—Preferiría no hacer ningún cambio.",
    a: "Herman Melville",
    author: "Herman Melville",
    obra: "Bartleby, el escribiente",
    obraTitulo: "Bartleby, el escribiente",
    type: "fragmento",
    highlight: "Preferiría no hacer ningún cambio.",
    tags: BARTLEBY_TAGS,
    lang: "es"
  },
  {
    id: "bartleby-012",
    t: "Lo encontré en el patio, rodeado de muros altos. No parecía más preso allí que en mi oficina. Quizá, pensé, siempre había vivido entre muros.\n\n—Bartleby —le dije—, ¿me reconoce?\n\nÉl volvió lentamente la cabeza.\n\n—Sé dónde estoy.",
    a: "Herman Melville",
    author: "Herman Melville",
    obra: "Bartleby, el escribiente",
    obraTitulo: "Bartleby, el escribiente",
    type: "fragmento",
    highlight: "Sé dónde estoy.",
    tags: BARTLEBY_TAGS,
    lang: "es"
  },
  {
    id: "bartleby-013",
    t: "El encargado le ofreció comida. Bartleby no la tomó. Tampoco hizo gesto alguno de desprecio; simplemente se apartó de ella, como si el alimento perteneciera a otro orden del mundo.\n\n—Hoy preferiría no cenar. No estoy acostumbrado a las cenas.",
    a: "Herman Melville",
    author: "Herman Melville",
    obra: "Bartleby, el escribiente",
    obraTitulo: "Bartleby, el escribiente",
    type: "fragmento",
    highlight: "Hoy preferiría no cenar. No estoy acostumbrado a las cenas.",
    tags: BARTLEBY_TAGS,
    lang: "es"
  },
  {
    id: "bartleby-014",
    t: "Me acerqué después y lo vi tendido junto al muro, extrañamente quieto. Lo llamé. No respondió.\n\nEntonces comprendí que Bartleby dormía de una manera definitiva.\n\nDormía con reyes y consejeros.",
    a: "Herman Melville",
    author: "Herman Melville",
    obra: "Bartleby, el escribiente",
    obraTitulo: "Bartleby, el escribiente",
    type: "fragmento",
    highlight: "Dormía con reyes y consejeros.",
    tags: BARTLEBY_TAGS,
    lang: "es"
  },
  {
    id: "bartleby-015",
    t: "Mucho después oí un rumor sobre él. Decían que había trabajado en la oficina de cartas muertas, cartas que nunca llegan a nadie, cartas enviadas a personas desaparecidas, mudadas, enterradas.\n\nPensé entonces en Bartleby.\n\nCartas muertas: ¿no suenan como hombres muertos?",
    a: "Herman Melville",
    author: "Herman Melville",
    obra: "Bartleby, el escribiente",
    obraTitulo: "Bartleby, el escribiente",
    type: "fragmento",
    highlight: "Cartas muertas: ¿no suenan como hombres muertos?",
    tags: BARTLEBY_TAGS,
    lang: "es"
  },
  {
    id: "bartleby-016",
    t: "A veces esas cartas llevaban dinero, perdón, esperanza, noticias de vida. Pero llegaban tarde. Sus destinatarios ya no estaban.\n\nEnviadas con amor, con auxilio, con promesas, corrían hacia la nada.\n\n¡Ah, Bartleby! ¡Ah, humanidad!",
    a: "Herman Melville",
    author: "Herman Melville",
    obra: "Bartleby, el escribiente",
    obraTitulo: "Bartleby, el escribiente",
    type: "fragmento",
    highlight: "¡Ah, Bartleby! ¡Ah, humanidad!",
    tags: BARTLEBY_TAGS,
    lang: "es"
  }
];

const CEREZAS_DEL_CEMENTERIO_QUOTES = [
  {
    id: "cerezas-cementerio-001",
    t: `Desde el primer puente del buque contemplaba Félix la lenta ascensión de la luna, luna enorme, ancha y encendida como el llameante ruedo de un horno.

Y miraba con tan devoto recogimiento, que todo lo sentía en un santo remanso de silencio, todo quietecito y maravillado mientras emergía y se alzaba la roja luna.`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "Todo lo sentía en un santo remanso de silencio.",
    tags: ["luna", "silencio", "mar", "contemplación", "lirismo"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-002",
    t: `Ya tarde, después de la comida, hicieron los tres un apartado grupo; y se asomaron a la noche para verse caminar sobre las aguas de luna.

La noche era inmensa, clara, de paz santísima, de inocencia de creación reciente.`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "La noche era inmensa, clara, de paz santísima.",
    tags: ["noche", "luna", "mar", "paz", "belleza"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-003",
    t: `Ellas le vieron inmóvil, escultórico, lleno de luna. Y la señora, sonriéndole como a un hijo, murmuró:

—¡Cuán impresionable es usted!... ¿Félix? ¿Se llama usted Félix, verdad? ¡Deben emocionarle mucho los viajes!

—¡Oh, sí! Soy muy nervioso. Siempre creo que va a sucederme algo grande y... no me sucede nada; siempre estoy contento, y contento y todo... yo no sé qué tengo que siento el latido de mi corazón en toda mi carne y... lloraría.`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "Siempre creo que va a sucederme algo grande y no me sucede nada.",
    tags: ["espera", "sensibilidad", "ansiedad", "juventud", "viaje"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-004",
    t: `Y esta noche, por serme ustedes desconocidas, y viéndolas entre ese bello misterio de velos y de luna, me traen la ilusión de la distancia, de lo remoto; se me figura que vamos muy lejos, muy lejos, sin acordarme de que llegaremos pasado mañana a nuestro pueblo, ni de que aquí cerca está paseando el señor Ripoll.`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "Se me figura que vamos muy lejos, muy lejos.",
    tags: ["distancia", "viaje", "luna", "misterio", "deseo"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-005",
    t: `Félix siguió ardientemente:

—¡Yo siempre codicio estar donde no estoy! ¡Verdaderamente es dichoso el Señor estando en todas partes!... Pero cuando llego al sitio apetecido, no hallo toda la hermosura deseada, y es que lo que antes miraba lo dejo, lo pierdo acercándome.`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "Yo siempre codicio estar donde no estoy.",
    tags: ["deseo", "distancia", "melancolía", "búsqueda", "insatisfacción"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-006",
    t: `Félix, tendiendo su brazo, exclamó:

—Ahora me impresionan esas torres blancas y solitarias lo mismo que me emocionó ayer este barco, mirado desde el muelle. Me parecía nave sagrada.

Pues ahora es la paz de los faros lo que me ilusiona y atrae, los faros que son pedazos de humanidad desamparada dentro del silencio de los cielos y de las aguas.`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "Los faros son pedazos de humanidad desamparada.",
    tags: ["faros", "soledad", "mar", "humanidad", "silencio"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-007",
    t: `Todo el barco sosegaba. Félix y doña Beatriz contemplaban la noche.

Lejos, las aguas se iban llenando de luna de color vieja y muy triste.

Se asomaron sobre la hélice que despedazaba al mar, dejándole un hondo rugido de espumas que parecían hechas de luciérnagas.`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "El mar dejaba un hondo rugido de espumas que parecían hechas de luciérnagas.",
    tags: ["mar", "luciérnagas", "noche", "luna", "belleza"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-008",
    t: `—De frío, no. Temblé porque sin apurarme con tristezas o melancolías de poeta, que no soy, se me mezclan muy raros pensamientos.

En cada faceta de luz de las aguas miraba o se me aparecía un rostro, una cabeza de mujer ahogada... ¿No habrá sucedido aquí algún naufragio? ¿Verdad? ¡Se imagina, ve usted los náufragos tendidos entre el mar, mirándonos con ojos devorados, mirándonos!`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "En cada faceta de luz de las aguas miraba una cabeza de mujer ahogada.",
    tags: ["muerte", "mar", "visión", "naufragio", "angustia"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-009",
    t: `Y es que sentía en los profundos de su ánima la levadura del recuerdo de la silueta y de la voz de doña Beatriz, que le eran amigas a su corazón, y no lograba llegar al claro origen de este sentimiento.

Nada más descubría que el atraerse ahora de modo tan efusivo y repentino, sin tropezar en violencia ni sorpresa, vendría de la escondida virtud de esa amistad de antaño.`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "Le eran amigas a su corazón.",
    tags: ["recuerdo", "Beatriz", "corazón", "amistad", "pasado"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-010",
    t: `Este primer día de reposo hogareño pareciole de demasiada lentitud; y, al confesárselo, se reconvenía y exaltaba por su sequedad de corazón.

¡Si es que sólo gustaba de hablar y saber de doña Beatriz y Julia; estaba hechizado, estaba poseído de la fragancia de sus palabras y de toda su hermosura!`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "Estoy hechizado, estoy poseído de la fragancia de sus palabras.",
    tags: ["hechizo", "Beatriz", "deseo", "palabras", "hermosura"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-011",
    t: `Sentose Félix en un rubio sillón de mimbres, y doña Beatriz alzose y le enjugó la frente y los cabellos con su primoroso delantal de randas.

—¡Su cabeza es una tempestad de oro! —le dijo maternalmente.

Y Félix entornaba los ojos bajo la caricia del fino lenzuelo y de las manos de la hermosa señora, fragante de primavera.

—¡Doña Beatriz, usted no se perfuma como las demás mujeres; usted huele a naturaleza gloriosa, a mañana y a tarde de los huertos!...`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "Usted huele a naturaleza gloriosa.",
    tags: ["Beatriz", "huerto", "olor", "naturaleza", "deseo"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-012",
    t: `Julia era tan alta como la madre, pero más delgada, con palidez mística de novicia y donaires y alborozos de rapaza; su carne y su alma daban la sensación y fragancia de la fruta en agraz.

Beatriz era la fruta dorada que destila la primera lágrima de su miel.`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "Su carne y su alma daban la sensación y fragancia de la fruta en agraz.",
    tags: ["Julia", "Beatriz", "fruta", "juventud", "madurez"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-013",
    t: `Su alma era como una delgada ánfora llena de melancolías, abierta por una mano invisible, y el encerrado vino de la cepa madre de la ilusión se vertía, mezclando su ranciedad, fuerte y dulcísima, entre la sangre y los nervios de Félix.

Imaginaba lo pasado y el mañana en bella esfumación de horizonte vago y callado de cuadro antiguo; y ya no se rio, no hizo burla de su quimera.`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "Su alma era como una delgada ánfora llena de melancolías.",
    tags: ["alma", "melancolía", "ilusión", "pasado", "Félix"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-014",
    t: `Muchas tardes os tuve a Julita y a ti juntos en mi regazo, mientras él me contaba sus andanzas, su nomadismo genial, sus juegos con la muerte...

Hablaba mucho de la muerte siendo él llama de amor y de vida. Como tú, la veía en el reflejo de la luna, dentro de los estanques y del mar, en las nubes de los ocasos, en las siluetas de las montañas y de los árboles.`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "Hablaba mucho de la muerte siendo él llama de amor y de vida.",
    tags: ["muerte", "vida", "luna", "Guillermo", "destino"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-015",
    t: `Entonces, Félix sintió un apresuramiento helado de su sangre y escuchó los pasos de otra vida, llegada del misterio, caminando encima de su alma.

¡Señor, él también padecía la visión de la muerte en los vivos...! Niños, viejos, mujeres placenteras, Julia, doña Beatriz, a todos se los representaba muertos, con las manos cruzadas sobre el vientre.`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "Padecía la visión de la muerte en los vivos.",
    tags: ["muerte", "visión", "angustia", "alma", "Félix"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-016",
    t: `Los demás, ¡cuán distintos habían sido en vida y muerte!

Pedro, el primogénito, el heredero de «La Olmeda», adornado de raras virtudes, dejó, al morir, fragancia de santidad.

Luis, un químico audaz, hosco y sabio, se abrasó los ojos y las manos en su infernal estudio.

Y Guillermo, el predilecto de todos, corazón aventurero, ascua de ideales, acabó asesinado en misterioso y espantable lance de amor.`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "Corazón aventurero, ascua de ideales.",
    tags: ["Guillermo", "muerte", "amor", "ideal", "tragedia"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-017",
    t: `Desde las abiertas ventanas estuvo Félix contemplando el jardín, dormido bajo cendales de luna.

Vino doña Beatriz, que había dejado la cena para cuidar del atavío de Julia y mirarla desde los balcones.

—¿Me perdona, «madrina», esta visita? La luna me ha sacado de casa, y me ha guiado hasta aquí como a un niñito de cuento que se pierde en medio de un bosque.`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "La luna me ha sacado de casa.",
    tags: ["luna", "jardín", "Beatriz", "cuento", "noche"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-018",
    t: `Inmóviles, callados, contemplaban Beatriz y Félix la santa noche.

Creíanse subidos y asomados en la orilla de una estrella. Juzgábanse venturosos, y se sonreían con entristecimiento.

Se miraron, y vieron, dentro de sus retinas, luna, noche, inmensidad.`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "Creíanse subidos y asomados en la orilla de una estrella.",
    tags: ["Beatriz", "Félix", "noche", "estrella", "amor"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-019",
    t: `Los ojos de la señora recorrieron la dorada cabeza del hombre. Y de súbito se conmovió de dichoso y amargo desfallecimiento.

Había sentido humedad y brasa de labios. Pareciole besado todo su cuerpo.

Y fue esforzada: suavemente retiró su brazo de la caricia. Alzó los ojos y balbució:

—¡Qué altos, qué cerca del cielo! ¡Como si el cielo fuese un mar que nos sorbiera!`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "Como si el cielo fuese un mar que nos sorbiera.",
    tags: ["cielo", "mar", "Beatriz", "deseo", "vértigo"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-020",
    t: `Abrió las vidrieras, y apareció religiosamente la azulada palidez del espacio.

Los fastuosos colores que vestían a la mujer se deshicieron, y quedó vestida de luz y blancura nupcial.

Entonces los brazos de Félix la ciñeron. Pareciole que estaban en el templo solitario de un astro, alumbrado suavemente para ellos.

Y tuvo la divina sensación de que abrazaba un alma desnuda, alma hecha de luna y de jazmines.`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "Abrazaba un alma desnuda, alma hecha de luna y de jazmines.",
    tags: ["amor", "alma", "luna", "jazmines", "Beatriz"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-021",
    t: `Extenuados y delirantes, se reclinaron sobre los amplios asientos de seda. Un rayo lunar los envolvía...

Toda la honda y clara noche fue lámpara y estrado de su amor.`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "Toda la honda y clara noche fue lámpara y estrado de su amor.",
    tags: ["amor", "noche", "luna", "delirio", "Beatriz"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-022",
    t: `Después, al levantarse, todavía abrazados, vieron una nube blanca y resplandeciente de figura de Ángel terrible como el que arrojó a Adán y Eva del Paraíso.

Y los dos sollozaron.

—¡Madrina mía! ¡Beatriz!

Salieron, y se besaron castamente delante de toda la tierra y de todo el cielo, y delante del Ángel que se desvaneció entre nieblas y luna.`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "Los dos sollozaron.",
    tags: ["culpa", "amor", "paraíso", "ángel", "luna"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-023",
    t: `Y doña Beatriz le hablaba y le miraba como antes, como su «madrina», sin que sus ojos, su sonrisa, su palabra descubriesen y recordasen a la mujer poseída, a la amante sabida en todos los deliciosos misterios.

Y Félix, que, viéndola al lado de la hija, tuvo miedo de creerla descendida, desvelada porque la conociera en su secreto de excelsitud y pecado, comprendió entonces cuan inagotable es Amor.`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "Cuán inagotable es Amor.",
    tags: ["amor", "Beatriz", "secreto", "pecado", "deseo"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-024",
    t: `Ésta era la adorable y gustosa reliquia que ahora tocaba con ardimiento y voluptuoso fetichismo.

Y, al contemplarla y besarla mucho, notó que sabía a pan viejo, y que la menuda y perfumada huella de los blanquísimos dientes estaba ya seca y rugosa.

Y entonces se cumplieron en Félix los avisos del abrasado carmelita Juan de la Cruz, y probó los malos dejos del apetito satisfecho.

Pesadez de hartura y comezón de hambre tejían su mal.`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "Pesadez de hartura y comezón de hambre tejían su mal.",
    tags: ["deseo", "fetichismo", "hambre", "amor", "reliquia"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-025",
    t: `¡Cuánta lástima florecía en el corazón de Félix mirando a la mujer desventurada!

Que así la juzgaba fingiéndose el constante suplicio de la beldad triste y lacia.

Y como todo sentimiento, hasta el de la compasión, tenía en Félix algo de voluptuosidad por lo intensísimo, se conmovió de alegría, de la generosa alegría que Adath dice a Lucifer: «El goce de esparcir la alegría, de comunicarla a los otros»; y quiso mitigar, alborozar, siquiera en el breve discurso del viaje, esas dos vidas hundidas en el hastío de la nada de emociones.`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "Dos vidas hundidas en el hastío de la nada de emociones.",
    tags: ["compasión", "hastío", "Félix", "emociones", "viaje"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-026",
    t: `El camino era largo y estaba arbolado. Lejos, las anchas copas de los olmos subían y se cerraban en bóveda negral.

Llegaban las huertas hasta las orillas de la calzada, y el manso aire llevaba un grato olor de hierba recién segada, de establos calientes y mieses espesas y maduras.

La quietud y suavidad del crepúsculo, la campesina fragancia, la santa y alada sinfonía de los campanarios que tañían el Ángelus, todo emblandeció a Félix.`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "La quietud y suavidad del crepúsculo todo emblandeció a Félix.",
    tags: ["campo", "crepúsculo", "huertas", "Ángelus", "Félix"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-027",
    t: `Cerca del asiento de la portera comenzó a removerse una tortuga.

Félix quiso verla. Y la mujer se la mostró, murmurando:

—Es mi compaña. ¡Ella y los señores me quedan en el mundo!

Arriba sonaban puertas y rumor de voces.`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "Es mi compaña. Ella y los señores me quedan en el mundo.",
    tags: ["soledad", "vejez", "tortuga", "compañía", "casa"],
    lang: "es"
  },
  {
    id: "cerezas-cementerio-028",
    t: `De nuevo contemplábala Félix: veía las trenzas de sus cabellos recogidos, subidos en peinado de señorita; reparaba en su larga falda, por cuya fimbria salían descuidadamente dos zapatitos rubios.

Halláronse sus miradas; sorprendió la doncella la fina sonrisa de su primo; examinose toda y recató sus pies.

Y ahora vio Félix que asomaba la mujer en los ojos de su prima, y que se le alejaba, se hacía misteriosa; y advirtió toda la transfiguración de la carne y del alma de la amiga de su mocedad.`,
    a: "Gabriel Miró",
    author: "Gabriel Miró",
    obra: "Las cerezas del cementerio",
    obraTitulo: "Las cerezas del cementerio",
    type: "fragmento",
    highlight: "Asomaba la mujer en los ojos de su prima.",
    tags: ["Isabel", "mujer", "mirada", "transfiguración", "juventud"],
    lang: "es"
  }
];

const NIEBLA_QUOTES = [
  {
    id: "niebla-001",
    t: `Al aparecer Augusto a la puerta de su casa extendió el brazo derecho, con la mano palma abajo y abierta, y dirigiendo los ojos al cielo quedóse un momento parado en esta actitud estatuaria y augusta.

No era que tomaba posesión del mundo exterior, sino era que observaba si llovía.

Y al recibir en el dorso de la mano el frescor del lento orvallo frunció el sobrecejo.

Y no era tampoco que le molestase la llovizna, sino el tener que abrir el paraguas.`,
    a: "Miguel de Unamuno",
    author: "Miguel de Unamuno",
    obra: "Niebla",
    obraTitulo: "Niebla",
    work: "Niebla",
    type: "fragmento",
    highlight: "No era que tomaba posesión del mundo exterior, sino era que observaba si llovía.",
    tags: ["niebla", "lluvia", "vida", "ironía", "cotidiano"],
    lang: "es"
  },
  {
    id: "niebla-002",
    t: `¡Estaba tan elegante, tan esbelto, plegado y dentro de su funda!

Un paraguas cerrado es tan elegante como es feo un paraguas abierto.

«Es una desgracia esto de tener que servirse uno de las cosas —pensó Augusto—; tener que usarlas. El uso estropea y hasta destruye toda belleza.»`,
    a: "Miguel de Unamuno",
    author: "Miguel de Unamuno",
    obra: "Niebla",
    obraTitulo: "Niebla",
    work: "Niebla",
    type: "fragmento",
    highlight: "El uso estropea y hasta destruye toda belleza.",
    tags: ["belleza", "uso", "paraguas", "pensamiento", "vida"],
    lang: "es"
  },
  {
    id: "niebla-003",
    t: `Abrió el paraguas por fin y se quedó un momento suspenso y pensando:

«Y ahora, ¿hacia dónde voy? ¿Tiro a la derecha o a la izquierda?»

Porque Augusto no era un caminante, sino un paseante de la vida.

«Esperaré a que pase un perro —se dijo— y tomaré la dirección inicial que él tome.»

En esto pasó por la calle no un perro, sino una garrida moza, y tras de sus ojos se fue, como imantado y sin darse de ello cuenta, Augusto.

Y así una calle y otra y otra.`,
    a: "Miguel de Unamuno",
    author: "Miguel de Unamuno",
    obra: "Niebla",
    obraTitulo: "Niebla",
    work: "Niebla",
    type: "fragmento",
    highlight: "Augusto no era un caminante, sino un paseante de la vida.",
    tags: ["vida", "camino", "azar", "Eugenia", "amor", "mirada"],
    lang: "es"
  },
  {
    id: "niebla-004",
    t: `¿Y quién es Eugenia?

Ah, caigo en la cuenta de que hace tiempo la andaba buscando.

Y mientras yo la buscaba ella me ha salido al paso.

¿No es esto acaso encontrar algo?

Cuando uno descubre una aparición que buscaba, ¿no es que la aparición, compadecida de su busca, se le viene al encuentro?`,
    a: "Miguel de Unamuno",
    author: "Miguel de Unamuno",
    obra: "Niebla",
    obraTitulo: "Niebla",
    work: "Niebla",
    type: "fragmento",
    highlight: "Mientras yo la buscaba ella me ha salido al paso.",
    tags: ["Eugenia", "aparición", "amor", "destino", "búsqueda"],
    lang: "es"
  },
  {
    id: "niebla-005",
    t: `—¿Y por qué te llamas Domingo?

—Porque así me llaman.

«Bien, muy bien —se dijo Augusto—; nos llamamos como nos llaman.

En los tiempos homéricos tenían las personas y las cosas dos nombres, el que les daban los hombres y el que les daban los dioses.

¿Cómo me llamará Dios?»`,
    a: "Miguel de Unamuno",
    author: "Miguel de Unamuno",
    obra: "Niebla",
    obraTitulo: "Niebla",
    work: "Niebla",
    type: "fragmento",
    highlight: "Nos llamamos como nos llaman.",
    tags: ["nombre", "identidad", "Dios", "Augusto", "existencia"],
    lang: "es"
  },
  {
    id: "niebla-006",
    t: `Tomó la pluma y se puso a escribir:

«Señorita: Esta misma mañana, bajo la dulce llovizna del cielo, cruzó usted, aparición fortuita, por delante de la puerta de la casa donde aún vivo y ya no tengo hogar.

Me habían llevado allí sus ojos, sus ojos, que son refulgentes estrellas mellizas en la nebulosa de mi mundo.

Perdóneme, Eugenia, y deje que le dé familiarmente este dulce nombre; perdóneme la lírica.

Yo vivo en perpetua lírica infinitesimal.»`,
    a: "Miguel de Unamuno",
    author: "Miguel de Unamuno",
    obra: "Niebla",
    obraTitulo: "Niebla",
    work: "Niebla",
    type: "fragmento",
    highlight: "Yo vivo en perpetua lírica infinitesimal.",
    tags: ["Eugenia", "amor", "carta", "lírica", "niebla"],
    lang: "es"
  },
  {
    id: "niebla-007",
    t: `«¡Enamorado yo! ¡Yo enamorado! ¡Quién había de decirlo...!

Tal vez mi amor ha precedido a su objeto.

Es más, es este amor el que lo ha suscitado, el que lo ha extraído de la niebla de la creación.»`,
    a: "Miguel de Unamuno",
    author: "Miguel de Unamuno",
    obra: "Niebla",
    obraTitulo: "Niebla",
    work: "Niebla",
    type: "fragmento",
    highlight: "Tal vez mi amor ha precedido a su objeto.",
    tags: ["amor", "creación", "niebla", "Eugenia", "deseo"],
    lang: "es"
  },
  {
    id: "niebla-008",
    t: `«¿Y cómo me he enamorado si en rigor no puedo decir que la conozco?

Bah, el conocimiento vendrá después.

El amor precede al conocimiento, y éste mata a aquél.

Conocer es perdonar, dicen.

No, perdonar es conocer.

Primero el amor, el conocimiento después.»`,
    a: "Miguel de Unamuno",
    author: "Miguel de Unamuno",
    obra: "Niebla",
    obraTitulo: "Niebla",
    work: "Niebla",
    type: "fragmento",
    highlight: "El amor precede al conocimiento, y éste mata a aquél.",
    tags: ["amor", "conocimiento", "Eugenia", "pensamiento", "filosofía"],
    lang: "es"
  },
  {
    id: "niebla-009",
    t: `«¿Y para amar algo, qué basta?

¡Vislumbrarlo!

El vislumbre; he aquí la intuición amorosa, el vislumbre en la niebla.

Luego viene el precisarse, la visión perfecta, el resolverse la niebla en gotas de agua o en granizo, o en nieve, o en piedra.

La ciencia es una pedrea.»`,
    a: "Miguel de Unamuno",
    author: "Miguel de Unamuno",
    obra: "Niebla",
    obraTitulo: "Niebla",
    work: "Niebla",
    type: "fragmento",
    highlight: "El vislumbre; he aquí la intuición amorosa, el vislumbre en la niebla.",
    tags: ["amor", "vislumbre", "niebla", "ciencia", "intuición"],
    lang: "es"
  },
  {
    id: "niebla-010",
    t: `«¡No, no, niebla, niebla!

¡Quién fuera águila para pasearse por los senos de las nubes!

Y ver al sol a través de ellas, como lumbre nebulosa también.»`,
    a: "Miguel de Unamuno",
    author: "Miguel de Unamuno",
    obra: "Niebla",
    obraTitulo: "Niebla",
    work: "Niebla",
    type: "fragmento",
    highlight: "¡No, no, niebla, niebla!",
    tags: ["niebla", "nubes", "sol", "deseo", "existencia"],
    lang: "es"
  },
  {
    id: "niebla-011",
    t: `«¿Sabes lo que es dar un paso decisivo?

Los vientos de la fortuna nos empujan y nuestros pasos son decisivos todos.

¿Nuestros? ¿Son nuestros esos pasos?

Caminamos, Orfeo mío, por una selva enmarañada y bravía, sin senderos.

El sendero nos lo hacemos con los pies según caminamos a la ventura.»`,
    a: "Miguel de Unamuno",
    author: "Miguel de Unamuno",
    obra: "Niebla",
    obraTitulo: "Niebla",
    work: "Niebla",
    type: "fragmento",
    highlight: "El sendero nos lo hacemos con los pies según caminamos a la ventura.",
    tags: ["camino", "destino", "Orfeo", "vida", "azar"],
    lang: "es"
  },
  {
    id: "niebla-012",
    t: `«¿De dónde ha brotado Eugenia?

¿Es ella una creación mía o soy creación suya yo?

¿O somos los dos creaciones mutuas, ella de mí y yo de ella?

¿No es acaso todo creación de cada cosa y cada cosa creación de todo?

¿Y qué es creación?

¿Qué eres tú, Orfeo?

¿Qué soy yo?»`,
    a: "Miguel de Unamuno",
    author: "Miguel de Unamuno",
    obra: "Niebla",
    obraTitulo: "Niebla",
    work: "Niebla",
    type: "fragmento",
    highlight: "¿Es ella una creación mía o soy creación suya yo?",
    tags: ["creación", "identidad", "Eugenia", "Orfeo", "existencia"],
    lang: "es"
  },
  {
    id: "niebla-013",
    t: `«Muchas veces se me ha ocurrido pensar, Orfeo, que yo no soy, e iba por la calle antojándoseme que los demás no me veían.

Y otras veces he fantaseado que no me veían como me veía yo, y que mientras yo me creía ir formalmente, con toda compostura, estaba, sin saberlo, haciendo el payaso, y los demás riéndose y burlándose de mí.»`,
    a: "Miguel de Unamuno",
    author: "Miguel de Unamuno",
    obra: "Niebla",
    obraTitulo: "Niebla",
    work: "Niebla",
    type: "fragmento",
    highlight: "Muchas veces se me ha ocurrido pensar, Orfeo, que yo no soy.",
    tags: ["identidad", "Orfeo", "existencia", "mirada", "extrañeza"],
    lang: "es"
  },
  {
    id: "niebla-014",
    t: `«¡Qué vida ésta, Orfeo, qué vida, sobre todo desde que murió mi madre!

Cada hora me llega empujada por las horas que le precedieron; no he conocido el porvenir.

Y ahora que empiezo a vislumbrarlo me parece se me va a convertir en pasado.

Eugenia es ya casi un recuerdo para mí.

Estos días que pasan... este día, este eterno día que pasa... deslizándose en niebla de aburrimiento.

Hoy como ayer, mañana como hoy.»`,
    a: "Miguel de Unamuno",
    author: "Miguel de Unamuno",
    obra: "Niebla",
    obraTitulo: "Niebla",
    work: "Niebla",
    type: "fragmento",
    highlight: "Este día, este eterno día que pasa... deslizándose en niebla de aburrimiento.",
    tags: ["tiempo", "madre", "aburrimiento", "niebla", "Orfeo"],
    lang: "es"
  },
  {
    id: "niebla-015",
    t: `«Y ahora me brillan en el cielo de mi soledad los dos ojos de Eugenia.

Me brillan con el resplandor de las lágrimas de mi madre.

Y me hacen creer que existo, ¡dulce ilusión!

Amo, ergo sum.»`,
    a: "Miguel de Unamuno",
    author: "Miguel de Unamuno",
    obra: "Niebla",
    obraTitulo: "Niebla",
    work: "Niebla",
    type: "fragmento",
    highlight: "Amo, ergo sum.",
    tags: ["amor", "existencia", "Eugenia", "madre", "soledad"],
    lang: "es"
  },
  {
    id: "niebla-016",
    t: `«Este amor, Orfeo, es como lluvia bienhechora en que se deshace y concreta la niebla de la existencia.

Gracias al amor siento al alma de bulto, la toco.

Empieza a dolerme en su cogollo mismo el alma, gracias al amor, Orfeo.

Y el alma misma ¿qué es sino amor, sino dolor encarnado?»`,
    a: "Miguel de Unamuno",
    author: "Miguel de Unamuno",
    obra: "Niebla",
    obraTitulo: "Niebla",
    work: "Niebla",
    type: "fragmento",
    highlight: "El alma misma ¿qué es sino amor, sino dolor encarnado?",
    tags: ["alma", "amor", "dolor", "Orfeo", "existencia"],
    lang: "es"
  },
  {
    id: "niebla-017",
    t: `«Vienen los días y van los días y el amor queda.

Allá dentro, muy dentro, en las entrañas de las cosas se rozan y friegan la corriente de este mundo con la contraria corriente del otro.

Y de este roce y friega viene el más triste y el más dulce de los dolores: el de vivir.»`,
    a: "Miguel de Unamuno",
    author: "Miguel de Unamuno",
    obra: "Niebla",
    obraTitulo: "Niebla",
    work: "Niebla",
    type: "fragmento",
    highlight: "El más triste y el más dulce de los dolores: el de vivir.",
    tags: ["vivir", "dolor", "amor", "existencia", "alma"],
    lang: "es"
  },
  {
    id: "niebla-018",
    t: `Parecíale respirar oscuridad, olor a vejez, a tradición sahumada en incienso, a hogar de siglos.

Cerró los ojos y volvió a soñar aquella casa dulce y tibia, en que la luz entraba por entre las blancas flores bordadas en los visillos.

Volvió a ver a su madre, yendo y viniendo sin ruido, siempre de negro, con aquella su sonrisa que era poso de lágrimas.`,
    a: "Miguel de Unamuno",
    author: "Miguel de Unamuno",
    obra: "Niebla",
    obraTitulo: "Niebla",
    work: "Niebla",
    type: "fragmento",
    highlight: "Volvió a ver a su madre, yendo y viniendo sin ruido, siempre de negro.",
    tags: ["madre", "casa", "recuerdo", "vejez", "hogar"],
    lang: "es"
  },
  {
    id: "niebla-019",
    t: `—¡Don Avito! —exclamó Augusto.

—¡El mismo, Augustito, el mismo!

—Pero ¿usted por aquí?

—Sí, yo por aquí; enseña mucho la vida, y más la muerte; enseñan más, mucho más que la ciencia.`,
    a: "Miguel de Unamuno",
    author: "Miguel de Unamuno",
    obra: "Niebla",
    obraTitulo: "Niebla",
    work: "Niebla",
    type: "fragmento",
    highlight: "Enseña mucho la vida, y más la muerte.",
    tags: ["vida", "muerte", "ciencia", "aprendizaje", "Don Avito"],
    lang: "es"
  },
  {
    id: "niebla-020",
    t: `—Sí, Augusto, sí —prosiguió don Avito—; la vida es la única maestra de la vida; no hay pedagogía que valga.

Sólo se aprende a vivir viviendo, y cada hombre tiene que recomenzar el aprendizaje de la vida de nuevo.`,
    a: "Miguel de Unamuno",
    author: "Miguel de Unamuno",
    obra: "Niebla",
    obraTitulo: "Niebla",
    work: "Niebla",
    type: "fragmento",
    highlight: "Sólo se aprende a vivir viviendo.",
    tags: ["vida", "aprendizaje", "Don Avito", "experiencia", "existencia"],
    lang: "es"
  }
];

const NANA_QUOTES = [
  {
    id: "nana-001",
    t: `En el vestíbulo del teatro, la multitud crecía bajo la luz brutal del gas.

Los hombres se detenían ante los carteles amarillos, donde el nombre de Nana aparecía en grandes letras negras. Unos lo leían en voz alta, otros lo lanzaban al pasar como una pregunta; las mujeres lo repetían con una sonrisa inquieta.

Nadie conocía a Nana. ¿De dónde caía Nana?

Y, sin embargo, aquel nombre pequeño, familiar, corría ya por todas las bocas como una caricia.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "Nana no era todavía más que un nombre.",
    tags: ["teatro", "París", "nombre", "deseo", "fama"],
    lang: "es"
  },
  {
    id: "nana-002",
    t: `La espera irritaba al público. Se empujaban en las puertas, se apretaban ante el control, se llamaban de un grupo a otro.

El nombre de Nana sonaba cada vez más alto, con la viveza cantarina de sus dos sílabas.

Una fiebre de curiosidad empujaba a París hacia ella, esa curiosidad de París que tiene la violencia de un acceso de locura caliente.

Querían ver a Nana.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "Una fiebre de curiosidad empujaba a París hacia ella.",
    tags: ["París", "curiosidad", "fiebre", "deseo", "teatro"],
    lang: "es"
  },
  {
    id: "nana-003",
    t: `Dentro, la sala resplandecía.

Las llamas altas del gas encendían el gran candelabro de cristal en una lluvia de fuegos amarillos y rosados. Los terciopelos granates de los asientos tomaban reflejos de laca; los dorados brillaban; los adornos verde claro suavizaban el esplendor bajo las pinturas demasiado crudas del techo.

Ya hacía calor.

El teatro entero parecía esperar una aparición.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "La sala resplandecía.",
    tags: ["teatro", "luz", "espera", "París", "aparición"],
    lang: "es"
  },
  {
    id: "nana-004",
    t: `París estaba allí: el París de las letras, de la finanza y del placer.

Había periodistas, escritores, hombres de Bolsa, mujeres galantes más que mujeres honestas; un mundo singularmente mezclado, hecho de todos los talentos y estropeado por todos los vicios.

La misma fatiga y la misma fiebre pasaban por los rostros.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "París estaba allí.",
    tags: ["París", "sociedad", "teatro", "vicio", "fiebre"],
    lang: "es"
  },
  {
    id: "nana-005",
    t: `Nana vio que la sala reía, y ella también se echó a reír.

La alegría aumentó. Después de todo, era graciosa aquella hermosa muchacha.

Su risa le abría un hoyuelo adorable en la barbilla. Esperaba sin incomodarse, familiar, entrando de golpe en intimidad con el público, como si dijera con un guiño que no tenía talento para dos céntimos, pero que eso no importaba.

Tenía otra cosa.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "No tenía talento, pero tenía otra cosa.",
    tags: ["Nana", "risa", "teatro", "talento", "deseo"],
    lang: "es"
  },
  {
    id: "nana-006",
    t: `La escena avanzaba entre risas, murmullos y miradas fijas.

Al principio la habían juzgado torpe, casi ridícula. Pero algo en ella trabajaba la sala, la calentaba, la vencía.

Poco a poco, Nana había tomado posesión del público.

Ahora cada hombre la sufría como una fuerza.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "Poco a poco, Nana había tomado posesión del público.",
    tags: ["Nana", "público", "posesión", "deseo", "teatro"],
    lang: "es"
  },
  {
    id: "nana-007",
    t: `Lo que subía de ella se había extendido cada vez más, llenando la sala.

A esa hora, sus menores movimientos soplaban deseo.

Doblaba la carne con un gesto del dedo meñique. Las espaldas se curvaban; las nucas temblaban bajo respiraciones tibias que parecían venir de una boca invisible.

Nana reinaba sin saberlo.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "Sus menores movimientos soplaban deseo.",
    tags: ["deseo", "Nana", "cuerpo", "público", "dominio"],
    lang: "es"
  },
  {
    id: "nana-008",
    t: `Al día siguiente, la casa de Nana fue invadida.

La campanilla no cesaba. Un verdadero carillón, decía Zoé; un carillón capaz de revolucionar el barrio entero.

Hombres de todas clases llamaban uno tras otro, empujados por la función de la víspera, por el rumor, por el deseo de ver de cerca a la mujer que había trastornado el teatro.

La esperaban como se espera una catástrofe deliciosa.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "La esperaban como se espera una catástrofe deliciosa.",
    tags: ["Nana", "casa", "hombres", "deseo", "fama"],
    lang: "es"
  },
  {
    id: "nana-009",
    t: `Había horas en que Nana, acosada por deudas pequeñas dentro de una vida demasiado grande, volvía a sentir la antigua ley de su existencia.

No podía contar más que consigo misma.

Su cuerpo le pertenecía.

Y, si hacía falta, era mejor servirse de él que sufrir una humillación.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "Su cuerpo le pertenecía.",
    tags: ["Nana", "cuerpo", "dinero", "supervivencia", "libertad"],
    lang: "es"
  },
  {
    id: "nana-010",
    t: `En el campo, junto a Georges, Nana se enternecía con cosas sencillas.

El canto de un pájaro, la luna, el silencio de la noche, el muchacho que la miraba con amor: todo aquello le parecía bueno, casi puro.

Recordaba romances antiguos, flores, promesas, pequeñas felicidades que la hacían sonreír y llorar.

Dios mío, pensaba, seguramente había nacido para vivir tranquila.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "Había nacido para vivir tranquila.",
    tags: ["Nana", "campo", "ternura", "Georges", "vida"],
    lang: "es"
  },
  {
    id: "nana-011",
    t: `Lo que acabó de derretirle el corazón fue la llegada de su hijo, Louiset.

Su crisis de maternidad tuvo la violencia de una locura.

Lo llevaba al sol para mirarlo moverse, se revolcaba con él sobre la hierba, lo vestía como a un pequeño príncipe. Quiso enseguida que durmiera cerca de ella.

Durante unos días, Nana creyó tocar una vida distinta.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "Su crisis de maternidad tuvo la violencia de una locura.",
    tags: ["Nana", "maternidad", "hijo", "campo", "ternura"],
    lang: "es"
  },
  {
    id: "nana-012",
    t: `Nana había crecido en un arrabal, sobre el pavimento de París.

Grande, hermosa, de carne soberbia, como una planta nacida en pleno estiércol, vengaba a los pobres y a los abandonados de los que era producto.

Con ella, la podredumbre que se dejaba fermentar en el pueblo subía y corrompía a la aristocracia.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "Crecida en el pavimento de París.",
    tags: ["Nana", "París", "pueblo", "aristocracia", "corrupción"],
    lang: "es"
  },
  {
    id: "nana-013",
    t: `Nana no calculaba todo el daño que hacía.

Era una fuerza de la naturaleza, un fermento de destrucción. Sin quererlo, corrompía y desorganizaba París.

Aquello que la sociedad había producido y despreciado volvía ahora contra ella, con una belleza triunfante y terrible.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "Era una fuerza de la naturaleza.",
    tags: ["Nana", "naturaleza", "destrucción", "París", "corrupción"],
    lang: "es"
  },
  {
    id: "nana-014",
    t: `Muffat la miraba sin poder apartar los ojos.

Quería llenarse de asco ante su desnudez, pero la contemplaba con una fascinación dolorosa.

Había en ella algo animal, inconsciente, magnífico y brutal.

Era la bestia de oro, una fuerza que no sabía lo que hacía, y cuyo solo olor estropeaba el mundo.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "Era la bestia de oro.",
    tags: ["Nana", "bestia de oro", "Muffat", "deseo", "corrupción"],
    lang: "es"
  },
  {
    id: "nana-015",
    t: `En torno a Nana corría un río de oro.

Se hablaba de joyas, coches, muebles, vestidos, casas, caballos; todo parecía llegar a ella y desaparecer en ella.

Pero, en medio de aquel lujo, estaba siempre al borde de una pequeña miseria.

El dinero le corría entre los dedos como agua.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "El dinero le corría entre los dedos como agua.",
    tags: ["Nana", "dinero", "lujo", "ruina", "París"],
    lang: "es"
  },
  {
    id: "nana-016",
    t: `Nana soñaba una habitación de terciopelo rosa, capitonada de plata, tendida hasta el techo como una tienda.

Pero la habitación no era más que el marco de la cama.

Soñaba una cama como no existía ninguna: un trono, un altar, un gran joyel de oro y plata donde París vendría a adorar su desnudez soberana.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "Soñaba una cama como no existía ninguna.",
    tags: ["Nana", "lujo", "cama", "París", "idolatría"],
    lang: "es"
  },
  {
    id: "nana-017",
    t: `El lecho debía ser de oro y plata repujados, semejante a una joya inmensa.

Rosas de oro caerían sobre un enrejado de plata; pequeños amores se inclinarían entre flores, riendo en la sombra de los cortinajes.

Nana quería un altar digno de ella.

París vendría a adorar su desnudez soberana.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "París vendría a adorar su desnudez soberana.",
    tags: ["Nana", "altar", "cuerpo", "lujo", "París"],
    lang: "es"
  },
  {
    id: "nana-018",
    t: `Nana avanzaba en su coche por el Bois como si el mundo le perteneciera.

Las mujeres observaban sus sombreros para copiarlos. Los hombres poderosos se apartaban a su paso. A veces su landó detenía una fila de carruajes de financieros, ministros y grandes señores.

Ella ocupaba un lugar inmenso en aquel mundo.

Se creía una reina, y París le daba la razón.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "Se creía una reina.",
    tags: ["Nana", "Bois", "reina", "París", "poder"],
    lang: "es"
  },
  {
    id: "nana-019",
    t: `Cuando se enfadaba, Nana recuperaba de golpe la brutalidad de la calle.

Los hombres, sentados alrededor de la mesa, bajaban los ojos y se hacían pequeños.

Ella los tenía debajo de sus antiguas zapatillas embarradas de la calle de la Goutte-d’Or, con el arrebato de su omnipotencia.

Podían ofrecerle fortunas y palacios: ella sabía de dónde venía.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "Los mantenía bajo sus viejas zapatillas embarradas.",
    tags: ["Nana", "poder", "Goutte-d'Or", "hombres", "origen"],
    lang: "es"
  },
  {
    id: "nana-020",
    t: `Vandeuvres la deseaba como se desea una ruina.

Sus caballos y sus amantes le habían devorado propiedades enteras; Nana iba a tragarse de un bocado su último castillo.

Y él parecía tener prisa por barrerlo todo, hasta los escombros de la vieja torre familiar.

Le parecía hermoso dejar los últimos oros de su blasón en manos de aquella mujer que París deseaba.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "Tenía prisa por arruinarse.",
    tags: ["Vandeuvres", "ruina", "Nana", "dinero", "aristocracia"],
    lang: "es"
  },
  {
    id: "nana-021",
    t: `Muffat caía cada vez más bajo.

Había querido resistirse, juzgarla, despreciarla, salvarse de ella. Pero siempre volvía, más dócil y más vencido.

Nana lo humillaba, lo gastaba, lo deshacía.

Y él, con la conciencia oscura de los devotos, acababa sintiendo que aquella mujer era su castigo.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "Aquella mujer era su castigo.",
    tags: ["Muffat", "Nana", "culpa", "religión", "deseo"],
    lang: "es"
  },
  {
    id: "nana-022",
    t: `En sus peleas, Nana volvía siempre a la misma exigencia.

No quería gritos en su casa. No quería dueños. No quería que ningún hombre se creyera con derecho sobre ella.

—Mete bien esto en tu cabeza: quiero ser libre.

Y aquella libertad, feroz y desordenada, era lo único que defendía como suyo.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "Quiero ser libre.",
    tags: ["Nana", "libertad", "hombres", "casa", "deseo"],
    lang: "es"
  },
  {
    id: "nana-023",
    t: `A su alrededor, las vidas iban cayendo.

Unos perdían el dinero, otros el honor, otros la razón. Las madres lloraban, los hombres mentían, robaban, se arrastraban, se mataban.

Nana seguía en medio de aquel derrumbe con una especie de inconsciencia luminosa.

No era cruel por cálculo.

Era peor: pasaba, y todo se hundía alrededor de ella.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "Todo se hundía alrededor de ella.",
    tags: ["Nana", "derrumbre", "ruina", "hombres", "destino"],
    lang: "es"
  },
  {
    id: "nana-024",
    t: `La noticia corrió entre los grupos.

Nana había muerto.

Algunos se quedaron fríos, otros hicieron una mueca de incredulidad. ¡Una mujer tan hermosa! Parecía imposible que aquella carne, adorada por tantos hombres, hubiese acabado también en una habitación cerrada, bajo una sábana.

Fuera, en el bulevar, otra fiebre subía desde la multitud.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "Nana muerta.",
    tags: ["Nana", "muerte", "París", "bulevar", "final"],
    lang: "es"
  },
  {
    id: "nana-025",
    t: `Las mujeres salieron una a una.

La habitación quedó vacía.

Junto a la muerta, la vela ardía todavía, y por la ventana abierta entraba el clamor del bulevar.

París gritaba hacia la guerra, mientras el cuerpo de Nana, que había encendido tantos deseos, se deshacía en silencio.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "La habitación estaba vacía.",
    tags: ["Nana", "muerte", "guerra", "París", "silencio"],
    lang: "es"
  },
  {
    id: "nana-026",
    t: `Desde la calle subía el grito de la multitud:

—¡A Berlín! ¡A Berlín! ¡A Berlín!

El clamor entraba por la ventana y levantaba el cortinaje con un soplo desesperado.

Arriba, Nana quedaba sola, vencida por la enfermedad.

Abajo, París corría hacia otra podredumbre, más grande, más histórica, más sangrienta.`,
    a: "Émile Zola",
    author: "Émile Zola",
    obra: "Nana",
    obraTitulo: "Nana",
    work: "Nana",
    type: "fragmento",
    highlight: "¡A Berlín! ¡A Berlín! ¡A Berlín!",
    tags: ["guerra", "París", "Nana", "Segundo Imperio", "final"],
    lang: "es"
  }
];

const QUOTE_INTERVAL_HOURS = 0.5;
const QUOTE_INTERVAL_MS = QUOTE_INTERVAL_HOURS * 60 * 60 * 1000;
const QUOTE_STATE_KEY = 'paramo-literario-last-quote-state';
const SHARE_IMAGE_FILE_NAME = 'paramo-literario.png';

const QUOTES = [
  ...PRE_RANDOM_QUOTES,
  ...E_A_FRAGMENTOS_QUOTES,
  ...CUMBRES_BORRASCOSAS_QUOTES,
  ...NUDO_DE_VIBORAS_QUOTES,
  ...PEDRO_PARAMO_QUOTES,
  ...FRANKENSTEIN_QUOTES,
  ...ANNE_DE_LAS_TEJAS_VERDES_QUOTES,
  ...LA_VIDA_ES_SUENO_QUOTES,
  ...BARTLEBY_QUOTES,
  ...CEREZAS_DEL_CEMENTERIO_QUOTES,
  ...NIEBLA_QUOTES,
  ...NANA_QUOTES
];

const ALLOWED_WEATHER_STATES = new Set([
  'clear',
  'sunny',
  'cloudy',
  'overcast',
  'light-rain',
  'heavy-rain',
  'mist',
]);
const ALLOWED_WEATHER_INTENSITIES = new Set(['soft', 'medium', 'strong']);
const ALLOWED_WEATHER_TIMES = new Set(['day', 'sunset', 'night']);
const LEGACY_WEATHER_STATE_MAP = Object.freeze({
  'night-clear': 'clear',
  'night-rain': 'light-rain',
});
const CLEAR_WEATHER_STATES = new Set(['clear', 'sunny']);
const RAIN_WEATHER_STATES = new Set(['light-rain', 'heavy-rain']);
const FALLBACK_TIME_OF_DAY = 'day';
const FALLBACK_WEATHER_STATE = Object.freeze({
  weather: 'cloudy',
  intensity: 'soft',
});
const WEATHER_CHANGE_EVENT = 'paramo:weather-change';

const storage = typeof window !== 'undefined' ? window.localStorage : undefined;
const quoteManager = createQuoteManager(QUOTES, storage);

let currentQuote = null;
let quoteElementRef = null;
let quoteHighlightRef = null;
let quoteCardRef = null;
let shareButtonRef = null;
let listenVoiceButtonRef = null;
let shareFeedbackRef = null;
let isSharingImage = false;
let quoteImageCache = null;
let quoteImageGenerationPromise = null;
let shareFallbackImageUrl = null;
let currentSpeechUtterance = null;
let allWordElements = [];
let animatedWordElements = [];
let dayHandlersAttached = false;
let prefersReducedMotion = false;
let reduceMotionQuery = null;
let esNoche = isNightTime();
let activeModal = null;
let lastModalTrigger = null;

function initMotionPreferenceWatcher() {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    prefersReducedMotion = false;
    return;
  }
  reduceMotionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  prefersReducedMotion = reduceMotionQuery.matches;
  const listener = (event) => {
    prefersReducedMotion = event.matches;
    resetWordEffects();
    updateWordModeBindings();
  };
  if (typeof reduceMotionQuery.addEventListener === 'function') {
    reduceMotionQuery.addEventListener('change', listener);
  } else if (typeof reduceMotionQuery.addListener === 'function') {
    reduceMotionQuery.addListener(listener);
  }
}

function normalizeWeatherState(input = {}) {
  const legacyVisualScene = Object.prototype.hasOwnProperty.call(LEGACY_WEATHER_STATE_MAP, input.weather)
    ? input.weather
    : null;
  const normalizedLegacyWeather = LEGACY_WEATHER_STATE_MAP[input.weather] || input.weather;
  const weather = ALLOWED_WEATHER_STATES.has(normalizedLegacyWeather)
    ? normalizedLegacyWeather
    : FALLBACK_WEATHER_STATE.weather;
  const intensity = ALLOWED_WEATHER_INTENSITIES.has(input.intensity)
    ? input.intensity
    : FALLBACK_WEATHER_STATE.intensity;

  return {
    weather,
    intensity,
    legacyVisualScene,
  };
}

function getFallbackWeatherState() {
  return {
    ...FALLBACK_WEATHER_STATE,
  };
}

function getLocalTimeOfDay() {
  const timeOfDay = getTimeOfDay();
  return ALLOWED_WEATHER_TIMES.has(timeOfDay) ? timeOfDay : FALLBACK_TIME_OF_DAY;
}

function deriveVisualScene(weather, timeOfDay) {
  if (CLEAR_WEATHER_STATES.has(weather)) {
    return `${timeOfDay}-clear`;
  }
  if (RAIN_WEATHER_STATES.has(weather)) {
    return `${timeOfDay}-rain`;
  }
  return `${timeOfDay}-${weather}`;
}

function updateAtmosphericParticles(weatherState) {
  const shouldShowDaylightMotes =
    weatherState.timeOfDay !== 'night'
    && (CLEAR_WEATHER_STATES.has(weatherState.weather) || weatherState.weather === 'cloudy');

  setDaylightMotesActive(shouldShowDaylightMotes);
}

function applyTimeOfDayToDocument(timeOfDay) {
  const body = document.body;
  if (!body) {
    return;
  }

  const isNight = timeOfDay === 'night';
  body.classList.toggle('night-fall', isNight);
  body.setAttribute('data-mode', timeOfDay);
  body.dataset.timeOfDay = timeOfDay;
  setNightModeState(isNight);
}

function applyWeatherStateToDocument(weatherState) {
  if (!document.body) {
    return;
  }

  const normalizedState = normalizeWeatherState(weatherState);
  const { legacyVisualScene, ...globalWeatherState } = normalizedState;
  const localTimeOfDay = getLocalTimeOfDay();
  const visualState = {
    ...globalWeatherState,
    timeOfDay: localTimeOfDay,
    visualScene: legacyVisualScene || deriveVisualScene(globalWeatherState.weather, localTimeOfDay),
  };

  document.body.dataset.weather = globalWeatherState.weather;
  document.body.dataset.weatherIntensity = globalWeatherState.intensity;
  document.body.dataset.visualScene = visualState.visualScene;
  applyTimeOfDayToDocument(localTimeOfDay);
  updateAtmosphericParticles(visualState);
  document.dispatchEvent(new CustomEvent(WEATHER_CHANGE_EVENT, {
    detail: visualState,
  }));
}

async function initGlobalWeatherState() {
  applyWeatherStateToDocument(getFallbackWeatherState());

  try {
    const response = await fetch('/api/weather-state', {
      method: 'GET',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`weather endpoint responded with ${response.status}`);
    }

    const weatherState = await response.json();
    applyWeatherStateToDocument(weatherState);
  } catch (error) {
    console.warn('No se pudo cargar el clima global; usando cloudy.', error);
    applyWeatherStateToDocument(getFallbackWeatherState());
  }
}

function createWordSpan(content, extraClass = '') {
  const span = document.createElement('span');
  span.className = extraClass ? `word ${extraClass}` : 'word';
  span.textContent = content;
  return span;
}

function clampNumber(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function interpolateNumber(from, to, amount) {
  return from + (to - from) * amount;
}

function applyQuoteLengthSizing(text) {
  if (!quoteElementRef) {
    return;
  }

  const normalizedText = typeof text === 'string' ? text.replace(/\s+/g, ' ').trim() : '';
  const characterCount = Array.from(normalizedText).length;
  const wordCount = normalizedText ? normalizedText.split(' ').length : 0;
  const effectiveLength = characterCount + Math.max(wordCount - 18, 0) * 2;
  const lengthAmount = clampNumber((effectiveLength - 70) / 170, 0, 1);

  const desktopSize = interpolateNumber(1.9, 1.38, lengthAmount);
  const mobileSize = interpolateNumber(1.46, 1.08, lengthAmount);
  const desktopLineHeight = interpolateNumber(1.3, 1.24, lengthAmount);
  const mobileLineHeight = interpolateNumber(1.23, 1.17, lengthAmount);

  quoteElementRef.style.setProperty('--quote-font-size', `${desktopSize.toFixed(2)}rem`);
  quoteElementRef.style.setProperty('--quote-mobile-font-size', `${mobileSize.toFixed(2)}rem`);
  quoteElementRef.style.setProperty('--quote-line-height', desktopLineHeight.toFixed(2));
  quoteElementRef.style.setProperty('--quote-mobile-line-height', mobileLineHeight.toFixed(2));
  quoteElementRef.dataset.quoteLength = lengthAmount < 0.33 ? 'short' : lengthAmount < 0.72 ? 'medium' : 'long';
}

function clearWordHighlight(word) {
  if (!word) return;
  const timerId = word._highlightTimerId;
  if (typeof timerId === 'number') {
    clearTimeout(timerId);
    delete word._highlightTimerId;
  }
  word.classList.remove('word--soft-glow');
}

function resetWordEffects() {
  for (const word of allWordElements) {
    if (!word) continue;
    clearWordHighlight(word);
    word.classList.remove('word--fall', 'word--returning', 'word--pulse');
    word.style.removeProperty('--word-fall-translate');
    word.style.removeProperty('--word-fall-rotate');
    word.style.removeProperty('--word-fall-duration');
    word.style.removeProperty('--word-return-duration');
  }
}

function detachNightHandlers() {
  for (const word of allWordElements) {
    if (!word) continue;
    const pointerHandler = word._nightPointerHandler;
    if (pointerHandler) {
      word.removeEventListener('pointerdown', pointerHandler);
      delete word._nightPointerHandler;
    }
    const animationHandler = word._nightAnimationHandler;
    if (animationHandler) {
      word.removeEventListener('animationend', animationHandler);
      word.removeEventListener('animationcancel', animationHandler);
      delete word._nightAnimationHandler;
    }
  }
}

function attachNightHandlers() {
  if (!esNoche || !animatedWordElements.length) {
    return;
  }
  for (const word of animatedWordElements) {
    if (!word) continue;
    const onPulse = () => {
      triggerWordPulse(word);
    };
    word.addEventListener('pointerdown', onPulse);
    word._nightPointerHandler = onPulse;
    const onAnimationDone = () => {
      word.classList.remove('word--pulse');
    };
    word.addEventListener('animationend', onAnimationDone);
    word.addEventListener('animationcancel', onAnimationDone);
    word._nightAnimationHandler = onAnimationDone;
  }
}

function triggerWordPulse(word) {
  if (!word) return;
  if (prefersReducedMotion) {
    applySoftHighlight([word], 900);
    return;
  }
  word.classList.remove('word--pulse');
  // force reflow to restart animation when needed
  void word.offsetWidth; // eslint-disable-line no-unused-expressions
  word.classList.add('word--pulse');
}

function detachDayHandlers() {
  if (!dayHandlersAttached) {
    return;
  }
  dayHandlersAttached = false;
  for (const word of allWordElements) {
    if (!word) continue;
    const pointerHandler = word._dayPointerHandler;
    if (pointerHandler) {
      word.removeEventListener('pointerdown', pointerHandler);
      delete word._dayPointerHandler;
    }
    const animationHandler = word._dayAnimationHandler;
    if (animationHandler) {
      word.removeEventListener('animationend', animationHandler);
      word.removeEventListener('animationcancel', animationHandler);
      delete word._dayAnimationHandler;
    }
  }
}

function applySoftHighlight(words, duration = 600) {
  if (!words || !words.length) {
    return;
  }
  for (const word of words) {
    if (!word) continue;
    clearWordHighlight(word);
    word.classList.add('word--soft-glow');
    const timeoutId = setTimeout(() => {
      word.classList.remove('word--soft-glow');
      delete word._highlightTimerId;
    }, duration);
    word._highlightTimerId = timeoutId;
  }
}

function attachDayHandlers() {
  if (dayHandlersAttached || !quoteElementRef) {
    return;
  }
  dayHandlersAttached = true;
  for (const word of animatedWordElements) {
    if (!word) continue;
    const onPulse = () => {
      triggerWordPulse(word);
    };
    word.addEventListener('pointerdown', onPulse);
    word._dayPointerHandler = onPulse;
    const onAnimationDone = () => {
      word.classList.remove('word--pulse');
    };
    word.addEventListener('animationend', onAnimationDone);
    word.addEventListener('animationcancel', onAnimationDone);
    word._dayAnimationHandler = onAnimationDone;
  }
}

function updateWordModeBindings() {
  if (!quoteElementRef) {
    return;
  }
  if (esNoche) {
    detachDayHandlers();
    detachNightHandlers();
    attachNightHandlers();
  } else {
    detachNightHandlers();
    attachDayHandlers();
  }
}

function setNightModeState(isNight) {
  const changed = esNoche !== isNight;
  esNoche = isNight;
  if (changed) {
    resetWordEffects();
  }
  updateWordModeBindings();
}

function setQuoteTextContent(text, { includeQuotes = true } = {}) {
  if (!quoteElementRef) {
    return;
  }
  if (allWordElements.length) {
    resetWordEffects();
    detachNightHandlers();
    detachDayHandlers();
  }
  const fragment = document.createDocumentFragment();
  if (includeQuotes) {
    fragment.appendChild(createWordSpan('“', 'word--quote-open'));
  }
  const content = typeof text === 'string' ? text : '';
  applyQuoteLengthSizing(content);
  const tokens = content.split(/(\s+)/);
  for (const token of tokens) {
    if (!token) continue;
    if (/^\s+$/.test(token)) {
      fragment.appendChild(document.createTextNode(token));
    } else {
      fragment.appendChild(createWordSpan(token));
    }
  }
  if (includeQuotes) {
    fragment.appendChild(createWordSpan('”', 'word--quote-close'));
  }
  quoteElementRef.replaceChildren(fragment);
  allWordElements = Array.from(quoteElementRef.querySelectorAll('.word'));
  animatedWordElements = allWordElements;
  updateWordModeBindings();
}

function applyDayNightMode() {
  const body = document.body;
  if (!body) {
    return;
  }

  applyWeatherStateToDocument({
    weather: body.dataset.weather || FALLBACK_WEATHER_STATE.weather,
    intensity: body.dataset.weatherIntensity || FALLBACK_WEATHER_STATE.intensity,
  });
}

function scheduleDayNightModeUpdates() {
  applyDayNightMode();
  const scheduler = typeof window !== 'undefined' ? window : globalThis;
  if (scheduler && typeof scheduler.setInterval === 'function') {
    scheduler.setInterval(applyDayNightMode, 60 * 1000);
  }
}

function readQuoteState() {
  if (!storage) return null;
  try {
    const raw = storage.getItem(QUOTE_STATE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      lastQuoteId: parsed.lastQuoteId,
      lastShownAt: parsed.lastShownAt,
      nextAllowedAt: parsed.nextAllowedAt
    };
  } catch {
    return null;
  }
}

function writeQuoteState(state) {
  if (!storage) return;
  try {
    storage.setItem(QUOTE_STATE_KEY, JSON.stringify(state));
  } catch {
    // ignore storage errors silently
  }
}

function isValidQuoteId(id) {
  return Number.isInteger(id) && id >= 0 && id < QUOTES.length;
}

function toQuoteWithIndex(idx) {
  if (!isValidQuoteId(idx)) {
    return null;
  }
  const base = QUOTES[idx];
  return base ? { ...base, idx } : null;
}

function getNavigationType() {
  if (typeof performance === 'undefined' || typeof performance.getEntriesByType !== 'function') {
    return 'navigate';
  }
  const entries = performance.getEntriesByType('navigation');
  if (entries && entries.length > 0) {
    return entries[0].type || 'navigate';
  }
  return 'navigate';
}

function storeNewQuote(quote, timestamp) {
  if (!quote) return;
  const shownAt = typeof timestamp === 'number' ? timestamp : Date.now();
  writeQuoteState({
    lastQuoteId: quote.idx,
    lastShownAt: shownAt,
    nextAllowedAt: shownAt + QUOTE_INTERVAL_MS
  });
}

function pickNewQuote() {
  const nextQuote = quoteManager.next();
  storeNewQuote(nextQuote, Date.now());
  return nextQuote;
}

function determineQuoteForDisplay() {
  const navigationType = getNavigationType();
  const storedState = readQuoteState();
  const now = Date.now();
  const storedQuote = storedState && isValidQuoteId(storedState.lastQuoteId)
    ? toQuoteWithIndex(storedState.lastQuoteId)
    : null;

  if (navigationType === 'reload' || navigationType === 'back_forward') {
    if (storedQuote) {
      return { quote: storedQuote };
    }
    return { quote: pickNewQuote() };
  }

  if (storedQuote && typeof storedState?.nextAllowedAt === 'number' && now < storedState.nextAllowedAt) {
    return {
      quote: storedQuote,
      message: 'Aún respira esta frase. Vuelve más tarde para otra.'
    };
  }

  return { quote: pickNewQuote() };
}

function ensureMessageElement() {
  let messageElement = document.getElementById('quote-message');
  if (!messageElement) {
    const panel = document.getElementById('quote-panel');
    if (!panel) {
      return null;
    }
    messageElement = document.createElement('p');
    messageElement.id = 'quote-message';
    messageElement.className = 'tiny';
    messageElement.hidden = true;
    panel.appendChild(messageElement);
  }
  return messageElement;
}

function setGentleMessage(message) {
  const element = ensureMessageElement();
  if (!element) return;
  if (message) {
    element.textContent = message;
    element.hidden = false;
  } else {
    element.textContent = '';
    element.hidden = true;
  }
}

function slugify(value) {
  if (!value) return '';
  return value
    .toString()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function splitWorkMetadata(work) {
  if (!work || typeof work !== 'string') {
    return { title: '', author: '' };
  }
  const parts = work.split(',');
  if (parts.length === 1) {
    const only = parts[0].trim();
    return { title: only, author: '' };
  }
  const title = parts.shift()?.trim() ?? '';
  const author = parts.join(',').trim();
  return { title, author };
}

function getQuoteMetadata(quote) {
  const { title, author: inferredAuthor } = splitWorkMetadata(quote.obra ?? '');
  const workTitle = quote.obraTitulo ?? title ?? quote.obra ?? '';
  const author = quote.autor ?? quote.author ?? inferredAuthor;
  return { author, workTitle };
}

function getModalElements(type) {
  const baseId = type === 'author' ? 'author' : 'work';
  const modal = document.getElementById(`${baseId}-modal`);
  if (!modal) return null;
  return {
    root: modal,
    overlay: modal.querySelector('.modal__overlay'),
    dialog: modal.querySelector('.modal__dialog'),
    title: modal.querySelector('.modal__title'),
    content: modal.querySelector(type === 'author' ? '.author-content' : '.work-content'),
    close: modal.querySelector('.modal__close')
  };
}

function closeActiveModal() {
  if (!activeModal) return;
  const { root } = activeModal;
  root.classList.add('is-hidden');
  root.setAttribute('aria-hidden', 'true');
  document.removeEventListener('keydown', handleEscapeKey, true);
  if (lastModalTrigger && typeof lastModalTrigger.focus === 'function') {
    lastModalTrigger.focus({ preventScroll: true });
  }
  activeModal = null;
}

function handleEscapeKey(event) {
  if (event.key === 'Escape') {
    closeActiveModal();
  }
}

function openModal(type, triggerElement, titleText) {
  const elements = getModalElements(type);
  if (!elements) return;

  const placeholder =
    type === 'author'
      ? 'Aquí irá la información sobre el autor. (Pendiente de completar).'
      : 'Aquí irá la información sobre la obra. (Pendiente de completar).';

  elements.root.classList.remove('is-hidden');
  elements.root.setAttribute('aria-hidden', 'false');
  if (elements.title) {
    elements.title.textContent = titleText || '';
  }
  if (elements.content) {
    elements.content.textContent = placeholder;
  }
  if (elements.close) {
    elements.close.focus({ preventScroll: true });
  }

  activeModal = { type, ...elements };
  lastModalTrigger = triggerElement;
  document.addEventListener('keydown', handleEscapeKey, true);
}

function bindModal(type) {
  const elements = getModalElements(type);
  if (!elements) return;
  if (elements.overlay) {
    elements.overlay.addEventListener('click', closeActiveModal);
  }
  if (elements.close) {
    elements.close.addEventListener('click', closeActiveModal);
  }
  if (elements.dialog) {
    elements.dialog.addEventListener('click', (event) => event.stopPropagation());
  }
  if (elements.root) {
    elements.root.addEventListener('click', (event) => {
      if (event.target === elements.root) {
        closeActiveModal();
      }
    });
  }
}

function initMetadataInteractions() {
  const authorLink = document.getElementById('author-name');
  const workLink = document.getElementById('author-work');

  bindModal('author');
  bindModal('work');

  if (authorLink?.tagName === 'BUTTON') {
    authorLink.addEventListener('click', () => {
      if (authorLink.hidden) return;
      openModal('author', authorLink, authorLink.textContent);
    });
  }

  if (workLink?.tagName === 'BUTTON') {
    workLink.addEventListener('click', () => {
      if (workLink.hidden) return;
      openModal('work', workLink, workLink.textContent);
    });
  }
}

function getQuoteIdentifier() {
  if (typeof currentQuote?.idx === 'number') {
    return currentQuote.idx;
  }
  if (typeof currentQuote?.id === 'string' && currentQuote.id.trim() !== '') {
    return currentQuote.id.trim();
  }
  return 'actual';
}

function getVisibleElementText(id) {
  const element = document.getElementById(id);
  if (!element || element.hidden) return '';
  return (element.textContent ?? '').replace(/\s+/g, ' ').trim();
}

function getShareImageTheme() {
  return document.body?.classList.contains('night-fall') ? 'night' : 'day';
}

function getQuoteCardSnapshot() {
  const quoteText = (currentQuote?.t ?? '').trim();
  const author = getVisibleElementText('author-name');
  const workTitle = getVisibleElementText('author-work');
  const title = getVisibleElementText('quote-card-title') || 'Páramo Literario';
  const theme = getShareImageTheme();

  return {
    key: [
      getQuoteIdentifier(),
      theme,
      quoteText,
      author,
      workTitle
    ].join('|'),
    quoteText,
    author,
    workTitle,
    title,
    theme
  };
}

function getSnapshotShareText(snapshot) {
  const quoteText = (snapshot?.quoteText ?? '').trim();
  const details = [snapshot?.author, snapshot?.workTitle].filter(Boolean).join(' · ');
  if (!quoteText) return snapshot?.title || 'Páramo Literario';
  return details ? `“${quoteText}”\n— ${details}` : `“${quoteText}”`;
}

function getQuoteVoiceText() {
  const quoteText = (currentQuote?.t ?? '').trim();
  const { author, workTitle } = getQuoteMetadata(currentQuote);
  const details = [author, workTitle].filter(Boolean).join(', ');
  return [quoteText, details].filter(Boolean).join('. ');
}

function updateListenVoiceButton(isSpeaking = false) {
  if (!listenVoiceButtonRef) return;
  listenVoiceButtonRef.classList.toggle('is-speaking', isSpeaking);
  listenVoiceButtonRef.setAttribute('aria-pressed', String(isSpeaking));
  const label = listenVoiceButtonRef.querySelector('span:last-child');
  if (label) {
    label.textContent = isSpeaking ? 'Detener voz' : 'Escuchar voz';
  }
}

function stopQuoteVoice() {
  if (typeof window !== 'undefined' && window.speechSynthesis) {
    window.speechSynthesis.cancel();
  }
  currentSpeechUtterance = null;
  updateListenVoiceButton(false);
}

function speakQuote() {
  if (typeof window === 'undefined' || !window.speechSynthesis || typeof SpeechSynthesisUtterance !== 'function') {
    showShareFeedback('Tu navegador no permite escuchar la frase en voz alta.');
    return;
  }

  if (currentSpeechUtterance) {
    stopQuoteVoice();
    return;
  }

  const voiceText = getQuoteVoiceText();
  if (!voiceText) return;

  const utterance = new SpeechSynthesisUtterance(voiceText);
  utterance.lang = currentQuote?.lang || 'es-ES';
  utterance.rate = 0.92;
  utterance.pitch = 0.9;
  utterance.onend = () => {
    currentSpeechUtterance = null;
    updateListenVoiceButton(false);
  };
  utterance.onerror = () => {
    currentSpeechUtterance = null;
    updateListenVoiceButton(false);
    showShareFeedback('No se pudo reproducir la voz. Inténtalo de nuevo.');
  };

  currentSpeechUtterance = utterance;
  updateListenVoiceButton(true);
  window.speechSynthesis.cancel();
  window.speechSynthesis.speak(utterance);
}

function canvasToBlob(canvas, mimeType = 'image/png', quality = 0.92) {
  return new Promise((resolve, reject) => {
    if (!canvas?.toBlob) {
      reject(new Error('No se pudo generar la imagen'));
      return;
    }
    canvas.toBlob((blob) => {
      if (blob) {
        resolve(blob);
      } else {
        reject(new Error('No se pudo crear el archivo de imagen'));
      }
    }, mimeType, quality);
  });
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  const safeRadius = Math.min(radius, width / 2, height / 2);
  ctx.beginPath();
  ctx.moveTo(x + safeRadius, y);
  ctx.lineTo(x + width - safeRadius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + safeRadius);
  ctx.lineTo(x + width, y + height - safeRadius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - safeRadius, y + height);
  ctx.lineTo(x + safeRadius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - safeRadius);
  ctx.lineTo(x, y + safeRadius);
  ctx.quadraticCurveTo(x, y, x + safeRadius, y);
  ctx.closePath();
}

function measureLetterSpacedText(ctx, text, letterSpacing) {
  if (!text) return 0;
  return Array.from(text).reduce((width, character, index) => {
    return width + ctx.measureText(character).width + (index > 0 ? letterSpacing : 0);
  }, 0);
}

function drawLetterSpacedText(ctx, text, centerX, y, letterSpacing) {
  const characters = Array.from(text);
  let x = centerX - measureLetterSpacedText(ctx, text, letterSpacing) / 2;
  for (const character of characters) {
    ctx.fillText(character, x, y);
    x += ctx.measureText(character).width + letterSpacing;
  }
}

function splitLongWord(ctx, word, maxWidth) {
  const chunks = [];
  let current = '';
  for (const character of Array.from(word)) {
    const next = `${current}${character}`;
    if (current && ctx.measureText(next).width > maxWidth) {
      chunks.push(current);
      current = character;
    } else {
      current = next;
    }
  }
  if (current) {
    chunks.push(current);
  }
  return chunks;
}

function wrapCanvasText(ctx, text, maxWidth) {
  const normalized = String(text ?? '')
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trim().replace(/\s+/g, ' '));
  const lines = [];

  for (const paragraph of normalized) {
    if (!paragraph) {
      if (lines.length && lines[lines.length - 1] !== '') {
        lines.push('');
      }
      continue;
    }

    const words = paragraph.split(' ');
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (ctx.measureText(candidate).width <= maxWidth) {
        current = candidate;
        continue;
      }

      if (current) {
        lines.push(current);
        current = '';
      }

      if (ctx.measureText(word).width > maxWidth) {
        const chunks = splitLongWord(ctx, word, maxWidth);
        lines.push(...chunks.slice(0, -1));
        current = chunks[chunks.length - 1] ?? '';
      } else {
        current = word;
      }
    }

    if (current) {
      lines.push(current);
    }
  }

  return lines.length ? lines : [''];
}

function getShareQuoteFontSize(quoteText) {
  const length = quoteText.length;
  if (length > 1100) return 30;
  if (length > 850) return 32;
  if (length > 650) return 35;
  if (length > 460) return 38;
  if (length > 280) return 42;
  return 50;
}

function getShareImagePalette(theme) {
  if (theme === 'night') {
    return {
      backgroundTop: '#120f15',
      backgroundBottom: '#0d0a10',
      glow: 'rgba(246, 234, 199, 0.16)',
      border: 'rgba(246, 234, 199, 0.28)',
      title: '#f9f3da',
      text: '#f6efd9',
      author: '#d3cab0',
      shadow: 'rgba(0, 0, 0, 0.48)'
    };
  }

  return {
    backgroundTop: '#181612',
    backgroundBottom: '#14120f',
    glow: 'rgba(200, 162, 90, 0.17)',
    border: 'rgba(200, 162, 90, 0.42)',
    title: '#c8a25a',
    text: '#f2efe8',
    author: '#b8b2a8',
    shadow: 'rgba(0, 0, 0, 0.44)'
  };
}

function createQuoteImageCanvas(snapshot) {
  const width = 1080;
  const minHeight = 1350;
  const paddingX = 96;
  const maxTextWidth = width - paddingX * 2;
  const palette = getShareImagePalette(snapshot.theme);
  const quoteFontSize = getShareQuoteFontSize(snapshot.quoteText);
  const lineHeight = Math.round(quoteFontSize * 1.36);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('No se pudo crear el canvas');
  }

  ctx.font = `500 ${quoteFontSize}px "Playfair Display", Georgia, serif`;
  const quoteLines = wrapCanvasText(ctx, `“${snapshot.quoteText}”`, maxTextWidth);
  const quoteBlockHeight = quoteLines.reduce((height, line) => {
    return height + (line ? lineHeight : Math.round(lineHeight * 0.55));
  }, 0);
  const metadataHeight = (snapshot.author ? 44 : 0) + (snapshot.workTitle ? 48 : 0);
  const naturalHeight = 360 + quoteBlockHeight + 84 + metadataHeight + 160;
  const height = Math.max(minHeight, naturalHeight);

  canvas.width = width;
  canvas.height = height;

  const background = ctx.createLinearGradient(0, 0, 0, height);
  background.addColorStop(0, palette.backgroundTop);
  background.addColorStop(1, palette.backgroundBottom);
  ctx.fillStyle = background;
  ctx.fillRect(0, 0, width, height);

  const glow = ctx.createRadialGradient(width / 2, 0, 0, width / 2, 0, width * 0.78);
  glow.addColorStop(0, palette.glow);
  glow.addColorStop(0.58, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, width, height);

  drawRoundedRect(ctx, 28, 28, width - 56, height - 56, 32);
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.textBaseline = 'alphabetic';
  ctx.shadowColor = palette.shadow;
  ctx.shadowBlur = 22;
  ctx.shadowOffsetY = 4;

  ctx.fillStyle = palette.title;
  ctx.font = '500 40px "Playfair Display", Georgia, serif';
  drawLetterSpacedText(ctx, snapshot.title.toLocaleUpperCase('es'), width / 2, 132, 10);

  ctx.font = '500 132px "Playfair Display", Georgia, serif';
  ctx.globalAlpha = 0.9;
  ctx.fillText('“', width / 2, 252);
  ctx.globalAlpha = 1;

  const ruleY = 304;
  const ruleWidth = 330;
  const diamondSize = 13;
  ctx.shadowBlur = 0;
  ctx.strokeStyle = palette.border;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(width / 2 - ruleWidth / 2, ruleY);
  ctx.lineTo(width / 2 - 26, ruleY);
  ctx.moveTo(width / 2 + 26, ruleY);
  ctx.lineTo(width / 2 + ruleWidth / 2, ruleY);
  ctx.stroke();
  ctx.save();
  ctx.translate(width / 2, ruleY);
  ctx.rotate(Math.PI / 4);
  ctx.fillStyle = palette.title;
  ctx.fillRect(-diamondSize / 2, -diamondSize / 2, diamondSize, diamondSize);
  ctx.restore();

  const contentHeight = quoteBlockHeight + 70 + metadataHeight;
  const availableHeight = height - 420 - 170;
  let y = 392 + Math.max(0, (availableHeight - contentHeight) * 0.32);

  ctx.fillStyle = palette.text;
  ctx.font = `500 ${quoteFontSize}px "Playfair Display", Georgia, serif`;
  ctx.shadowColor = palette.shadow;
  ctx.shadowBlur = 18;
  ctx.shadowOffsetY = 3;
  for (const line of quoteLines) {
    if (!line) {
      y += Math.round(lineHeight * 0.55);
      continue;
    }
    ctx.fillText(line, width / 2, y);
    y += lineHeight;
  }

  y += 56;
  ctx.shadowBlur = 0;
  ctx.fillStyle = palette.title;
  if (snapshot.author) {
    ctx.font = '600 28px Inter, Arial, sans-serif';
    drawLetterSpacedText(ctx, `— ${snapshot.author.toLocaleUpperCase('es')}`, width / 2, y, 6);
    y += 46;
  }

  if (snapshot.workTitle) {
    ctx.fillStyle = palette.author;
    ctx.font = 'italic 30px "Playfair Display", Georgia, serif';
    const workLines = wrapCanvasText(ctx, snapshot.workTitle, maxTextWidth * 0.72);
    for (const line of workLines.slice(0, 2)) {
      ctx.fillText(line, width / 2, y);
      y += 38;
    }
  }

  ctx.globalAlpha = 0.34;
  ctx.fillStyle = palette.author;
  ctx.font = '500 22px Inter, Arial, sans-serif';
  drawLetterSpacedText(ctx, 'paramoliterario.com', width / 2, height - 82, 4);
  ctx.globalAlpha = 1;

  return canvas;
}

async function waitForShareImageFonts() {
  if (!document.fonts?.ready) return;
  try {
    await Promise.race([
      document.fonts.ready,
      new Promise(resolve => setTimeout(resolve, 800))
    ]);
  } catch {
    // The canvas can still be generated with fallback fonts.
  }
}

async function createQuoteImageBlob(snapshot) {
  await waitForShareImageFonts();
  const canvas = createQuoteImageCanvas(snapshot);
  return canvasToBlob(canvas, 'image/png');
}

function prepareQuoteImage() {
  if (!currentQuote) {
    return Promise.resolve(null);
  }

  const snapshot = getQuoteCardSnapshot();
  if (!snapshot.quoteText) {
    return Promise.resolve(null);
  }

  if (quoteImageCache?.key === snapshot.key) {
    return Promise.resolve(quoteImageCache);
  }

  if (quoteImageGenerationPromise?.key === snapshot.key) {
    return quoteImageGenerationPromise;
  }

  const fileName = SHARE_IMAGE_FILE_NAME;
  const generation = createQuoteImageBlob(snapshot)
    .then(blob => {
      const result = {
        key: snapshot.key,
        blob,
        fileName,
        text: getSnapshotShareText(snapshot)
      };
      quoteImageCache = result;
      return result;
    })
    .finally(() => {
      if (quoteImageGenerationPromise === generation) {
        quoteImageGenerationPromise = null;
      }
    });

  generation.key = snapshot.key;
  quoteImageGenerationPromise = generation;
  return generation;
}

function triggerImageDownload(blob, fileName) {
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(downloadUrl);
}

function isMobileShareDevice() {
  const userAgent = navigator.userAgent || '';
  return /Android|iPhone|iPad|iPod/i.test(userAgent) || (
    /Macintosh/i.test(userAgent) &&
    Number(navigator.maxTouchPoints || 0) > 1
  );
}

function createShareImageFile(blob) {
  if (!blob || typeof File !== 'function') return null;
  return new File([blob], SHARE_IMAGE_FILE_NAME, { type: 'image/png' });
}

function openImageInNewTab(blob) {
  const imageUrl = URL.createObjectURL(blob);
  const openedWindow = window.open(imageUrl, '_blank');

  if (!openedWindow) {
    URL.revokeObjectURL(imageUrl);
    return false;
  }

  openedWindow.opener = null;

  window.setTimeout(() => {
    URL.revokeObjectURL(imageUrl);
  }, 60000);

  return true;
}

function hideShareImageFallback() {
  const fallback = document.getElementById('share-image-fallback');
  if (fallback) {
    const image = fallback.querySelector('img');
    if (image) {
      image.removeAttribute('src');
    }
    fallback.hidden = true;
  }

  if (shareFallbackImageUrl) {
    URL.revokeObjectURL(shareFallbackImageUrl);
    shareFallbackImageUrl = null;
  }
}

function showInlineShareImageFallback(blob) {
  hideShareImageFallback();

  const imageUrl = URL.createObjectURL(blob);
  shareFallbackImageUrl = imageUrl;

  let fallback = document.getElementById('share-image-fallback');
  if (!fallback) {
    fallback = document.createElement('figure');
    fallback.id = 'share-image-fallback';
    fallback.className = 'share-image-fallback';

    const image = document.createElement('img');
    image.alt = 'Imagen generada de P\u00e1ramo Literario';
    fallback.appendChild(image);

    const anchor = shareFeedbackRef || quoteCardRef;
    anchor?.insertAdjacentElement('afterend', fallback);
  }

  const image = fallback.querySelector('img');
  if (image) {
    image.src = imageUrl;
  }
  fallback.hidden = false;
}

function showMobileImageFallback(blob) {
  if (openImageInNewTab(blob)) {
    showShareFeedback('Imagen abierta en una nueva pesta\u00f1a. Mant\u00e9n pulsada la imagen para guardarla.');
    return;
  }

  showInlineShareImageFallback(blob);
  showShareFeedback('Mant\u00e9n pulsada la imagen para guardarla.');
}

function showShareFeedback(message) {
  if (!shareFeedbackRef) return;
  if (!message) {
    shareFeedbackRef.hidden = true;
    shareFeedbackRef.textContent = '';
    return;
  }
  shareFeedbackRef.hidden = false;
  shareFeedbackRef.textContent = message;
}

function wasShareCancelled(error) {
  return error?.name === 'AbortError';
}

function canShareImageFile(file) {
  if (
    !file ||
    typeof navigator.share !== 'function' ||
    typeof navigator.canShare !== 'function'
  ) {
    return false;
  }

  try {
    return navigator.canShare({ files: [file] });
  } catch {
    return false;
  }
}

async function shareQuoteAsImage() {
  if (!quoteCardRef || !currentQuote || isSharingImage) return;
  isSharingImage = true;

  if (shareButtonRef) {
    shareButtonRef.disabled = true;
  }

  showShareFeedback('Preparando imagen...');

  try {
    hideShareImageFallback();
    const snapshot = getQuoteCardSnapshot();
    let image = quoteImageCache?.key === snapshot.key ? quoteImageCache : null;
    if (!image) {
      image = await prepareQuoteImage();
    }

    if (!image?.blob) {
      throw new Error('No se pudo preparar la imagen');
    }

    const file = createShareImageFile(image.blob);

    if (canShareImageFile(file)) {
      try {
        await navigator.share({
          title: 'Páramo Literario',
          text: 'Una frase de Páramo Literario',
          files: [file]
        });
        showShareFeedback('');
        return;
      } catch (error) {
        if (wasShareCancelled(error)) {
          showShareFeedback('');
          return;
        }
        console.error('Error al compartir imagen:', error);
        if (isMobileShareDevice()) {
          showMobileImageFallback(image.blob);
          alert('No se pudo compartir la imagen. Mantén pulsada la imagen para guardarla.');
          return;
        }
        triggerImageDownload(image.blob, image.fileName);
        showShareFeedback('No se pudo abrir el menú de compartir. Descargamos la imagen automáticamente.');
        return;
      }
    }

    if (isMobileShareDevice()) {
      showMobileImageFallback(image.blob);
      return;
    }

    triggerImageDownload(image.blob, image.fileName);
    showShareFeedback('Tu dispositivo no permite compartir archivos directo. Descargamos la imagen para que la compartas.');
  } catch (error) {
    console.error('Error al compartir imagen:', error);
    showShareFeedback('No se pudo compartir la imagen. Mantén pulsada la imagen para guardarla.');
    alert('No se pudo compartir la imagen. Mantén pulsada la imagen para guardarla.');
  } finally {
    isSharingImage = false;
    if (shareButtonRef) {
      shareButtonRef.disabled = false;
    }
  }
}

function initQuoteActionButtons() {
  quoteCardRef = document.getElementById('quote-card');
  shareButtonRef = document.getElementById('share-image-btn');
  listenVoiceButtonRef = document.getElementById('listen-voice-btn');
  shareFeedbackRef = document.getElementById('share-feedback');

  if (listenVoiceButtonRef) {
    listenVoiceButtonRef.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      speakQuote();
    });
  }

  if (shareButtonRef) {
    shareButtonRef.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      shareQuoteAsImage();
    });
  }
}

function renderQuote(quote) {
  if (!quote) {
    return;
  }
  currentQuote = quote;
  stopQuoteVoice();
  if (quoteElementRef) {
    setQuoteTextContent(currentQuote.t ?? '', { includeQuotes: true });
    if (currentQuote.lang) {
      quoteElementRef.setAttribute('lang', currentQuote.lang);
    } else {
      quoteElementRef.removeAttribute('lang');
    }
  }

  if (quoteHighlightRef) {
    const highlight = typeof currentQuote.highlight === 'string'
      ? currentQuote.highlight.trim()
      : '';
    quoteHighlightRef.textContent = highlight;
    quoteHighlightRef.hidden = !highlight;
  }

  const authorContainer = document.getElementById('author');
  const authorName = document.getElementById('author-name');
  const authorWork = document.getElementById('author-work');
  const authorSeparator = document.getElementById('author-separator');
  const metaPrefix = document.querySelector('.meta-prefix');

  const { author, workTitle } = getQuoteMetadata(currentQuote);

  const hasAuthor = Boolean(author);
  const hasWork = Boolean(workTitle);

  const authorId = currentQuote.authorId || slugify(author || '');
  const workId = currentQuote.workId || slugify(workTitle || '');

  if (authorName) {
    authorName.textContent = author ?? '';
    authorName.hidden = !hasAuthor;
    authorName.dataset.authorId = authorId;
    authorName.setAttribute('aria-label', hasAuthor ? `Abrir información sobre ${author}` : '');
  }
  if (authorWork) {
    authorWork.textContent = workTitle ?? '';
    authorWork.hidden = !hasWork;
    authorWork.dataset.workId = workId;
    authorWork.setAttribute('aria-label', hasWork ? `Abrir información sobre ${workTitle}` : '');
  }
  if (authorSeparator) {
    authorSeparator.hidden = !(hasAuthor && hasWork);
  }
  if (metaPrefix) {
    metaPrefix.hidden = !(hasAuthor || hasWork);
  }
  if (authorContainer) {
    const metaParts = [author, workTitle].filter(Boolean);
    authorContainer.setAttribute('data-full-text', metaParts.join(' · '));
  }

  quoteImageCache = null;
  hideShareImageFallback();
  prepareQuoteImage().catch(error => {
    console.error('No se pudo preparar la imagen compartible', error);
  });
}

function initApp() {
  const { quote, message } = determineQuoteForDisplay();
  quoteElementRef = document.getElementById('quote');
  quoteHighlightRef = document.getElementById('quote-highlight');
  initDaylightMotes();
  initGlobalWeatherState();
  initMotionPreferenceWatcher();
  if (quoteElementRef) {
    setQuoteTextContent(quoteElementRef.textContent ?? '', { includeQuotes: false });
  }
  if (quote) {
    renderQuote(quote);
  }
  setGentleMessage(message);
  initMetadataInteractions();
  initQuoteActionButtons();
}

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  initFireflyAura();
  scheduleDayNightModeUpdates();
});
