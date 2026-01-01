export type FuelType =
  | "DIESEL"
  | "DIESEL_S10"
  | "GASOLINA"
  | "ETANOL"
  | "ARLA32";

/**
 * Categorias/Espécies de Veículos (Ex: O que ele é?)
 * Baseado na classificação veicular brasileira (Ônibus, Carro, Moto, etc.)
 */
export type VehicleParams = {
  id: string; // ID é para o PARÂMETRO da rota
};

export type VehicleCategory = "ONIBUS" | "VAN" | "CARRO" | "CAMINHAO";

/**
 * Classificação de Uso (Ex: Placa - Particular, Aluguel, etc.)
 * Baseado na finalidade do veículo.
 */
export type VehicleClassification = "PREMIUM" | "BASIC" | "EXECUTIVO";

/**
 * Status Operacional na Frota
 */
export type VehicleStatus =
  | "LIBERADO"
  | "EM_MANUTENCAO"
  | "VENDIDO"
  | "INDISPONIVEL";

/**
 * Tipo completo para um Veículo no Sistema
 */
export type VehicleType = {
  // Identificação Básica
  id: string; // UUID ou ID interno
  internalId?: string; // ID interno da frota

  // Dados Legais
  plate: string;
  renavam?: string;
  chassis?: string;

  // Especificações Físicas
  model: string;
  brand: string;
  year: number;
  color?: string;
  doors?: number;
  capacity: number; // Capacidade de passageiros ou carga

  // Classificações
  category: VehicleCategory;
  classification: VehicleClassification;
  fuelType: FuelType;

  // Estado Operacional
  state?: string; // UF de registro (Ex: 'SP')
  currentKm: number;
  status: VehicleStatus;

  // Detalhes da Frota
  companyName?: string;
  description?: string;

  // Datas
  createdAt: Date;
  updatedAt: Date;
};
