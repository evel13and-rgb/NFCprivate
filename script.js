import { createQuoteManager } from './quoteLogic.js';
import { initFireflyAura } from './fireflies.js';
import { getTimeOfDay, isNightTime } from './dayNight.js';
import { initDaylightMotes, setDaylightMotesActive } from './dayMotes.js';
import {
  ALLOWED_TIMES_OF_DAY,
  FALLBACK_WEATHER_STATE,
  normalizeVisualWeatherState,
  resolveVisualWeatherState,
  supportsDaylightMotes,
} from './weatherVisual.js';
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

const UNA_HABITACION_PROPIA_QUOTES = [
  {
    t: "Todo lo que podía hacer era ofreceros una opinión sobre un punto menor: una mujer debe tener dinero y una habitación propia si ha de escribir ficción; y eso, como veréis, deja sin resolver el gran problema de la verdadera naturaleza de la mujer y de la verdadera naturaleza de la ficción.",
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "una mujer debe tener dinero y una habitación propia",
    lang: "es"
  },
  {
    t: `Cuando un asunto es sumamente controvertido —y cualquier cuestión relativa al sexo lo es—, no cabe esperar que una diga la verdad. Solo puede mostrar cómo llegó a sostener la opinión que sostiene.

Aquí es probable que la ficción contenga más verdad que los hechos.`,
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "cualquier cuestión relativa al sexo lo es",
    lang: "es"
  },
  {
    t: `De mis labios brotarán mentiras, pero quizá haya alguna verdad mezclada con ellas; a vosotras os corresponde buscar esa verdad y decidir si alguna parte merece conservarse.

De no ser así, naturalmente, arrojaréis todo a la papelera y lo olvidaréis.`,
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "quizá haya alguna verdad mezclada con ellas",
    lang: "es"
  },
  {
    t: `El pensamiento —por darle un nombre más orgulloso del que merecía— había dejado caer su sedal en la corriente.

Se mecía, minuto tras minuto, de aquí para allá entre los reflejos y las hierbas, dejando que el agua lo alzara y lo hundiera.`,
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "El pensamiento",
    lang: "es"
  },
  {
    t: "Depositado sobre la hierba, qué pequeño, qué insignificante parecía aquel pensamiento mío: la clase de pez que un buen pescador devuelve al agua para que engorde y algún día merezca ser cocinado y comido.",
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "algún día",
    lang: "es"
  },
  {
    t: "Era esa hora entre dos luces en que los colores aumentan de intensidad y los púrpuras y los dorados arden en los cristales como el latido de un corazón excitable; cuando la belleza del mundo, revelada y, sin embargo, pronta a perecer, tiene dos filos: uno de risa y otro de angustia, que parten el corazón.",
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "uno de risa y otro de angustia",
    lang: "es"
  },
  {
    t: `Una no puede pensar bien, amar bien, dormir bien, si no ha cenado bien.

La lámpara de la columna vertebral no se enciende con carne de vaca y ciruelas pasas.`,
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "La lámpara de la columna vertebral",
    lang: "es"
  },
  {
    t: `Regresé, pues, a mi posada y, mientras caminaba por las calles oscuras, medité sobre esto y aquello, como suele hacerse al final de una jornada de trabajo.

Pensé por qué la señora Seton no había tenido dinero que dejarnos; y qué efecto produce la pobreza sobre la mente, y qué efecto produce la riqueza sobre la mente. Recordé el órgano retumbando en la capilla y las puertas cerradas de la biblioteca; y pensé en lo desagradable que resulta quedarse encerrada fuera; y pensé que quizá sea peor quedarse encerrada dentro.`,
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "quizá sea peor quedarse encerrada dentro.",
    lang: "es"
  },
  {
    t: `Al fin pensé que era hora de enrollar la piel arrugada del día, con sus argumentos y sus impresiones, su ira y su risa, y arrojarla al seto.

Mil estrellas centelleaban sobre las extensiones azules del cielo.`,
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "la piel arrugada del día",
    lang: "es"
  },
  {
    t: `¿Tenéis idea de cuántos libros se escriben acerca de las mujeres en el transcurso de un año? ¿Tenéis idea de cuántos están escritos por hombres?

¿Sois conscientes de que quizá seáis el animal más discutido del universo?`,
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "el animal más discutido del universo",
    lang: "es"
  },
  {
    t: "Era angustioso, desconcertante, humillante. La verdad se me había escurrido entre los dedos. Se había escapado hasta la última gota.",
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "hasta la última gota",
    lang: "es"
  },
  {
    t: "Dibujar era una manera ociosa de concluir una mañana de trabajo infructuoso. Sin embargo, es en nuestra ociosidad, en nuestros sueños, cuando la verdad sumergida sale algunas veces a la superficie.",
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "en nuestros sueños",
    lang: "es"
  },
  {
    t: "Durante todos estos siglos, las mujeres han servido de espejos dotados del mágico y delicioso poder de reflejar la figura del hombre al doble de su tamaño natural.",
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "han servido de espejos",
    lang: "es"
  },
  {
    t: `Imaginativamente, la mujer es de la mayor importancia; en la práctica, es completamente insignificante. Impregna la poesía de principio a fin; está casi ausente de la historia.

Domina las vidas de reyes y conquistadores en la ficción; en la realidad, era esclava de cualquier muchacho cuyos padres le impusieran un anillo.`,
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "en la ficción; en la realidad",
    lang: "es"
  },
  {
    t: `Imaginemos, puesto que los hechos son tan difíciles de encontrar, que Shakespeare tuvo una hermana maravillosamente dotada, llamada Judith. Era tan aventurera, tan imaginativa y estaba tan ansiosa por conocer el mundo como él. Pero no la enviaron a la escuela. De vez en cuando tomaba un libro, quizá uno de su hermano, y leía unas páginas; entonces entraban sus padres y le ordenaban que remendara las medias, vigilara el guiso y dejara de perder el tiempo con libros y papeles.

Antes de cumplir diecisiete años la prometieron en matrimonio. La fuerza de su propio don la impulsó a huir. Reunió unas pocas pertenencias, bajó por una cuerda una noche de verano y tomó el camino de Londres. Los pájaros que cantaban en los setos no eran más musicales que ella. Tenía la imaginación más veloz, un don, como su hermano, para la música de las palabras. Como él, sentía inclinación por el teatro.

Se presentó en la entrada de artistas y dijo que quería actuar. Los hombres se rieron en su cara. El director soltó una carcajada. Ninguna mujer, dijo, podía ser actriz. No podía recibir formación en su oficio. ¿Podía siquiera cenar en una taberna o vagar por las calles a medianoche? Y, sin embargo, su genio era para la ficción y ansiaba alimentarse abundantemente de las vidas de hombres y mujeres y del estudio de sus costumbres.`,
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "Los hombres se rieron en su cara.",
    lang: "es"
  },
  {
    t: "¿Quién podrá medir el calor y la violencia del corazón de un poeta cuando queda atrapado y enredado en el cuerpo de una mujer?",
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "el corazón de un poeta",
    lang: "es"
  },
  {
    t: `Cuando una lee que una bruja era sumergida en el agua, que una mujer estaba poseída por demonios, que una curandera vendía hierbas, o incluso que un hombre muy notable tuvo una madre, entonces me parece que seguimos la pista de una novelista perdida, una poeta reprimida; de alguna Jane Austen muda y sin gloria, de alguna Emily Brontë que se destrozó la cabeza en el páramo o vagó enloquecida por los caminos bajo la tortura que su don le imponía.

Me atrevería a aventurar que Anónimo, que escribió tantos poemas sin firmarlos, fue a menudo una mujer. Fue una mujer, según sugirió Edward Fitzgerald, quien compuso las baladas y las canciones populares, canturreándolas a sus hijos, acompañando con ellas el hilado o la larga noche de invierno.`,
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "fue a menudo una mujer",
    lang: "es"
  },
  {
    t: `Escribir una obra de genio es casi siempre una hazaña de dificultad prodigiosa. Todo se opone a que salga de la mente del escritor entera y completa.

Si algo consigue atravesarlo todo, es un milagro; y probablemente ningún libro nace entero e ileso tal como fue concebido.`,
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "ningún libro nace entero e ileso",
    lang: "es"
  },
  {
    t: `No pueden comprar también la literatura. La literatura está abierta a todo el mundo.

Cerrad vuestras bibliotecas si queréis; pero no hay puerta, cerradura ni cerrojo que podáis imponer a la libertad de mi mente.`,
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "no hay puerta, cerradura ni cerrojo",
    lang: "es"
  },
  {
    t: `Es inútil acudir a los grandes escritores varones en busca de ayuda, por mucho que acudamos a ellos en busca de placer.

Porque, si somos mujeres, pensamos hacia atrás a través de nuestras madres.`,
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "pensamos hacia atrás a través de nuestras madres.",
    lang: "es"
  },
  {
    t: "Las obras maestras no son nacimientos únicos y solitarios; son el resultado de muchos años de pensamiento en común, del pensamiento del conjunto de las personas, de modo que tras la voz individual se encuentra la experiencia de la multitud.",
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "Las obras maestras no son nacimientos únicos y solitarios",
    lang: "es"
  },
  {
    t: `Aquella era una mujer que escribía sin odio, sin amargura, sin miedo, sin protesta, sin predicar.

Su mente había consumido todos los obstáculos; y por eso Jane Austen impregna cada palabra que escribió, como Shakespeare impregna cada una de las suyas.`,
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "sin odio, sin amargura, sin miedo",
    lang: "es"
  },
  {
    t: `La naturaleza, de manera muy extraña, parece habernos proporcionado una luz interior mediante la cual juzgamos la integridad del novelista.

Quizá haya trazado con tinta invisible, sobre las paredes de la mente, un presentimiento que los grandes artistas confirman.`,
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "con tinta invisible, sobre las paredes de la mente",
    lang: "es"
  },
  {
    t: "Los libros se continúan unos a otros, pese a nuestra costumbre de juzgarlos por separado. Y también debemos considerar a una mujer desconocida como descendiente de todas las mujeres anteriores a ella.",
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "Los libros se continúan unos a otros",
    lang: "es"
  },
  {
    t: `Todas esas vidas infinitamente oscuras permanecen aún sin registrar.

Sentí en mi imaginación la presión de lo mudo, la acumulación de vida no escrita: las vendedoras de violetas, las vendedoras de cerillas, las ancianas bajo los portales y las muchachas errantes cuyas caras cambian como olas bajo el sol y las nubes.`,
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "la acumulación de vida no escrita",
    lang: "es"
  },
  {
    t: "Quizá la mente andrógina sea resonante y porosa; quizá transmita la emoción sin impedimentos; quizá sea creadora por naturaleza, incandescente e indivisa.",
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "creadora por naturaleza, incandescente e indivisa.",
    lang: "es"
  },
  {
    t: `Cuando se introduce una frase en la mente, puede caer pesadamente al suelo, muerta; pero otra frase estalla y da nacimiento a toda clase de ideas.

Solo de esa escritura puede decirse que posee el secreto de la vida perpetua.`,
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "el secreto de la vida perpetua.",
    lang: "es"
  },
  {
    t: "Mientras escribáis lo que deseáis escribir, eso es lo único que importa; y nadie puede decir si importará durante siglos o solamente durante unas horas.",
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "es lo único que importa",
    lang: "es"
  },
  {
    t: `¿Qué significa «realidad»? Parece ser algo muy errático, muy poco fiable: se encuentra ahora en un camino polvoriento, ahora en un pedazo de periódico tirado en la calle, ahora en un narciso bajo el sol.

Abruma a una mientras vuelve a casa bajo las estrellas y hace que el mundo silencioso sea más real que el mundo de las palabras.`,
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "¿Qué significa «realidad»?",
    lang: "es"
  },
  {
    t: "La lectura de ciertos libros parece realizar una curiosa operación sobre los sentidos: después vemos con mayor intensidad; el mundo parece despojado de su cubierta y dotado de una vida más intensa.",
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "una vida más intensa.",
    lang: "es"
  },
  {
    t: `Cuando rebusco en mi propia mente, no encuentro nobles sentimientos acerca de ser compañeras e iguales ni de influir sobre el mundo para conducirlo hacia fines más elevados.

Me descubro diciendo, breve y prosaicamente, que es mucho más importante ser una misma que cualquier otra cosa.`,
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "es mucho más importante ser una misma",
    lang: "es"
  },
  {
    t: `La poeta que nunca escribió una palabra y fue enterrada en una encrucijada continúa viva. Vive en vosotras y en mí, y en muchas otras mujeres que no están aquí esta noche porque están lavando los platos y acostando a los niños.

Los grandes poetas no mueren: son presencias que continúan.`,
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "Los grandes poetas no mueren",
    lang: "es"
  },
  {
    t: "Si adquirimos el hábito de la libertad y el valor de escribir exactamente lo que pensamos; si afrontamos el hecho de que no hay brazo al que aferrarse, sino que avanzamos solas y nuestra relación es con el mundo de la realidad, entonces la poeta muerta que fue la hermana de Shakespeare recobrará el cuerpo que tantas veces ha abandonado.",
    a: "Virginia Woolf",
    obra: "Una habitación propia, Virginia Woolf",
    highlight: "no hay brazo al que aferrarse",
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

const EL_PAPEL_PINTADO_DE_AMARILLO_QUOTES = [
  {
    t: `Es muy raro que simples personas corrientes como John y yo consigamos para el verano una residencia ancestral.

Una mansión colonial, una propiedad hereditaria; yo diría una casa encantada y alcanzaría la cima de la dicha romántica, ¡pero eso sería pedir demasiado al destino!

Aun así, declararé orgullosamente que hay algo extraño en ella.

Si no, ¿por qué se alquila tan barata? ¿Y por qué ha permanecido tanto tiempo deshabitada?

John se ríe de mí, por supuesto, pero una espera eso en el matrimonio.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "hay algo extraño en ella.",
    lang: "es"
  },
  {
    t: `John es práctico hasta el extremo. No tiene paciencia con la fe, siente un horror intenso por la superstición y se burla abiertamente de cualquier cosa que no pueda sentirse y verse y reducirse a cifras.

John es médico, y quizá —no se lo diría a un alma viviente, por supuesto, pero este es papel muerto y supone un gran alivio para mi mente— quizá esa sea una de las razones por las que no mejoro más deprisa.

Verán: ¡él no cree que esté enferma!`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "este es papel muerto y supone un gran alivio para mi mente",
    lang: "es"
  },
  {
    t: `¿Y qué puede hacer una?

Si un médico de gran reputación, que además es el propio marido de una, asegura a amigos y parientes que en realidad no le ocurre nada salvo una depresión nerviosa pasajera —una ligera tendencia histérica—, ¿qué puede hacer una?

Mi hermano también es médico, y también de gran reputación, y dice lo mismo.

Así que tomo fosfatos o fosfitos —lo que sea—, y tónicos, y hago viajes, y tomo el aire, y hago ejercicio, y tengo absolutamente prohibido «trabajar» hasta que vuelva a estar bien.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "¿Y qué puede hacer una?",
    lang: "es"
  },
  {
    t: `Personalmente, no estoy de acuerdo con sus ideas.

Personalmente, creo que un trabajo que me agradara, con estímulo y cambio, me haría bien.

Pero ¿qué puede hacer una?

Escribí durante un tiempo a pesar de ellos; pero me agota bastante tener que hacerlo con tanto disimulo o, de lo contrario, encontrar una fuerte oposición.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "Personalmente, no estoy de acuerdo con sus ideas.",
    lang: "es"
  },
  {
    t: `A veces imagino que, en mi estado, si tuviera menos oposición y más compañía y estímulo… Pero John dice que lo peor que puedo hacer es pensar en mi estado, y confieso que siempre me hace sentir mal.

Así que lo dejaré y hablaré de la casa.

A veces me enfado con John sin ninguna razón. Estoy segura de que antes no era tan sensible. Creo que se debe a este estado nervioso.

Pero John dice que, si me siento así, descuidaré el debido dominio de mí misma; de modo que me esfuerzo por controlarme —delante de él, al menos—, y eso me cansa muchísimo.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "me esfuerzo por controlarme —delante de él, al menos—",
    lang: "es"
  },
  {
    t: `Es una habitación grande y ventilada, casi todo el piso, con ventanas que miran en todas direcciones y aire y sol en abundancia. Primero debió de ser cuarto de niños, y después sala de juegos y gimnasio, supongo; porque las ventanas tienen barrotes para los niños pequeños y hay anillas y cosas en las paredes.

La pintura y el papel parecen haber sido utilizados por una escuela de muchachos. El papel está arrancado en grandes trozos alrededor de la cabecera de mi cama, hasta donde alcanza mi mano, y también abajo, al otro lado de la habitación.

Nunca vi un papel peor en mi vida.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "hay anillas y cosas en las paredes.",
    lang: "es"
  },
  {
    t: `Uno de esos dibujos desparramados y extravagantes que cometen todos los pecados artísticos.

Es lo bastante apagado para confundir al ojo cuando intenta seguirlo, lo bastante marcado para irritar constantemente y provocar su estudio; y, cuando se siguen durante un trecho sus curvas cojas e inciertas, de pronto se suicidan: se precipitan en ángulos escandalosos, se destruyen en contradicciones nunca oídas.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "cometen todos los pecados artísticos.",
    lang: "es"
  },
  {
    t: `Cuando se siguen durante un trecho sus curvas cojas e inciertas, de pronto se suicidan: se precipitan en ángulos escandalosos, se destruyen en contradicciones nunca oídas.

El color es repelente, casi repugnante: un amarillo humeante, impuro, extrañamente desteñido por la luz del sol que gira lentamente.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "de pronto se suicidan",
    lang: "es"
  },
  {
    t: `El color es repelente, casi repugnante: un amarillo humeante, impuro, extrañamente desteñido por la luz del sol que gira lentamente.

En algunos lugares es de un naranja apagado y, sin embargo, chillón; en otros, de un enfermizo tono de azufre.

¡No es extraño que los niños lo odiaran! Yo misma lo odiaría si tuviera que vivir mucho tiempo en esta habitación.

Ahí viene John, y tengo que guardar esto: odia verme escribir una sola palabra.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "un amarillo humeante, impuro",
    lang: "es"
  },
  {
    t: `Estos trastornos nerviosos son terriblemente deprimentes.

John no sabe cuánto sufro realmente. Sabe que no existe ninguna razón para que sufra, y eso lo satisface.

Por supuesto, solo son los nervios. ¡Me pesa tanto no cumplir con mi deber de ninguna manera!

Quería ser una ayuda tan grande para John, un verdadero descanso y consuelo; y aquí estoy, convertida ya, comparativamente, en una carga.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "Sabe que no existe ninguna razón para que sufra, y eso lo satisface.",
    lang: "es"
  },
  {
    t: `Quería ser una ayuda tan grande para John, un verdadero descanso y consuelo; y aquí estoy, convertida ya, comparativamente, en una carga.

Nadie creería el esfuerzo que supone hacer lo poco que puedo: vestirme y recibir gente y disponer las cosas.

Es una suerte que Mary se ocupe tan bien del bebé. ¡Un bebé tan querido!

Y, sin embargo, no puedo estar con él; me pone muy nerviosa.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "aquí estoy, convertida ya, comparativamente, en una carga.",
    lang: "es"
  },
  {
    t: `Siempre imagino que veo personas caminando por esos numerosos senderos y emparrados, pero John me ha advertido que no me entregue en absoluto a la imaginación.

Dice que, con mi poder imaginativo y mi costumbre de inventar historias, una debilidad nerviosa como la mía conduce con toda seguridad a toda clase de fantasías excitadas, y que debo emplear mi voluntad y mi buen juicio para contener esa tendencia.

Así que lo intento.

A veces pienso que, si estuviera lo bastante bien para escribir un poco, aliviaría la presión de las ideas y me permitiría descansar.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "mi poder imaginativo y mi costumbre de inventar historias",
    lang: "es"
  },
  {
    t: `Hay un punto que se repite donde el dibujo se ladea flácidamente como un cuello roto y dos ojos bulbosos lo miran a uno cabeza abajo.

Me enfurecen positivamente su impertinencia y su eternidad. Arriba y abajo y hacia los lados se arrastran, y aquellos ojos absurdos, que no parpadean, están en todas partes.

Hay un lugar donde dos paños no coinciden, y los ojos suben y bajan por toda la juntura, uno un poco más alto que el otro.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "como un cuello roto",
    lang: "es"
  },
  {
    t: `Nunca vi antes tanta expresión en una cosa inanimada, ¡y todos sabemos cuánta expresión tienen!

De niña solía permanecer despierta y encontraba más diversión y terror en paredes desnudas y muebles corrientes que la mayoría de los niños en una tienda de juguetes.

Recuerdo el guiño bondadoso que tenían los tiradores de nuestra vieja y gran cómoda, y había una silla que siempre parecía una amiga fuerte.

Sentía que, si alguna de las otras cosas parecía demasiado feroz, siempre podía saltar sobre aquella silla y estar a salvo.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "Nunca vi antes tanta expresión en una cosa inanimada",
    lang: "es"
  },
  {
    t: `Este papel pintado tiene una especie de subdibujo de otro tono, particularmente irritante, porque solo puede verse bajo ciertas luces, y ni siquiera entonces con claridad.

Pero en los lugares donde no está desteñido, y cuando el sol cae justamente de cierta manera, puedo ver una figura extraña, provocadora, sin forma, que parece enfurruñarse detrás de ese dibujo exterior, absurdo y llamativo.

¡Ahí está la hermana en la escalera!`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "una figura extraña, provocadora, sin forma",
    lang: "es"
  },
  {
    t: `Mirado de una manera, cada paño permanece aislado: las curvas hinchadas y los adornos —una especie de «románico degenerado» con delirium tremens— suben y bajan bamboleándose en columnas aisladas de fatuidad.

Pero, por otra parte, se conectan diagonalmente, y los contornos desparramados se alejan en grandes ondas oblicuas de horror óptico, como un montón de algas que se revolcaran en plena persecución.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "«románico degenerado» con delirium tremens",
    lang: "es"
  },
  {
    t: `No sé por qué escribo esto.

No quiero.

No me siento capaz.

Y sé que John lo consideraría absurdo. Pero tengo que decir de alguna manera lo que siento y pienso: ¡supone un alivio tan grande!

Pero el esfuerzo está empezando a ser mayor que el alivio.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "el esfuerzo está empezando a ser mayor que el alivio.",
    lang: "es"
  },
  {
    t: `Hay cosas en ese papel que nadie conoce salvo yo, ni conocerá jamás.

Detrás del dibujo exterior, las formas borrosas se vuelven cada día más claras.

Siempre es la misma forma, solo que muy numerosa.

Y se parece a una mujer que se agacha y se arrastra detrás de ese dibujo. No me gusta nada. Me pregunto… empiezo a pensar… ¡quisiera que John me sacara de aquí!

Es tan difícil hablar con John acerca de mi estado, porque es muy sabio y porque me ama tanto.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "Hay cosas en ese papel que nadie conoce salvo yo",
    lang: "es"
  },
  {
    t: `Era una noche de luna. La luna entra por todas partes, igual que el sol.

A veces odio verla: se arrastra muy lentamente y siempre entra por una ventana u otra.

John dormía y yo no quería despertarlo, así que permanecí quieta y observé la luz de la luna sobre aquel papel ondulante hasta que empecé a sentir escalofríos.

La tenue figura de detrás parecía sacudir el dibujo, exactamente como si quisiera salir.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "exactamente como si quisiera salir.",
    lang: "es"
  },
  {
    t: `En un dibujo como este, a la luz del día, hay una falta de secuencia, un desafío a la ley, que constituye una irritación constante para una mente normal.

El color es bastante horrible, bastante inconstante y bastante exasperante, pero el dibujo es una tortura.

Uno cree haberlo dominado, pero, justo cuando avanza bien siguiéndolo, da una voltereta hacia atrás y ahí queda una. Le da una bofetada, la derriba y la pisotea.

Es como un mal sueño.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "el dibujo es una tortura.",
    lang: "es"
  },
  {
    t: `A la luz de la luna —la luna brilla toda la noche cuando hay luna— no reconocería que es el mismo papel.

Por la noche, bajo cualquier clase de luz, al crepúsculo, a la luz de las velas, a la luz de las lámparas y, peor que nada, a la luz de la luna, ¡se convierte en barrotes! Me refiero al dibujo exterior, y la mujer que está detrás se distingue con toda claridad.

Durante mucho tiempo no comprendí qué era aquello que aparecía detrás —aquel tenue subdibujo—, pero ahora estoy completamente segura de que es una mujer.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "¡se convierte en barrotes!",
    lang: "es"
  },
  {
    t: `De día está sometida, quieta. Imagino que es el dibujo lo que la mantiene tan inmóvil. Es tan desconcertante. Me mantiene quieta durante horas.

Ahora permanezco acostada muchísimo tiempo. John dice que me hace bien y que debo dormir cuanto pueda.

De hecho, él inició la costumbre obligándome a acostarme durante una hora después de cada comida.

Estoy convencida de que es una costumbre muy mala porque, como ven, no duermo.

Y eso cultiva el engaño, porque no les digo que estoy despierta. ¡Oh, no!

La verdad es que estoy empezando a tenerle un poco de miedo a John.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "Y eso cultiva el engaño",
    lang: "es"
  },
  {
    t: `¿No sonaba aquello inocente? Pero sé que estaba estudiando el dibujo, y estoy decidida a que nadie lo descubra salvo yo.

La vida es mucho más emocionante ahora que antes. Verán, tengo algo más que esperar, algo que aguardar, algo que vigilar. Realmente como mejor y estoy más tranquila que antes.

¡John está encantado de verme mejorar! Se rio un poco el otro día y dijo que parecía estar prosperando a pesar de mi papel pintado.

Lo desvié con una risa. No tenía intención de decirle que era gracias al papel pintado.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "La vida es mucho más emocionante ahora que antes.",
    lang: "es"
  },
  {
    t: `¡Es el amarillo más extraño, ese papel! Me hace pensar en todas las cosas amarillas que he visto en mi vida: no en las hermosas, como los ranúnculos, sino en cosas amarillas viejas, inmundas, malas.

Pero hay algo más en ese papel: ¡el olor!

Se arrastra por toda la casa.

Lo encuentro flotando en el comedor, acechando en el salón, escondido en el vestíbulo, aguardándome en las escaleras.

Se mete en mi pelo.

La única cosa a la que puedo comparar ese olor es al color del papel.

Un olor amarillo.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "Un olor amarillo.",
    lang: "es"
  },
  {
    t: `Hay una marca muy curiosa en esta pared, abajo, cerca del zócalo. Una franja que da la vuelta a la habitación. Pasa por detrás de todos los muebles salvo la cama: un manchón largo, recto y uniforme, como si lo hubieran frotado una y otra vez.

Me pregunto cómo se hizo y quién lo hizo y para qué lo hizo.

Vuelta y vuelta y vuelta; vuelta y vuelta y vuelta: ¡me marea!`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "Vuelta y vuelta y vuelta",
    lang: "es"
  },
  {
    t: `Por fin he descubierto algo.

De tanto vigilar por la noche, cuando cambia de aquella manera, finalmente lo he averiguado.

El dibujo exterior se mueve; ¡y no es extraño! La mujer de detrás lo sacude.

A veces creo que hay muchísimas mujeres detrás, y a veces solo una, y se arrastra deprisa, y su manera de arrastrarse sacude todo el dibujo.

En los lugares muy iluminados permanece quieta, y en los muy sombríos agarra los barrotes y los sacude con fuerza.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "La mujer de detrás lo sacude.",
    lang: "es"
  },
  {
    t: `Está intentando atravesarlo todo el tiempo. Pero nadie podría atravesar ese dibujo: estrangula tanto; creo que por eso tiene tantas cabezas.

Consiguen atravesarlo, y entonces el dibujo las estrangula, las vuelve cabeza abajo y les pone los ojos blancos.

Si aquellas cabezas estuvieran cubiertas o se las arrancara, no sería ni la mitad de malo.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "el dibujo las estrangula",
    lang: "es"
  },
  {
    t: `¡Creo que esa mujer sale durante el día!

Y les diré por qué —en privado—: ¡la he visto!

¡Puedo verla desde cada una de mis ventanas!

Es la misma mujer, lo sé, porque siempre se arrastra, y la mayoría de las mujeres no se arrastran a plena luz del día.

La veo en aquel largo sendero sombreado, arrastrándose arriba y abajo. La veo en los oscuros emparrados, arrastrándose por todo el jardín.

No la culpo en absoluto. ¡Debe de ser muy humillante que la sorprendan arrastrándose a plena luz del día!`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "la mayoría de las mujeres no se arrastran a plena luz del día.",
    lang: "es"
  },
  {
    t: `Siempre cierro la puerta con llave cuando me arrastro durante el día. No puedo hacerlo por la noche, porque sé que John sospecharía algo inmediatamente.

Y John está ahora tan extraño que no quiero irritarlo. ¡Ojalá ocupara otra habitación! Además, no quiero que nadie saque a esa mujer por la noche salvo yo.

A menudo me pregunto si podría verla desde todas las ventanas a la vez.

Pero, por muy deprisa que gire, solo puedo mirar por una cada vez.

Y, aunque siempre la veo, ¡quizá pueda arrastrarse más deprisa de lo que yo puedo girar!`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "Siempre cierro la puerta con llave cuando me arrastro durante el día.",
    lang: "es"
  },
  {
    t: `¡Ojalá pudiera arrancar el dibujo de arriba del que está debajo! Pienso intentarlo poco a poco.

He descubierto otra cosa curiosa, pero esta vez no la contaré. No conviene confiar demasiado en la gente.

Solo quedan dos días para arrancar este papel, y creo que John empieza a darse cuenta. No me gusta la expresión de sus ojos.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "No conviene confiar demasiado en la gente.",
    lang: "es"
  },
  {
    t: `¡Hurra! Este es el último día, pero basta. John pasará la noche en la ciudad y no regresará hasta esta tarde.

Jennie quería dormir conmigo —¡qué astuta!—, pero le dije que, sin duda, descansaría mejor pasando una noche completamente sola.

Aquello fue inteligente, porque en realidad ¡no estaba sola en absoluto! En cuanto salió la luna y aquella pobre criatura empezó a arrastrarse y a sacudir el dibujo, me levanté y corrí a ayudarla.

Yo tiraba y ella sacudía; yo sacudía y ella tiraba; y antes de que amaneciera habíamos arrancado metros de aquel papel.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "Yo tiraba y ella sacudía; yo sacudía y ella tiraba",
    lang: "es"
  },
  {
    t: `Jennie miró la pared con asombro, pero le dije alegremente que lo había hecho por puro despecho contra aquella cosa malvada.

Se rio y dijo que a ella tampoco le importaría hacerlo, pero que yo no debía cansarme.

¡Cómo se traicionó entonces!

Pero yo estoy aquí, y nadie toca este papel salvo yo: ¡nadie vivo!

Intentó sacarme de la habitación; ¡era demasiado evidente! Pero le dije que ahora estaba tan tranquila, vacía y limpia que creía que volvería a acostarme y dormiría cuanto pudiera.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "nadie toca este papel salvo yo: ¡nadie vivo!",
    lang: "es"
  },
  {
    t: `Ni siquiera me gusta mirar por las ventanas: hay tantas de esas mujeres que se arrastran, y se arrastran tan deprisa.

Me pregunto si salieron todas de ese papel pintado, como yo.

Pero ahora estoy firmemente atada con mi cuerda bien escondida: ¡no conseguirán sacarme ahí fuera, al camino!

Supongo que tendré que volver detrás del dibujo cuando llegue la noche, ¡y eso es difícil!

Es tan agradable estar fuera, en esta gran habitación, y arrastrarme cuanto me plazca.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "Me pregunto si salieron todas de ese papel pintado, como yo.",
    lang: "es"
  },
  {
    t: `Seguí arrastrándome igual, pero lo miré por encima del hombro.

—He salido por fin —dije—, ¡a pesar de ti y de Jane! Y he arrancado casi todo el papel, de modo que no podéis volver a meterme detrás.

¿Y por qué iba a desmayarse ese hombre? Pero se desmayó, y justo atravesado en mi camino junto a la pared, de manera que tuve que arrastrarme por encima de él cada vez.`,
    a: "Charlotte Perkins Gilman",
    obra: "El papel pintado de amarillo, Charlotte Perkins Gilman",
    highlight: "He salido por fin",
    lang: "es"
  }
];

const VERA_QUOTES = [
  {
    t: `Lucy miraba fijamente el mar, pensando en aquellas cosas, examinando la situación como algo curioso, pero sin relación con ella, contemplándola con una especie de comprensión fría. Su mente estaba completamente clara. Cada detalle de lo ocurrido se encontraba nítidamente ante ella.

Lo sabía todo y no sentía nada; como Dios, se dijo; sí, exactamente como Dios.`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "Lo sabía todo y no sentía nada", lang: "es"
  },
  {
    t: `Lo que le había sucedido a aquel hombre —se llamaba Wemyss— era que la opinión pública lo obligaba a retirarse y permanecer inactivo precisamente cuando más necesitaba compañía y distracción. Tenía que marcharse solo, tenía que apartarse durante una semana, como mínimo, de su vida habitual, porque la opinión pública había decidido que debía permanecer un tiempo a solas con su pena.

¡A solas con la pena, de todas las cosas espantosas con las que un hombre podía quedarse a solas! Condenar a un hombre a aquello era un ultraje, pensaba; la forma más cruel de reclusión en solitario.`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "A solas con la pena", lang: "es"
  },
  {
    t: `Ella pendía de sus palabras, con los ojos fijos en su rostro, los labios entreabiertos, el cuerpo entero convertido en una agonía de compasión. La vida: qué terrible era, y qué insospechada. Una seguía y seguía, sin imaginar nunca el súbito día espantoso en que caerían las cubiertas y se vería que, después de todo, era la muerte; que había sido la muerte durante todo aquel tiempo, la muerte fingiendo, la muerte esperando.

Su padre, tan lleno de amor, intereses y proyectos: ido, acabado, barrido como si no importara más que algún insecto que una pisa sin verlo mientras camina.`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "la muerte fingiendo, la muerte esperando.", lang: "es"
  },
  {
    t: `—¿Cómo iba a ser? Era mi esposa, no tenía una sola preocupación en el mundo, todo se hacía por ella, no tenía dificultades, nada que le pesara en la mente, nada malo en su salud. Llevábamos quince años casados y yo sentía devoción por ella: devoción.`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "todo se hacía por ella", lang: "es"
  },
  {
    t: `Que le estuvieran haciendo el amor, que estuviera prometida —como insistía Wemyss— antes de que hubiera transcurrido una semana desde la muerte de su padre no podía calificarse, pensaba ella, de nada peor que una posible, y como máximo, falta de pertinencia.

Pero Wemyss encontraba irritante que su compromiso tuviera que mantenerse en secreto. Lucy, completamente abrumada, primero por sus lágrimas y después por su alegría, ya no podía juzgar nada. Ya no sabía si hacerse el amor en medio de la muerte era algo terrible o si era, como decía Wemyss, la natural y gloriosa afirmación de la vida.`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "la natural y gloriosa afirmación de la vida.", lang: "es"
  },
  {
    t: `Lucy ya no sabía nada, excepto que él y ella, náufragos, se habían salvado mutuamente y que, por el momento, no se le exigía nada: ningún esfuerzo, absolutamente nada, salvo permanecer pasiva con la cabeza apoyada en su pecho mientras él la llamaba su bebé y besaba suave, maravillosamente, sus ojos cerrados.

No podía pensar; no necesitaba pensar. Oh, estaba cansada, y aquello era descanso.`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "No podía pensar; no necesitaba pensar.", lang: "es"
  },
  {
    t: `Mientras tanto, la señorita Entwhistle pasaba una tarde laboriosa en la sala de periódicos del Museo Británico. Estaba leyendo en The Times la información sobre el accidente y la investigación judicial de Wemyss. Lucy no había mencionado aquella sugerencia de suicidio. Quizá él no se lo hubiera contado.

Suicidio. Bueno, no había pruebas. Se había dictado un veredicto abierto. Lo había sugerido una sirvienta, quizá una sirvienta resentida.

La señorita Entwhistle volvió a casa lentamente, deteniéndose ante los escaparates, mirando sombreros y blusas que no veía, intentando pensar. Suicidio. Qué desolado sonaba en aquella hermosa tarde. Una renuncia semejante. Una derrota semejante.`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "Suicidio. Qué desolado sonaba", lang: "es"
  },
  {
    t: `Tenía una vieja amiga que vivía en Chesham Street, una viuda llena de esa madura sabiduría que a veces llega al final a quienes han sobrevivido al matrimonio; y, cuando el otoño la llevó de vuelta a Londres, la señorita Entwhistle acudía de vez en cuando a ella en busca de consuelo.`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "han sobrevivido al matrimonio", lang: "es"
  },
  {
    t: `El compromiso Wemyss-Entwhistle avanzó por las etapas ordinarias de todos los compromisos: secreto completo, secreto parcial, semipublicidad e, inmediatamente después, publicidad total, con su inevitable acompañamiento de estrépito. El estrépito, siempre más o menos audible para los protagonistas, fue en este caso de desaprobación unánime.

Los amigos del padre de Lucy protestaron uno por uno. La atmósfera de Eaton Terrace se convulsionó; y Lucy, que como siempre corría a esconderse de todo lo perturbador en los brazos de Wemyss, solo quedó más convencida que nunca de que allí solo había paz.`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "allí solo había paz.", lang: "es"
  },
  {
    t: `Lucy también estaba indignada, pero su indignación procedía de que los amigos de su padre, siempre buenos, amables, inteligentes y razonables, se mostraran unánimemente hostiles a que se casara con Everard sin conocer de él más que la historia del accidente.

¡Y luego la manera en que todos hablaban! Argumentos, razonamientos y sutilezas interminables; tan inteligentes, tan imposibles de refutar y, sin embargo, tan equivocados. Todos aquellos numerosos puntos de vista… Pero solo había un punto de vista sobre una cosa, decía Everard, y era el correcto.

Ah, pero una mujer no quería aquello; no quería aquel pensar, examinar, diseccionar y considerar sin fin. Una mujer —hasta sus pensamientos aparecían ahora vestidos con las palabras de Wemyss— solo quería a su hombre.`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "solo quería a su hombre.", lang: "es"
  },
  {
    t: `Wemyss, que primero hacía sus planes y después hablaba de ellos, ni siquiera había mencionado a Lucy la Navidad. Era costumbre suya decidir qué deseaba hacer, disponer todos los detalles y, cuando todo estaba preparado, informar a quienes iban a participar.

No se le había ocurrido que pudiera haber dificultades con la cuestión de la Navidad. Naturalmente, había dado por sentado que la pasaría con su pequeña, y puesto que él siempre la pasaba en Los Sauces, ella también la pasaría allí.`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "primero hacía sus planes y después hablaba de ellos", lang: "es"
  },
  {
    t: `—Esto es morboso —dijo cuando, en respuesta a sus preguntas, ella por fin le explicó que no podía ir por la terrible muerte de la pobre Vera allí.

Y le explicó, sosteniéndola entre sus brazos, lo absurdo que era ser morbosa y que su pequeña, que iba a casarse con un hombre sano y sensato que, Dios sabía, había tenido que luchar bastante para seguir siéndolo —ella se apretó más contra él— y, sin embargo, lo había conseguido, también tenía que ser sana y sensata.

De otro modo, si no podía hacer esto o aquello porque le recordaba algo triste, y no podía ir aquí o allá porque alguien había muerto, temía que acabara haciéndolos muy infelices tanto a él como a sí misma.`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "—Esto es morboso", lang: "es"
  },
  {
    t: `Habiendo terminado sus preparativos y fijado la boda para el primer sábado de marzo, Wemyss pensó que ya era hora de decírselo a Lucy; y así lo hizo, aunque no sin un ligero temor, al final, de que ella pudiera plantear dificultades.`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "pensó que ya era hora de decírselo a Lucy", lang: "es"
  },
  {
    t: `El matrimonio, descubrió Lucy, era diferente de lo que había supuesto; Everard era diferente; todo era diferente. Para empezar, siempre tenía sueño. Para continuar, nunca estaba sola.

No había comprendido hasta qué punto nunca estaría sola o, si lo estaba, nunca tendría la certeza, de un minuto al siguiente, de continuar estándolo. Siempre había habido en su vida intervalos durante los cuales se recuperaba en soledad de cualquier tensión; ahora no había ninguno. Siempre había habido lugares a los que podía retirarse y descansar tranquilamente, a salvo de interrupciones; ahora no había ninguno.`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "El matrimonio, descubrió Lucy, era diferente", lang: "es"
  },
  {
    t: `Sí, era un bebé, un bebé querido y lleno de vitalidad, pero un bebé ahora visto muy de cerca y que no paraba nunca. No se podía meterlo en una cuna, darle un biberón, decirle: «Ya está», y después sentarse tranquilamente a coser un poco; no se tenían domingos libres; nunca se estaba, ni de día ni de noche, un solo instante fuera de servicio.

Lucy no podía contar el número de veces al día que tenía que responder a la pregunta:

—¿Quién es mi mujercita, toda mía?`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "nunca se estaba, ni de día ni de noche, un solo instante fuera de servicio.", lang: "es"
  },
  {
    t: `Al principio respondía con un éxtasis risueño, corriendo hacia sus brazos abiertos; pero muy pronto apareció aquel sueño fatal que permaneció con ella durante toda la luna de miel, y algunas veces se sentía realmente demasiado cansada para introducir en su voz el éxtasis que pronto comprendió que se esperaba de ella.

Si había una sombra de vacilación antes de responder, la más mínima demora porque sus pensamientos se hubieran extraviado momentáneamente, Wemyss se disgustaba y ella tenía que pasar bastante tiempo tranquilizándolo con los susurros y las caricias más tiernos.

Sus pensamientos no debían extraviarse, había descubierto; sus pensamientos debían ser de él, igual que todo lo demás de ella.`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "sus pensamientos debían ser de él", lang: "es"
  },
  {
    t: `Al principio de su compromiso Wemyss había expuesto a Lucy su teoría de que entre enamorados debía existir la más perfecta franqueza, mientras que, en el caso del marido y la mujer, no debía haber en ninguno de los dos rincón alguno —de la mente, del cuerpo o del alma— que no pudiera revelarse al otro.`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "no debía haber en ninguno de los dos rincón alguno", lang: "es"
  },
  {
    t: `Lucy tenía una opinión tan elevada de aquello que no encontraba palabras con las que expresar su admiración y, en su lugar, se puso a besarlo. Qué felicidad ideal, quedar apartada para siempre del miedo a la soledad mediante el sencillo procedimiento de ser dos; y quién podía ser tan feliz como ella, que había encontrado exactamente a la persona adecuada para aquella duplicación, una persona con la que podía coincidir y entenderse tan perfectamente.

Su mente era un cáliz lleno únicamente de amor, y el amor era tan claro y luminoso que ni siquiera en el fondo, cuando lo agitaba para mirar, había rastro alguno de sedimento.`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "Su mente era un cáliz lleno únicamente de amor", lang: "es"
  },
  {
    t: `Sí, se había vuelto sumamente abyecta, reflexionaba, despierta durante la noche, considerando su comportamiento a lo largo del día. El amor la había vuelto así. El amor volvía abyecta a una, porque estaba lleno del miedo a herir al ser amado.

La afirmación de las Escrituras de que el amor perfecto expulsa el miedo solo demostraba, puesto que su amor por Everard era sin duda perfecto, lo poco que las Escrituras sabían realmente de aquello de lo que hablaban.`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "El amor volvía abyecta a una", lang: "es"
  },
  {
    t: `Así que aquella era Vera. Por supuesto. Había sabido, aunque nunca hubiera construido una imagen suya en la mente —había evitado cuidadosamente hacerlo—, que sería así.

Aquella Vera era sin duda inteligente. No se podían tener aquellos ojos y ser necia. Y la expresión de su boca: ¿de qué había estado intentando no reírse aquel día?

Quizá se reía, pensó Lucy, porque, de otro modo, habría llorado; solo que eso habría sido una tontería, y ella no podía haber sido tonta: no con aquellos ojos, no con aquellas cejas rectas y finas.`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "Quizá se reía, pensó Lucy, porque, de otro modo, habría llorado", lang: "es"
  },
  {
    t: `Tenía miedo de él, y tenía miedo de sí misma en relación con él. Parecía encontrarse fuera de todo cuanto ella conocía por experiencia. Parecía no ser —al menos no lo había sido aquel día— generoso. No parecía haber ningún punto por el que pudiera alcanzárselo.

¿Cómo era él realmente? ¿Cuánto tiempo tardaría en conocerlo realmente? ¿Años?

Y ella misma sabía ahora que no podía soportar las escenas. Ninguna escena. No podía soportarlas mientras sucedían ni podía soportar el agotamiento de la larga reconciliación posterior.`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "Tenía miedo de él, y tenía miedo de sí misma en relación con él.", lang: "es"
  },
  {
    t: `Él le había apartado la blusa y le estaba besando el hombro y preguntándole de quién era enteramente aquella esposa.

Pero ¿de qué servían las caricias si inmediatamente antes o después había ira, o si la ira las interrumpía? Tenía miedo de él. Ella no estaba en aquellos besos.

Quizá llevara mucho tiempo sintiendo miedo de él sin saberlo. ¿Qué había sido aquella abyección durante la luna de miel, aquel deseo angustiado de agradar, de evitar ofender, sino miedo? Era amor con miedo; miedo de recibir daño, de no poder creer de todo corazón, de no poder —esto era lo peor— sentirse orgullosa del ser amado.`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "Era amor con miedo", lang: "es"
  },
  {
    t: `Atravesó el vestíbulo corriendo, convertida toda ella en una confusión de penitencia angustiada, deseo y amor, y cuando llegó a la puerta y giró el picaporte estaba cerrada con llave.

La había dejado fuera, con la puerta cerrada.

Su mano resbaló lentamente del picaporte. Permaneció completamente inmóvil. ¿Cómo podía…? Y ahora sabía que él había echado el cerrojo de la puerta principal sabiendo que ella seguía fuera, bajo la lluvia. ¿Cómo podía?

¿Quién era aquel hombre, despiadado, cruel? No Everard. No su amante. ¿Dónde estaba él, su amante y marido?`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "La había dejado fuera, con la puerta cerrada.", lang: "es"
  },
  {
    t: `Se apartó el pelo mojado de los ojos mientras subía las escaleras. Seguía metiéndosele en ellos y haciéndola tropezar. Vera la ayudaría. Vera nunca había sido vencida. Vera había pasado quince años sin ser vencida antes de… antes de sufrir aquel accidente.

Debía de haber habido montones de días exactamente iguales a aquel, con el viento gritando, Vera arriba en su habitación y Everard abajo en la suya —quizá encerrado—, y, sin embargo, Vera había resistido y no habían conseguido arrancarle el espíritu.

Oh, si Vera no estuviera muerta. ¡Si Vera, Vera, no estuviera muerta!`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "Vera nunca había sido vencida.", lang: "es"
  },
  {
    t: `Lucy permaneció completamente quieta, envuelta en la colcha de Vera. Obedientemente no se movió, sino que miró directamente al fuego, sentada tan cerca que el resto de la habitación quedó excluido.

No veía la ventana ni la triste lluvia deslizándose por ella. No veía más que el fuego, que ardía alegremente.

Qué amable era Lizzie. Qué consoladora era la bondad. Era algo que comprendía, algo normal, natural, y estar junto a ella la hacía sentirse también normal y natural.`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "Qué consoladora era la bondad.", lang: "es"
  },
  {
    t: `La verdad era que, para cuando la señorita Entwhistle entró en la biblioteca, estaba muy enfadada. Hasta el gusano más cortés, se dijo, el gusano más conciliador y sensato, plenamente consciente de que la sabiduría aconseja paciencia, acaba revolviéndose contra el marido de su sobrina si lo pisan con demasiada fuerza.

La manera en que Wemyss le había ordenado que no subiera a ver a Lucy… Lo que más la enfurecía era conocer la debilidad de su posición: se encontraba en su casa sin haber sido invitada.`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "Hasta el gusano más cortés, se dijo, el gusano más conciliador y sensato, plenamente consciente de que la sabiduría aconseja paciencia, acaba revolviéndose", lang: "es"
  },
  {
    t: `Qué alivio, qué alivio extraordinario, haberse librado de ella; y no solo por aquella vez, sino para siempre. Además, era la única pariente de Lucy, de modo que ya no quedaban más que pudieran acudir e intentar interponerse entre marido y mujer.

Wemyss dio cuerda a su reloj ante los últimos resplandores del fuego y volvió a sentirse de excelente humor. Más que de excelente humor: renovado y vigorizado, como si hubiera tomado un baño frío y recibido una vigorosa fricción.

Ahora, a la cama y con su pequeño Amor. Qué cosas tan sencillas necesitaba un hombre: solo su mujer y la paz.`,
    a: "Elizabeth von Arnim", obra: "Vera, Elizabeth von Arnim",
    highlight: "solo su mujer y la paz.", lang: "es"
  }
];

const PRECIOSO_VENENO_QUOTES = [
  {
    t: `Kester dice que todas las historias, historias verdaderas o invenciones, empiezan mucho antes de los días del niño; sí, incluso antes del pequeño recién nacido en su cuna de juncos. Tal vez tú nunca durmieras en una cuna de juncos, pero en Sarn todos lo hicimos.

Eran cunas limpias, blandas y verdes, donde el niño podía sentirse tan bien acomodado como una pequeña oruga —«mariposa pintada que aún ha de ser», las llama Kester— dormida en su capullo. Kester es muy particular con estas cosas. Nunca dirá «oruga». Dirá:

—Hay muchas futuras mariposas entre nuestras coles, Prue.

No dirá:

—Es invierno.

Dirá:

—El verano duerme.

Y no hay capullo tan pequeño ni de color tan triste que Kester no llame el comienzo de la floración.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "El verano duerme.", lang: "es"
  },
  {
    t: `Éramos pocos allí, y quizá siempre lo seamos, porque hay algo desalentador en aquel lugar. Puede que sea el agua lamiendo, año tras año —mires donde mires, escuches donde escuches, agua—; o los grandes árboles, esperando y considerando a derecha e izquierda; o la quietud sin respiración del lugar, como si hubiese sido creado apenas una hora antes, y no creado para nosotros.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "no creado para nosotros.", lang: "es"
  },
  {
    t: `Solo en nuestro robledal había siempre un aspecto de final de año, porque las hojas nuevas eran muy pardas. De modo que siempre había un soplo de octubre en nuestro mayo.

Pero era agradable sentarse en los prados y mirar hacia las colinas lejanas. Los alerces se alzaban como agujas en su verde vivo, y el oro de las prímulas parecía metérsele a una en el corazón, y hasta el lago de Sarn no era más que una niebla azul dentro de una niebla amarilla de copas de abedul.

Había tal sueño sobre el lugar que, si pasaba una abeja silvestre —no digamos ya un abejorro—, sobresaltaba como un grito.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "un soplo de octubre en nuestro mayo.", lang: "es"
  },
  {
    t: `Fue en Plash, en casa de los Beguildy, mitad casa de piedra y mitad cueva, donde recibí mi enseñanza de libros. Tal vez te parezca extraño que una mujer de mi humilde condición sea capaz de escribir y deletrear y poner todas estas cosas en un libro.

Y lo cierto es que, cuando yo era muchacha, ni siquiera muchas grandes damas sabían escribir mucho más que una carta de amor. Algunas apenas podían poner «esto es membrillo y manzana» en sus jaleas, y otras pasaban trabajos para firmar en el registro matrimonial.

Muchas vinieron a mí, una y otra vez, para que les escribiera sus cartas de amor; y es una tarea vieja y amarga escribir las cartas de amor de otras mujeres desde el propio corazón ardiente.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "desde el propio corazón ardiente.", lang: "es"
  },
  {
    t: `Una vez le pregunté a Beguildy dónde estaba el futuro, puesto que podía verlo con tanta claridad.

—Está junto al pasado, niña, detrás del Tiempo —respondió.

Nunca se podía ganar una discusión con el señor Beguildy. Pero cuando le conté a Kester lo que había dicho, Kester no quiso admitirlo. Dijo que el pasado y el futuro eran dos lanzaderas en manos del Señor, tejiendo la Eternidad. Él mismo era tejedor, lo cual quizá le hizo pensarlo así.

Pero creo que no podemos saber qué son el pasado y el futuro. Somos tan pequeños y desvalidos sobre la tierra, que es como una cuna verde de juncos donde yace la humanidad, mirando las estrellas sin saber qué son.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "dos lanzaderas en manos del Señor", lang: "es"
  },
  {
    t: `Eran como una lluvia tranquila después de la sequía. Solo que empecé a preguntarme cómo volveríamos en la resurrección. ¿Volveríamos claros o borrosos, como en el agua?

¿Volvería Padre en el arrebato de cólera en que murió, o como un niño pequeño corriendo hacia la abuela con un ramillete de prímulas? ¿Sonreiría Madre con la misma sonrisa, o habría encontrado una luz en el pasadizo oscuro?

¿Seguiría yo encerrada en un cuerpo que no deseaba, o nos permitirían tejer cuerpos a nuestro gusto con las hilazas de nuestras almas?`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "tejer cuerpos a nuestro gusto", lang: "es"
  },
  {
    t: `—Y en la muerte no me importará —dije—. Porque, si obro bien y voy al cielo, me harán enteramente nueva y seré tan hermosa como una azucena sobre el lago. Y si obro mal y voy al infierno, venderé mi alma mil veces, pero compraré un rostro hermoso y me alegraré de tenerlo aunque esté condenada.

Y corrí al desván y lloré durante mucho tiempo.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "compraré un rostro hermoso", lang: "es"
  },
  {
    t: `La quietud y la soledad del lugar acabaron por consolarme. Abrí el postigo que daba al huerto, alrededor del cual habían guiado un gran peral, y saqué el tejido de mi bolsa.

Sentada allí, mirando los árboles verdes, con el olor de nuestro heno llegando fresco en la brisa, mezclado con el de las rosas silvestres y la reina de los prados de la cuneta, escuché cantar a los mirlos cerca y lejos.

Cuando estaban muy lejos apenas se los podía separar de los demás pájaros, pues había un verdadero encantamiento de ellos: zorzales, mosquiteros, pardillos de siete colores, pinzones y escribanos. Era un tejido de muchos hilos, con un hilo maestro de oro puro, y resultaba muy consolador escucharlo.

Pensé que quizá el amor fuera así: muchos hilos de colores y un hilo maestro de oro puro.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "Pensé que quizá el amor fuera así", lang: "es"
  },
  {
    t: `El desván estaba muy cerca del techo de paja, y había muchos nidos bajo los aleros y un gorjeo continuo de golondrinas. Entre sus vigas había un nido de abejas silvestres; se las oía producir un murmullo blando y soñoliento y, por la mañana y al anochecer, se las veía ir en fila al lago a buscar agua.

Estando todo tan quieto, con las hermosas sombras de los manzanos poblando el huerto vacío, vino a mí —no puedo decir de dónde— una dulzura poderosísima que nunca había sentido.

No era religiosa, como la bondad de un versículo escuchado durante un sermón. Estaba más allá de eso. Era como si una criatura hecha enteramente de luz hubiera llegado de pronto desde muy lejos y se hubiese acurrucado en mi pecho.

Sobre todas las cosas apareció una belleza amable, como si un aire diferente reposara sobre ellas.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "una criatura hecha enteramente de luz", lang: "es"
  },
  {
    t: `Me puse a pensar que toda aquella dicha del desván me había llegado por estar maldita. Si no hubiese tenido el labio partido, que me ahuyentaba hacia mi propia alma solitaria, aquello nunca habría venido a mí.

Las manzanas se habrían amontonado en vano para contemplar un prodigio, porque yo nunca habría conocido la gloria que llegaba desde el otro lado del silencio.

Mientras lo pensaba, surgió de ninguna parte aquella cosa hermosa y se acomodó en mi corazón como una semilla del núcleo mismo del amor.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "el otro lado del silencio.", lang: "es"
  },
  {
    t: `Al contar esta historia hago poco caso del tiempo. Porque cuando el corazón sufre, ¿qué es el tiempo? Nada.

¿Escucha la voz del vigilante contando las horas que se apresuran el novio que ha pasado tanta hambre de su amor? ¿Le importa al que muere al amanecer hacia qué hora apunta el reloj cuando sale el sol, un sol que ya no sale para él?

Y cuando nosotros, pobres criaturas, nos levantamos contra todo el poder de las cosas que existen, luchando por abrirnos camino hacia nuestra paz —o hacia lo que creemos que es nuestra paz—, cuando quedamos aturdidos como un animal acosado en el ruedo, olvidamos el tiempo.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "¿qué es el tiempo?", lang: "es"
  },
  {
    t: `Abajo, en el granero oscuro, cantó el gallo, fino y dulce, y pensé que no sonaba como un ave terrenal; aunque quizá fuese porque yo estaba en el desván, donde las cosas siempre eran nuevas.

Tal vez te parezca extraño que una mujer como yo pensara tales cosas, pues siempre trabajé con las manos en tareas pobres y ásperas, mientras que una esperaría esos pensamientos de grandes damas sentadas ante sus tapices.

Pero estaba tan sola y tenía tanto tiempo para pensar, y con aquello y el saber de los libros que iba adquiriendo, toda clase de pensamientos crecieron en mi mente como juncos floridos y nomeolvides que brotan en un terreno pobre y pantanoso donde, de otro modo, no habría nada.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "como juncos floridos y nomeolvides que brotan en un terreno pobre", lang: "es"
  },
  {
    t: `Entonces volvía en mí y solo veía las altas nubes, que no se habían movido; los altos setos con reina de los prados debajo; los bosques, las colinas y el dulce aire azul, con alondras suspendidas como si los de arriba las hubieran dejado caer de unos hilos.

Temblaban tanto con su canto alegre que amenazaban con romperlos. No les importaba en absoluto quién ganaba el premio ni cuál cantaba mejor o más alto, mientras todas cantaran, mientras a ninguna le faltara un nido, el buche lleno, un trago de rocío y espacio donde cantar.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "espacio donde cantar.", lang: "es"
  },
  {
    t: `¿Cómo era su aspecto? ¿Qué apariencia tenía? ¿Era hermoso? Es difícil decirlo. En el amor no hay rostros, ni apariencia exterior, ni recuento de facciones.

Cuando una no es más que una polilla en la llama de sus ojos, ¿puede decir cuál es su estatura o si es moreno o rubio?

¿Sabremos, cuando lleguemos a la presencia de quien nos creó, qué apariencia exterior tiene su majestad? No. Solo nuestros corazones temblarán en la luz.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "nuestros corazones temblarán en la luz.", lang: "es"
  },
  {
    t: `Muchas veces es más fácil morir por amor que hacer el ridículo por amor.

Eso pensé mientras me izaban hasta la habitación oscura dentro de una nube de humo que me hacía jadear, con las manos extendidas para no golpearme contra los lados de la trampilla, sin saber si reírme de la necedad de todo aquello o llorar por la tristeza de aquella representación que tanto se burlaba de mí.

Porque allí estaba yo, fingiendo ser la mujer más hermosa que jamás había existido y, además, una diosa, cuando en realidad estaba maldita, como ya sabes.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "hacer el ridículo por amor.", lang: "es"
  },
  {
    t: `Me cubrí el rostro con la muselina y miré de soslayo a través de ella hacia aquel prodigio.

Porque para mí era entonces, y fue siempre, un prodigio; no por su aspecto ni por nada que hiciera, sino por el poder silencioso de lo que era, el poder reunido dentro de él, tremendo como una gran montaña sobre el cielo, que una no podía medir ni nombrar, sino únicamente sentir.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "el poder silencioso de lo que era", lang: "es"
  },
  {
    t: `Aquello, sin embargo, no pertenecía al día, sino a algo que estaba más allá. No quise preguntarme qué era. Porque, cuando el trepador azul llega a su propio árbol, no pregunta quién lo plantó ni qué nombre le dan los hombres. El árbol lo es todo para el trepador, y aquello lo era todo para mí.

Más tarde, cuando ya había aprendido a leer el Libro, leí:

—Su bandera sobre mí fue amor.

De pronto, por el camino quieto, entre las sombras y la niebla de mis propias pestañas, vi venir a alguien. Era un hombre. Y, si existe en esa palabra algún significado en el que yo no haya pensado, que quienes lean lo pongan en ella. Que pongan la fuerza y el poder, la bondad y la paciencia, la severidad y la majestuosa rectitud de todos los hombres buenos dentro de esa palabra, y que él la lleve. Porque era él mismo: Kester Woodseaves, el maestro.

Venía sin prisa, como quien tiene algún gran asunto que atender.

¿Qué hice yo, que sabía que su sonrisa era mi verano? Pues me levanté con tanta prisa que volqué los narcisos.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "su sonrisa era mi verano", lang: "es"
  },
  {
    t: `Siempre tuvo una voz fuera de lo común. Era como si, cuando hablaba, el sonido de su voz hiciera nuevo el mundo, sin importarle el mundo anterior.

Era como un espino ancho y florido en un día sofocante de principios de junio. Una podía sentarse debajo y descansar.

Y era como el fuego quieto del hogar en una noche de invierno, cuando Edric el Salvaje anda por el bosque, las cortinas están cerradas, las velas despabiladas, todo asegurado y el dueño de la casa ha regresado al hogar.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "hiciera nuevo el mundo", lang: "es"
  },
  {
    t: `Y cuando miré atrás me pareció —aunque me dije que debía de ser imaginación— que aquellos ojos, tan vivos y brillantes, descansaban sobre mí, me sonreían, me acogían como amiga y me suplicaban.

Eran como los ojos de un hombre cuando contempla largamente a su querida compañera, que le ha entregado su paz a cambio de la suya, su alma para que la guarde y su cuerpo para su alegría.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "le ha entregado su paz", lang: "es"
  },
  {
    t: `Me convenían aquella quietud y aquella melancolía, porque yo también estaba triste y callada. El hombre al que amaba estaba herido y no podía llegar hasta él.

Olvidaba que la señora Callard, con seis hijos, sabía muy bien cómo cuidar de seres desvalidos, porque los enamorados creen que nadie puede bendecir ni socorrer a su amor salvo ellos mismos. Y quizá haya algo de verdad en eso, quizá más que algo.

Seguimos y seguimos por un territorio que no era montañoso ni llano, en una noche que no era oscura ni luminosa, sintiéndonos ni alegres ni apenados. Pensé que parecíamos personas destinadas a algún lugar más allá del mundo que no era ni el infierno ni el cielo.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "algún lugar más allá del mundo", lang: "es"
  },
  {
    t: `El lago estaba rodeado tres veces, como si tres veces hubieran pronunciado un hechizo sobre él.

Primero estaba el círculo de robles y alerces, sauces, alisos y hayas, solemnes y fuertes, para mantener fuera al mundo. Después estaba el círculo de juncos, que suspiraban débilmente, frágiles y dispersos, pero bastantes, con sus largas sombras temblorosas, para mantener dentro los hechizos.

Luego estaba el círculo de azucenas, tendidas allí como si Jesús, caminando sobre el agua, las hubiese colocado con sus manos frescas antes de volverse hacia la multitud y decir:

—Mirad las azucenas.

Y como si ellas no fueran suficientes para sacudirte el alma, debajo de cada azucena —blanca y verde o de oro pálido— estaba su sombra luminosa, como si fuese su ángel.

Durante el largo día imperturbable, las azucenas y sus ángeles se miraban unas a otros y estaban contentos.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "las azucenas y sus ángeles", lang: "es"
  },
  {
    t: `En un junco alto, junto a la orilla, encontré una libélula que apenas empezaba a salir de su cuerpo, y me incliné muy cerca, conteniendo casi la respiración, para contemplar el milagro.

La vieja piel se abrió y consiguió sacar la cabeza. Entonces empezó la lucha, el trabajo de quedar libre: primero las patas, luego los hombros y las alas blandas y arrugadas. Parecía una criatura poseída; unas veces sufría convulsiones y otras quedaba rígida como un cadáver.

Poco antes del final permaneció inmóvil durante mucho tiempo, como si se preguntara si se atrevía a quedar completamente libre en un mundo enteramente nuevo. Después dio un gran impulso, un tirón como de estallido, y salió.

Subió un poco más por el junco, soñolienta y agotada como un niño después de un largo día de feria, y se quedó adormecida mientras empezaban a crecerle las alas.

—Bueno —le dije, entre una pequeña risa y algo muy parecido a un sollozo—, lo has conseguido. Te ha costado algo, pero has conseguido quedar libre.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "has conseguido quedar libre.", lang: "es"
  },
  {
    t: `—Bueno —dijo—, hay dos o tres personas que te conocen, Prue. Y pocas te conocen y no te quieren. Supongo que he ido espigando un poco en sus corazones. Y creo que no hay mucho de ti que yo no conozca, Prue.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "pocas te conocen y no te quieren.", lang: "es"
  },
  {
    t: `¡Qué día fue aquel! ¿Oro? Claro que era oro. Espigué y espigué, y cada brazada parecía un tesoro precioso y celestial.

Casi todos los campos estaban limpios y desnudos cuando tomamos el té bajo la sombra del seto, porque no refrescó al alargarse las sombras. Era uno de esos días de mediados de septiembre en que todo el calor reunido durante el verano parece gastarse y derrocharse por amor al grano dorado.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "por amor al grano dorado.", lang: "es"
  },
  {
    t: `La mañana llegó fresca y dulce, y los grajos salieron en torrente por el cielo ventoso hacia nuestros rastrojos, dejando caer aquí y allá sus graznidos soñolientos y satisfechos.

De camino al ordeño me detuve junto a las parvas para dar gracias por el cereal.

¿Por qué pensé entonces en aquellas palabras: «el precioso veneno»? ¿Por qué pensé en aquello que los hombres recogen con la cosecha y atesoran, aunque sea como hierba de fuego dentro de un almiar?

¿Por qué se agitó un frío presagio de horror en mi corazón, donde todo era alegre y cálido, como una helada repentina que cae sobre el jardín una tarde de otoño, cuando las dalias están en lo más alto de su orgullo —color de vino y oro claro, cada pétalo en su sitio, floreciendo por encima del muro con las abejas alrededor—, de modo que por la mañana todo aparece entristecido por el invierno?`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "el precioso veneno", lang: "es"
  },
  {
    t: `Todos aquellos pensamientos, confusos y aturdidos, vinieron a mí mientras me aferraba a la verja con el viento abrasador en la cara, demasiado paralizada para moverme.

Hay desgracias que hacen que una se levante de un salto y corra para salvarse; pero hay otras demasiado terribles para eso, porque no dejan nada que hacer.

Entonces una quietud cae sobre el alma, como la quietud del conejo cuando la comadreja lo contempla con ardor y él sabe que ya no queda nada que hacer.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "una quietud cae sobre el alma", lang: "es"
  },
  {
    t: `Omitieron la parte de los terrones a la cabeza y a los pies, porque el agua era su sepultura.

¡Ah! Toda aquella gran extensión de agua no era demasiado para formar la tumba de un hombre tan fuerte. La niebla de una milla que reposaba sobre el lugar no era un sudario demasiado grandioso.

Porque, aunque se equivocó, hizo el mal y dañó a otros con su fuerza, nunca obró con mezquindad, ni entregó un trabajo mal hecho, ni mintió. No podía ceder, del mismo modo que el granito no puede deshacerse como la arenisca.

Y ahora había jugado su última partida de Conquistar, y aquello con lo que jugó no fue una de las grandes caracolas rosadas y blancas, sino su propia vida.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "el agua era su sepultura.", lang: "es"
  },
  {
    t: `Allí, mirándome desde su caballo con una mirada tan detenida y tan ardiente de vida que, si no hubiese estado segura de lo contrario, habría pensado que me amaba, estaba nada menos que Kester Woodseaves.

Parecía un poco mayor, y su rostro estaba aún más limpiamente trazado que antes, como si el alma hubiera estado ocupada cincelándolo. En cuanto a sus ojos, toda la luz del cielo estaba en ellos, además de un toque muy agradable del viejo Adán.

Me recorrieron de la cabeza a los pies, y descansé.

¡Ah! Atada al taburete de inmersión, en un estado tan lamentable que ninguna mujer respetable elegiría que la viera hombre alguno —y mucho menos el hombre al que amaba—, descansé.

Ya nada me importaba. Nada me preocupaba. Kester estaba allí. Kester había tomado las cosas en sus manos. ¿Qué podía sucederme?

Tal era mi fe que, aunque hubiera trescientas personas, más o menos, contra mí y solo Kester a mi favor, sabía que estaba a salvo. Podría haberme vuelto de lado y dormido en aquel viejo taburete como si fuese una cama de plumas, tan tranquila estaba mi mente.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "Kester estaba allí.", lang: "es"
  },
  {
    t: `Se inclinó. Puso los brazos a mi alrededor. Me alzó hasta la silla. Fue exactamente como en el sueño que había tenido.

Y, como en el sueño, Felena levantó la mirada suplicante y él no reparó en ella, y el ruido de la gente fue apagándose: las risas, las maldiciones de Huglet y Grimble, las palmadas de los niños Callard y la voz aguda del abuelo Callard contando un combate de lucha ocurrido casi un siglo antes.

Todo descendió, todo se desvaneció en el aire quieto. Solo quedó el viento de la tarde levantando las ramas, como un amante que levanta el largo cabello de su amada.`,
    a: "Mary Webb", obra: "Precioso veneno, Mary Webb",
    highlight: "el viento de la tarde levantando las ramas", lang: "es"
  }
];

const ORGULLO_Y_PREJUICIO_QUOTES = [
  {
    t: `Es una verdad universalmente reconocida que un hombre soltero, poseedor de una buena fortuna, ha de necesitar esposa.

Por poco que se conozcan los sentimientos o las intenciones de semejante hombre cuando llega por primera vez a una comarca, esta verdad se encuentra tan firmemente asentada en la mente de las familias vecinas que se lo considera la legítima propiedad de alguna de sus hijas.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "la legítima propiedad de alguna de sus hijas", lang: "es"
  },
  {
    t: `—No tienes compasión de mis pobres nervios.

—Te equivocas, querida. Siento un profundo respeto por tus nervios. Son viejos amigos míos. Te he oído mencionarlos con consideración durante al menos estos últimos veinte años.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "Son viejos amigos míos", lang: "es"
  },
  {
    t: `—¿A cuál te refieres? —Y, volviéndose, miró un instante a Elizabeth hasta que, al encontrarse con sus ojos, apartó los suyos y dijo fríamente—: Es pasable, pero no lo bastante hermosa para tentarme; y ahora mismo no estoy de humor para dar importancia a jóvenes a quienes otros hombres desdeñan.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "no lo bastante hermosa para tentarme", lang: "es"
  },
  {
    t: `—Su conjetura es completamente equivocada, se lo aseguro. Mi mente estaba ocupada de una manera mucho más agradable. Estaba meditando sobre el enorme placer que puede proporcionar un par de ojos hermosos en el rostro de una mujer bonita.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "un par de ojos hermosos", lang: "es"
  },
  {
    t: `—La vanidad y el orgullo son cosas distintas, aunque las palabras se empleen a menudo como sinónimas. Una persona puede ser orgullosa sin ser vanidosa. El orgullo se refiere más a la opinión que tenemos de nosotros mismos; la vanidad, a lo que quisiéramos que los demás pensaran de nosotros.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "La vanidad y el orgullo son cosas distintas", lang: "es"
  },
  {
    t: `—Su orgullo —dijo la señorita Lucas— no me ofende tanto como suele hacerlo el orgullo, porque en su caso tiene una excusa. No puede sorprender que un joven tan distinguido, con familia, fortuna, todo a su favor, tenga una opinión elevada de sí mismo. Si se me permite expresarlo así, tiene derecho a ser orgulloso.

—Eso es muy cierto —respondió Elizabeth—, y podría perdonarle fácilmente su orgullo si no hubiera mortificado el mío.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "si no hubiera mortificado el mío", lang: "es"
  },
  {
    t: `—La felicidad en el matrimonio es enteramente cuestión de azar. Aunque las disposiciones de ambos sean perfectamente conocidas o muy semejantes de antemano, eso no aumenta en lo más mínimo su felicidad.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "cuestión de azar", lang: "es"
  },
  {
    t: `—Todos podemos empezar con facilidad: una ligera inclinación es bastante natural; pero son muy pocos los que tienen corazón suficiente para enamorarse de verdad sin estímulo. En nueve casos de cada diez, a una mujer le conviene mostrar más afecto del que siente. Sin duda Bingley siente inclinación por tu hermana; pero quizá nunca pase de eso si ella no lo ayuda a avanzar.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "enamorarse de verdad sin estímulo", lang: "es"
  },
  {
    t: `—Nada es más engañoso —dijo Darcy— que la apariencia de humildad. A menudo no es más que despreocupación por la opinión ajena y, a veces, una jactancia indirecta.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "la apariencia de humildad", lang: "es"
  },
  {
    t: `—Creo que en toda disposición existe una tendencia hacia algún mal particular, un defecto natural que ni siquiera la mejor educación puede vencer.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "un defecto natural", lang: "es"
  },
  {
    t: `—Una vez perdida mi buena opinión, se pierde para siempre.

—Ese sí es un defecto —exclamó Elizabeth—. El resentimiento implacable es una sombra en el carácter. Pero ha escogido bien su falta. En verdad no puedo reírme de ella. Está usted a salvo de mí.

—Creo que en todo carácter existe una tendencia hacia algún mal particular, un defecto natural que ni siquiera la mejor educación puede vencer.

—Y el defecto de usted es la propensión a odiar a todo el mundo.

—Y el de usted —replicó él, sonriendo— es empeñarse deliberadamente en malinterpretarlos.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "empeñarse deliberadamente en malinterpretarlos", lang: "es"
  },
  {
    t: `—Espero no ridiculizar jamás lo sabio o lo bueno. Las necedades y los disparates, los caprichos y las inconsecuencias sí me divierten, lo confieso, y me río de ellos siempre que puedo.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "Las necedades y los disparates", lang: "es"
  },
  {
    t: `—Una alternativa desdichada se presenta ante ti, Elizabeth. Desde hoy tendrás que ser una extraña para uno de tus padres. Tu madre no volverá a verte si no te casas con él… si te casas con él, yo no volveré a verte.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "si no te casas con él… si te casas con él", lang: "es"
  },
  {
    t: `—No soy romántica, ya lo sabes. Nunca lo fui. Solo pido un hogar confortable; y, considerando el carácter, las relaciones y la posición del señor Collins, estoy convencida de que mis probabilidades de ser feliz con él son tan buenas como las de la mayoría de quienes se casan.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "Solo pido un hogar confortable", lang: "es"
  },
  {
    t: `Hay pocas personas a quienes ame de verdad y todavía menos de quienes piense bien.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "todavía menos de quienes piense bien", lang: "es"
  },
  {
    t: `Cuanto más veo el mundo, más descontenta estoy de él; y cada día confirma mi creencia en la inconsistencia de todos los caracteres humanos y en lo poco que puede confiarse en la apariencia, sea de mérito o de juicio.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "la inconsistencia de todos los caracteres humanos", lang: "es"
  },
  {
    t: `—Hay en mí una obstinación que jamás soporta ser asustada por voluntad ajena. Mi valor se eleva con cada intento de intimidarme.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "Mi valor se eleva con cada intento de intimidarme", lang: "es"
  },
  {
    t: `Tras varios minutos de silencio, se acercó a ella visiblemente agitado y comenzó:

—En vano he luchado. No sirve de nada. Mis sentimientos no pueden ser reprimidos. Debe permitirme decirle con cuánto ardor la admiro y la amo.

El asombro de Elizabeth estaba más allá de toda expresión. Lo miró fijamente, se sonrojó, dudó y guardó silencio. Él tomó aquello por suficiente estímulo, y de inmediato siguió la confesión de todo cuanto sentía y había sentido por ella desde hacía mucho tiempo. Habló bien; pero había sentimientos, además de los del corazón, que exponer, y no fue más elocuente al hablar de ternura que de orgullo. Se extendió con calor sobre la inferioridad de ella —sobre la degradación que suponía— y sobre los obstáculos familiares que el juicio había opuesto siempre a la inclinación: un calor que parecía debido a la importancia que estaba hiriendo, pero muy poco apropiado para favorecer su pretensión.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "no fue más elocuente al hablar de ternura que de orgullo", lang: "es"
  },
  {
    t: `—También podría preguntarle por qué, con un propósito tan evidente de ofenderme e insultarme, eligió decirme que le gustaba contra su voluntad, contra su razón e incluso contra su carácter.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "contra su voluntad, contra su razón e incluso contra su carácter", lang: "es"
  },
  {
    t: `—No hacía un mes que lo conocía cuando comprendí que era usted el último hombre del mundo con quien podrían persuadirme de casarme.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "el último hombre del mundo", lang: "es"
  },
  {
    t: `—¡Qué humillante es este descubrimiento! Y, sin embargo, ¡qué justa humillación! De haber estado enamorada, no habría podido estar más miserablemente ciega.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "miserablemente ciega", lang: "es"
  },
  {
    t: `Nunca había visto un lugar por el cual la naturaleza hubiera hecho más, ni donde la belleza natural hubiera sido tan poco contrariada por un gusto torpe.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "la belleza natural hubiera sido tan poco contrariada por un gusto torpe", lang: "es"
  },
  {
    t: `Lo respetaba, lo estimaba, le estaba agradecida, sentía un verdadero interés por su bienestar; y solo quería saber hasta qué punto deseaba que ese bienestar dependiera de ella.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "deseaba que ese bienestar dependiera de ella", lang: "es"
  },
  {
    t: `—Recuerdo que, cuando la conocimos en Hertfordshire, todos nos asombramos mucho al descubrir que se la tenía por una belleza; y recuerdo particularmente que una noche, después de que cenaran en Netherfield, usted dijo: «¿Ella, una belleza? Antes llamaría ingeniosa a su madre». Pero después pareció mejorar ante sus ojos, y creo que durante algún tiempo llegó a considerarla bastante bonita.

Convencida como estaba la señorita Bingley de que Darcy admiraba a Elizabeth, aquel no era el mejor modo de recomendarse a sí misma; pero las personas airadas no siempre son prudentes. Al verlo por fin algo irritado, obtuvo todo el éxito que esperaba.

—Sí —respondió Darcy, que ya no pudo contenerse—, pero eso fue únicamente cuando la conocí; porque hace ya muchos meses que la considero una de las mujeres más hermosas de cuantas conozco.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "las personas airadas no siempre son prudentes", lang: "es"
  },
  {
    t: `Darcy no respondió. Parecía apenas oírla y caminaba de un lado a otro de la habitación, sumido en una seria meditación, con el ceño contraído y el aire sombrío. Elizabeth no tardó en advertirlo y lo comprendió al instante. Su poder se desvanecía; todo debía desvanecerse ante semejante prueba de debilidad familiar, ante semejante certeza de la más profunda deshonra. No podía sorprenderse ni condenarlo; pero la convicción de que él se había dominado no le daba consuelo ni mitigaba su aflicción.

Al contrario, aquello estaba calculado precisamente para hacerle comprender sus propios deseos; y nunca había sentido con tanta sinceridad que podría haberlo amado como ahora, cuando todo amor debía ser vano.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "cuando todo amor debía ser vano", lang: "es"
  },
  {
    t: `—Al casarme con su sobrino, no consideraría que abandono esa esfera. Él es un caballero; yo soy hija de un caballero; hasta ahí somos iguales.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "hasta ahí somos iguales", lang: "es"
  },
  {
    t: `—Sean cuales sean mis parientes —dijo Elizabeth—, si su sobrino no pone reparos, nada tienen que ver con usted.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "nada tienen que ver con usted", lang: "es"
  },
  {
    t: `—Solo estoy resuelta a actuar de la manera que, en mi propia opinión, constituya mi felicidad, sin referencia a usted ni a ninguna persona tan enteramente ajena a mí.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "constituya mi felicidad", lang: "es"
  },
  {
    t: `—Si insiste en darme las gracias —respondió él—, désmelas únicamente por usted. No intentaré negar que el deseo de hacerla feliz pudo añadir fuerza a los demás motivos que me impulsaron. Pero su familia no me debe nada. Por mucho que los respete, creo que pensé únicamente en usted.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "creo que pensé únicamente en usted", lang: "es"
  },
  {
    t: `—Si sus sentimientos siguen siendo los mismos que el pasado abril, dígamelo de inmediato. Mis afectos y mis deseos no han cambiado; pero una sola palabra suya me hará guardar silencio sobre este asunto para siempre.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "Mis afectos y mis deseos no han cambiado", lang: "es"
  },
  {
    t: `—Usted me dio una lección, dura al principio, pero sumamente provechosa. Por usted fui debidamente humillado. Llegué a su lado sin dudar de cómo sería recibido. Usted me mostró cuán insuficientes eran todas mis pretensiones para agradar a una mujer digna de ser agradada.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "Por usted fui debidamente humillado", lang: "es"
  },
  {
    t: `—Debe aprender un poco de mi filosofía. Piense solo en el pasado cuando su recuerdo le proporcione placer.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "Piense solo en el pasado cuando su recuerdo le proporcione placer", lang: "es"
  },
  {
    t: `—No puedo fijar la hora, ni el lugar, ni la mirada, ni las palabras que pusieron los cimientos. Fue hace demasiado tiempo. Ya estaba en medio antes de saber que había empezado.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "Ya estaba en medio antes de saber que había empezado", lang: "es"
  },
  {
    t: `—Quizá no siempre lo amé tanto como ahora. Pero, en casos como este, una buena memoria es imperdonable. Esta es la última vez que yo misma lo recordaré.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "una buena memoria es imperdonable", lang: "es"
  },
  {
    t: `—Sí, sí lo quiero —respondió ella, con lágrimas en los ojos—; lo amo. En verdad no tiene un orgullo impropio. Es enteramente amable. Usted no sabe lo que realmente es; así que, por favor, no me haga daño hablando de él en esos términos.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "Usted no sabe lo que realmente es", lang: "es"
  },
  {
    t: `Soy la criatura más feliz del mundo. Quizá otras personas lo hayan dicho antes, pero ninguna con tanta justicia. Soy incluso más feliz que Jane; ella solo sonríe, yo río.`,
    a: "Jane Austen", obra: "Orgullo y prejuicio, Jane Austen",
    highlight: "ella solo sonríe, yo río", lang: "es"
  }
];

const LA_METAMORFOSIS_QUOTES = [
  {
    t: `Al despertar Gregor Samsa una mañana de sueños intranquilos, se encontró en su cama transformado en un monstruoso insecto.

Estaba tendido sobre su espalda, dura como una coraza, y, al levantar un poco la cabeza, vio su vientre abombado y pardo, dividido por endurecimientos arqueados, sobre cuya altura apenas podía sostenerse la colcha, ya dispuesta a resbalar por completo.

Sus muchas patas, lastimosamente delgadas en comparación con el volumen del resto de su cuerpo, se agitaban desvalidas ante sus ojos.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "transformado en un monstruoso insecto.", lang: "es"
  },
  {
    t: `La mirada de Gregor se dirigió entonces hacia la ventana, y el tiempo sombrío —se oían las gotas de lluvia golpear la chapa del alféizar— lo volvió completamente melancólico.

—¿Qué ocurriría si durmiera un poco más y olvidara todas estas tonterías? —pensó.

Pero aquello era del todo imposible, pues estaba acostumbrado a dormir sobre el lado derecho y, en su estado actual, no podía colocarse en esa posición.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "olvidara todas estas tonterías", lang: "es"
  },
  {
    t: `—Dios mío —pensó—, ¡qué profesión tan agotadora he elegido! Un día tras otro, siempre de viaje. Las preocupaciones comerciales son mucho mayores que en el propio establecimiento, y además se me impone esta tortura de viajar: la inquietud por los enlaces de los trenes, la comida irregular y mala, un trato humano siempre cambiante, nunca duradero, nunca cordial.

¡Que el diablo se lo lleve todo!`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "nunca duradero, nunca cordial.", lang: "es"
  },
  {
    t: `—Si no me contuviera por mis padres, hace mucho que habría renunciado. Me habría plantado ante el jefe y le habría dicho desde el fondo del corazón lo que pienso. ¡Se habría caído del pupitre!

También es una manera muy extraña de sentarse sobre el pupitre y hablar desde las alturas con el empleado, que, además, tiene que acercarse muchísimo a causa de la sordera del jefe.

Pero la esperanza todavía no está completamente perdida. En cuanto haya reunido el dinero necesario para pagarle la deuda de mis padres —aún tardaré cinco o seis años—, lo haré sin falta. Entonces daré el gran corte.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "Entonces daré el gran corte.", lang: "es"
  },
  {
    t: `Sin duda, el jefe acudiría con el médico del seguro, reprocharía a sus padres que tuvieran un hijo holgazán y cortaría cualquier objeción remitiéndose al médico, para quien solo existían personas completamente sanas, pero enemigas del trabajo.

Y, después de todo, ¿estaría en este caso tan equivocado? Gregor se sentía realmente bien, aparte de una somnolencia que, después de haber dormido tanto, resultaba innecesaria, y hasta tenía un hambre especialmente intensa.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "personas completamente sanas, pero enemigas del trabajo.", lang: "es"
  },
  {
    t: `—Gregor —llamaron; era su madre—, son las siete menos cuarto. ¿No tenías que marcharte?

¡Aquella voz suave! Gregor se sobresaltó al oír la suya cuando respondió. Su antigua voz seguía siendo inconfundiblemente la misma, pero desde abajo se mezclaba con ella un piar doloroso e incontenible que solo dejaba a las palabras su claridad durante el primer instante, para destruirlas después de tal manera en su resonancia que nadie podía saber si había oído correctamente.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "Su antigua voz seguía siendo inconfundiblemente la misma", lang: "es"
  },
  {
    t: `Cuando volvió a encontrarse, después del mismo esfuerzo y suspirando, tendido como antes, y vio otra vez sus pequeñas patas combatiendo entre sí, quizá con mayor violencia todavía, sin descubrir manera alguna de introducir calma y orden en aquella arbitrariedad, se dijo de nuevo que era imposible permanecer en la cama y que lo más sensato sería sacrificarlo todo si existía siquiera la más pequeña esperanza de liberarse de ella.

Pero, al mismo tiempo, no olvidaba recordarse que la reflexión tranquila, la más tranquila de todas, era mucho mejor que las decisiones desesperadas.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "la reflexión tranquila, la más tranquila de todas", lang: "es"
  },
  {
    t: `—Ya son las siete —se dijo cuando el despertador volvió a dar la hora—, las siete, y todavía esta niebla.

Y permaneció un momento quieto, respirando débilmente, como si esperara que del silencio completo surgiera el regreso de las circunstancias reales y naturales.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "el regreso de las circunstancias reales y naturales.", lang: "es"
  },
  {
    t: `¿Por qué estaba Gregor condenado a trabajar en una empresa donde, ante la menor falta, se concebía inmediatamente la mayor sospecha?

¿Eran todos los empleados, sin excepción, unos canallas? ¿No había entre ellos un solo hombre fiel y entregado que, aunque hubiera desaprovechado para la empresa apenas unas horas de la mañana, enloqueciera de remordimiento y fuera verdaderamente incapaz de abandonar la cama?`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "ante la menor falta, se concebía inmediatamente la mayor sospecha", lang: "es"
  },
  {
    t: `—Bien —dijo Gregor, plenamente consciente de que era el único que había conservado la calma—, enseguida me vestiré, empaquetaré el muestrario y me marcharé. ¿Me permitirán marcharme?

Señor apoderado, ya ve que no soy obstinado y que trabajo con gusto. Viajar es fatigoso, pero no podría vivir sin viajar.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "era el único que había conservado la calma", lang: "es"
  },
  {
    t: `—Uno puede ser momentáneamente incapaz de trabajar, pero precisamente entonces es cuando debe recordarse su rendimiento anterior y considerar que, una vez eliminado el obstáculo, trabajará después con mayor diligencia y concentración.

Estoy en una situación difícil, pero saldré de ella. No me lo ponga más difícil de lo que ya es. ¡Póngase de mi parte en la empresa!`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "Estoy en una situación difícil, pero saldré de ella.", lang: "es"
  },
  {
    t: `Ninguna súplica de Gregor sirvió; ninguna súplica fue tampoco comprendida. Por mucho que inclinara humildemente la cabeza, el padre no hacía más que golpear el suelo con los pies con mayor fuerza.

La madre había abierto una ventana a pesar del frío y, asomada, hundía el rostro entre las manos. Entre la calle y la escalera surgió una corriente intensa: las cortinas volaron, los periódicos de la mesa crujieron y algunas hojas fueron arrastradas por el suelo.

El padre avanzaba inexorablemente y emitía silbidos, como un salvaje.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "ninguna súplica fue tampoco comprendida.", lang: "es"
  },
  {
    t: `Un lado de su cuerpo se alzó; quedó atravesado en el hueco de la puerta, con un costado completamente desollado. En la puerta blanca quedaron manchas desagradables.

Pronto quedó atascado y ya no habría podido moverse por sí mismo: las patas de un lado colgaban temblando en el aire; las del otro estaban dolorosamente apretadas contra el suelo.

Entonces el padre le dio desde atrás un empujón fuerte, ahora verdaderamente liberador, y Gregor salió volando, sangrando copiosamente, hacia el interior de su habitación.

La puerta fue cerrada con el bastón. Entonces, por fin, quedó todo en silencio.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "Entonces, por fin, quedó todo en silencio.", lang: "es"
  },
  {
    t: `Junto a la puerta había un cuenco lleno de leche dulce en el que flotaban pequeños trozos de pan blanco. Casi se echó a reír de alegría, pues tenía aún más hambre que por la mañana, e inmediatamente sumergió la cabeza en la leche casi hasta los ojos.

Pero pronto la retiró, decepcionado. No solo le resultaba difícil comer a causa de su dolorido costado izquierdo —solo podía hacerlo si el cuerpo entero colaboraba jadeando—, sino que la leche, que antes había sido su bebida predilecta y que su hermana seguramente había dejado allí por esa razón, ya no le gustaba en absoluto.

Incluso se apartó del cuenco casi con repugnancia.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "ya no le gustaba en absoluto", lang: "es"
  },
  {
    t: `Durante aquella larga tarde se abrió una de las puertas laterales hasta dejar una pequeña rendija y después la otra, pero ambas volvieron a cerrarse enseguida. Alguien había sentido la necesidad de entrar, pero también demasiados reparos.

Gregor se detuvo inmediatamente junto a la puerta del salón, decidido a atraer de algún modo al visitante vacilante o, por lo menos, a averiguar quién era. Pero la puerta ya no volvió a abrirse y Gregor esperó en vano.

Por la mañana, cuando las puertas estaban cerradas, todos habían querido entrar. Ahora que él había abierto una y las otras habían permanecido abiertas durante el día, no entraba nadie; además, las llaves estaban metidas desde fuera.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "ahora no entraba nadie", lang: "es"
  },
  {
    t: `Permaneció bajo el sofá toda la noche, que pasó en parte en un sueño ligero, del cual el hambre lo despertaba una y otra vez, y en parte entre preocupaciones y esperanzas imprecisas.

Todas ellas lo llevaban a la conclusión de que, por el momento, debía comportarse con calma y hacer soportables a la familia, mediante la paciencia y la mayor consideración, las molestias que, en su estado actual, estaba obligado a causarles.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "la paciencia y la mayor consideración", lang: "es"
  },
  {
    t: `¿Advertiría ella que había dejado la leche y que no había sido por falta de hambre? ¿Traería otra comida que le sentara mejor?

Si no lo hacía por sí misma, preferiría morir de hambre antes que llamar su atención, aunque sentía un impulso enorme de salir disparado de debajo del sofá, arrojarse a los pies de su hermana y suplicarle algo bueno para comer.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "preferiría morir de hambre", lang: "es"
  },
  {
    t: `Gregor nunca pudo averiguar con qué excusas habían conseguido sacar de la casa al médico y al cerrajero aquella primera mañana.

Como no se le entendía, a nadie se le ocurrió —ni siquiera a su hermana— que él pudiera comprender a los demás; por eso, cuando ella estaba en su habitación, Gregor tenía que conformarse con escuchar de vez en cuando sus suspiros y sus invocaciones a los santos.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "a nadie se le ocurrió —ni siquiera a su hermana— que él pudiera comprender a los demás", lang: "es"
  },
  {
    t: `A menudo permanecía allí durante noches enteras, sin dormir un solo instante, arañando el cuero durante horas. O no evitaba el gran esfuerzo de empujar una silla hasta la ventana, trepar al alféizar y, apoyado en la silla, asomarse, evidentemente por algún recuerdo de la sensación liberadora que antes encontraba al mirar por la ventana.

Pero, en realidad, cada día veía con menor claridad incluso las cosas situadas a poca distancia. Ya no podía distinguir el hospital de enfrente, cuya visión demasiado frecuente había maldecido antes.

De no haber sabido con exactitud que vivía en la tranquila pero completamente urbana Charlottenstrasse, habría podido creer que desde su ventana contemplaba un desierto donde el cielo gris y la tierra gris se unían sin distinguirse.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "el cielo gris y la tierra gris se unían sin distinguirse.", lang: "es"
  },
  {
    t: `Para ahorrarle incluso aquella visión, Gregor transportó un día sobre su espalda —necesitó cuatro horas para hacerlo— la sábana hasta el sofá y la dispuso de tal modo que quedó completamente cubierto y su hermana no podría verlo ni siquiera si se agachaba.

Si ella hubiera considerado innecesaria aquella sábana, habría podido retirarla, pues era suficientemente evidente que aislarse por completo no podía constituir un placer para Gregor.

Pero la dejó como estaba, y Gregor creyó incluso captar una mirada de agradecimiento cuando levantó con cautela la sábana para comprobar cómo recibía su hermana la nueva disposición.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "Para ahorrarle incluso aquella visión", lang: "es"
  },
  {
    t: `¿Deseaba realmente que su habitación cálida, amueblada confortablemente con muebles heredados, se transformara en una cueva donde podría, desde luego, arrastrarse sin obstáculos en todas direcciones, pero al precio de olvidar rápida y completamente su pasado humano?

Ya estaba cerca de olvidarlo, y solo la voz de su madre, que hacía tanto tiempo que no escuchaba, lo había sacudido.

No debía retirarse nada. Todo tenía que permanecer.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "olvidar rápida y completamente su pasado humano", lang: "es"
  },
  {
    t: `—¿No es como si, al retirar los muebles, demostráramos que abandonamos toda esperanza de mejoría y lo dejamos despiadadamente entregado a sí mismo? —concluyó la madre en voz muy baja—. Creo que lo mejor sería conservar la habitación exactamente en el estado en que estaba antes, para que Gregor, cuando vuelva con nosotros, lo encuentre todo intacto y pueda olvidar con mayor facilidad este tiempo intermedio.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "cuando vuelva con nosotros", lang: "es"
  },
  {
    t: `La madre vio la enorme mancha parda sobre el papel floreado de la pared y, antes de comprender realmente que aquello que veía era Gregor, gritó con voz áspera:

—¡Dios mío! ¡Dios mío!

Y cayó sobre el sofá con los brazos extendidos, como si renunciara a todo, y quedó inmóvil.

—¡Tú, Gregor! —gritó la hermana, levantando el puño y dirigiéndole una mirada penetrante.

Eran las primeras palabras que le dirigía directamente desde la transformación.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "las primeras palabras que le dirigía directamente", lang: "es"
  },
  {
    t: `La grave herida de Gregor, que lo hizo sufrir durante más de un mes —la manzana permaneció incrustada en su carne como recuerdo visible, pues nadie se atrevió a retirarla—, pareció recordar incluso al padre que Gregor, pese a su actual aspecto triste y repugnante, era un miembro de la familia.

No se lo podía tratar como a un enemigo. El deber familiar exigía tragarse la repugnancia y soportar, nada más que soportar.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "soportar, nada más que soportar.", lang: "es"
  },
  {
    t: `El padre se negaba obstinadamente a quitarse el uniforme de ordenanza incluso en casa. Mientras la bata colgaba inútilmente de la percha, dormía completamente vestido en su sitio, como si estuviera siempre dispuesto a prestar servicio y aguardara también allí la voz de un superior.

Cuando las dos mujeres conseguían por fin levantarlo, apoyado en ellas abría los ojos, miraba alternativamente a la madre y a la hermana y acostumbraba a decir:

—Esto es vida. Esta es la tranquilidad de mis años de vejez.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "Esto es vida.", lang: "es"
  },
  {
    t: `Se habían acostumbrado a introducir en aquella habitación los objetos que no podían guardar en ningún otro lugar. Y ahora eran muchos, pues habían alquilado una habitación de la vivienda a tres huéspedes.

Todo lo que era inútil o incluso estaba sucio resultaba intolerable para aquellos hombres. Por eso muchas cosas habían quedado sobrantes: no podían venderse, pero tampoco querían tirarlas. Todas emigraron a la habitación de Gregor.

También el cajón de las cenizas y el cubo de los desperdicios de la cocina.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "Todo lo que era inútil", lang: "es"
  },
  {
    t: `La hermana empezó a tocar. Su rostro estaba inclinado hacia un lado, y sus ojos seguían las líneas de la partitura con expresión atenta y triste.

Gregor, atraído por la música, avanzó un poco más y ya tenía la cabeza dentro del salón. Apenas le extrañó haberse vuelto últimamente tan poco considerado con los demás; antes, aquella consideración había sido su orgullo.

Y, sin embargo, precisamente ahora habría tenido más motivos para ocultarse. Cubierto de polvo, arrastrando sobre la espalda y los costados hilos, cabellos y restos de comida, avanzó un poco más sobre el suelo inmaculado.

¿Era un animal, puesto que la música lo conmovía tanto? Le parecía que se le mostraba el camino hacia el alimento desconocido que anhelaba.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "el alimento desconocido que anhelaba.", lang: "es"
  },
  {
    t: `—Queridos padres —dijo la hermana, golpeando la mesa con la mano a modo de introducción—, esto no puede continuar. Quizá vosotros no lo comprendáis, pero yo sí. No quiero pronunciar el nombre de mi hermano ante este monstruo; por eso solo digo: debemos intentar deshacernos de él.

Hemos hecho todo lo humanamente posible para cuidarlo y soportarlo. Creo que nadie podría hacernos el menor reproche.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "debemos intentar deshacernos de él.", lang: "es"
  },
  {
    t: `—Tienes que intentar abandonar la idea de que eso es Gregor. Que lo hayamos creído durante tanto tiempo es precisamente nuestra verdadera desgracia. Pero ¿cómo podría ser Gregor?

Si fuera Gregor, hace mucho que habría comprendido que la convivencia entre seres humanos y semejante animal es imposible, y se habría marchado voluntariamente. Entonces ya no tendríamos hermano, pero podríamos seguir viviendo y conservar honradamente su recuerdo.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "Si fuera Gregor", lang: "es"
  },
  {
    t: `La manzana podrida de su espalda y la zona inflamada que la rodeaba, completamente cubierta de un polvo suave, apenas le producían ya sensación alguna.

Pensó en su familia con ternura y amor. Su convicción de que debía desaparecer era quizá aún más firme que la de su hermana.

Permaneció en aquel estado de reflexión vacía y pacífica hasta que el reloj de la torre dio las tres de la madrugada. Todavía presenció el comienzo de la claridad general al otro lado de la ventana.

Después, su cabeza descendió involuntariamente por completo y de sus orificios nasales salió débilmente su último aliento.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "debía desaparecer", lang: "es"
  },
  {
    t: `—¿Muerto? —preguntó la señora Samsa, mirando a la asistenta, aunque podía comprobarlo por sí misma e incluso reconocerlo sin necesidad de comprobar nada.

—Eso creo yo —respondió la mujer, y empujó con la escoba el cadáver de Gregor un buen trecho hacia un lado para demostrarlo.

La señora Samsa hizo un gesto como si quisiera detener la escoba, pero no lo hizo.

—Bueno —dijo el señor Samsa—, ahora podemos dar gracias a Dios.

Se santiguó, y las tres mujeres siguieron su ejemplo.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "ahora podemos dar gracias a Dios.", lang: "es"
  },
  {
    t: `La asistenta cerró la puerta y abrió la ventana por completo. A pesar de lo temprano de la mañana, en el aire fresco había ya cierta tibieza. Era, después de todo, finales de marzo.

Los tres salieron juntos de la vivienda, cosa que no habían hecho desde hacía meses, y tomaron el tranvía hacia las afueras. El vagón, donde estaban solos, aparecía completamente atravesado por el cálido sol.

Cómodamente recostados en sus asientos, hablaron de sus perspectivas de futuro y descubrieron que, examinadas con mayor atención, no eran en absoluto malas.`,
    a: "Franz Kafka", obra: "La metamorfosis, Franz Kafka",
    highlight: "el cálido sol.", lang: "es"
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
  ...RABELAIS_QUOTES,
  ...FRANKENSTEIN_QUOTES,
  ...ANNE_DE_LAS_TEJAS_VERDES_QUOTES,
  ...LA_VIDA_ES_SUENO_QUOTES,
  ...BARTLEBY_QUOTES,
  ...CEREZAS_DEL_CEMENTERIO_QUOTES,
  ...NIEBLA_QUOTES,
  ...CANAS_Y_BARRO_QUOTES,
  ...ORLANDO_QUOTES,
  ...UNA_HABITACION_PROPIA_QUOTES,
  ...RAYO_QUE_NO_CESA_QUOTES,
  ...PAPA_GORIOT_QUOTES,
  ...DORIAN_GRAY_QUOTES,
  ...IVAN_ILICH_QUOTES,
  ...MEMORIAS_SUBSUELO_QUOTES,
  ...EL_HORLA_QUOTES,
  ...SALA_NUMERO_SEIS_QUOTES,
  ...LA_BESTIA_EN_LA_JUNGLA_QUOTES,
  ...EL_PAPEL_PINTADO_DE_AMARILLO_QUOTES,
  ...VERA_QUOTES,
  ...PRECIOSO_VENENO_QUOTES,
  ...LA_METAMORFOSIS_QUOTES,
  ...ORGULLO_Y_PREJUICIO_QUOTES,
];

const ALLOWED_WEATHER_TIMES = new Set(ALLOWED_TIMES_OF_DAY);
const FALLBACK_TIME_OF_DAY = 'day';
const WEATHER_CHANGE_EVENT = 'paramo:weather-change';
const MIN_WEATHER_REFRESH_MS = 5 * 60 * 1000;
const MAX_WEATHER_REFRESH_MS = 60 * 60 * 1000;
const FAILED_WEATHER_REFRESH_MS = 15 * 60 * 1000;

const AUTHORS_INFO = {};

const WORKS_INFO = {};

async function fetchPublicProfiles(relativePath) {
  const response = await fetch(new URL(relativePath, import.meta.url), { cache: 'no-store' });
  if (!response.ok) {
    throw new Error(`${relativePath}: HTTP ${response.status}`);
  }
  const profiles = await response.json();
  if (!profiles || typeof profiles !== 'object' || Array.isArray(profiles)) {
    throw new Error(`${relativePath}: se esperaba un objeto`);
  }
  return profiles;
}

async function loadPublicProfiles() {
  try {
    const profiles = await fetchPublicProfiles('./public/data/literary-profiles.json');
    const authorProfiles = Array.isArray(profiles?.authors) ? profiles.authors : [];
    const workProfiles = Array.isArray(profiles?.works) ? profiles.works : [];

    for (const profile of authorProfiles) {
      if (profile?.author_id) {
        AUTHORS_INFO[profile.author_id] = profile;
      }
    }
    for (const profile of workProfiles) {
      if (profile?.work_id) {
        WORKS_INFO[profile.work_id] = profile;
      }
    }
  } catch (error) {
    console.error('No se pudieron cargar las fichas literarias manuales', error);
  }
}

const publicProfilesReady = loadPublicProfiles();

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
let latestServerWeatherState = null;
let weatherRefreshTimerId = null;

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
  return normalizeVisualWeatherState(input);
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

function updateAtmosphericParticles(weatherState) {
  setDaylightMotesActive(supportsDaylightMotes(weatherState));
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
  const visualState = resolveVisualWeatherState(normalizedState, getLocalTimeOfDay());

  document.body.dataset.weather = visualState.weather;
  document.body.dataset.weatherIntensity = visualState.intensity;
  document.body.dataset.visualScene = visualState.visualScene;
  applyTimeOfDayToDocument(visualState.timeOfDay);
  updateAtmosphericParticles(visualState);
  document.dispatchEvent(new CustomEvent(WEATHER_CHANGE_EVENT, {
    detail: visualState,
  }));
}

function scheduleWeatherRefresh(expiresAt, fallbackDelay = MAX_WEATHER_REFRESH_MS) {
  const scheduler = typeof window !== 'undefined' ? window : globalThis;
  if (!scheduler || typeof scheduler.setTimeout !== 'function') return;
  if (weatherRefreshTimerId) scheduler.clearTimeout(weatherRefreshTimerId);

  const expiresMs = Date.parse(expiresAt);
  const requestedDelay = Number.isFinite(expiresMs) ? expiresMs - Date.now() + 1000 : fallbackDelay;
  const delay = Math.min(MAX_WEATHER_REFRESH_MS, Math.max(MIN_WEATHER_REFRESH_MS, requestedDelay));
  weatherRefreshTimerId = scheduler.setTimeout(refreshGlobalWeatherState, delay);
}

async function refreshGlobalWeatherState() {
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
    latestServerWeatherState = weatherState;
    applyWeatherStateToDocument(weatherState);
    scheduleWeatherRefresh(weatherState.expiresAt);
  } catch (error) {
    console.warn('No se pudo refrescar el clima global; conservando el estado anterior.', error);
    if (!latestServerWeatherState) applyWeatherStateToDocument(getFallbackWeatherState());
    scheduleWeatherRefresh(null, FAILED_WEATHER_REFRESH_MS);
  }
}

function initGlobalWeatherState() {
  applyWeatherStateToDocument(getFallbackWeatherState());
  return refreshGlobalWeatherState();
}

function getCurrentSceneBackgroundUrl() {
  if (!document.body || typeof window.getComputedStyle !== 'function') {
    return '';
  }

  const backgroundImage = window.getComputedStyle(document.body).backgroundImage;
  const match = backgroundImage.match(/url\(["']?([^"')]+)["']?\)/);
  return match?.[1] || '';
}

function preloadCurrentSceneBackground() {
  const backgroundUrl = getCurrentSceneBackgroundUrl();
  if (!backgroundUrl) {
    return Promise.resolve();
  }

  return new Promise((resolve) => {
    const image = new Image();
    const finish = () => resolve();

    image.addEventListener('load', async () => {
      if (typeof image.decode === 'function') {
        try {
          await image.decode();
        } catch {
          // La imagen ya terminó de cargar; el navegador puede revelarla con seguridad.
        }
      }
      finish();
    }, { once: true });
    image.addEventListener('error', finish, { once: true });
    image.src = backgroundUrl;
  });
}

function waitForLoaderDelay(delay) {
  return new Promise(resolve => window.setTimeout(resolve, delay));
}

function waitForInitialFonts() {
  if (!document.fonts?.ready) {
    return Promise.resolve();
  }
  return document.fonts.ready.catch(() => undefined);
}

function getAppLoaderTiming() {
  const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const returningVisit = document.documentElement.classList.contains('app-loader-returning');

  if (reducedMotion) {
    return { minimum: 0, maximum: 20, removal: 140 };
  }
  if (returningVisit) {
    return { minimum: 30, maximum: 380, removal: 220 };
  }
  return { minimum: 600, maximum: 1500, removal: 300 };
}

function dismissAppLoader(removalDelay) {
  const loader = document.getElementById('app-loader');
  document.body?.classList.remove('app-loading');
  if (!loader) return;

  loader.classList.add('is-leaving');
  loader.setAttribute('aria-hidden', 'true');
  window.setTimeout(() => loader.remove(), removalDelay);
}

async function revealAppWhenReady(initialWeatherReady) {
  const timing = getAppLoaderTiming();
  const sceneReady = Promise.resolve(initialWeatherReady)
    .catch(() => undefined)
    .then(preloadCurrentSceneBackground);
  const ready = Promise.all([sceneReady, waitForInitialFonts()]);
  const readyAfterMinimum = Promise.all([ready, waitForLoaderDelay(timing.minimum)]);
  const safetyTimeout = waitForLoaderDelay(timing.maximum);

  await Promise.race([readyAfterMinimum, safetyTimeout]);
  try {
    sessionStorage.setItem('paramo-loader-seen', '1');
  } catch {
    // La transición funciona igualmente si el almacenamiento está desactivado.
  }
  dismissAppLoader(timing.removal);
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

  applyWeatherStateToDocument(latestServerWeatherState || {
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

function hasProfileValue(value) {
  if (Array.isArray(value)) {
    return value.some(item => typeof item === 'string' && item.trim());
  }
  return value !== null
    && value !== undefined
    && (typeof value !== 'string' || Boolean(value.trim()));
}

function appendProfileMetaLine(container, items, options = {}) {
  const values = items.filter(([, value]) => hasProfileValue(value));
  if (!values.length) return;
  const line = document.createElement('p');
  line.className = `profile-meta${options.secondary ? ' profile-meta--secondary' : ''}`;
  for (const [label, value, suffix] of values) {
    const item = document.createElement('span');
    item.className = 'profile-meta__item';
    item.setAttribute('aria-label', `${label}: ${value}${suffix || ''}`);
    item.textContent = `${value}${suffix || ''}`;
    line.appendChild(item);
  }
  container.appendChild(line);
}

function appendProfileSection(container, title, value, options = {}) {
  if (!hasProfileValue(value)) return;
  const section = document.createElement('section');
  section.className = `profile-section${options.compact ? ' profile-section--compact' : ''}`;
  const heading = document.createElement('h3');
  heading.className = 'profile-section__title';
  heading.textContent = title;
  section.appendChild(heading);

  if (Array.isArray(value) && !options.paragraphs) {
    const list = document.createElement('ul');
    list.className = options.chips ? 'profile-themes' : 'profile-list';
    for (const text of value) {
      if (typeof text !== 'string' || !text.trim()) continue;
      const item = document.createElement('li');
      item.textContent = text;
      list.appendChild(item);
    }
    section.appendChild(list);
  } else {
    const paragraphs = options.paragraphs ? value : [value];
    for (const text of paragraphs) {
      if (!hasProfileValue(text)) continue;
      const paragraph = document.createElement('p');
      paragraph.className = 'profile-section__text';
      paragraph.textContent = text;
      section.appendChild(paragraph);
    }
  }
  container.appendChild(section);
}

function appendAuthorPortrait(container, portrait) {
  if (!portrait?.path || !portrait?.alt) return;
  const figure = document.createElement('figure');
  figure.className = 'author-portrait';
  const image = document.createElement('img');
  image.className = 'author-portrait__image';
  image.src = `./${portrait.path}`;
  image.alt = portrait.alt;
  image.loading = 'lazy';
  image.decoding = 'async';
  image.width = 800;
  image.height = 1000;
  image.style.objectPosition = portrait.object_position || '50% 35%';
  figure.appendChild(image);

  const details = [portrait.caption, portrait.credit, portrait.rights].filter(hasProfileValue);
  if (details.length) {
    const caption = document.createElement('figcaption');
    caption.className = 'author-portrait__caption';
    if (portrait.source_url) {
      const link = document.createElement('a');
      link.href = portrait.source_url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.textContent = details.join(' · ');
      caption.appendChild(link);
    } else {
      caption.textContent = details.join(' · ');
    }
    figure.appendChild(caption);
  }
  container.appendChild(figure);
}

function renderInfoContent(type, contentElement, entry) {
  if (!contentElement) return;
  const fragment = document.createDocumentFragment();

  if (entry) {
    if (type === 'author') {
      appendAuthorPortrait(fragment, entry.portrait);
      const dates = entry.birth_year && entry.death_year
        ? `${entry.birth_year}–${entry.death_year}`
        : entry.birth_year || entry.death_year || null;
      appendProfileMetaLine(fragment, [
        ['Fechas', dates],
        ['País', entry.country],
        ['Lengua', entry.language],
      ]);
      appendProfileMetaLine(fragment, [
        ['Época', entry.period],
        ['Movimiento o corriente', entry.movement],
      ], { secondary: true });
      const biographies = [entry.bio_short];
      if (entry.bio_long && entry.bio_long !== entry.bio_short) biographies.push(entry.bio_long);
      appendProfileSection(fragment, 'Biografía', biographies, { paragraphs: true });
      appendProfileSection(fragment, 'Temas', entry.themes, { chips: true });
      appendProfileSection(fragment, 'Estilo y tono', entry.tone_notes);
      appendProfileSection(
        fragment,
        'En Páramo Literario',
        entry.why_in_paramo,
      );
      appendProfileSection(
        fragment,
        'Fuentes de información',
        entry.information_sources,
        { compact: true },
      );
    } else {
      const authorEntry = getCatalogEntry('author', entry.author_id);
      appendProfileMetaLine(fragment, [
        ['Autor', authorEntry?.display_name],
        ['Año', entry.publication_year],
        ['Género', entry.genre],
        ['Fragmentos incluidos', entry.fragment_count, ' fragmentos incluidos'],
      ]);
      appendProfileMetaLine(fragment, [
        ['Título original', entry.original_title],
        ['Lengua', entry.language],
      ], { secondary: true });
      const summaries = [entry.summary_short];
      if (entry.summary_long && entry.summary_long !== entry.summary_short) summaries.push(entry.summary_long);
      appendProfileSection(fragment, 'Resumen', summaries, { paragraphs: true });
      appendProfileSection(fragment, 'Contexto', entry.context_notes);
      appendProfileSection(fragment, 'Temas', entry.themes, { chips: true });
      appendProfileSection(fragment, 'Tono', entry.tone_notes);
      appendProfileSection(fragment, 'Fragmentos', entry.fragment_notes);
      appendProfileSection(
        fragment,
        'En Páramo Literario',
        entry.why_in_paramo,
      );
      appendProfileSection(
        fragment,
        'Fuentes de información',
        entry.information_sources,
        { compact: true },
      );
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
  document.body.classList.remove('modal-open');
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

async function openModal(type, triggerElement, titleText) {
  const elements = getModalElements(type);
  if (!elements) return;
  const catalogId = type === 'author'
    ? triggerElement?.dataset?.authorId
    : triggerElement?.dataset?.workId;

  elements.root.classList.remove('is-hidden');
  elements.root.setAttribute('aria-hidden', 'false');
  document.body.classList.add('modal-open');
  if (elements.title) {
    elements.title.textContent = titleText || '';
  }
  await publicProfilesReady;
  const entry = getCatalogEntry(type, catalogId || slugify(titleText || ''));
  renderInfoContent(type, elements.content, entry);
  if (elements.content) {
    elements.content.scrollTop = 0;
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

  const authorId = currentQuote.authorId || `author-${slugify(author || '')}`;
  const workId = currentQuote.workId || `work-${slugify(workTitle || '')}`;

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
  const initialWeatherReady = initGlobalWeatherState();
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
  return initialWeatherReady;
}

document.addEventListener('DOMContentLoaded', () => {
  const initialWeatherReady = initApp();
  initFireflyAura();
  scheduleDayNightModeUpdates();
  revealAppWhenReady(initialWeatherReady);
});
