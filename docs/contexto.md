# Vernissage: contexto do projeto

Este arquivo é a fonte única de informações do projeto. Leia-o inteiro antes de cada tarefa e siga o que está aqui. Cada tarefa altera apenas os arquivos que ela cita.

## 1. Visão geral

Vernissage é um painel interativo em React + Vite que consome a API pública do Art Institute of Chicago (https://api.artic.edu/api/v1), sem chave de API.

- Problemática: o acervo do museu tem mais de 130 mil obras e é difícil de explorar para quem não sabe o que buscar.
- Usuário: estudante ou curioso que gosta de arte e não tem repertório para buscar por nome.
- Objetivo: transformar a exploração em curadoria. O usuário descobre obras por temas e busca, filtra, vê detalhes e monta a própria exposição, com título e obras salvas no navegador.
- Entrega (desafio acadêmico): aplicação publicada na Vercel ou Netlify, repositório no GitHub e README com problemática, objetivo, tecnologias, API, funcionalidades, instruções para rodar, link publicado e uso de IA.
- Requisitos do desafio: React + Vite, API pública, componentização, pelo menos uma interação com os dados, interface responsiva, CSS organizado e tratamento dos comportamentos da aplicação (carregando, erro, sem resultados).

## 2. Regras de desenvolvimento

- Stack: React 19 e Vite 8, JavaScript, Node 20.19 ou superior.
- Requisições com fetch nativo. O projeto não usa bibliotecas de UI, de estado ou de requisição.
- Estilos: CSS Modules por componente (NomeDoComponente/NomeDoComponente.jsx e NomeDoComponente.module.css), variáveis CSS globais em src/styles/variables.css, abordagem mobile-first.
- Interface em português do Brasil. Os textos das obras (títulos, descrições, técnicas) chegam da API em inglês e são exibidos como chegam.
- Tipografia: somente Inter (pesos 300, 400, 500 e 600).
- A marca é o texto "VERNISSAGE" em caixa alta, peso 300 e espaçamento entre letras de 0.3em, feito em CSS no Header e no Footer.
- Estilo visual minimalista e editorial, com muito respiro, inspirado em galerias de arte.
- Componentes pequenos, com uma responsabilidade cada. Manter o padrão de export dos componentes já existentes.
- Toda chamada de API fica em src/services/artApi.js. Componentes e hooks usam as funções de lá.
- Imports relativos de arquivos .js usam a extensão.
- A descrição da obra chega em HTML e é convertida com stripHtml antes de ser exibida como texto.
- Estados a tratar sempre: carregando, erro (com botão "Tentar novamente"), sem resultados, obra sem imagem, campos vazios e requisição cancelada.
- Acessibilidade: botões reais, foco visível, aria-labels, alt das imagens com getImageAlt, alvos de toque de pelo menos 44px, respeito a prefers-reduced-motion e ordem correta de títulos (um h1, no Hero).
- Imagens com loading="lazy" (exceto a principal do Hero), decoding="async" e espaço reservado com aspect-ratio ou width e height.
- Lint com Oxlint (.oxlintrc.json, com regras de hooks do React). Ao terminar cada tarefa, rodar npm run lint e npm run build e informar o resultado de cada um.
- Hooks: em efeitos, o setState acontece apenas dentro de callbacks assíncronos (then e catch), nunca no corpo síncrono do efeito. O estado de carregamento é derivado: guardar o resultado da última requisição junto com a chave dela (combinação dos parâmetros ou o id) e calcular loading comparando a chave guardada com a chave atual. Cada callback confere se a requisição foi cancelada antes de atualizar o estado. retry incrementa um contador que faz parte da chave.
- Contexto e hook ficam em arquivos separados (componente Provider em .jsx; createContext e o hook em .js), para o Oxlint não avisar sobre export misto.
- Comentários curtos em português, apenas nas decisões não óbvias.
- Na Galeria, page volta para 1 nos mesmos handlers que alteram busca ou filtros (nunca em efeitos), e a lista atual continua visível, com indicação de carregamento, enquanto uma nova busca roda.

## 3. API do Art Institute of Chicago (verificado em testes reais)

Base: https://api.artic.edu/api/v1. Sem chave. CORS liberado para qualquer origem (access-control-allow-origin: *), inclusive o preflight de POST com Content-Type application/json. Limite de 60 requisições por minuto por IP. O status 429 indica limite excedido.

Buscas:
- Todas as buscas usam POST em /artworks/search, com corpo JSON { fields, limit, page, query: { bool: { must: [...] } } }.
- O campo q no nível superior do corpo apenas reordena por relevância e não filtra. A busca de texto real usa multi_match dentro de bool.must.
- Filtros dentro de bool.must: exists no campo image_id (sempre), term is_public_domain true, term artwork_type_id com o id do tipo, e multi_match com o texto e os campos title^3, artist_title^3, subject_titles, category_titles, style_title, classification_title e medium_display.
- Verificado: "landscape" devolve 1.580 obras, "monet" devolve 46 (todas de Claude Monet) e "qwertyuiop" devolve 0. O pagination.total reflete a busca quando o texto vai no multi_match.
- Limite de paginação: posição inicial mais quantidade não pode passar de 1.000. Acima disso a API responde 403 "Invalid number of results", mesmo que pagination.total_pages sugira mais páginas. Com 12 obras por página, o máximo é a página 83 (996 obras).

Números do acervo (verificados):
- 132.747 obras no total, 62.059 em domínio público e 59.059 em domínio público com imagem.
- 45 tipos de obra em /artwork-types. Ids conhecidos: Painting 1, Photograph 2, Sculpture 3, Print 18, Vessel 23.
- Totais por tema (domínio público com imagem): Paisagens 1.580, Retratos 3.259, Animais 902, Natureza-morta 676, Mitologia 346, Mar 194.

Obras:
- GET /artworks/{id}?fields=... devolve os detalhes. Campos usados na lista: id, title, artist_title, date_display, image_id, is_public_domain, artwork_type_title e thumbnail. Campos extras nos detalhes: artist_display, medium_display, dimensions, place_of_origin, credit_line, description, short_description, subject_titles, style_title e department_title.
- thumbnail traz alt_text, width e height da imagem original.
- image_id pode ser nulo. A busca do app já exige image_id.
- description chega em HTML.

Imagens (IIIF): https://www.artic.edu/iiif/2/{image_id}/full/{largura},/0/default.jpg. Larguras usadas: 200, 400 e 843. As URLs abrem no navegador (verificado). O servidor de imagens bloqueia clientes automatizados fora do navegador, então imagens só se verificam no navegador.

Licenças:
- Dados em CC0.
- Imagens de obras em domínio público (is_public_domain true) podem ser usadas livremente. O filtro "Só domínio público" começa ligado.
- O campo description é CC BY 4.0 e exige atribuição ao Art Institute of Chicago.

## 4. Camada de dados

src/services/artApi.js (fetch nativo, cache em memória de 10 minutos, chave formada por URL e corpo, suporte a signal):
- Erros em português: 429 "Muitas requisições em pouco tempo. Aguarde um minuto e tente novamente."; outros status "Não foi possível carregar os dados (código X)."; falha de rede "Sem conexão com a internet. Verifique e tente novamente." O AbortError é repassado sem alteração.
- searchArtworks({ query = '', page = 1, limit = 12, artworkTypeId = null, publicDomainOnly = true, signal }) devolve { artworks, pagination: { total, totalPages, currentPage, limit } }, com totalPages igual ao menor valor entre total_pages da API e floor(1000 / limit).
- getArtworkById(id, { signal }) devolve a obra com os campos de detalhe.
- getArtworkTypes({ signal }) devolve [{ id, title }] ordenado por title.
- getTotal({ publicDomainOnly = false, signal }) devolve o total do acervo ou o total em domínio público.
- getRandomArtworks({ count = 1, signal }) devolve obras de uma página aleatória entre as primeiras 1.000 (domínio público com imagem).

src/utils:
- imageUrl.js: getImageUrl(imageId, width = 400) e getImageSrcSet(imageId), com larguras 200, 400 e 843.
- stripHtml.js: stripHtml(html) converte HTML em texto puro com DOMParser.
- formatters.js: formatArtist ("Artista desconhecido"), formatDate ("Data não informada"), formatField ("Não informado"), formatNumber (pt-BR) e getImageAlt(artwork).

src/constants:
- themes.js: THEMES com { id, label, query }: Paisagens (landscape), Retratos (portrait), Animais (animals), Natureza-morta (still life), Mitologia (mythology) e Mar (sea).
- artworkTypes.js: FEATURED_TYPES com { title, label }: Painting (Pintura), Print (Gravura), Drawing and Watercolor (Desenho e aquarela), Sculpture (Escultura), Photograph (Fotografia) e Textile (Têxtil).

src/hooks:
- useDebounce(value, delay = 400).
- useArtworks({ query, page, artworkTypeId, publicDomainOnly, append = false}) devolve { artworks, pagination, loading, error, retry }. Cancela a requisição anterior com AbortController e ignora o erro de cancelamento. A lista reinicia quando query, artworkTypeId ou publicDomainOnly mudam. Com append verdadeiro e page maior que 1, acrescenta as obras novas sem duplicar ids e mantém a lista atual visível durante o carregamento.
- useArtworkDetails(id) devolve { artwork, loading, error, retry }. Com id nulo, não busca.
- useStats() devolve { totalArtworks, totalPublicDomain, totalTypes, loading, error }.
- useExhibition() lê o contexto da exposição.
- useMediaQuery(query) devolve true ou false e reage a mudanças com matchMedia.

Estado da exposição:
- src/context/exhibitionContext.js cria e exporta o contexto com createContext.
- src/context/ExhibitionContext.jsx exporta ExhibitionProvider. O estado tem title (texto) e items (lista com id, title, artist_title, date_display, image_id e alt da imagem). Ações: toggle(artwork), remove(id), clear(), setTitle(text) e isInExhibition(id), além de count. O estado inicial é lido do localStorage (chave "vernissage:exhibition") por um inicializador do useState, e um useEffect grava a cada mudança. Toda leitura e escrita usa try/catch, e a leitura valida o formato e ignora conteúdo corrompido.
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
| |                                  |     Explore o acervo do Art Institute   |
| |                                  |     of Chicago e monte a sua própria    |
| |        # OBRA PRINCIPAL          |     exposição.                          |
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
| Explore o acervo do Art Institute  |
| of Chicago e monte a sua exposição.|
| [Surpreenda-me ->]                 |
+------------------------------------+
```
- Fundo grafite, texto claro, legenda em itálico. O título é o único h1 da página.
- A obra vem de getRandomArtworks({ count: 2 }): uma principal e uma pequena. A pequena some no celular.
- "Surpreenda-me" busca outra obra aleatória, atualiza a principal e abre o modal com ela.
- A busca do hero envia o termo para a Galeria (handleSearch) e rola até ela.

### Seção 3: Faixa de números

```
+------------------------------------------------------------------------------+
|   132.747              45                 62.059                             |
|   obras no acervo      tipos de obra      em domínio público                 |
+------------------------------------------------------------------------------+
```
- Fundo off-white com linha fina em cima e embaixo. Números em Inter 300 de 48px, legenda em 13px na cor secundária.
- Os valores vêm de useStats (os números acima são exemplos). Enquanto carrega, mostrar "..." e, em caso de falha, um traço.
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
- A imagem de cada tema vem de searchArtworks com o query do tema, limit 1 e domínio público. Sem resultado ou com falha, usar o fundo var(--color-band).
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
| [Todos] [Pintura] [Gravura] [Desenho e aquarela] ...   [x] Só domínio público |
| [Tema: Mar x]                                              1.580 resultados  |
|                                                                              |
| +--------+  +--------+  +--------+  +--------+                               |
| |   (♡)  |  |   (♡)  |  |   (♡)  |  |   (♡)  |                               |
| | #      |  | #      |  | #      |  | #      |                               |
| +--------+  +--------+  +--------+  +--------+                               |
| Título      Título      Título      Título                                   |
| Artista,ano Artista,ano Artista,ano Artista,ano                              |
|                                                                              |
|                    [<]  1  2  3  ...  83  [>]                                |
+------------------------------------------------------------------------------+
```
Celular:
```
+------------------------------------+
| GALERIA                            |
| (Buscar...)                        |
| [Todos][Pintura][Gravura][Dese >   |   rolagem horizontal
| [x] Só domínio público             |
| 1.580 resultados                   |
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
- Controles: busca, chips de tipo de obra (FEATURED_TYPES encontrados na API, mais "Todos"), alternância "Só domínio público" (começa ligada) e o chip removível do tema ativo, por exemplo [Tema: Mar x].
- A busca filtra ao digitar, com useDebounce de 400ms. A página volta para 1 quando busca ou filtro mudam.
- Contagem: "{formatNumber(total)} resultados". Quando total for maior que totalPages vezes limit, mostrar também o aviso "Mostrando as primeiras {totalPages * limit} obras. Use a busca ou os filtros para refinar."
- Grade em colunas CSS estilo mural: 2 no celular, 3 no tablet e 4 no desktop. Cards com break-inside: avoid.
- A imagem mantém a proporção original (aspect-ratio a partir de thumbnail.width e thumbnail.height).
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
|                                     Descrição: Art Institute of Chicago,     |
|                                     licença CC BY 4.0                        |
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
- Imagem grande com getImageUrl(id, 843). Campos vazios mostram "Não informado".
- Descrição com stripHtml (usar short_description quando description estiver vazia). Link "Ver no site do museu" para https://www.artic.edu/artworks/{id}.
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
| ~~~~~~~~~~~~~~~~~~         Explorar           Art Institute of Chicago       |
| ~~~~~~~~~~~~~~~~~~         Galeria            API pública                    |
|                            Exposição          Dados em CC0. Imagens em       |
|                                               domínio público quando         |
|                                               indicado. Descrições em        |
|                                               CC BY 4.0.                     |
|                                                                              |
| Projeto acadêmico   |   GitHub   |   Feito com React + Vite                  |
+------------------------------------------------------------------------------+
```
- Fundo grafite, texto off-white, curva no topo (border-radius grande nos cantos superiores).
- Frase da marca: "Explore o acervo do Art Institute of Chicago e monte a sua própria exposição."
- Links: Art Institute of Chicago (https://www.artic.edu), API pública (https://api.artic.edu/docs) e GitHub (https://github.com/matheusdias20/vernissage). Links externos com target="_blank" e rel="noopener noreferrer".
- Celular: colunas empilhadas.

## 8. Contratos dos componentes

Componentes de src/components/ui (sem lógica de API):
- SectionHeader (eyebrow, title, id, inverted): título h2.
- Button (variant 'primary' | 'outline', onClick, children, icon 'arrow' ou nenhum, type, disabled, inverted): altura mínima de 44px.
- Chip (label, active, onClick, removable, onRemove): active usa aria-pressed; o botão "x" tem aria-label "Remover filtro {label}".
- Pagination (page, totalPages, onChange): nav com aria-label "Paginação", no máximo 5 números visíveis com reticências, aria-current="page" na atual, devolve null quando totalPages for 1 ou menor.
- Loading (count = 8): esqueletos em colunas (2, 3 e 4) com animação de pulso, role="status" e texto "Carregando obras" só para leitores de tela.
- EmptyState (title, message, suggestions = [], onSuggestionClick): ícone de moldura, texto e chips de sugestão.
- ErrorMessage (message, onRetry): ícone de alerta, role="alert" e botão outline "Tentar novamente".

Layout e seções:
- Header: sem props de dados; lê o contador de useExhibition.
- Hero (onSearch, onOpenArtwork).
- SearchBar (value, onChange, onSubmit, placeholder, variant 'light' | 'dark', submitLabel = 'Buscar', showSubmit = true): formulário com role="search", input com label acessível e botão de envio; onSubmit recebe o texto atual.
- StatsStrip: usa useStats.
- ThemeCarousel (onSelectTheme) e ThemeCard (theme, onSelect): o card é um botão com aria-label "Explorar tema {label}".
- StepsList.
- Gallery (query, themeLabel, onQueryChange, onClearTheme, onOpenArtwork): estado local page, artworkTypeId (null) e publicDomainOnly (true); usa useMediaQuery('(max-width: 640px)') para decidir o append.
- Filters (artworkTypeId, onTypeChange, publicDomainOnly, onPublicDomainChange): busca os tipos com getArtworkTypes; se falhar, mostra apenas "Todos".
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
├── utils/           imageUrl.js, stripHtml.js, formatters.js
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
- [x] Fase 5.1: serviço da API, utilitários e constantes
- [x] Fase 5.2: hooks de dados (useDebounce, useArtworks, useArtworkDetails, useStats)
- [x] Fase 5.3: estado da exposição (contexto, Provider e useExhibition)
- [ ] Fase 6: componentes de ui
- [ ] Fase 7.1: Header e Hero
- [ ] Fase 7.2: StatsStrip, ThemeCarousel e StepsList
- [ ] Fase 7.3: Galeria, Filters, ArtworkGrid e ArtworkCard
- [ ] Fase 7.4: ArtworkModal
- [ ] Fase 7.5: ExhibitionPanel e Footer
- [ ] Fase 8: revisão de estados, responsividade e acessibilidade
- [ ] Fase 9: favicon, metadados e publicação
- [ ] Fase 10: README