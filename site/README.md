# AIDEP — site institucional

Site institucional da **Associação Internacional para o Desenvolvimento do
Desporto e Paradesporto (AIDEP)**, em português, inglês e espanhol.

Next.js (App Router) · React · TypeScript · Tailwind CSS v4 · Motion for React ·
next-intl · React Hook Form + Zod.

---

## Portão de pré-lançamento (site em construção)

O site **está fechado ao público**. Qualquer endereço responde com a página
_Site em construção_ e só libera o conteúdo real depois da senha.

- **Senha:** `123` — chumbada no código, em [`src/lib/gate.ts`](src/lib/gate.ts).
- Ao acertar a senha, um cookie (`aidep-preview`, 30 dias) libera o navegador
  e o visitante cai exatamente na página que tentou abrir.
- Com o portão ligado, `robots.txt` bloqueia tudo, o `sitemap.xml` sai vazio e
  as respostas levam `X-Robots-Tag: noindex`.

> É uma barreira de cortesia para a fase de aprovação, **não** um mecanismo de
> segurança: quem tem acesso ao código sabe a senha. Não use para proteger
> dados sensíveis.

### Para abrir o site ao público

Em [`src/lib/gate.ts`](src/lib/gate.ts), troque uma linha:

```ts
export const gateEnabled: boolean = false
```

É a única alteração necessária. Feito isso, estes arquivos podem ser apagados
sem afetar o site: `src/lib/gate.ts`, `src/app/em-construcao/` e
`src/app/api/liberar/` — removendo também os `import` do portão em
`src/proxy.ts`, `src/app/robots.ts` e `src/app/sitemap.ts`.

---

## Painel de conteúdo (`/admin`)

O cliente publica notícias, projetos e documentos de transparência sozinho,
em `https://…/admin` — sem tocar em código e sem precisar de deploy.

O painel fica fora do roteamento de idiomas, não passa pelo portão de
pré-lançamento e não é indexado.

### Colocar no ar (uma vez só)

1. **Preencher o `.env`** — as duas primeiras em **Project Settings → API**,
   a senha em **Project Settings → Database**:

   ```
   NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…
   SUPABASE_PASSWORD=…
   ```

   A senha é usada só pelos scripts de terminal abaixo. O site não precisa
   dela.

2. **Criar as tabelas:**

   ```bash
   npm run db:migrate
   ```

   Aplica `supabase/migrations/*.sql` em ordem e anota o que já rodou em
   `public._migracoes` — rodar de novo não repete nada. Cria as tabelas, as
   regras de acesso, os dois buckets de arquivo e cinco categorias de
   documento.

   > Projeto novo do Supabase só aceita conexão direta por IPv6. Em rede sem
   > IPv6 o script cai no pooler sozinho, testando as regiões até uma
   > autenticar — não é preciso descobrir a região à mão.

3. **Criar o acesso do cliente:**

   ```bash
   npm run admin:criar contato@aidepoficial.com "" "Equipe AIDEP"
   ```

   Com a senha vazia (`""`) o script sorteia uma forte e imprime uma vez só.
   Ele faz as duas metades que o acesso exige: a conta em `auth.users` e a
   liberação em `public.admins`. Sem a segunda, a pessoa entra e não
   consegue salvar nada.

4. **Conferir:**

   ```bash
   npm run db:conferir
   ```

   Mostra tabelas, políticas, buckets, categorias, quanto há publicado e
   quem são os administradores.

5. **Entrar em `/admin/login`** e, na tela inicial, clicar em
   **Importar projetos do site** para trazer Coração Valente, Futsal na
   Escola e FutEdu Summit do código para o painel.

### Encher o painel com o conteúdo de demonstração

```bash
npm run conteudo:semear -- <email-do-admin> <senha>
```

Leva para o Supabase as 3 notícias mais recentes de `content/news-example.ts`
e os 12 documentos de `content/documents-example.ts` — o arquivo sobe para o
Storage e **a miniatura da primeira página de cada PDF é gerada na hora**,
pelo Chrome instalado na máquina. Serve para o cliente ver o painel e o site
preenchidos antes de ter conteúdo real.

> É conteúdo de **demonstração**: as notícias não relatam fato ocorrido e
> cada documento traz a palavra EXEMPLO impressa. Substitua pelo conteúdo
> real antes do lançamento — pelo próprio painel.

O painel mostra na hora; o site público leva até 5 minutos, porque só as
ações do painel invalidam o cache imediatamente.

### Os três idiomas

