const defaults = {
  siteContent: {
    seedVersion: "unicooper-site-2026-04-brief",
    homeHeroTitle: "Bem Vindos à Unicooper Cooperativa de Médicos",
    homeHeroText: "O cooperativismo faz surgir nos associados espírito de equipe, compartilhamento de valores e objetivos, criando a necessária união e mobilização dos profissionais da área de saúde. As vantagens podem ser sentidas em vários aspectos, incluindo a remuneração do profissional.",
    homeAboutTitle: "Cooperativismo médico com retorno justo",
    homeAboutText: "A Unicooper fortalece a classe médica por meio da cooperação, da organização dos processos e da valorização do trabalho junto a convênios e operadoras.",
    cooperativeCta: "Quero me cooperar",
    business: "Intermediação e estruturação do trabalho do Médico.",
    whoWeAre: "Em um mercado competitivo e em rápida transformação, a união e o fortalecimento da classe médica são essenciais. A Unicooper nasce desse propósito, reunindo médicos cooperados para ampliar segurança, agilidade e valorização.",
    mission: "Transformar o trabalho do médico em honorários valorizados de forma segura, ágil e transparente.",
    vision: "Ser referência de mercado pelo melhor retorno financeiro aos seus cooperados.",
    values: "Transparência, credibilidade e valorização.",
    institutionalText: "O texto institucional da Unicooper reforça a união da classe médica, o fortalecimento pelo cooperativismo, o compromisso com repasse justo e a valorização dos cooperados junto aos convênios e operadoras.",
    boardTerm: "Diretoria 2026/2029",
    boardMembers: "Dr. Marcus Eduardo Valadares Meireles Martins da Costa — Diretor Presidente\nDr. Gabriel Oliveira Bernardes Gil — Diretor Administrativo\nDr. Paulo Mascarenhas Mendes — Diretor Financeiro",
    memberAreaText: "A área do cooperado reúne orientações para se cooperar, acesso ao portal, cadastro de pessoa jurídica, acompanhamento de repasse, sistema de consultório e documentos oficiais.",
    portalUrl: "https://portalcooperado.unicooper.coop.br/PortalCooperado/",
    clinicSystemUrl: "https://app.unicooper.coop.br/Consultorio",
    howToJoinText: "Acesse a cartilha de adesão para consultar as orientações de como se cooperar.",
    legalEntityText: "Para realizar o cadastro da pessoa jurídica, todos os sócios devem ser médicos cooperados como pessoa física e a PJ não poderá ser optante pelo Simples Nacional.",
    transferTrackingText: "O cooperado acompanha informações sobre repasse médico, lançamentos feitos pela cooperativa e relatórios online.",
    clinicText: "O sistema de consultório permite acesso ao ambiente usado no fluxo de consultórios médicos.",
    documentsText: "Documentos disponíveis: Cartilha de adesão, Autorização de Débito — Unimed Seguros, Carta de Desligamento e Estatuto Social.",
    sacText: "Dúvidas devem ser enviadas para atendimento@unicooper.coop.br, com retorno em até 72 horas úteis.",
    lgpdText: "A Unicooper valoriza a privacidade e a segurança das informações, em conformidade com a LGPD, e disponibiliza canais para titulares exercerem seus direitos ou registrarem denúncias relacionadas ao tratamento de dados pessoais.",
    lgpdRequestUrl: "https://unicooper.coop.br/lgpd/",
    lgpdReportUrl: "https://unicooper.coop.br/lgpd/"
  },
  contact: {
    seedVersion: "unicooper-site-2026-04",
    address: "Rua Ouro Preto 1016, SL 201 - Ed. Trademark, Santo Agostinho - Belo Horizonte - MG",
    phone: "(31) 3291-3200",
    whatsapp: "553132913200",
    email: "atendimento@unicooper.coop.br",
    cnpj: "03.288.517/0001-16",
    hours: "Segunda a quinta-feira: 07:00 às 18:00. Sexta-feira: 07:00 às 17:00. Exceto feriados."
  },
  benefits: [
    { title: "Assessoria jurídica", description: "Assessoria jurídica para o cooperado sem acréscimo na taxa administrativa, com mais segurança nas relações jurídicas e apoio na redução de riscos profissionais." },
    { title: "Plano de saúde - Seguros Unimed", description: "Condições diferenciadas para médicos cooperados, incluindo atendimento no Hospital Mater Dei. Consulte condições." },
    { title: "Greenbel", description: "Parceria em energia solar para promover economia real e benefícios sustentáveis aos cooperados." },
    { title: "Certificado digital", description: "Disponibilização de certificado digital ao cooperado sem acréscimo na taxa administrativa." },
    { title: "Comprometimento", description: "Gestão comprometida com repasse justo e relacionamento próximo com os cooperados." },
    { title: "Segurança", description: "A cooperativa cuida da parte burocrática com convênios após o recebimento da guia pelo cooperado." },
    { title: "Transparência", description: "Portal exclusivo para acompanhar cobranças e guias cobradas com facilidade." },
    { title: "Agilidade", description: "Uso de recursos tecnológicos para executar processos complexos com assertividade e rapidez." }
  ],
  agreements: [
    { name: "Convênios de consultório em Belo Horizonte", category: "Consultórios BH", description: "Convênios que aceitam cobrança de atendimentos em consultórios de Belo Horizonte. Informações sujeitas a alterações diárias.", link: "https://unicooper.coop.br/convenios/", active: true },
    { name: "Convênios faturados - Belo Horizonte / Betim", category: "Faturamento", description: "Relação de convênios faturados pela Unicooper para Belo Horizonte e Betim.", link: "https://unicooper.coop.br/convenios/", active: true },
    { name: "Convênios faturados - Nova Lima", category: "Faturamento", description: "Relação de convênios faturados pela Unicooper para Nova Lima.", link: "https://unicooper.coop.br/convenios/", active: true },
    { name: "Convênios faturados - Salvador", category: "Faturamento", description: "Relação de convênios faturados pela Unicooper para Salvador.", link: "https://unicooper.coop.br/convenios/", active: true },
    { name: "Instrumentação cirúrgica", category: "Procedimentos", description: "Convênios que permitem instrumentação cirúrgica. Para Care Plus, entrar em contato com 48h de antecedência para verificação.", link: "https://unicooper.coop.br/convenios/", active: true },
    { name: "Auditoria in loco", category: "Auditoria", description: "Convênios que necessitam de auditoria in loco em Betim, Salvador e demais unidades.", link: "https://unicooper.coop.br/convenios/", active: true }
  ],
  calendar: [
    { month: "Calendário de Repasse 2026", date: "Consulte a Unicooper", note: "As datas de repasse serão divulgadas conforme o calendário oficial da cooperativa." }
  ]
};

export { defaults };
