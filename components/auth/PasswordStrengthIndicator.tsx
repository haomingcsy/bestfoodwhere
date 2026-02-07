"use client";

interface PasswordStrengthIndicatorProps {
  password: string;
}

export function PasswordStrengthIndicator({
  password,
}: PasswordStrengthIndicatorProps) {
  const getStrength = (password: string): number => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) strength++;
    return Math.min(strength, 4);
  };

  const strength = getStrength(password);

  const getStrengthLabel = (strength: number): string => {
    switch (strength) {
      case 0:
        return "Very weak";
      case 1:
        return "Weak";
      case 2:
        return "Fair";
      case 3:
        return "Good";
      case 4:
        return "Strong";
      default:
        return "";
    }
  };

  const getStrengthColor = (strength: number): string => {
    switch (strength) {
      case 0:
        return "bg-red-500";
      case 1:
        return "bg-orange-500";
      case 2:
        return "bg-yellow-500";
      case 3:
        return "bg-green-400";
      case 4:
        return "bg-green-600";
      default:
        return "bg-gray-200";
    }
  };

  if (!password) return null;

  return (
    <div className="mt-2">
      <div className="flex gap-1">
        {[0, 1, 2, 3].map((index) => (
          <div
            key={index}
            className={`h-1 flex-1 rounded-full transition-colors ${
              index < strength ? getStrengthColor(strength) : "bg-gray-200"
            }`}
          />
        ))}
      </div>
      <p
        className={`mt-1 text-xs ${
          strength < 2
            ? "text-red-600"
            : strength < 4
              ? "text-yellow-600"
              : "text-green-600"
        }`}
      >
        {getStrengthLabel(strength)}
      </p>
    </div>
  );
}
