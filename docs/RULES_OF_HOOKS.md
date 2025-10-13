# Rules of Hooks - React Best Practices

## What are the Rules of Hooks?

The Rules of Hooks are fundamental principles that React developers must follow when using hooks to ensure proper component behavior and avoid runtime errors.

## The Two Main Rules:

### 1. **Only Call Hooks at the Top Level**

- ✅ **DO**: Call hooks at the top level of React functions
- ❌ **DON'T**: Call hooks inside loops, conditions, or nested functions

### 2. **Only Call Hooks from React Functions**

- ✅ **DO**: Call hooks from React function components or custom hooks
- ❌ **DON'T**: Call hooks from regular JavaScript functions

## Example of the Error We Fixed:

### ❌ **Incorrect (Causes "Rendered more hooks than during the previous render"):**

```javascript
const MessengerChatInterface = ({ selectedFriend }) => {
  const [messages, setMessages] = useState([]);

  // Conditional return BEFORE useCallback hook
  if (!selectedFriend) {
    return <div>No friend selected</div>;
  }

  // ❌ WRONG: Hook called after conditional return
  const renderMessage = useCallback(
    (msg, index) => {
      // Component logic
    },
    [dependencies]
  );

  return <div>Chat interface</div>;
};
```

### ✅ **Correct (Fixed version):**

```javascript
const MessengerChatInterface = ({ selectedFriend }) => {
  const [messages, setMessages] = useState([]);

  // ✅ CORRECT: Hook called at the top level, before any conditional returns
  const renderMessage = useCallback(
    (msg, index) => {
      // Component logic
    },
    [dependencies]
  );

  // Conditional return AFTER all hooks
  if (!selectedFriend) {
    return <div>No friend selected</div>;
  }

  return <div>Chat interface</div>;
};
```

## Why This Error Occurs:

1. **First Render**: React calls the component, encounters the conditional return, skips the `useCallback`
2. **Second Render**: React calls the component, doesn't encounter the conditional return, calls the `useCallback`
3. **Result**: React sees different numbers of hooks between renders → Error!

## Common Hook Violations:

### ❌ **Conditional Hooks:**

```javascript
if (condition) {
  const [state, setState] = useState(); // ❌ Don't do this
}
```

### ❌ **Loops:**

```javascript
for (let i = 0; i < items.length; i++) {
  const [state, setState] = useState(); // ❌ Don't do this
}
```

### ❌ **Nested Functions:**

```javascript
const handleClick = () => {
  const [state, setState] = useState(); // ❌ Don't do this
};
```

## Best Practices:

### ✅ **Always Define Hooks at the Top:**

```javascript
const MyComponent = () => {
  // ✅ All hooks at the top level
  const [state1, setState1] = useState();
  const [state2, setState2] = useState();
  const memoizedValue = useMemo(() => expensiveCalculation(), []);
  const memoizedCallback = useCallback(() => doSomething(), []);

  // Conditional logic AFTER all hooks
  if (loading) return <Loading />;
  if (error) return <Error />;

  return <div>Content</div>;
};
```

### ✅ **Use Conditional Logic Inside Hooks:**

```javascript
const MyComponent = ({ shouldFetch }) => {
  const [data, setData] = useState(null);

  // ✅ Conditional logic inside useEffect
  useEffect(() => {
    if (shouldFetch) {
      fetchData().then(setData);
    }
  }, [shouldFetch]);

  return <div>{data}</div>;
};
```

## Our Fix Summary:

**Problem**: `useCallback` was defined after a conditional return statement
**Solution**: Moved `useCallback` before any conditional returns
**Result**: Hook is always called in the same order on every render

This ensures React can properly track hooks and maintain component state consistency.

## Tools for Debugging:

- **React DevTools**: Shows hook call order
- **ESLint Plugin**: `eslint-plugin-react-hooks` catches violations
- **Our Custom Script**: `npm run verify-jsx` helps identify structural issues

Remember: **Hooks must always be called in the same order on every render!**
