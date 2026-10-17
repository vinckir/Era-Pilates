// Base inicial de exercícios — rascunho para curadoria da Jessica.
// Linha clássica (repertório de Joseph Pilates, na tradição de Lolita San Miguel,
// passada adiante por Jacson Bonafé) + exercícios contemporâneos/clínicos de apoio.
//
// Cada linha: [id, nome, aparelho, nível, bloco, posição, foco, evitar, ajuda, origem, progressão, dica]
//   aparelho: mat | reformer | cadillac | chair | barrel | acessorio
//   nível:    1 básico · 2 intermediário · 3 avançado
//   bloco:    ordem da aula (ver BLOCOS)
//   posição:  supino | prono | lateral | sentado | ajoelhado | empe | quadrupede | invertido
//   evitar:   restrições em que o exercício NÃO deve ser sugerido
//   ajuda:    restrições/objetivos em que o exercício é bem-vindo
//   origem:   c = clássico · t = contemporâneo/clínico
// As restrições são sugestões genéricas; a palavra final é sempre da instrutora.

export const BLOCOS = [
  { id: 'centro',   nome: 'Centramento',            curto: 'Centro' },
  { id: 'aquec',    nome: 'Footwork & aquecimento', curto: 'Aquecer' },
  { id: 'abd',      nome: 'Powerhouse',             curto: 'Abdômen' },
  { id: 'coluna',   nome: 'Articulação da coluna',  curto: 'Coluna' },
  { id: 'mmii',     nome: 'Membros inferiores',     curto: 'Pernas' },
  { id: 'lateral',  nome: 'Lateral & rotação',      curto: 'Lateral' },
  { id: 'ext',      nome: 'Extensão',               curto: 'Extensão' },
  { id: 'mmss',     nome: 'Braços & escápulas',     curto: 'Braços' },
  { id: 'integra',  nome: 'Integração & final',     curto: 'Final' },
];

export const APARELHOS = {
  mat:       'Mat',
  reformer:  'Reformer',
  cadillac:  'Cadillac',
  chair:     'Chair',
  barrel:    'Barrel',
  acessorio: 'Acessórios',
};

export const RESTRICOES = {
  lombar:      'Dor lombar',
  hernia:      'Hérnia de disco',
  osteoporose: 'Osteoporose',
  cervical:    'Cervical',
  ombro:       'Ombro',
  joelho:      'Joelho',
  quadril:     'Quadril',
  punho:       'Punho',
  gestante:    'Gestante',
};

export const OBJETIVOS = {
  core:        'Fortalecer centro',
  mobilidade:  'Mobilidade da coluna',
  postura:     'Postura',
  'forca-mmii':'Força de pernas',
  'forca-mmss':'Força de braços',
  alongamento: 'Flexibilidade',
  equilibrio:  'Equilíbrio',
  respiracao:  'Respiração / relaxar',
};

