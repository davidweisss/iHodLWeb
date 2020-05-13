import React from 'react'
import ReactDOM from 'react-dom';
import { Container, Header, Segment } from 'semantic-ui-react'
import {
  TwitterShareButton,
  TwitterShareCount,
  TwitterIcon,
  LinkedinShareButton,
  LinkedinIcon,
  FacebookShareButton,
  FacebookIcon,
  FacebookShareCount,
  RedditShareButton,
  RedditIcon,
  WhatsappShareButton,
  WhatsappIcon
} from "react-share"

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
      <FacebookShareButton
	url={"https://bitfundme.rocks/Campaign?address="+address}
	hashtah="#Bitcoin"
	quote={"Donate to: "+cause}>
	<FacebookIcon size={64} round />
      </FacebookShareButton>
      <LinkedinShareButton
	url={"https://bitfundme.rocks/Campaign?address="+address}
	source="https://bitfundme.rocks"
	title={"Donate to: "+cause}
	summary={"Donate to: "+cause}>
	<LinkedinIcon size={64} round />
      </LinkedinShareButton>
      <RedditShareButton
	url={"https://bitfundme.rocks/Campaign?address="+address}
	title={"Donate to: "+cause}>
	<RedditIcon size={64} round />
      </RedditShareButton>
      <WhatsappShareButton
	url={"https://bitfundme.rocks/Campaign?address="+address}
	title={"Donate to: "+cause}>
	<WhatsappIcon size={64} round />
      </WhatsappShareButton>
    </Header>
  </Container>

  ReactDOM.render(
    el, document.getElementById('Share')
  );	

