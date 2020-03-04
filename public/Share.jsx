import React from 'react'
import ReactDOM from 'react-dom';
import { Container, Header, Segment } from 'semantic-ui-react'
import {
  TwitterShareButton,
  TwitterShareCount,
  TwitterIcon
} from "react-share";

var urlParams = new URLSearchParams(window.location.search);

const address = urlParams.get('address')
const cause = urlParams.get('cause')
const el = 
  <Container>
    <br/>
    <br/>
    <Header as="h1" style={{textAlign: "center"}}>Share campaign
    <br/>
      <TwitterShareButton
	url={"https://bitfundme.rocks/Campaign?address="+address}
	title={"Donate to: "+cause}>
	<TwitterIcon size={64} round />
      </TwitterShareButton>
    </Header>
  </Container>

  ReactDOM.render(
    el, document.getElementById('Share')
  );	
