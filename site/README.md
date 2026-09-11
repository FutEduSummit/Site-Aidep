# AIDEP — site institucional

Site institucional da **Associação Internacional para o Desenvolvimento do
Desporto e Paradesporto (AIDEP)**, em português, inglês e espanhol.

Next.js (App Router) · React · TypeScript · Tailwind CSS v4 · Motion for React ·
next-intl · React Hook Form + Zod.

---

## Portão de pré-lançamento (desligado)

O site **está aberto ao público**: `gateEnabled` é `false` em
[`src/lib/gate.ts`](src/lib/gate.ts) e todo endereço responde com o conteúdo
real. O `robots.txt` libera a indexação, o `sitemap.xml` sai completo e só
`/admin` continua com `X-Robots-Tag: noindex`.

### Para fechá-lo de novo

Em [`src/lib/gate.ts`](src/lib/gate.ts), troque uma linha:

```ts
export const gateEnabled: boolean = true
```

É a única alteração necessária. Com o portão ligado, qualquer endereço responde
com a página _Site em construção_ e só libera o conteúdo depois da senha
(`123`, chumbada no mesmo arquivo); acertá-la grava o cookie `aidep-preview`
por 30 dias e devolve o visitante à página que ele tentou abrir.

> É uma barreira de cortesia para a fase de aprovação, **não** um mecanismo de
> segurança: quem tem acesso ao código sabe a senha. Não use para proteger
> dados sensíveis.

Quando não houver mais razão para reabri-lo, estes arquivos podem ser apagados
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

### Esqueci a senha

Na tela de entrada, **Esqueceu a senha? → Receba um link por e-mail**. O
cliente informa o endereço, recebe um link do Supabase e escolhe a senha
nova em `/admin/nova-senha` — sem depender de ninguém no terminal.

O caminho, em quatro passos:

```
/admin/recuperar-senha  →  e-mail do Supabase  →  /admin/auth/confirmar  →  /admin/nova-senha
```

Duas coisas precisam estar configuradas no Supabase para o link funcionar:

1. **Authentication → URL Configuration → Redirect URLs.** Acrescente todo
   endereço de onde o painel é usado:

   ```
   https://aidepoficial.com/admin/auth/confirmar
   http://localhost:3000/admin/auth/confirmar
   ```

   Fora dessa lista o Supabase ignora o endereço de volta e joga a pessoa na
   Site URL do projeto: o e-mail chega, o link não leva a lugar nenhum.

2. **Authentication → Emails → SMTP Settings.** O serviço de e-mail que já
   vem no Supabase só entrega para membros da organização do projeto e
   permite poucos envios por hora — serve para testar, não para o cliente.
   Ligue um SMTP próprio (Resend, Brevo, SendGrid, o e-mail do domínio…)
   antes do lançamento.

Detalhes que valem saber:

- O link vale **uma hora** e só pode ser usado **uma vez**.
- Ele precisa ser aberto **no mesmo navegador** que pediu o e-mail: a outra
  metade da chave fica num cookie daquele navegador. Abrindo no celular um
  link pedido no computador, a tela explica o que aconteceu e oferece pedir
  outro. Para liberar qualquer aparelho, troque o modelo de e-mail
  (**Authentication → Emails → Reset Password**) por um que use
  `{{ .TokenHash }}`:

  ```html
  <a href="{{ .SiteURL }}/admin/auth/confirmar?token_hash={{ .TokenHash }}&type=recovery">
    Criar senha nova
  </a>
  ```

  `/admin/auth/confirmar` aceita as duas formas de link — não é preciso
  mexer em código para trocar de uma para a outra.
- Quem perdeu também o acesso ao e-mail continua atendido pelo terminal:
  `npm run admin:criar <email> <senha>` troca a senha e mantém tudo o que a
  pessoa já publicou.

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
`src/content`** — os projetos do briefing e os documentos de exemplo.
Assim que houver uma linha publicada, o banco manda sozinho. Se o Supabase
cair, o site volta ao conteúdo estático em vez de quebrar.

**As notícias são a exceção: elas vêm só do banco.** Não há lista de
reserva no código — notícia que não está na tabela `noticias` não aparece
no site. Tabela vazia ou Supabase fora do ar, a lista fica vazia e a página
exibe o estado vazio institucional.