const L = [
  // ——— MAT clássico (ordem de Joseph Pilates) ———
  ['mat-hundred','The Hundred','mat',1,'abd','supino','core,respiracao','osteoporose,gestante','', 'c','mat-hundred-ext','Pernas em table top no início; 5 inspira / 5 expira, braços bombeando.'],
  ['mat-hundred-ext','The Hundred (pernas estendidas)','mat',2,'abd','supino','core,respiracao','osteoporose,cervical,gestante,lombar','', 'c','', 'Pernas a 45°, olhar no umbigo, costelas fechadas.'],
  ['mat-rollup','Roll Up','mat',2,'coluna','supino','flexao,mobilidade,core','osteoporose,hernia,lombar,gestante','', 'c','', 'Articular vértebra por vértebra; pés podem ficar presos na alça no início.'],
  ['mat-rollover','Roll Over','mat',3,'coluna','invertido','flexao,mobilidade,core','osteoporose,hernia,cervical,lombar,gestante','', 'c','', 'Peso nos ombros, nunca no pescoço; descer controlando.'],
  ['mat-legcircle','One Leg Circle','mat',1,'mmii','supino','quadril,estabilidade,core','','lombar,quadril', 'c','', 'Pelve estável, círculo do tamanho que a pelve permitir.'],
  ['mat-rolling','Rolling Like a Ball','mat',2,'coluna','sentado','flexao,mobilidade,equilibrio','osteoporose,hernia,cervical,lombar,gestante','', 'c','mat-seal', 'Mantém a forma de bola; rola até as escápulas.'],
  ['mat-sls','Single Leg Stretch','mat',1,'abd','supino','core,estabilidade','osteoporose,gestante','', 'c','mat-dls', 'Cabeça pode ficar apoiada; tronco estável enquanto as pernas trocam.'],
  ['mat-dls','Double Leg Stretch','mat',2,'abd','supino','core,coordenacao','osteoporose,cervical,gestante,lombar','', 'c','', 'Alcança longe e volta ao centro sem perder o imprint.'],
  ['mat-scissors-sl','Single Straight Leg (Scissors)','mat',2,'abd','supino','core,alongamento','osteoporose,cervical,gestante,lombar','', 'c','', 'Pernas longas, dois pulsos de alcance por lado.'],
  ['mat-lowerlift','Double Straight Leg (Lower Lift)','mat',3,'abd','supino','core','osteoporose,cervical,lombar,hernia,gestante','', 'c','', 'Só desce até onde a lombar fica estável.'],
  ['mat-crisscross','Criss Cross','mat',2,'lateral','supino','rotacao,core','osteoporose,cervical,hernia,gestante','', 'c','', 'Rotação vem das costelas, cotovelos abertos.'],
  ['mat-spinestretch','Spine Stretch Forward','mat',1,'coluna','sentado','flexao,alongamento,mobilidade','osteoporose','postura', 'c','', 'Sentar alto, enrolar em C e voltar empilhando.'],
  ['mat-openleg','Open Leg Rocker','mat',3,'coluna','sentado','equilibrio,core,flexao','osteoporose,hernia,lombar,cervical,gestante','', 'c','', 'Equilibrar em V antes de rolar.'],
  ['mat-corkscrew','Corkscrew','mat',2,'lateral','supino','rotacao,core','osteoporose,hernia,gestante','', 'c','', 'Versão básica com ombros e pelve no chão.'],
  ['mat-saw','Saw','mat',1,'lateral','sentado','rotacao,alongamento','osteoporose,hernia','postura', 'c','', 'Gira, depois serra o dedinho; pelve ancorada.'],
  ['mat-swandive','Swan Dive','mat',3,'ext','prono','extensao,forca-mmss','lombar,gestante','', 'c','', 'Só depois de dominar o Swan prep; balanço controlado.'],
  ['mat-slk','Single Leg Kick','mat',1,'ext','prono','extensao,forca-mmii','gestante','osteoporose', 'c','', 'Apoio nos antebraços, abdômen sustentando a lombar.'],
  ['mat-dlk','Double Leg Kick','mat',2,'ext','prono','extensao,escapula','gestante','osteoporose,postura', 'c','', 'Três chutes, depois extensão com mãos alcançando os pés.'],
  ['mat-neckpull','Neck Pull','mat',3,'coluna','supino','flexao,core','osteoporose,hernia,cervical,lombar,gestante','', 'c','', 'Não puxar a cabeça; mãos só apoiam.'],
  ['mat-scissors','Scissors (invertido)','mat',3,'mmii','invertido','core,alongamento','osteoporose,cervical,hernia,gestante','', 'c','', 'Pelve sustentada pelas mãos, pernas em tesoura.'],
  ['mat-bicycle','Bicycle (invertido)','mat',3,'mmii','invertido','core,quadril','osteoporose,cervical,hernia,gestante','', 'c','', 'Pedalada grande e controlada.'],
  ['mat-shoulderbridge','Shoulder Bridge','mat',2,'mmii','supino','forca-mmii,quadril,core','gestante','lombar,joelho', 'c','', 'Pelve alta e nivelada enquanto a perna chuta.'],
  ['mat-spinetwist','Spine Twist','mat',1,'lateral','sentado','rotacao,postura','','postura,osteoporose', 'c','', 'Crescer antes de girar; pelve imóvel.'],
  ['mat-jackknife','Jackknife','mat',3,'coluna','invertido','core,flexao','osteoporose,hernia,cervical,lombar,gestante','', 'c','', 'Subir pelo centro, não pelo impulso.'],
  ['mat-sidekick','Side Kick Series','mat',1,'mmii','lateral','quadril,forca-mmii,estabilidade','','lombar,quadril,gestante', 'c','', 'Tronco imóvel; perna de cima frente/trás, cima/baixo, círculos.'],
  ['mat-teaser','Teaser','mat',3,'abd','sentado','core,equilibrio','osteoporose,hernia,lombar,gestante','', 'c','', 'Começar com uma perna (Teaser prep).'],
  ['mat-hipcircles','Hip Circles','mat',3,'lateral','sentado','core,rotacao','osteoporose,hernia,lombar,ombro,gestante','', 'c','', 'Apoio nas mãos atrás, pernas em V desenhando círculos.'],
  ['mat-swimming','Swimming','mat',2,'ext','prono','extensao,coordenacao','gestante','osteoporose,postura', 'c','', 'Alongar antes de levantar; ritmo de 5/5.'],
  ['mat-legpullfront','Leg Pull Front','mat',2,'integra','quadrupede','core,forca-mmss,estabilidade','punho,ombro,gestante','', 'c','', 'Prancha longa, levanta a perna sem mexer a pelve.'],
  ['mat-legpullback','Leg Pull Back','mat',3,'integra','sentado','forca-mmss,extensao,quadril','punho,ombro,gestante','', 'c','', 'Prancha invertida, peito aberto.'],
  ['mat-kneelingsidekick','Kneeling Side Kick','mat',3,'lateral','ajoelhado','lateral,quadril,equilibrio','joelho,punho,ombro','', 'c','', 'Ajoelhado de lado, mão no chão.'],
  ['mat-sidebend','Side Bend','mat',3,'lateral','lateral','lateral,forca-mmss','punho,ombro,gestante','', 'c','', 'Arco lateral; versão de joelho para começar.'],
  ['mat-boomerang','Boomerang','mat',3,'coluna','sentado','core,flexao,coordenacao','osteoporose,hernia,cervical,lombar,gestante','', 'c','', 'Fluxo contínuo entre roll over e teaser.'],
  ['mat-seal','Seal','mat',2,'integra','sentado','flexao,equilibrio','osteoporose,hernia,cervical,lombar,gestante','', 'c','', 'Bate os pés 3 vezes, rola e volta ao equilíbrio.'],
  ['mat-crab','Crab','mat',3,'integra','sentado','flexao,equilibrio','osteoporose,hernia,cervical,lombar,joelho,gestante','', 'c','', 'Pernas cruzadas, rola até o topo da cabeça com controle.'],
  ['mat-rocking','Rocking','mat',3,'ext','prono','extensao,alongamento','lombar,joelho,gestante','', 'c','', 'Extensão plena; balançar sem perder a forma.'],
  ['mat-controlbalance','Control Balance','mat',3,'integra','invertido','equilibrio,core','osteoporose,cervical,hernia,gestante','', 'c','', 'Do roll over, segura um pé e estende a outra perna.'],
  ['mat-pushup','Push Up (clássico)','mat',2,'integra','empe','forca-mmss,core,flexao','punho,ombro,osteoporose','', 'c','', 'Roll down, caminha à prancha, 3 flexões, volta.'],

  // ——— REFORMER clássico ———
  ['ref-footwork','Footwork (série completa)','reformer',1,'aquec','supino','forca-mmii,alinhamento','','lombar,joelho,osteoporose,hernia,gestante', 'c','', 'Dedos, arcos, calcanhares, tendon stretch. Pelve neutra e estável.'],
  ['ref-hundred','Hundred no Reformer','reformer',2,'abd','supino','core,respiracao','osteoporose,cervical,gestante','', 'c','', 'Alças nas mãos, mesma lógica do Mat.'],
  ['ref-overhead','Overhead','reformer',3,'coluna','invertido','flexao,core','osteoporose,hernia,cervical,lombar,gestante','', 'c','', 'Pernas sobre a cabeça, controle na descida.'],
  ['ref-coordination','Coordination','reformer',2,'abd','supino','core,coordenacao','osteoporose,cervical,gestante','', 'c','', 'Abre-fecha as pernas, joelhos voltam antes dos braços.'],
  ['ref-rowing','Rowing (séries de remada)','reformer',2,'mmss','sentado','forca-mmss,postura,escapula','osteoporose,hernia','postura', 'c','', 'Into the sternum, 90°, from the chest, from the hips, shaving, hug.'],
  ['ref-swan','Swan no Reformer','reformer',2,'ext','prono','extensao,forca-mmss','lombar,gestante','osteoporose,postura', 'c','', 'Mãos na barra, empurra e abre o peito.'],
  ['ref-pullstraps','Pulling Straps','reformer',1,'ext','prono','extensao,escapula,postura','gestante','osteoporose,postura,cervical', 'c','', 'Deitado no box, puxa as alças para trás crescendo.'],
  ['ref-tpull','T-Pull','reformer',1,'ext','prono','extensao,escapula','gestante','osteoporose,postura', 'c','', 'Braços em T, abre o peito sem jogar a lombar.'],
  ['ref-backstroke','Backstroke','reformer',2,'abd','supino','core,coordenacao','osteoporose,cervical,gestante','', 'c','', 'Braços e pernas sobem, abrem, circulam e voltam.'],
  ['ref-teaser','Teaser no Reformer','reformer',3,'abd','sentado','core,equilibrio','osteoporose,hernia,lombar,gestante','', 'c','', 'No box, alças nas mãos.'],
  ['ref-horseback','Horseback','reformer',3,'integra','sentado','core,equilibrio,quadril','osteoporose,hernia,gestante','', 'c','', 'Montado no box, sobe com o centro.'],
  ['ref-longstretch','Long Stretch','reformer',2,'integra','quadrupede','core,forca-mmss,estabilidade','punho,ombro,gestante','', 'c','', 'Prancha longa, carro vai e volta pelo ombro.'],
  ['ref-downstretch','Down Stretch','reformer',2,'ext','ajoelhado','extensao,forca-mmss','punho,ombro,joelho,lombar','', 'c','', 'Ajoelhado na ombreira, peito aberto.'],
  ['ref-upstretch','Up Stretch','reformer',2,'integra','quadrupede','core,forca-mmss,flexao','punho,ombro,gestante','', 'c','', 'Quadril alto, leva para a prancha e volta.'],
  ['ref-elephant','Elephant','reformer',1,'integra','empe','alongamento,core','punho,ombro','', 'c','', 'Coluna em C, pernas empurram o carro.'],
  ['ref-longbackstretch','Long Back Stretch','reformer',3,'mmss','sentado','forca-mmss,extensao','punho,ombro,gestante','', 'c','', 'Prancha invertida com mergulho.'],
  ['ref-stomachmassage','Stomach Massage (série)','reformer',1,'aquec','sentado','core,flexao,forca-mmii','osteoporose,hernia','', 'c','', 'Round back, hands back, reach up, twist.'],
  ['ref-shortbox-round','Short Box — Round Back','reformer',1,'coluna','sentado','flexao,core','osteoporose,hernia,lombar','', 'c','', 'Desce em C até onde controla.'],
  ['ref-shortbox-flat','Short Box — Flat Back','reformer',2,'abd','sentado','core,postura','hernia,lombar','postura,osteoporose', 'c','', 'Coluna longa inclina como uma tábua.'],
  ['ref-shortbox-side','Short Box — Side to Side','reformer',2,'lateral','sentado','lateral,core','osteoporose,hernia','', 'c','', 'Inclinação lateral pura, sem rodar.'],
  ['ref-shortbox-twist','Short Box — Twist & Reach','reformer',3,'lateral','sentado','rotacao,core','osteoporose,hernia,lombar','', 'c','', 'Gira, alcança, volta pelo centro.'],
  ['ref-shortbox-tree','Short Box — Tree','reformer',3,'coluna','sentado','alongamento,flexao','osteoporose,hernia','', 'c','', 'Mãos escalam a perna, coluna rola para trás.'],
  ['ref-shortspine','Short Spine Massage','reformer',3,'coluna','invertido','flexao,mobilidade','osteoporose,hernia,cervical,gestante','', 'c','', 'Pés nas alças, sobe articulando.'],
  ['ref-semicircle','Semi-Circle','reformer',3,'coluna','supino','extensao,mobilidade','osteoporose,cervical,lombar,gestante','', 'c','', 'Ponte com o carro, articulação fina da coluna.'],
  ['ref-chestexp','Chest Expansion','reformer',2,'mmss','ajoelhado','escapula,postura,forca-mmss','joelho','postura,cervical,osteoporose', 'c','', 'Ajoelhado, puxa as alças para trás, olha para os lados.'],
  ['ref-thighstretch','Thigh Stretch','reformer',2,'mmii','ajoelhado','alongamento,core','joelho,lombar','', 'c','', 'Corpo em tábua, inclina para trás.'],
  ['ref-armcircles','Arm Circles (ajoelhado)','reformer',2,'mmss','ajoelhado','forca-mmss,escapula','joelho,ombro','postura', 'c','', 'Círculos com as alças sem perder o centro.'],
  ['ref-snake','Snake & Twist','reformer',3,'lateral','quadrupede','rotacao,forca-mmss,core','punho,ombro,osteoporose,gestante','', 'c','', 'Avançado; sinuoso e controlado.'],
  ['ref-corkscrew','Corkscrew no Reformer','reformer',3,'lateral','invertido','rotacao,core','osteoporose,hernia,cervical,gestante','', 'c','', 'Alças nas mãos, círculo das pernas.'],
  ['ref-tictoc','Tick-Tock','reformer',3,'lateral','invertido','rotacao,core','osteoporose,hernia,cervical,gestante','', 'c','', 'Pernas para cima, pêndulo de lado a lado.'],
  ['ref-balancecontrol','Balance Control Front','reformer',3,'integra','quadrupede','equilibrio,forca-mmss','punho,ombro,gestante','', 'c','', 'Prancha com uma perna alta.'],
  ['ref-longspine','Long Spine Massage','reformer',3,'coluna','invertido','flexao,mobilidade,core','osteoporose,hernia,cervical,gestante','', 'c','', 'Pés nas alças, rola e desenrola.'],
  ['ref-feetstraps','Feet in Straps (frog, círculos, abertura)','reformer',1,'mmii','supino','quadril,alongamento,estabilidade','gestante','lombar,quadril,hernia', 'c','', 'Pelve estável; ótimo para soltar quadril.'],
  ['ref-kneestretch','Knee Stretches (round, arched, off)','reformer',2,'integra','ajoelhado','core,forca-mmii','joelho,punho','', 'c','', 'Joelhos empurram o carro com o centro firme.'],
  ['ref-running','Running','reformer',1,'integra','supino','forca-mmii,circulacao','','joelho,lombar', 'c','', 'Calcanhares alternam, pernas longas.'],
  ['ref-pelviclift','Pelvic Lift','reformer',1,'integra','supino','forca-mmii,quadril','gestante','lombar', 'c','', 'Pés na barra, ponte segurando o carro.'],
  ['ref-sidesplit','Side Splits','reformer',2,'mmii','empe','equilibrio,forca-mmii,quadril','quadril,joelho','', 'c','', 'Em pé, abre o carro com controle.'],
  ['ref-frontsplit','Front Splits','reformer',3,'mmii','empe','alongamento,equilibrio','quadril,joelho','', 'c','', 'Avança só até onde a pelve fica quadrada.'],
  ['ref-mermaid','Mermaid no Reformer','reformer',1,'lateral','sentado','lateral,alongamento','','postura,lombar', 'c','', 'Sentado de lado, mão na barra, alonga a lateral.'],

  // ——— CADILLAC ———
  ['cad-rollback','Roll Back Bar (Roll Down)','cadillac',1,'coluna','sentado','flexao,mobilidade,core','osteoporose,hernia','lombar', 'c','', 'Barra ajuda a articular; ótimo para quem não faz o Roll Up.'],
  ['cad-breathing','Breathing','cadillac',3,'centro','invertido','respiracao,core','osteoporose,cervical,hernia,gestante','', 'c','', 'Avançado: sobe a pelve respirando.'],
  ['cad-legsprings','Leg Springs (série)','cadillac',1,'mmii','supino','quadril,forca-mmii,estabilidade','','lombar,quadril,joelho,hernia', 'c','', 'Frog, círculos, walking, bicicleta. Pelve parada.'],
  ['cad-armsprings','Arm Springs supino','cadillac',1,'mmss','supino','forca-mmss,escapula,core','','ombro,postura,lombar', 'c','', 'Braços descem até o quadril, costelas fechadas.'],
  ['cad-tower','Tower','cadillac',2,'coluna','supino','alongamento,mobilidade','osteoporose,cervical,hernia,gestante','', 'c','', 'Pés na barra, articula a coluna e alonga posteriores.'],
  ['cad-monkey','Monkey','cadillac',2,'mmii','supino','alongamento,flexao','osteoporose,hernia','', 'c','', 'Mãos e pés na barra, alonga posteriores.'],
  ['cad-pushthru','Push Through sentado','cadillac',1,'coluna','sentado','flexao,alongamento,mobilidade','osteoporose','postura', 'c','', 'Empurra a barra em C e volta crescendo.'],
  ['cad-pushthru-rev','Push Through reverso','cadillac',2,'ext','sentado','extensao,escapula','lombar','postura,osteoporose', 'c','', 'De costas para a barra, abre o peito.'],
  ['cad-catstretch','Cat Stretch ajoelhado','cadillac',1,'coluna','ajoelhado','mobilidade,flexao,extensao','joelho','lombar', 'c','', 'Ajoelhado, empurra a barra arredondando e estende.'],
  ['cad-spreadeagle','Spread Eagle','cadillac',3,'ext','empe','extensao,forca-mmss','ombro','', 'c','', 'Em pé, mãos no trapézio, abre o peito.'],
  ['cad-squirrel','Squirrel','cadillac',3,'integra','invertido','core,forca-mmss','osteoporose,cervical,hernia,ombro,gestante','', 'c','', 'Avançado, pendurado na barra.'],
  ['cad-teaser','Teaser com Push Through','cadillac',2,'abd','sentado','core,equilibrio','osteoporose,hernia,gestante','', 'c','', 'Barra dá suporte para o teaser.'],
  ['cad-mermaid','Mermaid com Push Through','cadillac',1,'lateral','sentado','lateral,alongamento','','postura,lombar', 'c','', 'Lateral longa, barra acompanha.'],
  ['cad-chestexp','Chest Expansion em pé','cadillac',1,'mmss','empe','escapula,postura','','postura,cervical,osteoporose', 'c','', 'Puxa as alças para trás crescendo.'],
  ['cad-shoulderroll','Shoulder Roll Down','cadillac',2,'coluna','supino','mobilidade,flexao','osteoporose,cervical,hernia','', 'c','', 'Mãos na barra, ponte articulada.'],

  // ——— WUNDA CHAIR ———
  ['chair-footwork','Footwork na Chair','chair',1,'aquec','sentado','forca-mmii,alinhamento','','joelho,osteoporose,lombar', 'c','', 'Pumping com dedos, arcos, calcanhares.'],
  ['chair-onelegpump','Pumping uma perna','chair',2,'mmii','sentado','forca-mmii,estabilidade','','joelho,quadril', 'c','', 'Pelve nivelada enquanto uma perna trabalha.'],
  ['chair-washerwoman','Washer Woman','chair',2,'coluna','empe','flexao,core,alongamento','osteoporose,hernia,lombar','', 'c','', 'De pé, tronco dobrado, pressiona o pedal com o centro.'],
  ['chair-swan','Swan na Chair','chair',2,'ext','prono','extensao,forca-mmss','lombar,gestante','osteoporose,postura', 'c','', 'Desce e sobe o pedal com o peito aberto.'],
  ['chair-pike','Pike','chair',3,'abd','empe','core,forca-mmss','punho,ombro,osteoporose,hernia,gestante','', 'c','', 'Mãos no pedal, quadril sobe em V invertido.'],
  ['chair-stepup','Going Up Front (Step Up)','chair',2,'integra','empe','forca-mmii,equilibrio','joelho','osteoporose,equilibrio', 'c','', 'Sobe na chair com a perna, alinhando joelho.'],
  ['chair-sideup','Going Up Side','chair',3,'integra','empe','forca-mmii,equilibrio,lateral','joelho','', 'c','', 'Subida lateral com controle.'],
  ['chair-tendon','Tendon Stretch','chair',3,'abd','sentado','core,forca-mmss','punho,ombro,osteoporose,hernia,gestante','', 'c','', 'Sentado no pedal, eleva o quadril.'],
  ['chair-spinestretch','Spine Stretch na Chair','chair',1,'coluna','sentado','flexao,alongamento','osteoporose','postura', 'c','', 'Mãos no pedal, enrola e cresce.'],
  ['chair-mermaid','Mermaid / Push Down lateral','chair',1,'lateral','sentado','lateral,alongamento','','postura', 'c','', 'Sentado de lado, mão empurra o pedal.'],
  ['chair-triceps','Triceps Press','chair',2,'mmss','sentado','forca-mmss','punho,ombro','', 'c','', 'De costas para a chair, cotovelos para trás.'],
  ['chair-hamstring','Hamstring Stretch','chair',2,'mmii','empe','alongamento,forca-mmii','lombar,hernia','', 'c','', 'Um pé no pedal, pelve alinhada.'],
  ['chair-lunge','Forward Lunge','chair',2,'mmii','empe','forca-mmii,equilibrio','joelho','osteoporose,equilibrio', 'c','', 'Pé em cima, empurra o pedal com o de baixo.'],
  ['chair-frog','Frog sentado','chair',1,'aquec','sentado','forca-mmii,quadril','','joelho', 'c','', 'Calcanhares juntos, joelhos abertos.'],

  // ——— BARREL / SPINE CORRECTOR ———
  ['bar-balletstretch','Ballet Stretches','barrel',1,'mmii','empe','alongamento,equilibrio','','', 'c','', 'Perna no barrel, coluna longa.'],
  ['bar-swan','Swan no Ladder Barrel','barrel',2,'ext','prono','extensao,postura','lombar,gestante','osteoporose,postura', 'c','', 'Quadril no barrel, estende a partir do peito.'],
  ['bar-sidesitup','Side Sit Ups','barrel',2,'lateral','lateral','lateral,core','osteoporose,hernia,lombar,quadril','', 'c','', 'Lateral sobre o barrel, sobe sem rodar.'],
  ['bar-sc-arms','Spine Corrector — série de braços','barrel',1,'mmss','supino','escapula,extensao,postura','','postura,osteoporose,cervical', 'c','', 'Costas sobre o arco, abre o peito.'],
  ['bar-sc-legs','Spine Corrector — série de pernas','barrel',2,'mmii','supino','core,quadril','osteoporose,cervical,gestante','', 'c','', 'Círculos, tesouras, bicicleta, helicóptero.'],
  ['bar-sc-grasshopper','Grasshopper','barrel',3,'ext','prono','extensao,forca-mmii','lombar,gestante','', 'c','', 'Prono sobre o arco, pernas batem.'],
  ['bar-sc-teaser','Teaser no Spine Corrector','barrel',2,'abd','supino','core,equilibrio','osteoporose,hernia,lombar,gestante','', 'c','', 'Arco dá suporte à volta.'],
  ['bar-sc-sidelying','Spine Corrector — série lateral','barrel',1,'mmii','lateral','quadril,lateral','','quadril', 'c','', 'De lado sobre o arco, perna de cima trabalha.'],

  // ——— CONTEMPORÂNEO / CLÍNICO (apoio) ———
  ['t-breathing','Respiração lateral (costal)','acessorio',1,'centro','supino','respiracao,core','','lombar,hernia,cervical,gestante,osteoporose', 't','', 'Mãos nas costelas, expande lateralmente, expira fechando.'],
  ['t-imprint','Imprint & Release','mat',1,'centro','supino','core,estabilidade,mobilidade','','lombar,hernia,gestante', 't','t-pelviccurl', 'Báscula suave da pelve, percebendo neutro e imprint.'],
  ['t-pelviccurl','Pelvic Curl (ponte articulada)','mat',1,'coluna','supino','mobilidade,forca-mmii','','lombar,joelho,hernia', 't','mat-shoulderbridge', 'Sobe vértebra por vértebra e desce ao contrário.'],
  ['t-deadbug','Dead Bug','mat',1,'abd','supino','core,estabilidade,coordenacao','','lombar,hernia,osteoporose', 't','mat-sls', 'Braço e perna opostos se afastam, lombar quieta.'],
  ['t-toetaps','Toe Taps','mat',1,'abd','supino','core,estabilidade','','lombar,hernia,osteoporose,gestante', 't','t-deadbug', 'Da table top, toca um pé no chão sem mexer a pelve.'],
  ['t-kneefolds','Knee Folds','mat',1,'centro','supino','core,estabilidade','','lombar,hernia,gestante', 't','t-toetaps', 'Dobra uma perna ao peito sem perder a pelve.'],
  ['t-chestlift','Chest Lift','mat',1,'abd','supino','core,flexao','osteoporose','', 't','mat-hundred', 'Sobe o tronco até a ponta das escápulas.'],
  ['t-clam','Concha (Clam)','mat',1,'mmii','lateral','quadril,estabilidade','','quadril,joelho,lombar,gestante', 't','mat-sidekick', 'Pés juntos, abre o joelho sem rodar a pelve.'],
  ['t-birddog','Quadrúpede braço-perna (Bird Dog)','mat',1,'abd','quadrupede','core,estabilidade,coordenacao','punho,joelho','lombar,hernia,osteoporose', 't','mat-legpullfront', 'Alonga braço e perna opostos, coluna neutra.'],
  ['t-catcow','Gato-vaca','mat',1,'aquec','quadrupede','mobilidade,flexao,extensao','punho','lombar,postura', 't','cad-catstretch', 'Movimento lento, segmento por segmento.'],
  ['t-bookopening','Abertura de livro','mat',1,'lateral','lateral','rotacao,mobilidade,escapula','','postura,cervical,ombro', 't','mat-spinetwist', 'Deitado de lado, abre o braço acompanhando o olhar.'],
  ['t-swanprep','Swan prep (cobrinha)','mat',1,'ext','prono','extensao,postura,escapula','gestante','osteoporose,postura,hernia,cervical', 't','mat-swandive', 'Sobe só o peito, olhar no chão, escápulas descem.'],
  ['t-thoracicrot','Rotação torácica em quatro apoios','mat',1,'lateral','quadrupede','rotacao,mobilidade','punho','postura', 't','', 'Mão na nuca, abre o cotovelo para o teto.'],
  ['t-mermaidmat','Mermaid no Mat','mat',1,'lateral','sentado','lateral,alongamento','','postura,lombar', 't','', 'Sentado em Z, alonga a lateral.'],
  ['t-wallrolldown','Roll Down na parede','acessorio',1,'integra','empe','flexao,mobilidade,postura','osteoporose','postura', 't','mat-pushup', 'Costas na parede, enrola e desenrola.'],
  ['t-ballsqueeze','Ponte com bola entre joelhos','acessorio',1,'mmii','supino','forca-mmii,quadril','','lombar,joelho,hernia', 't','mat-shoulderbridge', 'Aperta a bola e sobe a pelve.'],
  ['t-ringadductor','Magic Circle — adutores','acessorio',1,'mmii','supino','forca-mmii,quadril','','joelho', 't','', 'Círculo entre os joelhos, aperta e solta.'],
  ['t-ringarms','Magic Circle — braços em pé','acessorio',1,'mmss','empe','forca-mmss,postura','','postura,ombro', 't','', 'Pressiona o anel na frente, acima e atrás.'],
  ['t-bandarms','Theraband — braços','acessorio',1,'mmss','sentado','forca-mmss,escapula','','ombro,postura,cervical', 't','ref-rowing', 'Remada, abertura e rotação externa.'],
  ['t-scapisolation','Isolamento escapular (serrátil)','mat',1,'mmss','supino','escapula,estabilidade','','ombro,cervical,postura', 't','cad-armsprings', 'Braços ao teto, protrai e retrai as escápulas.'],
  ['t-singlelegstand','Equilíbrio unipodal','acessorio',1,'integra','empe','equilibrio,forca-mmii','','osteoporose,joelho,equilibrio', 't','chair-stepup', 'Em pé numa perna, coluna longa.'],
  ['t-squatref','Agachamento em pé no Reformer','reformer',2,'mmii','empe','forca-mmii,equilibrio','joelho','osteoporose', 't','', 'Um pé na plataforma, outro no carro.'],
  ['t-plank','Prancha (antebraços)','mat',1,'integra','quadrupede','core,estabilidade','ombro,gestante','osteoporose', 't','mat-legpullfront', 'Pode ser de joelhos; corpo em linha.'],
  ['t-sideplank','Prancha lateral modificada','mat',2,'lateral','lateral','lateral,core','ombro','osteoporose', 't','mat-sidebend', 'Joelhos dobrados, quadril alto.'],
  ['t-hamstrap','Alongamento de posteriores com faixa','acessorio',1,'integra','supino','alongamento','','lombar,hernia', 't','', 'Faixa no pé, perna sobe sem tirar a pelve.'],
  ['t-bridgeref','Bridging no Reformer','reformer',1,'coluna','supino','mobilidade,forca-mmii','','lombar,joelho', 't','ref-pelviclift', 'Pés na barra, ponte com carro parado.'],
];

export const EXERCICIOS = L.map(([id, nome, ap, nivel, bloco, pos, foco, evitar, ajuda, origem, prox, dica]) => ({
  id, nome, ap, nivel, bloco, pos,
  foco: split(foco), evitar: split(evitar), ajuda: split(ajuda),
  origem: origem === 'c' ? 'classico' : 'contemporaneo',
  prox: prox || null,
  dica,
}));

function split(s) {
  return s ? s.split(',').map(x => x.trim()).filter(Boolean) : [];
}
