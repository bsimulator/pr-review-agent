// Test React violations for analyzer
import React, { useState } from 'react';
import moment from 'moment'; // Large library - bundle size warning
// import jQuery from 'jquery'; // Would trigger large import warning

// Violation 1: console.log
function TestReactViolations() {
  console.log('Component mounted');
  
  // Violation 2: Direct state mutation
  const [state, setState] = useState({ count: 0 });
  state.count = 1; // Bad!
  
  // Violation 3: useState without hook rules
  if (true) {
    const [invalid, setInvalid] = useState(0); // Conditional hook!
  }
  
  // Violation 4: Inline function on event handler
  return (
    <div>
      {/* Violation 5: Missing key in map */}
      {[1, 2, 3].map((item) => (
        <div>{item}</div>
      ))}
      
      {/* Violation 6: Inline arrow function causes re-renders */}
      <button onClick={() => alert('clicked')}>Click me</button>
      
      {/* Violation 7: Interactive element without a11y */}
      <div onClick={handleClick}>
        Click for more
      </div>
      
      {/* Violation 8: Missing alt text */}
      <img src="image.png" />
      
      {/* Violation 9: Promise without .catch */}
      {setTimeout(() => {
        fetch('/api/data').then(res => res.json());
      }, 1000)}
    </div>
  );
}

// Violation 10: var instead of const
var globalConfig = { timeout: 5000 };

// Violation 11: Missing TypeScript interface
export function MyComponent(props) {
  return <div>{props.name}</div>;
}

// Violation 12: useEffect with missing dependencies
function ComponentWithEffect() {
  const [count, setCount] = useState(0);
  
  React.useEffect(() => {
    document.title = `Count: ${count}`;
    // Missing [count] dependency!
  }, []);
  
  return <div>{count}</div>;
}

// Violation 13: Memory leak - event listener without cleanup
function ComponentWithLeak() {
  React.useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    // Missing removeEventListener cleanup!
  }, []);
  
  return <div>Scrollable content</div>;
}

// Violation 14: Prop drilling
function Level1({ user }) {
  return <Level2 user={user} />;
}

function Level2({ user }) {
  return <Level3 user={user} />;
}

function Level3({ user }) {
  return <div>{user.name}</div>;
}

// Violation 15: Hardcoded secret
const API_KEY = 'sk-abcdefghijklmnop1234567890';
const SECRET_TOKEN = 'secret_xyz123';

// Violation 16: useEffect without dependency array
function BadEffect() {
  React.useEffect(() => {
    const interval = setInterval(() => {
      console.log('Runs every render!');
    }, 1000);
  }); // Missing dependency array!
  
  return <div>Bad effect</div>;
}

// Violation 17: Unused import
import { someUnusedFunction } from './utils';

// Violation 18: console.warn (informational)
function WarningExample() {
  console.warn('This is a warning');
  return <div>Component</div>;
}

// Violation 19: Long line
const extremelyLongVariableName = "This is a very long string that definitely exceeds 100 characters and should be broken into multiple lines";

// Violation 20: Inline styles (recreated on each render)
function StyledComponent() {
  return (
    <div style={{ color: 'red', fontSize: '16px', padding: '10px' }}>
      Styled content
    </div>
  );
}

// Violation 21: Complex state that could use useReducer
function ComplexState() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [age, setAge] = useState(0);
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  
  return <form>{/* Multiple useState calls */}</form>;
}

// Violation 22: Missing error handling
function UnhandledError() {
  const handleClick = () => {
    riskyOperation().then(result => {
      console.log(result);
      // No .catch() or error handler!
    });
  };
  
  return <button onClick={handleClick}>Do Something</button>;
}

// Violation 23: Heavy computation without useMemo
function ComputationComponent({ items }) {
  const filtered = items.filter(item => item.active);
  const sorted = filtered.sort((a, b) => a.priority - b.priority);
  const mapped = sorted.map(item => ({ ...item, processed: true }));
  // Recreated on every render!
  
  return <div>{mapped.length} items</div>;
}

// Violation 24: useCallback not used for optimization
function OptimizationExample() {
  const handleEvent = (e) => {
    console.log(e);
  };
  
  // This function is recreated on every render
  return <ChildComponent handler={handleEvent} />;
}

// Violation 25: Block comment with TODO
/*
  TODO fix this later - incomplete task description
*/
export function TodoExample() {
  return <div>Has TODO comment</div>;
}

/*
  FIXME this is broken and needs to be fixed before production
*/
export function FixmeExample() {
  return <div>Has FIXME comment</div>;
}

// Violation 26: Page without SEO meta tags
export function HomePage() {
  return (
    <div>
      <h1>My Website</h1>
      {/* Missing Head/meta tags for SEO */}
    </div>
  );
}

async function riskyOperation() {
  throw new Error('Something went wrong');
}

function handleScroll() {
  console.log('Scrolled');
}

function ChildComponent({ handler }) {
  return <button onClick={handler}>Click</button>;
}