Publicou, o site atualiza na hora: cada ação do painel chama `updateTag`
sobre a etiqueta de cache do conteúdo.

### Documentos: o que é automático

Ao escolher um PDF, o painel envia o arquivo, **desenha a primeira página no
próprio navegador** e sobe a imagem como miniatura da coluna "Prévia" — o
cliente não precisa recortar nada. Formato e tamanho também são preenchidos
sozinhos. Se o PDF não permitir (protegido, corrompido), ele pode enviar uma
imagem à mão.

Sob o título de cada linha aparece **o ícone do formato**: a arte
colorida do PDF, do CSV e do XLSX, de `public/images/formatos/`, no lugar
da sigla escrita — o `alt` da imagem continua sendo "PDF", "CSV" ou
"XLSX", então quem navega por leitor de tela ouve o formato como antes.
Formato sem arte própria (DOC, imagem) fica no ícone de traço com a sigla
ao lado; o registro das artes está em
`src/components/ui/document-format.tsx`.

**A coluna "Prévia" não fica vazia mesmo sem essa miniatura.** Se o
documento não tem miniatura guardada — semeado direto no banco, servido de
`/public`, geração falhada — ou se a miniatura guardada não carrega, a
própria página desenha a primeira página do PDF no navegador de quem
visita, sob demanda, à medida que a linha se aproxima da tela (ver
`src/lib/previa-pdf.ts` e `src/components/ui/document-preview.tsx`).
Planilha não tem página, e por isso é desenhada como folha de grade a
partir do próprio arquivo — `.csv` lido como texto e `.xlsx`
descompactado no navegador (ver `src/lib/previa-planilha.ts` e
`src/lib/leitor-xlsx.ts`). Documento de texto (`.doc`, `.docx`) não tem
nem página nem grade: fica o ícone do formato.

Na página pública, clicar no título ou na prévia **abre o documento dentro
da própria página**, sem tirar o visitante do site: PDF e imagem num
quadro, planilha como tabela de verdade — cabeçalho preso no topo, coluna
de valor alinhada à direita, com as datas e os reais escritos como a
planilha manda escrever (ver `src/components/ui/spreadsheet-view.tsx`).
O que só abre em programa instalado (`.doc`, `.docx`, `.xls` antigo) diz
isso na janela e oferece o download.

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
| `npm run acervo` | prepara o acervo oficial (fotos, vídeos e as aberturas de drone) para a web — precisa de ffmpeg |
| `npm run mundo:dados` | refaz a máscara de terra firme do globo (`src/content/mundo.ts`) a partir do Natural Earth |
| `npm run projetos:publicar` | leva os projetos de `src/content/projects.ts` para a tabela `projetos` — é o que faz o mapa da Home mostrar as cidades certas |
| `npm run conteudo:publicar` | leva as notícias e os documentos reais de `src/content` para o banco e despublica o conteúdo de demonstração |
| `npm run images:stock` | baixa do Pexels as fotos de banco que preenchem as molduras |
| `npm run docs:example` | gera os documentos de exemplo da Transparência (PDF/CSV) |
| `npm run qa:pages <url>` | percorre todas as rotas nos 3 idiomas em 6 larguras e reporta overflow, erros de console, imagens deformadas ou invisíveis, links quebrados e problemas de estrutura |
| `npm run qa:motion <url>` | audita o site com `prefers-reduced-motion: reduce` |
| `npm run qa:interactions <url>` | testa menu mobile, troca de idioma e skip link |
| `npm run qa:shots <url> <pasta>` | captura telas para revisão visual |

Os scripts de QA usam `puppeteer-core` com o Chrome instalado na máquina
(`CHROME_PATH` sobrescreve o caminho).

---

## Variáveis de ambiente

