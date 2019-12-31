import React from 'react'
import ReactDOM from 'react-dom';
import { Form, Button, Container } from 'semantic-ui-react'


const el = 
 ( <Container>
    <h1>Enter Campaign Details</h1>
    <Form action="Campaign">
      <Form.Field as="h2">
	<label>Cause</label>
	<input name="cause" placeholder='What the funds are for' />
      </Form.Field>
      <Form.Field as="h2">
	<label>Who</label>
	<input name="who" placeholder='Anon ok' />
      </Form.Field>
      <Form.Field as="h2">
	<label>Goal</label>
	<input pattern="^(?=.+)(?:[1-9]\d*|0)?(?:\.\d+)?$" required name="goal" placeholder='Amount in BTC' />
      </Form.Field>
      <Form.Field>
	<input type="hidden" name="address" value={window.location.search.split('=')[1]}/>
      </Form.Field>
      <Button primary size="massive" type='submit'>Submit</Button>
    </Form>
  </Container>)

  ReactDOM.render(
    el, document.getElementById('DetailsCampaign')
  );	
