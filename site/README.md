# AIDEP — site institucional

Site institucional da **Associação Internacional para o Desenvolvimento do
Desporto e Paradesporto (AIDEP)**, em português, inglês e espanhol.

Next.js (App Router) · React · TypeScript · Tailwind CSS v4 · Motion for React ·
GSAP/ScrollTrigger · next-intl · React Hook Form + Zod.

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
| `npm run images:pexels` | baixa fotos de banco para a pré-visualização das molduras |
| `npm run images:preview` | gera por IA as imagens de pré-visualização (sem chave de API) |
| `npm run docs:example` | gera os documentos de exemplo da Transparência (PDF/CSV) |
| `npm run qa:pages <url>` | percorre todas as rotas nos 3 idiomas em 6 larguras e reporta overflow, erros de console, imagens deformadas, links quebrados e problemas de estrutura |
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

---

## Estrutura

```
messages/                 pt.json · en.json · es.json  (todo o texto do site)
public/brand/             logotipos oficiais, por idioma e por versão
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
| Tokens do design system | `src/app/globals.css` |
| Curvas, durações e distâncias de animação | `src/lib/motion.ts` |

### Publicar uma fotografia

1. Coloque o arquivo em `public/images/…` (WebP ou AVIF, quando possível).
2. Em `src/content/media.ts`, troque o `null` da chave por um objeto com
   `src`, `width`, `height` e `alt` nos três idiomas.

Enquanto a chave estiver `null`, a moldura exibe o painel institucional
construído com o grafismo oficial da marca — na proporção certa, sem
deslocamento de layout e sem imagem inventada.

### Ver o site com as imagens no lugar (pré-visualização)

Para avaliar o layout preenchido antes das fotografias oficiais chegarem,
existe um jogo de **imagens de exemplo geradas por IA** e um **interruptor**
no canto inferior direito que alterna entre elas e o painel institucional.

Há dois caminhos para preencher as molduras. A direção de arte das 28 chaves
— proporção, termo de busca, prompt e texto alternativo nos três idiomas —
é a mesma para os dois e mora em `scripts/lib/media-plan.mjs`. Os dois
escrevem `src/content/media-preview.ts`, que **não deve ser editado à mão**.

**1. Fotografia de banco — recomendado.** Fotos reais do
[Pexels](https://www.pexels.com/api/), licença de uso comercial livre.
Precisa de uma chave de API gratuita (sem cartão), em `.env.local`:

```bash
PEXELS_API_KEY=sua-chave
```

```bash
npm run images:pexels                              # baixa o que faltar
npm run images:pexels -- --list home.hero          # mostra as opções da busca
npm run images:pexels -- --force --only home.hero --pick home.hero=4
```

Não gostou de uma foto? `--list` mostra as doze primeiras da busca com o
nome do fotógrafo e o link; `--pick chave=N` fixa outra. A escolha fica
guardada em `public/images/preview/.picks.json` e sobrevive ao `--force`.
O crédito do fotógrafo vai para o campo `credit` de cada imagem.

**2. Geração por IA — sem chave nenhuma.** [Pollinations.ai](https://pollinations.ai),
grátis e sem cadastro, também registrada como MCP em `.mcp.json`
(`pollinations`) para ajustar uma imagem avulsa em conversa com o agente.

```bash
npm run images:preview                             # gera o que faltar
npm run images:preview -- --force --only home.hero
npm run images:preview -- --seed v2                # outra safra
```

O acesso anônimo só entrega o modelo `sana` e é limitado por tempo: as
gerações saem uma a uma, e as 28 levam cerca de doze minutos. Cenas com
muitos rostos em plano médio costumam sair deformadas — funciona bem em
silhueta, contraluz, movimento e plano aberto.

| Onde | Comportamento |
| --- | --- |
| `npm run dev` | interruptor sempre disponível, desligado por padrão |
| build com `NEXT_PUBLIC_PREVIEW_IMAGES=1` | interruptor disponível — use para apresentar ao cliente |
| build pública | interruptor não é renderizado; nenhuma página referencia imagem de exemplo |

Os arquivos em `public/images/preview/` continuam sendo publicados como
estáticos em qualquer build — nada os aponta, mas se quiser que não subam,
apague a pasta antes do deploy.

> As imagens de exemplo não retratam pessoas, projetos ou eventos reais da
> AIDEP e não podem ser publicadas como registro institucional. Assim que a
> fotografia real for cadastrada em `content/media.ts`, ela passa a valer
> sempre — com ou sem o interruptor.

### Ver o site com notícias e documentos no lugar

O mesmo interruptor de build que liga as imagens de exemplo liga o
**conteúdo de exemplo**: seis notícias e doze documentos de transparência,
nos três idiomas.

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
> fictício. **Nenhum dos dois chega à build pública** — o gate é o mesmo das
> imagens (`NEXT_PUBLIC_PREVIEW_IMAGES`, ver `src/lib/preview.ts`).

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
