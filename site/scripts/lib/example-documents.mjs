/**
 * DOCUMENTOS DE EXEMPLO DA TRANSPARÊNCIA
 * ======================================
 * Fonte única do gerador `gen-example-documents.mjs`, que escreve os
 * arquivos em `public/documentos/exemplo/` e o registro
 * `src/content/documents-example.ts`.
 *
 * ATENÇÃO — nada aqui é documento oficial da AIDEP. São arquivos de
 * demonstração, com conteúdo fictício e a palavra EXEMPLO marcada em cada
 * página, para que a página de Transparência possa ser avaliada com a
 * lista, os filtros, a busca, a visualização e o download funcionando.
 * Só entram na build de pré-visualização (ver `src/lib/preview.ts`).
 *
 * Campos:
 *   id           identificador estável, usado como chave de lista
 *   file         nome do arquivo, sem extensão
 *   format       pdf | csv  (o gerador sabe escrever os dois)
 *   category     reports | institutional | accountability | projects
 *   year         ano de referência do documento
 *   publishedAt  ISO 8601 — data de publicação
 *   projectSlug  quando o documento pertence a um projeto
 *   title        título nos três idiomas (é o que a lista exibe)
 *   summary      linha de abertura impressa no arquivo
 *   body         parágrafos impressos no arquivo (português)
 *   table        opcional — dados fictícios para o arquivo csv
 */

/** Data da última publicação do conjunto de exemplo. */
export const EXAMPLE_LAST_UPDATE = '2026-08-10'

/** Rótulo da categoria impresso no cabeçalho do arquivo. */
export const CATEGORY_LABEL = {
  reports: 'Relatório',
  institutional: 'Documento institucional',
  accountability: 'Prestação de contas',
  projects: 'Documento de projeto',
}

