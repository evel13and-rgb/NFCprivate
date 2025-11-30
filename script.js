import { createQuoteManager } from './quoteLogic.js';
import { initFireflyAura } from './fireflies.js';
import { isNightTime } from './dayNight.js';
import { initDaylightMotes, setDaylightMotesActive } from './dayMotes.js';
import { initDayMycelium, setDayMyceliumActive } from './mycelium.js';

const PRE_RANDOM_QUOTES = [];

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

const QUOTE_INTERVAL_HOURS = 0.5;
const QUOTE_INTERVAL_MS = QUOTE_INTERVAL_HOURS * 60 * 60 * 1000;
const QUOTE_STATE_KEY = 'paramo-literario-last-quote-state';

const QUOTES = [
  ...PRE_RANDOM_QUOTES,
  ...CUMBRES_BORRASCOSAS_QUOTES,
  ...NUDO_DE_VIBORAS_QUOTES,
  ...PEDRO_PARAMO_QUOTES,
  ...FRANKENSTEIN_QUOTES,
  ...LOS_RECUERDOS_DEL_PORVENIR_QUOTES,
  ...TENGO_MIEDO_TORERO_QUOTES,
  ...FIRMIN_QUOTES,
  ...EL_COLOR_PURPURA_QUOTES,
  ...ANNE_DE_LAS_TEJAS_VERDES_QUOTES
];

const storage = typeof window !== 'undefined' ? window.localStorage : undefined;
const quoteManager = createQuoteManager(QUOTES, storage);

let currentQuote = null;
let quoteElementRef = null;
let allWordElements = [];
let animatedWordElements = [];
let dayHandlersAttached = false;
let prefersReducedMotion = false;
let reduceMotionQuery = null;
let esNoche = isNightTime();

function slugify(value) {
  return String(value ?? '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '') || 'referencia';
}

function setMetaLink(element, text, slugPrefix, displayText) {
  if (!element) return;
  if (text) {
    const slug = slugify(text);
    element.textContent = displayText ?? text;
    element.href = `#${slugPrefix}-${slug}`;
    element.dataset.linkSlug = slug;
    element.hidden = false;
  } else {
    element.textContent = '';
    element.removeAttribute('href');
    element.removeAttribute('data-link-slug');
    element.hidden = true;
  }
}

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

function createWordSpan(content, extraClass = '') {
  const span = document.createElement('span');
  span.className = extraClass ? `word ${extraClass}` : 'word';
  span.textContent = content;
  return span;
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

  const shouldUseNightMode = isNightTime();
  body.classList.toggle('night-fall', shouldUseNightMode);
  body.setAttribute('data-mode', shouldUseNightMode ? 'night' : 'day');
  setDayMyceliumActive(!shouldUseNightMode);
  setDaylightMotesActive(!shouldUseNightMode);
  setNightModeState(shouldUseNightMode);
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
    const row = document.querySelector('#quote-panel .row');
    if (!row) {
      return null;
    }
    messageElement = document.createElement('span');
    messageElement.id = 'quote-message';
    messageElement.className = 'tiny';
    messageElement.hidden = true;
    row.appendChild(messageElement);
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

function renderQuote(quote) {
  if (!quote) {
    return;
  }
  currentQuote = quote;
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

  setMetaLink(authorName, currentQuote.a, 'autor', currentQuote.a ? `— ${currentQuote.a}` : '');
  setMetaLink(authorWork, currentQuote.obra, 'obra');
  if (authorSeparator) {
    authorSeparator.hidden = !(currentQuote.a && currentQuote.obra);
  }
  if (authorContainer) {
    const metaParts = [currentQuote.a, currentQuote.obra].filter(Boolean);
    authorContainer.setAttribute('data-full-text', metaParts.join(' · '));
  }
}

function initApp() {
  const { quote, message } = determineQuoteForDisplay();
  quoteElementRef = document.getElementById('quote');
  initMotionPreferenceWatcher();
  if (quoteElementRef) {
    setQuoteTextContent(quoteElementRef.textContent ?? '', { includeQuotes: false });
  }
  if (quote) {
    renderQuote(quote);
  }
  setGentleMessage(message);
}

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  initDayMycelium();
  initDaylightMotes();
  initFireflyAura();
  scheduleDayNightModeUpdates();
});
