interface PasswordOptions {
  length?: number;
  includeLowercase?: boolean;
  includeUppercase?: boolean;
  includeNumbers?: boolean;
  includeSymbols?: boolean;
}

export const  generateUserPassword = (options: PasswordOptions = {}): string => {
  const { length = 8, includeLowercase = true, includeUppercase = true, includeNumbers = true, includeSymbols = true } = options;

  const lowercase = 'abcdefghijklmnopqrstuvwxyz';
  const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';
  
  if (!includeLowercase && !includeUppercase && !includeNumbers && !includeSymbols) {
    throw new Error('At least one character type must be selected');
  }

  let allChars = '';
  let password = '';

  if (includeLowercase) {
    allChars += lowercase;
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
  }
  
  if (includeUppercase) {
    allChars += uppercase;
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
  }
  
  if (includeNumbers) {
    allChars += numbers;
    password += numbers[Math.floor(Math.random() * numbers.length)];
  }
  
  if (includeSymbols) {
    allChars += symbols;
    password += symbols[Math.floor(Math.random() * symbols.length)];
  }

  for (let i = password.length; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }
  return password.split('').sort(() => Math.random() - 0.5).join('');
}