O painel **não traduz nada automaticamente**. O que for escrito é o que vai
para o ar.

Nos campos de texto principais — título, resumo, editoria, objetivo, nome da
categoria, descrição da imagem — há um bloco **"Traduções"**, fechado por
padrão, com um campo para inglês e outro para espanhol. Quem quiser
escrever a versão de cada idioma escreve ali.

**Campo de tradução em branco não deixa buraco no site**: `lib/idiomas.ts`
completa com o português na hora de exibir. Um visitante em inglês vê o
texto em português em vez de um espaço vazio.

Os campos de lista e o corpo da notícia (parágrafos, público atendido,
resultados, blocos do texto) são só em português, e seguem a mesma regra de
exibição — os três idiomas mostram o mesmo texto.

### O que o painel controla

| Seção | Tabela | O que muda no site |
| --- | --- | --- |
| Notícias | `noticias` | Página de Notícias, seção da Home, notícias relacionadas, sitemap |
| Projetos | `projetos` | Página de Projetos, Home, página de cada projeto, doações |
| Transparência | `documentos` | A tabela da página de Transparência |
| Categorias | `documento_categorias` | Os selos coloridos da coluna Categoria |

**Enquanto uma tabela estiver vazia, o site usa o conteúdo estático de
`src/content`** — os projetos do briefing, as notícias e os documentos de
exemplo. Assim que houver uma linha publicada, o banco manda sozinho. Se o
Supabase cair, o site volta ao conteúdo estático em vez de quebrar.

Publicou, o site atualiza na hora: cada ação do painel chama `updateTag`
sobre a etiqueta de cache do conteúdo.

### Documentos: o que é automático

Ao escolher um PDF, o painel envia o arquivo, **desenha a primeira página no
próprio navegador** e sobe a imagem como miniatura da coluna "Imagem" — o
cliente não precisa recortar nada. Formato e tamanho também são preenchidos
sozinhos. Se o PDF não permitir (protegido, corrompido), a linha fica com o
ícone do formato e ele pode enviar uma imagem à mão.

Na página pública, clicar no título ou na miniatura **abre o documento
dentro da própria página**, sem tirar o visitante do site.

### Segurança

Quem protege os dados é o RLS declarado na migração, que roda no banco:
leitura pública apenas do que está publicado, escrita apenas para quem está
na tabela `admins`. A chave publicável do `.env` vai para o navegador de
propósito e não dá poder nenhum a mais. As checagens de sessão nas telas do
painel são conveniência de interface, não a barreira.

## Como rodar

```bash
npm install
cp .env.example .env.local     # ajuste as variáveis
npm run dev                    # http://localhost:3000 → redireciona para /pt
```

Scripts disponíveis:

