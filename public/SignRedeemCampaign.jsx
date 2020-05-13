import React from 'react'
import ReactDOM from 'react-dom';
import QRCode from 'qrcode.react'
import { Container, Header, Segment, Form, Button } from 'semantic-ui-react'

var urlParams = new URLSearchParams(window.location.search);

const address = urlParams.get('address')
const rawtx = urlParams.get('rawtx')
const psbt = urlParams.get('psbt')
const el = 
  <Container>

    <Segment.Group>
      <Segment>
	<Header as="h1">Sign this transaction</Header>
      </Segment>
      <Segment.Group>
	<Segment textAlign="center" >
	  <QRCode value={psbt} size="140"/>
	</Segment>
	{/*	<Segment>
	  <Header as="h2"> {psbt} </Header>
	</Segment>*/}
      </Segment.Group>
    </Segment.Group>
    <Segment secondary>
      <br/>
      <br/>
      <Form action="SendSignRedeemCampaign">
	<Form.Field as="h2">
	  <label>Signed transaction hash</label>
	  <textarea required name="signature" />
	</Form.Field>
	<Form.Field>
	  <input type="hidden" name="address" value={urlParams.get('address')}/>
	</Form.Field>
	<Button size="massive" type='submit'>
	  <i class="pencil icon"></i>
	  Send</Button>
      </Form>
    </Segment>
  </Container>

  ReactDOM.render(
    el, document.getElementById('SignRedeemCampaign')
  );	
