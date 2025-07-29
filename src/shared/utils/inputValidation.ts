/**
 * Utilitários para validação de inputs numéricos
 */

/**
 * Valida e formata input numérico para valores de token
 * @param value - Valor digitado pelo usuário
 * @returns Valor formatado e validado
 */
export const validateNumericInput = (value: string): string => {
  if (!value) return "";

  // Remove todos os caracteres que não são números, pontos ou vírgulas
  let cleanValue = value.replace(/[^0-9.,]/g, "");

  // Substitui vírgulas por pontos
  cleanValue = cleanValue.replace(/,/g, ".");

  // Verifica se há múltiplos pontos decimais
  const dotCount = (cleanValue.match(/\./g) || []).length;

  if (dotCount > 1) {
    // Se há múltiplos pontos, mantém apenas o primeiro
    const firstDotIndex = cleanValue.indexOf(".");
    const beforeFirstDot = cleanValue.substring(0, firstDotIndex + 1);
    const afterFirstDot = cleanValue
      .substring(firstDotIndex + 1)
      .replace(/\./g, "");
    cleanValue = beforeFirstDot + afterFirstDot;
  }

  // Previne zeros à esquerda desnecessários (exceto quando é 0.something)
  if (
    cleanValue.startsWith("0") &&
    cleanValue.length > 1 &&
    !cleanValue.startsWith("0.")
  ) {
    cleanValue = cleanValue.replace(/^0+/, "");
    if (cleanValue === "" || cleanValue.startsWith(".")) {
      cleanValue = "0" + cleanValue;
    }
  }

  // Se começar com ponto, adiciona 0 na frente
  if (cleanValue.startsWith(".")) {
    cleanValue = "0" + cleanValue;
  }

  return cleanValue;
};

/**
 * Verifica se o valor é um número válido
 * @param value - Valor a ser verificado
 * @returns true se for um número válido
 */
export const isValidNumber = (value: string): boolean => {
  if (!value || value === ".") return false;
  const num = parseFloat(value);
  return !isNaN(num) && isFinite(num) && num >= 0;
};

/**
 * Formata número para exibição com número específico de casas decimais
 * @param value - Valor numérico
 * @param decimals - Número de casas decimais (padrão: 6)
 * @returns Valor formatado
 */
export const formatNumber = (
  value: number | string,
  decimals: number = 6
): string => {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (isNaN(num)) return "0";

  return num.toLocaleString("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: decimals,
  });
};

/**
 * Converte string formatada de volta para número
 * @param formattedValue - Valor formatado
 * @returns Número ou 0 se inválido
 */
export const parseFormattedNumber = (formattedValue: string): number => {
  const cleanValue = formattedValue.replace(/,/g, "");
  const num = parseFloat(cleanValue);
  return isNaN(num) ? 0 : num;
};
