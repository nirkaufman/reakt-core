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

function useRef(initialValue = null) {
  const ref = Object.seal({ current: initialValue });
  return useState(ref)[0]
}

function useEffect(){}

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
function Title({text}) {
  const [title, setTitle] = useState(text);
  const [count, setCount] = useState(0);

  const numRef = useRef('0');

  const changeNum = () => {
    numRef.current = '25';
  };

  return createElement('div', null,
      createElement('h1', {id: 'title'}, title),
      createElement('h2', null, numRef.current),
      createElement('button', {onClick: () => setTitle('new title')}, 'click me'),
      createElement(
          'button',
          {onClick: changeNum},
          `change`
      ),
  )
}

const App = createElement('div', null,
    createElement(Title, {text: 'Hello react'})
);

render(App, document.getElementById('root'));
