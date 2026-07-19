import { createQuoteManager } from './quoteLogic.js';
import { initFireflyAura } from './fireflies.js';
import { getTimeOfDay, isNightTime } from './dayNight.js';
import { initDaylightMotes, setDaylightMotesActive } from './dayMotes.js';
const RAYO_QUE_NO_CESA_QUOTES = [
  {
    t: `¿No cesará este rayo que me habita
el corazón de exasperadas fieras
y de fraguas coléricas y herreras
donde el metal más fresco se marchita?

¿No cesará esta terca estalactita
de cultivar sus duras cabelleras
como espadas y rígidas hogueras
hacia mi corazón que muge y grita?

Este rayo ni cesa ni se agota:
de mí mismo tomó su procedencia
y ejercita en mí mismo sus furores.

Esta obstinada piedra de mí brota
y sobre mí dirige la insistencia
de sus lluviosos rayos destructores`,
    a: "Miguel Hernández",
    obra: "El rayo que no cesa, Miguel Hernández",
    highlight: "Este rayo ni cesa ni se agota.",
    lang: "es"
  },
  {
    t: `Guiando un tribunal de tiburones,
como con dos guadañas eclipsadas,
con dos cejas tiznadas y cortadas
de tiznar y cortar los corazones,

en el mío has entrado, y en él pones
una red de raíces irritadas,
que avariciosamente acaparadas
tiene en su territorio sus pasiones.

Sal de mi corazón del que me has hecho
un girasol sumiso y amarillo
al dictamen solar que tu ojo envía:

un terrón para siempre insatisfecho,
un pez embotellado y un martillo
harto de golpear en la herrería.`,
    a: "Miguel Hernández",
    obra: "El rayo que no cesa, Miguel Hernández",
    highlight: "Un girasol sumiso y amarillo.",
    lang: "es"
  },
  {
    t: `Me tiraste un limón, y tan amargo,
con una mano cálida, y tan.pura,
que no menoscabó su arquitectura
y probé su amargura sin embargo.

Con el golpe amarillo, de un letargo
dulce pasó a una ansiosa calentura
mi sangre, que sintió la mordedura
de una punta de seno duro y largo.

Pero al mirarte y verte la sonrisa
que te produjo el limonado hecho,
a mi voraz malicia tan ajena,

se me durmió la sangre en la camisa,
y se volvió el poroso y áureo pecho
una picuda y deslumbrante pena.`,
    a: "Miguel Hernández",
    obra: "El rayo que no cesa, Miguel Hernández",
    highlight: "Se me durmió la sangre.",
    lang: "es"
  },
  {
    t: `Umbrío por la pena, casi bruno,
porque la pena tizna cuando estalla,
donde yo no me hallo no se halla
hombre más apenado que ninguno.

Sobre la pena duermo solo y uno,
pena es mi paz y pena mi batalla,
perro que ni me deja ni se calla,
siempre a su dueño fiel, pero importuno.

Cardos y penas llevo por corona,
cardos y penas siembran sus leopardos
y no me dejan bueno hueso alguno.

No podrá con la pena mi persona
rodeada de penas y de cardos:
¡cuánto penar para morirse uno!`,
    a: "Miguel Hernández",
    obra: "El rayo que no cesa, Miguel Hernández",
    highlight: "Pena es mi paz.",
    lang: "es"
  },
  {
    t: `Tengo estos huesos hechos a las penas
y a las cavilaciones estas sienes:
pena que vas, cavilación que vienes
como el mar de la playa a las arenas.

Como el mar de la playa a las arenas,
voy en este naufragio de vaivenes
por una noche oscura de sartenes
redondas, pobres, tristes y morenas.

Nadie me salvará de este naufragio
si no es tu amor, la tabla que procuro,
si no es tu voz, el norte que pretendo.

Eludiendo por eso el mal presagio
de que ni en ti siquiera habré seguro,
voy entre pena y pena sonriendo.`,
    a: "Miguel Hernández",
    obra: "El rayo que no cesa, Miguel Hernández",
    highlight: "Entre pena y pena sonriendo.",
    lang: "es"
  },
  {
    t: `Una querencia tengo por tu acento
una apetencia por tu compañía
y una dolencia de melancolía
por la ausencia del aire de tu viento.

Paciencia necesita mi tormento,
urgencia de tu garza galanía,
tu clemencia solar mi helado día,
tu asistencia la herida en que lo cuento.

¡Ay querencia, dolencia y apetencia!:
tus sustanciales besos, mi sustento,
me faltan y me muero sobre mayo.

Quiero que vengas, flor desde tu ausencia,
a serenar la sien del pensamiento
que desahoga en mí su eterno rayo.`,
    a: "Miguel Hernández",
    obra: "El rayo que no cesa, Miguel Hernández",
    highlight: "Me muero sobre mayo.",
    lang: "es"
  },
  {
    t: `Yo sé que ver y oír a un triste enfada
cuando se viene y va de la alegría
como un mar meridiano a una bahía,
a una región esquiva y desolada.

Lo que he sufrido y nada todo es nada
para lo que me queda todavía
que sufrir el rigor de esta agonía
de andar de este cuchillo a aquella espada.

Me callaré, me apartaré si puedo
con mi constante pena instante, plena,
a donde ni has dé oírme ni he de verte.

Me voy, me voy, me voy, pero me quedo,
pero me voy, desierto y sin arena:
adiós, amor, adiós hasta la muerte.`,
    a: "Miguel Hernández",
    obra: "El rayo que no cesa, Miguel Hernández",
    highlight: "Me voy, pero me quedo.",
    lang: "es"
  },
  {
    t: `No me conformo, no: me desespero
como si fuera un huracán de lava
en el presidio de una almendra esclava
o en el penal colgante de un jilguero.

Besarte fue' besar un avispero
que me clava al tormento y me desclava
y cava un hoyo fúnebre y lo cava
dentro del corazón donde me muero.

No me conformo, no: ya es tanto y tanto
idolatrar la imagen de tu beso
y perseguir el curso de tu aroma.

Un enterrado vivo por el llanto,
una revolución dentro de un hueso,
un rayo soy sujeto a una redoma.`,
    a: "Miguel Hernández",
    obra: "El rayo que no cesa, Miguel Hernández",
    highlight: "Un enterrado vivo por el llanto.",
    lang: "es"
  },
  {
    t: `¿Recuerdas aquel cuello, haces memoria
del privilegio aquel, de aquel aquello
que era, almenadamente blanco y bello,
una almena de nata giratoria?

Recuerdo y no recuerdo aquella historia
de marfil expirado en un cabello,
donde aprendió a ceñir el cisne cuello
y a vocear la nieve transitoria.

Recuerdo y no recuerdo aquel cogollo
de estrangulable hielo femenino
como una lacteada-y breve vía.

Y recuerdo aquel beso sin apoyo
que quedó entre mi boca y el camino
de aquel cuello, aquel beso y aquel día.`,
    a: "Miguel Hernández",
    obra: "El rayo que no cesa, Miguel Hernández",
    highlight: "Recuerdo y no recuerdo.",
    lang: "es"
  },
  {
    t: `Como el toro he nacido para el luto
y el dolor, como el toro estoy marcado
por un hierro infernal en el costado
y por varón en la ingle con un fruto.

Como el toro lo encuentra diminuto
todo mi corazón desmesurado,
y del rostro del beso enamorado,
como el toro a tu amor se lo disputo.

Como el toro me crezco en el castigo,
la lengua en corazón tengo bañada
y llevo al cuello un vendaval sonoro.

Como el toro te sigo y te persigo,
y dejas mi deseo en una espada,
como el toro burlado, como el toro.`,
    a: "Miguel Hernández",
    obra: "El rayo que no cesa, Miguel Hernández",
    highlight: "Me crezco en el castigo.",
    lang: "es"
  },
  {
    t: `Yo quiero ser llorando el hortelano
de la tierra que ocupas y estercolas,
compañero del alma, tan temprano.

Alimentando lluvias, caracolas
y órganos mi dolor sin instrumento,
a las desalentadas amapolas

daré tu corazón por alimento.
Tanto dolor se agrupa en mi costado,
que por doler me duele hasta el aliento.

Un manotazo duro, un golpe helado,
un hachazo invisible y homicida,
un empujón brutal te ha derribado.

No hay extensión más grande que mi herida,
lloro mi desventura y sus conjuntos
y siento más tu muerte que mi vida.`,
    a: "Miguel Hernández",
    obra: "El rayo que no cesa, Miguel Hernández",
    highlight: "Me duele hasta el aliento.",
    lang: "es"
  },
  {
    t: `Ando sobre rastrojos de difuntos,
y sin calor de nadie y sin consuelo
voy de mi corazón a mis asuntos.

Temprano levantó la muerte el vuelo,
temprano madrugó la madrugada,
temprano estás rodando por el suelo.

No perdono a la muerte enamorada,
no perdono a la vida desatenta,
no perdono a la tierra ni a la nada.

En mis manos levanto una tormenta
de piedras, rayos y hachas estridentes
sedienta de catástrofes y hambrienta`,
    a: "Miguel Hernández",
    obra: "El rayo que no cesa, Miguel Hernández",
    highlight: "No perdono a la muerte.",
    lang: "es"
  },
  {
    t: `Quiero escarbar la tierra con los dientes,
quiero apartar la tierra parte a parte
a dentelladas secas y calientes.

Quiero minar la tierra hasta encontrarte
y besarte la noble calavera
y desamordazarte y regresarte.

Volverás a mi huerto y a mi higuera:
por los altos andamios de las flores
pajareará tu alma colmenera

de angelicales ceras y labores.
Volverás al arrullo de las rejas
de los enamorados labradores.

Alegrarás la sombra de mis cejas,
y tu sangre se irán a cada lado
disputando tu novia y las abejas.`,
    a: "Miguel Hernández",
    obra: "El rayo que no cesa, Miguel Hernández",
    highlight: "Escarbar la tierra con los dientes.",
    lang: "es"
  }
].map(quote => ({ ...quote, type: "poem" }));

const PAPA_GORIOT_QUOTES = [
  {
    t: "Así os sucederá a vosotros, los que tenéis este libro en vuestras manos, que hundiéndoos en un blando sillón diréis: tal vez va a divertirme, y después de haber leído las ocultas desgracias del padre Goriot, comeréis con apetito, atribuyendo al autor vuestra insensibilidad, tratándole de exagerado y acusándole de poeta. ¡Ah! Bien lo sabéis. Este drama no es una ficción ni una novela, all is true: es tan verdadero que cada uno podrá reconocerlo en los elementos de su casa, tal vez en su propio corazón.",
    a: "Honoré de Balzac",
    obra: "Papá Goriot, Honoré de Balzac",
    highlight: "Comeréis con apetito.",
    lang: "es"
  },
  {
    t: "Allí el empedrado está seco, los arroyos no tienen barro ni agua, y la yerba crece a lo largo de las paredes. El hombre más indiferente se encuentra en ellas mortificado, los concurrentes tristes, el ruido de un carruaje es un acontecimiento, las casas son melancólicas, y las paredes remedan a una prisión. Allí no se encuentran más que huéspedes ordinarios, o de institutos, la miseria, el fastidio, la vejez moribunda, la alegre juventud encerrada y reducida a trabajar. Ningún cuartel de París es más horrible ni más desconocido.",
    a: "Honoré de Balzac",
    obra: "Papá Goriot, Honoré de Balzac",
    highlight: "La vejez moribunda, la alegre juventud encerrada.",
    lang: "es"
  },
  {
    t: "A fin de la primera semana del mes de diciembre recibió Rastignac dos cartas, una de su madre y otra de su hermana mayor, que le hicieron palpitar a la vez de alegría y de terror, porque aquellos frágiles papeles contenían un decreto de vida o de muerte para sus esperanzas. Sentía cierta desesperación recordando el apuro de sus parientes, pues conocía bien la predilección que le tenían, para no temer que hubiese aspirado su última gota de sangre.",
    a: "Honoré de Balzac",
    obra: "Papá Goriot, Honoré de Balzac",
    highlight: "Un decreto de vida o de muerte.",
    lang: "es"
  },
  {
    t: "La virtud, querido estudiante, no se divide: o es virtud o no lo es; es verdad que se nos habla de hacer penitencia de nuestras culpas, lo que es un lindo sistema; pero seducir a una mujer para subir en la escala social, arrojar la cizaña en una familia, y en fin todas las infamias que se cometen al lado de una chimenea, llevando por objeto el placer o el interés personal, ¿creéis que sean actos de fe, esperanza y caridad?",
    a: "Honoré de Balzac",
    obra: "Papá Goriot, Honoré de Balzac",
    highlight: "La virtud no se divide.",
    lang: "es"
  },
  {
    t: "Creéis que hay alguna cosa estable en este mundo? Despreciad pues a los hombres y ved las mallas del código por donde se pueda pasar, pues las grandes fortunas hechas sin causa aparente, es un crimen que se olvida, porque se comete con primor.",
    a: "Honoré de Balzac",
    obra: "Papá Goriot, Honoré de Balzac",
    highlight: "Un crimen que se olvida.",
    lang: "es"
  },
  {
    t: "Ser fiel a la virtud, es un martirio sublime. ¡Bah! todos creen en la virtud; pero ¿quién es virtuoso? Los pueblos idolatran la libertad; pero ¿dónde existe un pueblo libre? Mi juventud aún conserva la pureza de un cielo sin nubes; y querer ser grande o rico ¿no es resolverse a mentir, humillarse, arrastrarse, volverse a levantar, adular y disimular?",
    a: "Honoré de Balzac",
    obra: "Papá Goriot, Honoré de Balzac",
    highlight: "Querer ser grande o rico.",
    lang: "es"
  },
  {
    t: "Amo los caballos que las conducen, y quisiera ser el perrito que llevan en sus faldas: yo vivo de los placeres de ellas. Cada uno tiene su manera de amar, y la mía no haciendo mal a nadie ¿por qué el mundo se ha de ocupar de mí? Quiero ser feliz a mi modo. ¿Infrinjo las leyes por ir a verlas a tiempo que salen de sus casas para ir al baile? Y en efecto, querido caballero ¿qué soy yo sino un mal cadáver, cuya alma se encuentra donde están sus hijas?",
    a: "Honoré de Balzac",
    obra: "Papá Goriot, Honoré de Balzac",
    highlight: "Yo vivo de los placeres de ellas.",
    lang: "es"
  },
  {
    t: "—No vivirá dos días, tal vez dos horas, dijo el estudiante de medicina, y sin embargo no debemos cesar de combatir la enfermedad. Va a ser necesario suministrarle medicinas costosas, y yo no tengo un ochavo. He registrado sus bolsillos, sus armarios, y nada se encuentra: le he preguntado en un momento que parecía estar en su juicio, y me ha respondido que no tenía cantidad alguna. ¿Tú puedes disponer de algo?",
    a: "Honoré de Balzac",
    obra: "Papá Goriot, Honoré de Balzac",
    highlight: "No vivirá dos días.",
    lang: "es"
  },
  {
    t: "Esta fue toda la oración fúnebre de un ser que a los ojos de Eugenio, representaba toda la paternidad. Los quince huéspedes se pusieron a hablar como de costumbre, y cuando Eugenio y Bianchon acabaron de comer, el ruido de los tenedores y cucharas, las risas, las diversas expresiones de aquellas figuras glotonas e indiferentes, su insensibilidad, todo les horrorizaba.",
    a: "Honoré de Balzac",
    obra: "Papá Goriot, Honoré de Balzac",
    highlight: "Toda la oración fúnebre.",
    lang: "es"
  },
  {
    t: "Rastignac y Cristóbal fueron los únicos que acompañaron el carro que conducía al pobre hombre a San Esteban del Monte, iglesia poco distante de la calle Neuve-Sainte-Geneviève. Luego que llegaron se depositó el cuerpo en una capillita pobre y oscura, donde buscó vanamente el estudiante a las dos hijas del padre Goriot o a sus maridos. No asistió nadie más que él y Cristóbal, que se creía obligado a ello, por la propina que le había hecho ganar el difunto.",
    a: "Honoré de Balzac",
    obra: "Papá Goriot, Honoré de Balzac",
    highlight: "Buscó vanamente a las dos hijas.",
    lang: "es"
  },
  {
    t: "Los dos sacerdotes, el sacristán y el monacillo llegaron e hicieron lo que podían hacer por setenta francos, en una época en que la religión no es bastante rica para dar gratis sus oraciones. El clero cantó un salmo, el Libera y el De profundis, concluyéndose el oficio en veinte minutos.",
    a: "Honoré de Balzac",
    obra: "Papá Goriot, Honoré de Balzac",
    highlight: "La religión no es bastante rica.",
    lang: "es"
  },
  {
    t: `Cruzó los brazos y contempló las nubes. Cristóbal se marchó dejando solo a Rastignac, el cual dando algunos pasos hacia lo alto del cementerio, vio a París tortuosamente extendido a lo largo de las dos orillas del Sena, donde empezaban a brillar las luces. Sus ojos se detuvieron casi con ansia entre la columna de la plaza de Vendôme y la cúpula de los Inválidos, donde habitaba aquel hermoso mundo en que había querido penetrar; y echando sobre aquella susurrante colmena una mirada, que parecía castrarla con anticipación, pronunció esta palabra suprema.

—Ahora todo para los dos!`,
    a: "Honoré de Balzac",
    obra: "Papá Goriot, Honoré de Balzac",
    highlight: "Ahora todo para los dos.",
    lang: "es"
  }
];



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

