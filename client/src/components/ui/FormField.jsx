import React, { useRef, useEffect } from 'react';
import tokens from '../../theme/tokens.js';

export default function FormField({ label, type = 'text', value, onChange, options, placeholder, required, disabled, min, max, step, rows = 3, suffix, help, style: customStyle }) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current && type !== 'checkbox' && type !== 'select') {
      inputRef.current.value = value ?? '';
    }
  }, [value, type]);

  const labelStyle = {
    display: 'block',
    fontSize: tokens.typography.fontSize.sm,
    fontWeight: tokens.typography.fontWeight.medium,
    color: tokens.colors.textSecondary,
    marginBottom: tokens.spacing.xs,
  };

  const inputStyle = {
    width: '100%',
    padding: `${tokens.spacing.sm}px ${tokens.spacing.md}px`,
    border: `1px solid ${tokens.colors.border}`,
    borderRadius: tokens.radii.sm,
    fontSize: tokens.typography.fontSize.md,
    color: tokens.colors.text,
    background: disabled ? tokens.colors.borderLight : tokens.colors.white,
    outline: 'none',
    fontFamily: tokens.typography.fontFamily,
    transition: 'border-color 0.15s ease',
  };

  const handleBlur = (e) => {
    if (type === 'number') {
      const val = e.target.value === '' ? 0 : Number(e.target.value);
      if (val !== value) onChange?.(val);
    } else {
      if (e.target.value !== (value ?? '')) onChange?.(e.target.value);
    }
  };

  if (type === 'checkbox') {
    return (
      <label style={{ display: 'flex', alignItems: 'center', gap: tokens.spacing.sm, cursor: 'pointer', ...customStyle }}>
        <input
          type="checkbox"
          checked={!!value}
          onChange={(e) => onChange?.(e.target.checked)}
          disabled={disabled}
          style={{ width: 16, height: 16, accentColor: tokens.colors.primary }}
        />
        <span style={{ fontSize: tokens.typography.fontSize.md, color: tokens.colors.text }}>{label}</span>
      </label>
    );
  }

  if (type === 'select') {
    return (
      <div style={customStyle}>
        {label && <label style={labelStyle}>{label}{required && ' *'}</label>}
        <select
          value={value ?? ''}
          onChange={(e) => onChange?.(e.target.value)}
          disabled={disabled}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          {(options || []).map((opt, i) => {
            const optValue = typeof opt === 'object' ? opt.value : opt;
            const optLabel = typeof opt === 'object' ? opt.label : opt;
            return <option key={i} value={optValue}>{optLabel}</option>;
          })}
        </select>
      </div>
    );
  }

  if (type === 'textarea') {
    return (
      <div style={customStyle}>
        {label && <label style={labelStyle}>{label}{required && ' *'}</label>}
        <textarea
          ref={inputRef}
          defaultValue={value ?? ''}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          rows={rows}
          style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.5 }}
        />
        {help && <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.textLight, marginTop: tokens.spacing.xs }}>{help}</div>}
      </div>
    );
  }

  return (
    <div style={customStyle}>
      {label && <label style={labelStyle}>{label}{required && ' *'}</label>}
      <div style={{ position: 'relative' }}>
        <input
          ref={inputRef}
          type={type}
          defaultValue={value ?? (type === 'number' ? 0 : '')}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={step}
          style={{
            ...inputStyle,
            paddingRight: suffix ? 40 : undefined,
          }}
        />
        {suffix && (
          <span style={{
            position: 'absolute',
            right: tokens.spacing.md,
            top: '50%',
            transform: 'translateY(-50%)',
            color: tokens.colors.textLight,
            fontSize: tokens.typography.fontSize.sm,
          }}>
            {suffix}
          </span>
        )}
      </div>
      {help && <div style={{ fontSize: tokens.typography.fontSize.xs, color: tokens.colors.textLight, marginTop: tokens.spacing.xs }}>{help}</div>}
    </div>
  );
}
