# ESPECIFICAÇÃO FUNCIONAL: SISTEMA DE GESTÃO DE FROTAS (FLEET MANAGER)

## 1. Visão Geral do Produto
O Fleet Manager é uma plataforma SaaS para controle operacional de frotas de veículos pesados e leves. O sistema centraliza o cadastro dos ativos (veículos), controla custos variáveis (abastecimentos), monitora sinistros (ocorrências) e garante a conformidade legal (documentos e vencimentos).

O sistema é composto por 4 módulos principais interconectados, onde o **Veículo** é a entidade central.

---

## 2. Módulos e Regras de Negócio

### 2.1. Módulo de Veículos (Core)
Responsável pelo inventário da frota.
- **Identificação:** Cada veículo possui dois identificadores únicos: a `Placa` (Legal) e o `Identificador Interno` (ex: "316" - Organizacional).
- **Categorização:** Os veículos são tipados (Ônibus, Van, Carro) e classificados (Premium, Basic) para relatórios de uso.
- **Status Operacional:** O veículo possui um ciclo de vida:
    - `LIBERADO`: Apto para rodar.
    - `EM_MANUTENCAO`: Bloqueado para novas viagens.
    - `INDISPONIVEL`: Parado por problemas legais ou falta de motorista.
- **Galeria:** Suporte a múltiplas fotos para vistoria visual do estado do veículo.

### 2.2. Módulo de Abastecimento (Custos)
Responsável pelo controle financeiro de combustível.
- **Vínculo:** Todo abastecimento obrigatoriamente pertence a um veículo.
- **Consumo:** Registra-se o `Odômetro (KM)` no momento do abastecimento. Isso é crucial para, no futuro, calcular a média de consumo (KM/L) comparando com o abastecimento anterior.
- **Auditoria:** É obrigatório o upload da foto do comprovante/nota fiscal para evitar fraudes.
- **Dados Financeiros:** Registra litros e valor total.

### 2.3. Módulo de Ocorrências (Segurança)
Responsável por registrar eventos não planejados (multas, batidas, falhas mecânicas).
- **Classificação:** Ocorrências possuem severidade (`BAIXA` a `GRAVE`). Isso ajuda gestores a priorizarem a resolução.
- **Evidências:** Permite descrição textual detalhada e upload de arquivos (fotos da avaria ou PDFs de multas).
- **Histórico:** Cria um log vitalício da "saúde" do veículo.

### 2.4. Módulo de Documentação (Compliance)
Responsável por evitar multas por documentos vencidos.
- **Monitoramento:** Cadastra-se documentos recorrentes (Tacógrafo, Licenciamento, Seguro).
- **Sistema de Alerta:** O campo `alertDays` define com quantos dias de antecedência o sistema deve notificar o gestor sobre o vencimento.
- **Status:** Documentos podem ter o alerta ativado ou desativado manualmente.

---

## 3. Fluxos de Dados (Data Flow)

1. **Cadastro:** O usuário cria o veículo com dados básicos.
2. **Operação:** O usuário lança abastecimentos e ocorrências ao longo do tempo.
3. **Atualização Automática (Sugestão):** Ao lançar um abastecimento com KM 50.000, o sistema deve atualizar automaticamente o `currentKm` do cadastro do veículo para refletir a realidade.

---