import React from 'react'
import ReactDOM from 'react-dom';
import { Menu, Form, Button, Container, Message } from 'semantic-ui-react'

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
	    <input name="address" type="text" value={this.state.value} onChange={this.handleChange}/> <br/><br/>
	  </Form.Field>
	  <Button primary size="massive" type='submit'>Submit</Button>
	</Form>
	{this.state.value.charAt(0) !== "" &&
	    this.state.value.charAt(0) !== "1" &&
	    <Message warning>
	      <Message.Header> Warning: </Message.Header>
	      Currently only legacy address format addresses starting with "1" can be modified after creation
	    </Message>}
      </Container>
    );
  }
}

var urlParams = new URLSearchParams(window.location.search);
const message = urlParams.get('message')
const el = 
  <Container>

    <Menu>
      <Menu.Item as='a' href='/'>
	Home
      </Menu.Item>
      <Menu.Item as='a' href='/Search'>
	Search
      </Menu.Item>
    </Menu>

    {message !== null &&
    <Message negative>
      <Message.Header> Error: </Message.Header>
      {message}
    </Message>}
    <h1>Create New Campaign</h1>
    <NameForm/>
  </Container>

  ReactDOM.render(
    el, document.getElementById('NewAddress')
  );	
