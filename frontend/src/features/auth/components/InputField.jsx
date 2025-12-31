export default function InputField({
  label,
  icon: Icon,
  type = "text",
  name,
  placeholder = "",
  value = "",
  onChange,
  onBlur,
  error,
  success,
  loading,
}) {
  return (
    <div className="form-group">
      {label && <label htmlFor={name}>{label}</label>}
      <div className="input-wrapper">
        {Icon && <Icon className="input-icon" size={20} />}
        <input
          id={name}
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          className={`auth-input ${error ? "error" : ""} ${
            success ? "success" : ""
          }`}
          disabled={loading}
        />
        {loading && <span className="loading-spinner" />}
      </div>
      {error && <span className="error-message">{error}</span>}
      {success && <span className="success-message">✓</span>}
    </div>
  );
}
