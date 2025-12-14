"use client";

import { useState, useEffect } from "react";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { Button } from "@/components/ui/button";
import { Save } from "lucide-react";
import { toast as sonnerToast } from "sonner";
import { cn } from "@/lib/utils";

interface TermsSectionProps {
  vehicleId: string;
  initialContent?: string;
  onSave?: (content: string) => void;
}

// Default content for the terms editor - matching the image
const DEFAULT_TERMS_CONTENT = `
<h1>Termos e Políticas do Serviço de Transfer</h1>

<p>Ao contratar o serviço de transfer, o passageiro concorda com as condições descritas abaixo. Recomendamos a leitura atenta antes de prosseguir com a reserva.</p>

<h2>1. Condições Gerais</h2>

<ul>
  <li>O serviço de transfer é realizado por motoristas credenciados e veículos devidamente licenciados.</li>
  <li>O passageiro deve estar pronto no ponto de embarque com antecedência mínima de <strong>10 minutos</strong> em relação ao horário agendado.</li>
  <li>A bagagem transportada é de responsabilidade do passageiro, sendo permitido até 1 mala média e 1 item de mão por pessoa.</li>
</ul>

<h2>2. Política de Cancelamento</h2>

<p>Cancelamentos comunicados com antecedência mínima de 24 horas antes do horário agendado terão reembolso integral.</p>

<p>Cancelamentos com menos de 24 horas de antecedência ou em caso de não comparecimento (no-show) não terão direito a reembolso.</p>

<h2>3. Alterações de Reserva</h2>

<p>Alterações de data, horário ou local de embarque estão sujeitas à disponibilidade e devem ser solicitadas com no mínimo 12 horas de antecedência.</p>

<h2>4. Responsabilidades</h2>

<ul>
  <li>A empresa não se responsabiliza por atrasos causados por condições climáticas adversas, trânsito intenso ou outros fatores externos.</li>
  <li>Objetos esquecidos no veículo serão mantidos por até 7 dias úteis.</li>
</ul>
`;

export function TermsSection({
  vehicleId,
  initialContent,
  onSave,
}: TermsSectionProps) {
  const [content, setContent] = useState(initialContent || DEFAULT_TERMS_CONTENT);
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (initialContent) {
      setContent(initialContent);
    }
  }, [initialContent]);

  const handleContentChange = (newContent: string) => {
    setContent(newContent);
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // Here you would typically save to the backend
      // For now, we'll just simulate a save
      await new Promise((resolve) => setTimeout(resolve, 500));
      
      onSave?.(content);
      setHasChanges(false);
      sonnerToast.success("Termos salvos com sucesso!");
    } catch (error) {
      sonnerToast.error("Erro ao salvar termos");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="w-full ">
      {/* Header with save button */}
     

      {/* Rich Text Editor */}
      <RichTextEditor
        content={content}
        onChange={handleContentChange}
        className="min-h-[400px]"
      />

      {/* Status indicator */}
      {hasChanges && (
        <p className="text-xs text-muted-foreground italic">
          Alterações não salvas
        </p>
      )}
    </div>
  );
}

export default TermsSection;
