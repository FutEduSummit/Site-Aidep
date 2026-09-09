# Logomarcas de parceiros

Arquivos usados por `src/content/partners.ts`. Todos são PNG com fundo
transparente, exportados com dimensão máxima de 512 px — o suficiente para os
tamanhos de exibição (faixa de parceiros, lista da página `/parceiros` e bloco
de parceiros do projeto) mesmo em telas retina.

PNG, e não SVG, porque o `next/image` só otimiza SVG com
`images.dangerouslyAllowSVG`, e essa opção valeria também para as imagens
enviadas pelo painel — risco desnecessário para ganhar nitidez que nesses
tamanhos não aparece.

## Procedência

| Arquivo | Origem | Licença / observação |
| --- | --- | --- |
| `caixa.png` | [Commons — Caixa Econômica Federal logo 1997.svg](https://commons.wikimedia.org/wiki/File:Caixa_Econ%C3%B4mica_Federal_logo_1997.svg) | Domínio público (marca oficial em uso desde 1997) |
| `honda.png` | [Commons — Honda logo.svg](https://commons.wikimedia.org/wiki/File:Honda_logo.svg) | Domínio público (logotipo institucional Honda) |
| `governo-federal.png` | [Commons — Brazilian government logo (2025).svg](https://commons.wikimedia.org/wiki/File:Brazilian_government_logo_(2025).svg) | Domínio público (assinatura do Governo do Brasil, gestão 2023–2027) |
| `curitiba.png` | [Manual de marca da Prefeitura de Curitiba](https://comunicacao.curitiba.pr.gov.br/conteudo/manual-de-identidade-visual/1219) — pacote `Logo PMC 2025.zip`, arquivo `PNG/5_PMC_cor_horizontal.png` | Arquivo oficial da Prefeitura (identidade visual 2025–2028), recortado e redimensionado |

## Como substituir por um arquivo oficial

1. Coloque o novo arquivo nesta pasta com o mesmo nome (`<id-do-parceiro>.png`).
2. Atualize `width`/`height` em `src/content/partners.ts` — o `next/image`
   precisa das dimensões reais para reservar o espaço e evitar salto de layout.
3. Recorte as margens transparentes antes de exportar: o componente
   `PartnerLogo` encaixa a arte numa caixa de altura fixa, e sobra de margem
   no arquivo faz a logo aparecer menor que as vizinhas.

Nenhuma dessas logos foi redesenhada — todas vêm do arquivo oficial da
instituição ou de reprodução em domínio público. Ao receber os arquivos
diretamente dos parceiros, prefira sempre os deles.
