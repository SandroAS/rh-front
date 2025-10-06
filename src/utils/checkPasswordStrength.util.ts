/**
 * Funçao simples para classificar a forca da senha com base em regras basicas.
 * Em um projeto real, use uma biblioteca como zxcvbn ou strong-password-checker.
 * * Retorna uma pontuação de 0 (Muito Fraca) a 4 (Forte/Excelente).
 */
export function checkPasswordStrength(password: string): number {
  let score = 0;
  if (!password) return 0;

  // 1. Comprimento: essencial
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;

  // 2. Complexidade:
  const hasLowercase = /[a-z]/.test(password);
  const hasUppercase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);

  // Pontua por variedade de caracteres
  const characterTypes = [hasLowercase, hasUppercase, hasNumber, hasSpecial].filter(Boolean).length;
  if (characterTypes >= 2) score++;
  if (characterTypes >= 3 && password.length >= 10) score++;

  // Pontuação máxima 4
  return Math.min(score, 4);
};

export function passwordScore(score: number) {
  switch (score) {
    case 4:
      return { text: 'Excelente', color: 'green', value: 100 };
    case 3:
      return { text: 'Forte', color: 'light-green', value: 75 };
    case 2:
      return { text: 'Média', color: 'orange', value: 50 };
    case 1:
      return { text: 'Fraca', color: 'red', value: 25 };
    default:
      return { text: 'Muito Fraca', color: 'grey', value: 0 };
  }
};
