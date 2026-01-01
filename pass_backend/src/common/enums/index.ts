export enum VehicleStatus {
  LIBERADO = 'LIBERADO',
  EM_MANUTENCAO = 'EM_MANUTENCAO',
  INDISPONIVEL = 'INDISPONIVEL',
  VENDIDO = 'VENDIDO',
}

export enum FuelType {
  DIESEL = 'DIESEL',
  DIESEL_S10 = 'DIESEL_S10',
  GASOLINA = 'GASOLINA',
  ETANOL = 'ETANOL',
  ARLA32 = 'ARLA32',
}

export enum VehicleCategory {
  ONIBUS = 'ONIBUS',
  VAN = 'VAN',
  CARRO = 'CARRO',
  CAMINHAO = 'CAMINHAO',
}

export enum VehicleClassification {
  PREMIUM = 'PREMIUM',
  BASIC = 'BASIC',
  EXECUTIVO = 'EXECUTIVO',
}

export enum SeverityLevel {
  BAIXA = 'BAIXA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  GRAVE = 'GRAVE',
}

export enum HelpdeskCategory {
  BUG = 'BUG',
  AGENDAMENTO = 'AGENDAMENTO',
  TREINAMENTO = 'TREINAMENTO',
  PERFORMANCE = 'PERFORMANCE',
  AJUSTE_MELHORIA = 'AJUSTE_MELHORIA',
  OUTRO = 'OUTRO',
}

export enum HelpdeskPriority {
  BAIXA = 'BAIXA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA',
  CRITICA = 'CRITICA',
}

export enum HelpdeskStatus {
  ABERTO = 'ABERTO',
  EM_ANALISE = 'EM_ANALISE',
  EM_ANDAMENTO = 'EM_ANDAMENTO',
  AGUARDANDO_USUARIO = 'AGUARDANDO_USUARIO',
  RESOLVIDO = 'RESOLVIDO',
  ENCERRADO = 'ENCERRADO',
}

export enum HelpdeskModule {
  AGENDAMENTO = 'AGENDAMENTO',
  TREINAMENTOS = 'TREINAMENTOS',
  FINANCEIRO = 'FINANCEIRO',
  USUARIOS = 'USUARIOS',
}

export enum HelpdeskEnvironment {
  WEB = 'WEB',
  MOBILE = 'MOBILE',
}

export enum UserRole {
  CLIENT = 'CLIENT',
  ADMIN = 'ADMIN',
  DEVELOPER = 'DEVELOPER',
}