| Variável | Efeito |
| --- | --- |
| `NEXT_PUBLIC_SITE_URL` | URL pública, usada em canonical, hreflang, sitemap e Open Graph. Padrão: `https://aidepoficial.com` |
| `NEXT_PUBLIC_EXAMPLE_CONTENT` | `0` desliga os documentos de exemplo da Transparência. Ligado por padrão. Não afeta as notícias, que vêm só do banco. |
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
| `#publico-atendido` | público atendido — um cartão por público, em trilho horizontal |
| `#impacto` | números consolidados e resultados por projeto |
| `#contato` | canais de contato da associação, no fim da página |

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
public/images/formatos/   ícones de formato de arquivo (PDF, CSV, XLSX) da tabela de Transparência
public/documentos/        documentos da Transparência
public/documentos/reais/  documentos oficiais versionados (Transferegov)
public/og/                imagens Open Graph compostas a partir da marca
src/
  app/[locale]/           uma pasta por rota do App Router
  components/layout/      header, footer, seletor de idiomas
  components/sections/    blocos de página (hero, projetos, impacto…)
  components/ui/          botões, cartões, molduras, acordeão, estados vazios
  components/motion/      biblioteca de movimento (Reveal, Parallax, Counter…)
  components/forms/       campos de formulário reaproveitados nos filtros
  content/                dados institucionais (fonte da verdade)
  content/mundo.ts        máscara de terra firme do globo (gerada)
  hooks/                  media queries reativas e seguras para SSR
  i18n/                   routing, navegação e configuração do next-intl
  lib/                    design tokens de movimento, marca, SEO
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
| Notícias (leitura do banco; escreve-se pelo painel) | `src/content/news.ts` |
| Documentos de transparência (reserva; o normal é o painel) | `src/content/documents.ts` |
| Fotografias, galerias e posts do Instagram | `src/content/media.ts` |
| Vídeos (título, legenda e lugar) | `src/content/videos.ts` |
| Curadoria do acervo bruto (fotos, vídeos e aberturas) | `scripts/lib/acervo.mjs` |
| Notícias dos projetos (as nove reais) | `src/content/news-real.ts` |
| Documentos oficiais de transparência | `src/content/documents-real.ts` |
| Cena do globo da Home (geometria e movimento) | `src/lib/globo.ts` |
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
`public/images/…` (AVIF, de preferência — é o formato do acervo) e escrever
o objeto com `src`, `width`, `height` e `alt` à mão na chave.

Enquanto a chave estiver `null`, `getMedia()` entrega a fotografia de banco
equivalente (ver abaixo). Sem nenhuma das duas, a moldura exibe o painel
institucional construído com o grafismo oficial da marca — na proporção
certa, sem deslocamento de layout e sem imagem inventada.

### Faixas de fundo (banners)

Algumas seções não têm moldura ao lado do texto: a fotografia ocupa a seção
inteira, sangrada, com o conteúdo por cima — o Hero da Home, a faixa de
números, as chamadas de parceria e doação, a abertura de cada página interna
e a capa de cada projeto. Quem cuida disso é
`src/components/ui/section-banner.tsx` — e, na abertura da Home, o
carrossel descrito adiante.

| Chave | Onde aparece |
| --- | --- |
| `home.hero` | abertura da Página inicial (primeiro quadro do carrossel) |
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

O véu e o degradê moram em `src/lib/banner-veil.ts`, um único lugar para as
duas peças que exibem faixa: a de fotografia única e o carrossel abaixo.

### O carrossel da abertura

A Página inicial não tem uma foto de abertura, tem um álbum — e, desde a
última entrega, o álbum tem **vídeo dentro**. As fotografias passam em
travessia cruzada atrás do título, cada uma no ar por 6,5 s, e as três
tomadas de drone do FutEdu Summit entram no meio delas, mudas e em laço,
pelo tempo da própria tomada. Quem desenha é
`src/components/ui/banner-carousel.tsx`; o álbum é `carrosselDaHome`, em
`src/content/media.ts` — para trocar as peças, mexa só nessa lista, na
ordem em que elas devem passar.

Valem as mesmas duas regras das faixas de fundo (larga, com espaço livre à
esquerda), e mais três cuidados:

- **a primeira foto é a da abertura** — é a única que carrega com
  prioridade, e o segundo quadro só entra no ar depois que ela termina,
  para não dividir banda com o maior download da página;
- **o rodízio para** quando o sistema pede menos movimento
  (`prefers-reduced-motion`) e quando a aba sai de vista — a foto fica
  parada, e os indicadores continuam passando à mão;
- **foto em pé não entra** — sangrada na largura toda, sobraria dela só uma
  tira do meio.

#### O vídeo da abertura

De todo o acervo entregue, **só as filmagens de drone do FutEdu Summit são
horizontais**: o resto chega em 1920×1080 mas com `rotation: -90` no
metadado, ou seja, retrato. Vídeo em pé não serve para uma faixa sangrada
na largura da tela.

