import { createQuoteManager } from './quoteLogic.js';
import { initFireflyAura } from './fireflies.js';
import { getTimeOfDay, isNightTime } from './dayNight.js';
import { initDaylightMotes, setDaylightMotesActive } from './dayMotes.js';

const PRE_RANDOM_QUOTES = [];
const E_A_FRAGMENTOS_QUOTES = [
  {
    t: "Esa sensación de extrañeza tan profunda que casi me pone de revés en el mundo",
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

const LOS_RECUERDOS_DEL_PORVENIR_QUOTES = [
  {
    t: "Dicen que el tiempo se detuvo en Ixtepec, pero no es cierto. El tiempo nunca se detiene. Lo que pasa es que aquí se quedó mirando, como un perro fiel, esperando que algo cambiara. Y nada cambió.",
    a: "Narrador",
    obra: "Los recuerdos del porvenir, Elena Garro",
    lang: "es"
  },
  {
    t: "Nosotros, los de Ixtepec, vivimos muchas vidas sin saberlo. En cada esquina quedó un alma, en cada sombra un secreto, y en cada silencio una culpa. Por eso el viento no pasa sin gemir.",
    a: "Narrador",
    obra: "Los recuerdos del porvenir, Elena Garro",
    lang: "es"
  },
  {
    t: "Isabel Moncada amaba con esa pureza que solo tienen los que no esperan recompensa. Amaba porque no sabía hacer otra cosa. Y en ese amor se le fue la vida, como se va el agua de las manos abiertas.",
    a: "Narrador",
    obra: "Los recuerdos del porvenir, Elena Garro",
    lang: "es"
  },
  {
    t: "El general Rosas la miró con el corazón endurecido por la guerra, pero en los ojos le temblaba algo que no entendía: la nostalgia de la ternura. Nunca supo si amaba a Isabel o al sueño de inocencia que veía en ella.",
    a: "Narrador",
    obra: "Los recuerdos del porvenir, Elena Garro",
    lang: "es"
  },
  {
    t: "En Ixtepec nadie muere del todo. Las campanas doblan y las voces siguen hablando. Hasta los muertos aquí recuerdan, porque el olvido no se atreve a entrar en estas calles.",
    a: "Narrador",
    obra: "Los recuerdos del porvenir, Elena Garro",
    lang: "es"
  },
  {
    t: "El pueblo tenía memoria, y la memoria es un castigo. Recordar era revivir los días de miedo, de fusiles y rezos. Pero también era la única manera de no desaparecer.",
    a: "Narrador",
    obra: "Los recuerdos del porvenir, Elena Garro",
    lang: "es"
  },
  {
    t: "Los hombres hablaban de la revolución como si fuera una mujer: caprichosa, bella, imposible. Pero ninguno la entendía. Solo las mujeres sabíamos que la revolución también tiene frío, también llora, también espera.",
    a: "Narrador",
    obra: "Los recuerdos del porvenir, Elena Garro",
    lang: "es"
  },
  {
    t: "La gente creía que el futuro vendría de fuera, en tren, en cartas, en uniformes nuevos. Nadie pensó que el porvenir ya estaba aquí, encerrado en nuestros propios recuerdos.",
    a: "Narrador",
    obra: "Los recuerdos del porvenir, Elena Garro",
    lang: "es"
  },
  {
    t: "Isabel sintió que la tierra la llamaba. No con palabras, sino con un rumor antiguo, como si debajo de las piedras durmieran las voces de los que la amaron antes. Y comprendió que no hay destino más fuerte que la memoria.",
    a: "Narrador",
    obra: "Los recuerdos del porvenir, Elena Garro",
    lang: "es"
  },
  {
    t: "Yo soy el pueblo de Ixtepec. Yo recuerdo por todos. Los muertos, los ausentes, los que callaron. Soy la voz que se quedó en el polvo, esperando que alguien escuche. Porque solo quien recuerda, existe.",
    a: "Narrador",
    obra: "Los recuerdos del porvenir, Elena Garro",
    lang: "es"
  }
];

const TENGO_MIEDO_TORERO_QUOTES = [
  {
    t: "Yo también tengo miedo, pero no de las balas ni de los pacos, sino de quedarme sola, de que nadie me mire, de que nadie me quiera. El miedo de las maricas no es a la muerte: es al olvido.",
    a: "La Loca del Frente",
    obra: "Tengo miedo torero, Pedro Lemebel",
    lang: "es"
  },
  {
    t: "Eres tan lindo cuando hablas de tus cosas, te brillan los ojos como si dentro tuvieras una lucecita encendida. A mí me basta verte así para sentir que todavía vale la pena seguir viva.",
    a: "La Loca del Frente",
    obra: "Tengo miedo torero, Pedro Lemebel",
    lang: "es"
  },
  {
    t: "No te rías de mí, niño. Yo no sé de política, ni de revoluciones, ni de comunismo. Yo solo sé bordar, cocinar, esperar. Pero si tú me miras así, con esa fe en la cara, te juro que también podría creer en cualquier revolución.",
    a: "La Loca del Frente",
    obra: "Tengo miedo torero, Pedro Lemebel",
    lang: "es"
  },
  {
    t: "Yo no tuve juventud, tuve miedo. Miedo de los insultos, de las risas, de la policía, de los hombres que aman a escondidas y luego escupen al amanecido. Por eso me hice un disfraz de plumas, para que el miedo no me reconociera.",
    a: "La Loca del Frente",
    obra: "Tengo miedo torero, Pedro Lemebel",
    lang: "es"
  },
  {
    t: "No sé si me enamoré de él o de la manera en que me hacía sentir menos sola. Nunca nadie me había hablado como si mi vida importara. Y eso, para una pobre loca, es más que amor: es milagro.",
    a: "La Loca del Frente",
    obra: "Tengo miedo torero, Pedro Lemebel",
    lang: "es"
  },
  {
    t: "¿Sabes lo que es tener que esconder tu corazón toda la vida? Guardarlo como si fuera una bomba, para que nadie lo toque, para que nadie lo vea. Por eso las locas envejecemos con tanta tristeza: de tanto callar el amor.",
    a: "La Loca del Frente",
    obra: "Tengo miedo torero, Pedro Lemebel",
    lang: "es"
  },
  {
    t: "A veces pienso que mi vida ha sido una larga espera. Esperar el colectivo, esperar que se haga de día, esperar que alguien me diga ‘qué linda estás’. Y mira tú, la revolución llegó a mi puerta disfrazada de amor.",
    a: "La Loca del Frente",
    obra: "Tengo miedo torero, Pedro Lemebel",
    lang: "es"
  },
  {
    t: "Él hablaba de la patria, de la justicia, de los oprimidos. Yo solo lo miraba y pensaba: si supieras que la mía, mi patria, cabe en esta pieza, en esta mesa, en esta flor de plástico. Y que también tiene muertos, desaparecidos y héroes que nadie recuerda.",
    a: "La Loca del Frente",
    obra: "Tengo miedo torero, Pedro Lemebel",
    lang: "es"
  },
  {
    t: "Esa noche, cuando oí las sirenas y los disparos, recé por él sin saber rezar. Dije su nombre bajito, como si fuera una palabra mágica. Y supe que aunque no volviera, ya nadie me podría quitar el milagro de haberlo amado.",
    a: "La Loca del Frente",
    obra: "Tengo miedo torero, Pedro Lemebel",
    lang: "es"
  },
  {
    t: "La Loca del Frente quedó sola, mirando la ciudad dormida. Y en medio del miedo, del silencio y del frío, sintió algo extraño: una paz nueva, como si por fin su vida tuviera sentido, aunque nadie la recordara.",
    a: "Narrador",
    obra: "Tengo miedo torero, Pedro Lemebel",
    lang: "es"
  }
];

const FIRMIN_QUOTES = [
  {
    t: "Nací, como todos los ratones, ciego, desnudo y hambriento. Pero, a diferencia de los demás, nací en una librería. Y eso, aunque parezca una casualidad, fue mi condena y mi milagro.",
    a: "Firmin",
    obra: "Firmin, Sam Savage",
    lang: "es"
  },
  {
    t: "Mientras mis hermanos corrían por las cloacas buscando migas, yo me quedaba entre los estantes, royendo páginas. Descubrí que las palabras alimentaban más que el pan. Y que leer era la única manera de no sentirme tan pequeño.",
    a: "Firmin",
    obra: "Firmin, Sam Savage",
    lang: "es"
  },
  {
    t: "Aprendí a leer antes de aprender a hablar, y quizá por eso nunca pude comunicarme bien con nadie. Las palabras escritas eran mi mundo; las habladas, una frontera que no sabía cruzar.",
    a: "Firmin",
    obra: "Firmin, Sam Savage",
    lang: "es"
  },
  {
    t: "Cada libro era un cuerpo que se abría ante mí. Algunos los devoraba por hambre, otros por amor. Había páginas que me sabían a esperanza y otras a soledad. Pero todas, sin excepción, me daban un motivo para seguir respirando.",
    a: "Firmin",
    obra: "Firmin, Sam Savage",
    lang: "es"
  },
  {
    t: "Las palabras eran mi casa. Cuando el mundo me expulsaba, me refugiaba en Dickens, en Dostoyevski, en Flaubert. Ellos eran mis hermanos. Ellos sí sabían lo que era sentirse fuera de lugar.",
    a: "Firmin",
    obra: "Firmin, Sam Savage",
    lang: "es"
  },
  {
    t: "No hay tristeza más grande que la de un lector que ya lo ha leído todo y no tiene con quién compartirlo. Es como haber visto la belleza del mundo y no poder decirle a nadie: ‘mira’.",
    a: "Firmin",
    obra: "Firmin, Sam Savage",
    lang: "es"
  },
  {
    t: "Me gustaba pensar que los libros me querían un poco, que al morderlos no los destruía, sino que los hacía parte de mí. Al fin y al cabo, ¿no es eso lo que hace todo lector? Comer las palabras para no morirse de vacío.",
    a: "Firmin",
    obra: "Firmin, Sam Savage",
    lang: "es"
  },
  {
    t: "Norman Shine era mi héroe. Lo observaba desde las sombras como un niño observa a su padre. Me gustaba su manera de hablar con los libros, de acariciar las portadas, de mirar por la ventana como si esperara que alguien viniera a rescatarlo. Yo quería ser como él, pero sin su tristeza.",
    a: "Firmin",
    obra: "Firmin, Sam Savage",
    lang: "es"
  },
  {
    t: "Cuando Norman entraba en la librería, todo cambiaba. El polvo parecía menos gris, las páginas menos frías. Él era el único humano al que yo me atrevía a acercarme, aunque fuera en secreto. Nunca lo mordí, nunca lo asusté: era mi dios y mi hermano.",
    a: "Firmin",
    obra: "Firmin, Sam Savage",
    lang: "es"
  },
  {
    t: "Una tarde, mientras lo escuchaba leer en voz alta, comprendí que mi vida entera se resumía en ese momento: yo, un ratón escondido entre los libros; él, un hombre solo leyendo para nadie. Éramos dos criaturas distintas compartiendo la misma soledad.",
    a: "Firmin",
    obra: "Firmin, Sam Savage",
    lang: "es"
  },
  {
    t: "Norman nunca supo que existía. Y, sin embargo, fue mi único amigo. Él me enseñó que uno puede amar a alguien sin ser visto, sin ser correspondido, como se ama un libro viejo que nunca será tuyo.",
    a: "Firmin",
    obra: "Firmin, Sam Savage",
    lang: "es"
  },
  {
    t: "Jerry Magoon fue el primero que me habló. No gritó, no se espantó. Me miró con esos ojos cansados de hombre que ha visto demasiado y dijo: ‘Bueno, ¿y tú quién eres, pequeño cabrón?’ En su voz no había asco, solo curiosidad. Fue la primera vez que alguien me trató como a un igual.",
    a: "Firmin",
    obra: "Firmin, Sam Savage",
    lang: "es"
  },
  {
    t: "Jerry olía a whisky y a tristeza, pero tenía la risa más dulce del mundo. Cuando se emborrachaba me contaba historias, y yo lo escuchaba como si fueran sermones. Hablaba de los libros que nunca escribió y de las mujeres que lo habían dejado. Yo, que no era hombre ni escritor, lo entendía mejor que nadie.",
    a: "Firmin",
    obra: "Firmin, Sam Savage",
    lang: "es"
  },
  {
    t: "Él me llevaba en el bolsillo del abrigo cuando salía de noche. Veíamos las luces de Scollay Square reflejadas en los charcos y las mujeres pintadas en los portales. Jerry decía que el mundo era un circo triste, y que nosotros éramos los payasos que se habían quedado sin función.",
    a: "Firmin",
    obra: "Firmin, Sam Savage",
    lang: "es"
  },
  {
    t: "A veces se quedaba dormido con la botella en la mano y yo lo cubría con un pedazo de papel. Era mi manera de cuidarlo, como él me cuidaba cuando me ponía un trozo de pan cerca del plato. Éramos dos miserables compartiendo el calor de nuestra miseria.",
    a: "Firmin",
    obra: "Firmin, Sam Savage",
    lang: "es"
  },
  {
    t: "Una noche me dijo: ‘¿Sabes qué, Firmin? Tú lees más que cualquiera de estos idiotas, pero ellos nunca te dejarán entrar en su club’. Y se echó a reír. Aquella risa era triste, como una página que se rompe. Supe entonces que Jerry también estaba fuera de todo, como yo.",
    a: "Firmin",
    obra: "Firmin, Sam Savage",
    lang: "es"
  },
  {
    t: "Cuando Jerry murió, me quedé mirándolo largo rato. Tenía la cara tranquila, como si por fin hubiera entendido algo que los vivos no entendemos. Me subí a su pecho y escuché su silencio. Era el silencio más humano que conocí.",
    a: "Firmin",
    obra: "Firmin, Sam Savage",
    lang: "es"
  },
  {
    t: "Nunca volví a estar tan acompañado como con él. En su borrachera había ternura, y en su derrota, una especie de dignidad. Jerry me enseñó que a veces los peores perdedores son los que más aman la vida.",
    a: "Firmin",
    obra: "Firmin, Sam Savage",
    lang: "es"
  },
  {
    t: "Éramos dos animales diferentes, pero la misma especie de alma. Él soñaba con escribir; yo con hablar. Ninguno de los dos lo logró. Pero al menos nos tuvimos el uno al otro un rato, y eso, en este mundo, es casi un milagro.",
    a: "Firmin",
    obra: "Firmin, Sam Savage",
    lang: "es"
  }
];

const EL_COLOR_PURPURA_QUOTES = [
  {
    t: "Querido Dios:\n Me siento muy triste y sola. Nunca nadie me dijo que fuera bonita. Siempre he pensado que la gente fea no tiene derecho a sentir, que sólo debe obedecer. Pero a veces, cuando el sol me toca la cara, siento algo que no sé cómo llamar: como si todavía quedara algo de mí viva por dentro.",
    a: "Celie",
    obra: "El color púrpura, Alice Walker",
    lang: "es"
  },
  {
    t: "Oh, a Dios le gusta que la gente goce. Es uno de sus mejores dones. Y cuando te das cuenta de que le agradas, tú gozas el doble. Te relajas, te sueltas y alabas a Dios porque le gusta lo mismo que a ti.\n —¿A Dios no le parece indecente?\n —Noo. Dios lo quiso así. Mira, Dios ama todo lo que amas tú, además de otras cosas. Pero lo que más le agrada es la admiración.",
    a: "Shug Avery y Celie",
    obra: "El color púrpura, Alice Walker",
    lang: "es"
  },
  {
    t: "—Es que si Dios me quiere, Celie, no tengo que hacerlo.\n —¿Cómo qué?\n —Bueno, pues tumbarme a admirar lo que veo. Ser feliz. Pasarlo bien.\n —Eso sí que me parece una blasfemia.\n Ella me dice entonces:\n —Celie, la verdad, ¿has encontrado alguna vez a Dios en la iglesia?\n —Yo, nunca.\n —Sólo un puñado de gente que espera que se les manifieste. Si alguna vez he encontrado a Dios en la iglesia es porque ya lo llevaba conmigo.\n Lo mismo les pasa a los demás. La gente va a la iglesia a compartir a Dios o a buscarlo.",
    a: "Shug Avery y Celie",
    obra: "El color púrpura, Alice Walker",
    lang: "es"
  },
  {
    t: "—¿Qué canción es esa? —pregunté.\n —Algo que tú, rascando, rascando, me has sacado de la cabeza —dijo Shug, sonriendo.\n Y siguió cantando bajito, como si el aire le prestara la voz. Era una canción nueva, pero parecía que siempre hubiera existido. Hablaba de una mujer que encuentra su libertad en medio del dolor, y de otra que la escucha y comprende.",
    a: "Celie y Shug Avery",
    obra: "El color púrpura, Alice Walker",
    lang: "es"
  },
  {
    t: "Queridísima Nettie:\n A veces pienso que Shug nunca me ha querido. Me miro desnuda al espejo. ¿Qué podía querer?, me pregunto. El pelo, corto y encrespado, porque, desde que Shug me dijo que le gustaba así, dejé de alisármelo. La piel, oscura. La nariz, como tantas. Los labios, unos labios. El cuerpo, acusando la edad como el de cualquiera. Nada especial. Ni rizos color de miel, ni figura graciosa, ni nada que sea joven y fresco. A no ser el corazón, que no deja de sangrar.",
    a: "Celie",
    obra: "El color púrpura, Alice Walker",
    lang: "es"
  },
  {
    t: "Y lo sensato. Cuando se trata de lo que dos personas hacen con su cuerpo, dice, la opinión de cualquiera vale tanto como la mía. Pero si hablamos del amor, ahí no valen opiniones.\n Yo he amado y he sido amado. Porque yo sé lo que es. Y bendigo a Dios por haberme dado suficientes luces para saber que el amor no hay quien lo pare, por más que algunos gruñan y protesten.",
    a: "Celie",
    obra: "El color púrpura, Alice Walker",
    lang: "es"
  },
  {
    t: "Tú y yo no tenemos que rogarle a nadie para existir —dijo Shug—. Solo tenemos que abrir los ojos y mirar lo que ya es hermoso. El problema es que nos enseñaron a mirar para abajo, y no a mirar al cielo.",
    a: "Shug Avery",
    obra: "El color púrpura, Alice Walker",
    lang: "es"
  },
  {
    t: "Yo pienso que no sé nada y me alegro. Antes creía que sabía lo que era Dios, lo que era el amor, lo que era la vida. Pero ahora entiendo que mientras más vivo, menos sé, y que en eso está la alegría: en no tener miedo de aprenderlo todo otra vez.",
    a: "Celie",
    obra: "El color púrpura, Alice Walker",
    lang: "es"
  },
  {
    t: "Las mujeres de este mundo aguantamos tanto, que al final aprendemos a reírnos del dolor. Y en esa risa hay más libertad que en todas las iglesias.",
    a: "Sofia",
    obra: "El color púrpura, Alice Walker",
    lang: "es"
  },
  {
    t: "Nunca había pensado que Dios pudiera ser mujer, o viento, o risa. Siempre me lo pintaron como un viejo con barba que me vigilaba. Pero ahora pienso que Dios está dentro de todo, dentro de mí también, y eso me da fuerza.",
    a: "Celie",
    obra: "El color púrpura, Alice Walker",
    lang: "es"
  },
  {
    t: "Yo creo que estamos aquí para cavilar. Para preguntar. Y que, preguntándonos por las cosas grandes, encontramos respuesta para las pequeñas, casi por casualidad. Pero sobre las grandes te quedas como al principio. Y cuanto más cavilo y me pregunto, más amor siento.",
    a: "Celie",
    obra: "El color púrpura, Alice Walker",
    lang: "es"
  },
  {
    t: "Hasta que te he conocido a ti, Shug, no sabía que una mujer podía querer a otra de verdad. Tú me hiciste sentir que mi cuerpo era mío, que podía reír y cantar sin que nadie me lo prohibiera.",
    a: "Celie",
    obra: "El color púrpura, Alice Walker",
    lang: "es"
  },
  {
    t: "Yo he vivido suficiente para saber que el amor verdadero no tiene dueño. El amor no es lo que te atan, sino lo que te sueltan para que seas tú misma.",
    a: "Shug Avery",
    obra: "El color púrpura, Alice Walker",
    lang: "es"
  },
  {
    t: "A veces me siento como si el amor fuera un pedazo de tela que coso y descoso mil veces. Pero, Shug, cuando tú me abrazas, las puntadas se cierran. Me vuelvo entera otra vez.",
    a: "Celie",
    obra: "El color púrpura, Alice Walker",
    lang: "es"
  },
  {
    t: "Y entonces, cuando he descubierto que también puedo vivir contenta sin Shug, cuando Mr. ___ me ha pedido que vuelva a casarme con él, esta vez en cuerpo y alma y yo le he dicho: Noo, sigamos siendo amigos, Shug me escribe que vuelve a casa.\n Vamos a ver, ¿no es vida esto?\n Estoy tan serena.\n Si viene, yo feliz.\n Si no, contenta.\n Y entonces caigo en que puede que ésta sea la lección que yo tenía que aprender.",
    a: "Celie",
    obra: "El color púrpura, Alice Walker",
    lang: "es"
  },
  {
    t: "Querido Dios. Querido mundo. Querida gente.\n Ya no sé a quién escribirle, porque todo parece ser parte de lo mismo.\n Gracias por darme la voz, por dejarme cantar.\n Gracias por el color púrpura.",
    a: "Celie",
    obra: "El color púrpura, Alice Walker",
    lang: "es"
  },
  {
    t: "He amado y he sido amada.\n He rezado sin palabras, he visto a Dios en un campo, en una flor, en una mujer riendo.\n He sido libre sin dejar de ser pobre, y feliz sin dejar de tener cicatrices.\n Si esto no es vivir, no sé qué lo es.",
    a: "Celie",
    obra: "El color púrpura, Alice Walker",
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
  ...LOS_RECUERDOS_DEL_PORVENIR_QUOTES,
  ...TENGO_MIEDO_TORERO_QUOTES,
  ...FIRMIN_QUOTES,
  ...EL_COLOR_PURPURA_QUOTES,
  ...ANNE_DE_LAS_TEJAS_VERDES_QUOTES,
  ...LA_VIDA_ES_SUENO_QUOTES
];

const ALLOWED_WEATHER_STATES = new Set([
  'sunny',
  'cloudy',
  'overcast',
  'light-rain',
  'heavy-rain',
  'mist',
  'night-clear',
  'night-rain',
]);
const ALLOWED_WEATHER_INTENSITIES = new Set(['soft', 'medium', 'strong']);
const ALLOWED_WEATHER_TIMES = new Set(['day', 'sunset', 'night']);
const FALLBACK_WEATHER_STATE = Object.freeze({
  weather: 'cloudy',
  intensity: 'soft',
  timeOfDay: 'day',
});
const WEATHER_CHANGE_EVENT = 'paramo:weather-change';

const storage = typeof window !== 'undefined' ? window.localStorage : undefined;
const quoteManager = createQuoteManager(QUOTES, storage);

let currentQuote = null;
let quoteElementRef = null;
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
  const weather = ALLOWED_WEATHER_STATES.has(input.weather)
    ? input.weather
    : FALLBACK_WEATHER_STATE.weather;
  const intensity = ALLOWED_WEATHER_INTENSITIES.has(input.intensity)
    ? input.intensity
    : FALLBACK_WEATHER_STATE.intensity;
  const timeOfDay = weather.startsWith('night-')
    ? 'night'
    : ALLOWED_WEATHER_TIMES.has(input.timeOfDay)
      ? input.timeOfDay
      : getTimeOfDay();

  return {
    weather,
    intensity,
    timeOfDay,
  };
}

function getFallbackWeatherState() {
  return {
    ...FALLBACK_WEATHER_STATE,
    timeOfDay: getTimeOfDay(),
  };
}

function getEffectiveTimeOfDay(weather, timeOfDay) {
  if (weather?.startsWith('night-')) {
    return 'night';
  }
  return ALLOWED_WEATHER_TIMES.has(timeOfDay) ? timeOfDay : getTimeOfDay();
}

function updateAtmosphericParticles(weatherState) {
  const shouldShowDaylightMotes =
    weatherState.timeOfDay !== 'night'
    && (weatherState.weather === 'sunny' || weatherState.weather === 'cloudy');

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
  const effectiveTimeOfDay = getEffectiveTimeOfDay(normalizedState.weather, normalizedState.timeOfDay);
  const visualState = {
    ...normalizedState,
    timeOfDay: effectiveTimeOfDay,
  };

  document.body.dataset.weather = normalizedState.weather;
  document.body.dataset.weatherIntensity = normalizedState.intensity;
  applyTimeOfDayToDocument(effectiveTimeOfDay);
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

  const weather = body.dataset.weather || FALLBACK_WEATHER_STATE.weather;
  const timeOfDay = getEffectiveTimeOfDay(weather, getTimeOfDay());
  applyTimeOfDayToDocument(timeOfDay);
  updateAtmosphericParticles({
    weather,
    intensity: body.dataset.weatherIntensity || FALLBACK_WEATHER_STATE.intensity,
    timeOfDay,
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
