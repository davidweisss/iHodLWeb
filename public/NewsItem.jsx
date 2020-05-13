import React from 'react'
import ReactDOM from 'react-dom';
import { Form, Button, Container, Message, Header, Icon, Image, Segment, TextArea } from 'semantic-ui-react'

var urlParams = new URLSearchParams(window.location.search);

const message = urlParams.get('message')
const el = 
  <Container>

    {message !== null &&
    <Message negative>
      <Message.Header> Error: </Message.Header>
      {message}
    </Message>}
    
    <h1>Enter Update</h1>

    {/* Enter details */}

    <Form id="newsItem" action={"PopNewsItem"}>
      <Form.Field as="h2">
	<label>What's new?</label>
	<TextArea name="newsItem" placeholder='You can use markdown for rich formatting' />
      </Form.Field>
      <Form.Field as="h2">
	<label>Signature (sign this message: "challenge")</label>
	<textarea required name="signature" />
      </Form.Field>
      <Form.Field>
	<input type="hidden" name="address" value={urlParams.get('address')}/>
      </Form.Field>
      <Button primary size="massive" type='submit'>
	<i class="save icon"></i>
	Post</Button>
    </Form>
    <Header as="h3" style={{color:"Gray"}}>Campaign address: <Icon fitted name="bitcoin"/>{urlParams.get('address')}</Header>
  </Container>


ReactDOM.render(
    el, document.getElementById('newsItem')
  );	
