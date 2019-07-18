let hooks = [];
let idx = 0;

function useState(initialValue) {
  let state = hooks[idx] || initialValue;
  let _idx = idx;

  function setState(newValue) {
    hooks[_idx] = newValue;
    render()
  }

  idx++;
  return [state, setState]
}

// todo: broken! fix it!
let _ref = null;
function useRef(initialValue = null) {
  const ref = {
    current: initialValue
  };
  Object.seal(ref);
  return useState(ref)[0]
}

function useEffect( callBackFn, deps ){
  const previousDeps = hooks[idx];
  let hasChanged = true;

  if(previousDeps) {
    hasChanged = deps.some( (dep, idx) => !Object.is(dep, previousDeps[idx]))
  }

  if(hasChanged) callBackFn();
  hooks[idx] = deps;
}

// create DOM elements out of plain js objects
function renderElement(reaktElement) {
  const {type, props, children} = reaktElement;

  // support function components
  if (typeof type === 'function') {
    return renderElement(type(props));
  }
  if (typeof type === 'string') {
    const domElement = document.createElement(type);

    children.forEach(child => {
      if (typeof child === 'string') {
        domElement.appendChild(document.createTextNode(child))
      } else {
        domElement.appendChild(renderElement(child))
      }
    });

    for (let prop in props) {

      // its a DOM element property
      if (prop in domElement) {
        domElement[prop] = props[prop];
      }

      // events
      else if (/^on/.test(prop)) {
        // convert onClick to 'click'
        const eventName = prop.substring(2).toLowerCase();
        domElement.addEventListener(eventName, props[prop])
      } else {
        domElement.setAttribute(prop, props[prop]);
      }
    }

    return domElement;
  }
}

let _currentApp = null;
let _reaktElement = null;
let _domElement = null;

function render(reaktElement = _reaktElement, domElement = _domElement) {
  const app = renderElement(reaktElement);

  _reaktElement = reaktElement;
  _domElement = domElement;

  _currentApp ?
      domElement.replaceChild(app, _currentApp)
      : domElement.appendChild(app);


  _currentApp = app;
  idx = 0
}

// ********************   react - creating tree
function createElement(type, props, ...children) {
  const reaktElement = {
    type,
    props,
    children,
  };

  Object.freeze(reaktElement);
  Object.freeze(reaktElement.props);

  return reaktElement;
}


// ********************   application
function Title() {
  const [title, setTitle] = useState('Default title');
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('useEffect callback');
  });

  console.log('Title Render');
  return createElement('div', null,
      createElement('h1', {id: 'title'}, title),
      createElement('button', {onClick: () => setCount(count + 1)}, `click me ${count}`),
      createElement('button', {onClick: () => setTitle('New title')}, `change title`),
  )
}

const App = createElement('div', null,
    createElement(Title, {text: 'Hello react'})
);

render(App, document.getElementById('root'));