| Script | O que faz |
| --- | --- |
| `npm run dev` | ambiente de desenvolvimento |
| `npm run build` | build de produção |
| `npm start` | serve o build |
| `npm run lint` | ESLint (flat config, `eslint-config-next`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:migrate` | aplica as migrações do Supabase (`supabase/migrations/`) |
| `npm run db:conferir` | mostra o estado do banco: tabelas, políticas, buckets, categorias, conteúdo e administradores |
| `npm run admin:criar <email> [senha] [nome]` | cria (ou troca a senha de) um administrador do painel |
| `npm run conteudo:semear -- <email> <senha>` | leva o conteúdo de demonstração para o painel, com as miniaturas dos PDFs |
| `npm run acervo` | prepara o acervo oficial (fotos e vídeos) para a web — precisa de ffmpeg |
| `npm run images:stock` | baixa do Pexels as fotos de banco que preenchem as molduras |
| `npm run docs:example` | gera os documentos de exemplo da Transparência (PDF/CSV) |
| `npm run qa:pages <url>` | percorre todas as rotas nos 3 idiomas em 6 larguras e reporta overflow, erros de console, imagens deformadas ou invisíveis, links quebrados e problemas de estrutura |
| `npm run qa:motion <url>` | audita o site com `prefers-reduced-motion: reduce` |
| `npm run qa:interactions <url>` | testa menu mobile, troca de idioma, formulário e skip link |
| `npm run qa:shots <url> <pasta>` | captura telas para revisão visual |

Os scripts de QA usam `puppeteer-core` com o Chrome instalado na máquina
(`CHROME_PATH` sobrescreve o caminho).

---

## Variáveis de ambiente

| Variável | Efeito |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL pública, usada em canonical, hreflang, sitemap e Open Graph. Padrão: `https://aidepoficial.com` |
| `CONTACT_WEBHOOK_URL` | Endpoint que recebe os formulários. **Enquanto não estiver definida, os formulários validam os dados, informam que o envio não está habilitado e oferecem o e-mail institucional — nunca exibem sucesso falso.** |
| `NEXT_PUBLIC_EXAMPLE_CONTENT` | `0` desliga as notícias e os documentos de exemplo. Ligado por padrão. |
| `PEXELS_API_KEY` | Só para rodar `npm run images:stock`. As fotos já baixadas estão versionadas. |
| `ACERVO_ORIGEM` | Só para rodar `npm run acervo`. Caminho da pasta bruta `Vídeos e Fotos`. Padrão: `../Vídeos e Fotos` |

---

## Navegação

O menu lista **apenas destinos que são página de verdade**:

| Item | Rota |
| --- | --- |
| Página inicial | `/` |
| Projetos | `/projects` |
| Notícias | `/news` |
| Transparência | `/transparency` |
| Parceiros | `/partners` |
| Doações | `/donate` |

Doações é um item de menu como os outros — não é mais um botão destacado no
header —, e continua sendo uma página.

**A Página inicial reúne o que antes eram três páginas.** “A AIDEP”,
“Impacto” e “Contato” deixaram de existir como rota: o conteúdo inteiro das
três virou seção da Home, na ordem em que as perguntas do visitante
aparecem. As âncoras ficam em `src/lib/nav.ts` e são usadas pelo menu
mobile, pelo rodapé e pelos botões da própria Home:

| Âncora | Seção |
| --- | --- |
| `#a-aidep` | apresentação da associação e propósito |
| `#publico-atendido` | público atendido — seção própria, uma faixa por público |
| `#impacto` | números consolidados e resultados por projeto |
| `#contato` | formulário e canais, no fim da página |

Duas regras de navegação valem em todo o site:

- **Onde estou.** O item da página atual recebe `aria-current="page"`, um
  traço na cor institucional no desktop e a borda destacada no mobile —
  nunca só a cor, que sozinha não é sinal acessível. Ver `isActivePath()`
  em `src/lib/nav.ts`.
- **Toda página abre no começo.** `ScrollReset`
  (`src/components/motion/scroll-reset.tsx`) garante a primeira seção a cada
  troca de rota, sem atropelar âncoras nem o voltar do navegador. Links para
  seção da mesma página usam `ButtonAnchor`/`ArrowAnchor`
  (`src/components/ui/anchor-link.tsx`), com seta para baixo, para não
  parecer que toda seção é uma página nova.


## Estrutura

```
messages/                 pt.json · en.json · es.json  (todo o texto do site)
public/brand/             logotipos oficiais, por idioma e por versão
public/images/acervo/     fotografias oficiais da AIDEP, preparadas por npm run acervo
public/videos/            vídeos oficiais (MP4) e suas capas
public/images/stock/      fotografias de banco (Pexels) — nenhuma gerada por IA
public/documentos/        documentos da Transparência
public/og/                imagens Open Graph compostas a partir da marca
src/
  app/[locale]/           uma pasta por rota do App Router
  components/layout/      header, footer, seletor de idiomas
  components/sections/    blocos de página (hero, projetos, impacto…)
  components/ui/          botões, cartões, molduras, acordeão, estados vazios
  components/motion/      biblioteca de movimento (Reveal, Parallax, Counter…)
  components/forms/       campos, status de envio, formulários
  content/                dados institucionais (fonte da verdade)
  hooks/                  media queries reativas e seguras para SSR
  i18n/                   routing, navegação e configuração do next-intl
  lib/                    design tokens de movimento, marca, SEO, formulários
  fonts/                  Sora (arquivos oficiais)
  proxy.ts                roteamento de idiomas e URLs traduzidas
```

---

## Onde mexer para publicar conteúdo

Notícias, projetos, documentos de transparência e categorias de documento
saem do **painel** (ver acima) — nada disso precisa de código. A tabela
abaixo cobre o restante, mais o conteúdo estático que o site usa enquanto o
painel estiver vazio.

Nada de texto ou dado institucional mora dentro de componentes.

| O que | Arquivo |
| --- | --- |
| Textos da interface e das páginas | `messages/pt.json`, `en.json`, `es.json` |
| Dados institucionais, contato, redes | `src/content/site.ts` |
| Projetos (reserva; o normal é o painel) | `src/content/projects.ts` |
| Números de impacto | `src/content/impact.ts` |
| Parceiros | `src/content/partners.ts` |
| Notícias (reserva; o normal é o painel) | `src/content/news.ts` |
| Documentos de transparência (reserva; o normal é o painel) | `src/content/documents.ts` |
| Fotografias, galerias e posts do Instagram | `src/content/media.ts` |
| Vídeos (título, legenda e lugar) | `src/content/videos.ts` |
| Curadoria do acervo bruto | `scripts/lib/acervo.mjs` |
| Rotas e URLs por idioma | `src/i18n/routing.ts` |
| Itens do menu, seções da Home e página ativa | `src/lib/nav.ts` |
| Tokens do design system | `src/app/globals.css` |
| Curvas, durações e distâncias de animação | `src/lib/motion.ts` |

### Publicar uma fotografia

O caminho normal passa pelo acervo (ver **O acervo da AIDEP**, abaixo):

1. acrescente o arquivo à curadoria em `scripts/lib/acervo.mjs`;
2. rode `npm run acervo` — ele converte, redimensiona, tira os metadados e
   escreve as medidas reais em `src/content/acervo.ts`;
3. em `src/content/media.ts`, aponte a chave para o nome novo, com `alt`
   nos três idiomas.

Para uma foto avulsa que não venha do acervo, basta colocar o arquivo em
`public/images/…` (WebP ou AVIF, quando possível) e escrever o objeto com
`src`, `width`, `height` e `alt` à mão na chave.

Enquanto a chave estiver `null`, `getMedia()` entrega a fotografia de banco
equivalente (ver abaixo). Sem nenhuma das duas, a moldura exibe o painel
institucional construído com o grafismo oficial da marca — na proporção
certa, sem deslocamento de layout e sem imagem inventada.

### Faixas de fundo (banners)

Algumas seções não têm moldura ao lado do texto: a fotografia ocupa a seção
inteira, sangrada, com o conteúdo por cima — o Hero da Home, a faixa de
números, as chamadas de parceria e doação, a abertura de cada página interna
e a capa de cada projeto. Quem cuida disso é
`src/components/ui/section-banner.tsx`.

| Chave | Onde aparece |
| --- | --- |
| `home.hero` | abertura da Página inicial |
| `home.impact.banner` | faixa de números consolidados |
| `home.partnership.banner` | chamada de parceria |
| `home.donate.banner` | chamada de doação (Home, Projetos, Transparência) |
| `page.projects.banner` … `page.donate.banner` | abertura das páginas internas |
| `project.<slug>.cover` | abertura da página do projeto |

Duas regras valem para essas fotos: **largas** (por volta de 21/9, porque
sangram na largura toda) e com **espaço livre à esquerda**, onde entra o
título. Um véu escuro (ou verde, na superfície da marca) é aplicado por cima
para o texto continuar legível sobre qualquer fotografia — sem ele o
contraste dependeria da imagem que estivesse no ar. Sem foto cadastrada, a
seção volta ao fundo sólido da superfície, sem buraco visual.

### O acervo da AIDEP

O acervo entregue pela associação — inaugurações dos polos em Sergipe
(Estância, Poço Verde, Bugio, Boquim, Porto Dantas, Tobias Barreto), a Copa
Coração Valente e as atividades com entrega de lanches e materiais — é a
fotografia e o vídeo que estão no ar hoje nas seções principais.

A pasta bruta tem 14 GB de MOV em 4K e HEIC de celular e **não vai para o
repositório** (está no `.gitignore` da raiz). O que é versionado é o
resultado da curadoria, já preparado para a web:

```bash
npm run acervo                 # prepara tudo
npm run acervo -- --faltantes  # só o que ainda não existe
npm run acervo -- --fotos      # só as fotografias
npm run acervo -- --videos     # só os vídeos
```

| Arquivo | O que é |
| --- | --- |
| `scripts/lib/acervo.mjs` | a curadoria: o que entra, com que nome e em que tamanho — **é aqui que você mexe** |
| `scripts/preparar-acervo.mjs` | converte, redimensiona, tira metadado e gera o registro |
| `src/content/acervo.ts` | medidas e durações reais dos arquivos — **gerado**, não edite |
| `public/images/acervo/` | as fotografias em WebP |
| `public/videos/` | os vídeos em MP4 e as capas em WebP |

Três coisas que o script faz e vale saber:

- **Tira todo o metadado.** O acervo é de celular e carrega GPS, aparelho e
  data. Nada disso vai ao ar: publicar a coordenada da quadra onde as
  crianças treinam não é opção.
- **Baixa a resolução com critério.** Foto de banner sai em 2400 px, de
  moldura e galeria em 1400–2000 px; vídeo sai em 720×1280 (o filme
  institucional) e 540×960 (os clipes), a 30 quadros e com teto de bitrate.
- **Mede o arquivo pronto.** Largura, altura e duração são lidas, nunca
  digitadas — é o que garante que nenhuma moldura erre a proporção.

Precisa de `ffmpeg` e `ffprobe` no PATH (`winget install Gyan.FFmpeg` ·
`brew install ffmpeg`): são eles que decodificam o HEIC do iPhone e
recomprimem o vídeo. A pasta bruta é lida de `../Vídeos e Fotos` — outro
caminho, use `ACERVO_ORIGEM`.

### As fotografias que estão no ar hoje

**Nenhuma imagem deste projeto é gerada por IA.** As chaves principais estão
com fotografia oficial da AIDEP (acima). As que ainda não têm — o
paradesporto, as capas de Futsal na Escola e FutEdu Summit e as notícias de
exemplo — seguem preenchidas por **fotografias de banco do
[Pexels](https://www.pexels.com/api/)** (licença de uso comercial livre),
baixadas para `public/images/stock/` e versionadas junto com o código, cada
uma com o crédito do fotógrafo.

Elas aparecem sempre, sem interruptor e sem variável de ambiente: é assim
que o site pode ser navegado e apresentado com todas as imagens no lugar
antes de a fotografia oficial chegar.

A ponte entre os dois registros é `getMedia(chave)`, em
`src/content/media.ts`:

1. se a chave tiver fotografia oficial cadastrada em `media.ts`, é ela;
2. senão, a fotografia de banco de mesma chave em `media-stock.ts`;
3. sem nenhuma das duas, o painel institucional da marca.

Ou seja: **cadastrar a foto real em `media.ts` já basta** — a de banco sai
de cena sozinha, sem mexer em componente nenhum.

| Arquivo | O que é |
| --- | --- |
| `src/content/media.ts` | registro oficial — **é aqui que você mexe** |
| `src/content/media-stock.ts` | registro das fotos de banco — **gerado**, não edite |
| `scripts/lib/media-plan.mjs` | direção de arte: proporção, termo de busca e texto alternativo de cada chave |
| `public/images/stock/` | os arquivos JPEG e os créditos (`.credits.json`) |

#### Trocar ou rebaixar uma foto de banco

Precisa da chave gratuita do Pexels (sem cartão) em `.env.local`:

```bash
PEXELS_API_KEY=sua-chave
```

```bash
npm run images:stock                              # baixa o que faltar
npm run images:stock -- --list home.hero          # mostra as opções da busca
npm run images:stock -- --force --only home.hero --pick home.hero=4
```

Não gostou de uma foto? `--list` mostra as doze primeiras da busca com o
nome do fotógrafo e o link; `--pick chave=N` fixa outra. A escolha fica
guardada em `public/images/stock/.picks.json` e sobrevive ao `--force`.

> As fotografias de banco não retratam pessoas, projetos ou eventos reais da
> AIDEP e não podem ser apresentadas como registro institucional. Assim que
> a fotografia real for cadastrada em `content/media.ts`, ela passa a valer
> sempre.

### Vídeos

Todo o acervo de vídeo é vertical, gravado no celular de quem estava no
polo. O site segue esse formato em vez de brigar com ele: uma **fileira de
cartões 9/16** que corre na horizontal, com o filme institucional na frente,
maior. Aparece na Home (`#home-videos`) e na página de cada projeto que
tenha vídeo cadastrado.

Como o cartão se comporta:

- **parado**, é uma fotografia — a capa é a única coisa que a página baixa;
- **no mouse**, vira prévia muda e em laço, um vídeo por vez, e nenhum byte
  de vídeo antes do gesto (nada disso em tela de toque ou com
  `prefers-reduced-motion: reduce`);
- **no clique**, abre em tela cheia com som e com os controles nativos do
  navegador.

Para publicar mais um vídeo: acrescente o arquivo à lista `videos` de
`scripts/lib/acervo.mjs`, rode `npm run acervo` e escreva título, legenda e
lugar em `src/content/videos.ts`. `featured: true` marca o filme
institucional — no máximo um por lista.

O filme institucional está em português, com legenda gravada na imagem. É o
que o campo `spokenLocale` declara: quem estiver lendo o site em inglês ou
espanhol vê o aviso de que o vídeo é falado em português.

| Arquivo | O que é |
| --- | --- |
| `src/content/videos.ts` | título, legenda e lugar de cada vídeo — **é aqui que você mexe** |
| `src/components/sections/video-rail.tsx` | a fileira de cartões |
| `src/components/ui/video-player.tsx` | o vídeo em tela cheia |

### Ver o site com notícias e documentos no lugar

A AIDEP ainda não entregou notícias nem documentos. Para que as páginas
possam ser avaliadas preenchidas, o site carrega **por padrão** um
**conteúdo de exemplo**: seis notícias e doze documentos de transparência,
nos três idiomas. Para desligar: `NEXT_PUBLIC_EXAMPLE_CONTENT=0`.

| Arquivo | O que é |
| --- | --- |
| `src/content/news-example.ts` | notícias de demonstração (escritas à mão) |
| `src/content/documents-example.ts` | registro dos documentos — **gerado**, não edite |
| `scripts/lib/example-documents.mjs` | lista e texto dos documentos de exemplo |
| `public/documentos/exemplo/` | os arquivos PDF/CSV, gerados por `npm run docs:example` |

Com o conteúdo de exemplo ligado, dá para avaliar a listagem de notícias, a
página de leitura, as notícias relacionadas, a seção da Home, e na
Transparência os filtros por ano e categoria, a busca, a visualização e o
download — tudo funcionando. Desligado, as listas voltam a ser vazias: a
Home não renderiza a seção de notícias, as duas páginas exibem o estado
vazio institucional e o sitemap não gera URLs de notícia.

> Nada disso é conteúdo da AIDEP. As notícias não relatam fato ocorrido,
> não trazem números de atendimento e não atribuem fala a pessoa real; cada
> documento tem a palavra EXEMPLO marcada na página e um aviso de conteúdo
> fictício. O gate é `NEXT_PUBLIC_EXAMPLE_CONTENT` — ver
> `src/lib/example-content.ts`.

Quando o conteúdo real chegar: escreva as notícias na lista `published` de
`src/content/news.ts` e os documentos na lista `published` de
`src/content/documents.ts`, e apague os arquivos de exemplo.

### Publicar uma notícia

Pelo painel: **`/admin/noticias` → Escrever notícia**. A notícia aparece na
listagem, na Home, no sitemap, nas notícias relacionadas do projeto e ganha
página própria com dados estruturados de artigo.

Pelo código, se for preciso: acrescente um objeto `NewsArticle` na lista
`estaticas` de `src/content/news.ts`. Vale apenas enquanto a tabela
`noticias` estiver vazia — havendo qualquer notícia no painel, é o painel
que manda.

### Publicar um documento de transparência

Pelo painel: **`/admin/documentos` → Enviar documento**. Escolha o PDF e
pronto — o arquivo sobe, a miniatura da primeira página é gerada sozinha e
os filtros, a busca, a visualização embutida e o download já funcionam.

Pelo código, se for preciso: coloque o arquivo em `public/documentos/` e
acrescente um item na lista `publicados` de `src/content/documents.ts`.
Vale apenas enquanto a tabela `documentos` estiver vazia.

### Publicar uma logo de parceiro

Somente logos oficiais fornecidas pela instituição parceira. Em
`src/content/partners.ts`, preencha o campo `logo`. Sem arquivo, o parceiro é
apresentado por uma placa tipográfica com o nome — nunca uma logo recriada.

---

## Identidade

As cores institucionais foram **extraídas dos arquivos oficiais de logotipo**,
não recriadas:

| Cor | Hex | Uso |
| --- | --- | --- |
| Verde AIDEP | `#10963E` | cor principal (internacional e Américas) |
| Preto | `#0A0A0A` / `#000000` | superfícies escuras e texto |
| Branco | `#FFFFFF` | superfícies claras |
| Vermelho · Europa | `#E0342B` | somente comunicação do continente |
| Laranja · África | `#F38D23` | somente comunicação do continente |
| Amarelo · Ásia | `#FFC200` | somente comunicação do continente |
| Azul · Oceania | `#001E58` | somente comunicação do continente |
| Rosa · Antártica | `#DD2F76` | somente comunicação do continente |

Tipografia: **Sora**, a tipografia de apoio definida no manual da marca,
servida localmente a partir dos arquivos oficiais.

Os logotipos em `public/brand/` são os arquivos entregues, sem qualquer
alteração: não foram rotacionados, distorcidos, recortados nem recoloridos.
