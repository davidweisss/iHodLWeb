import React from 'react'
import ReactDOM from 'react-dom';
import QRCode from 'qrcode.react'
import { Container, Header, Segment } from 'semantic-ui-react'

var urlParams = new URLSearchParams(window.location.search);

const address = urlParams.get('address')
const el = 
  <Container>

    <Segment.Group>
      <Segment>
	<Header as="h1">Donate</Header>
      </Segment>
      <Segment.Group>
	<Segment textAlign="center" >
	  <QRCode value={address} size="140"/>
	</Segment>
	<Segment>
	  <Header as="h2"> {address} </Header>
	</Segment>
      </Segment.Group>
    </Segment.Group>
  </Container>

  ReactDOM.render(
    el, document.getElementById('donate')
  );	
