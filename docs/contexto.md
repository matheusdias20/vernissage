# Vernissage: contexto do projeto

Este arquivo é a fonte única de informações do projeto. Leia-o inteiro antes de cada tarefa e siga o que está aqui. Cada tarefa altera apenas os arquivos que ela cita.

## 1. Visão geral

Vernissage é um painel interativo em React + Vite que consome a API aberta do Cleveland Museum of Art (https://openaccess-api.clevelandart.org/api), sem chave de API. A fonte de dados é exclusivamente essa API.

- Problemática: o acervo do museu tem mais de 40 mil obras com imagem em domínio público e é difícil de explorar para quem não sabe o que buscar.
- Usuário: estudante ou curioso que gosta de arte e não tem repertório para buscar por nome.
- Objetivo: transformar a exploração em curadoria. O usuário descobre obras por temas e busca, filtra, vê detalhes e monta a própria exposição, com título e obras salvas no navegador.
- Entrega (desafio acadêmico): aplicação publicada na Vercel ou Netlify, repositório no GitHub e README com problemática, objetivo, tecnologias, API, funcionalidades, instruções para rodar, link publicado e uso de IA.
- Requisitos do desafio: React + Vite, API pública, componentização, pelo menos uma interação com os dados, interface responsiva, CSS organizado e tratamento dos comportamentos da aplicação (carregando, erro, sem resultados).
- Histórico da escolha da API: o projeto começou com a API do Art Institute of Chicago, mas o servidor de imagens dele bloqueia imagens embutidas em outros sites (403 do Cloudflare, verificado no navegador e em janela anônima). A troca para o Cleveland Museum of Art resolveu, porque as imagens carregam normalmente.

## 2. Regras de desenvolvimento

- Stack: React 19 e Vite 8, JavaScript, Node 20.19 ou superior.
- Requisições com fetch nativo. O projeto não usa bibliotecas de UI, de estado ou de requisição.
- Estilos: CSS Modules por componente (NomeDoComponente/NomeDoComponente.jsx e NomeDoComponente.module.css), variáveis CSS globais em src/styles/variables.css, abordagem mobile-first.
- Interface em português do Brasil. Os textos das obras (títulos, descrições, técnicas) chegam da API em inglês e são exibidos como chegam.
- Tipografia: somente Inter (pesos 300, 400, 500 e 600).
- A marca é o texto "VERNISSAGE" em caixa alta, peso 300 e espaçamento entre letras de 0.3em, feito em CSS no Header e no Footer.
- Estilo visual minimalista e editorial, com muito respiro, inspirado em galerias de arte.
- Componentes pequenos, com uma responsabilidade cada. Manter o padrão de export dos componentes já existentes.
- Toda chamada de API fica em src/services/artApi.js. Componentes e hooks usam as funções de lá e recebem obras no formato normalizado da seção 4.
- As requisições à API são GET simples, sem cabeçalhos personalizados (sem Content-Type), para funcionarem sem preflight de CORS.
- URLs de lista (searchArtworks, getTotal, getRandomArtworks) usam BASE_URL mais /artworks/ com barra final antes da query string. URLs de detalhe (getArtworkById) usam BASE_URL mais /artworks/{id}, sem barra final.
- Imports relativos de arquivos .js usam a extensão.
- A descrição da obra passa por stripHtml antes de ser exibida como texto.
- Imagens: usar sempre images.web (campo imageUrl da obra). O arquivo full é um TIFF de dezenas de MB e fica fora do app.
- Estados a tratar sempre: carregando, erro (com botão "Tentar novamente"), sem resultados, obra sem imagem, campos vazios e requisição cancelada.
- Acessibilidade: botões reais, foco visível, aria-labels, alt das imagens com getImageAlt, alvos de toque de pelo menos 44px, respeito a prefers-reduced-motion e ordem correta de títulos (um h1, no Hero).
- Imagens com loading="lazy" (exceto a imagem principal do Hero e a imagem do ArtworkModal, que aparecem imediatamente ao abrir), decoding="async" e espaço reservado com aspect-ratio a partir de imageWidth e imageHeight. Como cada imagem pesa de 125 a 400 KB, o carregamento preguiçoso vale para todas as listas.
- Lint com ESLint (eslint.config.js, com regras de hooks do React). Ao terminar cada tarefa, rodar npm run lint e npm run build e informar o resultado de cada um.
- Hooks: em efeitos, o setState acontece apenas dentro de callbacks assíncronos (then e catch), nunca no corpo síncrono do efeito. O estado de carregamento é derivado: guardar o resultado da última requisição junto com a chave dela (combinação dos parâmetros ou o id) e calcular loading comparando a chave guardada com a chave atual. Cada callback confere se a requisição foi cancelada antes de atualizar o estado. retry incrementa um contador que faz parte da chave.
- Na Galeria, page volta para 1 nos mesmos handlers que alteram busca ou filtros (nunca em efeitos), e a lista atual continua visível, com indicação de carregamento, enquanto uma nova busca roda.
- Contexto e hook ficam em arquivos separados (componente Provider em .jsx; createContext e o hook em .js), para o ESLint não avisar sobre export misto.
- Comentários curtos em português, apenas nas decisões não óbvias.

## 3. API do Cleveland Museum of Art (verificado em testes reais)

Base: https://openaccess-api.clevelandart.org/api. Sem chave. CORS funciona no navegador (verificado com fetch a partir de localhost:5173). Limite de requisições não documentado; o app usa cache e trata o status 429.

Endpoints:
- GET /artworks/ devolve { info: { total, parameters }, data: [...] }. A barra final antes da query string é obrigatória nas URLs de lista.
- GET /artworks/{id} devolve a obra completa em data, sem barra final.
- /creators existe. Não existem /types nem /departments.

Parâmetros de /artworks/:
- q: busca de texto, que filtra de verdade.
- has_image=1 e cc0=1: o app sempre usa os dois. Todas as obras com imagem são CC0 (41.536).
- type: valor exato do tipo de obra (por exemplo Painting).
- limit: máximo efetivo de 1000.
- skip: sem limite prático (testado com 20000).
- fields: lista de campos separados por vírgula. A API sempre acrescenta accession_number e has_conservation_images.

Números verificados:
- 68.771 obras no total e 41.536 com imagem em domínio público (CC0).
- Por tipo, com imagem: Painting 3.955, Print 10.767, Drawing 1.995, Sculpture 1.977, Photograph 989 e Textile 2.137. Existem 62 tipos no total.
- Buscas: monet 18, landscape 1.588 e qwertyuiop 0.
- Temas (q): landscape 1.588, portrait 1.772, animals 775, still life 100, mythology 98 e sea 274.

Campos da obra:
- id, title, creation_date, type, technique, department, creditline, description (texto sem HTML nos casos vistos), url (página da obra no site do museu) e share_license_status (CC0).
- culture é uma lista de textos. measurements é um texto com as medidas (dimensions é um objeto e não é usado).
- creators é uma lista. creators[0].description traz o nome do artista, que pode vir com nacionalidade e datas entre parênteses.
- images.web, images.print e images.full têm url, width, height e filesize. images.web tem até cerca de 900px e de 125 a 400 KB. Não existem miniaturas menores.
- As imagens ficam em https://openaccess-cdn.clevelandart.org e carregam no navegador (verificado).

Licenças: dados e imagens das obras com imagem são CC0. O rodapé dá crédito ao Cleveland Museum of Art.

## 4. Camada de dados

Formato normalizado de obra, usado por hooks, componentes e pela exposição:
{ id, title, artist, date, type, imageUrl, imageWidth, imageHeight, technique, department, culture, dimensions, creditLine, description, museumUrl }
- artist: nome de creators[0].description sem o trecho entre parênteses (nacionalidade e datas), ou '' quando não houver.
- date: creation_date. culture: os itens da lista unidos por vírgula. dimensions: measurements. creditLine: creditline. museumUrl: url.
- imageUrl, imageWidth e imageHeight vêm de images.web (null quando não houver).
- Campos ausentes viram '' (texto) ou null (imagem).

src/services/artApi.js (fetch nativo, GET simples, cache em memória de 10 minutos, suporte a signal):
- Constantes: BASE_URL; LIST_FIELDS com id, title, creators, creation_date, type e images; DETAIL_FIELDS com os de LIST_FIELDS mais technique, department, culture, measurements, creditline, description e url.
- Erros em português: 429 "Muitas requisições em pouco tempo. Aguarde um minuto e tente novamente."; outros status "Não foi possível carregar os dados (código X)."; falha de rede "Sem conexão com a internet. Verifique e tente novamente." O AbortError é repassado sem alteração.
- searchArtworks({ query = '', page = 1, limit = 12, type = null, signal }): GET /artworks/ com cc0=1, has_image=1, limit, skip igual a (page - 1) * limit, fields, q (quando query após trim não estiver vazio) e type (quando informado). Devolve { artworks (normalizadas), pagination: { total, totalPages: ceil(total / limit), currentPage, limit } }.
- getArtworkById(id, { signal }): GET /artworks/{id}, sem barra final; devolve a obra normalizada com os campos de detalhe.
- getTotal({ type = null, withImage = false, signal }): devolve info.total de GET /artworks/?limit=1&fields=id, acrescentando cc0=1 e has_image=1 quando withImage for verdadeiro e type quando informado.
- getRandomArtworks({ count = 1, type = 'Painting', signal }): obtém o total com getTotal({ type, withImage: true }), sorteia um skip entre 0 e total menos count e devolve as obras normalizadas.

src/utils:
- stripHtml.js: stripHtml(html) converte HTML em texto puro com DOMParser.
- formatters.js: formatArtist ("Artista desconhecido"), formatDate ("Data não informada"), formatField ("Não informado"), formatNumber (pt-BR) e getImageAlt(artwork), que devolve "título, artista" (só o título quando não houver artista).

src/constants:
- themes.js: THEMES com { id, label, query }: Paisagens (landscape), Retratos (portrait), Animais (animals), Natureza-morta (still life), Mitologia (mythology) e Mar (sea).
- artworkTypes.js: FEATURED_TYPES com { value, label }: Painting (Pintura), Print (Gravura), Drawing (Desenho), Sculpture (Escultura), Photograph (Fotografia) e Textile (Têxtil).

src/hooks:
- useDebounce(value, delay = 400).
- useArtworks({ query, page, type, append = false }) devolve { artworks, pagination, loading, error, retry }. Cancela a requisição anterior com AbortController e ignora o erro de cancelamento. A lista reinicia quando query ou type mudam. Com append verdadeiro e page maior que 1, acrescenta as obras novas sem duplicar ids e mantém a lista atual visível durante o carregamento. error é null enquanto loading for verdadeiro.
- useArtworkDetails(id) devolve { artwork, loading, error, retry }, com artwork e error nulos enquanto carrega. Com id nulo, não busca.
- useStats() devolve { totalArtworks, totalWithImage, totalPaintings, loading, error }, com getTotal sem filtro, getTotal({ withImage: true }) e getTotal({ type: 'Painting', withImage: true }).
- useExhibition() lê o contexto da exposição.
- useMediaQuery(query) devolve true ou false e reage a mudanças com matchMedia.

Estado da exposição:
- src/context/exhibitionContext.js cria e exporta o contexto com createContext.
- src/context/ExhibitionContext.jsx exporta ExhibitionProvider. O estado tem title (texto) e items (lista com id, title, artist, date, imageUrl e alt). Ações: toggle(artwork), remove(id), clear(), setTitle(text) e isInExhibition(id), além de count. O estado inicial é lido do localStorage (chave "vernissage:exhibition") por um inicializador do useState, e um useEffect grava a cada mudança. Toda leitura e escrita usa try/catch. A leitura considera um item válido quando id é inteiro e title é texto, mantém a primeira ocorrência de cada id e ignora conteúdo corrompido.
- src/hooks/useExhibition.js exporta useExhibition, que lança um erro claro fora do Provider.
- main.jsx envolve o App com o ExhibitionProvider.

## 5. Estado do App (src/App.jsx)

- Estado: query (texto de busca), themeLabel (nome do tema ativo ou null) e selectedArtworkId (obra aberta no modal ou null).
- handleSearch(text): define query, zera themeLabel e rola até #galeria.
- handleSelectTheme(theme): define query com theme.query, themeLabel com theme.label e rola até #galeria.
- handleQueryChange(text): define query e zera themeLabel.
- handleClearTheme(): zera query e themeLabel.
- handleOpenArtwork(id): define selectedArtworkId. O ArtworkModal é renderizado no App quando selectedArtworkId existir, e onClose zera o estado.
- Ordem dos componentes na página: Header, Hero, StatsStrip, ThemeCarousel, StepsList, Gallery, ExhibitionPanel e Footer. Ids das âncoras: topo (Hero), temas, galeria e exposicao.

## 6. Identidade visual

Paleta (variáveis em src/styles/variables.css):
- Fundo principal: #F6F3EE (--color-bg)
- Superfície (cards e modal): #FFFFFF (--color-surface)
- Texto principal: #1C1B1A (--color-text)
- Texto secundário: #6B665F (--color-text-muted)
- Bordas e divisores: #E3DDD3 (--color-border)
- Acento: #B4442B (--color-accent), hover #8F3420 (--color-accent-hover)
- Grafite (hero, rodapé e botões primários): #1F1E1C (--color-dark)
- Faixa da galeria: #EFE7DA (--color-band)
- Texto sobre grafite: --color-on-dark e --color-on-dark-muted
- Um único acento na interface, para que as cores das obras sejam as protagonistas.

Tipografia (somente Inter):
- Marca "VERNISSAGE": 18px, peso 300, caixa alta, espaçamento 0.3em.
- Título do hero: 48 a 64px fluido com clamp, peso 300, caixa alta.
- Título de seção: 28 a 32px, peso 300, caixa alta, espaçamento 0.05em.
- Rótulo acima do título de seção e chips: 13px, peso 500, caixa alta, espaçamento 0.1em.
- Título de obra no card: 16px, peso 500.
- Artista e ano (legenda de plaqueta): 14px, peso 400, itálico, cor secundária.
- Texto corrido e botões: 16px, peso 400 ou 500.
- Números da faixa de estatísticas: 48px, peso 300.

Padrões visuais:
- Cabeçalho de seção (SectionHeader): rótulo pequeno acima, título em caixa alta e linha fina de 1px na cor de borda abaixo.
- Botão primário: pílula grafite com texto claro e seta à direita, hover em acento.
- Botão secundário: retangular, contorno de 1px grafite, hover com fundo grafite e texto claro.
- Links do Header e botões sem sublinhado; os links do menu ganham sublinhado apenas no hover e no foco.
- Imagens com raio de 2px, mantendo a proporção original da obra, sem recorte.
- Legenda de plaqueta abaixo das imagens: título, artista e ano.
- Chips arredondados com borda de 1px. O ativo fica preenchido em acento.
- Foco visível em todos os elementos interativos: contorno de 2px na cor de acento.
- Composição editorial assimétrica no hero, com muito espaço em branco.

Grade e espaçamento:
- Container de 1200px, margens laterais de 24px (16px no celular).
- Espaço vertical entre seções: 96px no desktop e 56px no celular.
- Breakpoints mobile-first: base para celular (até 640px), min-width 641px para tablet e min-width 1025px para desktop.

## 7. Wireframe das seções

Legenda: [ ] botão, ( ) campo, # imagem, ~~~ texto corrido, (♡) botão de favoritar.

### Seção 1: Header

Desktop:
```
+------------------------------------------------------------------------------+
| VERNISSAGE          Explorar   Galeria   Exposição      [Minha exposição (0) ->] |
+------------------------------------------------------------------------------+
```
Celular:
```
+------------------------------------+
| VERNISSAGE          [(0) ->]  [=]  |
+------------------------------------+
```
- Fixo no topo, altura var(--header-height), fundo off-white, borda inferior que aparece ao rolar.
- Links por âncora: Explorar (#temas), Galeria (#galeria) e Exposição (#exposicao).
- O botão em pílula grafite mostra o contador de obras e leva a #exposicao.
- No celular, os links ficam num menu hambúrguer e o contador continua visível.

### Seção 2: Hero

Desktop:
```
+------------------------------------------------------------------------------+
| EXPLORE UM DOS MAIORES                                  +----------------+   |
| MUSEUS DO MUNDO E                                       |  # obra 2      |   |
| MONTE A SUA EXPOSIÇÃO                                   |  (pequena)     |   |
|                                                         +----------------+   |
| (Buscar por artista, título ou tema (em inglês)) [Buscar]                    |
| Dica: o acervo é em inglês. Experimente: Monet, landscape, portrait.         |
|                                                                              |
| +----------------------------------+                                         |
| |                                  |     Explore o acervo do Cleveland       |
| |                                  |     Museum of Art e monte a sua         |
| |        # OBRA PRINCIPAL          |     própria exposição.                  |
| |        (aleatória da API)        |                                         |
| |                                  |     [Surpreenda-me ->]                  |
| +----------------------------------+                                         |
|  Título da obra, Artista, ano                                                |
+------------------------------------------------------------------------------+
```
Celular:
```
+------------------------------------+
| EXPLORE UM DOS MAIORES MUSEUS      |
| DO MUNDO E MONTE A SUA EXPOSIÇÃO   |
|                                    |
| (Buscar por artista ou tema...)    |
| [Buscar]                           |
|                                    |
| +--------------------------------+ |
| |         # OBRA PRINCIPAL       | |
| +--------------------------------+ |
| Título, Artista, ano               |
|                                    |
| Explore o acervo do Cleveland      |
| Museum of Art e monte a sua        |
| própria exposição.                 |
| [Surpreenda-me ->]                 |
+------------------------------------+
```
- Fundo grafite, texto claro, legenda em itálico. O título é o único h1 da página e cabe em 3 linhas no desktop.
- O campo de busca e o botão "Buscar" ficam lado a lado, com espaço entre eles. O botão é uma pílula clara sobre o fundo grafite.
- A obra vem de getRandomArtworks({ count: 2 }), que sorteia entre as pinturas: uma principal e uma pequena. A pequena some no celular.
- "Surpreenda-me" busca outra obra aleatória, atualiza a principal e abre o modal com ela.
- A busca do hero envia o termo para a Galeria (handleSearch) e rola até ela.

### Seção 3: Faixa de números

```
+------------------------------------------------------------------------------+
|   68.771               41.536                          3.955                 |
|   obras no acervo      com imagem em domínio público   pinturas              |
+------------------------------------------------------------------------------+
```
- Fundo off-white com linha fina em cima e embaixo. Números em Inter 300 de 48px, legenda em 13px na cor secundária.
- Os valores vêm de useStats (totalArtworks, totalWithImage e totalPaintings). Enquanto carrega, mostrar "..." e, em caso de falha, um traço.
- Celular: três colunas compactas com número menor.

### Seção 4: Explorar por tema

```
+------------------------------------------------------------------------------+
| Descubra por tema                                                   [<] [->] |
| EXPLORAR POR TEMA                                                            |
| ---------------------------------------------------------------------------- |
|                                                                              |
| +---------+  +---------+  +---------+  +---------+  +---------+  +----       |
| |         |  |         |  |         |  |         |  |         |  |           |
| | #       |  | #       |  | #       |  | #       |  | #       |  | #         |
| |         |  |         |  |         |  |         |  |         |  |           |
| |Paisagens|  |Retratos |  | Animais |  |Natureza |  |Mitologia|  |           |
| +---------+  +---------+  +---------+  +---------+  +---------+  +----       |
+------------------------------------------------------------------------------+
```
- Temas de THEMES. Cards altos (proporção 3:4) com imagem de fundo e o nome do tema na base, sobre um escurecimento leve.
- A imagem de cada tema vem de searchArtworks com o query do tema e limit 1: primeiro com type Painting e, sem resultado, sem o type. Sem resultado ou com falha, usar o fundo var(--color-band).
- A última imagem aparece cortada pela borda direita da tela. Faixa horizontal com scroll-snap.
- O clique aplica o tema como busca (handleSelectTheme) e rola até a Galeria.
- Celular: cards com 70% da largura, rolagem horizontal e sem as setas.

### Seção 5: Como funciona

```
+------------------------------------------------------------------------------+
| Seu caminho                                                                  |
| COMO FUNCIONA                                                                |
| ---------------------------------------------------------------------------- |
|                                                                              |
|   01                       02                       03                       |
|   Explore                  Escolha                  Monte                    |
|   ~~~~~~~~~~~~~~~~         ~~~~~~~~~~~~~~~~         ~~~~~~~~~~~~~~~~         |
+------------------------------------------------------------------------------+
```
- 01 Explore: "Navegue por temas ou busque por artista, título ou assunto."
- 02 Escolha: "Toque no coração das obras de que você gostou."
- 03 Monte: "Dê um nome à sua exposição e revise a seleção."
- Números grandes em Inter 300 na cor de acento. Celular: passos empilhados, número à esquerda.

### Seção 6: Galeria

Desktop:
```
+------------------------------------------------------------------------------+
| (faixa bege #EFE7DA de fundo)                                                |
| Acervo                                                                       |
| GALERIA                                                                      |
| ---------------------------------------------------------------------------- |
|                                                                              |
| (Buscar...)                                                                  |
| [Todos] [Pintura] [Gravura] [Desenho] [Escultura] [Fotografia] [Têxtil]      |
| [Tema: Paisagens x]                                        1.588 resultados  |
|                                                                              |
| +--------+  +--------+  +--------+  +--------+                               |
| |   (♡)  |  |   (♡)  |  |   (♡)  |  |   (♡)  |                               |
| | #      |  | #      |  | #      |  | #      |                               |
| +--------+  +--------+  +--------+  +--------+                               |
| Título      Título      Título      Título                                   |
| Artista,ano Artista,ano Artista,ano Artista,ano                              |
|                                                                              |
|                    [<]  1  2  3  ...  133  [>]                               |
+------------------------------------------------------------------------------+
```
Celular:
```
+------------------------------------+
| GALERIA                            |
| (Buscar...)                        |
| [Todos][Pintura][Gravura][Dese >   |   rolagem horizontal
| 1.588 resultados                   |
|                                    |
| +-----------+  +-----------+       |
| |   (♡)     |  |   (♡)     |       |
| | #         |  | #         |       |
| +-----------+  +-----------+       |
| Título         Título              |
| Artista, ano   Artista, ano        |
|                                    |
| [ Carregar mais ]                  |
+------------------------------------+
```
- Controles: busca, chips de tipo de obra (Todos e os itens de FEATURED_TYPES, com o rótulo em português e o value enviado à API) e o chip removível do tema ativo, por exemplo [Tema: Paisagens x].
- A busca filtra ao digitar, com useDebounce de 400ms. A página volta para 1 quando busca ou filtro mudam.
- Contagem: "{formatNumber(total)} resultados".
- Grade em colunas CSS estilo mural: 2 no celular, 3 no tablet e 4 no desktop. Cards com break-inside: avoid.
- A imagem (imageUrl) mantém a proporção original (aspect-ratio a partir de imageWidth e imageHeight).
- O coração fica no canto superior direito da imagem, com sombra leve. Vazio com borda branca, preenchido em acento quando a obra está na exposição. O coração e o botão da imagem são elementos irmãos.
- Hover no card: a imagem escurece e aparece "Ver detalhes" no centro. O clique abre o modal.
- Tablet e desktop usam Pagination numerada. O celular usa o botão "Carregar mais", que acrescenta a próxima página (useArtworks com append verdadeiro).
- No desktop, ao trocar de página, rolar suavemente até o início da seção.
- Obra sem imagem: bloco var(--color-band) com ícone de moldura.

Estados da grade:
```
CARREGANDO            SEM RESULTADOS              ERRO
+----+ +----+ +----+  +---------------------+    +---------------------+
|////| |////| |////|  |   (icone moldura)   |    |   (icone alerta)    |
|////| |////| |////|  | Nada encontrado     |    | Não foi possível    |
+----+ +----+ +----+  | Tente outro termo   |    | carregar as obras   |
 ///    ///    ///    | ou escolha um tema. |    | [Tentar novamente]  |
                      +---------------------+    +---------------------+
```
- Sem resultados: sugestões clicáveis com os rótulos de THEMES.

### Seção 7: Modal de detalhes

Desktop:
```
+------------------------------------------------------------------------------+
|                                                                          [X] |
| +-------------------------------+   Pintura (chip)                           |
| |                               |   TÍTULO DA OBRA                           |
| |                               |   Artista                                  |
| |        # IMAGEM GRANDE        |   ---------------------------              |
| |                               |   Data         1889                        |
| |                               |   Técnica      Óleo sobre tela             |
| |                               |   Dimensões    73 x 92 cm                  |
| +-------------------------------+   Origem       França                      |
|                                     Créditos     Doação de ...               |
|                                     ---------------------------              |
|                                     ~~~~~~~~~~~~~~~~~~~~~~~~~~~              |
|                                     Ver no site do museu                     |
|                                     [Adicionar à minha exposição ->]         |
+------------------------------------------------------------------------------+
```
Celular (tela cheia):
```
+------------------------------------+
| [<] Voltar                         |
| +--------------------------------+ |
| |         # IMAGEM               | |
| +--------------------------------+ |
| TÍTULO DA OBRA                     |
| Artista                            |
| Data | Técnica | Dimensões | Origem|
| ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ |
|                                    |
| [Adicionar à minha exposição ->]   |   fixo no rodapé
+------------------------------------+
```
- Renderizado com createPortal em document.body, com role="dialog", aria-modal="true" e aria-labelledby apontando para o título.
- Fecha com ESC, clique no fundo e botão X. Ao abrir, o foco vai para o botão de fechar, o Tab circula apenas dentro do modal e, ao fechar, o foco volta ao elemento que o abriu. A rolagem do body fica travada enquanto aberto.
- Imagem grande com imageUrl. Campos vazios mostram "Não informado". O chip do tipo usa o rótulo em português de FEATURED_TYPES quando existir e, senão, o valor original de type.
- Origem usa culture. Descrição com stripHtml. Link "Ver no site do museu" para museumUrl.
- Os fatos (Data, Técnica, Dimensões, Origem, Créditos) aparecem em lista vertical em qualquer largura, e não na linha horizontal "Data | Técnica | ..." do wireframe do celular.
- O botão de exposição alterna entre "Adicionar à minha exposição" (primary) e "Remover da exposição" (outline).
- Busca os detalhes com useArtworkDetails ao abrir, com skeleton nos campos enquanto carrega e ErrorMessage com retry em caso de erro.

### Seção 8: Minha Exposição

Desktop:
```
+------------------------------------------------------------------------------+
| Sua curadoria                                                                |
| MINHA EXPOSIÇÃO                                                              |
| ---------------------------------------------------------------------------- |
|                                                                              |
| Título:  (Dê um nome à sua exposição...)                                     |
|                                                                              |
| +-------+ +-------+ +-------+ +-------+ +-------+                            |
| |   #   | |   #   | |   #   | |   #   | |   #   |                            |
| |  [x]  | |  [x]  | |  [x]  | |  [x]  | |  [x]  |                            |
| +-------+ +-------+ +-------+ +-------+ +-------+                            |
| Título     Título    Título    Título    Título                              |
| Artista    Artista   Artista   Artista   Artista                             |
|                                                                              |
| 5 obras                             [Limpar exposição]  [Compartilhar ->]    |
+------------------------------------------------------------------------------+
```
Estado vazio:
```
+------------------------------------------------------------------------------+
|        (ícone de moldura)                                                    |
|        Sua exposição ainda está vazia                                        |
|        Clique no coração de uma obra para começar                            |
|        [Explorar a galeria ->]                                               |
+------------------------------------------------------------------------------+
```
- Campo de título com limite de 80 caracteres, ligado a setTitle.
- Itens menores que os da galeria, com imagem, título, artista e botão de remover com aria-label. O clique na imagem abre o modal.
- Contagem "1 obra" ou "N obras".
- "Limpar exposição" pede confirmação na própria tela, com "Confirmar" e "Cancelar".
- "Compartilhar" copia com navigator.clipboard.writeText o título (ou "Minha exposição" quando vazio), uma linha numerada por obra no formato "1. Título, Artista, data" e a última linha "Montada no Vernissage", e mostra "Copiado!" por 2 segundos em uma região aria-live.
- Celular: itens em rolagem horizontal, campo de título acima e botões empilhados.

### Seção 9: Footer

Desktop:
```
      (curva grafite no topo)
+------------------------------------------------------------------------------+
| VERNISSAGE                 Navegação          Sobre os dados                 |
| ~~~~~~~~~~~~~~~~~~         Explorar           Cleveland Museum of Art        |
| ~~~~~~~~~~~~~~~~~~         Galeria            API aberta                     |
|                            Exposição          Dados e imagens em domínio     |
|                                               público (CC0), cortesia do     |
|                                               Cleveland Museum of Art.       |
|                                                                              |
| Projeto acadêmico   |   GitHub   |   Feito com React + Vite                  |
+------------------------------------------------------------------------------+
```
- Fundo grafite, texto off-white, curva no topo (border-radius grande nos cantos superiores).
- Frase da marca: "Explore o acervo do Cleveland Museum of Art e monte a sua própria exposição."
- Links: Cleveland Museum of Art (https://www.clevelandart.org), API aberta (https://openaccess-api.clevelandart.org) e GitHub (https://github.com/matheusdias20/vernissage). Links externos com target="_blank" e rel="noopener noreferrer".
- Celular: colunas empilhadas.

## 8. Contratos dos componentes

Componentes de src/components/ui (sem lógica de API):
- SectionHeader (eyebrow, title, id, inverted): título h2.
- Button (variant 'primary' | 'outline', onClick, children, icon 'arrow' ou nenhum, type, disabled, inverted): altura mínima de 44px.
- Chip (label, active, onClick, removable, onRemove): active usa aria-pressed; o botão "x" tem aria-label "Remover filtro {label}".
- Pagination (page, totalPages, onChange): nav com aria-label "Paginação", no máximo 5 números visíveis com reticências, aria-current="page" na atual, devolve null quando totalPages for 1 ou menor.
- Loading (count = 8): esqueletos em colunas (2, 3 e 4) com alturas variadas e animação de pulso, role="status" e texto "Carregando obras" só para leitores de tela.
- EmptyState (title, message, suggestions = [], onSuggestionClick): ícone de moldura, texto e chips de sugestão.
- ErrorMessage (message, onRetry): ícone de alerta, role="alert" e botão outline "Tentar novamente".

Layout e seções:
- Header: sem props de dados; lê o contador de useExhibition.
- Hero (onSearch, onOpenArtwork).
- SearchBar (value, onChange, onSubmit, placeholder, variant 'light' | 'dark', submitLabel = 'Buscar', showSubmit = true): formulário com role="search", input com label acessível e botão de envio; onSubmit recebe o texto atual.
- StatsStrip: usa useStats.
- ThemeCarousel (onSelectTheme) e ThemeCard (theme, onSelect): o card é um botão com aria-label "Explorar tema {label}".
- StepsList.
- Gallery (query, themeLabel, onQueryChange, onClearTheme, onSelectTheme, onOpenArtwork): estado local page e type (null); usa useMediaQuery('(max-width: 640px)') para decidir o append.
- Filters (type, onTypeChange): chips fixos vindos de FEATURED_TYPES, mais "Todos" (type null).
- ArtworkGrid (artworks, onOpen) e ArtworkCard (artwork, onOpen).
- ArtworkModal (artworkId, onClose).
- ExhibitionPanel (onOpenArtwork) e Footer.

## 9. Estrutura de pastas

```
src/
├── components/
│   ├── layout/      Header, Footer
│   ├── sections/    Hero, StatsStrip, ThemeCarousel, ThemeCard, StepsList, Gallery, ExhibitionPanel
│   ├── artwork/     ArtworkGrid, ArtworkCard, ArtworkModal
│   ├── filters/     SearchBar, Filters
│   └── ui/          SectionHeader, Button, Chip, Pagination, Loading, EmptyState, ErrorMessage
├── context/         exhibitionContext.js, ExhibitionContext.jsx
├── hooks/           useArtworks, useArtworkDetails, useDebounce, useStats, useExhibition, useMediaQuery
├── services/        artApi.js
├── utils/           stripHtml.js, formatters.js
├── constants/       themes.js, artworkTypes.js
├── styles/          variables.css, reset.css, global.css
├── App.jsx
└── main.jsx
```

## 10. Progresso

- [x] Fase 1: projeto criado com Vite e React
- [x] Fase 2: repositório no GitHub
- [x] Fase 3: estrutura de pastas e componentes base
- [x] Fase 4: variáveis, fonte Inter e estilos globais
- [x] Fase 5: camada de dados com a API do Art Institute (será substituída na migração)
- [x] Fase 6: componentes de ui
- [x] Fase 7.1: Header e Hero (o Hero será religado à nova API na migração)
- [x] Migração para a API do Cleveland Museum of Art: camada de dados (artApi, formatters, imageUrl removido, artworkTypes, hooks e contexto da exposição)
- [x] Migração para a API do Cleveland Museum of Art: Hero religado (imageUrl/imageWidth/imageHeight, formatters com artist/date, SearchBar variant dark e grid de 12 colunas no desktop)
- [x] Fase 7.2: StatsStrip, ThemeCarousel e StepsList
- [x] Fase 7.3: Galeria, Filters, ArtworkGrid e ArtworkCard
- [x] Fase 7.4: ArtworkModal
- [x] Fase 7.5: ExhibitionPanel e Footer
- [ ] Fase 8: revisão de estados, responsividade e acessibilidade
- [ ] Fase 9: favicon, metadados e publicação
- [ ] Fase 10: README

## 11. Polimento visual (pendências)

Esta é uma lista de pendências: os itens só são implementados quando uma tarefa pedir.

- [x] ThemeCarousel: o primeiro card começa alinhado ao mesmo x do título e da linha do SectionHeader, em qualquer largura de tela, e a faixa continua rolando até a borda direita.
- [x] StatsStrip: em caso de erro, mostrar "n/d" nos números. Trocar o caractere de travessão longo (U+2014) por vírgula, dois-pontos, parênteses ou "n/d" nos textos de src e de docs/contexto.md.
- [ ] Hero: o estado de erro da obra principal usa uma versão escura (fundo var(--color-dark) e texto claro) no lugar do bloco branco.
- [ ] Hero: reservar a altura da imagem principal com aspect-ratio (mantendo max-height de 70vh) para a página não "pular" quando a imagem carrega.
- [ ] ThemeCard: capas mais fiéis, com uma obra escolhida por tema (id fixo em THEMES) e a busca atual como alternativa.
- [ ] Mensagem de erro de rede em artApi.js: trocar "Sem conexão com a internet..." por "Não foi possível falar com o servidor do museu. Verifique sua conexão e tente novamente.", porque a falha também acontece por CORS ou servidor fora do ar.
- [x] ArtworkCard: coração com sombra ou contraste em obras claras e área de toque de 44px (área clicável ampliada, ícone do mesmo tamanho). Conferir o alvo de toque do título.
- [ ] useMediaQuery e o monitoramento de rolagem do Header: usar useSyncExternalStore no lugar de estado com efeito.