// reakt DOM

// create DOM elements out of plain js objects
function renderElement(reaktElement) {
  const {type, props, children} = reaktElement;

  // support function components
  if(typeof type === 'function') {
    return renderElement(type(props));
  }
  if(typeof type === 'string') {
    const domElement = document.createElement(type);

    children.forEach( child => {
        if(typeof child === 'string') {
          domElement.appendChild(document.createTextNode(child))
        } else {
          domElement.appendChild(renderElement(child))
        }
    });

    for(let prop in props) {
      // its a DOM element property
      if(prop in domElement) {
        domElement[prop] = props[prop];
      }

      // events
      else if(/^on/.test(prop)) {
        // convert onClick to 'click'
        const eventName = prop.substring(2).toLowerCase();
        domElement.addEventListener(eventName,props[prop])
      }

      else {
        domElement.setAttribute(prop, props[prop]);
      }



    }

    return domElement;
  }
}

function render(reaktElement, domElement) {
  domElement.appendChild(renderElement(reaktElement));
}

// react clone
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


function Title ({text}) {
  return createElement('h1', { id: 'title'}, text)
}

// application
const App = createElement('div', null,
    createElement(Title, {text: 'Hello react'}),
    createElement('button', { onClick: () => alert('click')}, 'click me'),
);


render(App, document.getElementById('root'));