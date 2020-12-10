import React from 'react'
import ReactDOM from 'react-dom';
import { Segment, Header, Icon, Menu, Form, Button, Container, Message, Image } from 'semantic-ui-react'

class NameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {value: ''};

      this.handleChange = this.handleChange.bind(this);
    }

  handleChange(event) {
    this.setState({value: event.target.value});
  }


  render() {
    return (
      <Container>
	<Form action="ValidateAddress">
	  <Form.Field as="h2">
	    <label>Enter valid Bitcoin address</label>
	    <input name="address" type="text" value={this.state.value} onChange={this.handleChange}/> 
	   <br/>
	  </Form.Field>
	  <Button primary size="massive" type='submit'>Submit</Button>
	</Form>
	{this.state.value.charAt(0) !== "" &&
	    this.state.value.charAt(0) !== "1" &&
	    <Message warning>
	      <Message.Header> Warning: </Message.Header>
	      Currently only legacy address format addresses starting with "1" can be modified for free after creation
	    </Message>}
      </Container>
    );
  }
}

var urlParams = new URLSearchParams(window.location.search);
const message = urlParams.get('message')
const address = urlParams.get('address')
const el = 
  <Container>

    <div class="ui rail">
      <div class="ui fixed top sticky">
	<Menu style={{marginTop:'10px'}} size='massive'>
	  <Menu.Item as='h1' as='a' href='/'>
	    <Image fluid size='mini' src='bfmLogo.png'/>	
	  </Menu.Item>
	  <Menu.Item style={{color: 'teal', fontWeight: 'bold'}} as='h1' as='a' href='/Search'>
	    Search Campaigns
	  </Menu.Item>
	  <Menu.Item style={{color: 'teal', fontWeight: 'bold'}} as='h1' as='a' href='https://bitfundme.rocks:3000/tutorials/2020/09/03/Getting-started.html'>
	    Tutorial
	  </Menu.Item>
	</Menu>
      </div>
    </div>
    <div style={{marginTop: '120px'}}>
      <Segment>
	{message !== null &&
	<Message negative>
	  <Message.Header> Error: </Message.Header>
	  {message}
	</Message>}

	{address !== null &&
	  <Header as="h3" style={{color:"Gray"}}>
	    Visit the campaign page for this address instead:
	    <br/>
	    <a href={'https://bitfundme.rocks/Campaign2?address='+urlParams.get('address')} >
	      Campaign address: <Icon fitted name="bitcoin"/>{urlParams.get('address')}
	    </a>
	  </Header>
	}
	    </Segment>
	<h1>Create New Campaign</h1>
	<NameForm/>
	<br/>
	<br/>
	<Message
	  as='a'
	  href='https://bitfundme.rocks:3000/tutorials/2020/09/05/generate-address.html'
	  icon='graduation'
	  header="Don't have a Bitoin address?"
	  content='Click to learn how to get a suitable Bitcoin address'
	/>
      </div>
    </Container>

	ReactDOM.render(
	el, document.getElementById('NewAddress')
	);	
