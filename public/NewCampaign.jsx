import React from 'react'
import ReactDOM from 'react-dom';
import { Form, Button, Container } from 'semantic-ui-react'


const el = 
  <Container>
    <h1>Search Campaign or Create New Campaign</h1>
    <Form action="Campaign">
      <Form.Field as="h2">
	<label>Enter valid Bitcoin address</label>
	<input name="address" type="text"/> <br/><br/>
      </Form.Field>
      <Button primary size="massive" type='submit'>Submit</Button>
    </Form>
  </Container>

  ReactDOM.render(
    el, document.getElementById('NewCampaign')
  );	
