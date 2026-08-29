# AIDEP — site institucional

Site institucional da **Associação Internacional para o Desenvolvimento do
Desporto e Paradesporto (AIDEP)**, em português, inglês e espanhol.

Next.js (App Router) · React · TypeScript · Tailwind CSS v4 · Motion for React ·
next-intl · React Hook Form + Zod.

---

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

Nada de texto ou dado institucional mora dentro de componentes.

| O que | Arquivo |
| --- | --- |
| Textos da interface e das páginas | `messages/pt.json`, `en.json`, `es.json` |
| Dados institucionais, contato, redes | `src/content/site.ts` |
| Projetos | `src/content/projects.ts` |
| Números de impacto | `src/content/impact.ts` |
| Parceiros | `src/content/partners.ts` |
| Notícias | `src/content/news.ts` |
| Documentos de transparência | `src/content/documents.ts` |
| Fotografias e posts do Instagram | `src/content/media.ts` |
| Rotas e URLs por idioma | `src/i18n/routing.ts` |
| Itens do menu, seções da Home e página ativa | `src/lib/nav.ts` |
| Tokens do design system | `src/app/globals.css` |
| Curvas, durações e distâncias de animação | `src/lib/motion.ts` |

### Publicar uma fotografia

1. Coloque o arquivo em `public/images/…` (WebP ou AVIF, quando possível).
2. Em `src/content/media.ts`, troque o `null` da chave por um objeto com
   `src`, `width`, `height` e `alt` nos três idiomas.

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

### As fotografias que estão no ar hoje

**Nenhuma imagem deste projeto é gerada por IA.** O que preenche as molduras
são **fotografias de banco do [Pexels](https://www.pexels.com/api/)**
(licença de uso comercial livre), baixadas para `public/images/stock/` e
versionadas junto com o código, cada uma com o crédito do fotógrafo.

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

Acrescente um objeto `NewsArticle` na lista `published` de
`src/content/news.ts`. A partir daí a
notícia aparece na listagem, na Home, no sitemap, nas notícias relacionadas do
projeto e ganha página própria com dados estruturados de artigo.

### Publicar um documento de transparência

Coloque o PDF em `public/documentos/` e acrescente um item na lista
`published` de `src/content/documents.ts`, junto com a data em
`publishedAt`. Os filtros por ano e categoria, a busca, a visualização e o
download já funcionam.

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