As três entram pela lista `aberturas`, em `scripts/lib/acervo.mjs`, e são
publicadas em 1920×1080, **sem faixa de áudio** e cortadas no trecho que se
sustenta em laço. Cada uma vira um `MediaAsset` comum com um campo `video`
pendurado (`daAbertura()`, em `content/media.ts`):

- a **fotografia continua sendo o dado principal** — é a capa em 2560 px,
  tirada do arquivo original e não do mp4 comprimido, e é ela o LCP da
  página;
- o **vídeo entra por cima** quando o primeiro quadro chega, e só enquanto
  o quadro dele está no ar: um `<video>` por vez, nenhum byte antes da hora;
- **com movimento reduzido, o vídeo não é montado** — fica a capa, parada;
- se o vídeo falhar, o elemento se apaga e a capa segue no lugar dele.

Para trocar: mexa em `aberturas`, rode `npm run acervo` e aponte a chave
nova em `carrosselDaHome`.

Os indicadores ficam no rodapé da abertura, ao lado da chamada de rolagem,
no traço inclinado do símbolo. O quadro no ar é marcado pela cor e pela
largura do traço — nunca só pela cor.

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
| `public/images/acervo/` | as fotografias em AVIF |
| `public/videos/` | os vídeos em MP4 e as capas em AVIF |
| `src/lib/image-quality.ts` | a qualidade com que o `next/image` **entrega** essas fotografias |

Quatro coisas que o script faz e vale saber:

- **Grava em AVIF, com croma completo.** O WebP guarda cor em 4:2:0 — um
  valor de cor para cada quadrado de dois por dois pixels, sem opção —, e
  era o que borrava o verde da marca contra o branco do uniforme. O AVIF
  aceita 4:4:4: cor por pixel. Sai em `quality: 78`, o mesmo peso que o
  WebP 88 anterior tinha, carregando mais informação. O HEIC do iPhone
  passa por um PNG temporário no caminho, e não mais por um JPEG: nenhuma
  compressão com perda antes da que vale.
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

**O arquivo em `public/` não é o arquivo que o visitante baixa.** Toda
fotografia passa pelo `next/image`, que a recomprime no servidor na largura
que a tela pediu — o que está em `public/images/acervo/` é o negativo, e é
por isso que ele é gravado com mais qualidade do que a entrega precisa. Essa
segunda passagem tem número próprio, em `src/lib/image-quality.ts`, e ele
precisa estar em `images.qualities` no `next.config.ts` — o otimizador
responde 400 a qualquer valor fora daquela lista.

### As fotografias que estão no ar hoje

