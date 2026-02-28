---
name: test-generator
description: Generate tests for components, utilities, and APIs. Use when implementing test coverage for new or existing code.
---

# Test Generator Skill

Create comprehensive tests using Jest, React Testing Library, and best practices for Next.js applications.

## When to Use

- Writing unit tests for utilities
- Testing React components
- API endpoint testing
- Integration tests
- E2E test scenarios

## Test File Structure

```
__tests__/
├── unit/
│   ├── utils/
│   │   └── format.test.ts
│   └── hooks/
│       └── useAuth.test.ts
├── components/
│   ├── Button.test.tsx
│   └── Card.test.tsx
├── api/
│   └── contact.test.ts
└── e2e/
    └── checkout.test.ts
```

## Unit Test Patterns

### Utility Function Test

```typescript
// __tests__/unit/utils/format.test.ts
import { formatPrice, formatDate, formatPhone } from "@/utils/format";

describe("formatPrice", () => {
  it("formats price with 2 decimal places", () => {
    expect(formatPrice(10)).toBe("$10.00");
    expect(formatPrice(10.5)).toBe("$10.50");
    expect(formatPrice(10.999)).toBe("$11.00");
  });

  it("handles zero", () => {
    expect(formatPrice(0)).toBe("$0.00");
  });

  it("handles large numbers", () => {
    expect(formatPrice(1000000)).toBe("$1,000,000.00");
  });
});

describe("formatDate", () => {
  it("formats date in Singapore format", () => {
    const date = new Date("2026-01-03T12:00:00Z");
    expect(formatDate(date)).toBe("3 Jan 2026");
  });

  it("handles string input", () => {
    expect(formatDate("2026-01-03")).toBe("3 Jan 2026");
  });
});

describe("formatPhone", () => {
  it("formats Singapore phone numbers", () => {
    expect(formatPhone("91234567")).toBe("+65 9123 4567");
    expect(formatPhone("+6591234567")).toBe("+65 9123 4567");
  });
});
```

### Hook Test

```typescript
// __tests__/unit/hooks/useDebounce.test.ts
import { renderHook, act } from "@testing-library/react";
import { useDebounce } from "@/hooks/useDebounce";

jest.useFakeTimers();

describe("useDebounce", () => {
  it("returns initial value immediately", () => {
    const { result } = renderHook(() => useDebounce("initial", 500));
    expect(result.current).toBe("initial");
  });

  it("debounces value changes", () => {
    const { result, rerender } = renderHook(
      ({ value }) => useDebounce(value, 500),
      { initialProps: { value: "initial" } },
    );

    rerender({ value: "changed" });
    expect(result.current).toBe("initial");

    act(() => {
      jest.advanceTimersByTime(500);
    });

    expect(result.current).toBe("changed");
  });
});
```

## Component Test Patterns

### Basic Component Test

```tsx
// __tests__/components/Button.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "@/components/ui/Button";

describe("Button", () => {
  it("renders with text", () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: /click me/i }),
    ).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("is disabled when disabled prop is true", () => {
    render(<Button disabled>Click me</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("applies variant styles", () => {
    render(<Button variant="primary">Primary</Button>);
    expect(screen.getByRole("button")).toHaveClass("bg-primary");
  });
});
```

### Component with State Test

```tsx
// __tests__/components/Counter.test.tsx
import { render, screen, fireEvent } from "@testing-library/react";
import { Counter } from "@/components/Counter";

describe("Counter", () => {
  it("starts with initial value", () => {
    render(<Counter initialValue={5} />);
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("increments on plus click", () => {
    render(<Counter initialValue={0} />);

    fireEvent.click(screen.getByRole("button", { name: /increment/i }));
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("decrements on minus click", () => {
    render(<Counter initialValue={5} />);

    fireEvent.click(screen.getByRole("button", { name: /decrement/i }));
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("does not go below minimum", () => {
    render(<Counter initialValue={0} min={0} />);

    fireEvent.click(screen.getByRole("button", { name: /decrement/i }));
    expect(screen.getByText("0")).toBeInTheDocument();
  });
});
```

### Form Component Test

```tsx
// __tests__/components/ContactForm.test.tsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ContactForm } from "@/components/ContactForm";

// Mock fetch
global.fetch = jest.fn();

describe("ContactForm", () => {
  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
  });

  it("renders all form fields", () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    render(<ContactForm />);

    fireEvent.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/name is required/i)).toBeInTheDocument();
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it("shows error for invalid email", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/email/i), "invalid-email");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/invalid email/i)).toBeInTheDocument();
    });
  });

  it("submits form successfully", async () => {
    const user = userEvent.setup();
    (fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<ContactForm />);

    await user.type(screen.getByLabelText(/name/i), "John Doe");
    await user.type(screen.getByLabelText(/email/i), "john@example.com");
    await user.type(screen.getByLabelText(/message/i), "Hello!");
    await user.click(screen.getByRole("button", { name: /submit/i }));

    await waitFor(() => {
      expect(screen.getByText(/success/i)).toBeInTheDocument();
    });

    expect(fetch).toHaveBeenCalledWith("/api/contact", expect.any(Object));
  });
});
```

## API Test Patterns

```typescript
// __tests__/api/contact.test.ts
import { POST } from "@/app/api/contact/route";
import { NextRequest } from "next/server";

describe("POST /api/contact", () => {
  it("returns 400 for missing required fields", async () => {
    const request = new NextRequest("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({ name: "John" }), // Missing email and message
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBeDefined();
  });

  it("returns 400 for invalid email", async () => {
    const request = new NextRequest("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "John",
        email: "invalid-email",
        message: "Hello",
      }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
  });

  it("returns 200 for valid submission", async () => {
    const request = new NextRequest("http://localhost/api/contact", {
      method: "POST",
      body: JSON.stringify({
        name: "John Doe",
        email: "john@example.com",
        message: "Hello!",
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data.success).toBe(true);
  });
});
```

## Mock Patterns

### Mocking Fetch

```typescript
global.fetch = jest.fn();

beforeEach(() => {
  (fetch as jest.Mock).mockClear();
});

// Success response
(fetch as jest.Mock).mockResolvedValueOnce({
  ok: true,
  json: async () => ({ data: "result" }),
});

// Error response
(fetch as jest.Mock).mockResolvedValueOnce({
  ok: false,
  status: 500,
  json: async () => ({ error: "Server error" }),
});

// Network error
(fetch as jest.Mock).mockRejectedValueOnce(new Error("Network error"));
```

### Mocking Supabase

```typescript
jest.mock("@/lib/supabase/client", () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({ data: mockData, error: null }),
    })),
  },
}));
```

### Mocking Next.js Router

```typescript
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
}));
```

## Test Commands

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test -- --watch

# Run specific test file
npm run test -- path/to/test.ts

# Run with coverage
npm run test -- --coverage

# Run tests matching pattern
npm run test -- --testNamePattern="Button"
```

## Best Practices

1. **Test behavior, not implementation** - Focus on what the code does, not how
2. **Use descriptive test names** - Should read like documentation
3. **Follow AAA pattern** - Arrange, Act, Assert
4. **Keep tests independent** - Each test should work in isolation
5. **Mock external dependencies** - API calls, databases, etc.
6. **Test edge cases** - Empty states, errors, boundaries
7. **Don't test third-party code** - Focus on your own logic
8. **Maintain test data** - Use factories or fixtures for consistent data
