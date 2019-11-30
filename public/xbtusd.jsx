'use strict';
var xbtusdUrl = 'https://api.coindesk.com/v1/bpi/currentprice/USD.json'

const e = React.createElement;

class XbtUsd extends React.Component {
	  constructor(props) {
		      super(props);
		      this.state = { requestedQuote: false,
		      xbtusd: 0};
		    }

	  componentDidMount() {
		      fetch(xbtusdUrl)
			            .then(res => res.json())
			            .then(json => this.setState({ xbtusd: json }));
			        }
	  render() {

		      if (this.state.requestedQuote) {
			      console.log(this.state.xbtusd.bpi.USD.rate)
			            return 'Your quote: '+
				      (250/parseFloat(this.state.xbtusd.bpi.USD.rate.replace(',',''))).toFixed(5)
				      +' XBT';
			          }

		      return e(
			            'div',
			            { onClick: () => this.setState({ requestedQuote: true }) },
			            'Request quote'
			          );
		    }
}
const domContainer = document.querySelector('#xbtusd');
ReactDOM.render(e(XbtUsd), domContainer);

