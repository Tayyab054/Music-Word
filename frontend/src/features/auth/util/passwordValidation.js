/**
 * Password validation utilities
 */

export const PASSWORD_RULES = {
  minLength: 8,
  maxLength: 64,
};

/**
 * Validate password against all requirements
 * @param {string} password - The password to validate
 * @param {string} confirmPassword - The confirm password to match
 * @returns {object} - Validation results for each rule
 */
export function validatePassword(password, confirmPassword = "") {
  return {
    minLength: password.length >= PASSWORD_RULES.minLength,
    maxLength: password.length <= PASSWORD_RULES.maxLength,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSymbol: /[!@#$%^&*()_+\-=[\]{};':"|,.<>?]/.test(password),
    match: password.length > 0 && password === confirmPassword,
  };
}

/**
 * Check if password meets all requirements
 * @param {object} validation - The validation object from validatePassword
 * @returns {boolean} - True if all requirements are met
 */
export function isPasswordValid(validation) {
  return (
    validation.minLength &&
    validation.maxLength &&
    validation.hasUpper &&
    validation.hasLower &&
    validation.hasNumber &&
    validation.hasSymbol
  );
}

/**
 * Check if passwords match and both are valid
 * @param {object} validation - The validation object from validatePassword
 * @returns {boolean} - True if passwords are valid and match
 */
export function arePasswordsValidAndMatch(validation) {
  return isPasswordValid(validation) && validation.match;
}

/**
 * Get password strength level (0-4)
 * @param {object} validation - The validation object from validatePassword
 * @returns {number} - Strength level from 0 (weak) to 4 (strong)
 */
export function getPasswordStrength(validation) {
  let strength = 0;
  if (validation.minLength) strength++;
  if (validation.hasUpper && validation.hasLower) strength++;
  if (validation.hasNumber) strength++;
  if (validation.hasSymbol) strength++;
  return strength;
}

/**
 * Get password strength label
 * @param {number} strength - Strength level from 0-4
 * @returns {string} - Human readable strength label
 */
export function getPasswordStrengthLabel(strength) {
  const labels = ["Very Weak", "Weak", "Fair", "Good", "Strong"];
  return labels[strength] || "Very Weak";
}

/**
 * Get password strength color
 * @param {number} strength - Strength level from 0-4
 * @returns {string} - CSS color for the strength level
 */
export function getPasswordStrengthColor(strength) {
  const colors = ["#f15e6c", "#ff9800", "#ffeb3b", "#8bc34a", "#1db954"];
  return colors[strength] || colors[0];
}
