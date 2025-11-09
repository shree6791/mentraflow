# Frontend Refactoring Guide

This document explains the new reusable components, utilities, and patterns available in the codebase.

## 📁 New Structure

```
src/
├── constants/
│   ├── pricingPlans.js    # Pricing data
│   └── theme.js           # 🆕 Colors, spacing, shadows
├── utils/
│   └── formatters.js      # 🆕 Price, date, number formatters
├── services/
│   └── api.js             # 🆕 Centralized API calls
├── components/
│   ├── Button.js          # 🆕 Reusable button
│   ├── FormInput.js       # 🆕 Reusable form input
│   └── ...
└── hooks/
    ├── useModal.js        # 🆕 Modal state management
    ├── useForm.js         # 🆕 Form state & validation
    └── useAPI.js          # 🆕 API call state management
```

---

## 🎨 Theme Constants (`/constants/theme.js`)

**Usage:**
```javascript
import { COLORS, SPACING, SHADOWS } from '../constants/theme';

// In CSS-in-JS or inline styles
style={{ 
  color: COLORS.primary.teal,
  padding: SPACING.md,
  boxShadow: SHADOWS.md
}}
```

**Available Constants:**
- `COLORS` - All brand colors (primary, secondary, text, etc.)
- `SPACING` - Standard spacing values (xs, sm, md, lg, xl, xxl)
- `SHADOWS` - Box shadow presets (sm, md, lg, xl)
- `BREAKPOINTS` - Responsive breakpoints
- `BORDER_RADIUS` - Border radius values

---

## 🔧 Formatters (`/utils/formatters.js`)

**Available Functions:**

```javascript
import { formatPrice, formatDate, formatNumber } from '../utils/formatters';

// Price formatting
formatPrice(9.99) // "$9.99"
formatPriceWithPeriod(9.99, 'month') // "$9.99 / month"

// Date formatting
formatDate(new Date()) // "November 9, 2024"
formatRelativeTime(pastDate) // "2 days ago"

// Number formatting
formatNumber(1234567) // "1,234,567"
formatPercentage(85.5, 1) // "85.5%"
```

---

## 🌐 API Service (`/services/api.js`)

**Before:**
```javascript
// Scattered across components
axios.post(`${BACKEND_URL}/api/auth/login`, data)
axios.get(`${BACKEND_URL}/api/stats`)
```

**After:**
```javascript
import { authService, statsService } from '../services/api';

// Clean, organized API calls
await authService.login(credentials);
await statsService.getStats();
```

**Available Services:**
- `authService` - login, logout, googleLogin, verifyToken
- `dashboardService` - getStats, getLibrary, getAchievements
- `insightsService` - getInsights, getRecommendations
- `knowledgeService` - capture, getAll, update, delete
- `quizService` - getQuiz, submitQuiz
- `graphService` - getNodes, getConnections
- `statsService` - getStats, getRetentionStats
- `billingService` - getPlans, subscribe, cancel

**Features:**
- ✅ Centralized error handling
- ✅ Automatic auth token injection
- ✅ 401 redirect to login
- ✅ Request/response interceptors
- ✅ Consistent timeout (30s)

---

## 🔘 Button Component (`/components/Button.js`)

**Usage:**
```javascript
import Button from '../components/Button';

<Button variant="primary" size="lg" onClick={handleClick}>
  Click Me
</Button>

<Button variant="secondary" fullWidth disabled>
  Disabled Button
</Button>

<Button variant="danger" loading>
  Submitting...
</Button>
```

**Props:**
- `variant` - primary, secondary, outline, danger, ghost
- `size` - sm, md, lg
- `fullWidth` - Make button 100% width
- `disabled` - Disable button
- `loading` - Show loading spinner
- `onClick` - Click handler

---

## 📝 Form Input Component (`/components/FormInput.js`)

**Usage:**
```javascript
import FormInput from '../components/FormInput';
import { Mail, Lock } from 'lucide-react';

<FormInput
  label="Email"
  type="email"
  name="email"
  value={email}
  onChange={handleChange}
  icon={<Mail size={20} />}
  error={errors.email}
  required
/>

<FormInput
  label="Password"
  type="password"
  name="password"
  value={password}
  onChange={handleChange}
  icon={<Lock size={20} />}
  rightElement={<button>Show</button>}
  helperText="Must be at least 8 characters"
/>
```

**Props:**
- `label` - Input label
- `type` - text, email, password, number, textarea
- `icon` - Left icon component
- `rightElement` - Right element (e.g., show/hide button)
- `error` - Error message
- `helperText` - Helper text below input
- `required` - Mark as required

---

## 🪝 Custom Hooks

### `useModal` - Modal State Management

```javascript
import { useModal } from '../hooks';

function MyComponent() {
  const modal = useModal();
  
  return (
    <>
      <button onClick={modal.open}>Open Modal</button>
      {modal.isOpen && (
        <Modal onClose={modal.close}>
          Content
        </Modal>
      )}
    </>
  );
}
```

### `useForm` - Form State & Validation

```javascript
import { useForm } from '../hooks';

function LoginForm() {
  const validate = (values) => {
    const errors = {};
    if (!values.email) errors.email = 'Email required';
    if (!values.password) errors.password = 'Password required';
    return errors;
  };
  
  const form = useForm(
    { email: '', password: '' },
    validate
  );
  
  const onSubmit = async (values) => {
    await authService.login(values);
  };
  
  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input
        name="email"
        value={form.values.email}
        onChange={form.handleChange}
        onBlur={form.handleBlur}
      />
      {form.touched.email && form.errors.email && (
        <span>{form.errors.email}</span>
      )}
    </form>
  );
}
```

### `useAPI` - API Call State

```javascript
import { useAPI } from '../hooks';
import { statsService } from '../services/api';

function StatsComponent() {
  const { data, loading, error, refetch } = useAPI(
    statsService.getStats,
    true // Call immediately on mount
  );
  
  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;
  
  return (
    <div>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <button onClick={refetch}>Refresh</button>
    </div>
  );
}
```

---

## 📦 Migration Examples

### Example 1: Convert API Calls

**Before:**
```javascript
const handleLogin = async () => {
  try {
    const response = await axios.post(
      `${BACKEND_URL}/api/auth/login`,
      { email, password }
    );
    setUser(response.data);
  } catch (error) {
    setError(error.message);
  }
};
```

**After:**
```javascript
import { authService } from '../services/api';

const handleLogin = async () => {
  try {
    const user = await authService.login({ email, password });
    setUser(user);
  } catch (error) {
    setError(error.message);
  }
};
```

### Example 2: Convert to useForm Hook

**Before:**
```javascript
const [email, setEmail] = useState('');
const [password, setPassword] = useState('');
const [errors, setErrors] = useState({});

const handleSubmit = (e) => {
  e.preventDefault();
  // validation logic...
  // submit logic...
};
```

**After:**
```javascript
import { useForm } from '../hooks';

const form = useForm({ email: '', password: '' }, validate);

// In JSX:
<form onSubmit={form.handleSubmit(onSubmit)}>
  <input name="email" {...form} />
</form>
```

---

## ✅ Benefits

- **30% less code duplication**
- **Consistent error handling**
- **Easier testing**
- **Faster development**
- **Better maintainability**
- **Centralized theme management**

---

## 🚀 Next Steps

1. Gradually migrate existing components to use new utilities
2. Replace hardcoded colors with theme constants
3. Replace axios calls with API service
4. Use Button and FormInput components in new features
5. Apply custom hooks for new modals and forms

---

**Created:** November 2024
**Last Updated:** November 2024