const RABELAIS_QUOTES = [
  {
    t: `Amigos lectores que leéis este libro,
despojaos de toda prevención.
Y al leerlo no os escandalicéis:
no contiene mal ni infección.
Cierto es que aquí poca perfección
aprenderéis, salvo en materia de risa.
Otro argumento no puede elegir mi corazón,
viendo el duelo que os mina y consume:
mejor es escribir de risa que de lágrimas,
porque la risa es lo propio del hombre.`,
    a: "François Rabelais",
    obra: "Gargantúa, François Rabelais",
    highlight: "Mejor es escribir de risa que de lágrimas.",
    lang: "es"
  },
  {
    t: `No conviene estimar con tanta ligereza las obras humanas. Porque vosotros mismos decís que el hábito no hace al monje; y tal va vestido con hábito monacal que por dentro nada tiene de monje. Por eso hay que abrir el libro y pesar cuidadosamente lo que en él se desarrolla. Entonces conoceréis que la droga contenida dentro es de un valor muy distinto del que prometía la caja.`,
    a: "François Rabelais",
    obra: "Gargantúa, François Rabelais",
    highlight: "El hábito no hace al monje.",
    lang: "es"
  },
  {
    t: `No hay que quedarse ahí, como ante el canto de las sirenas, sino interpretar en sentido más alto lo que acaso creíais dicho por simple alegría de corazón. ¿Habéis visto alguna vez a un perro encontrando un hueso con tuétano? Es, como dice Platón, la bestia más filósofa del mundo: con qué devoción lo acecha, con qué cuidado lo guarda, con qué fervor lo sostiene, con qué prudencia lo abre, con qué afecto lo rompe y con qué diligencia lo chupa.`,
    a: "François Rabelais",
    obra: "Gargantúa, François Rabelais",
    highlight: "La bestia más filósofa del mundo.",
    lang: "es"
  },
  {
    t: `A ejemplo de ese perro, os conviene ser sabios para olfatear, sentir y estimar estos hermosos libros de alta sustancia, ligeros en la apariencia y audaces al encuentro. Después, mediante lectura curiosa y meditación frecuente, romped el hueso y chupad la sustantífica médula.`,
    a: "François Rabelais",
    obra: "Gargantúa, François Rabelais",
    highlight: "Romped el hueso y chupad la sustantífica médula.",
    lang: "es"
  },
  {
    t: `Toda su vida se ordenaba no por leyes, estatutos o reglas, sino según su voluntad y libre albedrío. Se levantaban de la cama cuando les parecía bien; bebían, comían, trabajaban y dormían cuando les venía el deseo. Nadie los despertaba, nadie los obligaba a beber, ni a comer, ni a hacer ninguna otra cosa. Así lo había establecido Gargantúa. En su regla no había más que esta cláusula: HAZ LO QUE QUIERAS.`,
    a: "François Rabelais",
    obra: "Gargantúa, François Rabelais",
    highlight: "Haz lo que quieras.",
    lang: "es"
  },
  {
    t: `Porque las gentes libres, bien nacidas, bien instruidas y que tratan en compañías honestas tienen por naturaleza un instinto y aguijón que siempre las empuja hacia actos virtuosos y las aparta del vicio; a eso lo llamaban honor.`,
    a: "François Rabelais",
    obra: "Gargantúa, François Rabelais",
    highlight: "A eso lo llamaban honor.",
    lang: "es"
  },
  {
    t: `Cuando son oprimidos y esclavizados por vil sujeción y coacción, desvían la noble inclinación por la que tendían libremente a las virtudes, para deponer y quebrantar ese yugo de servidumbre; porque siempre emprendemos las cosas prohibidas y codiciamos lo que se nos niega.`,
    a: "François Rabelais",
    obra: "Gargantúa, François Rabelais",
    highlight: "Codiciamos lo que se nos niega.",
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
].map(quote => ({ ...quote, type: "poem" }));

const BARTLEBY_TAGS = ["literatura", "soledad", "negativa", "oficina", "muro", "alienación", "clásicos"];

const BARTLEBY_QUOTES = [
  {
    t: `A la tercera llamada apareció Bartleby.

—Tome —le dije—, quiero que me ayude a revisar esta copia.

Bartleby permaneció inmóvil un instante, como si no hubiera oído. Después, con una voz singularmente suave y firme, respondió:

—Preferiría no hacerlo.`,
    a: "Herman Melville",
    obra: "Bartleby, el escribiente, Herman Melville",
    highlight: "Preferiría no hacerlo.",
    lang: "es"
  },
  {
    t: `Me quedé sentado, por un momento, en perfecto silencio. La respuesta era tan extraña, tan inesperada, dicha además sin la menor insolencia, que no supe si enfadarme o dudar de mis propios oídos.

—¿Preferiría no hacerlo? —repetí.

—Preferiría no hacerlo —contestó Bartleby.`,
    a: "Herman Melville",
    obra: "Bartleby, el escribiente, Herman Melville",
    highlight: "Preferiría no hacerlo.",
    lang: "es"
  },
  {
    t: `Si hubiera habido en su actitud algo de ira, de impaciencia o de desafío, lo habría despedido al instante. Pero no había nada de eso.

Bartleby estaba de pie, pálido, pulcro, respetuoso, abandonado.

Su misma mansedumbre me desarmaba.`,
    a: "Herman Melville",
    obra: "Bartleby, el escribiente, Herman Melville",
    highlight: "Su misma mansedumbre me desarmaba.",
    lang: "es"
  },
  {
    t: `Coloqué su mesa cerca de una pequeña ventana lateral. Desde allí no se veía el cielo ni la calle, sino únicamente un muro oscuro, alto, inmóvil.

Allí trabajaba Bartleby.

Primero por la mañana, todo el día, y el último por la noche: era un centinela perpetuo en su rincón.`,
    a: "Herman Melville",
    obra: "Bartleby, el escribiente, Herman Melville",
    highlight: "Era un centinela perpetuo en su rincón.",
    lang: "es"
  },
  {
    t: `A veces, cuando yo levantaba la vista, lo encontraba de pie junto a la ventana, sin escribir, sin leer, sin moverse.

No miraba nada vivo.

Se había abandonado a una de sus profundas ensoñaciones frente al muro muerto.`,
    a: "Herman Melville",
    obra: "Bartleby, el escribiente, Herman Melville",
    highlight: "Se había abandonado a una de sus profundas ensoñaciones frente al muro muerto.",
    lang: "es"
  },
  {
    t: `Pasaron los días. Bartleby ya no copiaba. Ya no revisaba. Ya no obedecía ninguna petición.

—¿Por qué no escribe? —le pregunté.

No hubo violencia en su respuesta, ni tristeza visible, ni justificación.

—He decidido no escribir más.`,
    a: "Herman Melville",
    obra: "Bartleby, el escribiente, Herman Melville",
    highlight: "He decidido no escribir más.",
    lang: "es"
  },
  {
    t: `—Bartleby —le dije—, ¿quiere decirme algo de usted? ¿De dónde viene? ¿Quién es? ¿Qué le ha traído aquí?

Él se retiró un poco más hacia su rincón, como si la pregunta lo hubiera tocado físicamente.

—Por ahora preferiría no dar ninguna respuesta.`,
    a: "Herman Melville",
    obra: "Bartleby, el escribiente, Herman Melville",
    highlight: "Por ahora preferiría no dar ninguna respuesta.",
    lang: "es"
  },
  {
    t: `Había intentado razonar con él, intimidarlo, compadecerlo, liberarme de él. Nada servía. Seguía allí, sereno, inmóvil, irreductible.

Entonces me pregunté, no sin cierto horror:

¿Qué debo hacer con este hombre, o más bien con este fantasma?`,
    a: "Herman Melville",
    obra: "Bartleby, el escribiente, Herman Melville",
    highlight: "¿Qué debo hacer con este hombre, o más bien con este fantasma?",
    lang: "es"
  },
  {
    t: `Al acercarnos todos a su espacio, Bartleby pareció ofendido, no con violencia, sino con una especie de dignidad herida.

Nos miró como si hubiéramos invadido una habitación interior.

—Preferiría que me dejaran solo aquí.`,
    a: "Herman Melville",
    obra: "Bartleby, el escribiente, Herman Melville",
    highlight: "Preferiría que me dejaran solo aquí.",
    lang: "es"
  },
  {
    t: `Le propuse otros trabajos, otros destinos, alguna salida posible. Un empleo en una tienda. Un puesto de mensajero. Cualquier ocupación que lo sacara de aquel rincón.

Bartleby no se alteró.

—No me gustaría nada de eso. No soy exigente, pero me gusta estar quieto.`,
    a: "Herman Melville",
    obra: "Bartleby, el escribiente, Herman Melville",
    highlight: "No soy exigente, pero me gusta estar quieto.",
    lang: "es"
  },
  {
    t: `—¿Quiere volver a copiar para alguien?

—No. Preferiría no hacer ningún cambio.

—¿Quiere viajar?

—No.

—¿Quiere ir a otra oficina?

Bartleby permaneció igual, como si cualquier forma de movimiento fuera una violencia.

—Preferiría no hacer ningún cambio.`,
    a: "Herman Melville",
    obra: "Bartleby, el escribiente, Herman Melville",
    highlight: "Preferiría no hacer ningún cambio.",
    lang: "es"
  },
  {
    t: `Lo encontré en el patio, rodeado de muros altos. No parecía más preso allí que en mi oficina. Quizá, pensé, siempre había vivido entre muros.

—Bartleby —le dije—, ¿me reconoce?

Él volvió lentamente la cabeza.

—Sé dónde estoy.`,
    a: "Herman Melville",
    obra: "Bartleby, el escribiente, Herman Melville",
    highlight: "Sé dónde estoy.",
    lang: "es"
  },
  {
    t: `El encargado le ofreció comida. Bartleby no la tomó. Tampoco hizo gesto alguno de desprecio; simplemente se apartó de ella, como si el alimento perteneciera a otro orden del mundo.

—Hoy preferiría no cenar. No estoy acostumbrado a las cenas.`,
    a: "Herman Melville",
    obra: "Bartleby, el escribiente, Herman Melville",
    highlight: "Hoy preferiría no cenar. No estoy acostumbrado a las cenas.",
    lang: "es"
  },
  {
    t: `Me acerqué después y lo vi tendido junto al muro, extrañamente quieto. Lo llamé. No respondió.

Entonces comprendí que Bartleby dormía de una manera definitiva.

Dormía con reyes y consejeros.`,
    a: "Herman Melville",
    obra: "Bartleby, el escribiente, Herman Melville",
    highlight: "Dormía con reyes y consejeros.",
    lang: "es"
  },
  {
    t: `Mucho después oí un rumor sobre él. Decían que había trabajado en la oficina de cartas muertas, cartas que nunca llegan a nadie, cartas enviadas a personas desaparecidas, mudadas, enterradas.

Pensé entonces en Bartleby.

Cartas muertas: ¿no suenan como hombres muertos?`,
    a: "Herman Melville",
    obra: "Bartleby, el escribiente, Herman Melville",
    highlight: "Cartas muertas: ¿no suenan como hombres muertos?",
    lang: "es"
  },
  {
    t: `A veces esas cartas llevaban dinero, perdón, esperanza, noticias de vida. Pero llegaban tarde. Sus destinatarios ya no estaban.

Enviadas con amor, con auxilio, con promesas, corrían hacia la nada.

¡Ah, Bartleby! ¡Ah, humanidad!`,
    a: "Herman Melville",
    obra: "Bartleby, el escribiente, Herman Melville",
    highlight: "¡Ah, Bartleby! ¡Ah, humanidad!",
    lang: "es"
  }
];

const CEREZAS_DEL_CEMENTERIO_QUOTES = [
  {
    t: `Desde el primer puente del buque contemplaba Félix la lenta ascensión de la luna, luna enorme, ancha y encendida como el llameante ruedo de un horno.

Y miraba con tan devoto recogimiento, que todo lo sentía en un santo remanso de silencio, todo quietecito y maravillado mientras emergía y se alzaba la roja luna.`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "Todo lo sentía en un santo remanso de silencio.",
    lang: "es"
  },
  {
    t: `Ya tarde, después de la comida, hicieron los tres un apartado grupo; y se asomaron a la noche para verse caminar sobre las aguas de luna.

La noche era inmensa, clara, de paz santísima, de inocencia de creación reciente.`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "La noche era inmensa, clara, de paz santísima.",
    lang: "es"
  },
  {
    t: `Ellas le vieron inmóvil, escultórico, lleno de luna. Y la señora, sonriéndole como a un hijo, murmuró:

—¡Cuán impresionable es usted!... ¿Félix? ¿Se llama usted Félix, verdad? ¡Deben emocionarle mucho los viajes!

—¡Oh, sí! Soy muy nervioso. Siempre creo que va a sucederme algo grande y... no me sucede nada; siempre estoy contento, y contento y todo... yo no sé qué tengo que siento el latido de mi corazón en toda mi carne y... lloraría.`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "Siempre creo que va a sucederme algo grande y no me sucede nada.",
    lang: "es"
  },
  {
    t: "Y esta noche, por serme ustedes desconocidas, y viéndolas entre ese bello misterio de velos y de luna, me traen la ilusión de la distancia, de lo remoto; se me figura que vamos muy lejos, muy lejos, sin acordarme de que llegaremos pasado mañana a nuestro pueblo, ni de que aquí cerca está paseando el señor Ripoll.",
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "Se me figura que vamos muy lejos, muy lejos.",
    lang: "es"
  },
  {
    t: `Félix siguió ardientemente:

—¡Yo siempre codicio estar donde no estoy! ¡Verdaderamente es dichoso el Señor estando en todas partes!... Pero cuando llego al sitio apetecido, no hallo toda la hermosura deseada, y es que lo que antes miraba lo dejo, lo pierdo acercándome.`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "Yo siempre codicio estar donde no estoy.",
    lang: "es"
  },
  {
    t: `Félix, tendiendo su brazo, exclamó:

—Ahora me impresionan esas torres blancas y solitarias lo mismo que me emocionó ayer este barco, mirado desde el muelle. Me parecía nave sagrada.

Pues ahora es la paz de los faros lo que me ilusiona y atrae, los faros que son pedazos de humanidad desamparada dentro del silencio de los cielos y de las aguas.`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "Los faros son pedazos de humanidad desamparada.",
    lang: "es"
  },
  {
    t: `Todo el barco sosegaba. Félix y doña Beatriz contemplaban la noche.

Lejos, las aguas se iban llenando de luna de color vieja y muy triste.

Se asomaron sobre la hélice que despedazaba al mar, dejándole un hondo rugido de espumas que parecían hechas de luciérnagas.`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "El mar dejaba un hondo rugido de espumas que parecían hechas de luciérnagas.",
    lang: "es"
  },
  {
    t: `—De frío, no. Temblé porque sin apurarme con tristezas o melancolías de poeta, que no soy, se me mezclan muy raros pensamientos.

En cada faceta de luz de las aguas miraba o se me aparecía un rostro, una cabeza de mujer ahogada... ¿No habrá sucedido aquí algún naufragio? ¿Verdad? ¡Se imagina, ve usted los náufragos tendidos entre el mar, mirándonos con ojos devorados, mirándonos!`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "En cada faceta de luz de las aguas miraba una cabeza de mujer ahogada.",
    lang: "es"
  },
  {
    t: `Y es que sentía en los profundos de su ánima la levadura del recuerdo de la silueta y de la voz de doña Beatriz, que le eran amigas a su corazón, y no lograba llegar al claro origen de este sentimiento.

Nada más descubría que el atraerse ahora de modo tan efusivo y repentino, sin tropezar en violencia ni sorpresa, vendría de la escondida virtud de esa amistad de antaño.`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "Le eran amigas a su corazón.",
    lang: "es"
  },
  {
    t: `Este primer día de reposo hogareño pareciole de demasiada lentitud; y, al confesárselo, se reconvenía y exaltaba por su sequedad de corazón.

¡Si es que sólo gustaba de hablar y saber de doña Beatriz y Julia; estaba hechizado, estaba poseído de la fragancia de sus palabras y de toda su hermosura!`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "Estoy hechizado, estoy poseído de la fragancia de sus palabras.",
    lang: "es"
  },
  {
    t: `Sentose Félix en un rubio sillón de mimbres, y doña Beatriz alzose y le enjugó la frente y los cabellos con su primoroso delantal de randas.

—¡Su cabeza es una tempestad de oro! —le dijo maternalmente.

Y Félix entornaba los ojos bajo la caricia del fino lenzuelo y de las manos de la hermosa señora, fragante de primavera.

—¡Doña Beatriz, usted no se perfuma como las demás mujeres; usted huele a naturaleza gloriosa, a mañana y a tarde de los huertos!...`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "Usted huele a naturaleza gloriosa.",
    lang: "es"
  },
  {
    t: `Julia era tan alta como la madre, pero más delgada, con palidez mística de novicia y donaires y alborozos de rapaza; su carne y su alma daban la sensación y fragancia de la fruta en agraz.

Beatriz era la fruta dorada que destila la primera lágrima de su miel.`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "Su carne y su alma daban la sensación y fragancia de la fruta en agraz.",
    lang: "es"
  },
  {
    t: `Su alma era como una delgada ánfora llena de melancolías, abierta por una mano invisible, y el encerrado vino de la cepa madre de la ilusión se vertía, mezclando su ranciedad, fuerte y dulcísima, entre la sangre y los nervios de Félix.

Imaginaba lo pasado y el mañana en bella esfumación de horizonte vago y callado de cuadro antiguo; y ya no se rio, no hizo burla de su quimera.`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "Su alma era como una delgada ánfora llena de melancolías.",
    lang: "es"
  },
  {
    t: `Muchas tardes os tuve a Julita y a ti juntos en mi regazo, mientras él me contaba sus andanzas, su nomadismo genial, sus juegos con la muerte...

Hablaba mucho de la muerte siendo él llama de amor y de vida. Como tú, la veía en el reflejo de la luna, dentro de los estanques y del mar, en las nubes de los ocasos, en las siluetas de las montañas y de los árboles.`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "Hablaba mucho de la muerte siendo él llama de amor y de vida.",
    lang: "es"
  },
  {
    t: `Entonces, Félix sintió un apresuramiento helado de su sangre y escuchó los pasos de otra vida, llegada del misterio, caminando encima de su alma.

¡Señor, él también padecía la visión de la muerte en los vivos...! Niños, viejos, mujeres placenteras, Julia, doña Beatriz, a todos se los representaba muertos, con las manos cruzadas sobre el vientre.`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "Padecía la visión de la muerte en los vivos.",
    lang: "es"
  },
  {
    t: `Los demás, ¡cuán distintos habían sido en vida y muerte!

Pedro, el primogénito, el heredero de «La Olmeda», adornado de raras virtudes, dejó, al morir, fragancia de santidad.

Luis, un químico audaz, hosco y sabio, se abrasó los ojos y las manos en su infernal estudio.

Y Guillermo, el predilecto de todos, corazón aventurero, ascua de ideales, acabó asesinado en misterioso y espantable lance de amor.`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "Corazón aventurero, ascua de ideales.",
    lang: "es"
  },
  {
    t: `Desde las abiertas ventanas estuvo Félix contemplando el jardín, dormido bajo cendales de luna.

Vino doña Beatriz, que había dejado la cena para cuidar del atavío de Julia y mirarla desde los balcones.

—¿Me perdona, «madrina», esta visita? La luna me ha sacado de casa, y me ha guiado hasta aquí como a un niñito de cuento que se pierde en medio de un bosque.`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "La luna me ha sacado de casa.",
    lang: "es"
  },
  {
    t: `Inmóviles, callados, contemplaban Beatriz y Félix la santa noche.

Creíanse subidos y asomados en la orilla de una estrella. Juzgábanse venturosos, y se sonreían con entristecimiento.

Se miraron, y vieron, dentro de sus retinas, luna, noche, inmensidad.`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "Creíanse subidos y asomados en la orilla de una estrella.",
    lang: "es"
  },
  {
    t: `Los ojos de la señora recorrieron la dorada cabeza del hombre. Y de súbito se conmovió de dichoso y amargo desfallecimiento.

Había sentido humedad y brasa de labios. Pareciole besado todo su cuerpo.

Y fue esforzada: suavemente retiró su brazo de la caricia. Alzó los ojos y balbució:

—¡Qué altos, qué cerca del cielo! ¡Como si el cielo fuese un mar que nos sorbiera!`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "Como si el cielo fuese un mar que nos sorbiera.",
    lang: "es"
  },
  {
    t: `Abrió las vidrieras, y apareció religiosamente la azulada palidez del espacio.

Los fastuosos colores que vestían a la mujer se deshicieron, y quedó vestida de luz y blancura nupcial.

Entonces los brazos de Félix la ciñeron. Pareciole que estaban en el templo solitario de un astro, alumbrado suavemente para ellos.

Y tuvo la divina sensación de que abrazaba un alma desnuda, alma hecha de luna y de jazmines.`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "Abrazaba un alma desnuda, alma hecha de luna y de jazmines.",
    lang: "es"
  },
  {
    t: `Extenuados y delirantes, se reclinaron sobre los amplios asientos de seda. Un rayo lunar los envolvía...

Toda la honda y clara noche fue lámpara y estrado de su amor.`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "Toda la honda y clara noche fue lámpara y estrado de su amor.",
    lang: "es"
  },
  {
    t: `Después, al levantarse, todavía abrazados, vieron una nube blanca y resplandeciente de figura de Ángel terrible como el que arrojó a Adán y Eva del Paraíso.

Y los dos sollozaron.

—¡Madrina mía! ¡Beatriz!

Salieron, y se besaron castamente delante de toda la tierra y de todo el cielo, y delante del Ángel que se desvaneció entre nieblas y luna.`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "Los dos sollozaron.",
    lang: "es"
  },
  {
    t: `Y doña Beatriz le hablaba y le miraba como antes, como su «madrina», sin que sus ojos, su sonrisa, su palabra descubriesen y recordasen a la mujer poseída, a la amante sabida en todos los deliciosos misterios.

Y Félix, que, viéndola al lado de la hija, tuvo miedo de creerla descendida, desvelada porque la conociera en su secreto de excelsitud y pecado, comprendió entonces cuan inagotable es Amor.`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "Cuán inagotable es Amor.",
    lang: "es"
  },
  {
    t: `Ésta era la adorable y gustosa reliquia que ahora tocaba con ardimiento y voluptuoso fetichismo.

Y, al contemplarla y besarla mucho, notó que sabía a pan viejo, y que la menuda y perfumada huella de los blanquísimos dientes estaba ya seca y rugosa.

Y entonces se cumplieron en Félix los avisos del abrasado carmelita Juan de la Cruz, y probó los malos dejos del apetito satisfecho.

Pesadez de hartura y comezón de hambre tejían su mal.`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "Pesadez de hartura y comezón de hambre tejían su mal.",
    lang: "es"
  },
  {
    t: `¡Cuánta lástima florecía en el corazón de Félix mirando a la mujer desventurada!

Que así la juzgaba fingiéndose el constante suplicio de la beldad triste y lacia.

Y como todo sentimiento, hasta el de la compasión, tenía en Félix algo de voluptuosidad por lo intensísimo, se conmovió de alegría, de la generosa alegría que Adath dice a Lucifer: «El goce de esparcir la alegría, de comunicarla a los otros»; y quiso mitigar, alborozar, siquiera en el breve discurso del viaje, esas dos vidas hundidas en el hastío de la nada de emociones.`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "Dos vidas hundidas en el hastío de la nada de emociones.",
    lang: "es"
  },
  {
    t: `El camino era largo y estaba arbolado. Lejos, las anchas copas de los olmos subían y se cerraban en bóveda negral.

Llegaban las huertas hasta las orillas de la calzada, y el manso aire llevaba un grato olor de hierba recién segada, de establos calientes y mieses espesas y maduras.

La quietud y suavidad del crepúsculo, la campesina fragancia, la santa y alada sinfonía de los campanarios que tañían el Ángelus, todo emblandeció a Félix.`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "La quietud y suavidad del crepúsculo todo emblandeció a Félix.",
    lang: "es"
  },
  {
    t: `Cerca del asiento de la portera comenzó a removerse una tortuga.

Félix quiso verla. Y la mujer se la mostró, murmurando:

—Es mi compaña. ¡Ella y los señores me quedan en el mundo!

Arriba sonaban puertas y rumor de voces.`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "Es mi compaña. Ella y los señores me quedan en el mundo.",
    lang: "es"
  },
  {
    t: `De nuevo contemplábala Félix: veía las trenzas de sus cabellos recogidos, subidos en peinado de señorita; reparaba en su larga falda, por cuya fimbria salían descuidadamente dos zapatitos rubios.

Halláronse sus miradas; sorprendió la doncella la fina sonrisa de su primo; examinose toda y recató sus pies.

Y ahora vio Félix que asomaba la mujer en los ojos de su prima, y que se le alejaba, se hacía misteriosa; y advirtió toda la transfiguración de la carne y del alma de la amiga de su mocedad.`,
    a: "Gabriel Miró",
    obra: "Las cerezas del cementerio, Gabriel Miró",
    highlight: "Asomaba la mujer en los ojos de su prima.",
    lang: "es"
  }
];

const NIEBLA_QUOTES = [
  {
    t: `Al aparecer Augusto a la puerta de su casa extendió el brazo derecho, con la mano palma abajo y abierta, y dirigiendo los ojos al cielo quedóse un momento parado en esta actitud estatuaria y augusta.

No era que tomaba posesión del mundo exterior, sino era que observaba si llovía.

Y al recibir en el dorso de la mano el frescor del lento orvallo frunció el sobrecejo.

Y no era tampoco que le molestase la llovizna, sino el tener que abrir el paraguas.`,
    a: "Miguel de Unamuno",
    obra: "Niebla, Miguel de Unamuno",
    highlight: "No era que tomaba posesión del mundo exterior, sino era que observaba si llovía.",
    lang: "es"
  },
  {
    t: `¡Estaba tan elegante, tan esbelto, plegado y dentro de su funda!

Un paraguas cerrado es tan elegante como es feo un paraguas abierto.

«Es una desgracia esto de tener que servirse uno de las cosas —pensó Augusto—; tener que usarlas. El uso estropea y hasta destruye toda belleza.»`,
    a: "Miguel de Unamuno",
    obra: "Niebla, Miguel de Unamuno",
    highlight: "El uso estropea y hasta destruye toda belleza.",
    lang: "es"
  },
  {
    t: `Abrió el paraguas por fin y se quedó un momento suspenso y pensando:

«Y ahora, ¿hacia dónde voy? ¿Tiro a la derecha o a la izquierda?»

Porque Augusto no era un caminante, sino un paseante de la vida.

«Esperaré a que pase un perro —se dijo— y tomaré la dirección inicial que él tome.»

En esto pasó por la calle no un perro, sino una garrida moza, y tras de sus ojos se fue, como imantado y sin darse de ello cuenta, Augusto.

Y así una calle y otra y otra.`,
    a: "Miguel de Unamuno",
    obra: "Niebla, Miguel de Unamuno",
    highlight: "Augusto no era un caminante, sino un paseante de la vida.",
    lang: "es"
  },
  {
    t: `¿Y quién es Eugenia?

Ah, caigo en la cuenta de que hace tiempo la andaba buscando.

Y mientras yo la buscaba ella me ha salido al paso.

¿No es esto acaso encontrar algo?

Cuando uno descubre una aparición que buscaba, ¿no es que la aparición, compadecida de su busca, se le viene al encuentro?`,
    a: "Miguel de Unamuno",
    obra: "Niebla, Miguel de Unamuno",
    highlight: "Mientras yo la buscaba ella me ha salido al paso.",
    lang: "es"
  },
  {
    t: `—¿Y por qué te llamas Domingo?

—Porque así me llaman.

«Bien, muy bien —se dijo Augusto—; nos llamamos como nos llaman.

En los tiempos homéricos tenían las personas y las cosas dos nombres, el que les daban los hombres y el que les daban los dioses.

¿Cómo me llamará Dios?»`,
    a: "Miguel de Unamuno",
    obra: "Niebla, Miguel de Unamuno",
    highlight: "Nos llamamos como nos llaman.",
    lang: "es"
  },
  {
    t: `Tomó la pluma y se puso a escribir:

«Señorita: Esta misma mañana, bajo la dulce llovizna del cielo, cruzó usted, aparición fortuita, por delante de la puerta de la casa donde aún vivo y ya no tengo hogar.

Me habían llevado allí sus ojos, sus ojos, que son refulgentes estrellas mellizas en la nebulosa de mi mundo.

Perdóneme, Eugenia, y deje que le dé familiarmente este dulce nombre; perdóneme la lírica.

Yo vivo en perpetua lírica infinitesimal.»`,
    a: "Miguel de Unamuno",
    obra: "Niebla, Miguel de Unamuno",
    highlight: "Yo vivo en perpetua lírica infinitesimal.",
    lang: "es"
  },
  {
    t: `«¡Enamorado yo! ¡Yo enamorado! ¡Quién había de decirlo...!

Tal vez mi amor ha precedido a su objeto.

Es más, es este amor el que lo ha suscitado, el que lo ha extraído de la niebla de la creación.»`,
    a: "Miguel de Unamuno",
    obra: "Niebla, Miguel de Unamuno",
    highlight: "Tal vez mi amor ha precedido a su objeto.",
    lang: "es"
  },
  {
    t: `«¿Y cómo me he enamorado si en rigor no puedo decir que la conozco?

Bah, el conocimiento vendrá después.

El amor precede al conocimiento, y éste mata a aquél.

Conocer es perdonar, dicen.

No, perdonar es conocer.

Primero el amor, el conocimiento después.»`,
    a: "Miguel de Unamuno",
    obra: "Niebla, Miguel de Unamuno",
    highlight: "El amor precede al conocimiento, y éste mata a aquél.",
    lang: "es"
  },
  {
    t: `«¿Y para amar algo, qué basta?

¡Vislumbrarlo!

El vislumbre; he aquí la intuición amorosa, el vislumbre en la niebla.

Luego viene el precisarse, la visión perfecta, el resolverse la niebla en gotas de agua o en granizo, o en nieve, o en piedra.

La ciencia es una pedrea.»`,
    a: "Miguel de Unamuno",
    obra: "Niebla, Miguel de Unamuno",
    highlight: "El vislumbre; he aquí la intuición amorosa, el vislumbre en la niebla.",
    lang: "es"
  },
  {
    t: `«¡No, no, niebla, niebla!

¡Quién fuera águila para pasearse por los senos de las nubes!

Y ver al sol a través de ellas, como lumbre nebulosa también.»`,
    a: "Miguel de Unamuno",
    obra: "Niebla, Miguel de Unamuno",
    highlight: "¡No, no, niebla, niebla!",
    lang: "es"
  },
  {
    t: `«¿Sabes lo que es dar un paso decisivo?

Los vientos de la fortuna nos empujan y nuestros pasos son decisivos todos.

¿Nuestros? ¿Son nuestros esos pasos?

Caminamos, Orfeo mío, por una selva enmarañada y bravía, sin senderos.

El sendero nos lo hacemos con los pies según caminamos a la ventura.»`,
    a: "Miguel de Unamuno",
    obra: "Niebla, Miguel de Unamuno",
    highlight: "El sendero nos lo hacemos con los pies según caminamos a la ventura.",
    lang: "es"
  },
  {
    t: `«¿De dónde ha brotado Eugenia?

¿Es ella una creación mía o soy creación suya yo?

¿O somos los dos creaciones mutuas, ella de mí y yo de ella?

¿No es acaso todo creación de cada cosa y cada cosa creación de todo?

¿Y qué es creación?

¿Qué eres tú, Orfeo?

¿Qué soy yo?»`,
    a: "Miguel de Unamuno",
    obra: "Niebla, Miguel de Unamuno",
    highlight: "¿Es ella una creación mía o soy creación suya yo?",
    lang: "es"
  },
  {
    t: `«Muchas veces se me ha ocurrido pensar, Orfeo, que yo no soy, e iba por la calle antojándoseme que los demás no me veían.

Y otras veces he fantaseado que no me veían como me veía yo, y que mientras yo me creía ir formalmente, con toda compostura, estaba, sin saberlo, haciendo el payaso, y los demás riéndose y burlándose de mí.»`,
    a: "Miguel de Unamuno",
    obra: "Niebla, Miguel de Unamuno",
    highlight: "Muchas veces se me ha ocurrido pensar, Orfeo, que yo no soy.",
    lang: "es"
  },
  {
    t: `«¡Qué vida ésta, Orfeo, qué vida, sobre todo desde que murió mi madre!

Cada hora me llega empujada por las horas que le precedieron; no he conocido el porvenir.

Y ahora que empiezo a vislumbrarlo me parece se me va a convertir en pasado.

Eugenia es ya casi un recuerdo para mí.

Estos días que pasan... este día, este eterno día que pasa... deslizándose en niebla de aburrimiento.

Hoy como ayer, mañana como hoy.»`,
    a: "Miguel de Unamuno",
    obra: "Niebla, Miguel de Unamuno",
    highlight: "Este día, este eterno día que pasa... deslizándose en niebla de aburrimiento.",
    lang: "es"
  },
  {
    t: `«Y ahora me brillan en el cielo de mi soledad los dos ojos de Eugenia.

Me brillan con el resplandor de las lágrimas de mi madre.

Y me hacen creer que existo, ¡dulce ilusión!

Amo, ergo sum.»`,
    a: "Miguel de Unamuno",
    obra: "Niebla, Miguel de Unamuno",
    highlight: "Amo, ergo sum.",
    lang: "es"
  },
  {
    t: `«Este amor, Orfeo, es como lluvia bienhechora en que se deshace y concreta la niebla de la existencia.

Gracias al amor siento al alma de bulto, la toco.

Empieza a dolerme en su cogollo mismo el alma, gracias al amor, Orfeo.

Y el alma misma ¿qué es sino amor, sino dolor encarnado?»`,
    a: "Miguel de Unamuno",
    obra: "Niebla, Miguel de Unamuno",
    highlight: "El alma misma ¿qué es sino amor, sino dolor encarnado?",
    lang: "es"
  },
  {
    t: `«Vienen los días y van los días y el amor queda.

Allá dentro, muy dentro, en las entrañas de las cosas se rozan y friegan la corriente de este mundo con la contraria corriente del otro.

Y de este roce y friega viene el más triste y el más dulce de los dolores: el de vivir.»`,
    a: "Miguel de Unamuno",
    obra: "Niebla, Miguel de Unamuno",
    highlight: "El más triste y el más dulce de los dolores: el de vivir.",
    lang: "es"
  },
  {
    t: `Parecíale respirar oscuridad, olor a vejez, a tradición sahumada en incienso, a hogar de siglos.

Cerró los ojos y volvió a soñar aquella casa dulce y tibia, en que la luz entraba por entre las blancas flores bordadas en los visillos.

Volvió a ver a su madre, yendo y viniendo sin ruido, siempre de negro, con aquella su sonrisa que era poso de lágrimas.`,
    a: "Miguel de Unamuno",
    obra: "Niebla, Miguel de Unamuno",
    highlight: "Volvió a ver a su madre, yendo y viniendo sin ruido, siempre de negro.",
    lang: "es"
  },
  {
    t: `—¡Don Avito! —exclamó Augusto.

—¡El mismo, Augustito, el mismo!

—Pero ¿usted por aquí?

—Sí, yo por aquí; enseña mucho la vida, y más la muerte; enseñan más, mucho más que la ciencia.`,
    a: "Miguel de Unamuno",
    obra: "Niebla, Miguel de Unamuno",
    highlight: "Enseña mucho la vida, y más la muerte.",
    lang: "es"
  },
  {
    t: `—Sí, Augusto, sí —prosiguió don Avito—; la vida es la única maestra de la vida; no hay pedagogía que valga.

Sólo se aprende a vivir viviendo, y cada hombre tiene que recomenzar el aprendizaje de la vida de nuevo.`,
    a: "Miguel de Unamuno",
    obra: "Niebla, Miguel de Unamuno",
    highlight: "Sólo se aprende a vivir viviendo.",
    lang: "es"
  }
];

const CANAS_Y_BARRO_QUOTES = [
  {
    t: "Afluían las mujeres al canal, semejante á una calle de Venecia, con las márgenes cubiertas de barracas y viveros donde los pescadores guardaban las anguilas. En el agua muerta, de una brillantez de estaño, permanecía inmóvil la barca-correo: un gran ataúd cargado de personas y paquetes, con la borda casi á flor de agua.",
    a: "Vicente Blasco Ibáñez",
    obra: "Cañas y barro, Vicente Blasco Ibáñez",
    highlight: "En el agua muerta, de una brillantez de estaño, permanecía inmóvil la barca-correo.",
    lang: "es"
  },
  {
    t: "Entró á empujones, sin que la masa egoísta le abriera paso, y no encontrando sitio se deslizó entre las piernas de los pasajeros, tendiéndose en el fondo, con el rostro pegado á las alpargatas sucias y los zapatos llenos de barro, en un ambiente nauseabundo. La gente parecía acostumbrada á estas escenas. Aquella embarcación servía para todo; era el vehículo de la comida, del hospital y del cementerio.",
    a: "Vicente Blasco Ibáñez",
    obra: "Cañas y barro, Vicente Blasco Ibáñez",
    highlight: "Aquella embarcación servía para todo; era el vehículo de la comida, del hospital y del cementerio.",
    lang: "es"
  },
  {
    t: "Los altos ribazos ocultaban la red de canales, las anchas _carreras_ por donde navegaban los barcos de vela cargados de arroz. Sus cascos permanecían invisibles y las grandes velas triangulares se deslizaban sobre el verde de los campos, en el silencio de la tarde, como fantasmas que caminasen en tierra firme.",
    a: "Vicente Blasco Ibáñez",
    obra: "Cañas y barro, Vicente Blasco Ibáñez",
    highlight: "Las grandes velas triangulares se deslizaban sobre el verde de los campos, en el silencio de la tarde, como fantasmas que caminasen en tierra firme.",
    lang: "es"
  },
  {
    t: "Era el _lluent_, la verdadera Albufera, el lago libre, con sus bosquecillos de cañas esparcidos á grandes distancias, donde se refugiaban las aves del lago, tan perseguidas por los cazadores de la ciudad.",
    a: "Vicente Blasco Ibáñez",
    obra: "Cañas y barro, Vicente Blasco Ibáñez",
    highlight: "Era el _lluent_, la verdadera Albufera, el lago libre.",
    lang: "es"
  },
  {
    t: `Ya estaban en la verdadera Albufera, en el inmenso _lluent_, azul y terso como un espejo veneciano, que retrataba invertidos los barcos y las lejanas orillas con el contorno ligeramente serpenteado.

Las nubes parecían rodar por el fondo del lago como vedijas de blanca lana; en la playa de la Dehesa unos cazadores seguidos de perros duplicaban su imagen en el agua, andando cabeza abajo.`,
    a: "Vicente Blasco Ibáñez",
    obra: "Cañas y barro, Vicente Blasco Ibáñez",
    highlight: "Las nubes parecían rodar por el fondo del lago como vedijas de blanca lana.",
    lang: "es"
  },
  {
    t: "La barca deslizábase á lo largo de la Dehesa y pasaban rápidamente ante ella las colinas areniscas, con las chozas de los guardas en su cumbre; las espesas cortinas de matorrales; los grupos de pinos retorcidos, de formas terroríficas, como manojos de miembros torturados.",
    a: "Vicente Blasco Ibáñez",
    obra: "Cañas y barro, Vicente Blasco Ibáñez",
    highlight: "Los grupos de pinos retorcidos, de formas terroríficas, como manojos de miembros torturados.",
    lang: "es"
  },
  {
    t: "Era milagroso que no apareciera su cadáver en el fondo de un canal después de tantos viajes á pie, por el lago, en plena embriaguez, siguiendo las lindes de los arrozales, estrechas como un filo de hacha, atravesando los portillos de las acequias con agua al pecho y pasando por lugares de barro movedizo donde nadie osaba aventurarse como no fuese en barca. La Albufera era su casa.",
    a: "Vicente Blasco Ibáñez",
    obra: "Cañas y barro, Vicente Blasco Ibáñez",
    highlight: "La Albufera era su casa.",
    lang: "es"
  },
  {
    t: "Y los dos hicieron un viaje á la ciudad, trayendo de allá una niña de seis años, una bestezuela tímida, arisca y fea, que sacaron de la casa de expósitos. Se llamaba Visanteta; pero todos, para que no olvidase su origen, con esa crueldad inconsciente de la incultura popular, la llamaron la _Borda_.",
    a: "Vicente Blasco Ibáñez",
    obra: "Cañas y barro, Vicente Blasco Ibáñez",
    highlight: "Con esa crueldad inconsciente de la incultura popular, la llamaron la _Borda_.",
    lang: "es"
  },
  {
    t: "Y tranquilo por la posesión de Neleta, que crecía en la miseria como una flor rara, contrastando su hermosura con la pobreza física de las otras hijas del Palmar, no la atendía gran cosa, y la trataba con la misma confianza que si ya fuesen esposos.",
    a: "Vicente Blasco Ibáñez",
    obra: "Cañas y barro, Vicente Blasco Ibáñez",
    highlight: "Neleta, que crecía en la miseria como una flor rara.",
    lang: "es"
  },
  {
    t: `Los dos barquitos entraron en un callejón de agua entre los altos carrizos. La anea crecía á manojos entre los _senills_; las cañas se confundían con los juncos, y las plantas trepadoras, con sus campanillas blancas y azules, se enredaban en esta selva acuática formando guirnaldas.

En el callejón, el agua mostraba en su fondo extrañas vegetaciones que subían hasta la superficie, no sabiéndose en ciertos momentos si navegaban los barquitos ó se arrastraban sobre campos verdosos cubiertos por un débil cristal.`,
    a: "Vicente Blasco Ibáñez",
    obra: "Cañas y barro, Vicente Blasco Ibáñez",
    highlight: "Esta selva acuática formando guirnaldas.",
    lang: "es"
  }
];

const ORLANDO_QUOTES = [
  {
    t: "Estaba describiendo, como todos los jóvenes poetas describen siempre, la naturaleza, y para igualar con precisión el matiz del verde miró —y en esto mostró más audacia que la mayoría— la cosa misma, que resultó ser un laurel que crecía bajo la ventana. Después de eso, por supuesto, no pudo escribir más. El verde en la naturaleza es una cosa; el verde en la literatura, otra. La naturaleza y las letras parecen tener una antipatía natural: si se las junta, se hacen pedazos la una a la otra.",
    a: "Virginia Woolf",
    obra: "Orlando, Virginia Woolf",
    highlight: "La naturaleza y las letras parecen tener una antipatía natural.",
    lang: "es"
  },
  {
    t: "Le gustaba, bajo toda aquella transitoriedad del verano, sentir bajo él la espina dorsal de la tierra; pues eso creía que era la dura raíz del roble. O, como una imagen seguía a otra, era el lomo de un gran caballo que cabalgaba; o la cubierta de un barco que se bamboleaba: era cualquier cosa, en realidad, con tal de que fuese dura, porque sentía la necesidad de algo a lo que pudiera sujetar su corazón flotante; el corazón que tiraba de su costado; el corazón que parecía llenarse de ráfagas especiadas y amorosas cada atardecer, a esa hora en que salía a caminar.",
    a: "Virginia Woolf",
    obra: "Orlando, Virginia Woolf",
    highlight: "Sentir bajo él la espina dorsal de la tierra.",
    lang: "es"
  },
  {
    t: "Acababa, en efecto, de juntar los pies hacia las seis de la tarde del siete de enero, al final de una cuadrilla o minueto semejante, cuando vio salir del pabellón de la Embajada Moscovita una figura que, fuera de muchacho o de mujer —pues la túnica suelta y los pantalones de la moda rusa servían para disfrazar el sexo—, lo llenó de la más alta curiosidad. La persona, cualquiera que fuese su nombre o sexo, era de estatura mediana, muy esbelta, y vestía enteramente de terciopelo color ostra, guarnecido con una piel verdosa desconocida. Pero esos detalles quedaban oscurecidos por la extraordinaria seducción que emanaba de toda su persona.",
    a: "Virginia Woolf",
    obra: "Orlando, Virginia Woolf",
    highlight: "Una figura que, fuera de muchacho o de mujer, lo llenó de la más alta curiosidad.",
    lang: "es"
  },
  {
    t: "Imágenes, metáforas de lo más extremo y extravagante, se enroscaban y retorcían en su mente. La llamó melón, piña, olivo, esmeralda y zorro en la nieve, todo en el espacio de tres segundos; no sabía si la había oído, saboreado, visto, o las tres cosas a la vez.",
    a: "Virginia Woolf",
    obra: "Orlando, Virginia Woolf",
    highlight: "No sabía si la había oído, saboreado, visto, o las tres cosas a la vez.",
    lang: "es"
  },
  {
    t: "Porque en todo lo que decía, por abierta y voluptuosa que pareciera, había algo escondido; en todo lo que hacía, por audaz que fuese, había algo oculto. Así parece escondida la llama verde en la esmeralda, o el sol aprisionado en una colina. La claridad era solo exterior; dentro había una llama errante. Iba y venía; nunca brillaba con el rayo constante de una inglesa. Aquí, sin embargo, al recordar a lady Margaret y sus enaguas, Orlando se desbocó en sus transportes y la arrastró sobre el hielo, más rápido, más rápido, jurando que perseguiría la llama, se zambulliría por la gema, y así sucesivamente, mientras las palabras le salían entre jadeos, con la pasión de un poeta cuya poesía ha sido medio exprimida por el dolor.",
    a: "Virginia Woolf",
    obra: "Orlando, Virginia Woolf",
    highlight: "La claridad era solo exterior; dentro había una llama errante.",
    lang: "es"
  },
  {
    t: "Pero la sexta campanada se desvaneció, y llegó la séptima, y luego la octava, y a su mente aprensiva le parecieron notas que primero anunciaban y después proclamaban muerte y desastre. Cuando sonó la duodécima, supo que su destino estaba sellado. Era inútil que la parte racional de él razonara: ella podía llegar tarde; podía haber sido detenida; podía haberse perdido. El corazón apasionado y sensible de Orlando sabía la verdad.",
    a: "Virginia Woolf",
    obra: "Orlando, Virginia Woolf",
    highlight: "El corazón apasionado y sensible de Orlando sabía la verdad.",
    lang: "es"
  },
  {
    t: "Donde durante tres meses y más había habido hielo sólido, de tal espesor que parecía permanente como la piedra, y toda una ciudad alegre se había alzado sobre su pavimento, ahora corría una carrera de aguas amarillas y turbulentas. El río había ganado su libertad durante la noche. Era como si una fuente sulfurosa —opinión a la que se inclinaban muchos filósofos— hubiese brotado de las regiones volcánicas subterráneas y hecho estallar el hielo con tal vehemencia que dispersó furiosamente sus enormes y macizos fragmentos. Bastaba mirar el agua para sentirse mareado. Todo era tumulto y confusión. El río estaba sembrado de icebergs.",
    a: "Virginia Woolf",
    obra: "Orlando, Virginia Woolf",
    highlight: "El río había ganado su libertad durante la noche.",
    lang: "es"
  },
  {
    t: "El gusto por los libros le vino temprano. De niño, a veces un paje lo encontraba a medianoche todavía leyendo. Le quitaron la vela, y él crió luciérnagas para que le sirvieran a ese propósito. Le quitaron las luciérnagas, y casi incendió la casa con yesca.",
    a: "Virginia Woolf",
    obra: "Orlando, Virginia Woolf",
    highlight: "El gusto por los libros le vino temprano.",
    lang: "es"
  },
  {
    t: "Un caballero apuesto como él, decían, no necesitaba libros. Que dejara los libros, decían, a los tullidos y a los moribundos. Pero algo peor estaba por venir. Pues una vez que el mal de leer se apodera del organismo, lo debilita y lo convierte en presa fácil de ese otro azote que habita en el tintero y supura en la pluma. El miserable se pone a escribir.",
    a: "Virginia Woolf",
    obra: "Orlando, Virginia Woolf",
    highlight: "Una vez que el mal de leer se apodera del organismo, lo deja expuesto al azote de escribir.",
    lang: "es"
  },
  {
    t: "La memoria es costurera, y caprichosa además. La memoria pasa la aguja hacia dentro y hacia fuera, arriba y abajo, de aquí para allá. No sabemos qué viene después, ni qué sigue a continuación. Así, el movimiento más ordinario del mundo, como sentarse a una mesa y acercarse el tintero, puede agitar mil fragmentos extraños y desconectados, ahora brillantes, ahora apagados, colgando, bamboleándose, hundiéndose y ostentándose, como la ropa interior de una familia de catorce miembros tendida en una cuerda durante un vendaval. En lugar de ser una pieza única, franca, directa, robusta, de la que ningún hombre tenga que avergonzarse, nuestros actos más comunes están rodeados de un aleteo y un parpadeo de alas, de una subida y bajada de luces.",
    a: "Virginia Woolf",
    obra: "Orlando, Virginia Woolf",
    highlight: "La memoria es costurera, y caprichosa además.",
    lang: "es"
  },
  {
    t: "El sonido de las trompetas se extinguió y Orlando quedó de pie, completamente desnudo. Ningún ser humano, desde que empezó el mundo, ha parecido jamás más arrebatador. Su forma reunía en una sola la fuerza de un hombre y la gracia de una mujer. Mientras permanecía allí, las trompetas de plata prolongaron su nota, como si les costara abandonar la hermosa visión que su toque había convocado; y Castidad, Pureza y Modestia, inspiradas sin duda por la Curiosidad, se asomaron a la puerta y arrojaron una prenda semejante a una toalla sobre la figura desnuda, que por desgracia quedó varios centímetros corta. Orlando se miró de arriba abajo en un largo espejo sin mostrar señal alguna de turbación y fue, presumiblemente, a tomar su baño. Podemos aprovechar esta pausa en la narración para hacer ciertas afirmaciones. Orlando se había convertido en mujer; no hay manera de negarlo.",
    a: "Virginia Woolf",
    obra: "Orlando, Virginia Woolf",
    highlight: "Orlando se miró de arriba abajo en un largo espejo sin mostrar señal alguna de turbación.",
    lang: "es"
  },
  {
    t: "Orlando se había convertido en mujer; no hay manera de negarlo. Pero en todos los demás aspectos, Orlando seguía siendo precisamente el mismo. El cambio de sexo, aunque alteró su futuro, no alteró en absoluto su identidad.",
    a: "Virginia Woolf",
    obra: "Orlando, Virginia Woolf",
    highlight: "El cambio de sexo no alteró en absoluto su identidad.",
    lang: "es"
  },
  {
    t: "El placer de no tener documentos que sellar ni firmar, ni rúbricas que trazar, ni visitas que pagar, era suficiente. Los gitanos seguían la hierba; cuando quedaba rasurada, se trasladaban de nuevo. Ella se lavaba en los arroyos, si es que se lavaba; no le presentaban cajas rojas, azules o verdes; no había una llave, ni mucho menos una llave de oro, en todo el campamento; en cuanto a “hacer visitas”, la palabra era desconocida.",
    a: "Virginia Woolf",
    obra: "Orlando, Virginia Woolf",
    highlight: "El placer de no tener documentos que sellar ni firmar era suficiente.",
    lang: "es"
  },
  {
    t: "Se estaba volviendo un poco más modesta, como suelen serlo las mujeres, respecto a su inteligencia, y un poco más vanidosa, como suelen serlo las mujeres, respecto a su persona. Ciertas susceptibilidades se estaban afirmando y otras disminuían. El cambio de ropa, dirán algunos filósofos, tuvo mucho que ver con ello. Fruslerías vanas como parecen, las ropas tienen, dicen, funciones más importantes que la de mantenernos calientes. Cambian nuestra visión del mundo y la visión que el mundo tiene de nosotros.",
    a: "Virginia Woolf",
    obra: "Orlando, Virginia Woolf",
    highlight: "La ropa cambia nuestra visión del mundo y la visión que el mundo tiene de nosotros.",
    lang: "es"
  },
  {
    t: "Orlando hizo una reverencia; accedió; halagó los humores del buen hombre como no lo habría hecho si sus pulcros calzones hubieran sido faldas de mujer y su chaqueta trenzada un corpiño de satén femenino. Así, hay mucho que sostiene la opinión de que es la ropa la que nos lleva a nosotros, y no nosotros a ella; podemos hacer que tome el molde del brazo o del pecho, pero ella moldea nuestros corazones, nuestros cerebros y nuestras lenguas a su gusto.",
    a: "Virginia Woolf",
    obra: "Orlando, Virginia Woolf",
    highlight: "Es la ropa la que nos lleva a nosotros, y no nosotros a ella.",
    lang: "es"
  },
  {
    t: "Aunque los sexos sean distintos, se entremezclan. En todo ser humano se produce una vacilación de un sexo al otro, y a menudo solo la ropa conserva la apariencia masculina o femenina, mientras que por debajo el sexo es exactamente lo contrario de lo que parece por encima. Todo el mundo ha tenido experiencia de las complicaciones y confusiones que de ello resultan; pero aquí dejamos la cuestión general y observamos solo el extraño efecto que tuvo en el caso particular de Orlando.",
    a: "Virginia Woolf",
    obra: "Orlando, Virginia Woolf",
    highlight: "Aunque los sexos sean distintos, se entremezclan.",
    lang: "es"
  },
  {
    t: "El oficio del poeta, entonces, es el más alto de todos, continuó ella. Sus palabras llegan donde otras se quedan cortas. Una canción tonta de Shakespeare ha hecho más por los pobres y los malvados que todos los predicadores y filántropos del mundo.",
    a: "Virginia Woolf",
    obra: "Orlando, Virginia Woolf",
    highlight: "Una canción tonta de Shakespeare ha hecho más por los pobres y los malvados que todos los predicadores y filántropos del mundo.",
    lang: "es"
  },
  {
    t: "Ningún tiempo, ninguna devoción, puede ser demasiado grande, por tanto, si logra que el vehículo de nuestro mensaje distorsione menos. Debemos moldear nuestras palabras hasta que sean la envoltura más fina de nuestros pensamientos. Los pensamientos son divinos, etc.",
    a: "Virginia Woolf",
    obra: "Orlando, Virginia Woolf",
    highlight: "Debemos moldear nuestras palabras hasta que sean la envoltura más fina de nuestros pensamientos.",
    lang: "es"
  },
  {
    t: "“Escribiré”, había dicho ella, “lo que disfruto escribiendo”; y así había emborronado veintiséis volúmenes. Sin embargo, pese a todos sus viajes y aventuras, y sus pensamientos profundos, y sus vueltas hacia un lado y hacia otro, todavía estaba en proceso de fabricación. Lo que el futuro pudiera traer, solo el Cielo lo sabía. El cambio era incesante, y quizá el cambio no cesaría nunca.",
    a: "Virginia Woolf",
    obra: "Orlando, Virginia Woolf",
    highlight: "Escribiré lo que disfruto escribiendo.",
    lang: "es"
  },
  {
    t: "Al mismo tiempo, por tanto, la sociedad lo es todo y no es nada. La sociedad es el brebaje más poderoso del mundo, y la sociedad no tiene existencia alguna.",
    a: "Virginia Woolf",
    obra: "Orlando, Virginia Woolf",
    highlight: "La sociedad lo es todo y no es nada.",
    lang: "es"
  },
  {
    t: "La humedad penetró dentro. Los hombres sintieron el frío en el corazón; la humedad en la mente. En un esfuerzo desesperado por acurrucar sus sentimientos en alguna clase de calor, se probó un subterfugio tras otro. Amor, nacimiento y muerte fueron envueltos en una variedad de frases elegantes.",
    a: "Virginia Woolf",
    obra: "Orlando, Virginia Woolf",
    highlight: "Los hombres sentían el frío en el corazón; la humedad en la mente.",
    lang: "es"
  },
  {
    t: "La verdadera duración de una vida, diga lo que diga el *Dictionary of National Biography*, siempre es materia de disputa. Porque es un asunto difícil, esto de llevar la cuenta del tiempo; nada lo desordena más deprisa que el contacto con cualquiera de las artes; y puede que fuera su amor por la poesía el culpable de que Orlando perdiera la lista de la compra y volviera a casa sin las sardinas, las sales de baño ni las botas.",
    a: "Virginia Woolf",
    obra: "Orlando, Virginia Woolf",
    highlight: "La verdadera duración de una vida siempre es materia de disputa.",
    lang: "es"
  },
  {
    t: "Entonces llamó con vacilación, como si la persona que buscaba pudiera no estar allí: “¿Orlando?”. Porque si hay —por aventurar una cifra— setenta y seis tiempos distintos latiendo a la vez en la mente, ¿cuántas personas distintas no habrá —¡que el Cielo nos ayude!— alojadas en uno u otro momento en el espíritu humano? Algunos dicen que dos mil cincuenta y dos. Así que es lo más habitual del mundo que una persona llame, en cuanto se queda sola: “¿Orlando?” —si ese es su nombre—, queriendo decir con ello: “¡Vamos, vamos! Estoy harta hasta la muerte de este yo en particular. Quiero otro”.",
    a: "Virginia Woolf",
    obra: "Orlando, Virginia Woolf",
    highlight: "Hay setenta y seis tiempos distintos latiendo a la vez en la mente.",
    lang: "es"
  },
  {
    t: "Quizá; pero lo que parecía cierto —pues estamos ahora en la región del “quizá” y del “parece”— era que el yo que más necesitaba se mantenía apartado, ya que, a juzgar por lo que decía, estaba cambiando de yos tan deprisa como conducía: había uno nuevo en cada esquina. Eso ocurre cuando, por alguna razón inexplicable, el yo consciente, que es el que está más arriba y tiene el poder de desear, quiere no ser más que un solo yo. Esto es lo que algunas personas llaman el yo verdadero, y está, dicen, compuesto por todos los yos que tenemos dentro la posibilidad de ser; dirigido y encerrado por el yo Capitán, el yo Llave, que los amalgama y los controla a todos.",
    a: "Virginia Woolf",
    obra: "Orlando, Virginia Woolf",
    highlight: "El yo verdadero está compuesto por todos los yos que podemos llegar a ser.",
    lang: "es"
  },
  {
    t: "Siempre vuela rápido mar adentro, y siempre le arrojo palabras como redes —aquí lanzó la mano hacia fuera—, que se encogen como he visto encogerse las redes al subirlas a cubierta con solo algas dentro; y a veces queda una pulgada de plata —seis palabras— en el fondo de la red. Pero nunca el gran pez que vive en las arboledas de coral. Aquí inclinó la cabeza, profundamente pensativa.",
    a: "Virginia Woolf",
    obra: "Orlando, Virginia Woolf",
    highlight: "Siempre le arrojo palabras como redes.",
    lang: "es"
  }
];

const DORIAN_GRAY_QUOTES = [
  {
    t: `—Harry —dijo Basil Hallward, mirándolo directamente a la cara—, todo retrato pintado con sentimiento es un retrato del artista, no del modelo. El modelo no es más que el accidente, la ocasión. No es él quien queda revelado por el pintor; es, más bien, el pintor quien se revela a sí mismo sobre el lienzo. La razón por la que no expondré este cuadro es que temo haber mostrado en él el secreto de mi propia alma.`,
    a: "Oscar Wilde",
    obra: "El retrato de Dorian Gray, Oscar Wilde",
    highlight: "El secreto de mi propia alma.",
    lang: "es"
  },
  {
    t: `Al girar el pomo de la puerta, su mirada cayó sobre el retrato que Basil Hallward había pintado de él. Retrocedió como sorprendido. Después entró en su habitación, algo perplejo. Tras quitarse la flor del ojal, pareció vacilar. Finalmente regresó, se acercó al cuadro y lo examinó. En la luz tenue e inmóvil que se filtraba a duras penas por las persianas de seda color crema, el rostro le pareció ligeramente cambiado. La expresión era distinta. Se habría dicho que había un matiz de crueldad en la boca. Era, ciertamente, extraño.`,
    a: "Oscar Wilde",
    obra: "El retrato de Dorian Gray, Oscar Wilde",
    highlight: "Un matiz de crueldad en la boca.",
    lang: "es"
  },
  {
    t: `Su amor irreal y egoísta cedería ante alguna influencia más elevada, se transformaría en una pasión más noble, y el retrato que Basil Hallward había pintado de él sería su guía a lo largo de la vida: sería para él lo que la santidad es para algunos, la conciencia para otros y el temor de Dios para todos. Había opiáceos para el remordimiento, drogas capaces de adormecer el sentido moral. Pero allí tenía un símbolo visible de la degradación del pecado; una señal siempre presente de la ruina que los hombres causan en sus propias almas.`,
    a: "Oscar Wilde",
    obra: "El retrato de Dorian Gray, Oscar Wilde",
    highlight: "La ruina que los hombres causan en sus propias almas.",
    lang: "es"
  },
  {
    t: `A menudo, al regresar de una de aquellas misteriosas y prolongadas ausencias que despertaban conjeturas tan extrañas entre quienes eran sus amigos, o creían serlo, subía sigilosamente hasta la habitación cerrada, abría la puerta con la llave que ya nunca se separaba de él y, sosteniendo un espejo, se colocaba frente al retrato que Basil Hallward había pintado: miraba unas veces el rostro maligno y envejecido del lienzo, y otras el rostro joven y hermoso que le devolvía la risa desde el cristal pulido.

La intensidad misma del contraste agudizaba su placer. Se enamoraba cada vez más de su propia belleza y se interesaba cada vez más por la corrupción de su propia alma. Examinaba con minucioso cuidado —y a veces con un deleite monstruoso y terrible— las líneas horribles que abrasaban la frente arrugada o reptaban alrededor de la boca pesada y sensual, preguntándose en ocasiones qué era más espantoso: las señales del pecado o las señales de la edad.`,
    a: "Oscar Wilde",
    obra: "El retrato de Dorian Gray, Oscar Wilde",
    highlight: "La corrupción de su propia alma.",
    lang: "es"
  },
  {
    t: `—Es el rostro de mi alma.

—¡Cristo! ¡Qué cosa debo de haber adorado! Tiene los ojos de un demonio.

—Cada uno de nosotros lleva dentro el cielo y el infierno, Basil —exclamó Dorian, con un gesto desesperado y violento.

Hallward se volvió de nuevo hacia el retrato y lo contempló. La superficie parecía completamente intacta, tal como él la había dejado. Al parecer, la inmundicia y el horror habían surgido desde dentro. Por alguna extraña intensificación de su vida interior, las lepras del pecado estaban devorándolo lentamente. Ni la descomposición de un cadáver en una tumba bajo el agua habría sido tan espantosa.`,
    a: "Oscar Wilde",
    obra: "El retrato de Dorian Gray, Oscar Wilde",
    highlight: "El cielo y el infierno.",
    lang: "es"
  },
  {
    t: `—No, Harry. El alma es una realidad terrible. Puede comprarse, venderse y entregarse a cambio de otra cosa. Puede ser envenenada o perfeccionada. Hay un alma en cada uno de nosotros. Yo lo sé.`,
    a: "Oscar Wilde",
    obra: "El retrato de Dorian Gray, Oscar Wilde",
    highlight: "El alma es una realidad terrible.",
    lang: "es"
  },
  {
    t: `Pero aquel asesinato, ¿había de perseguirlo durante toda su vida? ¿Estaría siempre cargando con su pasado? ¿Debía realmente confesar? Nunca. Solo quedaba una prueba contra él. El propio cuadro: esa era la prueba. Lo destruiría. ¿Por qué lo había conservado durante tanto tiempo? En otro tiempo le había proporcionado placer contemplarlo mientras cambiaba y envejecía. Últimamente ya no sentía ese placer. Lo había mantenido despierto por las noches. Cuando estaba lejos, el terror de que otros ojos pudieran contemplarlo no lo abandonaba.

Había extendido la melancolía sobre sus pasiones. Su mero recuerdo había estropeado muchos momentos de alegría. Había sido como una conciencia para él. Sí, había sido su conciencia. La destruiría.`,
    a: "Oscar Wilde",
    obra: "El retrato de Dorian Gray, Oscar Wilde",
    highlight: "Había sido su conciencia.",
    lang: "es"
  },
  {
    t: `—No existe tal cosa como una buena influencia, señor Gray. Toda influencia es inmoral, inmoral desde el punto de vista científico.

—¿Por qué?

—Porque influir en una persona es darle la propia alma. Ya no piensa sus pensamientos naturales ni arde con sus pasiones naturales. Sus virtudes no son realmente suyas. Sus pecados, si es que existen los pecados, son prestados. Se convierte en eco de la música de otro, en actor de un papel que no fue escrito para él. El propósito de la vida es el desarrollo de uno mismo: realizar perfectamente la propia naturaleza. Para eso estamos aquí.`,
    a: "Oscar Wilde",
    obra: "El retrato de Dorian Gray, Oscar Wilde",
    highlight: "Influir es darle a otro la propia alma.",
    lang: "es"
  },
  {
    t: `—Ese es uno de los grandes secretos de la vida: curar el alma mediante los sentidos, y los sentidos mediante el alma. Eres una creación maravillosa. Sabes más de lo que crees saber, del mismo modo que sabes menos de lo que deseas saber.`,
    a: "Oscar Wilde",
    obra: "El retrato de Dorian Gray, Oscar Wilde",
    highlight: "Curar el alma mediante los sentidos.",
    lang: "es"
  },
  {
    t: `—¡Qué triste es! —murmuró Dorian Gray, con los ojos todavía fijos en su retrato—. Yo envejeceré y me volveré horrible y espantoso. Pero este cuadro permanecerá siempre joven. Nunca tendrá más edad que la de este preciso día de junio. Si pudiera suceder al contrario; si fuera yo quien permaneciese siempre joven y el cuadro quien envejeciera… Por eso lo daría todo. Sí, no hay nada en el mundo entero que no entregaría. ¡Daría mi alma por ello!`,
    a: "Oscar Wilde",
    obra: "El retrato de Dorian Gray, Oscar Wilde",
    highlight: "Daría mi alma por ello.",
    lang: "es"
  },
  {
    t: `—Antes de conocerte, la interpretación era la única realidad de mi vida. Solo vivía en el teatro. Pensaba que todo aquello era verdadero. Una noche era Rosalinda y, a la siguiente, Porcia. La alegría de Beatriz era mi alegría, y las penas de Cordelia también eran mías. Creía en todo. Los actores vulgares que trabajaban conmigo me parecían seres divinos. Los decorados pintados eran mi mundo. No conocía más que sombras, y creía que eran reales.

Tú llegaste —¡oh, mi hermoso amor!— y liberaste mi alma de su prisión. Me enseñaste qué es verdaderamente la realidad. Me trajiste algo más elevado, algo de lo que todo arte no es sino un reflejo. Me hiciste comprender qué es realmente el amor. Estoy harta de sombras.`,
    a: "Oscar Wilde",
    obra: "El retrato de Dorian Gray, Oscar Wilde",
    highlight: "No conocía más que sombras.",
    lang: "es"
  },
  {
    t: `Cubrió página tras página con palabras desenfrenadas de tristeza y palabras todavía más desenfrenadas de dolor. Hay un lujo en el reproche dirigido contra uno mismo. Cuando nos culpamos, sentimos que nadie más tiene derecho a culparnos. Es la confesión, y no el sacerdote, la que nos concede la absolución. Cuando Dorian terminó la carta, sintió que había sido perdonado.`,
    a: "Oscar Wilde",
    obra: "El retrato de Dorian Gray, Oscar Wilde",
    highlight: "Hay un lujo en culparse a uno mismo.",
    lang: "es"
  },
  {
    t: `La posición y la riqueza no lo son todo. Ten presente que no creo esos rumores. Al menos, no puedo creerlos cuando te miro. El pecado es algo que se escribe en el rostro de un hombre. No puede ocultarse. A veces la gente habla de vicios secretos. No existen tales cosas. Si un desgraciado tiene un vicio, este se manifiesta en las líneas de su boca, en la caída de sus párpados, incluso en la forma de sus manos.`,
    a: "Oscar Wilde",
    obra: "El retrato de Dorian Gray, Oscar Wilde",
    highlight: "El pecado se escribe en el rostro.",
    lang: "es"
  },
  {
    t: `Uno tiene derecho a juzgar a un hombre por el efecto que ejerce sobre sus amigos. Los tuyos parecen perder todo sentido del honor, de la bondad y de la pureza. Los has llenado de una locura por el placer. Han descendido hasta las profundidades. Tú los condujiste allí. Sí: tú los condujiste, y aun así puedes sonreír como estás sonriendo ahora.`,
    a: "Oscar Wilde",
    obra: "El retrato de Dorian Gray, Oscar Wilde",
    highlight: "El efecto que ejerce sobre sus amigos.",
    lang: "es"
  },
  {
    t: `—¡Dios mío, Dorian, qué lección! ¡Qué espantosa lección! Reza, Dorian, reza. ¿Qué nos enseñaron a decir cuando éramos niños? “No nos dejes caer en la tentación. Perdona nuestros pecados. Límpianos de nuestras iniquidades.” Digámoslo juntos. La oración de tu orgullo ha sido escuchada. También será escuchada la oración de tu arrepentimiento. Yo te adoré demasiado, y por ello soy castigado. Tú te adoraste demasiado. Los dos somos castigados.`,
    a: "Oscar Wilde",
    obra: "El retrato de Dorian Gray, Oscar Wilde",
    highlight: "Tú te adoraste demasiado.",
    lang: "es"
  },
  {
    t: `Había en todos ellos una fascinación horrible. Los veía por la noche, y durante el día perturbaban su imaginación. Dorian Gray había sido envenenado por un libro. Había momentos en los que contemplaba el mal únicamente como un medio mediante el cual podía realizar su concepción de la belleza.`,
    a: "Oscar Wilde",
    obra: "El retrato de Dorian Gray, Oscar Wilde",
    highlight: "El mal como forma de realizar la belleza.",
    lang: "es"
  },
  {
    t: `La tragedia de la vejez no consiste en ser viejo, sino en seguir siendo joven. A veces me asombra mi propia sinceridad. ¡Ah, Dorian, qué feliz eres! Qué vida tan exquisita has tenido. Has bebido profundamente de todo. Has aplastado las uvas contra el paladar. Nada se te ha ocultado. Y todo ello no ha sido para ti más que el sonido de la música. No te ha marcado. Sigues siendo el mismo.`,
    a: "Oscar Wilde",
    obra: "El retrato de Dorian Gray, Oscar Wilde",
    highlight: "La tragedia de la vejez.",
    lang: "es"
  },
  {
    t: `Me alegra que nunca hayas hecho nada: que nunca hayas esculpido una estatua, pintado un cuadro ni producido nada fuera de ti mismo. La vida ha sido tu arte. Te has puesto a ti mismo en música. Tus días son tus sonetos.`,
    a: "Oscar Wilde",
    obra: "El retrato de Dorian Gray, Oscar Wilde",
    highlight: "La vida ha sido tu arte.",
    lang: "es"
  },
  {
    t: `¡En qué monstruoso momento de orgullo y pasión había rogado que el retrato soportara el peso de sus días, mientras él conservaba intacto el esplendor de la juventud eterna! Todo su fracaso había nacido de aquello. Habría sido mejor que cada pecado de su vida hubiese llevado consigo su castigo seguro e inmediato. Había purificación en el castigo. La oración del hombre a un Dios justo no debería ser “perdona nuestros pecados”, sino “castíganos por nuestras iniquidades”.`,
    a: "Oscar Wilde",
    obra: "El retrato de Dorian Gray, Oscar Wilde",
    highlight: "Había purificación en el castigo.",
    lang: "es"
  },
  {
    t: `Entonces aborreció su propia belleza y, arrojando el espejo al suelo, lo aplastó bajo el talón hasta convertirlo en astillas de plata. Habían sido su belleza y la juventud que había suplicado conservar las que lo habían destruido. Sin esas dos cosas, su vida quizá habría quedado libre de toda mancha. Su belleza no había sido para él más que una máscara; su juventud, una burla. ¿Qué era la juventud, en el mejor de los casos? Un tiempo verde e inmaduro, una época de emociones superficiales y pensamientos enfermizos. La juventud lo había echado a perder.`,
    a: "Oscar Wilde",
    obra: "El retrato de Dorian Gray, Oscar Wilde",
    highlight: "Su belleza no había sido más que una máscara.",
    lang: "es"
  },
  {
    t: `No era realmente la muerte de Basil Hallward lo que más pesaba sobre su mente. Lo atormentaba la muerte viva de su propia alma. Basil había pintado el retrato que había arruinado su vida, y no podía perdonárselo. El asesinato había sido simplemente la locura de un instante. En cuanto a Alan Campbell, su suicidio había sido decisión suya. Él había elegido hacerlo. Para Dorian, aquello no significaba nada.`,
    a: "Oscar Wilde",
    obra: "El retrato de Dorian Gray, Oscar Wilde",
    highlight: "La muerte viva de su propia alma.",
    lang: "es"
  }
];

const IVAN_ILICH_QUOTES = [
  {
    t: `Al enterarse de la muerte de Iván Ilich, el primer pensamiento de cada uno fue qué consecuencias tendría aquella muerte para los traslados o ascensos propios y de sus conocidos.

«Mira, él ha muerto; yo, en cambio, sigo aquí», pensó o sintió cada uno.`,
    a: "León Tolstói",
    obra: "La muerte de Iván Ilich, León Tolstói",
    highlight: "yo, en cambio, sigo aquí",
    lang: "es"
  },
  {
    t: `La historia pasada de la vida de Iván Ilich había sido la más sencilla, la más corriente y la más terrible.

Murió a los cuarenta y cinco años, siendo miembro de la Audiencia. Había sido un hombre inteligente, vivo, agradable y decoroso.`,
    a: "León Tolstói",
    obra: "La muerte de Iván Ilich, León Tolstói",
    highlight: "la más sencilla, la más corriente y la más terrible",
    lang: "es"
  },
  {
    t: `La conciencia de su poder, la importancia de su entrada en el tribunal, el éxito ante superiores e inferiores y, sobre todo, la maestría con que llevaba los asuntos: todo aquello lo alegraba.

Junto con las conversaciones, las comidas y las partidas de cartas, llenaba su vida. Y así continuaba discurriendo como él consideraba que debía discurrir: agradable y decorosamente.`,
    a: "León Tolstói",
    obra: "La muerte de Iván Ilich, León Tolstói",
    highlight: "agradable y decorosamente",
    lang: "es"
  },
  {
    t: `Así como él fingía solemnidad ante los acusados, el célebre médico fingía ahora solemnidad ante él.

Para Iván Ilich solo había una pregunta importante: ¿era peligrosa su situación? Pero el médico ignoraba aquella pregunta inoportuna. Desde su punto de vista, no se trataba de la vida de Iván Ilich, sino de decidir entre un riñón flotante y una afección del intestino ciego.`,
    a: "León Tolstói",
    obra: "La muerte de Iván Ilich, León Tolstói",
    highlight: "no se trataba de la vida de Iván Ilich",
    lang: "es"
  },
  {
    t: `«¿El intestino ciego? ¿El riñón? No se trata del intestino ni del riñón, sino de la vida y de la muerte. Sí, la vida estaba aquí y ahora se va, se va, y yo no puedo retenerla.

¿Acaso no es evidente para todos, salvo para mí, que estoy muriendo y que la única cuestión es cuántas semanas o días faltan, quizá solo este instante?»`,
    a: "León Tolstói",
    obra: "La muerte de Iván Ilich, León Tolstói",
    highlight: "la vida estaba aquí y ahora se va",
    lang: "es"
  },
  {
    t: `En el fondo de su alma, Iván Ilich sabía que estaba muriendo; pero no solo no se había acostumbrado a ello, sino que no lo comprendía, no podía comprenderlo de ningún modo.

El ejemplo de silogismo que había estudiado en lógica —Cayo es un hombre, los hombres son mortales, por tanto Cayo es mortal— le había parecido correcto durante toda su vida únicamente con relación a Cayo, pero nunca con relación a él mismo.

[…]

Cayo era mortal y estaba bien que muriera; pero él, Vania, Iván Ilich, con todos sus sentimientos y pensamientos, era otra cosa. No podía ser que él tuviera que morir. Sería demasiado terrible.`,
    a: "León Tolstói",
    obra: "La muerte de Iván Ilich, León Tolstói",
    highlight: "él, Vania, Iván Ilich, con todos sus sentimientos y pensamientos, era otra cosa",
    lang: "es"
  },
  {
    t: `Al tercer mes de la enfermedad, su mujer, su hija, su hijo, los criados, los conocidos, los médicos y, sobre todo, él mismo sabían que todo el interés que despertaba en los demás se reducía a una sola cuestión:

cuándo dejaría por fin vacante su puesto, libraría a los vivos de la molestia que su presencia les causaba y se libraría él mismo de sus sufrimientos.`,
    a: "León Tolstói",
    obra: "La muerte de Iván Ilich, León Tolstói",
    highlight: "cuándo dejaría por fin vacante su puesto",
    lang: "es"
  },
  {
    t: `Solo Guerásim no mentía. Era evidente que comprendía lo que sucedía y que no consideraba necesario ocultarlo; simplemente sentía compasión por su señor debilitado y consumido.

Una vez, cuando Iván Ilich quiso despedirlo, le dijo:

—Todos moriremos. ¿Por qué no habría de ayudarte?`,
    a: "León Tolstói",
    obra: "La muerte de Iván Ilich, León Tolstói",
    highlight: "Todos moriremos. ¿Por qué no habría de ayudarte?",
    lang: "es"
  },
  {
    t: `El principal tormento de Iván Ilich era la mentira: aquella mentira, aceptada por todos, según la cual él solo estaba enfermo, pero no se estaba muriendo.

Lo atormentaba que no quisieran reconocer aquello que todos sabían y que él sabía; que quisieran mentirle acerca de su terrible situación y lo obligaran a participar en la mentira.

Muchas veces estuvo a punto de gritarles: «¡Dejad de mentir! Vosotros sabéis, y yo sé, que estoy muriendo».`,
    a: "León Tolstói",
    obra: "La muerte de Iván Ilich, León Tolstói",
    highlight: "Vosotros sabéis, y yo sé, que estoy muriendo",
    lang: "es"
  },
  {
    t: `En algunos momentos, después de largos sufrimientos, lo que más deseaba, por vergonzoso que le pareciera reconocerlo, era que alguien sintiera lástima de él como se siente lástima de un niño enfermo. Quería que lo acariciaran, que lo besaran, que lloraran por él, como se acaricia y consuela a los niños.

Sabía que era un hombre importante, que su barba empezaba a encanecer y que, por tanto, aquello era imposible; pero aun así lo deseaba.`,
    a: "León Tolstói",
    obra: "La muerte de Iván Ilich, León Tolstói",
    highlight: "Quería que lo acariciaran, que lo besaran, que lloraran por él",
    lang: "es"
  },
  {
    t: `Le parecía que lo introducían con sufrimiento en un saco negro, estrecho y profundo; que lo empujaban cada vez más hacia el fondo, pero no conseguían hacerlo pasar.

Tenía miedo y, al mismo tiempo, quería caer dentro; se resistía y ayudaba a que lo empujaran.

Después lloró como un niño: por su impotencia, por su terrible soledad, por la crueldad de los hombres, por la crueldad de Dios, por la ausencia de Dios.`,
    a: "León Tolstói",
    obra: "La muerte de Iván Ilich, León Tolstói",
    highlight: "lo empujaban cada vez más hacia el fondo",
    lang: "es"
  },
  {
    t: `Cuanto más se alejaba de la infancia y más se acercaba al presente, más insignificantes y dudosas eran sus alegrías.

El matrimonio, la decepción, la sensualidad, la falsedad; después aquel servicio muerto, las preocupaciones por el dinero: siempre lo mismo. Cuanto más avanzaba, más muerto estaba todo.

Era como si hubiese descendido uniformemente por una pendiente mientras imaginaba que ascendía.`,
    a: "León Tolstói",
    obra: "La muerte de Iván Ilich, León Tolstói",
    highlight: "mientras imaginaba que ascendía",
    lang: "es"
  },
  {
    t: `«Tal vez no he vivido como debía», se le ocurrió de pronto.

«¿Pero cómo iba a haber vivido mal, si siempre hice todo como correspondía?», se respondió, y enseguida apartó de sí aquella solución única del enigma de la vida y de la muerte como si fuera algo completamente imposible.`,
    a: "León Tolstói",
    obra: "La muerte de Iván Ilich, León Tolstói",
    highlight: "Tal vez no he vivido como debía",
    lang: "es"
  },
  {
    t: `Sus sufrimientos físicos eran terribles, pero aún más terribles eran sus sufrimientos morales, y en ellos residía su verdadero tormento.

«¿Y si, en realidad, toda mi vida consciente no hubiera sido lo que debía?»

Pensó que aquello que antes le había parecido completamente imposible —que no hubiese vivido como debía— podía ser cierto. Sus leves intentos de resistirse a lo que las personas de posición más elevada consideraban bueno quizá habían sido lo verdadero; y todo lo demás podía haber sido falso.

Su trabajo, la organización de su vida, su familia, sus intereses sociales y profesionales: todo podía haber sido falso.

Trató de defenderlo, pero de pronto comprendió toda la debilidad de aquello que defendía. No había nada que defender.`,
    a: "León Tolstói",
    obra: "La muerte de Iván Ilich, León Tolstói",
    highlight: "No había nada que defender",
    lang: "es"
  },
  {
    t: `Su tormento consistía en que lo introducían en aquel agujero negro y, todavía más, en que no conseguía atravesarlo.

Lo que le impedía atravesarlo era reconocer que su vida había sido buena. Aquella justificación de su vida lo sujetaba, no lo dejaba avanzar y lo atormentaba más que ninguna otra cosa.`,
    a: "León Tolstói",
    obra: "La muerte de Iván Ilich, León Tolstói",
    highlight: "Aquella justificación de su vida lo sujetaba",
    lang: "es"
  },
  {
    t: `Al final del agujero empezó a brillar algo.

—Sí, todo había sido falso —se dijo—, pero no importa. Todavía es posible hacer lo correcto.

En aquel momento su hijo se acercó a la cama. La mano del moribundo cayó sobre su cabeza. El muchacho la tomó, la apretó contra los labios y se echó a llorar.

Iván Ilich vio la luz y sintió compasión por su hijo y por su mujer.`,
    a: "León Tolstói",
    obra: "La muerte de Iván Ilich, León Tolstói",
    highlight: "Todavía es posible hacer lo correcto",
    lang: "es"
  },
  {
    t: `«Qué bien y qué sencillo», pensó.

«¿Y el dolor? ¿Dónde está? Vamos, dolor, ¿dónde estás?»

Prestó atención.

«Sí, ahí está. Bueno, que esté».

«¿Y la muerte? ¿Dónde está?»

Buscó su antiguo y habitual miedo a la muerte y no lo encontró. ¿Dónde estaba? ¿Qué muerte? No había miedo alguno porque tampoco había muerte.

En lugar de la muerte estaba la luz.

—¡Así que era esto! —dijo de pronto en voz alta—. ¡Qué alegría!`,
    a: "León Tolstói",
    obra: "La muerte de Iván Ilich, León Tolstói",
    highlight: "En lugar de la muerte estaba la luz",
    lang: "es"
  },
  {
    t: `—Se acabó —dijo alguien sobre él.

Iván Ilich oyó aquellas palabras y las repitió dentro de su alma:

«La muerte ha terminado. Ya no existe».

Aspiró aire, se detuvo en mitad del suspiro, se estiró y murió.`,
    a: "León Tolstói",
    obra: "La muerte de Iván Ilich, León Tolstói",
    highlight: "La muerte ha terminado. Ya no existe",
    lang: "es"
  }
];

const MEMORIAS_SUBSUELO_QUOTES = [
  {
    t: `Soy un hombre enfermo… Soy un hombre malo. Un hombre nada atractivo. Creo que me duele el hígado. Aunque, en realidad, no entiendo ni pizca de mi enfermedad ni sé con certeza qué es lo que me duele. No me curo y nunca me he curado, aunque respeto la medicina y a los médicos. Además, soy supersticioso hasta el extremo; bueno, hasta el extremo de respetar la medicina. (Soy lo bastante instruido para no ser supersticioso, pero lo soy).

No, señores, no quiero curarme por puro despecho. Esto, seguramente, no se dignarán ustedes a comprenderlo. Yo sí lo comprendo.`,
    a: "Fiódor Dostoievski",
    obra: "Memorias del subsuelo, Fiódor Dostoievski",
    highlight: "No quiero curarme por puro despecho.",
    lang: "es"
  },
  {
    t: `No solo no supe hacerme malvado, sino que tampoco supe hacerme nada: ni malo ni bueno, ni canalla ni honrado, ni héroe ni insecto.

Ahora acabo mis días en mi rincón, provocándome con el consuelo maligno y completamente inútil de que un hombre inteligente no puede seriamente convertirse en nada, y de que solo el necio llega a convertirse en algo.`,
    a: "Fiódor Dostoievski",
    obra: "Memorias del subsuelo, Fiódor Dostoievski",
    highlight: "Tampoco supe hacerme nada.",
    lang: "es"
  },
  {
    t: `Ahora me apetece contarles, señores —les apetezca o no oírlo—, por qué ni siquiera supe convertirme en insecto. Les diré solemnemente que muchas veces quise convertirme en insecto. Pero ni siquiera de eso fui digno.

Les juro, señores, que ser demasiado consciente es una enfermedad, una enfermedad verdadera, completa. Para el uso cotidiano del hombre habría bastado de sobra una conciencia humana ordinaria: la mitad, incluso la cuarta parte de la porción que le toca al hombre desarrollado de nuestro desgraciado siglo.`,
    a: "Fiódor Dostoievski",
    obra: "Memorias del subsuelo, Fiódor Dostoievski",
    highlight: "Ser demasiado consciente es una enfermedad.",
    lang: "es"
  },
  {
    t: `Díganme esto: ¿por qué ocurría que, como adrede, precisamente en esos mismos, sí, en esos mismos minutos en que era más capaz de comprender todas las sutilezas de «todo lo bello y lo sublime», me sucedía ya no comprender, sino cometer acciones tan indecorosas, acciones que… bueno, sí, que quizá todos cometen, pero que, como adrede, se me ocurrían justamente cuando más comprendía que de ningún modo debía cometerlas?

Cuanto más consciente era del bien y de todo eso «bello y sublime», más profundamente descendía a mi cieno y más capaz era de atascarme por completo en él.`,
    a: "Fiódor Dostoievski",
    obra: "Memorias del subsuelo, Fiódor Dostoievski",
    highlight: "Más profundamente descendía a mi cieno.",
    lang: "es"
  },
  {
    t: `Llegaba a sentir cierto placercillo secreto, anormal y mezquino cuando regresaba a mi rincón en alguna asquerosísima noche de Petersburgo y me obligaba a reconocer que aquel día había vuelto a cometer una vileza, que lo hecho, una vez más, ya no podía deshacerse; y, por dentro, en secreto, roerme, roerme por ello con los dientes, serrarme y chuparme hasta que la amargura terminaba convirtiéndose en una dulzura vergonzosa, maldita, y finalmente en un placer decidido, serio.

¡Sí, en placer, en placer! Insisto en ello.`,
    a: "Fiódor Dostoievski",
    obra: "Memorias del subsuelo, Fiódor Dostoievski",
    highlight: "La amargura terminaba convirtiéndose en una dulzura vergonzosa.",
    lang: "es"
  },
  {
    t: `Pues colmadlo de todos los bienes terrenales, hundidlo en felicidad hasta la coronilla, de manera que en la superficie de la felicidad solo suban burbujitas, como sobre el agua; dadle tal bienestar económico que ya no le quede absolutamente nada que hacer salvo dormir, comer pan de especias y preocuparse de que la historia universal no se interrumpa; y aun así, el hombre, aun así, solo por ingratitud, por pura maledicencia, cometerá alguna vileza.

Arriesgará incluso sus panes de especias y deseará adrede el disparate más pernicioso, el absurdo menos económico.`,
    a: "Fiódor Dostoievski",
    obra: "Memorias del subsuelo, Fiódor Dostoievski",
    highlight: "Hundidlo en felicidad hasta la coronilla.",
    lang: "es"
  },
  {
    t: `Precisamente sus sueños fantásticos, su estupidez más vulgar, querrá conservarlos para sí, únicamente para confirmarse —como si eso fuera tan terriblemente necesario— que los hombres siguen siendo hombres y no teclas de piano sobre las que tocan con sus propias manos las leyes de la naturaleza.

Y aunque resultara realmente una tecla de piano, aunque se lo demostraran mediante las ciencias naturales y las matemáticas, ni entonces entraría en razón: haría adrede alguna cosa contraria, únicamente por ingratitud, propiamente para salirse con la suya.`,
    a: "Fiódor Dostoievski",
    obra: "Memorias del subsuelo, Fiódor Dostoievski",
    highlight: "Los hombres siguen siendo hombres y no teclas de piano.",
    lang: "es"
  },
  {
    t: `¿Y quién sabe —no puede garantizarse— si toda la finalidad hacia la que tiende la humanidad en la tierra consiste únicamente en esa continuidad ininterrumpida del proceso de alcanzar; dicho de otro modo, en la vida misma, y no propiamente en la meta?

Porque la meta, naturalmente, no puede ser otra cosa que dos por dos son cuatro, es decir, una fórmula; y dos por dos son cuatro ya no es vida, señores, sino el principio de la muerte. Por lo menos, el hombre siempre ha sentido cierto miedo ante ese dos por dos son cuatro, y yo todavía lo siento.`,
    a: "Fiódor Dostoievski",
    obra: "Memorias del subsuelo, Fiódor Dostoievski",
    highlight: "Dos por dos son cuatro ya no es vida, señores, sino el principio de la muerte.",
    lang: "es"
  },
  {
    t: `¿Y por qué están ustedes tan firme, tan solemnemente convencidos de que solo lo normal y positivo —en una palabra, solo el bienestar— resulta ventajoso para el hombre? ¿No se equivocará la razón acerca de las ventajas? Quizá el hombre no ame únicamente el bienestar. Quizá ame exactamente en la misma medida el sufrimiento. Quizá el sufrimiento le resulte tan ventajoso como el bienestar.

Yo no defiendo propiamente el sufrimiento, ni tampoco el bienestar. Defiendo… mi capricho y que se me garantice cuando me haga falta.`,
    a: "Fiódor Dostoievski",
    obra: "Memorias del subsuelo, Fiódor Dostoievski",
    highlight: "Defiendo… mi capricho.",
    lang: "es"
  },
  {
    t: `Verán ustedes: si en lugar de un palacio hubiera un gallinero y empezara a llover, quizá me metería en el gallinero para no mojarme; pero aun así no tomaría el gallinero por un palacio, solo por agradecimiento porque me hubiese protegido de la lluvia.

Ustedes se ríen; incluso dicen que, en ese caso, el gallinero y las mansiones dan lo mismo. Sí —respondo yo—, si solo hubiera que vivir para no mojarse.`,
    a: "Fiódor Dostoievski",
    obra: "Memorias del subsuelo, Fiódor Dostoievski",
    highlight: "No tomaría el gallinero por un palacio.",
    lang: "es"
  },
  {
    t: `Destruyan mis deseos, borren mis ideales, muéstrenme algo mejor y los seguiré. Quizá digan ustedes que no merece la pena meterse conmigo; pero, en ese caso, yo puedo responderles lo mismo. Estamos razonando seriamente; y si no quieren dignarse prestarme atención, no voy a inclinarme ante ustedes. Tengo el subsuelo.

Y mientras todavía viva y desee, ¡que se me seque la mano si llevo siquiera un ladrillito para semejante edificio sólido!`,
    a: "Fiódor Dostoievski",
    obra: "Memorias del subsuelo, Fiódor Dostoievski",
    highlight: "Tengo el subsuelo.",
    lang: "es"
  },
  {
    t: `Yo tenía entonces solo veinticuatro años. Mi vida era ya en aquella época sombría, desordenada y solitaria hasta el salvajismo. No me trataba con nadie, evitaba incluso hablar y me iba metiendo cada vez más en mi rincón.

En el trabajo, en la oficina, procuraba incluso no mirar a nadie; y advertía perfectamente que mis compañeros no solo me consideraban un excéntrico, sino que —también esto me parecía— me miraban como con cierta repugnancia.`,
    a: "Fiódor Dostoievski",
    obra: "Memorias del subsuelo, Fiódor Dostoievski",
    highlight: "Solitaria hasta el salvajismo.",
    lang: "es"
  },
  {
    t: `Ahora me resulta completamente claro que yo mismo, a causa de mi ilimitada vanidad y, por consiguiente, de las exigencias que me imponía, me miraba muy a menudo con un descontento furioso que llegaba hasta la repugnancia; y por eso atribuía mentalmente mi propia mirada a cada uno de los demás.

Odiaba, por ejemplo, mi rostro; lo encontraba repugnante y hasta sospechaba que había en él cierta expresión ruin.`,
    a: "Fiódor Dostoievski",
    obra: "Memorias del subsuelo, Fiódor Dostoievski",
    highlight: "Atribuía mentalmente mi propia mirada a cada uno de los demás.",
    lang: "es"
  },
  {
    t: `Sonreía con desprecio y caminaba al otro lado de la habitación, justo frente al sofá, junto a la pared, desde la mesa hasta la estufa y de regreso. Con todas mis fuerzas quería mostrar que podía arreglármelas sin ellos; pero, mientras tanto, golpeaba adrede el suelo con las botas, dejándome caer sobre los tacones.

Tuve paciencia para caminar así, justo delante de ellos, desde las ocho hasta las once, siempre por el mismo sitio, de la mesa a la estufa y de la estufa otra vez a la mesa.

Era ya imposible humillarse a sí mismo de una manera más descarada y voluntaria. Yo lo comprendía plenamente, plenamente, y aun así continuaba caminando.`,
    a: "Fiódor Dostoievski",
    obra: "Memorias del subsuelo, Fiódor Dostoievski",
    highlight: "Lo comprendía plenamente, plenamente, y aun así continuaba caminando.",
    lang: "es"
  },
  {
    t: `De pronto se me presentó con toda claridad la idea absurda, repugnante, semejante a una araña, del libertinaje que, sin amor, grosera y desvergonzadamente, empieza directamente por aquello con lo que el verdadero amor se corona.

Nos miramos así durante mucho tiempo; pero ella no bajaba los ojos ante los míos ni cambiaba la mirada, de manera que al final, no sé por qué, sentí miedo.`,
    a: "Fiódor Dostoievski",
    obra: "Memorias del subsuelo, Fiódor Dostoievski",
    highlight: "La idea absurda, repugnante, semejante a una araña.",
    lang: "es"
  },
  {
    t: `—¡Eh, basta, Liza! ¿Qué libro ni qué libro, si a mí mismo me repugna desde fuera? Aunque tampoco desde fuera. Todo esto se ha despertado ahora dentro de mi alma… ¿De verdad, de verdad no te repugna estar aquí? No, está claro que el hábito significa mucho. ¡El diablo sabe lo que el hábito puede llegar a hacer de una persona!

¿De verdad piensas seriamente que nunca envejecerás, que serás hermosa para siempre y que te conservarán aquí por los siglos de los siglos?`,
    a: "Fiódor Dostoievski",
    obra: "Memorias del subsuelo, Fiódor Dostoievski",
    highlight: "¡El diablo sabe lo que el hábito puede llegar a hacer de una persona!",
    lang: "es"
  },
  {
    t: `Hasta el último campesino que se contrata como jornalero no se entrega entero a la esclavitud y sabe que su plazo terminará. Pero ¿dónde está tu plazo? Piénsalo solamente: ¿qué entregas aquí?, ¿qué esclavizas?

¡El alma, el alma, sobre la que no tienes poder, la esclavizas junto con el cuerpo! Entregas tu amor para que cualquier borracho lo profane. ¡El amor! Pero si eso lo es todo; es un diamante, un tesoro de doncella, ¡el amor! Para merecer ese amor, otro estaría dispuesto a entregar el alma, a ir a la muerte.`,
    a: "Fiódor Dostoievski",
    obra: "Memorias del subsuelo, Fiódor Dostoievski",
    highlight: "¡El alma, el alma, sobre la que no tienes poder, la esclavizas junto con el cuerpo!",
    lang: "es"
  },
  {
    t: `Algo no moría dentro de mí, en lo profundo del corazón y de la conciencia; no quería morir y se manifestaba mediante una angustia abrasadora.

«¡Vendrá! ¡Vendrá sin falta! —exclamaba, corriendo por la habitación—. Si no hoy, vendrá mañana; ¡acabará encontrándome!»

Pero, ante ese pensamiento, se alzaba en mí tal maldad que, me parece, habría aplastado allí mismo a aquella «maldita» Liza si hubiera aparecido de repente a mi lado; la habría insultado, escupido, echado, golpeado.`,
    a: "Fiódor Dostoievski",
    obra: "Memorias del subsuelo, Fiódor Dostoievski",
    highlight: "Algo no moría dentro de mí.",
    lang: "es"
  },
  {
    t: `Pasaron, sin embargo, un día, otro, un tercero: ella no venía, y yo empezaba a tranquilizarme. Después de las nueve me animaba especialmente y hasta comenzaba a soñar, y con bastante dulzura:

«Yo, por ejemplo, salvo a Liza precisamente porque viene a verme y yo le hablo… Yo la desarrollo, la instruyo. Finalmente advierto que me ama, que me ama apasionadamente. Finjo que no lo comprendo —aunque no sé para qué lo finjo; probablemente para embellecer la escena—».`,
    a: "Fiódor Dostoievski",
    obra: "Memorias del subsuelo, Fiódor Dostoievski",
    highlight: "Yo, por ejemplo, salvo a Liza.",
    lang: "es"
  },
  {
    t: `Ella se sentó de inmediato y obedientemente, mirándome con los ojos muy abiertos y esperando, evidentemente, algo de mí en aquel mismo instante. Precisamente aquella ingenuidad de la espera me hizo montar en cólera, pero me contuve.

En ese momento habría debido esforzarme por no notar nada, como si todo fuese corriente, pero ella… Y sentí vagamente que pagaría muy caro por todo aquello.`,
    a: "Fiódor Dostoievski",
    obra: "Memorias del subsuelo, Fiódor Dostoievski",
    highlight: "Pagaría muy caro por todo aquello.",
    lang: "es"
  },
  {
    t: `—Liza, ¿me desprecias? —dije, mirándola fijamente, temblando de impaciencia por saber qué pensaba.

Se turbó y no supo responder nada.

—¡Bebe el té! —dije con maldad.

Estaba enfadado conmigo mismo, pero, naturalmente, quien debía pagarlo era ella. De pronto hirvió en mi corazón una rabia terrible contra ella; me parece que habría podido matarla. Para vengarme, me juré mentalmente no decirle una sola palabra en todo aquel tiempo.

«Ella tiene la culpa de todo», pensaba.`,
    a: "Fiódor Dostoievski",
    obra: "Memorias del subsuelo, Fiódor Dostoievski",
    highlight: "Estaba enfadado conmigo mismo, pero, naturalmente, quien debía pagarlo era ella.",
    lang: "es"
  },
  {
    t: `Yo ya no podía amar porque, repito, amar significaba para mí tiranizar y mantener una superioridad moral. Durante toda mi vida no pude siquiera imaginarme otro amor; y he llegado hasta el punto de pensar algunas veces, ahora, que el amor consiste precisamente en el derecho a tiranizar concedido voluntariamente por el ser amado.

Tampoco en mis sueños del subsuelo imaginaba el amor de otra forma que como una lucha: siempre lo empezaba por el odio y lo terminaba mediante el sometimiento moral; y después ya no podía imaginar qué hacer con el ser sometido.`,
    a: "Fiódor Dostoievski",
    obra: "Memorias del subsuelo, Fiódor Dostoievski",
    highlight: "Amar significaba para mí tiranizar.",
    lang: "es"
  },
  {
    t: `Me resultaba insoportablemente penoso que ella estuviese allí. Quería que desapareciera. Deseaba «tranquilidad»; deseaba quedarme solo en el subsuelo.

La «vida viva», por falta de costumbre, me aplastó hasta tal punto que incluso se me hizo difícil respirar.`,
    a: "Fiódor Dostoievski",
    obra: "Memorias del subsuelo, Fiódor Dostoievski",
    highlight: "La «vida viva», por falta de costumbre, me aplastó.",
    lang: "es"
  },
  {
    t: `Todos hemos perdido la costumbre de vivir; todos cojeamos, unos más y otros menos. Hasta tal punto la hemos perdido que a veces sentimos cierta repugnancia hacia la verdadera «vida viva», y por eso no soportamos que nos la recuerden.

Hemos llegado al extremo de considerar la verdadera «vida viva» casi como un trabajo, casi como un servicio, y todos estamos interiormente de acuerdo en que es mejor según los libros.`,
    a: "Fiódor Dostoievski",
    obra: "Memorias del subsuelo, Fiódor Dostoievski",
    highlight: "Todos hemos perdido la costumbre de vivir.",
    lang: "es"
  },
  {
    t: `Déjennos solos, sin libros, e inmediatamente nos enredaremos, nos perderemos; no sabremos a qué adherirnos, qué sostener, qué amar y qué odiar, qué respetar y qué despreciar.

Nos pesa incluso ser hombres: hombres con un cuerpo verdadero, propio, y con sangre; nos avergonzamos de ello, lo consideramos una deshonra y procuramos ser una especie de inexistentes hombres universales.

Somos nacidos muertos, y desde hace mucho ya ni siquiera nacemos de padres vivos; y eso nos gusta cada vez más. Le estamos tomando el gusto. Pronto inventaremos algún modo de nacer de una idea.`,
    a: "Fiódor Dostoievski",
    obra: "Memorias del subsuelo, Fiódor Dostoievski",
    highlight: "Somos nacidos muertos.",
    lang: "es"
  }
];

const EL_HORLA_QUOTES = [
  {
    t: `¡Qué día admirable! He pasado toda la mañana tendido sobre la hierba, delante de mi casa, bajo el enorme plátano que la cubre, la protege y la sombrea por entero.

Amo este país y amo vivir en él porque aquí tengo mis raíces, esas raíces profundas y delicadas que atan a un hombre a la tierra donde nacieron y murieron sus antepasados; que lo atan a lo que se piensa y a lo que se come, a los usos como a los alimentos, a las expresiones del lugar, a las entonaciones de los campesinos, a los olores del suelo, de los pueblos y del aire mismo.`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "Aquí tengo mis raíces.",
    lang: "es"
  },
  {
    t: `¿De dónde vienen esas influencias misteriosas que transforman nuestra felicidad en desaliento y nuestra confianza en angustia? Se diría que el aire, el aire invisible, está lleno de Potencias desconocidas cuyas misteriosas cercanías padecemos.

Despierto lleno de alegría, con deseos de cantar en la garganta. ¿Por qué? Bajo junto al agua; y de pronto, después de un breve paseo, regreso desolado, como si alguna desgracia me esperara en casa.`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "El aire invisible está lleno de Potencias desconocidas.",
    lang: "es"
  },
  {
    t: `¡Qué profundo es este misterio de lo Invisible! No podemos sondearlo con nuestros miserables sentidos, con nuestros ojos, que no saben percibir ni lo demasiado pequeño ni lo demasiado grande, ni lo demasiado cercano ni lo demasiado lejano, ni los habitantes de una estrella ni los habitantes de una gota de agua…

¡Ah! Si tuviéramos otros órganos que realizaran para nosotros otros milagros, ¡cuántas cosas descubriríamos todavía a nuestro alrededor!`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "¡Qué profundo es este misterio de lo Invisible!",
    lang: "es"
  },
  {
    t: `Apenas entro, doy dos vueltas a la llave y echo los cerrojos; tengo miedo… ¿de qué?… Hasta ahora no temía nada… abro los armarios, miro debajo de la cama; escucho… escucho… ¿qué?…

Después me acuesto y espero el sueño como se esperaría al verdugo. Lo espero con el espanto de su llegada; y mi corazón late, y mis piernas tiemblan; y todo mi cuerpo se estremece en el calor de las sábanas.`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "Espero el sueño como se esperaría al verdugo.",
    lang: "es"
  },
  {
    t: `Duermo —mucho tiempo— dos o tres horas; después un sueño —no— una pesadilla me oprime. Siento perfectamente que estoy acostado y que duermo… lo siento y lo sé… y siento también que alguien se acerca a mí, me mira, me toca, sube a mi cama, se arrodilla sobre mi pecho, me toma el cuello entre las manos y aprieta… aprieta… con todas sus fuerzas para estrangularme.

Yo me debato, atado por esa impotencia atroz que nos paraliza en los sueños; quiero gritar —no puedo—; quiero moverme —no puedo—.`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "Quiero gritar —no puedo—.",
    lang: "es"
  },
  {
    t: `Aceleré el paso, inquieto por estar solo en aquel bosque, asustado sin razón, estúpidamente, por la profunda soledad. De pronto me pareció que me seguían, que caminaban sobre mis talones, muy cerca, hasta tocarme.

Me volví bruscamente. Estaba solo. No vi detrás de mí más que la avenida recta y ancha, vacía, alta, terriblemente vacía; y al otro lado se extendía también hasta perderse de vista, idéntica, espantosa.`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "Asustado por la profunda soledad.",
    lang: "es"
  },
  {
    t: `—Si existieran sobre la tierra otros seres distintos de nosotros, ¿cómo no los conoceríamos desde hace mucho tiempo? ¿Cómo no los habría visto usted? ¿Cómo no los habría visto yo?

Él respondió:

—¿Acaso vemos la cienmilésima parte de lo que existe? Mire el viento, que derriba hombres, abate edificios, arranca árboles, levanta el mar en montañas de agua, mata, silba, gime, ruge… ¿lo ha visto usted?, ¿puede verlo? Existe, sin embargo.`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "¿Puede verlo? Existe, sin embargo.",
    lang: "es"
  },
  {
    t: `Esta noche he sentido a alguien agazapado sobre mí, que, con la boca sobre la mía, bebía mi vida entre mis labios. Sí, la extraía de mi garganta como lo habría hecho una sanguijuela.

Después se levantó, saciado, y yo desperté tan magullado, quebrantado, aniquilado, que ya no podía moverme.`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "Bebía mi vida entre mis labios.",
    lang: "es"
  },
  {
    t: `¿Habían bebido aquella agua? ¿Quién? ¿Yo? ¿Yo, sin duda? No podía haber sido más que yo. Entonces era sonámbulo; vivía, sin saberlo, esa doble vida misteriosa que hace dudar de si existen dos seres en nosotros, o de si un ser extraño, incognoscible e invisible anima por momentos, cuando nuestra alma está adormecida, nuestro cuerpo cautivo, que obedece a ese otro como a nosotros mismos, más que a nosotros mismos.`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "Vivía, sin saberlo, esa doble vida misteriosa.",
    lang: "es"
  },
  {
    t: `Me vuelvo loco. Han vuelto a beber toda mi jarra esta noche; o, más bien, ¡la he bebido yo!

Pero ¿soy yo? ¿Soy yo? ¿Quién sería? ¿Quién? ¡Oh, Dios mío! ¿Me vuelvo loco? ¿Quién me salvará?`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "Pero ¿soy yo? ¿Soy yo?",
    lang: "es"
  },
  {
    t: `La soledad es peligrosa para las inteligencias que trabajan. Necesitamos a nuestro alrededor hombres que piensen y que hablen. Cuando permanecemos solos durante mucho tiempo, poblamos el vacío de fantasmas.

¡Qué débil es nuestra cabeza, cómo se asusta y cómo se extravía rápidamente en cuanto un pequeño hecho incomprensible nos golpea!`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "Poblamos el vacío de fantasmas.",
    lang: "es"
  },
  {
    t: `Muchas personas a quienes he contado esta aventura se han burlado de mí. Ya no sé qué pensar.

El sabio dice: ¿quizá?`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "El sabio dice: ¿quizá?",
    lang: "es"
  },
  {
    t: `Esta vez no estoy loco. He visto… he visto… ¡he visto!… Ya no puedo dudar… ¡he visto!… Todavía tengo frío hasta en las uñas… todavía tengo miedo hasta en la médula… ¡he visto!…`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "He visto… he visto… ¡he visto!",
    lang: "es"
  },
  {
    t: `Vi, vi claramente, muy cerca de mí, el tallo de una de aquellas rosas inclinarse, como si una mano invisible lo hubiera torcido; después quebrarse, como si aquella mano la hubiese cortado.

Luego la flor se elevó, siguiendo la curva que habría descrito un brazo al llevarla hacia una boca, y permaneció suspendida en el aire transparente, sola, inmóvil, espantosa mancha roja a tres pasos de mis ojos.`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "Suspendida en el aire transparente, sola, inmóvil.",
    lang: "es"
  },
  {
    t: `Me creería loco, completamente loco, si no fuese consciente, si no conociera perfectamente mi estado, si no lo sondeara analizándolo con absoluta lucidez.

No sería, pues, en definitiva, más que un alucinado que razona. Un trastorno desconocido se habría producido en mi cerebro; y ese trastorno habría abierto en mi espíritu, en el orden y la lógica de mis ideas, una grieta profunda.`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "Un alucinado que razona.",
    lang: "es"
  },
  {
    t: `He visto locos; he conocido algunos que permanecían inteligentes, lúcidos, clarividentes incluso en todas las cosas de la vida, salvo en un punto.

Hablaban de todo con claridad, con flexibilidad, con profundidad, y de pronto su pensamiento, al tocar el escollo de su locura, se desgarraba en pedazos, se dispersaba y se hundía en ese océano espantoso y furioso, lleno de olas saltarinas, de nieblas y de borrascas, al que llaman «la demencia».`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "El océano espantoso y furioso de la demencia.",
    lang: "es"
  },
  {
    t: `Ya no tengo fuerza alguna, ningún valor, ningún dominio sobre mí, ni siquiera poder para poner en movimiento mi voluntad.

Ya no puedo querer; pero alguien quiere por mí; y yo obedezco.`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "Alguien quiere por mí; y yo obedezco.",
    lang: "es"
  },
  {
    t: `¡Estoy perdido! ¡Alguien posee mi alma y la gobierna! Alguien ordena todos mis actos, todos mis movimientos, todos mis pensamientos.

Ya no soy nada dentro de mí, nada más que un espectador esclavo y aterrorizado de todas las cosas que realizo. Deseo salir. No puedo. Él no quiere; y permanezco, enloquecido, temblando, en el sillón donde me mantiene sentado.`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "Ya no soy nada dentro de mí.",
    lang: "es"
  },
  {
    t: `Después, de pronto, es preciso, es preciso, es preciso que vaya al fondo de mi jardín a recoger fresas y a comerlas. Y voy. Recojo fresas y me las como.

¡Oh, Dios mío! ¡Dios mío! ¡Dios mío! ¿Existe Dios? Si existe, libéreme, sálveme, socórrame. ¡Perdón! ¡Piedad! ¡Gracia! ¡Sálveme! ¡Oh, qué sufrimiento! ¡Qué tortura! ¡Qué horror!`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "Es preciso, es preciso, es preciso.",
    lang: "es"
  },
  {
    t: `Sufría una voluntad extraña introducida en ella, como otra alma, como otra alma parásita y dominadora. ¿Va a acabarse el mundo?

Pero quien me gobierna, ¿quién es, ese invisible? ¿Ese incognoscible, ese merodeador de una raza sobrenatural?`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "Como otra alma parásita y dominadora.",
    lang: "es"
  },
  {
    t: `Pude escapar hoy durante dos horas, como un prisionero que encuentra abierta, por casualidad, la puerta de su calabozo. Sentí de pronto que era libre y que él estaba lejos.

Pero, al volver a subir al coche, quise decir: «¡A la estación!», y grité —no dije, grité— con una voz tan fuerte que los transeúntes se volvieron: «¡A casa!», y caí, enloquecido de angustia, sobre el asiento de mi carruaje.

Me había encontrado y recuperado.`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "Me había encontrado y recuperado.",
    lang: "es"
  },
  {
    t: `Se diría que el hombre, desde que piensa, ha presentido y temido a un ser nuevo, más fuerte que él, su sucesor en este mundo; y que, sintiéndolo cercano y no pudiendo prever la naturaleza de ese amo, ha creado, dentro de su terror, todo el pueblo fantástico de los seres ocultos, vagos fantasmas nacidos del miedo.

Somos tan débiles, tan desarmados, tan ignorantes, tan pequeños, nosotros, sobre este grano de barro que gira diluido en una gota de agua.`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "Vagos fantasmas nacidos del miedo.",
    lang: "es"
  },
  {
    t: `De pronto me pareció que una página del libro que había quedado abierto sobre mi mesa acababa de volverse sola. Ninguna ráfaga de aire había entrado por la ventana. Me sorprendí y esperé.

Al cabo de unos cuatro minutos vi, vi, sí, vi con mis propios ojos otra página levantarse y caer sobre la anterior, como si un dedo la hojeara. Mi sillón estaba vacío, parecía vacío; pero comprendí que él estaba allí, él, sentado en mi lugar, y que leía.`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "Mi sillón estaba vacío, parecía vacío.",
    lang: "es"
  },
  {
    t: `De un salto furioso, de un salto de bestia rebelada que va a destripar a su domador, atravesé la habitación para agarrarlo, para estrecharlo, para matarlo…

Pero mi asiento, antes de que pudiera alcanzarlo, se volcó como si alguien hubiese huido delante de mí; mi mesa osciló, mi lámpara cayó y se apagó, y mi ventana se cerró como si un malhechor sorprendido se hubiera lanzado a la noche.

Por tanto, había huido; había tenido miedo, ¡miedo de mí, él!`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "Había tenido miedo, ¡miedo de mí, él!",
    lang: "es"
  },
  {
    t: `Me incorporé con las manos extendidas, volviéndome tan deprisa que estuve a punto de caer. ¿Y bien?… Se veía como a plena luz, ¡y yo no me vi en el espejo!… Estaba vacío, claro, profundo, lleno de luz. Mi imagen no estaba dentro… ¡y yo estaba delante!

No me atrevía a avanzar, no me atrevía a hacer un movimiento, aunque sentía perfectamente que él estaba allí, él, cuyo cuerpo imperceptible había devorado mi reflejo.`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "Su cuerpo imperceptible había devorado mi reflejo.",
    lang: "es"
  },
  {
    t: `La casa ya no era más que una hoguera horrible y magnífica, una hoguera monstruosa que iluminaba toda la tierra, una hoguera en la que ardían hombres y en la que también ardía Él, Él, mi prisionero, el Ser nuevo, el nuevo amo, ¡el Horla!

¿Muerto? Quizá… ¿Su cuerpo? ¿Aquel cuerpo atravesado por la luz no sería indestructible por los medios que matan los nuestros?`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "El Ser nuevo, el nuevo amo, el Horla.",
    lang: "es"
  },
  {
    t: `No… no… sin ninguna duda, sin ninguna duda… no ha muerto…

Entonces… entonces… ¡tendré que matarme yo!…`,
    a: "Guy de Maupassant",
    obra: "El Horla, Guy de Maupassant",
    highlight: "¡Tendré que matarme yo!",
    lang: "es"
  }
];


const SALA_NUMERO_SEIS_QUOTES = [
  {
    t: `En el patio del hospital se alza un pequeño pabellón, rodeado por todo un bosque de bardanas, ortigas y cáñamo silvestre. El tejado está oxidado, la chimenea se ha derrumbado a medias, los escalones del porche se han podrido y están cubiertos de hierba, y del enlucido no quedan más que huellas. La fachada delantera mira al hospital; la trasera, al campo, del que la separa la cerca gris del hospital, con clavos.

Esos clavos, con las puntas vueltas hacia arriba, la cerca y el propio pabellón tienen ese particular aspecto lúgubre y maldito que entre nosotros solo tienen los edificios de hospitales y prisiones.`,
    a: "Antón Chéjov",
    obra: "La sala número seis, Antón Chéjov",
    highlight: "ese particular aspecto lúgubre y maldito",
    lang: "es"
  },
  {
    t: `Pertenece a esa clase de hombres ingenuos, positivos, cumplidores y estúpidos que, más que ninguna otra cosa en el mundo, aman el orden y, por eso, están convencidos de que hay que pegarles.

Golpea en la cara, en el pecho, en la espalda, donde caiga, y está seguro de que sin eso no habría aquí orden.`,
    a: "Antón Chéjov",
    obra: "La sala número seis, Antón Chéjov",
    highlight: "sin eso no habría aquí orden.",
    lang: "es"
  },
  {
    t: `Me gusta su rostro ancho, de pómulos salientes, siempre pálido y desdichado, que refleja en sí, como en un espejo, un alma atormentada por la lucha y por un miedo prolongado. Sus muecas son extrañas y enfermizas, pero los rasgos delicados que un sufrimiento profundo y sincero ha trazado sobre su rostro son sensatos e inteligentes, y en sus ojos hay un brillo cálido y sano.

Me gusta él mismo: cortés, servicial y extraordinariamente delicado en su trato con todos, salvo con Nikita.`,
    a: "Antón Chéjov",
    obra: "La sala número seis, Antón Chéjov",
    highlight: "un alma atormentada por la lucha y por un miedo prolongado.",
    lang: "es"
  },
  {
    t: `Pero pronto el deseo de hablar se impone a cualquier consideración, y él se abandona y habla con ardor y apasionadamente. Su discurso es desordenado, febril como un delirio, impetuoso y no siempre comprensible; pero, en cambio, se oye en él —tanto en las palabras como en la voz— algo extraordinariamente bueno.

Cuando habla, se reconocen en él al loco y al hombre. Es difícil trasladar al papel su discurso demente. Habla de la bajeza humana, de la violencia que pisotea la verdad, de la hermosa vida que habrá algún día sobre la tierra, de las rejas de las ventanas, que a cada instante le recuerdan la estupidez y la crueldad de los violentos. Resulta un popurrí desordenado y desmañado de canciones antiguas, pero aún no terminadas de cantar.`,
    a: "Antón Chéjov",
    obra: "La sala número seis, Antón Chéjov",
    highlight: "se reconocen en él al loco y al hombre.",
    lang: "es"
  },
  {
    t: `Las personas que mantienen una relación profesional, de trabajo, con el sufrimiento ajeno —por ejemplo, jueces, policías y médicos—, con el tiempo, por la fuerza de la costumbre, se endurecen hasta tal punto que, aunque quisieran, no podrían tratar a sus clientes de otro modo que formalmente; en este sentido no se diferencian en nada del campesino que degüella carneros y terneros en el patio trasero y no repara en la sangre.

Con un trato formal y desalmado hacia la persona, para privar a un inocente de todos sus derechos y condenarlo a trabajos forzados, el juez solo necesita una cosa: tiempo. Solo tiempo para cumplir ciertas formalidades por las que recibe un salario; después, todo ha terminado.`,
    a: "Antón Chéjov",
    obra: "La sala número seis, Antón Chéjov",
    highlight: "Solo tiempo para cumplir ciertas formalidades",
    lang: "es"
  },
  {
    t: `Después de inspeccionar el hospital, Andréi Yefímich llegó a la conclusión de que aquella institución era inmoral y extremadamente perjudicial para la salud de los habitantes. A su juicio, lo más sensato que podía hacerse era poner en libertad a los enfermos y cerrar el hospital.

Pero razonó que para ello no bastaba únicamente su voluntad y que sería inútil: si se expulsaba de un lugar la suciedad física y moral, pasaría a otro; había que esperar a que se disipara por sí sola.`,
    a: "Antón Chéjov",
    obra: "La sala número seis, Antón Chéjov",
    highlight: "había que esperar a que se disipara por sí sola.",
    lang: "es"
  },
  {
    t: `Andréi Yefímich ama extraordinariamente la inteligencia y la honradez; pero, para organizar a su alrededor una vida inteligente y honrada, le faltan carácter y fe en su propio derecho. Es decididamente incapaz de ordenar, prohibir e insistir. Parece como si hubiera hecho voto de no elevar nunca la voz ni emplear el modo imperativo. Le cuesta decir «dame» o «trae»; cuando tiene hambre, tose indeciso y dice a la cocinera: «Como si me apeteciera un poco de té…» o «Como si me apeteciera comer».

Decirle al administrador que deje de robar, expulsarlo o suprimir por completo aquel cargo innecesario y parasitario supera totalmente sus fuerzas. Cuando los enfermos se quejan de hambre o de la rudeza de los cuidadores, se turba y murmura con sentimiento de culpa:

—Bien, bien, luego lo investigaré… Probablemente haya aquí algún malentendido…`,
    a: "Antón Chéjov",
    obra: "La sala número seis, Antón Chéjov",
    highlight: "Probablemente haya aquí algún malentendido…",
    lang: "es"
  },
  {
    t: `—Es verdad, tenemos libros, pero no son en absoluto lo mismo que la conversación viva y el trato humano. Si me permite una comparación no del todo afortunada, los libros son las notas, y la conversación, el canto.`,
    a: "Antón Chéjov",
    obra: "La sala número seis, Antón Chéjov",
    highlight: "los libros son las notas, y la conversación, el canto.",
    lang: "es"
  },
  {
    t: `La vida es una trampa irritante. Cuando un hombre que piensa alcanza la madurez y llega a una conciencia madura, se siente involuntariamente como en una trampa de la que no hay salida.

En efecto, contra su voluntad, ciertas casualidades lo han llamado desde la nada a la vida… ¿Para qué? Quiere conocer el sentido y la finalidad de su existencia; no se lo dicen o le dicen absurdos. Llama: no le abren. La muerte viene a buscarlo, también contra su voluntad.`,
    a: "Antón Chéjov",
    obra: "La sala número seis, Antón Chéjov",
    highlight: "La vida es una trampa irritante.",
    lang: "es"
  },
  {
    t: `¿Por qué los centros y las circunvoluciones cerebrales, por qué la vista, el habla, la conciencia de sí, el genio, si todo ello está destinado a irse a la tierra y, finalmente, a enfriarse junto con la corteza terrestre y después, durante millones de años, a dar vueltas con la Tierra alrededor del Sol, sin sentido ni finalidad?

Para enfriarse y después dar vueltas no hacía ninguna falta extraer de la nada al hombre, con su inteligencia elevada, casi divina, y luego, como por burla, convertirlo en arcilla.`,
    a: "Antón Chéjov",
    obra: "La sala número seis, Antón Chéjov",
    highlight: "como por burla, convertirlo en arcilla.",
    lang: "es"
  },
  {
    t: `«Sirvo a una causa perjudicial y recibo un salario de las personas a quienes engaño; no soy honrado. Pero yo, por mí mismo, no soy nada: solo soy una partícula de un mal social necesario; todos los funcionarios de distrito son perjudiciales y reciben gratuitamente su salario…

Por tanto, no soy yo el culpable de mi falta de honradez, sino la época… Si hubiera nacido doscientos años más tarde, sería otro».`,
    a: "Antón Chéjov",
    obra: "La sala número seis, Antón Chéjov",
    highlight: "no soy yo el culpable de mi falta de honradez, sino la época…",
    lang: "es"
  },
  {
    t: `—Sí, estoy enfermo. Pero decenas, centenares de locos pasean en libertad porque vuestra ignorancia es incapaz de distinguirlos de los sanos. ¿Por qué yo y estos desgraciados tenemos que permanecer aquí por todos los demás, como chivos expiatorios? Usted, el practicante, el administrador y toda vuestra chusma hospitalaria están moralmente a una distancia inconmensurablemente inferior a cada uno de nosotros; ¿por qué, entonces, nosotros estamos encerrados y ustedes no? ¿Dónde está la lógica?

—La moral y la lógica no tienen nada que ver con esto. Todo depende de la casualidad. A quien encerraron, está encerrado; a quien no encerraron, pasea. Eso es todo. En que yo sea médico y usted un enfermo mental no hay ni moral ni lógica, sino únicamente una casualidad vacía.`,
    a: "Antón Chéjov",
    obra: "La sala número seis, Antón Chéjov",
    highlight: "únicamente una casualidad vacía.",
    lang: "es"
  },
  {
    t: `—Usted no cree, pero yo sí. En Dostoievski o en Voltaire alguien dice que, si Dios no existiera, los hombres lo inventarían. Y yo creo profundamente que, si no existe la inmortalidad, tarde o temprano la gran inteligencia humana la inventará.

—Bien dicho —pronunció Andréi Yefímich, sonriendo de placer—. Está bien que crea. Con una fe semejante se puede vivir cantando incluso emparedado.`,
    a: "Antón Chéjov",
    obra: "La sala número seis, Antón Chéjov",
    highlight: "la gran inteligencia humana la inventará.",
    lang: "es"
  },
  {
    t: `—¡Su Diógenes era un imbécil! —pronunció sombríamente Iván Dmítrich—. ¿Por qué me habla de Diógenes y de no sé qué comprensión? —se enfureció de pronto y se levantó de un salto—. ¡Amo la vida, la amo apasionadamente! Sufro manía persecutoria, un miedo constante y atormentador, pero hay momentos en que se apodera de mí una sed de vida, y entonces temo volverme loco. ¡Deseo vivir terriblemente, terriblemente!

Recorrió la sala agitado y dijo, bajando la voz:

—Cuando sueño, me visitan fantasmas. Vienen a verme ciertas personas, oigo voces, música, y me parece que paseo por ciertos bosques, por la orilla del mar, y deseo tan apasionadamente el bullicio, las preocupaciones… Dígame, ¿qué hay de nuevo allí? ¿Qué hay allí?`,
    a: "Antón Chéjov",
    obra: "La sala número seis, Antón Chéjov",
    highlight: "¡Deseo vivir terriblemente, terriblemente!",
    lang: "es"
  },
  {
    t: `—Comprensión… —Iván Dmítrich hizo una mueca—. Lo exterior, lo interior… Discúlpeme, no entiendo nada de eso. Solo sé —dijo, levantándose y mirando airadamente al médico—, sé que Dios me creó de sangre caliente y nervios, ¡sí, señor! Y el tejido orgánico, si posee capacidad para vivir, debe reaccionar a toda irritación. ¡Y yo reacciono!

Al dolor respondo con gritos y lágrimas; a la bajeza, con indignación; a la abominación, con repugnancia. A mi juicio, eso es propiamente lo que se llama vida. Cuanto más bajo es un organismo, menos sensible es y más débilmente responde a la irritación; cuanto más elevado, más receptivo es y con mayor energía reacciona a la realidad.`,
    a: "Antón Chéjov",
    obra: "La sala número seis, Antón Chéjov",
    highlight: "eso es propiamente lo que se llama vida.",
    lang: "es"
  },
  {
    t: `Una doctrina que predica la indiferencia hacia la riqueza y las comodidades de la vida, el desprecio por el sufrimiento y la muerte, resulta completamente incomprensible para la inmensa mayoría, porque esa mayoría nunca ha conocido ni la riqueza ni las comodidades de la vida.

Despreciar el sufrimiento significaría para ella despreciar la vida misma, pues todo el ser humano se compone de las sensaciones del hambre, el frío, las ofensas, las pérdidas y el miedo hamletiano a la muerte. En esas sensaciones está toda la vida: se puede estar cansado de ella, odiarla, pero no despreciarla.`,
    a: "Antón Chéjov",
    obra: "La sala número seis, Antón Chéjov",
    highlight: "se puede estar cansado de ella, odiarla, pero no despreciarla.",
    lang: "es"
  },
  {
    t: `—¿Y Cristo? Cristo respondió a la realidad llorando, sonriendo, entristeciéndose, encolerizándose, incluso angustiándose; no salió al encuentro del sufrimiento con una sonrisa ni despreció la muerte, sino que rezó en el jardín de Getsemaní para que aquella copa pasara de él.`,
    a: "Antón Chéjov",
    obra: "La sala número seis, Antón Chéjov",
    highlight: "Cristo respondió a la realidad",
    lang: "es"
  },
  {
    t: `—Y usted desprecia el sufrimiento y no se asombra de nada por una razón muy sencilla: vanidad de vanidades, lo exterior y lo interior, desprecio de la vida, del sufrimiento y de la muerte, comprensión, verdadero bien… Todo eso es la filosofía más apropiada para el holgazán ruso.

Ve usted, por ejemplo, que un campesino pega a su mujer. ¿Para qué intervenir? Que le pegue; de todos modos, ambos morirán tarde o temprano; y, además, el que pega no ofende con los golpes a quien recibe los golpes, sino a sí mismo. Emborracharse es estúpido e indecoroso, pero beber es morir y no beber es morir.`,
    a: "Antón Chéjov",
    obra: "La sala número seis, Antón Chéjov",
    highlight: "la filosofía más apropiada para el holgazán ruso.",
    lang: "es"
  },
  {
    t: `—Nos mantienen aquí tras las rejas, nos dejan pudrirnos, nos torturan; pero eso es hermoso y razonable, porque entre esta sala y un despacho cálido y confortable no existe diferencia alguna.

Una filosofía cómoda: no hay que hacer nada, la conciencia queda limpia y uno se siente sabio… No, señor, eso no es filosofía, ni pensamiento, ni amplitud de miras, sino pereza, faquirismo, estupor somnoliento… ¡Sí! —Iván Dmítrich volvió a enfurecerse—. Desprecia usted el sufrimiento, pero seguro que, si una puerta le atrapara un dedo, gritaría a pleno pulmón.`,
    a: "Antón Chéjov",
    obra: "La sala número seis, Antón Chéjov",
    highlight: "Una filosofía cómoda",
    lang: "es"
  },
  {
    t: `Andréi Yefímich se acercó a la ventana y miró al campo. Ya estaba oscureciendo, y a la derecha del horizonte ascendía una luna fría, de color púrpura. No lejos de la cerca del hospital, a unas cien brazas, no más, se alzaba un edificio blanco y alto, rodeado por un muro de piedra. Era la prisión.

«¡Ahí está la realidad!», pensó Andréi Yefímich, y sintió miedo.

Le daban miedo la luna, la prisión, los clavos de la cerca y la llama lejana de la fábrica de huesos.`,
    a: "Antón Chéjov",
    obra: "La sala número seis, Antón Chéjov",
    highlight: "¡Ahí está la realidad!",
    lang: "es"
  },
  {
    t: `—No se puede ir a ninguna parte, a ninguna. Somos débiles, amigo mío… Yo era indiferente, razonaba animosa y sensatamente, pero bastó que la vida me tocara rudamente para que me viniera abajo… postración… Somos débiles, somos miserables…

Y usted también, amigo mío. Es inteligente, noble, mamó con la leche materna buenos impulsos; pero apenas entró en la vida, se cansó y enfermó… ¡Débiles, débiles!`,
    a: "Antón Chéjov",
    obra: "La sala número seis, Antón Chéjov",
    highlight: "bastó que la vida me tocara",
    lang: "es"
  },
  {
    t: `Después todo quedó en silencio. La luz líquida de la luna atravesaba las rejas, y sobre el suelo había una sombra semejante a una red. Daba miedo. Andréi Yefímich se tendió y contuvo la respiración; esperaba con horror que volvieran a golpearlo. Era como si alguien hubiera cogido una hoz, se la hubiera clavado y la hiciera girar varias veces dentro del pecho y de las entrañas.

Por el dolor mordió la almohada y apretó los dientes; y de pronto, en medio del caos, cruzó claramente por su cabeza una idea terrible e insoportable: aquellos hombres, que ahora parecían sombras negras bajo la luz de la luna, debían de haber sentido durante años, día tras día, exactamente el mismo dolor. ¿Cómo había podido suceder que durante más de veinte años no lo supiera ni quisiera saberlo?`,
    a: "Antón Chéjov",
    obra: "La sala número seis, Antón Chéjov",
    highlight: "no lo supiera ni quisiera saberlo",
    lang: "es"
  },
  {
    t: `Al atardecer, Andréi Yefímich murió de un ataque de apoplejía. Primero sintió un escalofrío estremecedor y náuseas; algo repugnante, según le pareció, penetró en todo su cuerpo, incluso en los dedos, ascendió del estómago hacia la cabeza y le inundó los ojos y los oídos. Todo se volvió verde ante sus ojos. Andréi Yefímich comprendió que había llegado su final y recordó que Iván Dmítrich, Mijaíl Averyánich y millones de personas creían en la inmortalidad. ¿Y si existiera? Pero no deseaba la inmortalidad, y solo pensó en ella durante un instante.`,
    a: "Antón Chéjov",
    obra: "La sala número seis, Antón Chéjov",
    highlight: "No deseaba la inmortalidad.",
    lang: "es"
  }
];

const LA_BESTIA_EN_LA_JUNGLA_QUOTES = [
  {
    t: `Su rostro, un recordatorio, aunque no exactamente un recuerdo, había empezado simplemente por turbarlo de una manera bastante agradable. Lo afectaba como la continuación de algo cuyo comienzo había perdido. Lo reconocía, y por el momento casi lo acogía, como una continuación, pero no sabía qué continuaba.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "la continuación de algo cuyo comienzo había perdido.",
    lang: "es"
  },
  {
    t: `—Usted dijo que había tenido desde sus primeros años, como la cosa más profunda dentro de usted, la sensación de estar reservado para algo raro y extraño, posiblemente prodigioso y terrible, que tarde o temprano habría de sucederle; que llevaba en los huesos su presentimiento y su convicción, y que quizá lo arrollaría.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "la sensación de estar reservado para algo raro y extraño",
    lang: "es"
  },
  {
    t: `—Bueno, digamos que esperarlo: tener que encontrarlo, afrontarlo, verlo irrumpir de pronto en mi vida; posiblemente destruyendo toda conciencia ulterior, posiblemente aniquilándome; posiblemente, por otra parte, alterándolo únicamente todo, golpeando la raíz de todo mi mundo y dejándome entregado a las consecuencias, adopten estas la forma que adopten.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "verlo irrumpir de pronto en mi vida",
    lang: "es"
  },
  {
    t: `—¿No será lo que describe simplemente la expectativa —o, en cualquier caso, esa sensación de peligro tan familiar para tantas personas— de caer enamorado?

John Marcher pensó.

—¿Me preguntó eso antes?

—No; entonces no me tomaba tantas libertades. Pero es lo que ahora se me ocurre.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "esa sensación de peligro tan familiar para tantas personas",
    lang: "es"
  },
  {
    t: `—Quiere decir que ha estado enamorado —y, como él se limitó a mirarla en silencio—: ha estado enamorado, y no ha significado semejante cataclismo, ¿no ha resultado ser el gran acontecimiento?

—Aquí me tiene, como ve. No ha sido arrollador.

—Entonces no ha sido amor —dijo May Bartram.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "Entonces no ha sido amor",
    lang: "es"
  },
  {
    t: `—No es cuestión de lo que yo «quiera»: Dios sabe que no quiero nada. Solo es cuestión de la aprensión que me persigue, con la que vivo día tras día.

—¿Es la sensación de una violencia que se aproxima?

—No pienso que, cuando llegue, haya de ser necesariamente violenta. Solo pienso que será natural y, sobre todo, inconfundible. Pienso en ella simplemente como la cosa. La cosa parecerá natural por sí misma.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "la aprensión que me persigue",
    lang: "es"
  },
  {
    t: `—Entonces, ¿yo estaré presente?

—Pero si ya está presente, puesto que lo sabe.

—Comprendo. Pero quiero decir cuando llegue la catástrofe.

Ante esto, por un minuto, la ligereza de ambos cedió a la gravedad; fue como si la larga mirada que intercambiaron los mantuviera unidos.

—Dependerá únicamente de usted: de que quiera vigilar conmigo.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "de que quiera vigilar conmigo.",
    lang: "es"
  },
  {
    t: `Había pensado durante tanto tiempo en sí mismo como abominablemente solo, y he aquí que no estaba solo en absoluto. Al parecer, no lo había estado durante una hora: desde aquellos momentos en la embarcación de Sorrento.

Había sido ella, según le pareció ver al mirarla, quien había estado sola; ella, a quien había dejado así el ingrato hecho de que él faltara a su fidelidad.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "no estaba solo en absoluto.",
    lang: "es"
  },
  {
    t: `Estaban literalmente a flote juntos; para nuestro caballero esto era patente, tan patente como que la causa afortunada de ello era precisamente el tesoro enterrado del conocimiento de ella. Con sus propias manos había desenterrado aquel pequeño depósito, había sacado a la luz —es decir, había puesto al alcance de la tenue claridad constituida por sus discreciones y reservas— el objeto valioso cuyo escondite, después de haberlo enterrado él mismo, había olvidado durante tanto tiempo y de una manera tan extraña.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "el tesoro enterrado del conocimiento de ella.",
    lang: "es"
  },
  {
    t: `Mientras nadie lo supo, se había considerado la persona más desinteresada del mundo: llevaba su carga concentrada, su perpetua espera, con toda tranquilidad; callaba sobre ella, no dejaba que los demás vislumbraran ni la carga ni su efecto sobre su vida, no les pedía consideración alguna y concedía, por su parte, todas las que le pedían.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "su carga concentrada, su perpetua espera",
    lang: "es"
  },
  {
    t: `Algo lo aguardaba, entre las vueltas y revueltas de los meses y los años, como una Bestia agazapada en la Jungla. Poco importaba que la Bestia agazapada estuviese destinada a matarlo o a ser muerta. El punto preciso era el salto inevitable de la criatura; y la lección precisa de aquello era que un hombre de sentimientos no hacía que una dama lo acompañase a una cacería de tigres.

Tal era la imagen bajo la cual había acabado por representarse su vida.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "como una Bestia agazapada en la Jungla.",
    lang: "es"
  },
  {
    t: `Semejante particularidad en la perspectiva de uno era realmente como una joroba en la espalda. La diferencia que introducía en cada minuto del día existía con total independencia de que se hablara de ella. Se conversaba, desde luego, como conversa un jorobado, pues siempre quedaba, aunque no hubiera otra cosa, el rostro del jorobado.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "como una joroba en la espalda.",
    lang: "es"
  },
  {
    t: `Mientras envejecían juntos, ella vigilaba con él, y permitió que aquella asociación diera forma y color a su propia existencia. También bajo las formas de ella había aprendido a instalarse el desprendimiento, y su conducta se había convertido, en el sentido social, en una falsa relación de sí misma.

Solo había una relación de ella que habría sido verdadera durante todo aquel tiempo, y no podía ofrecérsela directamente a nadie, menos que a nadie a John Marcher.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "una falsa relación de sí misma.",
    lang: "es"
  },
  {
    t: `—Nuestro hábito lo salva a usted, por lo menos, ¿no lo ve?, porque a los ojos del vulgo acaba haciéndolo indistinguible de los demás hombres. ¿Cuál es la señal más inveterada de los hombres en general? Pues la capacidad de pasar un tiempo interminable con mujeres aburridas: pasarlo, no diré sin aburrirse, sino sin importarles que ellas lo sean, sin que eso los lance en otra dirección; que viene a ser lo mismo. Yo soy su mujer aburrida, una parte del pan nuestro de cada día que pide usted en la iglesia. Eso cubre sus huellas mejor que ninguna otra cosa.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "Yo soy su mujer aburrida",
    lang: "es"
  },
  {
    t: `—A veces me pregunto si es del todo justo. Justo, quiero decir, haberla implicado tanto y —puesto que puede decirse— haberla interesado. Casi siento como si en realidad no hubiera tenido tiempo para hacer ninguna otra cosa.

—¿Ninguna otra cosa que interesarme? ¡Ah!, ¿qué otra cosa desea nunca uno ser? Si he estado «vigilando» con usted, como acordamos hace mucho tiempo que haría, vigilar es ya, por sí mismo, una absorción.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "vigilar es ya, por sí mismo, una absorción.",
    lang: "es"
  },
  {
    t: `—Lo que veo, según consigo entenderlo, es que ha logrado algo casi sin precedentes en materia de acostumbrarse al peligro. De vivir con él durante tanto tiempo y tan íntimamente, ha perdido la sensación de su presencia; sabe que está ahí, pero permanece indiferente, e incluso ha dejado, como hacía antes, de necesitar silbar en la oscuridad. Teniendo en cuenta qué peligro es —concluyó May Bartram—, debo decir que no creo que su actitud pudiera ser superada fácilmente.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "ha perdido la sensación de su presencia",
    lang: "es"
  },
  {
    t: `—Usted sabe algo que yo no sé.

Entonces su voz, para ser la de un hombre valeroso, tembló un poco.

—Sabe lo que va a suceder.

El silencio de ella, unido al rostro que mostraba, era casi una confesión: lo hizo estar seguro.

—Lo sabe, y tiene miedo de decírmelo. Es tan malo que teme que llegue a descubrirlo.

—Nunca llegará a descubrirlo.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "Usted sabe algo que yo no sé.",
    lang: "es"
  },
  {
    t: `—La ayuda a hacerme pasar por un hombre como los demás. De modo que, si lo soy, tal como la entiendo, usted no queda comprometida. ¿Es eso?

Ella hizo otra de sus pausas, pero habló con bastante claridad:

—Eso es. Es todo cuanto me importa: ayudarlo a pasar por un hombre como los demás.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "ayudarlo a pasar por un hombre como los demás.",
    lang: "es"
  },
  {
    t: `No habría sido un fracaso quedar arruinado, deshonrado, expuesto a la picota, ahorcado; el fracaso era no ser nada. Y así, en el valle oscuro hacia el cual su senda había dado aquel giro imprevisto, tanteaba y se preguntaba no poco.

Ya no le quedaba más que un deseo: no descubrir que lo habían engañado.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "el fracaso era no ser nada.",
    lang: "es"
  },
  {
    t: `Casi tan blanca como la cera, con las marcas y signos del rostro tan numerosos y finos como si una aguja los hubiera grabado, envuelta en suaves paños blancos realzados por una bufanda verde desvaída, sobre cuyo tono delicado los años habían obrado un refinamiento ulterior, era la imagen de una esfinge serena y exquisita, pero impenetrable, cuya cabeza —o, en realidad, toda cuya persona— podía haber sido espolvoreada de plata.

Era una esfinge; sin embargo, con sus pétalos blancos y sus frondas verdes, también podía ser un lirio, solo que un lirio artificial, maravillosamente imitado y conservado siempre, sin polvo ni mancha, bajo una transparente campana de cristal.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "una esfinge serena y exquisita, pero impenetrable",
    lang: "es"
  },
  {
    t: `—Sería lo peor —se permitió decir finalmente—. Quiero decir la cosa que nunca he dicho.

Esto lo hizo callar por un momento.

—¿Más monstruosa que todas las monstruosidades que hemos nombrado?

—Más monstruosa. ¿No es eso lo que expresa suficientemente al llamarla la peor?

—Sin duda, si quiere decir, como yo, algo que incluya toda la pérdida y toda la vergüenza concebibles.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "la cosa que nunca he dicho.",
    lang: "es"
  },
  {
    t: `—La puerta no está cerrada. La puerta está abierta —dijo May Bartram.

—¿Entonces todavía ha de venir algo?

Ella volvió a esperar, siempre con sus ojos fríos y dulces puestos en él.

—Nunca es demasiado tarde.

Con su paso deslizante había reducido la distancia entre ambos, y durante un minuto permaneció más cerca de él, junto a él, como si todavía estuviera cargada de lo no dicho.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "Nunca es demasiado tarde.",
    lang: "es"
  },
  {
    t: `—¿Qué ha sucedido entonces?

Con ayuda de su acompañante, ella volvía a estar en pie; y él, sintiendo que se le imponía la retirada, había encontrado sin saber cómo su sombrero y sus guantes y alcanzado la puerta. Sin embargo, esperó la respuesta.

—Lo que tenía que suceder —dijo ella.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "Lo que tenía que suceder",
    lang: "es"
  },
  {
    t: `—Pero, si no he tenido conciencia de ello y no me ha tocado…

—¡Ah, que no haya tenido conciencia de ello! —y pareció vacilar un instante ante la manera de abordar aquello—. Que no haya tenido conciencia es la extrañeza dentro de la extrañeza. Es la maravilla de la maravilla.

Hablaba con una dulzura casi de niña enferma, pero ahora, al fin, al término de todo, con la perfecta rectitud de una sibila.

—Lo ha tocado —prosiguió—. Ha cumplido su función. Lo ha hecho enteramente suyo.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "la extrañeza dentro de la extrañeza.",
    lang: "es"
  },
  {
    t: `—¿Tan absolutamente sin que yo lo supiera?

—Tan absolutamente sin que lo supiera.

La mano de él, mientras se inclinaba hacia ella, descansaba sobre el brazo de la silla, y ella, aún con aquella débil sonrisa, puso encima la suya.

—Es suficiente que yo lo sepa.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "Es suficiente que yo lo sepa.",
    lang: "es"
  },
  {
    t: `—Nada, para mí, ha pasado; nada pasará hasta que yo mismo pase, lo cual ruego a mis estrellas que suceda lo antes posible. Pero digamos —añadió— que, como usted sostiene, me he comido el pastel hasta la última miga: ¿cómo puede la cosa que nunca he sentido en absoluto ser la cosa que estaba señalado para sentir?

Ella le respondió quizá de manera menos directa, pero sin turbarse:

—Da usted por supuestos sus «sentimientos». Estaba destinado a sufrir su destino. No necesariamente a conocerlo.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "Estaba destinado a sufrir su destino.",
    lang: "es"
  },
  {
    t: `—¿Es de eso, entonces, de lo que está muriendo?

Ella se limitó a observarlo, al principio gravemente, como para ver dónde se encontraba él ahora; y quizá vio algo, o temió algo, que movió su compasión.

—Viviría todavía para usted, si pudiera.

Cerró los ojos por un momento, como si, retirada dentro de sí misma, lo intentara por última vez.

—¡Pero no puedo! —dijo, alzándolos de nuevo para despedirse de él.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "Viviría todavía para usted, si pudiera.",
    lang: "es"
  },
  {
    t: `Marcher avanzaba por la hierba abatida, donde ninguna vida se movía, donde ningún aliento sonaba, donde ningún ojo maligno parecía brillar desde una posible guarida, casi como si buscase vagamente a la Bestia, y aún más como si la echara dolorosamente de menos.

Caminaba por una existencia que se había vuelto extrañamente más espaciosa.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "como si la echara dolorosamente de menos.",
    lang: "es"
  },
  {
    t: `La salida habría sido amarla; entonces, entonces habría vivido. Ella había vivido —¿quién podía decir ahora con qué pasión?—, puesto que lo había amado por él mismo; mientras que él nunca había pensado en ella —¡ah, con qué enormidad resplandecía esto ante él!— sino en el frío de su egoísmo y a la luz de la utilidad de ella.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "La salida habría sido amarla",
    lang: "es"
  },
  {
    t: `Este horror del despertar: esto era el conocimiento, un conocimiento bajo cuyo aliento hasta las lágrimas de sus ojos parecían helarse. A pesar de ellas, trató de fijarlo y retenerlo; lo mantuvo ante sí para poder sentir el dolor.

Eso, por lo menos, tardío y amargo, tenía algo del sabor de la vida.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "tenía algo del sabor de la vida.",
    lang: "es"
  },
  {
    t: `Vio la Jungla de su vida y vio a la Bestia agazapada; entonces, mientras miraba, percibió que, como por una agitación del aire, se alzaba, enorme y horrible, para el salto que acabaría con él.

Sus ojos se oscurecieron: estaba cerca; e, instintivamente, volviéndose en su alucinación para evitarla, se arrojó de bruces sobre la tumba.`,
    a: "Henry James",
    obra: "La bestia en la jungla, Henry James",
    highlight: "el salto que acabaría con él.",
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
  ...RABELAIS_QUOTES,
  ...FRANKENSTEIN_QUOTES,
  ...ANNE_DE_LAS_TEJAS_VERDES_QUOTES,
  ...LA_VIDA_ES_SUENO_QUOTES,
  ...BARTLEBY_QUOTES,
  ...CEREZAS_DEL_CEMENTERIO_QUOTES,
  ...NIEBLA_QUOTES,
  ...CANAS_Y_BARRO_QUOTES,
  ...ORLANDO_QUOTES,
  ...RAYO_QUE_NO_CESA_QUOTES,
  ...PAPA_GORIOT_QUOTES,
  ...DORIAN_GRAY_QUOTES,
  ...IVAN_ILICH_QUOTES,
  ...MEMORIAS_SUBSUELO_QUOTES,
  ...EL_HORLA_QUOTES,
  ...SALA_NUMERO_SEIS_QUOTES,
  ...LA_BESTIA_EN_LA_JUNGLA_QUOTES,
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

const AUTHORS_INFO = Object.freeze({});

const WORKS_INFO = Object.freeze({});

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

const QUOTE_LENGTH_CLASSES = [
  'quote-text--short',
  'quote-text--medium',
  'quote-text--long',
  'quote-text--very-long',
];

function getQuoteLengthClass(text) {
  const content = typeof text === 'string' ? text.trim() : '';
  const characterCount = Array.from(content).length;

  if (characterCount < 260) return 'quote-text--short';
  if (characterCount <= 520) return 'quote-text--medium';
  if (characterCount <= 900) return 'quote-text--long';
  return 'quote-text--very-long';
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
  const lastCommaIndex = work.lastIndexOf(',');
  if (lastCommaIndex === -1) {
    return { title: work.trim(), author: '' };
  }
  const title = work.slice(0, lastCommaIndex).trim();
  const author = work.slice(lastCommaIndex + 1).trim();
  return { title, author };
}

function getQuoteMetadata(quote) {
  const { title, author: inferredAuthor } = splitWorkMetadata(quote.obra ?? '');
  const workTitle = title || quote.obra || '';
  const author = quote.autor ?? inferredAuthor;
  return { author, workTitle };
}

function getCatalogEntry(type, id) {
  if (!id) return null;
  const catalog = type === 'author' ? AUTHORS_INFO : WORKS_INFO;
  return catalog[id] ?? null;
}

function appendInfoLine(fragment, label, value) {
  if (!value) return;
  const paragraph = document.createElement('p');
  const prefix = document.createElement('span');
  prefix.className = 'modal__field-label';
  prefix.textContent = `${label}: `;
  paragraph.appendChild(prefix);
  paragraph.appendChild(document.createTextNode(value));
  fragment.appendChild(paragraph);
}

function renderInfoContent(type, contentElement, entry) {
  if (!contentElement) return;
  const fragment = document.createDocumentFragment();

  if (entry) {
    if (type === 'author') {
      appendInfoLine(fragment, 'Nombre', entry.name);
      appendInfoLine(fragment, 'Fechas', entry.dates);
      appendInfoLine(fragment, 'País', entry.country);
      appendInfoLine(fragment, 'Descripción', entry.description);
    } else {
      appendInfoLine(fragment, 'Título', entry.title);
      appendInfoLine(fragment, 'Autor', entry.author);
      appendInfoLine(fragment, 'Año', entry.year);
      appendInfoLine(fragment, 'Tipo', entry.type);
      appendInfoLine(fragment, 'Descripción', entry.description);
    }
  }

  if (!fragment.childNodes.length) {
    const pending = document.createElement('p');
    pending.textContent = type === 'author'
      ? 'Ficha de autor pendiente.'
      : 'Ficha de obra pendiente.';
    fragment.appendChild(pending);
  }

  contentElement.replaceChildren(fragment);
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
  const catalogId = type === 'author'
    ? triggerElement?.dataset?.authorId
    : triggerElement?.dataset?.workId;
  const entry = getCatalogEntry(type, catalogId || slugify(titleText || ''));

  elements.root.classList.remove('is-hidden');
  elements.root.setAttribute('aria-hidden', 'false');
  if (elements.title) {
    elements.title.textContent = titleText || '';
  }
  renderInfoContent(type, elements.content, entry);
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
    const isPoem = currentQuote.type === 'poem';
    const quoteLengthClass = getQuoteLengthClass(currentQuote.t);
    quoteElementRef.classList.toggle('quote-text--poem', isPoem);
    quoteElementRef.classList.toggle('quote-text--prose', !isPoem);
    quoteElementRef.classList.remove(...QUOTE_LENGTH_CLASSES);
    quoteElementRef.classList.add(quoteLengthClass);
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