export const EXAMPLE_DOCUMENTS = [
  {
    id: 'relatorio-atividades-2025',
    file: 'relatorio-anual-atividades-2025',
    format: 'pdf',
    category: 'reports',
    year: 2025,
    publishedAt: '2026-03-18',
    title: {
      pt: 'Relatório anual de atividades 2025',
      en: '2025 annual activities report',
      es: 'Informe anual de actividades 2025',
    },
    summary:
      'Panorama das atividades desenvolvidas pela associação ao longo do ano.',
    body: [
      'Este arquivo é um modelo de demonstração. Os números, nomes e datas abaixo são fictícios e servem apenas para mostrar como o relatório aparece na página de Transparência do site.',
      'Apresentação — o relatório anual reúne as atividades esportivas e formativas realizadas no período, a distribuição por território e as parcerias firmadas.',
      'Estrutura prevista para o documento oficial:',
      '1. Apresentação da associação e do período coberto',
      '2. Programas e projetos executados, com público atendido',
      '3. Territórios de atuação e polos esportivos',
      '4. Formação de educadores e material metodológico',
      '5. Parcerias públicas e privadas',
      '6. Quadro de indicadores e metas do ano seguinte',
      'Quando o relatório oficial for entregue pela associação, este arquivo de exemplo deve ser substituído.',
    ],
  },
  {
    id: 'relatorio-atividades-2024',
    file: 'relatorio-anual-atividades-2024',
    format: 'pdf',
    category: 'reports',
    year: 2024,
    publishedAt: '2025-03-25',
    title: {
      pt: 'Relatório anual de atividades 2024',
      en: '2024 annual activities report',
      es: 'Informe anual de actividades 2024',
    },
    summary:
      'Panorama das atividades desenvolvidas pela associação ao longo do ano.',
    body: [
      'Este arquivo é um modelo de demonstração. Os números, nomes e datas abaixo são fictícios e servem apenas para mostrar como o relatório aparece na página de Transparência do site.',
      'O relatório do exercício anterior permanece publicado para permitir a comparação entre períodos — a página mantém o histórico completo, com filtro por ano.',
      'Estrutura prevista para o documento oficial:',
      '1. Apresentação da associação e do período coberto',
      '2. Programas e projetos executados, com público atendido',
      '3. Territórios de atuação e polos esportivos',
      '4. Parcerias públicas e privadas',
      '5. Quadro de indicadores do ano',
    ],
  },
  {
    id: 'estatuto-social',
    file: 'estatuto-social',
    format: 'pdf',
    category: 'institutional',
    year: 2024,
    publishedAt: '2025-01-15',
    title: {
      pt: 'Estatuto social',
      en: 'Articles of association',
      es: 'Estatuto social',
    },
    summary:
      'Documento constitutivo da associação: finalidade, governança e regras de funcionamento.',
    body: [
      'Este arquivo é um modelo de demonstração. O texto abaixo não tem valor legal e não corresponde ao estatuto da AIDEP.',
      'Capítulo I — Da denominação, sede e finalidade. A associação é pessoa jurídica de direito privado, sem fins lucrativos, com atuação no desenvolvimento humano por meio do esporte e do paradesporto.',
      'Capítulo II — Dos associados. Categorias, direitos, deveres e processo de admissão.',
      'Capítulo III — Da administração. Assembleia geral, diretoria executiva e conselho fiscal, com mandatos e atribuições.',
      'Capítulo IV — Do patrimônio e dos recursos. Origem dos recursos, aplicação exclusiva nas finalidades estatutárias e vedação à distribuição de resultados.',
      'Capítulo V — Da prestação de contas. Publicação periódica dos demonstrativos e franqueamento dos documentos a qualquer interessado.',
      'Capítulo VI — Da dissolução e das disposições finais.',
    ],
  },
  {
    id: 'ata-eleicao-diretoria',
    file: 'ata-eleicao-diretoria-2025-2028',
    format: 'pdf',
    category: 'institutional',
    year: 2025,
    publishedAt: '2025-02-10',
    title: {
      pt: 'Ata de eleição da diretoria (2025–2028)',
      en: 'Minutes of the board election (2025–2028)',
      es: 'Acta de elección de la directiva (2025–2028)',
    },
    summary:
      'Registro da assembleia geral que elegeu a diretoria para o quadriênio.',
    body: [
      'Este arquivo é um modelo de demonstração. Nenhum nome, cargo ou deliberação abaixo corresponde a fato real.',
      'Aos [dia] de [mês] de [ano], reuniu-se a assembleia geral ordinária da associação, em primeira convocação, com a presença dos associados em pleno gozo de seus direitos.',
      'Ordem do dia: (i) eleição da diretoria executiva para o quadriênio; (ii) eleição do conselho fiscal; (iii) assuntos gerais.',
      'Deliberações: aprovada por unanimidade a chapa única inscrita, empossada na forma do estatuto social.',
      'A ata oficial, assinada e registrada em cartório, substituirá este arquivo de exemplo.',
    ],
  },
  {
    id: 'certidao-regularidade',
    file: 'certidao-regularidade',
    format: 'pdf',
    category: 'institutional',
    year: 2026,
    publishedAt: '2026-07-02',
    title: {
      pt: 'Certidão de regularidade',
      en: 'Certificate of good standing',
      es: 'Certificado de regularidad',
    },
    summary: 'Comprovação de regularidade cadastral e fiscal da associação.',
    body: [
      'Este arquivo é um modelo de demonstração e não comprova nada. As certidões oficiais são emitidas pelos órgãos competentes e têm prazo de validade próprio.',
      'A página de Transparência foi preparada para receber as certidões conforme forem renovadas: cada emissão entra como um novo documento, com o ano de referência e a data de publicação.',
    ],
  },
  {
    id: 'prestacao-contas-1s-2026',
    file: 'prestacao-de-contas-1o-semestre-2026',
    format: 'pdf',
    category: 'accountability',
    year: 2026,
    publishedAt: '2026-08-10',
    title: {
      pt: 'Prestação de contas — 1º semestre de 2026',
      en: 'Accountability report — first half of 2026',
      es: 'Rendición de cuentas — primer semestre de 2026',
    },
    summary: 'Origem e aplicação dos recursos no período.',
    body: [
      'Este arquivo é um modelo de demonstração. Todos os valores abaixo são fictícios.',
      'Origem dos recursos: doações de pessoas físicas, patrocínios privados, convênios públicos e contribuições de associados.',
      'Aplicação dos recursos: execução dos projetos esportivos, formação de educadores, material esportivo, transporte, alimentação nas atividades e despesas administrativas.',
      'Quadro-resumo do período (valores fictícios):',
      'Receitas do período .......................... R$ 000.000,00',
      'Despesas com projetos ....................... R$ 000.000,00',
      'Despesas administrativas .................... R$ 00.000,00',
      'Saldo transportado para o período seguinte .. R$ 00.000,00',
      'A prestação de contas oficial da AIDEP é preparada mensalmente e será publicada nesta mesma página, com filtro por ano e por categoria.',
    ],
  },
  {
    id: 'prestacao-contas-2s-2025',
    file: 'prestacao-de-contas-2o-semestre-2025',
    format: 'pdf',
    category: 'accountability',
    year: 2025,
    publishedAt: '2026-02-12',
    title: {
      pt: 'Prestação de contas — 2º semestre de 2025',
      en: 'Accountability report — second half of 2025',
      es: 'Rendición de cuentas — segundo semestre de 2025',
    },
    summary: 'Origem e aplicação dos recursos no período.',
    body: [
      'Este arquivo é um modelo de demonstração. Todos os valores abaixo são fictícios.',
      'O documento do semestre anterior permanece publicado: a transparência da associação é cumulativa e o histórico não é removido da página.',
      'Quadro-resumo do período (valores fictícios):',
      'Receitas do período .......................... R$ 000.000,00',
      'Despesas com projetos ....................... R$ 000.000,00',
      'Despesas administrativas .................... R$ 00.000,00',
      'Saldo transportado para o período seguinte .. R$ 00.000,00',
    ],
  },
  {
    id: 'demonstracoes-contabeis-2025',
    file: 'demonstracoes-contabeis-2025',
    format: 'pdf',
    category: 'accountability',
    year: 2025,
    publishedAt: '2026-04-08',
    title: {
      pt: 'Demonstrações contábeis 2025',
      en: '2025 financial statements',
      es: 'Estados contables 2025',
    },
    summary:
      'Balanço patrimonial e demonstração do resultado do exercício, com notas explicativas.',
    body: [
      'Este arquivo é um modelo de demonstração. Nenhum valor abaixo corresponde à contabilidade real da associação.',
      'Peças que compõem o documento oficial: balanço patrimonial, demonstração do resultado do exercício, demonstração das mutações do patrimônio social, demonstração dos fluxos de caixa e notas explicativas.',
      'As demonstrações oficiais são assinadas por profissional de contabilidade habilitado e acompanham o parecer do conselho fiscal.',
    ],
  },
  {
    id: 'planilha-repasses-2026',
    file: 'repasses-por-projeto-2026',
    format: 'csv',
    category: 'accountability',
    year: 2026,
    publishedAt: '2026-08-10',
    title: {
      pt: 'Repasses por projeto — 2026 (planilha)',
      en: 'Transfers by project — 2026 (spreadsheet)',
      es: 'Transferencias por proyecto — 2026 (planilla)',
    },
    summary: 'Planilha aberta com os repasses por projeto e por mês.',
    body: [],
    table: {
      note: 'DOCUMENTO DE EXEMPLO - dados ficticios, nao sao valores reais da AIDEP',
      header: ['mes', 'projeto', 'categoria', 'valor_brl'],
      rows: [
        ['2026-01', 'Projeto Social Coração Valente', 'execução', '0,00'],
        ['2026-01', 'Futsal na Escola', 'execução', '0,00'],
        ['2026-02', 'Projeto Social Coração Valente', 'execução', '0,00'],
        ['2026-02', 'Futsal na Escola', 'material esportivo', '0,00'],
        ['2026-03', 'FutEdu Summit', 'produção', '0,00'],
        ['2026-04', 'Projeto Social Coração Valente', 'formação', '0,00'],
        ['2026-05', 'Futsal na Escola', 'execução', '0,00'],
        ['2026-06', 'FutEdu Summit', 'produção', '0,00'],
      ],
    },
  },
  {
    id: 'relatorio-coracao-valente-2025',
    file: 'relatorio-projeto-coracao-valente-2025',
    format: 'pdf',
    category: 'projects',
    year: 2025,
    publishedAt: '2026-03-18',
    projectSlug: 'coracao-valente',
    title: {
      pt: 'Relatório do projeto Coração Valente 2025',
      en: '2025 report — Coração Valente project',
      es: 'Informe del proyecto Coração Valente 2025',
    },
    summary: 'Execução, público atendido e resultados do projeto no ano.',
    body: [
      'Este arquivo é um modelo de demonstração. Os dados abaixo são fictícios.',
      'O relatório de projeto descreve o que foi executado no ano, onde, com quem e com quais resultados — é o documento que acompanha convênios e patrocínios.',
      'Conteúdo previsto: objetivo do projeto, metodologia aplicada, calendário de atividades, público atendido por faixa de idade, territórios, equipe técnica, parcerias e prestação de contas específica.',
      'Cada projeto publicado no site pode ter seus próprios documentos: na página de Transparência eles aparecem na categoria "Documentos de projetos".',
    ],
  },
  {
    id: 'relatorio-futsal-na-escola-2025',
    file: 'relatorio-projeto-futsal-na-escola-2025',
    format: 'pdf',
    category: 'projects',
    year: 2025,
    publishedAt: '2026-03-18',
    projectSlug: 'futsal-na-escola',
    title: {
      pt: 'Relatório do projeto Futsal na Escola 2025',
      en: '2025 report — Futsal na Escola project',
      es: 'Informe del proyecto Futsal na Escola 2025',
    },
    summary: 'Execução, público atendido e resultados do projeto no ano.',
    body: [
      'Este arquivo é um modelo de demonstração. Os dados abaixo são fictícios.',
      'Conteúdo previsto: escolas atendidas, turmas formadas, carga horária, formação continuada dos professores, material distribuído e avaliação pedagógica do ciclo.',
      'O relatório oficial, quando entregue, substitui este arquivo sem alterar o endereço do documento na página.',
    ],
  },
  {
    id: 'relatorio-futedu-summit-2026',
    file: 'relatorio-futedu-summit-2026',
    format: 'pdf',
    category: 'projects',
    year: 2026,
    publishedAt: '2026-07-30',
    projectSlug: 'futedu-summit',
    title: {
      pt: 'Relatório do FutEdu Summit 2026',
      en: '2026 FutEdu Summit report',
      es: 'Informe del FutEdu Summit 2026',
    },
    summary: 'Programação, participação e desdobramentos do encontro.',
    body: [
      'Este arquivo é um modelo de demonstração. Os dados abaixo são fictícios.',
      'Conteúdo previsto: programação completa, painéis e oficinas, instituições participantes, público presente, materiais produzidos e encaminhamentos acordados ao final do encontro.',
    ],
  },
]
