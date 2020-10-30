// See: 
// https://www.pluralsight.com/guides/re-render-react-component-on-window-resize
import React from "react";
import ReactDOM from "react-dom";

let debounce = (fn, ms) => {
  let timer;
  return (_) => {
    clearTimeout(timer);
    timer = setTimeout((_) => {
      timer = null;
      fn.apply(this);
    }, ms);
  };
}

let WithResponsive = (WrappedComponent) => {
  return class Enhancer extends WrappedComponent {
    constructor(props) {
      super(props);
      this.state = {
	width: window.innerWidth 
      };
      this.handleResize = this.handleResize.bind(this);
      this.debouncedHandleResize = this.debouncedHandleResize.bind(this);
    }

    handleResize() {
      this.setState({
	width: window.innerWidth
      });
    }

    debouncedHandleResize() {debounce(this.handleResize(), 1000);}

    componentDidMount() {
      window.addEventListener("resize", this.debouncedHandleResize);
    }
    componentWillUnmount() {
      window.removeEventListener("resize", this.debouncedHandleResize);
    }

    render() {
	return super.render();
    }
  };
};

export {WithResponsive}