**Nenhuma imagem deste projeto é gerada por IA.** As chaves principais estão
com fotografia oficial da AIDEP (acima), e **as nove notícias dos projetos
também** — cada uma abre com a fotografia do assunto no lugar onde ele
aconteceu (ver `capaDeNoticia()` em `content/media.ts`). O que ainda não
tem foto própria — o paradesporto, e as chaves de notícia criadas pelo
painel — segue preenchido por **fotografias de banco do
[Pexels](https://www.pexels.com/api/)** (licença de uso comercial livre),
baixadas para `public/images/stock/` e versionadas junto com o código, cada
uma com o crédito do fotógrafo.

**Os três projetos têm hoje o álbum do próprio projeto**, fotografado onde
ele acontece: o Coração Valente nos polos de Sergipe, o FutEdu Summit em
Curitiba (o pórtico de entrada, as delegações, a formação, a cerimônia dos
certificados e o torneio) e o Futsal na Escola na quadra coberta. Cada um
entra em `galerias`, em `src/content/media.ts`, pelo slug do projeto.

Foi o que dispensou o arranjo anterior: enquanto esses dois não tinham foto
própria, eram ilustrados pelo acervo institucional da associação, com o
crédito **Acervo AIDEP** e legenda que não atribuía a cena ao projeto. Com a
fotografia real no ar, aquelas entradas saíram — e com elas o helper
`doAcervoInstitucional`. Se o caso voltar a aparecer, o padrão está no
histórico do arquivo.

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
cartões 9/16 de medida única** que corre na horizontal, com o filme
institucional na frente. Aparece na Home (`#home-videos`) e na página de
cada projeto que tenha vídeo cadastrado.

Todos os cartões têm a mesma largura: o filme se destaca pela tarja
**Filme** e pela posição, não pelo tamanho — cartão maior no meio da
fileira quebrava o ritmo da rolagem e desalinhava as legendas.

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

### Ver o site com documentos no lugar

A AIDEP ainda não entregou os documentos de transparência. Para que a página
possa ser avaliada preenchida, o site carrega **por padrão** um **conteúdo de
exemplo**: doze documentos, nos três idiomas. Para desligar:
`NEXT_PUBLIC_EXAMPLE_CONTENT=0`.

| Arquivo | O que é |
| --- | --- |
| `src/content/documents-example.ts` | registro dos documentos — **gerado**, não edite |
| `scripts/lib/example-documents.mjs` | lista e texto dos documentos de exemplo |
| `public/documentos/exemplo/` | os arquivos PDF/CSV, gerados por `npm run docs:example` |
| `src/content/news-example.ts` | notícias de demonstração — **não vão mais ao ar**; só `npm run conteudo:semear` as usa, e elas então passam a existir no banco |

Com o conteúdo de exemplo ligado, dá para avaliar na Transparência os
filtros por ano e categoria, a busca, a prévia da primeira página, a
visualização e o download — tudo funcionando. Desligado, a lista volta a ser
vazia e a página exibe o estado vazio institucional.

**As notícias não passam por esse gate.** A página de Notícias mostra
exclusivamente o que está publicado na tabela `noticias`; sem nenhuma
linha lá, a Home não renderiza a seção, a página exibe o estado vazio
institucional e o sitemap não gera URLs de notícia. Para avaliar a listagem
preenchida, semeie o banco com `npm run conteudo:semear`.

> Nada disso é conteúdo da AIDEP. As notícias de demonstração não relatam
> fato ocorrido, não trazem números de atendimento e não atribuem fala a
> pessoa real; cada documento tem a palavra EXEMPLO marcada na página e um
> aviso de conteúdo fictício. O gate dos documentos é
> `NEXT_PUBLIC_EXAMPLE_CONTENT` — ver `src/lib/example-content.ts`.

Quando o conteúdo real chegar: publique as notícias pelo painel
(`/admin/noticias`) e os documentos por `/admin/documentos`, ou escreva os
documentos na lista `publicados` de `src/content/documents.ts`, e apague os
arquivos de exemplo.

### Publicar uma notícia

Pelo painel: **`/admin/noticias` → Escrever notícia**. A notícia aparece na
listagem, na Home, no sitemap, nas notícias relacionadas do projeto e ganha
página própria com dados estruturados de artigo.

**Só pelo painel.** Notícia não se escreve mais no código: `content/news.ts`
apenas lê a tabela `noticias`, e o que não está lá não aparece no site.

As **nove notícias que estão no ar hoje** — três por projeto — foram
escritas em `src/content/news-real.ts` e levadas ao banco por
`npm run conteudo:publicar`. Elas ficam no código para poder ser revisadas
como texto (e para o dia em que o banco precisar ser refeito do zero); a
partir do momento em que estão na tabela, quem manda é o painel.

Números, cidades e datas saem do briefing e do próprio acervo — as datas
são as dos arquivos de vídeo de cada evento. Não há fala atribuída a
ninguém nem nome próprio de pessoa. **Antes do lançamento, a associação
deve revisar cada nota**: quem estava lá sabe coisas que o acervo não conta.

### Publicar um documento de transparência

Pelo painel: **`/admin/documentos` → Enviar documento**. Escolha o PDF e
pronto — o arquivo sobe, a miniatura da primeira página é gerada sozinha e
os filtros, a busca, a visualização embutida e o download já funcionam.

Pelo código, se for preciso: coloque o arquivo em `public/documentos/` e
acrescente um item na lista `publicados` de `src/content/documents.ts`.
Vale apenas enquanto a tabela `documentos` estiver vazia.

#### Os documentos que estão no ar hoje

Dois, e os dois são reais: o **painel do Transferegov** (o registro público
das transferências federais) e a **planilha dos instrumentos assinados**.
Juntos mostram os quatro termos de fomento da AIDEP com o Ministério do
Esporte — R$ 6.271.999,96 em valor global, o mesmo já liberado e
R$ 1,12 milhão em conta. Estão em `src/content/documents-real.ts`, com os
arquivos versionados em `public/documentos/reais/`.

Os **doze documentos de demonstração** que ocupavam a página foram
**despublicados**, não apagados: continuam na tabela com `publicado = false`
e voltam pelo painel com um clique. A razão de não deixá-los convivendo é
específica desta página — prestação de contas real ao lado de prestação de
contas inventada é a única combinação que não se pode publicar, mesmo com a
segunda carimbada com a palavra EXEMPLO.

Para levar tudo ao banco de novo: `npm run conteudo:publicar`
(`-- --manter-exemplos` pula a despublicação).

### Publicar uma logo de parceiro

Somente logos oficiais fornecidas pela instituição parceira. Em
`src/content/partners.ts`, preencha o campo `logo`. Sem arquivo, o parceiro é
apresentado por uma placa tipográfica com o nome — nunca uma logo recriada.

---

## O mapa da Página inicial

A Home abre um **globo terrestre em WebGL** com todas as cidades atendidas
pelos três projetos, reunidas por cidade. Ele fica na seção `#atuacao`
(`components/sections/reach-section.tsx`).

### As peças

| Arquivo | Papel |
| --- | --- |
| `sections/reach-section.tsx` | roda no servidor: resolve as cidades em latitude e longitude e monta o mapa plano de reserva |
| `sections/reach-map.tsx` | o painel: filtros por projeto, lista de cidades e a ficha da cidade escolhida |
| `ui/globe.tsx` | o `<canvas>`, a etiqueta que segue o marcador e a decisão de quando carregar a cena |
| `lib/globo.ts` | a cena three.js — esfera, malha de pontos, contorno do Brasil, marcadores e o laço de animação |
| `content/mundo.ts` | um bit por meio grau dizendo onde é terra firme (gerado por `npm run mundo:dados`) |

### O que vale saber

- **O `three` não entra no pacote da Home.** São 550 kB, importados sob
  demanda dentro do efeito e só quando a seção chega a 400 px da tela.
  Quem nunca rola até lá nunca baixa nada disso.
- **Sem WebGL, aparece o mapa plano do Brasil** — o mesmo das páginas de
  projeto, montado no servidor. É também o que sai no HTML para quem está
  com script bloqueado, e o que preenche a moldura enquanto a cena carrega.
- **A lista ao lado é a versão acessível do mapa**, e não um resumo dele:
  as duas leem o mesmo dado. Dá para percorrer a atuação inteira com Tab.
- **O contorno do Brasil não é um arquivo novo.** É o mesmo desenho do mapa
  plano (`content/mapa-brasil.ts`), desprojetado de volta para latitude e
  longitude por `lib/projecao.ts`.

### Uma cidade com mais de um polo

Aracaju tem cinco polos do Coração Valente e Nossa Senhora do Socorro tem
três. Isso é o campo `polos` de cada local — em `content/projects.ts` e no
campo "Polos na cidade" do painel. O mapa desenha **um marcador por
cidade** e diz o número na ficha; repetir a cidade cinco vezes empilharia
cinco marcadores no mesmo pixel.

### Depois de mexer nas cidades

O site lê os projetos do banco assim que a tabela `projetos` tem linha.
Editar `src/content/projects.ts` e recarregar a página **não muda nada** —
é preciso levar a alteração para lá:

```bash
npm run projetos:publicar
```

(ou o botão "Importar conteúdo do site" em `/admin/projetos`, que faz o
mesmo. Os dois **sobrescrevem** o que estiver no painel para os mesmos
slugs.)

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

### A barra de rolagem

A barra da página também é da marca: polegar no verde AIDEP e trilho no
cinza da papelaria (`#F6F6F6`), em `src/app/globals.css`. Vale só para a
barra da página — as áreas que rolam por dentro (tabelas largas, trilhos de
vídeo, painéis) ficam com a barra do sistema, que se adapta sozinha ao fundo
claro ou escuro de cada uma.

Duas decisões que parecem detalhe e não são:

- **a largura é a do sistema.** Em barra fina o verde vira um fio de 10px
  que quase não se lê, e o alvo de arrasto encolhe junto;
- **o espaço da barra fica reservado** (`scrollbar-gutter: stable`). Sem
  isso, tudo o que tranca a rolagem — o menu do celular, a janela de
  documento, a foto em tela cheia — some com a barra e desloca a página
  inteira alguns pixels para o lado no instante em que abre.
