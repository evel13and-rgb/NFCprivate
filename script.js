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
];

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
  ...CANAS_Y_BARRO_QUOTES,
  ...ORLANDO_QUOTES,
  ...RAYO_QUE_NO_CESA_QUOTES,
  ...PAPA_GORIOT_QUOTES,
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
