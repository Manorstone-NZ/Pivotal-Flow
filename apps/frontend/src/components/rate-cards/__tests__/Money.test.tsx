/**
 * Money Component Tests
 * Tests for currency formatting and currency input validation
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Money, CurrencyInput, useCurrencyFormatter } from '../Money';
import { renderHook, act } from '@testing-library/react';

describe('Money', () => {
  it('formats NZD currency correctly', () => {
    render(<Money amount="150.50" currency="NZD" />);
    expect(screen.getByText('$150.50')).toBeInTheDocument();
  });

  it('formats USD currency correctly', () => {
    render(<Money amount="1250.75" currency="USD" />);
    expect(screen.getByText('$1,250.75')).toBeInTheDocument();
  });

  it('formats EUR currency correctly', () => {
    render(<Money amount="999.99" currency="EUR" />);
    expect(screen.getByText('€999.99')).toBeInTheDocument();
  });

  it('formats JPY currency correctly (no decimals)', () => {
    render(<Money amount="12000" currency="JPY" />);
    expect(screen.getByText('¥12,000')).toBeInTheDocument();
  });

  it('handles large numbers with thousand separators', () => {
    render(<Money amount="1234567.89" currency="USD" />);
    expect(screen.getByText('$1,234,567.89')).toBeInTheDocument();
  });

  it('handles zero amounts', () => {
    render(<Money amount="0" currency="NZD" />);
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('handles invalid amounts gracefully', () => {
    render(<Money amount="invalid" currency="NZD" />);
    expect(screen.getByText('$0.00')).toBeInTheDocument();
  });

  it('shows currency code when showCurrency is true', () => {
    render(<Money amount="100" currency="NZD" showCurrency={true} />);
    expect(screen.getByText('$100.00 NZD')).toBeInTheDocument();
  });

  it('handles unsupported currencies', () => {
    render(<Money amount="100" currency="XYZ" />);
    expect(screen.getByText('100 XYZ')).toBeInTheDocument();
  });

  it('respects custom precision', () => {
    render(<Money amount="100.123456" currency="USD" precision={4} />);
    expect(screen.getByText('$100.1235')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Money amount="100" currency="NZD" className="text-red-500" />);
    const element = screen.getByText('$100.00');
    expect(element).toHaveClass('text-red-500');
  });
});

describe('CurrencyInput', () => {
  it('renders with currency symbol', () => {
    render(
      <CurrencyInput
        value="100.00"
        currency="NZD"
        onChange={() => {}}
      />
    );
    
    expect(screen.getByDisplayValue('$100.00')).toBeInTheDocument();
    expect(screen.getByText('$')).toBeInTheDocument();
  });

  it('handles focus and blur events', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();
    const mockOnBlur = vi.fn();

    render(
      <CurrencyInput
        value="100.00"
        currency="NZD"
        onChange={mockOnChange}
        onBlur={mockOnBlur}
      />
    );

    const input = screen.getByRole('textbox');
    
    // Focus should show raw value
    await user.click(input);
    expect(input).toHaveValue('100.00');
    
    // Blur should format value
    await user.click(document.body);
    expect(mockOnBlur).toHaveBeenCalled();
  });

  it('validates currency input', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(
      <CurrencyInput
        value=""
        currency="NZD"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    
    await user.type(input, '150.50');
    expect(mockOnChange).toHaveBeenCalledWith('150.50');
  });

  it('shows validation error', () => {
    render(
      <CurrencyInput
        value="100.00"
        currency="NZD"
        onChange={() => {}}
        error="Invalid amount"
      />
    );
    
    expect(screen.getByText('Invalid amount')).toBeInTheDocument();
  });

  it('disables input when disabled prop is true', () => {
    render(
      <CurrencyInput
        value="100.00"
        currency="NZD"
        onChange={() => {}}
        disabled={true}
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
  });

  it('handles keyboard events correctly', async () => {
    const user = userEvent.setup();
    const mockOnChange = vi.fn();

    render(
      <CurrencyInput
        value=""
        currency="NZD"
        onChange={mockOnChange}
      />
    );

    const input = screen.getByRole('textbox');
    
    await user.click(input);
    await user.type(input, '50.25');
    await user.keyboard('{Enter}');
    
    expect(mockOnChange).toHaveBeenCalledWith('50.25');
  });
});

describe('useCurrencyFormatter', () => {
  it('formats currency correctly', () => {
    const { result } = renderHook(() => useCurrencyFormatter());
    
    const formatted = result.current.formatCurrency(150.50, 'NZD');
    expect(formatted).toBe('$150.50');
  });

  it('parses currency input correctly', () => {
    const { result } = renderHook(() => useCurrencyFormatter());
    
    const parsed = result.current.parseCurrencyInput('$150.50', 'NZD');
    expect(parsed).toBe('150.50');
  });

  it('validates currency input', () => {
    const { result } = renderHook(() => useCurrencyFormatter());
    
    const validation = result.current.validateCurrencyInput('150.50', 'NZD');
    expect(validation.isValid).toBe(true);
    expect(validation.value).toBe('150.50');
  });

  it('rejects invalid currency input', () => {
    const { result } = renderHook(() => useCurrencyFormatter());
    
    const validation = result.current.validateCurrencyInput('invalid', 'NZD');
    expect(validation.isValid).toBe(false);
    expect(validation.error).toBe('Invalid number format');
  });

  it('rejects negative amounts', () => {
    const { result } = renderHook(() => useCurrencyFormatter());
    
    const validation = result.current.validateCurrencyInput('-50.00', 'NZD');
    expect(validation.isValid).toBe(false);
    expect(validation.error).toBe('Amount cannot be negative');
  });

  it('rejects amounts over maximum', () => {
    const { result } = renderHook(() => useCurrencyFormatter());
    
    const validation = result.current.validateCurrencyInput('1000000.00', 'NZD');
    expect(validation.isValid).toBe(false);
    expect(validation.error).toBe('Amount exceeds maximum value');
  });

  it('handles empty input', () => {
    const { result } = renderHook(() => useCurrencyFormatter());
    
    const validation = result.current.validateCurrencyInput('', 'NZD');
    expect(validation.isValid).toBe(false);
    expect(validation.error).toBe('Amount is required');
  });

  it('handles unsupported currency', () => {
    const { result } = renderHook(() => useCurrencyFormatter());
    
    const validation = result.current.validateCurrencyInput('100.00', 'XYZ');
    expect(validation.isValid).toBe(false);
    expect(validation.error).toBe('Unsupported currency: XYZ');
  });
});
