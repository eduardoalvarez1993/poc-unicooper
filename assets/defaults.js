const defaults = {
  siteContent: {
    seedVersion: "unicooper-site-2026-04-gaps",
    homeHeroTitle: "Bem Vindos à Unicooper Cooperativa de Médicos",
    homeHeroText: "O cooperativismo faz surgir nos associados espírito de equipe, compartilhamento de valores e objetivos, criando a necessária união e mobilização dos profissionais da área de saúde. As vantagens podem ser sentidas em vários aspectos, incluindo a remuneração do profissional.",
    homeHeroImage: "",
    institutionalHeroImage: "",
    benefitsHeroImage: "",
    agreementsHeroImage: "",
    memberAreaHeroImage: "",
    calendarHeroImage: "",
    contactHeroImage: "",
    lgpdHeroImage: "",
    homeAboutTitle: "Cooperativismo médico com retorno justo",
    homeAboutText: "A Unicooper fortalece a classe médica por meio da cooperação, da organização dos processos e da valorização do trabalho junto a convênios e operadoras.",
    cooperativeCta: "Quero me cooperar",
    business: "Intermediação e estruturação do trabalho do Médico.",
    whoWeAre: "Em um mercado competitivo e em rápida transformação, a união e o fortalecimento da classe médica são essenciais. A Unicooper nasce desse propósito, reunindo médicos cooperados para ampliar segurança, agilidade e valorização.",
    mission: "Transformar o trabalho do médico em honorários valorizados de forma segura, ágil e transparente.",
    vision: "Ser referência de mercado pelo melhor retorno financeiro aos seus cooperados.",
    values: "Transparência, credibilidade e valorização.",
    institutionalText: "Unimos médicos cooperados em uma estrutura organizada, transparente e comprometida com a valorização do trabalho médico junto a convênios e operadoras.",
    boardTerm: "Diretoria 2026/2029",
    boardMembers: "Dr. Marcus Eduardo Valadares Meireles Martins da Costa — Diretor Presidente\nDr. Gabriel Oliveira Bernardes Gil — Diretor Administrativo\nDr. Paulo Mascarenhas Mendes — Diretor Financeiro",
    memberAreaText: "Encontre orientações para adesão, acesso ao portal, cadastro de pessoa jurídica, acompanhamento de repasse, sistema de consultório e documentos oficiais.",
    portalUrl: "https://portalcooperado.unicooper.coop.br/PortalCooperado/",
    clinicSystemUrl: "https://app.unicooper.coop.br/Consultorio",
    howToJoinText: "Consulte as orientações para se cooperar e fale com a equipe da Unicooper para iniciar seu processo de adesão.",
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
    { name: "Consultórios Belo Horizonte", section: "Convênios que aceitam cobrança de atendimentos em consultórios", category: "Consultórios", city: "Belo Horizonte", unit: "Consultório médico", allowsInstrumentation: false, requiresOnsiteAudit: false, imageUrl: "", description: "Atendimentos em consultórios com cobrança orientada pela Unicooper.", rules: "Confirme autorização, elegibilidade e regras de retorno antes do atendimento.", link: "https://unicooper.coop.br/convenios/", active: true },
    { name: "Belo Horizonte / Betim", section: "Convênios faturados pela Unicooper - Belo Horizonte / Betim", category: "Faturamento", city: "Belo Horizonte e Betim", unit: "Unidades conveniadas", allowsInstrumentation: false, requiresOnsiteAudit: false, imageUrl: "", description: "Convênios faturados pela Unicooper nas unidades de Belo Horizonte e Betim.", rules: "Acompanhe regras de autorização, retorno e auditoria conforme cada operadora.", link: "https://unicooper.coop.br/convenios/", active: true },
    { name: "Nova Lima", section: "Convênios faturados pela Unicooper - Nova Lima", category: "Faturamento", city: "Nova Lima", unit: "Unidades conveniadas", allowsInstrumentation: false, requiresOnsiteAudit: false, imageUrl: "", description: "Convênios faturados pela Unicooper na unidade de Nova Lima.", rules: "Verifique previamente regras operacionais e documentação necessária.", link: "https://unicooper.coop.br/convenios/", active: true },
    { name: "Salvador", section: "Convênios faturados pela Unicooper - Salvador", category: "Faturamento", city: "Salvador", unit: "Unidades conveniadas", allowsInstrumentation: false, requiresOnsiteAudit: false, imageUrl: "", description: "Convênios faturados pela Unicooper na unidade de Salvador.", rules: "Consulte particularidades de autorização e auditoria por unidade.", link: "https://unicooper.coop.br/convenios/", active: true },
    { name: "Procedimentos com instrumentação cirúrgica", section: "Convênios que permitem instrumentação cirúrgica", category: "Procedimentos", city: "Conforme operadora", unit: "Centro cirúrgico", allowsInstrumentation: true, requiresOnsiteAudit: false, imageUrl: "", description: "Orientação para convênios que permitem cobrança de instrumentação cirúrgica.", rules: "Algumas operadoras exigem verificação prévia com antecedência mínima.", link: "https://unicooper.coop.br/convenios/", active: true },
    { name: "Atendimentos com auditoria in loco", section: "Convênios que necessitam de auditoria in loco", category: "Auditoria", city: "Betim, Salvador e demais unidades", unit: "Unidades com auditoria", allowsInstrumentation: false, requiresOnsiteAudit: true, imageUrl: "", description: "Orientação para convênios que necessitam de auditoria presencial antes da finalização do fluxo.", rules: "Observe prazos e exigências de cada unidade antes do envio.", link: "https://unicooper.coop.br/convenios/", active: true }
  ],
  calendar: [
    { date: "06/01/2026", type: "repasse", label: "Repasse médico" },
    { date: "30/01/2026", type: "devolucao", label: "Devolução de INSS" },
    { date: "06/02/2026", type: "repasse", label: "Repasse médico" },
    { date: "27/02/2026", type: "devolucao", label: "Devolução de INSS" },
    { date: "06/03/2026", type: "repasse", label: "Repasse médico" }
  ]
};

export { defaults };
